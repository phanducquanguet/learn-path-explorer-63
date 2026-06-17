export type LevelStatus = "completed" | "in-progress" | "locked" | "not-enrolled";

export type Activity = {
  id: string;
  title: string;
  type: "video" | "reading" | "quiz" | "speaking" | "writing";
  duration: number; // minutes
  done?: boolean;
  /** Giới thiệu nội dung — hiển thị cho học viên trước/khi vào bài. */
  description?: string;
  /** Chế độ luyện nói: theo từ vựng hoặc theo câu hỏi có sẵn. */
  speakingMode?: "words" | "questions";
  /** Danh sách câu hỏi/câu prompt khi speakingMode === "questions". */
  speakingPrompts?: string[];
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
        title: i === 1 ? "Luyện nói: Trả lời câu hỏi" : "Luyện nói: Phát âm chuẩn",
        type: "speaking",
        duration: 10,
        done: i < 2,
        description:
          i === 1
            ? "Đọc câu hỏi có sẵn dưới đây và luyện nói câu trả lời của bạn."
            : "Xem video mẫu của native speaker, đọc tài liệu phiên âm, sau đó luyện đọc lần lượt 5 từ vựng trọng tâm của bài.",
        speakingMode: i === 1 ? "questions" : "words",
        speakingPrompts:
          i === 1 ? ["What is your name and where are you from?"] : undefined,
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
    name: "Làm quen",
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
    name: "Khám phá",
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
    name: "Nền tảng",
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
    name: "Bứt phá",
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
    name: "Chuyên sâu",
    description: "Sử dụng ngôn ngữ hiệu quả trong môi trường chuyên nghiệp.",
    status: "locked",
    progress: 0,
    hue: 25,
    courses: [],
  },
  {
    id: "c2",
    code: "C2",
    name: "Hoàn thiện",
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

// Persona: học viên mới chỉ đang học cấp độ A1.
// Clone từ `levels`, đặt A1 = đang học (tiến độ thấp), các cấp còn lại = khoá.
export const newcomerLevels: Level[] = levels.map((lv) => {
  if (lv.code === "A1") {
    const progresses = [25, 10, 0];
    return {
      ...lv,
      status: "in-progress",
      progress: 18,
      courses: lv.courses.map((c, i) => ({ ...c, progress: progresses[i] ?? 0 })),
    };
  }
  return {
    ...lv,
    status: "locked",
    progress: 0,
    courses: [],
  };
});

export const newcomerStats = {
  name: "Minh Khôi",
  studyMinutesThisWeek: 95,
  studyMinutesGoal: 300,
  weeklyStreak: 3,
  completionRate: 12,
  averageScore: 78,
  activeCourses: 1,
  completedCourses: 0,
  weeklyChart: [
    { day: "T2", minutes: 20 },
    { day: "T3", minutes: 15 },
    { day: "T4", minutes: 10 },
    { day: "T5", minutes: 25 },
    { day: "T6", minutes: 10 },
    { day: "T7", minutes: 15 },
    { day: "CN", minutes: 0 },
  ],
};

// Persona: học viên được thêm thẳng vào lớp B2.
// A1, A2, B1 = ngoài lộ trình (học viên không học tại trung tâm này).
// B2 = đang học. C1, C2 = khoá theo lộ trình.
export const enrolledB2Levels: Level[] = levels.map((lv) => {
  if (lv.code === "B2") {
    const progresses = [22, 8];
    return {
      ...lv,
      status: "in-progress",
      progress: 15,
      courses: lv.courses.map((c, i) => ({ ...c, progress: progresses[i] ?? 0 })),
    };
  }
  if (lv.code === "C1" || lv.code === "C2") {
    return { ...lv, status: "locked", progress: 0, courses: [] };
  }
  // A1, A2, B1 — ngoài lộ trình của học viên
  return { ...lv, status: "not-enrolled", progress: 0, courses: [] };
});

export const enrolledB2Stats = {
  name: "Quỳnh Như",
  studyMinutesThisWeek: 140,
  studyMinutesGoal: 360,
  weeklyStreak: 5,
  completionRate: 15,
  averageScore: 82,
  activeCourses: 2,
  completedCourses: 0,
  weeklyChart: [
    { day: "T2", minutes: 25 },
    { day: "T3", minutes: 30 },
    { day: "T4", minutes: 20 },
    { day: "T5", minutes: 15 },
    { day: "T6", minutes: 35 },
    { day: "T7", minutes: 15 },
    { day: "CN", minutes: 0 },
  ],
};
