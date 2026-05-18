import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useState } from "react";
import { TopNav } from "@/components/TopNav";
import { getTest, getTestSubmissions, testStatus, type TestSubmission } from "@/lib/tests-data";
import { SKILL_LABEL, TYPE_LABEL } from "@/lib/question-bank";
import { classes } from "@/lib/teacher-data";
import {
  ArrowLeft,
  Calendar,
  Clock,
  Users,
  CheckCircle2,
  AlertCircle,
  Hourglass,
  X,
  Send,
  ListChecks,
  FileText,
  BarChart3,
} from "lucide-react";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/teacher/tests/$testId")({
  head: ({ params }) => ({ meta: [{ title: `Đề thi ${params.testId} — UNICOM LMS` }] }),
  component: TestDetail,
});

function TestDetail() {
  const { testId } = Route.useParams();
  const test = getTest(testId);
  if (!test) throw notFound();
  const [tab, setTab] = useState<"overview" | "structure" | "results">("overview");
  const [subs, setSubs] = useState<TestSubmission[]>(getTestSubmissions(testId));
  const [grading, setGrading] = useState<TestSubmission | null>(null);
  const st = testStatus(test);
  const cls = test.classIds.map((id) => classes.find((c) => c.id === id)?.name ?? id);

  return (
    <div className="min-h-screen bg-background">
      <TopNav />
      <div className="mx-auto max-w-6xl px-6 pb-20 pt-10 sm:px-8">
        <Link
          to="/teacher/tests"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" /> Trở lại Thi cử
        </Link>

        <div className="mt-4 flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="rounded-lg bg-primary/10 px-2 py-1 text-[11px] font-bold uppercase text-primary">
                {test.level}
              </span>
              <StatusBadge status={st} />
            </div>
            <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight">
              {test.name}
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">{test.description}</p>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Mini icon={Calendar} label="Mở" value={new Date(test.openAt).toLocaleDateString("vi-VN")} />
            <Mini icon={Calendar} label="Đóng" value={new Date(test.closeAt).toLocaleDateString("vi-VN")} />
            <Mini icon={Clock} label="Thời lượng" value={`${test.durationMinutes}'`} />
            <Mini icon={Users} label="Đã nộp" value={`${test.submitted}/${test.registered}`} />
          </div>
        </div>

        <div className="mt-6 flex gap-1 rounded-xl bg-surface p-1 ring-1 ring-border w-fit">
          {(
            [
              { id: "overview", label: "Tổng quan", icon: BarChart3 },
              { id: "structure", label: "Cấu trúc đề", icon: ListChecks },
              { id: "results", label: "Kết quả thi", icon: FileText },
            ] as const
          ).map((t) => {
            const I = t.icon;
            return (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium",
                  tab === t.id
                    ? "bg-foreground text-background"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                <I className="h-4 w-4" /> {t.label}
              </button>
            );
          })}
        </div>

        {tab === "overview" && (
          <div className="mt-6 grid gap-4 lg:grid-cols-2">
            <div className="rounded-3xl border border-border bg-surface p-6 shadow-soft">
              <h2 className="font-semibold text-foreground">Lớp được giao</h2>
              <div className="mt-3 flex flex-wrap gap-2">
                {cls.map((n) => (
                  <span
                    key={n}
                    className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary"
                  >
                    {n}
                  </span>
                ))}
              </div>
              <div className="mt-5 space-y-2 text-sm">
                <Row label="Chế độ đề" value={test.mode === "random" ? "Bốc ngẫu nhiên từ ngân hàng" : "Cố định"} />
                <Row label="Tổng câu" value={String(test.structure.reduce((s, x) => s + x.count, 0))} />
                <Row label="Mở lúc" value={new Date(test.openAt).toLocaleString("vi-VN")} />
                <Row label="Đóng lúc" value={new Date(test.closeAt).toLocaleString("vi-VN")} />
              </div>
              {st === "upcoming" && (
                <div className="mt-4 rounded-xl bg-amber-50 p-3 text-xs text-amber-900">
                  <strong>Lưu ý:</strong> Học viên vào trước giờ mở sẽ không thể bắt đầu làm bài,
                  phải chờ đến {new Date(test.openAt).toLocaleString("vi-VN")}.
                </div>
              )}
            </div>
            <div className="rounded-3xl border border-border bg-surface p-6 shadow-soft">
              <h2 className="font-semibold text-foreground">Thống kê</h2>
              <div className="mt-4 grid grid-cols-2 gap-3">
                <Stat label="Đăng ký" value={test.registered} />
                <Stat label="Đã nộp" value={test.submitted} />
                <Stat label="Đã chấm" value={test.graded} accent />
                <Stat label="Điểm TB" value={test.avgScore ?? "—"} accent />
              </div>
            </div>
          </div>
        )}

        {tab === "structure" && (
          <div className="mt-6 overflow-hidden rounded-2xl border border-border bg-surface shadow-soft">
            <table className="w-full text-sm">
              <thead className="bg-muted/40 text-xs uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="px-4 py-3 text-left">#</th>
                  <th className="px-4 py-3 text-left">Kỹ năng</th>
                  <th className="px-4 py-3 text-left">Loại câu hỏi</th>
                  <th className="px-4 py-3 text-center">Cấp độ</th>
                  <th className="px-4 py-3 text-center">Số câu</th>
                </tr>
              </thead>
              <tbody>
                {test.structure.map((s, i) => (
                  <tr key={i} className="border-t border-border">
                    <td className="px-4 py-3 text-muted-foreground">{i + 1}</td>
                    <td className="px-4 py-3 font-medium">{SKILL_LABEL[s.skill]}</td>
                    <td className="px-4 py-3 text-muted-foreground">{TYPE_LABEL[s.type]}</td>
                    <td className="px-4 py-3 text-center">
                      <span className="rounded bg-primary/10 px-2 py-0.5 text-[11px] font-bold text-primary">
                        {s.level}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center font-semibold">{s.count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {tab === "results" && (
          <div className="mt-6 overflow-hidden rounded-2xl border border-border bg-surface shadow-soft">
            <table className="w-full text-sm">
              <thead className="bg-muted/40 text-xs uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="px-4 py-3 text-left">Học viên</th>
                  <th className="px-4 py-3 text-left">Lớp</th>
                  <th className="px-4 py-3 text-left">Nộp lúc</th>
                  <th className="px-4 py-3 text-center">Tự động</th>
                  <th className="px-4 py-3 text-center">Tay</th>
                  <th className="px-4 py-3 text-center">Tổng</th>
                  <th className="px-4 py-3 text-center">Trạng thái</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {subs.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-4 py-10 text-center text-muted-foreground">
                      Chưa có học viên nào nộp bài.
                    </td>
                  </tr>
                ) : (
                  subs.map((s) => (
                    <tr key={s.id} className="border-t border-border hover:bg-muted/30">
                      <td className="px-4 py-3 font-medium">{s.studentName}</td>
                      <td className="px-4 py-3 text-muted-foreground">{s.studentClass}</td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {s.submittedAt ? new Date(s.submittedAt).toLocaleString("vi-VN") : "—"}
                      </td>
                      <td className="px-4 py-3 text-center">{s.autoScore}</td>
                      <td className="px-4 py-3 text-center">{s.manualScore ?? "—"}</td>
                      <td className="px-4 py-3 text-center font-semibold text-primary">
                        {s.finalScore ?? "—"}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <StatusPill status={s.status} />
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => setGrading(s)}
                          className="rounded-lg bg-foreground px-3 py-1.5 text-xs font-semibold text-background hover:opacity-90"
                        >
                          {s.status === "graded" ? "Xem" : "Chấm"}
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {grading && (
        <GradingDrawer
          submission={grading}
          onClose={() => setGrading(null)}
          onSave={(u) => {
            setSubs((p) => p.map((x) => (x.id === u.id ? u : x)));
            setGrading(u);
          }}
        />
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: "upcoming" | "open" | "closed" }) {
  if (status === "upcoming")
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-semibold text-amber-700">
        <Hourglass className="h-3 w-3" /> Chưa mở
      </span>
    );
  if (status === "open")
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-semibold text-emerald-700">
        <CheckCircle2 className="h-3 w-3" /> Đang mở
      </span>
    );
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-[11px] font-semibold text-muted-foreground">
      Đã đóng
    </span>
  );
}

function StatusPill({ status }: { status: TestSubmission["status"] }) {
  const map = {
    "in-progress": { c: "bg-blue-100 text-blue-700", t: "Đang làm" },
    "auto-graded": { c: "bg-sky-100 text-sky-700", t: "Đã tự chấm" },
    "needs-grading": { c: "bg-amber-100 text-amber-700", t: "Cần chấm tay" },
    graded: { c: "bg-emerald-100 text-emerald-700", t: "Đã chấm" },
  } as const;
  const m = map[status];
  return (
    <span className={cn("rounded-full px-2 py-0.5 text-[11px] font-semibold", m.c)}>{m.t}</span>
  );
}

function Mini({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-border bg-surface px-3 py-2">
      <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
        <Icon className="h-3 w-3" /> {label}
      </div>
      <div className="mt-0.5 text-sm font-semibold text-foreground">{value}</div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between border-b border-border/60 py-2 last:border-0">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium text-foreground">{value}</span>
    </div>
  );
}

function Stat({
  label,
  value,
  accent,
}: {
  label: string;
  value: string | number;
  accent?: boolean;
}) {
  return (
    <div className="rounded-xl border border-border bg-background p-3">
      <div className="text-[11px] text-muted-foreground">{label}</div>
      <div
        className={cn(
          "mt-1 font-display text-2xl font-semibold",
          accent ? "text-primary" : "text-foreground",
        )}
      >
        {value}
      </div>
    </div>
  );
}

function GradingDrawer({
  submission,
  onClose,
  onSave,
}: {
  submission: TestSubmission;
  onClose: () => void;
  onSave: (s: TestSubmission) => void;
}) {
  const [answers, setAnswers] = useState(submission.answers);
  const update = (i: number, patch: Partial<(typeof answers)[number]>) =>
    setAnswers((p) => p.map((a, idx) => (idx === i ? { ...a, ...patch } : a)));

  const finish = () => {
    const manual = answers.reduce((s, a) => s + (a.awarded ?? 0), 0);
    onSave({
      ...submission,
      answers,
      manualScore: manual - submission.autoScore > 0 ? manual - submission.autoScore : manual,
      finalScore: manual,
      status: "graded",
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/40">
      <button onClick={onClose} className="absolute inset-0" aria-label="Close" />
      <div className="relative h-full w-full max-w-3xl overflow-y-auto bg-background p-6 shadow-elevated">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-display text-xl font-semibold">
              Chấm bài — {submission.studentName}
            </h2>
            <p className="text-xs text-muted-foreground">{submission.studentClass}</p>
          </div>
          <button onClick={onClose} className="rounded-lg p-2 hover:bg-muted">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-6 space-y-4">
          {answers.map((a, i) => (
            <div key={a.questionId} className="rounded-2xl border border-border p-4">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold uppercase tracking-wider text-muted-foreground">
                  Câu {i + 1} • {a.type.toUpperCase()} • {a.points}đ
                </span>
                {a.correctAnswer && (
                  <span className="text-emerald-700">Đáp án mẫu: {a.correctAnswer}</span>
                )}
              </div>
              <p className="mt-2 text-sm font-medium">{a.question}</p>
              <div className="mt-3 rounded-xl bg-muted/60 p-3 text-sm">
                <div className="text-[11px] font-semibold uppercase text-muted-foreground">
                  Bài làm của học viên
                </div>
                <p className="mt-1">{a.studentAnswer}</p>
              </div>
              <div className="mt-3 grid gap-3 sm:grid-cols-[120px_1fr]">
                <div>
                  <label className="text-xs text-muted-foreground">Điểm (0-{a.points})</label>
                  <input
                    type="number"
                    min={0}
                    max={a.points}
                    value={a.awarded ?? ""}
                    onChange={(e) => update(i, { awarded: Number(e.target.value) })}
                    className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">Giải đáp / Nhận xét</label>
                  <textarea
                    value={a.feedback ?? ""}
                    onChange={(e) => update(i, { feedback: e.target.value })}
                    rows={2}
                    className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="sticky bottom-0 mt-6 flex justify-end gap-2 border-t border-border bg-background pt-4">
          <button
            onClick={onClose}
            className="rounded-xl border border-border bg-background px-4 py-2 text-sm font-semibold hover:bg-muted"
          >
            Hủy
          </button>
          <button
            onClick={finish}
            className="inline-flex items-center gap-1.5 rounded-xl px-4 py-2 text-sm font-semibold text-primary-foreground shadow-soft"
            style={{ background: "var(--gradient-brand)" }}
          >
            <Send className="h-4 w-4" /> Hoàn tất
          </button>
        </div>
      </div>
    </div>
  );
}
