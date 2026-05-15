import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { TopNav } from "@/components/TopNav";
import { classes, students, type ClassRoom } from "@/lib/teacher-data";
import {
  Users,
  Search,
  TrendingUp,
  Sparkles,
  Crown,
  HandHelping,
  ArrowUpRight,
  Calendar,
  MapPin,
} from "lucide-react";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/teacher/classes")({
  head: () => ({ meta: [{ title: "Lớp học của tôi — UNICOM LMS" }] }),
  component: TeacherClassesPage,
});

function TeacherClassesPage() {
  const [q, setQ] = useState("");
  const [tab, setTab] = useState<"all" | "primary" | "assistant">("all");

  const filtered = useMemo(() => {
    return classes.filter((c) => {
      if (tab !== "all" && c.role !== tab) return false;
      if (q && !`${c.name} ${c.levelCode} ${c.room ?? ""}`.toLowerCase().includes(q.toLowerCase()))
        return false;
      return true;
    });
  }, [q, tab]);

  const primaryCount = classes.filter((c) => c.role === "primary").length;
  const assistantCount = classes.filter((c) => c.role === "assistant").length;

  return (
    <div className="min-h-screen bg-background">
      <TopNav />
      <div className="mx-auto max-w-7xl px-6 pb-20 pt-10 sm:px-8">
        <div className="flex flex-col gap-2">
          <span className="inline-flex w-fit items-center gap-2 text-xs font-semibold uppercase tracking-wider text-primary">
            <Sparkles className="h-3.5 w-3.5" /> Quản lý lớp
          </span>
          <h1 className="font-display text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            Lớp học của tôi
          </h1>
          <p className="text-sm text-muted-foreground">
            Bạn đang phụ trách <b>{primaryCount}</b> lớp chính và hỗ trợ <b>{assistantCount}</b> lớp khác với vai trò trợ giảng.
          </p>
        </div>

        {/* Toolbar */}
        <div className="mt-8 flex flex-col items-center gap-3 rounded-2xl border border-border bg-surface p-3 shadow-soft sm:flex-row">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Tìm lớp, cấp độ, phòng học..."
              className="h-10 w-full rounded-xl border border-border bg-background pl-9 pr-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
          </div>
          <div className="flex items-center gap-1 rounded-xl border border-border bg-background p-1 text-xs">
            {(
              [
                { v: "all", label: `Tất cả (${classes.length})` },
                { v: "primary", label: `Giáo viên chính (${primaryCount})` },
                { v: "assistant", label: `Trợ giảng (${assistantCount})` },
              ] as const
            ).map((o) => (
              <button
                key={o.v}
                onClick={() => setTab(o.v)}
                className={cn(
                  "rounded-lg px-3 py-1.5 font-medium transition",
                  tab === o.v
                    ? "bg-foreground text-background"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {o.label}
              </button>
            ))}
          </div>
        </div>

        {/* Cards */}
        {filtered.length === 0 ? (
          <div className="mt-12 rounded-3xl border border-dashed border-border bg-surface/40 p-12 text-center">
            <Users className="mx-auto mb-3 h-8 w-8 text-muted-foreground" />
            <p className="text-sm font-medium text-foreground">Không tìm thấy lớp phù hợp</p>
          </div>
        ) : (
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((cls) => (
              <ClassCard key={cls.id} cls={cls} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function ClassCard({ cls }: { cls: ClassRoom }) {
  const max = Math.max(...cls.weeklyMinutes, 1);
  const pts = cls.weeklyMinutes
    .map((v, i) => `${(i / (cls.weeklyMinutes.length - 1)) * 100},${100 - (v / max) * 100}`)
    .join(" ");
  const memberCount = students.filter((s) => s.classId === cls.id).length || cls.studentCount;
  const isPrimary = cls.role === "primary";

  return (
    <Link
      to="/teacher/classes/$classId"
      params={{ classId: cls.id }}
      className="group relative block overflow-hidden rounded-2xl border border-border bg-surface p-5 shadow-soft transition hover:-translate-y-0.5 hover:shadow-elevated"
    >
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2">
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
          <div className="mt-1.5 font-display text-lg font-semibold text-foreground">
            {cls.name}
          </div>
          <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-muted-foreground">
            <span className="inline-flex items-center gap-1">
              <Calendar className="h-3 w-3" /> {cls.schedule}
            </span>
            {cls.room && (
              <span className="inline-flex items-center gap-1">
                <MapPin className="h-3 w-3" /> {cls.room}
              </span>
            )}
          </div>
        </div>
        <Link
          to="/teacher/classes/$classId"
          params={{ classId: cls.id }}
          className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-muted text-muted-foreground transition hover:bg-foreground hover:text-background"
          title="Xem chi tiết lớp"
        >
          <ArrowUpRight className="h-4 w-4" />
        </Link>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-3">
        <Stat label="Sĩ số" value={memberCount} />
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
