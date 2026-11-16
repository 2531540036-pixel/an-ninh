# Đưa website An Ninh lên InfinityFree

Website dùng chung một tên miền: khách xem bình thường, quản trị tại `/admin`. Bản InfinityFree dùng PHP 8.3+ và MySQL; bản Node/SQLite hiện tại vẫn dùng được trong Codespaces.

## 1. Kích hoạt tài khoản hosting

Mở Control Panel một lần sau khi tạo tài khoản. Đợi hosting Active và HTTPS hoạt động. Dùng đúng tên miền InfinityFree đã cấp, chép từ trang quản lý tài khoản.

## 2. Tự động tải tệp qua GitHub Actions

Mở **GitHub → repository an-ninh → Settings → Secrets and variables → Actions**:

https://github.com/2531540036-pixel/an-ninh/settings/secrets/actions

Chọn **New repository secret** và lưu ba giá trị ở mục **FTP Details** của tài khoản InfinityFree:

| Tên Secret | Điền giá trị |
| --- | --- |
| `INFINITYFREE_FTP_HOST` | FTP Hostname, thường là `ftpupload.net`; chép đúng trên tài khoản |
| `INFINITYFREE_FTP_USER` | FTP Username được InfinityFree cấp |
| `INFINITYFREE_FTP_PASSWORD` | Mật khẩu hosting/FTP đã lưu khi tạo tài khoản |

Không ghi các mật khẩu vào mã nguồn, Issue, README hoặc gửi trong chat.

Tệp được tải bằng **FTPS có xác minh chứng chỉ**, không chuyển về FTP không mã hóa. Không xóa dữ liệu hay CV đã có. Nếu Control Panel ghi thư mục của tên miền là `/htdocs` thì không cần thêm cấu hình đường dẫn. Nếu là thư mục khác, thêm Repository Variable `INFINITYFREE_FTP_DIR` với đường dẫn đầy đủ kết thúc bằng `/htdocs`.

## 3. Tạo MySQL và cấu hình lần đầu

Trong **Control Panel → MySQL Databases**, tạo database tên `anninh`. Chép chính xác MySQL Hostname, Database Name, Username, Password. InfinityFree không dùng `localhost` làm MySQL Hostname.

Có hai cách:

**Cách tự động:** thêm các Repository Secrets sau (cùng trang ở bước 2):

| Tên Secret | Điền giá trị |
| --- | --- |
| `INFINITYFREE_DB_HOST` | MySQL Hostname |
| `INFINITYFREE_DB_NAME` | Tên đầy đủ của database có tiền tố tài khoản |
| `INFINITYFREE_DB_USER` | MySQL Username |
| `INFINITYFREE_DB_PASSWORD` | MySQL Password |
| `INFINITYFREE_SETUP_KEY` | Tự chọn mã cài đặt riêng, ít nhất 24 ký tự; lưu lại để nhập khi cài |

Trong tab **Variables**, thêm `INFINITYFREE_SITE_URL`: địa chỉ HTTPS đầy đủ của tên miền hosting, không có dấu `/` cuối. Khi đủ cấu hình này, quy trình tải lên sẽ tạo `_private/config.php` trên hosting; tệp chứa mật khẩu không được lưu vào GitHub hay artifact.

**Cách File Manager:** sao chép `_app/config.example.php` thành `_private/config.php`, sửa tên miền, bốn giá trị MySQL và `setup_key` ngẫu nhiên của riêng bạn. Đừng chỉ đổi tên tệp mẫu mà bỏ qua các giá trị bên trong.

## 4. Chạy lần đầu

Mở **Actions → Deploy InfinityFree → Run workflow → main → Run workflow**:

https://github.com/2531540036-pixel/an-ninh/actions/workflows/infinityfree.yml

Quy trình cũng tự chạy khi giao diện hoặc bản PHP thay đổi trên main, sau khi ba FTP Secrets đã được lưu. Nếu thiếu FTP Secrets, quy trình ghi rõ chưa tải lên và bỏ qua triển khai.

Mỗi lần chạy đều tạo bộ cài **An-Ninh-InfinityFree** trong mục **Artifacts**, kể cả khi chưa có thông tin FTP. Bộ cài không chứa mật khẩu, hồ sơ hay database. Nếu cần tải bằng File Manager, tải artifact này rồi giải nén trên máy và tải nội dung thư mục htdocs vào đúng htdocs của hosting.

Sau khi tải xong:

1. Mở `https://TEN-MIEN-CUA-BAN/cai-dat.php`.
2. Nhập mã `INFINITYFREE_SETUP_KEY` đã lưu, tên đăng nhập muốn dùng và mật khẩu Admin mới ít nhất 12 ký tự.
3. Hoàn tất cài đặt, vào `/admin` đăng nhập bằng mật khẩu vừa đặt.
4. Trong Admin, cập nhật số điện thoại, địa chỉ, email; tạo bài viết và tin tuyển dụng cần đăng.

Khách hàng không cần đăng nhập. Khi chưa có vị trí tuyển dụng, khách vẫn có thể gửi đăng ký ứng tuyển chung. CV được giữ trong thư mục chặn truy cập trực tiếp, chỉ Admin đã đăng nhập mới tải được qua API.

Đây là **cài mới**: nội dung mẫu chính thức và sáu ảnh đã được chấp thuận được giữ nguyên; tài khoản, bài viết hay hồ sơ đang nằm trong database Codespaces không tự chuyển sang MySQL. Không tải database SQLite chứa hồ sơ lên kho mã công khai. Nếu đang có dữ liệu thật cần chuyển, giữ nguyên database cũ để thực hiện xuất/nhập riêng.

## Nếu tải bằng File Manager

Chạy `npm ci`, `npm run build`, `node scripts/package-infinityfree.mjs`. Tải **nội dung** thư mục `hosting/infinityfree/build/htdocs` vào `htdocs` của đúng tên miền, gồm cả `.htaccess`. Không tải thêm một thư mục `htdocs` lồng bên trong. Sau đó làm bước cấu hình và cài đặt ở trên.

## Khắc phục nhanh

- **Nguồn yêu cầu không hợp lệ:** địa chỉ HTTPS đang mở phải trùng `site_url` trong `_private/config.php`. Không dùng thêm `www` nếu chưa cấu hình tên miền đó.
- **Chưa kết nối được cơ sở dữ liệu:** kiểm tra đủ bốn thông tin MySQL; dùng đúng Hostname, không điền `localhost`.
- **Trang trắng/404 khi mở thẳng `/admin`:** kiểm tra đã tải `.htaccess` vào htdocs.
- **Website cũ còn hiện:** tải lại trang bằng Ctrl+F5; kiểm tra đúng htdocs của tên miền và đúng chỉ dẫn DirectoryIndex trong `.htaccess`.
- **Chứng chỉ HTTPS chưa có:** đợi SSL của hosting sẵn sàng rồi cài; không đăng nhập qua HTTP.
- **Quên mật khẩu Admin:** không chạy lại trình cài đặt. Trình cài khóa sau lần tạo Admin đầu tiên, kể cả khi tệp lock vô tình bị xóa.

InfinityFree có lớp kiểm tra trình duyệt, nên một số công cụ kiểm tra HTTP tự động từ bên ngoài có thể nhận trang kiểm tra thay vì website. Kết quả tải FTPS thành công chưa thay thế việc mở website và thử gửi form trong trình duyệt.
