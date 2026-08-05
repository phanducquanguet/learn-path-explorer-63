import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useState, useSyncExternalStore } from "react";
import { TopNav } from "@/components/TopNav";
import {
  getAssignment,
  getSubmissionForStudent,
  upsertSubmission,
  subscribeAssignments,
  getEffectiveDueAt,
  CURRENT_STUDENT,
  type AssignmentSubmission,
} from "@/lib/assignments";
import { ArrowLeft, Calendar, Send, Paperclip, CheckCircle2, FileText, X } from "lucide-react";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/assignments/$assignmentId")({
  head: ({ params }) => ({
    meta: [{ title: `Nộp bài ${params.assignmentId} — UNICOM LMS` }],
  }),
  component: StudentAssignmentDetail,
});

function useMySub(id: string) {
  return useSyncExternalStore(
    (cb) => {
      const un = subscribeAssignments(cb);
      return () => un();
    },
    () => getSubmissionForStudent(id, CURRENT_STUDENT.id),
    () => getSubmissionForStudent(id, CURRENT_STUDENT.id),
  );
}

function StudentAssignmentDetail() {
  const { assignmentId } = Route.useParams();
  const a = getAssignment(assignmentId);
  const existing = useMySub(assignmentId);
  const [answerText, setAnswerText] = useState(existing?.answerText ?? "");
  const [file, setFile] = useState<AssignmentSubmission["file"] | undefined>(existing?.file);
  const [saved, setSaved] = useState(false);

  if (!a) throw notFound();
  const effectiveDue = getEffectiveDueAt(a, CURRENT_STUDENT.id);
  const overdue = new Date(effectiveDue).getTime() < Date.now();
  const returned = !!existing?.returnedAt;
  const graded = existing?.score !== undefined && !returned;
  const revisions = existing?.revisions ?? [];


  const onFile = (f: File | null) => {
    if (!f) return setFile(undefined);
    if (f.size > 5 * 1024 * 1024) {
      alert("File quá lớn (tối đa 5MB cho demo).");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setFile({ name: f.name, size: f.size, dataUrl: reader.result as string });
    };
    reader.readAsDataURL(f);
  };

  const submit = () => {
    if (graded) return;
    if (a.allowText && !answerText.trim() && !file) {
      alert("Hãy nhập câu trả lời hoặc tải file đính kèm.");
      return;
    }
    if (!a.allowText && !file) {
      alert("Bài này yêu cầu tải file đính kèm.");
      return;
    }
    const sub: AssignmentSubmission = {
      id: existing?.id ?? `sub-${a.id}-${CURRENT_STUDENT.id}`,
      assignmentId: a.id,
      studentId: CURRENT_STUDENT.id,
      studentName: CURRENT_STUDENT.name,
      submittedAt: new Date().toISOString(),
      answerText: a.allowText ? answerText.trim() : undefined,
      file,
      maxScore: a.maxScore,
      score: returned ? undefined : existing?.score,
      feedback: returned ? undefined : existing?.feedback,
      gradedAt: returned ? undefined : existing?.gradedAt,
      revisions,
      returnedAt: undefined,
      returnNote: undefined,
    };

    upsertSubmission(sub);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="min-h-screen bg-background">
      <TopNav />
      <div className="mx-auto max-w-3xl px-6 pb-20 pt-10 sm:px-8">
        <Link
          to="/assignments"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" /> Quay lại danh sách bài tập
        </Link>
        <div className="mt-4">
          <h1 className="font-display text-2xl font-semibold tracking-tight">{a.title}</h1>
          <div className="mt-2 flex flex-wrap gap-3 text-xs text-muted-foreground">
            <span className={cn("inline-flex items-center gap-1", overdue && "text-rose-600")}>
              <Calendar className="h-3 w-3" /> Hạn:{" "}
              {new Date(effectiveDue).toLocaleString("vi-VN", { timeZone: "Asia/Ho_Chi_Minh" })}
              {a.extensions?.[CURRENT_STUDENT.id] && (
                <span className="ml-1 rounded-full bg-emerald-100 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-700">
                  Đã gia hạn
                </span>
              )}
            </span>
            <span>Thang điểm: {a.maxScore}</span>
            <span>Giáo viên: {a.createdBy}</span>
          </div>
        </div>

        <section className="mt-6 rounded-2xl border border-border bg-surface p-5 shadow-soft">
          <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Đề bài
          </div>
          <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-foreground">
            {a.description}
          </p>
          {a.attachments && a.attachments.length > 0 && (
            <div className="mt-4">
              <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                File đính kèm của giáo viên ({a.attachments.length})
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

        {graded && (
          <section className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50 p-5 shadow-soft">
            <div className="flex items-center justify-between">
              <div className="inline-flex items-center gap-2 text-sm font-semibold text-emerald-800">
                <CheckCircle2 className="h-4 w-4" /> Bài đã được chấm
              </div>
              <div className="text-2xl font-bold text-emerald-700">
                {existing!.score}/{a.maxScore}
              </div>
            </div>
            {existing!.feedback && (
              <div className="mt-3">
                <div className="text-[11px] font-semibold uppercase tracking-wider text-emerald-800">
                  Nhận xét của giáo viên
                </div>
                <p className="mt-1 whitespace-pre-wrap text-sm text-emerald-900">
                  {existing!.feedback}
                </p>
              </div>
            )}
          </section>
        )}

        <section className="mt-6 rounded-2xl border border-border bg-surface p-5 shadow-soft">
          <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            {graded ? "Bài nộp của bạn" : existing ? "Cập nhật bài nộp" : "Nộp bài"}
          </div>

          {a.allowText && (
            <div className="mt-4">
              <label className="text-xs font-semibold text-muted-foreground">
                <FileText className="mr-1 inline h-3 w-3" /> Câu trả lời
              </label>
              <textarea
                value={answerText}
                disabled={graded}
                onChange={(e) => setAnswerText(e.target.value)}
                rows={8}
                placeholder="Nhập câu trả lời của bạn..."
                className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm disabled:bg-muted/40"
              />
              <div className="mt-1 text-right text-[11px] text-muted-foreground">
                {answerText.trim().split(/\s+/).filter(Boolean).length} từ
              </div>
            </div>
          )}

          {a.allowFile && (
            <div className="mt-4">
              <label className="text-xs font-semibold text-muted-foreground">
                <Paperclip className="mr-1 inline h-3 w-3" /> File đính kèm (tối đa 5MB)
              </label>
              {file ? (
                <div className="mt-1 flex items-center justify-between gap-3 rounded-xl border border-border bg-muted/40 p-3">
                  <div className="min-w-0">
                    <div className="truncate text-sm font-medium">{file.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {(file.size / 1024).toFixed(1)} KB
                    </div>
                  </div>
                  {!graded && (
                    <button
                      onClick={() => setFile(undefined)}
                      className="rounded-lg p-2 text-muted-foreground hover:bg-background hover:text-rose-600"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
              ) : (
                !graded && (
                  <input
                    type="file"
                    onChange={(e) => onFile(e.target.files?.[0] ?? null)}
                    className="mt-1 block w-full rounded-lg border border-dashed border-border bg-background px-3 py-4 text-sm file:mr-3 file:rounded-md file:border-0 file:bg-foreground file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-background"
                  />
                )
              )}
            </div>
          )}

          {!graded && (
            <div className="mt-5 flex items-center justify-between gap-3">
              <div className="text-xs text-muted-foreground">
                {saved && <span className="text-emerald-700">✓ Đã lưu bài nộp.</span>}
              </div>
              <button
                onClick={submit}
                className="inline-flex items-center gap-1.5 rounded-xl px-4 py-2 text-sm font-semibold text-primary-foreground shadow-soft"
                style={{ background: "var(--gradient-brand)" }}
              >
                <Send className="h-4 w-4" /> {existing ? "Cập nhật bài nộp" : "Nộp bài"}
              </button>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
