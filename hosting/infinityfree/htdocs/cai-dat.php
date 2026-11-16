<?php
declare(strict_types=1);
require __DIR__ . '/_app/bootstrap.php';
header('Cache-Control: no-store');
header('X-Robots-Tag: noindex, nofollow');
$error = ''; $success = false; $locked = false;
try {
    enforce_host();
    $c = config();
    if (is_file(__DIR__ . '/_private/installed.lock')) $locked = true;
    if (!$locked && $_SERVER['REQUEST_METHOD'] === 'POST') {
        verify_origin();
        // The key is kept in protected server configuration, never in a URL or log.
        if (strlen($c['setup_key']) < 24 || str_starts_with($c['setup_key'],'REPLACE_')) fail('Hãy thay setup_key bằng chuỗi ngẫu nhiên riêng trong cấu hình.');
        $b = body();
        if (!hash_equals($c['setup_key'],txt($b['key'] ?? '',500))) { usleep(350000); fail('Mã cài đặt không đúng.',403); }
        $username = required($b['username'] ?? null,'Tên đăng nhập',100);
        if (!preg_match('/^[a-zA-Z0-9_.-]{3,100}$/D',$username)) fail('Tên đăng nhập cần từ 3 ký tự, gồm chữ, số, dấu chấm, gạch ngang hoặc gạch dưới.');
        $password = required($b['password'] ?? null,'Mật khẩu',200);
        if (mb_strlen($password,'UTF-8') < 12) fail('Mật khẩu cần ít nhất 12 ký tự.');
        if (!hash_equals($password,txt($b['confirm'] ?? '',200))) fail('Hai mật khẩu chưa trùng nhau.');
        if (!is_writable(__DIR__ . '/_private') || !is_writable(__DIR__ . '/_private/uploads')) fail('Hosting chưa cho phép ghi vào thư mục _private/uploads.',503);
        // SQL contains only our own schema, no user-supplied SQL.
        $sql = file_get_contents(__DIR__ . '/_app/schema.sql');
        foreach (explode(';',$sql) as $statement) if (trim($statement) !== '') db()->exec($statement);
        db()->beginTransaction();
        try {
            $defaults = file_get_contents(__DIR__ . '/_app/defaults.json');
            query('INSERT IGNORE INTO settings (id,data) VALUES (1,?)',$defaults);
            one('SELECT id FROM settings WHERE id=1 FOR UPDATE');
            // A missing lock file must never allow replacement of an existing admin.
            if ((int)one('SELECT COUNT(*) n FROM admins')['n'] > 0) fail('Website đã có tài khoản quản trị. Không thể cài lại.',409);
            query('INSERT INTO admins (username,hash,must_change) VALUES (?,?,0)',$username,hash_password($password));
            db()->commit();
        } catch (Throwable $e) { if (db()->inTransaction()) db()->rollBack(); throw $e; }
        file_put_contents(__DIR__ . '/_private/installed.lock',gmdate('c'),LOCK_EX);
        @chmod(__DIR__ . '/_private/installed.lock',0600);
        $success = true; $locked = true;
    }
} catch (Throwable $e) {
    http_response_code($e instanceof SiteError ? $e->status : 503);
    $error = $e instanceof SiteError ? $e->getMessage() : 'Chưa cài đặt được. Kiểm tra thông tin MySQL và thử lại.';
    if (!$e instanceof SiteError) error_log('An Ninh: installation failed (' . $e->getCode() . ')');
}
?><!doctype html>
<html lang="vi"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex,nofollow"><title>Cài đặt website An Ninh</title>
<style>body{margin:0;background:#f1f5f9;color:#18324b;font:18px/1.65 system-ui,sans-serif}main{max-width:560px;margin:6vh auto;padding:32px;background:#fff;border-radius:20px;box-shadow:0 16px 60px #102e5010}h1{font-size:30px;line-height:1.3}label{display:block;font-weight:650;margin:20px 0 7px}input{box-sizing:border-box;width:100%;font:inherit;padding:14px;border:1px solid #71869b;border-radius:10px}button,a.button{display:block;box-sizing:border-box;width:100%;border:0;border-radius:10px;background:#1959d8;color:#fff;padding:16px;margin-top:26px;text-align:center;font:700 18px system-ui;cursor:pointer;text-decoration:none}.error{padding:16px;background:#fff1f0;color:#9e2424;border-radius:10px}.muted{color:#4b6279;font-size:16px}@media(max-width:640px){main{margin:16px;padding:24px}}</style></head>
<body><main><p class="muted">AN NINH · THIẾT LẬP WEBSITE</p><h1><?= $success ? 'Website đã sẵn sàng' : ($locked ? 'Website đã cài đặt' : 'Tạo tài khoản quản trị') ?></h1>
<?php if ($error !== ''): ?><p class="error" role="alert"><?= esc($error) ?></p><?php endif ?>
<?php if ($locked): ?>
<p><?= $success ? 'Đăng nhập bằng tên tài khoản và mật khẩu bạn vừa đặt. Khách hàng xem website mà không cần đăng nhập.' : 'Chức năng cài đặt đã được khóa để bảo vệ tài khoản quản trị.' ?></p><a class="button" href="/admin">Đến phần Admin</a>
<?php else: ?>
<p>Nhập mã cài đặt riêng trong cấu hình hosting, rồi chọn tài khoản và mật khẩu Admin cho website.</p>
<form method="post" action="/cai-dat.php">
<label for="key">Mã cài đặt</label><input id="key" name="key" type="password" required autocomplete="off" maxlength="500">
<label for="username">Tên đăng nhập Admin</label><input id="username" name="username" value="admin" required minlength="3" maxlength="100" autocomplete="username">
<label for="password">Mật khẩu Admin</label><input id="password" name="password" type="password" required minlength="12" maxlength="200" autocomplete="new-password">
<p class="muted">Ít nhất 12 ký tự. Hãy lưu mật khẩu để sử dụng khi đăng nhập.</p>
<label for="confirm">Nhập lại mật khẩu</label><input id="confirm" name="confirm" type="password" required minlength="12" maxlength="200" autocomplete="new-password">
<button type="submit">Hoàn tất cài đặt</button></form>
<?php endif ?></main></body></html>
