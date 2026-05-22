
# Kế hoạch: Tài liệu nghiệm thu module "Khóa học"

## Đầu ra
Một file Word: `/mnt/documents/Nghiem-thu_Khoa-hoc_reap.docx`

Sinh bằng script Node + thư viện `docx`, font Arial, khổ A4, header có tên dự án "REAP", footer số trang. Sau khi tạo sẽ convert sang ảnh để QA visual rồi mới giao.

## Cấu trúc tài liệu

### 1. Trang bìa
- Tiêu đề: "BIÊN BẢN NGHIỆM THU TÍNH NĂNG"
- Phụ đề: Module Khóa học (Courses) — Vai trò Học sinh & Quản trị viên
- Dự án: REAP
- Ngày: 22/05/2026
- Phiên bản tài liệu: 1.0

### 2. Thông tin chung
- Mục đích, phạm vi nghiệm thu (chỉ module Khóa học).
- Các màn hình thuộc phạm vi:
  - `/courses` — Danh sách khóa học
  - `/levels/:level` — Khóa học theo cấp độ (A1–C2)
  - `/courses/:courseId` — Chi tiết khóa học (tabs: Tổng quan, Thành viên, Điểm, Hoạt động, Năng lực, Hỏi đáp)
- Đối tượng: Học sinh (`student`), Quản trị viên (`admin`). Giáo viên (`teacher`) chỉ xem.

### 3. Ma trận phân quyền (bảng)
Cột: Tính năng | Student | Admin
Hàng (rút từ code):
- Xem danh sách khóa học, lọc, tìm kiếm, group theo chương trình/cấp độ, đổi view grid/list
- Xem trạng thái học (Đang học/Hoàn thành/Chưa bắt đầu)
- Tạo khóa học mới (`/teacher/upload`) — chỉ Admin
- Quản lý chương trình (CategoriesManager) — chỉ Admin
- Sửa/xóa khóa học, sửa unit, sửa activity — chỉ Admin
- Tab "Thành viên" — chỉ Admin
- Tab Hỏi đáp: Student đặt câu hỏi; Admin/Teacher trả lời
- Vào học activity (video/reading/quiz) — Student
- Xem điểm, năng lực — cả hai

### 4. Mô tả tính năng theo từng màn hình
Mỗi màn hình gồm: Mục đích · Thành phần UI · Hành động chính · Sự khác biệt Student vs Admin.

4.1 Danh sách khóa học (`/courses`)
4.2 Cấp độ (`/levels/:level`)
4.3 Chi tiết khóa học (`/courses/:courseId`) — mô tả từng tab
4.4 Tạo/sửa khóa học (`/teacher/upload`) — Admin
4.5 Quản lý chương trình (dialog CategoriesManager) — Admin

### 5. Use case chính
- UC-S01: Học sinh tìm và mở khóa học đang học
- UC-S02: Học sinh hoàn thành 1 activity (video/quiz)
- UC-S03: Học sinh đặt câu hỏi trong tab Hỏi đáp
- UC-S04: Học sinh xem tiến độ và điểm
- UC-A01: Admin tạo khóa học mới với chương trình + cấp độ
- UC-A02: Admin thêm/sửa unit và activity trong khóa học
- UC-A03: Admin quản lý chương trình (thêm/sửa/xóa category)
- UC-A04: Admin trả lời câu hỏi học sinh
- UC-A05: Admin xem danh sách thành viên trong khóa học

Mỗi UC: Actor · Tiền điều kiện · Các bước · Kết quả mong đợi.

### 6. Bảng test case chi tiết (~30–40 case)
Cột: ID | Màn hình | Vai trò | Tiền điều kiện | Các bước | Kết quả mong đợi | Pass/Fail | Ghi chú

Nhóm:
- TC-CRS-01..10: Danh sách & lọc khóa học (Student)
- TC-CRS-11..18: Chi tiết khóa học – các tab (Student)
- TC-CRS-19..22: Học activity (Student)
- TC-CRS-23..28: Quản lý khóa học (Admin) — tạo/sửa/xóa, upload thumbnail
- TC-CRS-29..32: Quản lý chương trình (Admin)
- TC-CRS-33..36: Phân quyền (Student không thấy nút Admin, ngược lại)
- TC-CRS-37..40: Responsive (mobile/tablet/desktop), giao diện trống, xử lý lỗi

### 7. Tiêu chí nghiệm thu
- 100% test case Pass hoặc có giải trình & lịch fix
- Không có lỗi nghiêm trọng (blocker/critical)
- UI khớp design system (white, neutral, blue accent, Inter, 8px grid)
- Hỗ trợ mobile/tablet/desktop

### 8. Phần ký xác nhận (tuỳ chọn nhẹ, 1 bảng nhỏ cuối)
Bên giao — Bên nhận — Ngày ký.

## Quy trình triển khai (kỹ thuật)
1. `bun add -d docx` (nếu chưa có) trong /tmp scratch hoặc dùng global.
2. Viết `/tmp/build-uat-docx.mjs` sinh file vào `/mnt/documents/`.
3. Convert sang PDF + ảnh bằng LibreOffice + pdftoppm để QA từng trang.
4. Sửa overflow/clip nếu có, tái sinh.
5. Trả `<presentation-artifact>` cho user.

Bạn duyệt để tôi build chứ? Có cần thêm/bớt mục nào (ví dụ thêm phần "Môi trường test", "Dữ liệu test mẫu", hoặc bỏ phần ký) không?
