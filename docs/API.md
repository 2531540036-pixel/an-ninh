# API

Cùng origin với website, JSON UTF-8 trừ upload `multipart/form-data`. Lỗi dạng `{ "error": "Thông báo" }`. HTTP 400: đầu vào sai; 401: chưa đăng nhập; 403: nguồn không hợp lệ hoặc cần đổi mật khẩu; 404: không tồn tại; 409: trùng đường dẫn/liên kết; 429: quá giới hạn.

## Công khai

| Method | URL | Chức năng |
|---|---|---|
| GET | `/api/site` | Thông tin công ty, chỉ các trường dùng công khai |
| GET | `/api/posts?q=&category=&page=1` | Bài xuất bản, 6 bài/trang; trả items,total,page,pages |
| GET | `/api/posts/:slug` | Chi tiết bài xuất bản |
| GET | `/api/jobs?q=&page=1` | Danh sách vị trí, cả trạng thái mở/đóng |
| GET | `/api/jobs/:slug` | Chi tiết vị trí |
| POST | `/api/contacts` | Lưu yêu cầu tư vấn |
| POST | `/api/applications` | Nhận hồ sơ ứng tuyển, có file |
| GET | `/media/:id` | Chỉ ảnh được đánh dấu public; hồ sơ bị từ chối |

Liên hệ: `name, phone, email, service, location, message` bắt buộc; `company, quantity` tùy chọn; `consent: true` bắt buộc.

Ứng tuyển: `name, birth (YYYY-MM-DD), phone, email, address, job_id, experience, intro, file` bắt buộc; `gender, education` tùy chọn; `consent` chuỗi `true`. Vị trí phải đang mở. File PDF/DOC/DOCX tối đa 5 MB. Tất cả dữ liệu DEMO trong test được ghi rõ và tự xóa.

## Xác thực quản trị

| Method | URL | Payload |
|---|---|---|
| POST | `/api/admin/login` | `username,password`; thiết lập cookie phiên |
| GET | `/api/admin/me` | Trả `username,must_change` |
| POST | `/api/admin/password` | `current,password`; đổi mật khẩu và xóa mọi phiên |
| POST | `/api/admin/logout` | Kết thúc phiên hiện tại |

Các API sau đều cần cookie đã xác thực và hoàn thành đổi mật khẩu tạm.

| Method | URL | Chức năng |
|---|---|---|
| GET | `/api/admin/dashboard` | Thống kê database |
| GET, PUT | `/api/admin/settings` | Đọc/sửa các trường cấu hình được cho phép |
| GET, POST | `/api/admin/posts` | Danh sách/tạo bài |
| PUT, DELETE | `/api/admin/posts/:id` | Sửa/xóa bài |
| GET, POST | `/api/admin/jobs` | Danh sách/tạo vị trí |
| PUT, DELETE | `/api/admin/jobs/:id` | Sửa/xóa vị trí; bảo toàn liên kết hồ sơ |
| GET | `/api/admin/contacts` | Toàn bộ liên hệ để Admin tìm/lọc/phân trang trong giao diện |
| PUT, DELETE | `/api/admin/contacts/:id` | `status,notes` hoặc xóa |
| GET | `/api/admin/applications` | Toàn bộ hồ sơ kèm tên vị trí |
| PUT, DELETE | `/api/admin/applications/:id` | `status,notes` hoặc xóa cả hồ sơ/file |
| POST | `/api/admin/images` | multipart `file`; trả `{url}` ảnh công khai |
| GET | `/api/admin/files/:id` | Tải file dưới dạng attachment, cần quyền Admin |

Bài viết: `title, slug, category, content, image, status`; status `draft/published/hidden`. Slug tự tạo khi để trống, cần duy nhất.

Vị trí: `title, slug, location, salary, schedule, quantity, description, requirements, benefits, status`; status `open/closed`. Số lượng 1–10000.

Trạng thái liên hệ: Mới, Đang xử lý, Đã liên hệ, Hoàn thành.

Trạng thái hồ sơ: Mới nhận, Đang xem xét, Đã liên hệ, Mời phỏng vấn, Đạt, Không phù hợp.

Tìm/lọc/phân trang Admin chạy trong frontend sau khi nhận dữ liệu đã xác thực. Với dữ liệu lớn, có thể bổ sung phân trang SQL trên các API Admin; public API đã phân trang tại database.
