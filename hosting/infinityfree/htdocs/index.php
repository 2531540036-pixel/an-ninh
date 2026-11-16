<?php
declare(strict_types=1);
require __DIR__ . '/_app/bootstrap.php';
try {
    enforce_host();
    verify_origin();
    $path = parse_url($_SERVER['REQUEST_URI'] ?? '/', PHP_URL_PATH);
    if (!is_string($path) || str_contains($path, "\0") || preg_match('~%(?:2f|5c|00)~i',$path)) fail('Đường dẫn không hợp lệ.',400);
    $path = rawurldecode($path);
    if (preg_match('~^/(?:api|media)(?:/|$)~',$path)) {
        require __DIR__ . '/_app/api.php';
        api($path);
    }
    if (!in_array($_SERVER['REQUEST_METHOD'],['GET','HEAD'],true)) fail('Phương thức không hợp lệ.',405);
    if (preg_match('~^/(?:assets|fonts|company-images|_app|_private)(?:/|$)~i',$path) || str_starts_with($path,'/.')) fail('Không tìm thấy tệp.',404);
    require __DIR__ . '/_app/page.php';
    page($path);
} catch (Throwable $e) { handle_error($e); }
