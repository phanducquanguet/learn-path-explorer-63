import { useEffect, useMemo, useState } from "react";
import { TopNav } from "@/components/TopNav";
import { classes } from "@/lib/teacher-data";
import { testQuestionCount } from "@/lib/tests-data";
import {
  approvedTests,
  loadSessions,
  saveSessions,
  sessionClassNames,
  sessionStatus,
  SESSION_STATUS_COLOR,
  SESSION_STATUS_LABEL,
  testVersion,
  type ExamSession,
  type SessionStatus,
} from "@/lib/exam-sessions";
import {
  AssessmentTabBar,
  ASSESSMENT_DESCRIPTION,
  ASSESSMENT_TITLE,
  type AssessmentScope,
} from "@/components/assessment/AssessmentTabs";
import { CalendarClock, Plus, Copy, XCircle, PencilLine, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

function fmtDateTime(iso: string) {
  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Asia/Ho_Chi_Minh",
  }).format(new Date(iso));
}

function toInput(iso: string) {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function SessionsList({
  scope = "admin",
  presetTestId,
}: {
  scope?: AssessmentScope;
  presetTestId?: string;
} = {}) {
  const [sessions, setSessions] = useState<ExamSession[]>([]);
  const [now, setNow] = useState(0);
  const [status, setStatus] = useState<SessionStatus | "all">("all");
  const [classFilter, setClassFilter] = useState("all");
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    setSessions(loadSessions());
    setNow(Date.now());
  }, []);
  useEffect(() => {
    if (presetTestId) setDialogOpen(true);
  }, [presetTestId]);

  const tests = useMemo(() => approvedTests(), []);

  const persist = (list: ExamSession[]) => {
    setSessions(list);
    saveSessions(list);
  };

  const counts = useMemo(() => {
    const by = (s: SessionStatus) => sessions.filter((x) => sessionStatus(x, now) === s).length;
    return {
      upcoming: by("upcoming"),
      open: by("open"),
      grading: by("grading"),
      completed: by("completed"),
    };
  }, [sessions, now]);

  const rows = useMemo(
    () =>
      sessions.filter((s) => {
        if (status !== "all" && sessionStatus(s, now) !== status) return false;
        if (classFilter !== "all" && !s.classIds.includes(classFilter)) return false;
        return true;
      }),
    [sessions, status, classFilter, now],
  );

  function cancel(id: string) {
    persist(
      sessions.map((s) =>
        s.id === id ? { ...s, cancelled: true, cancelReason: "Hủy bởi người tổ chức" } : s,
      ),
    );
    toast.success("Đã hủy đợt thi — đề thi gốc không bị ảnh hưởng");
  }

  function copySchedule(s: ExamSession) {
    const copy: ExamSession = {
      ...s,
      id: `ses-${Math.random().toString(36).slice(2, 8)}`,
      name: `${s.name} (bù)`,
      confirmed: false,
      cancelled: false,
      published: false,
      started: 0,
      submitted: 0,
      graded: 0,
      createdAt: new Date().toISOString(),
    };
    persist([copy, ...sessions]);
    toast.success("Đã sao chép lịch tổ chức — xác nhận lại lớp và thời gian");
  }

  return (
    <div className="min-h-screen bg-background">
      <TopNav />
      <div className="mx-auto max-w-7xl px-6 pb-20 pt-10 sm:px-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-primary">
              <CalendarClock className="h-3.5 w-3.5" /> Phân phối đề & lịch thi
            </span>
            <h1 className="mt-1 font-display text-3xl font-semibold tracking-tight sm:text-4xl">
              {ASSESSMENT_TITLE}
            </h1>
            <p className="mt-1 max-w-2xl text-sm text-muted-foreground">{ASSESSMENT_DESCRIPTION}</p>
          </div>
          <button
            onClick={() => setDialogOpen(true)}
            className="inline-flex items-center gap-1.5 rounded-xl px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-soft"
            style={{ background: "var(--gradient-brand)" }}
          >
            <Plus className="h-4 w-4" /> Phân phối đề
          </button>
        </div>

        <AssessmentTabBar scope={scope} active="sessions" />

        <div className="mt-6 grid gap-3 sm:grid-cols-4">
          {(
            [
              ["upcoming", "Sắp diễn ra", counts.upcoming],
              ["open", "Đang mở", counts.open],
              ["grading", "Chờ chấm", counts.grading],
              ["completed", "Hoàn tất", counts.completed],
            ] as [SessionStatus, string, number][]
          ).map(([key, label, value]) => (
            <button
              key={key}
              onClick={() => setStatus(status === key ? "all" : key)}
              className={cn(
                "rounded-2xl border p-4 text-left transition-colors",
                status === key ? "border-primary bg-primary/5" : "border-border bg-surface hover:bg-muted",
              )}
            >
              <div className="text-xs font-medium text-muted-foreground">{label}</div>
              <div className="mt-1 text-2xl font-semibold text-foreground">{value}</div>
            </button>
          ))}
        </div>

        <div className="mt-6 flex flex-wrap items-center gap-2">
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as SessionStatus | "all")}
            className="h-10 rounded-xl border border-border bg-background px-3 text-sm"
          >
            <option value="all">Tất cả trạng thái</option>
            {(Object.keys(SESSION_STATUS_LABEL) as SessionStatus[]).map((s) => (
              <option key={s} value={s}>
                {SESSION_STATUS_LABEL[s]}
              </option>
            ))}
          </select>
          <select
            value={classFilter}
            onChange={(e) => setClassFilter(e.target.value)}
            className="h-10 rounded-xl border border-border bg-background px-3 text-sm"
          >
            <option value="all">Tất cả lớp</option>
            {classes.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <div className="mt-4 overflow-x-auto rounded-2xl border border-border bg-surface">
          <table className="w-full min-w-[1100px] text-sm">
            <thead className="bg-muted/50 text-xs uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="px-4 py-3 text-left font-semibold">Tên đợt thi</th>
                <th className="px-4 py-3 text-left font-semibold">Đề thi</th>
                <th className="px-4 py-3 text-center font-semibold">Phiên bản</th>
                <th className="px-4 py-3 text-left font-semibold">Lớp</th>
                <th className="px-4 py-3 text-left font-semibold">Mở / Đóng</th>
                <th className="px-4 py-3 text-center font-semibold">HV / Tham gia / Nộp</th>
                <th className="px-4 py-3 text-left font-semibold">Người chấm</th>
                <th className="px-4 py-3 text-left font-semibold">Trạng thái</th>
                <th className="px-4 py-3 text-right font-semibold">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((s) => {
                const st = sessionStatus(s, now);
                const test = tests.find((t) => t.id === s.testId);
                return (
                  <tr key={s.id} className="border-t border-border/60">
                    <td className="px-4 py-3">
                      <div className="font-semibold text-foreground">{s.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {s.groupCode ? `Nhóm ${s.groupCode} · ` : ""}
                        {s.durationMinutes}′ · {s.attempts} lần làm
                      </div>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {test?.name ?? s.testId}
                      {test && (
                        <div className="text-xs">
                          {test.level} · {testQuestionCount(test)} câu
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center tabular-nums">v{s.testVersion}</td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1">
                        {sessionClassNames(s).map((n) => (
                          <span
                            key={n}
                            className="rounded-lg bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground"
                          >
                            {n}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs">
                      <div className="text-emerald-600 dark:text-emerald-400">
                        {now ? fmtDateTime(s.openAt) : "—"}
                      </div>
                      <div className="text-rose-600 dark:text-rose-400">
                        {now ? fmtDateTime(s.closeAt) : "—"}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center text-xs tabular-nums text-muted-foreground">
                      <span className="inline-flex items-center gap-1">
                        <Users className="h-3.5 w-3.5" /> {s.totalStudents} / {s.started} /{" "}
                        {s.submitted}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{s.graderName ?? "—"}</td>
                    <td className="px-4 py-3">
                      <span
                        className={cn(
                          "rounded-full px-2.5 py-1 text-xs font-semibold",
                          SESSION_STATUS_COLOR[st],
                        )}
                      >
                        {SESSION_STATUS_LABEL[st]}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1.5">
                        {!s.confirmed && (
                          <button
                            onClick={() =>
                              persist(sessions.map((x) => (x.id === s.id ? { ...x, confirmed: true } : x)))
                            }
                            className="inline-flex items-center gap-1 rounded-lg bg-primary/10 px-2 py-1 text-xs font-semibold text-primary hover:bg-primary/15"
                          >
                            <PencilLine className="h-3.5 w-3.5" /> Xác nhận
                          </button>
                        )}
                        <button
                          onClick={() => copySchedule(s)}
                          className="inline-flex items-center gap-1 rounded-lg border border-border px-2 py-1 text-xs font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
                        >
                          <Copy className="h-3.5 w-3.5" /> Sao chép lịch
                        </button>
                        {!s.cancelled && st !== "completed" && (
                          <button
                            onClick={() => cancel(s.id)}
                            className="inline-flex items-center gap-1 rounded-lg border border-border px-2 py-1 text-xs font-medium text-rose-600 hover:bg-rose-500/10"
                          >
                            <XCircle className="h-3.5 w-3.5" /> Hủy
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
              {rows.length === 0 && (
                <tr>
                  <td colSpan={9} className="px-4 py-12 text-center text-sm text-muted-foreground">
                    Chưa có đợt thi nào. Chọn <strong>Phân phối đề</strong> để tổ chức thi từ đề đã
                    duyệt.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <DistributeDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        presetTestId={presetTestId}
        onCreate={(list) => {
          persist([...list, ...sessions]);
          toast.success(`Đã tạo ${list.length} đợt thi từ đề đã duyệt`);
        }}
      />
    </div>
  );
}

function DistributeDialog({
  open,
  onOpenChange,
  presetTestId,
  onCreate,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  presetTestId?: string;
  onCreate: (sessions: ExamSession[]) => void;
}) {
  const tests = useMemo(() => approvedTests(), []);
  const [testId, setTestId] = useState(presetTestId ?? tests[0]?.id ?? "");
  const [classIds, setClassIds] = useState<string[]>([]);
  const [perClass, setPerClass] = useState(false);
  const [openAt, setOpenAt] = useState(() => toInput(new Date(Date.now() + 86_400_000).toISOString()));
  const [closeAt, setCloseAt] = useState(() =>
    toInput(new Date(Date.now() + 86_400_000 + 7_200_000).toISOString()),
  );
  const [duration, setDuration] = useState(60);
  const [attempts, setAttempts] = useState(1);
  const [grader, setGrader] = useState("Cô Mai Lan");
  const [publishMode, setPublishMode] = useState<"auto" | "manual">("manual");

  useEffect(() => {
    if (presetTestId) setTestId(presetTestId);
  }, [presetTestId]);

  const test = tests.find((t) => t.id === testId);
  const levelWarnings = classIds.filter(
    (id) => test && classes.find((c) => c.id === id)?.levelCode !== test.level,
  );

  const timeError =
    new Date(closeAt).getTime() <= new Date(openAt).getTime()
      ? "Thời gian đóng phải sau thời gian mở."
      : duration <= 0
        ? "Thời lượng làm bài phải lớn hơn 0."
        : (new Date(closeAt).getTime() - new Date(openAt).getTime()) / 60000 < duration
          ? "Khung giờ thi ngắn hơn thời lượng làm bài."
          : null;

  function submit() {
    if (!test || classIds.length === 0 || timeError) return;
    const group = `PP-${new Date(openAt).toISOString().slice(0, 10).replace(/-/g, "")}`;
    const mk = (ids: string[], i: number): ExamSession => ({
      id: `ses-${Math.random().toString(36).slice(2, 8)}`,
      groupCode: group,
      name: `${test.name} — Đợt ${i + 1}`,
      testId: test.id,
      testVersion: testVersion(test),
      classIds: ids,
      openAt: new Date(openAt).toISOString(),
      closeAt: new Date(closeAt).toISOString(),
      durationMinutes: duration,
      attempts,
      graderName: grader,
      publishMode,
      confirmed: true,
      totalStudents: ids.reduce(
        (s, id) => s + (classes.find((c) => c.id === id)?.studentCount ?? 0),
        0,
      ),
      started: 0,
      submitted: 0,
      graded: 0,
      createdBy: grader,
      createdAt: new Date().toISOString(),
    });
    const list = perClass ? classIds.map((id, i) => mk([id], i)) : [mk(classIds, 0)];
    onCreate(list);
    onOpenChange(false);
    setClassIds([]);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Phân phối đề</DialogTitle>
          <DialogDescription>
            Chọn một đề đã duyệt, giao cho lớp và thiết lập lịch thi. Không thay đổi nội dung đề.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-muted-foreground">Đề thi đã duyệt</label>
            <select
              value={testId}
              onChange={(e) => setTestId(e.target.value)}
              className="mt-1 h-10 w-full rounded-xl border border-border bg-background px-3 text-sm"
            >
              {tests.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name} · {t.level} · v{testVersion(t)}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold text-muted-foreground">Lớp được giao</label>
            <div className="mt-1 grid gap-1.5 sm:grid-cols-3">
              {classes.map((c) => {
                const checked = classIds.includes(c.id);
                return (
                  <label
                    key={c.id}
                    className={cn(
                      "flex cursor-pointer items-center gap-2 rounded-xl border px-3 py-2 text-sm",
                      checked ? "border-primary bg-primary/5" : "border-border",
                    )}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() =>
                        setClassIds((prev) =>
                          checked ? prev.filter((x) => x !== c.id) : [...prev, c.id],
                        )
                      }
                    />
                    <span className="truncate">{c.name}</span>
                  </label>
                );
              })}
            </div>
            {levelWarnings.length > 0 && (
              <p className="mt-2 rounded-xl bg-amber-500/10 px-3 py-2 text-xs text-amber-600 dark:text-amber-400">
                Cảnh báo: {levelWarnings.length} lớp có level khác level áp dụng của đề ({test?.level}).
              </p>
            )}
          </div>

          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={perClass} onChange={(e) => setPerClass(e.target.checked)} />
            Thiết lập lịch riêng cho từng lớp (tạo bản ghi độc lập theo lớp)
          </label>

          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="text-xs font-semibold text-muted-foreground">Mở lúc</label>
              <input
                type="datetime-local"
                value={openAt}
                onChange={(e) => setOpenAt(e.target.value)}
                className="mt-1 h-10 w-full rounded-xl border border-border bg-background px-3 text-sm"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-muted-foreground">Đóng lúc</label>
              <input
                type="datetime-local"
                value={closeAt}
                onChange={(e) => setCloseAt(e.target.value)}
                className="mt-1 h-10 w-full rounded-xl border border-border bg-background px-3 text-sm"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-muted-foreground">Thời lượng (phút)</label>
              <input
                type="number"
                value={duration}
                onChange={(e) => setDuration(Number(e.target.value))}
                className="mt-1 h-10 w-full rounded-xl border border-border bg-background px-3 text-sm"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-muted-foreground">Số lần được làm</label>
              <input
                type="number"
                min={1}
                value={attempts}
                onChange={(e) => setAttempts(Number(e.target.value))}
                className="mt-1 h-10 w-full rounded-xl border border-border bg-background px-3 text-sm"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-muted-foreground">Người phụ trách chấm</label>
              <input
                value={grader}
                onChange={(e) => setGrader(e.target.value)}
                className="mt-1 h-10 w-full rounded-xl border border-border bg-background px-3 text-sm"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-muted-foreground">Công bố kết quả</label>
              <select
                value={publishMode}
                onChange={(e) => setPublishMode(e.target.value as "auto" | "manual")}
                className="mt-1 h-10 w-full rounded-xl border border-border bg-background px-3 text-sm"
              >
                <option value="manual">Công bố thủ công sau khi chấm</option>
                <option value="auto">Tự động công bố khi chấm xong</option>
              </select>
            </div>
          </div>

          {timeError && (
            <p className="rounded-xl bg-rose-500/10 px-3 py-2 text-xs font-medium text-rose-600 dark:text-rose-400">
              {timeError}
            </p>
          )}
        </div>

        <DialogFooter>
          <button
            onClick={() => onOpenChange(false)}
            className="rounded-xl border border-border px-4 py-2 text-sm font-medium text-muted-foreground hover:bg-muted"
          >
            Hủy
          </button>
          <button
            disabled={!test || classIds.length === 0 || !!timeError}
            onClick={submit}
            className="rounded-xl px-4 py-2 text-sm font-semibold text-primary-foreground shadow-soft disabled:opacity-50"
            style={{ background: "var(--gradient-brand)" }}
          >
            Xác nhận tổ chức
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
