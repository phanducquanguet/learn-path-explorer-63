import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { TopNav } from "@/components/TopNav";
import { examEvents, type ExamEventStatus } from "@/lib/exam-events";
import {
  Activity,
  ArrowLeft,
  Building2,
  CalendarClock,
  ChevronRight,
  Clock,
  FileStack,
  GraduationCap,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/admin/tests/monitor/")({
  head: () => ({ meta: [{ title: "Giám sát kỳ thi — UNICOM LMS" }] }),
  component: MonitorList,
});

const STATUS_META: Record<
  ExamEventStatus,
  { label: string; badge: string; dot: string }
> = {
  live: {
    label: "Đang diễn ra",
    badge: "bg-emerald-100 text-emerald-700",
    dot: "bg-emerald-500 animate-pulse",
  },
  upcoming: {
    label: "Sắp diễn ra",
    badge: "bg-amber-100 text-amber-700",
    dot: "bg-amber-500",
  },
  finished: {
    label: "Đã kết thúc",
    badge: "bg-muted text-muted-foreground",
    dot: "bg-muted-foreground/50",
  },
};

const fmtTime = (iso: string) =>
  new Date(iso).toLocaleString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });

function MonitorList() {
  const [statusFilter, setStatusFilter] = useState<ExamEventStatus | "all">("live");

  const filtered = useMemo(
    () =>
      examEvents.filter((e) => statusFilter === "all" || e.status === statusFilter),
    [statusFilter],
  );

  const counts = useMemo(() => {
    const c = { live: 0, upcoming: 0, finished: 0 } as Record<ExamEventStatus, number>;
    examEvents.forEach((e) => (c[e.status] += 1));
    return c;
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <TopNav />
      <div className="mx-auto max-w-7xl px-6 pb-20 pt-10 sm:px-8">
        <Link
          to="/admin/tests"
          className="inline-flex items-center gap-1 text-xs font-semibold text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Quay lại Thi cử
        </Link>

        <div className="mt-3 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-primary">
              <Activity className="h-3.5 w-3.5" /> Giám sát trực tiếp
            </span>
            <h1 className="mt-1 font-display text-3xl font-semibold tracking-tight sm:text-4xl">
              Các kỳ thi
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Kỳ thi được thiết lập theo lớp. Mỗi kỳ có thể gồm nhiều đề phụ được phân ngẫu nhiên
              cho thí sinh.
            </p>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap gap-1">
          {(
            [
              ["all", `Tất cả (${examEvents.length})`],
              ["live", `Đang diễn ra (${counts.live})`],
              ["upcoming", `Sắp diễn ra (${counts.upcoming})`],
              ["finished", `Đã kết thúc (${counts.finished})`],
            ] as const
          ).map(([k, label]) => (
            <button
              key={k}
              onClick={() => setStatusFilter(k as ExamEventStatus | "all")}
              className={cn(
                "rounded-lg border px-3 py-1.5 text-xs font-medium transition",
                statusFilter === k
                  ? "border-foreground bg-foreground text-background"
                  : "border-border bg-surface text-muted-foreground hover:bg-muted",
              )}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="mt-4 grid gap-3 md:grid-cols-2">
          {filtered.map((e) => {
            const meta = STATUS_META[e.status];
            return (
              <Link
                key={e.id}
                to="/admin/tests/monitor/$eventId"
                params={{ eventId: e.id }}
                className="group rounded-2xl border border-border bg-surface p-5 shadow-soft transition hover:border-foreground/30 hover:shadow-elevated"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={cn(
                          "inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[11px] font-semibold",
                          meta.badge,
                        )}
                      >
                        <span className={cn("h-1.5 w-1.5 rounded-full", meta.dot)} />
                        {meta.label}
                      </span>
                      <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-[11px] font-semibold text-foreground">
                        <Building2 className="h-3 w-3" /> {e.orgName}
                      </span>
                    </div>
                    <h3 className="mt-2 truncate font-display text-lg font-semibold text-foreground">
                      {e.sessionCode}
                    </h3>
                    <div className="mt-1 text-xs text-muted-foreground line-clamp-1">
                      {e.name}
                    </div>
                    <div className="mt-2 flex flex-wrap items-center gap-1.5">
                      <span className="inline-flex items-center gap-1 text-[11px] font-medium text-muted-foreground">
                        <GraduationCap className="h-3 w-3" />
                        {e.classes.length} lớp:
                      </span>
                      {e.classes.map((c) => (
                        <span
                          key={c.id}
                          className="rounded-md border border-border bg-background px-1.5 py-0.5 text-[11px] font-medium text-foreground"
                        >
                          {c.name}
                        </span>
                      ))}
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground transition group-hover:translate-x-0.5" />
                </div>

                <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
                  <Metric icon={CalendarClock} label="Bắt đầu" value={fmtTime(e.startAt)} />
                  <Metric icon={Clock} label="Thời lượng" value={`${e.durationMinutes} phút`} />
                  <Metric icon={FileStack} label="Mã đề" value={`${e.paperCount} mã`} />
                  <Metric icon={Users} label="Thí sinh" value={`${e.candidateCount} người`} />
                </div>
              </Link>
            );
          })}
          {filtered.length === 0 && (
            <div className="rounded-2xl border border-dashed border-border bg-surface p-10 text-center text-sm text-muted-foreground md:col-span-2">
              Không có kỳ thi phù hợp.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Metric({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-border bg-background/60 px-3 py-2">
      <div className="inline-flex items-center gap-1 text-[10px] uppercase tracking-wider text-muted-foreground">
        <Icon className="h-3 w-3" /> {label}
      </div>
      <div className="mt-0.5 text-xs font-semibold text-foreground">{value}</div>
    </div>
  );
}
