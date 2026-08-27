/**
 * Dữ liệu demo cho chức năng "Luyện thi" của học viên:
 * mỗi đề có giới hạn số lượt làm (1 lượt, nhiều lượt hoặc không giới hạn),
 * mỗi lượt làm lưu điểm tổng, điểm theo kỹ năng và chi tiết từng câu.
 */

export type PracticeSkill = "listening" | "reading" | "writing" | "speaking";

export const SKILL_LABEL: Record<PracticeSkill, string> = {
  listening: "Listening",
  reading: "Reading",
  writing: "Writing",
  speaking: "Speaking",
};

export type PracticeSkillScore = {
  skill: PracticeSkill;
  earned: number;
  total: number;
  questions: number;
};

export type PracticeAnswer = {
  no: number;
  skill: PracticeSkill;
  question: string;
  type: "mcq" | "short" | "essay" | "speaking";
  studentAnswer: string;
  correctAnswer?: string;
  points: number;
  awarded: number;
  feedback?: string;
};

export type PracticeAttempt = {
  id: string;
  testId: string;
  attemptNo: number;
  submittedAt: string;
  durationMinutes: number;
  earned: number;
  total: number;
  status: "graded" | "needs-grading";
  skills: PracticeSkillScore[];
  answers: PracticeAnswer[];
  note?: string;
};

export type PracticeTest = {
  id: string;
  code: string;
  name: string;
  description?: string;
  level: string;
  durationMinutes: number;
  questionCount: number;
  totalPoints: number;
  paperCount: number;
  /** null = không giới hạn số lượt làm. */
  maxAttempts: number | null;
  skills: PracticeSkill[];
  className: string;
};

/* ------------------------------------------------------------------ */
/* CEFR                                                                */
/* ------------------------------------------------------------------ */

export function cefrOf(pct: number): string {
  if (pct >= 90) return "C1";
  if (pct >= 75) return "B2";
  if (pct >= 60) return "B1";
  if (pct >= 40) return "A2";
  if (pct >= 20) return "A1";
  return "Pre-A1";
}

export const PASS_THRESHOLD = 60;

/* ------------------------------------------------------------------ */
/* Đề luyện thi                                                        */
/* ------------------------------------------------------------------ */

export const practiceTests: PracticeTest[] = [
  {
    id: "pt-trial-a",
    code: "ENGTRIAL-A",
    name: "Cambridge English Test Trial — Đề A",
    description: "Đề thi thử 2 kỹ năng, dùng để xếp lớp đầu vào. Chỉ được làm 1 lần.",
    level: "A2",
    durationMinutes: 100,
    questionCount: 14,
    totalPoints: 55,
    paperCount: 3,
    maxAttempts: 1,
    skills: ["listening", "reading"],
    className: "A2 class",
  },
  {
    id: "pt-lingtest",
    code: "LINGTEST",
    name: "Linguaskill Practice — Full Test",
    description: "Đề luyện 4 kỹ năng theo format Linguaskill, tối đa 4 lượt làm.",
    level: "B1",
    durationMinutes: 100,
    questionCount: 20,
    totalPoints: 80,
    paperCount: 3,
    maxAttempts: 4,
    skills: ["listening", "reading", "writing", "speaking"],
    className: "B1 class",
  },
  {
    id: "pt-booster",
    code: "NB-BOOST-A2",
    name: "Reading & Listening Booster A2",
    description: "Đề luyện ngắn, làm lại không giới hạn để cải thiện phản xạ.",
    level: "A2",
    durationMinutes: 40,
    questionCount: 10,
    totalPoints: 30,
    paperCount: 1,
    maxAttempts: null,
    skills: ["listening", "reading"],
    className: "A2 class",
  },
  {
    id: "pt-grammar-a1",
    code: "NB-GRAM-A1",
    name: "Grammar Drill A1 — Unit 1-4",
    description: "Đề luyện ngữ pháp cơ bản, tối đa 3 lượt làm.",
    level: "A1",
    durationMinutes: 25,
    questionCount: 12,
    totalPoints: 24,
    paperCount: 1,
    maxAttempts: 3,
    skills: ["reading"],
    className: "A1 class",
  },
];

/* ------------------------------------------------------------------ */
/* Sinh dữ liệu lượt làm (deterministic để SSR khớp client)            */
/* ------------------------------------------------------------------ */

const QUESTION_POOL: Record<PracticeSkill, { q: string; type: PracticeAnswer["type"]; a: string; c: string }[]> = {
  listening: [
    { q: "Where's the girl going this afternoon?", type: "mcq", a: "To the library", c: "To the swimming pool" },
    { q: "What time does the train leave?", type: "mcq", a: "9:15", c: "9:15" },
    { q: "How much is the ticket?", type: "mcq", a: "12 pounds", c: "10 pounds" },
    { q: "Complete the note: The meeting is on ____.", type: "short", a: "Monday", c: "Monday" },
    { q: "Who is the man talking to?", type: "mcq", a: "His teacher", c: "His teacher" },
  ],
  reading: [
    { q: "Choose the correct form: She ____ to Paris last year.", type: "mcq", a: "went", c: "went" },
    { q: "The word 'crowded' in line 3 means ____.", type: "mcq", a: "quiet", c: "full of people" },
    { q: "Fill in the blank: I have lived here ____ 2019.", type: "short", a: "since", c: "since" },
    { q: "What is the main idea of paragraph 2?", type: "mcq", a: "City transport", c: "City transport" },
    { q: "Choose the best title for the passage.", type: "mcq", a: "A busy weekend", c: "Life in a small town" },
  ],
  writing: [
    {
      q: "Write an email (50-60 words) to invite your friend to your birthday party.",
      type: "essay",
      a: "Hi Nam, I have a birthday party on Saturday at 6 p.m. at my house. There will be food, music and some games. Please come and bring your sister if she is free. Let me know soon. See you, Minh Anh",
      c: "—",
    },
    {
      q: "Describe the chart about students' favourite sports (80-100 words).",
      type: "essay",
      a: "The chart shows that football is the most popular sport with 40% of students, followed by badminton at 25%. Swimming and running are chosen by fewer students. Overall, team sports are more popular than individual sports in this school.",
      c: "—",
    },
  ],
  speaking: [
    {
      q: "Speaking Part 1: Talk about your hometown in about 1 minute.",
      type: "speaking",
      a: "(Bản chép tự động) My hometown is Hai Phong, a port city in northern Vietnam. It is famous for seafood, especially crab noodle soup...",
      c: "—",
    },
    {
      q: "Speaking Part 2: Describe a trip you enjoyed.",
      type: "speaking",
      a: "(Bản chép tự động) Last summer I went to Da Nang with my family. We swam at My Khe beach and ate a lot of seafood...",
      c: "—",
    },
  ],
};

function buildAttempt(
  test: PracticeTest,
  attemptNo: number,
  pct: number,
  submittedAt: string,
  durationMinutes: number,
  opts?: { status?: PracticeAttempt["status"]; note?: string },
): PracticeAttempt {
  const perSkill = Math.floor(test.questionCount / test.skills.length);
  const answers: PracticeAnswer[] = [];
  let no = 0;
  test.skills.forEach((skill, si) => {
    const count =
      si === test.skills.length - 1 ? test.questionCount - perSkill * (test.skills.length - 1) : perSkill;
    const pool = QUESTION_POOL[skill];
    for (let i = 0; i < count; i++) {
      const item = pool[i % pool.length]!;
      const points = skill === "writing" || skill === "speaking" ? 5 : 2;
      // Phân bổ đúng/sai theo tỉ lệ pct một cách xác định.
      const ratio = (i + 1) / count;
      const full = ratio <= pct / 100;
      const partial = !full && skill !== "mcq" && (skill === "writing" || skill === "speaking");
      const awarded = full ? points : partial ? Math.round(points * 0.6 * 10) / 10 : 0;
      no += 1;
      answers.push({
        no,
        skill,
        question: item.q,
        type: item.type,
        studentAnswer: item.a,
        correctAnswer: item.type === "essay" || item.type === "speaking" ? undefined : item.c,
        points,
        awarded,
        feedback:
          item.type === "essay"
            ? "AI: Ý tưởng rõ ràng, đúng format email. Cần đa dạng cấu trúc câu và kiểm tra lỗi giới từ."
            : item.type === "speaking"
              ? "AI: Phát âm rõ, ngữ điệu tự nhiên. Một số chỗ nói nhanh khiến trọng âm chưa chuẩn."
              : undefined,
      });
    }
  });

  const total = answers.reduce((s, a) => s + a.points, 0);
  const earned = Math.round(answers.reduce((s, a) => s + a.awarded, 0) * 10) / 10;

  const skills: PracticeSkillScore[] = test.skills.map((skill) => {
    const items = answers.filter((a) => a.skill === skill);
    return {
      skill,
      questions: items.length,
      earned: Math.round(items.reduce((s, a) => s + a.awarded, 0) * 10) / 10,
      total: items.reduce((s, a) => s + a.points, 0),
    };
  });

  return {
    id: `${test.id}-att-${attemptNo}`,
    testId: test.id,
    attemptNo,
    submittedAt,
    durationMinutes,
    earned,
    total,
    status: opts?.status ?? "graded",
    skills,
    answers,
    note: opts?.note,
  };
}

const t = (d: number, h = 9, m = 30) => {
  const base = new Date(Date.UTC(2026, 7, 27, h - 7, m, 0));
  base.setUTCDate(base.getUTCDate() - d);
  return base.toISOString();
};

const byId = (id: string) => practiceTests.find((p) => p.id === id)!;

export const practiceAttempts: PracticeAttempt[] = [
  // Đề chỉ 1 lượt làm → đã dùng hết lượt.
  buildAttempt(byId("pt-trial-a"), 1, 46, t(9, 9, 40), 88, {
    note: "Lượt thi thử xếp lớp đầu vào.",
  }),

  // Đề nhiều lượt → tiến bộ dần qua từng lượt, lượt cuối còn chờ chấm tự luận.
  buildAttempt(byId("pt-lingtest"), 1, 42, t(14, 19, 5), 96),
  buildAttempt(byId("pt-lingtest"), 2, 58, t(8, 20, 15), 92),
  buildAttempt(byId("pt-lingtest"), 3, 74, t(2, 18, 45), 85, {
    status: "needs-grading",
    note: "Phần Writing & Speaking đang chờ giáo viên chấm.",
  }),

  // Đề không giới hạn lượt.
  buildAttempt(byId("pt-booster"), 1, 55, t(6, 8, 20), 34),
  buildAttempt(byId("pt-booster"), 2, 82, t(1, 8, 10), 28),
];

/* ------------------------------------------------------------------ */
/* Truy vấn                                                            */
/* ------------------------------------------------------------------ */

export function attemptsOf(testId: string) {
  return practiceAttempts
    .filter((a) => a.testId === testId)
    .sort((a, b) => a.attemptNo - b.attemptNo);
}

export type PracticeSummary = {
  test: PracticeTest;
  attempts: PracticeAttempt[];
  used: number;
  remaining: number | null;
  canRetake: boolean;
  latest?: PracticeAttempt;
  best?: PracticeAttempt;
  avgPct: number;
  deltaPct: number | null;
};

export function pctOf(a: PracticeAttempt) {
  return a.total > 0 ? Math.round((a.earned / a.total) * 100) : 0;
}

export function summaryOf(test: PracticeTest): PracticeSummary {
  const attempts = attemptsOf(test.id);
  const used = attempts.length;
  const remaining = test.maxAttempts == null ? null : Math.max(0, test.maxAttempts - used);
  const latest = attempts[attempts.length - 1];
  const best = attempts.reduce<PracticeAttempt | undefined>(
    (acc, a) => (!acc || pctOf(a) > pctOf(acc) ? a : acc),
    undefined,
  );
  const avgPct = used > 0 ? Math.round(attempts.reduce((s, a) => s + pctOf(a), 0) / used) : 0;
  const deltaPct =
    used >= 2 ? pctOf(attempts[used - 1]!) - pctOf(attempts[used - 2]!) : null;
  return {
    test,
    attempts,
    used,
    remaining,
    canRetake: remaining == null || remaining > 0,
    latest,
    best,
    avgPct,
    deltaPct,
  };
}

export function practiceSummaries() {
  return practiceTests.map(summaryOf);
}
