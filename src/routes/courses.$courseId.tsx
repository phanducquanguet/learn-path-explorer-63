import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useState } from "react";
import {
  ArrowLeft,
  BookOpen,
  CheckCircle2,
  ChevronDown,
  Circle,
  ClipboardList,
  Clock,
  ExternalLink,
  FileText,
  Headphones,
  Mic,
  PanelLeftClose,
  PanelLeftOpen,
  PenLine,
  PlayCircle,
  Play,
  Sparkles,
  Trophy,
  Users,
  GraduationCap,
} from "lucide-react";
import { getCourse, type Activity, type Unit } from "@/lib/lms-data";
import { cn } from "@/lib/utils";
import { QuizPanel } from "@/components/QuizPanel";
import { ReadingPanel } from "@/components/ReadingPanel";
import { VideoPanel } from "@/components/VideoPanel";
import { useRole } from "@/contexts/RoleContext";

export const Route = createFileRoute("/courses/$courseId")({
  head: ({ params }) => ({
    meta: [{ title: `Khoá học ${params.courseId} — UNICOM LMS` }],
  }),
  component: CoursePage,
  notFoundComponent: () => (
    <div className="p-10 text-center text-muted-foreground">Không tìm thấy khoá học.</div>
  ),
});

const activityIcon = (t: Activity["type"]) => {
  const map = {
    video: PlayCircle,
    reading: FileText,
    quiz: ClipboardList,
    speaking: Mic,
    writing: PenLine,
  };
  const Icon = map[t] ?? Headphones;
  return <Icon className="h-4 w-4" />;
};

const labelType = (t: Activity["type"]) =>
  ({ video: "Video", reading: "Đọc", quiz: "Quiz", speaking: "Nói", writing: "Viết" })[t];

type TabKey = "overview" | "members" | "scores" | "activities" | "competence";

function CoursePage() {
  const { courseId } = Route.useParams();
  const { role } = useRole();
  const isTeacher = role === "teacher";
  const data = getCourse(courseId);
  if (!data) throw notFound();
  const { course, level } = data;

  const [activeUnitId, setActiveUnitId] = useState<string | null>(null);
  const [tab, setTab] = useState<TabKey>("overview");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [quizOpen, setQuizOpen] = useState<Activity | null>(null);
  const [readingOpen, setReadingOpen] = useState<Activity | null>(null);
  const [videoOpen, setVideoOpen] = useState<Activity | null>(null);
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({
    intro: true,
    [course.units[0].id]: true,
  });

  const activeUnit = course.units.find((u) => u.id === activeUnitId) ?? null;
  const totalActivities = course.units.reduce((a, u) => a + u.activities.length, 0);
  const doneActivities = course.units.reduce(
    (a, u) => a + u.activities.filter((x) => x.done).length,
    0,
  );
  const totalMinutes = course.units.reduce(
    (a, u) => a + u.activities.reduce((b, x) => b + x.duration, 0),
    0,
  );

  return (
    <div
      className="min-h-screen"
      style={{
        background:
          "radial-gradient(at 0% 0%, oklch(0.96 0.04 260 / 0.5) 0px, transparent 45%), radial-gradient(at 100% 0%, oklch(0.96 0.04 290 / 0.4) 0px, transparent 45%), oklch(0.985 0.006 260)",
      }}
    >
      {/* Top bar */}
      <header className="sticky top-0 z-30 border-b border-border/60 bg-surface/70 backdrop-blur-xl">
        <div className="mx-auto flex max-w-[1500px] items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSidebarOpen((v) => !v)}
              className="inline-flex h-9 w-9 items-center justify-center rounded-xl text-muted-foreground hover:bg-muted hover:text-foreground"
              aria-label="Toggle sidebar"
            >
              {sidebarOpen ? <PanelLeftClose className="h-4 w-4" /> : <PanelLeftOpen className="h-4 w-4" />}
            </button>
            <Link
              to="/levels/$level"
              params={{ level: level.code.toLowerCase() }}
              className="inline-flex items-center gap-1.5 rounded-xl px-2.5 py-1.5 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4" /> Trở lại {level.code}
            </Link>
            <span className="hidden text-muted-foreground/50 md:inline">/</span>
            <div className="hidden md:block">
              <div className="text-xs text-muted-foreground">Khoá học</div>
              <div className="text-sm font-semibold text-foreground">{course.title}</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden items-center gap-3 md:flex">
              <div className="text-xs text-muted-foreground">Tiến độ</div>
              <div className="h-2 w-44 overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full transition-all"
                  style={{ width: `${course.progress}%`, background: "var(--gradient-brand)" }}
                />
              </div>
              <div className="text-sm font-semibold text-foreground">{course.progress}%</div>
            </div>
            <a
              href="https://example.com/test-portal"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 rounded-xl bg-foreground px-3.5 py-2 text-xs font-semibold text-background hover:opacity-90"
            >
              Test Portal <ExternalLink className="h-3.5 w-3.5" />
            </a>
          </div>
        </div>
      </header>

      <div className="mx-auto flex max-w-[1500px] gap-6 px-4 py-6 sm:px-6 lg:px-8">
        {/* Sidebar */}
        {sidebarOpen && (
          <aside className="hidden w-[300px] shrink-0 lg:block">
            <div className="sticky top-[5.25rem] max-h-[calc(100vh-6.5rem)] overflow-y-auto rounded-3xl bg-surface/80 p-4 ring-1 ring-border/70 shadow-soft backdrop-blur">
              <div className="mb-3 flex items-center justify-between px-1">
                <div>
                  <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Menu khoá học
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
                    setTab("overview");
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
                  onClick={() => setActiveUnitId("__intro1")}
                />
                <SidebarLeaf
                  label="Introduction 2 — Phonemic symbols"
                  meta="8 phút"
                  active={activeUnitId === "__intro2"}
                  onClick={() => setActiveUnitId("__intro2")}
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
                    onToggle={() =>
                      setOpenGroups((g) => ({ ...g, [u.id]: !g[u.id] }))
                    }
                  >
                    {u.activities.map((a) => (
                      <SidebarLeaf
                        key={a.id}
                        icon={activityIcon(a.type)}
                        label={a.title}
                        meta={`${a.duration} phút`}
                        done={a.done}
                        active={activeUnitId === u.id + ":" + a.id}
                        onClick={() => {
                          setActiveUnitId(u.id);
                          if (a.type === "quiz") {
                            setQuizOpen(a);
                            setReadingOpen(null);
                            setVideoOpen(null);
                          } else if (a.type === "reading") {
                            setReadingOpen(a);
                            setQuizOpen(null);
                            setVideoOpen(null);
                          } else if (a.type === "video") {
                            setVideoOpen(a);
                            setQuizOpen(null);
                            setReadingOpen(null);
                          } else {
                            setQuizOpen(null);
                            setReadingOpen(null);
                            setVideoOpen(null);
                            setTab("overview");
                          }
                        }}
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
          {quizOpen ? (
            <QuizPanel quiz={quizOpen} hue={level.hue} onClose={() => setQuizOpen(null)} />
          ) : readingOpen ? (
            <ReadingPanel activity={readingOpen} hue={level.hue} onClose={() => setReadingOpen(null)} />
          ) : videoOpen ? (
            <VideoPanel activity={videoOpen} hue={level.hue} onClose={() => setVideoOpen(null)} />
          ) : (
            <>
              {/* HERO */}
              <section
                className="relative overflow-hidden rounded-[2rem] p-1 shadow-elevated"
                style={{
                  background: `linear-gradient(135deg, oklch(0.55 0.2 ${level.hue}), oklch(0.45 0.22 ${(level.hue + 40) % 360}))`,
                }}
              >
                <div className="relative overflow-hidden rounded-[1.85rem] bg-gradient-to-br from-foreground/95 via-foreground/90 to-foreground/95 p-8 sm:p-10">
                  <div
                    className="absolute -right-24 -top-24 h-72 w-72 rounded-full opacity-40 blur-3xl"
                    style={{ background: `oklch(0.7 0.22 ${level.hue})` }}
                  />
                  <div
                    className="absolute -bottom-32 left-1/3 h-72 w-72 rounded-full opacity-30 blur-3xl"
                    style={{ background: `oklch(0.7 0.22 ${(level.hue + 60) % 360})` }}
                  />

                  <div className="relative grid gap-8 lg:grid-cols-[1.4fr_1fr] lg:items-center">
                    <div className="text-background">
                      <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider backdrop-blur ring-1 ring-white/20">
                        <Sparkles className="h-3.5 w-3.5" />
                        Cấp độ {level.code} • {level.name}
                      </div>
                      <h1 className="mt-4 font-display text-3xl font-semibold leading-tight tracking-tight sm:text-4xl">
                        {course.title}
                      </h1>
                      <p className="mt-2 max-w-xl text-sm text-background/70 sm:text-base">
                        {course.subtitle}. Hành trình {course.units.length} units giúp bạn
                        nâng tầm kỹ năng nghe — nói — đọc — viết.
                      </p>

                      <div className="mt-5 flex flex-wrap gap-2">
                        <HeroPill icon={<Clock className="h-3.5 w-3.5" />}>
                          {course.hours}h học tập
                        </HeroPill>
                        <HeroPill icon={<BookOpen className="h-3.5 w-3.5" />}>
                          {course.units.length} units
                        </HeroPill>
                        <HeroPill icon={<ClipboardList className="h-3.5 w-3.5" />}>
                          {totalActivities} hoạt động
                        </HeroPill>
                        <HeroPill icon={<Users className="h-3.5 w-3.5" />}>
                          {course.classmates.length} học viên
                        </HeroPill>
                      </div>

                      <div className="mt-6 flex flex-wrap items-center gap-4">
                        <button className="group inline-flex items-center gap-2 rounded-2xl bg-background px-5 py-3 text-sm font-semibold text-foreground shadow-elevated transition hover:scale-[1.02]">
                          <Play className="h-4 w-4 fill-foreground" />
                          {course.progress > 0 ? "Tiếp tục học" : "Bắt đầu học"}
                        </button>
                        <div className="min-w-[200px] flex-1">
                          <div className="flex items-center justify-between text-xs text-background/70">
                            <span>{doneActivities}/{totalActivities} hoạt động</span>
                            <span className="font-semibold text-background">{course.progress}%</span>
                          </div>
                          <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-white/15">
                            <div
                              className="h-full rounded-full"
                              style={{
                                width: `${course.progress}%`,
                                background: `linear-gradient(90deg, oklch(0.85 0.18 ${level.hue}), oklch(0.92 0.15 ${(level.hue + 60) % 360}))`,
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="relative">
                      <div
                        className="relative aspect-[4/3] overflow-hidden rounded-3xl ring-1 ring-white/15"
                        style={{
                          background: `linear-gradient(135deg, oklch(0.6 0.22 ${level.hue}), oklch(0.45 0.22 ${(level.hue + 60) % 360}))`,
                        }}
                      >
                        <div className="absolute inset-0 opacity-40 mix-blend-overlay [background-image:radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.4),transparent_40%),radial-gradient(circle_at_70%_80%,rgba(255,255,255,0.2),transparent_40%)]" />
                        <div className="absolute inset-0 flex flex-col justify-between p-6 text-background">
                          <div className="flex items-start justify-between">
                            <span className="rounded-full bg-white/15 px-2.5 py-1 text-[10px] font-bold backdrop-blur">
                              {level.code}
                            </span>
                            <GraduationCap className="h-7 w-7 opacity-80" />
                          </div>
                          <div>
                            <div className="font-display text-5xl font-bold tracking-tight">
                              EMPOWER
                            </div>
                            <div className="mt-1 text-xs uppercase tracking-[0.2em] opacity-80">
                              Cambridge • Online Access
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="absolute -bottom-4 -left-4 rounded-2xl bg-background px-4 py-3 shadow-elevated ring-1 ring-border">
                        <div className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                          Điểm TB
                        </div>
                        <div className="text-xl font-bold text-foreground">86<span className="text-xs text-muted-foreground">/100</span></div>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              {/* TABS */}
              <div className="sticky top-[4.25rem] z-20 -mx-1 px-1">
                <div className="flex gap-1 overflow-x-auto rounded-2xl bg-surface/80 p-1.5 ring-1 ring-border shadow-soft backdrop-blur">
                  <Tab active={tab === "overview"} onClick={() => setTab("overview")} icon={<BookOpen className="h-4 w-4" />}>
                    Khoá học
                  </Tab>
                  {isTeacher && (
                    <Tab active={tab === "members"} onClick={() => setTab("members")} icon={<Users className="h-4 w-4" />}>
                      Thành viên lớp học
                    </Tab>
                  )}
                  <Tab active={tab === "scores"} onClick={() => setTab("scores")} icon={<Trophy className="h-4 w-4" />}>
                    Điểm số
                  </Tab>
                  <Tab active={tab === "activities"} onClick={() => setTab("activities")} icon={<ClipboardList className="h-4 w-4" />}>
                    Các hoạt động
                  </Tab>
                  <Tab active={tab === "competence"} onClick={() => setTab("competence")} icon={<Sparkles className="h-4 w-4" />}>
                    Năng lực
                  </Tab>
                </div>
              </div>

              {tab === "overview" && (
                <OverviewView course={course} hue={level.hue} totalMinutes={totalMinutes} activeUnit={activeUnit} />
              )}
              {tab === "members" && <MembersView course={course} hideScores />}
              {tab === "scores" && <ScoresView course={course} hue={level.hue} />}
              {tab === "activities" && (
                <ActivitiesView course={course} hue={level.hue} onQuizClick={setQuizOpen} />
              )}
              {tab === "competence" && <CompetenceView />}
            </>
          )}
        </main>
      </div>
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
      <button
        onClick={onToggle}
        className="flex w-full items-center gap-2 px-3 py-2.5 text-left"
      >
        <div
          className="h-2 w-2 shrink-0 rounded-full"
          style={{ background: `oklch(0.6 0.18 ${hue})` }}
        />
        <span className="flex-1 truncate text-sm font-semibold text-foreground">{title}</span>
        {progress !== undefined && (
          <span className="text-[10px] font-semibold text-muted-foreground">{progress}%</span>
        )}
        <ChevronDown
          className={cn("h-4 w-4 text-muted-foreground transition-transform", open && "rotate-180")}
        />
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
        active
          ? "bg-foreground text-background shadow-soft"
          : "text-muted-foreground hover:bg-muted hover:text-foreground",
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
  course: ReturnType<typeof getCourse> extends infer T
    ? T extends { course: infer C }
      ? C
      : never
    : never;
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
      {/* intro section */}
      <div>
        <div className="mb-3 flex items-end justify-between">
          <div>
            <h2 className="font-display text-xl font-semibold text-foreground">Hướng dẫn</h2>
            <p className="text-sm text-muted-foreground">
              Phòng Lab hoạt động tốt nhất trên trình duyệt Chrome.
            </p>
          </div>
          <span className="text-xs text-muted-foreground">
            ~{Math.round(totalMinutes / 60)}h nội dung
          </span>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {introCards.map((c, i) => (
            <IntroCard key={i} {...c} />
          ))}
        </div>
      </div>

      {/* roadmap teaser */}
      <div className="rounded-3xl bg-surface p-6 ring-1 ring-border shadow-soft">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h3 className="font-display text-lg font-semibold text-foreground">Lộ trình units</h3>
            <p className="text-sm text-muted-foreground">
              Hoàn thành tuần tự để mở khoá nội dung tiếp theo.
            </p>
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
                        style={{
                          width: `${pct}%`,
                          background: `oklch(0.6 0.18 ${hue})`,
                        }}
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
  course: ReturnType<typeof getCourse> extends infer T
    ? T extends { course: infer C }
      ? C
      : never
    : never;
  hue: number;
  onQuizClick: (a: Activity) => void;
}) {
  return (
    <div className="space-y-5">
      {course.units.map((u) => (
        <div key={u.id} className="rounded-3xl bg-surface p-5 ring-1 ring-border shadow-soft">
          <div className="mb-3 flex items-center gap-3">
            <div
              className="flex h-10 w-10 items-center justify-center rounded-xl text-sm font-bold text-white"
              style={{ background: `linear-gradient(135deg, oklch(0.55 0.18 ${hue}), oklch(0.7 0.18 ${(hue + 40) % 360}))` }}
            >
              {u.index}
            </div>
            <div>
              <div className="text-sm font-semibold text-foreground">{u.title}</div>
              <div className="text-xs text-muted-foreground">{u.description}</div>
            </div>
          </div>
          <div className="grid gap-2 sm:grid-cols-2">
            {u.activities.map((a) => {
              const isQuiz = a.type === "quiz";
              const Wrapper: any = isQuiz ? "button" : "div";
              return (
                <Wrapper
                  key={a.id}
                  onClick={isQuiz ? () => onQuizClick(a) : undefined}
                  className={cn(
                    "flex items-center gap-3 rounded-2xl bg-surface-2 p-3 text-left ring-1 ring-border/60 transition",
                    isQuiz && "hover:bg-primary/5 hover:ring-primary/40 cursor-pointer",
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

/* =========== Competence View =========== */

function CompetenceView() {
  const skills = [
    { name: "Listening", value: 82, hue: 200 },
    { name: "Speaking", value: 74, hue: 280 },
    { name: "Reading", value: 88, hue: 155 },
    { name: "Writing", value: 70, hue: 25 },
    { name: "Vocabulary", value: 85, hue: 320 },
    { name: "Grammar", value: 78, hue: 250 },
  ];
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {skills.map((s) => (
        <div key={s.name} className="rounded-3xl bg-surface p-5 ring-1 ring-border shadow-soft">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-foreground">{s.name}</span>
            <span className="text-xl font-bold" style={{ color: `oklch(0.55 0.18 ${s.hue})` }}>
              {s.value}
            </span>
          </div>
          <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full"
              style={{
                width: `${s.value}%`,
                background: `linear-gradient(90deg, oklch(0.55 0.2 ${s.hue}), oklch(0.7 0.18 ${(s.hue + 40) % 360}))`,
              }}
            />
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            Mức độ thành thạo dựa trên đánh giá của giáo viên & bài kiểm tra.
          </p>
        </div>
      ))}
    </div>
  );
}

function MembersView({
  course,
  hideScores,
}: {
  course: ReturnType<typeof getCourse> extends infer T
    ? T extends { course: infer C }
      ? C
      : never
    : never;
  hideScores?: boolean;
}) {
  const unitKeys = Object.keys(course.classmates[0].scores);
  return (
    <div className="overflow-hidden rounded-3xl bg-surface ring-1 ring-border shadow-soft">
      <div className="flex items-center justify-between border-b border-border p-5">
        <div>
          <h3 className="text-base font-semibold text-foreground">
            {hideScores ? "Thành viên trong lớp" : "Bảng điểm chi tiết"}
          </h3>
          <p className="text-xs text-muted-foreground">
            {course.classmates.length} học viên • Lớp {course.level}-01
          </p>
        </div>
        <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
          Lớp {course.level}-01
        </span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-surface-2 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              <th className="px-5 py-3">Học viên</th>
              {!hideScores &&
                unitKeys.map((k) => (
                  <th key={k} className="px-3 py-3 text-center">
                    {k.toUpperCase()}
                  </th>
                ))}
              {!hideScores && <th className="px-5 py-3 text-right">TB</th>}
              {hideScores && <th className="px-5 py-3 text-right">Vai trò</th>}
            </tr>
          </thead>
          <tbody>
            {course.classmates.map((m, i) => {
              const scores = unitKeys.map((k) => m.scores[k]);
              const avg = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
              return (
                <tr key={i} className="border-t border-border/60 hover:bg-muted/30">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-primary/80 to-chart-5/80 text-xs font-semibold text-primary-foreground">
                        {m.name.split(" ").slice(-1)[0][0]}
                      </div>
                      <div>
                        <div className="font-medium text-foreground">{m.name}</div>
                        <div className="text-xs text-muted-foreground">Học viên</div>
                      </div>
                    </div>
                  </td>
                  {!hideScores &&
                    scores.map((s, j) => (
                      <td key={j} className="px-3 py-3 text-center">
                        <ScoreBadge score={s} />
                      </td>
                    ))}
                  {!hideScores && (
                    <td className="px-5 py-3 text-right">
                      <span className="font-semibold text-foreground">{avg}</span>
                      <span className="text-xs text-muted-foreground">/100</span>
                    </td>
                  )}
                  {hideScores && (
                    <td className="px-5 py-3 text-right text-xs text-muted-foreground">
                      Học viên
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ScoreBadge({ score }: { score: number }) {
  const tone =
    score >= 90
      ? "bg-success/15 text-success-foreground"
      : score >= 75
        ? "bg-info/15 text-info-foreground"
        : score >= 60
          ? "bg-warning/15 text-warning-foreground"
          : "bg-destructive/15 text-destructive";
  return (
    <span className={cn("inline-flex min-w-[2.5rem] justify-center rounded-lg px-2 py-1 text-xs font-semibold", tone)}>
      {score}
    </span>
  );
}

/* =========== Personal Gradebook =========== */

type GradeRow = {
  id: string;
  title: string;
  category: string;
  weight: number; // percent of total
  maxScore: number;
  score: number | null; // null = chưa có điểm
  passThreshold: number; // percent of max
};

function buildGradeRows(course: {
  units: Unit[];
}): GradeRow[] {
  const rows: GradeRow[] = [];
  const unitWeight = 60 / course.units.length; // units chiếm 60%
  course.units.forEach((u) => {
    rows.push({
      id: `${u.id}-quiz`,
      title: `${u.title} — Quiz`,
      category: "Unit Quiz",
      weight: +unitWeight.toFixed(1),
      maxScore: 100,
      score: u.score ?? null,
      passThreshold: 60,
    });
  });
  rows.push({
    id: "midterm",
    title: "Bài kiểm tra giữa kỳ",
    category: "Midterm",
    weight: 15,
    maxScore: 100,
    score: 82,
    passThreshold: 70,
  });
  rows.push({
    id: "speaking",
    title: "Đánh giá Speaking",
    category: "Performance",
    weight: 10,
    maxScore: 100,
    score: 88,
    passThreshold: 65,
  });
  rows.push({
    id: "final",
    title: "Bài kiểm tra cuối khoá",
    category: "Final Exam",
    weight: 15,
    maxScore: 100,
    score: null,
    passThreshold: 70,
  });
  return rows;
}

function ratingFor(percent: number): { label: string; tone: string } {
  if (percent >= 90) return { label: "Xuất sắc", tone: "bg-success/15 text-success-foreground" };
  if (percent >= 80) return { label: "Giỏi", tone: "bg-info/15 text-info-foreground" };
  if (percent >= 70) return { label: "Khá", tone: "bg-primary/10 text-primary" };
  if (percent >= 60) return { label: "Trung bình", tone: "bg-warning/15 text-warning-foreground" };
  return { label: "Chưa đạt", tone: "bg-destructive/15 text-destructive" };
}

function ScoresView({
  course,
  hue,
}: {
  course: ReturnType<typeof getCourse> extends infer T
    ? T extends { course: infer C }
      ? C
      : never
    : never;
  hue: number;
}) {
  const rows = buildGradeRows(course);
  const totalWeight = rows.reduce((a, r) => a + r.weight, 0);
  const totalContribution = rows.reduce((a, r) => {
    if (r.score === null) return a;
    return a + (r.score / r.maxScore) * r.weight;
  }, 0);
  const completedWeight = rows
    .filter((r) => r.score !== null)
    .reduce((a, r) => a + r.weight, 0);
  const currentAvg = completedWeight > 0 ? (totalContribution / completedWeight) * 100 : 0;

  return (
    <div className="space-y-5">
      {/* Tổng quan cá nhân */}
      <div className="grid gap-4 sm:grid-cols-3">
        <SummaryStat
          label="Tổng điểm hiện tại"
          value={`${totalContribution.toFixed(1)}`}
          suffix={`/${totalWeight}`}
          hue={hue}
          hint={`Đã hoàn thành ${completedWeight.toFixed(0)}% trọng số`}
        />
        <SummaryStat
          label="Điểm trung bình"
          value={`${currentAvg.toFixed(1)}`}
          suffix="/100"
          hue={(hue + 50) % 360}
          hint="Tính trên các bài đã có điểm"
        />
        <SummaryStat
          label="Bài đã hoàn thành"
          value={`${rows.filter((r) => r.score !== null).length}`}
          suffix={`/${rows.length}`}
          hue={(hue + 100) % 360}
          hint={`${rows.filter((r) => r.score === null).length} bài chưa có điểm`}
        />
      </div>

      <div className="overflow-hidden rounded-3xl bg-surface ring-1 ring-border shadow-soft">
        <div className="flex items-center justify-between border-b border-border p-5">
          <div>
            <h3 className="text-base font-semibold text-foreground">Bảng điểm cá nhân</h3>
            <p className="text-xs text-muted-foreground">
              Chi tiết các bài học có tính điểm trong khoá {course.title}.
            </p>
          </div>
          <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
            Tổng trọng số {totalWeight}%
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-surface-2 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                <th className="px-5 py-3">Bài học</th>
                <th className="px-3 py-3 text-center">Trọng số</th>
                <th className="px-3 py-3 text-center">Kết quả</th>
                <th className="px-3 py-3 text-center">Điểm tối đa</th>
                <th className="px-3 py-3 text-center">Tỷ lệ đạt</th>
                <th className="px-3 py-3 text-center">Đánh giá</th>
                <th className="px-5 py-3 text-right">Đóng góp tổng điểm</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => {
                const hasScore = r.score !== null;
                const percent = hasScore ? (r.score! / r.maxScore) * 100 : 0;
                const contribution = hasScore ? (percent / 100) * r.weight : 0;
                const rating = hasScore ? ratingFor(percent) : null;
                return (
                  <tr key={r.id} className="border-t border-border/60 hover:bg-muted/30">
                    <td className="px-5 py-3">
                      <div className="font-medium text-foreground">{r.title}</div>
                      <div className="text-xs text-muted-foreground">{r.category}</div>
                    </td>
                    <td className="px-3 py-3 text-center">
                      <span className="inline-flex items-center rounded-lg bg-muted px-2 py-1 text-xs font-semibold text-foreground">
                        {r.weight}%
                      </span>
                    </td>
                    <td className="px-3 py-3 text-center">
                      {hasScore ? (
                        <ScoreBadge score={r.score!} />
                      ) : (
                        <span className="text-xs text-muted-foreground">Chưa có</span>
                      )}
                    </td>
                    <td className="px-3 py-3 text-center text-foreground">{r.maxScore}</td>
                    <td className="px-3 py-3">
                      {hasScore ? (
                        <div className="flex items-center justify-center gap-2">
                          <div className="h-1.5 w-20 overflow-hidden rounded-full bg-muted">
                            <div
                              className="h-full rounded-full"
                              style={{
                                width: `${Math.min(100, percent)}%`,
                                background: `linear-gradient(90deg, oklch(0.6 0.18 ${hue}), oklch(0.7 0.18 ${(hue + 40) % 360}))`,
                              }}
                            />
                          </div>
                          <span className="text-xs font-semibold text-foreground">
                            {percent.toFixed(0)}%
                          </span>
                        </div>
                      ) : (
                        <div className="text-center text-xs text-muted-foreground">—</div>
                      )}
                    </td>
                    <td className="px-3 py-3 text-center">
                      {rating ? (
                        <span
                          className={cn(
                            "inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold",
                            rating.tone,
                          )}
                        >
                          {rating.label}
                        </span>
                      ) : (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
                    </td>
                    <td className="px-5 py-3 text-right">
                      {hasScore ? (
                        <div>
                          <div className="font-semibold text-foreground">
                            {contribution.toFixed(2)}
                          </div>
                          <div className="text-[11px] text-muted-foreground">
                            / {r.weight} điểm
                          </div>
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr className="border-t-2 border-border bg-surface-2">
                <td className="px-5 py-3 text-sm font-semibold text-foreground" colSpan={6}>
                  Tổng điểm tích luỹ
                </td>
                <td className="px-5 py-3 text-right">
                  <div className="text-base font-bold text-foreground">
                    {totalContribution.toFixed(2)}
                    <span className="text-xs font-normal text-muted-foreground">
                      {" "}/ {totalWeight}
                    </span>
                  </div>
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
}

function SummaryStat({
  label,
  value,
  suffix,
  hue,
  hint,
}: {
  label: string;
  value: string;
  suffix?: string;
  hue: number;
  hint?: string;
}) {
  return (
    <div
      className="relative overflow-hidden rounded-3xl bg-surface p-5 ring-1 ring-border shadow-soft"
    >
      <div
        className="absolute -right-10 -top-10 h-32 w-32 rounded-full opacity-20 blur-2xl"
        style={{ background: `oklch(0.7 0.2 ${hue})` }}
      />
      <div className="relative">
        <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          {label}
        </div>
        <div className="mt-2 flex items-baseline gap-1">
          <span
            className="font-display text-3xl font-bold"
            style={{ color: `oklch(0.45 0.18 ${hue})` }}
          >
            {value}
          </span>
          {suffix && <span className="text-sm text-muted-foreground">{suffix}</span>}
        </div>
        {hint && <div className="mt-1.5 text-xs text-muted-foreground">{hint}</div>}
      </div>
    </div>
  );
}
