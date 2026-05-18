import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowUpRight, ClipboardCheck, Clock, FileQuestion, Layers, Sparkles } from "lucide-react";
import { TopNav } from "@/components/TopNav";
import { EXAM_SKILLS } from "@/lib/teacher-data";

export const Route = createFileRoute("/exams")({
  head: () => ({
    meta: [
      { title: "Thi cử — UNICOM LMS" },
      { name: "description", content: "Vào cổng thi để thực hiện các bài thi chính thức." },
    ],
  }),
  component: ExamsPage,
});

type SavedExam = {
  id?: string;
  name: string;
  levelCode: string;
  duration: number;
  description?: string;
  skills: string[];
  totalQuestions?: number;
  groups?: Record<string, { questions: unknown[] }>;
  savedAt: string;
};

const TEST_PORTAL_BASE = "https://exam-portal.ubos.vn";

// Stable hue per exam id (for visual variety, deterministic)
function hueFor(id: string) {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0;
  return h % 360;
}

function skillLabel(id: string) {
  return EXAM_SKILLS.find((s) => s.id === id)?.label.replace(/\s*\(.*\)/, "") ?? id;
}

function ExamsPage() {
  const [exams, setExams] = useState<SavedExam[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const raw = window.localStorage.getItem("unicom.exams");
    if (raw) {
      try {
        setExams(JSON.parse(raw));
      } catch {
        setExams([]);
      }
    }
    setLoaded(true);
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <TopNav />
      <div className="mx-auto max-w-7xl px-6 pb-20 pt-10 sm:px-8">
        <div className="flex flex-col gap-2">
          <span className="inline-flex w-fit items-center gap-2 text-xs font-semibold uppercase tracking-wider text-primary">
            <Sparkles className="h-3.5 w-3.5" /> Cổng thi chính thức
          </span>
          <h1 className="font-display text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            Thi cử
          </h1>
          <p className="text-sm text-muted-foreground">
            Danh sách các bài thi đã được Admin thiết lập. Chọn một bài để chuyển sang cổng thi và bắt đầu làm bài.
          </p>
        </div>

        {loaded && exams.length === 0 ? (
          <div className="mt-10 rounded-3xl border border-dashed border-border bg-surface/40 p-12 text-center">
            <ClipboardCheck className="mx-auto h-10 w-10 text-muted-foreground" />
            <h3 className="mt-3 font-display text-lg font-semibold text-foreground">
              Chưa có bài thi nào
            </h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Admin chưa thiết lập bài thi. Vui lòng tạo bài thi tại màn hình Quản lý bài thi.
            </p>
          </div>
        ) : (
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {exams.map((e, idx) => {
              const id = e.id ?? `exam-${idx}`;
              const hue = hueFor(id);
              const totalQuestions =
                e.totalQuestions ??
                (e.groups
                  ? Object.values(e.groups).reduce((s, g) => s + (g?.questions?.length ?? 0), 0)
                  : 0);
              return (
                <a
                  key={id}
                  href={TEST_PORTAL_BASE}
                  target="_blank"
                  rel="noreferrer"
                  className="group relative overflow-hidden rounded-3xl bg-surface p-5 ring-1 ring-border shadow-soft transition hover:-translate-y-1 hover:shadow-elevated"
                >
                  <div
                    className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full opacity-30 blur-3xl transition group-hover:opacity-60"
                    style={{ background: `oklch(0.78 0.18 ${hue})` }}
                  />
                  <div className="relative flex items-start justify-between">
                    <div
                      className="flex h-12 w-12 items-center justify-center rounded-2xl text-white"
                      style={{
                        background: `linear-gradient(135deg, oklch(0.5 0.2 ${hue}), oklch(0.65 0.18 ${(hue + 30) % 360}))`,
                      }}
                    >
                      <ClipboardCheck className="h-5 w-5" />
                    </div>
                    <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-1 text-[11px] font-semibold text-primary ring-1 ring-primary/20">
                      {e.levelCode}
                    </span>
                  </div>

                  <div className="relative mt-4">
                    <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                      Bài thi chính thức
                    </div>
                    <h3 className="mt-1 text-lg font-semibold text-foreground">{e.name}</h3>
                    {e.description && (
                      <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                        {e.description}
                      </p>
                    )}
                  </div>

                  <div className="relative mt-4 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                    <span className="inline-flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5" /> {e.duration} phút
                    </span>
                    <span>•</span>
                    <span className="inline-flex items-center gap-1">
                      <FileQuestion className="h-3.5 w-3.5" /> {totalQuestions} câu
                    </span>
                    <span>•</span>
                    <span className="inline-flex items-center gap-1">
                      <Layers className="h-3.5 w-3.5" /> {e.skills.length} kỹ năng
                    </span>
                  </div>

                  {e.skills.length > 0 && (
                    <div className="relative mt-3 flex flex-wrap gap-1.5">
                      {e.skills.map((s) => (
                        <span
                          key={s}
                          className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-semibold text-muted-foreground"
                        >
                          {skillLabel(s)}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="relative mt-5 flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">
                      Thiết lập: {new Date(e.savedAt).toLocaleDateString("vi-VN")}
                    </span>
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-foreground px-3 py-1.5 text-xs font-semibold text-background transition group-hover:gap-2">
                      Vào cổng thi
                      <ArrowUpRight className="h-3.5 w-3.5" />
                    </span>
                  </div>
                </a>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
