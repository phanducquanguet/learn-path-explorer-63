// Policy version registry — used by the biometric registration flow and the
// "Quyền riêng tư & Dữ liệu" dialog in the top-nav user menu so that we can
// always render the exact text the user agreed to in the past.

export type PolicySection = { title: string; body: string[] };

export type PolicyVersion = {
  id: string;
  title: string;
  effectiveDate: string; // ISO date
  scope: string;
  sections: PolicySection[];
};

const V_2026_01_15: PolicyVersion = {
  id: "biometric-policy@2026-01-15",
  title: "Chính sách thu thập và xử lý dữ liệu khuôn mặt và Căn cước công dân",
  effectiveDate: "2026-01-15",
  scope:
    "Áp dụng riêng cho tính năng Thi đánh giá nội bộ / Linguaskill Mock Test trên hệ thống REAP English",
  sections: [
    {
      title: "Điều 1. Định nghĩa và Phạm vi thu thập",
      body: [
        "Khi bạn chọn tham gia các bài thi có tính năng giám thị ảo (Proctored Test), hệ thống của chúng tôi sẽ tiến hành thu thập các loại dữ liệu sau:",
        "• Ảnh chụp Căn cước công dân (CCCD): Hình ảnh mặt trước và mặt sau của giấy tờ tùy thân hợp pháp, còn hiệu lực.",
        "• Ảnh khuôn mặt thực tế (Live Face Image): Hình ảnh tĩnh được chụp từ camera tại thời điểm bạn làm thủ tục vào phòng thi.",
        "• Dữ liệu video/khung hình (Frame Captures): Các đoạn video hoặc hình ảnh chụp ngắt quãng khuôn mặt và biểu cảm của bạn trong suốt thời gian đếm ngược của bài thi.",
        "• Dữ liệu kỹ thuật kèm theo: Thông tin về góc chiếu sáng, chuyển động mắt, và sự hiện diện của khuôn mặt thứ hai trong khung hình để phục vụ thuật toán chống gian lận.",
      ],
    },
    {
      title: "Điều 2. Mục đích xử lý dữ liệu (Tuyệt đối và Duy nhất)",
      body: [
        "1. Trích xuất thông tin cá nhân: Nhận diện và tự động trích xuất các thông tin văn bản trên thẻ CCCD (Họ tên, Ngày sinh, Số CCCD...) để hoàn thiện hồ sơ dự thi Linguaskill.",
        "2. Xác thực định danh (eKYC): Đối chiếu ảnh khuôn mặt thực tế với ảnh chân dung in trên thẻ CCCD để đảm bảo người ngồi trước màn hình chính là chủ sở hữu hợp pháp của giấy tờ tùy thân.",
        "3. Giám sát phòng thi: AI sẽ phân tích dữ liệu video theo thời gian thực để phát hiện các dấu hiệu gian lận (thi hộ, dùng tài liệu, có người trợ giúp).",
        "4. Giải quyết khiếu nại: Làm bằng chứng đối chiếu trong trường hợp bạn có khiếu nại về điểm số hoặc quyết định hủy kết quả thi của hệ thống.",
        "Cam kết loại trừ: Dữ liệu khuôn mặt của bạn tuyệt đối không được sử dụng để bán cho bên thứ ba, không dùng để quảng cáo, và không dùng để huấn luyện (train) các mô hình AI.",
      ],
    },
    {
      title: "Điều 3. Thời gian lưu trữ và Quy tắc tự hủy",
      body: [
        "1. Thi bình thường: Dữ liệu ảnh gốc và video giám thị sẽ tự động xóa vĩnh viễn trong vòng 30 ngày kể từ khi có kết quả chính thức.",
        "2. Phát hiện gian lận: Dữ liệu bằng chứng được lưu trữ tối đa 90 ngày để phục vụ thanh tra, sau đó bị xóa.",
        "3. Xóa tài khoản: Mọi dữ liệu khuôn mặt liên kết với tài khoản sẽ được lập tức hủy bỏ.",
      ],
    },
    {
      title: "Điều 4. Nguyên tắc chia sẻ dữ liệu",
      body: [
        "Dữ liệu khuôn mặt được mã hóa an toàn và chỉ có hai nhóm được tiếp cận:",
        "1. Hệ thống thuật toán AI giám thị nội bộ.",
        "2. Nhân sự QA / CSKH có thẩm quyền – chỉ giải mã khi có yêu cầu rà soát khiếu nại từ chính bạn.",
        "Dữ liệu có thể được lưu trên máy chủ đám mây đạt chuẩn ISO 27001; nhà cung cấp hạ tầng không có chìa khóa giải mã.",
      ],
    },
    {
      title: "Điều 5. Hậu quả của việc từ chối hoặc rút lại sự đồng ý",
      body: [
        "1. Từ chối ngay từ đầu: Bạn sẽ không thể tham gia tính năng Thi cử. Bạn vẫn có thể dùng các tính năng e-learning.",
        "2. Rút lại khi đang thi: Bài thi sẽ bị đóng cưỡng chế và kết quả không được công nhận.",
        "3. Rút lại sau khi thi xong: Dữ liệu sẽ bị xóa, đồng nghĩa với việc bạn từ bỏ quyền khiếu nại về kết quả bài thi.",
      ],
    },
    {
      title: "Điều 6. Sự cố kỹ thuật và Miễn trừ trách nhiệm",
      body: [
        "1. Hệ thống không chịu trách nhiệm nếu bài thi bị hủy do yếu tố khách quan (camera hỏng, thiếu ánh sáng, mạng gián đoạn).",
        "2. Trong trường hợp Data Breach do nguyên nhân bất khả kháng, chúng tôi sẽ thông báo trong 72 giờ và áp dụng biện pháp khắc phục, nhưng được miễn trừ bồi thường thiệt hại gián tiếp.",
      ],
    },
    {
      title: "Điều 7. Quy trình xử lý yêu cầu (SLA)",
      body: [
        "Yêu cầu trích xuất bản sao dữ liệu: tối đa 10 ngày.",
        "Yêu cầu hạn chế/ngừng xử lý: trong vòng 72 giờ.",
        "Yêu cầu xóa vĩnh viễn dữ liệu: tối đa 20 ngày.",
        "Liên hệ Bộ phận Bảo vệ Dữ liệu (DPO) qua tính năng LIÊN HỆ trên hệ thống.",
      ],
    },
  ],
};

export const POLICY_REGISTRY: Record<string, PolicyVersion> = {
  [V_2026_01_15.id]: V_2026_01_15,
};

export const CURRENT_POLICY_VERSION_ID = V_2026_01_15.id;

export function getPolicyVersion(id: string | undefined | null): PolicyVersion | null {
  if (!id) return null;
  return POLICY_REGISTRY[id] ?? null;
}

export const BIOMETRIC_KEY = "unicom.biometric-registration";

export type BiometricRegistration = {
  cccdFront: string;
  cccdBack: string;
  faceImage: string;
  termsAcceptedAt: string;
  registeredAt: string;
  policyVersionId: string;
};
