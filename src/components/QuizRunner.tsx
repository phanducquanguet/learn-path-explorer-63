import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  ChevronDown,
  CircleDashed,
  GripVertical,
  Mic,
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
  | QListening;

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
  return [
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
        "Drag each statement on the right into the matching slot on the left.",
      left: [
        "Have you ever heard of space junk? You might remember the scene in the movie Gravity, where a spacecraft is hit by a cloud of waste. ___",
        "They are very real reminders of space exploration — what happens when we send satellites up and don't clean up afterwards. ___",
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
  ];
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
  hue,
  onExit,
}: {
  quizId: string;
  title?: string;
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
        {/* Total score bar */}
        <div className="flex items-center justify-between gap-3 rounded-2xl bg-surface p-3 ring-1 ring-border">
          <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Tiến độ
          </div>
          <div className="flex items-center gap-3">
            <div className="text-[11px] text-muted-foreground">
              {answeredCount}/{questions.length} câu đã trả lời
            </div>
            <div
              className="rounded-full px-4 py-1.5 text-sm font-bold text-white shadow-soft"
              style={{ background: `linear-gradient(135deg, ${accent}, ${accent2})` }}
            >
              Câu {idx + 1}/{questions.length}
            </div>
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
              <Check className="h-4 w-4" /> Nộp bài
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
          <Check className="h-3.5 w-3.5" /> Nộp bài & xem kết quả
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
  if (kind === "rewrite" || kind === "highlight") return "writing";
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
    match: "Matching (drag & drop)",
    rewrite: "Sentence rewrite",
    highlight: "Highlight & correct",
    sequence: "Sequence (drag & drop)",
    audio: "Audio record",
    gapmulti: "Multi choice gap fill",
    listening: "Listening + multi questions",
  }[k];
}
function renderPromptHead(p: string) {
  return p.replace(/\{\d+\}/g, "___");
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
    case "match":
      return Array.isArray(v) && (v as (number | null)[]).every((x) => x !== null && x !== undefined);
    case "rewrite":
      return Array.isArray(v) && (v as string[]).every((s) => s && s.trim());
    case "highlight": {
      const arr = v as { wordIdx: number | null; correction: string }[];
      return Array.isArray(arr) && arr.every((x) => x && x.wordIdx !== null && x.correction.trim());
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
      const arr = (v as { wordIdx: number | null; correction: string }[]) || [];
      const ok = q.items.map((it, i) => {
        const a = arr[i];
        if (!a) return false;
        const words = it.sentence.split(/\s+/);
        const clickedWord = a.wordIdx !== null ? words[a.wordIdx]?.replace(/[.,!?]/g, "") : "";
        const wordOk = clickedWord?.toLowerCase() === it.wrongWord.replace(/[.,!?]/g, "").toLowerCase();
        const corrOk =
          a.correction.trim().toLowerCase().replace(/[.,!?]/g, "") ===
          it.correction.toLowerCase().replace(/[.,!?]/g, "");
        return wordOk && corrOk;
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
      return <HighlightBody q={q} value={value as { wordIdx: number | null; correction: string }[] | undefined} onChange={onChange} locked={locked} accent={accent} />;
    case "sequence":
      return <SequenceBody q={q} value={value as string[] | undefined} onChange={onChange} locked={locked} />;
    case "audio":
      return <AudioBody q={q} value={value === true} onChange={onChange} locked={locked} />;
    case "gapmulti":
      return <GapMultiBody q={q} value={value as (number | null)[] | undefined} onChange={onChange} locked={locked} />;
    case "listening":
      return <ListeningBody q={q} value={value as (number | null)[] | undefined} onChange={onChange} locked={locked} accent={accent} />;
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
  const slots = value ?? q.left.map(() => null);
  const labels = ["A", "B", "C", "D", "E", "F"];
  const used = new Set(slots.filter((x) => x !== null) as number[]);
  const [dragging, setDragging] = useState<number | null>(null);

  const drop = (slotIdx: number) => {
    if (dragging === null || locked) return;
    const next = slots.map((v) => (v === dragging ? null : v));
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
        {q.left.map((l, i) => {
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
              <div className="text-foreground">{l}</div>
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
function HighlightBody({
  q, value, onChange, locked, accent,
}: {
  q: QHighlight;
  value?: { wordIdx: number | null; correction: string }[];
  onChange: (v: { wordIdx: number | null; correction: string }[]) => void;
  locked: boolean;
  accent: string;
}) {
  const arr = value ?? q.items.map(() => ({ wordIdx: null, correction: "" }));
  const update = (i: number, patch: Partial<{ wordIdx: number | null; correction: string }>) => {
    const next = [...arr];
    next[i] = { ...next[i], ...patch };
    onChange(next);
  };
  return (
    <div className="space-y-5">
      {q.items.map((it, i) => {
        const words = it.sentence.split(/\s+/);
        const a = arr[i] ?? { wordIdx: null, correction: "" };
        const correctIdx = words.findIndex(
          (w) => w.replace(/[.,!?]/g, "").toLowerCase() === it.wrongWord.replace(/[.,!?]/g, "").toLowerCase(),
        );
        const wordOk = a.wordIdx === correctIdx;
        const corrOk =
          a.correction.trim().toLowerCase().replace(/[.,!?]/g, "") ===
          it.correction.toLowerCase().replace(/[.,!?]/g, "");
        return (
          <div key={i} className="rounded-2xl border border-border bg-muted/20 p-4">
            <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Sentence {i + 1} — click the wrong word
            </div>
            <div className="mt-2 flex flex-wrap gap-1.5 text-base leading-relaxed">
              {words.map((w, j) => {
                const selected = a.wordIdx === j;
                const showCorrect = locked && j === correctIdx;
                const showWrongPick = locked && selected && j !== correctIdx;
                return (
                  <button
                    key={j}
                    disabled={locked}
                    onClick={() => update(i, { wordIdx: j })}
                    className={cn(
                      "rounded-md px-1.5 py-0.5 transition",
                      !locked && !selected && "hover:bg-warning/20",
                      selected && !locked && "bg-warning/40 ring-2 ring-warning",
                      showCorrect && "bg-success/30 ring-2 ring-success text-success-foreground",
                      showWrongPick && "bg-destructive/20 ring-2 ring-destructive text-destructive line-through",
                    )}
                  >
                    {w}
                  </button>
                );
              })}
            </div>

            {(a.wordIdx !== null || locked) && (
              <div className="mt-3 flex items-center gap-2">
                <span className="text-xs font-semibold text-muted-foreground">Correction:</span>
                <input
                  disabled={locked}
                  value={a.correction}
                  onChange={(e) => update(i, { correction: e.target.value })}
                  placeholder="Type the correct word..."
                  className={cn(
                    "flex-1 rounded-lg border bg-surface px-3 py-1.5 text-sm outline-none focus:ring-2",
                    locked && (corrOk && wordOk
                      ? "border-success bg-success/10"
                      : "border-destructive bg-destructive/10"),
                    !locked && "border-border",
                  )}
                  style={!locked ? { ["--tw-ring-color" as string]: accent } : undefined}
                />
              </div>
            )}
            {locked && (!wordOk || !corrOk) && (
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
    case "listening":
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
