# Kế hoạch: Tách vai trò Admin + Bổ sung Thi cử & Ngân hàng câu hỏi

## 1. Vai trò mới: `admin`
- Mở rộng `RoleContext`: `role: "student" | "teacher" | "admin"`.
- `RoleSwitcher` trong `TopNav` thêm lựa chọn **"Chuyển sang Quản trị viên"**.
- `localStorage` key giữ nguyên (`unicom.role`).

### Phân quyền
| Tính năng | Student | Teacher | Admin |
|---|---|---|---|
| Xem khóa học | ✅ | ✅ | ✅ |
| Thêm/sửa/xóa khóa học, unit, activity | ❌ | ❌ | ✅ |
| Xem Q&A học viên trong khóa học | ❌ | ✅ trả lời | ✅ trả lời |
| Tạo / sửa / xóa bài luyện thi | ❌ | ❌ | ✅ |
| Xem bài làm luyện thi của HS + giải đáp | ❌ | ✅ | ✅ |
| Quản lý Thi cử (đề thi, lịch thi, chấm bài) | ❌ | ✅ chấm | ✅ tạo + chấm |
| Ngân hàng câu hỏi | ❌ | ❌ | ✅ |
| Lớp học, Báo cáo & Phân tích | ❌ | ✅ | ✅ |

→ Giáo viên: bỏ nút **"Thêm khóa học"**, **"Tạo bài luyện thi mới"**, các nút edit nội dung khóa học. Chỉ thấy view + Q&A + chấm bài.
→ Admin: clone toàn bộ giao diện giáo viên, bật lại tất cả nút thêm/sửa/xóa và thêm các route riêng.

## 2. Khóa học — phần Hỏi đáp (Q&A)
- Trong `courses.$courseId.tsx` bổ sung tab **"Hỏi đáp"** (chỉ hiện với teacher/admin; student giữ giao diện cũ).
- Mock data `src/lib/qa-data.ts`:
  - `courseQuestions[]`: { id, courseId, unitId?, studentName, avatar, askedAt, content, answers[] }
  - `answers[]`: { id, authorName, role: "teacher"|"admin"|"student", content, answeredAt }
- UI: list câu hỏi (filter theo unit, trạng thái: chưa trả lời/đã trả lời), click để mở dialog trả lời, textarea + nút "Gửi trả lời" (lưu memory state).

## 3. Luyện thi — xem bài làm học viên
- Đổi `teacher.exams.index.tsx`:
  - Teacher: chỉ list bài luyện thi (read-only), mỗi card có nút **"Xem bài làm học viên"**.
  - Admin: thêm nút **"Tạo bài luyện thi mới"** + edit/delete.
- Route mới `teacher.exams.$examId.submissions.tsx`:
  - Bảng học viên đã nộp: tên, lớp, thời gian nộp, điểm, trạng thái (đã chấm/chờ chấm).
  - Click 1 dòng → drawer xem chi tiết: từng câu hỏi, đáp án HS, đáp án đúng, ô **"Giải đáp của giáo viên"** (textarea), nút **"Chấm điểm"** cho câu tự luận.
- Mock `src/lib/exam-submissions.ts`.

## 4. Module mới: Thi cử (Exams chính thức)
Khác với Luyện thi: đây là kỳ thi có lịch, có giám sát thời gian mở, có chấm bài.

### Routes
```
src/routes/
  teacher.tests.index.tsx          /teacher/tests   – list đề thi
  teacher.tests.$testId.tsx        – chi tiết đề thi + tab "Kết quả thi"
  teacher.tests.$testId.grade.$submissionId.tsx  – chấm bài 1 HS
  admin.tests.new.tsx              /admin/tests/new – tạo đề mới (chỉ admin)
  admin.question-bank.tsx          /admin/question-bank – ngân hàng câu hỏi (chỉ admin)
```

### Menu TopNav (teacher + admin)
Tổng quan · Lớp học · Khóa học · Luyện thi · **Thi cử** · Báo cáo & Phân tích
Admin thêm: **Ngân hàng câu hỏi**

### Đề thi (`Test`) — fields
- id, name, classIds[] (1 lớp có nhiều đề), level, duration (phút)
- openAt, closeAt (datetime — HS chỉ làm trong khoảng này)
- structure: [{ skill, type, level, count }] — vd: 2 MCQ A2 Reading + 2 Essay A2 Writing
- mode: "fixed" | "random" — random sẽ bốc từ ngân hàng theo structure
- questionIds[] (nếu fixed) hoặc generatedSeed (nếu random, mỗi HS 1 đề khác nhau cùng cấu trúc)
- stats (mock): registeredCount, submittedCount, gradingCount, avgScore

### Trang list `/teacher/tests`
Card mỗi đề: tên, lớp, level, badge trạng thái (Chưa mở / Đang mở / Đã đóng), số HS thi / tổng, ngày giờ mở, điểm TB. CTA "Xem kết quả".

### Trang chi tiết `/teacher/tests/$testId` (3 tab)
1. **Tổng quan**: thông tin đề + cấu trúc + danh sách lớp được giao + countdown nếu chưa mở.
2. **Câu hỏi**: preview các câu (admin có nút edit, teacher read-only).
3. **Kết quả thi**: bảng HS — tên, lớp, thời gian bắt đầu/nộp, điểm tự động (auto-grade phần trắc nghiệm), trạng thái chấm tự luận, nút "Chấm".

### Trang chấm `/teacher/tests/$testId/grade/$submissionId`
- Sidebar trái: list câu hỏi với badge auto/needs-grading.
- Vùng chính: đề, đáp án HS, đáp án mẫu, ô nhập điểm + nhận xét.
- Nút "Lưu & câu tiếp", "Hoàn tất chấm bài".

### Tạo đề (Admin) `/admin/tests/new` — wizard 4 bước
1. Thông tin chung: tên, lớp (multi-select), level, thời lượng, openAt/closeAt.
2. Cấu trúc đề: bảng builder — thêm dòng (skill, type, level, count). Hiển thị tổng câu, tổng điểm.
3. Mode: Fixed (chọn câu thủ công từ ngân hàng) hoặc Random (xác nhận cấu trúc — mỗi HS bốc 1 đề ngẫu nhiên cùng cấu trúc).
4. Preview + Lưu (mock localStorage).

## 5. Ngân hàng câu hỏi (Admin) `/admin/question-bank`
- Filter sidebar: kỹ năng (Listening/Reading/Writing/Speaking/Use of English), level (A1–C2), loại (MCQ, MCQ-multi, Fill, Matching, Drag, T/F, Short, Reorder, Listening, Cloze, Vocab, Essay), tag.
- Bảng câu hỏi: ID, nội dung rút gọn, kỹ năng, loại, level, điểm, ngày tạo, hành động (sửa/xóa/nhân bản).
- Nút **"Thêm câu hỏi"** → dialog form tùy theo loại (re-use editor tương tự `teacher.exams.new.tsx`).
- Mock data 60+ câu trải đều skill × level × type trong `src/lib/question-bank.ts`.

## 6. Cấu trúc dữ liệu mock mới
```
src/lib/
  qa-data.ts            # course Q&A
  exam-submissions.ts   # bài làm luyện thi của HS
  tests-data.ts         # đề thi chính thức + submissions có chấm
  question-bank.ts      # ngân hàng câu hỏi
```

## 7. Components mới
```
src/components/teacher/
  QnAList.tsx
  ExamSubmissionsTable.tsx
src/components/admin/
  TestBuilder.tsx       # wizard tạo đề
  QuestionBankTable.tsx
  QuestionEditorDialog.tsx
src/components/shared/
  GradingPanel.tsx      # dùng chung cho luyện thi & thi cử
  TestStatusBadge.tsx
```

## 8. Files thay đổi
- `src/contexts/RoleContext.tsx` — thêm "admin"
- `src/components/TopNav.tsx` — menu theo role, switcher 3 mục
- `src/components/RoleSwitcher.tsx` (nếu có)
- `src/routes/courses.$courseId.tsx` — tab Q&A, ẩn nút edit nếu không phải admin
- `src/routes/teacher.exams.index.tsx` — ẩn nút tạo nếu teacher, thêm "Xem bài làm"
- `src/routes/teacher.upload.tsx` — chuyển thành admin-only (redirect nếu teacher)
- `src/routes/teacher.exams.new.tsx` — admin-only

## 9. Phạm vi & ràng buộc
- Toàn bộ là **mock UI** trên localStorage / memory — không cần backend.
- Tuân theo design system hiện tại: white background, neutral, blue accent, soft shadow, Inter, 8px grid, mobile-friendly.
- Tiếng Việt mặc định.

---
**Khối lượng**: ~12 file mới + sửa 5 file. 1 lượt build lớn.

Bạn duyệt kế hoạch này chứ? Cần điều chỉnh gì trước khi tôi triển khai (vd: gộp Luyện thi & Thi cử, hay tách hẳn route `/admin/*` riêng biệt với `/teacher/*`)?