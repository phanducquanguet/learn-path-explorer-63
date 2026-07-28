import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useRef, useState, useSyncExternalStore } from "react";
import { TopNav } from "@/components/TopNav";
import {
  getAssignment,
  listSubmissions,
  subscribeAssignments,
  gradeSubmission,
  extendDeadline,
  updateAssignment,
  type Assignment,
  type AssignmentAttachment,
  type AssignmentSubmission,
} from "@/lib/assignments";
import { classes, students } from "@/lib/teacher-data";
import { levels } from "@/lib/lms-data";
import {
  ArrowLeft,
  Calendar,
  CheckCircle2,
  AlertCircle,
  FileText,
  Paperclip,
  Send,
  X,
  Users,
  Sparkles,
  Lock,
  Unlock,
  Clock,
  Pencil,
} from "lucide-react";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/teacher/assignments/$assignmentId")({
  head: ({ params }) => ({
    meta: [{ title: `Chấm bài tập ${params.assignmentId} — UNICOM LMS` }],
  }),
  component: TeacherAssignmentDetail,
});


function useSubs(id: string) {
  return useSyncExternalStore(
    (cb) => {
      const un = subscribeAssignments(cb);
      return () => un();
    },
    () => listSubmissions(id),
    () => listSubmissions(id),
  );
}

function TeacherAssignmentDetail() {
  const { assignmentId } = Route.useParams();
  const a = getAssignment(assignmentId);
  const subs = useSubs(assignmentId);
  const [active, setActive] = useState<AssignmentSubmission | null>(null);
  const [editing, setEditing] = useState(false);

  const [extendFor, setExtendFor] = useState<{ id: string; name: string } | null>(null);

  if (!a) throw notFound();

  const cls = classes.filter((c) => a.classIds.includes(c.id));
  const clsStudents = students.filter((s) => a.classIds.includes(s.classId));
  const now = Date.now();
  const isClosed = new Date(a.dueAt).getTime() < now;

  const submittedIds = new Set(subs.map((s) => s.studentId));
  const notSubmitted = clsStudents.filter((s) => !submittedIds.has(s.id));
  const graded = subs.filter((s) => s.score !== undefined);
  const pending = subs.filter((s) => s.score === undefined);

  return (
    <div className="min-h-screen bg-background">
      <TopNav />
      <div className="mx-auto max-w-6xl px-6 pb-20 pt-10 sm:px-8">
        <Link
          to="/teacher/assignments"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" /> Quay lại danh sách bài tập
        </Link>
        <div className="mt-4 flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="font-display text-2xl font-semibold tracking-tight">{a.title}</h1>
              {isClosed ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-rose-100 px-2 py-0.5 text-[11px] font-semibold text-rose-700">
                  <Lock className="h-3 w-3" /> Đã đóng (hết hạn)
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-semibold text-emerald-700">
                  <Unlock className="h-3 w-3" /> Đang mở nộp
                </span>
              )}
            </div>

            <div className="mt-2 flex flex-wrap gap-3 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1">
                <Users className="h-3 w-3" /> {cls.map((c) => c.name).join(" · ") || "—"}
              </span>
              <span className="inline-flex items-center gap-1">
                <Calendar className="h-3 w-3" /> Hạn:{" "}
                {new Date(a.dueAt).toLocaleString("vi-VN", { timeZone: "Asia/Ho_Chi_Minh" })}
              </span>
              <span>Thang điểm: {a.maxScore}</span>
            </div>
          </div>
          <div className="flex gap-2 text-xs">
            <Stat label="Đã nộp" value={subs.length} tone="default" />
            <Stat label="Chờ chấm" value={pending.length} tone="warn" />
            <Stat label="Đã chấm" value={graded.length} tone="ok" />
            <Stat label="Chưa nộp" value={notSubmitted.length} tone="muted" />
          </div>
        </div>

        <section className="mt-6 rounded-2xl border border-border bg-surface p-5 shadow-soft">
          <div className="flex items-center justify-between gap-2">
            <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Đề bài
            </div>
            <button
              onClick={() => setEditing(true)}
              className="inline-flex items-center gap-1 rounded-lg border border-border bg-background px-2.5 py-1 text-xs font-semibold text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              <Pencil className="h-3 w-3" /> Sửa đề
            </button>
          </div>

          <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-foreground">
            {a.description}
          </p>
          {a.attachments && a.attachments.length > 0 && (
            <div className="mt-4">
              <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                File đính kèm ({a.attachments.length})
              </div>
              <ul className="mt-2 divide-y divide-border rounded-xl border border-border bg-background">
                {a.attachments.map((f, i) => (
                  <li
                    key={i}
                    className="flex items-center justify-between gap-2 px-3 py-2 text-sm"
                  >
                    <div className="min-w-0 flex items-center gap-2">
                      <Paperclip className="h-3 w-3 shrink-0 text-muted-foreground" />
                      <span className="truncate">{f.name}</span>
                      <span className="text-xs text-muted-foreground">
                        {(f.size / 1024).toFixed(1)} KB
                      </span>
                    </div>
                    {f.dataUrl && (
                      <a
                        href={f.dataUrl}
                        download={f.name}
                        className="rounded-md border border-border bg-background px-2 py-1 text-xs font-semibold hover:bg-muted"
                      >
                        Tải xuống
                      </a>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </section>


        <section className="mt-6">
          <h2 className="mb-3 font-display text-lg font-semibold">Bài nộp của học viên</h2>
          <div className="overflow-hidden rounded-2xl border border-border bg-surface shadow-soft">
            <table className="w-full text-sm">
              <thead className="bg-muted/40 text-xs uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="px-4 py-3 text-left">Học viên</th>
                  <th className="px-4 py-3 text-left">Nộp lúc</th>
                  <th className="px-4 py-3 text-center">Hình thức</th>
                  <th className="px-4 py-3 text-center">Điểm</th>
                  <th className="px-4 py-3 text-center">Trạng thái</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {subs.map((s) => (
                  <tr key={s.id} className="border-t border-border hover:bg-muted/30">
                    <td className="px-4 py-3 font-medium">{s.studentName}</td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {new Date(s.submittedAt).toLocaleString("vi-VN", {
                        timeZone: "Asia/Ho_Chi_Minh",
                      })}
                    </td>
                    <td className="px-4 py-3 text-center text-xs">
                      <div className="inline-flex gap-1">
                        {s.answerText && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5">
                            <FileText className="h-3 w-3" /> Text
                          </span>
                        )}
                        {s.file && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5">
                            <Paperclip className="h-3 w-3" /> File
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center font-semibold text-primary">
                      {s.score !== undefined ? `${s.score}/${s.maxScore}` : "—"}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {s.score !== undefined ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-semibold text-emerald-700">
                          <CheckCircle2 className="h-3 w-3" /> Đã chấm
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-semibold text-amber-700">
                          <AlertCircle className="h-3 w-3" /> Chờ chấm
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => setActive(s)}
                        className="rounded-lg bg-foreground px-3 py-1.5 text-xs font-semibold text-background hover:opacity-90"
                      >
                        {s.score !== undefined ? "Xem" : "Chấm bài"}
                      </button>
                    </td>
                  </tr>
                ))}
                {subs.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-4 py-10 text-center text-muted-foreground">
                      Chưa có học viên nào nộp bài.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {notSubmitted.length > 0 && (
            <div className="mt-4 rounded-2xl border border-dashed border-border bg-muted/20 p-4">
              <div className="flex items-center justify-between">
                <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Chưa nộp ({notSubmitted.length})
                </div>
                {isClosed && (
                  <span className="text-[11px] text-muted-foreground">
                    Bài đã đóng — bấm <b>Mở nộp bài</b> để gia hạn riêng cho học viên
                  </span>
                )}
              </div>
              <div className="mt-3 divide-y divide-border/60 rounded-xl border border-border bg-background">
                {notSubmitted.map((s) => {
                  const ext = a.extensions?.[s.id];
                  const stillClosed = isClosed && (!ext || new Date(ext).getTime() < now);
                  return (
                    <div
                      key={s.id}
                      className="flex flex-wrap items-center justify-between gap-2 px-3 py-2 text-sm"
                    >
                      <div className="min-w-0">
                        <div className="truncate font-medium">{s.name}</div>
                        {ext && (
                          <div className="mt-0.5 inline-flex items-center gap-1 text-[11px] text-emerald-700">
                            <Clock className="h-3 w-3" /> Được gia hạn đến{" "}
                            {new Date(ext).toLocaleString("vi-VN", {
                              timeZone: "Asia/Ho_Chi_Minh",
                            })}
                          </div>
                        )}
                      </div>
                      {stillClosed ? (
                        <button
                          onClick={() => setExtendFor({ id: s.id, name: s.name })}
                          className="inline-flex items-center gap-1 rounded-lg border border-border bg-background px-3 py-1 text-xs font-semibold hover:bg-muted"
                        >
                          <Unlock className="h-3 w-3" /> Mở nộp bài
                        </button>
                      ) : ext ? (
                        <button
                          onClick={() => setExtendFor({ id: s.id, name: s.name })}
                          className="text-xs font-semibold text-primary hover:underline"
                        >
                          Đổi hạn
                        </button>
                      ) : (
                        <span className="text-[11px] text-muted-foreground">Đang mở</span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </section>
      </div>

      {active && (
        <GradeDrawer submission={active} maxScore={a.maxScore} onClose={() => setActive(null)} />
      )}

      {extendFor && (
        <ExtendDialog
          studentName={extendFor.name}
          currentDue={a.extensions?.[extendFor.id] ?? a.dueAt}
          onClose={() => setExtendFor(null)}
          onSubmit={(iso) => {
            extendDeadline(a.id, extendFor.id, iso);
            setExtendFor(null);
          }}
        />
      )}

      {editing && (
        <EditAssignmentDialog assignment={a} onClose={() => setEditing(false)} />
      )}

    </div>
  );
}

function Stat({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone: "default" | "ok" | "warn" | "muted";
}) {
  const cls = {
    default: "bg-primary/10 text-primary",
    ok: "bg-emerald-100 text-emerald-700",
    warn: "bg-amber-100 text-amber-700",
    muted: "bg-muted text-muted-foreground",
  }[tone];
  return (
    <div className={cn("rounded-xl px-3 py-2 text-center", cls)}>
      <div className="text-lg font-bold leading-none">{value}</div>
      <div className="mt-1 text-[10px] uppercase tracking-wider">{label}</div>
    </div>
  );
}

function GradeDrawer({
  submission,
  maxScore,
  onClose,
}: {
  submission: AssignmentSubmission;
  maxScore: number;
  onClose: () => void;
}) {
  const [score, setScore] = useState<number | "">(submission.score ?? "");
  const [feedback, setFeedback] = useState(submission.feedback ?? "");

  const save = () => {
    if (score === "" || score < 0 || score > maxScore) return;
    gradeSubmission(submission.id, Number(score), feedback.trim());
    onClose();
  };

  const wordCount = submission.answerText?.trim().split(/\s+/).filter(Boolean).length ?? 0;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/40">
      <button onClick={onClose} className="absolute inset-0" aria-label="Close" />
      <div className="relative flex h-full w-full max-w-2xl flex-col bg-background shadow-elevated">
        <div className="flex items-center justify-between border-b border-border p-6">
          <div>
            <h2 className="font-display text-xl font-semibold">
              Chấm bài — {submission.studentName}
            </h2>
            <p className="text-xs text-muted-foreground">
              Nộp lúc{" "}
              {new Date(submission.submittedAt).toLocaleString("vi-VN", {
                timeZone: "Asia/Ho_Chi_Minh",
              })}
            </p>
          </div>
          <button onClick={onClose} className="rounded-lg p-2 hover:bg-muted">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex-1 space-y-4 overflow-y-auto p-6">
          {submission.answerText && (
            <div className="rounded-2xl border border-border p-4">
              <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                <span className="inline-flex items-center gap-1">
                  <FileText className="h-3 w-3" /> Câu trả lời (text)
                </span>
                <span className="text-[11px] normal-case tracking-normal">
                  {wordCount} từ • {submission.answerText.length} ký tự
                </span>
              </div>
              <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-foreground">
                {submission.answerText}
              </p>
            </div>
          )}

          {submission.file && (
            <div className="rounded-2xl border border-border p-4">
              <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                <span className="inline-flex items-center gap-1">
                  <Paperclip className="h-3 w-3" /> File đính kèm
                </span>
              </div>
              <div className="mt-2 flex items-center justify-between gap-3 rounded-xl bg-muted/40 p-3">
                <div className="min-w-0">
                  <div className="truncate text-sm font-medium">{submission.file.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {(submission.file.size / 1024).toFixed(1)} KB
                  </div>
                </div>
                {submission.file.dataUrl && (
                  <a
                    href={submission.file.dataUrl}
                    download={submission.file.name}
                    className="rounded-lg border border-border bg-background px-3 py-1.5 text-xs font-semibold hover:bg-muted"
                  >
                    Tải xuống
                  </a>
                )}
              </div>
            </div>
          )}

          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-3 text-xs text-emerald-900">
            <div className="mb-1 inline-flex items-center gap-1 font-semibold">
              <Sparkles className="h-3 w-3" /> Gợi ý chấm (mô phỏng)
            </div>
            <p className="leading-relaxed">
              Bài viết có cấu trúc rõ ràng, độ dài phù hợp yêu cầu. Ngữ pháp cơ bản đúng, có thể trừ
              nhẹ vì thiếu câu ghép/từ nối. Đề xuất điểm: {Math.round(maxScore * 0.8)}/{maxScore}.
            </p>
          </div>

          <div className="rounded-2xl border border-border p-4">
            <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Chấm điểm
            </div>
            <div className="mt-3 grid gap-3 sm:grid-cols-[160px_1fr]">
              <div>
                <label className="text-xs text-muted-foreground">Điểm (0-{maxScore})</label>
                <input
                  type="number"
                  min={0}
                  max={maxScore}
                  step={0.5}
                  value={score}
                  onChange={(e) =>
                    setScore(e.target.value === "" ? "" : Number(e.target.value))
                  }
                  className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground">Nhận xét cho học viên</label>
                <textarea
                  rows={3}
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                  placeholder="Điểm mạnh, điểm cần cải thiện..."
                />
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 border-t border-border bg-background p-4">
          <button
            onClick={onClose}
            className="rounded-xl border border-border bg-background px-4 py-2 text-sm font-semibold hover:bg-muted"
          >
            Huỷ
          </button>
          <button
            onClick={save}
            disabled={score === "" || Number(score) < 0 || Number(score) > maxScore}
            className="inline-flex items-center gap-1.5 rounded-xl px-4 py-2 text-sm font-semibold text-primary-foreground shadow-soft disabled:opacity-50"
            style={{ background: "var(--gradient-brand)" }}
          >
            <Send className="h-4 w-4" /> Lưu điểm & phản hồi
          </button>
        </div>
      </div>
    </div>
  );
}

function ExtendDialog({
  studentName,
  currentDue,
  onClose,
  onSubmit,
}: {
  studentName: string;
  currentDue: string;
  onClose: () => void;
  onSubmit: (iso: string) => void;
}) {
  const presets = [
    { label: "+1 ngày", days: 1 },
    { label: "+3 ngày", days: 3 },
    { label: "+7 ngày", days: 7 },
  ];
  const [choice, setChoice] = useState<"preset" | "custom">("preset");
  const [days, setDays] = useState(3);
  const defaultCustom = (() => {
    const d = new Date(Date.now() + 3 * 24 * 3600 * 1000);
    // yyyy-MM-ddTHH:mm for datetime-local
    const pad = (n: number) => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  })();
  const [customAt, setCustomAt] = useState(defaultCustom);

  const submit = () => {
    let iso: string;
    if (choice === "preset") {
      iso = new Date(Date.now() + days * 24 * 3600 * 1000).toISOString();
    } else {
      const t = new Date(customAt);
      if (Number.isNaN(t.getTime())) return;
      iso = t.toISOString();
    }
    onSubmit(iso);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <button onClick={onClose} className="absolute inset-0" aria-label="Close" />
      <div className="relative w-full max-w-md rounded-2xl bg-background p-6 shadow-elevated">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="font-display text-lg font-semibold">Mở lại nộp bài</h3>
            <p className="mt-1 text-xs text-muted-foreground">
              Gia hạn riêng cho <b>{studentName}</b>. Hạn hiện tại:{" "}
              {new Date(currentDue).toLocaleString("vi-VN", { timeZone: "Asia/Ho_Chi_Minh" })}
            </p>
          </div>
          <button onClick={onClose} className="rounded-lg p-1.5 hover:bg-muted">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-4 space-y-3">
          <label className="flex items-start gap-2 rounded-xl border border-border p-3 text-sm">
            <input
              type="radio"
              checked={choice === "preset"}
              onChange={() => setChoice("preset")}
              className="mt-0.5"
            />
            <div className="flex-1">
              <div className="font-medium">Gia hạn nhanh</div>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {presets.map((p) => (
                  <button
                    key={p.days}
                    onClick={() => {
                      setChoice("preset");
                      setDays(p.days);
                    }}
                    className={cn(
                      "rounded-lg border px-2.5 py-1 text-xs font-semibold",
                      choice === "preset" && days === p.days
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border bg-background hover:bg-muted",
                    )}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>
          </label>

          <label className="flex items-start gap-2 rounded-xl border border-border p-3 text-sm">
            <input
              type="radio"
              checked={choice === "custom"}
              onChange={() => setChoice("custom")}
              className="mt-0.5"
            />
            <div className="flex-1">
              <div className="font-medium">Chọn thời điểm cụ thể</div>
              <input
                type="datetime-local"
                value={customAt}
                onChange={(e) => {
                  setChoice("custom");
                  setCustomAt(e.target.value);
                }}
                className="mt-2 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
              />
            </div>
          </label>
        </div>

        <div className="mt-5 flex items-center justify-end gap-2">
          <button
            onClick={onClose}
            className="rounded-xl border border-border bg-background px-4 py-2 text-sm font-semibold hover:bg-muted"
          >
            Huỷ
          </button>
          <button
            onClick={submit}
            className="inline-flex items-center gap-1.5 rounded-xl px-4 py-2 text-sm font-semibold text-primary-foreground shadow-soft"
            style={{ background: "var(--gradient-brand)" }}
          >
            <Unlock className="h-4 w-4" /> Mở nộp bài
          </button>
        </div>
      </div>
    </div>
  );
}

function EditAssignmentDialog({
  assignment,
  onClose,
}: {
  assignment: Assignment;
  onClose: () => void;
}) {
  const [title, setTitle] = useState(assignment.title);
  const [description, setDescription] = useState(assignment.description);
  const [attachments, setAttachments] = useState<AssignmentAttachment[]>(
    assignment.attachments ?? [],
  );
  const [dueAt, setDueAt] = useState(() => {
    const d = new Date(assignment.dueAt);
    const pad = (n: number) => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  });
  const [maxScore, setMaxScore] = useState(assignment.maxScore);
  const [allowText, setAllowText] = useState(assignment.allowText);
  const [allowFile, setAllowFile] = useState(assignment.allowFile);
  const [allowAssistantGrading, setAllowAssistantGrading] = useState(
    assignment.allowAssistantGrading ?? false,
  );
  const [courseId, setCourseId] = useState<string>(assignment.courseId ?? "");
  const [unitIds, setUnitIds] = useState<string[]>(
    assignment.unitIds ?? (assignment.unitId ? [assignment.unitId] : []),
  );
  const [unitPickerOpen, setUnitPickerOpen] = useState(false);
  const unitPickerRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!unitPickerOpen) return;
    const onClick = (e: MouseEvent) => {
      if (unitPickerRef.current && !unitPickerRef.current.contains(e.target as Node)) {
        setUnitPickerOpen(false);
      }
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [unitPickerOpen]);
  const toggleUnit = (id: string) =>
    setUnitIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  const fileRef = useRef<HTMLInputElement>(null);

  const cls = classes.find((c) => assignment.classIds.includes(c.id));
  const availableCourses = cls
    ? levels
        .filter((lv) => lv.code === cls.levelCode)
        .flatMap((lv) => lv.courses.map((c) => ({ id: c.id, title: c.title, level: lv.code })))
    : [];
  const availableUnits = (() => {
    if (!courseId) return [] as { id: string; title: string; index: number }[];
    for (const lv of levels) {
      const c = lv.courses.find((c) => c.id === courseId);
      if (c) return c.units.map((u) => ({ id: u.id, title: u.title, index: u.index }));
    }
    return [];
  })();

  const onPick = (files: FileList | null) => {
    if (!files) return;
    const arr: AssignmentAttachment[] = [];
    let pending = 0;
    Array.from(files).forEach((f) => {
      if (f.size > 5 * 1024 * 1024) {
        alert(`"${f.name}" quá 5MB, bỏ qua.`);
        return;
      }
      pending++;
      const reader = new FileReader();
      reader.onload = () => {
        arr.push({ name: f.name, size: f.size, dataUrl: reader.result as string });
        pending--;
        if (pending === 0) setAttachments((prev) => [...prev, ...arr]);
      };
      reader.readAsDataURL(f);
    });
    if (fileRef.current) fileRef.current.value = "";
  };

  const save = () => {
    if (!title.trim() || !description.trim()) return;
    updateAssignment(assignment.id, {
      title: title.trim(),
      description: description.trim(),
      attachments: attachments.length ? attachments : undefined,
      dueAt: new Date(dueAt).toISOString(),
      maxScore,
      allowText,
      allowFile: allowFile || !allowText,
      allowAssistantGrading,
      courseId: courseId || undefined,
      unitId: unitId || undefined,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <button className="absolute inset-0" onClick={onClose} aria-label="Close" />
      <div className="relative w-full max-w-2xl overflow-hidden rounded-2xl bg-background shadow-elevated">
        <div className="border-b border-border p-5">
          <h2 className="font-display text-lg font-semibold">Sửa đề bài</h2>
          <p className="text-xs text-muted-foreground">
            Đang sửa cho lớp <b>{cls?.name ?? "—"}</b>. Muốn giao thêm lớp khác, dùng nút{" "}
            <b>Nhân bản</b> ở danh sách.
          </p>
        </div>
        <div className="max-h-[70vh] space-y-4 overflow-y-auto p-5">
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Tiêu đề
            </label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Đề bài
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={6}
              className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              File đính kèm ({attachments.length})
            </label>
            <div className="mt-1 space-y-2">
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="inline-flex items-center gap-1.5 rounded-lg border border-dashed border-border bg-background px-3 py-2 text-sm font-medium text-muted-foreground hover:border-primary/40 hover:text-foreground"
              >
                <Paperclip className="h-4 w-4" /> Thêm file (tối đa 5MB/file)
              </button>
              <input
                ref={fileRef}
                type="file"
                multiple
                onChange={(e) => onPick(e.target.files)}
                className="hidden"
              />
              {attachments.length > 0 && (
                <ul className="divide-y divide-border rounded-lg border border-border bg-background">
                  {attachments.map((f, i) => (
                    <li
                      key={i}
                      className="flex items-center justify-between gap-2 px-3 py-2 text-sm"
                    >
                      <div className="min-w-0 flex items-center gap-2">
                        <Paperclip className="h-3 w-3 shrink-0 text-muted-foreground" />
                        <span className="truncate">{f.name}</span>
                        <span className="text-xs text-muted-foreground">
                          {(f.size / 1024).toFixed(1)} KB
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() =>
                          setAttachments((prev) => prev.filter((_, x) => x !== i))
                        }
                        className="rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-rose-600"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Khóa học {cls ? `(level ${cls.levelCode})` : ""}
              </label>
              <select
                value={courseId}
                onChange={(e) => {
                  setCourseId(e.target.value);
                  setUnitId("");
                }}
                className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
              >
                <option value="">— Không gắn khóa học —</option>
                {availableCourses.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.title}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Unit
              </label>
              <select
                value={unitId}
                onChange={(e) => setUnitId(e.target.value)}
                disabled={!courseId}
                className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm disabled:opacity-50"
              >
                <option value="">— Không gắn unit —</option>
                {availableUnits.map((u) => (
                  <option key={u.id} value={u.id}>
                    Unit {u.index}: {u.title.replace(/^Unit \d+:\s*/, "")}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Hạn nộp
              </label>
              <input
                type="datetime-local"
                value={dueAt}
                onChange={(e) => setDueAt(e.target.value)}
                className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Thang điểm
              </label>
              <input
                type="number"
                min={1}
                max={100}
                value={maxScore}
                onChange={(e) => setMaxScore(Number(e.target.value) || 10)}
                className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Hình thức nộp
              </label>
              <div className="mt-1 flex flex-col gap-1.5 text-sm">
                <label className="inline-flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={allowText}
                    onChange={(e) => setAllowText(e.target.checked)}
                  />
                  Nhập câu trả lời (text)
                </label>
                <label className="inline-flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={allowFile}
                    onChange={(e) => setAllowFile(e.target.checked)}
                  />
                  Tải file đính kèm
                </label>
                <label className="mt-1 inline-flex items-center gap-2 border-t border-border pt-2">
                  <input
                    type="checkbox"
                    checked={allowAssistantGrading}
                    onChange={(e) => setAllowAssistantGrading(e.target.checked)}
                  />
                  Cho phép trợ giảng chấm bài
                </label>
              </div>
            </div>
          </div>
        </div>
        <div className="flex items-center justify-end gap-2 border-t border-border bg-muted/30 p-4">
          <button
            onClick={onClose}
            className="rounded-lg border border-border bg-background px-4 py-2 text-sm font-semibold hover:bg-muted"
          >
            Huỷ
          </button>
          <button
            onClick={save}
            disabled={!title.trim() || !description.trim()}
            className="rounded-lg bg-foreground px-4 py-2 text-sm font-semibold text-background hover:opacity-90 disabled:opacity-50"
          >
            Lưu thay đổi
          </button>
        </div>
      </div>
    </div>
  );
}

