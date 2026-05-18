import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import {
  ArrowLeft,
  ClipboardList,
  Clock,
  Headphones,
  BookOpen,
  PenLine,
  Mic,
  Play,
  Sparkles,
  Trophy,
} from "lucide-react";
import { TopNav } from "@/components/TopNav";
import { QuizRunner } from "@/components/QuizRunner";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/practice")({
  head: () => ({
    meta: [
      { title: "Luyện thi — UNICOM LMS" },
      {
        name: "description",
        content:
          "Các bài luyện thi được làm trực tiếp trên hệ thống, không cần chuyển cổng thi.",
      },
    ],
  }),
  component: PracticePage,
});

type Skill = "listening" | "reading" | "writing" | "speaking" | "mixed";

type Practice = {
  id: string;
  title: string;
  skill: Skill;
  level: string;
  duration: number;
  questions: number;
  hue: number;
  bestScore?: number;
  attempts: number;
  description: string;
};

const SKILL_META: Record<Skill, { label: string; icon: typeof Headphones }> = {
  listening: { label: "Nghe", icon: Headphones },
  reading: { label: "Đọc", icon: BookOpen },
  writing: { label: "Viết", icon: PenLine },
  speaking: { label: "Nói", icon: Mic },
  mixed: { label: "Tổng hợp", icon: ClipboardList },
};

const practices: Practice[] = [
  {
    id: "pr-listen-b1-1",
    title: "Listening B1 — Daily Conversations",
    skill: "listening",
    level: "B1",
    duration: 20,
    questions: 15,
    hue: 200,
    bestScore: 12,
    attempts: 2,
    description: "Luyện nghe hội thoại đời thường, các tình huống mua sắm và du lịch.",
  },
  {
    id: "pr-read-b1-1",
    title: "Reading B1 — Short Articles",
    skill: "reading",
    level: "B1",
    duration: 30,
    questions: 20,
    hue: 155,
    attempts: 0,
    description: "Đọc hiểu các bài báo ngắn, rèn kỹ năng skim & scan.",
  },
  {
    id: "pr-write-b1-1",
    title: "Writing B1 — Email & Short Essay",
    skill: "writing",
    level: "B1",
    duration: 40,
    questions: 2,
    hue: 290,
    attempts: 1,
    description: "Viết email và đoạn văn ngắn ~120 từ theo chủ đề thường gặp.",
  },
  {
    id: "pr-speak-b1-1",
    title: "Speaking B1 — Topic Talks",
    skill: "speaking",
    level: "B1",
    duration: 15,
    questions: 4,
    hue: 25,
    attempts: 0,
    description: "Luyện nói theo chủ đề, ghi âm và xem nhận xét gợi ý.",
  },
  {
    id: "pr-mix-a2-1",
    title: "Mini Practice A2 — Mixed Skills",
    skill: "mixed",
    level: "A2",
    duration: 25,
    questions: 18,
    hue: 260,
    bestScore: 14,
    attempts: 3,
    description: "Bài tổng hợp 4 kỹ năng cấp độ A2.",
  },
  {
    id: "pr-mix-b2-1",
    title: "Full Practice B2 — Mixed Skills",
    skill: "mixed",
    level: "B2",
    duration: 60,
    questions: 40,
    hue: 180,
    attempts: 0,
    description: "Bài luyện thi tổng hợp B2 với đủ kỹ năng.",
  },
];

function PracticePage() {
  const [active, setActive] = useState<Practice | null>(null);

  if (active) {
    return (
      <div className="min-h-screen bg-background">
        <TopNav />
        <div className="mx-auto max-w-5xl px-6 pb-20 pt-6 sm:px-8">
          <button
            onClick={() => setActive(null)}
            className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" /> Trở lại danh sách luyện thi
          </button>
          <QuizRunner
            quizId={active.id}
            title={active.title}
            hue={active.hue}
            onExit={() => setActive(null)}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <TopNav />
      <div className="mx-auto max-w-7xl px-6 pb-20 pt-10 sm:px-8">
        <div className="flex flex-col gap-2">
          <span className="inline-flex w-fit items-center gap-2 text-xs font-semibold uppercase tracking-wider text-primary">
            <Sparkles className="h-3.5 w-3.5" /> Luyện tập trên hệ thống
          </span>
          <h1 className="font-display text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            Luyện thi
          </h1>
          <p className="text-sm text-muted-foreground">
            Các bài luyện tập được làm trực tiếp tại đây, có chấm điểm tức thì và giải thích chi tiết.
          </p>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {practices.map((p) => {
            const meta = SKILL_META[p.skill];
            const Icon = meta.icon;
            return (
              <button
                key={p.id}
                onClick={() => setActive(p)}
                className={cn(
                  "group relative overflow-hidden rounded-3xl bg-surface p-5 text-left ring-1 ring-border shadow-soft transition hover:-translate-y-1 hover:shadow-elevated",
                )}
              >
                <div
                  className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full opacity-30 blur-3xl transition group-hover:opacity-60"
                  style={{ background: `oklch(0.78 0.18 ${p.hue})` }}
                />
                <div className="relative flex items-start justify-between">
                  <div
                    className="flex h-12 w-12 items-center justify-center rounded-2xl text-white"
                    style={{
                      background: `linear-gradient(135deg, oklch(0.5 0.2 ${p.hue}), oklch(0.65 0.18 ${(p.hue + 30) % 360}))`,
                    }}
                  >
                    <Icon className="h-5 w-5" />
                  </div>
                  <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-1 text-[11px] font-semibold text-primary ring-1 ring-primary/20">
                    {meta.label}
                  </span>
                </div>

                <div className="relative mt-4">
                  <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Cấp độ {p.level}
                  </div>
                  <h3 className="mt-1 text-lg font-semibold text-foreground">{p.title}</h3>
                  <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                    {p.description}
                  </p>
                </div>

                <div className="relative mt-4 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                  <span className="inline-flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5" /> {p.duration} phút
                  </span>
                  <span>•</span>
                  <span>{p.questions} câu</span>
                  {p.bestScore !== undefined && (
                    <>
                      <span>•</span>
                      <span className="inline-flex items-center gap-1 text-success-foreground">
                        <Trophy className="h-3.5 w-3.5" /> Cao nhất: {p.bestScore}
                      </span>
                    </>
                  )}
                </div>

                <div className="relative mt-5 flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">
                    {p.attempts > 0 ? `${p.attempts} lần đã luyện` : "Chưa luyện"}
                  </span>
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-foreground px-3 py-1.5 text-xs font-semibold text-background transition group-hover:gap-2">
                    <Play className="h-3.5 w-3.5" /> Bắt đầu
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
