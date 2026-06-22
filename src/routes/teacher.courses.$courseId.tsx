import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  PolarAngleAxis,
  PolarGrid,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  ArrowLeft,
  BookOpen,
  ChevronRight,
  Clock,
  ExternalLink,
  GraduationCap,
  Layers,
  Pencil,
  Search,
  TrendingUp,
  Trophy,
  UserCheck,
  Users,
  MessageSquare,
} from "lucide-react";
import { TopNav } from "@/components/TopNav";
import { getCourse, levels, type Course, type Level } from "@/lib/lms-data";
import { classes, students, type TeacherStudent } from "@/lib/teacher-data";
import { cn } from "@/lib/utils";
import { CourseContentViewer } from "@/components/CourseContentViewer";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

export const Route = createFileRoute("/teacher/courses/$courseId")({
  head: ({ params }) => ({
    meta: [{ title: `Quản trị khóa ${params.courseId} — UNICOM LMS` }],
  }),
  component: TeacherCourseDetailPage,
});

type DraftMeta = {
  visibility?: "system" | "classes";
  classIds?: string[];
};

function nodeKindToActivityType(kind?: string): "video" | "reading" | "quiz" | "speaking" | "writing" {
  switch (kind) {
    case "video":
      return "video";
    case "video-speaking":
      return "speaking";
    case "pdf":
    case "pdf-audio":
    case "scorm":
    case "h5p":
      return "reading";
    case "practice":
    case "group":
      return "quiz";
    default:
      return "reading";
  }
}

function loadDraftCourse(courseId: string): { course: Course; level: Level; draft: DraftMeta } | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem("unicom.uploaded.courses");
    if (!raw) return null;
    const drafts = JSON.parse(raw) as Array<Record<string, unknown>>;
    const d = drafts.find((x) => x.id === courseId);
    if (!d) return null;
    const lv =
      levels.find((l) => l.code === (d.levelCode as string)) ?? levels[0];
    const rawUnits = (d.units as Array<Record<string, unknown>>) ?? [];
    const synthCourse: Course = {
      id: courseId,
      title: (d.title as string) || "Khóa học chưa đặt tên",
      subtitle: (d.subtitle as string) || "",
      level: lv.code,
      hours: (d.hours as number) ?? 0,
      progress: 0,
      units: rawUnits.map((u, i) => {
        const nodes = (u.nodes as Array<Record<string, unknown>>) ?? [];
        return {
          id: (u.id as string) || `u${i + 1}`,
          index: i + 1,
          title: (u.title as string) || `Unit ${i + 1}`,
          description: (u.desc as string) || "",
          activities: nodes
            .filter((n) => (n.kind as string) !== "question")
            .map((n, j) => ({
              id: (n.id as string) || `${u.id}-a${j + 1}`,
              title: (n.title as string) || "Hoạt động",
              type: nodeKindToActivityType(n.kind as string),
              duration: (n.duration as number) ?? 10,
            })),
        };
      }),
      classmates: [],
    };
    return {
      course: synthCourse,
      level: lv,
      draft: {
        visibility: d.visibility as DraftMeta["visibility"],
        classIds: (d.classIds as string[]) ?? [],
      },
    };
  } catch {
    return null;
  }
}

const SKILL_LABEL: Record<string, string> = {
  listening: "Nghe",
  reading: "Đọc",
  writing: "Viết",
  speaking: "Nói",
};
const SUB_SKILLS: Record<keyof TeacherStudent["skills"], string[]> = {
  listening: ["Listening for Gist", "Listening for Details", "Recognizing Attitude", "Connected Speech"],
  reading: ["Skimming", "Scanning", "Inference", "Lexical Context"],
  writing: ["Task Achievement", "Coherence", "Lexical Range", "Grammar Accuracy"],
  speaking: ["Vocabulary", "Pronunciation", "Grammar", "Fluency"],
};

function hashSeed(...parts: string[]) {
  let h = 2166136261;
  for (const p of parts) {
    for (let i = 0; i < p.length; i++) h = (h ^ p.charCodeAt(i)) * 16777619;
  }
  return Math.abs(h >>> 0);
}

type TabKey = "content" | "students" | "scores" | "competence";

function TeacherCourseDetailPage() {
  const { courseId } = Route.useParams();
  const systemData = getCourse(courseId);
  const [draftData, setDraftData] = useState<ReturnType<typeof loadDraftCourse>>(null);
  const [draftLoaded, setDraftLoaded] = useState(false);

  useEffect(() => {
    if (systemData) {
      setDraftLoaded(true);
      return;
    }
    setDraftData(loadDraftCourse(courseId));
    setDraftLoaded(true);
  }, [courseId, systemData]);

  const data = systemData ?? draftData;
  const isTeacherDraft = !systemData && !!draftData;
  const draftMeta = draftData?.draft;

  const fallbackLevelCode = data?.level.code ?? "A1";
  const courseClasses = useMemo(() => {
    if (!data) return [];
    if (!isTeacherDraft) return classes.filter((c) => c.levelCode === data.level.code);
    if (draftMeta?.visibility === "system")
      return classes.filter((c) => c.levelCode === data.level.code);
    return classes.filter((c) => (draftMeta?.classIds ?? []).includes(c.id));
  }, [data, isTeacherDraft, draftMeta, fallbackLevelCode]);
  const courseStudents = useMemo(
    () => students.filter((s) => courseClasses.some((c) => c.id === s.classId)),
    [courseClasses],
  );


  const [tab, setTab] = useState<TabKey>("content");
  const [picked, setPicked] = useState<TeacherStudent | null>(null);
  const [classFilter, setClassFilter] = useState<string>("all");

  const filteredStudents = useMemo(
    () =>
      classFilter === "all"
        ? courseStudents
        : courseStudents.filter((s) => s.classId === classFilter),
    [courseStudents, classFilter],
  );

  const avgScore = courseStudents.length
    ? Math.round(
        courseStudents.reduce(
          (sum, s) => sum + s.scoresByUnit.reduce((a, u) => a + u.score, 0) / s.scoresByUnit.length,
          0,
        ) / courseStudents.length,
      )
    : 0;
  const avgProgress = courseClasses.length
    ? Math.round(courseClasses.reduce((s, c) => s + c.avgProgress, 0) / courseClasses.length)
    : (data?.course.progress ?? 0);

  if (!data) {
    return (
      <div className="min-h-screen bg-background">
        <TopNav />
        <div className="p-10 text-center text-muted-foreground">
          {draftLoaded ? "Không tìm thấy khóa học." : "Đang tải…"}
        </div>
      </div>
    );
  }
  const { course, level } = data;

  return (
    <div className="min-h-screen bg-background">
      <TopNav />
      <div className="mx-auto max-w-7xl px-6 pb-20 pt-8 sm:px-8">

        {/* Breadcrumb */}
        <Link
          to="/teacher/courses"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Khóa học của tôi
        </Link>

        {/* Header */}
        <div className="mt-3 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              <span
                className="inline-flex h-5 items-center rounded-md px-2 text-white"
                style={{
                  background: `linear-gradient(135deg, oklch(0.55 0.2 ${level.hue}), oklch(0.7 0.18 ${(level.hue + 40) % 360}))`,
                }}
              >
                {level.code}
              </span>
              <span>
                {course.units.length} units • {course.hours}h
              </span>
              {isTeacherDraft && (
                <span className="inline-flex h-5 items-center gap-1 rounded-md bg-foreground/90 px-2 text-white">
                  <UserCheck className="h-3 w-3" /> Tự tạo
                </span>
              )}
            </div>
            <h1 className="mt-1 font-display text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
              {course.title}
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">{course.subtitle}</p>
          </div>
          <div className="flex flex-wrap items-center gap-2 self-start">
            {isTeacherDraft && (
              <Link
                to="/teacher/upload"
                search={{ edit: course.id }}
                className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-border bg-surface px-3 text-xs font-semibold text-foreground hover:bg-muted"
              >
                <Pencil className="h-3.5 w-3.5" /> Chỉnh sửa
              </Link>
            )}
            <Link
              to="/teacher/qa"
              search={{ courseId: course.id }}
              className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-border bg-surface px-3 text-xs font-semibold text-foreground hover:bg-muted"
            >
              <MessageSquare className="h-3.5 w-3.5" /> Hỏi đáp học viên
            </Link>

          </div>
        </div>

        {/* KPIs */}
        <div className="mt-6 grid gap-3 sm:grid-cols-4">
          <Kpi icon={Layers} label="Lớp đang dạy" value={courseClasses.length} />
          <Kpi icon={Users} label="Học viên" value={courseStudents.length} />
          <Kpi icon={TrendingUp} label="Tiến độ TB" value={`${avgProgress}%`} tone="primary" />
          <Kpi icon={Trophy} label="Điểm TB" value={avgScore || "—"} tone="emerald" />
        </div>

        {/* Tabs */}
        <div className="mt-8 flex items-center gap-1 rounded-xl border border-border bg-surface p-1 text-xs sm:text-sm">
          {(
            [
              { id: "content", label: "Nội dung khóa", icon: BookOpen },
              { id: "students", label: "Học viên", icon: Users },
              { id: "scores", label: "Điểm số", icon: Trophy },
              { id: "competence", label: "Năng lực", icon: GraduationCap },
            ] as { id: TabKey; label: string; icon: typeof BookOpen }[]
          ).map((t) => {
            const Icon = t.icon;
            return (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={cn(
                  "inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg px-3 py-2 font-medium transition",
                  tab === t.id
                    ? "bg-foreground text-background"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                <Icon className="h-3.5 w-3.5" /> {t.label}
              </button>
            );
          })}
        </div>

        <div className="mt-6">
          {tab === "content" && (
            <CourseContentViewer
              course={course}
              level={level}
              classesSummary={courseClasses.map((c) => ({
                id: c.id,
                name: c.name,
                studentCount: c.studentCount,
                avgProgress: c.avgProgress,
                avgScore: c.avgScore,
                attendance: c.attendance,
                schedule: c.schedule,
                role: c.role,
              }))}
            />
          )}
          {tab === "students" && (
            <StudentsTab
              students={filteredStudents}
              classFilter={classFilter}
              setClassFilter={setClassFilter}
              classOptions={courseClasses.map((c) => ({ id: c.id, name: c.name }))}
              onPick={setPicked}
            />
          )}
          {tab === "scores" && (
            <ScoresTab
              students={courseStudents}
              classOptions={courseClasses}
              onPick={setPicked}
            />
          )}
          {tab === "competence" && (
            <CompetenceTab
              students={courseStudents}
              classOptions={courseClasses}
              onPick={setPicked}
            />
          )}
        </div>
      </div>

      <StudentDialog
        student={picked}
        onClose={() => setPicked(null)}
        courseTitle={course.title}
      />
    </div>
  );
}

function Kpi({
  icon: Icon,
  label,
  value,
  tone,
}: {
  icon: typeof BookOpen;
  label: string;
  value: number | string;
  tone?: "primary" | "emerald";
}) {
  return (
    <div className="rounded-2xl border border-border bg-surface p-4 shadow-soft">
      <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
        <Icon className="h-3.5 w-3.5" /> {label}
      </div>
      <div
        className={cn(
          "mt-2 font-display text-2xl font-semibold text-foreground",
          tone === "primary" && "text-primary",
          tone === "emerald" && "text-emerald-600",
        )}
      >
        {value}
      </div>
    </div>
  );
}


/* --------------- Students Tab --------------- */
function StudentsTab({
  students,
  classFilter,
  setClassFilter,
  classOptions,
  onPick,
}: {
  students: TeacherStudent[];
  classFilter: string;
  setClassFilter: (v: string) => void;
  classOptions: { id: string; name: string }[];
  onPick: (s: TeacherStudent) => void;
}) {
  const [q, setQ] = useState("");
  const filtered = students.filter((s) => s.name.toLowerCase().includes(q.toLowerCase()));
  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Tìm học viên..."
            className="h-9 w-full rounded-xl border border-border bg-background pl-9 pr-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
          />
        </div>
        <select
          value={classFilter}
          onChange={(e) => setClassFilter(e.target.value)}
          className="h-9 rounded-xl border border-border bg-background px-3 text-xs font-medium outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
        >
          <option value="all">Tất cả lớp ({classOptions.length})</option>
          {classOptions.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      <div className="overflow-hidden rounded-2xl border border-border bg-surface shadow-soft">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-xs uppercase tracking-wider text-muted-foreground">
            <tr>
              <th className="px-4 py-2.5 text-left font-medium">Học viên</th>
              <th className="px-4 py-2.5 text-left font-medium">Lớp</th>
              <th className="px-4 py-2.5 text-right font-medium">Điểm TB</th>
              <th className="px-4 py-2.5 text-right font-medium">Hoạt động</th>
              <th className="px-4 py-2.5 text-right font-medium">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((s) => {
              const cls = classOptions.find((c) => c.id === s.classId);
              const avg = Math.round(
                s.scoresByUnit.reduce((a, u) => a + u.score, 0) / s.scoresByUnit.length,
              );
              return (
                <tr
                  key={s.id}
                  className="border-t border-border transition hover:bg-muted/30"
                >
                  <td className="px-4 py-2.5">
                    <div className="font-medium text-foreground">{s.name}</div>
                    <div className="text-[11px] text-muted-foreground">{s.email}</div>
                  </td>
                  <td className="px-4 py-2.5 text-xs text-muted-foreground">
                    {cls?.name ?? "—"}
                  </td>
                  <td className="px-4 py-2.5 text-right">
                    <span className={cn("font-semibold", scoreColor(avg))}>{avg}</span>
                  </td>
                  <td className="px-4 py-2.5 text-right text-xs text-muted-foreground">
                    {s.lastActive}
                  </td>
                  <td className="px-4 py-2.5 text-right">
                    <button
                      onClick={() => onPick(s)}
                      className="inline-flex items-center gap-1 rounded-lg border border-border bg-background px-2.5 py-1 text-xs font-medium hover:border-primary hover:text-primary"
                    >
                      Chi tiết <ChevronRight className="h-3 w-3" />
                    </button>
                  </td>
                </tr>
              );
            })}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-10 text-center text-sm text-muted-foreground">
                  Không có học viên phù hợp.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* --------------- Scores Tab --------------- */
function ScoresTab({
  students,
  classOptions,
  onPick,
}: {
  students: TeacherStudent[];
  classOptions: { id: string; name: string }[];
  onPick: (s: TeacherStudent) => void;
}) {
  // Average score per class
  const perClass = classOptions.map((c) => {
    const inCls = students.filter((s) => s.classId === c.id);
    const avg = inCls.length
      ? Math.round(
          inCls.reduce(
            (sum, s) =>
              sum + s.scoresByUnit.reduce((a, u) => a + u.score, 0) / s.scoresByUnit.length,
            0,
          ) / inCls.length,
        )
      : 0;
    return { name: c.name.replace(/^[A-Z0-9]+ — /, ""), avg, count: inCls.length };
  });

  // Score distribution
  const buckets = [
    { range: "<60", min: 0, max: 59, count: 0 },
    { range: "60–74", min: 60, max: 74, count: 0 },
    { range: "75–89", min: 75, max: 89, count: 0 },
    { range: "≥90", min: 90, max: 100, count: 0 },
  ];
  students.forEach((s) => {
    const avg = s.scoresByUnit.reduce((a, u) => a + u.score, 0) / s.scoresByUnit.length;
    const b = buckets.find((x) => avg >= x.min && avg <= x.max);
    if (b) b.count += 1;
  });

  return (
    <div className="space-y-4">
      <div className="grid gap-4 lg:grid-cols-2">
        <ChartCard title="Điểm trung bình theo lớp" subtitle="So sánh hiệu quả giữa các lớp">
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={perClass}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} />
              <Tooltip />
              <Bar dataKey="avg" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Phân bố điểm trung bình học viên" subtitle="Toàn bộ học viên đang học khóa này">
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={buckets}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
              <XAxis dataKey="range" tick={{ fontSize: 11 }} />
              <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
              <Tooltip />
              <Bar dataKey="count" fill="#10b981" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Per-class breakdown */}
      {classOptions.map((c) => {
        const inCls = students.filter((s) => s.classId === c.id);
        if (!inCls.length) return null;
        return (
          <div
            key={c.id}
            className="overflow-hidden rounded-2xl border border-border bg-surface shadow-soft"
          >
            <div className="flex items-center justify-between bg-muted/30 px-4 py-2.5">
              <div className="text-sm font-semibold text-foreground">{c.name}</div>
              <div className="text-xs text-muted-foreground">{inCls.length} học viên</div>
            </div>
            <table className="w-full text-sm">
              <thead className="bg-muted/20 text-xs uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="px-4 py-2 text-left font-medium">Học viên</th>
                  {inCls[0].scoresByUnit.map((u) => (
                    <th key={u.unit} className="px-2 py-2 text-center font-medium">
                      {u.unit}
                    </th>
                  ))}
                  <th className="px-4 py-2 text-right font-medium">TB</th>
                </tr>
              </thead>
              <tbody>
                {inCls.map((s) => {
                  const avg = Math.round(
                    s.scoresByUnit.reduce((a, u) => a + u.score, 0) / s.scoresByUnit.length,
                  );
                  return (
                    <tr key={s.id} className="border-t border-border hover:bg-muted/20">
                      <td className="px-4 py-2">
                        <button
                          onClick={() => onPick(s)}
                          className="text-left text-sm font-medium text-foreground hover:text-primary"
                        >
                          {s.name}
                        </button>
                      </td>
                      {s.scoresByUnit.map((u) => (
                        <td
                          key={u.unit}
                          className={cn(
                            "px-2 py-2 text-center text-xs font-semibold",
                            scoreColor(u.score),
                          )}
                        >
                          {u.score}
                        </td>
                      ))}
                      <td className={cn("px-4 py-2 text-right text-sm font-semibold", scoreColor(avg))}>
                        {avg}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        );
      })}
    </div>
  );
}

/* --------------- Competence Tab --------------- */
function CompetenceTab({
  students,
  classOptions,
  onPick,
}: {
  students: TeacherStudent[];
  classOptions: { id: string; name: string }[];
  onPick: (s: TeacherStudent) => void;
}) {
  // Average skill per class (radar)
  const skillKeys: (keyof TeacherStudent["skills"])[] = [
    "listening",
    "reading",
    "writing",
    "speaking",
  ];

  const radarData = skillKeys.map((k) => {
    const row: Record<string, string | number> = { skill: SKILL_LABEL[k] };
    classOptions.forEach((c) => {
      const inCls = students.filter((s) => s.classId === c.id);
      const avg = inCls.length
        ? Math.round(inCls.reduce((s, st) => s + st.skills[k], 0) / inCls.length)
        : 0;
      row[c.name] = avg;
    });
    return row;
  });

  const palette = ["#3b82f6", "#10b981", "#f59e0b", "#ec4899", "#8b5cf6"];

  return (
    <div className="space-y-4">
      <ChartCard title="Năng lực trung bình theo lớp" subtitle="So sánh 4 kỹ năng giữa các lớp">
        <ResponsiveContainer width="100%" height={320}>
          <RadarChart data={radarData}>
            <PolarGrid />
            <PolarAngleAxis dataKey="skill" tick={{ fontSize: 12 }} />
            {classOptions.map((c, i) => (
              <Radar
                key={c.id}
                name={c.name}
                dataKey={c.name}
                stroke={palette[i % palette.length]}
                fill={palette[i % palette.length]}
                fillOpacity={0.18}
              />
            ))}
            <Legend wrapperStyle={{ fontSize: 11 }} />
            <Tooltip />
          </RadarChart>
        </ResponsiveContainer>
      </ChartCard>

      <div className="overflow-hidden rounded-2xl border border-border bg-surface shadow-soft">
        <div className="bg-muted/30 px-4 py-2.5 text-sm font-semibold text-foreground">
          Năng lực từng học viên
        </div>
        <table className="w-full text-sm">
          <thead className="bg-muted/20 text-xs uppercase tracking-wider text-muted-foreground">
            <tr>
              <th className="px-4 py-2 text-left font-medium">Học viên</th>
              <th className="px-4 py-2 text-left font-medium">Lớp</th>
              {skillKeys.map((k) => (
                <th key={k} className="px-2 py-2 text-center font-medium">
                  {SKILL_LABEL[k]}
                </th>
              ))}
              <th className="px-4 py-2 text-right font-medium">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {students.map((s) => {
              const cls = classOptions.find((c) => c.id === s.classId);
              return (
                <tr key={s.id} className="border-t border-border hover:bg-muted/20">
                  <td className="px-4 py-2 font-medium text-foreground">{s.name}</td>
                  <td className="px-4 py-2 text-xs text-muted-foreground">{cls?.name ?? "—"}</td>
                  {skillKeys.map((k) => (
                    <td
                      key={k}
                      className={cn("px-2 py-2 text-center text-xs font-semibold", scoreColor(s.skills[k]))}
                    >
                      {s.skills[k]}
                    </td>
                  ))}
                  <td className="px-4 py-2 text-right">
                    <button
                      onClick={() => onPick(s)}
                      className="inline-flex items-center gap-1 rounded-lg border border-border bg-background px-2.5 py-1 text-xs font-medium hover:border-primary hover:text-primary"
                    >
                      Tiểu kỹ năng <ChevronRight className="h-3 w-3" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* --------------- Helpers --------------- */
function ChartCard({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-border bg-surface p-4 shadow-soft">
      <div className="mb-2">
        <div className="text-sm font-semibold text-foreground">{title}</div>
        {subtitle && <div className="text-xs text-muted-foreground">{subtitle}</div>}
      </div>
      {children}
    </div>
  );
}

function scoreColor(n: number) {
  if (n >= 90) return "text-emerald-600";
  if (n >= 75) return "text-sky-600";
  if (n >= 60) return "text-amber-600";
  return "text-rose-600";
}

/* --------------- Student Dialog (sub-skills) --------------- */
function StudentDialog({
  student,
  onClose,
  courseTitle,
}: {
  student: TeacherStudent | null;
  onClose: () => void;
  courseTitle: string;
}) {
  const skillKeys: (keyof TeacherStudent["skills"])[] = [
    "listening",
    "reading",
    "writing",
    "speaking",
  ];
  return (
    <Dialog open={!!student} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-2xl">
        {student && (
          <>
            <DialogHeader>
              <DialogTitle>{student.name}</DialogTitle>
              <DialogDescription>
                {courseTitle} • {student.email}
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-3 sm:grid-cols-2">
              {skillKeys.map((k) => {
                const base = student.skills[k];
                const subs = SUB_SKILLS[k].map((label, i) => {
                  const seed = hashSeed(student.id, k, String(i));
                  const delta = (seed % 21) - 10; // -10..10
                  return { label, score: Math.max(40, Math.min(100, base + delta)) };
                });
                return (
                  <div
                    key={k}
                    className="rounded-xl border border-border bg-background p-3"
                  >
                    <div className="flex items-center justify-between">
                      <div className="text-sm font-semibold text-foreground">
                        {SKILL_LABEL[k]}
                      </div>
                      <div className={cn("text-sm font-semibold", scoreColor(base))}>
                        {base}
                      </div>
                    </div>
                    <ul className="mt-2 space-y-1">
                      {subs.map((sub) => (
                        <li
                          key={sub.label}
                          className="flex items-center justify-between text-xs"
                        >
                          <span className="text-muted-foreground">{sub.label}</span>
                          <span className={cn("font-semibold", scoreColor(sub.score))}>
                            {sub.score}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              })}
            </div>

            <div className="rounded-xl border border-border bg-background p-3">
              <div className="mb-2 text-sm font-semibold text-foreground">
                Điểm theo unit
              </div>
              <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
                {student.scoresByUnit.map((u) => (
                  <div
                    key={u.unit}
                    className="rounded-lg bg-surface p-2 text-center ring-1 ring-border"
                  >
                    <div className="text-[10px] text-muted-foreground">{u.unit}</div>
                    <div className={cn("text-sm font-semibold", scoreColor(u.score))}>
                      {u.score}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
