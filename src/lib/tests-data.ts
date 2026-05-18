import type { QSkill, QType, QLevel } from "./question-bank";

export type TestStructureItem = {
  skill: QSkill;
  type: QType;
  level: QLevel;
  count: number;
};

export type Test = {
  id: string;
  name: string;
  description: string;
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
  answers: {
    questionId: string;
    question: string;
    type: "mcq" | "essay" | "short" | "tf";
    studentAnswer: string;
    correctAnswer?: string;
    points: number;
    awarded?: number;
    feedback?: string;
  }[];
};

const now = Date.now();
const days = (d: number) => new Date(now + d * 86400000).toISOString();

export const tests: Test[] = [
  {
    id: "test-1",
    name: "Kiểm tra giữa kỳ B1 — Tháng 5",
    description: "Bài kiểm tra giữa kỳ tổng hợp Reading + Listening + Writing.",
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
      { skill: "use", type: "fill", level: "B1", count: 6 },
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
    classIds: ["cls-a1-morning"],
    level: "A1",
    durationMinutes: 30,
    openAt: days(1),
    closeAt: days(2),
    mode: "fixed",
    structure: [
      { skill: "use", type: "mcq", level: "A1", count: 10 },
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
    classIds: ["cls-b1-evening"],
    level: "B1",
    durationMinutes: 100,
    openAt: days(-1),
    closeAt: days(3),
    mode: "random",
    structure: [
      { skill: "reading", type: "mcq", level: "B1", count: 12 },
      { skill: "listening", type: "mcq", level: "B1", count: 10 },
      { skill: "use", type: "cloze", level: "B1", count: 5 },
      { skill: "writing", type: "essay", level: "B1", count: 1 },
    ],
    registered: 13,
    submitted: 5,
    graded: 2,
    avgScore: 6.8,
    createdAt: days(-4),
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
        studentAnswer:
          "I really enjoy playing guitar. I started learning when I was 12 and now I play in a small band. We practice every Saturday and sometimes perform at school events. Music helps me relax and express myself.",
        points: 5,
        awarded: 4,
        feedback: "Tốt, ý mạch lạc. Cần đa dạng cấu trúc câu hơn.",
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
        studentAnswer:
          "My hobby is cooking. I learn from YouTube and cook for my family every weekend. My favorite dish is phở bò.",
        points: 5,
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
        studentAnswer:
          "I love reading books, especially historical novels. Reading takes me to different worlds and times. I read at least one book per month.",
        points: 5,
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
