# Giao diện mới và ứng tuyển chung

Bản thay đổi đang ở nhánh riêng; chưa thay thế main.

- Thay bố cục trang chủ, giới thiệu, dịch vụ, hoạt động, tuyển dụng, liên hệ và chân trang; font Manrope lưu cùng website.
- Tuyển dụng có nhiệm vụ, yêu cầu, nội dung trao đổi về thu nhập/quyền lợi, FAQ, biểu mẫu đăng ký chung và nhận CV tùy chọn. Hồ sơ được lưu riêng trong Admin.
- 13 nhóm kiểm thử đã qua trên bản đầy đủ cục bộ, bao gồm chuyển đổi database cũ; kiểm tra render React và khởi động lại Codespaces đã qua. Chưa kiểm tra hiển thị bằng trình duyệt.

## Phần đang chờ

Các tệp JPEG chưa được đưa lên GitHub công khai. Bộ duyệt tự động yêu cầu xác nhận rõ việc công khai ảnh từ hai ZIP người dùng cung cấp. Các đường dẫn ảnh trong mã nguồn hiện chờ các tệp sau ở public/company-images/ và dist/company-images/:

1. doi-ngu-an-ninh.jpg — tập thể và rèn luyện võ thuật.
2. ho-so-an-ninh.jpg — bìa hồ sơ để hiển thị vùng logo công ty.
3. hoat-dong-va-ghi-nhan.jpg — đội ngũ tại cơ sở y tế và hoạt động tuyên dương.
4. huan-luyen-nghiep-vu.jpg — lớp và hoạt động huấn luyện.
5. muc-tieu-bao-ve.jpg — bưu điện và bệnh viện trong hồ sơ.
6. pccc-so-cap-cuu.jpg — thực hành PCCC và sơ cấp cứu.

Không đưa các trang BHXH, danh sách ngày sinh, chứng chỉ nhân viên, giấy tờ cá nhân hay đăng ký mẫu dấu lên kho công khai. Các trang ảnh được chọn không có các loại hồ sơ này. Ảnh được giữ nguyên, lựa chọn vùng hiển thị qua SVG trên giao diện; không tái tạo khuôn mặt hay nội dung bằng AI.

Sau khi được xác nhận công khai ảnh, bổ sung tài nguyên vào cùng nhánh, kiểm tra rồi cập nhật main. Không dùng nhánh này như bản triển khai hoàn chỉnh khi các tệp ảnh còn thiếu.
