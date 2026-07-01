import { useMemo, useState } from "react";
import {
  Activity,
  CheckCircle2,
  Circle,
  Clock,
  MonitorSmartphone,
  Pause,
  Play,
  RotateCcw,
  Search,
  Trash2,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  initialMonitorSessions,
  type MonitorSession,
  type MonitorStatus,
  type SectionProgress,
} from "@/lib/exam-monitoring";

const STATUS_META: Record<
  MonitorStatus,
  { label: string; badge: string; dot: string; icon: React.ComponentType<{ className?: string }> }
> = {
  "not-started": {
    label: "Chưa làm",
    badge: "bg-muted text-muted-foreground",
    dot: "bg-muted-foreground/40",
    icon: Circle,
  },
  "in-progress": {
    label: "Đang làm",
    badge: "bg-emerald-100 text-emerald-700",
    dot: "bg-emerald-500 animate-pulse",
    icon: Play,
  },
  paused: {
    label: "Tạm dừng",
    badge: "bg-amber-100 text-amber-700",
    dot: "bg-amber-500",
    icon: Pause,
  },
  submitted: {
    label: "Đã nộp",
    badge: "bg-primary/10 text-primary",
    dot: "bg-primary",
    icon: CheckCircle2,
  },
};

const relTime = (iso?: string) => {
  if (!iso) return "—";
  const s = Math.max(0, Math.floor((Date.now() - new Date(iso).getTime()) / 1000));
  if (s < 60) return `${s}s trước`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m} phút trước`;
  const h = Math.floor(m / 60);
  return `${h} giờ trước`;
};

const resetSectionOn = (s: MonitorSession, skill: string): MonitorSession => ({
  ...s,
  sections: s.sections.map((sec) => (sec.skill === skill ? { ...sec, done: 0 } : sec)),
  status: s.status === "submitted" ? "in-progress" : s.status,
  submittedAt: undefined,
});

const resetAllOn = (s: MonitorSession): MonitorSession => ({
  ...s,
  sections: s.sections.map((sec) => ({ ...sec, done: 0 })),
  status: "not-started",
  startedAt: undefined,
  lastActiveAt: undefined,
  submittedAt: undefined,
  elapsedMinutes: 0,
  currentSection: undefined,
});

export function ExamMonitorView({ examId }: { examId: string }) {
  const [sessions, setSessions] = useState<MonitorSession[]>(() => initialMonitorSessions(examId));
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<MonitorStatus | "all">("all");
  const [active, setActive] = useState<MonitorSession | null>(null);

  const counts = useMemo(() => {
    const c: Record<MonitorStatus, number> = {
      "not-started": 0,
      "in-progress": 0,
      paused: 0,
      submitted: 0,
    };
    sessions.forEach((s) => (c[s.status] += 1));
    return c;
  }, [sessions]);

  const filtered = useMemo(() => {
    return sessions.filter((s) => {
      if (statusFilter !== "all" && s.status !== statusFilter) return false;
      if (query && !`${s.studentName} ${s.studentClass}`.toLowerCase().includes(query.toLowerCase()))
        return false;
      return true;
    });
  }, [sessions, statusFilter, query]);

  const resetSection = (id: string, skill: string, label: string) => {
    const s = sessions.find((x) => x.id === id);
    if (!s) return;
    if (!window.confirm(`Reset phần "${label}" của ${s.studentName}? Học viên sẽ phải làm lại phần này.`))
      return;
    setSessions((prev) => prev.map((x) => (x.id === id ? resetSectionOn(x, skill) : x)));
    setActive((a) => (a && a.id === id ? resetSectionOn(a, skill) : a));
  };

  const resetAll = (id: string) => {
    const s = sessions.find((x) => x.id === id);
    if (!s) return;
    if (!window.confirm(`Reset TOÀN BỘ bài làm của ${s.studentName}? Toàn bộ tiến độ sẽ mất.`)) return;
    setSessions((prev) => prev.map((x) => (x.id === id ? resetAllOn(x) : x)));
    setActive((a) => (a && a.id === id ? resetAllOn(a) : a));
  };

  return (
    <div className="mt-6 space-y-5">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <SummaryCard
          icon={Users}
          label="Tổng học viên"
          value={sessions.length}
          tone="text-foreground"
        />
        <SummaryCard
          icon={Play}
          label="Đang làm"
          value={counts["in-progress"]}
          tone="text-emerald-700"
        />
        <SummaryCard icon={Pause} label="Tạm dừng" value={counts.paused} tone="text-amber-700" />
        <SummaryCard
          icon={CheckCircle2}
          label="Đã nộp"
          value={counts.submitted}
          tone="text-primary"
        />
      </div>

      <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-border bg-surface p-3">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Tìm học viên hoặc lớp..."
            className="w-full rounded-lg border border-border bg-background py-2 pl-9 pr-3 text-sm"
          />
        </div>
        <div className="flex flex-wrap gap-1">
          {(
            [
              ["all", `Tất cả (${sessions.length})`],
              ["in-progress", `Đang làm (${counts["in-progress"]})`],
              ["paused", `Tạm dừng (${counts.paused})`],
              ["not-started", `Chưa làm (${counts["not-started"]})`],
              ["submitted", `Đã nộp (${counts.submitted})`],
            ] as const
          ).map(([k, label]) => (
            <button
              key={k}
              onClick={() => setStatusFilter(k as MonitorStatus | "all")}
              className={cn(
                "rounded-lg border px-3 py-1.5 text-xs font-medium transition",
                statusFilter === k
                  ? "border-foreground bg-foreground text-background"
                  : "border-border bg-background text-muted-foreground hover:bg-muted",
              )}
            >
              {label}
            </button>
          ))}
        </div>
        <div className="ml-auto inline-flex items-center gap-1.5 text-xs text-muted-foreground">
          <Activity className="h-3 w-3 text-emerald-500" />
          Cập nhật thời gian thực
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-border bg-surface shadow-soft">
        <table className="w-full text-sm">
          <thead className="bg-muted/40 text-xs uppercase tracking-wider text-muted-foreground">
            <tr>
              <th className="px-4 py-3 text-left">Học viên</th>
              <th className="px-4 py-3 text-left">Trạng thái</th>
              <th className="px-4 py-3 text-left">Đang ở phần</th>
              <th className="px-4 py-3 text-left w-[280px]">Tiến độ tổng</th>
              <th className="px-4 py-3 text-center">Thời gian</th>
              <th className="px-4 py-3 text-center">Hoạt động cuối</th>
              <th className="px-4 py-3 text-right">Hành động</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((s) => {
              const meta = STATUS_META[s.status];
              const total = s.sections.reduce((a, b) => a + b.total, 0);
              const done = s.sections.reduce((a, b) => a + b.done, 0);
              const pct = total ? Math.round((done / total) * 100) : 0;
              const current = s.sections.find((x) => x.skill === s.currentSection);
              return (
                <tr key={s.id} className="border-t border-border hover:bg-muted/30">
                  <td className="px-4 py-3">
                    <div className="font-medium text-foreground">{s.studentName}</div>
                    <div className="text-xs text-muted-foreground">{s.studentClass}</div>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={cn(
                        "inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[11px] font-semibold",
                        meta.badge,
                      )}
                    >
                      <span className={cn("h-1.5 w-1.5 rounded-full", meta.dot)} />
                      {meta.label}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {current ? (
                      <div>
                        <div className="font-medium text-foreground">{current.label}</div>
                        <div className="text-xs text-muted-foreground">
                          Câu {current.done}/{current.total}
                        </div>
                      </div>
                    ) : s.status === "submitted" ? (
                      <span className="text-xs text-muted-foreground">Đã hoàn tất</span>
                    ) : (
                      <span className="text-xs text-muted-foreground">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
                        <div
                          className={cn(
                            "h-full rounded-full transition-all",
                            s.status === "submitted" ? "bg-primary" : "bg-emerald-500",
                          )}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <span className="w-16 text-right text-xs font-semibold text-foreground">
                        {done}/{total}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" /> {s.elapsedMinutes}'
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center text-xs text-muted-foreground">
                    {relTime(s.lastActiveAt)}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="inline-flex gap-1">
                      <button
                        onClick={() => setActive(s)}
                        className="rounded-lg border border-border bg-background px-2.5 py-1.5 text-xs font-semibold hover:bg-muted"
                      >
                        Chi tiết
                      </button>
                      <button
                        onClick={() => resetAll(s.id)}
                        disabled={s.status === "not-started"}
                        title="Reset toàn bộ bài làm"
                        className="inline-flex items-center gap-1 rounded-lg border border-destructive/40 bg-destructive/5 px-2.5 py-1.5 text-xs font-semibold text-destructive hover:bg-destructive/10 disabled:pointer-events-none disabled:opacity-40"
                      >
                        <Trash2 className="h-3 w-3" /> Reset
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-10 text-center text-muted-foreground">
                  Không có học viên phù hợp.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {active && (
        <DetailDrawer
          session={active}
          onClose={() => setActive(null)}
          onResetSection={(skill, label) => resetSection(active.id, skill, label)}
          onResetAll={() => resetAll(active.id)}
        />
      )}
    </div>
  );
}

function SummaryCard({
  icon: Icon,
  label,
  value,
  tone,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: number;
  tone: string;
}) {
  return (
    <div className="rounded-2xl border border-border bg-surface px-4 py-3 shadow-soft">
      <div className="flex items-center gap-1.5 text-[11px] uppercase tracking-wider text-muted-foreground">
        <Icon className="h-3 w-3" /> {label}
      </div>
      <div className={cn("mt-1 font-display text-2xl font-semibold", tone)}>{value}</div>
    </div>
  );
}

function DetailDrawer({
  session,
  onClose,
  onResetSection,
  onResetAll,
}: {
  session: MonitorSession;
  onClose: () => void;
  onResetSection: (skill: string, label: string) => void;
  onResetAll: () => void;
}) {
  const meta = STATUS_META[session.status];
  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/40">
      <button onClick={onClose} className="absolute inset-0" aria-label="Close" />
      <div className="relative flex h-full w-full max-w-2xl flex-col bg-background shadow-elevated">
        <div className="flex items-start justify-between border-b border-border p-6">
          <div>
            <h2 className="font-display text-xl font-semibold">{session.studentName}</h2>
            <p className="text-xs text-muted-foreground">{session.studentClass}</p>
            <span
              className={cn(
                "mt-2 inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[11px] font-semibold",
                meta.badge,
              )}
            >
              <span className={cn("h-1.5 w-1.5 rounded-full", meta.dot)} />
              {meta.label}
            </span>
          </div>
          <button onClick={onClose} className="rounded-lg p-2 text-muted-foreground hover:bg-muted">
            ✕
          </button>
        </div>

        <div className="flex-1 space-y-5 overflow-y-auto p-6">
          <div className="grid grid-cols-2 gap-3 text-sm">
            <Info label="Bắt đầu" value={session.startedAt ? new Date(session.startedAt).toLocaleString("vi-VN") : "—"} />
            <Info label="Nộp lúc" value={session.submittedAt ? new Date(session.submittedAt).toLocaleString("vi-VN") : "—"} />
            <Info label="Thời gian đã dùng" value={`${session.elapsedMinutes} phút`} />
            <Info label="Hoạt động cuối" value={relTime(session.lastActiveAt)} />
            <Info label="Địa chỉ IP" value={session.ip ?? "—"} />
            <Info label="Thiết bị" value={session.device ?? "—"} icon={MonitorSmartphone} />
          </div>

          <div>
            <div className="mb-2 flex items-center justify-between">
              <h3 className="text-sm font-semibold">Tiến độ theo phần</h3>
              <button
                onClick={onResetAll}
                disabled={session.status === "not-started"}
                className="inline-flex items-center gap-1 rounded-lg border border-destructive/40 bg-destructive/5 px-2.5 py-1.5 text-xs font-semibold text-destructive hover:bg-destructive/10 disabled:pointer-events-none disabled:opacity-40"
              >
                <RotateCcw className="h-3 w-3" /> Reset toàn bộ
              </button>
            </div>
            <div className="space-y-2">
              {session.sections.map((sec) => (
                <SectionRow
                  key={sec.skill}
                  section={sec}
                  isCurrent={sec.skill === session.currentSection}
                  onReset={() => onResetSection(sec.skill, sec.label)}
                  canReset={sec.done > 0 || session.status === "submitted"}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function SectionRow({
  section,
  isCurrent,
  onReset,
  canReset,
}: {
  section: SectionProgress;
  isCurrent: boolean;
  onReset: () => void;
  canReset: boolean;
}) {
  const pct = section.total ? Math.round((section.done / section.total) * 100) : 0;
  const done = section.done >= section.total && section.total > 0;
  return (
    <div
      className={cn(
        "rounded-xl border p-3 transition",
        isCurrent ? "border-emerald-300 bg-emerald-50/60" : "border-border bg-surface",
      )}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="font-medium text-foreground">{section.label}</span>
          {isCurrent && (
            <span className="rounded-full bg-emerald-500 px-1.5 py-0.5 text-[10px] font-bold text-white">
              ĐANG LÀM
            </span>
          )}
          {done && !isCurrent && (
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700">
              <CheckCircle2 className="h-3 w-3" /> Hoàn thành
            </span>
          )}
        </div>
        <button
          onClick={onReset}
          disabled={!canReset}
          className="inline-flex items-center gap-1 rounded-md border border-destructive/40 bg-destructive/5 px-2 py-1 text-[11px] font-semibold text-destructive hover:bg-destructive/10 disabled:pointer-events-none disabled:opacity-40"
        >
          <RotateCcw className="h-3 w-3" /> Reset phần
        </button>
      </div>
      <div className="mt-2 flex items-center gap-2">
        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-emerald-500 transition-all"
            style={{ width: `${pct}%` }}
          />
        </div>
        <span className="w-16 text-right text-xs font-semibold text-foreground">
          {section.done}/{section.total}
        </span>
      </div>
    </div>
  );
}

function Info({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string;
  icon?: React.ComponentType<{ className?: string }>;
}) {
  return (
    <div className="rounded-xl border border-border bg-surface px-3 py-2">
      <div className="text-[11px] uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="mt-0.5 inline-flex items-center gap-1.5 text-sm font-medium text-foreground">
        {Icon && <Icon className="h-3.5 w-3.5 text-muted-foreground" />}
        {value}
      </div>
    </div>
  );
}
