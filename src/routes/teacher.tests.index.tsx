import { createFileRoute, Link } from "@tanstack/react-router";
import { TopNav } from "@/components/TopNav";
import { useRole } from "@/contexts/RoleContext";
import { tests, testStatus } from "@/lib/tests-data";
import { classes } from "@/lib/teacher-data";
import {
  ScrollText,
  Plus,
  Clock,
  Users,
  Calendar,
  CheckCircle2,
  Hourglass,
  Lock,
} from "lucide-react";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/teacher/tests/")({
  head: () => ({ meta: [{ title: "Thi cử — UNICOM LMS" }] }),
  component: TestsList,
});

const classNameById = (id: string) => classes.find((c) => c.id === id)?.name ?? id;

function statusMeta(s: ReturnType<typeof testStatus>) {
  if (s === "upcoming")
    return { label: "Chưa mở", icon: Hourglass, cls: "bg-amber-100 text-amber-700" };
  if (s === "open")
    return { label: "Đang mở", icon: CheckCircle2, cls: "bg-emerald-100 text-emerald-700" };
  return { label: "Đã đóng", icon: Lock, cls: "bg-muted text-muted-foreground" };
}

function TestsList() {
  const { role } = useRole();
  const isAdmin = role === "admin";

  return (
    <div className="min-h-screen bg-background">
      <TopNav />
      <div className="mx-auto max-w-7xl px-6 pb-20 pt-10 sm:px-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-primary">
              <ScrollText className="h-3.5 w-3.5" /> Quản lý kỳ thi
            </span>
            <h1 className="mt-1 font-display text-3xl font-semibold tracking-tight sm:text-4xl">
              Thi cử
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Danh sách đề thi đã tạo cho các lớp. Theo dõi lịch mở, số học viên thi và chấm bài.
            </p>
          </div>
          {isAdmin && (
            <Link
              to="/admin/tests/new"
              className="inline-flex items-center gap-1.5 rounded-xl px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-soft"
              style={{ background: "var(--gradient-brand)" }}
            >
              <Plus className="h-4 w-4" /> Tạo đề thi mới
            </Link>
          )}
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-4">
          <Stat label="Tổng đề thi" value={tests.length} />
          <Stat label="Đang mở" value={tests.filter((t) => testStatus(t) === "open").length} />
          <Stat label="Chờ mở" value={tests.filter((t) => testStatus(t) === "upcoming").length} />
          <Stat
            label="Cần chấm"
            value={tests.reduce((s, t) => s + (t.submitted - t.graded), 0)}
          />
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {tests.map((t) => {
            const st = testStatus(t);
            const m = statusMeta(st);
            const Icon = m.icon;
            return (
              <Link
                key={t.id}
                to="/teacher/tests/$testId"
                params={{ testId: t.id }}
                className="group relative flex flex-col rounded-3xl border border-border bg-surface p-5 shadow-soft transition hover:shadow-lg"
              >
                <div className="flex items-start justify-between gap-3">
                  <span
                    className={cn(
                      "inline-flex items-center gap-1 rounded-full px-2 py-1 text-[11px] font-semibold",
                      m.cls,
                    )}
                  >
                    <Icon className="h-3 w-3" /> {m.label}
                  </span>
                  <span className="rounded-lg bg-primary/10 px-2 py-1 text-[11px] font-bold uppercase text-primary">
                    {t.level}
                  </span>
                </div>

                <h3 className="mt-3 font-display text-lg font-semibold text-foreground line-clamp-1">
                  {t.name}
                </h3>
                <p className="mt-1 text-xs text-muted-foreground line-clamp-2">
                  {t.description}
                </p>

                <div className="mt-3 flex flex-wrap gap-1">
                  {t.classIds.map((cid) => (
                    <span
                      key={cid}
                      className="rounded-md bg-muted px-2 py-0.5 text-[11px] font-medium"
                    >
                      {classNameById(cid)}
                    </span>
                  ))}
                </div>

                <div className="mt-4 grid grid-cols-2 gap-y-2 border-t border-border pt-3 text-xs text-muted-foreground">
                  <span className="inline-flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5" />{" "}
                    {new Date(t.openAt).toLocaleDateString("vi-VN")}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5" /> {t.durationMinutes} phút
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <Users className="h-3.5 w-3.5" /> {t.submitted}/{t.registered} HS
                  </span>
                  <span className="text-right font-semibold text-foreground">
                    {t.avgScore ? `TB ${t.avgScore}` : "—"}
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl border border-border bg-surface p-4 shadow-soft">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="mt-1 font-display text-2xl font-semibold">{value}</div>
    </div>
  );
}
