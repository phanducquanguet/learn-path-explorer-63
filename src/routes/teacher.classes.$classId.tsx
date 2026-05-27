import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
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
import { TopNav } from "@/components/TopNav";
import { classes, students, type TeacherStudent } from "@/lib/teacher-data";
import { levels, type Course } from "@/lib/lms-data";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  ArrowLeft,
  BookOpen,
  Calendar,
  Clock,
  Crown,
  HandHelping,
  MapPin,
  Search,
  TrendingUp,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils";

/* ---------- Sub-skill định nghĩa (đồng bộ màn năng lực học viên) ---------- */
const SUB_SKILLS: Record<"listening" | "reading" | "writing" | "speaking", string[]> = {
  listening: ["Listening for Gist", "Listening for Details", "Recognizing Attitude", "Connected Speech"],
  reading: ["Skimming", "Scanning", "Inference", "Lexical Context"],
  writing: ["Task Achievement", "Coherence", "Lexical Range", "Grammar Accuracy"],
  speaking: ["Vocabulary", "Pronunciation", "Grammar", "Fluency"],
};
const SKILL_LABEL: Record<string, string> = {
  listening: "Nghe",
  reading: "Đọc",
  writing: "Viết",
  speaking: "Nói",
};

function hashSeed(...parts: string[]) {
  let h = 2166136261;
  for (const p of parts) {
    for (let i = 0; i < p.length; i++) {
      h ^= p.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
  }
  return Math.abs(h);
}
function jitter(seed: number, base: number, spread = 14) {
  return Math.max(0, Math.min(100, Math.round(base + ((seed % 1000) / 1000 - 0.5) * spread * 2)));
}
function getStudentCourseProgress(student: TeacherStudent, courseId: string) {
  const base =
    student.scoresByUnit.reduce((a, x) => a + x.score, 0) /
    Math.max(1, student.scoresByUnit.length);
  return jitter(hashSeed(student.id, courseId), base - 8, 24);
}
function getSubSkills(student: TeacherStudent) {
  return (Object.keys(SUB_SKILLS) as (keyof typeof SUB_SKILLS)[]).map((k) => ({
    key: k,
    label: SKILL_LABEL[k],
    score: student.skills[k],
    subs: SUB_SKILLS[k].map((name) => ({
      name,
      score: jitter(hashSeed(student.id, k, name), student.skills[k], 16),
    })),
  }));
}

export const Route = createFileRoute("/teacher/classes/$classId")({
  head: ({ params }) => ({
    meta: [{ title: `Lớp ${params.classId} — UNICOM LMS` }],
  }),
  loader: ({ params }) => {
    const cls = classes.find((c) => c.id === params.classId);
    if (!cls) throw notFound();
    return { cls };
  },
  component: ClassDetailPage,
  notFoundComponent: () => (
    <div className="min-h-screen bg-background">
      <TopNav />
      <div className="mx-auto max-w-3xl px-6 py-20 text-center">
        <h1 className="font-display text-2xl font-semibold">Không tìm thấy lớp học</h1>
        <Link to="/teacher/classes" className="mt-4 inline-flex text-sm text-primary underline">
          ← Quay lại danh sách lớp
        </Link>
      </div>
    </div>
  ),
});

const TABS = [
  { id: "overview", label: "Tổng quan" },
  { id: "courses", label: "Khóa học" },
  { id: "members", label: "Thành viên" },
  { id: "reports", label: "Báo cáo học tập" },
] as const;
type TabId = (typeof TABS)[number]["id"];

function ClassDetailPage() {
  const { cls } = Route.useLoaderData();
  const [tab, setTab] = useState<TabId>("overview");
  const [picked, setPicked] = useState<TeacherStudent | null>(null);
  const [pickedCourse, setPickedCourse] = useState<Course | null>(null);


  const members = useMemo(
    () => students.filter((s) => s.classId === cls.id),
    [cls.id],
  );
  const courses = useMemo(() => {
    const lv = levels.find((l) => l.code === cls.levelCode);
    return lv?.courses ?? [];
  }, [cls.levelCode]);

  const isPrimary = cls.role === "primary";

  return (
    <div className="min-h-screen bg-background">
      <TopNav />
      <div className="mx-auto max-w-7xl px-6 pb-20 pt-8 sm:px-8">
        <Link
          to="/teacher/classes"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground transition hover:text-foreground"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Quay lại danh sách lớp
        </Link>

        {/* Header */}
        <div className="mt-4 flex flex-col gap-4 rounded-3xl border border-border bg-surface p-6 shadow-soft sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-md bg-primary/10 px-2 py-0.5 text-[10px] font-bold uppercase text-primary">
                {cls.levelCode}
              </span>
              <span
                className={cn(
                  "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold",
                  isPrimary
                    ? "bg-amber-500/10 text-amber-700"
                    : "bg-sky-500/10 text-sky-700",
                )}
              >
                {isPrimary ? <Crown className="h-3 w-3" /> : <HandHelping className="h-3 w-3" />}
                {isPrimary ? "Giáo viên chính" : "Trợ giảng"}
              </span>
            </div>
            <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight text-foreground">
              {cls.name}
            </h1>
            <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5" /> {cls.schedule}
              </span>
              {cls.room && (
                <span className="inline-flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5" /> {cls.room}
                </span>
              )}
              {cls.startedAt && (
                <span className="inline-flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5" /> Khai giảng {cls.startedAt}
                </span>
              )}
            </div>
          </div>
          <div className="grid grid-cols-4 gap-2">
            <KPI label="Sĩ số" value={members.length || cls.studentCount} icon={<Users className="h-3.5 w-3.5" />} />
            <KPI label="Tiến độ" value={`${cls.avgProgress}%`} />
            <KPI label="Điểm TB" value={cls.avgScore} />
            <KPI label="Tham gia" value={`${cls.attendance}%`} icon={<TrendingUp className="h-3.5 w-3.5" />} />
          </div>
        </div>

        {/* Tabs */}
        <div className="mt-6 flex flex-wrap items-center gap-1 rounded-xl border border-border bg-surface p-1 text-sm">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={cn(
                "rounded-lg px-4 py-2 font-medium transition",
                tab === t.id
                  ? "bg-foreground text-background"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="mt-6">
          {tab === "overview" && (
            <OverviewTab cls={cls} members={members} courses={courses} onPickCourse={setPickedCourse} />
          )}
          {tab === "courses" && <CoursesTab courses={courses} onPickCourse={setPickedCourse} />}
          {tab === "members" && <MembersTab members={members} onPickStudent={setPicked} />}
          {tab === "reports" && (
            <ReportsTab members={members} courses={courses} onPickStudent={setPicked} />
          )}
        </div>
      </div>
      <StudentDetailDialog
        student={picked}
        courses={courses}
        open={picked !== null}
        onOpenChange={(v) => !v && setPicked(null)}
      />
      <CourseDetailDialog
        course={pickedCourse}
        members={members}
        open={pickedCourse !== null}
        onOpenChange={(v) => !v && setPickedCourse(null)}
        onPickStudent={(s) => {
          setPickedCourse(null);
          setPicked(s);
        }}
      />

    </div>
  );
}

function KPI({ label, value, icon }: { label: string; value: string | number; icon?: React.ReactNode }) {
  return (
    <div className="rounded-xl bg-muted/40 px-3 py-2 text-center">
      <div className="text-lg font-bold text-foreground">{value}</div>
      <div className="inline-flex items-center gap-1 text-[10px] uppercase tracking-wider text-muted-foreground">
        {icon}
        {label}
      </div>
    </div>
  );
}

/* ----------------------------- Overview ----------------------------- */
function OverviewTab({
  cls,
  members,
  courses,
  onPickCourse,
}: {
  cls: (typeof classes)[number];
  members: TeacherStudent[];
  courses: Course[];
  onPickCourse: (c: Course) => void;
}) {
  // Phân loại học viên theo mức độ hoạt động (dựa trên điểm TB)
  const engagement = useMemo(() => {
    const buckets = [
      { label: "Tích cực", min: 80, count: 0 },
      { label: "Ổn định", min: 60, count: 0 },
      { label: "Cần nhắc nhở", min: 30, count: 0 },
      { label: "Ít hoạt động", min: 0, count: 0 },
    ];
    for (const s of members) {
      const avg =
        s.scoresByUnit.reduce((a, x) => a + x.score, 0) / Math.max(1, s.scoresByUnit.length);
      const b = buckets.find((b) => avg >= b.min)!;
      b.count++;
    }
    return buckets;
  }, [members]);


  const top = [...members]
    .map((s) => ({
      ...s,
      avg:
        s.scoresByUnit.reduce((acc, x) => acc + x.score, 0) /
        Math.max(1, s.scoresByUnit.length),
    }))
    .sort((a, b) => b.avg - a.avg)
    .slice(0, 5);

  // Tiến độ TB lớp theo từng khóa học
  const courseProgress = useMemo(
    () =>
      courses.map((c) => {
        const avg =
          members.reduce((a, s) => a + getStudentCourseProgress(s, c.id), 0) /
          Math.max(1, members.length);
        return { name: c.title, progress: Math.round(avg) };
      }),
    [courses, members],
  );

  return (
    <div className="grid gap-4 lg:grid-cols-3">
      <div className="rounded-2xl border border-border bg-surface p-5 shadow-soft lg:col-span-2">
        <div className="mb-3 flex items-center justify-between">
          <div className="text-sm font-semibold">Tiến độ trung bình của lớp theo khóa học</div>
          <span className="text-[11px] text-muted-foreground">{courses.length} khóa</span>
        </div>
        <div className="h-64 w-full">
          {courseProgress.length === 0 ? (
            <div className="grid h-full place-items-center text-sm text-muted-foreground">
              Chưa có khóa học gắn với lớp.
            </div>
          ) : (
            <ResponsiveContainer>
              <BarChart data={courseProgress} layout="vertical" margin={{ left: 8 }}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} horizontal={false} />
                <XAxis type="number" domain={[0, 100]} fontSize={11} unit="%" />
                <YAxis type="category" dataKey="name" fontSize={11} width={150} />
                <Tooltip formatter={(v: number) => `${v}%`} />
                <Bar dataKey="progress" radius={[0, 6, 6, 0]} fill="oklch(0.55 0.18 260)" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>


      <div className="rounded-2xl border border-border bg-surface p-5 shadow-soft">
        <div className="mb-3 text-sm font-semibold">Top học viên</div>
        <ul className="space-y-2">
          {top.map((s, i) => (
            <li
              key={s.id}
              className="flex items-center justify-between rounded-xl bg-muted/40 px-3 py-2"
            >
              <div className="flex items-center gap-2">
                <div className="grid h-7 w-7 place-items-center rounded-full bg-foreground text-[11px] font-bold text-background">
                  {i + 1}
                </div>
                <div className="text-sm font-medium">{s.name}</div>
              </div>
              <div className="text-sm font-bold text-primary">{Math.round(s.avg)}</div>
            </li>
          ))}
        </ul>
        <div className="mt-4 border-t border-border pt-3">
          <div className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            Mức độ hoạt động
          </div>
          <ul className="space-y-1.5">
            {engagement.map((b) => {
              const pct = members.length ? Math.round((b.count / members.length) * 100) : 0;
              const color =
                b.label === "Tích cực"
                  ? "bg-emerald-500"
                  : b.label === "Ổn định"
                    ? "bg-sky-500"
                    : b.label === "Cần nhắc nhở"
                      ? "bg-amber-500"
                      : "bg-rose-500";
              return (
                <li key={b.label} className="flex items-center gap-2 text-xs">
                  <span className="w-24 text-muted-foreground">{b.label}</span>
                  <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
                    <div className={cn("h-full", color)} style={{ width: `${pct}%` }} />
                  </div>
                  <span className="w-8 text-right font-semibold">{b.count}</span>
                </li>
              );
            })}
          </ul>
        </div>
      </div>


      <div className="rounded-2xl border border-border bg-surface p-5 shadow-soft lg:col-span-3">
        <div className="mb-3 flex items-center justify-between">
          <div className="text-sm font-semibold">Khóa học đang gắn với lớp</div>
          <span className="text-xs text-muted-foreground">{courses.length} khóa</span>
        </div>
        {courses.length === 0 ? (
          <p className="text-sm text-muted-foreground">Chưa có khóa học nào ở cấp độ {cls.levelCode}.</p>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {courses.map((c) => (
              <CourseMiniCard key={c.id} course={c} onPick={onPickCourse} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* ----------------------------- Courses tab ----------------------------- */
function CoursesTab({ courses }: { courses: Course[] }) {
  if (courses.length === 0) {
    return (
      <div className="rounded-3xl border border-dashed border-border bg-surface/40 p-12 text-center">
        <BookOpen className="mx-auto mb-3 h-8 w-8 text-muted-foreground" />
        <p className="text-sm font-medium">Chưa có khóa học nào ở cấp độ này.</p>
        <Link
          to="/teacher/upload"
          className="mt-3 inline-flex items-center gap-1.5 rounded-xl bg-foreground px-4 py-2 text-xs font-semibold text-background"
        >
          Tạo khóa học mới
        </Link>
      </div>
    );
  }
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {courses.map((c) => (
        <CourseMiniCard key={c.id} course={c} />
      ))}
    </div>
  );
}

function CourseMiniCard({
  course,
}: {
  course: Course;
}) {
  return (
    <Link
      to="/courses/$courseId"
      params={{ courseId: course.id }}
      className="group rounded-2xl border border-border bg-surface p-4 shadow-soft transition hover:-translate-y-0.5 hover:shadow-elevated"
    >
      <div className="flex items-center gap-2">
        <span className="rounded-md bg-primary/10 px-2 py-0.5 text-[10px] font-bold uppercase text-primary">
          {course.level}
        </span>
        <span className="text-[11px] text-muted-foreground">{course.hours} giờ</span>
      </div>
      <div className="mt-2 font-display text-base font-semibold">{course.title}</div>
      <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{course.subtitle}</p>
      <div className="mt-3">
        <div className="flex items-center justify-between text-[11px] text-muted-foreground">
          <span>Tiến độ lớp</span>
          <span className="font-medium text-foreground">{course.progress}%</span>
        </div>
        <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-muted">
          <div className="h-full bg-primary" style={{ width: `${course.progress}%` }} />
        </div>
      </div>
      <div className="mt-3 text-[11px] text-muted-foreground">{course.units.length} units</div>
    </Link>
  );
}

/* ----------------------------- Members tab ----------------------------- */
function MembersTab({
  members,
  onPickStudent,
}: {
  members: TeacherStudent[];
  onPickStudent: (s: TeacherStudent) => void;
}) {
  const [q, setQ] = useState("");
  const filtered = members.filter((m) => m.name.toLowerCase().includes(q.toLowerCase()));

  return (
    <div className="rounded-2xl border border-border bg-surface p-5 shadow-soft">
      <div className="mb-3 flex flex-col items-stretch gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="text-sm font-semibold">Thành viên ({members.length})</div>
        <div className="relative sm:w-64">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Tìm tên học viên..."
            className="h-9 w-full rounded-xl border border-border bg-background pl-9 pr-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
          />
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b text-left text-[11px] uppercase text-muted-foreground">
              <th className="px-2 py-2">Học viên</th>
              <th className="px-2 py-2">Email</th>
              <th className="px-2 py-2">Vai trò</th>
              <th className="px-2 py-2">Điểm TB</th>
              <th className="px-2 py-2">Lần truy cập</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((s) => {
              const avg = Math.round(
                s.scoresByUnit.reduce((acc, x) => acc + x.score, 0) /
                  Math.max(1, s.scoresByUnit.length),
              );
              return (
                <tr
                  key={s.id}
                  onClick={() => onPickStudent(s)}
                  className="cursor-pointer border-b last:border-0 hover:bg-muted/40"
                >
                  <td className="px-2 py-2.5">
                    <div className="flex items-center gap-2">
                      <div className="grid h-8 w-8 place-items-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                        {s.name.split(" ").slice(-1)[0].charAt(0)}
                      </div>
                      <span className="font-medium">{s.name}</span>
                    </div>
                  </td>
                  <td className="px-2 py-2.5 text-muted-foreground">{s.email}</td>
                  <td className="px-2 py-2.5">
                    <span
                      className={cn(
                        "rounded-full px-2 py-0.5 text-[10px] font-semibold",
                        s.role === "Lớp trưởng"
                          ? "bg-amber-500/10 text-amber-700"
                          : "bg-muted text-muted-foreground",
                      )}
                    >
                      {s.role}
                    </span>
                  </td>
                  <td className="px-2 py-2.5 font-semibold">{avg}</td>
                  <td className="px-2 py-2.5 text-muted-foreground">{s.lastActive}</td>
                </tr>
              );
            })}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={5} className="px-2 py-8 text-center text-sm text-muted-foreground">
                  Không tìm thấy học viên.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ----------------------------- Reports tab ----------------------------- */
function ReportsTab({
  members,
  courses,
  onPickStudent,
}: {
  members: TeacherStudent[];
  courses: Course[];
  onPickStudent: (s: TeacherStudent) => void;
}) {
  const skillAvg = useMemo(() => {
    const sum = { listening: 0, reading: 0, writing: 0, speaking: 0 };
    for (const s of members) {
      sum.listening += s.skills.listening;
      sum.reading += s.skills.reading;
      sum.writing += s.skills.writing;
      sum.speaking += s.skills.speaking;
    }
    const n = Math.max(1, members.length);
    return [
      { skill: "Nghe", value: Math.round(sum.listening / n) },
      { skill: "Đọc", value: Math.round(sum.reading / n) },
      { skill: "Viết", value: Math.round(sum.writing / n) },
      { skill: "Nói", value: Math.round(sum.speaking / n) },
    ];
  }, [members]);

  // Phân bố trình độ (Yếu/TB/Khá/Giỏi) theo từng kỹ năng — thay cho biểu đồ trung bình trùng dữ liệu radar
  const skillProficiency = useMemo(() => {
    const keys: (keyof TeacherStudent["skills"])[] = ["listening", "reading", "writing", "speaking"];
    const label: Record<string, string> = { listening: "Nghe", reading: "Đọc", writing: "Viết", speaking: "Nói" };
    return keys.map((k) => {
      const row = { skill: label[k], Yếu: 0, TB: 0, Khá: 0, Giỏi: 0 } as Record<string, number | string>;
      for (const s of members) {
        const v = s.skills[k];
        const bucket = v < 60 ? "Yếu" : v < 75 ? "TB" : v < 90 ? "Khá" : "Giỏi";
        (row[bucket] as number) = ((row[bucket] as number) ?? 0) + 1;
      }
      return row;
    });
  }, [members]);



  const distribution = useMemo(() => {
    const buckets = [
      { range: "<60", min: 0, max: 59, count: 0 },
      { range: "60-69", min: 60, max: 69, count: 0 },
      { range: "70-79", min: 70, max: 79, count: 0 },
      { range: "80-89", min: 80, max: 89, count: 0 },
      { range: "90-100", min: 90, max: 100, count: 0 },
    ];
    for (const s of members) {
      const avg =
        s.scoresByUnit.reduce((a, x) => a + x.score, 0) / Math.max(1, s.scoresByUnit.length);
      const b = buckets.find((b) => avg >= b.min && avg <= b.max);
      if (b) b.count++;
    }
    return buckets;
  }, [members]);

  // Tiến độ trung bình của lớp theo từng khóa học
  const courseProgress = useMemo(
    () =>
      courses.map((c) => {
        const avg =
          members.reduce((a, s) => a + getStudentCourseProgress(s, c.id), 0) /
          Math.max(1, members.length);
        return { name: c.title.length > 22 ? c.title.slice(0, 22) + "…" : c.title, progress: Math.round(avg) };
      }),
    [courses, members],
  );

  const COLORS = [
    "oklch(0.65 0.15 25)",
    "oklch(0.7 0.16 60)",
    "oklch(0.7 0.15 90)",
    "oklch(0.65 0.18 150)",
    "oklch(0.55 0.18 260)",
  ];

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <div className="rounded-2xl border border-border bg-surface p-5 shadow-soft">
        <div className="mb-3 text-sm font-semibold">Tiến độ TB theo khóa học</div>
        <div className="h-64">
          {courseProgress.length === 0 ? (
            <div className="grid h-full place-items-center text-sm text-muted-foreground">
              Chưa có khóa học.
            </div>
          ) : (
            <ResponsiveContainer>
              <BarChart data={courseProgress} layout="vertical" margin={{ left: 8 }}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} horizontal={false} />
                <XAxis type="number" domain={[0, 100]} fontSize={11} unit="%" />
                <YAxis type="category" dataKey="name" fontSize={11} width={140} />
                <Tooltip formatter={(v: number) => `${v}%`} />
                <Bar dataKey="progress" radius={[0, 6, 6, 0]} fill="oklch(0.55 0.18 260)" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-surface p-5 shadow-soft">
        <div className="mb-3 text-sm font-semibold">Phân bố 4 kỹ năng</div>
        <div className="h-64">
          <ResponsiveContainer>
            <RadarChart data={skillAvg}>
              <PolarGrid />
              <PolarAngleAxis dataKey="skill" fontSize={11} />
              <Radar
                dataKey="value"
                stroke="oklch(0.55 0.18 260)"
                fill="oklch(0.55 0.18 260)"
                fillOpacity={0.4}
              />
              <Tooltip />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-surface p-5 shadow-soft">
        <div className="mb-3 text-sm font-semibold">Phân phối điểm TB học viên</div>
        <div className="h-64">
          <ResponsiveContainer>
            <BarChart data={distribution}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
              <XAxis dataKey="range" fontSize={11} />
              <YAxis fontSize={11} allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                {distribution.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-surface p-5 shadow-soft">
        <div className="mb-1 text-sm font-semibold">Phân bố trình độ theo từng kỹ năng</div>
        <div className="mb-3 text-[11px] text-muted-foreground">
          Số học viên ở mỗi mức Yếu / TB / Khá / Giỏi — giúp xác định kỹ năng cần ưu tiên phụ đạo.
        </div>
        <div className="h-64">
          <ResponsiveContainer>
            <BarChart data={skillProficiency} stackOffset="expand">
              <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
              <XAxis dataKey="skill" fontSize={11} />
              <YAxis fontSize={11} tickFormatter={(v: number) => `${Math.round(v * 100)}%`} />
              <Tooltip formatter={(v: number) => `${v} HV`} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Bar dataKey="Yếu" stackId="a" fill="oklch(0.7 0.18 25)" />
              <Bar dataKey="TB" stackId="a" fill="oklch(0.78 0.14 70)" />
              <Bar dataKey="Khá" stackId="a" fill="oklch(0.72 0.14 220)" />
              <Bar dataKey="Giỏi" stackId="a" fill="oklch(0.65 0.18 150)" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-surface p-5 shadow-soft lg:col-span-2">
        <div className="mb-3 flex items-center justify-between">
          <div className="text-sm font-semibold">Tiến độ học viên theo khóa học</div>
          <span className="text-[11px] text-muted-foreground">Nhấn vào hàng để xem chi tiết</span>
        </div>
        {courses.length === 0 ? (
          <p className="text-sm text-muted-foreground">Chưa có khóa học gắn với lớp.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-[11px] uppercase text-muted-foreground">
                  <th className="px-2 py-2">Học viên</th>
                  {courses.map((c) => (
                    <th key={c.id} className="px-2 py-2 text-center">
                      {c.title}
                    </th>
                  ))}
                  <th className="px-2 py-2 text-center">TB</th>
                </tr>
              </thead>
              <tbody>
                {members.map((s) => {
                  const rowVals = courses.map((c) => getStudentCourseProgress(s, c.id));
                  const avg = Math.round(
                    rowVals.reduce((a, b) => a + b, 0) / Math.max(1, rowVals.length),
                  );
                  return (
                    <tr
                      key={s.id}
                      className="cursor-pointer border-b last:border-0 hover:bg-muted/40"
                      onClick={() => onPickStudent(s)}
                    >
                      <td className="px-2 py-2 font-medium">{s.name}</td>
                      {rowVals.map((v, i) => (
                        <td key={courses[i].id} className="px-2 py-2">
                          <div className="flex items-center gap-2">
                            <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
                              <div
                                className={cn(
                                  "h-full",
                                  v >= 80
                                    ? "bg-emerald-500"
                                    : v >= 60
                                      ? "bg-sky-500"
                                      : v >= 40
                                        ? "bg-amber-500"
                                        : "bg-rose-500",
                                )}
                                style={{ width: `${v}%` }}
                              />
                            </div>
                            <span className="w-9 text-right text-xs font-semibold tabular-nums">
                              {v}%
                            </span>
                          </div>
                        </td>
                      ))}
                      <td className="px-2 py-2 text-center font-bold text-primary">{avg}%</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

/* ----------------------------- Student Detail Dialog ----------------------------- */
function StudentDetailDialog({
  student,
  courses,
  open,
  onOpenChange,
}: {
  student: TeacherStudent | null;
  courses: Course[];
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  if (!student) return null;
  const skills = getSubSkills(student);
  const radarData = skills.map((s) => ({ skill: s.label, value: s.score }));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-3xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-display text-xl">{student.name}</DialogTitle>
          <DialogDescription>
            {student.email} • Truy cập gần nhất: {student.lastActive}
          </DialogDescription>
        </DialogHeader>

        {/* Tiến độ theo khóa */}
        <section className="mt-2">
          <div className="mb-2 text-sm font-semibold">Tiến độ theo khóa học</div>
          {courses.length === 0 ? (
            <p className="text-xs text-muted-foreground">Chưa có khóa học.</p>
          ) : (
            <div className="space-y-2">

              {courses.map((c) => {
                const p = getStudentCourseProgress(student, c.id);
                const doneUnits = Math.round((p / 100) * c.units.length);
                return (
                  <Popover key={c.id}>
                    <PopoverTrigger asChild>
                      <button
                        type="button"
                        className="w-full rounded-xl border border-border bg-muted/30 p-3 text-left transition hover:border-primary/40 hover:bg-muted/60"
                      >
                        <div className="flex items-center justify-between gap-3">
                          <div>
                            <div className="text-sm font-semibold">{c.title}</div>
                            <div className="text-[11px] text-muted-foreground">
                              {c.level} • {doneUnits}/{c.units.length} units hoàn thành • Nhấn để xem điểm
                            </div>
                          </div>
                          <div className="text-sm font-bold text-primary">{p}%</div>
                        </div>
                        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted">
                          <div
                            className={cn(
                              "h-full",
                              p >= 80
                                ? "bg-emerald-500"
                                : p >= 60
                                  ? "bg-sky-500"
                                  : p >= 40
                                    ? "bg-amber-500"
                                    : "bg-rose-500",
                            )}
                            style={{ width: `${p}%` }}
                          />
                        </div>
                      </button>
                    </PopoverTrigger>
                    <PopoverContent align="end" className="w-80 p-0">
                      <div className="border-b border-border px-4 py-3">
                        <div className="text-sm font-semibold">{c.title}</div>
                        <div className="text-[11px] text-muted-foreground">
                          Điểm chi tiết theo unit
                        </div>
                      </div>
                      <ul className="max-h-72 overflow-y-auto p-2">
                        {c.units.map((u, idx) => {
                          const isDone = idx < doneUnits;
                          const score = isDone
                            ? jitter(hashSeed(student.id, c.id, u.id), student.skills.reading, 18)
                            : null;
                          return (
                            <li
                              key={u.id}
                              className="flex items-center justify-between gap-2 rounded-lg px-2 py-1.5 text-xs hover:bg-muted/60"
                            >
                              <span className="flex-1 truncate text-foreground">
                                <span className="mr-1 font-semibold text-muted-foreground">
                                  U{u.index}.
                                </span>
                                {u.title.replace(/^Unit \d+: /, "")}
                              </span>
                              {score === null ? (
                                <span className="rounded-md bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground">
                                  Chưa làm
                                </span>
                              ) : (
                                <span
                                  className={cn(
                                    "rounded-md px-1.5 py-0.5 text-[11px] font-semibold tabular-nums",
                                    score >= 90
                                      ? "bg-emerald-500/10 text-emerald-700"
                                      : score >= 75
                                        ? "bg-sky-500/10 text-sky-700"
                                        : score >= 60
                                          ? "bg-amber-500/10 text-amber-700"
                                          : "bg-rose-500/10 text-rose-700",
                                  )}
                                >
                                  {score}
                                </span>
                              )}
                            </li>
                          );
                        })}
                      </ul>
                    </PopoverContent>
                  </Popover>

                );
              })}
            </div>

          )}
        </section>

        {/* Năng lực */}
        <section className="mt-5">
          <div className="mb-2 text-sm font-semibold">Năng lực 4 kỹ năng</div>
          <div className="grid gap-4 sm:grid-cols-[220px_1fr]">
            <div className="h-48">
              <ResponsiveContainer>
                <RadarChart data={radarData}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="skill" fontSize={11} />
                  <Radar
                    dataKey="value"
                    stroke="oklch(0.55 0.18 260)"
                    fill="oklch(0.55 0.18 260)"
                    fillOpacity={0.4}
                  />
                  <Tooltip />
                </RadarChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-3">
              {skills.map((s) => (
                <div key={s.key} className="rounded-xl border border-border bg-muted/30 p-3">
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-semibold">{s.label}</div>
                    <div className="text-xs font-bold text-primary">{s.score}</div>
                  </div>
                  <ul className="mt-2 grid gap-1.5 sm:grid-cols-2">
                    {s.subs.map((sub) => (
                      <li key={sub.name} className="flex items-center gap-2 text-[11px]">
                        <span className="flex-1 truncate text-muted-foreground">{sub.name}</span>
                        <div className="h-1 w-16 overflow-hidden rounded-full bg-muted">
                          <div
                            className={cn(
                              "h-full",
                              sub.score >= 75
                                ? "bg-emerald-500"
                                : sub.score >= 60
                                  ? "bg-sky-500"
                                  : sub.score >= 45
                                    ? "bg-amber-500"
                                    : "bg-rose-500",
                            )}
                            style={{ width: `${sub.score}%` }}
                          />
                        </div>
                        <span className="w-7 text-right tabular-nums font-semibold">
                          {sub.score}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </section>
      </DialogContent>
    </Dialog>
  );
}
