import { createFileRoute, Link } from "@tanstack/react-router";
import { TopNav } from "@/components/TopNav";
import { classes, students, recentActivity, teacherProfile } from "@/lib/teacher-data";
import {
  GraduationCap,
  Users,
  Clock,
  Trophy,
  TrendingUp,
  Sparkles,
  ArrowUpRight,
  Upload,
  ClipboardCheck,
} from "lucide-react";

export const Route = createFileRoute("/teacher/")({
  head: () => ({
    meta: [
      { title: "Tổng quan giáo viên — UNICOM LMS" },
      { name: "description", content: "Bảng điều khiển dành cho giáo viên." },
    ],
  }),
  component: TeacherOverview,
});

function TeacherOverview() {
  const totalStudents = students.length;
  const avgScore = Math.round(
    students.reduce((s, st) => s + st.scoresByUnit.reduce((a, b) => a + b.score, 0) / st.scoresByUnit.length, 0) /
      students.length,
  );

  const stats = [
    { icon: GraduationCap, label: "Lớp đang dạy", value: classes.length, hint: "Tuần này", tint: "from-violet-500 to-indigo-600" },
    { icon: Users, label: "Tổng học viên", value: totalStudents, hint: `${classes.length} lớp`, tint: "from-sky-500 to-cyan-600" },
    { icon: Clock, label: "Giờ giảng tuần", value: `${teacherProfile.totalHoursThisWeek}h`, hint: "Mục tiêu 24h", tint: "from-amber-500 to-orange-600" },
    { icon: Trophy, label: "Điểm TB lớp", value: avgScore, hint: "/100", tint: "from-emerald-500 to-teal-600" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <TopNav />
      <div className="mx-auto max-w-7xl px-6 pb-20 pt-10 sm:px-8">
        <div className="flex items-start justify-between gap-4">
          <div>
            <span className="inline-flex w-fit items-center gap-2 text-xs font-semibold uppercase tracking-wider text-primary">
              <Sparkles className="h-3.5 w-3.5" /> Xin chào, {teacherProfile.name}
            </span>
            <h1 className="mt-1 font-display text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
              Tổng quan giảng dạy
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Theo dõi tiến độ {classes.length} lớp và {totalStudents} học viên trong tuần.
            </p>
          </div>
          <div className="flex gap-2">
            <Link
              to="/teacher/upload"
              className="inline-flex items-center gap-1.5 rounded-xl bg-foreground px-3.5 py-2 text-xs font-semibold text-background hover:opacity-90"
            >
              <Upload className="h-3.5 w-3.5" /> Tải lên khóa học
            </Link>
            <Link
              to="/teacher/exams"
              className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-surface px-3.5 py-2 text-xs font-semibold text-foreground hover:bg-muted"
            >
              <ClipboardCheck className="h-3.5 w-3.5" /> Tạo bài thi
            </Link>
          </div>
        </div>

        {/* Stats */}
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((s) => {
            const Icon = s.icon;
            return (
              <div key={s.label} className="rounded-2xl border border-border bg-surface p-5 shadow-soft">
                <div className={`inline-flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${s.tint} text-white`}>
                  <Icon className="h-5 w-5" />
                </div>
                <div className="mt-4 text-2xl font-bold text-foreground">{s.value}</div>
                <div className="mt-0.5 text-xs text-muted-foreground">
                  {s.label} • <span>{s.hint}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Classes grid */}
        <div className="mt-10 mb-3 flex items-baseline justify-between border-b border-border pb-3">
          <h2 className="font-display text-lg font-semibold text-foreground">Lớp của tôi</h2>
          <span className="text-xs text-muted-foreground">{classes.length} lớp</span>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-2">
          {classes.map((cls) => (
            <ClassCard key={cls.id} cls={cls} />
          ))}
        </div>

        {/* Recent activity */}
        <div className="mt-10 mb-3 flex items-baseline justify-between border-b border-border pb-3">
          <h2 className="font-display text-lg font-semibold text-foreground">Hoạt động gần đây</h2>
          <span className="text-xs text-muted-foreground">Cập nhật theo thời gian thực</span>
        </div>
        <div className="overflow-hidden rounded-2xl border border-border bg-surface">
          {recentActivity.map((r, i) => (
            <div
              key={r.id}
              className={`flex items-center gap-4 px-5 py-3.5 ${i < recentActivity.length - 1 ? "border-b border-border" : ""}`}
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-primary to-chart-5 text-xs font-semibold text-primary-foreground">
                {r.name
                  .split(" ")
                  .slice(-1)[0]
                  .charAt(0)}
              </div>
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-medium text-foreground">{r.name}</div>
                <div className="truncate text-xs text-muted-foreground">
                  <span className="text-foreground/70">{r.className}</span> • {r.action}
                </div>
              </div>
              {r.score !== undefined && (
                <span className="rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                  {r.score}đ
                </span>
              )}
              <span className="text-[11px] text-muted-foreground">{r.time}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ClassCard({ cls }: { cls: (typeof classes)[number] }) {
  const max = Math.max(...cls.weeklyMinutes, 1);
  const pts = cls.weeklyMinutes
    .map((v, i) => `${(i / (cls.weeklyMinutes.length - 1)) * 100},${100 - (v / max) * 100}`)
    .join(" ");

  return (
    <div className="group relative overflow-hidden rounded-2xl border border-border bg-surface p-5 shadow-soft transition hover:-translate-y-0.5 hover:shadow-elevated">
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="rounded-md bg-primary/10 px-2 py-0.5 text-[10px] font-bold uppercase text-primary">
              {cls.levelCode}
            </span>
            <span className="text-[11px] text-muted-foreground">{cls.schedule}</span>
          </div>
          <div className="mt-1 font-display text-lg font-semibold text-foreground">{cls.name}</div>
        </div>
        <Link
          to="/courses"
          className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-muted text-muted-foreground transition hover:bg-foreground hover:text-background"
        >
          <ArrowUpRight className="h-4 w-4" />
        </Link>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-3">
        <Stat label="Sĩ số" value={cls.studentCount} />
        <Stat label="Tiến độ" value={`${cls.avgProgress}%`} />
        <Stat label="Điểm TB" value={cls.avgScore} />
      </div>

      <div className="mt-4">
        <div className="flex items-center justify-between text-[11px] text-muted-foreground">
          <span>Hoạt động 7 ngày</span>
          <span className="inline-flex items-center gap-1 text-emerald-600">
            <TrendingUp className="h-3 w-3" /> {cls.attendance}% tham gia
          </span>
        </div>
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="mt-1 h-10 w-full">
          <polyline
            fill="none"
            stroke="oklch(0.55 0.18 260)"
            strokeWidth="2"
            vectorEffect="non-scaling-stroke"
            points={pts}
          />
        </svg>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-xl bg-muted/40 p-2.5 text-center">
      <div className="text-base font-bold text-foreground">{value}</div>
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</div>
    </div>
  );
}
