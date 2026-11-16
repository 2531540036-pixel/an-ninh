<?php
declare(strict_types=1);

function page(string $path): never {
    $s = settings(); $url = config()['site_url'];
    if ($path === '/robots.txt') {
        header('Content-Type: text/plain; charset=utf-8');
        echo "User-agent: *\nDisallow: /admin\nDisallow: /api/\nDisallow: /cai-dat.php\nSitemap: $url/sitemap.xml\n"; exit;
    }
    if ($path === '/sitemap.xml') {
        $paths = ['/','/gioi-thieu','/dich-vu','/dich-vu/toa-nha-van-phong','/dich-vu/nha-may-kho-hang','/dich-vu/ngan-hang','/dich-vu/benh-vien','/tin-tuc','/tuyen-dung','/lien-he','/bao-mat'];
        foreach (rows("SELECT slug FROM posts WHERE status='published'") as $r) $paths[] = '/tin-tuc/' . $r['slug'];
        foreach (rows('SELECT slug FROM jobs') as $r) $paths[] = '/tuyen-dung/' . $r['slug'];
        header('Content-Type: application/xml; charset=utf-8');
        echo '<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">';
        foreach ($paths as $p) echo '<url><loc>' . esc($url . $p) . '</loc></url>';
        echo '</urlset>'; exit;
    }
    $titles = ['/'=>'Dịch vụ bảo vệ chuyên nghiệp','/gioi-thieu'=>'Giới thiệu & năng lực','/dich-vu'=>'Dịch vụ bảo vệ','/tin-tuc'=>'Tin tức & hoạt động','/tuyen-dung'=>'Tuyển dụng','/lien-he'=>'Liên hệ tư vấn','/bao-mat'=>'Chính sách bảo mật','/admin'=>'Đăng nhập quản trị'];
    $title = $titles[$path] ?? 'An Ninh'; $desc = mb_substr($s['about'],0,160,'UTF-8'); $image = $s['hero'];
    $segment = explode('/',$path)[2] ?? '';
    if (str_starts_with($path,'/tin-tuc/') && $segment !== '') {
        $p = one("SELECT * FROM posts WHERE slug=? AND status='published'",$segment);
        if ($p) { $title = $p['title']; $desc = mb_substr($p['content'],0,160,'UTF-8'); $image = $p['image']; }
    }
    if (str_starts_with($path,'/tuyen-dung/') && $segment !== '') {
        $j = one('SELECT * FROM jobs WHERE slug=?',$segment);
        if ($j) { $title = $j['title'] . ' — Tuyển dụng'; $desc = mb_substr($j['description'],0,160,'UTF-8'); }
    }
    $services = ['toa-nha-van-phong'=>'Bảo vệ tòa nhà & văn phòng','nha-may-kho-hang'=>'Bảo vệ nhà máy & kho hàng','ngan-hang'=>'Bảo vệ ngân hàng','benh-vien'=>'Bảo vệ bệnh viện & cơ sở y tế'];
    if (str_starts_with($path,'/dich-vu/') && isset($services[$segment])) { $title = $services[$segment]; $desc = $title . ' — Tìm hiểu phạm vi công việc, quy trình phối hợp và gửi yêu cầu khảo sát mục tiêu.'; }
    $html = file_get_contents(__DIR__ . '/template.html');
    $html = preg_replace_callback('~<title>.*?</title>~s',fn()=>'<title>' . esc($title . ' | An Ninh') . '</title>',$html);
    foreach (['description'=>$desc,'og:title'=>$title . ' | An Ninh','og:description'=>$desc] as $key=>$value) {
        $attr = $key === 'description' ? 'name' : 'property';
        $html = preg_replace_callback('~<meta ' . $attr . '="' . preg_quote($key,'~') . '" content="[^"]*">~', fn()=>'<meta ' . $attr . '="' . $key . '" content="' . esc($value) . '">',$html);
    }
    $meta = '<link rel="canonical" href="' . esc($url . $path) . '"><meta property="og:url" content="' . esc($url . $path) . '">';
    if ($image) $meta .= '<meta property="og:image" content="' . esc($url . $image) . '">';
    if (str_starts_with($path,'/admin')) { $meta .= '<meta name="robots" content="noindex,nofollow">'; header('Cache-Control: no-store'); }
    header('Content-Type: text/html; charset=utf-8');
    echo str_replace('</head>',$meta . '</head>',$html); exit;
}
