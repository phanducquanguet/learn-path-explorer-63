# Kế hoạch: Chế độ Giáo viên (Teacher Mode)

## 1. Chuyển đổi vai trò
- Thêm `RoleContext` (role: "student" | "teacher") lưu ở `localStorage`.
- Trong `TopNav`, phần avatar bên phải → biến thành dropdown (avatar + tên) với lựa chọn:
  - Hồ sơ
  - **Chuyển sang giao diện Giáo viên / Học viên** (toggle)
  - Đăng xuất (mock)
- Khi role = teacher: tabs trong TopNav đổi thành: Tổng quan · Lớp học · Khóa học · Luyện thi · Tải lên.
- Khi role = student: giữ nguyên tabs hiện tại.

## 2. Dữ liệu mock cho Giáo viên (`src/lib/teacher-data.ts`)
- `classes`: 4 lớp (vd: A1-Morning, A1-Evening, A2-Weekend, B1-Fastrack), mỗi lớp gắn 1 `levelCode`, danh sách học viên (8–15 người), tiến độ TB, điểm TB, attendance.
- `students`: tên, email, lớp, lần truy cập gần nhất (ISO), vai trò ("Học viên"/"Lớp trưởng"), điểm theo unit.
- Re-use `levels` từ `lms-data.ts` cho khóa học.

## 3. Các route mới (chỉ hiện khi role=teacher)
```
src/routes/
  teacher.index.tsx          // /teacher  – Tổng quan
  teacher.classes.tsx        // /teacher/classes – DS lớp + drill-down
  teacher.classes.$classId.tsx
  teacher.upload.tsx         // /teacher/upload – Upload khóa học
  teacher.exams.tsx          // /teacher/exams – Tạo bài luyện thi
```

### 3a. Tổng quan (`/teacher`)
- Hero stats: tổng số lớp, tổng học viên, giờ giảng tuần, điểm TB.
- Grid card "Lớp của tôi" — mỗi card: tên lớp, cấp độ badge, sĩ số, progress bar TB, điểm TB, mini sparkline 7 ngày, CTA "Xem chi tiết".
- Bảng "Hoạt động học viên gần đây".

### 3b. Khóa học (re-use `/courses` + `/courses/$courseId`)
- Khi role=teacher, `CoursePage` hiển thị thêm tab **"Thành viên lớp học"** (giữa "Nội dung" và "Điểm").
  - Bảng: Avatar · Tên · **Lớp** (filter dropdown theo lớp cùng cấp độ) · Lần truy cập gần nhất · Vai trò.
  - Bộ lọc: theo lớp, theo vai trò, search tên.
- Tab **"Điểm & Năng lực"** mở rộng:
  - Toggle "Cả lớp / Từng học viên".
  - Cả lớp: bar chart điểm TB từng unit, radar 4 kỹ năng (Nghe/Nói/Đọc/Viết - mock vì đã bỏ speaking activity nhưng vẫn track skill), bảng phân phối điểm.
  - Từng học viên: chọn HS → line chart tiến trình điểm + radar cá nhân.
- Học viên (role=student): ẩn tab Thành viên (đã đúng hành vi cũ).

### 3c. Upload khóa học (`/teacher/upload`)
- Form 3 bước (Tabs/Steps):
  1. **Khóa học**: tiêu đề, mô tả, cấp độ (select A1–C2), thumbnail upload, số giờ.
  2. **Units**: list builder — thêm unit (title, mô tả, mục tiêu).
  3. **Activities** trong từng unit: chọn loại (`video`, `reading-pdf`, `quiz`) + 11 dạng bài tập:
     - Multiple choice, Fill in the blank, Matching, Drag & drop, True/False, Short answer, Reorder, Listening (audio), Cloze, Picture choice, Vocabulary card.
     - Tùy loại hiện form upload (video file/URL, PDF file, hoặc question editor).
- Lưu vào `localStorage` (mock) — preview trực tiếp trong `/courses` của giáo viên.

### 3d. Tạo bài luyện thi (`/teacher/exams`)
- Form: tên bài thi, cấp độ, thời lượng, mô tả.
- Chọn **kỹ năng tích hợp** (multi-select: Listening, Reading, Writing, Speaking, Use of English).
- Editor câu hỏi:
  - Nếu chọn nhiều kỹ năng → UI có **sidebar trái** liệt kê group theo từng kỹ năng, click vào group để soạn câu hỏi cho group đó. Mỗi group có thể thêm passage/audio chung + N câu hỏi.
  - Nếu chỉ 1 kỹ năng → 1 cột câu hỏi tuyến tính.
- Preview popup mô phỏng đúng layout học viên sẽ thấy.
- Lưu mock vào `localStorage`.

## 4. Components mới
- `src/components/RoleSwitcher.tsx` (dropdown trong TopNav).
- `src/contexts/RoleContext.tsx`.
- `src/components/teacher/ClassCard.tsx`, `ClassMembersTable.tsx`, `GradeAnalytics.tsx`.
- `src/components/teacher/CourseUploader.tsx` (3 steps).
- `src/components/teacher/ExamBuilder.tsx` (sidebar skill-groups).

## 5. Styling
Theo workspace knowledge: nền trắng, neutral grayscale, accent xanh đậm (đã có trong `styles.css` qua `--gradient-brand`), Inter font, soft shadow, rounded, 8px grid. Mobile-friendly.

## 6. Phạm vi out-of-scope (mock)
- Không cần backend/Cloud — toàn bộ upload chỉ giữ trong `localStorage` + memory state để preview.
- Không thực sự xử lý file video/PDF — chỉ giữ tên file & metadata.

---
**Khối lượng**: ~10 file mới + chỉnh sửa `TopNav`, `courses.$courseId.tsx`, `__root.tsx`. Ước tính 1 lượt build lớn.

Bạn duyệt kế hoạch này chứ? Có muốn:
- (a) Backend thật bằng Lovable Cloud (lưu khóa học/bài thi vào DB) thay vì mock localStorage?
- (b) Bỏ bớt phần nào (vd: tạm chưa làm Exam Builder)?
- (c) Đi thẳng theo plan trên?