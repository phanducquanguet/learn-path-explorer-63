import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { TopNav } from "@/components/TopNav";
import { useRole } from "@/contexts/RoleContext";
import { courseQuestions, type CourseQuestion, type QAAnswer } from "@/lib/qa-data";
import { levels, getCourse } from "@/lib/lms-data";
import { ArrowLeft, MessageSquare, Send, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

type QASearch = { courseId?: string };

export const Route = createFileRoute("/teacher/qa")({
  head: () => ({ meta: [{ title: "Hỏi đáp học viên — UNICOM LMS" }] }),
  validateSearch: (s: Record<string, unknown>): QASearch => ({
    courseId: typeof s.courseId === "string" ? s.courseId : undefined,
  }),
  component: QAPage,
});

function QAPage() {
  const { role } = useRole();
  const [list, setList] = useState<CourseQuestion[]>(courseQuestions);
  const [filter, setFilter] = useState<"all" | "open" | "answered">("all");
  const [active, setActive] = useState<CourseQuestion | null>(courseQuestions[0]);
  const [draft, setDraft] = useState("");

  const filtered = list.filter((q) =>
    filter === "all"
      ? true
      : filter === "answered"
        ? q.answers.length > 0
        : q.answers.length === 0,
  );

  const submit = () => {
    if (!active || !draft.trim()) return;
    const answer: QAAnswer = {
      id: `a-${Date.now()}`,
      authorName: role === "admin" ? "Admin UNICOM" : "Cô Mai Lan",
      authorRole: role === "admin" ? "admin" : "teacher",
      content: draft,
      answeredAt: new Date().toISOString(),
    };
    const updated = list.map((q) =>
      q.id === active.id ? { ...q, answers: [...q.answers, answer] } : q,
    );
    setList(updated);
    setActive({ ...active, answers: [...active.answers, answer] });
    setDraft("");
  };

  return (
    <div className="min-h-screen bg-background">
      <TopNav />
      <div className="mx-auto max-w-7xl px-6 pb-20 pt-10 sm:px-8">
        <Link
          to="/teacher"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" /> Trở lại Tổng quan
        </Link>

        <div className="mt-4">
          <h1 className="font-display text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            Hỏi đáp học viên
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Trả lời câu hỏi của học viên trong các khóa học bạn phụ trách.
          </p>
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-[380px_1fr]">
          <aside className="space-y-3">
            <div className="flex gap-1.5 rounded-xl bg-surface p-1 ring-1 ring-border">
              {(["all", "open", "answered"] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={cn(
                    "flex-1 rounded-lg px-3 py-1.5 text-xs font-semibold transition",
                    filter === f
                      ? "bg-foreground text-background"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  {f === "all" ? "Tất cả" : f === "open" ? "Chưa trả lời" : "Đã trả lời"}
                </button>
              ))}
            </div>
            <div className="space-y-2">
              {filtered.map((q) => (
                <button
                  key={q.id}
                  onClick={() => setActive(q)}
                  className={cn(
                    "block w-full rounded-2xl border bg-surface p-4 text-left transition",
                    active?.id === q.id
                      ? "border-primary ring-2 ring-primary/20"
                      : "border-border hover:bg-muted",
                  )}
                >
                  <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                    <span className="font-semibold">{q.studentName}</span>
                    {q.answers.length > 0 ? (
                      <span className="inline-flex items-center gap-1 text-emerald-600">
                        <CheckCircle2 className="h-3 w-3" /> Đã trả lời
                      </span>
                    ) : (
                      <span className="text-amber-600">Chờ trả lời</span>
                    )}
                  </div>
                  <div className="mt-1.5 text-sm font-medium text-foreground line-clamp-2">
                    {q.content}
                  </div>
                  <div className="mt-2 text-[11px] text-muted-foreground">
                    {q.unitTitle} • {q.studentClass}
                  </div>
                </button>
              ))}
              {filtered.length === 0 && (
                <div className="rounded-2xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
                  Không có câu hỏi.
                </div>
              )}
            </div>
          </aside>

          <main className="rounded-3xl border border-border bg-surface p-6 shadow-soft">
            {active ? (
              <>
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-primary to-chart-5 text-sm font-semibold text-primary-foreground">
                    {active.studentName.split(" ").pop()?.[0]}
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold text-foreground">{active.studentName}</div>
                    <div className="text-xs text-muted-foreground">
                      {active.studentClass} • {active.unitTitle} •{" "}
                      {new Date(active.askedAt).toLocaleString("vi-VN")}
                    </div>
                  </div>
                </div>
                <p className="mt-4 rounded-2xl bg-muted/60 p-4 text-sm text-foreground">
                  {active.content}
                </p>

                <div className="mt-6">
                  <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Trả lời ({active.answers.length})
                  </div>
                  <div className="mt-3 space-y-3">
                    {active.answers.map((a) => (
                      <div
                        key={a.id}
                        className="rounded-2xl border border-border bg-background p-4"
                      >
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-semibold text-foreground">
                            {a.authorName}{" "}
                            <span className="ml-1 rounded bg-primary/10 px-1.5 py-0.5 text-[10px] font-semibold text-primary">
                              {a.authorRole === "admin" ? "ADMIN" : "GIÁO VIÊN"}
                            </span>
                          </span>
                          <span className="text-muted-foreground">
                            {new Date(a.answeredAt).toLocaleString("vi-VN")}
                          </span>
                        </div>
                        <p className="mt-2 text-sm text-foreground">{a.content}</p>
                      </div>
                    ))}
                    {active.answers.length === 0 && (
                      <div className="rounded-xl bg-amber-50 p-3 text-xs text-amber-900">
                        Chưa có câu trả lời. Hãy là người đầu tiên giải đáp.
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-6 border-t border-border pt-4">
                  <textarea
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    placeholder="Nhập câu trả lời cho học viên..."
                    rows={4}
                    className="w-full rounded-xl border border-border bg-background p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                  <div className="mt-2 flex justify-end">
                    <button
                      onClick={submit}
                      disabled={!draft.trim()}
                      className="inline-flex items-center gap-1.5 rounded-xl px-4 py-2 text-sm font-semibold text-primary-foreground shadow-soft disabled:opacity-50"
                      style={{ background: "var(--gradient-brand)" }}
                    >
                      <Send className="h-4 w-4" /> Gửi trả lời
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex h-full min-h-[300px] items-center justify-center text-muted-foreground">
                <div className="text-center">
                  <MessageSquare className="mx-auto h-10 w-10" />
                  <div className="mt-3 text-sm">Chọn câu hỏi bên trái để trả lời</div>
                </div>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
