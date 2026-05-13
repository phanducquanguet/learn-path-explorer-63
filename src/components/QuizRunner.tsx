import { useMemo, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  CircleDashed,
  Mic,
  RotateCcw,
  Sparkles,
  Trophy,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";

/* ============================================================
 * Types — 10 question kinds based on the LMS sample
 * ============================================================ */

type Status = "correct" | "partial" | "incorrect";

type BaseQ = {
  id: string;
  index: number;
  prompt: string;
  hint?: string;
  /** Maximum score set by teacher */
  maxScore: number;
};

type QSingle = BaseQ & {
  kind: "single";
  options: string[];
  answer: number; // index
};
type QMulti = BaseQ & {
  kind: "multi";
  options: string[];
  answer: number[]; // indices
};
type QFill = BaseQ & {
  kind: "fill";
  /** prompt has {1} {2} placeholders */
  blanks: string[]; // expected (lowercased compared)
};
type QEssay = BaseQ & {
  kind: "essay";
  brief: string;
  minWords: number;
};
type QMatch = BaseQ & {
  kind: "match";
  left: string[];
  right: string[]; // labelled A,B,C,D
  answer: number[]; // for each left item, index into right
};
type QRewrite = BaseQ & {
  kind: "rewrite";
  items: { source: string; answer: string }[];
};
type QHighlight = BaseQ & {
  kind: "highlight";
  items: { source: string; answer: string }[];
};
type QSequence = BaseQ & {
  kind: "sequence";
  items: string[]; // displayed in correct order; we shuffle
};
type QAudio = BaseQ & { kind: "audio" };
type QGapMulti = BaseQ & {
  kind: "gapmulti";
  /** prompt has {1} {2} placeholders */
  blanks: { options: string[]; answer: number }[];
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
  | QGapMulti;

/* ============================================================
 * Sample quiz — deterministic from a seed (quizId)
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
  const _seed = hash(quizId);
  return [
    {
      id: "q1",
      index: 1,
      kind: "single",
      maxScore: 1,
      prompt: "One choice: chọn 1 đáp án đúng",
      options: [
        "Câu trả lời trắc nghiệm đúng",
        "Câu trả lời trắc nghiệm sai",
        "Câu trả lời trắc nghiệm sai",
        "Câu trả lời trắc nghiệm sai",
      ],
      answer: 0,
    },
    {
      id: "q2",
      index: 2,
      kind: "fill",
      maxScore: 2,
      prompt: "Nước sôi ở {1} khi áp suất khí quyển bằng 1 atm {2}",
      blanks: ["100 độ C", "đúng"],
    },
    {
      id: "q3",
      index: 3,
      kind: "multi",
      maxScore: 2,
      prompt: "Multi choice: chọn nhiều đáp án đúng",
      options: [
        "Câu trả lời trắc nghiệm đúng",
        "Câu trả lời trắc nghiệm sai",
        "Câu trả lời trắc nghiệm sai",
        "Câu trả lời trắc nghiệm sai",
      ],
      answer: [0],
    },
    {
      id: "q4",
      index: 4,
      kind: "essay",
      maxScore: 3,
      prompt: "Essay — Part 1: Email",
      brief:
        "You received this email.\nI'll be travelling to your country with my parents from the 10th to the 18th of next month. We're planning to stay near the city where you live, and I was wondering if we could meet while we're there. It would be lovely to catch up in person!\nPlease let me know if you're available.\nBest, Jordan\n\nWrite an email to Jordan:\n• say why you won't be free to meet when Jordan visits\n• suggest a place Jordan could explore in your area\n• offer another time later in the year when you could meet\nWrite at least 50 words in the box below.",
      minWords: 50,
    },
    {
      id: "q5",
      index: 5,
      kind: "match",
      maxScore: 4,
      prompt: "Matching — drag and drop: nối các câu vào đúng vị trí",
      left: [
        "Have you ever heard of space junk? You might remember the intense scene in the movie Gravity, where the protagonist is sent spinning into the blackness after their spacecraft is hit by a cloud of waste. {1}",
        "They are the very real reminders of space exploration, or what happens when we send satellites up into the Earth's atmosphere and don't clean up afterwards. {2}",
      ],
      right: [
        "Space junk can include anything from motors to nuts and bolts, and can vary in size, from tiny bits of paint to huge pieces of metal.",
        "The sky will be crawling with moving satellites and the number of stars that you would see would be minimal, even in a very dark sky.",
        "But their numbers are growing so quickly that it threatens those very systems that we so heavily rely on.",
        "Space junk can travel at speeds of up to 28,000 km per hour — that's roughly seven times faster than a speeding bullet.",
      ],
      answer: [0, 2],
    },
    {
      id: "q6",
      index: 6,
      kind: "rewrite",
      maxScore: 2,
      prompt: "Viết lại câu theo mẫu",
      items: [
        { source: "He is happy.", answer: "He feels happy." },
        { source: "She is tired.", answer: "She feels tired." },
      ],
    },
    {
      id: "q7",
      index: 7,
      kind: "highlight",
      maxScore: 2,
      prompt: "Text Highlight & Input",
      items: [
        { source: "He is happy.", answer: "He feels happy." },
        { source: "She is tired.", answer: "She feels tired." },
      ],
    },
    {
      id: "q8",
      index: 8,
      kind: "sequence",
      maxScore: 4,
      prompt: "Sequence — sắp xếp các câu theo đúng thứ tự",
      items: [
        "Space junk can include anything from motors to nuts and bolts, and can vary in size, from tiny bits of paint to huge pieces of metal.",
        "The sky will be crawling with moving satellites and the number of stars that you would see would be minimal, even in a very dark sky.",
        "But their numbers are growing so quickly that it threatens those very systems that we so heavily rely on.",
        "Space junk can travel at speeds of up to 28,000 km per hour — that's roughly seven times faster than a speeding bullet.",
      ],
    },
    {
      id: "q9",
      index: 9,
      kind: "audio",
      maxScore: 3,
      prompt: "Audio record — đọc và ghi âm câu sau",
    },
    {
      id: "q10",
      index: 10,
      kind: "gapmulti",
      maxScore: 2,
      prompt: "Multi choice gap fill: Nước sôi ở {1} khi áp suất khí quyển bằng 1 atm {2}",
      blanks: [
        { options: ["Success", "Fail", "Jail"], answer: 0 },
        { options: ["Success", "Fail", "Jail"], answer: 0 },
      ],
    },
  ];
}

/* ============================================================
 * Feedback copy
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
  hue,
  onExit,
}: {
  quizId: string;
  title: string;
  hue: number;
  onExit: () => void;
}) {
  const questions = useMemo(() => buildQuiz(quizId), [quizId]);
  const [idx, setIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, AnswerState>>({});
  const [results, setResults] = useState<Record<string, Result>>({});
  const [phase, setPhase] = useState<"running" | "summary">("running");

  const q = questions[idx];
  const result = results[q?.id];
  const totalMax = questions.reduce((s, x) => s + x.maxScore, 0);
  const totalEarned = Object.values(results).reduce((s, r) => s + r.earned, 0);
  const submittedCount = Object.keys(results).length;

  const setAnswer = (val: AnswerState) =>
    setAnswers((a) => ({ ...a, [q.id]: val }));

  const submit = () => {
    const r = grade(q, answers[q.id]);
    setResults((p) => ({ ...p, [q.id]: r }));
  };
  const next = () => {
    if (idx < questions.length - 1) setIdx(idx + 1);
    else setPhase("summary");
  };
  const prev = () => idx > 0 && setIdx(idx - 1);

  const reset = () => {
    setAnswers({});
    setResults({});
    setIdx(0);
    setPhase("running");
  };

  const accent = `oklch(0.55 0.2 ${hue})`;
  const accent2 = `oklch(0.45 0.22 ${(hue + 40) % 360})`;

  if (phase === "summary") {
    const pct = Math.round((totalEarned / totalMax) * 100);
    return (
      <div className="flex h-full flex-col">
        <RunnerHeader
          title={title}
          subtitle="Tổng kết bài luyện tập"
          hue={hue}
          onExit={onExit}
          right={
            <div className="rounded-full bg-white/15 px-3 py-1 text-xs font-semibold text-white ring-1 ring-white/20">
              {submittedCount}/{questions.length} câu
            </div>
          }
        />
        <div className="flex-1 overflow-auto bg-surface-2/40">
          <div className="mx-auto max-w-3xl space-y-5 p-5 sm:p-7">
            <div
              className="overflow-hidden rounded-3xl p-6 text-white shadow-elevated"
              style={{ background: `linear-gradient(135deg, ${accent}, ${accent2})` }}
            >
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-white/80">
                <Trophy className="h-4 w-4" /> Hoàn thành
              </div>
              <div className="mt-2 flex items-end gap-3">
                <div className="font-display text-5xl font-bold">{totalEarned}</div>
                <div className="pb-2 text-lg text-white/85">/ {totalMax} điểm</div>
              </div>
              <div className="mt-1 text-sm text-white/85">
                Tỷ lệ chính xác:{" "}
                <span className="font-semibold">{pct}%</span> — {pct >= 70 ? "Bạn đã đạt yêu cầu!" : "Hãy ôn tập thêm và thử lại nhé."}
              </div>
              <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-white/20">
                <div className="h-full rounded-full bg-white" style={{ width: `${pct}%` }} />
              </div>
            </div>

            <div className="space-y-3">
              {questions.map((qq) => {
                const r = results[qq.id];
                return (
                  <ReviewCard
                    key={qq.id}
                    q={qq}
                    answer={answers[qq.id]}
                    result={r}
                    accent={accent}
                  />
                );
              })}
            </div>
          </div>
        </div>
        <div className="flex items-center justify-between gap-3 border-t border-border bg-surface px-5 py-4 sm:px-7">
          <button
            onClick={reset}
            className="inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-foreground ring-1 ring-border hover:bg-muted"
          >
            <RotateCcw className="h-4 w-4" /> Làm lại bài
          </button>
          <button
            onClick={onExit}
            className="inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-white shadow-soft hover:opacity-95"
            style={{ background: `linear-gradient(135deg, ${accent}, ${accent2})` }}
          >
            Quay lại khoá học
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      <RunnerHeader
        title={title}
        subtitle={`Câu ${q.index} / ${questions.length}`}
        hue={hue}
        onExit={onExit}
        right={
          <div className="flex items-center gap-2 text-white">
            <div className="rounded-full bg-white/15 px-3 py-1 text-xs font-semibold ring-1 ring-white/20">
              Đã làm {submittedCount}/{questions.length}
            </div>
            <div className="rounded-full bg-white px-3 py-1 text-xs font-bold text-foreground">
              {totalEarned}/{totalMax} điểm
            </div>
          </div>
        }
      />

      {/* progress dots */}
      <div className="border-b border-border bg-surface px-5 py-3 sm:px-7">
        <div className="flex flex-wrap items-center gap-1.5">
          {questions.map((qq, i) => {
            const r = results[qq.id];
            const active = i === idx;
            return (
              <button
                key={qq.id}
                onClick={() => setIdx(i)}
                className={cn(
                  "inline-flex h-7 min-w-7 items-center justify-center rounded-full px-2 text-[11px] font-semibold ring-1 transition",
                  active
                    ? "ring-2 ring-foreground"
                    : "ring-border hover:bg-muted",
                  r?.status === "correct" && "bg-success/15 text-success-foreground",
                  r?.status === "partial" && "bg-warning/15 text-warning-foreground",
                  r?.status === "incorrect" && "bg-destructive/10 text-destructive",
                  !r && !active && "bg-surface text-muted-foreground",
                )}
                title={`Câu ${qq.index}`}
              >
                {qq.index}
              </button>
            );
          })}
        </div>
      </div>

      {/* body */}
      <div className="flex-1 overflow-auto bg-surface-2/40">
        <div className="mx-auto max-w-3xl p-5 sm:p-7">
          <div className="rounded-3xl bg-surface p-5 ring-1 ring-border sm:p-7">
            <div className="mb-4 flex items-start justify-between gap-3">
              <div>
                <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Câu {q.index} • {kindLabel(q.kind)}
                </div>
                <h3 className="mt-1 font-display text-lg font-semibold text-foreground">
                  {renderPromptHead(q.prompt)}
                </h3>
              </div>
              <ScoreBadge max={q.maxScore} earned={result?.earned} />
            </div>

            <QuestionBody
              q={q}
              value={answers[q.id]}
              onChange={setAnswer}
              locked={Boolean(result)}
              result={result}
              accent={accent}
            />

            {result && <FeedbackBlock status={result.status} />}
          </div>
        </div>
      </div>

      {/* footer */}
      <div className="flex items-center justify-between gap-3 border-t border-border bg-surface px-5 py-4 sm:px-7">
        <button
          onClick={prev}
          disabled={idx === 0}
          className="inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium text-foreground ring-1 ring-border hover:bg-muted disabled:opacity-40"
        >
          <ArrowLeft className="h-4 w-4" /> Câu trước
        </button>

        {!result ? (
          <button
            onClick={submit}
            disabled={!hasAnswer(q, answers[q.id])}
            className="inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold text-white shadow-soft transition hover:opacity-95 disabled:opacity-40"
            style={{ background: `linear-gradient(135deg, ${accent}, ${accent2})` }}
          >
            <Check className="h-4 w-4" /> Nộp câu trả lời
          </button>
        ) : (
          <button
            onClick={next}
            className="inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold text-white shadow-soft hover:opacity-95"
            style={{ background: `linear-gradient(135deg, ${accent}, ${accent2})` }}
          >
            {idx === questions.length - 1 ? "Xem kết quả" : "Câu tiếp theo"}{" "}
            <ArrowRight className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  );
}

/* ============================================================
 * Header
 * ============================================================ */

function RunnerHeader({
  title,
  subtitle,
  hue,
  onExit,
  right,
}: {
  title: string;
  subtitle: string;
  hue: number;
  onExit: () => void;
  right?: React.ReactNode;
}) {
  return (
    <div
      className="relative flex items-center justify-between gap-3 px-5 py-4 sm:px-7"
      style={{
        background: `linear-gradient(135deg, oklch(0.55 0.2 ${hue}), oklch(0.45 0.22 ${(hue + 40) % 360}))`,
      }}
    >
      <div className="min-w-0">
        <div className="text-[11px] font-semibold uppercase tracking-wider text-white/75">
          {subtitle}
        </div>
        <div className="truncate font-display text-base font-semibold text-white sm:text-lg">
          {title}
        </div>
      </div>
      <div className="flex items-center gap-2">
        {right}
        <button
          onClick={onExit}
          className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-white/15 text-white hover:bg-white/25"
          aria-label="Thoát"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

function ScoreBadge({ max, earned }: { max: number; earned?: number }) {
  return (
    <div className="shrink-0 rounded-2xl bg-muted/60 px-3 py-2 text-right ring-1 ring-border">
      <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
        Điểm
      </div>
      <div className="font-display text-sm font-bold text-foreground">
        {earned !== undefined ? `${earned} / ${max}` : `— / ${max}`}
      </div>
    </div>
  );
}

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

/* ============================================================
 * Question rendering
 * ============================================================ */

function kindLabel(k: Question["kind"]) {
  return {
    single: "One choice",
    multi: "Multi choice",
    fill: "Fill in the blank",
    essay: "Essay",
    match: "Matching",
    rewrite: "Sentence rewrite",
    highlight: "Text highlight & input",
    sequence: "Sequence",
    audio: "Audio record",
    gapmulti: "Multi choice gap fill",
  }[k];
}

function renderPromptHead(p: string) {
  // Strip {n} placeholders for the heading
  return p.replace(/\{\d+\}/g, "___");
}

function hasAnswer(q: Question, v: AnswerState): boolean {
  if (v === undefined || v === null) return false;
  switch (q.kind) {
    case "single":
      return typeof v === "number";
    case "multi":
      return Array.isArray(v) && v.length > 0;
    case "fill":
      return Array.isArray(v) && (v as string[]).every((s) => s && s.trim().length > 0);
    case "essay":
      return typeof v === "string" && v.trim().length > 0;
    case "match":
      return Array.isArray(v) && (v as (number | null)[]).every((x) => x !== null && x !== undefined);
    case "rewrite":
    case "highlight":
      return Array.isArray(v) && (v as string[]).every((s) => s && s.trim().length > 0);
    case "sequence":
      return Array.isArray(v) && (v as string[]).length === q.items.length;
    case "audio":
      return v === true;
    case "gapmulti":
      return Array.isArray(v) && (v as (number | null)[]).every((x) => x !== null && x !== undefined);
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
      const total = ans.length;
      let s: Status;
      if (correct === total && wrong === 0) s = "correct";
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
      const words = text.trim().split(/\s+/).filter(Boolean).length;
      const s: Status = words >= q.minWords ? "correct" : words >= q.minWords / 2 ? "partial" : "incorrect";
      return { status: s, earned: earn(s, q.maxScore) };
    }
    case "match": {
      const arr = (v as (number | null)[]) || [];
      const ok = q.answer.map((a, i) => arr[i] === a);
      const s = ratio(ok.filter(Boolean).length, q.answer.length);
      return { status: s, earned: earn(s, q.maxScore) };
    }
    case "rewrite":
    case "highlight": {
      const arr = (v as string[]) || [];
      const ok = q.items.map(
        (it, i) => (arr[i] || "").trim().toLowerCase() === it.answer.toLowerCase(),
      );
      const s = ratio(ok.filter(Boolean).length, q.items.length);
      return { status: s, earned: earn(s, q.maxScore) };
    }
    case "sequence": {
      const arr = (v as string[]) || [];
      const ok = q.items.map((it, i) => arr[i] === it);
      const s = ratio(ok.filter(Boolean).length, q.items.length);
      return { status: s, earned: earn(s, q.maxScore) };
    }
    case "audio": {
      // recording is mocked — always treat as partial credit
      return { status: "partial", earned: Math.round(q.maxScore * 0.7) };
    }
    case "gapmulti": {
      const arr = (v as (number | null)[]) || [];
      const ok = q.blanks.map((b, i) => arr[i] === b.answer);
      const s = ratio(ok.filter(Boolean).length, q.blanks.length);
      return { status: s, earned: earn(s, q.maxScore) };
    }
  }
}

function QuestionBody({
  q,
  value,
  onChange,
  locked,
  result,
  accent,
}: {
  q: Question;
  value: AnswerState;
  onChange: (v: AnswerState) => void;
  locked: boolean;
  result?: Result;
  accent: string;
}) {
  switch (q.kind) {
    case "single":
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
                  "flex w-full items-center gap-3 rounded-2xl border px-4 py-3 text-left text-sm transition",
                  selected
                    ? "border-foreground bg-foreground/5"
                    : "border-border hover:bg-muted/40",
                  isAnswer && "border-success bg-success/10",
                  wrongPick && "border-destructive bg-destructive/10",
                )}
              >
                <span
                  className={cn(
                    "flex h-5 w-5 items-center justify-center rounded-full border-2",
                    selected ? "border-foreground" : "border-border",
                    isAnswer && "border-success bg-success",
                  )}
                >
                  {(selected || isAnswer) && (
                    <span className="h-2 w-2 rounded-full bg-foreground" style={isAnswer ? { background: "white" } : undefined} />
                  )}
                </span>
                <span>{opt}</span>
              </button>
            );
          })}
        </div>
      );

    case "multi": {
      const sel = (value as number[]) || [];
      const toggle = (i: number) =>
        onChange(sel.includes(i) ? sel.filter((x) => x !== i) : [...sel, i]);
      return (
        <div className="space-y-2">
          {q.options.map((opt, i) => {
            const selected = sel.includes(i);
            const isAnswer = locked && q.answer.includes(i);
            const wrongPick = locked && selected && !q.answer.includes(i);
            return (
              <button
                key={i}
                disabled={locked}
                onClick={() => toggle(i)}
                className={cn(
                  "flex w-full items-center gap-3 rounded-2xl border px-4 py-3 text-left text-sm transition",
                  selected
                    ? "border-foreground bg-foreground/5"
                    : "border-border hover:bg-muted/40",
                  isAnswer && "border-success bg-success/10",
                  wrongPick && "border-destructive bg-destructive/10",
                )}
              >
                <span
                  className={cn(
                    "flex h-5 w-5 items-center justify-center rounded-md border-2",
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

    case "fill": {
      const arr = (value as string[]) || [];
      const update = (i: number, v: string) => {
        const next = [...arr];
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
            return (
              <input
                key={i}
                disabled={locked}
                value={arr[idx] || ""}
                onChange={(e) => update(idx, e.target.value)}
                className={cn(
                  "mx-1 inline-block min-w-[140px] rounded-md border-b-2 bg-muted/40 px-2 py-1 text-sm outline-none transition focus:bg-surface focus:ring-2",
                  locked &&
                    (arr[idx]?.trim().toLowerCase() === q.blanks[idx].toLowerCase()
                      ? "border-success bg-success/10"
                      : "border-destructive bg-destructive/10"),
                  !locked && "border-foreground/40",
                )}
                style={!locked ? { ["--tw-ring-color" as string]: accent } : undefined}
              />
            );
          })}
        </div>
      );
    }

    case "essay": {
      const text = (value as string) || "";
      const words = text.trim().split(/\s+/).filter(Boolean).length;
      return (
        <div className="space-y-3">
          <pre className="whitespace-pre-wrap rounded-2xl bg-muted/40 p-4 font-sans text-sm leading-relaxed text-foreground">
            {q.brief}
          </pre>
          <textarea
            disabled={locked}
            value={text}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Viết câu trả lời của bạn ở đây..."
            className="min-h-[180px] w-full rounded-2xl border border-border bg-surface p-3 text-sm outline-none focus:ring-2"
            style={{ ["--tw-ring-color" as string]: accent }}
          />
          <div className="flex items-center justify-between text-[11px] text-muted-foreground">
            <span>Yêu cầu tối thiểu: {q.minWords} từ</span>
            <span className={cn(words >= q.minWords && "font-semibold text-success-foreground")}>
              Word count: {words}
            </span>
          </div>
        </div>
      );
    }

    case "match": {
      const arr = (value as (number | null)[]) || q.left.map(() => null);
      const labels = ["A", "B", "C", "D", "E", "F"];
      const update = (i: number, v: number) => {
        const next = [...arr];
        next[i] = v;
        onChange(next);
      };
      return (
        <div className="grid gap-4 lg:grid-cols-2">
          <div className="space-y-3">
            {q.left.map((l, i) => (
              <div
                key={i}
                className="rounded-2xl border border-border bg-muted/30 p-3 text-sm leading-relaxed"
              >
                <div className="text-foreground">{l.replace(/\{(\d+)\}/g, "")}</div>
                <div className="mt-2 flex items-center gap-2">
                  <span className="text-[11px] font-semibold text-muted-foreground">
                    Vị trí {i + 1}:
                  </span>
                  <select
                    disabled={locked}
                    value={arr[i] ?? ""}
                    onChange={(e) => update(i, parseInt(e.target.value, 10))}
                    className={cn(
                      "rounded-lg border px-2 py-1 text-sm",
                      locked &&
                        (arr[i] === q.answer[i]
                          ? "border-success bg-success/10"
                          : "border-destructive bg-destructive/10"),
                      !locked && "border-border bg-surface",
                    )}
                  >
                    <option value="">— Chọn —</option>
                    {q.right.map((_, j) => (
                      <option key={j} value={j}>
                        {labels[j]}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            ))}
          </div>
          <div className="space-y-2">
            {q.right.map((r, j) => (
              <div
                key={j}
                className="flex gap-2 rounded-2xl border border-border bg-surface p-3 text-sm leading-relaxed"
              >
                <span className="font-semibold text-muted-foreground">{labels[j]}.</span>
                <span className="text-foreground">{r}</span>
              </div>
            ))}
          </div>
        </div>
      );
    }

    case "rewrite": {
      const arr = (value as string[]) || [];
      const update = (i: number, v: string) => {
        const next = [...arr];
        next[i] = v;
        onChange(next);
      };
      return (
        <div className="space-y-4">
          {q.items.map((it, i) => {
            const ok = locked && (arr[i] || "").trim().toLowerCase() === it.answer.toLowerCase();
            return (
              <div key={i}>
                <div className="text-sm text-foreground">
                  {i + 1}. {it.source}
                </div>
                <div className="mt-1 flex items-center gap-2">
                  <span className="text-muted-foreground">→</span>
                  <input
                    disabled={locked}
                    value={arr[i] || ""}
                    onChange={(e) => update(i, e.target.value)}
                    placeholder="Nhập câu viết lại..."
                    className={cn(
                      "flex-1 rounded-lg border bg-muted/40 px-3 py-2 text-sm outline-none focus:bg-surface focus:ring-2",
                      locked && (ok ? "border-success bg-success/10" : "border-destructive bg-destructive/10"),
                      !locked && "border-border",
                    )}
                    style={!locked ? { ["--tw-ring-color" as string]: accent } : undefined}
                  />
                </div>
              </div>
            );
          })}
        </div>
      );
    }

    case "highlight": {
      const arr = (value as string[]) || [];
      const update = (i: number, v: string) => {
        const next = [...arr];
        next[i] = v;
        onChange(next);
      };
      return (
        <div className="space-y-4">
          {q.items.map((it, i) => {
            const ok = locked && (arr[i] || "").trim().toLowerCase() === it.answer.toLowerCase();
            return (
              <div key={i}>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-foreground">
                    {i + 1}.{" "}
                    <mark className="rounded bg-warning/20 px-1 text-foreground">{it.source}</mark>
                  </span>
                  <span className="text-muted-foreground">🔗</span>
                </div>
                <div className="mt-1 flex items-center gap-2">
                  <span className="text-muted-foreground">→</span>
                  <input
                    disabled={locked}
                    value={arr[i] || ""}
                    onChange={(e) => update(i, e.target.value)}
                    placeholder="Nhập từ/cụm phù hợp..."
                    className={cn(
                      "flex-1 rounded-lg border bg-muted/40 px-3 py-2 text-sm outline-none focus:bg-surface focus:ring-2",
                      locked && (ok ? "border-success bg-success/10" : "border-destructive bg-destructive/10"),
                      !locked && "border-border",
                    )}
                    style={!locked ? { ["--tw-ring-color" as string]: accent } : undefined}
                  />
                </div>
              </div>
            );
          })}
        </div>
      );
    }

    case "sequence": {
      const arr =
        (value as string[]) ||
        shuffle(q.items, hash(q.id));
      // initialize on first render
      if (!value) onChange(arr);
      const move = (i: number, dir: -1 | 1) => {
        const j = i + dir;
        if (j < 0 || j >= arr.length) return;
        const next = [...arr];
        [next[i], next[j]] = [next[j], next[i]];
        onChange(next);
      };
      return (
        <div className="space-y-2">
          {arr.map((s, i) => {
            const ok = locked && q.items[i] === s;
            return (
              <div
                key={i}
                className={cn(
                  "flex items-center gap-3 rounded-2xl border px-3 py-2 text-sm",
                  locked && (ok ? "border-success bg-success/10" : "border-destructive bg-destructive/10"),
                  !locked && "border-border bg-muted/30",
                )}
              >
                <span className="font-semibold text-muted-foreground">{i + 1}.</span>
                <span className="flex-1 text-foreground">{s}</span>
                {!locked && (
                  <div className="flex flex-col">
                    <button
                      onClick={() => move(i, -1)}
                      className="rounded p-0.5 hover:bg-muted"
                      aria-label="Lên"
                    >
                      <ChevronUp className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => move(i, 1)}
                      className="rounded p-0.5 hover:bg-muted"
                      aria-label="Xuống"
                    >
                      <ChevronDown className="h-3.5 w-3.5" />
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      );
    }

    case "audio": {
      const recorded = value === true;
      return (
        <div className="flex flex-col items-center gap-3 rounded-2xl bg-muted/40 p-6 text-center">
          <div className="text-sm text-muted-foreground">
            Đọc to câu sau và ghi âm câu trả lời của bạn
          </div>
          <div className="font-display text-base font-semibold text-foreground">
            "Practice makes perfect — keep going!"
          </div>
          <button
            disabled={locked}
            onClick={() => onChange(true)}
            className={cn(
              "inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold text-white shadow-soft transition",
              recorded ? "bg-success" : "bg-destructive hover:opacity-90",
            )}
          >
            <Mic className="h-4 w-4" />
            {recorded ? "Đã ghi âm" : "Click here to start"}
          </button>
          {recorded && (
            <div className="text-[11px] text-muted-foreground">Nhấn nộp để gửi bản ghi</div>
          )}
        </div>
      );
    }

    case "gapmulti": {
      const arr = (value as (number | null)[]) || q.blanks.map(() => null);
      const update = (i: number, v: number) => {
        const next = [...arr];
        next[i] = v;
        onChange(next);
      };
      const parts = q.prompt.split(/(\{\d+\})/g);
      return (
        <div className="space-y-4">
          <div className="text-sm leading-loose text-foreground">
            {parts.map((p, i) => {
              const m = p.match(/\{(\d+)\}/);
              if (!m) return <span key={i}>{p}</span>;
              const idx = parseInt(m[1], 10) - 1;
              const sel = arr[idx];
              const opt = sel !== null && sel !== undefined ? q.blanks[idx].options[sel] : "___";
              return (
                <span
                  key={i}
                  className={cn(
                    "mx-1 inline-flex items-center rounded-md px-2 py-0.5 text-xs font-semibold ring-1",
                    sel !== null && sel !== undefined
                      ? "bg-foreground/5 text-foreground ring-foreground/20"
                      : "bg-muted text-muted-foreground ring-border",
                    locked &&
                      (sel === q.blanks[idx].answer
                        ? "bg-success/15 text-success-foreground ring-success/30"
                        : "bg-destructive/10 text-destructive ring-destructive/30"),
                  )}
                >
                  {opt}
                </span>
              );
            })}
          </div>
          {q.blanks.map((b, i) => (
            <div key={i} className="rounded-2xl border border-border bg-muted/30 p-3">
              <div className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                Ô trống {i + 1}
              </div>
              <div className="space-y-1.5">
                {b.options.map((opt, j) => {
                  const selected = arr[i] === j;
                  const isAnswer = locked && j === b.answer;
                  return (
                    <button
                      key={j}
                      disabled={locked}
                      onClick={() => update(i, j)}
                      className={cn(
                        "flex w-full items-center gap-2 rounded-lg border px-3 py-2 text-left text-sm",
                        selected ? "border-foreground bg-foreground/5" : "border-border bg-surface",
                        isAnswer && "border-success bg-success/10",
                      )}
                    >
                      <span
                        className={cn(
                          "h-3.5 w-3.5 rounded-full border-2",
                          selected ? "border-foreground bg-foreground" : "border-border",
                          isAnswer && "border-success bg-success",
                        )}
                      />
                      {opt}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      );
    }
  }
}

/* ============================================================
 * Review card (summary)
 * ============================================================ */

function ReviewCard({
  q,
  answer,
  result,
  accent,
}: {
  q: Question;
  answer: AnswerState;
  result?: Result;
  accent: string;
}) {
  const status = result?.status;
  return (
    <div className="rounded-2xl bg-surface p-5 ring-1 ring-border">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            Câu {q.index} • {kindLabel(q.kind)}
          </div>
          <div className="mt-1 text-sm font-semibold text-foreground">
            {renderPromptHead(q.prompt)}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {status && (
            <span
              className={cn(
                "rounded-full px-2 py-0.5 text-[10px] font-semibold",
                status === "correct" && "bg-success/15 text-success-foreground",
                status === "partial" && "bg-warning/15 text-warning-foreground",
                status === "incorrect" && "bg-destructive/10 text-destructive",
              )}
            >
              {FEEDBACK[status].label}
            </span>
          )}
          {!result && (
            <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-[10px] font-semibold text-muted-foreground">
              <CircleDashed className="h-3 w-3" /> Chưa làm
            </span>
          )}
          <span
            className="rounded-full px-2 py-0.5 text-[10px] font-bold text-white"
            style={{ background: accent }}
          >
            {result?.earned ?? 0}/{q.maxScore}
          </span>
        </div>
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
      return <span>Đáp án đúng: {q.options[q.answer]}</span>;
    case "multi":
      return <span>Đáp án đúng: {q.answer.map((i) => q.options[i]).join(" • ")}</span>;
    case "fill":
      return <span>Đáp án đúng: {q.blanks.join(" / ")}</span>;
    case "match": {
      const labels = ["A", "B", "C", "D", "E", "F"];
      return <span>Đáp án đúng: {q.answer.map((a, i) => `${i + 1}→${labels[a]}`).join(", ")}</span>;
    }
    case "rewrite":
    case "highlight":
      return <span>Đáp án đúng: {q.items.map((it) => it.answer).join(" / ")}</span>;
    case "sequence":
      return <span>Thứ tự đúng: {q.items.map((_, i) => i + 1).join(" → ")}</span>;
    case "gapmulti":
      return <span>Đáp án đúng: {q.blanks.map((b) => b.options[b.answer]).join(" / ")}</span>;
    case "essay":
      return <span>Đánh giá theo độ dài tối thiểu {q.minWords} từ và nội dung.</span>;
    case "audio":
      return <span>Đánh giá phát âm sẽ do giáo viên xem xét.</span>;
  }
}
