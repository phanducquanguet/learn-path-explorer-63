import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft, ArrowUpRight, BookOpen, Clock, Layers, Users } from "lucide-react";
import { getLevel } from "@/lib/lms-data";

export const Route = createFileRoute("/levels/$level")({
  head: ({ params }) => ({
    meta: [
      { title: `Cấp độ ${params.level.toUpperCase()} — UNICOM LMS` },
      { name: "description", content: `Danh sách khoá học cấp độ ${params.level.toUpperCase()}.` },
    ],
  }),
  component: LevelPage,
  notFoundComponent: () => (
    <div className="p-10 text-center text-muted-foreground">Không tìm thấy cấp độ.</div>
  ),
});

function LevelPage() {
  const { level } = Route.useParams();
  const lv = getLevel(level);
  if (!lv) throw notFound();

  return (
    <div className="min-h-screen bg-background">
      <div
        className="relative overflow-hidden"
        style={{
          background: `linear-gradient(135deg, oklch(0.95 0.05 ${lv.hue}) 0%, oklch(0.97 0.025 ${(lv.hue + 40) % 360}) 100%)`,
        }}
      >
        <div className="mx-auto max-w-7xl px-6 pt-8 pb-16 sm:px-8">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" /> Quay lại tổng quan
          </Link>

          <div className="mt-6 flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-5">
              <div
                className="flex h-20 w-20 items-center justify-center rounded-3xl text-2xl font-bold text-white shadow-elevated"
                style={{
                  background: `linear-gradient(135deg, oklch(0.55 0.18 ${lv.hue}), oklch(0.7 0.16 ${(lv.hue + 30) % 360}))`,
                }}
              >
                {lv.code}
              </div>
              <div>
                <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Cấp độ {lv.code}
                </div>
                <h1 className="font-display text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
                  {lv.name}
                </h1>
                <p className="mt-1 max-w-xl text-sm text-muted-foreground">{lv.description}</p>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <Stat icon={<Layers className="h-4 w-4" />} label="Khoá học" value={`${lv.courses.length}`} />
              <Stat icon={<Clock className="h-4 w-4" />} label="Tổng giờ học" value={`${lv.courses.reduce((a, c) => a + c.hours, 0)}h`} />
              <Stat icon={<BookOpen className="h-4 w-4" />} label="Tiến độ" value={`${lv.progress}%`} />
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-6 py-10 sm:px-8">
        <h2 className="text-lg font-semibold tracking-tight text-foreground">Các khoá học trong cấp độ</h2>
        <div className="mt-5 grid gap-5 md:grid-cols-2">
          {lv.courses.map((c) => (
            <Link
              key={c.id}
              to="/courses/$courseId"
              params={{ courseId: c.id }}
              className="group relative overflow-hidden rounded-3xl bg-surface p-6 ring-1 ring-border shadow-soft transition hover:shadow-elevated hover:-translate-y-0.5"
            >
              <div
                className="absolute -right-12 -top-12 h-40 w-40 rounded-full opacity-50 blur-2xl"
                style={{ background: `oklch(0.85 0.12 ${lv.hue})` }}
              />
              <div className="relative flex items-start justify-between">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-2.5 py-1 text-[11px] font-semibold text-primary">
                  {c.level}
                </span>
                <span className="text-xs text-muted-foreground">{c.hours}h • {c.units.length} units</span>
              </div>
              <h3 className="mt-4 text-xl font-semibold tracking-tight text-foreground">{c.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{c.subtitle}</p>

              <div className="mt-5">
                <div className="flex items-center justify-between text-xs font-medium text-muted-foreground">
                  <span>Tiến độ</span>
                  <span>{c.progress}%</span>
                </div>
                <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${c.progress}%`,
                      background: `linear-gradient(90deg, oklch(0.6 0.18 ${lv.hue}), oklch(0.72 0.16 ${(lv.hue + 30) % 360}))`,
                    }}
                  />
                </div>
              </div>

              <div className="mt-5 flex items-center justify-between">
                <div className="flex -space-x-2">
                  {c.classmates.slice(0, 4).map((m, i) => (
                    <div
                      key={i}
                      className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-primary/80 to-chart-5/80 text-[10px] font-semibold text-primary-foreground ring-2 ring-surface"
                    >
                      {m.name.split(" ").slice(-1)[0][0]}
                    </div>
                  ))}
                  <div className="flex h-7 items-center rounded-full bg-muted px-2 text-[10px] font-medium text-muted-foreground ring-2 ring-surface">
                    <Users className="mr-1 h-3 w-3" /> {c.classmates.length}
                  </div>
                </div>
                <span className="inline-flex items-center gap-1 text-sm font-medium text-primary">
                  Vào học <ArrowUpRight className="h-4 w-4 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

function Stat({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-surface/80 px-4 py-3 ring-1 ring-border backdrop-blur">
      <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
        {icon} {label}
      </div>
      <div className="mt-0.5 text-base font-semibold text-foreground">{value}</div>
    </div>
  );
}
