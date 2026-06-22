export type ExamAnswer = {
  questionId: string;
  question: string;
  type: "mcq" | "essay" | "short" | "speaking";
  studentAnswer: string;
  audioUrl?: string;
  correctAnswer?: string;
  autoScore?: number;
  autoMax?: number;
  autoFeedback?: string;
  manualScore?: number;
  feedback?: string;
};

export type ExamSubmission = {
  id: string;
  examId: string;
  studentName: string;
  studentClass: string;
  submittedAt: string;
  durationMinutes: number;
  status: "graded" | "pending";
  autoScore: number;
  finalScore?: number;
  answers: ExamAnswer[];
};

const baseAnswers: ExamAnswer[] = [
  {
    questionId: "q1",
    question: "Choose the correct form: She ____ to Paris last year.",
    type: "mcq",
    studentAnswer: "went",
    correctAnswer: "went",
    autoScore: 1,
  },
  {
    questionId: "q2",
    question: "Fill in the blank: I have ____ in Hanoi for 5 years.",
    type: "short",
    studentAnswer: "lived",
    correctAnswer: "lived",
    autoScore: 1,
  },
  {
    questionId: "q3",
    question: "Write a short paragraph (80-100 words) about your favorite trip.",
    type: "essay",
    studentAnswer:
      "Last summer I visited Da Nang with my family. We swam at My Khe beach, ate seafood and watched the dragon bridge breathe fire on Saturday night. The weather was hot but the sea breeze made it pleasant. I want to come back next year.",
  },
];

export const examSubmissions: ExamSubmission[] = [
  {
    id: "sub-1",
    examId: "seed-1",
    studentName: "Nguyễn Minh Anh",
    studentClass: "B1 — Fastrack",
    submittedAt: "2025-05-10T09:45:00Z",
    durationMinutes: 78,
    status: "graded",
    autoScore: 32,
    finalScore: 38,
    answers: baseAnswers,
  },
  {
    id: "sub-2",
    examId: "seed-1",
    studentName: "Trần Hữu Phúc",
    studentClass: "B1 — Fastrack",
    submittedAt: "2025-05-10T09:50:00Z",
    durationMinutes: 82,
    status: "pending",
    autoScore: 28,
    answers: baseAnswers,
  },
  {
    id: "sub-3",
    examId: "seed-1",
    studentName: "Lê Thị Hương",
    studentClass: "B1 — Fastrack",
    submittedAt: "2025-05-10T09:55:00Z",
    durationMinutes: 85,
    status: "pending",
    autoScore: 35,
    answers: baseAnswers,
  },
  {
    id: "sub-4",
    examId: "seed-2",
    studentName: "Vũ Khánh Linh",
    studentClass: "A2 — Weekend Boost",
    submittedAt: "2025-05-11T10:10:00Z",
    durationMinutes: 40,
    status: "graded",
    autoScore: 18,
    finalScore: 18,
    answers: baseAnswers.slice(0, 2),
  },
  {
    id: "sub-5",
    examId: "seed-3",
    studentName: "Đỗ Hoàng Nam",
    studentClass: "A1 — Morning Stars",
    submittedAt: "2025-05-12T08:30:00Z",
    durationMinutes: 18,
    status: "graded",
    autoScore: 9,
    finalScore: 9,
    answers: baseAnswers.slice(0, 2),
  },
];

export function getSubmissionsByExam(examId: string) {
  return examSubmissions.filter((s) => s.examId === examId);
}
