import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  ChevronDown,
  CircleDashed,
  Clock,
  GripVertical,
  Columns2,
  Rows2,
  Mic,
  Pin,
  

  RotateCcw,
  Sparkles,
  Trophy,
  X,

} from "lucide-react";
import { cn } from "@/lib/utils";


/* ============================================================
 * Types
 * ============================================================ */

type Status = "correct" | "partial" | "incorrect";

type BaseQ = {
  id: string;
  index: number;
  prompt: string;
  maxScore: number;
};

type QSingle = BaseQ & { kind: "single"; options: string[]; answer: number };
type QMulti = BaseQ & { kind: "multi"; options: string[]; answer: number[] };
type QFill = BaseQ & { kind: "fill"; blanks: string[] };
type QEssay = BaseQ & {
  kind: "essay";
  brief: string;
  minWords: number;
  maxWords?: number;
  /** Từ khoá dùng để chấm tự động — dùng càng nhiều keyword càng cao điểm. */
  keywords: string[];
  /** Bài mẫu / đáp án gợi ý — hiện khi xem kết quả. */
  solution: string;
  /** Nhận xét theo từng keyword — hiện ở bảng Feedback khi xem kết quả. */
  feedback?: { keyword: string; comment: string }[];
};
type QMatchItem = { text: string; image?: string; audio?: string };
type QMatch = BaseQ & {
  kind: "match";
  /** Item bên trái — có thể kèm ảnh/audio (đồng bộ với cấu hình admin). */
  leftItems: QMatchItem[];
  right: string[];
  answer: number[];
};
type QRewrite = BaseQ & {
  kind: "rewrite";
  items: { source: string; answer: string }[];
};
type QHighlight = BaseQ & {
  kind: "highlight";
  /** Each sentence has one wrong word; user clicks it and types the correction. */
  items: { sentence: string; wrongWord: string; correction: string }[];
};
type QSequence = BaseQ & { kind: "sequence"; items: string[] };
type QAudio = BaseQ & { kind: "audio"; sentence: string };
type QGapMulti = BaseQ & {
  kind: "gapmulti";
  blanks: { options: string[]; answer: number }[];
};
type QListening = BaseQ & {
  kind: "listening";
  audio: { code: string; label: string; durationLabel: string };
  subQuestions: { id: string; prompt: string; options: string[]; answer: number }[];
};
type QReading = BaseQ & {
  kind: "reading";
  /** Tiêu đề bài đọc (hiển thị trên cột passage). */
  title?: string;
  /** Nội dung bài đọc nhiều đoạn, giữ \n. */
  passage: string;
  /** Các câu hỏi khai thác bài đọc — MCQ 4 lựa chọn. */
  subQuestions: { id: string; prompt: string; options: string[]; answer: number }[];
};

export type Question =
  | QSingle
  | QMulti
  | QFill
  | QEssay
  | QMatch
  | QRewrite
  | QHighlight
  | QSequence
  | QAudio
  | QGapMulti
  | QListening
  | QReading;

/* ============================================================
 * Sample bank (English)
 * ============================================================ */

function hash(str: string) {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) | 0;
  return Math.abs(h);
}
function shuffle<T>(arr: T[], seed: number): T[] {
  const a = [...arr];
  let s = seed || 1;
  for (let i = a.length - 1; i > 0; i--) {
    s = (s * 9301 + 49297) % 233280;
    const j = Math.floor((s / 233280) * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function buildQuiz(quizId: string): Question[] {
  const base: Question[] = [
    {
      id: "q1",
      index: 1,
      kind: "single",
      maxScore: 1,
      prompt: "Choose the correct answer: Which sentence uses the present perfect correctly?",
      options: [
        "I have lived in Hanoi since 2018.",
        "I am living in Hanoi since 2018.",
        "I lived in Hanoi since 2018.",
        "I live in Hanoi since 2018.",
      ],
      answer: 0,
    },
    {
      id: "q2",
      index: 2,
      kind: "fill",
      maxScore: 2,
      prompt: "Fill in the blanks: Water boils at {1} when atmospheric pressure equals {2}.",
      blanks: ["100°C", "1 atm"],
    },
    {
      id: "q3",
      index: 3,
      kind: "multi",
      maxScore: 2,
      prompt: "Multi choice: Which of the following are renewable energy sources?",
      options: ["Solar power", "Coal", "Wind power", "Natural gas"],
      answer: [0, 2],
    },
    {
      id: "q5",
      index: 5,
      kind: "match",
      maxScore: 4,
      prompt:
        "Match each picture / audio clue on the left with the correct statement on the right.",
      leftItems: [
        {
          text: "A floating piece of debris in low Earth orbit.",
          image:
            "https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?auto=format&fit=crop&w=600&q=70",
        },
        {
          text: "The night sky we are slowly losing.",
          image:
            "https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?auto=format&fit=crop&w=600&q=70",
          audio: "https://www.soundjay.com/buttons/sounds/beep-07a.mp3",
        },
      ],
      right: [
        "Space junk can include anything from motors to nuts and bolts, varying in size from tiny paint flakes to huge metal pieces.",
        "The sky will be crawling with moving satellites and the number of stars you can see will be minimal.",
        "But their numbers are growing so quickly that they threaten the very systems we rely on.",
        "Space junk can travel at speeds of up to 28,000 km/h — roughly seven times faster than a speeding bullet.",
      ],
      answer: [0, 2],
    },
    {
      id: "q6",
      index: 6,
      kind: "rewrite",
      maxScore: 2,
      prompt: "Rewrite each sentence using the verb in brackets, keeping the meaning.",
      items: [
        { source: "He is happy. (feel)", answer: "He feels happy." },
        { source: "She is tired. (feel)", answer: "She feels tired." },
      ],
    },
    {
      id: "q7",
      index: 7,
      kind: "highlight",
      maxScore: 3,
      prompt:
        "Each sentence contains one incorrect word. Click the wrong word, then type the correct version.",
      items: [
        {
          sentence: "She don't like coffee in the morning.",
          wrongWord: "don't",
          correction: "doesn't",
        },
        {
          sentence: "There is many people waiting outside the office.",
          wrongWord: "is",
          correction: "are",
        },
        {
          sentence: "I have went to Paris three times last year.",
          wrongWord: "went",
          correction: "been",
        },
      ],
    },
    {
      id: "q8",
      index: 8,
      kind: "sequence",
      maxScore: 4,
      prompt: "Drag the sentences into the correct order to form a coherent paragraph.",
      items: [
        "Space junk can include anything from motors to nuts and bolts.",
        "These items vary in size, from tiny paint flakes to huge pieces of metal.",
        "But their numbers are growing so quickly that they threaten the systems we rely on.",
        "Some pieces can travel up to 28,000 km/h — seven times faster than a speeding bullet.",
      ],
    },
    {
      id: "q9",
      index: 9,
      kind: "audio",
      maxScore: 3,
      prompt: "Record yourself reading the sentence below.",
      sentence: "Practice makes perfect — keep going every single day!",
    },
    {
      id: "q10",
      index: 10,
      kind: "gapmulti",
      maxScore: 2,
      prompt:
        "Multi choice gap fill: If you keep practising, you {1} fluent in no time. Failure is just a stepping stone — never accept {2}.",
      blanks: [
        { options: ["will become", "would become", "are becoming"], answer: 0 },
        { options: ["success", "defeat", "victory"], answer: 1 },
      ],
    },
    {
      id: "q11",
      index: 11,
      kind: "listening",
      maxScore: 5,
      prompt:
        "Listen to the conversation between Anna and Mark at the supermarket, then answer the 5 questions below.",
      audio: {
        code: "1.84",
        label: "Conversation: At the supermarket",
        durationLabel: "1:42",
      },
      subQuestions: [
        {
          id: "q11-1",
          prompt: "1. Where are Anna and Mark?",
          options: ["At a restaurant", "At a supermarket", "At Anna's house", "At a market stall"],
          answer: 1,
        },
        {
          id: "q11-2",
          prompt: "2. What does Anna want to buy first?",
          options: ["Bread and eggs", "Fruit and vegetables", "Meat and rice", "Fish and bread"],
          answer: 1,
        },
        {
          id: "q11-3",
          prompt: "3. Why doesn't Mark want fish?",
          options: ["It is too expensive", "He doesn't like fish", "He is allergic to fish", "There is no fish today"],
          answer: 1,
        },
        {
          id: "q11-4",
          prompt: "4. How many eggs do they buy?",
          options: ["Six", "Ten", "Twelve", "Twenty"],
          answer: 2,
        },
        {
          id: "q11-5",
          prompt: "5. What do they decide to cook for dinner?",
          options: ["Rice with vegetables", "Meat with bread", "Fish and rice", "Eggs and fruit"],
          answer: 0,
        },
      ],
    },
    {
      id: "q12",
      index: 12,
      kind: "essay",
      maxScore: 5,
      prompt:
        "Write a short email (80–120 words) to your friend Jordan replying to their visit plan next month.",
      brief:
        "Bạn không rảnh trong tuần Jordan ghé thăm. Hãy: (1) cảm ơn, (2) giải thích lý do bận, (3) gợi ý một địa điểm ở thành phố, (4) đề xuất gặp lại vào dịp khác.",
      minWords: 80,
      maxWords: 120,
      keywords: [
        "Dear Jordan",
        "thank",
        "unfortunately",
        "work",
        "visit",
        "old town",
        "riverside",
        "December",
        "best wishes",
      ],
      solution:
        "Dear Jordan,\n\nThank you for letting me know about your trip next month. Unfortunately, I'll be away for work that week, so I won't be able to meet you in person — I'm really sorry about the timing.\n\nWhile you're here, you should definitely visit the old town and take a walk along the riverside at sunset; it's the most beautiful part of the city. The little café next to the bridge is a must-try.\n\nHopefully we can catch up around December when things calm down. Have a wonderful trip!\n\nBest wishes,\nAlex",
      feedback: [
        { keyword: "Dear Jordan", comment: "Cách mở đầu email rất tự nhiên." },
        { keyword: "thank", comment: "Hãy cảm ơn Jordan vì đã báo trước." },
        { keyword: "unfortunately", comment: "Dùng từ nối để báo tin không vui." },
        { keyword: "work", comment: "Giải thích rõ lý do bạn bận." },
        { keyword: "visit", comment: "Gợi ý cho Jordan ghé thăm địa điểm cụ thể." },
        { keyword: "old town", comment: "Đề xuất một địa danh nổi bật trong khu vực." },
        { keyword: "riverside", comment: "Thêm chi tiết để gợi ý sinh động hơn." },
        { keyword: "December", comment: "Đề xuất một thời điểm khác để gặp lại." },
        { keyword: "best wishes", comment: "Kết thư đúng phong cách thân mật." },
      ],
    },
  ];

  // Question Set — Reading: chỉ thêm vào quiz cuối bài của các unit B1
  if (/^b1/i.test(quizId)) {
    base.push({
      id: "qset-reading-b1",
      index: base.length + 1,
      kind: "reading",
      maxScore: 6,
      prompt:
        "Đọc bài viết bên trái rồi trả lời 6 câu hỏi bên phải. Bài đọc sẽ luôn hiển thị khi bạn cuộn câu hỏi.",
      title: "The Rise of Remote Work",
      passage:
        "Over the past decade, remote work has transformed from a rare perk into a mainstream way of working. Improvements in video conferencing, cloud storage and project-management tools have made it possible for employees to collaborate from almost anywhere in the world. The COVID-19 pandemic accelerated this shift dramatically: in 2020, millions of office workers were suddenly required to work from home, and many companies discovered that productivity did not fall as they had feared.\n\nFor employees, the benefits are clear. Without a daily commute, workers gain extra hours for family, exercise or rest. Many also report better focus because they can avoid the constant interruptions of an open-plan office. However, remote work is not without its challenges. Some people struggle with loneliness, while others find it difficult to separate work from personal life and end up working longer hours than before.\n\nCompanies, meanwhile, are still experimenting. A few large firms have ordered all staff back to the office, arguing that face-to-face contact is essential for creativity. Others have embraced a permanent hybrid model, allowing employees to choose where they work two or three days a week. Most experts agree that the future of work will not be fully remote nor fully in-office, but a flexible mix designed around the needs of each team.",
      subQuestions: [
        {
          id: "qset-r1",
          prompt: "What is the main idea of the passage?",
          options: [
            "Remote work is a passing trend that will soon disappear.",
            "Remote work has become common and is reshaping how companies operate.",
            "Open-plan offices are more productive than working from home.",
            "The COVID-19 pandemic ended remote work for most companies.",
          ],
          answer: 1,
        },
        {
          id: "qset-r2",
          prompt: "According to the passage, what helped make remote work possible?",
          options: [
            "Government regulations",
            "Cheaper housing in rural areas",
            "Better video conferencing and collaboration tools",
            "A reduction in working hours",
          ],
          answer: 2,
        },
        {
          id: "qset-r3",
          prompt: "Which statement about productivity in 2020 is TRUE?",
          options: [
            "Productivity fell sharply when employees worked from home.",
            "Many companies found that productivity did not drop as expected.",
            "Productivity was impossible to measure remotely.",
            "Only managers were able to stay productive.",
          ],
          answer: 1,
        },
        {
          id: "qset-r4",
          prompt: "Which benefit of remote work for employees is mentioned?",
          options: [
            "Higher salaries",
            "Free office equipment",
            "Extra time for family, exercise or rest",
            "Guaranteed promotion",
          ],
          answer: 2,
        },
        {
          id: "qset-r5",
          prompt: "Which is mentioned as a challenge of remote work?",
          options: [
            "Slower internet at home",
            "Loneliness and difficulty separating work from personal life",
            "Lack of meetings",
            "Higher office rental costs",
          ],
          answer: 1,
        },
        {
          id: "qset-r6",
          prompt: "What do most experts predict about the future of work?",
          options: [
            "Everyone will work fully remotely.",
            "Everyone will return to the office full-time.",
            "A flexible mix of remote and office work will dominate.",
            "Companies will stop hiring new employees.",
          ],
          answer: 2,
        },
      ],
    });
  }

  return base;
}

/* ============================================================
 * Feedback
 * ============================================================ */

const FEEDBACK: Record<Status, { label: string; message: string }> = {
  correct: {
    label: "Correct",
    message: "Excellent work — keep it up! You nailed this one.",
  },
  partial: {
    label: "Partially correct",
    message:
      "You're on the right track. The full answer will be revealed at the end of the quiz.",
  },
  incorrect: {
    label: "Incorrect",
    message:
      "Don't worry — every attempt is progress. The correct answer will be shown at the end of the quiz.",
  },
};

/* ============================================================
 * Component
 * ============================================================ */

type AnswerState = unknown;
type Result = { status: Status; earned: number };

export function QuizRunner({
  quizId,
  title,
  examCode,
  durationMinutes,
  hue,
  onExit,
}: {
  quizId: string;
  title?: string;
  examCode?: string;
  durationMinutes?: number;
  hue: number;
  onExit: () => void;
}) {

  const questions = useMemo(() => buildQuiz(quizId), [quizId]);
  const [idx, setIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, AnswerState>>({});
  const [results, setResults] = useState<Record<string, Result>>({});
  const [phase, setPhase] = useState<"running" | "summary" | "review">("running");
  const [reviewIdx, setReviewIdx] = useState(0);
  const [notes, setNotes] = useState<Record<string, string[]>>({});
  const [noteDraft, setNoteDraft] = useState("");

  const q = questions[idx];
  const result = results[q?.id];

  const totalMax = questions.reduce((s, x) => s + x.maxScore, 0);
  const totalEarned = Object.values(results).reduce((s, r) => s + r.earned, 0);
  const answeredCount = questions.filter((qq) => hasAnswer(qq, answers[qq.id])).length;

  // Countdown timer (client only to avoid SSR mismatch)
  const totalSeconds = (durationMinutes ?? 60) * 60;
  const [remaining, setRemaining] = useState<number | null>(null);
  useEffect(() => {
    if (phase !== "running") return;
    setRemaining((r) => (r == null ? totalSeconds : r));
    const t = window.setInterval(() => {
      setRemaining((r) => {
        if (r == null) return totalSeconds;
        if (r <= 1) {
          window.clearInterval(t);
          return 0;
        }
        return r - 1;
      });
    }, 1000);
    return () => window.clearInterval(t);
  }, [phase, totalSeconds]);
  const fmtTime = (s: number) => {
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const sec = s % 60;
    const pad = (n: number) => String(n).padStart(2, "0");
    return h > 0 ? `${pad(h)}:${pad(m)}:${pad(sec)}` : `${pad(m)}:${pad(sec)}`;
  };


  const setAnswer = (val: AnswerState) =>
    setAnswers((a) => ({ ...a, [q.id]: val }));
  const next = () => {
    if (idx < questions.length - 1) setIdx(idx + 1);
  };
  const prev = () => {
    if (idx > 0) setIdx(idx - 1);
  };
  const finishQuiz = () => {
    const graded: Record<string, Result> = {};
    for (const qq of questions) {
      graded[qq.id] = hasAnswer(qq, answers[qq.id])
        ? grade(qq, answers[qq.id])
        : { status: "incorrect", earned: 0 };
    }
    setResults(graded);
    setPhase("summary");
  };

  const reset = () => {
    setAnswers({});
    setResults({});
    setNotes({});
    setIdx(0);
    setPhase("running");
  };

  const addNote = (qid: string, text: string) => {
    const t = text.trim();
    if (!t) return;
    setNotes((n) => ({ ...n, [qid]: [...(n[qid] ?? []), t] }));
    setNoteDraft("");
  };

  const accent = `oklch(0.55 0.2 ${hue})`;
  const accent2 = `oklch(0.45 0.22 ${(hue + 40) % 360})`;

  if (phase === "summary") {
    const pct = Math.round((totalEarned / totalMax) * 100);
    const correctCount = Object.values(results).filter((r) => r.status === "correct").length;
    const partialCount = Object.values(results).filter((r) => r.status === "partial").length;
    const incorrectCount = Object.values(results).filter((r) => r.status === "incorrect").length;
    return (
      <div className="space-y-5">
        <div
          className="overflow-hidden rounded-3xl p-6 text-white shadow-elevated sm:p-8"
          style={{ background: `linear-gradient(135deg, ${accent}, ${accent2})` }}
        >
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-white/85">
            <Trophy className="h-4 w-4" /> Quiz completed
          </div>
          <div className="mt-3 flex items-end gap-3">
            <div className="font-display text-6xl font-bold leading-none">{totalEarned}</div>
            <div className="pb-2 text-xl text-white/85">/ {totalMax} pts</div>
          </div>
          <div className="mt-2 text-sm text-white/85">
            Accuracy: <span className="font-semibold">{pct}%</span> —{" "}
            {pct >= 70 ? "Great job, you passed!" : "Review and try again to improve."}
          </div>
          <div className="mt-5 h-2 w-full overflow-hidden rounded-full bg-white/20">
            <div className="h-full rounded-full bg-white" style={{ width: `${pct}%` }} />
          </div>
          <div className="mt-6 grid grid-cols-3 gap-3">
            <SummaryStat label="Correct" value={correctCount} />
            <SummaryStat label="Partial" value={partialCount} />
            <SummaryStat label="Incorrect" value={incorrectCount} />
          </div>
          <div className="mt-6 flex flex-wrap gap-2">
            <button
              onClick={() => {
                setReviewIdx(0);
                setPhase("review");
              }}
              className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-foreground hover:opacity-90"
            >
              <Sparkles className="h-4 w-4" /> Review results
            </button>
            <button
              onClick={reset}
              className="inline-flex items-center gap-2 rounded-xl bg-white/15 px-4 py-2.5 text-sm font-semibold text-white ring-1 ring-white/20 backdrop-blur hover:bg-white/25"
            >
              <RotateCcw className="h-4 w-4" /> Retake
            </button>
            <button
              onClick={onExit}
              className="inline-flex items-center gap-2 rounded-xl bg-white/10 px-4 py-2.5 text-sm font-semibold text-white ring-1 ring-white/20 hover:bg-white/20"
            >
              Back to course
            </button>
          </div>
        </div>

        {/* Per-skill breakdown */}
        <SkillBreakdown questions={questions} results={results} />
      </div>
    );
  }

  if (phase === "review") {
    const rq = questions[reviewIdx];
    const rResult = results[rq.id];

    const SKILL_ORDER: Array<"reading" | "listening" | "writing" | "speaking"> = [
      "reading",
      "listening",
      "writing",
      "speaking",
    ];
    const LABEL: Record<string, string> = {
      reading: "Reading",
      listening: "Listening",
      writing: "Writing",
      speaking: "Speaking",
    };
    const grouped = SKILL_ORDER.map((s) => ({
      skill: s,
      items: questions
        .map((qq, i) => ({ qq, i }))
        .filter(({ qq }) => questionSkill(qq.kind) === s),
    })).filter((g) => g.items.length > 0);

    return (
      <div className="space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between gap-3 rounded-2xl bg-surface p-3 ring-1 ring-border">
          <button
            onClick={() => setPhase("summary")}
            className="inline-flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Quay lại kết quả
          </button>
          <div
            className="rounded-full px-4 py-1.5 text-sm font-bold text-white shadow-soft"
            style={{ background: `linear-gradient(135deg, ${accent}, ${accent2})` }}
          >
            {totalEarned}/{totalMax} điểm
          </div>
        </div>

        <div className="grid gap-5 lg:grid-cols-[1fr_280px]">
          <div className="space-y-5 min-w-0">
            {/* Locked question with correct answer revealed */}
            <div className="rounded-3xl bg-surface p-5 ring-1 ring-border sm:p-7">
              <div className="mb-5 flex items-start justify-between gap-3">
                <div>
                  <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                    {LABEL[questionSkill(rq.kind)]} • Câu {rq.index} • {kindLabel(rq.kind)}
                  </div>
                  <h3 className="mt-1 font-display text-lg font-semibold leading-snug text-foreground">
                    {renderPromptHead(rq.prompt)}
                  </h3>
                </div>
                {rResult && (
                  <span
                    className={cn(
                      "shrink-0 rounded-full px-2.5 py-0.5 text-[10px] font-semibold",
                      rResult.status === "correct" && "bg-success/15 text-success-foreground",
                      rResult.status === "partial" && "bg-warning/15 text-warning-foreground",
                      rResult.status === "incorrect" && "bg-destructive/10 text-destructive",
                    )}
                  >
                    {FEEDBACK[rResult.status].label}
                  </span>
                )}
              </div>

              <QuestionBody
                q={rq}
                value={answers[rq.id]}
                onChange={() => {}}
                locked
                accent={accent}
              />

              <div className="mt-5 rounded-2xl bg-muted/40 p-4 text-xs text-muted-foreground ring-1 ring-border">
                <div className="font-semibold text-foreground">Đáp án đúng</div>
                <div className="mt-1">
                  <CorrectAnswerHint q={rq} />
                </div>
              </div>

              {/* Notes / questions to teacher */}
              <div className="mt-5 rounded-2xl bg-background p-4 ring-1 ring-border">
                <div className="flex items-center justify-between gap-2">
                  <div className="text-sm font-semibold text-foreground">
                    Ghi chú / câu hỏi cho giáo viên
                  </div>
                  <span className="text-[11px] text-muted-foreground">
                    {(notes[rq.id]?.length ?? 0)} ghi chú
                  </span>
                </div>

                {(notes[rq.id]?.length ?? 0) > 0 && (
                  <ul className="mt-3 space-y-2">
                    {notes[rq.id]!.map((n, i) => (
                      <li
                        key={i}
                        className="rounded-xl bg-surface p-3 text-xs text-foreground ring-1 ring-border"
                      >
                        <div className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                          Đã gửi giáo viên
                        </div>
                        {n}
                      </li>
                    ))}
                  </ul>
                )}

                <div className="mt-3 flex flex-col gap-2 sm:flex-row">
                  <textarea
                    value={noteDraft}
                    onChange={(e) => setNoteDraft(e.target.value)}
                    placeholder="Nhập câu hỏi hoặc thắc mắc về câu này để gửi giáo viên..."
                    rows={2}
                    className="min-h-[60px] flex-1 resize-y rounded-xl bg-surface px-3 py-2 text-sm text-foreground ring-1 ring-border placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                  <button
                    onClick={() => addNote(rq.id, noteDraft)}
                    disabled={!noteDraft.trim()}
                    className="inline-flex h-10 shrink-0 items-center justify-center gap-1.5 self-end rounded-xl px-4 text-xs font-semibold text-white shadow-soft hover:opacity-95 disabled:opacity-40"
                    style={{ background: `linear-gradient(135deg, ${accent}, ${accent2})` }}
                  >
                    Gửi giáo viên
                  </button>
                </div>
              </div>
            </div>

            {/* Footer nav */}
            <div className="flex items-center justify-between gap-3">
              <button
                onClick={() => setReviewIdx(Math.max(0, reviewIdx - 1))}
                disabled={reviewIdx === 0}
                className="inline-flex items-center gap-2 rounded-xl bg-surface px-4 py-2.5 text-sm font-medium text-foreground ring-1 ring-border hover:bg-muted disabled:opacity-40"
              >
                <ArrowLeft className="h-4 w-4" /> Câu trước
              </button>
              <button
                onClick={() =>
                  reviewIdx < questions.length - 1
                    ? setReviewIdx(reviewIdx + 1)
                    : setPhase("summary")
                }
                className="inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold text-white shadow-soft hover:opacity-95"
                style={{ background: `linear-gradient(135deg, ${accent}, ${accent2})` }}
              >
                {reviewIdx === questions.length - 1 ? "Về kết quả" : "Câu tiếp"}
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Sidebar grouped by skill */}
          <aside className="lg:sticky lg:top-24 self-start rounded-3xl bg-surface p-4 ring-1 ring-border">
            <div className="mb-3 text-sm font-semibold text-foreground">Bảng câu hỏi</div>
            <div className="space-y-4">
              {grouped.map((g) => {
                const correctN = g.items.filter(({ qq }) => results[qq.id]?.status === "correct").length;
                return (
                  <div key={g.skill}>
                    <div className="mb-2 flex items-center justify-between">
                      <div className="text-xs font-semibold text-foreground">
                        {LABEL[g.skill]}
                      </div>
                      <div className="text-[10px] text-muted-foreground">
                        {correctN}/{g.items.length} đúng
                      </div>
                    </div>
                    <div className="grid grid-cols-5 gap-1.5">
                      {g.items.map(({ qq, i }) => {
                        const r = results[qq.id];
                        const active = i === reviewIdx;
                        return (
                          <button
                            key={qq.id}
                            onClick={() => setReviewIdx(i)}
                            title={`Câu ${qq.index}`}
                            className={cn(
                              "inline-flex h-9 items-center justify-center gap-1 rounded-lg text-xs font-bold transition",
                              active && "ring-2 ring-foreground shadow-elevated",
                              r?.status === "correct" && "bg-success/20 text-success-foreground",
                              r?.status === "partial" && "bg-warning/25 text-warning-foreground",
                              r?.status === "incorrect" && "bg-destructive/15 text-destructive",
                              !r && "bg-background text-muted-foreground ring-1 ring-border",
                            )}
                          >
                            {r?.status === "correct" && <Check className="h-3 w-3" />}
                            {r?.status === "incorrect" && <X className="h-3 w-3" />}
                            {r?.status === "partial" && <Sparkles className="h-3 w-3" />}
                            {qq.index}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </aside>
        </div>
      </div>
    );
  }

  // Group questions by skill for the sidebar board
  const SKILL_ORDER: Array<"reading" | "listening" | "writing" | "speaking"> = [
    "reading",
    "listening",
    "writing",
    "speaking",
  ];
  const SKILL_LABEL_VI: Record<string, string> = {
    reading: "Reading",
    listening: "Listening",
    writing: "Writing",
    speaking: "Speaking",
  };
  const grouped = SKILL_ORDER.map((s) => ({
    skill: s,
    items: questions
      .map((qq, i) => ({ qq, i }))
      .filter(({ qq }) => questionSkill(qq.kind) === s),
  })).filter((g) => g.items.length > 0);

  return (
    <div className="grid gap-5 lg:grid-cols-[1fr_280px]">
      <div className="space-y-5 min-w-0">
        {/* Cambridge-style top header */}
        <div className="overflow-hidden rounded-2xl bg-surface ring-1 ring-border">
          <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-5">
            <div className="flex min-w-0 items-center gap-3">
              <div className="min-w-0">
                <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                  Cambridge Exam
                </div>
                <div className="mt-0.5 flex items-center gap-2">
                  <div className="truncate font-display text-base font-semibold text-foreground">
                    {title ?? "Bài thi mô phỏng"}
                  </div>
                  <span className="hidden items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 sm:inline-flex">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> Trực tuyến
                  </span>
                  {examCode && (
                    <span className="rounded-md bg-muted px-1.5 py-0.5 font-mono text-[10px] text-foreground/70">
                      # {examCode}
                    </span>
                  )}
                </div>
              </div>
              <div
                className="rounded-lg border-2 border-rose-300 bg-rose-50 px-2.5 py-1 text-xs font-bold text-rose-700"
                title="Số câu đã trả lời"
              >
                {answeredCount}/{questions.length} Đã trả lời
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="inline-flex items-center gap-1.5 rounded-lg bg-foreground px-3 py-1.5 font-mono text-sm font-bold text-background shadow-soft">
                <Clock className="h-3.5 w-3.5" />
                {remaining == null ? fmtTime(totalSeconds) : fmtTime(remaining)}
              </div>
              <button
                onClick={finishQuiz}
                className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold text-white shadow-soft hover:opacity-95"
                style={{ background: `linear-gradient(135deg, ${accent}, ${accent2})` }}
              >
                <Check className="h-3.5 w-3.5" /> Nộp và xem kết quả
              </button>
            </div>
          </div>

          {/* Section tabs */}
          <div className="grid gap-px bg-border sm:grid-cols-4">
            {grouped.map((g) => {
              const done = g.items.filter(({ qq }) => hasAnswer(qq, answers[qq.id])).length;
              const isActive = questionSkill(q.kind) === g.skill;
              const firstIdx = g.items[0]?.i ?? 0;
              return (
                <button
                  key={g.skill}
                  onClick={() => setIdx(firstIdx)}
                  className={cn(
                    "flex items-center justify-between gap-2 px-4 py-2.5 text-left text-xs transition",
                    isActive
                      ? "bg-foreground text-background"
                      : "bg-surface text-muted-foreground hover:bg-muted",
                  )}
                >
                  <span
                    className={cn(
                      "font-semibold",
                      isActive ? "text-background" : "text-foreground",
                    )}
                  >
                    {SKILL_LABEL_VI[g.skill]}
                  </span>
                  <span className="flex items-center gap-2 text-[11px]">
                    <span
                      className={cn(
                        "font-mono",
                        isActive ? "text-background/80" : "text-muted-foreground",
                      )}
                    >
                      {done}/{g.items.length}
                    </span>
                    {done === 0 && !isActive && (
                      <span className="text-[10px] italic text-muted-foreground/80">
                        Chưa bắt đầu
                      </span>
                    )}
                  </span>
                </button>
              );
            })}
          </div>
        </div>


        {/* question card */}
        <div className="rounded-3xl bg-surface p-5 ring-1 ring-border sm:p-7">
          <div className="mb-5">
            <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              {SKILL_LABEL_VI[questionSkill(q.kind)]} • Câu {q.index} • {kindLabel(q.kind)}
            </div>
            <h3 className="mt-1 font-display text-lg font-semibold leading-snug text-foreground">
              {renderPromptHead(q.prompt)}
            </h3>
          </div>

          <QuestionBody
            q={q}
            value={answers[q.id]}
            onChange={setAnswer}
            locked={false}
            accent={accent}
          />
        </div>

        {/* footer */}
        <div className="flex items-center justify-between gap-3">
          <button
            onClick={prev}
            disabled={idx === 0}
            className="inline-flex items-center gap-2 rounded-xl bg-surface px-4 py-2.5 text-sm font-medium text-foreground ring-1 ring-border hover:bg-muted disabled:opacity-40"
          >
            <ArrowLeft className="h-4 w-4" /> Câu trước
          </button>
          {idx < questions.length - 1 ? (
            <button
              onClick={next}
              className="inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold text-white shadow-soft hover:opacity-95"
              style={{ background: `linear-gradient(135deg, ${accent}, ${accent2})` }}
            >
              Câu tiếp <ArrowRight className="h-4 w-4" />
            </button>
          ) : (
            <button
              onClick={finishQuiz}
              className="inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold text-white shadow-soft hover:opacity-95"
              style={{ background: `linear-gradient(135deg, ${accent}, ${accent2})` }}
            >
              <Check className="h-4 w-4" /> Nộp và xem kết quả
            </button>
          )}
        </div>
      </div>

      {/* Sidebar: Question board grouped by skill */}
      <aside className="lg:sticky lg:top-24 self-start rounded-3xl bg-surface p-4 ring-1 ring-border">
        <div className="mb-3 text-sm font-semibold text-foreground">Bảng câu hỏi</div>
        <div className="space-y-4">
          {grouped.map((g) => {
            const doneCount = g.items.filter(({ qq }) => hasAnswer(qq, answers[qq.id])).length;
            return (
              <div key={g.skill}>
                <div className="mb-2 flex items-center justify-between">
                  <div className="text-xs font-semibold text-foreground">
                    {SKILL_LABEL_VI[g.skill]}
                  </div>
                  <div className="text-[10px] text-muted-foreground">
                    {doneCount}/{g.items.length}
                  </div>
                </div>
                <div className="grid grid-cols-5 gap-1.5">
                  {g.items.map(({ qq, i }) => {
                    const answered = hasAnswer(qq, answers[qq.id]);
                    const active = i === idx;
                    return (
                      <button
                        key={qq.id}
                        onClick={() => setIdx(i)}
                        title={`Câu ${qq.index}`}
                        className={cn(
                          "inline-flex h-9 items-center justify-center rounded-lg text-xs font-bold transition",
                          !answered && !active &&
                            "bg-background text-muted-foreground ring-1 ring-border hover:bg-muted hover:text-foreground",
                          active && !answered && "bg-foreground text-background shadow-elevated",
                          active && answered && "bg-foreground text-background shadow-elevated ring-2 ring-primary",
                          answered && !active &&
                            "bg-primary/15 text-primary ring-1 ring-primary/30",
                        )}
                      >
                        {qq.index}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        <button
          onClick={finishQuiz}
          className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-xs font-semibold text-white shadow-soft hover:opacity-95"
          style={{ background: `linear-gradient(135deg, ${accent}, ${accent2})` }}
        >
          <Check className="h-3.5 w-3.5" /> Nộp và xem kết quả
        </button>
        <button
          onClick={onExit}
          className="mt-2 inline-flex w-full items-center justify-center gap-1.5 rounded-xl px-4 py-2 text-[11px] font-medium text-muted-foreground hover:text-foreground"
        >
          Thoát bài luyện
        </button>
      </aside>
    </div>
  );
}

function questionSkill(kind: Question["kind"]): "reading" | "listening" | "writing" | "speaking" {
  if (kind === "listening") return "listening";
  if (kind === "audio") return "speaking";
  if (kind === "rewrite" || kind === "highlight" || kind === "essay") return "writing";
  return "reading";
}

/* ============================================================
 * Pieces
 * ============================================================ */

function FeedbackBlock({ status }: { status: Status }) {
  const tone =
    status === "correct"
      ? "bg-success/10 text-success-foreground ring-success/30"
      : status === "partial"
        ? "bg-warning/10 text-warning-foreground ring-warning/30"
        : "bg-destructive/10 text-destructive ring-destructive/30";
  const Icon =
    status === "correct" ? CheckCircle2 : status === "partial" ? Sparkles : X;
  const f = FEEDBACK[status];
  return (
    <div className={cn("mt-5 rounded-2xl p-4 ring-1", tone)}>
      <div className="flex items-center gap-2 text-sm font-semibold">
        <Icon className="h-4 w-4" /> {f.label}
      </div>
      <div className="mt-1 text-xs opacity-90">{f.message}</div>
    </div>
  );
}

function kindLabel(k: Question["kind"]) {
  return {
    single: "One choice",
    multi: "Multi choice",
    fill: "Fill in the blank",
    essay: "Essay (writing)",
    match: "Matching (drag & drop)",
    rewrite: "Sentence rewrite",
    highlight: "Highlight & correct",
    sequence: "Sequence (drag & drop)",
    audio: "Audio record",
    gapmulti: "Multi choice gap fill",
    listening: "Listening + multi questions",
    reading: "Reading set + multi questions",
  }[k];
}
function renderPromptHead(p: string) {
  return p.replace(/\{\d+\}/g, "___");
}

/** Đếm số từ trong essay. */
function countWords(s: string): number {
  return s.trim().split(/\s+/).filter(Boolean).length;
}
/** Số keyword khớp (case-insensitive, substring match). */
function matchedKeywords(text: string, keywords: string[]): string[] {
  const t = text.toLowerCase();
  return keywords.filter((k) => t.includes(k.toLowerCase()));
}

function hasAnswer(q: Question, v: AnswerState): boolean {
  if (v === undefined || v === null) return false;
  switch (q.kind) {
    case "single":
      return typeof v === "number";
    case "multi":
      return Array.isArray(v) && (v as number[]).length > 0;
    case "fill":
      return Array.isArray(v) && (v as string[]).every((s) => s && s.trim());
    case "essay":
      return typeof v === "string" && countWords(v) >= q.minWords;
    case "match":
      return Array.isArray(v) && (v as (number | null)[]).every((x) => x !== null && x !== undefined);
    case "rewrite":
      return Array.isArray(v) && (v as string[]).every((s) => s && s.trim());
    case "highlight": {
      const arr = v as { wordIdx: number | null; wordLen?: number; correction: string }[];
      return Array.isArray(arr) && arr.every((x) => x && x.wordIdx !== null && (x.wordLen ?? 1) > 0 && x.correction.trim());
    }
    case "sequence":
      return Array.isArray(v) && (v as string[]).length === q.items.length;
    case "audio":
      return v === true;
    case "gapmulti":
      return Array.isArray(v) && (v as (number | null)[]).every((x) => x !== null && x !== undefined);
    case "listening": {
      const arr = v as (number | null)[] | undefined;
      return Array.isArray(arr) && arr.length === q.subQuestions.length && arr.every((x) => x !== null && x !== undefined);
    }
    case "reading": {
      const arr = v as (number | null)[] | undefined;
      return Array.isArray(arr) && arr.length === q.subQuestions.length && arr.every((x) => x !== null && x !== undefined);
    }
  }
}

function grade(q: Question, v: AnswerState): Result {
  const ratio = (correct: number, total: number): Status => {
    if (correct === total && total > 0) return "correct";
    if (correct === 0) return "incorrect";
    return "partial";
  };
  const earn = (s: Status, max: number) =>
    s === "correct" ? max : s === "partial" ? Math.max(1, Math.round(max / 2)) : 0;

  switch (q.kind) {
    case "single": {
      const ok = v === q.answer;
      const s: Status = ok ? "correct" : "incorrect";
      return { status: s, earned: earn(s, q.maxScore) };
    }
    case "multi": {
      const sel = (v as number[]) || [];
      const ans = q.answer;
      const correct = sel.filter((i) => ans.includes(i)).length;
      const wrong = sel.filter((i) => !ans.includes(i)).length;
      let s: Status;
      if (correct === ans.length && wrong === 0) s = "correct";
      else if (correct > 0 && wrong === 0) s = "partial";
      else s = "incorrect";
      return { status: s, earned: earn(s, q.maxScore) };
    }
    case "fill": {
      const arr = (v as string[]) || [];
      const ok = q.blanks.map((b, i) => (arr[i] || "").trim().toLowerCase() === b.toLowerCase());
      const s = ratio(ok.filter(Boolean).length, q.blanks.length);
      return { status: s, earned: earn(s, q.maxScore) };
    }
    case "essay": {
      const text = (v as string) || "";
      const words = countWords(text);
      const matched = matchedKeywords(text, q.keywords).length;
      const total = q.keywords.length;
      // Cần đủ minWords để được chấm; điểm = tỉ lệ keyword × maxScore.
      if (words < q.minWords) {
        return { status: "incorrect", earned: 0 };
      }
      const pct = total > 0 ? matched / total : 0;
      const earned = Math.round(pct * q.maxScore);
      const s: Status = pct >= 0.8 ? "correct" : pct >= 0.4 ? "partial" : "incorrect";
      return { status: s, earned };
    }
    case "match": {
      const arr = (v as (number | null)[]) || [];
      const ok = q.answer.map((a, i) => arr[i] === a);
      const s = ratio(ok.filter(Boolean).length, q.answer.length);
      return { status: s, earned: earn(s, q.maxScore) };
    }
    case "rewrite": {
      const arr = (v as string[]) || [];
      const ok = q.items.map(
        (it, i) =>
          (arr[i] || "")
            .trim()
            .toLowerCase()
            .replace(/[.!?]+$/, "") ===
          it.answer.toLowerCase().replace(/[.!?]+$/, ""),
      );
      const s = ratio(ok.filter(Boolean).length, q.items.length);
      return { status: s, earned: earn(s, q.maxScore) };
    }
    case "highlight": {
      const arr = (v as { pairs: { wrong: string; correct: string }[] }[]) || [];
      const norm = (s: string) => s.replace(/[.,!?;:]/g, "").trim().toLowerCase();
      const ok = q.items.map((it, i) => {
        const pairs = arr[i]?.pairs ?? [];
        return pairs.some(
          (p) => norm(p.wrong) === norm(it.wrongWord) && norm(p.correct) === norm(it.correction),
        );
      });
      const s = ratio(ok.filter(Boolean).length, q.items.length);
      return { status: s, earned: earn(s, q.maxScore) };
    }
    case "sequence": {
      const arr = (v as string[]) || [];
      const ok = q.items.map((it, i) => arr[i] === it);
      const s = ratio(ok.filter(Boolean).length, q.items.length);
      return { status: s, earned: earn(s, q.maxScore) };
    }
    case "audio":
      return { status: "partial", earned: Math.round(q.maxScore * 0.7) };
    case "gapmulti": {
      const arr = (v as (number | null)[]) || [];
      const ok = q.blanks.map((b, i) => arr[i] === b.answer);
      const s = ratio(ok.filter(Boolean).length, q.blanks.length);
      return { status: s, earned: earn(s, q.maxScore) };
    }
    case "listening": {
      const arr = (v as (number | null)[]) || [];
      const ok = q.subQuestions.map((sq, i) => arr[i] === sq.answer);
      const s = ratio(ok.filter(Boolean).length, q.subQuestions.length);
      return { status: s, earned: earn(s, q.maxScore) };
    }
    case "reading": {
      const arr = (v as (number | null)[]) || [];
      const ok = q.subQuestions.map((sq, i) => arr[i] === sq.answer);
      const s = ratio(ok.filter(Boolean).length, q.subQuestions.length);
      return { status: s, earned: earn(s, q.maxScore) };
    }
  }
}

/* ============================================================
 * Question bodies
 * ============================================================ */

function QuestionBody({
  q,
  value,
  onChange,
  locked,
  accent,
}: {
  q: Question;
  value: AnswerState;
  onChange: (v: AnswerState) => void;
  locked: boolean;
  accent: string;
}) {
  switch (q.kind) {
    case "single":
      return <SingleBody q={q} value={value as number | undefined} onChange={onChange} locked={locked} />;
    case "multi":
      return <MultiBody q={q} value={(value as number[]) || []} onChange={onChange} locked={locked} />;
    case "fill":
      return <FillBody q={q} value={(value as string[]) || []} onChange={onChange} locked={locked} accent={accent} />;
    case "match":
      return <MatchBody q={q} value={value as (number | null)[] | undefined} onChange={onChange} locked={locked} />;
    case "rewrite":
      return <RewriteBody q={q} value={(value as string[]) || []} onChange={onChange} locked={locked} accent={accent} />;
    case "highlight":
      return <HighlightBody q={q} value={value as { pairs: { wrong: string; correct: string }[] }[] | undefined} onChange={onChange} locked={locked} accent={accent} />;
    case "sequence":
      return <SequenceBody q={q} value={value as string[] | undefined} onChange={onChange} locked={locked} />;
    case "audio":
      return <AudioBody q={q} value={value === true} onChange={onChange} locked={locked} />;
    case "gapmulti":
      return <GapMultiBody q={q} value={value as (number | null)[] | undefined} onChange={onChange} locked={locked} />;
    case "listening":
      return <ListeningBody q={q} value={value as (number | null)[] | undefined} onChange={onChange} locked={locked} accent={accent} />;
    case "reading":
      return <ReadingBody q={q} value={value as (number | null)[] | undefined} onChange={onChange} locked={locked} accent={accent} />;
    case "essay":
      return <EssayBody q={q} value={(value as string) || ""} onChange={onChange} locked={locked} accent={accent} />;
  }
}

/* ---------------- Single ---------------- */
function SingleBody({
  q, value, onChange, locked,
}: { q: QSingle; value?: number; onChange: (v: number) => void; locked: boolean }) {
  return (
    <div className="space-y-2">
      {q.options.map((opt, i) => {
        const selected = value === i;
        const isAnswer = locked && i === q.answer;
        const wrongPick = locked && selected && i !== q.answer;
        return (
          <button
            key={i}
            disabled={locked}
            onClick={() => onChange(i)}
            className={cn(
              "flex w-full items-center gap-3 rounded-2xl border-2 px-4 py-3 text-left text-sm transition",
              selected ? "border-foreground bg-foreground/5" : "border-border hover:border-foreground/40 hover:bg-muted/40",
              isAnswer && "border-success bg-success/10",
              wrongPick && "border-destructive bg-destructive/10",
            )}
          >
            <span
              className={cn(
                "flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2",
                selected ? "border-foreground" : "border-border",
                isAnswer && "border-success",
              )}
            >
              {(selected || isAnswer) && (
                <span
                  className={cn("h-2 w-2 rounded-full", isAnswer ? "bg-success" : "bg-foreground")}
                />
              )}
            </span>
            <span>{opt}</span>
          </button>
        );
      })}
    </div>
  );
}

/* ---------------- Multi ---------------- */
function MultiBody({
  q, value, onChange, locked,
}: { q: QMulti; value: number[]; onChange: (v: number[]) => void; locked: boolean }) {
  const toggle = (i: number) =>
    onChange(value.includes(i) ? value.filter((x) => x !== i) : [...value, i]);
  return (
    <div className="space-y-2">
      {q.options.map((opt, i) => {
        const selected = value.includes(i);
        const isAnswer = locked && q.answer.includes(i);
        const wrongPick = locked && selected && !q.answer.includes(i);
        return (
          <button
            key={i}
            disabled={locked}
            onClick={() => toggle(i)}
            className={cn(
              "flex w-full items-center gap-3 rounded-2xl border-2 px-4 py-3 text-left text-sm transition",
              selected ? "border-foreground bg-foreground/5" : "border-border hover:border-foreground/40 hover:bg-muted/40",
              isAnswer && "border-success bg-success/10",
              wrongPick && "border-destructive bg-destructive/10",
            )}
          >
            <span
              className={cn(
                "flex h-5 w-5 shrink-0 items-center justify-center rounded-md border-2",
                selected ? "border-foreground bg-foreground text-background" : "border-border",
                isAnswer && "border-success bg-success text-white",
              )}
            >
              {(selected || isAnswer) && <Check className="h-3 w-3" />}
            </span>
            <span>{opt}</span>
          </button>
        );
      })}
    </div>
  );
}

/* ---------------- Fill ---------------- */
function FillBody({
  q, value, onChange, locked, accent,
}: { q: QFill; value: string[]; onChange: (v: string[]) => void; locked: boolean; accent: string }) {
  const update = (i: number, v: string) => {
    const next = [...value];
    next[i] = v;
    onChange(next);
  };
  const parts = q.prompt.split(/(\{\d+\})/g);
  return (
    <div className="text-sm leading-loose text-foreground">
      {parts.map((p, i) => {
        const m = p.match(/\{(\d+)\}/);
        if (!m) return <span key={i}>{p}</span>;
        const idx = parseInt(m[1], 10) - 1;
        const ok = locked && (value[idx] || "").trim().toLowerCase() === q.blanks[idx].toLowerCase();
        return (
          <input
            key={i}
            disabled={locked}
            value={value[idx] || ""}
            onChange={(e) => update(idx, e.target.value)}
            placeholder={`Answer ${idx + 1}`}
            className={cn(
              "mx-1 inline-block min-w-[140px] rounded-md border-b-2 bg-muted/40 px-2 py-1 text-sm outline-none transition focus:bg-surface focus:ring-2",
              locked
                ? ok
                  ? "border-success bg-success/10"
                  : "border-destructive bg-destructive/10"
                : "border-foreground/40",
            )}
            style={!locked ? { ["--tw-ring-color" as string]: accent } : undefined}
          />
        );
      })}
    </div>
  );
}

function SummaryStat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl bg-white/10 p-3 text-center ring-1 ring-white/15 backdrop-blur">
      <div className="font-display text-2xl font-bold leading-none text-white">{value}</div>
      <div className="mt-1 text-[10px] font-semibold uppercase tracking-wider text-white/80">
        {label}
      </div>
    </div>
  );
}

function SkillBreakdown({
  questions,
  results,
}: {
  questions: Question[];
  results: Record<string, Result>;
}) {
  const SKILL_ORDER: Array<"reading" | "listening" | "writing" | "speaking"> = [
    "reading",
    "listening",
    "writing",
    "speaking",
  ];
  const LABEL: Record<string, string> = {
    reading: "Reading",
    listening: "Listening",
    writing: "Writing",
    speaking: "Speaking",
  };
  const groups = SKILL_ORDER.map((s) => {
    const items = questions.filter((q) => questionSkill(q.kind) === s);
    const totalMax = items.reduce((acc, q) => acc + q.maxScore, 0);
    const earned = items.reduce((acc, q) => acc + (results[q.id]?.earned ?? 0), 0);
    const correct = items.filter((q) => results[q.id]?.status === "correct").length;
    const partial = items.filter((q) => results[q.id]?.status === "partial").length;
    const incorrect = items.filter((q) => results[q.id]?.status === "incorrect").length;
    const pct = totalMax > 0 ? Math.round((earned / totalMax) * 100) : 0;
    return { skill: s, items, totalMax, earned, correct, partial, incorrect, pct };
  }).filter((g) => g.items.length > 0);

  if (groups.length === 0) return null;

  return (
    <div className="rounded-3xl bg-surface p-5 ring-1 ring-border sm:p-7">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="font-display text-lg font-semibold text-foreground">
          Kết quả theo kỹ năng
        </h3>
        <span className="text-xs text-muted-foreground">
          {groups.length} kỹ năng
        </span>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        {groups.map((g) => (
          <div
            key={g.skill}
            className="rounded-2xl bg-background p-4 ring-1 ring-border"
          >
            <div className="flex items-center justify-between gap-2">
              <div className="text-sm font-semibold text-foreground">
                {LABEL[g.skill]}
              </div>
              <div className="text-xs font-bold text-foreground">
                {g.earned}/{g.totalMax} điểm
              </div>
            </div>
            <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-foreground transition-all"
                style={{ width: `${g.pct}%` }}
              />
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-2 text-[11px]">
              <span className="inline-flex items-center gap-1 rounded-full bg-success/15 px-2 py-0.5 font-semibold text-success-foreground">
                <Check className="h-3 w-3" /> {g.correct} đúng
              </span>
              {g.partial > 0 && (
                <span className="inline-flex items-center gap-1 rounded-full bg-warning/20 px-2 py-0.5 font-semibold text-warning-foreground">
                  <Sparkles className="h-3 w-3" /> {g.partial} 1 phần
                </span>
              )}
              <span className="inline-flex items-center gap-1 rounded-full bg-destructive/15 px-2 py-0.5 font-semibold text-destructive">
                <X className="h-3 w-3" /> {g.incorrect} sai
              </span>
              <span className="ml-auto text-muted-foreground">{g.pct}%</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ---------------- Match (Drag & Drop) ---------------- */
function MatchBody({
  q, value, onChange, locked,
}: {
  q: QMatch;
  value?: (number | null)[];
  onChange: (v: (number | null)[]) => void;
  locked: boolean;
}) {
  const slots = value ?? q.leftItems.map(() => null);
  const labels = ["A", "B", "C", "D", "E", "F"];
  const used = new Set(slots.filter((x): x is number => x !== null) as number[]);
  const [dragging, setDragging] = useState<number | null>(null);

  const drop = (slotIdx: number) => {
    if (dragging === null || locked) return;
    const next = slots.map((vv: number | null) => (vv === dragging ? null : vv));
    next[slotIdx] = dragging;
    onChange(next);
    setDragging(null);
  };
  const clearSlot = (slotIdx: number) => {
    const next = [...slots];
    next[slotIdx] = null;
    onChange(next);
  };

  return (
    <div className="grid gap-5 lg:grid-cols-2">
      {/* Left slots */}
      <div className="space-y-3">
        <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
          Drop the matching item into each slot
        </div>
        {q.leftItems.map((l: QMatchItem, i: number) => {
          const filled = slots[i];
          const ok = locked && slots[i] === q.answer[i];
          const wrong = locked && slots[i] !== q.answer[i];
          return (
            <div
              key={i}
              className={cn(
                "rounded-2xl border-2 bg-muted/30 p-3 text-sm leading-relaxed transition",
                !locked && dragging !== null && "border-dashed border-foreground/40",
                ok && "border-success bg-success/10",
                wrong && "border-destructive bg-destructive/10",
                !locked && !ok && !wrong && "border-border",
              )}
            >
              {l.image && (
                <img
                  src={l.image}
                  alt=""
                  className="mb-2 h-32 w-full rounded-xl object-cover ring-1 ring-border"
                />
              )}
              {l.audio && (
                <audio
                  controls
                  src={l.audio}
                  className="mb-2 h-9 w-full"
                  preload="none"
                />
              )}
              <div className="text-foreground">{l.text}</div>
              <div
                onDragOver={(e) => e.preventDefault()}
                onDrop={() => drop(i)}
                className={cn(
                  "mt-3 flex min-h-[48px] items-center gap-2 rounded-xl border-2 border-dashed px-3 py-2 text-xs",
                  filled !== null
                    ? "border-foreground/30 bg-surface"
                    : "border-border text-muted-foreground",
                )}
              >
                {filled !== null ? (
                  <>
                    <span className="rounded-md bg-foreground px-1.5 py-0.5 text-[10px] font-bold text-background">
                      {labels[filled]}
                    </span>
                    <span className="flex-1 text-foreground">{q.right[filled]}</span>
                    {!locked && (
                      <button
                        onClick={() => clearSlot(i)}
                        className="rounded p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
                        aria-label="Remove"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </>
                ) : (
                  <span>Drop an item here</span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Right pool */}
      <div className="space-y-2">
        <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
          Drag from the pool below
        </div>
        {q.right.map((r, j) => {
          const isUsed = used.has(j);
          return (
            <div
              key={j}
              draggable={!locked && !isUsed}
              onDragStart={() => setDragging(j)}
              onDragEnd={() => setDragging(null)}
              className={cn(
                "flex cursor-grab items-start gap-2 rounded-2xl border bg-surface p-3 text-sm leading-relaxed shadow-soft transition",
                isUsed && "opacity-40",
                !locked && !isUsed && "hover:border-foreground/40 active:cursor-grabbing",
                locked && "cursor-default",
              )}
            >
              <GripVertical className="h-4 w-4 shrink-0 text-muted-foreground" />
              <span className="rounded-md bg-foreground px-1.5 py-0.5 text-[10px] font-bold text-background">
                {labels[j]}
              </span>
              <span className="text-foreground">{r}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ---------------- Rewrite ---------------- */
function RewriteBody({
  q, value, onChange, locked, accent,
}: {
  q: QRewrite;
  value: string[];
  onChange: (v: string[]) => void;
  locked: boolean;
  accent: string;
}) {
  const update = (i: number, v: string) => {
    const next = [...value];
    next[i] = v;
    onChange(next);
  };
  return (
    <div className="space-y-4">
      {q.items.map((it, i) => {
        const ok =
          locked &&
          (value[i] || "")
            .trim()
            .toLowerCase()
            .replace(/[.!?]+$/, "") ===
            it.answer.toLowerCase().replace(/[.!?]+$/, "");
        return (
          <div key={i}>
            <div className="text-sm text-foreground">
              {i + 1}. {it.source}
            </div>
            <div className="mt-1 flex items-center gap-2">
              <span className="text-muted-foreground">→</span>
              <input
                disabled={locked}
                value={value[i] || ""}
                onChange={(e) => update(i, e.target.value)}
                placeholder="Type the rewritten sentence..."
                className={cn(
                  "flex-1 rounded-lg border bg-muted/40 px-3 py-2 text-sm outline-none focus:bg-surface focus:ring-2",
                  locked && (ok ? "border-success bg-success/10" : "border-destructive bg-destructive/10"),
                  !locked && "border-border",
                )}
                style={!locked ? { ["--tw-ring-color" as string]: accent } : undefined}
              />
            </div>
            {locked && !ok && (
              <div className="mt-1 ml-5 text-[11px] text-success-foreground">
                Suggested: <span className="font-semibold">{it.answer}</span>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

/* ---------------- Highlight ---------------- */
type HighlightPair = { wrong: string; correct: string };
type HighlightAnswer = { pairs: HighlightPair[] };

function HighlightBody({
  q, value, onChange, locked, accent,
}: {
  q: QHighlight;
  value?: HighlightAnswer[];
  onChange: (v: HighlightAnswer[]) => void;
  locked: boolean;
  accent: string;
}) {
  const arr: HighlightAnswer[] =
    value ?? q.items.map(() => ({ pairs: [{ wrong: "", correct: "" }] }));

  const setItem = (i: number, next: HighlightAnswer) => {
    const copy = [...arr];
    copy[i] = next;
    onChange(copy);
  };

  const updatePair = (i: number, k: number, patch: Partial<HighlightPair>) => {
    const cur = arr[i] ?? { pairs: [{ wrong: "", correct: "" }] };
    const pairs = [...cur.pairs];
    pairs[k] = { ...pairs[k], ...patch };
    setItem(i, { pairs });
  };

  const addPair = (i: number) => {
    const cur = arr[i] ?? { pairs: [] };
    setItem(i, { pairs: [...cur.pairs, { wrong: "", correct: "" }] });
  };

  const removePair = (i: number, k: number) => {
    const cur = arr[i] ?? { pairs: [{ wrong: "", correct: "" }] };
    const pairs = cur.pairs.filter((_, idx) => idx !== k);
    setItem(i, { pairs: pairs.length ? pairs : [{ wrong: "", correct: "" }] });
  };

  const normalize = (s: string) => s.replace(/[.,!?;:]/g, "").trim().toLowerCase();

  return (
    <div className="space-y-5">
      <div className="rounded-lg border border-dashed border-border bg-muted/30 px-3 py-2 text-[11px] text-muted-foreground">
        Đọc câu, nhập từ/cụm sai và bản sửa đúng. Nếu câu có nhiều lỗi, bấm “+ Thêm cặp”.
      </div>
      {q.items.map((it, i) => {
        const cur = arr[i] ?? { pairs: [{ wrong: "", correct: "" }] };
        const matched = cur.pairs.some(
          (p) =>
            normalize(p.wrong) === normalize(it.wrongWord) &&
            normalize(p.correct) === normalize(it.correction),
        );
        return (
          <div key={i} className="rounded-2xl border border-border bg-muted/20 p-4">
            <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Sentence {i + 1}
            </div>
            <div className="mt-2 text-base leading-relaxed">{it.sentence}</div>

            <div className="mt-3 space-y-2">
              {cur.pairs.map((p, k) => {
                const pairOk =
                  locked &&
                  normalize(p.wrong) === normalize(it.wrongWord) &&
                  normalize(p.correct) === normalize(it.correction);
                const pairBad = locked && (p.wrong || p.correct) && !pairOk;
                return (
                  <div key={k} className="flex items-center gap-2">
                    <input
                      disabled={locked}
                      value={p.wrong}
                      onChange={(e) => updatePair(i, k, { wrong: e.target.value })}
                      placeholder="Từ/cụm sai..."
                      className={cn(
                        "flex-1 rounded-lg border bg-surface px-3 py-1.5 text-sm outline-none focus:ring-2",
                        !locked && "border-border",
                        pairOk && "border-success bg-success/10",
                        pairBad && "border-destructive bg-destructive/10",
                      )}
                      style={!locked ? { ["--tw-ring-color" as string]: accent } : undefined}
                    />
                    <span className="text-muted-foreground">→</span>
                    <input
                      disabled={locked}
                      value={p.correct}
                      onChange={(e) => updatePair(i, k, { correct: e.target.value })}
                      placeholder="Sửa lại đúng..."
                      className={cn(
                        "flex-1 rounded-lg border bg-surface px-3 py-1.5 text-sm outline-none focus:ring-2",
                        !locked && "border-border",
                        pairOk && "border-success bg-success/10",
                        pairBad && "border-destructive bg-destructive/10",
                      )}
                      style={!locked ? { ["--tw-ring-color" as string]: accent } : undefined}
                    />
                    {!locked && cur.pairs.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removePair(i, k)}
                        className="rounded-md border border-border px-2 py-1 text-xs text-muted-foreground hover:bg-muted"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                );
              })}
            </div>

            {!locked && (
              <button
                type="button"
                onClick={() => addPair(i)}
                className="mt-2 rounded-md border border-dashed border-border px-2.5 py-1 text-xs text-muted-foreground hover:bg-muted"
              >
                + Thêm cặp
              </button>
            )}

            {locked && !matched && (
              <div className="mt-2 text-[11px] text-success-foreground">
                Correct: <span className="font-semibold">{it.wrongWord}</span> →{" "}
                <span className="font-semibold">{it.correction}</span>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

/* ---------------- Sequence (Drag & Drop reorder) ---------------- */
function SequenceBody({
  q, value, onChange, locked,
}: {
  q: QSequence;
  value?: string[];
  onChange: (v: string[]) => void;
  locked: boolean;
}) {
  const arr = value ?? shuffle(q.items, hash(q.id));
  if (!value) onChange(arr);
  const [dragging, setDragging] = useState<number | null>(null);

  const drop = (target: number) => {
    if (dragging === null || dragging === target || locked) return;
    const next = [...arr];
    const [moved] = next.splice(dragging, 1);
    next.splice(target, 0, moved);
    onChange(next);
    setDragging(null);
  };
  return (
    <div className="space-y-2">
      <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
        Drag items to reorder
      </div>
      {arr.map((s, i) => {
        const ok = locked && q.items[i] === s;
        return (
          <div
            key={s}
            draggable={!locked}
            onDragStart={() => setDragging(i)}
            onDragOver={(e) => e.preventDefault()}
            onDrop={() => drop(i)}
            onDragEnd={() => setDragging(null)}
            className={cn(
              "flex items-center gap-3 rounded-2xl border-2 px-3 py-3 text-sm shadow-soft transition",
              !locked && "cursor-grab active:cursor-grabbing hover:border-foreground/40",
              dragging === i && "opacity-50",
              locked && (ok ? "border-success bg-success/10" : "border-destructive bg-destructive/10"),
              !locked && "border-border bg-surface",
            )}
          >
            <GripVertical className="h-4 w-4 shrink-0 text-muted-foreground" />
            <span className="font-semibold text-muted-foreground">{i + 1}.</span>
            <span className="flex-1 text-foreground">{s}</span>
          </div>
        );
      })}
    </div>
  );
}

/* ---------------- Audio ---------------- */
function AudioBody({
  q, value, onChange, locked,
}: { q: QAudio; value: boolean; onChange: (v: boolean) => void; locked: boolean }) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-2xl bg-muted/40 p-6 text-center">
      <div className="text-sm text-muted-foreground">Read aloud and record your answer</div>
      <div className="font-display text-base font-semibold text-foreground">
        "{q.sentence}"
      </div>
      <button
        disabled={locked}
        onClick={() => onChange(true)}
        className={cn(
          "inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold text-white shadow-soft transition",
          value ? "bg-success" : "bg-destructive hover:opacity-90",
        )}
      >
        <Mic className="h-4 w-4" />
        {value ? "Recording saved" : "Click here to start"}
      </button>
      {value && (
        <div className="text-[11px] text-muted-foreground">Submit to send your recording</div>
      )}
    </div>
  );
}

/* ---------------- Gap multi ---------------- */
function GapMultiBody({
  q, value, onChange, locked,
}: {
  q: QGapMulti;
  value?: (number | null)[];
  onChange: (v: (number | null)[]) => void;
  locked: boolean;
}) {
  const arr = value ?? q.blanks.map(() => null);
  const [openIdx, setOpenIdx] = useState<number | null>(null);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (!wrapRef.current?.contains(e.target as Node)) setOpenIdx(null);
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  const update = (i: number, v: number) => {
    const next = [...arr];
    next[i] = v;
    onChange(next);
    setOpenIdx(null);
  };

  const parts = q.prompt.split(/(\{\d+\})/g);
  return (
    <div ref={wrapRef} className="text-base leading-loose text-foreground">
      {parts.map((p, i) => {
        const m = p.match(/\{(\d+)\}/);
        if (!m) return <span key={i}>{p}</span>;
        const idx = parseInt(m[1], 10) - 1;
        const sel = arr[idx];
        const filled = sel !== null && sel !== undefined;
        const label = filled ? q.blanks[idx].options[sel as number] : `Choose ${idx + 1}`;
        const isOpen = openIdx === idx;
        const ok = locked && sel === q.blanks[idx].answer;
        const wrong = locked && !ok;
        return (
          <span key={i} className="relative mx-1 inline-block align-baseline">
            <button
              type="button"
              disabled={locked}
              onClick={() => setOpenIdx(isOpen ? null : idx)}
              className={cn(
                "inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-sm font-semibold ring-1 transition",
                filled
                  ? "bg-foreground/5 text-foreground ring-foreground/30"
                  : "bg-muted text-muted-foreground ring-dashed ring-border hover:bg-muted/70",
                isOpen && "ring-2 ring-foreground",
                ok && "bg-success/15 text-success-foreground ring-success/40",
                wrong && "bg-destructive/10 text-destructive ring-destructive/30",
              )}
            >
              <span>{label}</span>
              {!locked && <ChevronDown className="h-3.5 w-3.5 opacity-70" />}
            </button>
            {isOpen && !locked && (
              <span
                role="listbox"
                className="absolute left-0 top-full z-20 mt-1 block min-w-[180px] overflow-hidden rounded-xl bg-surface p-1 shadow-elevated ring-1 ring-border"
              >
                {q.blanks[idx].options.map((opt, j) => {
                  const selected = sel === j;
                  return (
                    <button
                      key={j}
                      type="button"
                      onClick={() => update(idx, j)}
                      className={cn(
                        "flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm transition",
                        selected
                          ? "bg-foreground text-background"
                          : "text-foreground hover:bg-muted",
                      )}
                    >
                      {selected && <Check className="h-3.5 w-3.5" />}
                      <span className="flex-1">{opt}</span>
                    </button>
                  );
                })}
              </span>
            )}
            {locked && wrong && (
              <span className="ml-2 text-[11px] font-medium text-success-foreground">
                → {q.blanks[idx].options[q.blanks[idx].answer]}
              </span>
            )}
          </span>
        );
      })}
    </div>
  );
}
/* ============================================================
 * Review card
 * ============================================================ */
function ReviewCard({
  q, answer, result,
}: {
  q: Question;
  answer: AnswerState;
  result?: Result;
  accent: string;
}) {
  void answer;
  const status = result?.status;
  return (
    <div className="rounded-2xl bg-surface p-5 ring-1 ring-border">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            Question {q.index} • {kindLabel(q.kind)}
          </div>
          <div className="mt-1 text-sm font-semibold text-foreground">
            {renderPromptHead(q.prompt)}
          </div>
        </div>
        {status ? (
          <span
            className={cn(
              "shrink-0 rounded-full px-2.5 py-0.5 text-[10px] font-semibold",
              status === "correct" && "bg-success/15 text-success-foreground",
              status === "partial" && "bg-warning/15 text-warning-foreground",
              status === "incorrect" && "bg-destructive/10 text-destructive",
            )}
          >
            {FEEDBACK[status].label}
          </span>
        ) : (
          <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-[10px] font-semibold text-muted-foreground">
            <CircleDashed className="h-3 w-3" /> Not attempted
          </span>
        )}
      </div>
      <div className="mt-3 text-xs text-muted-foreground">
        <CorrectAnswerHint q={q} />
      </div>
    </div>
  );
}
function CorrectAnswerHint({ q }: { q: Question }) {
  switch (q.kind) {
    case "single":
      return <span>Correct answer: {q.options[q.answer]}</span>;
    case "multi":
      return <span>Correct answers: {q.answer.map((i) => q.options[i]).join(" • ")}</span>;
    case "fill":
      return <span>Correct answers: {q.blanks.join(" / ")}</span>;
    case "match": {
      const labels = ["A", "B", "C", "D", "E", "F"];
      return <span>Correct mapping: {q.answer.map((a, i) => `${i + 1}→${labels[a]}`).join(", ")}</span>;
    }
    case "rewrite":
      return <span>Suggested: {q.items.map((it) => it.answer).join(" / ")}</span>;
    case "highlight":
      return (
        <span>
          Correct: {q.items.map((it) => `${it.wrongWord}→${it.correction}`).join(" / ")}
        </span>
      );
    case "sequence":
      return <span>Correct order: {q.items.join(" → ")}</span>;
    case "gapmulti":
      return <span>Correct answers: {q.blanks.map((b) => b.options[b.answer]).join(" / ")}</span>;
    case "audio":
      return <span>Pronunciation will be reviewed by your teacher.</span>;
    case "essay":
      return (
        <span>
          Keywords gợi ý: <span className="font-semibold">{q.keywords.join(", ")}</span>
        </span>
      );
    case "listening":
      return (
        <span>
          Correct answers:{" "}
          {q.subQuestions
            .map((sq, i) => `${i + 1}→${String.fromCharCode(65 + sq.answer)}`)
            .join(" • ")}
        </span>
      );
    case "reading":
      return (
        <span>
          Correct answers:{" "}
          {q.subQuestions
            .map((sq, i) => `${i + 1}→${String.fromCharCode(65 + sq.answer)}`)
            .join(" • ")}
        </span>
      );
  }
}

/* ---------------- Listening (audio + multi sub-questions) ---------------- */
function ListeningBody({
  q,
  value,
  onChange,
  locked,
  accent,
}: {
  q: QListening;
  value?: (number | null)[];
  onChange: (v: (number | null)[]) => void;
  locked: boolean;
  accent: string;
}) {
  const answers = value ?? q.subQuestions.map(() => null);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!playing) return;
    const id = window.setInterval(() => {
      setProgress((p) => (p >= 100 ? (setPlaying(false), 0) : p + 1.2));
    }, 120);
    return () => window.clearInterval(id);
  }, [playing]);

  const pick = (qi: number, oi: number) => {
    if (locked) return;
    const next = [...answers];
    next[qi] = oi;
    onChange(next);
  };

  return (
    <div className="space-y-5">
      {/* Audio player */}
      <div
        className="flex items-center gap-3 rounded-2xl p-4 ring-1 ring-border"
        style={{ background: `linear-gradient(135deg, color-mix(in oklab, ${accent} 8%, transparent), transparent)` }}
      >
        <button
          type="button"
          onClick={() => setPlaying((v) => !v)}
          className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-white shadow-soft transition active:scale-95"
          style={{ background: accent }}
          aria-label={playing ? "Pause" : "Play"}
        >
          {playing ? <X className="h-4 w-4" /> : <ArrowRight className="h-4 w-4 translate-x-[1px]" />}
        </button>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-bold" style={{ color: accent }}>
              {q.audio.code}
            </span>
            <span className="text-[11px] text-muted-foreground">· {q.audio.durationLabel}</span>
          </div>
          <div className="truncate text-sm font-medium text-foreground">{q.audio.label}</div>
          <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full transition-[width] duration-100"
              style={{ width: `${progress}%`, background: accent }}
            />
          </div>
        </div>
      </div>

      {/* Sub-questions */}
      <ol className="space-y-5">
        {q.subQuestions.map((sq, qi) => {
          const picked = answers[qi];
          return (
            <li key={sq.id} className="space-y-2">
              <div className="text-sm font-semibold text-foreground">{sq.prompt}</div>
              <div className="grid gap-2 sm:grid-cols-2">
                {sq.options.map((opt, oi) => {
                  const selected = picked === oi;
                  const isAnswer = locked && oi === sq.answer;
                  const wrongPick = locked && selected && oi !== sq.answer;
                  return (
                    <button
                      key={oi}
                      type="button"
                      disabled={locked}
                      onClick={() => pick(qi, oi)}
                      className={cn(
                        "flex items-start gap-2 rounded-xl border-2 px-3 py-2.5 text-left text-sm transition",
                        selected ? "border-foreground bg-foreground/5" : "border-border hover:border-foreground/40 hover:bg-muted/40",
                        isAnswer && "border-success bg-success/10",
                        wrongPick && "border-destructive bg-destructive/10",
                      )}
                    >
                      <span
                        className={cn(
                          "inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 text-[10px] font-bold",
                          selected ? "border-foreground" : "border-border",
                          isAnswer && "border-success text-success-foreground",
                        )}
                      >
                        {String.fromCharCode(65 + oi)}
                      </span>
                      <span className="leading-snug">{opt}</span>
                    </button>
                  );
                })}
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

/* ---------------- Reading (passage + multi sub-questions, split layout) ---------------- */
function ReadingBody({
  q,
  value,
  onChange,
  locked,
  accent,
}: {
  q: QReading;
  value?: (number | null)[];
  onChange: (v: (number | null)[]) => void;
  locked: boolean;
  accent: string;
}) {
  const answers = value ?? q.subQuestions.map(() => null);
  const pick = (qi: number, oi: number) => {
    if (locked) return;
    const next = [...answers];
    next[qi] = oi;
    onChange(next);
  };
  const doneCount = answers.filter((x) => x !== null && x !== undefined).length;
  const [layout, setLayout] = useState<"cols" | "rows">("cols");
  const [pinned, setPinned] = useState(false);

  const isCols = layout === "cols";

  return (
    <div className="space-y-3">
      {/* Toolbar */}
      <div className="flex items-center justify-end gap-2">
        <button
          type="button"
          onClick={() => setPinned((p) => !p)}
          className={cn(
            "inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium ring-1 transition",
            pinned
              ? "bg-foreground text-background ring-foreground"
              : "bg-background text-muted-foreground ring-border hover:text-foreground",
          )}
          title={pinned ? "Bỏ ghim bài đọc" : "Ghim bài đọc — luôn hiển thị khi cuộn"}
        >
          <Pin className={cn("h-3.5 w-3.5", pinned && "rotate-45")} />
          {pinned ? "Đã ghim" : "Ghim bài đọc"}
        </button>
        <div className="inline-flex items-center gap-1 rounded-lg bg-muted p-1 ring-1 ring-border">
          <button
            type="button"
            onClick={() => setLayout("cols")}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition",
              isCols ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground",
            )}
            title="Hiển thị 2 cột: bài đọc & câu hỏi cạnh nhau"
          >
            <Columns2 className="h-3.5 w-3.5" /> 2 cột
          </button>
          <button
            type="button"
            onClick={() => setLayout("rows")}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition",
              !isCols ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground",
            )}
            title="Hiển thị theo hàng: bài đọc ở trên, câu hỏi ở dưới"
          >
            <Rows2 className="h-3.5 w-3.5" /> Hàng ngang
          </button>
        </div>
      </div>

      <div className={cn("grid gap-4", isCols ? "grid-cols-1 lg:grid-cols-2" : "grid-cols-1")}>
        {/* Bài đọc */}
        <div
          className={cn(
            (isCols || pinned) && "self-start",
            isCols && !pinned && "lg:sticky lg:top-4",
            pinned && "sticky top-2 z-20",
          )}
        >
          <div
            className="overflow-hidden rounded-2xl bg-background ring-1 ring-border shadow-soft"
            style={{ background: `linear-gradient(135deg, color-mix(in oklab, ${accent} 6%, var(--background)), var(--background))` }}
          >
            <div className="flex items-center justify-between border-b border-border bg-background/60 px-4 py-2.5 backdrop-blur">
              <div className="flex items-center gap-2">
                {pinned && <Pin className="h-3 w-3 rotate-45" style={{ color: accent }} />}
                <div className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: accent }}>
                  Reading passage
                </div>
              </div>
              {q.title && (
                <div className="truncate text-xs font-medium text-foreground">{q.title}</div>
              )}
            </div>
            <div
              className={cn(
                "overflow-y-auto p-4",
                pinned ? "max-h-[38vh]" : isCols ? "max-h-[68vh]" : "max-h-[50vh]",
              )}
            >
              <div className="whitespace-pre-wrap text-sm leading-relaxed text-foreground">
                {q.passage}
              </div>
            </div>
          </div>
        </div>


        {/* Câu hỏi */}
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span className="font-semibold uppercase tracking-wider" style={{ color: accent }}>
              Questions ({q.subQuestions.length})
            </span>
            <span>
              {doneCount}/{q.subQuestions.length} đã trả lời
            </span>
          </div>

        <ol className="space-y-4">
          {q.subQuestions.map((sq, qi) => {
            const picked = answers[qi];
            return (
              <li key={sq.id} className="space-y-2">
                <div className="text-sm font-semibold text-foreground">
                  {qi + 1}. {sq.prompt}
                </div>
                <div className="grid gap-2">
                  {sq.options.map((opt, oi) => {
                    const selected = picked === oi;
                    const isAnswer = locked && oi === sq.answer;
                    const wrongPick = locked && selected && oi !== sq.answer;
                    return (
                      <button
                        key={oi}
                        type="button"
                        disabled={locked}
                        onClick={() => pick(qi, oi)}
                        className={cn(
                          "flex items-start gap-2 rounded-xl border-2 px-3 py-2.5 text-left text-sm transition",
                          selected ? "border-foreground bg-foreground/5" : "border-border hover:border-foreground/40 hover:bg-muted/40",
                          isAnswer && "border-success bg-success/10",
                          wrongPick && "border-destructive bg-destructive/10",
                        )}
                      >
                        <span
                          className={cn(
                            "inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 text-[10px] font-bold",
                            selected ? "border-foreground" : "border-border",
                            isAnswer && "border-success",
                          )}
                        >
                          {String.fromCharCode(65 + oi)}
                        </span>
                        <span className="leading-snug">{opt}</span>
                      </button>
                    );
                  })}
                </div>
              </li>
            );
          })}
        </ol>
        </div>
      </div>
    </div>
  );
}


/* ---------------- Essay (writing with word count) ---------------- */
function EssayBody({
  q, value, onChange, locked, accent,
}: {
  q: QEssay;
  value: string;
  onChange: (v: string) => void;
  locked: boolean;
  accent: string;
}) {
  const words = countWords(value);
  const minOk = words >= q.minWords;
  const maxOk = !q.maxWords || words <= q.maxWords;
  const matched = matchedKeywords(value, q.keywords);

  return (
    <div className="space-y-4">
      {/* Brief */}
      <div className="rounded-2xl bg-muted/40 p-4 ring-1 ring-border">
        <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
          Yêu cầu đề bài
        </div>
        <p className="mt-1.5 whitespace-pre-line text-sm text-foreground">{q.brief}</p>
        <div className="mt-3 flex flex-wrap items-center gap-2 text-[11px]">
          <span className="rounded-full bg-background px-2.5 py-1 font-semibold text-muted-foreground ring-1 ring-border">
            Tối thiểu {q.minWords} từ
          </span>
          {q.maxWords && (
            <span className="rounded-full bg-background px-2.5 py-1 font-semibold text-muted-foreground ring-1 ring-border">
              Tối đa {q.maxWords} từ
            </span>
          )}
          <span className="rounded-full bg-background px-2.5 py-1 font-semibold text-muted-foreground ring-1 ring-border">
            {q.keywords.length} keyword chấm điểm
          </span>
        </div>
      </div>

      {/* Editor with word count inside */}
      <div className="overflow-hidden rounded-2xl border-2 border-border bg-surface transition focus-within:ring-2"
           style={!locked ? { ["--tw-ring-color" as string]: accent } : undefined}>
        <div className="flex items-center justify-between border-b border-border bg-muted/40 px-4 py-2 text-xs">
          <span className="font-medium text-muted-foreground">
            Word count:{" "}
            <span
              className={cn(
                "font-bold",
                minOk && maxOk ? "text-success-foreground" : "text-foreground",
              )}
            >
              {words}
            </span>
          </span>
          <span className="text-[11px] text-muted-foreground">
            {!minOk
              ? `Cần thêm ${q.minWords - words} từ`
              : !maxOk
                ? `Vượt ${words - (q.maxWords ?? 0)} từ`
                : "Đủ yêu cầu"}
          </span>
        </div>
        <textarea
          disabled={locked}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={10}
          placeholder="Viết bài của bạn ở đây..."
          className={cn(
            "block w-full resize-y bg-transparent px-4 py-3 text-sm leading-relaxed text-foreground outline-none",
            locked && "bg-muted/20",
          )}
        />
      </div>

      {/* Review-only: Solution + Feedback table + verdict */}
      {locked && (
        <>
          {/* Solution */}
          <div>
            <h4 className="mb-2 font-display text-base font-bold text-foreground">
              Solution
            </h4>
            <div className="rounded-2xl border-2 border-border bg-surface p-4">
              <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed text-foreground">
                {q.solution}
              </pre>
            </div>
          </div>

          {/* Feedback table */}
          <div>
            <h4 className="mb-2 font-display text-base font-bold text-foreground">
              Feedback
            </h4>
            <div className="overflow-hidden rounded-2xl border border-border">
              <table className="w-full table-fixed border-collapse text-sm">
                <tbody>
                  {(q.feedback ?? q.keywords.map((k) => ({ keyword: k, comment: "" }))).map(
                    (row, i) => {
                      const hit = matchedKeywords(value, [row.keyword]).length > 0;
                      return (
                        <tr
                          key={row.keyword + i}
                          className={cn(
                            "border-b border-border last:border-b-0",
                            i % 2 === 0 ? "bg-surface" : "bg-muted/40",
                          )}
                        >
                          <td className="w-1/3 px-4 py-3 align-top">
                            {hit ? (
                              <span className="inline-flex items-center gap-1.5 font-semibold text-success-foreground">
                                <Check className="h-3.5 w-3.5" /> {row.keyword}
                              </span>
                            ) : (
                              <span className="font-mono text-muted-foreground/60">
                                · · · · ·
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-3 align-top text-foreground">
                            {row.comment || (
                              <span className="text-muted-foreground">—</span>
                            )}
                          </td>
                        </tr>
                      );
                    },
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Verdict + score bar */}
          {(() => {
            const total = q.keywords.length;
            const hit = matched.length;
            const pct = total > 0 ? Math.round((hit / total) * 100) : 0;
            const verdict =
              pct >= 80
                ? "Excellent! Bài viết khớp với phần lớn keyword gợi ý."
                : pct >= 40
                  ? "Good try! Bổ sung thêm các ý còn thiếu để hoàn thiện hơn."
                  : "Not good! You may want to refer to Sample Solution for a guide.";
            const tone =
              pct >= 80
                ? "text-success-foreground"
                : pct >= 40
                  ? "text-warning-foreground"
                  : "text-destructive";
            return (
              <div className="space-y-3">
                <div className={cn("text-sm font-bold", tone)}>{verdict}</div>
                <div className="flex items-center gap-3">
                  <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{ width: `${pct}%`, background: accent }}
                    />
                  </div>
                  <span className="text-xs font-semibold text-muted-foreground">
                    {hit}/{total} keyword
                  </span>
                </div>
              </div>
            );
          })()}
        </>
      )}
    </div>
  );
}
