import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { TopNav } from "@/components/TopNav";
import { classes, students, type TeacherStudent } from "@/lib/teacher-data";
import { levels } from "@/lib/lms-data";
import { orgs, classOrgMap, getOrg } from "@/lib/orgs";
import {
  BarChart3,
  Sparkles,
  Building2,
  GraduationCap,
  Users,
  Filter,
  Download,
  TrendingUp,
  Trophy,
  AlertTriangle,
  BookOpen,
  X,
  ArrowUpDown,
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  LineChart,
  Line,
} from "recharts";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/admin/stats")({
  head: () => ({ meta: [{ title: "Thống kê điểm học viên — UNICOM LMS" }] }),
  component: StatsPage,
});

// --- Data derivation helpers ---

type CourseRef = { id: string; title: string; levelCode: string };

function coursesForLevel(levelCode: string): CourseRef[] {
  const lv = levels.find((l) => l.code === levelCode);
  if (!lv) return [];
  return lv.courses.map((c) => ({ id: c.id, title: c.title, levelCode }));
}

// Deterministic per-(student, course) score derived from student's unit avg
// with a small offset per course so different courses show different results.
function studentCourseScore(s: TeacherStudent, courseId: string): number {
  const base =
    s.scoresByUnit.reduce((a, x) => a + x.score, 0) /
    Math.max(1, s.scoresByUnit.length);
  let h = 0;
  for (let i = 0; i < courseId.length; i++) h = (h * 31 + courseId.charCodeAt(i)) >>> 0;
  const offset = ((h % 21) - 10); // -10..+10
  const skillTilt =
    courseId.includes("lsl") || courseId.includes("l")
      ? (s.skills.listening + s.skills.speaking) / 2 - base
      : courseId.includes("w")
        ? s.skills.writing - base
        : courseId.includes("lr") || courseId.includes("r")
          ? (s.skills.reading + s.skills.listening) / 2 - base
          : 0;
  return Math.max(30, Math.min(100, Math.round(base + offset * 0.5 + skillTilt * 0.4)));
}

function bucketOf(score: number) {
  if (score >= 85) return "excellent";
  if (score >= 70) return "good";
  if (score >= 55) return "average";
  return "atrisk";
}
const BUCKETS = [
  { key: "excellent", label: "Xuất sắc (≥85)", color: "oklch(0.7 0.16 155)" },
  { key: "good", label: "Khá (70–84)", color: "oklch(0.7 0.15 220)" },
  { key: "average", label: "TB (55–69)", color: "oklch(0.78 0.14 75)" },
  { key: "atrisk", label: "Cần hỗ trợ (<55)", color: "oklch(0.65 0.2 25)" },
] as const;

function StatsPage() {
  // Draft filter state (form) — chỉ apply khi bấm "Lọc"
  const [draftOrgId, setDraftOrgId] = useState<string>("all");
  const [draftLevelCode, setDraftLevelCode] = useState<string>("all");
  const [draftClassId, setDraftClassId] = useState<string>("all");
  const [draftCourseId, setDraftCourseId] = useState<string>("");

  // Applied filter state — dùng để tính toán bảng
  const [orgId, setOrgId] = useState<string>("all");
  const [levelCode, setLevelCode] = useState<string>("all");
  const [classId, setClassId] = useState<string>("all");
  const [courseId, setCourseId] = useState<string>("");
  const [applied, setApplied] = useState(false);

  const [sortBy, setSortBy] = useState<"name" | "score" | "class">("score");
  const [drilldown, setDrilldown] = useState<TeacherStudent | null>(null);
  const [unitDetail, setUnitDetail] = useState<{ student: TeacherStudent; course: CourseRef } | null>(null);

  // ===== Draft scope (để populate dropdown Lớp / Khóa học phụ thuộc) =====
  const draftScopedClasses = useMemo(() => {
    return classes.filter((c) => {
      if (draftOrgId !== "all" && classOrgMap[c.id] !== draftOrgId) return false;
      if (draftLevelCode !== "all" && c.levelCode !== draftLevelCode) return false;
      return true;
    });
  }, [draftOrgId, draftLevelCode]);

  const draftScopedCourses = useMemo(() => {
    const seen = new Map<string, CourseRef>();
    const source = draftClassId !== "all"
      ? draftScopedClasses.filter((c) => c.id === draftClassId)
      : draftScopedClasses;
    for (const c of source) {
      for (const cr of coursesForLevel(c.levelCode)) seen.set(cr.id, cr);
    }
    return Array.from(seen.values());
  }, [draftScopedClasses, draftClassId]);

  // ===== Applied scope =====
  const scopedClasses = useMemo(() => {
    return classes.filter((c) => {
      if (orgId !== "all" && classOrgMap[c.id] !== orgId) return false;
      if (levelCode !== "all" && c.levelCode !== levelCode) return false;
      if (classId !== "all" && c.id !== classId) return false;
      return true;
    });
  }, [orgId, levelCode, classId]);

  const scopedClassIds = new Set(scopedClasses.map((c) => c.id));
  // Chỉ lấy học viên thuộc lớp có level trùng với khóa học đã chọn
  const activeCourse = useMemo(
    () => (courseId ? coursesForLevel(levelCode !== "all" ? levelCode : "").find((c) => c.id === courseId)
      ?? levels.flatMap((l) => l.courses.map((c) => ({ id: c.id, title: c.title, levelCode: l.code })))
        .find((c) => c.id === courseId)
      : null),
    [courseId, levelCode],
  );

  const scopedStudents = students.filter((s) => {
    if (!scopedClassIds.has(s.classId)) return false;
    if (activeCourse) {
      const cls = classes.find((c) => c.id === s.classId);
      if (!cls || cls.levelCode !== activeCourse.levelCode) return false;
    }
    return true;
  });

  // Metric: điểm của học viên trên khóa học đã chọn
  const getMetric = (s: TeacherStudent) => {
    if (activeCourse) return studentCourseScore(s, activeCourse.id);
    return Math.round(
      s.scoresByUnit.reduce((a, x) => a + x.score, 0) / Math.max(1, s.scoresByUnit.length),
    );
  };

  // ===== Student rows =====
  type Row = {
    student: TeacherStudent;
    className: string;
    orgName: string;
    levelCode: string;
    score: number;
  };
  const rows: Row[] = applied && activeCourse
    ? scopedStudents.map((s) => {
        const cls = classes.find((c) => c.id === s.classId)!;
        const org = getOrg(classOrgMap[s.classId]);
        return {
          student: s,
          className: cls.name,
          orgName: org?.shortName ?? "—",
          levelCode: cls.levelCode,
          score: getMetric(s),
        };
      })
    : [];
  rows.sort((a, b) => {
    if (sortBy === "name") return a.student.name.localeCompare(b.student.name);
    if (sortBy === "class") return a.className.localeCompare(b.className);
    return b.score - a.score;
  });

  const exportCsv = () => {
    if (!activeCourse) return;
    const header = ["Học viên", "Email", "Đơn vị", "Lớp", "Level", "Khóa học", "Điểm"];
    const lines = rows.map((r) =>
      [r.student.name, r.student.email, r.orgName, r.className, r.levelCode, activeCourse.title, r.score].join(","),
    );
    const blob = new Blob([[header.join(","), ...lines].join("\n")], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `unicom-thongke-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const applyFilters = () => {
    setOrgId(draftOrgId);
    setLevelCode(draftLevelCode);
    setClassId(draftClassId);
    setCourseId(draftCourseId);
    setApplied(true);
  };

  const resetFilters = () => {
    setDraftOrgId("all");
    setDraftLevelCode("all");
    setDraftClassId("all");
    setDraftCourseId("");
    setOrgId("all");
    setLevelCode("all");
    setClassId("all");
    setCourseId("");
    setApplied(false);
  };

  const canApply = draftCourseId !== "";


  return (
    <div className="min-h-screen bg-background">
      <TopNav />
      <div className="mx-auto max-w-7xl px-6 pb-20 pt-10 sm:px-8">
        <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <span className="inline-flex w-fit items-center gap-2 text-xs font-semibold uppercase tracking-wider text-primary">
              <Sparkles className="h-3.5 w-3.5" /> Thống kê điểm học viên
            </span>
            <h1 className="mt-1 font-display text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
              Thống kê đa chiều
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Lọc theo đơn vị · level · lớp · khóa học · kỹ năng để theo dõi điểm số học viên toàn hệ thống.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={resetFilters}
              className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-surface px-3 py-2 text-xs font-semibold text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              <X className="h-3.5 w-3.5" /> Đặt lại
            </button>
            <button
              onClick={exportCsv}
              className="inline-flex items-center gap-1.5 rounded-lg bg-foreground px-3 py-2 text-xs font-semibold text-background hover:opacity-90"
            >
              <Download className="h-3.5 w-3.5" /> Xuất CSV
            </button>
          </div>
        </div>

        {/* Filter bar */}
        <div className="mt-6 rounded-2xl border border-border bg-surface p-4 shadow-soft">
          <div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            <Filter className="h-3.5 w-3.5" /> Bộ lọc
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <FilterSelect
              icon={Building2}
              label="Đơn vị"
              value={draftOrgId}
              onChange={(v) => {
                setDraftOrgId(v);
                setDraftClassId("all");
                setDraftCourseId("");
              }}
              options={[
                { value: "all", label: `Tất cả (${orgs.length})` },
                ...orgs.map((o) => ({ value: o.id, label: o.shortName })),
              ]}
            />
            <FilterSelect
              icon={BookOpen}
              label="Level"
              value={draftLevelCode}
              onChange={(v) => {
                setDraftLevelCode(v);
                setDraftClassId("all");
                setDraftCourseId("");
              }}
              options={[
                { value: "all", label: "Tất cả level" },
                ...Array.from(new Set(classes.map((c) => c.levelCode))).map((code) => ({
                  value: code,
                  label: code,
                })),
              ]}
            />
            <FilterSelect
              icon={Users}
              label="Lớp"
              value={draftClassId}
              onChange={(v) => {
                setDraftClassId(v);
                setDraftCourseId("");
              }}
              options={[
                { value: "all", label: `Tất cả (${draftScopedClasses.length})` },
                ...draftScopedClasses.map((c) => ({ value: c.id, label: c.name })),
              ]}
            />
            <FilterSelect
              icon={GraduationCap}
              label="Khóa học *"
              value={draftCourseId}
              onChange={setDraftCourseId}
              options={[
                { value: "", label: draftScopedCourses.length ? "— Chọn khóa học —" : "Không có khóa học" },
                ...draftScopedCourses.map((c) => ({ value: c.id, label: `${c.levelCode} · ${c.title}` })),
              ]}
            />
          </div>
          <div className="mt-4 flex items-center justify-end gap-2">
            <span className="mr-auto text-[11px] text-muted-foreground">
              * Bắt buộc chọn 1 khóa học để xem điểm số.
            </span>
            <button
              onClick={applyFilters}
              disabled={!canApply}
              className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground shadow-soft hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <Filter className="h-3.5 w-3.5" /> Lọc
            </button>
          </div>
        </div>

        {/* Student table */}
        <div className="mt-8 overflow-hidden rounded-2xl border border-border bg-surface shadow-soft">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border p-5">
            <div>
              <h3 className="text-base font-semibold text-foreground">
                Chi tiết học viên{activeCourse ? ` · ${activeCourse.levelCode} · ${activeCourse.title}` : ""}
              </h3>
              <p className="text-xs text-muted-foreground">
                {applied && activeCourse
                  ? `${rows.length} học viên · nhấn tên để xem chi tiết · nhấn tiêu đề cột để sắp xếp`
                  : "Chọn khóa học và bấm Lọc để hiển thị điểm số."}
              </p>
            </div>
            <BarChart3 className="h-5 w-5 text-muted-foreground" />
          </div>
          <div className="max-h-[560px] overflow-auto">
            <table className="w-full text-sm">
              <thead className="sticky top-0 z-10 bg-surface-2 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                <tr>
                  <th className="cursor-pointer px-5 py-3" onClick={() => setSortBy("name")}>
                    <span className="inline-flex items-center gap-1">Học viên <ArrowUpDown className="h-3 w-3" /></span>
                  </th>
                  <th className="px-3 py-3">Đơn vị</th>
                  <th className="cursor-pointer px-3 py-3" onClick={() => setSortBy("class")}>
                    <span className="inline-flex items-center gap-1">Lớp <ArrowUpDown className="h-3 w-3" /></span>
                  </th>
                  <th className="px-3 py-3 text-center">Level</th>
                  <th className="cursor-pointer px-3 py-3 text-center" onClick={() => setSortBy("score")}>
                    <span className="inline-flex items-center gap-1">Điểm <ArrowUpDown className="h-3 w-3" /></span>
                  </th>
                  <th className="px-3 py-3 text-center">Chi tiết</th>
                </tr>
              </thead>

              <tbody>
                {rows.map((r) => (
                  <tr key={r.student.id} className="border-t border-border/60 hover:bg-muted/30">
                    <td className="px-5 py-3">
                      <button
                        onClick={() => setDrilldown(r.student)}
                        className="text-left font-medium text-foreground hover:text-primary"
                      >
                        {r.student.name}
                      </button>
                      <div className="text-[11px] text-muted-foreground">{r.student.email}</div>
                    </td>
                    <td className="px-3 py-3 text-xs text-muted-foreground">{r.orgName}</td>
                    <td className="px-3 py-3 text-xs text-foreground">{r.className}</td>
                    <td className="px-3 py-3 text-center">
                      <span className="rounded-md bg-primary/10 px-2 py-0.5 text-[11px] font-bold text-primary">
                        {r.levelCode}
                      </span>
                    </td>
                    <td className="px-3 py-3 text-center">
                      <ScoreBadge score={r.score} />
                    </td>
                    <td className="px-3 py-3 text-center">
                      <button
                        onClick={() => setUnitDetail({ student: r.student, course: activeCourse! })}
                        className="inline-flex items-center gap-1 rounded-lg border border-border bg-background px-2.5 py-1 text-[11px] font-semibold text-foreground hover:bg-muted"
                      >
                        <BookOpen className="h-3 w-3" /> Chi tiết bài
                      </button>
                    </td>
                  </tr>
                ))}
                {applied && activeCourse && rows.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-5 py-10 text-center text-sm text-muted-foreground">
                      Không có học viên nào khớp bộ lọc.
                    </td>
                  </tr>
                )}
                {!applied && (
                  <tr>
                    <td colSpan={5} className="px-5 py-10 text-center text-sm text-muted-foreground">
                      Vui lòng chọn khóa học và bấm <span className="font-semibold text-foreground">Lọc</span> để xem điểm số học viên.

                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {drilldown && (
        <DrilldownModal
          student={drilldown}
          onClose={() => setDrilldown(null)}
        />
      )}
    </div>
  );
}

function FilterSelect({
  icon: Icon,
  label,
  value,
  onChange,
  options,
}: {
  icon: typeof Filter;
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <label className="flex flex-col gap-1">
      <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
        <Icon className="h-3 w-3" /> {label}
      </span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-9 rounded-lg border border-border bg-background px-2 text-sm font-medium text-foreground outline-none focus:border-primary"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
    </label>
  );
}

function Kpi({
  icon: Icon,
  label,
  value,
  suffix,
  tint,
}: {
  icon: typeof Trophy;
  label: string;
  value: string | number;
  suffix?: string;
  tint: string;
}) {
  return (
    <div className="rounded-2xl border border-border bg-surface p-5 shadow-soft">
      <div className={`inline-flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${tint} text-white`}>
        <Icon className="h-5 w-5" />
      </div>
      <div className="mt-4 flex items-baseline gap-1">
        <span className="text-2xl font-bold text-foreground">{value}</span>
        {suffix && <span className="text-xs text-muted-foreground">{suffix}</span>}
      </div>
      <div className="mt-0.5 text-xs text-muted-foreground">{label}</div>
    </div>
  );
}

function Card({
  title,
  subtitle,
  children,
  wide,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  wide?: boolean;
}) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-border bg-surface p-5 shadow-soft",
        wide && "lg:col-span-2",
      )}
    >
      <div className="mb-3">
        <div className="text-sm font-semibold text-foreground">{title}</div>
        {subtitle && <div className="text-xs text-muted-foreground">{subtitle}</div>}
      </div>
      {children}
    </div>
  );
}

function Empty() {
  return (
    <div className="grid h-[220px] place-items-center text-sm text-muted-foreground">
      Không có dữ liệu phù hợp với bộ lọc hiện tại.
    </div>
  );
}

function ScoreBadge({ score }: { score: number }) {
  const cls =
    score >= 85
      ? "bg-emerald-500/10 text-emerald-700"
      : score >= 70
        ? "bg-sky-500/10 text-sky-700"
        : score >= 55
          ? "bg-amber-500/10 text-amber-700"
          : "bg-rose-500/10 text-rose-700";
  return <span className={cn("rounded-full px-2 py-1 text-xs font-bold", cls)}>{score}</span>;
}

function DrilldownModal({ student, onClose }: { student: TeacherStudent; onClose: () => void }) {
  const cls = classes.find((c) => c.id === student.classId)!;
  const org = getOrg(classOrgMap[student.classId]);
  const courseRefs = coursesForLevel(cls.levelCode);
  const perCourse = courseRefs.map((c) => ({
    name: c.title,
    "Điểm": studentCourseScore(student, c.id),
  }));
  const unitTrend = student.scoresByUnit.map((u) => ({ unit: u.unit, "Điểm": u.score }));
  const skillsData = [
    { skill: "Nghe", value: student.skills.listening },
    { skill: "Đọc", value: student.skills.reading },
    { skill: "Viết", value: student.skills.writing },
    { skill: "Nói", value: student.skills.speaking },
  ];

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4" onClick={onClose}>
      <div
        className="max-h-[90vh] w-full max-w-3xl overflow-auto rounded-2xl bg-background p-6 shadow-elevated"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="text-lg font-semibold text-foreground">{student.name}</div>
            <div className="text-xs text-muted-foreground">
              {student.email} · {org?.shortName} · {cls.name} · Level {cls.levelCode}
            </div>
          </div>
          <button onClick={onClose} className="rounded-lg p-1 hover:bg-muted">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-5 grid gap-4 md:grid-cols-2">
          <div className="rounded-xl border border-border p-3">
            <div className="mb-2 text-xs font-semibold text-muted-foreground">Điểm theo khóa học</div>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={perCourse} layout="vertical" margin={{ left: 8 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={false} />
                <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 10 }} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 10 }} width={140} />
                <Tooltip />
                <Bar dataKey="Điểm" fill="oklch(0.55 0.2 280)" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="rounded-xl border border-border p-3">
            <div className="mb-2 text-xs font-semibold text-muted-foreground">Diễn biến điểm theo unit</div>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={unitTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="unit" tick={{ fontSize: 10 }} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 10 }} />
                <Tooltip />
                <Line type="monotone" dataKey="Điểm" stroke="oklch(0.6 0.18 200)" strokeWidth={2} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="rounded-xl border border-border p-3 md:col-span-2">
            <div className="mb-2 text-xs font-semibold text-muted-foreground">Chân dung kỹ năng</div>
            <ResponsiveContainer width="100%" height={220}>
              <RadarChart data={skillsData}>
                <PolarGrid stroke="hsl(var(--border))" />
                <PolarAngleAxis dataKey="skill" tick={{ fontSize: 12 }} />
                <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fontSize: 10 }} />
                <Radar dataKey="value" stroke="oklch(0.55 0.2 25)" fill="oklch(0.55 0.2 25)" fillOpacity={0.3} />
                <Tooltip />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
