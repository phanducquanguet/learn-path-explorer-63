export type ClassRoom = {
  id: string;
  name: string;
  levelCode: string;
  studentCount: number;
  avgProgress: number;
  avgScore: number;
  attendance: number;
  schedule: string;
  weeklyMinutes: number[];
  role: "primary" | "assistant"; // vai trò giáo viên trong lớp này
  room?: string;
  startedAt?: string;
};

export type TeacherStudent = {
  id: string;
  name: string;
  email: string;
  classId: string;
  lastActive: string; // human readable
  role: "Lớp trưởng" | "Học viên";
  scoresByUnit: { unit: string; score: number }[];
  skills: { listening: number; reading: number; writing: number; speaking: number };
};

export const teacherProfile = {
  name: "Cô Mai Lan",
  initials: "ML",
  email: "mailan@unicom.edu.vn",
  totalHoursThisWeek: 18,
};

export const classes: ClassRoom[] = [
  {
    id: "cls-a1-morning",
    name: "A1 — Morning Stars",
    levelCode: "A1",
    studentCount: 14,
    avgProgress: 82,
    avgScore: 88,
    attendance: 94,
    schedule: "T2-T4-T6 • 8:00",
    weeklyMinutes: [40, 55, 30, 60, 45, 20, 10],
    role: "primary",
    room: "P.302",
    startedAt: "08/2025",
  },
  {
    id: "cls-a1-evening",
    name: "A1 — Evening Owls",
    levelCode: "A1",
    studentCount: 12,
    avgProgress: 71,
    avgScore: 80,
    attendance: 89,
    schedule: "T3-T5 • 19:00",
    weeklyMinutes: [25, 35, 40, 28, 50, 30, 18],
    role: "primary",
    room: "P.305",
    startedAt: "09/2025",
  },
  {
    id: "cls-a2-weekend",
    name: "A2 — Weekend Boost",
    levelCode: "A2",
    studentCount: 16,
    avgProgress: 64,
    avgScore: 78,
    attendance: 91,
    schedule: "T7-CN • 9:00",
    weeklyMinutes: [10, 20, 15, 18, 22, 70, 65],
    role: "primary",
    room: "P.401",
    startedAt: "07/2025",
  },
  {
    id: "cls-b1-fast",
    name: "B1 — Fastrack",
    levelCode: "B1",
    studentCount: 10,
    avgProgress: 55,
    avgScore: 84,
    attendance: 96,
    schedule: "T2-T4-T6 • 18:30",
    weeklyMinutes: [30, 40, 50, 35, 45, 25, 15],
    role: "assistant",
    room: "P.210",
    startedAt: "10/2025",
  },
  {
    id: "cls-b1-evening",
    name: "B1 — Evening Pro",
    levelCode: "B1",
    studentCount: 13,
    avgProgress: 48,
    avgScore: 76,
    attendance: 87,
    schedule: "T3-T5 • 18:00",
    weeklyMinutes: [22, 30, 35, 28, 40, 18, 12],
    role: "assistant",
    room: "P.215",
    startedAt: "11/2025",
  },
];

const NAMES = [
  "Nguyễn Minh Anh",
  "Trần Hữu Phúc",
  "Lê Thị Hương",
  "Phạm Quốc Bảo",
  "Vũ Khánh Linh",
  "Đỗ Hoàng Nam",
  "Bùi Thu Hà",
  "Hoàng Tiến Đạt",
  "Đặng Thuỳ Trang",
  "Ngô Minh Khôi",
  "Cao Diệu Linh",
  "Phan Quang Huy",
  "Lương Bảo Châu",
  "Tạ Quỳnh Như",
  "Mai Hữu Tài",
];

const LAST_ACTIVES = [
  "5 phút trước",
  "1 giờ trước",
  "Hôm nay 09:32",
  "Hôm qua 21:10",
  "2 ngày trước",
  "3 ngày trước",
  "Tuần trước",
];

function rand(seed: number) {
  return () => {
    seed = (seed * 9301 + 49297) % 233280;
    return seed / 233280;
  };
}

export const students: TeacherStudent[] = classes.flatMap((cls, ci) => {
  const r = rand(ci * 17 + 3);
  return Array.from({ length: cls.studentCount }).map((_, i) => {
    const name = NAMES[(ci * 4 + i) % NAMES.length];
    const base = 60 + Math.floor(r() * 35);
    return {
      id: `${cls.id}-s${i + 1}`,
      name,
      email: name.toLowerCase().replace(/\s+/g, ".").normalize("NFD").replace(/[\u0300-\u036f]/g, "") + "@gmail.com",
      classId: cls.id,
      lastActive: LAST_ACTIVES[Math.floor(r() * LAST_ACTIVES.length)],
      role: i === 0 ? "Lớp trưởng" : "Học viên",
      scoresByUnit: Array.from({ length: 6 }).map((_, u) => ({
        unit: `U${u + 1}`,
        score: Math.max(40, Math.min(100, base + Math.floor(r() * 20) - 10)),
      })),
      skills: {
        listening: Math.max(40, Math.min(100, base + Math.floor(r() * 15) - 5)),
        reading: Math.max(40, Math.min(100, base + Math.floor(r() * 15) - 5)),
        writing: Math.max(40, Math.min(100, base + Math.floor(r() * 15) - 5)),
        speaking: Math.max(40, Math.min(100, base + Math.floor(r() * 15) - 5)),
      },
    };
  });
});

export const recentActivity = [
  { id: 1, name: "Lê Thị Hương", className: "A1 — Morning Stars", action: "Hoàn thành Quiz Unit 3", time: "5 phút trước", score: 92 },
  { id: 2, name: "Phạm Quốc Bảo", className: "A2 — Weekend Boost", action: "Nộp bài Reading Unit 2", time: "12 phút trước", score: 78 },
  { id: 3, name: "Đặng Thuỳ Trang", className: "B1 — Fastrack", action: "Xem video bài giảng Unit 4", time: "30 phút trước" },
  { id: 4, name: "Nguyễn Minh Anh", className: "A1 — Morning Stars", action: "Hoàn thành Quiz Unit 4", time: "1 giờ trước", score: 96 },
  { id: 5, name: "Hoàng Tiến Đạt", className: "A1 — Evening Owls", action: "Nộp bài Writing Unit 1", time: "2 giờ trước", score: 81 },
];

export const ACTIVITY_TYPES = [
  { id: "video", label: "Video bài giảng" },
  { id: "reading-pdf", label: "Tài liệu PDF" },
  { id: "audio", label: "Audio" },
] as const;

export const QUIZ_KINDS = [
  { id: "mcq", label: "Trắc nghiệm 1 đáp án" },
  { id: "mcq-multi", label: "Trắc nghiệm nhiều đáp án" },
  { id: "fill", label: "Điền vào chỗ trống" },
  { id: "matching", label: "Nối cặp" },
  { id: "drag", label: "Kéo - thả" },
  { id: "tf", label: "Đúng / Sai" },
  { id: "short", label: "Trả lời ngắn" },
  { id: "reorder", label: "Sắp xếp thứ tự" },
  { id: "listening", label: "Nghe & trả lời" },
  { id: "cloze", label: "Cloze test" },
  { id: "vocab", label: "Vocabulary card" },
] as const;

export const EXAM_SKILLS = [
  { id: "listening", label: "Nghe (Listening)" },
  { id: "reading", label: "Đọc (Reading)" },
  { id: "writing", label: "Viết (Writing)" },
  { id: "speaking", label: "Nói (Speaking)" },
] as const;
