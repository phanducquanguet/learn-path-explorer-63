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

const V_2025_06_01: PolicyVersion = {
  id: "biometric-policy@2025-06-01",
  title: "Chính sách thu thập và xử lý dữ liệu khuôn mặt và CCCD (bản 1.0)",
  effectiveDate: "2025-06-01",
  scope:
    "Phiên bản đầu tiên — áp dụng cho Linguaskill Mock Test, lưu trữ dữ liệu 60 ngày.",
  sections: [
    {
      title: "Điều 1. Phạm vi thu thập",
      body: [
        "Ảnh CCCD (mặt trước và mặt sau) cùng ảnh khuôn mặt thực tế được chụp ngay trước khi vào phòng thi.",
        "Hệ thống chưa thu thập video giám thị liên tục trong phiên bản này.",
      ],
    },
    {
      title: "Điều 2. Mục đích sử dụng",
      body: [
        "Xác thực định danh (eKYC) trước khi cho phép vào phòng thi.",
        "Đối chiếu khi có khiếu nại về kết quả thi.",
      ],
    },
    {
      title: "Điều 3. Thời gian lưu trữ",
      body: [
        "Dữ liệu ảnh được lưu trữ tối đa 60 ngày kể từ ngày thi, sau đó bị xóa vĩnh viễn.",
      ],
    },
  ],
};

const V_2026_01_15: PolicyVersion = {
  id: "biometric-policy@2026-01-15",
  title: "Chính sách thu thập và xử lý dữ liệu khuôn mặt và CCCD (bản 1.1)",
  effectiveDate: "2026-01-15",
  scope:
    "Bổ sung video giám thị liên tục và rút ngắn thời gian lưu trữ xuống 30 ngày.",
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
      title: "Điều 2. Mục đích xử lý dữ liệu",
      body: [
        "1. Trích xuất thông tin cá nhân từ thẻ CCCD để hoàn thiện hồ sơ dự thi.",
        "2. Xác thực định danh (eKYC) bằng cách đối chiếu khuôn mặt thực tế với ảnh trên CCCD.",
        "3. Giám sát phòng thi bằng AI để phát hiện gian lận.",
        "4. Làm bằng chứng đối chiếu khi có khiếu nại.",
        "Cam kết loại trừ: không bán cho bên thứ ba, không dùng quảng cáo, không dùng để huấn luyện mô hình AI.",
      ],
    },
    {
      title: "Điều 3. Thời gian lưu trữ và Quy tắc tự hủy",
      body: [
        "1. Thi bình thường: tự động xóa trong vòng 30 ngày kể từ khi có kết quả.",
        "2. Phát hiện gian lận: lưu trữ tối đa 90 ngày để phục vụ thanh tra.",
        "3. Xóa tài khoản: dữ liệu khuôn mặt bị hủy ngay lập tức.",
      ],
    },
    {
      title: "Điều 4. Nguyên tắc chia sẻ dữ liệu",
      body: [
        "Chỉ có hai nhóm được tiếp cận: hệ thống AI giám thị nội bộ và nhân sự QA/CSKH có thẩm quyền khi xử lý khiếu nại của bạn.",
        "Lưu trữ trên hạ tầng đám mây đạt chuẩn ISO 27001; nhà cung cấp hạ tầng không có chìa khóa giải mã.",
      ],
    },
    {
      title: "Điều 5. Hậu quả của việc từ chối hoặc rút lại sự đồng ý",
      body: [
        "1. Từ chối ngay từ đầu: không thể tham gia Thi cử nhưng vẫn dùng được e-learning.",
        "2. Rút lại khi đang thi: bài thi bị đóng cưỡng chế.",
        "3. Rút lại sau khi thi xong: dữ liệu bị xóa và bạn từ bỏ quyền khiếu nại.",
      ],
    },
  ],
};

const V_2026_06_05: PolicyVersion = {
  id: "biometric-policy@2026-06-05",
  title:
    "PHỤ LỤC: Chính sách thu thập và xử lý dữ liệu khuôn mặt và Căn cước công dân (bản 2.0)",
  effectiveDate: "2026-06-05",
  scope:
    "Áp dụng riêng cho tính năng Thi đánh giá nội bộ / Linguaskill Mock Test trên hệ thống REAP English.",
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
        "Chúng tôi cam kết chỉ sử dụng dữ liệu khuôn mặt của bạn cho các mục đích thiết yếu sau:",
        "1. Trích xuất thông tin cá nhân: Nhận diện và tự động trích xuất các thông tin văn bản trên thẻ CCCD (Họ tên, Ngày sinh, Số CCCD...) để hoàn thiện hồ sơ dự thi Linguaskill.",
        "2. Xác thực định danh (eKYC): Hệ thống sẽ đối chiếu ảnh khuôn mặt thực tế chụp từ camera với ảnh chân dung in trên thẻ CCCD để đảm bảo người ngồi trước màn hình chính là chủ sở hữu hợp pháp của giấy tờ tùy thân.",
        "3. Giám sát phòng thi: AI sẽ phân tích dữ liệu video theo thời gian thực để phát hiện các dấu hiệu gian lận (thi hộ, dùng tài liệu, có người trợ giúp).",
        "4. Giải quyết khiếu nại: Làm bằng chứng đối chiếu trong trường hợp bạn có khiếu nại về điểm số hoặc quyết định hủy kết quả thi của hệ thống.",
        "Cam kết loại trừ: Dữ liệu khuôn mặt của bạn tuyệt đối không được sử dụng để bán cho bên thứ ba, không dùng để quảng cáo, và không dùng để huấn luyện (train) các mô hình Trí tuệ Nhân tạo (AI) của chúng tôi hay bất kỳ đối tác nào khác.",
      ],
    },
    {
      title: "Điều 3. Thời gian lưu trữ và Quy tắc tự hủy (Data Retention)",
      body: [
        "Để bảo vệ quyền riêng tư của bạn, hệ thống áp dụng cơ chế tự hủy dữ liệu nghiêm ngặt:",
        "1. Trường hợp thi bình thường: Toàn bộ dữ liệu ảnh gốc và video giám thị sẽ được tự động xóa vĩnh viễn khỏi máy chủ trong vòng 30 ngày kể từ khi bài thi có kết quả chính thức.",
        "2. Trường hợp phát hiện gian lận: Nếu hệ thống ghi nhận vi phạm, dữ liệu bằng chứng sẽ được lưu trữ tối đa 90 ngày để phục vụ công tác thanh tra nội bộ, sau đó sẽ bị xóa.",
        "3. Trường hợp xóa tài khoản: Nếu bạn chủ động liên hệ để thực hiện xóa tài khoản, mọi dữ liệu khuôn mặt liên kết với tài khoản đó sẽ được lập tức hủy bỏ.",
      ],
    },
    {
      title: "Điều 4. Nguyên tắc chia sẻ dữ liệu (Third-party Sharing)",
      body: [
        "Dữ liệu khuôn mặt của bạn được mã hóa an toàn và chỉ có hai nhóm đối tượng được quyền tiếp cận:",
        "1. Hệ thống thuật toán AI giám thị nội bộ.",
        "2. Nhân sự kiểm soát chất lượng (QA) hoặc Chăm sóc khách hàng (CSKH) có thẩm quyền – chỉ được phép truy cập giải mã khi có yêu cầu rà soát khiếu nại từ chính bạn.",
        "Lưu ý: Chúng tôi có thể lưu trữ dữ liệu này trên các máy chủ đám mây đáp ứng tiêu chuẩn bảo mật quốc tế ISO 27001. Tuy nhiên, các nhà cung cấp hạ tầng này không có chìa khóa giải mã và không thể xem dữ liệu của bạn.",
      ],
    },
    {
      title: "Điều 5. Hậu quả của việc từ chối hoặc rút lại sự đồng ý",
      body: [
        "Việc cung cấp khuôn mặt là điều kiện bắt buộc để hệ thống đảm bảo tính công bằng cho điểm số thi đánh giá năng lực.",
        "1. Nếu bạn từ chối ngay từ đầu: Bạn sẽ không thể tham gia tính năng Thi cử để thực hiện đánh giá nội bộ. Tuy nhiên, bạn vẫn có thể sử dụng các tính năng học e-learning bình thường.",
        "2. Nếu bạn rút lại sự đồng ý khi đang làm bài thi: Hệ thống sẽ ngay lập tức ngừng thu thập dữ liệu, bài thi của bạn sẽ bị đóng cưỡng chế và kết quả thi sẽ không được công nhận.",
        "3. Nếu bạn rút lại sự đồng ý sau khi thi xong: Dữ liệu CCCD và khuôn mặt của bạn sẽ được xóa theo yêu cầu, đồng nghĩa với việc bạn từ bỏ quyền khiếu nại về kết quả của bài thi đó trong tương lai.",
      ],
    },
    {
      title: "Điều 6. Các sự cố kỹ thuật và Miễn trừ trách nhiệm",
      body: [
        "1. Hệ thống sẽ không chịu trách nhiệm trong trường hợp bài thi của bạn bị hủy bỏ tự động do các yếu tố khách quan từ phía bạn (camera hỏng, thiếu ánh sáng khiến AI không nhận diện được mặt, đường truyền mạng gián đoạn không gửi được dữ liệu ảnh).",
        "2. Trong trường hợp xảy ra sự cố an ninh mạng (Data Breach) do các nguyên nhân bất khả kháng (tin tặc tấn công có chủ đích quy mô lớn vượt qua các tiêu chuẩn bảo mật hiện hành), chúng tôi cam kết sẽ thông báo cho bạn và cơ quan chức năng trong vòng 72 giờ và áp dụng mọi biện pháp khắc phục tối đa, nhưng sẽ được miễn trừ các trách nhiệm bồi thường thiệt hại gián tiếp.",
      ],
    },
    {
      title: "Điều 7. Quy trình xử lý yêu cầu của Người dùng (SLA)",
      body: [
        "Mọi yêu cầu thực thi quyền đối với dữ liệu khuôn mặt, vui lòng thực hiện qua tính năng LIÊN HỆ trên hệ thống hoặc liên hệ Bộ phận Bảo vệ Dữ liệu (DPO) qua email: dpo@reap-english.vn.",
        "• Yêu cầu trích xuất bản sao dữ liệu: Xử lý trong tối đa 10 ngày.",
        "• Yêu cầu hạn chế/ngừng xử lý: Xử lý trong vòng 72 giờ.",
        "• Yêu cầu xóa vĩnh viễn dữ liệu: Xử lý trong tối đa 20 ngày.",
      ],
    },
  ],
};

export const POLICY_REGISTRY: Record<string, PolicyVersion> = {
  [V_2025_06_01.id]: V_2025_06_01,
  [V_2026_01_15.id]: V_2026_01_15,
  [V_2026_06_05.id]: V_2026_06_05,
};

export const CURRENT_POLICY_VERSION_ID = V_2026_06_05.id;

export function getPolicyVersion(id: string | undefined | null): PolicyVersion | null {
  if (!id) return null;
  return POLICY_REGISTRY[id] ?? null;
}

export const BIOMETRIC_KEY = "unicom.biometric-registration";
export const CONSENT_LOG_KEY = "unicom.consent-log";

export type BiometricRegistration = {
  cccdFront: string;
  cccdBack: string;
  faceImage: string;
  termsAcceptedAt: string;
  registeredAt: string;
  policyVersionId: string;
};

export type ConsentLogAction =
  | "consent.accepted" // người dùng đồng ý điều khoản & hoàn tất eKYC
  | "consent.reconfirmed" // đồng ý lại sau khi policy thay đổi
  | "consent.updated" // cập nhật ảnh khuôn mặt / CCCD, đồng ý lại điều khoản
  | "consent.revoked"; // hủy đăng ký

export type ConsentLogEntry = {
  id: string;
  action: ConsentLogAction;
  policyVersionId: string;
  policyTitle: string;
  occurredAt: string; // ISO datetime
  ipAddress?: string;
  userAgent?: string;
  note?: string;
};

const SEED_LOGS: ConsentLogEntry[] = [
  {
    id: "log-001",
    action: "consent.accepted",
    policyVersionId: V_2025_06_01.id,
    policyTitle: V_2025_06_01.title,
    occurredAt: "2025-09-12T08:42:11+07:00",
    ipAddress: "14.169.32.118",
    userAgent: "Chrome 128 / Windows 11",
    note: "Đăng ký lần đầu trước kỳ thi Linguaskill nội bộ tháng 9/2025.",
  },
  {
    id: "log-002",
    action: "consent.reconfirmed",
    policyVersionId: V_2026_01_15.id,
    policyTitle: V_2026_01_15.title,
    occurredAt: "2026-01-20T19:05:47+07:00",
    ipAddress: "14.169.32.118",
    userAgent: "Chrome 132 / Windows 11",
    note: "Bổ sung video giám thị liên tục — yêu cầu đồng ý lại điều khoản phiên bản 1.1.",
  },
  {
    id: "log-003",
    action: "consent.updated",
    policyVersionId: V_2026_06_05.id,
    policyTitle: V_2026_06_05.title,
    occurredAt: "2026-06-05T09:18:02+07:00",
    ipAddress: "171.244.10.55",
    userAgent: "Safari 18 / macOS 15",
    note: "Cập nhật ảnh khuôn mặt mới và đồng ý điều khoản phiên bản 2.0 (bổ sung Điều 6 & 7).",
  },
];

export function readConsentLog(): ConsentLogEntry[] {
  if (typeof window === "undefined") return [];
  const raw = window.localStorage.getItem(CONSENT_LOG_KEY);
  if (raw) {
    try {
      const parsed = JSON.parse(raw) as ConsentLogEntry[];
      if (Array.isArray(parsed)) return parsed;
    } catch {
      // fall through and reseed
    }
  }
  // Seed demo data on first read so the privacy panel always has history.
  window.localStorage.setItem(CONSENT_LOG_KEY, JSON.stringify(SEED_LOGS));
  return SEED_LOGS;
}

export function appendConsentLog(entry: Omit<ConsentLogEntry, "id" | "occurredAt"> & {
  occurredAt?: string;
}): ConsentLogEntry {
  const log = readConsentLog();
  const next: ConsentLogEntry = {
    id: `log-${Date.now()}`,
    occurredAt: entry.occurredAt ?? new Date().toISOString(),
    ...entry,
  };
  const updated = [...log, next];
  if (typeof window !== "undefined") {
    window.localStorage.setItem(CONSENT_LOG_KEY, JSON.stringify(updated));
  }
  return next;
}

export const CONSENT_ACTION_LABEL: Record<ConsentLogAction, string> = {
  "consent.accepted": "Đồng ý điều khoản & hoàn tất đăng ký",
  "consent.reconfirmed": "Đồng ý lại sau khi điều khoản thay đổi",
  "consent.updated": "Cập nhật thông tin & đồng ý điều khoản mới",
  "consent.revoked": "Hủy đăng ký, rút lại sự đồng ý",
};
