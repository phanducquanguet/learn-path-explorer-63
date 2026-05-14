import { createFileRoute, Link } from "@tanstack/react-router";
import { CheckCircle2, Lock, Play, Clock, Sparkles, GraduationCap } from "lucide-react";
import { levels } from "@/lib/lms-data";
import { TopNav } from "@/components/TopNav";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/courses/")({
  head: () => ({
    meta: [
      { title: "Khóa học — UNICOM LMS" },
      { name: "description", content: "Danh sách khóa học theo từng cấp độ." },
    ],
  }),
  component: CoursesListPage,
});

function CoursesListPage() {
  const allCourses = levels.flatMap((lv) =>
    lv.courses.map((c) => ({ course: c, level: lv })),
  );
  const completed = allCourses.filter((x) => x.course.progress >= 100).length;

  return (
    <div className="min-h-screen bg-background">
      <TopNav />
      <div className="mx-auto max-w-7xl px-6 pb-20 pt-10 sm:px-8">
        <div className="flex flex-col gap-2">
          <span className="inline-flex w-fit items-center gap-2 text-xs font-semibold uppercase tracking-wider text-primary">
            <Sparkles className="h-3.5 w-3.5" /> Tất cả khóa học
          </span>
          <h1 className="font-display text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            Danh sách khóa học
          </h1>
          <p className="text-sm text-muted-foreground">
            {allCourses.length} khóa học • {completed} đã hoàn thành
          </p>
        </div>

        {levels.map((lv) => (
          <section key={lv.id} className="mt-12">
            <div className="flex items-center gap-3">
              <div
                className="flex h-12 w-12 items-center justify-center rounded-2xl text-lg font-black text-white"
                style={{
                  background: `linear-gradient(135deg, oklch(0.5 0.2 ${lv.hue}), oklch(0.65 0.18 ${(lv.hue + 30) % 360}))`,
                  boxShadow: `0 8px 24px -8px oklch(0.55 0.2 ${lv.hue} / 0.5)`,
                }}
              >
                {lv.code}
              </div>
              <div>
                <h2 className="font-display text-xl font-semibold text-foreground">
                  Cấp độ {lv.code} — {lv.name}
                </h2>
                <p className="text-xs text-muted-foreground">{lv.description}</p>
              </div>
            </div>

            {lv.courses.length === 0 ? (
              <div className="mt-4 rounded-2xl border border-dashed border-border bg-surface/40 p-6 text-center text-sm text-muted-foreground">
                <Lock className="mx-auto mb-2 h-5 w-5" />
                Cấp độ này chưa được mở.
              </div>
            ) : (
              <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {lv.courses.map((c) => {
                  const done = c.progress >= 100;
                  return (
                    <Link
                      key={c.id}
                      to="/courses/$courseId"
                      params={{ courseId: c.id }}
                      className="group relative overflow-hidden rounded-3xl bg-surface p-5 ring-1 ring-border shadow-soft transition hover:-translate-y-1 hover:shadow-elevated"
                    >
                      <div
                        className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full opacity-30 blur-3xl transition group-hover:opacity-60"
                        style={{ background: `oklch(0.78 0.18 ${lv.hue})` }}
                      />
                      <div className="relative flex items-start justify-between">
                        <div
                          className="flex h-12 w-12 items-center justify-center rounded-2xl text-primary-foreground"
                          style={{
                            background: `linear-gradient(135deg, oklch(0.5 0.18 ${lv.hue}), oklch(0.65 0.18 ${(lv.hue + 30) % 360}))`,
                          }}
                        >
                          <GraduationCap className="h-5 w-5" />
                        </div>
                        <span
                          className={cn(
                            "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold ring-1",
                            done
                              ? "bg-success/15 text-success-foreground ring-success/30"
                              : "bg-primary/10 text-primary ring-primary/20",
                          )}
                        >
                          {done ? (
                            <>
                              <CheckCircle2 className="h-3 w-3" /> Đã học
                            </>
                          ) : (
                            <>
                              <Play className="h-3 w-3" /> Đang học
                            </>
                          )}
                        </span>
                      </div>

                      <div className="relative mt-4">
                        <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                          Cấp độ {lv.code}
                        </div>
                        <h3 className="mt-1 text-lg font-semibold text-foreground">
                          {c.title}
                        </h3>
                        <p className="mt-1 text-xs text-muted-foreground">{c.subtitle}</p>
                      </div>

                      <div className="relative mt-4">
                        <div className="flex items-center justify-between text-[11px] font-medium text-muted-foreground">
                          <span className="inline-flex items-center gap-1">
                            <Clock className="h-3 w-3" /> {c.hours}h • {c.units.length} units
                          </span>
                          <span>{c.progress}%</span>
                        </div>
                        <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-muted">
                          <div
                            className="h-full rounded-full"
                            style={{
                              width: `${c.progress}%`,
                              background: `linear-gradient(90deg, oklch(0.55 0.2 ${lv.hue}), oklch(0.7 0.18 ${(lv.hue + 40) % 360}))`,
                            }}
                          />
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </section>
        ))}
      </div>
    </div>
  );
}
