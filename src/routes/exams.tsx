import { createFileRoute } from "@tanstack/react-router";
import { ArrowUpRight, ClipboardCheck, Clock, Sparkles, Trophy } from "lucide-react";
import { TopNav } from "@/components/TopNav";

export const Route = createFileRoute("/exams")({
  head: () => ({
    meta: [
      { title: "Luyện thi — UNICOM LMS" },
      { name: "description", content: "Danh sách bài luyện thi và cổng thi." },
    ],
  }),
  component: ExamsPage,
});

type Exam = {
  id: string;
  title: string;
  level: string;
  duration: number;
  questions: number;
  type: "Full test" | "Mini test" | "Mock";
  hue: number;
  bestScore?: number;
  attempts: number;
};

const exams: Exam[] = [
  { id: "ielts-full-1", title: "IELTS Academic — Full Mock 01", level: "B2-C1", duration: 165, questions: 40, type: "Full test", hue: 260, bestScore: 7.0, attempts: 2 },
  { id: "toeic-full-1", title: "TOEIC Listening & Reading — Full Test", level: "B1-B2", duration: 120, questions: 200, type: "Full test", hue: 200, bestScore: 780, attempts: 1 },
  { id: "ket-mini-1", title: "Cambridge KET — Reading Mini", level: "A2", duration: 30, questions: 25, type: "Mini test", hue: 155, attempts: 0 },
  { id: "pet-mock-1", title: "Cambridge PET — Mock Exam", level: "B1", duration: 90, questions: 60, type: "Mock", hue: 180, bestScore: 142, attempts: 3 },
  { id: "fce-mock-1", title: "Cambridge FCE — Mock Exam", level: "B2", duration: 140, questions: 75, type: "Mock", hue: 290, attempts: 0 },
  { id: "toefl-mini-1", title: "TOEFL iBT — Reading Mini", level: "B2", duration: 35, questions: 14, type: "Mini test", hue: 25, attempts: 0 },
];

const TEST_PORTAL_BASE = "https://exam-portal.ubos.vn";

function ExamsPage() {
  return (
    <div className="min-h-screen bg-background">
      <TopNav />
      <div className="mx-auto max-w-7xl px-6 pb-20 pt-10 sm:px-8">
        <div className="flex flex-col gap-2">
          <span className="inline-flex w-fit items-center gap-2 text-xs font-semibold uppercase tracking-wider text-primary">
            <Sparkles className="h-3.5 w-3.5" /> Phòng luyện thi
          </span>
          <h1 className="font-display text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            Bài luyện thi
          </h1>
          <p className="text-sm text-muted-foreground">
            Chọn một bài thi để chuyển sang cổng thi (Test Portal) và bắt đầu làm bài.
          </p>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {exams.map((e) => (
            <a
              key={e.id}
              href={`${TEST_PORTAL_BASE}/exams/${e.id}`}
              target="_blank"
              rel="noreferrer"
              className="group relative overflow-hidden rounded-3xl bg-surface p-5 ring-1 ring-border shadow-soft transition hover:-translate-y-1 hover:shadow-elevated"
            >
              <div
                className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full opacity-30 blur-3xl transition group-hover:opacity-60"
                style={{ background: `oklch(0.78 0.18 ${e.hue})` }}
              />
              <div className="relative flex items-start justify-between">
                <div
                  className="flex h-12 w-12 items-center justify-center rounded-2xl text-white"
                  style={{
                    background: `linear-gradient(135deg, oklch(0.5 0.2 ${e.hue}), oklch(0.65 0.18 ${(e.hue + 30) % 360}))`,
                  }}
                >
                  <ClipboardCheck className="h-5 w-5" />
                </div>
                <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-1 text-[11px] font-semibold text-primary ring-1 ring-primary/20">
                  {e.type}
                </span>
              </div>

              <div className="relative mt-4">
                <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Cấp độ {e.level}
                </div>
                <h3 className="mt-1 text-lg font-semibold text-foreground">{e.title}</h3>
              </div>

              <div className="relative mt-4 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                <span className="inline-flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5" /> {e.duration} phút
                </span>
                <span>•</span>
                <span>{e.questions} câu</span>
                {e.bestScore !== undefined && (
                  <>
                    <span>•</span>
                    <span className="inline-flex items-center gap-1 text-success-foreground">
                      <Trophy className="h-3.5 w-3.5" /> Cao nhất: {e.bestScore}
                    </span>
                  </>
                )}
              </div>

              <div className="relative mt-5 flex items-center justify-between">
                <span className="text-xs text-muted-foreground">
                  {e.attempts > 0 ? `${e.attempts} lần đã thi` : "Chưa làm bài"}
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-foreground px-3 py-1.5 text-xs font-semibold text-background transition group-hover:gap-2">
                  Vào cổng thi
                  <ArrowUpRight className="h-3.5 w-3.5" />
                </span>
              </div>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
