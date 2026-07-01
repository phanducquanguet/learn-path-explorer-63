import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { TopNav } from "@/components/TopNav";
import { ExamMonitorView } from "@/components/ExamMonitorView";
import { getExamEvent } from "@/lib/exam-events";
import {
  ArrowLeft,
  Building2,
  CalendarClock,
  Clock,
  FileStack,
  GraduationCap,
  UserCheck,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/admin/tests/monitor/$eventId")({
  head: () => ({ meta: [{ title: "Giám sát kỳ thi — UNICOM LMS" }] }),
  component: MonitorDetail,
  notFoundComponent: () => (
    <div className="min-h-screen bg-background">
      <TopNav />
      <div className="mx-auto max-w-3xl px-6 py-16 text-center">
        <h1 className="font-display text-2xl font-semibold">Không tìm thấy kỳ thi</h1>
        <Link to="/admin/tests/monitor" className="mt-4 inline-block text-sm text-primary">
          ← Quay lại danh sách
        </Link>
      </div>
    </div>
  ),
});

const fmtRange = (a: string, b: string) => {
  const s = new Date(a);
  const e = new Date(b);
  const f = (d: Date) =>
    d.toLocaleString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  return `${f(s)} → ${f(e)}`;
};

function MonitorDetail() {
  const { eventId } = Route.useParams();
  const event = getExamEvent(eventId);
  if (!event) throw notFound();

  const statusLabel =
    event.status === "live"
      ? "Đang diễn ra"
      : event.status === "upcoming"
        ? "Sắp diễn ra"
        : "Đã kết thúc";
  const statusClass =
    event.status === "live"
      ? "bg-emerald-100 text-emerald-700"
      : event.status === "upcoming"
        ? "bg-amber-100 text-amber-700"
        : "bg-muted text-muted-foreground";

  return (
    <div className="min-h-screen bg-background">
      <TopNav />
      <div className="mx-auto max-w-7xl px-6 pb-20 pt-10 sm:px-8">
        <Link
          to="/admin/tests/monitor"
          className="inline-flex items-center gap-1 text-xs font-semibold text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Danh sách kỳ thi
        </Link>

        <div className="mt-3 rounded-2xl border border-border bg-surface p-6 shadow-soft">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="min-w-0">
              <span
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[11px] font-semibold",
                  statusClass,
                )}
              >
                <span
                  className={cn(
                    "h-1.5 w-1.5 rounded-full",
                    event.status === "live"
                      ? "bg-emerald-500 animate-pulse"
                      : event.status === "upcoming"
                        ? "bg-amber-500"
                        : "bg-muted-foreground/50",
                  )}
                />
                {statusLabel}
              </span>
              <h1 className="mt-2 font-display text-2xl font-semibold sm:text-3xl">
                {event.sessionCode}
              </h1>
              <div className="mt-1 text-sm text-muted-foreground">{event.name}</div>
              <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                <span className="inline-flex items-center gap-1">
                  <Building2 className="h-3 w-3" /> {event.orgName}
                </span>
                <span className="inline-flex items-center gap-1">
                  <GraduationCap className="h-3 w-3" />
                  {event.classes.length} lớp:
                </span>
                {event.classes.map((c) => (
                  <span
                    key={c.id}
                    className="rounded-md border border-border bg-background px-1.5 py-0.5 text-[11px] font-medium text-foreground"
                  >
                    {c.name}
                  </span>
                ))}
                {event.proctor && (
                  <span className="inline-flex items-center gap-1">
                    <UserCheck className="h-3 w-3" /> Giám thị: {event.proctor}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Metric
              icon={CalendarClock}
              label="Thời gian"
              value={fmtRange(event.startAt, event.endAt)}
            />
            <Metric icon={Clock} label="Thời lượng" value={`${event.durationMinutes} phút`} />
            <Metric
              icon={FileStack}
              label="Đề phụ"
              value={`${event.paperCount} đề (phân ngẫu nhiên)`}
            />
            <Metric icon={Users} label="Thí sinh" value={`${event.candidateCount} người`} />
          </div>
        </div>

        <div className="mt-6">
          <h2 className="font-display text-lg font-semibold">Thí sinh được giao</h2>
          <p className="text-xs text-muted-foreground">
            Danh sách theo lớp {event.className}. Theo dõi trạng thái làm bài và reset khi cần.
          </p>
        </div>

        <ExamMonitorView examId={event.id} />
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
