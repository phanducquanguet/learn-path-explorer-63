import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
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
  LayoutGrid,
  Table as TableIcon,
  GraduationCap,
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
  const [view, setView] = useState<"grid" | "table">("grid");

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
          <div className="flex items-center gap-2">
            <div className="inline-flex items-center rounded-xl border border-border bg-surface p-1 shadow-soft">
              <button
                onClick={() => setView("grid")}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition",
                  view === "grid"
                    ? "bg-foreground text-background"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                <LayoutGrid className="h-3.5 w-3.5" /> Lưới
              </button>
              <button
                onClick={() => setView("table")}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition",
                  view === "table"
                    ? "bg-foreground text-background"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                <TableIcon className="h-3.5 w-3.5" /> Bảng
              </button>
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

        {view === "grid" ? (
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

                  <div className="mt-3 flex items-start gap-1.5">
                    <GraduationCap className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                    <div className="flex flex-wrap gap-1">
                      {t.classIds.map((cid) => (
                        <span
                          key={cid}
                          className="rounded-md bg-muted px-2 py-0.5 text-[11px] font-medium text-foreground"
                        >
                          {classNameById(cid)}
                        </span>
                      ))}
                    </div>
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
        ) : (
          <div className="mt-6 overflow-hidden rounded-2xl border border-border bg-surface shadow-soft">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted/50 text-xs uppercase tracking-wider text-muted-foreground">
                  <tr>
                    <th className="px-4 py-3 text-left font-semibold">Đề thi</th>
                    <th className="px-4 py-3 text-left font-semibold">Lớp</th>
                    <th className="px-4 py-3 text-left font-semibold">Trình độ</th>
                    <th className="px-4 py-3 text-left font-semibold">Trạng thái</th>
                    <th className="px-4 py-3 text-left font-semibold">Lịch mở</th>
                    <th className="px-4 py-3 text-left font-semibold">Thời lượng</th>
                    <th className="px-4 py-3 text-left font-semibold">HS</th>
                    <th className="px-4 py-3 text-right font-semibold">TB</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {tests.map((t) => {
                    const st = testStatus(t);
                    const m = statusMeta(st);
                    const Icon = m.icon;
                    return (
                      <tr key={t.id} className="transition hover:bg-muted/30">
                        <td className="px-4 py-3">
                          <Link
                            to="/teacher/tests/$testId"
                            params={{ testId: t.id }}
                            className="flex flex-col"
                          >
                            <span className="font-semibold text-foreground line-clamp-1">
                              {t.name}
                            </span>
                            <span className="text-xs text-muted-foreground line-clamp-1">
                              {t.description}
                            </span>
                          </Link>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex flex-wrap gap-1">
                            {t.classIds.map((cid) => (
                              <span
                                key={cid}
                                className="inline-flex items-center gap-1 rounded-md bg-muted px-2 py-0.5 text-[11px] font-medium"
                              >
                                <GraduationCap className="h-3 w-3" />
                                {classNameById(cid)}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className="rounded-lg bg-primary/10 px-2 py-1 text-[11px] font-bold uppercase text-primary">
                            {t.level}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={cn(
                              "inline-flex items-center gap-1 rounded-full px-2 py-1 text-[11px] font-semibold",
                              m.cls,
                            )}
                          >
                            <Icon className="h-3 w-3" /> {m.label}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-xs text-muted-foreground">
                          {new Date(t.openAt).toLocaleDateString("vi-VN")}
                        </td>
                        <td className="px-4 py-3 text-xs text-muted-foreground">
                          {t.durationMinutes} phút
                        </td>
                        <td className="px-4 py-3 text-xs text-muted-foreground">
                          {t.submitted}/{t.registered}
                        </td>
                        <td className="px-4 py-3 text-right font-semibold">
                          {t.avgScore ? t.avgScore : "—"}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
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
