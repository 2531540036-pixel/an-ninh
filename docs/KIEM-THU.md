# Báo cáo kiểm tra

Ngày bàn giao: 16/11/2026 (giờ Việt Nam).

## Đã thực hiện

`npm run build`: thành công. React/Vite tạo HTML, CSS và JavaScript production, không phụ thuộc CDN frontend.

`npm test`: 11 nhóm kiểm thử tích hợp HTTP. Dùng dữ liệu có nhãn DEMO trong database/tệp tạm; sau kiểm thử được xóa. Không đưa dữ liệu giả vào database vận hành.

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
| 09 | Chặn Origin bên ngoài; mở database bằng kết nối khác và tiến trình Node mới vẫn có dữ liệu; đối chiếu thống kê |
| 10 | Xóa bài/liên hệ/hồ sơ/file/vị trí; đăng xuất chặn truy cập phiên cũ |
| 11 | HTTP HTML và tệp JS production; title/canonical theo trang; CSP; Admin noindex; sitemap có dịch vụ |

Kết quả chạy thực tế được lưu tại `docs/test-output.txt` trong gói mã nguồn.

## Chưa kiểm chứng

- Không có công cụ `cua_repl.js` nên chưa chạy trình duyệt managed preview, chưa có screenshot trang chính và chưa xác nhận tương tác UI/mobile/keyboard qua trình duyệt thật.
- CSS đã có breakpoint và giao diện mobile, nhưng không ghi nhận là “đã kiểm thử responsive” chỉ từ việc build thành công.
- Chưa kiểm thử trên môi trường HTTPS production, email, Zalo hay tên miền công ty vì chưa có cấu hình được xác nhận.
- Chưa deploy trực tuyến do thiếu script workflow Sites. Không có URL online để báo thành công.
- Chưa tích hợp tệp ảnh đã gửi trong chat vì không có file local/ID tải ảnh. Các vùng ảnh chờ có nhãn; Admin có upload để hoàn thiện.

## Kiểm tra nghiệm thu sau khi chạy trên máy của bạn

1. Đăng nhập bằng tài khoản bàn giao, đổi mật khẩu và đăng nhập lại.
2. Tải logo/ảnh thật, lưu thông tin công ty; xem trang chủ ở kích thước desktop và điện thoại.
3. Gửi một yêu cầu có tiền tố DEMO từ `/lien-he`; kiểm tra Admin nhận và đổi trạng thái, tải lại trang.
4. Tạo một vị trí DEMO đang mở; gửi CV PDF từ trang chi tiết; tải CV trong Admin; mở URL tải ở cửa sổ chưa đăng nhập để kiểm tra bị chặn.
5. Đóng vị trí rồi thử nộp hồ sơ lại.
6. Tạo bài nháp DEMO; kiểm tra không công khai; xuất bản/sửa/ẩn/xóa và kiểm tra trang tin.
7. Kiểm tra tìm kiếm, phân trang, menu mobile, nút gọi/Zalo khi đã có số/liên kết xác nhận.
8. Dừng và khởi động lại Node; kiểm tra dữ liệu còn tồn tại. Xóa dữ liệu DEMO sau nghiệm thu.
