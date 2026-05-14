
## Mục tiêu

Trên trang chủ (`src/routes/index.tsx`), section **"Chọn cấp độ để bắt đầu 🚀"** hiện đang là grid 3 cột. Đổi thành **1 hàng trượt ngang duy nhất** với 3 trạng thái thẻ rất khác biệt về thị giác:

1. **Đang học** — thẻ nổi bật nhất, lớn hơn, có glow + viền gradient động, nhấn mạnh CTA "Học tiếp".
2. **Đã hoàn thành** — thẻ trầm hơn, tone pastel/độ bão hoà thấp, có dấu tick lớn, CTA "Xem lại".
3. **Đã khoá** — thẻ tối màu / phủ hiệu ứng mờ, ổ khoá nổi bật (nền tròn gradient + halo + dotted ring + nhãn "Sắp mở"), không click được.

## Thay đổi UI

### 1. Bố cục hàng ngang
- Thay `grid sm:grid-cols-2 lg:grid-cols-3` bằng container `overflow-x-auto` + `flex gap-5 snap-x snap-mandatory`, padding 2 bên + `scroll-pl-6`.
- Mỗi `LevelCard` set `min-w-[300px] md:min-w-[340px] snap-start`, `shrink-0`.
- Ẩn scrollbar (utility class hoặc inline `[&::-webkit-scrollbar]:hidden`), giữ scroll bằng trackpad/drag.
- Thêm 2 nút mũi tên trái/phải (chỉ hiện ở `md:`) để cuộn `±360px`. Fade-mask hai mép trái/phải bằng `mask-image: linear-gradient(...)`.
- Hiện dòng hint nhỏ "← Vuốt để xem các cấp độ khác →" ở mobile.

### 2. Phân hạng thị giác theo trạng thái

Trong `LevelCard`, thêm nhánh style theo `status`:

**`in-progress` (nổi bật nhất)**
- Card hơi to hơn: `min-w-[340px] md:min-w-[380px]`, `scale-[1.02]`.
- Viền gradient động: lớp `::before` (hoặc div absolute) dùng `background: conic-gradient(...)` quay chậm, blur nhẹ → tạo "aura".
- Shadow `shadow-glow` mặc định + tăng khi hover.
- Badge "Đang học" có chấm tròn pulse.
- Big level badge giữ gradient theo `lv.hue` + thêm ring sáng.
- CTA `Học tiếp` là button đầy màu, có icon mũi tên trượt khi hover.

**`completed`**
- Nền `bg-surface` trầm, gradient màu giảm độ bão hoà (mix với trắng/grey).
- Big level badge dùng tone xám-nhạt + dấu `CheckCircle2` lớn (kích thước to hơn hiện tại) đè ở góc.
- Progress bar 100% màu `success`.
- CTA "Xem lại" dạng `outline`/ghost, không nổi bằng "Đang học".
- Opacity tổng ~0.92 để lùi về sau so với card đang học.

**`locked` (lock đẹp hơn, bắt mắt)**
- Nền dark gradient: `linear-gradient(135deg, oklch(0.22 0.02 260), oklch(0.30 0.04 280))`, text trắng/mute.
- Lớp noise/diagonal stripes mờ (repeating-linear-gradient 8% opacity) để tạo cảm giác "khu vực chưa mở".
- Phần level code bị làm mờ (`blur-[2px]` + opacity 50%).
- Ổ khoá:
  - Vòng tròn lớn ~64px ở giữa card phía trên, gradient `oklch(0.55 0.18 ${hue})` → `oklch(0.7 0.15 ${hue+30})`.
  - Halo: 2 vòng `ring` dotted bên ngoài + blur glow màu `hue` 30% opacity.
  - Icon `Lock` size 28, white.
  - Animation: float nhẹ (translateY ±2px) + glow pulse.
- Badge nhỏ "🔒 Sắp mở" hoặc "Mở khoá khi hoàn thành {prevLevel}".
- Card không phải là `Link`, `cursor-not-allowed`, hover chỉ tăng nhẹ shadow.

### 3. Header section
- Cập nhật subtitle: nhắc người dùng có thể vuốt ngang.
- Pill "X/Y cấp đã mở" giữ nguyên, đặt cùng hàng nút điều hướng cuộn.

## Phạm vi file
- Chỉ sửa `src/routes/index.tsx` (component `LevelCard`, `StatusPill` nếu cần thêm tone, và section bao quanh).
- Có thể thêm 1-2 keyframes `@keyframes` vào `src/styles.css` cho animation halo/aura nếu chưa có sẵn (`pulse-glow`, `float-soft`).
- Không động vào dữ liệu `lms-data` hay logic khác.

## Kỹ thuật
- Tokens màu: dùng biến trong `src/styles.css` (`--success`, `--primary`, `--muted`, `--surface`, gradient theo `lv.hue` đã có).
- Scroll container dùng CSS thuần, không cần thêm thư viện.
- Đảm bảo keyboard accessible: arrow buttons có `aria-label`, các card `Link` vẫn focusable; locked card dùng `<div aria-disabled="true">`.
- Responsive: mobile hiển thị 1.1 card / màn hình (peek), tablet 2.2, desktop 3+.
