# Website Công ty An Ninh

Bản Full-stack chạy trên máy chủ riêng: React 19, Vite 6, Node.js 24, Express 5 và SQLite thật. Biểu mẫu không lưu hồ sơ vào localStorage. Dữ liệu nằm trong `data/site.sqlite`; tệp hồ sơ nằm ngoài thư mục web công khai, trong `data/uploads/`.

## Chạy bản bàn giao

Cần Node.js **24 trở lên** và npm.

**[Bấm vào đây để tải mã nguồn dạng ZIP](https://github.com/2531540036-pixel/an-ninh/archive/refs/heads/main.zip)**, hoặc dùng nút **Code → Download ZIP** trên GitHub.

Giải nén, mở terminal trong thư mục chứa `package.json` và chạy:

```bash
npm ci
npm run admin:create
npm start
```

Bản GitHub kèm frontend đã build trong `dist/`. Cơ sở dữ liệu được tạo trên máy của bạn khi chạy lệnh. `npm run admin:create` tạo tài khoản Admin với mật khẩu ngẫu nhiên, hiển thị tại terminal và bắt buộc đổi ở lần đăng nhập đầu tiên. **Không có tài khoản, mật khẩu, database vận hành hoặc hồ sơ nội bộ trong kho GitHub hay bản ZIP tải từ kho.**

- Website khi đã chạy: http://127.0.0.1:3000
- Quản trị khi đã chạy: http://127.0.0.1:3000/admin
- Đây là địa chỉ localhost, **không phải URL website đã triển khai trực tuyến**.

Sau khi sửa mã nguồn giao diện, build lại bằng `npm run build`. Muốn tạo bản build mới từ đầu:

```bash
npm ci
npm run build
npm run admin:create
npm start
```

`admin:create` tạo mật khẩu ngẫu nhiên và chỉ in tại terminal; mặc định tên `admin`. Lệnh này đặt lại tài khoản cùng tên và kết thúc mọi phiên đăng nhập. Có thể đặt `ADMIN_USERNAME` và `ADMIN_PASSWORD` qua môi trường; mật khẩu cần tối thiểu 12 ký tự. Không đặt mật khẩu trong câu lệnh lưu lịch sử shell, Git hoặc file chia sẻ.

## Cấu hình

Ứng dụng đọc biến môi trường của tiến trình. Dùng `node --env-file=.env server.mjs` nếu muốn nạp một file `.env` tự tạo từ `.env.example`. Không có khóa hay mật khẩu thật trong `.env.example`.

| Biến | Ý nghĩa |
|---|---|
| `PORT` | Mặc định 3000 |
| `HOST` | Mặc định 127.0.0.1; chỉ đặt 0.0.0.0 khi cấu hình mạng/container phù hợp |
| `DATA_DIR` | Thư mục database và hồ sơ, mặc định `./data` |
| `SITE_URL` | Origin chính thức để tạo canonical, Open Graph và sitemap |
| `NODE_ENV` | Đặt `production` sau khi có HTTPS; cookie quản trị sẽ có `Secure` |
| `TRUST_PROXY` | Chỉ đặt 1 nếu ứng dụng thực sự đứng sau đúng một reverse proxy tin cậy |

Các đường dẫn tương đối tính từ thư mục chạy lệnh; hãy chạy trong thư mục dự án.

## Cập nhật nội dung

1. Vào `/admin`, đăng nhập và đổi mật khẩu tạm.
2. **Thông tin công ty**: xác nhận tên, số điện thoại, email, địa chỉ và mạng xã hội. Để trống thông tin chưa xác nhận. Tải logo, banner, ảnh đội ngũ, huấn luyện và ảnh theo dịch vụ; nhấn **Lưu thông tin công ty**. Chấp nhận JPG, PNG, WEBP, tối đa 5 MB. Logo giữ nguyên tỉ lệ. Nên chuẩn bị ảnh ngang tối ưu trước khi upload.
3. **Tin tức**: tạo bài, chọn danh mục, ảnh đại diện; nhập nội dung. Trình soạn thảo hỗ trợ tiêu đề phụ, danh sách, chèn ảnh và xem trước. Nội dung dạng văn bản có cấu trúc; không thực thi HTML. Chọn **Xuất bản** để công khai, **Bản nháp** để soạn tiếp, **Ẩn** để gỡ khỏi trang tin.
4. **Vị trí tuyển dụng**: nhập mô tả, yêu cầu, quyền lợi, nơi làm việc, ca trực và số lượng. Mức lương để trống nếu chưa công bố. Chỉ vị trí **Mở tuyển dụng** nhận được hồ sơ. Vị trí đóng vẫn có trang để người đọc biết đã ngừng tiếp nhận.
5. **Yêu cầu tư vấn / Hồ sơ ứng tuyển**: tìm kiếm, lọc, xem chi tiết, cập nhật trạng thái và ghi chú nội bộ. File ứng viên tải qua API có đăng nhập, không có URL tải công khai.
6. Vị trí đã có hồ sơ không được xóa trực tiếp để tránh mất liên kết lịch sử: đóng tuyển dụng, hoặc xóa các hồ sơ liên quan trước khi xóa vị trí.

Bản đồ: nhập liên kết HTTPS Google Maps. Nếu là `https://www.google.com/maps/embed...`, trang Liên hệ hiển thị bản đồ nhúng; các liên kết Google Maps khác hiển thị nút mở bản đồ.

## Cấu trúc mã nguồn

- `src/main.jsx`: React, trang khách hàng, form và quản trị.
- `src/style.css`: thiết kế responsive, màu thương hiệu và giao diện Admin.
- `server.mjs`: HTTP API, phiên đăng nhập, kiểm tra đầu vào, upload, bảo vệ file và metadata SEO.
- `db.mjs`: mở SQLite và cấu hình mặc định có nguồn.
- `schema.sql`: schema và chỉ mục database.
- `scripts/admin.mjs`: tạo/đặt lại tài khoản bằng scrypt và salt ngẫu nhiên.
- `tests/integration.test.mjs`: kiểm thử tích hợp HTTP với database và tệp riêng, tự xóa dữ liệu DEMO.
- `docs/`: phân tích hình ảnh, tham khảo, API và báo cáo kiểm thử.
- `dist/`: bản frontend đã build.
- `data/`: được tạo khi chạy ứng dụng; chứa dữ liệu vận hành, không đưa vào Git hoặc ZIP mã nguồn.

## Build và kiểm thử

```bash
npm run build
npm test
```

Các bài kiểm thử tạo dữ liệu có tiền tố **DEMO**, dùng thư mục tạm, không làm thay đổi database vận hành. Chạy build trước test để kiểm tra cả các tệp giao diện và metadata HTML. `npm run dev` khởi động cùng máy chủ với `npm start`; sau khi sửa giao diện cần `npm run build` lại. Đây là lựa chọn giữ API và frontend cùng origin, tránh cấu hình CORS cho người dùng cuối.

## Lưu trữ và bảo vệ

- SQLite là database trên đĩa thực, có WAL và foreign keys, không thay bằng bộ nhớ trình duyệt. Chọn SQLite để bản bàn giao chạy ngay, không yêu cầu tài khoản database bên ngoài. Đây là thay đổi so với lựa chọn ưu tiên MySQL/PostgreSQL trong yêu cầu; không có mã nguồn cũ để phải giữ nguyên công nghệ.
- Truy vấn tham số hóa. Mật khẩu băm scrypt với salt riêng. Token phiên ngẫu nhiên, lưu SHA-256 trong database, hết hạn sau 8 giờ; cookie HttpOnly và SameSite=Strict.
- Kiểm tra Origin cho thao tác ghi; giới hạn đăng nhập, đổi mật khẩu và gửi form theo địa chỉ IP.
- File tối đa 5 MB; kiểm tra phần mở rộng và dấu hiệu định dạng. Chặn SVG/HTML. Hồ sơ PDF/DOC/DOCX phục vụ dưới dạng attachment sau khi xác thực.
- Không có bộ quét antivirus/CDR tích hợp. Kiểm tra định dạng không thay thế quét nội dung tệp; nếu quy trình vận hành yêu cầu quét, tích hợp dịch vụ đó trước khi mở nhận hồ sơ rộng rãi.
- Nội dung bài viết được React escape, không dùng `dangerouslySetInnerHTML`. CSP chỉ cho chạy script nội bộ.
- Có thể xóa vĩnh viễn hồ sơ và file tương ứng trong Admin. Ảnh upload công khai không được xóa vật lý khi bỏ liên kết để tránh làm hỏng bài viết đang sử dụng cùng ảnh; quản lý dọn ảnh chưa dùng là tác vụ vận hành thủ công.

## Sao lưu

Dừng tiến trình trước khi sao chép toàn bộ `data/` để có bản sao nhất quán, hoặc dùng API backup của SQLite. Giữ database và `uploads/` cùng một bản sao lưu. Không công khai thư mục `data/`. Khôi phục bằng cách thay `data/` khi máy chủ đã dừng. Nếu đổi `DATA_DIR`, phải chuyển cả database và uploads sang thư mục mới.

## Triển khai máy chủ riêng

1. Chuyển mã nguồn và `dist/` đến máy chủ có Node 24; chạy `npm run admin:create` để khởi tạo tài khoản riêng.
2. Chạy `npm ci --omit=dev`, đặt `DATA_DIR` ở ổ đĩa bền vững và `SITE_URL` là tên miền thật.
3. Chạy Node bằng trình quản lý tiến trình, reverse proxy qua Caddy/Nginx; giữ Node trên 127.0.0.1 và bật HTTPS tại proxy.
4. Đặt `NODE_ENV=production`; đặt `TRUST_PROXY=1` chỉ trong mô hình một proxy tin cậy. Không mở cổng Node trực tiếp ra Internet.
5. Đăng nhập, đổi mật khẩu tạm, xác nhận nội dung và thử luồng liên hệ/upload trên HTTPS.

Không dùng hosting static-only cho bản Full-stack này. Nền tảng serverless có filesystem tạm cần chuyển database và uploads sang dịch vụ lưu trữ bền vững; không đưa SQLite vào filesystem tạm rồi kỳ vọng dữ liệu được giữ lại.

## Trạng thái bàn giao

- Có mã nguồn thực thi, schema khởi tạo database, API và chức năng quản trị đã kiểm thử HTTP. Database và tài khoản được tạo riêng trên máy chạy ứng dụng.
- Chưa có URL trực tuyến: môi trường không có các script Sites `project-setup.mjs` / `site-workflow.mjs`; không tạo Site rỗng hoặc tuyên bố đã deploy.
- Chưa kiểm thử UI bằng trình duyệt, chưa có screenshot: công cụ `cua_repl.js` của managed preview không được cung cấp. Build thành công không đồng nghĩa đã kiểm chứng hiển thị trên điện thoại.
- Ảnh được gửi trong chat đã dùng để phân tích, nhưng không có tệp ảnh trong filesystem/download pointer để nhúng vào mã nguồn. Không lấy ảnh người bảo vệ giả. Các vùng ảnh hiện ghi rõ chờ ảnh gốc; tải ảnh thật qua Admin để thay thế. Biểu tượng khi chưa có logo là ký hiệu giao diện tạm, không phải logo công ty được dựng lại.
- Ngày thành lập **25/6/2006** và người sáng lập **ông Nguyễn Duy Tư**, từng là sĩ quan nghiệp vụ trong lực lượng CAND, theo thông tin người dùng cung cấp. Tiểu sử chi tiết chờ bổ sung. Không tự đồng nhất ngày thành lập do người dùng cung cấp với ngày đăng ký trên giấy tờ.
- Không tự công bố thông tin liên hệ cũ, số liệu thành tích, hợp đồng hiện hành, mức lương hay đợt tuyển dụng. Các thông tin này cần doanh nghiệp xác nhận và nhập qua Admin.
