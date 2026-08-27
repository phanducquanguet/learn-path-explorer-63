// Dữ liệu demo cho Dashboard tổng quan của Admin đơn vị.
// Sinh xác định (seeded) để SSR và client cho ra cùng kết quả — tránh hydration mismatch.

export type OrgStudentStatus = "on-track" | "watch" | "at-risk" | "not-started";

export type DashStudent = {
  id: string;
  name: string;
  classId: string;
  level: string;
  teacher: string;
  course: string;
  activitiesTotal: number;
  activitiesPassed: number;
  attemptsTotal: number;
  firstPassCount: number;
  active: boolean;
  currentActivity: string;
  currentAttempts: number;
  stuckDays: number;
};

export type DashClass = {
  id: string;
  name: string;
  level: string;
  teacher: string;
  courses: string[];
};

export const LEVELS = ["A1", "A2", "B1", "B2"] as const;

export const dashTeachers = [
  "Nguyễn Văn An",
  "Trần Thị Bích",
  "Lê Minh Cường",
  "Phạm Thu Dung",
  "Vũ Hoàng Em",
] as const;

const coursesByLevel: Record<string, string[]> = {
  A1: ["Empower A1", "Speaking Lab A1", "Grammar A1"],
  A2: ["Empower A2", "A2 Writing", "A2 Speaking", "Think A2"],
  B1: ["Empower B1", "B1 Listening Lab", "B1 Writing"],
  B2: ["Empower B2", "B2 Academic Writing"],
};

export const dashCourses = Object.entries(coursesByLevel).flatMap(([level, list]) =>
  list.map((name) => ({ name, level })),
);

/** LCG đơn giản, xác định theo seed. */
function rng(seed: number) {
  let s = seed % 2147483647;
  if (s <= 0) s += 2147483646;
  return () => {
        s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

const CLASS_DEFS: { code: string; level: string; teacher: string; size: number }[] = [
  { code: "A1-01", level: "A1", teacher: "Nguyễn Văn An", size: 28 },
  { code: "A1-02", level: "A1", teacher: "Lê Minh Cường", size: 26 },
  { code: "A1-03", level: "A1", teacher: "Phạm Thu Dung", size: 24 },
  { code: "A2-01", level: "A2", teacher: "Nguyễn Văn An", size: 27 },
  { code: "A2-02", level: "A2", teacher: "Nguyễn Văn An", size: 25 },
  { code: "A2-03", level: "A2", teacher: "Trần Thị Bích", size: 22 },
  { code: "B1-01", level: "B1", teacher: "Trần Thị Bích", size: 24 },
  { code: "B1-02", level: "B1", teacher: "Vũ Hoàng Em", size: 21 },
  { code: "B2-01", level: "B2", teacher: "Lê Minh Cường", size: 18 },
  { code: "B2-02", level: "B2", teacher: "Vũ Hoàng Em", size: 16 },
];

const FIRST = ["Nguyễn", "Trần", "Lê", "Phạm", "Vũ", "Hoàng", "Đặng", "Bùi", "Đỗ", "Ngô"];
const MID = ["Thu", "Minh", "Quốc", "Khánh", "Bảo", "Hải", "Gia", "Thanh"];
const LAST = ["An", "Bình", "Chi", "Dũng", "Hà", "Linh", "Nam", "Phong", "Quân", "Trang", "Vy", "Yến"];

/** Level càng cao thì tiến độ demo càng thấp (theo mô tả). */
const levelBase: Record<string, number> = { A1: 0.76, A2: 0.6, B1: 0.5, B2: 0.37 };
/** Lớp có vấn đề rõ rệt để phục vụ luồng phân tích. */
const classPenalty: Record<string, number> = { "A2-02": -0.18, "B1-01": -0.06, "A1-03": -0.12 };

export const dashClasses: DashClass[] = CLASS_DEFS.map((c) => ({
  id: c.code,
  name: c.code,
  level: c.level,
  teacher: c.teacher,
  courses: coursesByLevel[c.level] ?? [],
}));

export const dashStudents: DashStudent[] = (() => {
  const out: DashStudent[] = [];
  let seed = 20260827;
  CLASS_DEFS.forEach((cls, ci) => {
    const r = rng(seed + ci * 977);
    for (let i = 0; i < cls.size; i++) {
      const total = 40 + Math.floor(r() * 20);
      const base = (levelBase[cls.level] ?? 0.5) + (classPenalty[cls.code] ?? 0);
      const ratio = Math.max(0, Math.min(1, base + (r() - 0.5) * 0.35));
      const passed = Math.round(total * ratio);
      const firstPass = Math.round(passed * (0.5 + r() * 0.42));
      const attempts = passed + Math.round((passed - firstPass) * (1 + r() * 2)) + Math.floor(r() * 4);
      const courses = coursesByLevel[cls.level] ?? [];
      const stuckDays = ratio < 0.35 ? 2 + Math.floor(r() * 5) : Math.floor(r() * 2);
      out.push({
        id: `${cls.code}-hv${i + 1}`,
        name: `${FIRST[Math.floor(r() * FIRST.length)]} ${MID[Math.floor(r() * MID.length)]} ${LAST[Math.floor(r() * LAST.length)]}`,
        classId: cls.code,
        level: cls.level,
        teacher: cls.teacher,
        course: courses[Math.floor(r() * courses.length)] ?? courses[0]!,
        activitiesTotal: total,
        activitiesPassed: passed,
        attemptsTotal: Math.max(attempts, passed),
        firstPassCount: firstPass,
        active: r() > 0.12,
        currentActivity: `U${1 + Math.floor(r() * 8)} · Act ${1 + Math.floor(r() * 8)}`,
        currentAttempts: 1 + Math.floor(r() * 7),
        stuckDays,
      });
    }
  });
  return out;
})();

export function studentProgress(s: DashStudent) {
  return s.activitiesTotal ? s.activitiesPassed / s.activitiesTotal : 0;
}

export function studentStatus(s: DashStudent): OrgStudentStatus {
  const p = studentProgress(s);
  if (s.activitiesPassed === 0) return "not-started";
  if (p < 0.4 || (s.currentAttempts >= 4 && s.stuckDays >= 3)) return "at-risk";
  if (p < 0.6) return "watch";
  return "on-track";
}

export const STATUS_LABEL: Record<OrgStudentStatus, string> = {
  "on-track": "Đúng tiến độ",
  watch: "Cần theo dõi",
  "at-risk": "Cần hỗ trợ",
  "not-started": "Chưa bắt đầu",
};

export const STATUS_COLOR: Record<OrgStudentStatus, string> = {
  "on-track": "hsl(160 70% 42%)",
  watch: "hsl(38 92% 50%)",
  "at-risk": "hsl(0 72% 55%)",
  "not-started": "hsl(220 9% 65%)",
};

/** Xu hướng tiến độ theo tuần (T1 → T6). */
export const weeklyTrend = [
  { week: "T1", progress: 41, firstPass: 66 },
  { week: "T2", progress: 47, firstPass: 68 },
  { week: "T3", progress: 52, firstPass: 70 },
  { week: "T4", progress: 56, firstPass: 69 },
  { week: "T5", progress: 60, firstPass: 72 },
  { week: "T6", progress: 64, firstPass: 73 },
];

/** Activity gây khó nhất toàn đơn vị. */
export const hardestActivities = [
  { activity: "Unit 3 · Act 5", course: "Think A2", level: "A2", learners: 125, hardRate: 36 },
  { activity: "Unit 5 · Act 2", course: "A2 Writing", level: "A2", learners: 98, hardRate: 31 },
  { activity: "Unit 2 · Act 7", course: "Speaking Lab A1", level: "A1", learners: 145, hardRate: 27 },
  { activity: "Unit 4 · Act 3", course: "B1 Writing", level: "B1", learners: 87, hardRate: 25 },
  { activity: "Unit 6 · Act 1", course: "Empower B2", level: "B2", learners: 64, hardRate: 23 },
];

export function pct(n: number) {
  return `${Math.round(n * 100)}%`;
}
