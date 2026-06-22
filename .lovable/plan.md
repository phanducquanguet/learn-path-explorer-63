## Mục tiêu
1. **Bài luyện thi (exams) dùng chung format các bước như bài thi (tests)** — thay builder 1 trang hiện tại bằng wizard 5 bước (Thông tin chung → Cấu trúc đề → Chế độ → Thiết lập đề → Xem lại) giống `admin/tests/new`.
2. **Ngân hàng câu hỏi không còn là menu riêng** — chuyển thành tab nằm bên trong trang "Luyện thi" (cho cả admin và teacher).

## Thay đổi cụ thể

### 1. Wizard tạo bài luyện thi (dùng chung với bài thi)
- Tách logic wizard hiện tại trong `src/routes/admin.tests.new.tsx` thành component dùng chung `StepBuilder` nhận prop `kind: "test" | "exam"` và `scope: "admin" | "teacher"`.
- Với `kind="exam"`:
  - Bỏ phần gán Đơn vị/Lớp và Mở/Đóng lúc (exam dùng cơ chế publish riêng).
  - Cho phép upload thumbnail + mô tả như builder cũ.
  - Khi lưu: ghi vào `unicom.exams` (admin) hoặc `unicom.teacher.exams` (teacher) theo đúng schema `SavedExam` đang dùng ở list.
- Viết lại `src/routes/admin.exams.new.tsx` và `src/routes/teacher.exams.new.tsx` để dùng `StepBuilder` với `kind="exam"`.
- Giữ nguyên hành vi role-guard: admin manage admin scope, teacher manage teacher scope.

### 2. Tab Ngân hàng câu hỏi trong trang Luyện thi
- Trang `admin/exams` và `teacher/exams` thêm thanh tab phía trên: **"Bài luyện thi" | "Ngân hàng câu hỏi"**.
- Tab "Ngân hàng câu hỏi" render lại nội dung `BankPage` (đã được scope hoá) trong cùng trang.
- Xoá entry "Ngân hàng câu hỏi" khỏi `adminTabs` và `teacherTabs` trong `TopNav.tsx`.
- Giữ route `/admin/question-bank` và `/teacher/question-bank` (redirect nhẹ về `/exams?tab=bank`) để tránh vỡ link cũ.

### 3. File ảnh hưởng
- Sửa: `src/routes/admin.tests.new.tsx` (export builder dùng chung), `src/routes/admin.exams.new.tsx`, `src/routes/teacher.exams.new.tsx`, `src/routes/admin.exams.index.tsx` (thêm tabs), `src/components/TopNav.tsx` (gỡ menu Ngân hàng).
- Có thể thêm: `src/components/ExamStepBuilder.tsx` nếu tách file gọn hơn.

## Lưu ý
- Dữ liệu exam cũ trong localStorage vẫn đọc được vì giữ nguyên key & schema `SavedExam` (name/levelCode/duration/description/thumbnail/skills/totalQuestions/groups/savedAt). Trường mới (`structure`, `mode`, …) sẽ được thêm optional.
- Không động chạm logic phê duyệt khoá học, không đổi nav học viên.
