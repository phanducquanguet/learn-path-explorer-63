// Cấu hình landing page cho từng đơn vị (demo — lưu localStorage).
import { orgs } from "@/lib/orgs";
import { levels } from "@/lib/lms-data";

export type BannerSlide = { id: string; title: string; subtitle: string; imageUrl: string };
export type ReasonItem = { id: string; title: string; description: string };
export type SkillRow = { id: string; skill: string; duration: string; format: string; count: string };
export type BandRow = { id: string; score: string; cefr: string; label: string };
export type SocialLink = { id: string; platform: string; url: string };

export type LandingConfig = {
  orgId: string;
  published: boolean;
  accent: string; // oklch/hex accent
  brand: {
    orgName: string;
    shortName: string;
    logoUrl: string;
    showLogin: boolean;
    loginLabel: string;
  };
  banner: { enabled: boolean; slides: BannerSlide[] };
  about: { enabled: boolean; eyebrow: string; title: string; body: string; imageUrl: string };
  reasons: { enabled: boolean; title: string; items: ReasonItem[] };
  linguaskill: {
    enabled: boolean;
    title: string;
    intro: string;
    skills: SkillRow[];
    bands: BandRow[];
  };
  courses: { enabled: boolean; title: string; note: string; selectedIds: string[] };
  contact: {
    enabled: boolean;
    title: string;
    address: string;
    phone: string;
    email: string;
    website: string;
    taxCode: string;
    socials: SocialLink[];
  };
};

export const allCourses = levels.flatMap((lv) =>
  lv.courses.map((c) => ({ id: c.id, title: c.title, level: lv.code, subtitle: c.subtitle })),
);

const uid = (p: string) => `${p}-${Math.random().toString(36).slice(2, 8)}`;

export function defaultConfig(orgId: string): LandingConfig {
  const org = orgs.find((o) => o.id === orgId) ?? orgs[0];
  return {
    orgId,
    published: false,
    accent: "#1d4ed8",
    brand: {
      orgName: org.name,
      shortName: org.shortName,
      logoUrl: "",
      showLogin: true,
      loginLabel: "Đăng nhập",
    },
    banner: {
      enabled: true,
      slides: [
        {
          id: uid("sl"),
          title: "Chứng nhận đạt kiểm định chất lượng giáo dục",
          subtitle: "Theo tiêu chuẩn quốc gia (2018 - 2029)",
          imageUrl: "",
        },
        {
          id: uid("sl"),
          title: "Cơ sở vật chất hiện đại",
          subtitle: "Phòng lab tiếng Anh, thi trực tuyến trên máy",
          imageUrl: "",
        },
      ],
    },
    about: {
      enabled: true,
      eyebrow: "Học tập – Phát triển và Thành công cùng",
      title: `${org.shortName} – Cambridge English Empower`,
      body: `${org.name} đưa chương trình Cambridge English Empower vào giảng dạy, giúp học viên phát triển đồng đều 4 kỹ năng nghe – nói – đọc – viết, sẵn sàng cho kỳ thi Linguaskill và đạt chuẩn đầu ra CEFR.`,
      imageUrl: "",
    },
    reasons: {
      enabled: true,
      title: "Tại sao nên chọn Linguaskill?",
      items: [
        { id: uid("rs"), title: "Linh hoạt & thuận tiện", description: "Thi trực tuyến, sắp xếp lịch linh hoạt theo nhu cầu của người học." },
        { id: uid("rs"), title: "Chứng chỉ Cambridge", description: "Do Cambridge Assessment English phát triển, tin dùng toàn cầu." },
        { id: uid("rs"), title: "Đánh giá theo chuẩn CEFR", description: "Kết quả quy đổi theo Khung tham chiếu chung châu Âu, từ A1 đến C1+." },
        { id: uid("rs"), title: "Kết quả nhanh, chính xác", description: "Có kết quả ngay sau khi thi, báo cáo chi tiết theo từng kỹ năng." },
      ],
    },
    linguaskill: {
      enabled: true,
      title: "Linguaskill – more information",
      intro:
        "Linguaskill là bài thi tiếng Anh trực tuyến được phát triển bởi Cambridge Assessment English, dùng công nghệ chấm điểm thích ứng để đánh giá trình độ người học.",
      skills: [
        { id: uid("sk"), skill: "Reading", duration: "40–59 phút", format: "Trắc nghiệm", count: "Adaptive test" },
        { id: uid("sk"), skill: "Listening", duration: "40–59 phút", format: "Trắc nghiệm", count: "Adaptive test" },
        { id: uid("sk"), skill: "Writing", duration: "45 phút", format: "Viết", count: "2 phần thi" },
        { id: uid("sk"), skill: "Speaking", duration: "15 phút", format: "Ghi âm", count: "5 phần thi" },
      ],
      bands: [
        { id: uid("bd"), score: "200–210", cefr: "C1+", label: "Thành thạo" },
        { id: uid("bd"), score: "180–199", cefr: "C1", label: "Thành thạo" },
        { id: uid("bd"), score: "160–179", cefr: "B2", label: "Tốt" },
        { id: uid("bd"), score: "140–159", cefr: "B1", label: "Khá" },
        { id: uid("bd"), score: "120–139", cefr: "A2", label: "Cơ bản" },
      ],
    },
    courses: {
      enabled: true,
      title: "Khóa học đang triển khai",
      note: "Empower 2026–2027",
      selectedIds: allCourses.slice(0, 6).map((c) => c.id),
    },
    contact: {
      enabled: true,
      title: "Thông tin liên hệ",
      address: "Số 18, Phố Viên – Phường Đông Ngạc – TP. Hà Nội",
      phone: "024 3838 9633",
      email: `tuyensinh@${org.shortName.toLowerCase().replace(/\s+/g, "")}.edu.vn`,
      website: "https://unicom.edu.vn",
      taxCode: "0101489386",
      socials: [
        { id: uid("so"), platform: "Facebook", url: "https://facebook.com/" },
        { id: uid("so"), platform: "TikTok", url: "https://tiktok.com/" },
        { id: uid("so"), platform: "YouTube", url: "https://youtube.com/" },
      ],
    },
  };
}

export const newSlide = (): BannerSlide => ({ id: uid("sl"), title: "Tiêu đề banner", subtitle: "Mô tả ngắn", imageUrl: "" });
export const newReason = (): ReasonItem => ({ id: uid("rs"), title: "Lý do mới", description: "Mô tả ngắn" });
export const newSkill = (): SkillRow => ({ id: uid("sk"), skill: "Kỹ năng", duration: "30 phút", format: "Trắc nghiệm", count: "—" });
export const newBand = (): BandRow => ({ id: uid("bd"), score: "100–119", cefr: "A1", label: "Nhập môn" });
export const newSocial = (): SocialLink => ({ id: uid("so"), platform: "Instagram", url: "https://instagram.com/" });

const KEY = "unicom.landingConfigs.v1";

export function loadConfigs(): Record<string, LandingConfig> {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(window.localStorage.getItem(KEY) ?? "{}") as Record<string, LandingConfig>;
  } catch {
    return {};
  }
}

export function saveConfig(cfg: LandingConfig) {
  if (typeof window === "undefined") return;
  const all = loadConfigs();
  all[cfg.orgId] = cfg;
  window.localStorage.setItem(KEY, JSON.stringify(all));
}
