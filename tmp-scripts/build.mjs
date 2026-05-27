import {
  Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType,
  Table, TableRow, TableCell, WidthType, BorderStyle, ShadingType,
  LevelFormat, Header, Footer, PageNumber, PageBreak, PageOrientation
} from "docx";
import fs from "node:fs";

const ARIAL = "Arial";
const border = { style: BorderStyle.SINGLE, size: 4, color: "B8C2CC" };
const cellBorders = { top: border, bottom: border, left: border, right: border };

const P = (text, opts = {}) =>
  new Paragraph({
    spacing: { after: 120 },
    ...opts,
    children: [new TextRun({ text, font: ARIAL, ...opts.run })],
  });

const Runs = (runs, opts = {}) =>
  new Paragraph({
    spacing: { after: 120 },
    ...opts,
    children: runs.map(r => typeof r === "string"
      ? new TextRun({ text: r, font: ARIAL })
      : new TextRun({ font: ARIAL, ...r })),
  });

const H1 = (t) => new Paragraph({
  heading: HeadingLevel.HEADING_1,
  spacing: { before: 280, after: 160 },
  children: [new TextRun({ text: t, font: ARIAL, bold: true, size: 30, color: "0F2A4A" })],
});
const H2 = (t) => new Paragraph({
  heading: HeadingLevel.HEADING_2,
  spacing: { before: 220, after: 120 },
  children: [new TextRun({ text: t, font: ARIAL, bold: true, size: 26, color: "1A3D6B" })],
});
const H3 = (t) => new Paragraph({
  heading: HeadingLevel.HEADING_3,
  spacing: { before: 160, after: 100 },
  children: [new TextRun({ text: t, font: ARIAL, bold: true, size: 22, color: "2C5282" })],
});

const Bullet = (t) => new Paragraph({
  numbering: { reference: "bullets", level: 0 },
  spacing: { after: 60 },
  children: [new TextRun({ text: t, font: ARIAL })],
});

const cell = (text, opts = {}) => new TableCell({
  borders: cellBorders,
  width: { size: opts.width ?? 1872, type: WidthType.DXA },
  shading: opts.fill ? { fill: opts.fill, type: ShadingType.CLEAR, color: "auto" } : undefined,
  margins: { top: 90, bottom: 90, left: 120, right: 120 },
  children: (Array.isArray(text) ? text : [text]).map(t =>
    new Paragraph({
      alignment: opts.align ?? AlignmentType.LEFT,
      children: [new TextRun({ text: String(t), font: ARIAL, bold: !!opts.bold, size: opts.size ?? 20, color: opts.color })],
    })
  ),
});

const tableFromRows = (widths, header, rows) => new Table({
  width: { size: widths.reduce((a, b) => a + b, 0), type: WidthType.DXA },
  columnWidths: widths,
  rows: [
    new TableRow({
      tableHeader: true,
      children: header.map((h, i) => cell(h, { width: widths[i], bold: true, fill: "1A3D6B", color: "FFFFFF", align: AlignmentType.CENTER })),
    }),
    ...rows.map(r => new TableRow({
      children: r.map((c, i) => cell(c, { width: widths[i] })),
    })),
  ],
});

// ============== CONTENT ==============

const cover = [
  new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 2400, after: 200 },
    children: [new TextRun({ text: "REAP – UNICOM LMS", font: ARIAL, bold: true, size: 28, color: "1A3D6B" })] }),
  new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 600 },
    children: [new TextRun({ text: "BIÊN BẢN NGHIỆM THU TÍNH NĂNG", font: ARIAL, bold: true, size: 44, color: "0F2A4A" })] }),
  new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 1600 },
    children: [new TextRun({ text: "Module Lớp học – Giáo viên & Trợ giảng", font: ARIAL, size: 32, color: "2C5282" })] }),
  new Paragraph({ alignment: AlignmentType.CENTER,
    children: [new TextRun({ text: "Phiên bản: v1.0   ·   Ngày: 27/05/2026", font: ARIAL, size: 22 })] }),
  new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 120 },
    children: [new TextRun({ text: "Đơn vị phát triển: UNICOM AI Software Factory", font: ARIAL, size: 22 })] }),
  new Paragraph({ children: [new PageBreak()] }),
];

const sec1 = [
  H1("1. Thông tin chung"),
  H2("1.1 Mục đích"),
  P("Tài liệu này dùng để nghiệm thu các tính năng thuộc menu Lớp học trong hệ thống UNICOM LMS, bao gồm hai màn hình chính dành cho vai trò Giáo viên và Trợ giảng. Tài liệu mô tả phạm vi chức năng, thành phần giao diện, hành vi tương tác, ma trận phân quyền, các use case chính và bộ test case dùng để đối chiếu khi nghiệm thu."),
  H2("1.2 Phạm vi nghiệm thu"),
  Bullet("Màn hình \"Lớp học của tôi\" – danh sách toàn bộ lớp mà giáo viên/trợ giảng đang phụ trách."),
  Bullet("Màn hình \"Chi tiết lớp học\" – không gian làm việc của một lớp cụ thể với 4 tab: Tổng quan, Khóa học, Thành viên, Báo cáo học tập."),
  H2("1.3 Vai trò liên quan"),
  Bullet("Giáo viên chính (Primary Teacher): chịu trách nhiệm chính về tiến độ và điểm của lớp."),
  Bullet("Trợ giảng (Assistant): hỗ trợ giáo viên chính, có quyền xem và theo dõi."),
  Bullet("Quản trị viên: có thể truy cập với mục đích giám sát (ngoài phạm vi tài liệu này)."),
  H2("1.4 Dữ liệu mẫu sử dụng khi nghiệm thu"),
  Bullet("Lớp A1 Buổi sáng – cấp độ A1, vai trò Giáo viên chính."),
  Bullet("Lớp B1 Tăng tốc – cấp độ B1, vai trò Trợ giảng."),
  Bullet("Lớp A2 Cuối tuần – cấp độ A2, vai trò Giáo viên chính."),
];

const sec2 = [
  H1("2. Ma trận phân quyền"),
  P("Bảng dưới đây mô tả khả năng thao tác của từng vai trò trên menu Lớp học."),
  tableFromRows(
    [4200, 1700, 1700, 1760],
    ["Tính năng", "Giáo viên chính", "Trợ giảng", "Quản trị viên"],
    [
      ["Xem danh sách lớp được phân công", "Có", "Có", "Có (toàn bộ)"],
      ["Tìm kiếm, lọc theo vai trò (Chính/Trợ giảng)", "Có", "Có", "Có"],
      ["Mở chi tiết lớp – tab Tổng quan", "Có", "Có", "Có"],
      ["Xem danh sách khóa học của lớp", "Có", "Có", "Có"],
      ["Xem danh sách thành viên & tiến độ cá nhân", "Có", "Có", "Có"],
      ["Tìm kiếm thành viên trong lớp", "Có", "Có", "Có"],
      ["Xem báo cáo học tập của lớp (biểu đồ)", "Có", "Có", "Có"],
      ["Chỉnh sửa thông tin lớp / phân công", "Không", "Không", "Có"],
    ],
  ),
];

const sec3 = [
  H1("3. Mô tả chi tiết các màn hình"),

  H2("3.1 Màn hình \"Lớp học của tôi\""),
  H3("Mục đích"),
  P("Cho phép giáo viên/trợ giảng nhìn nhanh toàn bộ lớp đang phụ trách, đánh giá tình trạng học tập tổng thể và truy cập nhanh vào chi tiết từng lớp."),
  H3("Thành phần UI chính"),
  Bullet("Tiêu đề trang với số lượng lớp giáo viên chính và số lớp trợ giảng."),
  Bullet("Thanh công cụ: ô tìm kiếm theo tên lớp/cấp độ/phòng học và bộ lọc 3 nhóm (Tất cả · Giáo viên chính · Trợ giảng) kèm số đếm."),
  Bullet("Lưới thẻ lớp học (responsive 1/2/3 cột) – mỗi thẻ là một lớp."),
  Bullet("Trên mỗi thẻ: nhãn cấp độ (A1/A2/B1...), badge vai trò (Giáo viên chính/Trợ giảng), tên lớp, lịch học, phòng học, 3 chỉ số (Sĩ số / Tiến độ / Điểm TB) và biểu đồ đường mini hoạt động 7 ngày + tỉ lệ tham gia."),
  Bullet("Trạng thái rỗng: hiển thị thông báo \"Không tìm thấy lớp phù hợp\" khi bộ lọc không có kết quả."),
  H3("Hành động chính"),
  Bullet("Nhập từ khóa để lọc tức thời theo tên/cấp độ/phòng học."),
  Bullet("Chọn tab Tất cả / Giáo viên chính / Trợ giảng để lọc theo vai trò."),
  Bullet("Nhấn vào bất kỳ vị trí nào trên thẻ lớp để chuyển sang màn hình chi tiết của lớp đó."),
  H3("Khác biệt theo vai trò"),
  Bullet("Giáo viên chính: badge vàng kèm biểu tượng vương miện."),
  Bullet("Trợ giảng: badge xanh dương nhạt kèm biểu tượng hỗ trợ; số liệu hiển thị giống nhau, không có hành động chỉnh sửa."),

  H2("3.2 Màn hình \"Chi tiết lớp học\""),
  H3("Mục đích"),
  P("Cung cấp không gian làm việc đầy đủ của một lớp: thông tin chung, lộ trình khóa học, danh sách thành viên và báo cáo học tập."),
  H3("Khu vực Header"),
  Bullet("Link \"Quay lại danh sách lớp\"."),
  Bullet("Tên lớp, nhãn cấp độ, badge vai trò, lịch học, phòng học."),
  Bullet("Bộ tab điều hướng 4 mục: Tổng quan · Khóa học · Thành viên · Báo cáo học tập."),

  H3("3.2.1 Tab Tổng quan"),
  Bullet("Khối chỉ số nhanh: Sĩ số, Tiến độ trung bình, Điểm trung bình, Tỉ lệ tham gia."),
  Bullet("Biểu đồ hoạt động 7 ngày (AreaChart) – số phút học theo ngày."),
  Bullet("Tóm tắt mục tiêu lớp, ghi chú giáo viên (chỉ đọc trong phạm vi nghiệm thu)."),
  Bullet("Khối \"Học viên cần chú ý\": liệt kê tối đa 3-5 học viên có tiến độ thấp / điểm thấp."),

  H3("3.2.2 Tab Khóa học"),
  Bullet("Hiển thị danh sách khóa học thuộc cấp độ của lớp (lấy theo levelCode)."),
  Bullet("Mỗi khóa: tên khóa, mô tả ngắn, số unit, tiến độ trung bình của lớp với khóa đó."),
  Bullet("Hỗ trợ điều hướng sang trang chi tiết khóa học."),

  H3("3.2.3 Tab Thành viên"),
  Bullet("Bảng danh sách học viên với cột: Họ tên, Email, Tiến độ (%), Điểm TB, Streak/Hoạt động gần nhất, Trạng thái."),
  Bullet("Ô tìm kiếm theo tên hoặc email."),
  Bullet("Sắp xếp/lọc theo tiến độ, theo điểm, theo trạng thái (đang học/cần chú ý)."),
  Bullet("Nhấn vào hàng học viên để xem chi tiết hồ sơ học tập (mở route hồ sơ học viên nếu có)."),

  H3("3.2.4 Tab Báo cáo học tập"),
  Bullet("Biểu đồ Radar 4 kỹ năng (Nghe/Nói/Đọc/Viết) – trung bình toàn lớp."),
  Bullet("Biểu đồ cột so sánh điểm theo từng kỹ năng giữa các tuần."),
  Bullet("Biểu đồ đường xu hướng tiến độ trung bình của lớp theo thời gian."),
  Bullet("Phân phối học viên theo nhóm năng lực (Yếu / Trung bình / Khá / Giỏi)."),
  Bullet("Cho phép lọc theo khoảng thời gian (7 ngày / 30 ngày / Học kỳ)."),

  H3("Khác biệt theo vai trò"),
  Bullet("Giáo viên chính và Trợ giảng đều xem đầy đủ 4 tab với cùng dữ liệu."),
  Bullet("Trong phạm vi nghiệm thu này, cả hai vai trò chỉ có quyền xem; thao tác chỉnh sửa (đổi lịch, thêm thành viên) thuộc về Quản trị viên và không nằm trong phạm vi tài liệu."),
];

const sec4 = [
  H1("4. Use case chính"),

  H3("UC-CL01 – Tìm lớp đang phụ trách"),
  P("Tiền điều kiện: Giáo viên đã đăng nhập, vai trò là Giáo viên chính hoặc Trợ giảng."),
  P("Luồng chính:"),
  Bullet("Truy cập menu Lớp học."),
  Bullet("Nhập từ khóa hoặc chọn tab vai trò."),
  Bullet("Hệ thống lọc tức thời và hiển thị các thẻ phù hợp."),
  P("Kết quả mong đợi: Danh sách hiển thị đúng các lớp khớp với điều kiện lọc."),

  H3("UC-CL02 – Xem nhanh tình hình lớp"),
  P("Tiền điều kiện: Đã thấy lớp trong danh sách."),
  P("Luồng chính:"),
  Bullet("Quan sát 3 chỉ số trên thẻ (Sĩ số, Tiến độ, Điểm TB) và biểu đồ hoạt động 7 ngày."),
  P("Kết quả mong đợi: Nhận biết được lớp nào đang tốt, lớp nào cần can thiệp mà không cần mở chi tiết."),

  H3("UC-CL03 – Mở chi tiết lớp và xem tổng quan"),
  P("Luồng chính:"),
  Bullet("Nhấn vào thẻ lớp."),
  Bullet("Hệ thống mở màn hình chi tiết, mặc định ở tab Tổng quan."),
  Bullet("Xem các chỉ số nhanh và biểu đồ hoạt động 7 ngày."),
  P("Kết quả mong đợi: Hiển thị đúng thông tin lớp đã chọn, không lẫn dữ liệu của lớp khác."),

  H3("UC-CL04 – Xem khóa học của lớp"),
  P("Luồng chính: Chọn tab Khóa học → hệ thống hiển thị các khóa thuộc cấp độ của lớp."),
  P("Kết quả mong đợi: Khóa học đúng cấp độ, tiến độ trung bình của lớp đối với từng khóa."),

  H3("UC-CL05 – Tra cứu một học viên trong lớp"),
  P("Luồng chính: Chọn tab Thành viên → nhập tên/email vào ô tìm kiếm."),
  P("Kết quả mong đợi: Bảng lọc tức thời, hiển thị đúng học viên thuộc lớp này."),

  H3("UC-CL06 – Phân tích báo cáo học tập"),
  P("Luồng chính: Chọn tab Báo cáo học tập → quan sát biểu đồ radar 4 kỹ năng, biểu đồ xu hướng và phân phối năng lực."),
  P("Kết quả mong đợi: Các biểu đồ render đúng, dữ liệu phù hợp với lớp đang chọn."),

  H3("UC-CL07 – Phân biệt vai trò Chính / Trợ giảng"),
  P("Luồng chính: Quan sát badge và tab lọc."),
  P("Kết quả mong đợi: Badge hiển thị đúng vai trò, bộ lọc đếm đúng số lượng từng nhóm."),
];

const tc = (id, screen, role, pre, steps, expected) => [id, screen, role, pre, steps, expected, "", ""];

const sec5 = [
  H1("5. Bộ test case nghiệm thu"),
  P("Quy ước: P = Pass, F = Fail. Tester ghi kết quả thực tế vào cột Pass/Fail và ghi chú khi cần."),

  H3("5.1 Màn hình \"Lớp học của tôi\" (TC-LST)"),
  tableFromRows(
    [700, 1100, 850, 1400, 2150, 2250, 500, 796],
    ["ID", "Màn hình", "Vai trò", "Tiền điều kiện", "Các bước", "Kết quả mong đợi", "P/F", "Ghi chú"],
    [
      tc("TC-LST-01","Lớp học của tôi","GV chính","Có ≥1 lớp được phân","Mở menu Lớp học","Hiển thị danh sách thẻ lớp, đúng số lượng GV chính/Trợ giảng ở mô tả trên đầu trang"),
      tc("TC-LST-02","Lớp học của tôi","GV/Trợ giảng","Đang ở danh sách","Nhập tên lớp vào ô tìm kiếm","Danh sách lọc tức thời theo từ khóa"),
      tc("TC-LST-03","Lớp học của tôi","GV/Trợ giảng","Đang ở danh sách","Nhập cấp độ (vd \"B1\")","Chỉ các lớp cấp B1 còn lại"),
      tc("TC-LST-04","Lớp học của tôi","GV/Trợ giảng","Đang ở danh sách","Nhấn tab \"Giáo viên chính\"","Chỉ hiển thị lớp có vai trò Primary; số đếm đúng"),
      tc("TC-LST-05","Lớp học của tôi","GV/Trợ giảng","Đang ở danh sách","Nhấn tab \"Trợ giảng\"","Chỉ hiển thị lớp có vai trò Assistant; số đếm đúng"),
      tc("TC-LST-06","Lớp học của tôi","GV/Trợ giảng","Đang ở danh sách","Nhập từ khóa không khớp","Hiển thị trạng thái rỗng \"Không tìm thấy lớp phù hợp\""),
      tc("TC-LST-07","Lớp học của tôi","GV chính","Có lớp với role primary","Quan sát badge trên thẻ","Badge \"Giáo viên chính\" màu vàng + icon vương miện"),
      tc("TC-LST-08","Lớp học của tôi","Trợ giảng","Có lớp với role assistant","Quan sát badge","Badge \"Trợ giảng\" màu xanh + icon hỗ trợ"),
      tc("TC-LST-09","Lớp học của tôi","GV","Đang ở danh sách","Xem 3 chỉ số trên thẻ","Sĩ số, Tiến độ %, Điểm TB hiển thị đúng định dạng số"),
      tc("TC-LST-10","Lớp học của tôi","GV","Đang ở danh sách","Quan sát biểu đồ mini 7 ngày","Đường polyline render mượt, không vỡ layout, có chỉ số % tham gia"),
      tc("TC-LST-11","Lớp học của tôi","GV","Đang ở danh sách","Nhấn vào thẻ lớp","Chuyển sang /teacher/classes/{id}, đúng lớp đã nhấn"),
      tc("TC-LST-12","Lớp học của tôi","GV","Mobile 375px","Mở trang","Lưới chuyển 1 cột, thẻ không bị tràn nội dung"),
    ],
  ),

  H3("5.2 Chi tiết lớp – Header & điều hướng (TC-DET-H)"),
  tableFromRows(
    [700, 1100, 850, 1400, 2150, 2250, 500, 796],
    ["ID", "Màn hình", "Vai trò", "Tiền điều kiện", "Các bước", "Kết quả mong đợi", "P/F", "Ghi chú"],
    [
      tc("TC-DET-H01","Chi tiết lớp","GV","Đã mở chi tiết một lớp","Quan sát header","Tên lớp, nhãn cấp độ, badge vai trò, lịch học, phòng học hiển thị đúng dữ liệu lớp"),
      tc("TC-DET-H02","Chi tiết lớp","GV","Đã mở chi tiết","Nhấn \"Quay lại danh sách lớp\"","Quay về màn Lớp học của tôi, giữ bộ lọc trước đó"),
      tc("TC-DET-H03","Chi tiết lớp","GV","Đã mở chi tiết","Lần lượt nhấn 4 tab","Nội dung tương ứng được render, tab active có highlight"),
      tc("TC-DET-H04","Chi tiết lớp","GV","URL chứa classId không tồn tại","Truy cập trực tiếp URL","Hiển thị trang \"Không tìm thấy lớp học\" + link quay lại"),
    ],
  ),

  H3("5.3 Tab Tổng quan (TC-OVR)"),
  tableFromRows(
    [700, 1100, 850, 1400, 2150, 2250, 500, 796],
    ["ID", "Màn hình", "Vai trò", "Tiền điều kiện", "Các bước", "Kết quả mong đợi", "P/F", "Ghi chú"],
    [
      tc("TC-OVR-01","Tab Tổng quan","GV","Đang ở tab Tổng quan","Quan sát 4 KPI","Hiển thị Sĩ số, Tiến độ TB, Điểm TB, Tỉ lệ tham gia"),
      tc("TC-OVR-02","Tab Tổng quan","GV","Đang ở tab Tổng quan","Quan sát biểu đồ 7 ngày","AreaChart render đầy đủ 7 mốc, có tooltip khi hover"),
      tc("TC-OVR-03","Tab Tổng quan","GV","Lớp có học viên yếu","Xem khối \"Học viên cần chú ý\"","Liệt kê tối đa 5 học viên theo tiến độ/điểm thấp nhất"),
      tc("TC-OVR-04","Tab Tổng quan","GV","Mobile 375px","Mở tab","KPI xếp 2 cột, biểu đồ co theo chiều ngang, không bị tràn"),
    ],
  ),

  H3("5.4 Tab Khóa học (TC-COU)"),
  tableFromRows(
    [700, 1100, 850, 1400, 2150, 2250, 500, 796],
    ["ID", "Màn hình", "Vai trò", "Tiền điều kiện", "Các bước", "Kết quả mong đợi", "P/F", "Ghi chú"],
    [
      tc("TC-COU-01","Tab Khóa học","GV","Lớp có levelCode = A1","Mở tab","Chỉ hiển thị các khóa thuộc cấp độ A1"),
      tc("TC-COU-02","Tab Khóa học","GV","Đang ở tab","Quan sát thẻ khóa","Có tên khóa, mô tả ngắn, số unit, tiến độ TB của lớp"),
      tc("TC-COU-03","Tab Khóa học","GV","Đang ở tab","Nhấn vào một khóa","Chuyển sang trang chi tiết khóa học tương ứng"),
      tc("TC-COU-04","Tab Khóa học","GV","Lớp ở cấp độ không có khóa","Mở tab","Hiển thị trạng thái rỗng \"Chưa có khóa học cho cấp độ này\""),
    ],
  ),

  H3("5.5 Tab Thành viên (TC-MEM)"),
  tableFromRows(
    [700, 1100, 850, 1400, 2150, 2250, 500, 796],
    ["ID", "Màn hình", "Vai trò", "Tiền điều kiện", "Các bước", "Kết quả mong đợi", "P/F", "Ghi chú"],
    [
      tc("TC-MEM-01","Tab Thành viên","GV","Đang ở tab","Quan sát bảng","Có cột Họ tên, Email, Tiến độ, Điểm TB, Hoạt động gần nhất, Trạng thái"),
      tc("TC-MEM-02","Tab Thành viên","GV","Đang ở tab","Nhập tên vào ô tìm kiếm","Bảng lọc tức thời theo tên"),
      tc("TC-MEM-03","Tab Thành viên","GV","Đang ở tab","Nhập email","Bảng lọc tức thời theo email"),
      tc("TC-MEM-04","Tab Thành viên","GV","Đang ở tab","Sắp xếp theo Tiến độ giảm dần","Bảng được sắp xếp đúng thứ tự"),
      tc("TC-MEM-05","Tab Thành viên","GV","Đang ở tab","Nhấn vào hàng học viên","Mở hồ sơ chi tiết của học viên đó (nếu có route hồ sơ)"),
      tc("TC-MEM-06","Tab Thành viên","GV","Lớp 0 học viên","Mở tab","Hiển thị trạng thái rỗng phù hợp"),
    ],
  ),

  H3("5.6 Tab Báo cáo học tập (TC-REP)"),
  tableFromRows(
    [700, 1100, 850, 1400, 2150, 2250, 500, 796],
    ["ID", "Màn hình", "Vai trò", "Tiền điều kiện", "Các bước", "Kết quả mong đợi", "P/F", "Ghi chú"],
    [
      tc("TC-REP-01","Tab Báo cáo","GV","Đang ở tab","Quan sát radar 4 kỹ năng","Render đủ 4 trục, có nhãn Nghe/Nói/Đọc/Viết"),
      tc("TC-REP-02","Tab Báo cáo","GV","Đang ở tab","Quan sát BarChart kỹ năng theo tuần","Cột render đúng theo dữ liệu mẫu, có legend"),
      tc("TC-REP-03","Tab Báo cáo","GV","Đang ở tab","Quan sát LineChart xu hướng","Đường đi đúng, có tooltip"),
      tc("TC-REP-04","Tab Báo cáo","GV","Đang ở tab","Quan sát phân phối năng lực","4 nhóm Yếu/TB/Khá/Giỏi với số liệu cộng dồn = sĩ số lớp"),
      tc("TC-REP-05","Tab Báo cáo","GV","Đang ở tab","Đổi khoảng thời gian (7/30/Học kỳ)","Tất cả biểu đồ cập nhật theo lựa chọn"),
    ],
  ),

  H3("5.7 Phân quyền & Responsive (TC-RBAC)"),
  tableFromRows(
    [700, 1100, 850, 1400, 2150, 2250, 500, 796],
    ["ID", "Màn hình", "Vai trò", "Tiền điều kiện", "Các bước", "Kết quả mong đợi", "P/F", "Ghi chú"],
    [
      tc("TC-RBAC-01","Toàn module","Trợ giảng","Đăng nhập với role assistant","Mở danh sách và chi tiết","Không thấy thao tác chỉnh sửa lớp/thành viên"),
      tc("TC-RBAC-02","Toàn module","GV chính","Đăng nhập với role primary","Mở danh sách và chi tiết","Hiển thị đầy đủ thông tin, không có thao tác cấu hình của Admin"),
      tc("TC-RES-01","Toàn module","GV","Tablet 768px","Lướt qua các tab","Layout chuyển sang 2 cột, các biểu đồ không bị vỡ"),
      tc("TC-RES-02","Toàn module","GV","Mobile 375px","Lướt qua các tab","Cảm giác như native app: tab có scroll ngang nếu cần, không tràn nội dung"),
    ],
  ),
];

const sec6 = [
  H1("6. Tiêu chí nghiệm thu"),
  Bullet("100% test case Pass, hoặc các case Fail có giải trình kèm lịch fix được hai bên đồng thuận."),
  Bullet("Không còn lỗi mức Blocker hoặc Critical."),
  Bullet("Giao diện tuân thủ design system (typography, spacing 8px, màu chủ đạo, bo góc, shadow nhẹ)."),
  Bullet("Phân quyền hoạt động đúng ma trận tại Mục 2."),
  Bullet("Trải nghiệm trên Desktop, Tablet và Mobile mượt mà; trên mobile cảm giác như ứng dụng native."),
  Bullet("Toàn bộ chuỗi UI ở Tiếng Việt (mặc định), không hardcode để sẵn sàng i18n."),
];

const sec7 = [
  H1("7. Xác nhận nghiệm thu"),
  P("Sau khi đối chiếu toàn bộ nội dung tài liệu và kết quả test, hai bên xác nhận:"),
  tableFromRows(
    [4680, 4680],
    ["Bên giao (UNICOM AI Software Factory)", "Bên nhận (REAP)"],
    [
      ["Họ và tên: ........................................\nChức vụ: ............................................\nNgày: ..................................................\nKý tên:",
       "Họ và tên: ........................................\nChức vụ: ............................................\nNgày: ..................................................\nKý tên:"],
    ],
  ),
];

const allChildren = [
  ...cover, ...sec1, ...sec2, ...sec3, ...sec4, ...sec5, ...sec6, ...sec7,
];

const doc = new Document({
  creator: "UNICOM AI Software Factory",
  title: "Nghiệm thu module Lớp học",
  styles: {
    default: { document: { run: { font: ARIAL, size: 22 } } },
    paragraphStyles: [
      { id: "Heading1", name: "Heading 1", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { font: ARIAL, size: 30, bold: true, color: "0F2A4A" },
        paragraph: { spacing: { before: 280, after: 160 }, outlineLevel: 0 } },
      { id: "Heading2", name: "Heading 2", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { font: ARIAL, size: 26, bold: true, color: "1A3D6B" },
        paragraph: { spacing: { before: 220, after: 120 }, outlineLevel: 1 } },
      { id: "Heading3", name: "Heading 3", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { font: ARIAL, size: 22, bold: true, color: "2C5282" },
        paragraph: { spacing: { before: 160, after: 100 }, outlineLevel: 2 } },
    ],
  },
  numbering: {
    config: [{
      reference: "bullets",
      levels: [{
        level: 0, format: LevelFormat.BULLET, text: "•", alignment: AlignmentType.LEFT,
        style: { paragraph: { indent: { left: 540, hanging: 280 } } },
      }],
    }],
  },
  sections: [{
    properties: {
      page: {
        size: { width: 11906, height: 16838, orientation: PageOrientation.PORTRAIT },
        margin: { top: 1080, right: 1080, bottom: 1080, left: 1080 },
      },
    },
    headers: {
      default: new Header({ children: [new Paragraph({
        alignment: AlignmentType.RIGHT,
        children: [new TextRun({ text: "REAP – Nghiệm thu module Lớp học", font: ARIAL, size: 18, color: "6B7280" })],
      })] }),
    },
    footers: {
      default: new Footer({ children: [new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [
          new TextRun({ text: "Trang ", font: ARIAL, size: 18, color: "6B7280" }),
          new TextRun({ children: [PageNumber.CURRENT], font: ARIAL, size: 18, color: "6B7280" }),
          new TextRun({ text: " / ", font: ARIAL, size: 18, color: "6B7280" }),
          new TextRun({ children: [PageNumber.TOTAL_PAGES], font: ARIAL, size: 18, color: "6B7280" }),
        ],
      })] }),
    },
    children: allChildren,
  }],
});

const out = "/mnt/documents/Nghiem-thu_Lop-hoc_reap_v1.docx";
fs.mkdirSync("/mnt/documents", { recursive: true });
const buf = await Packer.toBuffer(doc);
fs.writeFileSync(out, buf);
console.log("OK ->", out, buf.length, "bytes");
