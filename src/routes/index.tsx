import { useRef } from "react";
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
  Rocket,
  GraduationCap,
  Zap,
  ChevronLeft,
  ChevronRight,
  Sparkle,
} from "lucide-react";
import { levels, studentStats, getLevel } from "@/lib/lms-data";
import { cn } from "@/lib/utils";
import { TopNav } from "@/components/TopNav";

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
  const currentLevel = getLevel("b2")!;
  const currentCourse = currentLevel.courses[0];

  return (
    <div className="min-h-screen bg-background">
      <TopNav />
      {/* Hero background */}
      <div className="relative">
        <div
          className="absolute inset-x-0 top-0 h-[640px] -z-10"
          style={{ background: "var(--gradient-hero)" }}
        />
        <div
          className="absolute inset-x-0 top-0 h-[640px] -z-10 opacity-40"
          style={{
            backgroundImage:
              "radial-gradient(circle at 1px 1px, oklch(0.7 0.05 260 / 0.25) 1px, transparent 0)",
            backgroundSize: "24px 24px",
            maskImage: "linear-gradient(to bottom, black, transparent)",
          }}
        />

        <div className="mx-auto max-w-7xl px-6 pt-8 pb-12 sm:px-8">
          {/* Hero: greeting + continue learning */}
          <section className="mt-8 grid gap-6 lg:grid-cols-5">
            <div className="lg:col-span-2 flex flex-col justify-center animate-fade-in">
              <span className="inline-flex w-fit items-center gap-2 rounded-full bg-surface/80 px-3 py-1 text-xs font-medium text-muted-foreground backdrop-blur ring-1 ring-border">
                <Sparkles className="h-3.5 w-3.5 text-primary" /> Chào mừng trở lại
              </span>
              <h1 className="mt-3 font-display text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
                Xin chào, <br />
                <span
                  className="bg-clip-text text-transparent"
                  style={{ backgroundImage: "var(--gradient-brand)" }}
                >
                  {s.name} 👋
                </span>
              </h1>
              <p className="mt-3 max-w-md text-sm text-muted-foreground sm:text-base">
                Hôm nay là một ngày tuyệt vời để học. Bạn đang trên chuỗi{" "}
                <b className="text-foreground">{s.weeklyStreak} ngày</b> liên tục — hãy giữ vững nhé!
              </p>
              <div className="mt-5 flex flex-wrap gap-2">
                <Pill icon={<Flame className="h-3.5 w-3.5 text-orange-500" />}>{s.weeklyStreak} ngày streak</Pill>
                <Pill icon={<Trophy className="h-3.5 w-3.5 text-amber-500" />}>Top 12% lớp</Pill>
                <Pill icon={<Zap className="h-3.5 w-3.5 text-primary" />}>{s.activeCourses} khoá đang học</Pill>
              </div>
            </div>

            {/* Continue learning hero card */}
            <Link
              to="/courses/$courseId"
              params={{ courseId: currentCourse.id }}
              className="group lg:col-span-3 relative overflow-hidden rounded-[2rem] p-8 ring-1 ring-white/15 shadow-elevated transition hover:-translate-y-1 hover:shadow-glow animate-scale-in"
              style={{
                background:
                  "linear-gradient(135deg, oklch(0.45 0.2 270) 0%, oklch(0.55 0.22 290) 50%, oklch(0.6 0.18 320) 100%)",
              }}
            >
              <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
              <div className="absolute -bottom-16 -left-16 h-56 w-56 rounded-full bg-fuchsia-400/20 blur-3xl" />
              <div className="absolute right-8 top-8 opacity-20">
                <GraduationCap className="h-32 w-32 text-white" />
              </div>

              <div className="relative">
                <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-white backdrop-blur">
                  <Rocket className="h-3.5 w-3.5" /> Tiếp tục học
                </div>
                <div className="mt-6 text-sm font-medium text-white/70">Cấp độ {currentLevel.code}</div>
                <h2 className="mt-1 font-display text-3xl font-bold tracking-tight text-white sm:text-4xl">
                  {currentCourse.title}
                </h2>
                <p className="mt-2 max-w-md text-sm text-white/75">{currentCourse.subtitle}</p>

                <div className="mt-6 max-w-md">
                  <div className="flex items-center justify-between text-xs font-medium text-white/80">
                    <span>Tiến độ khoá học</span>
                    <span>{currentCourse.progress}%</span>
                  </div>
                  <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-white/15 backdrop-blur">
                    <div
                      className="h-full rounded-full bg-white shadow-[0_0_20px_rgba(255,255,255,0.5)]"
                      style={{ width: `${currentCourse.progress}%` }}
                    />
                  </div>
                </div>

                <div className="mt-6 flex items-center gap-3">
                  <span
                    className="inline-flex items-center gap-2 rounded-2xl bg-white px-5 py-2.5 text-sm font-semibold text-foreground shadow-soft transition group-hover:gap-3"
                  >
                    <Play className="h-4 w-4 fill-current" /> Vào học ngay
                  </span>
                  <span className="text-xs text-white/70">
                    Unit kế tiếp: <b className="text-white">Travel Stories</b>
                  </span>
                </div>
              </div>
            </Link>
          </section>

          {/* LEVELS — moved UP, hero feature */}
          <section className="mt-12 animate-fade-in">
            <div className="flex items-end justify-between">
              <div>
                <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-primary">
                  <Sparkles className="h-3.5 w-3.5" /> Lộ trình học của bạn
                </div>
                <h2 className="mt-1 font-display text-3xl font-semibold tracking-tight text-foreground">
                  Chọn cấp độ để bắt đầu 🚀
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Từ A1 đến C2 — chinh phục hành trình tiếng Anh của riêng bạn.
                </p>
              </div>
              <span className="hidden rounded-full bg-surface px-3 py-1.5 text-xs font-medium text-muted-foreground ring-1 ring-border sm:inline-flex">
                {levels.filter((l) => l.status !== "locked").length}/{levels.length} cấp đã mở
              </span>
            </div>

            <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {levels.map((lv, i) => (
                <LevelCard key={lv.id} lv={lv} delay={i * 60} />
              ))}
            </div>
          </section>
        </div>
      </div>

      {/* Stats + portal — secondary section */}
      <div className="mx-auto max-w-7xl px-6 pb-20 sm:px-8">
        <section className="mt-4">
          <h2 className="font-display text-xl font-semibold tracking-tight text-foreground">
            Tiến độ tuần này
          </h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              icon={<Clock className="h-5 w-5" />}
              label="Thời gian học"
              value={`${Math.floor(s.studyMinutesThisWeek / 60)}h ${s.studyMinutesThisWeek % 60}m`}
              hint={`Mục tiêu ${Math.floor(s.studyMinutesGoal / 60)}h • ${goalPct}%`}
              progress={goalPct}
              tone="primary"
            />
            <StatCard
              icon={<Target className="h-5 w-5" />}
              label="Tỷ lệ hoàn thành"
              value={`${s.completionRate}%`}
              hint={`${s.completedCourses} khoá xong • ${s.activeCourses} đang học`}
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
              label="Chuỗi ngày"
              value={`${s.weeklyStreak} ngày`}
              hint="Hãy giữ ngọn lửa!"
              tone="warning"
            />
          </div>
        </section>

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
            className="group relative overflow-hidden rounded-3xl p-6 text-primary-foreground ring-1 ring-border shadow-elevated transition hover:-translate-y-1"
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

function Pill({ icon, children }: { icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-surface/80 px-3 py-1.5 text-xs font-medium text-foreground ring-1 ring-border backdrop-blur">
      {icon}
      {children}
    </span>
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

function LevelCard({ lv, delay }: { lv: (typeof levels)[number]; delay: number }) {
  const locked = lv.status === "locked";
  const completed = lv.status === "completed";

  const card = (
    <div
      className={cn(
        "group relative h-full overflow-hidden rounded-3xl p-6 transition-all duration-300",
        locked
          ? "bg-surface-2/60 ring-1 ring-border"
          : "ring-1 ring-border shadow-soft hover:shadow-glow hover:-translate-y-2 cursor-pointer",
      )}
      style={{
        animationDelay: `${delay}ms`,
        background: locked
          ? undefined
          : `linear-gradient(135deg, oklch(0.99 0.005 260) 0%, oklch(0.96 0.05 ${lv.hue}) 100%)`,
      }}
    >
      {/* Decorative orbs */}
      {!locked && (
        <>
          <div
            className="pointer-events-none absolute -right-20 -top-20 h-52 w-52 rounded-full opacity-50 blur-3xl transition-all duration-500 group-hover:opacity-80 group-hover:scale-110"
            style={{ background: `oklch(0.78 0.18 ${lv.hue})` }}
          />
          <div
            className="pointer-events-none absolute -left-16 -bottom-16 h-44 w-44 rounded-full opacity-30 blur-3xl"
            style={{ background: `oklch(0.8 0.15 ${(lv.hue + 60) % 360})` }}
          />
        </>
      )}

      {/* Big level badge */}
      <div className="relative flex items-start justify-between">
        <div
          className={cn(
            "relative flex h-20 w-20 items-center justify-center rounded-3xl text-2xl font-black tracking-tight text-white transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3",
            locked && "opacity-60",
          )}
          style={{
            background: locked
              ? "linear-gradient(135deg, oklch(0.7 0.01 260), oklch(0.75 0.01 260))"
              : `linear-gradient(135deg, oklch(0.5 0.2 ${lv.hue}), oklch(0.65 0.18 ${(lv.hue + 30) % 360}))`,
            boxShadow: locked ? undefined : `0 12px 30px -10px oklch(0.55 0.2 ${lv.hue} / 0.6)`,
          }}
        >
          {lv.code}
          {completed && (
            <div className="absolute -right-1.5 -top-1.5 flex h-7 w-7 items-center justify-center rounded-full bg-success ring-4 ring-background">
              <CheckCircle2 className="h-4 w-4 text-white" />
            </div>
          )}
          {locked && (
            <div className="absolute inset-0 flex items-center justify-center rounded-3xl bg-foreground/30 backdrop-blur-sm">
              <Lock className="h-7 w-7 text-white" />
            </div>
          )}
        </div>
        <StatusPill status={lv.status} />
      </div>

      <div className="relative mt-5">
        <h3 className="text-xl font-bold tracking-tight text-foreground">{lv.name}</h3>
        <p className="mt-1 text-sm text-muted-foreground line-clamp-2">{lv.description}</p>
      </div>

      {!locked ? (
        <>
          <div className="relative mt-5">
            <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground">
              <span>Tiến độ</span>
              <span className="text-foreground">{lv.progress}%</span>
            </div>
            <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{
                  width: `${lv.progress}%`,
                  background: `linear-gradient(90deg, oklch(0.6 0.2 ${lv.hue}), oklch(0.72 0.16 ${(lv.hue + 30) % 360}))`,
                  boxShadow: `0 0 12px oklch(0.65 0.2 ${lv.hue} / 0.5)`,
                }}
              />
            </div>
          </div>

          <div className="relative mt-5 flex items-center justify-between border-t border-border/60 pt-4">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <BookOpen className="h-3.5 w-3.5" />
              <span className="font-medium">{lv.courses.length} khoá học</span>
            </div>
            <span
              className="inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-sm font-semibold text-white shadow-soft transition-all group-hover:gap-2.5 group-hover:shadow-elevated"
              style={{
                background: `linear-gradient(135deg, oklch(0.55 0.2 ${lv.hue}), oklch(0.68 0.18 ${(lv.hue + 30) % 360}))`,
              }}
            >
              {completed ? "Xem lại" : "Học ngay"}
              <ArrowUpRight className="h-4 w-4 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </span>
          </div>
        </>
      ) : (
        <div className="relative mt-5 border-t border-border/60 pt-4">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Lock className="h-3.5 w-3.5" />
            <span>Hoàn thành cấp độ trước để mở khoá</span>
          </div>
        </div>
      )}
    </div>
  );

  if (locked) return <div className="animate-fade-in" style={{ animationDelay: `${delay}ms` }}>{card}</div>;
  return (
    <Link
      to="/levels/$level"
      params={{ level: lv.code.toLowerCase() }}
      className="animate-fade-in block"
      style={{ animationDelay: `${delay}ms` }}
    >
      {card}
    </Link>
  );
}

function StatusPill({ status }: { status: "completed" | "in-progress" | "locked" }) {
  const map = {
    completed: { text: "Hoàn thành", cls: "bg-success/20 text-success-foreground", icon: <CheckCircle2 className="h-3.5 w-3.5" /> },
    "in-progress": { text: "Đang học", cls: "bg-primary/15 text-primary", icon: <Play className="h-3 w-3 fill-current" /> },
    locked: { text: "Đã khoá", cls: "bg-muted text-muted-foreground", icon: <Lock className="h-3.5 w-3.5" /> },
  } as const;
  const m = map[status];
  return (
    <span className={cn("inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold backdrop-blur", m.cls)}>
      {m.icon}
      {m.text}
    </span>
  );
}
