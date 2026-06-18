import { useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { TopNav } from "@/components/TopNav";
import { classes, students, recentActivity, teacherProfile } from "@/lib/teacher-data";
import {
  GraduationCap,
  Users,
  Trophy,
  TrendingUp,
  Sparkles,
  ArrowUpRight,
  BarChart3,
  ClipboardCheck,
  AlertTriangle,
  Video,
  CalendarClock,
  Mail,
  Search,
  CheckCircle2,
  Crown,
  UserCog,
} from "lucide-react";

export const Route = createFileRoute("/teacher/")({
  head: () => ({
    meta: [
      { title: "Tổng quan giáo viên — UNICOM LMS" },
      { name: "description", content: "Theo dõi nhanh & quản lý lớp học và học viên." },
    ],
  }),
  component: TeacherOverview,
});

type RoleFilter = "all" | "primary" | "assistant";

function avgOf(scoresByUnit: { score: number }[]) {
  if (!scoresByUnit.length) return 0;
  return Math.round(scoresByUnit.reduce((a, b) => a + b.score, 0) / scoresByUnit.length);
}

function TeacherOverview() {
  const [roleFilter, setRoleFilter] = useState<RoleFilter>("all");
  const [query, setQuery] = useState("");

  const filteredClasses = useMemo(
    () => classes.filter((c) => roleFilter === "all" || c.role === roleFilter),
    [roleFilter],
  );
  const classIds = useMemo(() => new Set(filteredClasses.map((c) => c.id)), [filteredClasses]);
  const scopedStudents = useMemo(
    () => students.filter((s) => classIds.has(s.classId)),
    [classIds],
  );

  const totalStudents = scopedStudents.length;
  const avgScore = scopedStudents.length
    ? Math.round(scopedStudents.reduce((s, st) => s + avgOf(st.scoresByUnit), 0) / scopedStudents.length)
    : 0;

  const atRisk = useMemo(
    () =>
      scopedStudents
        .map((s) => ({ ...s, avg: avgOf(s.scoresByUnit) }))
        .filter((s) => s.avg < 65)
        .sort((a, b) => a.avg - b.avg)
        .slice(0, 6),
    [scopedStudents],
  );
  const top = useMemo(
    () =>
      scopedStudents
        .map((s) => ({ ...s, avg: avgOf(s.scoresByUnit) }))
        .sort((a, b) => b.avg - a.avg)
        .slice(0, 5),
    [scopedStudents],
  );

  const searched = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [] as typeof scopedStudents;
    return scopedStudents
      .filter((s) => s.name.toLowerCase().includes(q) || s.email.toLowerCase().includes(q))
      .slice(0, 8);
  }, [query, scopedStudents]);

  const primaryCount = classes.filter((c) => c.role === "primary").length;
  const assistantCount = classes.filter((c) => c.role === "assistant").length;

  const stats = [
    {
      icon: GraduationCap,
      label: roleFilter === "assistant" ? "Lớp trợ giảng" : roleFilter === "primary" ? "Lớp chủ nhiệm" : "Lớp đang theo",
      value: filteredClasses.length,
      hint: `${primaryCount} chủ nhiệm · ${assistantCount} trợ giảng`,
      tint: "from-violet-500 to-indigo-600",
    },
    {
      icon: Users,
      label: "Học viên",
      value: totalStudents,
      hint: `${filteredClasses.length} lớp`,
      tint: "from-sky-500 to-cyan-600",
    },
    {
      icon: AlertTriangle,
      label: "Cần hỗ trợ",
      value: atRisk.length,
      hint: "Điểm TB < 65",
      tint: "from-rose-500 to-orange-500",
    },
    {
      icon: Trophy,
      label: "Điểm TB",
      value: avgScore,
      hint: "/100 toàn phạm vi",
      tint: "from-emerald-500 to-teal-600",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <TopNav />
      <div className="mx-auto max-w-7xl px-6 pb-20 pt-10 sm:px-8">
        {/* Header */}
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <span className="inline-flex w-fit items-center gap-2 text-xs font-semibold uppercase tracking-wider text-primary">
              <Sparkles className="h-3.5 w-3.5" /> Xin chào, {teacherProfile.name}
            </span>
            <h1 className="mt-1 font-display text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
              Tổng quan giảng dạy
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Theo dõi nhanh tiến độ lớp và học viên bạn đang chủ nhiệm / trợ giảng.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link
              to="/teacher/live"
              className="inline-flex items-center gap-1.5 rounded-xl bg-foreground px-3.5 py-2 text-xs font-semibold text-background hover:opacity-90"
            >
              <Video className="h-3.5 w-3.5" /> Đặt lịch buổi học
            </Link>
            <Link
              to="/teacher/reports"
              className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-surface px-3.5 py-2 text-xs font-semibold text-foreground hover:bg-muted"
            >
              <BarChart3 className="h-3.5 w-3.5" /> Báo cáo
            </Link>
            <Link
              to="/admin/exams"
              className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-surface px-3.5 py-2 text-xs font-semibold text-foreground hover:bg-muted"
            >
              <ClipboardCheck className="h-3.5 w-3.5" /> Tạo bài thi
            </Link>
          </div>
        </div>

        {/* Role filter + quick search */}
        <div className="mt-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border bg-surface p-2 pl-3">
          <div className="inline-flex items-center gap-1 rounded-xl bg-muted/60 p-1">
            {([
              { id: "all", label: `Tất cả (${classes.length})`, icon: GraduationCap },
              { id: "primary", label: `Chủ nhiệm (${primaryCount})`, icon: Crown },
              { id: "assistant", label: `Trợ giảng (${assistantCount})`, icon: UserCog },
            ] as { id: RoleFilter; label: string; icon: typeof Crown }[]).map((t) => {
              const Icon = t.icon;
              const active = roleFilter === t.id;
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setRoleFilter(t.id)}
                  className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                    active
                      ? "bg-background text-foreground shadow-soft"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" /> {t.label}
                </button>
              );
            })}
          </div>
          <div className="relative w-full max-w-xs">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Tìm nhanh học viên theo tên hoặc email…"
              className="w-full rounded-xl border border-border bg-background py-2 pl-9 pr-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
            {query && searched.length > 0 && (
              <div className="absolute left-0 right-0 top-full z-10 mt-1 overflow-hidden rounded-xl border border-border bg-surface shadow-elevated">
                {searched.map((s) => {
                  const cls = classes.find((c) => c.id === s.classId);
                  return (
                    <Link
                      key={s.id}
                      to="/teacher/classes/$classId"
                      params={{ classId: s.classId }}
                      className="flex items-center justify-between gap-2 px-3 py-2 text-sm hover:bg-muted"
                      onClick={() => setQuery("")}
                    >
                      <div className="min-w-0">
                        <div className="truncate font-medium text-foreground">{s.name}</div>
                        <div className="truncate text-[11px] text-muted-foreground">{cls?.name}</div>
                      </div>
                      <span className="text-xs font-semibold text-foreground">{avgOf(s.scoresByUnit)}đ</span>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
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

        {/* Main grid: classes (left, 2 cols) + side panel */}
        <div className="mt-8 grid gap-5 lg:grid-cols-3">
          {/* Classes */}
          <div className="lg:col-span-2">
            <div className="mb-3 flex items-baseline justify-between border-b border-border pb-3">
              <h2 className="font-display text-lg font-semibold text-foreground">Lớp của tôi</h2>
              <span className="text-xs text-muted-foreground">{filteredClasses.length} lớp</span>
            </div>
            {filteredClasses.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-border bg-surface p-10 text-center text-sm text-muted-foreground">
                Không có lớp phù hợp với bộ lọc hiện tại.
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2">
                {filteredClasses.map((cls) => {
                  const list = students.filter((s) => s.classId === cls.id);
                  const risk = list.filter((s) => avgOf(s.scoresByUnit) < 65).length;
                  return <ClassCard key={cls.id} cls={cls} riskCount={risk} />;
                })}
              </div>
            )}
          </div>

          {/* Side panel */}
          <div className="space-y-5">
            <Panel
              title="Học viên cần hỗ trợ"
              icon={AlertTriangle}
              iconTint="text-rose-600 bg-rose-500/10"
              count={atRisk.length}
            >
              {atRisk.length === 0 ? (
                <EmptyRow text="Tuyệt vời! Không có học viên nào cần hỗ trợ." />
              ) : (
                atRisk.map((s) => {
                  const cls = classes.find((c) => c.id === s.classId);
                  return (
                    <StudentRow
                      key={s.id}
                      name={s.name}
                      sub={`${cls?.name ?? ""} · ${s.lastActive}`}
                      score={s.avg}
                      classId={s.classId}
                      tone="warn"
                    />
                  );
                })
              )}
            </Panel>

            <Panel
              title="Top học viên"
              icon={Trophy}
              iconTint="text-emerald-700 bg-emerald-500/10"
              count={top.length}
            >
              {top.map((s) => {
                const cls = classes.find((c) => c.id === s.classId);
                return (
                  <StudentRow
                    key={s.id}
                    name={s.name}
                    sub={cls?.name ?? ""}
                    score={s.avg}
                    classId={s.classId}
                    tone="good"
                  />
                );
              })}
            </Panel>
          </div>
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
                {r.name.split(" ").slice(-1)[0].charAt(0)}
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

function ClassCard({ cls, riskCount }: { cls: (typeof classes)[number]; riskCount: number }) {
  const isPrimary = cls.role === "primary";

  return (
    <div className="group relative overflow-hidden rounded-2xl border border-border bg-surface p-5 shadow-soft transition hover:-translate-y-0.5 hover:shadow-elevated">
      <div className="flex items-start justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="rounded-md bg-primary/10 px-2 py-0.5 text-[10px] font-bold uppercase text-primary">
              {cls.levelCode}
            </span>
            <span
              className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-semibold ${
                isPrimary
                  ? "bg-violet-500/10 text-violet-700"
                  : "bg-amber-500/10 text-amber-700"
              }`}
            >
              {isPrimary ? <Crown className="h-3 w-3" /> : <UserCog className="h-3 w-3" />}
              {isPrimary ? "Chủ nhiệm" : "Trợ giảng"}
            </span>
            <span className="text-[11px] text-muted-foreground">{cls.schedule}</span>
          </div>
          <div className="mt-1 truncate font-display text-lg font-semibold text-foreground">{cls.name}</div>
          <div className="mt-0.5 text-[11px] text-muted-foreground">
            {cls.room ?? ""} {cls.startedAt ? `· khai giảng ${cls.startedAt}` : ""}
          </div>
        </div>
        <Link
          to="/teacher/classes/$classId"
          params={{ classId: cls.id }}
          className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-muted text-muted-foreground transition hover:bg-foreground hover:text-background"
          aria-label="Mở chi tiết lớp"
        >
          <ArrowUpRight className="h-4 w-4" />
        </Link>
      </div>

      <div className="mt-4 grid grid-cols-4 gap-2">
        <Stat label="Sĩ số" value={cls.studentCount} />
        <Stat label="Tiến độ" value={`${cls.avgProgress}%`} />
        <Stat label="Điểm TB" value={cls.avgScore} />
        <Stat label="Cần hỗ trợ" value={riskCount} tone={riskCount > 0 ? "warn" : "default"} />
      </div>

      <div className="mt-4 flex items-center justify-end text-[11px]">
        <span className="inline-flex items-center gap-1 text-emerald-600">
          <TrendingUp className="h-3 w-3" /> {cls.attendance}% tham gia
        </span>
      </div>
    </div>
  );
}

function Stat({
  label,
  value,
  tone = "default",
}: {
  label: string;
  value: string | number;
  tone?: "default" | "warn";
}) {
  return (
    <div
      className={`rounded-xl p-2.5 text-center ${
        tone === "warn" ? "bg-rose-500/10" : "bg-muted/40"
      }`}
    >
      <div className={`text-base font-bold ${tone === "warn" ? "text-rose-700" : "text-foreground"}`}>
        {value}
      </div>
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</div>
    </div>
  );
}

function Panel({
  title,
  icon: Icon,
  iconTint,
  count,
  children,
}: {
  title: string;
  icon: typeof AlertTriangle;
  iconTint: string;
  count: number;
  children: React.ReactNode;
}) {
  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-surface">
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <div className="flex items-center gap-2">
          <span className={`inline-flex h-7 w-7 items-center justify-center rounded-lg ${iconTint}`}>
            <Icon className="h-4 w-4" />
          </span>
          <span className="text-sm font-semibold text-foreground">{title}</span>
        </div>
        <span className="text-[11px] text-muted-foreground">{count}</span>
      </div>
      <div className="divide-y divide-border">{children}</div>
    </div>
  );
}

function StudentRow({
  name,
  sub,
  score,
  classId,
  tone,
}: {
  name: string;
  sub: string;
  score: number;
  classId: string;
  tone: "warn" | "good";
}) {
  const initial = name.split(" ").slice(-1)[0].charAt(0);
  return (
    <div className="flex items-center gap-3 px-4 py-2.5">
      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-primary to-chart-5 text-[11px] font-semibold text-primary-foreground">
        {initial}
      </div>
      <div className="min-w-0 flex-1">
        <div className="truncate text-sm font-medium text-foreground">{name}</div>
        <div className="truncate text-[11px] text-muted-foreground">{sub}</div>
      </div>
      <span
        className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${
          tone === "warn"
            ? "bg-rose-500/10 text-rose-700"
            : "bg-emerald-500/10 text-emerald-700"
        }`}
      >
        {score}đ
      </span>
      <Link
        to="/teacher/classes/$classId"
        params={{ classId }}
        className="inline-flex h-7 w-7 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground"
        aria-label="Nhắn tin"
      >
        <Mail className="h-3.5 w-3.5" />
      </Link>
    </div>
  );
}

function EmptyRow({ text }: { text: string }) {
  return <div className="px-4 py-6 text-center text-xs text-muted-foreground">{text}</div>;
}
