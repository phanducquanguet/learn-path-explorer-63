import type { QSkill, QType, QLevel, QDifficulty, BankQuestion } from "./question-bank";

export type CustomQuestion = {
  id: string;
  content: string;
  type: QType;
  level: QLevel;
  difficulty: QDifficulty;
  points: number;
  options?: string[];
  correctAnswer?: string;
  /** Bài mẫu tham khảo cho câu hỏi tự luận. */
  solution?: string;
  /** Rubric chấm tự động cho essay. */
  feedback?: { keyword: string; comment: string }[];
};


export type TestStructureItem = {
  skill: QSkill;
  /** Loại câu hỏi cụ thể, hoặc "mixed" để bốc trộn nhiều dạng. */
  type: QType | "mixed";
  level: QLevel;
  count: number;
  /** "mixed" = không giới hạn độ khó (bốc trộn). */
  difficulty?: QDifficulty | "mixed";
  /** Lọc theo tag (any-match): câu hỏi cần có ít nhất 1 tag trong danh sách. */
  tags?: string[];
  /** Giới hạn thời gian làm phần này (phút). Bỏ trống = dùng chung tổng thời lượng. */
  sectionDurationMinutes?: number;

  /** Câu hỏi đã chọn thủ công (mode fixed). */
  pickedIds?: string[];
  /** Câu hỏi do người dùng tự soạn (mode manual). */
  customQuestions?: CustomQuestion[];
  /** Câu hỏi tự soạn dạng BankQuestion (hỗ trợ đầy đủ form như ngân hàng câu hỏi). */
  customBank?: BankQuestion[];
};

export type Test = {
  id: string;
  name: string;
  description: string;
  /** Đơn vị (trường / trung tâm) mà bài thi thuộc về. */
  orgId?: string;
  classIds: string[];
  level: QLevel;
  durationMinutes: number;
  openAt: string;
  closeAt: string;
  mode: "fixed" | "random";
  structure: TestStructureItem[];
  registered: number;
  submitted: number;
  graded: number;
  avgScore?: number;
  createdAt: string;
  /** Nếu được tạo bằng cách sao chép từ bài khác. */
  copiedFromId?: string;
};

export type ProctorEventType =
  | "tab-switch"
  | "window-blur"
  | "leave-seat"
  | "multiple-faces"
  | "no-face"
  | "different-face"
  | "copy-paste"
  | "fullscreen-exit"
  | "network-drop";

export type ProctorEvent = {
  at: string; // ISO timestamp
  type: ProctorEventType;
  severity: "low" | "medium" | "high";
  detail?: string;
};

export type TestSubmission = {
  id: string;
  testId: string;
  studentName: string;
  studentClass: string;
  startedAt: string;
  submittedAt?: string;
  durationMinutes?: number;
  autoScore: number;
  manualScore?: number;
  finalScore?: number;
  status: "in-progress" | "auto-graded" | "needs-grading" | "graded";
  proctorEvents?: ProctorEvent[];
  answers: {

    questionId: string;
    question: string;
    type: "mcq" | "essay" | "short" | "tf";
    skill?: "reading" | "listening" | "writing" | "speaking" | "vocabulary" | "grammar";
    studentAnswer: string;
    studentAudioUrl?: string;
    correctAnswer?: string;
    points: number;
    awarded?: number;
    feedback?: string;
    rubric?: { criterion: string; max: number; awarded?: number; note?: string }[];
  }[];
};

const now = Date.now();
const days = (d: number) => new Date(now + d * 86400000).toISOString();

export const tests: Test[] = [
  {
    id: "test-1",
    name: "Kiểm tra giữa kỳ B1 — Tháng 5",
    description: "Bài kiểm tra giữa kỳ tổng hợp Reading + Listening + Writing.",
    orgId: "org-unicom-hcm",
    classIds: ["cls-b1-fast"],
    level: "B1",
    durationMinutes: 90,
    openAt: days(-3),
    closeAt: days(-1),
    mode: "random",
    structure: [
      { skill: "reading", type: "mcq", level: "B1", count: 10 },
      { skill: "listening", type: "mcq", level: "B1", count: 8 },
      { skill: "writing", type: "essay", level: "B1", count: 1 },
      { skill: "reading", type: "fill", level: "B1", count: 6 },
    ],
    registered: 10,
    submitted: 9,
    graded: 6,
    avgScore: 7.4,
    createdAt: days(-10),
  },
  {
    id: "test-2",
    name: "Quiz Unit 3 — A1 Morning Stars",
    description: "Quiz nhỏ kiểm tra từ vựng và ngữ pháp Unit 3.",
    orgId: "org-unicom-hn",
    classIds: ["cls-a1-morning"],
    level: "A1",
    durationMinutes: 30,
    openAt: days(1),
    closeAt: days(2),
    mode: "fixed",
    structure: [
      { skill: "reading", type: "mcq", level: "A1", count: 10 },
      { skill: "reading", type: "tf", level: "A1", count: 5 },
    ],
    registered: 14,
    submitted: 0,
    graded: 0,
    createdAt: days(-2),
  },
  {
    id: "test-3",
    name: "Đề thi cuối khóa A2 — Weekend Boost",
    description: "Đề thi cuối khóa 4 kỹ năng.",
    orgId: "org-unicom-hcm",
    classIds: ["cls-a2-weekend"],
    level: "A2",
    durationMinutes: 120,
    openAt: days(7),
    closeAt: days(8),
    mode: "random",
    structure: [
      { skill: "reading", type: "mcq", level: "A2", count: 15 },
      { skill: "listening", type: "mcq", level: "A2", count: 10 },
      { skill: "writing", type: "essay", level: "A2", count: 2 },
      { skill: "speaking", type: "short", level: "A2", count: 3 },
    ],
    registered: 16,
    submitted: 0,
    graded: 0,
    createdAt: days(-1),
  },
  {
    id: "test-4",
    name: "Mock Test B1 — Evening Pro",
    description: "Bài thi thử mô phỏng đề thi chuẩn B1.",
    orgId: "org-thpt-abc",
    classIds: ["cls-b1-evening"],
    level: "B1",
    durationMinutes: 100,
    openAt: days(-1),
    closeAt: days(3),
    mode: "random",
    structure: [
      { skill: "reading", type: "mcq", level: "B1", count: 12 },
      { skill: "listening", type: "mcq", level: "B1", count: 10 },
      { skill: "reading", type: "fill", level: "B1", count: 5 },
      { skill: "writing", type: "essay", level: "B1", count: 1 },
    ],
    registered: 13,
    submitted: 5,
    graded: 2,
    avgScore: 6.8,
    createdAt: days(-4),
  },
  {
    id: "test-1-sim-1700000001",
    name: "Kiểm tra giữa kỳ B1 — Tháng 5 — Bản tương tự 1",
    description: "Bản tương tự (đổi câu hỏi, giữ cấu trúc & độ khó).",
    orgId: "org-unicom-hcm",
    classIds: ["cls-b1-fast"],
    level: "B1",
    durationMinutes: 90,
    openAt: days(-3),
    closeAt: days(-1),
    mode: "random",
    structure: [
      { skill: "reading", type: "mcq", level: "B1", count: 10 },
      { skill: "listening", type: "mcq", level: "B1", count: 8 },
      { skill: "writing", type: "essay", level: "B1", count: 1 },
      { skill: "reading", type: "fill", level: "B1", count: 6 },
    ],
    registered: 10,
    submitted: 8,
    graded: 5,
    avgScore: 7.1,
    createdAt: days(-9),
  },
  {
    id: "test-1-sim-1700000002",
    name: "Kiểm tra giữa kỳ B1 — Tháng 5 — Bản tương tự 2",
    description: "Bản tương tự (đổi câu hỏi, giữ cấu trúc & độ khó).",
    orgId: "org-unicom-hcm",
    classIds: ["cls-b1-fast"],
    level: "B1",
    durationMinutes: 90,
    openAt: days(-3),
    closeAt: days(-1),
    mode: "random",
    structure: [
      { skill: "reading", type: "mcq", level: "B1", count: 10 },
      { skill: "listening", type: "mcq", level: "B1", count: 8 },
      { skill: "writing", type: "essay", level: "B1", count: 1 },
      { skill: "reading", type: "fill", level: "B1", count: 6 },
    ],
    registered: 10,
    submitted: 7,
    graded: 4,
    avgScore: 6.9,
    createdAt: days(-8),
  },
  {
    id: "test-4-sim-1700000003",
    name: "Mock Test B1 — Evening Pro — Bản tương tự 1",
    description: "Bản tương tự (đổi câu hỏi, giữ cấu trúc & độ khó).",
    orgId: "org-thpt-abc",
    classIds: ["cls-b1-evening"],
    level: "B1",
    durationMinutes: 100,
    openAt: days(-1),
    closeAt: days(3),
    mode: "random",
    structure: [
      { skill: "reading", type: "mcq", level: "B1", count: 12 },
      { skill: "listening", type: "mcq", level: "B1", count: 10 },
      { skill: "reading", type: "fill", level: "B1", count: 5 },
      { skill: "writing", type: "essay", level: "B1", count: 1 },
    ],
    registered: 13,
    submitted: 4,
    graded: 2,
    avgScore: 7.0,
    createdAt: days(-3),
  },
];

export const testSubmissions: TestSubmission[] = [
  {
    id: "ts-1",
    testId: "test-1",
    studentName: "Nguyễn Minh Anh",
    studentClass: "B1 — Fastrack",
    startedAt: days(-3),
    submittedAt: days(-3),
    durationMinutes: 82,
    autoScore: 18,
    manualScore: 4,
    finalScore: 22,
    status: "graded",
    proctorEvents: [
      { at: new Date(now - 3 * 86400000 + 12 * 60000).toISOString(), type: "tab-switch", severity: "medium", detail: "Chuyển sang tab khác trong 8 giây" },
      { at: new Date(now - 3 * 86400000 + 27 * 60000).toISOString(), type: "window-blur", severity: "low", detail: "Cửa sổ thi mất focus 3 giây" },
      { at: new Date(now - 3 * 86400000 + 55 * 60000).toISOString(), type: "no-face", severity: "medium", detail: "Không phát hiện khuôn mặt trong 12 giây" },
    ],
    answers: [
      {
        questionId: "Q0001",
        question: "[B1] Read the passage and choose the main idea.",
        type: "mcq",
        studentAnswer: "A",
        correctAnswer: "A",
        points: 1,
        awarded: 1,
      },
      {
        questionId: "Q0050",
        question: "[B1] Write a short paragraph (80-100 words) about your hobbies.",
        type: "essay",
        skill: "writing",
        studentAnswer:
          "I really enjoy playing guitar. I started learning when I was 12 and now I play in a small band. We practice every Saturday and sometimes perform at school events. Music helps me relax and express myself.",
        points: 5,
        awarded: 4,
        feedback: "Tốt, ý mạch lạc. Cần đa dạng cấu trúc câu hơn.",
        rubric: [
          { criterion: "Nội dung & ý tưởng (Task achievement)", max: 1.5, awarded: 1.25 },
          { criterion: "Tổ chức & mạch lạc (Coherence)", max: 1.0, awarded: 0.75 },
          { criterion: "Từ vựng (Lexical resource)", max: 1.0, awarded: 1.0 },
          { criterion: "Ngữ pháp & độ chính xác", max: 1.5, awarded: 1.0 },
        ],
      },
      {
        questionId: "Q0080",
        question: "[B1] Speaking Part 1: Describe your most memorable trip in 1-2 minutes.",
        type: "short",
        skill: "speaking",
        studentAnswer: "(Bản ghi âm 1'45) — học viên kể về chuyến đi Đà Nẵng cùng gia đình.",
        studentAudioUrl: "/audio/sample-speaking.mp3",
        points: 5,
        awarded: 4,
        feedback: "Phát âm rõ, ý mạch lạc. Chú ý nhấn trọng âm 'family', 'memorable'.",
      },
      {
        questionId: "Q0082",
        question:
          "[B1] Speaking Part 2 (Picture description): Look at the picture of a busy market and describe what you see in 60-90 seconds.",
        type: "short",
        skill: "speaking",
        studentAnswer:
          "(Bản ghi âm 1'05) — học viên miêu tả khu chợ truyền thống: gian hàng rau củ, người mua kẻ bán, không khí nhộn nhịp.",
        studentAudioUrl: "/audio/sample-speaking-picture.mp3",
        points: 5,
      },
    ],
  },
  {
    id: "ts-2",
    testId: "test-1",
    studentName: "Trần Hữu Phúc",
    studentClass: "B1 — Fastrack",
    startedAt: days(-3),
    submittedAt: days(-3),
    durationMinutes: 88,
    autoScore: 16,
    status: "needs-grading",
    proctorEvents: [
      { at: new Date(now - 3 * 86400000 + 5 * 60000).toISOString(), type: "fullscreen-exit", severity: "high", detail: "Thoát chế độ toàn màn hình" },
      { at: new Date(now - 3 * 86400000 + 6 * 60000).toISOString(), type: "tab-switch", severity: "high", detail: "Chuyển tab 22 giây" },
      { at: new Date(now - 3 * 86400000 + 14 * 60000).toISOString(), type: "multiple-faces", severity: "high", detail: "Phát hiện 2 khuôn mặt trong khung hình" },
      { at: new Date(now - 3 * 86400000 + 30 * 60000).toISOString(), type: "different-face", severity: "high", detail: "Khuôn mặt khác với ảnh đăng ký" },
      { at: new Date(now - 3 * 86400000 + 41 * 60000).toISOString(), type: "leave-seat", severity: "medium", detail: "Rời khỏi vị trí 45 giây" },
      { at: new Date(now - 3 * 86400000 + 62 * 60000).toISOString(), type: "copy-paste", severity: "medium", detail: "Dán nội dung dài (320 ký tự) vào ô trả lời" },
      { at: new Date(now - 3 * 86400000 + 70 * 60000).toISOString(), type: "tab-switch", severity: "medium", detail: "Chuyển tab 10 giây" },
    ],
    answers: [
      {
        questionId: "Q0001",
        question: "[B1] Read the passage and choose the main idea.",
        type: "mcq",
        studentAnswer: "B",
        correctAnswer: "A",
        points: 1,
        awarded: 0,
      },
      {
        questionId: "Q0050",
        question: "[B1] Write a short paragraph (80-100 words) about your hobbies.",
        type: "essay",
        skill: "writing",
        studentAnswer:
          "My hobby is cooking. I learn from YouTube and cook for my family every weekend. My favorite dish is phở bò.",
        points: 5,
        rubric: [
          { criterion: "Nội dung & ý tưởng (Task achievement)", max: 1.5 },
          { criterion: "Tổ chức & mạch lạc (Coherence)", max: 1.0 },
          { criterion: "Từ vựng (Lexical resource)", max: 1.0 },
          { criterion: "Ngữ pháp & độ chính xác", max: 1.5 },
        ],
      },
    ],
  },
  {
    id: "ts-3",
    testId: "test-1",
    studentName: "Lê Thị Hương",
    studentClass: "B1 — Fastrack",
    startedAt: days(-3),
    submittedAt: days(-3),
    durationMinutes: 90,
    autoScore: 22,
    status: "needs-grading",
    proctorEvents: [
      { at: new Date(now - 3 * 86400000 + 18 * 60000).toISOString(), type: "network-drop", severity: "low", detail: "Mất kết nối 4 giây rồi kết nối lại" },
    ],
    answers: [
      {
        questionId: "Q0001",
        question: "[B1] Read the passage and choose the main idea.",
        type: "mcq",
        studentAnswer: "A",
        correctAnswer: "A",
        points: 1,
        awarded: 1,
      },
      {
        questionId: "Q0050",
        question: "[B1] Write a short paragraph (80-100 words) about your hobbies.",
        type: "essay",
        skill: "writing",
        studentAnswer:
          "I love reading books, especially historical novels. Reading takes me to different worlds and times. I read at least one book per month.",
        points: 5,
        rubric: [
          { criterion: "Nội dung & ý tưởng (Task achievement)", max: 1.5 },
          { criterion: "Tổ chức & mạch lạc (Coherence)", max: 1.0 },
          { criterion: "Từ vựng (Lexical resource)", max: 1.0 },
          { criterion: "Ngữ pháp & độ chính xác", max: 1.5 },
        ],
      },
      {
        questionId: "Q0081",
        question: "[B1] Speaking: Talk about a person who has influenced you.",
        type: "short",
        skill: "speaking",
        studentAnswer: "(Bản ghi âm 1'30) — học viên kể về người thầy chủ nhiệm cấp 3.",
        studentAudioUrl: "/audio/sample-speaking-2.mp3",
        points: 5,
        rubric: [
          { criterion: "Phát âm (Pronunciation)", max: 1.25 },
          { criterion: "Lưu loát (Fluency)", max: 1.25 },
          { criterion: "Từ vựng (Vocabulary)", max: 1.25 },
          { criterion: "Ngữ pháp (Grammar)", max: 1.25 },
        ],
      },
    ],
  },
];

export function getTest(id: string) {
  return tests.find((t) => t.id === id);
}

export function getTestSubmissions(testId: string) {
  return testSubmissions.filter((s) => s.testId === testId);
}

export function testStatus(t: Test): "upcoming" | "open" | "closed" {
  const n = Date.now();
  if (n < new Date(t.openAt).getTime()) return "upcoming";
  if (n > new Date(t.closeAt).getTime()) return "closed";
  return "open";
}
