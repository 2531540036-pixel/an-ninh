# Báo cáo kiểm tra

Ngày bàn giao: 16/11/2026 (giờ Việt Nam).

## Đã thực hiện

`npm run build`: thành công. React/Vite tạo HTML, CSS và JavaScript production, không phụ thuộc CDN frontend.

`npm test`: 18 nhóm kiểm thử HTTP, nâng cấp database và nguồn yêu cầu đăng nhập. Dùng dữ liệu có nhãn DEMO trong database/tệp tạm; sau kiểm thử được xóa. Không đưa dữ liệu giả vào database vận hành.

| Nhóm | Nội dung |
|---|---|
| 01 | Chặn Admin/file khi chưa đăng nhập; từ chối đăng nhập bằng chuỗi SQL injection |
| 02 | Đăng nhập; bắt buộc đổi mật khẩu tạm; yêu cầu mật khẩu đủ dài; kết thúc phiên cũ |
| 03 | Tin tức: bản nháp không công khai; xuất bản/tìm kiếm/danh mục; sửa và ẩn bài |
| 04 | Liên hệ: từ chối form thiếu, email/điện thoại sai, thiếu đồng ý; Admin nhận dữ liệu và cập nhật trạng thái |
| 05 | Tạo vị trí tuyển dụng, đọc được thông tin qua API công khai |
| 06 | Upload PDF; lưu thông tin ứng viên; tải file cần xác thực; URL media công khai bị chặn; ghi chú và trạng thái được lưu |
| 07 | Từ chối file giả định dạng, file quá 5 MB, ngày sinh sai; đóng vị trí chặn ứng tuyển; bảo toàn liên kết hồ sơ |
| 08 | Upload ảnh hợp lệ; chặn SVG; chặn đường dẫn ảnh script; sửa cấu hình công ty; kiểm tra nguồn bản đồ |
| 08b | Đăng ký chung không có vị trí mở; CV/email tùy chọn; kiểm tra trường bắt buộc, đồng ý, email; lưu riêng tư và xóa file |
| Migration | Nâng cấp database cũ giữ nguyên hồ sơ, trạng thái, ghi chú, tệp và quan hệ vị trí; cho phép đăng ký chung |
| 09 | Chặn Origin bên ngoài; mở database bằng kết nối khác và tiến trình Node mới vẫn có dữ liệu; đối chiếu thống kê |
| 10 | Xóa bài/liên hệ/hồ sơ/file/vị trí; đăng xuất chặn truy cập phiên cũ |
| 11 | HTTP HTML và JS production; title/canonical; CSP; Admin noindex; sitemap; ảnh JPEG/font thực sự phục vụ đúng MIME và ảnh thiếu trả 404 |

Kết quả chạy thực tế được lưu tại `docs/test-output.txt` trong gói mã nguồn.

Kiểm tra hồi quy lỗi Admin trên Codespaces: đăng nhập thực sự với tài khoản thử nghiệm thành công qua origin HTTPS đúng khi `SITE_URL` cũ là localhost và chưa bật trust proxy; khởi chạy trực tiếp không có `SITE_URL` cũng thành công. Giữ cờ cookie HttpOnly, SameSite=Strict và Secure ở production. Từ chối Codespace khác, sai cổng/giao thức, miền giả, Origin null và header chuyển tiếp giả. Đăng nhập local và tên miền production đã cấu hình tiếp tục hoạt động. Tất cả 18 nhóm qua; chưa truy cập trực tiếp Codespace của người dùng để xác nhận trên trình duyệt.

## Chưa kiểm chứng

- Không có công cụ `cua_repl.js` nên chưa chạy trình duyệt managed preview, chưa có screenshot trang chính và chưa xác nhận tương tác UI/mobile/keyboard qua trình duyệt thật.
- CSS đã có breakpoint và giao diện mobile, nhưng không ghi nhận là “đã kiểm thử responsive” chỉ từ việc build thành công.
- Chưa kiểm thử trên môi trường HTTPS production, email, Zalo hay tên miền công ty vì chưa có cấu hình được xác nhận.
- Mã nguồn và frontend đã build được bàn giao qua GitHub. Chưa có tên miền công ty đang chạy production.
- Đã tích hợp 6 ảnh nguồn gốc chọn từ hai ZIP, font tự lưu và thư viện ảnh. Các thành phần Home/About/Services/Careers/Header/Footer đã được render kiểm tra bằng React server renderer, không thay thế kiểm tra trực quan qua trình duyệt.

## Kiểm tra nghiệm thu sau khi chạy trên máy của bạn

1. Đăng nhập bằng tài khoản bàn giao, đổi mật khẩu và đăng nhập lại.
2. Tải logo/ảnh thật, lưu thông tin công ty; xem trang chủ ở kích thước desktop và điện thoại.
3. Gửi một yêu cầu có tiền tố DEMO từ `/lien-he`; kiểm tra Admin nhận và đổi trạng thái, tải lại trang.
4. Tạo một vị trí DEMO đang mở; gửi CV PDF từ trang chi tiết; tải CV trong Admin; mở URL tải ở cửa sổ chưa đăng nhập để kiểm tra bị chặn.
5. Đóng vị trí rồi thử nộp hồ sơ lại.
6. Tạo bài nháp DEMO; kiểm tra không công khai; xuất bản/sửa/ẩn/xóa và kiểm tra trang tin.
7. Kiểm tra tìm kiếm, phân trang, menu mobile, nút gọi/Zalo khi đã có số/liên kết xác nhận.
8. Dừng và khởi động lại Node; kiểm tra dữ liệu còn tồn tại. Xóa dữ liệu DEMO sau nghiệm thu.
