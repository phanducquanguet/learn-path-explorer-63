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
  const levelsScrollRef = useRef<HTMLDivElement>(null);
  const scrollLevels = (dir: 1 | -1) =>
    levelsScrollRef.current?.scrollBy({ left: dir * 380, behavior: "smooth" });
  const dragState = useRef({ down: false, startX: 0, startLeft: 0, moved: false });
  const onDragStart = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = levelsScrollRef.current;
    if (!el) return;
    dragState.current = { down: true, startX: e.pageX, startLeft: el.scrollLeft, moved: false };
    el.style.cursor = "grabbing";
  };
  const onDragMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = levelsScrollRef.current;
    if (!el || !dragState.current.down) return;
    const dx = e.pageX - dragState.current.startX;
    if (Math.abs(dx) > 4) dragState.current.moved = true;
    el.scrollLeft = dragState.current.startLeft - dx;
  };
  const onDragEnd = () => {
    const el = levelsScrollRef.current;
    if (!el) return;
    el.style.cursor = "";
    dragState.current.down = false;
  };
  const onDragClickCapture = (e: React.MouseEvent<HTMLDivElement>) => {
    if (dragState.current.moved) {
      e.preventDefault();
      e.stopPropagation();
      dragState.current.moved = false;
    }
  };

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
          <section className="mt-8 grid gap-6 lg:grid-cols-3">
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
              className="group lg:col-span-1 relative overflow-hidden rounded-[2rem] p-6 ring-1 ring-white/15 shadow-elevated transition hover:-translate-y-1 hover:shadow-glow animate-scale-in"
              style={{
                background:
                  "linear-gradient(135deg, oklch(0.45 0.2 270) 0%, oklch(0.55 0.22 290) 50%, oklch(0.6 0.18 320) 100%)",
              }}
            >
              <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
              <div className="absolute -bottom-16 -left-16 h-56 w-56 rounded-full bg-fuchsia-400/20 blur-3xl" />
              <div className="absolute right-4 top-4 opacity-15">
                <GraduationCap className="h-20 w-20 text-white" />
              </div>

              <div className="relative">
                <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-white backdrop-blur">
                  <Rocket className="h-3.5 w-3.5" /> Tiếp tục học
                </div>
                <div className="mt-5 text-xs font-medium text-white/70">Cấp độ {currentLevel.code}</div>
                <h2 className="mt-1 font-display text-xl font-bold tracking-tight text-white sm:text-2xl">
                  {currentCourse.title}
                </h2>
                <p className="mt-1.5 text-xs text-white/75 line-clamp-2">{currentCourse.subtitle}</p>

                <div className="mt-5">
                  <div className="flex items-center justify-between text-xs font-medium text-white/80">
                    <span>Tiến độ</span>
                    <span>{currentCourse.progress}%</span>
                  </div>
                  <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-white/15 backdrop-blur">
                    <div
                      className="h-full rounded-full bg-white shadow-[0_0_20px_rgba(255,255,255,0.5)]"
                      style={{ width: `${currentCourse.progress}%` }}
                    />
                  </div>
                </div>

                <div className="mt-5 flex items-center gap-2">
                  <span className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2 text-sm font-semibold text-foreground shadow-soft transition group-hover:gap-2.5">
                    <Play className="h-3.5 w-3.5 fill-current" /> Vào học
                  </span>
                </div>
              </div>
            </Link>
          </section>

          {/* LEVELS — moved UP, hero feature */}
          <section className="mt-12 animate-fade-in">
            <div className="flex items-end justify-between gap-4">
              <div>
                <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-primary">
                  <Sparkles className="h-3.5 w-3.5" /> Lộ trình học của bạn
                </div>
                <h2 className="mt-1 font-display text-3xl font-semibold tracking-tight text-foreground">
                  Chọn cấp độ để bắt đầu 🚀
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Từ A1 đến C2 — vuốt ngang để khám phá hành trình của bạn.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="hidden rounded-full bg-surface px-3 py-1.5 text-xs font-medium text-muted-foreground ring-1 ring-border sm:inline-flex">
                  {levels.filter((l) => l.status !== "locked").length}/{levels.length} cấp đã mở
                </span>
              </div>
            </div>

            <div className="relative mt-6 -mx-6 sm:-mx-8">
              {/* Side fade overlays — don't clip card shadows vertically */}
              <div className="pointer-events-none absolute left-0 top-0 bottom-4 w-12 z-10 bg-gradient-to-r from-background to-transparent" />
              <div className="pointer-events-none absolute right-0 top-0 bottom-4 w-12 z-10 bg-gradient-to-l from-background to-transparent" />

              {/* Overlay arrows */}
              <button
                type="button"
                aria-label="Cuộn trái"
                onClick={() => scrollLevels(-1)}
                className="hidden md:flex absolute left-3 top-1/2 -translate-y-1/2 z-20 h-11 w-11 items-center justify-center rounded-full bg-background ring-1 ring-border text-foreground shadow-elevated hover:shadow-glow hover:scale-105 transition"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                type="button"
                aria-label="Cuộn phải"
                onClick={() => scrollLevels(1)}
                className="hidden md:flex absolute right-3 top-1/2 -translate-y-1/2 z-20 h-11 w-11 items-center justify-center rounded-full bg-background ring-1 ring-border text-foreground shadow-elevated hover:shadow-glow hover:scale-105 transition"
              >
                <ChevronRight className="h-5 w-5" />
              </button>

              <div
                ref={levelsScrollRef}
                onMouseDown={onDragStart}
                onMouseMove={onDragMove}
                onMouseUp={onDragEnd}
                onMouseLeave={onDragEnd}
                onClickCapture={onDragClickCapture}
                className="flex gap-5 overflow-x-auto px-6 sm:px-8 pt-3 pb-6 snap-x snap-mandatory cursor-grab select-none [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
              >
                {levels.map((lv, i) => {
                  const prev = i > 0 ? levels[i - 1] : undefined;
                  return (
                    <LevelCard
                      key={lv.id}
                      lv={lv}
                      delay={i * 60}
                      prevLevelCode={prev?.code}
                    />
                  );
                })}
              </div>
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

function LevelCard({
  lv,
  delay,
  prevLevelCode,
}: {
  lv: (typeof levels)[number];
  delay: number;
  prevLevelCode?: string;
}) {
  const locked = lv.status === "locked";
  const completed = lv.status === "completed";
  const active = lv.status === "in-progress";

  // Sizing per state — active is biggest
  const sizing = active
    ? "w-[340px] md:w-[380px]"
    : "w-[300px] md:w-[320px]";

  // ---------- LOCKED ----------
  if (locked) {
    return (
      <div
        aria-disabled="true"
        className={cn(
          "snap-start shrink-0 animate-fade-in",
          sizing,
        )}
        style={{ animationDelay: `${delay}ms` }}
      >
        <div
          className="group relative h-full overflow-hidden rounded-3xl p-6 ring-1 ring-white/10 cursor-not-allowed transition-all duration-300 hover:shadow-elevated"
          style={{
            background:
              "linear-gradient(135deg, oklch(0.22 0.025 265) 0%, oklch(0.30 0.04 285) 100%)",
            minHeight: 320,
          }}
        >
          {/* diagonal stripes */}
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.07]"
            style={{
              backgroundImage:
                "repeating-linear-gradient(135deg, white 0 1px, transparent 1px 14px)",
            }}
          />
          {/* glow behind lock */}
          <div
            className="pointer-events-none absolute left-1/2 top-16 -translate-x-1/2 h-40 w-40 rounded-full blur-3xl opacity-60"
            style={{ background: `oklch(0.65 0.2 ${lv.hue})` }}
          />

          <div className="relative flex items-center justify-between">
            <span
              className="text-3xl font-black tracking-tight text-white/40"
              style={{ filter: "blur(2px)" }}
            >
              {lv.code}
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-2.5 py-1 text-[11px] font-semibold text-white/80 ring-1 ring-white/15 backdrop-blur">
              <Lock className="h-3 w-3" /> Đã khoá
            </span>
          </div>

          {/* big lock medallion */}
          <div className="relative mt-6 flex justify-center">
            <div className="relative">
              <div
                className="absolute inset-0 -m-3 rounded-full opacity-60 blur-2xl"
                style={{ background: `oklch(0.7 0.2 ${lv.hue})` }}
              />
              <div
                className="absolute inset-0 -m-2 rounded-full ring-2 ring-dashed ring-white/25 animate-spin"
                style={{ animationDuration: "12s" }}
              />
              <div
                className="relative flex h-20 w-20 items-center justify-center rounded-full text-white shadow-elevated"
                style={{
                  background: `linear-gradient(135deg, oklch(0.55 0.2 ${lv.hue}), oklch(0.72 0.16 ${(lv.hue + 30) % 360}))`,
                  boxShadow: `0 18px 40px -12px oklch(0.6 0.22 ${lv.hue} / 0.7)`,
                }}
              >
                <Lock className="h-8 w-8" strokeWidth={2.4} />
              </div>
              <Sparkle className="absolute -right-2 -top-1 h-4 w-4 text-white/80" />
            </div>
          </div>

          <div className="relative mt-5 text-center">
            <h3 className="text-lg font-bold tracking-tight text-white">{lv.name}</h3>
            <p className="mt-1 text-xs text-white/60 line-clamp-2">{lv.description}</p>
          </div>

          <div className="relative mt-5 border-t border-white/10 pt-4 text-center">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 text-[11px] font-semibold text-white/80 ring-1 ring-white/15">
              <Sparkles className="h-3 w-3" />
              {prevLevelCode
                ? `Mở khoá khi hoàn thành ${prevLevelCode}`
                : "Sắp mở"}
            </span>
          </div>
        </div>
      </div>
    );
  }

  // ---------- ACTIVE / COMPLETED ----------
  const cardInner = (
    <div
      className={cn(
        "group relative h-full overflow-hidden rounded-3xl p-6 transition-all duration-300 cursor-pointer",
        active
          ? "ring-2 shadow-glow hover:-translate-y-2"
          : "ring-1 ring-border shadow-soft hover:shadow-elevated hover:-translate-y-1 opacity-95",
      )}
      style={{
        minHeight: 320,
        ...(active
          ? {
              background: `linear-gradient(135deg, oklch(0.99 0.005 260) 0%, oklch(0.95 0.07 ${lv.hue}) 100%)`,
              // ring color via boxShadow trick
              boxShadow: `0 0 0 2px oklch(0.65 0.2 ${lv.hue} / 0.5), 0 20px 50px -20px oklch(0.6 0.22 ${lv.hue} / 0.45)`,
            }
          : {
              background: `linear-gradient(135deg, oklch(0.99 0.003 260) 0%, oklch(0.97 0.025 ${lv.hue}) 100%)`,
            }),
      }}
    >
      {/* Decorative orbs */}
      <div
        className={cn(
          "pointer-events-none absolute -right-20 -top-20 h-52 w-52 rounded-full blur-3xl transition-all duration-500 group-hover:scale-110",
          active ? "opacity-70 group-hover:opacity-90" : "opacity-30",
        )}
        style={{ background: `oklch(0.78 0.18 ${lv.hue})` }}
      />
      <div
        className={cn(
          "pointer-events-none absolute -left-16 -bottom-16 h-44 w-44 rounded-full blur-3xl",
          active ? "opacity-40" : "opacity-20",
        )}
        style={{ background: `oklch(0.8 0.15 ${(lv.hue + 60) % 360})` }}
      />

      {/* Big level badge */}
      <div className="relative flex items-start justify-between">
        <div
          className={cn(
            "relative flex items-center justify-center rounded-3xl font-black tracking-tight text-white transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3",
            active ? "h-24 w-24 text-3xl" : "h-20 w-20 text-2xl",
          )}
          style={{
            background: completed
              ? `linear-gradient(135deg, oklch(0.7 0.05 ${lv.hue}), oklch(0.78 0.04 ${(lv.hue + 30) % 360}))`
              : `linear-gradient(135deg, oklch(0.5 0.2 ${lv.hue}), oklch(0.65 0.18 ${(lv.hue + 30) % 360}))`,
            boxShadow: active
              ? `0 16px 40px -10px oklch(0.55 0.22 ${lv.hue} / 0.7), inset 0 0 0 2px oklch(1 0 0 / 0.3)`
              : `0 12px 30px -10px oklch(0.55 0.2 ${lv.hue} / 0.4)`,
          }}
        >
          {lv.code}
          {completed && (
            <div className="absolute -right-2 -top-2 flex h-9 w-9 items-center justify-center rounded-full bg-success ring-4 ring-background shadow-soft">
              <CheckCircle2 className="h-5 w-5 text-white" />
            </div>
          )}
        </div>
        <StatusPill status={lv.status} />
      </div>

      <div className="relative mt-5">
        <h3 className={cn("font-bold tracking-tight text-foreground", active ? "text-2xl" : "text-xl")}>
          {lv.name}
        </h3>
        <p className="mt-1 text-sm text-muted-foreground line-clamp-2">{lv.description}</p>
      </div>

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
              background: completed
                ? "var(--success)"
                : `linear-gradient(90deg, oklch(0.6 0.2 ${lv.hue}), oklch(0.72 0.16 ${(lv.hue + 30) % 360}))`,
              boxShadow: active
                ? `0 0 14px oklch(0.65 0.2 ${lv.hue} / 0.6)`
                : undefined,
            }}
          />
        </div>
      </div>

      <div className="relative mt-5 flex items-center justify-between border-t border-border/60 pt-4">
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <BookOpen className="h-3.5 w-3.5" />
          <span className="font-medium">{lv.courses.length} khoá học</span>
        </div>
        {active ? (
          <span
            className="inline-flex items-center gap-1.5 rounded-xl px-4 py-2 text-sm font-semibold text-white shadow-elevated transition-all group-hover:gap-2.5"
            style={{
              background: `linear-gradient(135deg, oklch(0.55 0.2 ${lv.hue}), oklch(0.68 0.18 ${(lv.hue + 30) % 360}))`,
            }}
          >
            Học tiếp
            <ArrowUpRight className="h-4 w-4 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5 rounded-xl bg-surface px-3 py-1.5 text-sm font-semibold text-foreground/80 ring-1 ring-border transition-all group-hover:gap-2.5 group-hover:text-foreground">
            Xem lại
            <ArrowUpRight className="h-4 w-4 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </span>
        )}
      </div>
    </div>
  );

  return (
    <Link
      to="/levels/$level"
      params={{ level: lv.code.toLowerCase() }}
      className={cn("snap-start shrink-0 animate-fade-in block", sizing)}
      style={{ animationDelay: `${delay}ms` }}
    >
      {cardInner}
    </Link>
  );
}

function StatusPill({ status }: { status: "completed" | "in-progress" | "locked" }) {
  const map = {
    completed: { text: "Hoàn thành", cls: "bg-success/20 text-success-foreground", icon: <CheckCircle2 className="h-3.5 w-3.5" /> },
    "in-progress": { text: "Đang học", cls: "bg-primary text-primary-foreground shadow-soft", icon: <span className="relative flex h-2 w-2"><span className="absolute inset-0 rounded-full bg-white/80 animate-ping" /><span className="relative inline-flex h-2 w-2 rounded-full bg-white" /></span> },
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
