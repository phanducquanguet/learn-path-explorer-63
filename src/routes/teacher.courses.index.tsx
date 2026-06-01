import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  Search,
  X,
  ChevronDown,
  GraduationCap,
  Users,
  TrendingUp,
  Trophy,
  Layers,
  Sparkles,
  ArrowRight,
  MessageSquare,
} from "lucide-react";
import { TopNav } from "@/components/TopNav";
import { levels, type Course, type Level } from "@/lib/lms-data";
import { classes, students } from "@/lib/teacher-data";
import { cn } from "@/lib/utils";
import empowerA1Asset from "@/assets/empower-a1.png.asset.json";

const COURSE_COVERS: Record<string, string> = {};
const LEVEL_COVERS: Record<string, string> = {
  A1: empowerA1Asset.url,
  A2: empowerA1Asset.url,
  B1: empowerA1Asset.url,
  B2: empowerA1Asset.url,
  C1: empowerA1Asset.url,
  C2: empowerA1Asset.url,
};

export const Route = createFileRoute("/teacher/courses/")({
  head: () => ({
    meta: [
      { title: "Khóa học của tôi — UNICOM LMS" },
      {
        name: "description",
        content:
          "Quản trị khóa học từ góc nhìn giáo viên: theo dõi học viên, điểm số và năng lực trên các lớp.",
      },
    ],
  }),
  component: TeacherCoursesPage,
});

type CourseRow = {
  course: Course;
  level: Level;
  classCount: number;
  studentCount: number;
  avgProgress: number;
  avgScore: number;
};

function useCourseStats(): CourseRow[] {
  return useMemo(() => {
    return levels.flatMap((lv) =>
      lv.courses.map<CourseRow>((course) => {
        const lvClasses = classes.filter((c) => c.levelCode === lv.code);
        const lvStudents = students.filter((s) =>
          lvClasses.some((c) => c.id === s.classId),
        );
        const avgProgress = lvClasses.length
          ? Math.round(
              lvClasses.reduce((s, c) => s + c.avgProgress, 0) / lvClasses.length,
            )
          : course.progress;
        const allScores = lvStudents.flatMap((s) => s.scoresByUnit.map((u) => u.score));
        const avgScore = allScores.length
          ? Math.round(allScores.reduce((s, n) => s + n, 0) / allScores.length)
          : 0;
        return {
          course,
          level: lv,
          classCount: lvClasses.length,
          studentCount: lvStudents.length,
          avgProgress,
          avgScore,
        };
      }),
    );
  }, []);
}

function TeacherCoursesPage() {
  const rows = useCourseStats();
  const [query, setQuery] = useState("");
  const [levelFilter, setLevelFilter] = useState("all");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return rows.filter(({ course, level }) => {
      if (levelFilter !== "all" && level.code !== levelFilter) return false;
      if (q && !`${course.title} ${course.subtitle} ${level.code}`.toLowerCase().includes(q))
        return false;
      return true;
    });
  }, [rows, query, levelFilter]);

  const totalStudents = rows.reduce((s, r) => s + r.studentCount, 0);
  const totalClasses = classes.length;

  return (
    <div className="min-h-screen bg-background">
      <TopNav />
      <div className="mx-auto max-w-7xl px-6 pb-20 pt-10 sm:px-8">
        {/* Header */}
        <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
          <div className="flex flex-col gap-2">
            <span className="inline-flex w-fit items-center gap-2 text-xs font-semibold uppercase tracking-wider text-primary">
              <Sparkles className="h-3.5 w-3.5" /> Khóa học của tôi
            </span>
            <h1 className="font-display text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
              Quản trị khóa học
            </h1>
            <p className="text-sm text-muted-foreground">
              {rows.length} khóa học • {totalClasses} lớp đang dạy • {totalStudents} lượt
              học viên
            </p>
          </div>
          <Link
            to="/teacher/qa"
            className="inline-flex h-10 items-center gap-1.5 self-start rounded-xl border border-border bg-surface px-4 text-sm font-semibold text-foreground shadow-soft transition hover:bg-muted sm:self-end"
          >
            <MessageSquare className="h-4 w-4" /> Hỏi đáp học viên
            <span className="ml-1 rounded-md bg-primary/10 px-1.5 py-0.5 text-[10px] font-semibold text-primary">
              Tất cả khóa
            </span>
          </Link>
        </div>

        {/* KPI strip */}
        <div className="mt-6 grid gap-3 sm:grid-cols-4">
          <Kpi icon={GraduationCap} label="Khóa học" value={rows.length} />
          <Kpi icon={Layers} label="Lớp đang dạy" value={totalClasses} />
          <Kpi icon={Users} label="Lượt học viên" value={totalStudents} />
          <Kpi
            icon={Trophy}
            label="Điểm TB toàn hệ thống"
            value={
              rows.length
                ? Math.round(rows.reduce((s, r) => s + r.avgScore, 0) / rows.length)
                : 0
            }
            suffix="đ"
          />
        </div>

        {/* Toolbar */}
        <div className="mt-8 rounded-2xl border border-border bg-surface p-3 shadow-soft">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Tìm khóa học, cấp độ..."
                className="h-10 w-full rounded-xl border border-border bg-background pl-9 pr-9 text-sm text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
              {query && (
                <button
                  onClick={() => setQuery("")}
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
                  aria-label="Xóa"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
            <div className="flex items-center gap-2">
              <div className="relative">
                <select
                  value={levelFilter}
                  onChange={(e) => setLevelFilter(e.target.value)}
                  className="h-9 appearance-none rounded-xl border border-border bg-background pl-3 pr-8 text-xs font-medium text-foreground outline-none transition hover:border-primary/40 focus:border-primary focus:ring-2 focus:ring-primary/20"
                >
                  <option value="all">Tất cả cấp độ</option>
                  {levels.map((l) => (
                    <option key={l.code} value={l.code}>
                      Cấp độ {l.code}
                    </option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
              </div>
            </div>
          </div>
        </div>

        {/* Rows */}
        <div className="mt-6 grid gap-4 lg:grid-cols-2">
          {filtered.map((row) => (
            <TeacherCourseCard key={row.course.id} {...row} />
          ))}
          {filtered.length === 0 && (
            <div className="col-span-full rounded-3xl border border-dashed border-border bg-surface/40 p-12 text-center">
              <GraduationCap className="mx-auto mb-3 h-8 w-8 text-muted-foreground" />
              <p className="text-sm font-medium text-foreground">
                Không tìm thấy khóa học phù hợp
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Kpi({
  icon: Icon,
  label,
  value,
  suffix,
}: {
  icon: typeof GraduationCap;
  label: string;
  value: number;
  suffix?: string;
}) {
  return (
    <div className="rounded-2xl border border-border bg-surface p-4 shadow-soft">
      <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
        <Icon className="h-3.5 w-3.5" /> {label}
      </div>
      <div className="mt-2 font-display text-2xl font-semibold text-foreground">
        {value}
        {suffix && <span className="ml-0.5 text-base font-medium text-muted-foreground">{suffix}</span>}
      </div>
    </div>
  );
}

function TeacherCourseCard({
  course,
  level,
  classCount,
  studentCount,
  avgProgress,
  avgScore,
}: CourseRow) {
  return (
    <Link
      to="/teacher/courses/$courseId"
      params={{ courseId: course.id }}
      className="group flex flex-col gap-4 rounded-3xl border border-border bg-surface p-5 shadow-soft transition hover:-translate-y-0.5 hover:shadow-elevated"
    >
      <div className="flex items-start justify-between gap-3">
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
            <span>{course.units.length} units • {course.hours}h</span>
          </div>
          <h3 className="mt-1.5 truncate text-base font-semibold text-foreground group-hover:text-primary">
            {course.title}
          </h3>
          <p className="line-clamp-1 text-xs text-muted-foreground">{course.subtitle}</p>
        </div>
        <ArrowRight className="mt-1 h-4 w-4 shrink-0 text-muted-foreground transition group-hover:translate-x-0.5 group-hover:text-primary" />
      </div>

      <div className="grid grid-cols-4 gap-2 text-center">
        <Stat label="Lớp" value={classCount} />
        <Stat label="Học viên" value={studentCount} />
        <Stat label="Tiến độ" value={`${avgProgress}%`} tone="primary" />
        <Stat label="Điểm TB" value={avgScore || "—"} tone="emerald" />
      </div>

      <div>
        <div className="flex items-center justify-between text-[11px] font-medium text-muted-foreground">
          <span className="inline-flex items-center gap-1">
            <TrendingUp className="h-3 w-3" /> Tiến độ trung bình các lớp
          </span>
          <span>{avgProgress}%</span>
        </div>
        <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full"
            style={{
              width: `${avgProgress}%`,
              background: `linear-gradient(90deg, oklch(0.55 0.2 ${level.hue}), oklch(0.7 0.18 ${(level.hue + 40) % 360}))`,
            }}
          />
        </div>
      </div>
    </Link>
  );
}

function Stat({
  label,
  value,
  tone,
}: {
  label: string;
  value: string | number;
  tone?: "primary" | "emerald";
}) {
  return (
    <div className="rounded-xl bg-background p-2 ring-1 ring-border">
      <div className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
        {label}
      </div>
      <div
        className={cn(
          "mt-0.5 text-sm font-semibold text-foreground",
          tone === "primary" && "text-primary",
          tone === "emerald" && "text-emerald-600",
        )}
      >
        {value}
      </div>
    </div>
  );
}
