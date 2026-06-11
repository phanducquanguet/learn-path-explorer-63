export type LevelStatus = "completed" | "in-progress" | "locked";

export type Activity = {
  id: string;
  title: string;
  type: "video" | "reading" | "quiz" | "speaking" | "writing";
  duration: number; // minutes
  done?: boolean;
  /** Giới thiệu nội dung — hiển thị cho học viên trước/khi vào bài. */
  description?: string;
};


export type Unit = {
  id: string;
  index: number;
  title: string;
  description: string;
  score?: number;
  activities: Activity[];
};

export type Course = {
  id: string;
  title: string;
  subtitle: string;
  level: string;
  hours: number;
  progress: number;
  units: Unit[];
  classmates: { name: string; avatar?: string; scores: Record<string, number> }[];
};

export type Level = {
  id: string;
  code: string;
  name: string;
  description: string;
  status: LevelStatus;
  progress: number;
  hue: number;
  courses: Course[];
};

const mkUnits = (prefix: string, n: number): Unit[] =>
  Array.from({ length: n }).map((_, i) => ({
    id: `${prefix}-u${i + 1}`,
    index: i + 1,
    title: `Unit ${i + 1}: ${["Greetings & Introductions", "Daily Routines", "Travel Stories", "Work & Study", "Culture & Lifestyle", "Future Plans"][i % 6]}`,
    description: "Mục tiêu: nắm vững từ vựng, ngữ pháp và phản xạ giao tiếp.",
    score: i < 3 ? Math.floor(70 + Math.random() * 25) : undefined,
    activities: [
      { id: `${prefix}-u${i + 1}-a1`, title: "Video bài giảng", type: "video", duration: 12, done: i < 3 },
      { id: `${prefix}-u${i + 1}-a2`, title: "Đọc hiểu", type: "reading", duration: 15, done: i < 3 },
      {
        id: `${prefix}-u${i + 1}-a3`,
        title: "Luyện nói: Phát âm chuẩn",
        type: "speaking",
        duration: 10,
        done: i < 2,
        description:
          "Xem video mẫu của native speaker, đọc tài liệu phiên âm, sau đó luyện đọc lần lượt 5 từ vựng trọng tâm của bài.",
      },
      { id: `${prefix}-u${i + 1}-a4`, title: "Quiz cuối bài", type: "quiz", duration: 10, done: i < 2 },
    ],
  }));

const classmates = [
  { name: "Nguyễn Minh Anh", scores: { u1: 92, u2: 88, u3: 95 } },
  { name: "Trần Hữu Phúc", scores: { u1: 85, u2: 90, u3: 78 } },
  { name: "Lê Thị Hương", scores: { u1: 96, u2: 94, u3: 91 } },
  { name: "Phạm Quốc Bảo", scores: { u1: 72, u2: 80, u3: 85 } },
  { name: "Vũ Khánh Linh", scores: { u1: 88, u2: 86, u3: 92 } },
  { name: "Đỗ Hoàng Nam", scores: { u1: 79, u2: 82, u3: 88 } },
];

export const levels: Level[] = [
  {
    id: "a1",
    code: "A1",
    name: "Khởi đầu",
    description: "Nền tảng giao tiếp cơ bản, từ vựng đời sống.",
    status: "completed",
    progress: 100,
    hue: 155,
    courses: [
      {
        id: "a1-foundation",
        title: "A1 Foundation",
        subtitle: "Nền tảng tiếng Anh giao tiếp",
        level: "A1",
        hours: 36,
        progress: 100,
        units: mkUnits("a1f", 6),
        classmates,
      },
      {
        id: "a1-writing-lab",
        title: "A1 Writing Lab",
        subtitle: "Phòng lab luyện viết câu & đoạn văn cơ bản",
        level: "A1",
        hours: 20,
        progress: 78,
        units: mkUnits("a1w", 5),
        classmates,
      },
      {
        id: "a1-lr-lab",
        title: "A1 Listening and Reading Lab",
        subtitle: "Luyện nghe - đọc bám sát chủ đề đời sống",
        level: "A1",
        hours: 24,
        progress: 65,
        units: mkUnits("a1lr", 6),
        classmates,
      },
    ],
  },
  {
    id: "a2",
    code: "A2",
    name: "Sơ cấp",
    description: "Mở rộng vốn từ và ngữ pháp căn bản.",
    status: "completed",
    progress: 100,
    hue: 200,
    courses: [
      {
        id: "a2-empower",
        title: "A2 Empower",
        subtitle: "Phát triển 4 kỹ năng cân bằng",
        level: "A2",
        hours: 42,
        progress: 100,
        units: mkUnits("a2e", 6),
        classmates,
      },
    ],
  },
  {
    id: "b1",
    code: "B1",
    name: "Trung cấp",
    description: "Tự tin trao đổi trong các tình huống thường gặp.",
    status: "in-progress",
    progress: 64,
    hue: 260,
    courses: [
      {
        id: "b1-empower",
        title: "B1 Empower",
        subtitle: "Khoá học chính theo giáo trình Cambridge",
        level: "B1",
        hours: 48,
        progress: 72,
        units: mkUnits("b1e", 8),
        classmates,
      },
      {
        id: "b1-lsl",
        title: "B1 Listening & Speaking Lab",
        subtitle: "Phòng lab luyện nghe nói tương tác",
        level: "B1",
        hours: 24,
        progress: 55,
        units: mkUnits("b1l", 6),
        classmates,
      },
    ],
  },
  {
    id: "b2",
    code: "B2",
    name: "Trung cao cấp",
    description: "Diễn đạt linh hoạt, học thuật & công việc.",
    status: "in-progress",
    progress: 28,
    hue: 290,
    courses: [
      {
        id: "b2-empower",
        title: "B2 Empower",
        subtitle: "Tăng tốc tư duy ngôn ngữ học thuật",
        level: "B2",
        hours: 56,
        progress: 35,
        units: mkUnits("b2e", 8),
        classmates,
      },
      {
        id: "b2-lsl",
        title: "B2 Listening & Speaking Lab",
        subtitle: "Phản xạ nói chuyên sâu",
        level: "B2",
        hours: 28,
        progress: 20,
        units: mkUnits("b2l", 6),
        classmates,
      },
    ],
  },
  {
    id: "c1",
    code: "C1",
    name: "Cao cấp",
    description: "Sử dụng ngôn ngữ hiệu quả trong môi trường chuyên nghiệp.",
    status: "locked",
    progress: 0,
    hue: 25,
    courses: [],
  },
  {
    id: "c2",
    code: "C2",
    name: "Thành thạo",
    description: "Trình độ gần như người bản xứ.",
    status: "locked",
    progress: 0,
    hue: 5,
    courses: [],
  },
];

export const getLevel = (code: string) =>
  levels.find((l) => l.code.toLowerCase() === code.toLowerCase());

export const getCourse = (id: string) => {
  for (const lv of levels) {
    const c = lv.courses.find((c) => c.id === id);
    if (c) return { course: c, level: lv };
  }
  return null;
};

export const studentStats = {
  name: "Bảo Châu",
  studyMinutesThisWeek: 312,
  studyMinutesGoal: 420,
  weeklyStreak: 12,
  completionRate: 64,
  averageScore: 86,
  activeCourses: 3,
  completedCourses: 2,
  weeklyChart: [
    { day: "T2", minutes: 45 },
    { day: "T3", minutes: 60 },
    { day: "T4", minutes: 30 },
    { day: "T5", minutes: 55 },
    { day: "T6", minutes: 72 },
    { day: "T7", minutes: 40 },
    { day: "CN", minutes: 10 },
  ],
};
