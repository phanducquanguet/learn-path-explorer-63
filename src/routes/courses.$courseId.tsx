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
  Eye,
  FileText,
  Headphones,
  Mic,
  PanelLeftClose,
  PanelLeftOpen,
  PenLine,
  PlayCircle,
  Play,
  Plus,
  Pencil,
  Trash2,
  Sparkles,
  Trophy,
  Users,
  GraduationCap,
  MessageSquare,
  Send,
  Lightbulb,
  ArrowRight,
  TrendingUp,
  StickyNote,
} from "lucide-react";
import { getCourse, type Activity, type Unit } from "@/lib/lms-data";
import { cn } from "@/lib/utils";
import { QuizPanel } from "@/components/QuizPanel";
import { ReadingPanel } from "@/components/ReadingPanel";
import { VideoPanel } from "@/components/VideoPanel";
import { SpeakingPanel } from "@/components/SpeakingPanel";
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

type TabKey = "overview" | "members" | "scores" | "activities" | "competence" | "notes" | "qa";

function CoursePage() {
  const { courseId } = Route.useParams();
  const { role } = useRole();
  const realIsStaff = role !== "student";
  const realIsAdmin = role === "admin";
  const data = getCourse(courseId);
  if (!data) throw notFound();
  const { course: baseCourse, level } = data;

  // Local mutable copy so teacher can add/edit/delete (mock, not persisted)
  const [course, setCourse] = useState(baseCourse);
  const [editMode, setEditMode] = useState(false);
  const [previewAsStudent, setPreviewAsStudent] = useState(realIsAdmin);
  // When previewing as student, override staff/admin flags so the UI mirrors the learner experience
  const isStaff = realIsStaff && !previewAsStudent;
  const isAdmin = realIsAdmin && !previewAsStudent;

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

  // ----- Teacher edit helpers -----
  const addUnit = () => {
    const idx = course.units.length + 1;
    const newUnit: Unit = {
      id: `${course.id}-u-new-${Date.now()}`,
      index: idx,
      title: `Unit ${idx}: New Unit`,
      description: "Mô tả unit mới",
      activities: [],
    };
    setCourse({ ...course, units: [...course.units, newUnit] });
  };
  const updateUnit = (id: string, patch: Partial<Unit>) =>
    setCourse({
      ...course,
      units: course.units.map((u) => (u.id === id ? { ...u, ...patch } : u)),
    });
  const removeUnit = (id: string) =>
    setCourse({ ...course, units: course.units.filter((u) => u.id !== id) });
  const addActivity = (unitId: string, type: Activity["type"]) => {
    const a: Activity = {
      id: `act-${Date.now()}`,
      title: type === "video" ? "Video mới" : type === "reading" ? "Tài liệu mới" : "Quiz mới",
      type,
      duration: 10,
    };
    updateUnit(unitId, {
      activities: [
        ...(course.units.find((u) => u.id === unitId)?.activities ?? []),
        a,
      ],
    });
  };
  const updateActivity = (unitId: string, id: string, patch: Partial<Activity>) => {
    const u = course.units.find((x) => x.id === unitId);
    if (!u) return;
    updateUnit(unitId, {
      activities: u.activities.map((a) => (a.id === id ? { ...a, ...patch } : a)),
    });
  };
  const removeActivity = (unitId: string, id: string) => {
    const u = course.units.find((x) => x.id === unitId);
    if (!u) return;
    updateUnit(unitId, { activities: u.activities.filter((a) => a.id !== id) });
  };

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
            {isStaff ? (
              <Link
                to="/courses"
                className="inline-flex items-center gap-1.5 rounded-xl px-2.5 py-1.5 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                <ArrowLeft className="h-4 w-4" /> Trở lại danh sách khóa học
              </Link>
            ) : (
              <Link
                to="/levels/$level"
                params={{ level: level.code.toLowerCase() }}
                className="inline-flex items-center gap-1.5 rounded-xl px-2.5 py-1.5 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                <ArrowLeft className="h-4 w-4" /> Trở lại {level.code}
              </Link>
            )}
            <span className="hidden text-muted-foreground/50 md:inline">/</span>
            <div className="hidden md:block">
              <div className="text-xs text-muted-foreground">Khoá học</div>
              <div className="text-sm font-semibold text-foreground">{course.title}</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {realIsAdmin && (
              <button
                onClick={() => {
                  setPreviewAsStudent((v) => {
                    const next = !v;
                    if (next) setEditMode(false);
                    return next;
                  });
                }}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-semibold transition",
                  previewAsStudent
                    ? "bg-primary text-primary-foreground hover:opacity-90"
                    : "border border-border bg-surface text-foreground hover:bg-muted",
                )}
                title="Xem khoá học dưới góc nhìn học viên"
              >
                <Eye className="h-3.5 w-3.5" />
                {previewAsStudent ? "Đang xem như học viên" : "Xem như học viên"}
              </button>
            )}
            {isAdmin && (
              <button
                onClick={() => setEditMode((v) => !v)}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-semibold transition",
                  editMode
                    ? "bg-amber-500 text-white hover:bg-amber-600"
                    : "border border-border bg-surface text-foreground hover:bg-muted",
                )}
              >
                <Pencil className="h-3.5 w-3.5" />
                {editMode ? "Đang chỉnh sửa" : "Chỉnh sửa khóa học"}
              </button>
            )}
            {!isStaff && (
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
            )}
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

      {realIsAdmin && previewAsStudent && (
        <div className="border-b border-primary/30 bg-primary/10">
          <div className="mx-auto flex max-w-[1500px] items-center justify-between gap-3 px-4 py-2.5 sm:px-6 lg:px-8">
            <div className="flex items-center gap-2 text-sm">
              <Eye className="h-4 w-4 text-primary" />
              <span className="font-semibold text-primary">Bạn đang xem khóa học dưới góc nhìn học viên</span>
              <span className="hidden text-muted-foreground sm:inline">— mọi thao tác chỉnh sửa của admin đã bị ẩn.</span>
            </div>
            <button
              onClick={() => setPreviewAsStudent(false)}
              className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground hover:opacity-90"
            >
              Thoát chế độ xem
            </button>
          </div>
        </div>
      )}


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
                    {(() => {
                      const learning = u.activities.filter(
                        (a) => a.type === "video" || a.type === "reading",
                      );
                      const practice = u.activities.filter(
                        (a) => a.type !== "video" && a.type !== "reading",
                      );
                      const renderLeaf = (a: Activity) => (
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
                      );
                      return (
                        <>
                          {learning.length > 0 && (
                            <>
                              <div className="px-2 pb-1 pt-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                                Học tập
                              </div>
                              {learning.map(renderLeaf)}
                            </>
                          )}
                          {practice.length > 0 && (
                            <>
                              <div className="px-2 pb-1 pt-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                                Luyện tập
                              </div>
                              {practice.map(renderLeaf)}
                            </>
                          )}
                        </>
                      );
                    })()}
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
                  {isAdmin && (
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
                  <Tab active={tab === "notes"} onClick={() => setTab("notes")} icon={<StickyNote className="h-4 w-4" />}>
                    Ghi chú
                  </Tab>
                  <Tab active={tab === "qa"} onClick={() => setTab("qa")} icon={<MessageSquare className="h-4 w-4" />}>
                    Hỏi đáp
                  </Tab>
                </div>
              </div>

              {tab === "overview" && (
                <OverviewView course={course} hue={level.hue} totalMinutes={totalMinutes} activeUnit={activeUnit} />
              )}
              {tab === "members" && <MembersView course={course} hideScores />}
              {tab === "scores" && <ScoresView course={course} hue={level.hue} />}
              {tab === "activities" && (
                <ActivitiesView
                  course={course}
                  hue={level.hue}
                  onQuizClick={setQuizOpen}
                  editMode={isAdmin && editMode}
                  onAddUnit={addUnit}
                  onUpdateUnit={updateUnit}
                  onRemoveUnit={removeUnit}
                  onAddActivity={addActivity}
                  onUpdateActivity={updateActivity}
                  onRemoveActivity={removeActivity}
                />
              )}
              {tab === "competence" && <CompetenceView />}
              {tab === "notes" && <CourseNotesView course={course} hue={level.hue} />}
              {tab === "qa" && <CourseQAView course={course} role={role} />}
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
            <h3 className="font-display text-lg font-semibold text-foreground">Lộ trình</h3>
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
  editMode = false,
  onAddUnit,
  onUpdateUnit,
  onRemoveUnit,
  onAddActivity,
  onUpdateActivity,
  onRemoveActivity,
}: {
  course: ReturnType<typeof getCourse> extends infer T
    ? T extends { course: infer C }
      ? C
      : never
    : never;
  hue: number;
  onQuizClick: (a: Activity) => void;
  editMode?: boolean;
  onAddUnit?: () => void;
  onUpdateUnit?: (id: string, patch: Partial<Unit>) => void;
  onRemoveUnit?: (id: string) => void;
  onAddActivity?: (unitId: string, type: Activity["type"]) => void;
  onUpdateActivity?: (unitId: string, id: string, patch: Partial<Activity>) => void;
  onRemoveActivity?: (unitId: string, id: string) => void;
}) {
  const renderActivity = (u: Unit, a: Activity) => {
    const isQuiz = a.type === "quiz";
    const interactive = isQuiz && !editMode;
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
          {editMode ? (
            <>
              <input
                value={a.title}
                onChange={(e) => onUpdateActivity?.(u.id, a.id, { title: e.target.value })}
                className="w-full rounded-md border border-border bg-background px-2 py-0.5 text-sm font-medium text-foreground outline-none focus:border-primary"
              />
              <div className="mt-1 flex items-center gap-1.5 text-[11px] text-muted-foreground">
                <span>{labelType(a.type)} •</span>
                <input
                  type="number"
                  value={a.duration}
                  onChange={(e) =>
                    onUpdateActivity?.(u.id, a.id, { duration: Number(e.target.value) })
                  }
                  className="w-14 rounded border border-border bg-background px-1 py-0 text-[11px]"
                />
                <span>phút</span>
              </div>
            </>
          ) : (
            <>
              <div className="truncate text-sm font-medium text-foreground">{a.title}</div>
              <div className="text-[11px] text-muted-foreground">
                {labelType(a.type)} • {a.duration} phút
                {isQuiz && " • Không giới hạn lượt"}
              </div>
            </>
          )}
        </div>
        {editMode ? (
          <button
            onClick={() => onRemoveActivity?.(u.id, a.id)}
            className="rounded-lg p-2 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
            title="Xóa"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        ) : isQuiz ? (
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
  };

  const groups: {
    key: string;
    label: string;
    description: string;
    icon: React.ReactNode;
    tone: string;
    ring: string;
    addTypes: Activity["type"][];
    filter: (a: Activity) => boolean;
  }[] = [
    {
      key: "learning",
      label: "Học tập",
      description: "Video bài giảng và tài liệu đọc theo từng unit.",
      icon: <BookOpen className="h-5 w-5" />,
      tone: "bg-primary/10 text-primary",
      ring: "ring-primary/20",
      addTypes: ["video", "reading"],
      filter: (a) => a.type === "video" || a.type === "reading",
    },
    {
      key: "practice",
      label: "Luyện tập",
      description: "Quiz, viết và nói để củng cố kiến thức đã học.",
      icon: <Sparkles className="h-5 w-5" />,
      tone: "bg-amber-500/15 text-amber-600",
      ring: "ring-amber-500/20",
      addTypes: ["quiz", "writing", "speaking"],
      filter: (a) => a.type !== "video" && a.type !== "reading",
    },
  ];

  return (
    <div className="space-y-6">
      {editMode && (
        <div className="rounded-2xl border border-amber-500/30 bg-amber-500/5 px-4 py-3 text-xs font-medium text-amber-800">
          ✎ Chế độ chỉnh sửa: bạn có thể thêm/sửa/xóa unit và activity. Thay đổi sẽ áp dụng cho toàn bộ học viên đang theo khóa này.
        </div>
      )}

      {groups.map((g) => {
        const allItems = course.units.flatMap((u) => u.activities.filter(g.filter));
        const totalDone = allItems.filter((a) => a.done).length;
        return (
          <section
            key={g.key}
            className={cn("rounded-3xl bg-surface p-5 ring-1 shadow-soft sm:p-6", g.ring)}
          >
            <header className="mb-5 flex items-center gap-3">
              <span
                className={cn(
                  "inline-flex h-11 w-11 items-center justify-center rounded-2xl",
                  g.tone,
                )}
              >
                {g.icon}
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-foreground sm:text-lg">{g.label}</h3>
                  <span className="rounded-full bg-muted px-2 py-0.5 text-[11px] font-semibold text-muted-foreground">
                    {totalDone}/{allItems.length}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">{g.description}</p>
              </div>
            </header>

            <div className="space-y-4">
              {course.units.map((u) => {
                const items = u.activities.filter(g.filter);
                if (items.length === 0 && !editMode) return null;
                const done = items.filter((a) => a.done).length;
                return (
                  <div
                    key={u.id}
                    className="rounded-2xl bg-surface-2/60 p-4 ring-1 ring-border/60"
                  >
                    <div className="mb-3 flex items-center gap-3">
                      <div
                        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-xs font-bold text-white"
                        style={{
                          background: `linear-gradient(135deg, oklch(0.55 0.18 ${hue}), oklch(0.7 0.18 ${(hue + 40) % 360}))`,
                        }}
                      >
                        {u.index}
                      </div>
                      <div className="min-w-0 flex-1">
                        {editMode && g.key === "learning" ? (
                          <input
                            value={u.title}
                            onChange={(e) => onUpdateUnit?.(u.id, { title: e.target.value })}
                            className="w-full rounded-lg border border-border bg-background px-2 py-1 text-sm font-semibold text-foreground outline-none focus:border-primary"
                          />
                        ) : (
                          <div className="truncate text-sm font-semibold text-foreground">
                            {u.title}
                          </div>
                        )}
                        {items.length > 0 && (
                          <div className="text-[11px] text-muted-foreground">
                            {done}/{items.length} hoàn thành
                          </div>
                        )}
                      </div>
                      {editMode && g.key === "learning" && (
                        <button
                          onClick={() => onRemoveUnit?.(u.id)}
                          className="rounded-lg p-2 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                          title="Xóa unit"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>

                    {items.length > 0 && (
                      <div className="grid gap-2 sm:grid-cols-2">
                        {items.map((a) => renderActivity(u, a))}
                      </div>
                    )}

                    {editMode && (
                      <div className="mt-2 flex flex-wrap gap-2">
                        {g.addTypes.map((t) => (
                          <button
                            key={t}
                            onClick={() => onAddActivity?.(u.id, t)}
                            className="inline-flex items-center gap-1 rounded-lg border border-dashed border-border bg-background px-3 py-1.5 text-xs font-medium text-muted-foreground hover:border-primary hover:text-primary"
                          >
                            <Plus className="h-3 w-3" /> {labelType(t)}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}

              {editMode && g.key === "learning" && (
                <button
                  onClick={() => onAddUnit?.()}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-dashed border-border bg-surface px-4 py-3 text-sm font-medium text-muted-foreground hover:border-primary hover:text-primary"
                >
                  <Plus className="h-4 w-4" /> Thêm Unit mới
                </button>
              )}
            </div>
          </section>
        );
      })}
    </div>
  );
}

/* =========== Competence View =========== */

type SubSkill = { name: string; value: number };
type CoreSkill = {
  key: string;
  name: string;
  value: number;
  hue: number;
  icon: React.ComponentType<{ className?: string }>;
  subs: SubSkill[];
  tips: { title: string; desc: string; cta: string }[];
};

const WEAK_THRESHOLD = 75;

function CompetenceView() {
  const cores: CoreSkill[] = [
    {
      key: "listening",
      name: "Listening",
      value: 82,
      hue: 200,
      icon: Headphones,
      subs: [
        { name: "Listening for Gist", value: 84 },
        { name: "Listening for Details", value: 70 },
        { name: "Recognizing Attitude", value: 88 },
        { name: "Connected Speech", value: 66 },
      ],
      tips: [
        {
          title: "Luyện Connected Speech 15'/ngày",
          desc: "Nghe shadowing các đoạn hội thoại tốc độ tự nhiên, tập trung vào nối âm và nuốt âm.",
          cta: "Bắt đầu bài luyện",
        },
        {
          title: "Bài tập Listening for Details",
          desc: "Làm 2 bài note-taking mỗi tuần với câu hỏi số liệu, tên riêng, thời gian.",
          cta: "Mở bộ đề",
        },
      ],
    },
    {
      key: "reading",
      name: "Reading",
      value: 88,
      hue: 155,
      icon: BookOpen,
      subs: [
        { name: "Skimming", value: 90 },
        { name: "Scanning", value: 85 },
        { name: "Inference", value: 72 },
        { name: "Lexical Context", value: 80 },
      ],
      tips: [
        {
          title: "Cải thiện Inference",
          desc: "Đọc 1 bài Op-Ed/ngày, gạch chân ý ngầm và viết lại bằng từ của bạn.",
          cta: "Mở bài đọc gợi ý",
        },
      ],
    },
    {
      key: "writing",
      name: "Writing",
      value: 70,
      hue: 25,
      icon: PenLine,
      subs: [
        { name: "Vocabulary", value: 74 },
        { name: "Grammar", value: 68 },
        { name: "Coherence", value: 70 },
      ],
      tips: [
        {
          title: "Ôn Grammar trọng tâm",
          desc: "Tập trung thì hoàn thành, mệnh đề quan hệ và liên từ — 1 mini-quiz/ngày.",
          cta: "Mở Grammar drill",
        },
        {
          title: "Viết lại theo mẫu",
          desc: "Mỗi ngày viết 1 đoạn 120 từ theo prompt và đối chiếu bài mẫu band 7.",
          cta: "Nhận prompt hôm nay",
        },
      ],
    },
    {
      key: "speaking",
      name: "Speaking",
      value: 74,
      hue: 280,
      icon: Mic,
      subs: [
        { name: "Vocabulary", value: 78 },
        { name: "Pronunciation", value: 66 },
        { name: "Grammar", value: 72 },
      ],
      tips: [
        {
          title: "Luyện Pronunciation",
          desc: "Ghi âm shadowing 5 phút/ngày, so sánh với native bằng waveform.",
          cta: "Mở phòng luyện nói",
        },
      ],
    },
  ];

  const weakSubs = cores
    .flatMap((c) =>
      c.subs
        .filter((s) => s.value < WEAK_THRESHOLD)
        .map((s) => ({ ...s, parent: c.name, hue: c.hue })),
    )
    .sort((a, b) => a.value - b.value);

  return (
    <div className="space-y-8">
      {/* GROUP 1: Core skills */}
      <section>
        <div className="mb-3 flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-primary">
            <Sparkles className="h-3.5 w-3.5" /> Nhóm 1
          </span>
          <h3 className="font-display text-lg font-semibold text-foreground">
            Các kỹ năng chính
          </h3>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {cores.map((s) => {
            const Icon = s.icon;
            return (
              <div
                key={s.key}
                className="rounded-3xl bg-surface p-5 ring-1 ring-border shadow-soft"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div
                      className="inline-flex h-9 w-9 items-center justify-center rounded-xl"
                      style={{
                        background: `oklch(0.95 0.04 ${s.hue})`,
                        color: `oklch(0.45 0.18 ${s.hue})`,
                      }}
                    >
                      <Icon className="h-4 w-4" />
                    </div>
                    <span className="text-sm font-semibold text-foreground">
                      {s.name}
                    </span>
                  </div>
                  <span
                    className="text-xl font-bold"
                    style={{ color: `oklch(0.55 0.18 ${s.hue})` }}
                  >
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
                  Tổng hợp từ kết quả bài kiểm tra và đánh giá giáo viên.
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* GROUP 2: Sub-skills */}
      <section>
        <div className="mb-3 flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-accent/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-accent-foreground">
            <TrendingUp className="h-3.5 w-3.5" /> Nhóm 2
          </span>
          <h3 className="font-display text-lg font-semibold text-foreground">
            Kỹ năng mở rộng theo từng kỹ năng chính
          </h3>
        </div>
        <div className="grid gap-4 lg:grid-cols-2">
          {cores.map((c) => {
            const Icon = c.icon;
            return (
              <div
                key={c.key}
                className="rounded-3xl bg-surface p-5 ring-1 ring-border shadow-soft"
              >
                <div className="mb-4 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div
                      className="inline-flex h-8 w-8 items-center justify-center rounded-lg"
                      style={{
                        background: `oklch(0.95 0.04 ${c.hue})`,
                        color: `oklch(0.45 0.18 ${c.hue})`,
                      }}
                    >
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="font-semibold text-foreground">{c.name}</div>
                  </div>
                  <span className="text-[11px] text-muted-foreground">
                    {c.subs.length} kỹ năng con
                  </span>
                </div>
                <div className="space-y-3">
                  {c.subs.map((s) => {
                    const weak = s.value < WEAK_THRESHOLD;
                    return (
                      <div key={s.name}>
                        <div className="mb-1 flex items-center justify-between text-xs">
                          <span className="font-medium text-foreground">
                            {s.name}
                            {weak && (
                              <span className="ml-2 rounded-md bg-destructive/10 px-1.5 py-0.5 text-[10px] font-semibold text-destructive">
                                Cần cải thiện
                              </span>
                            )}
                          </span>
                          <span
                            className="font-semibold"
                            style={{ color: `oklch(0.5 0.18 ${c.hue})` }}
                          >
                            {s.value}
                          </span>
                        </div>
                        <div className="h-2 overflow-hidden rounded-full bg-muted">
                          <div
                            className="h-full rounded-full"
                            style={{
                              width: `${s.value}%`,
                              background: weak
                                ? "linear-gradient(90deg, oklch(0.65 0.2 25), oklch(0.7 0.2 45))"
                                : `linear-gradient(90deg, oklch(0.55 0.2 ${c.hue}), oklch(0.7 0.18 ${(c.hue + 40) % 360}))`,
                            }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Improvement plan for weak skills */}
      <section>
        <div className="mb-3 flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-destructive/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-destructive">
            <Lightbulb className="h-3.5 w-3.5" /> Cần cải thiện
          </span>
          <h3 className="font-display text-lg font-semibold text-foreground">
            Lộ trình cải thiện cá nhân
          </h3>
        </div>

        {weakSubs.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-border bg-surface/50 p-10 text-center text-sm text-muted-foreground">
            Tất cả kỹ năng con đều đạt mức tốt. Tiếp tục duy trì nhé! 🎉
          </div>
        ) : (
          <div className="grid gap-4 lg:grid-cols-2">
            {cores
              .filter((c) => c.subs.some((s) => s.value < WEAK_THRESHOLD))
              .map((c) => {
                const Icon = c.icon;
                const weak = c.subs.filter((s) => s.value < WEAK_THRESHOLD);
                return (
                  <div
                    key={c.key}
                    className="rounded-3xl bg-surface p-5 ring-1 ring-border shadow-soft"
                  >
                    <div className="mb-3 flex items-center gap-2">
                      <div
                        className="inline-flex h-8 w-8 items-center justify-center rounded-lg"
                        style={{
                          background: `oklch(0.95 0.04 ${c.hue})`,
                          color: `oklch(0.45 0.18 ${c.hue})`,
                        }}
                      >
                        <Icon className="h-4 w-4" />
                      </div>
                      <div>
                        <div className="font-semibold text-foreground">{c.name}</div>
                        <div className="text-[11px] text-muted-foreground">
                          Yếu ở: {weak.map((w) => w.name).join(", ")}
                        </div>
                      </div>
                    </div>
                    <div className="space-y-2.5">
                      {c.tips.map((t, i) => (
                        <div
                          key={i}
                          className="flex items-start gap-3 rounded-2xl border border-border bg-background p-3"
                        >
                          <div className="mt-0.5 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                            <Lightbulb className="h-3.5 w-3.5" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="text-sm font-semibold text-foreground">
                              {t.title}
                            </div>
                            <p className="mt-0.5 text-xs text-muted-foreground">
                              {t.desc}
                            </p>
                            <button className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline">
                              {t.cta} <ArrowRight className="h-3 w-3" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
          </div>
        )}
      </section>
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

/* =========== Course Q&A View =========== */

import { courseQuestions as _courseQuestions, type CourseQuestion, type QAAnswer } from "@/lib/qa-data";
import { lessonNotes, type LessonNote } from "@/lib/notes-data";

type CourseShape = ReturnType<typeof getCourse> extends infer T
  ? T extends { course: infer C }
    ? C
    : never
  : never;

function CourseQAView({ course, role }: { course: CourseShape; role: "student" | "teacher" | "admin" }) {
  const courseId = course.id;
  const isStudent = role === "student";
  const initial = _courseQuestions.filter((q) => q.courseId === courseId);
  const [list, setList] = useState<CourseQuestion[]>(initial);
  const [filter, setFilter] = useState<"all" | "open" | "answered" | "mine">("all");
  const [activeId, setActiveId] = useState<string | null>(initial[0]?.id ?? null);
  const [draft, setDraft] = useState("");
  const [newQuestion, setNewQuestion] = useState("");
  const [newLessonKey, setNewLessonKey] = useState("");

  const lessonOptions = course.units.flatMap((u) =>
    u.activities.map((a) => ({
      key: `${u.id}::${a.id}`,
      label: `Unit ${u.index} — ${a.title}`,
      unitTitle: u.title,
    })),
  );

  const myName = "Bảo Châu";
  const myClass = "B1 — Fastrack";

  const filtered = list.filter((q) =>
    filter === "all"
      ? true
      : filter === "answered"
        ? q.answers.length > 0
        : filter === "open"
          ? q.answers.length === 0
          : q.studentName === myName,
  );
  const active = list.find((q) => q.id === activeId) ?? null;

  const submit = () => {
    if (!active || !draft.trim()) return;
    const a: QAAnswer = {
      id: `a-${Date.now()}`,
      authorName: role === "admin" ? "Admin UNICOM" : "Cô Mai Lan",
      authorRole: role === "admin" ? "admin" : "teacher",
      content: draft,
      answeredAt: new Date().toISOString(),
    };
    setList((prev) =>
      prev.map((q) => (q.id === active.id ? { ...q, answers: [...q.answers, a] } : q)),
    );
    setDraft("");
  };

  const askQuestion = () => {
    if (!newQuestion.trim() || !newLessonKey) return;
    const lesson = lessonOptions.find((l) => l.key === newLessonKey);
    const q: CourseQuestion = {
      id: `q-${Date.now()}`,
      courseId,
      unitTitle: lesson?.label ?? "Câu hỏi chung",
      studentName: myName,
      studentClass: myClass,
      askedAt: new Date().toISOString(),
      content: newQuestion.trim(),
      answers: [],
    };
    setList((prev) => [q, ...prev]);
    setActiveId(q.id);
    setNewQuestion("");
    setNewLessonKey("");
  };


  const filterKeys = isStudent
    ? (["all", "mine", "open", "answered"] as const)
    : (["all", "open", "answered"] as const);
  const filterLabel = (k: string) =>
    k === "all" ? "Tất cả" : k === "open" ? "Chưa trả lời" : k === "answered" ? "Đã trả lời" : "Của tôi";

  return (
    <div className="grid gap-4 lg:grid-cols-[360px_1fr]">
      <div className="rounded-3xl border border-border bg-surface p-3 shadow-soft">
        {isStudent && (
          <div className="mb-3 rounded-2xl border border-border bg-background p-3">
            <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Đặt câu hỏi mới
            </div>
            <select
              value={newLessonKey}
              onChange={(e) => setNewLessonKey(e.target.value)}
              className="mt-2 w-full rounded-xl border border-border bg-surface px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-primary/40"
            >
              <option value="">— Chọn bài học liên quan —</option>
              {lessonOptions.map((l) => (
                <option key={l.key} value={l.key}>
                  {l.label}
                </option>
              ))}
            </select>
            <textarea
              value={newQuestion}
              onChange={(e) => setNewQuestion(e.target.value)}
              rows={3}
              placeholder="Nội dung câu hỏi cho giáo viên..."
              className="mt-2 w-full rounded-xl border border-border bg-surface p-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
            <div className="mt-2 flex justify-end">
              <button
                onClick={askQuestion}
                disabled={!newQuestion.trim() || !newLessonKey}
                className="inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold text-primary-foreground shadow-soft disabled:opacity-50"
                style={{ background: "var(--gradient-brand)" }}
              >
                <Send className="h-3.5 w-3.5" /> Gửi câu hỏi
              </button>
            </div>
          </div>
        )}
        <div className="mb-2 flex gap-1 rounded-xl bg-muted/60 p-1 text-xs font-semibold">
          {filterKeys.map((k) => (
            <button
              key={k}
              onClick={() => setFilter(k)}
              className={cn(
                "flex-1 rounded-lg px-2 py-1.5 transition",
                filter === k ? "bg-background text-foreground shadow-soft" : "text-muted-foreground",
              )}
            >
              {filterLabel(k)}
            </button>
          ))}
        </div>
        <div className="space-y-1.5 max-h-[560px] overflow-y-auto">
          {filtered.map((q) => {
            const answered = q.answers.length > 0;
            return (
              <button
                key={q.id}
                onClick={() => setActiveId(q.id)}
                className={cn(
                  "w-full rounded-xl border p-3 text-left transition",
                  activeId === q.id
                    ? "border-primary/40 bg-primary/5"
                    : "border-transparent hover:bg-muted/60",
                )}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm font-semibold text-foreground line-clamp-1">
                    {q.studentName}
                  </span>
                  <span
                    className={cn(
                      "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold",
                      answered
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-amber-100 text-amber-700",
                    )}
                  >
                    {answered ? <CheckCircle2 className="h-3 w-3" /> : null}
                    {answered ? "Đã trả lời" : "Chưa trả lời"}
                  </span>
                </div>
                <div className="mt-0.5 text-[11px] text-muted-foreground">{q.unitTitle}</div>
                <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{q.content}</p>
              </button>
            );
          })}
          {filtered.length === 0 && (
            <div className="p-6 text-center text-xs text-muted-foreground">Không có câu hỏi.</div>
          )}
        </div>
      </div>

      <div className="rounded-3xl border border-border bg-surface p-6 shadow-soft">
        {!active ? (
          <div className="text-sm text-muted-foreground">Chọn một câu hỏi để xem chi tiết.</div>
        ) : (
          <>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <div className="text-sm font-semibold text-foreground">{active.studentName}</div>
                <div className="text-xs text-muted-foreground">
                  {active.studentClass} • {active.unitTitle} •{" "}
                  {new Date(active.askedAt).toLocaleString("vi-VN")}
                </div>
              </div>
            </div>
            <p className="mt-4 rounded-2xl bg-muted/50 p-4 text-sm text-foreground">
              {active.content}
            </p>

            <div className="mt-5 space-y-3">
              {active.answers.map((a) => (
                <div key={a.id} className="rounded-2xl border border-border p-4">
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-semibold text-foreground">
                      {a.authorName}{" "}
                      <span className="ml-1 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary">
                        {a.authorRole === "admin" ? "Admin" : "Giáo viên"}
                      </span>
                    </div>
                    <div className="text-[11px] text-muted-foreground">
                      {new Date(a.answeredAt).toLocaleString("vi-VN")}
                    </div>
                  </div>
                  <p className="mt-1.5 text-sm text-foreground">{a.content}</p>
                </div>
              ))}
            </div>

            {!isStudent && (
              <div className="mt-5">
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Trả lời của bạn
                </label>
                <textarea
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  rows={4}
                  placeholder="Nhập nội dung trả lời..."
                  className="mt-1.5 w-full rounded-2xl border border-border bg-background p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
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
            )}
            {isStudent && active.answers.length === 0 && (
              <div className="mt-5 rounded-2xl border border-dashed border-border p-4 text-center text-xs text-muted-foreground">
                Câu hỏi đang chờ giáo viên trả lời.
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

/* =========== Course Notes (aggregate) =========== */

function CourseNotesView({ course, hue }: { course: CourseShape; hue: number }) {
  const allNotes = lessonNotes.filter((n) => n.courseId === course.id);
  const unitIds = ["all", ...Array.from(new Set(allNotes.map((n) => n.unitId)))];
  const [unitFilter, setUnitFilter] = useState<string>("all");
  const [query, setQuery] = useState("");

  const filtered = allNotes.filter((n) => {
    if (unitFilter !== "all" && n.unitId !== unitFilter) return false;
    if (query.trim() && !n.content.toLowerCase().includes(query.trim().toLowerCase())) return false;
    return true;
  });

  const typeBadge = (t: LessonNote["activityType"]) =>
    ({ video: "Video", reading: "Đọc", quiz: "Quiz", speaking: "Nói", writing: "Viết" })[t];

  return (
    <div className="space-y-4">
      <div className="rounded-3xl border border-border bg-surface p-5 shadow-soft">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="font-display text-lg font-semibold text-foreground">
              Tổng hợp ghi chú
            </h3>
            <p className="text-xs text-muted-foreground">
              Tất cả ghi chú bạn đã lưu trong từng bài học của khoá này.
            </p>
          </div>
          <span
            className="rounded-full px-3 py-1 text-xs font-semibold text-white"
            style={{ background: `oklch(0.55 0.18 ${hue})` }}
          >
            {allNotes.length} ghi chú
          </span>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Tìm trong nội dung ghi chú..."
            className="min-w-[220px] flex-1 rounded-xl border border-border bg-background px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
          />
          <div className="flex flex-wrap gap-1.5">
            {unitIds.map((uid) => {
              const label =
                uid === "all"
                  ? "Tất cả bài"
                  : allNotes.find((n) => n.unitId === uid)?.unitTitle ?? uid;
              return (
                <button
                  key={uid}
                  onClick={() => setUnitFilter(uid)}
                  className={cn(
                    "rounded-full px-3 py-1 text-xs font-semibold transition",
                    unitFilter === uid
                      ? "bg-foreground text-background"
                      : "bg-muted text-muted-foreground hover:bg-muted/80",
                  )}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-border bg-surface p-10 text-center">
          <StickyNote className="mx-auto h-8 w-8 text-muted-foreground" />
          <p className="mt-3 text-sm font-semibold text-foreground">Chưa có ghi chú nào</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Mở một bài học bất kỳ và lưu ghi chú để xem tổng hợp tại đây.
          </p>
        </div>
      ) : (
        <div className="grid gap-3 md:grid-cols-2">
          {filtered.map((n) => (
            <div
              key={n.id}
              className="rounded-2xl border border-border bg-surface p-4 shadow-soft transition hover:shadow-elevated"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-[10px] font-semibold text-primary">
                  {typeBadge(n.activityType)}
                </span>
                <span className="text-[11px] text-muted-foreground">
                  {new Date(n.createdAt).toLocaleDateString("vi-VN")}
                </span>
              </div>
              <div className="mt-2 text-sm font-semibold text-foreground">{n.activityTitle}</div>
              <div className="text-[11px] text-muted-foreground">
                {n.unitTitle} • {n.scopeLabel}
              </div>
              <p className="mt-2 whitespace-pre-wrap text-sm text-foreground/90">{n.content}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
