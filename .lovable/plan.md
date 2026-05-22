
# Kế hoạch: Tài liệu nghiệm thu module "Luyện thi"

## Đầu ra
File Word: `/mnt/documents/Nghiem-thu_Luyen-thi_reap.docx`

Sinh bằng Node + `docx`, font Arial, A4, header "REAP – Nghiệm thu Luyện thi", footer số trang. Convert sang ảnh để QA từng trang trước khi giao.

## Phạm vi
Module **Luyện thi / Bài thi** trong codebase hiện tại, gồm các màn hình:
- `/practice` — Học sinh: danh sách bài luyện trên hệ thống, làm bài có chấm tức thì (QuizRunner).
- `/exams` — Học sinh: cổng vào bài thi chính thức (mở `exam-portal.ubos.vn`).
- `/teacher/exams` — Giáo viên & Admin: danh sách bài luyện thi, thống kê.
- `/teacher/exams/new` — Admin: trình tạo bài thi (kỹ năng, khối Audio/Đoạn văn, câu hỏi, thumbnail, thời lượng).
- `/teacher/exams/:examId` — Giáo viên & Admin: chi tiết bài thi (tab Tổng quan, Câu hỏi).
- `/teacher/exams/:examId/submissions` — Giáo viên & Admin: danh sách & chấm bài làm học viên (drawer chấm điểm essay + nhận xét).

3 vai trò: **Học sinh (student)**, **Giáo viên (teacher)**, **Admin**.

## Cấu trúc tài liệu

### 1. Trang bìa
- "BIÊN BẢN NGHIỆM THU TÍNH NĂNG"
- Phụ đề: Module Luyện thi (Practice & Exams)
- Dự án: REAP — Phiên bản 1.0 — 22/05/2026.

### 2. Thông tin chung
- Mục đích nghiệm thu, phạm vi (các route ở trên).
- Định nghĩa vai trò, dữ liệu test mẫu (seed exams: B1 Mock Test 01, A2 Reading Practice, Listening Mini Quiz).

### 3. Ma trận phân quyền
Bảng cột: **Tính năng | Học sinh | Giáo viên | Admin**, hàng:
- Xem danh sách bài luyện `/practice` & làm bài có chấm tức thì
- Xem danh sách bài thi `/exams` & vào cổng thi chính thức
- Xem danh sách bài luyện thi `/teacher/exams`
- Tạo bài luyện thi mới `/teacher/exams/new` — **chỉ Admin**
- Sửa / xoá bài thi — **chỉ Admin**
- Xem chi tiết câu hỏi `/teacher/exams/:id`
- Xem danh sách bài làm `/teacher/exams/:id/submissions`
- Chấm bài essay (điểm 0–5 + nhận xét) — Giáo viên & Admin
- Quản lý hỏi đáp học viên `/teacher/qa`

### 4. Mô tả tính năng theo từng màn hình
Mỗi màn hình gồm: Mục đích · Thành phần UI chính · Hành động · Khác biệt theo vai trò.

4.1 `/practice` — Bài luyện trên hệ thống (Học sinh)
- Card kỹ năng (Nghe/Đọc/Viết/Nói/Tổng hợp), cấp độ, thời lượng, số câu, điểm cao nhất, số lượt.
- Màn hình hướng dẫn (Info) → QuizRunner → tổng kết & đáp án chi tiết.

4.2 `/exams` — Cổng thi chính thức (Học sinh)
- Hiển thị các bài thi Admin đã thiết lập; click → mở `exam-portal.ubos.vn` ở tab mới.
- Trạng thái rỗng khi chưa có bài thi.

4.3 `/teacher/exams` — Danh sách bài luyện thi (GV & Admin)
- 3 thẻ thống kê (tổng bài, tổng câu hỏi, số cấp độ phủ).
- Card bài thi: thumbnail, cấp độ, kỹ năng, số câu, thời lượng, ngày tạo.
- Nút: Xem câu hỏi / Xem bài làm / Sửa (Admin) / Xoá (Admin, ẩn hover).
- Nút "Tạo bài thi mới" chỉ hiển thị với Admin.

4.4 `/teacher/exams/new` — Trình tạo bài thi (Admin)
- Meta: tên, cấp độ (A1–C2), thời lượng, mô tả, thumbnail (upload ảnh).
- Chọn kỹ năng (Listening/Reading/Writing/Speaking), điều hướng bằng sidebar khi nhiều kỹ năng.
- Khối câu hỏi: "Câu đơn" hoặc "Khối Audio/Đoạn văn (nhiều câu)" cho Nghe/Đọc.
- Câu hỏi MCQ, True/False, Essay (Viết/Nói). Lưu xuống `localStorage` `unicom.exams`, chuyển về `/teacher/exams`.

4.5 `/teacher/exams/:examId` — Chi tiết bài thi
- Header: cấp độ, kỹ năng, thời lượng, số câu, link "Xem bài làm".
- Tab Tổng quan: Thông tin chung + phân bổ câu hỏi theo kỹ năng.
- Tab Câu hỏi: hiển thị từng khối Audio/Passage + câu hỏi (MCQ option A–D, T/F).

4.6 `/teacher/exams/:examId/submissions` — Bài làm học viên (GV & Admin)
- Bảng: Học viên · Lớp · Thời gian nộp · Thời lượng · Điểm tự động · Điểm cuối · Trạng thái (Đã chấm / Chờ chấm).
- Drawer chấm bài: hiển thị câu hỏi, bài làm, đáp án mẫu; với essay nhập điểm 0–5 + nhận xét; "Hoàn tất chấm bài" cộng điểm tự động + điểm tay → trạng thái `graded`.

### 5. Use case chính

Học sinh:
- UC-S01: Mở `/practice`, chọn bài, đọc hướng dẫn, bắt đầu làm, nhận điểm & giải thích.
- UC-S02: Mở `/exams`, chọn bài thi chính thức → mở cổng thi.
- UC-S03: Xem điểm cao nhất / số lượt đã luyện trên card.

Giáo viên:
- UC-T01: Vào `/teacher/exams` xem thống kê & danh sách.
- UC-T02: Mở chi tiết một bài thi, xem cấu trúc câu hỏi.
- UC-T03: Vào `/teacher/exams/:id/submissions`, chấm bài essay, ghi nhận xét, hoàn tất chấm.

Admin: gồm tất cả UC của Giáo viên, cộng thêm
- UC-A01: Tạo bài thi mới với 1+ kỹ năng, thêm khối Audio/Passage nhiều câu.
- UC-A02: Upload thumbnail, đặt thời lượng & cấp độ.
- UC-A03: Sửa / Xoá bài thi từ danh sách.

Mỗi UC: Actor · Tiền điều kiện · Các bước · Kết quả mong đợi.

### 6. Bảng test case chi tiết (~45 case)
Cột: ID | Màn hình | Vai trò | Tiền điều kiện | Các bước | Kết quả mong đợi | Pass/Fail | Ghi chú

Nhóm:
- TC-PRA-01..08: `/practice` — duyệt, lọc theo skill/level, info screen, QuizRunner, chấm tức thì (Học sinh).
- TC-EXM-09..12: `/exams` — danh sách, empty state, mở cổng thi tab mới (Học sinh).
- TC-LST-13..18: `/teacher/exams` — thống kê, card, ẩn/hiện nút Admin theo role, xoá có xác nhận.
- TC-NEW-19..28: `/teacher/exams/new` — meta, chọn kỹ năng, thêm câu hỏi đơn, khối Audio nhiều câu, khối Passage nhiều câu, MCQ/TF/Essay, thumbnail, validate (tên rỗng, không có câu hỏi), lưu & redirect.
- TC-DET-29..34: `/teacher/exams/:id` — tab Tổng quan, tab Câu hỏi, hiển thị Audio/Passage, đếm câu theo kỹ năng, link "Xem bài làm", trạng thái không tìm thấy.
- TC-SUB-35..40: `/teacher/exams/:id/submissions` — bảng bài làm, trạng thái Đã chấm / Chờ chấm, mở drawer, nhập điểm essay (0–5), nhập nhận xét, "Hoàn tất chấm bài" cập nhật `finalScore` & trạng thái.
- TC-RBAC-41..43: Phân quyền (Học sinh không thấy `/teacher/*`; Giáo viên không thấy nút Tạo/Sửa/Xoá; Admin thấy đầy đủ).
- TC-RES-44..45: Responsive mobile/tablet/desktop, xử lý lỗi (localStorage trống → seed, exam id không tồn tại).

### 7. Tiêu chí nghiệm thu
- 100% test case Pass hoặc có giải trình & lịch fix.
- Không có lỗi blocker/critical.
- UI khớp design system (white, neutral, blue accent, Inter, 8px grid, bo góc mềm, shadow nhẹ).
- Phân quyền đúng theo ma trận mục 3.
- Hỗ trợ mobile/tablet/desktop; mobile thao tác mượt như native.

### 8. Phần ký xác nhận
Bảng nhỏ cuối: Bên giao — Bên nhận — Ngày ký.

## Quy trình kỹ thuật triển khai
1. Viết `/tmp/build-uat-luyenthi-docx.mjs` sinh `.docx` vào `/mnt/documents/`.
2. Convert sang PDF + ảnh từng trang bằng LibreOffice + pdftoppm, kiểm tra overflow/clip.
3. Trả `<presentation-artifact path="Nghiem-thu_Luyen-thi_reap.docx" mime_type="application/vnd.openxmlformats-officedocument.wordprocessingml.document">`.

Bạn duyệt để tôi build chứ? Nếu cần thêm/bớt mục nào (vd: thêm "Dữ liệu test mẫu chi tiết", "Môi trường test", hoặc bỏ phần ký) hãy nói trước khi tôi sinh file.
