import React, { useState } from "react";
import {
  ArrowLeft,
  BookOpen,
  CheckCircle2,
  ChevronDown,
  Circle,
  Clock,
  ClipboardList,
  FileText,
  Headphones,
  Mic,
  PanelLeftClose,
  PanelLeftOpen,
  PenLine,
  Play,
  PlayCircle,
  Sparkles,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { type Course, type Activity, type Unit } from "@/lib/lms-data";
import { QuizPanel } from "@/components/QuizPanel";
import { ReadingPanel } from "@/components/ReadingPanel";
import { VideoPanel } from "@/components/VideoPanel";

type ClassSummary = {
  id: string;
  name: string;
  studentCount: number;
  avgProgress: number;
  avgScore: number;
  attendance: number;
  schedule: string;
  role: "primary" | "assistant";
};

type Props = {
  course: Course;
  level: { code: string; name: string; hue: number };
  classesSummary?: ClassSummary[];
};

export function CourseContentViewer({ course, level, classesSummary = [] }: Props) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({
    overview: true,
    [course.units[0]?.id]: true,
  });
  const [activeUnitId, setActiveUnitId] = useState<string | null>("__overview");
  const [activeActivity, setActiveActivity] = useState<{
    type: Activity["type"];
    activity: Activity;
  } | null>(null);
  const totalMinutes = course.units.reduce(
    (a, u) => a + u.activities.reduce((b, x) => b + x.duration, 0),
    0,
  );


  const handleActivityClick = (unitId: string, a: Activity) => {
    setActiveUnitId(unitId);
    if (a.type === "quiz") {
      setActiveActivity({ type: "quiz", activity: a });
    } else if (a.type === "reading") {
      setActiveActivity({ type: "reading", activity: a });
    } else if (a.type === "video") {
      setActiveActivity({ type: "video", activity: a });
    } else {
      setActiveActivity(null);
    }
  };

  return (
    <div className="flex gap-6">
      {/* Sidebar */}
      {sidebarOpen && (
        <aside className="hidden w-[300px] shrink-0 lg:block">
          <div className="sticky top-[5.25rem] max-h-[calc(100vh-6.5rem)] overflow-y-auto rounded-3xl bg-surface/80 p-4 ring-1 ring-border/70 shadow-soft backdrop-blur">
            <div className="mb-3 flex items-center justify-between px-1">
              <div>
                <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Menu khóa học
                </div>
                <div className="mt-0.5 text-sm font-semibold text-foreground">{course.title}</div>
              </div>
              <span
                className="rounded-full px-2 py-0.5 text-[10px] font-semibold text-white"
                style={{ background: `oklch(0.55 0.18 ${level.hue})` }}
              >
                {level.code}
              </span>
            </div>

            <div className="mb-2">
              <SidebarLeaf
                label="Course overview"
                meta="Lộ trình & tổng quan lớp"
                icon={<BookOpen className="h-4 w-4" />}
                active={activeUnitId === "__overview"}
                onClick={() => {
                  setActiveUnitId("__overview");
                  setActiveActivity(null);
                }}
              />
            </div>


            {course.units.map((u) => {
              const done = u.activities.filter((a) => a.done).length;
              const pct = Math.round((done / u.activities.length) * 100);
              return (
                <SidebarGroup
                  key={u.id}
                  id={u.id}
                  title={`Unit ${u.index} — ${u.title.split(":")[1]?.trim() ?? u.title}`}
                  hue={level.hue}
                  progress={pct}
                  open={openGroups[u.id] ?? false}
                  onToggle={() => setOpenGroups((g) => ({ ...g, [u.id]: !g[u.id] }))}
                >
                  {u.activities.map((a) => (
                    <SidebarLeaf
                      key={a.id}
                      icon={activityIcon(a.type)}
                      label={a.title}
                      meta={`${a.duration} phút`}
                      done={a.done}
                      active={activeUnitId === u.id + ":" + a.id}
                      onClick={() => handleActivityClick(u.id, a)}
                    />
                  ))}
                </SidebarGroup>
              );
            })}
          </div>
        </aside>
      )}

      {/* Main */}
      <main className="min-w-0 flex-1 space-y-6">
        {/* Toggle sidebar on mobile / when closed */}
        <div className="flex items-center gap-2 lg:hidden">
          <button
            onClick={() => setSidebarOpen((v) => !v)}
            className="inline-flex h-9 w-9 items-center justify-center rounded-xl text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            {sidebarOpen ? <PanelLeftClose className="h-4 w-4" /> : <PanelLeftOpen className="h-4 w-4" />}
          </button>
        </div>

        {activeActivity?.type === "quiz" && activeActivity.activity ? (
          <QuizPanel quiz={activeActivity.activity} hue={level.hue} onClose={() => setActiveActivity(null)} />
        ) : activeActivity?.type === "reading" && activeActivity.activity ? (
          <ReadingPanel audience="teacher" activity={activeActivity.activity} hue={level.hue} onClose={() => setActiveActivity(null)} />
        ) : activeActivity?.type === "video" && activeActivity.activity ? (
          <VideoPanel audience="teacher" activity={activeActivity.activity} hue={level.hue} onClose={() => setActiveActivity(null)} />
        ) : (
          <CourseOverviewView course={course} hue={level.hue} totalMinutes={totalMinutes} classesSummary={classesSummary} />
        )}
      </main>
    </div>
  );
}

/* =========== Sidebar pieces =========== */

function SidebarGroup({
  title,
  open,
  onToggle,
  hue,
  progress,
  children,
}: {
  id: string;
  title: string;
  open: boolean;
  onToggle: () => void;
  hue: number;
  progress?: number;
  children: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "mb-2 overflow-hidden rounded-2xl ring-1 transition",
        open ? "bg-surface ring-border shadow-soft" : "ring-transparent hover:bg-muted/40",
      )}
    >
      <button onClick={onToggle} className="flex w-full items-center gap-2 px-3 py-2.5 text-left">
        <div className="h-2 w-2 shrink-0 rounded-full" style={{ background: `oklch(0.6 0.18 ${hue})` }} />
        <span className="flex-1 truncate text-sm font-semibold text-foreground">{title}</span>
        {progress !== undefined && (
          <span className="text-[10px] font-semibold text-muted-foreground">{progress}%</span>
        )}
        <ChevronDown className={cn("h-4 w-4 text-muted-foreground transition-transform", open && "rotate-180")} />
      </button>
      {open && <div className="space-y-0.5 px-2 pb-2">{children}</div>}
    </div>
  );
}

function SidebarLeaf({
  label,
  meta,
  icon,
  done,
  active,
  onClick,
}: {
  label: string;
  meta?: string;
  icon?: React.ReactNode;
  done?: boolean;
  active?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "group flex w-full items-center gap-2.5 rounded-xl px-2.5 py-2 text-left transition",
        active ? "bg-primary/10 text-foreground" : "hover:bg-muted/60",
      )}
    >
      <span
        className={cn(
          "flex h-5 w-5 shrink-0 items-center justify-center rounded-full",
          done ? "bg-success/20 text-success-foreground" : "bg-muted text-muted-foreground",
        )}
      >
        {done ? <CheckCircle2 className="h-3.5 w-3.5" /> : icon ?? <Circle className="h-3 w-3" />}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-[13px] font-medium text-foreground">{label}</span>
        {meta && <span className="block text-[10px] text-muted-foreground">{meta}</span>}
      </span>
    </button>
  );
}

/* =========== Helpers =========== */

function activityIcon(t: Activity["type"]) {
  const map = {
    video: PlayCircle,
    reading: FileText,
    quiz: ClipboardList,
    speaking: Mic,
    writing: PenLine,
  };
  const Icon = map[t] ?? Headphones;
  return <Icon className="h-4 w-4" />;
}


/* =========== Views =========== */

function CourseOverviewView({
  course,
  hue,
  totalMinutes,
  classesSummary,
}: {
  course: Course;
  hue: number;
  totalMinutes: number;
  classesSummary: ClassSummary[];
}) {
  const totalActivities = course.units.reduce((a, u) => a + u.activities.length, 0);
  const totalStudents = classesSummary.reduce((a, c) => a + c.studentCount, 0);
  const avgProgress = classesSummary.length
    ? Math.round(classesSummary.reduce((a, c) => a + c.avgProgress, 0) / classesSummary.length)
    : 0;
  const avgScore = classesSummary.length
    ? Math.round(classesSummary.reduce((a, c) => a + c.avgScore, 0) / classesSummary.length)
    : 0;

  return (
    <div className="space-y-6">
      {/* Hero summary */}
      <div
        className="relative overflow-hidden rounded-3xl p-6 text-white shadow-elevated"
        style={{
          background: `linear-gradient(135deg, oklch(0.45 0.18 ${hue}), oklch(0.6 0.2 ${(hue + 50) % 360}))`,
        }}
      >
        <div className="absolute -right-20 -top-20 h-72 w-72 rounded-full opacity-30 blur-3xl bg-white" />
        <div className="relative">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider backdrop-blur ring-1 ring-white/20">
            <Sparkles className="h-3.5 w-3.5" /> Course overview
          </div>
          <h2 className="mt-3 font-display text-2xl font-semibold sm:text-3xl">{course.title}</h2>
          <p className="mt-1 max-w-2xl text-sm text-white/85">
            Tổng quan lộ trình giáo viên đang dạy và tình hình các lớp đang theo khóa này.
          </p>
          <div className="mt-5 grid gap-3 sm:grid-cols-4">
            <HeroStat icon={<BookOpen className="h-3.5 w-3.5" />} label="Units" value={course.units.length} />
            <HeroStat icon={<ClipboardList className="h-3.5 w-3.5" />} label="Hoạt động" value={totalActivities} />
            <HeroStat icon={<Clock className="h-3.5 w-3.5" />} label="Thời lượng" value={`${Math.round(totalMinutes / 60)}h`} />
            <HeroStat icon={<Users className="h-3.5 w-3.5" />} label="Học viên" value={totalStudents} />
          </div>
        </div>
      </div>

      {/* Class overview */}
      <div className="rounded-3xl bg-surface p-6 ring-1 ring-border shadow-soft">
        <div className="mb-4 flex items-end justify-between gap-3">
          <div>
            <h3 className="font-display text-lg font-semibold text-foreground">Tổng quan lớp đang dạy</h3>
            <p className="text-sm text-muted-foreground">
              {classesSummary.length} lớp · Tiến độ TB {avgProgress}% · Điểm TB {avgScore || "—"}
            </p>
          </div>
        </div>
        {classesSummary.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border bg-surface-2 p-8 text-center text-sm text-muted-foreground">
            Chưa có lớp nào theo khóa học này.
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {classesSummary.map((c) => (
              <div
                key={c.id}
                className="flex flex-col gap-3 rounded-2xl bg-surface-2 p-4 ring-1 ring-border/60"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="truncate text-sm font-semibold text-foreground">{c.name}</div>
                    <div className="mt-0.5 text-[11px] text-muted-foreground">
                      {c.schedule} · {c.studentCount} HV
                    </div>
                  </div>
                  <span
                    className={cn(
                      "rounded-md px-2 py-0.5 text-[10px] font-semibold",
                      c.role === "primary"
                        ? "bg-violet-500/10 text-violet-700"
                        : "bg-amber-500/10 text-amber-700",
                    )}
                  >
                    {c.role === "primary" ? "Chủ nhiệm" : "Trợ giảng"}
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-center">
                  <MiniStat label="Tiến độ" value={`${c.avgProgress}%`} />
                  <MiniStat label="Điểm TB" value={c.avgScore} />
                  <MiniStat label="Tham gia" value={`${c.attendance}%`} />
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full"
                    style={{ width: `${c.avgProgress}%`, background: `oklch(0.6 0.18 ${hue})` }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Roadmap */}
      <div className="rounded-3xl bg-surface p-6 ring-1 ring-border shadow-soft">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h3 className="font-display text-lg font-semibold text-foreground">Lộ trình giảng dạy</h3>
            <p className="text-sm text-muted-foreground">
              Các unit trong khóa — chọn để mở bài giảng dùng cho buổi học trực tuyến.
            </p>
          </div>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          {course.units.map((u) => {
            const done = u.activities.filter((a) => a.done).length;
            const pct = Math.round((done / u.activities.length) * 100);
            const mins = u.activities.reduce((a, x) => a + x.duration, 0);
            return (
              <div
                key={u.id}
                className="group flex items-center gap-4 rounded-2xl bg-surface-2 p-4 ring-1 ring-border/60 transition hover:shadow-soft"
              >
                <div
                  className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-sm font-bold text-white"
                  style={{
                    background: `linear-gradient(135deg, oklch(0.55 0.18 ${hue}), oklch(0.65 0.18 ${(hue + 40) % 360}))`,
                  }}
                >
                  {u.index}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-semibold text-foreground">{u.title}</div>
                  <div className="mt-0.5 flex items-center gap-2 text-[11px] text-muted-foreground">
                    <span>{u.activities.length} hoạt động</span>
                    <span>·</span>
                    <span>{mins} phút</span>
                  </div>
                  <div className="mt-1.5 flex items-center gap-2">
                    <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full rounded-full"
                        style={{ width: `${pct}%`, background: `oklch(0.6 0.18 ${hue})` }}
                      />
                    </div>
                    <span className="text-[11px] font-semibold text-muted-foreground">{pct}%</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function HeroStat({ icon, label, value }: { icon: React.ReactNode; label: string; value: string | number }) {
  return (
    <div className="rounded-2xl bg-white/10 px-3 py-2.5 ring-1 ring-white/15 backdrop-blur">
      <div className="flex items-center gap-1.5 text-[11px] font-medium text-white/80">
        {icon} {label}
      </div>
      <div className="mt-0.5 font-display text-lg font-semibold">{value}</div>
    </div>
  );
}

function MiniStat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-xl bg-muted/40 p-2">
      <div className="text-sm font-bold text-foreground">{value}</div>
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</div>
    </div>
  );
}

