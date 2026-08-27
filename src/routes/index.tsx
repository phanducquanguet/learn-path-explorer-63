import { useRef, useState } from "react";
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
  ClipboardCheck,
  Headphones,
  Mic,
  PenLine,
  Sparkles,
  BookOpen,
  Rocket,
  GraduationCap,
  Zap,
} from "lucide-react";
import { levels, studentStats, getLevel, newcomerLevels, newcomerStats, enrolledB2Levels, enrolledB2Stats } from "@/lib/lms-data";
import { cn } from "@/lib/utils";
import { TopNav } from "@/components/TopNav";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Trang chủ học viên — UNICOM LMS" },
      { name: "description", content: "Trang chủ học tập thân thiện dành cho học viên: tiếp tục học, lộ trình và thành tích." },
    ],
  }),
  component: DashboardPage,
});

/** Tông màu pastel rực rỡ cho từng loại thẻ — dùng inline oklch để giữ consistency với theme. */
const pastel = (hue: number, l = 0.95, c = 0.07) => `oklch(${l} ${c} ${hue})`;

function DashboardPage() {
  const [scenario, setScenario] = useState<"multi" | "newcomer" | "enrolledB2">("multi");
  const isNewcomer = scenario === "newcomer";
  const isEnrolledB2 = scenario === "enrolledB2";
  const activeLevels = isNewcomer
    ? newcomerLevels
    : isEnrolledB2
      ? enrolledB2Levels
      : levels;
  const s = isNewcomer ? newcomerStats : isEnrolledB2 ? enrolledB2Stats : studentStats;
  const goalPct = Math.round((s.studyMinutesThisWeek / s.studyMinutesGoal) * 100);
  const currentLevel = isNewcomer
    ? newcomerLevels.find((l) => l.status === "in-progress")!
    : isEnrolledB2
      ? enrolledB2Levels.find((l) => l.status === "in-progress")!
      : getLevel("b2")!;
  const currentCourse = currentLevel.courses[0];

  return (
    <div className="min-h-screen bg-background">
      <TopNav />

      <div className="mx-auto max-w-6xl px-4 pb-16 pt-6 sm:px-8">
        {/* Scenario switcher — demo personas (nhỏ gọn, không làm nhiễu) */}
        <div className="mb-5 inline-flex flex-wrap items-center gap-1 rounded-full bg-surface p-1 ring-1 ring-border">
          {([
            { key: "multi", label: "Học viên đa cấp" },
            { key: "newcomer", label: "Vào lớp A1" },
            { key: "enrolledB2", label: "Vào lớp B2" },
          ] as const).map((opt) => (
            <button
              key={opt.key}
              type="button"
              onClick={() => setScenario(opt.key)}
              className={cn(
                "rounded-full px-3 py-1 text-xs font-semibold transition",
                scenario === opt.key
                  ? "bg-foreground text-background shadow-soft"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {/* ===== HERO: lời chào + tiếp tục học — đầy màu sắc, 1 hành động chính ===== */}
        <section
          className="relative overflow-hidden rounded-[2rem] p-6 text-white shadow-elevated sm:p-10"
          style={{
            background:
              "linear-gradient(120deg, oklch(0.52 0.22 265) 0%, oklch(0.55 0.2 290) 45%, oklch(0.6 0.17 320) 100%)",
          }}
        >
          {/* decorative orbs */}
          <div className="pointer-events-none absolute -right-20 -top-24 h-72 w-72 rounded-full bg-white/15 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-24 -left-16 h-64 w-64 rounded-full bg-amber-300/25 blur-3xl" />
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.12]"
            style={{
              backgroundImage: "radial-gradient(circle at 1px 1px, white 1px, transparent 0)",
              backgroundSize: "22px 22px",
            }}
          />

          <div className="relative grid gap-8 lg:grid-cols-5 lg:items-center">
            <div className="lg:col-span-3">
              <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold ring-1 ring-white/25 backdrop-blur">
                <Sparkles className="h-3.5 w-3.5" /> Chào mừng trở lại
              </span>
              <h1 className="mt-4 font-display text-4xl font-bold tracking-tight sm:text-5xl">
                Xin chào, {s.name} 👋
              </h1>
              <p className="mt-3 max-w-md text-sm leading-relaxed text-white/85 sm:text-base">
                Hôm nay là một ngày tuyệt vời để học. Bạn đang giữ chuỗi{" "}
                <b className="text-white">{s.weeklyStreak} ngày</b> liên tiếp — cố thêm chút nữa nhé!
              </p>
              <div className="mt-5 flex flex-wrap gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1.5 text-xs font-semibold ring-1 ring-white/25 backdrop-blur">
                  <Flame className="h-3.5 w-3.5 text-amber-300" /> {s.weeklyStreak} ngày streak
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1.5 text-xs font-semibold ring-1 ring-white/25 backdrop-blur">
                  <Zap className="h-3.5 w-3.5 text-sky-200" /> {s.activeCourses} khoá đang học
                </span>
                {!isNewcomer && !isEnrolledB2 && (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1.5 text-xs font-semibold ring-1 ring-white/25 backdrop-blur">
                    <Trophy className="h-3.5 w-3.5 text-amber-300" /> Top 12% lớp
                  </span>
                )}
              </div>
            </div>

            {/* Continue learning — thẻ kính nổi bật trong hero */}
            <Link
              to="/courses/$courseId"
              params={{ courseId: currentCourse.id }}
              className="group lg:col-span-2 relative overflow-hidden rounded-3xl bg-white/95 p-6 text-foreground shadow-elevated backdrop-blur transition hover:-translate-y-1 hover:shadow-2xl"
            >
              <div
                className="pointer-events-none absolute -right-16 -top-16 h-44 w-44 rounded-full opacity-30 blur-3xl transition group-hover:opacity-50"
                style={{ background: `oklch(0.7 0.2 ${currentLevel.hue})` }}
              />
              <div className="relative">
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-primary">
                    <Rocket className="h-3.5 w-3.5" /> Tiếp tục học
                  </span>
                  <GraduationCap className="h-5 w-5 text-muted-foreground/50" />
                </div>
                <div className="mt-4 text-xs font-semibold text-muted-foreground">
                  Cấp độ {currentLevel.code} · {currentLevel.name}
                </div>
                <h2 className="mt-1 font-display text-2xl font-bold tracking-tight">
                  {currentCourse.title}
                </h2>
                <p className="mt-1 text-sm text-muted-foreground line-clamp-1">{currentCourse.subtitle}</p>

                <div className="mt-5">
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span className="text-muted-foreground">Tiến độ khoá học</span>
                    <span>{currentCourse.progress}%</span>
                  </div>
                  <div className="mt-2 h-2.5 w-full overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{
                        width: `${currentCourse.progress}%`,
                        background: `linear-gradient(90deg, oklch(0.55 0.2 ${currentLevel.hue}), oklch(0.7 0.17 ${(currentLevel.hue + 40) % 360}))`,
                      }}
                    />
                  </div>
                </div>

                <span
                  className="mt-5 inline-flex items-center gap-2 rounded-2xl px-5 py-2.5 text-sm font-bold text-white shadow-elevated transition group-hover:gap-3"
                  style={{ background: "linear-gradient(135deg, oklch(0.55 0.2 265), oklch(0.62 0.18 300))" }}
                >
                  <Play className="h-4 w-4 fill-current" /> Vào học ngay
                </span>
              </div>
            </Link>
          </div>
        </section>

        {/* ===== LỘ TRÌNH: stepper nhiều màu, ít nhiễu ===== */}
        <section className="mt-8 rounded-[2rem] bg-surface p-6 ring-1 ring-border shadow-soft sm:p-8">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 className="font-display text-2xl font-bold tracking-tight text-foreground">
                Hành trình từ A1 đến C2 🚀
              </h2>
            </div>
            <span className="rounded-full bg-muted px-3 py-1.5 text-xs font-semibold text-muted-foreground">
              {activeLevels.filter((l) => l.status !== "locked").length}/{activeLevels.length} cấp đã mở
            </span>
          </div>

          <LevelPath levelsList={activeLevels} currentId={currentLevel.id} />
        </section>

        {/* ===== THÀNH TÍCH: pastel tiles nhiều màu ===== */}
        <section className="mt-8">
          <h2 className="font-display text-xl font-bold tracking-tight text-foreground">
            Thành tích tuần này 🌟
          </h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <AchievementTile
              icon={<Clock className="h-5 w-5" />}
              label="Thời gian học"
              value={`${Math.floor(s.studyMinutesThisWeek / 60)}h ${s.studyMinutesThisWeek % 60}m`}
              hint={`Mục tiêu ${Math.floor(s.studyMinutesGoal / 60)}h • đạt ${goalPct}%`}
              progress={goalPct}
              hue={230}
            />
            <AchievementTile
              icon={<Target className="h-5 w-5" />}
              label="Tỷ lệ hoàn thành"
              value={`${s.completionRate}%`}
              hint={`${s.completedCourses} khoá xong • ${s.activeCourses} đang học`}
              progress={s.completionRate}
              hue={155}
            />
            <AchievementTile
              icon={<Trophy className="h-5 w-5" />}
              label="Điểm trung bình"
              value={`${s.averageScore}/100`}
              hint="Phong độ rất tốt!"
              progress={s.averageScore}
              hue={300}
            />
            <AchievementTile
              icon={<Flame className="h-5 w-5" />}
              label="Chuỗi ngày học"
              value={`${s.weeklyStreak} ngày`}
              hint="Hãy giữ ngọn lửa!"
              hue={45}
            />
          </div>
        </section>

        {/* ===== Chart + cổng thi ===== */}
        <section className="mt-6 grid gap-4 lg:grid-cols-3">
          <div className="lg:col-span-2 rounded-[2rem] bg-surface p-6 ring-1 ring-border shadow-soft">
            <div className="flex items-end justify-between">
              <div>
                <h3 className="text-base font-bold text-foreground">Hoạt động học tuần này</h3>
                <p className="text-xs text-muted-foreground">Số phút học mỗi ngày</p>
              </div>
              <span className="rounded-full bg-muted px-2.5 py-1 text-[11px] font-semibold text-muted-foreground">
                7 ngày qua
              </span>
            </div>
            <div className="mt-6 flex h-44 items-end gap-3">
              {s.weeklyChart.map((d, i) => {
                const max = Math.max(...s.weeklyChart.map((x) => x.minutes));
                const h = Math.max(6, (d.minutes / max) * 100);
                const hue = 265 + i * 14;
                const isBest = d.minutes === max;
                return (
                  <div key={d.day} className="flex flex-1 flex-col items-center gap-2">
                    <span className={cn("text-[11px] font-bold", isBest ? "text-primary" : "text-muted-foreground/70")}>
                      {d.minutes > 0 ? `${d.minutes}p` : ""}
                    </span>
                    <div className="relative flex h-full w-full items-end">
                      <div
                        className="w-full rounded-xl transition-all hover:opacity-85"
                        style={{
                          height: `${h}%`,
                          background: isBest
                            ? "linear-gradient(180deg, oklch(0.6 0.2 300), oklch(0.52 0.22 265))"
                            : `linear-gradient(180deg, oklch(0.8 0.1 ${hue}), oklch(0.7 0.13 ${hue}))`,
                          boxShadow: isBest ? "var(--shadow-glow)" : undefined,
                        }}
                        title={`${d.minutes} phút`}
                      />
                    </div>
                    <span className={cn("text-xs font-semibold", isBest ? "text-primary" : "text-muted-foreground")}>
                      {d.day}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          <a
            href="https://exam-portal.ubos.vn"
            target="_blank"
            rel="noreferrer"
            className="group relative overflow-hidden rounded-[2rem] p-6 text-white ring-1 ring-border shadow-elevated transition hover:-translate-y-1 hover:shadow-2xl"
            style={{
              background:
                "linear-gradient(150deg, oklch(0.5 0.19 230) 0%, oklch(0.55 0.2 265) 55%, oklch(0.58 0.19 290) 100%)",
            }}
          >
            <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-white/15 blur-3xl transition group-hover:scale-125" />
            <div className="absolute -bottom-12 -left-10 h-40 w-40 rounded-full bg-cyan-300/20 blur-3xl" />
            <div className="relative">
              <div className="flex items-center justify-between">
                <div className="inline-flex rounded-2xl bg-white/15 p-2.5 ring-1 ring-white/20 backdrop-blur">
                  <ClipboardCheck className="h-5 w-5" />
                </div>
                <span className="inline-flex items-center gap-1 rounded-full bg-white/15 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ring-1 ring-white/20 backdrop-blur">
                  <Sparkles className="h-3 w-3" /> Live
                </span>
              </div>
              <h3 className="mt-5 font-display text-xl font-bold tracking-tight">Cổng thi</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-white/85">
                Luyện thi đánh giá năng lực toàn diện với 4 kỹ năng Nghe, Nói, Đọc, Viết.
              </p>
              <div className="mt-4 flex flex-wrap gap-1.5">
                {[
                  { icon: Headphones, label: "Nghe" },
                  { icon: Mic, label: "Nói" },
                  { icon: BookOpen, label: "Đọc" },
                  { icon: PenLine, label: "Viết" },
                ].map((sk) => (
                  <span
                    key={sk.label}
                    className="inline-flex items-center gap-1 rounded-full bg-white/12 px-2.5 py-1 text-[11px] font-medium ring-1 ring-white/15 backdrop-blur"
                  >
                    <sk.icon className="h-3 w-3" /> {sk.label}
                  </span>
                ))}
              </div>
              <div className="mt-6 inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-2 text-sm font-semibold ring-1 ring-white/25 backdrop-blur transition group-hover:bg-white/25">
                Vào cổng thi
                <ArrowUpRight className="h-4 w-4 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </div>
            </div>
          </a>
        </section>
      </div>
    </div>
  );
}

/* ================= Lộ trình dạng thẻ theo từng cấp ================= */

function LevelPath({ levelsList, currentId }: { levelsList: typeof levels; currentId: string }) {
  return (
    <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {levelsList.map((lv) => {
        const completed = lv.status === "completed";
        const active = lv.status === "in-progress";
        const locked = lv.status === "locked";
        const notEnrolled = lv.status === "not-enrolled";
        const card = (
          <div
            className={cn(
              "group relative flex flex-col rounded-3xl p-5 ring-1 transition",
              active
                ? "bg-surface shadow-elevated ring-primary/30"
                : completed
                  ? "bg-surface shadow-soft ring-border"
                  : "bg-muted/40 ring-border/60",
              (locked || notEnrolled) && "opacity-70",
            )}
          >
            {/* top row: badge + status */}
            <div className="flex items-start justify-between gap-3">
              <div
                className={cn(
                  "flex h-14 w-14 items-center justify-center rounded-2xl font-black text-white shadow-soft",
                  active && "animate-pulse-slow",
                )}
                style={
                  completed
                    ? { background: "linear-gradient(135deg, oklch(0.65 0.16 155), oklch(0.75 0.13 180))" }
                    : active
                      ? {
                          background: `linear-gradient(135deg, oklch(0.5 0.21 ${lv.hue}), oklch(0.66 0.18 ${(lv.hue + 35) % 360}))`,
                          boxShadow: `0 14px 32px -10px oklch(0.55 0.22 ${lv.hue} / 0.55)`,
                        }
                      : { background: "oklch(0.88 0.012 260)", color: "oklch(0.55 0.02 260)" }
                }
              >
                {completed ? (
                  <CheckCircle2 className="h-6 w-6" />
                ) : locked || notEnrolled ? (
                  <Lock className="h-5 w-5" />
                ) : (
                  <span className="text-xl">{lv.code}</span>
                )}
              </div>
              <span
                className={cn(
                  "rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide",
                  completed && "bg-success/15 text-success-foreground",
                  active && "text-white",
                  locked && "bg-muted text-muted-foreground",
                  notEnrolled && "bg-muted text-muted-foreground",
                )}
                style={active ? { background: `oklch(0.55 0.2 ${lv.hue})` } : undefined}
              >
                {completed
                  ? "Hoàn thành"
                  : active
                    ? "Đang học"
                    : locked
                      ? "Đã khoá"
                      : "Ngoài lộ trình"}
              </span>
            </div>

            {/* title */}
            <div className="mt-4">
              <h3
                className={cn(
                  "font-display text-lg font-bold",
                  active || completed ? "text-foreground" : "text-muted-foreground",
                )}
              >
                {lv.name}
              </h3>
              <p className="text-xs font-semibold text-muted-foreground">{lv.code}</p>
            </div>

            {/* progress */}
            {active && (
              <div className="mt-3">
                <div className="mb-1.5 flex items-center justify-between text-xs">
                  <span className="font-semibold text-foreground/70">Tiến độ</span>
                  <span className="font-bold" style={{ color: `oklch(0.5 0.2 ${lv.hue})` }}>
                    {lv.progress}%
                  </span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{
                      width: `${lv.progress}%`,
                      background: `linear-gradient(90deg, oklch(0.55 0.2 ${lv.hue}), oklch(0.7 0.16 ${(lv.hue + 30) % 360}))`,
                    }}
                  />
                </div>
              </div>
            )}

            {/* mini courses for active/completed */}
            {(active || completed) && lv.courses.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-1.5">
                {lv.courses.slice(0, 3).map((c, i) => {
                  const hue = (lv.hue + i * 35) % 360;
                  return (
                    <span
                      key={c.id}
                      className="inline-flex max-w-[8rem] items-center gap-1 truncate rounded-full px-2 py-1 text-[10px] font-semibold ring-1 ring-inset"
                      style={{
                        background: pastel(hue, 0.96, 0.055),
                        color: `oklch(0.45 0.12 ${hue})`,
                        borderColor: `oklch(0.85 0.05 ${hue})`,
                      }}
                    >
                      <BookOpen className="h-3 w-3 shrink-0" />
                      {c.title}
                    </span>
                  );
                })}
                {lv.courses.length > 3 && (
                  <span className="inline-flex items-center rounded-full px-2 py-1 text-[10px] font-semibold text-muted-foreground">
                    +{lv.courses.length - 3}
                  </span>
                )}
              </div>
            )}

            {/* locked overlay hint */}
            {(locked || notEnrolled) && (
              <div className="mt-4 inline-flex items-center gap-1 text-[10px] font-semibold text-muted-foreground">
                <Lock className="h-3 w-3" /> {locked ? "Hoàn thành cấp trước để mở" : "Chưa tham gia lộ trình"}
              </div>
            )}
          </div>
        );

        return locked || notEnrolled ? (
          <div key={lv.id} aria-disabled="true" className="cursor-not-allowed">
            {card}
          </div>
        ) : (
          <Link key={lv.id} to="/levels/$level" params={{ level: lv.id }} className="block">
            {card}
          </Link>
        );
      })}
    </div>
  );
}

/* ================= Thẻ thành tích pastel ================= */

function AchievementTile({
  icon,
  label,
  value,
  hint,
  progress,
  hue,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  hint?: string;
  progress?: number;
  hue: number;
}) {
  return (
    <div
      className="group rounded-3xl p-5 ring-1 ring-border shadow-soft transition hover:-translate-y-0.5 hover:shadow-elevated"
      style={{ background: pastel(hue, 0.955, 0.06) }}
    >
      <div className="flex items-center justify-between">
        <span
          className="flex h-10 w-10 items-center justify-center rounded-2xl text-white shadow-soft"
          style={{ background: `linear-gradient(135deg, oklch(0.55 0.19 ${hue}), oklch(0.68 0.16 ${(hue + 30) % 360}))` }}
        >
          {icon}
        </span>
        <ArrowUpRight className="h-4 w-4 text-foreground/30 transition group-hover:text-foreground" />
      </div>
      <div className="mt-4 text-[11px] font-bold uppercase tracking-wide text-foreground/50">{label}</div>
      <div className="mt-1 font-display text-2xl font-bold tracking-tight text-foreground">{value}</div>
      {hint && <div className="mt-1 text-xs text-foreground/60">{hint}</div>}
      {typeof progress === "number" && (
        <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-white/70">
          <div
            className="h-full rounded-full transition-all duration-700"
            style={{
              width: `${Math.min(100, progress)}%`,
              background: `linear-gradient(90deg, oklch(0.55 0.19 ${hue}), oklch(0.68 0.16 ${(hue + 30) % 360}))`,
            }}
          />
        </div>
      )}
    </div>
  );
}
