export type GuideTopic = {
  id: string;
  title: string;
  purpose: string;
  conditions: string[];
  steps: string[];
  result: string;
  fallbacks: string[];
};

export type GuideModule = {
  id: string;
  order: number;
  title: string;
  summary: string;
  icon: string;
  topics: GuideTopic[];
};

/**
 * Nội dung được biên tập từ tài liệu "Hướng dẫn sử dụng REAP English — Dành cho Giáo viên" (v1.0).
 * Mỗi mục theo cùng cấu trúc: Mục đích · Điều kiện · Các bước · Kết quả · Nếu không thành công.
 */
export const guideModules: GuideModule[] = [
  {
    id: "bat-dau",
    order: 1,
    title: "Bắt đầu sử dụng",
    summary: "Cách tra cứu tài liệu, đăng nhập vào không gian Giáo viên và đăng xuất an toàn.",
    icon: "rocket",
    topics: [
      {
        id: "cach-su-dung-tai-lieu",
        title: "Cách sử dụng tài liệu",
        purpose:
          "Giúp bạn tra cứu nhanh một thao tác và biết cần làm gì trước, trong và sau thao tác đó.",
        conditions: [
          "Bạn đang sử dụng tài khoản Giáo viên hợp lệ.",
          "Bạn có thể mở tài liệu trên máy tính hoặc thiết bị di động.",
        ],
        steps: [
          "Tìm mục gần nhất với công việc bạn muốn thực hiện.",
          "Đọc phần Điều kiện để kiểm tra tài khoản, lớp học, khóa học hoặc thời gian áp dụng.",
          "Thực hiện lần lượt các bước và đối chiếu phần Kết quả.",
          "Nếu kết quả khác dự kiến, làm theo phần Nếu không thành công trước khi liên hệ hỗ trợ.",
        ],
        result:
          "Bạn hoàn thành thao tác theo đúng trình tự và biết cách xử lý bước đầu khi gặp vướng mắc.",
        fallbacks: [
          "Nếu không tìm thấy đúng mục, chọn luồng gần nhất trong danh sách module.",
          "Nếu tài khoản không có khu vực được mô tả, kiểm tra lại vai trò hoặc liên hệ quản trị viên.",
        ],
      },
      {
        id: "dang-nhap",
        title: "Đăng nhập và vào không gian dành cho Giáo viên",
        purpose: "Vào đúng giao diện làm việc và bắt đầu công việc giảng dạy.",
        conditions: [
          "Bạn có tài khoản Giáo viên đang hoạt động.",
          "Thiết bị có kết nối mạng ổn định và trình duyệt được cập nhật.",
        ],
        steps: [
          "Mở trang đăng nhập thông qua đường dẫn được cấp.",
          "Nhập tên đăng nhập và mật khẩu, sau đó chọn Đăng nhập.",
          "Chờ hệ thống mở Trang tổng quan.",
          "Kiểm tra menu có các khu vực Tổng quan, Lớp học, Khóa học, Bài tập, Chấm thi và Báo cáo.",
        ],
        result:
          "Bạn nhìn thấy không gian làm việc dành cho Giáo viên và dữ liệu thuộc lớp đang phụ trách.",
        fallbacks: [
          "Kiểm tra cách viết tên đăng nhập, mật khẩu và trạng thái bàn phím trước khi thử lại.",
          "Nếu đăng nhập được nhưng không có menu Giáo viên, đăng xuất rồi đăng nhập lại một lần.",
          "Nếu tài khoản vẫn không đúng phạm vi, liên hệ quản trị viên để kiểm tra lớp được phân công.",
        ],
      },
      {
        id: "dang-xuat",
        title: "Đăng xuất và bảo vệ tài khoản",
        purpose: "Kết thúc phiên làm việc an toàn, đặc biệt khi dùng máy tính dùng chung.",
        conditions: ["Bạn đang đăng nhập vào hệ thống."],
        steps: [
          "Lưu các nội dung đang chỉnh sửa hoặc chấm điểm.",
          "Mở menu tài khoản ở góc trên bên phải.",
          "Chọn Đăng xuất và chờ hệ thống quay về trang đăng nhập.",
          "Đóng các tệp đã tải xuống nếu thiết bị không thuộc quyền sử dụng riêng của bạn.",
        ],
        result: "Phiên làm việc kết thúc, người dùng tiếp theo không thể dùng tiếp tài khoản của bạn.",
        fallbacks: [
          "Nếu nút Đăng xuất chưa phản hồi, kiểm tra mạng rồi thử lại.",
          "Nếu đã rời máy mà chưa đăng xuất, đổi mật khẩu hoặc nhờ quản trị viên khóa phiên cũ.",
        ],
      },
    ],
  },
  {
    id: "tong-quan",
    order: 2,
    title: "Trang tổng quan và điều hướng",
    summary: "Đọc các chỉ số nhanh, đi đúng khu vực từ menu và quay lại công việc đang làm.",
    icon: "dashboard",
    topics: [
      {
        id: "doc-chi-so",
        title: "Đọc các chỉ số trên Trang tổng quan",
        purpose: "Nắm nhanh tình hình lớp học trước khi đi vào từng màn hình chi tiết.",
        conditions: ["Bạn đã đăng nhập bằng tài khoản Giáo viên."],
        steps: [
          "Mở Tổng quan.",
          "Đọc các thẻ tóm tắt về số lớp, số học viên, khóa học và hoạt động gần đây.",
          "Xem khu vực Học viên cần hỗ trợ để nhận biết người có tiến độ hoặc điểm số thấp.",
          "Xem Học viên nổi bật và Hoạt động gần đây để theo dõi mức độ tham gia.",
          "Chọn một thẻ hoặc dòng dữ liệu để mở đúng lớp hay học viên cần xem sâu hơn.",
        ],
        result: "Bạn xác định được việc cần ưu tiên trong ngày và đi thẳng đến dữ liệu liên quan.",
        fallbacks: [
          "Nếu một chỉ số bằng 0, kiểm tra bộ lọc lớp hoặc thời gian trước khi kết luận chưa có dữ liệu.",
          "Nếu toàn bộ Trang tổng quan trống, tải lại trang và kiểm tra bạn còn được phân công lớp hay không.",
        ],
      },
      {
        id: "dieu-huong",
        title: "Đi đến đúng khu vực từ menu Giảng dạy",
        purpose: "Chọn đúng màn hình cho công việc cần làm, tránh chỉnh nhầm nội dung.",
        conditions: ["Menu Giảng dạy đang hiển thị trên thanh điều hướng."],
        steps: [
          "Chọn Lớp học khi cần xem danh sách lớp, học viên, khóa học và báo cáo lớp.",
          "Chọn Lớp trực tuyến khi cần đặt lịch, vào phòng học hoặc xem bản ghi.",
          "Chọn Khóa học khi cần dạy hoặc xây dựng khóa học.",
          "Chọn Hỏi đáp học viên khi cần đọc và trả lời câu hỏi.",
        ],
        result: "Màn hình đúng công việc được mở, dữ liệu giới hạn theo các lớp bạn phụ trách.",
        fallbacks: [
          "Nếu một mục không xuất hiện, kiểm tra tài khoản đang dùng là Giáo viên hay Trợ giảng.",
          "Nếu mục có xuất hiện nhưng không tải được dữ liệu, thử tải lại và chọn lại lớp.",
        ],
      },
      {
        id: "quay-lai-cong-viec",
        title: "Quay lại công việc đang làm",
        purpose: "Tiếp tục nhanh một lớp, buổi học trực tuyến, bài tập hoặc báo cáo học tập.",
        conditions: ["Bạn đã từng mở nội dung liên quan hoặc Trang tổng quan có hoạt động gần đây."],
        steps: [
          "Mở Tổng quan và tìm Hoạt động gần đây hoặc thẻ lớp tương ứng.",
          "Chọn lớp cần tiếp tục.",
          "Dùng các nút thao tác nhanh để đặt lịch buổi học hoặc tạo bài tập.",
        ],
        result: "Bạn quay lại đúng đối tượng đang xử lý mà không cần tìm lại từ đầu.",
        fallbacks: [
          "Nếu hoạt động cũ không còn, dùng menu chính và bộ lọc để tìm theo tên.",
          "Nếu đối tượng đã bị ẩn hoặc không còn thuộc lớp được giao, không tạo bản sao; xác minh với quản trị viên.",
        ],
      },
    ],
  },
  {
    id: "lop-hoc",
    order: 3,
    title: "Quản lý lớp học và học viên",
    summary: "Mở lớp được phân công, xem khóa học, thành viên và báo cáo học tập của lớp.",
    icon: "users",
    topics: [
      {
        id: "danh-sach-lop",
        title: "Mở danh sách lớp được phân công",
        purpose: "Tìm đúng lớp mà bạn đang giảng dạy hoặc hỗ trợ.",
        conditions: ["Bạn đang là thành viên hoạt động của ít nhất một lớp."],
        steps: [
          "Mở Giảng dạy, sau đó chọn Lớp học.",
          "Dùng ô tìm kiếm hoặc bộ lọc nếu danh sách có nhiều lớp.",
          "Đối chiếu tên lớp, cấp độ, số học viên và trạng thái hiển thị.",
          "Chọn lớp cần làm việc.",
        ],
        result:
          "Trang chi tiết lớp mở đúng lớp với các phần Tổng quan, Khóa học, Thành viên, Báo cáo học tập và Thống kê.",
        fallbacks: [
          "Nếu không thấy lớp, xóa bộ lọc và tải lại danh sách.",
          "Nếu lớp vẫn không xuất hiện, kiểm tra thời gian phân công hoặc liên hệ quản trị viên.",
        ],
      },
      {
        id: "khoa-hoc-cua-lop",
        title: "Xem tổng quan và khóa học của lớp",
        purpose: "Nắm tình hình học tập chung và các khóa học đang áp dụng cho lớp.",
        conditions: ["Bạn đã mở một lớp thuộc phạm vi được phân công."],
        steps: [
          "Mở phần Tổng quan để xem số học viên, mức tiến độ và các chỉ số chính.",
          "Chuyển sang phần Khóa học để xem các khóa đang được gán cho lớp.",
          "Chọn một khóa học để xem tiến độ, điểm và tình trạng tham gia của lớp.",
          "Đối chiếu dữ liệu với kế hoạch giảng dạy hiện tại.",
        ],
        result: "Bạn biết lớp đang học khóa nào và mức độ hoàn thành chung của từng khóa.",
        fallbacks: [
          "Nếu lớp chưa có khóa học, kiểm tra cấp độ của lớp và trạng thái xuất bản của khóa.",
          "Nếu số liệu chưa cập nhật, tải lại trang sau khi học viên hoàn thành hoạt động.",
        ],
      },
      {
        id: "thanh-vien",
        title: "Xem danh sách học viên và trạng thái thành viên",
        purpose: "Kiểm tra ai đang tham gia lớp trước khi giao bài, chấm điểm hoặc hỗ trợ.",
        conditions: ["Bạn đã mở trang chi tiết lớp."],
        steps: [
          "Chọn phần Thành viên.",
          "Tìm học viên theo tên hoặc thông tin hiển thị.",
          "Mở hồ sơ hoặc báo cáo học tập của học viên khi cần xem chi tiết.",
        ],
        result: "Bạn xác nhận được học viên đang thuộc lớp và tiếp tục các công việc liên quan.",
        fallbacks: [
          "Nếu một học viên không xuất hiện, kiểm tra đang mở đúng lớp và đã xóa bộ lọc.",
          "Không tự thêm hoặc thay đổi thành viên nếu tài khoản không có chức năng đó.",
        ],
      },
      {
        id: "bao-cao-lop",
        title: "Xem báo cáo học tập và thống kê lớp",
        purpose: "Phát hiện học viên cần hỗ trợ và nội dung có kết quả thấp.",
        conditions: ["Lớp đã có học viên và có hoạt động học tập phát sinh dữ liệu."],
        steps: [
          "Mở Báo cáo học tập để xem tiến độ, điểm và mức độ hoàn thành theo học viên.",
          "Mở Thống kê khóa học để xem kết quả tổng hợp theo khóa và hoạt động.",
          "Ghi nhận học viên chưa học, tiến độ thấp hoặc điểm thấp để lên kế hoạch hỗ trợ.",
          "Mở lại bài tập, khóa học hoặc Hỏi đáp học viên khi cần hành động tiếp theo.",
        ],
        result: "Bạn có danh sách ưu tiên hỗ trợ dựa trên dữ liệu của đúng lớp được giao.",
        fallbacks: [
          "Nếu báo cáo trống, kiểm tra lớp đã có khóa học và học viên đã phát sinh hoạt động chưa.",
          "Nếu dữ liệu có vẻ thuộc lớp khác, quay lại danh sách lớp và kiểm tra tên lớp.",
        ],
      },
    ],
  },
  {
    id: "bai-tap",
    order: 4,
    title: "Bài tập, lớp trực tuyến và trao đổi",
    summary:
      "Giao và theo dõi bài tập, gia hạn, chấm điểm, đặt lịch lớp trực tuyến và trả lời hỏi đáp.",
    icon: "clipboard",
    topics: [
      {
        id: "tao-bai-tap",
        title: "Tạo và giao bài tập",
        purpose: "Giao một yêu cầu tự luận hoặc bài nộp tệp cho một hay nhiều lớp.",
        conditions: [
          "Bạn phụ trách lớp nhận bài.",
          "Các lớp được chọn có khóa học phù hợp và hạn nộp nằm trong tương lai.",
        ],
        steps: [
          "Tại thanh menu, chọn Bài tập, sau đó chọn Tạo bài tập.",
          "Nhập tên bài, đề bài, hướng dẫn và đính kèm tệp hướng dẫn nếu cần.",
          "Chọn lớp, khóa học và đơn vị bài học liên quan.",
          "Đặt điểm tối đa và hạn nộp.",
          "Kiểm tra lại toàn bộ thông tin rồi chọn Tạo & giao bài.",
        ],
        result: "Bài tập xuất hiện trong danh sách của Giáo viên và của học viên thuộc các lớp đã chọn.",
        fallbacks: [
          "Nếu các lớp không có khóa học chung, chọn lại lớp theo cùng khóa học.",
          "Nếu hạn nộp hoặc điểm tối đa không hợp lệ, sửa theo thông báo trên màn hình.",
          "Nếu lưu thất bại, giữ nguyên nội dung, thử lại một lần và kiểm tra danh sách để tránh trùng bài.",
        ],
      },
      {
        id: "theo-doi-nop-bai",
        title: "Theo dõi tình trạng nộp bài",
        purpose: "Biết học viên nào chưa nộp, đã nộp, cần nộp lại hoặc đã được chấm.",
        conditions: ["Bài tập đã được giao và bạn đang phụ trách lớp liên quan."],
        steps: [
          "Mở danh sách Bài tập và tìm bài cần theo dõi.",
          "Dùng bộ lọc trạng thái hoặc ô tìm kiếm học viên.",
          "Mở bài nộp của một học viên để đọc câu trả lời, xem tệp và lịch sử các lần nộp.",
          "Đối chiếu thời gian nộp với hạn nộp hiệu lực.",
        ],
        result: "Bạn phân loại được bài chưa nộp, chờ chấm, cần nộp lại và đã chấm.",
        fallbacks: [
          "Nếu danh sách trống, kiểm tra đúng bài tập và lớp.",
          "Nếu tệp không mở được, thử Tải xuống; nếu vẫn lỗi, đề nghị học viên kiểm tra lại tệp nộp.",
        ],
      },
      {
        id: "gia-han",
        title: "Yêu cầu nộp lại hoặc gia hạn",
        purpose: "Cho học viên cơ hội sửa bài hoặc có thêm thời gian khi có lý do phù hợp.",
        conditions: [
          "Học viên đã nộp bài và bài chưa bị khóa bởi điểm cuối cùng.",
          "Bạn đã xác định rõ nội dung cần sửa hoặc thời gian gia hạn.",
        ],
        steps: [
          "Mở bài nộp của học viên trong phần theo dõi.",
          "Tích chọn học viên cần gia hạn.",
          "Đặt hạn nộp lại (mặc định 1 ngày kể từ thời điểm gia hạn).",
          "Chọn Gia hạn để cập nhật thời gian nộp cho học viên.",
        ],
        result: "Trạng thái bài được cập nhật, học viên nhìn thấy nhận xét cùng hạn nộp mới.",
        fallbacks: [
          "Không yêu cầu nộp lại sau khi bài đã được chấm khóa; khi cần, sửa điểm hoặc thống nhất quy trình với quản trị viên.",
          "Nếu hạn mới không hợp lệ, chọn thời điểm muộn hơn hạn hiện tại.",
        ],
      },
      {
        id: "cham-bai-tap",
        title: "Chấm bài tập và sửa điểm",
        purpose: "Ghi điểm và phản hồi cho bài tập do học viên nộp.",
        conditions: ["Học viên đã nộp hoặc nộp lại bài và bài đang cho phép chấm."],
        steps: [
          "Mở danh sách học viên đã nộp, chọn học viên rồi chọn Chấm bài.",
          "Đọc câu trả lời, mở tệp đính kèm và xem lịch sử nếu có nhiều lượt nộp.",
          "Nhập điểm trong thang điểm của bài và viết nhận xét rõ ràng.",
          "Chọn Lưu điểm, sau đó mở lại dòng học viên để xác nhận.",
          "Nếu cần điều chỉnh, chọn Sửa điểm, cập nhật rồi lưu lại.",
        ],
        result: "Bài chuyển sang trạng thái Đã chấm và học viên xem được điểm cùng nhận xét.",
        fallbacks: [
          "Nếu điểm ngoài khoảng cho phép, sửa về giá trị từ 0 đến điểm tối đa.",
          "Nếu bài đang ở trạng thái cần nộp lại, chờ học viên nộp lượt mới trước khi chấm.",
        ],
      },
      {
        id: "dat-lich-truc-tuyen",
        title: "Đặt lịch lớp học trực tuyến",
        purpose: "Tạo một buổi học trực tiếp hoặc một lịch lặp cho lớp phụ trách.",
        conditions: [
          "Lớp đã có khóa học phù hợp.",
          "Ngày giờ bắt đầu, thời lượng và quy tắc lặp đã được thống nhất.",
        ],
        steps: [
          "Mở Lớp trực tuyến và chọn Đặt lịch buổi học mới.",
          "Nhập tiêu đề, chọn lớp và chọn khóa học.",
          "Đặt ngày giờ bắt đầu, thời lượng và khoảng thời gian cho phép vào lớp.",
          "Nếu cần lặp lịch, chọn kiểu lặp, ngày trong tuần và ngày kết thúc hoặc số buổi.",
          "Nhập chủ đề, chọn ghi hình và gửi thông báo cho học viên.",
          "Chọn Tạo buổi học và kiểm tra lịch vừa tạo.",
        ],
        result: "Buổi học xuất hiện trong Lịch giảng dạy và học viên thuộc lớp nhìn thấy lịch tương ứng.",
        fallbacks: [
          "Nếu lớp chưa có khóa học để gắn lịch, chọn lớp khác hoặc đề nghị quản trị viên gán khóa học.",
          "Nếu lịch lặp báo thiếu thông tin, chọn ít nhất một ngày và nhập ngày kết thúc hoặc số buổi.",
        ],
      },
      {
        id: "vao-phong-hoc",
        title: "Vào phòng và giảng dạy trực tuyến",
        purpose: "Bắt đầu hoặc tiếp tục một buổi học trực tiếp với đúng lớp.",
        conditions: [
          "Buổi học đang trong thời gian cho phép vào phòng.",
          "Trình duyệt được cho phép dùng micro, camera và chia sẻ màn hình khi cần.",
        ],
        steps: [
          "Mở Lớp trực tuyến và chọn Bắt đầu giảng hoặc Tiếp tục giảng.",
          "Kiểm tra tên buổi, lớp và trạng thái phòng trước khi vào.",
          "Cho phép thiết bị dùng micro và camera, kiểm tra âm thanh hình ảnh.",
          "Vào phòng, sử dụng trò chuyện và chia sẻ màn hình theo nội dung buổi học.",
          "Theo dõi danh sách người tham gia và quyền micro, camera hoặc chia sẻ.",
          "Khi kết thúc, dùng thao tác kết thúc của Giáo viên và xác nhận.",
        ],
        result: "Buổi học diễn ra trong đúng phòng; trạng thái tham gia và bản ghi được xử lý theo cấu hình.",
        fallbacks: [
          "Nếu quá sớm hoặc quá muộn, đọc thời gian Có thể vào lớp và thử lại trong khoảng cho phép.",
          "Nếu trình duyệt chặn thiết bị, mở quyền micro/camera trong cài đặt trang rồi vào lại.",
          "Nếu mất kết nối, rời phòng, kiểm tra mạng và chọn Tiếp tục giảng để vào lại.",
        ],
      },
      {
        id: "sua-buoi-hoc",
        title: "Sửa, tạm khóa hoặc hủy một buổi trực tuyến",
        purpose: "Điều chỉnh lịch khi kế hoạch thay đổi mà không tạo nhầm buổi trùng.",
        conditions: ["Buổi học thuộc lớp bạn phụ trách và chưa ở trạng thái kết thúc không thể thay đổi."],
        steps: [
          "Mở Lịch giảng dạy và chọn buổi cần xử lý.",
          "Đọc trạng thái hiện tại và kiểm tra đây là buổi riêng hay thuộc lịch lặp.",
          "Chọn chỉnh sửa để đổi thông tin cho đúng phạm vi được hỏi trên màn hình.",
          "Chọn tạm khóa khi muốn ngăn vào phòng nhưng vẫn giữ lịch, hoặc chọn hủy khi buổi không diễn ra.",
          "Nhập lý do nếu được yêu cầu và xác nhận thao tác.",
          "Kiểm tra trạng thái mới và thông báo tới học viên.",
        ],
        result: "Lịch được cập nhật đúng buổi hoặc đúng chuỗi buổi đã chọn, không phát sinh lịch trùng.",
        fallbacks: [
          "Nếu không chắc thao tác áp dụng cho một buổi hay cả chuỗi, hủy hộp thoại và kiểm tra lại.",
          "Nếu buổi đã kết thúc, không tạo lại chỉ để sửa lịch sử; tạo buổi mới khi cần học bù.",
        ],
      },
      {
        id: "hoi-dap",
        title: "Đọc và trả lời câu hỏi của học viên",
        purpose: "Phản hồi câu hỏi phát sinh từ các khóa học bạn đang phụ trách.",
        conditions: ["Bạn đang phụ trách lớp hoặc khóa học có câu hỏi."],
        steps: [
          "Mở Hỏi đáp học viên.",
          "Lọc theo khóa học hoặc chọn Chưa trả lời.",
          "Chọn một câu hỏi và đọc đầy đủ nội dung cùng các phản hồi trước đó.",
          "Nhập câu trả lời rõ ràng, tránh thông tin không liên quan.",
          "Chọn Gửi trả lời và kiểm tra trạng thái chuyển sang Đã trả lời.",
        ],
        result: "Học viên nhận được phản hồi và câu hỏi được ghi nhận trong lịch sử trao đổi.",
        fallbacks: [
          "Nếu gửi thất bại, giữ nội dung đang soạn, kiểm tra mạng rồi thử lại.",
          "Nếu không thấy câu hỏi, xóa bộ lọc, chọn Tất cả khóa học và cập nhật lại danh sách.",
        ],
      },
    ],
  },
  {
    id: "khoa-hoc",
    order: 5,
    title: "Quản lý và xây dựng khóa học",
    summary: "Tạo khóa, tổ chức Unit, gửi duyệt, theo dõi kết quả duyệt và xử lý khóa bị từ chối.",
    icon: "book",
    topics: [
      {
        id: "trang-thai-khoa",
        title: "Tìm và đọc trạng thái khóa học",
        purpose:
          "Xác định khóa nào có thể sửa, khóa nào đang chờ duyệt và khóa nào học viên đã nhìn thấy.",
        conditions: ["Bạn đã mở Giảng dạy, chọn Khóa học."],
        steps: [
          "Dùng tìm kiếm và bộ lọc cấp độ, chương trình, trạng thái hoặc nguồn khóa học.",
          "Đọc nhãn Bản nháp, Chờ duyệt, Bị từ chối hoặc Đã xuất bản trên thẻ khóa học.",
          "Mở khóa học để xem chi tiết trước khi chọn thao tác.",
          "Chỉ chỉnh sửa khóa do chính bạn tạo và đang ở trạng thái cho phép chỉnh sửa.",
        ],
        result: "Bạn chọn đúng khóa học và biết bước tiếp theo phù hợp với trạng thái hiện tại.",
        fallbacks: [
          "Nếu không tìm thấy khóa, xóa bộ lọc và tìm lại theo một phần tên khóa.",
          "Nếu khóa thuộc hệ thống hoặc do người khác tạo, chỉ xem trong phạm vi được hiển thị.",
        ],
      },
      {
        id: "tao-khoa",
        title: "Tạo thông tin khóa học mới",
        purpose: "Khởi tạo một khóa học do Giáo viên biên soạn.",
        conditions: [
          "Bạn đang dùng tài khoản Giáo viên.",
          "Bạn đã xác định tên, chương trình, cấp độ, thời lượng và mục tiêu khóa học.",
        ],
        steps: [
          "Trong danh sách Khóa học, chọn Tạo khóa học.",
          "Ở bước Thông tin khóa, nhập tên, phụ đề hoặc mô tả ngắn.",
          "Chọn chương trình và ít nhất một cấp độ; cấp độ đầu tiên là cấp độ chính.",
          "Nhập số giờ học, mô tả chi tiết và ảnh đại diện nếu có.",
          "Kiểm tra các trường bắt buộc rồi chọn Lưu và tiếp tục.",
        ],
        result: "Thông tin nền của khóa học được lưu và bạn có thể chuyển sang xây dựng Units.",
        fallbacks: [
          "Nếu hệ thống báo thiếu tên, chương trình hoặc cấp độ, bổ sung trường tương ứng.",
          "Nếu rời trang khi chưa lưu, chọn Tiếp tục chỉnh sửa để quay lại hoàn tất.",
        ],
      },
      {
        id: "to-chuc-unit",
        title: "Tổ chức Units và mục tiêu học tập",
        purpose: "Chia khóa học thành các phần có thứ tự rõ ràng trước khi thêm hoạt động.",
        conditions: ["Bước Thông tin khóa đã được lưu."],
        steps: [
          "Mở bước Units và chọn Thêm Unit.",
          "Nhập tên Unit và mục tiêu học tập ngắn gọn.",
          "Thêm ảnh bìa nếu cần; chỉ bật Chỉ dành cho giáo viên với nội dung không dành cho học viên.",
          "Lặp lại cho các Unit còn lại theo thứ tự học.",
          "Lưu từng thay đổi trước khi chuyển bước.",
        ],
        result: "Khóa học có ít nhất một Unit và cấu trúc đủ rõ để thêm hoạt động.",
        fallbacks: [
          "Nếu không chuyển được bước, kiểm tra còn Unit nào đang chỉnh sửa chưa lưu.",
          "Nếu xóa Unit đã có nội dung, đọc kỹ cảnh báo vì các hoạt động bên trong có thể bị xóa theo.",
        ],
      },
      {
        id: "them-hoat-dong-nhap",
        title: "Thêm hoạt động và lưu bản nháp",
        purpose: "Hoàn thiện nội dung học tập trước khi phân phối khóa cho lớp.",
        conditions: ["Khóa học đã có ít nhất một Unit."],
        steps: [
          "Mở bước Activities và chọn Unit cần thêm nội dung.",
          "Chọn dấu thêm, chọn loại hoạt động phù hợp và nhập tên hoạt động.",
          "Soạn nội dung, câu hỏi, tệp hoặc liên kết theo biểu mẫu của loại đã chọn.",
          "Lưu hoạt động, sau đó dùng Xem trước để kiểm tra trải nghiệm học viên.",
          "Sắp xếp lại hoạt động theo trình tự học.",
          "Chọn Lưu khóa học hoặc Lưu và tiếp tục để giữ ở Bản nháp.",
        ],
        result: "Bản nháp chứa đầy đủ thông tin, Units và hoạt động, sẵn sàng sang bước Phân phối.",
        fallbacks: [
          "Nếu không sang được Phân phối, kiểm tra từng bước đã lưu và có ít nhất một hoạt động.",
          "Nếu một hoạt động lỗi khi xem trước, sửa hoạt động đó trước khi gửi duyệt.",
        ],
      },
      {
        id: "gui-duyet",
        title: "Chọn lớp và Gửi duyệt",
        purpose: "Đề nghị quản trị viên phê duyệt khóa học cho đúng các lớp mục tiêu.",
        conditions: [
          "Khóa học đang ở Bản nháp và đã có nội dung hợp lệ.",
          "Bạn được phân công hoạt động tại lớp cùng cấp độ với khóa học.",
        ],
        steps: [
          "Mở bước Phân phối.",
          "Chọn lớp cần áp dụng; học viên ở lớp khác sẽ không nhìn thấy khóa.",
          "Đọc lại số lớp đã chọn và thông tin cấp độ của từng lớp.",
          "Nhập lời nhắn cho quản trị viên nếu cần nêu mục đích hoặc lưu ý duyệt.",
          "Chọn Gửi duyệt và xác nhận, sau đó kiểm tra khóa chuyển sang Chờ duyệt.",
        ],
        result: "Khóa học vào quy trình xem xét; học viên chưa nhìn thấy cho đến khi được phê duyệt.",
        fallbacks: [
          "Nếu chưa chọn lớp, hệ thống yêu cầu chọn ít nhất một lớp.",
          "Nếu không có lớp phù hợp, kiểm tra cấp độ khóa và phân công giảng dạy.",
          "Nếu gửi thất bại, không bấm liên tục; tải lại danh sách để kiểm tra trạng thái.",
        ],
      },
      {
        id: "ket-qua-duyet",
        title: "Theo dõi kết quả duyệt",
        purpose: "Biết khi nào khóa học sẵn sàng cho học viên hoặc cần chỉnh sửa thêm.",
        conditions: ["Khóa học đã được Gửi duyệt."],
        steps: [
          "Mở danh sách Khóa học và tìm khóa đã gửi.",
          "Nếu là Chờ duyệt, chờ quản trị viên phản hồi và không tạo khóa trùng.",
          "Nếu là Đã xuất bản, mở chi tiết để kiểm tra các lớp áp dụng.",
          "Xác nhận với một lớp mục tiêu rằng khóa đã xuất hiện với học viên.",
          "Nếu là Bị từ chối, mở Xem nhận xét để đọc đầy đủ lý do.",
        ],
        result: "Bạn nắm được trạng thái duyệt và có hành động đúng cho từng kết quả.",
        fallbacks: [
          "Nếu trạng thái không đổi bất thường, tải lại trang rồi liên hệ quản trị viên kèm tên khóa và thời điểm gửi.",
          "Nếu khóa đã xuất bản nhưng lớp không thấy, kiểm tra lại danh sách lớp ở bước Phân phối.",
        ],
      },
      {
        id: "gui-lai-khoa",
        title: "Chỉnh sửa và gửi lại khóa Bị từ chối",
        purpose: "Khắc phục đúng nhận xét và đưa khóa trở lại quy trình duyệt.",
        conditions: ["Khóa học hiển thị trạng thái Bị từ chối và có nhận xét của quản trị viên."],
        steps: [
          "Mở Xem nhận xét và ghi lại từng nội dung cần sửa.",
          "Chọn Chỉnh sửa & gửi lại để đưa khóa về trạng thái có thể biên soạn.",
          "Sửa thông tin, Units hoặc hoạt động theo nhận xét; lưu từng bước.",
          "Mở Xem trước để kiểm tra lại toàn bộ nội dung.",
          "Sang Phân phối, chọn lớp lại nếu phạm vi cần thay đổi.",
          "Nhập lời nhắn giải thích phần đã sửa và chọn Gửi duyệt.",
        ],
        result: "Khóa học trở lại Chờ duyệt với nội dung đã được cập nhật.",
        fallbacks: [
          "Nếu không thấy nút chỉnh sửa, tải lại chi tiết khóa và kiểm tra bạn là tác giả.",
          "Nếu nhận xét chưa rõ, trao đổi với quản trị viên trước khi sửa để tránh gửi lại nhiều lần.",
        ],
      },
      {
        id: "thay-doi-khoa-da-xuat-ban",
        title: "Thay đổi khóa đang Chờ duyệt hoặc đã xuất bản",
        purpose: "Đưa khóa về bản nháp trước khi thay đổi nội dung có ảnh hưởng tới học viên.",
        conditions: ["Bạn là tác giả của khóa và khóa đang Chờ duyệt hoặc Đã xuất bản."],
        steps: [
          "Mở thẻ khóa học và đọc trạng thái hiện tại.",
          "Nếu đang Chờ duyệt, chọn Hủy chờ duyệt và xác nhận để trở về Bản nháp.",
          "Nếu đã xuất bản, chọn Bỏ xuất bản và xác nhận rằng khóa sẽ tạm ẩn với học viên.",
          "Mở chỉnh sửa, cập nhật nội dung và lưu.",
          "Kiểm tra lại Phân phối, chọn lớp và Gửi duyệt lần nữa.",
        ],
        result: "Phiên bản mới được đưa vào duyệt; học viên chỉ thấy lại sau khi được phê duyệt.",
        fallbacks: [
          "Không sửa bằng cách tạo một khóa trùng tên khi khóa cũ vẫn tồn tại.",
          "Nếu không có thao tác hủy hoặc bỏ xuất bản, liên hệ quản trị viên.",
        ],
      },
    ],
  },
  {
    id: "hoat-dong",
    order: 6,
    title: "Soạn hoạt động học tập",
    summary: "Trang nội dung, video, quiz, bài tập trong khóa, gói SCORM/H5P và học tuần tự.",
    icon: "layers",
    topics: [
      {
        id: "noi-dung-co-ban",
        title: "Thêm trang nội dung, bài học, video, tài liệu hoặc liên kết",
        purpose: "Tạo nội dung học tập thông thường trong một Unit.",
        conditions: ["Khóa học đang ở trạng thái cho phép chỉnh sửa và Unit đã được lưu."],
        steps: [
          "Mở bước Activities và chọn Unit đích.",
          "Chọn Thêm hoạt động, sau đó chọn Trang nội dung, Bài học, Video, Tài liệu hoặc Liên kết.",
          "Nhập tên và mô tả giúp học viên hiểu mục tiêu.",
          "Soạn nội dung hoặc chọn tệp, đường dẫn theo loại hoạt động.",
          "Thiết lập kỹ năng, thời lượng hoặc điều kiện hoàn thành nếu có.",
          "Lưu và dùng Xem trước để kiểm tra.",
        ],
        result: "Hoạt động xuất hiện trong đúng Unit và mở được ở chế độ xem trước.",
        fallbacks: [
          "Nếu tệp không được chấp nhận, kiểm tra định dạng và dung lượng rồi tải lại.",
          "Nếu liên kết không mở, kiểm tra địa chỉ đầy đủ và quyền truy cập của người học.",
        ],
      },
      {
        id: "quiz",
        title: "Tạo Quiz hoặc bài thực hành",
        purpose: "Tạo hoạt động có câu hỏi, số lần làm và điều kiện đạt.",
        conditions: ["Bạn đã chuẩn bị câu hỏi, đáp án và thang điểm phù hợp."],
        steps: [
          "Chọn loại Quiz hoặc Bài thực hành trong Unit.",
          "Nhập tên, hướng dẫn, điểm tối đa, số lần thử và điểm đạt nếu có.",
          "Thêm câu hỏi, lựa chọn hoặc nội dung trả lời theo từng loại câu hỏi.",
          "Đánh dấu đáp án đúng hoặc tiêu chí chấm.",
          "Kiểm tra tổng điểm và thứ tự câu hỏi.",
          "Lưu, Xem trước và làm thử toàn bộ trước khi đưa khóa đi duyệt.",
        ],
        result: "Quiz hoặc bài thực hành mở đúng, hiển thị đủ câu hỏi và tính điểm theo cấu hình.",
        fallbacks: [
          "Nếu không lưu được, kiểm tra câu hỏi còn thiếu nội dung, đáp án hoặc điểm.",
          "Nếu tổng điểm không khớp, điều chỉnh điểm từng câu trước khi lưu lại.",
        ],
      },
      {
        id: "bai-tap-trong-khoa",
        title: "Thêm bài tập vào khóa học",
        purpose: "Đặt một hoạt động nộp bài tại đúng vị trí trong lộ trình khóa học.",
        conditions: ["Bạn biết lớp nhận bài, hạn nộp, điểm tối đa và hình thức nộp."],
        steps: [
          "Trong Unit, chọn thêm hoạt động Bài tập.",
          "Nhập tên, đề bài, hướng dẫn và tệp hướng dẫn.",
          "Chọn lớp, hạn nộp, điểm tối đa và hình thức nộp.",
          "Lưu hoạt động và kiểm tra nó xuất hiện đúng vị trí.",
          "Sau khi giao, dùng khu vực Bài tập để theo dõi và chấm bài.",
        ],
        result: "Bài tập vừa là một phần của khóa học vừa xuất hiện trong danh sách việc của học viên.",
        fallbacks: [
          "Nếu không chọn được lớp, kiểm tra lớp có cùng khóa học và bạn đang phụ trách lớp đó.",
          "Nếu hạn nộp đã qua, chọn thời điểm mới trong tương lai.",
        ],
      },
      {
        id: "scorm-h5p",
        title: "Tải gói nội dung SCORM hoặc H5P",
        purpose: "Đưa một gói bài học tương tác đã đóng gói sẵn vào khóa học.",
        conditions: [
          "Bạn có tệp gói đúng loại và tệp không bị hỏng.",
          "Khóa học đang ở trạng thái cho phép chỉnh sửa.",
        ],
        steps: [
          "Chọn đúng loại SCORM hoặc H5P trong Unit.",
          "Dùng nút tải gói chuyên dụng của loại nội dung đó.",
          "Chọn tệp và chờ hệ thống kiểm tra, tải lên và đọc cấu trúc gói.",
          "Nhập tên, mô tả và các tùy chọn học tập được hiển thị.",
          "Lưu và mở Xem trước để kiểm tra trang đầu, điều hướng và khả năng hoàn thành.",
        ],
        result: "Gói nội dung được gắn vào đúng Unit và mở được trong chế độ xem trước.",
        fallbacks: [
          "Nếu gói bị từ chối, không đổi đuôi tệp; xuất lại gói từ công cụ tạo nội dung theo đúng chuẩn.",
          "Nếu tải lên thành công nhưng xem trước lỗi, kiểm tra cấu trúc gói và tệp khởi chạy.",
        ],
      },
      {
        id: "hoc-tuan-tu",
        title: "Thiết lập học tuần tự và xem trước",
        purpose: "Kiểm soát việc học viên phải hoàn thành nội dung trước rồi mới mở nội dung sau.",
        conditions: ["Khóa học đã có từ hai Unit hoặc hoạt động trở lên."],
        steps: [
          "Mở thiết lập của Unit hoặc hoạt động cần kiểm soát.",
          "Bật yêu cầu hoàn thành nội dung trước nếu muốn học theo thứ tự.",
          "Kiểm tra thứ tự các Unit và hoạt động.",
          "Mở Xem trước bằng tài khoản Giáo viên; lưu ý Giáo viên xem được cả khi học viên còn bị khóa.",
          "Đối chiếu bằng một tài khoản học viên thử nghiệm nếu cần xác nhận chính xác.",
        ],
        result: "Học viên mở nội dung theo đúng trình tự, Giáo viên vẫn xem trước được để kiểm tra.",
        fallbacks: [
          "Nếu nội dung sau mở quá sớm, kiểm tra yêu cầu hoàn thành ở cả Unit và hoạt động.",
          "Nếu nội dung sau bị khóa dù phần trước trống, kiểm tra phần trước có hoạt động bắt buộc hay không.",
        ],
      },
      {
        id: "sap-xep-hoat-dong",
        title: "Sắp xếp, chỉnh sửa hoặc xóa hoạt động",
        purpose: "Giữ cấu trúc khóa học rõ ràng và loại bỏ nội dung không còn sử dụng.",
        conditions: ["Khóa học đang ở trạng thái cho phép chỉnh sửa."],
        steps: [
          "Mở bước Activities và chọn Unit.",
          "Kéo thả hoặc dùng thao tác sắp xếp để đặt lại thứ tự hoạt động.",
          "Mở Chỉnh sửa để cập nhật nội dung và lưu lại.",
          "Dùng Xem trước sau mỗi thay đổi quan trọng.",
          "Chỉ chọn Xóa khi đã xác nhận đúng hoạt động và đọc cảnh báo về dữ liệu liên quan.",
          "Kiểm tra lại toàn bộ thứ tự sau khi xóa hoặc di chuyển.",
        ],
        result: "Cấu trúc mới được lưu, không có hoạt động trùng hoặc nằm sai Unit.",
        fallbacks: [
          "Nếu danh sách thay đổi khi bạn đang chỉnh sửa, tải lại trang trước khi sắp xếp lại.",
          "Nếu đã xóa nhầm nội dung, dừng chỉnh sửa và liên hệ quản trị viên.",
        ],
      },
    ],
  },
  {
    id: "cham-thi",
    order: 7,
    title: "Chấm điểm và chấm lại bài thi",
    summary: "Mở hàng đợi chấm, chấm câu trả lời thủ công và kiểm tra không còn câu chờ chấm.",
    icon: "check",
    topics: [
      {
        id: "hang-doi-cham",
        title: "Mở Hàng đợi chấm",
        purpose: "Tìm các kỳ thi và bài làm còn câu hỏi cần Giáo viên chấm thủ công.",
        conditions: ["Kỳ thi đã có lượt nộp bài và bạn được giao chấm."],
        steps: [
          "Mở Chấm thi.",
          "Tìm kiếm theo kỳ thi, lớp hoặc trạng thái Cần chấm.",
          "Chọn Chấm bài và chọn bài làm của học viên.",
          "Kiểm tra đúng tên học viên, lượt thi và thời điểm nộp trước khi chấm.",
        ],
        result: "Bài làm cần chấm được mở đúng phạm vi và hiển thị các câu trả lời liên quan.",
        fallbacks: [
          "Nếu hàng đợi trống, kiểm tra kỳ thi đã có bài nộp và câu hỏi thủ công hay chưa.",
          "Nếu không thấy học viên, xóa bộ lọc và mở danh sách Kết quả thi của kỳ thi.",
        ],
      },
      {
        id: "cham-thu-cong",
        title: "Chấm câu trả lời thủ công",
        purpose: "Ghi điểm và nhận xét cho các câu không thể chấm tự động.",
        conditions: [
          "Bạn đã mở đúng bài làm.",
          "Tiêu chí chấm và điểm tối đa của câu hỏi đã được xác định.",
        ],
        steps: [
          "Đọc đề bài, câu trả lời của học viên và tệp hoặc âm thanh đính kèm nếu có.",
          "Đối chiếu với tiêu chí chấm hoặc hướng dẫn đáp án.",
          "Nhập điểm không vượt quá điểm tối đa của câu.",
          "Nhập nhận xét ngắn gọn, nêu điểm tốt và nội dung cần cải thiện.",
          "Lưu điểm và chuyển sang câu tiếp theo.",
          "Kiểm tra không còn câu bắt buộc nào ở trạng thái Chờ chấm.",
        ],
        result: "Điểm thủ công và nhận xét được lưu cho đúng câu, đúng học viên.",
        fallbacks: [
          "Nếu tệp hoặc âm thanh không mở, thử tải lại và không chấm khi chưa xem đủ dữ liệu.",
          "Nếu điểm báo vượt giới hạn, kiểm tra lại thang điểm của câu.",
        ],
      },
    ],
  },
  {
    id: "bao-cao",
    order: 8,
    title: "Báo cáo và xuất dữ liệu",
    summary: "Đọc báo cáo & phân tích giảng dạy và xuất báo cáo điểm thi ra Excel.",
    icon: "chart",
    topics: [
      {
        id: "phan-tich",
        title: "Xem Báo cáo & Phân tích giảng dạy",
        purpose: "Theo dõi tiến độ, điểm số, kỹ năng và mức độ tham gia của các lớp đang quản lý.",
        conditions: ["Lớp đã có dữ liệu học tập trong phạm vi thời gian đang xem."],
        steps: [
          "Mở Báo cáo.",
          "Chọn phạm vi Tất cả lớp hoặc một lớp cụ thể.",
          "Đọc điểm trung bình, tiến độ trung bình, tỉ lệ hoàn thành và số học viên cần hỗ trợ.",
          "Xem biểu đồ theo lớp, kỹ năng, khóa học, tuần và tình trạng nộp bài.",
          "Mở danh sách học viên nổi bật hoặc cần hỗ trợ để xem chi tiết.",
          "Đổi phạm vi hoặc thời gian rồi so sánh lại trước khi kết luận.",
        ],
        result: "Bạn có dữ liệu tổng hợp để điều chỉnh kế hoạch giảng dạy và hỗ trợ học viên.",
        fallbacks: [
          "Nếu biểu đồ trống, chọn phạm vi rộng hơn và kiểm tra lớp đã có hoạt động chưa.",
          "Nếu số liệu khác trang lớp, kiểm tra hai màn hình đang dùng cùng phạm vi và thời gian.",
        ],
      },
      {
        id: "xuat-bao-cao",
        title: "Xuất báo cáo điểm thi",
        purpose: "Xuất kết quả kỳ thi của các lớp được phân công.",
        conditions: ["Kỳ thi đã có lượt làm và bạn được xem báo cáo của lớp liên quan."],
        steps: [
          "Mở Chấm thi và chọn bài thi cần xuất điểm.",
          "Kiểm tra lại phạm vi dữ liệu trên màn hình.",
          "Chọn Xuất báo cáo Excel và giữ nguyên trang khi hệ thống chuẩn bị tệp.",
          "Chọn vị trí lưu nếu trình duyệt hỏi.",
          "Mở tệp và kiểm tra tên kỳ thi, lớp, cột dữ liệu và số dòng.",
          "Đổi tên tệp theo quy ước lưu trữ của đơn vị nếu cần.",
        ],
        result: "Tệp báo cáo được tải xuống và phản ánh đúng phạm vi đã chọn.",
        fallbacks: [
          "Nếu tệp rỗng, kiểm tra lại bộ lọc và dữ liệu trên màn hình.",
          "Nếu tải thất bại, cho phép tải xuống trong trình duyệt và thử lại một lần.",
          "Nếu cần xuất phạm vi không hiển thị với tài khoản hiện tại, liên hệ quản trị viên.",
        ],
      },
    ],
  },
  {
    id: "vai-tro",
    order: 9,
    title: "Phân biệt Giáo viên và Trợ giảng",
    summary: "Xác định thao tác nào thuộc Giáo viên chính, thao tác nào Trợ giảng thực hiện được.",
    icon: "shield",
    topics: [
      {
        id: "xac-dinh-vai-tro",
        title: "Xác định thao tác theo tài khoản đang dùng",
        purpose: "Tránh nhầm giữa công việc của Giáo viên chính và Trợ giảng.",
        conditions: ["Bạn biết tài khoản hiện tại đang hiển thị vai trò Giáo viên hay Trợ giảng."],
        steps: [
          "Mở menu tài khoản và đọc vai trò đang dùng.",
          "Đối chiếu công việc cần làm với bảng phân quyền bên dưới.",
          "Nếu thao tác thuộc Giáo viên nhưng bạn đang dùng tài khoản Trợ giảng, chuyển yêu cầu cho Giáo viên phụ trách.",
          "Nếu vai trò hiển thị không đúng phân công, liên hệ quản trị viên.",
        ],
        result: "Công việc được thực hiện bằng đúng tài khoản và đúng phạm vi lớp.",
        fallbacks: [
          "Không dùng chung mật khẩu hoặc mượn tài khoản để vượt qua giới hạn chức năng.",
          "Một mục không xuất hiện thường là dấu hiệu tài khoản không có chức năng đó hoặc chưa được phân công lớp.",
        ],
      },
    ],
  },
  {
    id: "xu-ly-su-co",
    order: 10,
    title: "Xử lý tình huống thường gặp",
    summary: "Thứ tự xử lý sự cố an toàn và bảng tra nhanh các lỗi phổ biến.",
    icon: "help",
    topics: [
      {
        id: "thu-tu-an-toan",
        title: "Xử lý sự cố theo thứ tự an toàn",
        purpose: "Khắc phục lỗi phổ biến mà không tạo dữ liệu trùng hoặc làm mất nội dung đang nhập.",
        conditions: ["Bạn đã ghi nhận màn hình, đối tượng và thời điểm xảy ra sự cố."],
        steps: [
          "Đọc đầy đủ thông báo trên màn hình và giữ nguyên nội dung đang nhập.",
          "Kiểm tra mạng, tài khoản, lớp, trạng thái và bộ lọc.",
          "Tải lại dữ liệu hoặc thử lại đúng một lần.",
          "Kiểm tra danh sách để xác nhận thao tác trước thực sự thất bại hay đã hoàn thành.",
          "Nếu chưa giải quyết, ghi lại tên lớp, khóa học, bài tập hoặc kỳ thi cùng thời điểm.",
          "Liên hệ quản trị viên hoặc bộ phận hỗ trợ với thông tin đã ghi nhận.",
        ],
        result: "Sự cố được xử lý ở bước phù hợp hoặc chuyển tiếp đủ thông tin, không tạo bản ghi trùng.",
        fallbacks: [
          "Không bấm Lưu, Gửi duyệt, Xuất bản, Nộp hoặc Xuất báo cáo nhiều lần liên tiếp.",
          "Không xóa nội dung cũ để thử lại khi chưa xác nhận trạng thái thực tế.",
        ],
      },
    ],
  },
];

export const rolePermissions: { task: string; teacher: string; assistant: string }[] = [
  {
    task: "Xem lớp, thành viên và dữ liệu lớp được giao",
    teacher: "Xem được trong phạm vi lớp phụ trách.",
    assistant: "Xem được trong phạm vi lớp phụ trách.",
  },
  {
    task: "Giao, theo dõi, gia hạn và chấm bài tập",
    teacher: "Thực hiện được cho lớp phụ trách.",
    assistant: "Thực hiện được cho lớp được phân công khi chức năng hiển thị.",
  },
  {
    task: "Trả lời Hỏi đáp học viên",
    teacher: "Trả lời câu hỏi của khóa phụ trách.",
    assistant: "Trả lời câu hỏi của khóa được phân công.",
  },
  {
    task: "Tạo khóa học và soạn hoạt động",
    teacher: "Tạo khóa do mình biên soạn và Gửi duyệt.",
    assistant: "Không dùng được luồng tạo khóa học dành riêng cho Giáo viên.",
  },
  {
    task: "Tạo, sửa và xuất bản Teacher Test",
    teacher: "Quản lý được Teacher Test của mình.",
    assistant: "Không thực hiện được thao tác Teacher Test.",
  },
  {
    task: "Mở, đóng và vận hành kỳ thi",
    teacher: "Vận hành được kỳ thi được giao.",
    assistant: "Không dùng được thao tác vận hành kỳ thi.",
  },
  {
    task: "Chấm và chấm lại bài thi",
    teacher: "Chấm được bài thi được giao.",
    assistant: "Không dùng được khu vực chấm thi.",
  },
  {
    task: "Quản lý chính sách giám sát",
    teacher: "Quản lý được khi kỳ thi và tài khoản cho phép.",
    assistant: "Không thay đổi được chính sách giám sát.",
  },
  {
    task: "Xem và xuất báo cáo thi",
    teacher: "Xem và xuất trong phạm vi chức năng hiển thị.",
    assistant: "Xem báo cáo lớp được giao; không xuất toàn bộ phạm vi ngoài lớp được giao.",
  },
];

export const troubleshooting: { issue: string; fix: string }[] = [
  {
    issue: "Không đăng nhập được",
    fix: "Kiểm tra thông tin đăng nhập, mạng và trạng thái bàn phím; thử lại một lần, sau đó đề nghị hỗ trợ đặt lại mật khẩu.",
  },
  {
    issue: "Không thấy lớp hoặc học viên",
    fix: "Xóa bộ lọc, kiểm tra đúng vai trò và thời gian phân công; nếu vẫn thiếu, liên hệ quản trị viên.",
  },
  {
    issue: "Không thấy khóa học",
    fix: "Tìm theo một phần tên, bỏ bộ lọc, kiểm tra khóa có bị ẩn, đang chờ duyệt hoặc thuộc người tạo khác hay không.",
  },
  {
    issue: "Khóa không chỉnh sửa được",
    fix: "Kiểm tra bạn là tác giả và khóa đã về Bản nháp; hủy chờ duyệt hoặc bỏ xuất bản trước khi sửa.",
  },
  {
    issue: "Duyệt khóa chậm hoặc Bị từ chối",
    fix: "Tải lại trạng thái; với khóa bị từ chối, đọc nhận xét, chỉnh sửa và Gửi duyệt lại; với chờ lâu, gửi tên khóa và thời điểm cho quản trị viên.",
  },
  {
    issue: "Gói SCORM/H5P bị từ chối",
    fix: "Kiểm tra định dạng, dung lượng và cấu trúc gói; xuất lại gói đúng chuẩn, không chỉ đổi tên tệp.",
  },
  {
    issue: "Không mở hoặc đóng được kỳ thi",
    fix: "Kiểm tra trạng thái, thời gian, lớp và tài khoản Giáo viên; tải lại chi tiết trước khi thử lại.",
  },
  {
    issue: "Học viên không bắt đầu được",
    fix: "Kiểm tra kỳ thi đã mở, đúng lớp, còn lượt và không có lượt đang làm; ghi lại thông báo nếu cần chuyển hỗ trợ.",
  },
  {
    issue: "Không thấy bài cần chấm",
    fix: "Xóa bộ lọc, kiểm tra bài đã nộp và còn câu cần chấm thủ công; mở từ Kết quả thi nếu hàng đợi trống.",
  },
  {
    issue: "Báo cáo trống",
    fix: "Chọn lại lớp, kỳ thi và thời gian; xác nhận đã có hoạt động hoặc bài nộp trong phạm vi đó.",
  },
  {
    issue: "Xuất báo cáo thất bại",
    fix: "Cho phép tải tệp trong trình duyệt, kiểm tra bộ lọc, thử lại một lần và kiểm tra thư mục tải xuống.",
  },
  {
    issue: "Số thông báo chưa đọc không đúng",
    fix: "Mở lại danh sách, đánh dấu đã đọc, tải lại trang rồi đăng nhập lại nếu cần.",
  },
];

export function findModule(id: string) {
  return guideModules.find((m) => m.id === id);
}

export function searchGuide(query: string) {
  const q = query.trim().toLowerCase();
  if (!q) return guideModules;
  return guideModules
    .map((m) => ({
      ...m,
      topics: m.topics.filter(
        (t) =>
          t.title.toLowerCase().includes(q) ||
          t.purpose.toLowerCase().includes(q) ||
          t.steps.some((s) => s.toLowerCase().includes(q)),
      ),
    }))
    .filter((m) => m.topics.length > 0 || m.title.toLowerCase().includes(q));
}
