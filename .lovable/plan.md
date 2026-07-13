## Mục tiêu

1. Cập nhật danh sách đề thi (`/admin/tests`) hiển thị đúng các trường như ảnh mẫu.
2. Thêm luồng duyệt đề: tạo đề → chờ duyệt → admin khác xem trước (chấm thử) → duyệt → tự động chuyển sang "Đã duyệt" hoặc "Đang mở" theo giờ.
3. Bộ lọc theo trạng thái.

## Thay đổi giao diện danh sách

**5 thẻ thống kê (thay cho 4 thẻ hiện tại):**
Tổng đề thi · Bản nháp / Chờ duyệt · Đang mở · Đã duyệt · Đã đóng.

**Cột bảng (theo ảnh):**
- Đề thi: tên đề · mã đề (# CODE) · dòng phụ "Lớp · Trình độ · Thời lượng"
- Đơn vị
- Lịch thi: 2 dòng — mở (xanh) / đóng (đỏ)
- Hoạt động: số lượt nộp (icon tài liệu) + số cần chấm (icon vàng)
- Trạng thái: pill màu (Bản nháp / Chờ duyệt / Đã duyệt / Đang mở / Đã đóng)
- Thao tác: mở chi tiết · xem · thêm

**Bộ lọc theo trạng thái:** thanh chip trạng thái (Tất cả / Bản nháp / Chờ duyệt / Đã duyệt / Đang mở / Đã đóng) — thay chỗ bộ lọc đơn vị hiện tại (giữ lại filter đơn vị dưới dạng dropdown gọn bên phải).

## Luồng duyệt đề

**Model:** Thêm trường `approvalStatus: "draft" | "pending" | "approved"` và `reviewedBy?`, `reviewedAt?`, `code?` vào `Test`. Trạng thái hiển thị suy ra bằng hàm mới `testDisplayStatus(t)`:

```text
approvalStatus = draft                       -> "Bản nháp"
approvalStatus = pending                     -> "Chờ duyệt"
approvalStatus = approved & now < openAt     -> "Đã duyệt"
approvalStatus = approved & open<now<close   -> "Đang mở"
approvalStatus = approved & now > closeAt    -> "Đã đóng"
```

**Trang duyệt đề `/admin/tests/:testId/review`:**
- Header: tên đề, mã đề, trạng thái hiện tại, nút "Xem như thí sinh" (mở modal QuizRunner giả lập, khi nộp sẽ hiện màn chấm bài luôn dùng lại `GradingDrawer`).
- Nút hành động: **Duyệt đề** (chuyển approvalStatus → approved, toast + quay về list), **Trả lại chỉnh sửa** (chuyển về draft, kèm ghi chú).
- Người tạo không thể tự duyệt đề mình — hiển thị disabled với tooltip (dùng `useRole` giả lập; nếu user hiện tại là admin khác thì cho phép).

**Khi tạo đề mới:** ở `admin.tests.new.tsx` sau khi lưu, mặc định `approvalStatus = "pending"` (thay vì trực tiếp active). Nếu bấm "Lưu nháp" giữ nguyên `draft`.

## Bộ lọc & sắp xếp

- Chip trạng thái ở đầu bảng (đếm theo `testDisplayStatus`).
- Filter đơn vị vẫn có nhưng gộp vào dropdown.

## Kỹ thuật

**Files sửa:**
- `src/lib/tests-data.ts`: thêm `approvalStatus`, `code`, `reviewedBy`, `reviewedAt` vào `Test`; hàm `testDisplayStatus()`; seed các trạng thái để demo (draft, pending, approved-upcoming, open, closed).
- `src/routes/admin.tests.index.tsx`: viết lại bảng theo cột mới + 5 stat + filter trạng thái + action mới ("Duyệt" cho pending).
- `src/routes/admin.tests.review.$testId.tsx` (mới): trang duyệt đề với nút Preview + Approve.
- `src/routes/admin.tests.new.tsx`: sau khi tạo set `approvalStatus="pending"` + điều hướng về list.
- Tận dụng `QuizRunner` + `GradingDrawer` sẵn có để không phát sinh code lớn.

**Không đụng:** `teacher.tests.*`, dữ liệu khác.
