<?php
declare(strict_types=1);

function valid_phone(string $v): bool {
    return (bool) preg_match('/^(?:\+84|0)[\d\s.-]{8,13}$/D', $v) && strlen(preg_replace('/\D/', '', $v)) >= 10;
}
function valid_email(string $v): bool { return (bool) preg_match('/^[^\s@]+@[^\s@]+\.[^\s@]+$/uD', $v); }
function details(array $b): array {
    $d = ['name' => required($b['name'] ?? null, 'Họ tên', 120), 'phone' => required($b['phone'] ?? null, 'Số điện thoại', 24), 'email' => required($b['email'] ?? null, 'Email', 200)];
    if (!valid_phone($d['phone'])) fail('Số điện thoại Việt Nam không hợp lệ.');
    if (!valid_email($d['email'])) fail('Email không hợp lệ.');
    return $d;
}
function slug(mixed $value): string {
    $s = mb_strtolower(txt($value, 160), 'UTF-8');
    foreach (['a'=>'àáạảãâầấậẩẫăằắặẳẵ','e'=>'èéẹẻẽêềếệểễ','i'=>'ìíịỉĩ','o'=>'òóọỏõôồốộổỗơờớợởỡ','u'=>'ùúụủũưừứựửữ','y'=>'ỳýỵỷỹ','d'=>'đ'] as $to => $from) {
        $s = preg_replace('/[' . $from . ']/u', $to, $s);
    }
    $s = preg_replace('/\p{M}/u', '', $s);
    return trim(preg_replace('/[^a-z0-9]+/', '-', $s), '-') ?: 'bai-viet';
}
function post_data(array $b): array {
    $title = required($b['title'] ?? null, 'Tiêu đề', 200);
    if (!in_array($b['status'] ?? '', ['draft','published','hidden'], true)) fail('Trạng thái bài viết không hợp lệ.');
    $image = txt($b['image'] ?? '', 200);
    if ($image !== '' && !preg_match('~^/media/[a-f\d-]+$~D', $image)) fail('Ảnh không hợp lệ.');
    return ['title'=>$title, 'slug'=>slug(($b['slug'] ?? '') ?: $title), 'category'=>required($b['category'] ?? null, 'Danh mục', 100), 'content'=>required($b['content'] ?? null, 'Nội dung', 100000), 'image'=>$image, 'status'=>$b['status']];
}
function job_data(array $b): array {
    $title = required($b['title'] ?? null, 'Tên vị trí', 200);
    $q = filter_var($b['quantity'] ?? null, FILTER_VALIDATE_INT);
    if ($q === false || $q < 1 || $q > 10000) fail('Số lượng cần tuyển phải từ 1 đến 10.000.');
    if (!in_array($b['status'] ?? '', ['open','closed'], true)) fail('Trạng thái tuyển dụng không hợp lệ.');
    return ['title'=>$title, 'slug'=>slug(($b['slug'] ?? '') ?: $title), 'location'=>required($b['location'] ?? null, 'Địa điểm', 300), 'salary'=>txt($b['salary'] ?? '', 200), 'schedule'=>required($b['schedule'] ?? null, 'Thời gian làm việc', 300), 'quantity'=>$q, 'description'=>required($b['description'] ?? null, 'Mô tả công việc', 20000), 'requirements'=>required($b['requirements'] ?? null, 'Yêu cầu', 20000), 'benefits'=>required($b['benefits'] ?? null, 'Quyền lợi', 20000), 'status'=>$b['status']];
}
function store_file(bool $public = false): string {
    $file = $_FILES['file'] ?? null;
    if (!$file || is_array($file['error']) || $file['error'] === UPLOAD_ERR_NO_FILE) fail('Vui lòng chọn tệp.');
    if (in_array($file['error'], [UPLOAD_ERR_INI_SIZE, UPLOAD_ERR_FORM_SIZE], true) || (int)$file['size'] > 5 * 1024 * 1024) fail('Tệp vượt quá giới hạn 5 MB.', 413);
    if ($file['error'] !== UPLOAD_ERR_OK || !is_uploaded_file($file['tmp_name'])) fail('Không tải được tệp. Vui lòng thử lại.');
    $bytes = file_get_contents($file['tmp_name']);
    if ($bytes === false || strlen($bytes) > 5 * 1024 * 1024) fail('Tệp vượt quá giới hạn 5 MB.', 413);
    $name = basename(str_replace('\\', '/', $file['name']));
    $ext = strtolower(pathinfo($name, PATHINFO_EXTENSION));
    $mime = null;
    if ($public) {
        $info = @getimagesizefromstring($bytes);
        if ($info && (($ext === 'png' && $info[2] === IMAGETYPE_PNG) || (in_array($ext, ['jpg','jpeg'], true) && $info[2] === IMAGETYPE_JPEG) || ($ext === 'webp' && $info[2] === IMAGETYPE_WEBP))) $mime = $info['mime'];
    } else {
        if ($ext === 'pdf' && str_starts_with($bytes, '%PDF-')) $mime = 'application/pdf';
        if ($ext === 'doc' && str_starts_with($bytes, hex2bin('d0cf11e0a1b11ae1'))) $mime = 'application/msword';
        if ($ext === 'docx' && str_starts_with($bytes, 'PK') && str_contains($bytes, '[Content_Types].xml') && str_contains($bytes, 'word/')) $mime = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
    }
    if (!$mime) fail($public ? 'Chỉ nhận ảnh PNG, JPG, WEBP hợp lệ.' : 'Chỉ nhận hồ sơ PDF, DOC, DOCX hợp lệ (tối đa 5 MB).');
    $id = uuid();
    // No uploaded file receives an executable extension, even if .htaccess is misconfigured.
    $disk = $id . '.bin';
    $path = dirname(__DIR__) . '/_private/uploads/' . $disk;
    if (!move_uploaded_file($file['tmp_name'], $path)) fail('Không lưu được tệp lên hosting.', 503);
    @chmod($path, 0600);
    try { query('INSERT INTO files (id,disk_name,original_name,mime,size,public,created_at) VALUES (?,?,?,?,?,?,?)', $id, $disk, txt($name,150), $mime, strlen($bytes), $public ? 1 : 0, iso_now()); }
    catch (Throwable $e) { @unlink($path); throw $e; }
    return $id;
}
function remove_file(?string $id): void {
    if (!$id) return;
    $f = one('SELECT disk_name FROM files WHERE id=?', $id);
    if (!$f) return;
    query('DELETE FROM files WHERE id=?', $id);
    @unlink(dirname(__DIR__) . '/_private/uploads/' . basename($f['disk_name']));
}
function send_file(string $id, bool $private): never {
    $f = one('SELECT * FROM files WHERE id=?', $id);
    if (!$f || (!$private && !$f['public'])) fail('Không tìm thấy tệp.', 404);
    $path = dirname(__DIR__) . '/_private/uploads/' . basename($f['disk_name']);
    if (!is_file($path)) fail('Không tìm thấy tệp.', 404);
    if ($private) header('Content-Disposition: attachment; filename="download.' . strtolower(pathinfo($f['original_name'], PATHINFO_EXTENSION)) . '"; filename*=UTF-8\'\'' . rawurlencode($f['original_name']));
    header('Content-Type: ' . $f['mime']);
    header('Content-Length: ' . filesize($path));
    header('Cache-Control: ' . ($private ? 'no-store' : 'public, max-age=86400'));
    if ($_SERVER['REQUEST_METHOD'] !== 'HEAD') readfile($path);
    exit;
}
function api(string $path): never {
    $method = $_SERVER['REQUEST_METHOD'];
    $read = in_array($method, ['GET','HEAD'], true);
    header('Cache-Control: no-store');
    if ($path === '/api/admin/login' && $method === 'POST') {
        throttle('login', 8, 900);
        $b = body();
        $a = one('SELECT * FROM admins WHERE username=?', txt($b['username'] ?? '', 200));
        $password = txt($b['password'] ?? '', 1000);
        $valid = check_password($password, $a['hash'] ?? '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2uheWG/igi.');
        if (!$a || !$valid) fail('Tên đăng nhập hoặc mật khẩu không đúng.', 401);
        if (password_needs_rehash($a['hash'], PASSWORD_DEFAULT)) query('UPDATE admins SET hash=? WHERE id=?', hash_password($password), (int)$a['id']);
        $token = rtrim(strtr(base64_encode(random_bytes(32)), '+/', '-_'), '=');
        query('DELETE FROM sessions WHERE expires<?', now_ms());
        query('INSERT INTO sessions (token_hash,admin_id,expires) VALUES (?,?,?)', hash('sha256',$token), (int)$a['id'], now_ms() + 8 * 3600000);
        cookie($token, 8 * 3600);
        json_out(['username'=>$a['username'], 'must_change'=>(bool)$a['must_change']]);
    }
    $admin = str_starts_with($path . '/', '/api/admin/') ? auth($path) : null;
    if ($read && $path === '/api/admin/me') json_out(['username'=>$admin['username'], 'must_change'=>(bool)$admin['must_change']]);
    if ($method === 'POST' && $path === '/api/admin/logout') {
        query('DELETE FROM sessions WHERE token_hash=?', $admin['token_hash']); cookie('', -3600); json_out(['ok'=>true]);
    }
    if ($method === 'POST' && $path === '/api/admin/password') {
        throttle('password',8,900); $b = body();
        $a = one('SELECT * FROM admins WHERE id=?', (int)$admin['id']);
        if (!check_password(txt($b['current'] ?? '',1000), $a['hash'])) fail('Mật khẩu hiện tại không đúng.');
        $p = required($b['password'] ?? null,'Mật khẩu mới',200);
        if (mb_strlen($p,'UTF-8') < 12) fail('Mật khẩu mới cần ít nhất 12 ký tự.');
        if ($p === ($b['current'] ?? '')) fail('Mật khẩu mới phải khác mật khẩu hiện tại.');
        db()->beginTransaction();
        try {
            query('UPDATE admins SET hash=?,must_change=0 WHERE id=?', hash_password($p), (int)$a['id']);
            query('DELETE FROM sessions WHERE admin_id=?', (int)$a['id']);
            db()->commit();
        } catch (Throwable $e) { db()->rollBack(); throw $e; }
        cookie('',-3600); json_out(['ok'=>true]);
    }
    if ($method === 'POST' && $path === '/api/admin/images') { body(); json_out(['url'=>'/media/' . store_file(true)]); }
    if ($read && preg_match('~^/api/admin/files/([a-f\d-]{36})$~D',$path,$m)) send_file($m[1],true);
    if ($read && preg_match('~^/media/([a-f\d-]{36})$~D',$path,$m)) send_file($m[1],false);
    if ($read && in_array($path,['/api/site','/api/admin/settings'],true)) json_out(settings());
    if ($method === 'PUT' && $path === '/api/admin/settings') {
        $s = settings(); $b = body();
        foreach ($s as $k=>$v) if (array_key_exists($k,$b)) $s[$k] = txt($b[$k],$k === 'about' ? 10000 : 1000);
        required($s['name'],'Tên công ty');
        foreach (['logo','hero','team','training','serviceBuilding','serviceFactory','serviceBank','serviceHospital'] as $k) if ($s[$k] && !preg_match('~^/media/[a-f\d-]+$~D',$s[$k])) fail('Ảnh phải được tải qua chức năng upload.');
        foreach (['zalo','facebook','map'] as $k) if ($s[$k] && !str_starts_with($s[$k],'https://')) fail('Liên kết phải bắt đầu bằng https://');
        if ($s['map'] && !preg_match('~^https://(www\.)?google\.com/maps/~',$s['map'])) fail('Bản đồ phải là liên kết Google Maps.');
        query('UPDATE settings SET data=? WHERE id=1', encode($s)); json_out($s);
    }
    // Only these literal table names may be interpolated into SQL.
    if (preg_match('~^/api/(admin/)?(posts|jobs)(?:/([^/]+))?$~uD',$path,$m)) {
        $private = ($m[1] ?? '') !== ''; $table = $m[2]; $id = $m[3] ?? '';
        if ($private) {
            if ($read && $id === '') json_out(rows("SELECT * FROM $table ORDER BY created_at DESC"));
            if (in_array($method,['POST','PUT'],true) && ($method === 'POST' ? $id === '' : $id !== '')) {
                if ($method === 'PUT' && !one("SELECT id FROM $table WHERE id=?",$id)) fail('Không tìm thấy dữ liệu.',404);
                $d = $table === 'posts' ? post_data(body()) : job_data(body());
                $keys = array_keys($d); $now = iso_now();
                if ($method === 'POST') {
                    $id = uuid(); $cols = implode(',',$keys); $placeholders = implode(',',array_fill(0,count($keys)+3,'?'));
                    query("INSERT INTO $table (id,$cols,created_at,updated_at) VALUES ($placeholders)",$id,...[...array_values($d),$now,$now]);
                    json_out(['id'=>$id],201);
                }
                $set = implode(',',array_map(fn($k)=>"$k=?",$keys));
                query("UPDATE $table SET $set,updated_at=? WHERE id=?",...[...array_values($d),$now,$id]); json_out(['ok'=>true]);
            }
            if ($method === 'DELETE' && $id !== '') {
                if ($table === 'jobs' && one('SELECT id FROM applications WHERE job_id=?',$id)) fail('Vị trí đã có hồ sơ ứng tuyển. Hãy đóng tuyển dụng để giữ lịch sử.');
                query("DELETE FROM $table WHERE id=?",$id); json_out(['ok'=>true]);
            }
        } elseif ($read) {
            if ($id !== '') {
                $condition = $table === 'posts' ? " AND status='published'" : '';
                $r = one("SELECT * FROM $table WHERE (slug=? OR id=?)$condition",$id,$id);
                if (!$r) fail('Không tìm thấy nội dung.',404);
                json_out($r);
            }
            $page = max(1,min(100000,(int)($_GET['page'] ?? 1))); $q = '%' . txt($_GET['q'] ?? '',100) . '%';
            $where = $table === 'posts' ? "status='published'" : '1=1'; $args = [];
            if ($table === 'posts' && txt($_GET['category'] ?? '',100) !== '') { $where .= ' AND category=?'; $args[] = txt($_GET['category'],100); }
            if ($table === 'jobs' && in_array($_GET['status'] ?? '',['open','closed'],true)) { $where .= ' AND status=?'; $args[] = $_GET['status']; }
            $field = $table === 'posts' ? 'content' : 'location'; $where .= " AND (title LIKE ? OR $field LIKE ?)"; $args = [...$args,$q,$q];
            $total = (int)one("SELECT COUNT(*) n FROM $table WHERE $where",...$args)['n'];
            json_out(['items'=>rows("SELECT * FROM $table WHERE $where ORDER BY created_at DESC LIMIT 6 OFFSET ?",...[...$args,($page-1)*6]),'total'=>$total,'page'=>$page,'pages'=>(int)ceil($total/6)]);
        }
    }
    if ($method === 'POST' && $path === '/api/contacts') {
        throttle('contact',10,3600); $b = body();
        $d = [...details($b),'company'=>txt($b['company'] ?? '',300),'service'=>required($b['service'] ?? null,'Dịch vụ quan tâm',200),'location'=>required($b['location'] ?? null,'Địa điểm',500),'quantity'=>txt($b['quantity'] ?? '',20),'message'=>required($b['message'] ?? null,'Nội dung yêu cầu',10000)];
        if (($b['consent'] ?? null) !== true) fail('Vui lòng đồng ý xử lý thông tin để tiếp nhận yêu cầu.');
        if ($d['quantity'] !== '' && (!ctype_digit($d['quantity']) || (int)$d['quantity'] < 1 || (int)$d['quantity'] > 10000)) fail('Số nhân viên dự kiến không hợp lệ.');
        $id = uuid(); query('INSERT INTO contacts (id,data,notes,created_at) VALUES (?,?,?,?)',$id,encode($d),'',iso_now());
        json_out(['id'=>$id,'message'=>'Yêu cầu đã được lưu. Bộ phận phụ trách sẽ tiếp nhận thông tin của bạn.'],201);
    }
    if ($method === 'POST' && $path === '/api/applications') {
        throttle('apply',10,3600); $b = body(); $jobId = txt($b['job_id'] ?? '',100);
        $j = $jobId !== '' ? one("SELECT id FROM jobs WHERE id=? AND status='open'",$jobId) : null;
        if ($jobId !== '' && !$j) fail('Vị trí không còn nhận hồ sơ.');
        $d = $jobId !== '' ? details($b) : ['name'=>required($b['name'] ?? null,'Họ tên',120),'phone'=>required($b['phone'] ?? null,'Số điện thoại',24),'email'=>txt($b['email'] ?? '',200)];
        foreach (['birth'=>['Ngày sinh',10], 'address'=>['Địa chỉ hiện tại',500], 'experience'=>['Kinh nghiệm',10000]] as $k=>[$label,$max]) $d[$k] = $jobId !== '' ? required($b[$k] ?? null,$label,$max) : txt($b[$k] ?? '',$max);
        $d += ['gender'=>txt($b['gender'] ?? '',50),'education'=>txt($b['education'] ?? '',300),'intro'=>required($b['intro'] ?? null,'Giới thiệu bản thân',10000),'location'=>$jobId !== '' ? txt($b['location'] ?? '',500) : required($b['location'] ?? null,'Khu vực mong muốn',500),'availability'=>txt($b['availability'] ?? '',500)];
        if (!valid_phone($d['phone'])) fail('Số điện thoại Việt Nam không hợp lệ.');
        if ($d['email'] !== '' && !valid_email($d['email'])) fail('Email không hợp lệ.');
        if ($d['birth'] !== '') {
            $date = DateTimeImmutable::createFromFormat('!Y-m-d',$d['birth']);
            if (!$date || $date->format('Y-m-d') !== $d['birth'] || $date > new DateTimeImmutable('today') || (int)$date->format('Y') < 1900) fail('Ngày sinh không hợp lệ.');
        }
        if (($b['consent'] ?? null) !== 'true') fail('Vui lòng đồng ý xử lý hồ sơ ứng tuyển.');
        $hasFile = isset($_FILES['file']) && ($_FILES['file']['error'] ?? UPLOAD_ERR_NO_FILE) !== UPLOAD_ERR_NO_FILE;
        $fileId = $hasFile || $jobId !== '' ? store_file() : null; $id = uuid();
        try { query('INSERT INTO applications (id,job_id,data,file_id,notes,created_at) VALUES (?,?,?,?,?,?)',$id,$j['id'] ?? null,encode($d),$fileId,'',iso_now()); }
        catch (Throwable $e) { remove_file($fileId); throw $e; }
        json_out(['id'=>$id,'message'=>'Hồ sơ đã được lưu và chuyển đến bộ phận tuyển dụng.'],201);
    }
    $statuses = ['contacts'=>['Mới','Đang xử lý','Đã liên hệ','Hoàn thành'],'applications'=>['Mới nhận','Đang xem xét','Đã liên hệ','Mời phỏng vấn','Đạt','Không phù hợp']];
    if (preg_match('~^/api/admin/(contacts|applications)(?:/([a-f\d-]{36}))?$~D',$path,$m)) {
        $table = $m[1]; $id = $m[2] ?? '';
        if ($read && $id === '') {
            $rs = rows($table === 'applications' ? 'SELECT a.*,j.title AS job_title FROM applications a LEFT JOIN jobs j ON a.job_id=j.id ORDER BY a.created_at DESC' : 'SELECT * FROM contacts ORDER BY created_at DESC');
            foreach ($rs as &$r) { $r['data'] = json_decode($r['data'],true,512,JSON_THROW_ON_ERROR); if ($table === 'applications' && !$r['job_id']) $r['job_title'] = 'Đăng ký ứng tuyển chung'; } unset($r);
            json_out($rs);
        }
        if ($method === 'PUT' && $id !== '') {
            $b = body(); if (!in_array($b['status'] ?? '',$statuses[$table],true)) fail('Trạng thái không hợp lệ.');
            query("UPDATE $table SET status=?,notes=? WHERE id=?",$b['status'],txt($b['notes'] ?? '',10000),$id); json_out(['ok'=>true]);
        }
        if ($method === 'DELETE' && $id !== '') {
            $r = one("SELECT * FROM $table WHERE id=?",$id);
            query("DELETE FROM $table WHERE id=?",$id); if ($table === 'applications') remove_file($r['file_id'] ?? null); json_out(['ok'=>true]);
        }
    }
    if ($read && $path === '/api/admin/dashboard') {
        $d = [];
        foreach (['posts'=>'SELECT COUNT(*) n FROM posts','published'=>"SELECT COUNT(*) n FROM posts WHERE status='published'",'contacts'=>'SELECT COUNT(*) n FROM contacts','newContacts'=>"SELECT COUNT(*) n FROM contacts WHERE status='Mới'",'applications'=>'SELECT COUNT(*) n FROM applications','newApplications'=>"SELECT COUNT(*) n FROM applications WHERE status='Mới nhận'",'openJobs'=>"SELECT COUNT(*) n FROM jobs WHERE status='open'"] as $k=>$sql) $d[$k] = (int)one($sql)['n'];
        json_out($d);
    }
    fail('API không tồn tại.',404);
}
