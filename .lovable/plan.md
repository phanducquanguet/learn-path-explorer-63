## Mục tiêu

Mô phỏng trải nghiệm dashboard (`/`) cho trường hợp **học viên mới chỉ đang học cấp độ A1** — chưa hoàn thành cấp nào, các cấp A2–C2 đều bị khoá. Giữ nguyên dữ liệu hiện tại để không phá demo "học viên đa cấp" đang dùng.

## Cách tiếp cận

Thêm **bộ chuyển kịch bản (scenario switcher)** ở góc trên dashboard, cho phép xem 2 persona:

1. **Học viên đa cấp** (mặc định hiện tại — đang học B1/B2, đã xong A1/A2).
2. **Học viên mới — chỉ A1** (mới).

Lý do dùng switcher thay vì sửa đè dữ liệu: bạn vẫn cần demo cho cả hai trường hợp khi trình bày.

## Persona "Học viên mới — chỉ A1"

Dữ liệu mô phỏng:

```text
A1  Đang học   Khởi đầu        ~18%   3 khoá  → "Học tiếp"
A2  Đã khoá    Sơ cấp                         "Mở khoá khi hoàn thành A1"
B1  Đã khoá    Trung cấp                      "Mở khoá khi hoàn thành A2"
B2  Đã khoá    ...                            "Mở khoá khi hoàn thành B1"
C1  Đã khoá    ...                            "Mở khoá khi hoàn thành B2"
C2  Đã khoá    ...                            "Mở khoá khi hoàn thành C1"
```

Tiến độ khoá A1:
- `A1 Foundation` — 25%
- `A1 Writing Lab` — 10%
- `A1 Listening and Reading Lab` — 0% (chưa bắt đầu)

Thẻ "Tiếp tục học" ở hero → trỏ tới `A1 Foundation`.

Thống kê tuần (`studentStats`) cho persona này:
- Tên: "Minh Khôi" (học viên mới)
- Thời gian học tuần: 95 phút / mục tiêu 300 phút
- Streak: 3 ngày
- Tỷ lệ hoàn thành: 12%
- Điểm TB: 78
- Khoá đang học: 1 • Khoá đã xong: 0
- `weeklyChart`: thấp hơn, ví dụ [20, 15, 10, 25, 10, 15, 0]

Pill ở hero điều chỉnh: bỏ "Top 12% lớp", thay bằng "Người mới bắt đầu".

## Triển khai kỹ thuật

1. `src/lib/lms-data.ts`
   - Thêm export `newcomerLevels: Level[]` — clone từ `levels` nhưng:
     - A1: `status: "in-progress"`, `progress: 18`, ba khoá progress 25/10/0.
     - A2–C2: `status: "locked"`, `progress: 0`, `courses: []`.
   - Thêm export `newcomerStats` với các số ở trên.

2. `src/routes/index.tsx`
   - Thêm `useState<"multi" | "newcomer">("multi")`.
   - Chọn nguồn dữ liệu: `const data = scenario === "newcomer" ? { levels: newcomerLevels, stats: newcomerStats, currentLevel: newcomerLevels[0], currentCourse: newcomerLevels[0].courses[0] } : ...`.
   - Thay các tham chiếu `levels`, `studentStats`, `currentLevel`, `currentCourse` bằng nguồn dữ liệu này.
   - Đặt switcher (2 nút pill) ngay trên hero, ví dụ cạnh badge "Chào mừng trở lại": **[Đa cấp]** **[Mới — chỉ A1]**.
   - Khi `scenario === "newcomer"`: badge "Top 12% lớp" đổi thành "Người mới bắt đầu", `s.activeCourses` lấy từ `newcomerStats`.

3. Không đụng `LevelCard` — component đã xử lý đúng `status: locked` (hiển thị "Đã khoá" + "Mở khoá khi hoàn thành <prev>").

## Phạm vi không đụng

- Routes con (`/levels/:level`, `/courses/:courseId`) giữ nguyên — chúng đọc qua `getLevel` / `getCourse` từ `levels` gốc; persona chỉ ảnh hưởng dashboard.
- Không sửa style, layout, hay logic LevelCard.

## Kết quả demo

Sau khi build, vào `/`, bấm nút **"Mới — chỉ A1"** → dashboard hiển thị đúng trạng thái học viên mới: 1 cấp đang học, 5 cấp khoá theo thứ tự, hero "Tiếp tục học" trỏ A1 Foundation, thống kê tuần thấp, streak 3 ngày.
