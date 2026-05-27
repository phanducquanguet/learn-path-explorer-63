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
          {tab === "overview" && <OverviewTab cls={cls} members={members} courses={courses} />}
          {tab === "courses" && <CoursesTab courses={courses} />}
          {tab === "members" && <MembersTab members={members} />}
          {tab === "reports" && <ReportsTab cls={cls} members={members} />}
        </div>
      </div>
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
}: {
  cls: (typeof classes)[number];
  members: TeacherStudent[];
  courses: Course[];
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
              <CourseMiniCard key={c.id} course={c} />
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
function MembersTab({ members }: { members: TeacherStudent[] }) {
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
                <tr key={s.id} className="border-b last:border-0 hover:bg-muted/40">
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
  cls,
  members,
}: {
  cls: (typeof classes)[number];
  members: TeacherStudent[];
}) {
  const unitAverages = useMemo(() => {
    const acc: Record<string, { unit: string; total: number; count: number }> = {};
    for (const s of members) {
      for (const u of s.scoresByUnit) {
        if (!acc[u.unit]) acc[u.unit] = { unit: u.unit, total: 0, count: 0 };
        acc[u.unit].total += u.score;
        acc[u.unit].count++;
      }
    }
    return Object.values(acc).map((x) => ({
      unit: x.unit,
      score: Math.round(x.total / Math.max(1, x.count)),
    }));
  }, [members]);

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

  const days = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"];
  const weekly = cls.weeklyMinutes.map((m, i) => ({
    day: days[i],
    "Số phút": m,
    "Tham gia (%)": Math.min(100, Math.round((m / 60) * cls.attendance)),
  }));

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
        <div className="mb-3 text-sm font-semibold">Điểm TB theo Unit</div>
        <div className="h-64">
          <ResponsiveContainer>
            <BarChart data={unitAverages}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
              <XAxis dataKey="unit" fontSize={11} />
              <YAxis fontSize={11} domain={[0, 100]} />
              <Tooltip />
              <Bar dataKey="score" radius={[6, 6, 0, 0]} fill="oklch(0.55 0.18 260)" />
            </BarChart>
          </ResponsiveContainer>
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
        <div className="mb-3 text-sm font-semibold">Thời lượng học vs. tham gia (tuần)</div>
        <div className="h-64">
          <ResponsiveContainer>
            <LineChart data={weekly}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
              <XAxis dataKey="day" fontSize={11} />
              <YAxis fontSize={11} />
              <Tooltip />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Line type="monotone" dataKey="Số phút" stroke="oklch(0.55 0.18 260)" strokeWidth={2} />
              <Line
                type="monotone"
                dataKey="Tham gia (%)"
                stroke="oklch(0.65 0.18 150)"
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-surface p-5 shadow-soft lg:col-span-2">
        <div className="mb-3 text-sm font-semibold">Bảng tiến độ chi tiết theo học viên</div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-[11px] uppercase text-muted-foreground">
                <th className="px-2 py-2">Học viên</th>
                {members[0]?.scoresByUnit.map((u) => (
                  <th key={u.unit} className="px-2 py-2 text-center">
                    {u.unit}
                  </th>
                ))}
                <th className="px-2 py-2 text-center">TB</th>
              </tr>
            </thead>
            <tbody>
              {members.map((s) => {
                const avg = Math.round(
                  s.scoresByUnit.reduce((a, x) => a + x.score, 0) /
                    Math.max(1, s.scoresByUnit.length),
                );
                return (
                  <tr key={s.id} className="border-b last:border-0 hover:bg-muted/40">
                    <td className="px-2 py-2 font-medium">{s.name}</td>
                    {s.scoresByUnit.map((u) => (
                      <td key={u.unit} className="px-2 py-2 text-center">
                        <span
                          className={cn(
                            "inline-block min-w-[2.25rem] rounded-md px-1.5 py-0.5 text-xs font-semibold",
                            u.score >= 90
                              ? "bg-emerald-500/10 text-emerald-700"
                              : u.score >= 75
                                ? "bg-sky-500/10 text-sky-700"
                                : u.score >= 60
                                  ? "bg-amber-500/10 text-amber-700"
                                  : "bg-rose-500/10 text-rose-700",
                          )}
                        >
                          {u.score}
                        </span>
                      </td>
                    ))}
                    <td className="px-2 py-2 text-center font-bold text-primary">{avg}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
