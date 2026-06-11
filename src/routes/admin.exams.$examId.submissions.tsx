import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { TopNav } from "@/components/TopNav";
import { getSubmissionsByExam, type ExamSubmission, type ExamAnswer } from "@/lib/exam-submissions";
import { ArrowLeft, Clock, CheckCircle2, AlertCircle, Send, X, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/admin/exams/$examId/submissions")({
  head: () => ({ meta: [{ title: "Bài làm học viên — UNICOM LMS" }] }),
  component: SubmissionsPage,
});

function SubmissionsPage() {
  const { examId } = Route.useParams();
  const initial = getSubmissionsByExam(examId);
  const [subs, setSubs] = useState<ExamSubmission[]>(
    initial.length > 0 ? initial : getSubmissionsByExam("seed-1"),
  );
  const [active, setActive] = useState<ExamSubmission | null>(null);

  return (
    <div className="min-h-screen bg-background">
      <TopNav />
      <div className="mx-auto max-w-7xl px-6 pb-20 pt-10 sm:px-8">
        <Link
          to="/admin/exams"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" /> Trở lại danh sách bài luyện thi
        </Link>

        <div className="mt-4 flex items-end justify-between">
          <div>
            <h1 className="font-display text-3xl font-semibold tracking-tight">
              Bài làm học viên
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {subs.length} bài đã nộp • {subs.filter((s) => s.status === "pending").length} chờ chấm
            </p>
          </div>
        </div>

        <div className="mt-6 overflow-hidden rounded-2xl border border-border bg-surface shadow-soft">
          <table className="w-full text-sm">
            <thead className="bg-muted/40 text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="px-4 py-3 text-left">Học viên</th>
                <th className="px-4 py-3 text-left">Lớp</th>
                <th className="px-4 py-3 text-left">Thời gian nộp</th>
                <th className="px-4 py-3 text-center">Thời lượng</th>
                <th className="px-4 py-3 text-center">Điểm tự động</th>
                <th className="px-4 py-3 text-center">Điểm cuối</th>
                <th className="px-4 py-3 text-center">Trạng thái</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {subs.map((s) => (
                <tr key={s.id} className="border-t border-border hover:bg-muted/30">
                  <td className="px-4 py-3 font-medium text-foreground">{s.studentName}</td>
                  <td className="px-4 py-3 text-muted-foreground">{s.studentClass}</td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {new Date(s.submittedAt).toLocaleString("vi-VN")}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className="inline-flex items-center gap-1 text-muted-foreground">
                      <Clock className="h-3 w-3" /> {s.durationMinutes}'
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center font-semibold">{s.autoScore}</td>
                  <td className="px-4 py-3 text-center font-semibold text-primary">
                    {s.finalScore ?? "—"}
                  </td>
                  <td className="px-4 py-3 text-center">
                    {s.status === "graded" ? (
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
                      {s.status === "graded" ? "Xem" : "Chấm bài"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {active && (
        <GradingDrawer
          submission={active}
          onClose={() => setActive(null)}
          onSave={(updated) => {
            setSubs((prev) => prev.map((x) => (x.id === updated.id ? updated : x)));
            setActive(updated);
          }}
        />
      )}
    </div>
  );
}

function GradingDrawer({
  submission,
  onClose,
  onSave,
}: {
  submission: ExamSubmission;
  onClose: () => void;
  onSave: (s: ExamSubmission) => void;
}) {
  const [answers, setAnswers] = useState<ExamAnswer[]>(submission.answers);
  const [idx, setIdx] = useState(0);
  const total = answers.length;
  const a = answers[idx];

  const updateAnswer = (i: number, patch: Partial<ExamAnswer>) =>
    setAnswers((prev) => prev.map((x, k) => (k === i ? { ...x, ...patch } : x)));

  const finish = () => {
    const manualTotal = answers.reduce((s, a) => s + (a.manualScore ?? 0), 0);
    const auto = submission.autoScore;
    onSave({
      ...submission,
      answers,
      finalScore: auto + manualTotal,
      status: "graded",
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/40">
      <button onClick={onClose} className="absolute inset-0" aria-label="Close" />
      <div className="relative flex h-full w-full max-w-3xl flex-col bg-background shadow-elevated">
        <div className="flex items-center justify-between border-b border-border p-6">
          <div>
            <h2 className="font-display text-xl font-semibold text-foreground">
              Chấm bài — {submission.studentName}
            </h2>
            <p className="text-xs text-muted-foreground">
              {submission.studentClass} • Điểm tự động: {submission.autoScore}
            </p>
          </div>
          <button onClick={onClose} className="rounded-lg p-2 hover:bg-muted">
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Question pager */}
        <div className="flex items-center gap-2 border-b border-border bg-muted/30 px-6 py-3 overflow-x-auto">
          <span className="text-xs font-semibold text-muted-foreground">Câu hỏi:</span>
          {answers.map((ans, i) => {
            const isActive = i === idx;
            const isGraded = ans.type !== "essay" || ans.manualScore !== undefined;
            return (
              <button
                key={ans.questionId}
                onClick={() => setIdx(i)}
                className={cn(
                  "flex h-8 w-8 shrink-0 items-center justify-center rounded-md border text-xs font-semibold transition-colors",
                  isActive
                    ? "border-primary bg-primary text-primary-foreground"
                    : isGraded
                      ? "border-emerald-300 bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                      : "border-border bg-background text-muted-foreground hover:bg-muted",
                )}
              >
                {i + 1}
              </button>
            );
          })}
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <div className="rounded-2xl border border-border p-4">
            <div className="flex items-center justify-between">
              <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Câu {idx + 1}/{total} • {a.type.toUpperCase()}
              </div>
              {a.autoScore !== undefined && (
                <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-semibold text-emerald-700">
                  Tự động: {a.autoScore}
                </span>
              )}
            </div>
            <p className="mt-2 text-sm font-medium text-foreground">{a.question}</p>
            <div className="mt-3 rounded-xl bg-muted/60 p-3 text-sm">
              <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                Bài làm
              </div>
              <p className="mt-1 text-foreground">{a.studentAnswer}</p>
            </div>
            {a.correctAnswer && (
              <div className="mt-2 text-xs text-emerald-700">
                Đáp án mẫu: <strong>{a.correctAnswer}</strong>
              </div>
            )}

            {a.type === "essay" && (
              <div className="mt-3 grid gap-3 sm:grid-cols-[120px_1fr]">
                <div>
                  <label className="text-xs text-muted-foreground">Điểm (0-5)</label>
                  <input
                    type="number"
                    min={0}
                    max={5}
                    value={a.manualScore ?? ""}
                    onChange={(e) =>
                      updateAnswer(idx, { manualScore: Number(e.target.value) })
                    }
                    className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">Nhận xét / Giải đáp</label>
                  <textarea
                    value={a.feedback ?? ""}
                    onChange={(e) => updateAnswer(idx, { feedback: e.target.value })}
                    rows={2}
                    className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                    placeholder="Phản hồi cho học viên..."
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between gap-2 border-t border-border bg-background p-4">
          <button
            onClick={() => setIdx((i) => Math.max(0, i - 1))}
            disabled={idx === 0}
            className="inline-flex items-center gap-1 rounded-xl border border-border bg-background px-3 py-2 text-sm font-semibold hover:bg-muted disabled:opacity-40"
          >
            <ChevronLeft className="h-4 w-4" /> Câu trước
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="rounded-xl border border-border bg-background px-4 py-2 text-sm font-semibold hover:bg-muted"
            >
              Hủy
            </button>
            {idx < total - 1 ? (
              <button
                onClick={() => setIdx((i) => Math.min(total - 1, i + 1))}
                className="inline-flex items-center gap-1 rounded-xl bg-foreground px-4 py-2 text-sm font-semibold text-background hover:opacity-90"
              >
                Câu tiếp <ChevronRight className="h-4 w-4" />
              </button>
            ) : (
              <button
                onClick={finish}
                className="inline-flex items-center gap-1.5 rounded-xl px-4 py-2 text-sm font-semibold text-primary-foreground shadow-soft"
                style={{ background: "var(--gradient-brand)" }}
              >
                <Send className="h-4 w-4" /> Hoàn tất chấm bài
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
