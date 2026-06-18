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
  

  const totalActivities = course.units.reduce((a, u) => a + u.activities.length, 0);
  const doneActivities = course.units.reduce(
    (a, u) => a + u.activities.filter((x) => x.done).length,
    0,
  );
  const totalMinutes = course.units.reduce(
    (a, u) => a + u.activities.reduce((b, x) => b + x.duration, 0),
    0,
  );

  const activeUnit = course.units.find((u) => u.id === activeUnitId) ?? null;

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

            <SidebarGroup
              id="guide"
              title="Hướng dẫn"
              hue={level.hue}
              open={openGroups["guide"] ?? false}
              onToggle={() => setOpenGroups((g) => ({ ...g, guide: !g.guide }))}
            >
              <SidebarLeaf
                label="Hướng dẫn sử dụng"
                meta="2 phút"
                active={activeUnitId === "__guide"}
                onClick={() => {
                  setActiveUnitId("__guide");
                  setActiveActivity(null);
                  
                }}
              />
            </SidebarGroup>

            <SidebarGroup
              id="intro"
              title="Introduction"
              hue={level.hue}
              open={openGroups["intro"] ?? false}
              onToggle={() => setOpenGroups((g) => ({ ...g, intro: !g.intro }))}
            >
              <SidebarLeaf
                label="Introduction 1 — Phonemic symbols"
                meta="6 phút"
                active={activeUnitId === "__intro1"}
                onClick={() => {
                  setActiveUnitId("__intro1");
                  setActiveActivity(null);
                }}
              />
              <SidebarLeaf
                label="Introduction 2 — Phonemic symbols"
                meta="8 phút"
                active={activeUnitId === "__intro2"}
                onClick={() => {
                  setActiveUnitId("__intro2");
                  setActiveActivity(null);
                }}
              />
            </SidebarGroup>

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
          <ReadingPanel activity={activeActivity.activity} hue={level.hue} onClose={() => setActiveActivity(null)} />
        ) : activeActivity?.type === "video" && activeActivity.activity ? (
          <VideoPanel activity={activeActivity.activity} hue={level.hue} onClose={() => setActiveActivity(null)} />
        ) : (
          <OverviewView course={course} hue={level.hue} totalMinutes={totalMinutes} activeUnit={activeUnit} />
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

function labelType(t: Activity["type"]) {
  return ({ video: "Video", reading: "Đọc", quiz: "Quiz", speaking: "Nói", writing: "Viết" })[t];
}

function HeroPill({ icon, children }: { icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 text-xs font-medium text-background backdrop-blur ring-1 ring-white/15">
      {icon}
      {children}
    </span>
  );
}

function Tab({
  active,
  onClick,
  icon,
  children,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "inline-flex shrink-0 items-center gap-1.5 rounded-xl px-4 py-2 text-sm font-medium transition",
        active ? "bg-foreground text-background shadow-soft" : "text-muted-foreground hover:bg-muted hover:text-foreground",
      )}
    >
      {icon}
      {children}
    </button>
  );
}

/* =========== Views =========== */

function OverviewView({
  course,
  hue,
  totalMinutes,
  activeUnit,
}: {
  course: Course;
  hue: number;
  totalMinutes: number;
  activeUnit: Unit | null;
}) {
  const introCards = [
    {
      tag: "Classroom language",
      title: "Introduction",
      desc: "Làm quen với ngôn ngữ lớp học và phát âm cơ bản.",
      hue,
    },
    {
      tag: "Can-do objectives",
      title: activeUnit ? activeUnit.title : "Unit 1: Hello!",
      desc: "Gặp gỡ và chào hỏi mọi người trong các tình huống đời sống.",
      hue: (hue + 40) % 360,
    },
    {
      tag: "Skills focus",
      title: "Speaking & Listening Lab",
      desc: "Phòng lab tương tác giúp bạn phản xạ tự tin theo chuẩn Cambridge.",
      hue: (hue + 80) % 360,
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <div className="mb-3 flex items-end justify-between">
          <div>
            <h2 className="font-display text-xl font-semibold text-foreground">Hướng dẫn</h2>
            <p className="text-sm text-muted-foreground">Phòng Lab hoạt động tốt nhất trên trình duyệt Chrome.</p>
          </div>
          <span className="text-xs text-muted-foreground">~{Math.round(totalMinutes / 60)}h nội dung</span>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {introCards.map((c, i) => (
            <IntroCard key={i} {...c} />
          ))}
        </div>
      </div>

      <div className="rounded-3xl bg-surface p-6 ring-1 ring-border shadow-soft">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h3 className="font-display text-lg font-semibold text-foreground">Lộ trình</h3>
            <p className="text-sm text-muted-foreground">Hoàn thành tuần tự để mở khoá nội dung tiếp theo.</p>
          </div>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          {course.units.map((u) => {
            const done = u.activities.filter((a) => a.done).length;
            const pct = Math.round((done / u.activities.length) * 100);
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

function IntroCard({
  tag,
  title,
  desc,
  hue,
}: {
  tag: string;
  title: string;
  desc: string;
  hue: number;
}) {
  return (
    <div className="group relative overflow-hidden rounded-3xl bg-surface ring-1 ring-border shadow-soft transition hover:-translate-y-1 hover:shadow-elevated">
      <div
        className="relative aspect-[16/10] overflow-hidden"
        style={{
          background: `linear-gradient(135deg, oklch(0.55 0.2 ${hue}), oklch(0.4 0.22 ${(hue + 50) % 360}))`,
        }}
      >
        <div className="absolute inset-0 opacity-30 mix-blend-overlay [background-image:radial-gradient(circle_at_25%_20%,rgba(255,255,255,0.5),transparent_40%),radial-gradient(circle_at_80%_80%,rgba(0,0,0,0.4),transparent_40%)]" />
        <div className="absolute left-4 top-4">
          <span className="rounded-full bg-black/30 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-white backdrop-blur">
            {tag}
          </span>
        </div>
        <div className="absolute inset-x-4 bottom-4">
          <h3 className="font-display text-2xl font-bold text-white drop-shadow">{title}</h3>
        </div>
      </div>
      <div className="space-y-3 p-5">
        <p className="text-sm text-muted-foreground line-clamp-2">{desc}</p>
        <button
          className="inline-flex w-full items-center justify-center gap-2 rounded-2xl px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-soft transition group-hover:shadow-elevated"
          style={{ background: "var(--gradient-brand)" }}
        >
          <Play className="h-4 w-4 fill-primary-foreground" />
          Hãy bắt đầu
        </button>
      </div>
    </div>
  );
}

function ActivitiesView({
  course,
  hue,
  onQuizClick,
}: {
  course: Course;
  hue: number;
  onQuizClick: (a: Activity) => void;
}) {
  return (
    <div className="space-y-5">
      {course.units.map((u) => (
        <div key={u.id} className="rounded-3xl bg-surface p-5 ring-1 ring-border shadow-soft">
          <div className="mb-3 flex items-center gap-3">
            <div
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-sm font-bold text-white"
              style={{ background: `linear-gradient(135deg, oklch(0.55 0.18 ${hue}), oklch(0.7 0.18 ${(hue + 40) % 360}))` }}
            >
              {u.index}
            </div>
            <div className="min-w-0 flex-1">
              <div className="truncate text-sm font-semibold text-foreground">{u.title}</div>
              <div className="text-xs text-muted-foreground">{u.description}</div>
            </div>
          </div>
          <div className="grid gap-2 sm:grid-cols-2">
            {u.activities.map((a) => {
              const isQuiz = a.type === "quiz";
              const interactive = isQuiz;
              const Wrapper: any = interactive ? "button" : "div";
              return (
                <Wrapper
                  key={a.id}
                  onClick={interactive ? () => onQuizClick(a) : undefined}
                  className={cn(
                    "flex items-center gap-3 rounded-2xl bg-surface-2 p-3 text-left ring-1 ring-border/60 transition",
                    interactive && "hover:bg-primary/5 hover:ring-primary/40 cursor-pointer",
                  )}
                >
                  <div
                    className={cn(
                      "flex h-9 w-9 items-center justify-center rounded-xl",
                      a.done ? "bg-success/15 text-success-foreground" : "bg-primary/10 text-primary",
                    )}
                  >
                    {activityIcon(a.type)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-medium text-foreground">{a.title}</div>
                    <div className="text-[11px] text-muted-foreground">
                      {labelType(a.type)} • {a.duration} phút
                      {isQuiz && " • Không giới hạn lượt"}
                    </div>
                  </div>
                  {isQuiz ? (
                    <span className="rounded-full bg-primary/10 px-2.5 py-1 text-[10px] font-semibold text-primary">
                      Làm bài
                    </span>
                  ) : a.done ? (
                    <CheckCircle2 className="h-4 w-4 text-success-foreground" />
                  ) : (
                    <Circle className="h-4 w-4 text-muted-foreground" />
                  )}
                </Wrapper>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
