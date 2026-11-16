# Kiểm tra bản PHP / InfinityFree

Đã chạy 15 kiểm tra HTTP trên Apache 2.4.71, PHP 8.3.36, MariaDB 10.11.19. Kết quả trong `results.txt`. Đây là kiểm tra cục bộ; chưa phải kiểm tra trên tài khoản InfinityFree thật.

Các kiểm tra bao gồm cài đặt có mã riêng, đăng nhập và đổi mật khẩu, mật khẩu dài hơn 72 byte, chống SQL injection/khác nguồn, giới hạn đăng nhập, CRUD bài viết/vị trí tuyển dụng, lưu liên hệ, ứng tuyển chung và theo vị trí, CV riêng tư, kiểm tra loại/dung lượng tệp, ảnh công khai, cấu hình, SEO/sitemap, và chặn truy cập trực tiếp thư mục riêng bằng Apache.

`integration.test.mjs` cần một website test mới, MySQL test rỗng và PHP/Apache chạy tại `http://127.0.0.1:8091` (có thể đổi bằng `INFINITYFREE_TEST_URL`). File config của môi trường test dùng `setup_key` là `local-test-setup-key-only-32-characters`. Các giá trị này chỉ dành cho test; không dùng làm khóa hosting thật. Chạy `node --test hosting/infinityfree/tests/integration.test.mjs` trên môi trường đó. Bộ test tạo và xóa dữ liệu giả, không chạy trên database thật.

Đã chạy thêm hai kiểm tra triển khai với **máy chủ FTPS thật cục bộ**, bắt buộc TLS ở cả kênh đăng nhập và dữ liệu. Kiểm tra truyền đúng byte, giữ hồ sơ/lock đã có, từ chối chứng chỉ không được tin cậy và chặn cấu hình thiếu. Cài `pyftpdlib` + `pyopenssl` trong môi trường Python riêng, rồi chạy `python hosting/infinityfree/tests/deploy.test.py`.

20 kiểm tra của bản Node hiện tại cũng đã đạt bằng `npm test`. Không có dữ liệu test hoặc tài khoản test nào được đưa vào bộ cài hosting.
