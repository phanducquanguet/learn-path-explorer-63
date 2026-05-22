# Kế hoạch: Tài liệu nghiệm thu module "Thi cử / Luyện thi" (theo tên màn hình UI)

## Đầu ra
File Word: `/mnt/documents/Nghiem-thu_Thi-cu_reap_v2.docx` — A4, font Arial, header "REAP – Nghiệm thu Thi cử", footer số trang. QA bằng cách convert sang ảnh từng trang.

## Điểm khác biệt so với bản trước
**Không dùng path** (`/practice`, `/teacher/exams/...`). Thay vào đó dùng **tên màn hình theo UI** mà người dùng thực sự thấy trên giao diện:

| Tên màn hình dùng trong tài liệu | Vai trò |
|---|---|
| Màn hình **"Bài luyện trên hệ thống"** | Học sinh |
| Màn hình **"Làm bài luyện tập"** (QuizRunner + tổng kết) | Học sinh |
| Màn hình **"Cổng thi chính thức"** | Học sinh |
| Màn hình **"Danh sách bài luyện thi"** | Giáo viên & Admin |
| Màn hình **"Tạo bài thi mới"** | Admin |
| Màn hình **"Chi tiết bài thi"** (tab Tổng quan / Câu hỏi) | Giáo viên & Admin |
| Màn hình **"Bài làm học viên"** (bảng + Drawer chấm bài) | Giáo viên & Admin |

## Cấu trúc tài liệu

### 1. Trang bìa
"BIÊN BẢN NGHIỆM THU TÍNH NĂNG – Module Thi cử / Luyện thi", REAP, v1.0, 22/05/2026.

### 2. Thông tin chung
Mục đích, phạm vi (liệt kê 7 màn hình theo tên UI ở trên), 3 vai trò, dữ liệu mẫu (B1 Mock Test 01, A2 Reading Practice, Listening Mini Quiz).

### 3. Ma trận phân quyền
Bảng: **Tính năng | Học sinh | Giáo viên | Admin**
- Truy cập "Bài luyện trên hệ thống" & làm bài có chấm tức thì
- Truy cập "Cổng thi chính thức" để mở bài thi ngoài
- Xem "Danh sách bài luyện thi"
- Tạo bài thi mới (Admin)
- Sửa / Xoá bài thi (Admin)
- Xem "Chi tiết bài thi"
- Xem "Bài làm học viên"
- Chấm bài tự luận (điểm 0–5 + nhận xét) – GV & Admin

### 4. Mô tả tính năng theo từng màn hình
Mỗi mục: **Mục đích · Thành phần UI chính · Hành động · Khác biệt theo vai trò**, viết theo tên màn hình UI (không có URL).

4.1 Màn hình "Bài luyện trên hệ thống" — card kỹ năng, cấp độ, thời lượng, số câu, điểm cao nhất.
4.2 Màn hình "Làm bài luyện tập" — Info screen → QuizRunner → tổng kết & đáp án chi tiết.
4.3 Màn hình "Cổng thi chính thức" — hiển thị danh sách bài thi, mở cổng thi ngoài.
4.4 Màn hình "Danh sách bài luyện thi" — 3 thẻ thống kê, card bài thi, nút theo vai trò.
4.5 Màn hình "Tạo bài thi mới" — meta + chọn kỹ năng + khối câu hỏi (đơn / Audio / Đoạn văn) + MCQ/TF/Essay + thumbnail.
4.6 Màn hình "Chi tiết bài thi" — tab Tổng quan, tab Câu hỏi.
4.7 Màn hình "Bài làm học viên" — bảng + Drawer chấm tự luận.

### 5. Use case chính
Học sinh (UC-S01..03), Giáo viên (UC-T01..03), Admin (UC-A01..03). Mô tả bằng tên màn hình UI.

### 6. Bảng test case (~45 case)
Cột: ID | Màn hình | Vai trò | Tiền điều kiện | Các bước | Kết quả mong đợi | Pass/Fail | Ghi chú.
Cột "Màn hình" ghi tên UI (vd: "Danh sách bài luyện thi", "Tạo bài thi mới"…), không ghi path.

Nhóm:
- TC-PRA-01..08: "Bài luyện trên hệ thống" & "Làm bài luyện tập" (HS)
- TC-EXM-09..12: "Cổng thi chính thức" (HS)
- TC-LST-13..18: "Danh sách bài luyện thi" (GV/Admin)
- TC-NEW-19..28: "Tạo bài thi mới" (Admin)
- TC-DET-29..34: "Chi tiết bài thi"
- TC-SUB-35..40: "Bài làm học viên" + Drawer chấm bài
- TC-RBAC-41..43: Phân quyền theo vai trò
- TC-RES-44..45: Responsive & xử lý lỗi

### 7. Tiêu chí nghiệm thu
- 100% test case Pass (hoặc có giải trình & lịch fix).
- Không lỗi blocker/critical.
- UI khớp design system.
- Phân quyền đúng ma trận mục 3.
- Mobile/tablet/desktop mượt.

### 8. Phần ký xác nhận
Bảng: Bên giao – Bên nhận – Ngày ký.

## Triển khai
1. Viết script `/tmp/build-uat-thicu-v2.mjs` (Node + `docx`).
2. Sinh `.docx` → convert sang PDF → ảnh từng trang để QA (không clip, không overflow).
3. Trả `<presentation-artifact path="Nghiem-thu_Thi-cu_reap_v2.docx" mime_type="application/vnd.openxmlformats-officedocument.wordprocessingml.document">`.

Bạn duyệt để tôi build chứ?
