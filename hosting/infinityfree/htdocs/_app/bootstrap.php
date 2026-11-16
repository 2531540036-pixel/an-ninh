<?php
declare(strict_types=1);

ini_set('display_errors', '0');
date_default_timezone_set('UTC');
header('X-Content-Type-Options: nosniff');
header('Referrer-Policy: strict-origin-when-cross-origin');
header('X-Frame-Options: DENY');
header("Content-Security-Policy: default-src 'self'; img-src 'self' data:; style-src 'self' 'unsafe-inline'; script-src 'self'; connect-src 'self'; frame-src https://www.google.com; base-uri 'self'; form-action 'self'; frame-ancestors 'none'");

final class SiteError extends RuntimeException {
    public function __construct(string $message, public int $status = 400) {
        parent::__construct($message);
    }
}
function fail(string $message, int $status = 400): never {
    throw new SiteError($message, $status);
}
function json_out(mixed $data, int $status = 200): never {
    http_response_code($status);
    header('Content-Type: application/json; charset=utf-8');
    header('Cache-Control: no-store');
    echo json_encode($data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_THROW_ON_ERROR);
    exit;
}
function encode(mixed $data): string {
    return json_encode($data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_THROW_ON_ERROR);
}
function now_ms(): int { return (int) floor(microtime(true) * 1000); }
function iso_now(): string { return gmdate('Y-m-d\TH:i:s') . '.000Z'; }
function txt(mixed $value, int $max = 10000): string {
    return is_string($value) ? mb_substr(trim($value), 0, $max, 'UTF-8') : '';
}
function required(mixed $value, string $label, int $max = 200): string {
    $value = txt($value, $max + 1);
    if ($value === '' || mb_strlen($value, 'UTF-8') > $max) {
        fail("$label là bắt buộc, tối đa $max ký tự.");
    }
    return $value;
}
function uuid(): string {
    $b = random_bytes(16);
    $b[6] = chr((ord($b[6]) & 0x0f) | 0x40);
    $b[8] = chr((ord($b[8]) & 0x3f) | 0x80);
    return vsprintf('%s%s-%s-%s-%s-%s%s%s', str_split(bin2hex($b), 4));
}
function password_digest(string $password): string {
    // Avoid bcrypt's 72-byte truncation for long or Vietnamese passwords.
    return base64_encode(hash('sha384', $password, true));
}
function hash_password(string $password): string {
    return password_hash(password_digest($password), PASSWORD_DEFAULT);
}
function check_password(string $password, string $hash): bool {
    return password_verify(password_digest($password), $hash);
}
function esc(mixed $s): string {
    return htmlspecialchars((string) $s, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
}
function config(): array {
    static $config;
    if (isset($config)) return $config;
    $path = dirname(__DIR__) . '/_private/config.php';
    if (!is_file($path)) fail('Chưa cấu hình hosting. Hãy tạo _private/config.php theo hướng dẫn đi kèm.', 503);
    $config = require $path;
    if (!is_array($config)) fail('Cấu hình hosting không hợp lệ.', 503);
    foreach (['site_url', 'db_host', 'db_name', 'db_user', 'db_password', 'setup_key'] as $key) {
        if (!isset($config[$key]) || !is_string($config[$key]) || $config[$key] === '') fail('Cấu hình hosting chưa đầy đủ.', 503);
    }
    $config['site_url'] = rtrim($config['site_url'], '/');
    $url = parse_url($config['site_url']);
    $local = in_array($url['host'] ?? '', ['localhost', '127.0.0.1', '[::1]'], true);
    if (!$url || !isset($url['host']) || !in_array($url['scheme'] ?? '', $local ? ['http','https'] : ['https'], true)
        || isset($url['user']) || isset($url['pass']) || isset($url['query']) || isset($url['fragment']) || !empty($url['path'])) {
        fail('site_url phải là địa chỉ HTTPS chính thức, không kèm đường dẫn.', 503);
    }
    if (!preg_match('/^[a-zA-Z0-9.-]+$/D', $config['db_host']) || !preg_match('/^[a-zA-Z0-9_]+$/D', $config['db_name'])) {
        fail('Tên máy chủ hoặc tên cơ sở dữ liệu không hợp lệ.', 503);
    }
    $config['local'] = $local;
    return $config;
}
function db(): PDO {
    static $pdo;
    if (isset($pdo)) return $pdo;
    $c = config();
    try {
        $pdo = new PDO('mysql:host=' . $c['db_host'] . ';dbname=' . $c['db_name'] . ';charset=utf8mb4', $c['db_user'], $c['db_password'], [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_EMULATE_PREPARES => false,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_STRINGIFY_FETCHES => false,
        ]);
        return $pdo;
    } catch (PDOException $e) {
        error_log('An Ninh: database connection unavailable (' . $e->getCode() . ')');
        fail('Chưa kết nối được cơ sở dữ liệu. Kiểm tra thông tin MySQL trong cấu hình hosting.', 503);
    }
}
function query(string $sql, mixed ...$args): PDOStatement {
    $s = db()->prepare($sql);
    foreach ($args as $i => $arg) $s->bindValue($i + 1, $arg, is_int($arg) ? PDO::PARAM_INT : ($arg === null ? PDO::PARAM_NULL : PDO::PARAM_STR));
    $s->execute();
    return $s;
}
function one(string $sql, mixed ...$args): ?array {
    return query($sql, ...$args)->fetch() ?: null;
}
function rows(string $sql, mixed ...$args): array {
    return query($sql, ...$args)->fetchAll();
}
function settings(): array {
    $r = one('SELECT data FROM settings WHERE id=1');
    if (!$r) fail('Website chưa cài đặt. Mở /cai-dat.php để hoàn tất.', 503);
    return json_decode($r['data'], true, 512, JSON_THROW_ON_ERROR);
}
function is_https(): bool { return !empty($_SERVER['HTTPS']) && strtolower($_SERVER['HTTPS']) !== 'off'; }
function enforce_host(): void {
    $c = config();
    $u = parse_url($c['site_url']);
    $host = strtolower($u['host'] . (isset($u['port']) ? ':' . $u['port'] : ''));
    if (strtolower($_SERVER['HTTP_HOST'] ?? '') !== $host) fail('Địa chỉ website không khớp cấu hình hosting.', 421);
    if (!$c['local'] && !is_https()) {
        if (!in_array($_SERVER['REQUEST_METHOD'], ['GET','HEAD'], true)) fail('Vui lòng sử dụng HTTPS.', 403);
        header('Location: ' . $c['site_url'] . ($_SERVER['REQUEST_URI'] ?? '/'), true, 308);
        exit;
    }
}
function origin(string $url): string {
    $u = parse_url($url);
    if (!$u || !isset($u['scheme'], $u['host']) || isset($u['user']) || isset($u['pass']) || !in_array($u['scheme'], ['http','https'], true)) return '';
    return strtolower($u['scheme'] . '://' . $u['host']) . (isset($u['port']) ? ':' . $u['port'] : '');
}
function verify_origin(): void {
    if (in_array($_SERVER['REQUEST_METHOD'] ?? 'GET', ['GET','HEAD','OPTIONS'], true)) return;
    $expected = config()['site_url'];
    $provided = $_SERVER['HTTP_ORIGIN'] ?? '';
    $valid = $provided !== '' ? hash_equals($expected, $provided) : hash_equals($expected, origin($_SERVER['HTTP_REFERER'] ?? ''));
    if (($_SERVER['HTTP_SEC_FETCH_SITE'] ?? '') === 'cross-site' || !$valid) fail('Nguồn yêu cầu không hợp lệ.', 403);
}
function body(): array {
    static $body;
    if (isset($body)) return $body;
    if ((int) ($_SERVER['CONTENT_LENGTH'] ?? 0) > 6 * 1024 * 1024) fail('Tệp vượt quá giới hạn 5 MB.', 413);
    $type = strtolower(explode(';', $_SERVER['CONTENT_TYPE'] ?? '')[0]);
    if ($type === 'application/json') {
        $raw = file_get_contents('php://input', false, null, 0, 1048577);
        if (strlen($raw) > 1048576) fail('Nội dung yêu cầu quá lớn.', 413);
        try { $body = json_decode($raw, true, 50, JSON_THROW_ON_ERROR); }
        catch (JsonException $e) { fail('Dữ liệu JSON không hợp lệ.'); }
        if (!is_array($body) || array_is_list($body) && $body !== []) fail('Dữ liệu yêu cầu không hợp lệ.');
    } elseif ($type === 'multipart/form-data' || $type === 'application/x-www-form-urlencoded') {
        $body = $_POST;
        if (count($body) > 20) fail('Quá nhiều trường dữ liệu.');
        foreach ($body as $v) if (!is_string($v) || strlen($v) > 40000) fail('Trường dữ liệu không hợp lệ.');
    } else { fail('Định dạng yêu cầu không hợp lệ.', 415); }
    return $body;
}
function throttle(string $name, int $max, int $seconds): void {
    $key = $name . ':' . hash('sha256', $_SERVER['REMOTE_ADDR'] ?? '');
    $now = now_ms();
    // Increment and check under one row lock so concurrent PHP requests share the limit.
    db()->beginTransaction();
    try {
        query('INSERT IGNORE INTO attempts (`key`,count,expires) VALUES (?,0,?)', $key, $now + $seconds * 1000);
        $r = one('SELECT count,expires FROM attempts WHERE `key`=? FOR UPDATE', $key);
        if ((int)$r['expires'] <= $now) {
            $r = ['count' => 0, 'expires' => $now + $seconds * 1000];
        }
        if ((int)$r['count'] >= $max) {
            db()->commit();
            header('Retry-After: ' . max(1, (int)ceil(((int)$r['expires'] - $now) / 1000)));
            fail('Bạn thao tác quá nhanh. Vui lòng thử lại sau.', 429);
        }
        query('UPDATE attempts SET count=?,expires=? WHERE `key`=?', (int)$r['count'] + 1, (int)$r['expires'], $key);
        db()->commit();
    } catch (Throwable $e) {
        if (db()->inTransaction()) db()->rollBack();
        throw $e;
    }
}
function session_admin(): ?array {
    $token = $_COOKIE['an_session'] ?? '';
    if (!is_string($token) || !preg_match('/^[A-Za-z0-9_-]{43}$/D', $token)) return null;
    return one('SELECT a.id,a.username,a.must_change,s.token_hash FROM sessions s JOIN admins a ON a.id=s.admin_id WHERE s.token_hash=? AND s.expires>?', hash('sha256', $token), now_ms());
}
function auth(string $path): array {
    $a = session_admin();
    if (!$a) fail('Vui lòng đăng nhập quản trị.', 401);
    if ($a['must_change'] && !in_array($path, ['/api/admin/me','/api/admin/password','/api/admin/logout'], true)) fail('Vui lòng đổi mật khẩu tạm thời trước khi sử dụng.', 403);
    return $a;
}
function cookie(string $token, int $age): void {
    setcookie('an_session', $token, ['expires' => time() + $age, 'path' => '/', 'secure' => !config()['local'] || is_https(), 'httponly' => true, 'samesite' => 'Strict']);
}
function handle_error(Throwable $e): never {
    if ($e instanceof SiteError) json_out(['error' => $e->getMessage()], $e->status);
    if ($e instanceof PDOException && $e->getCode() === '23000') json_out(['error' => 'Đường dẫn đã được sử dụng hoặc dữ liệu đang được tham chiếu. Vui lòng kiểm tra lại.'], 409);
    error_log('An Ninh: request failed (' . get_class($e) . ', ' . $e->getCode() . ')');
    json_out(['error' => 'Có lỗi xử lý. Vui lòng thử lại.'], 500);
}
