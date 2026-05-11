import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Clock,
  Flame,
  Target,
  Trophy,
  ArrowUpRight,
  Lock,
  Play,
  CheckCircle2,
  ExternalLink,
  Sparkles,
  BookOpen,
} from "lucide-react";
import { levels, studentStats } from "@/lib/lms-data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Tổng quan học tập — UNICOM LMS" },
      { name: "description", content: "Bảng điều khiển học tập dành cho học viên." },
    ],
  }),
  component: DashboardPage,
});

function DashboardPage() {
  const s = studentStats;
  const goalPct = Math.round((s.studyMinutesThisWeek / s.studyMinutesGoal) * 100);

  return (
    <div className="min-h-screen bg-background">
      <div className="relative">
        <div
          className="absolute inset-x-0 top-0 h-[420px] -z-10 opacity-90"
          style={{ background: "var(--gradient-hero)" }}
        />
        <div className="mx-auto max-w-7xl px-6 pt-10 pb-16 sm:px-8">
          <Header />

          {/* Hero greeting */}
          <section className="mt-8 flex flex-col gap-2">
            <span className="inline-flex w-fit items-center gap-2 rounded-full bg-surface/80 px-3 py-1 text-xs font-medium text-muted-foreground backdrop-blur ring-1 ring-border">
              <Sparkles className="h-3.5 w-3.5 text-primary" /> Chào mừng trở lại
            </span>
            <h1 className="font-display text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
              Xin chào, {s.name} 👋
            </h1>
            <p className="max-w-2xl text-sm text-muted-foreground sm:text-base">
              Bạn đã học liên tục <b className="text-foreground">{s.weeklyStreak} ngày</b>. Hãy duy trì phong độ và hoàn thành mục tiêu tuần nhé!
            </p>
          </section>

          {/* Stats grid */}
          <section className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              icon={<Clock className="h-5 w-5" />}
              label="Thời gian học tuần này"
              value={`${Math.floor(s.studyMinutesThisWeek / 60)}h ${s.studyMinutesThisWeek % 60}m`}
              hint={`Mục tiêu ${Math.floor(s.studyMinutesGoal / 60)}h • ${goalPct}%`}
              progress={goalPct}
              tone="primary"
            />
            <StatCard
              icon={<Target className="h-5 w-5" />}
              label="Tỷ lệ hoàn thành"
              value={`${s.completionRate}%`}
              hint={`${s.completedCourses} khoá hoàn thành • ${s.activeCourses} đang học`}
              progress={s.completionRate}
              tone="info"
            />
            <StatCard
              icon={<Trophy className="h-5 w-5" />}
              label="Điểm trung bình"
              value={`${s.averageScore}/100`}
              hint="Top 12% trong lớp"
              progress={s.averageScore}
              tone="success"
            />
            <StatCard
              icon={<Flame className="h-5 w-5" />}
              label="Chuỗi ngày học"
              value={`${s.weeklyStreak} ngày`}
              hint="Hãy giữ ngọn lửa!"
              tone="warning"
            />
          </section>

          {/* Weekly chart + Test portal */}
          <section className="mt-6 grid gap-4 lg:grid-cols-3">
            <div className="lg:col-span-2 rounded-3xl bg-surface p-6 ring-1 ring-border shadow-soft">
              <div className="flex items-end justify-between">
                <div>
                  <h3 className="text-base font-semibold text-foreground">Hoạt động học tuần này</h3>
                  <p className="text-xs text-muted-foreground">Phút học mỗi ngày</p>
                </div>
                <span className="text-xs text-muted-foreground">7 ngày qua</span>
              </div>
              <div className="mt-6 flex h-44 items-end gap-3">
                {s.weeklyChart.map((d) => {
                  const max = Math.max(...s.weeklyChart.map((x) => x.minutes));
                  const h = (d.minutes / max) * 100;
                  return (
                    <div key={d.day} className="flex flex-1 flex-col items-center gap-2">
                      <div className="relative flex h-full w-full items-end">
                        <div
                          className="w-full rounded-xl transition-all hover:opacity-80"
                          style={{
                            height: `${h}%`,
                            background: "var(--gradient-brand)",
                            boxShadow: "var(--shadow-glow)",
                          }}
                          title={`${d.minutes} phút`}
                        />
                      </div>
                      <span className="text-xs font-medium text-muted-foreground">{d.day}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            <a
              href="https://test-portal.example.com"
              target="_blank"
              rel="noreferrer"
              className="group relative overflow-hidden rounded-3xl p-6 text-primary-foreground ring-1 ring-border shadow-elevated"
              style={{ background: "var(--gradient-brand)" }}
            >
              <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10 blur-2xl" />
              <div className="relative">
                <div className="inline-flex rounded-2xl bg-white/15 p-2.5 backdrop-blur">
                  <ExternalLink className="h-5 w-5" />
                </div>
                <h3 className="mt-5 text-lg font-semibold">Test Portal</h3>
                <p className="mt-1 text-sm text-white/80">
                  Truy cập hệ thống thi & đánh giá năng lực bên ngoài.
                </p>
                <div className="mt-6 inline-flex items-center gap-2 text-sm font-medium">
                  Mở Test Portal
                  <ArrowUpRight className="h-4 w-4 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </div>
              </div>
            </a>
          </section>

          {/* Levels */}
          <section className="mt-12">
            <div className="flex items-end justify-between">
              <div>
                <h2 className="font-display text-2xl font-semibold tracking-tight text-foreground">
                  Lộ trình của bạn
                </h2>
                <p className="text-sm text-muted-foreground">
                  Từ A1 đến C2 — chinh phục từng cấp độ một.
                </p>
              </div>
              <span className="hidden text-xs text-muted-foreground sm:block">
                {levels.filter((l) => l.status !== "locked").length}/{levels.length} cấp đã mở
              </span>
            </div>

            <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {levels.map((lv) => (
                <LevelCard key={lv.id} lv={lv} />
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

function Header() {
  return (
    <header className="flex items-center justify-between">
      <Link to="/" className="flex items-center gap-2">
        <div
          className="flex h-9 w-9 items-center justify-center rounded-xl text-primary-foreground shadow-soft"
          style={{ background: "var(--gradient-brand)" }}
        >
          <BookOpen className="h-5 w-5" />
        </div>
        <div className="leading-tight">
          <div className="text-sm font-semibold text-foreground">UNICOM LMS</div>
          <div className="text-[11px] text-muted-foreground">Học viên</div>
        </div>
      </Link>
      <div className="flex items-center gap-2">
        <span className="hidden rounded-full bg-surface px-3 py-1.5 text-xs font-medium text-muted-foreground ring-1 ring-border sm:inline-flex">
          🔥 12 ngày liên tục
        </span>
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-primary to-chart-5 text-sm font-semibold text-primary-foreground">
          BC
        </div>
      </div>
    </header>
  );
}

function StatCard({
  icon,
  label,
  value,
  hint,
  progress,
  tone,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  hint?: string;
  progress?: number;
  tone: "primary" | "info" | "success" | "warning";
}) {
  const toneMap = {
    primary: "bg-primary/10 text-primary",
    info: "bg-info/15 text-info-foreground",
    success: "bg-success/15 text-success-foreground",
    warning: "bg-warning/15 text-warning-foreground",
  };
  const barTone = {
    primary: "bg-primary",
    info: "bg-info",
    success: "bg-success",
    warning: "bg-warning",
  };
  return (
    <div className="group rounded-3xl bg-surface p-5 ring-1 ring-border shadow-soft transition hover:shadow-elevated hover:-translate-y-0.5">
      <div className="flex items-center justify-between">
        <div className={cn("flex h-10 w-10 items-center justify-center rounded-2xl", toneMap[tone])}>
          {icon}
        </div>
        <ArrowUpRight className="h-4 w-4 text-muted-foreground/60 transition group-hover:text-foreground" />
      </div>
      <div className="mt-4 text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</div>
      <div className="mt-1 text-2xl font-semibold tracking-tight text-foreground">{value}</div>
      {hint && <div className="mt-1 text-xs text-muted-foreground">{hint}</div>}
      {typeof progress === "number" && (
        <div className="mt-4 h-1.5 w-full overflow-hidden rounded-full bg-muted">
          <div
            className={cn("h-full rounded-full transition-all", barTone[tone])}
            style={{ width: `${Math.min(100, progress)}%` }}
          />
        </div>
      )}
    </div>
  );
}

function LevelCard({ lv }: { lv: (typeof levels)[number] }) {
  const locked = lv.status === "locked";
  const completed = lv.status === "completed";

  const card = (
    <div
      className={cn(
        "group relative overflow-hidden rounded-3xl p-6 ring-1 transition",
        locked
          ? "bg-surface-2 ring-border"
          : "bg-surface ring-border shadow-soft hover:shadow-elevated hover:-translate-y-1",
      )}
    >
      <div
        className="pointer-events-none absolute -right-16 -top-16 h-44 w-44 rounded-full opacity-60 blur-2xl"
        style={{
          background: locked
            ? "oklch(0.9 0.02 260)"
            : `oklch(0.85 0.12 ${lv.hue})`,
        }}
      />
      <div className="relative flex items-start justify-between">
        <div
          className="flex h-14 w-14 items-center justify-center rounded-2xl text-lg font-bold tracking-tight text-white"
          style={{
            background: locked
              ? "oklch(0.75 0.01 260)"
              : `linear-gradient(135deg, oklch(0.55 0.18 ${lv.hue}), oklch(0.7 0.16 ${(lv.hue + 30) % 360}))`,
          }}
        >
          {lv.code}
        </div>
        <StatusPill status={lv.status} />
      </div>

      <div className="relative mt-5">
        <h3 className="text-lg font-semibold tracking-tight text-foreground">{lv.name}</h3>
        <p className="mt-1 text-sm text-muted-foreground">{lv.description}</p>
      </div>

      {!locked && (
        <div className="relative mt-5">
          <div className="flex items-center justify-between text-xs font-medium text-muted-foreground">
            <span>Tiến độ</span>
            <span>{lv.progress}%</span>
          </div>
          <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full transition-all"
              style={{
                width: `${lv.progress}%`,
                background: `linear-gradient(90deg, oklch(0.6 0.18 ${lv.hue}), oklch(0.72 0.16 ${(lv.hue + 30) % 360}))`,
              }}
            />
          </div>
          <div className="mt-2 text-xs text-muted-foreground">
            {lv.courses.length} khoá học
          </div>
        </div>
      )}

      <div className="relative mt-5 flex items-center justify-between">
        {locked ? (
          <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
            <Lock className="h-3.5 w-3.5" /> Chưa mở khoá
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5 text-sm font-medium text-primary">
            {completed ? "Xem lại khoá học" : "Tiếp tục học"}
            <ArrowUpRight className="h-4 w-4 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </span>
        )}
      </div>
    </div>
  );

  if (locked) return card;
  return (
    <Link to="/levels/$level" params={{ level: lv.code.toLowerCase() }}>
      {card}
    </Link>
  );
}

function StatusPill({ status }: { status: "completed" | "in-progress" | "locked" }) {
  const map = {
    completed: { text: "Hoàn thành", cls: "bg-success/15 text-success-foreground", icon: <CheckCircle2 className="h-3.5 w-3.5" /> },
    "in-progress": { text: "Đang học", cls: "bg-primary/10 text-primary", icon: <Play className="h-3.5 w-3.5" /> },
    locked: { text: "Đã khoá", cls: "bg-muted text-muted-foreground", icon: <Lock className="h-3.5 w-3.5" /> },
  } as const;
  const m = map[status];
  return (
    <span className={cn("inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-medium", m.cls)}>
      {m.icon}
      {m.text}
    </span>
  );
}
