import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useState } from "react";
import { TopNav } from "@/components/TopNav";
import { getTest, getTestSubmissions, testStatus, type TestSubmission } from "@/lib/tests-data";
import { SKILL_LABEL, TYPE_LABEL, questionBank, type BankQuestion, type QSkill } from "@/lib/question-bank";
import { classes } from "@/lib/teacher-data";
import {
  ArrowLeft,
  Calendar,
  Clock,
  Users,
  CheckCircle2,
  
  Hourglass,
  X,
  Send,
  ListChecks,
  FileText,
  BarChart3,
  HelpCircle,
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
  const [tab, setTab] = useState<"overview" | "structure" | "questions" | "results">("overview");
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
              { id: "questions", label: "Câu hỏi", icon: HelpCircle },
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

        {tab === "questions" && <QuestionsTab test={test} />}

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

  const updateRubric = (i: number, ri: number, awarded: number) =>
    setAnswers((p) =>
      p.map((a, idx) => {
        if (idx !== i || !a.rubric) return a;
        const newR = a.rubric.map((r, j) => (j === ri ? { ...r, awarded } : r));
        const sum = newR.reduce((s, r) => s + (r.awarded ?? 0), 0);
        return { ...a, rubric: newR, awarded: Math.min(a.points, Number(sum.toFixed(2))) };
      }),
    );

  // Chỉ chấm tay: writing & speaking. Các dạng khác đã chấm tự động.
  const manualIdx = answers
    .map((a, i) => ({ a, i }))
    .filter(({ a }) => a.skill === "writing" || a.skill === "speaking" || a.type === "essay");
  const autoCount = answers.length - manualIdx.length;

  const finish = () => {
    const manualSum = manualIdx.reduce((s, { a }) => s + (a.awarded ?? 0), 0);
    onSave({
      ...submission,
      answers,
      manualScore: Number(manualSum.toFixed(2)),
      finalScore: Number((submission.autoScore + manualSum).toFixed(2)),
      status: "graded",
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/40">
      <button onClick={onClose} className="absolute inset-0" aria-label="Close" />
      <div className="relative h-full w-full max-w-6xl overflow-y-auto bg-background shadow-elevated">
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-border bg-background/95 px-8 py-5 backdrop-blur">
          <div>
            <h2 className="font-display text-2xl font-semibold">
              Chấm bài Nói & Viết — {submission.studentName}
            </h2>
            <p className="mt-1 text-xs text-muted-foreground">
              {submission.studentClass} • {manualIdx.length} câu cần chấm tay • {autoCount} câu đã
              tự động chấm ({submission.autoScore} điểm)
            </p>
          </div>
          <button onClick={onClose} className="rounded-lg p-2 hover:bg-muted">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-6 px-8 py-6">
          {manualIdx.length === 0 && (
            <div className="rounded-2xl border border-dashed border-border bg-muted/30 p-10 text-center text-sm text-muted-foreground">
              Bài làm này không có câu Nói hoặc Viết cần chấm tay.
            </div>
          )}

          {manualIdx.map(({ a, i }) => {
            const isSpeaking = a.skill === "speaking";
            return (
              <div
                key={a.questionId}
                className="overflow-hidden rounded-3xl border border-border bg-surface shadow-soft"
              >
                <div className="flex items-center justify-between border-b border-border bg-muted/30 px-6 py-3">
                  <div className="flex items-center gap-2 text-xs">
                    <span
                      className={cn(
                        "rounded-full px-2.5 py-0.5 font-semibold uppercase tracking-wider",
                        isSpeaking
                          ? "bg-violet-100 text-violet-700"
                          : "bg-sky-100 text-sky-700",
                      )}
                    >
                      {isSpeaking ? "Speaking" : "Writing"}
                    </span>
                    <span className="text-muted-foreground">
                      Câu {i + 1} • Tối đa {a.points}đ
                    </span>
                  </div>
                  <div className="text-sm">
                    <span className="text-muted-foreground">Điểm hiện tại: </span>
                    <span className="font-semibold text-primary">
                      {a.awarded ?? 0}/{a.points}
                    </span>
                  </div>
                </div>

                <div className="grid gap-6 p-6 lg:grid-cols-[1.4fr_1fr]">
                  {/* Cột trái: đề + bài làm */}
                  <div className="space-y-4">
                    <div>
                      <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                        Đề bài
                      </div>
                      <p className="mt-1 text-sm font-medium text-foreground">{a.question}</p>
                    </div>

                    <div className="rounded-2xl border border-border bg-background p-4">
                      <div className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                        Bài làm của học viên
                      </div>
                      {isSpeaking && a.studentAudioUrl && (
                        <audio controls className="mb-3 w-full">
                          <source src={a.studentAudioUrl} />
                        </audio>
                      )}
                      <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground">
                        {a.studentAnswer || (
                          <span className="italic text-muted-foreground">(Trống)</span>
                        )}
                      </p>
                      {!isSpeaking && a.studentAnswer && (
                        <div className="mt-2 text-[11px] text-muted-foreground">
                          {a.studentAnswer.trim().split(/\s+/).length} từ •{" "}
                          {a.studentAnswer.length} ký tự
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-muted-foreground">
                        Nhận xét cho học viên
                      </label>
                      <textarea
                        value={a.feedback ?? ""}
                        onChange={(e) => update(i, { feedback: e.target.value })}
                        rows={4}
                        placeholder="Góp ý cụ thể về điểm mạnh, điểm cần cải thiện..."
                        className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                      />
                    </div>
                  </div>

                  {/* Cột phải: rubric */}
                  <div className="rounded-2xl border border-border bg-background p-4">
                    <div className="mb-3 flex items-center justify-between">
                      <div>
                        <div className="text-sm font-semibold text-foreground">
                          Rubric chấm điểm
                        </div>
                        <div className="text-[11px] text-muted-foreground">
                          {isSpeaking
                            ? "Đánh giá theo 4 tiêu chí Speaking"
                            : "Đánh giá theo 4 tiêu chí Writing"}
                        </div>
                      </div>
                      <span className="rounded-lg bg-primary/10 px-2 py-1 text-xs font-bold text-primary">
                        {(a.rubric ?? []).reduce((s, r) => s + (r.awarded ?? 0), 0).toFixed(2)}/
                        {a.points}
                      </span>
                    </div>

                    <div className="space-y-3">
                      {(a.rubric ?? []).map((r, ri) => (
                        <div key={ri} className="rounded-xl border border-border/70 p-3">
                          <div className="flex items-start justify-between gap-2">
                            <div className="text-xs font-medium text-foreground">
                              {r.criterion}
                            </div>
                            <span className="shrink-0 text-[11px] text-muted-foreground">
                              /{r.max}
                            </span>
                          </div>
                          <div className="mt-2 flex items-center gap-2">
                            <input
                              type="range"
                              min={0}
                              max={r.max}
                              step={0.25}
                              value={r.awarded ?? 0}
                              onChange={(e) =>
                                updateRubric(i, ri, Number(e.target.value))
                              }
                              className="flex-1 accent-primary"
                            />
                            <input
                              type="number"
                              min={0}
                              max={r.max}
                              step={0.25}
                              value={r.awarded ?? 0}
                              onChange={(e) =>
                                updateRubric(i, ri, Number(e.target.value))
                              }
                              className="w-16 rounded-lg border border-border bg-background px-2 py-1 text-center text-xs font-semibold"
                            />
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="mt-4 rounded-xl bg-muted/40 p-3 text-[11px] leading-relaxed text-muted-foreground">
                      <strong className="text-foreground">Gợi ý chấm:</strong>{" "}
                      {isSpeaking
                        ? "Mỗi tiêu chí 0–1.25đ. ≥1.0 thành thạo, 0.5–0.75 trung bình, ≤0.25 yếu. Lắng nghe lại đoạn ghi âm để đánh giá phát âm & ngữ điệu."
                        : "Mỗi tiêu chí 1.0–1.5đ. Đối chiếu yêu cầu đề (số từ, chủ đề), tính mạch lạc, độ phong phú từ vựng và chính xác ngữ pháp."}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="sticky bottom-0 flex items-center justify-between gap-3 border-t border-border bg-background/95 px-8 py-4 backdrop-blur">
          <div className="text-sm">
            <span className="text-muted-foreground">Tổng điểm dự kiến: </span>
            <span className="font-display text-lg font-semibold text-primary">
              {(
                submission.autoScore +
                manualIdx.reduce((s, { a }) => s + (a.awarded ?? 0), 0)
              ).toFixed(2)}
            </span>
            <span className="ml-1 text-xs text-muted-foreground">
              (Tự động {submission.autoScore} + Chấm tay{" "}
              {manualIdx.reduce((s, { a }) => s + (a.awarded ?? 0), 0).toFixed(2)})
            </span>
          </div>
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="rounded-xl border border-border bg-background px-4 py-2 text-sm font-semibold hover:bg-muted"
            >
              Hủy
            </button>
            <button
              onClick={finish}
              className="inline-flex items-center gap-1.5 rounded-xl px-5 py-2 text-sm font-semibold text-primary-foreground shadow-soft"
              style={{ background: "var(--gradient-brand)" }}
            >
              <Send className="h-4 w-4" /> Hoàn tất chấm bài
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function QuestionsTab({ test }: { test: ReturnType<typeof getTest> & object }) {
  // Gom câu hỏi theo từng kỹ năng (gộp mọi loại trong cùng 1 kỹ năng).
  const groups = new Map<QSkill, BankQuestion[]>();

  test.structure.forEach((item) => {
    let qs: BankQuestion[] = [];
    if (item.customBank && item.customBank.length) {
      qs = item.customBank;
    } else if (item.pickedIds && item.pickedIds.length) {
      qs = item.pickedIds
        .map((id) => questionBank.find((q) => q.id === id))
        .filter((q): q is BankQuestion => !!q);
    } else {
      qs = questionBank
        .filter((q) => q.skill === item.skill && q.type === item.type && q.level === item.level)
        .slice(0, item.count);
    }
    const arr = groups.get(item.skill) ?? [];
    arr.push(...qs);
    groups.set(item.skill, arr);
  });

  const skillsInOrder = Array.from(groups.keys());
  const totalQuestions = test.structure.reduce((s, x) => s + x.count, 0);
  const multiSkill = skillsInOrder.length > 1;

  return (
    <div className="mt-6 space-y-6">
      <div className="flex items-center justify-between rounded-2xl border border-border bg-surface px-4 py-3 text-sm">
        <span className="text-muted-foreground">
          Tổng <span className="font-semibold text-foreground">{totalQuestions}</span> câu hỏi
          {multiSkill && ` • Phân loại theo ${skillsInOrder.length} kỹ năng`}
        </span>
        {test.mode === "random" && (
          <span className="text-xs text-muted-foreground">
            Đề bốc ngẫu nhiên — hiển thị mẫu từ ngân hàng câu hỏi
          </span>
        )}
      </div>

      {skillsInOrder.map((skill) => {
        const questions = groups.get(skill)!;
        return (
          <section key={skill} className="overflow-hidden rounded-3xl border border-border bg-surface shadow-soft">
            <header className="flex items-center justify-between border-b border-border bg-muted/40 px-6 py-3">
              <div className="flex items-center gap-2">
                <span className="rounded-lg bg-primary/10 px-2 py-1 text-[11px] font-bold uppercase text-primary">
                  Kỹ năng
                </span>
                <h3 className="font-display text-base font-semibold">{SKILL_LABEL[skill]}</h3>
              </div>
              <span className="text-xs text-muted-foreground">{questions.length} câu</span>
            </header>

            <ol className="divide-y divide-border">
              {questions.length === 0 ? (
                <li className="px-6 py-10 text-center text-xs text-muted-foreground">
                  Chưa có câu hỏi phù hợp trong ngân hàng.
                </li>
              ) : (
                questions.map((q, i) => (
                  <li key={q.id + i} className="flex items-start gap-3 px-6 py-4 text-sm">
                    <span className="mt-0.5 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-muted text-xs font-semibold text-muted-foreground">
                      {i + 1}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="font-medium leading-relaxed text-foreground">{q.content}</p>

                      {(q.type === "mcq" || q.type === "mcq-multi") && q.options && (
                        <ol className="mt-3 space-y-1.5 pl-1">
                          {q.options.map((opt, oi) => (
                            <li key={oi} className="flex items-start gap-2 text-sm text-foreground">
                              <span className="mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-border text-[11px] font-semibold text-muted-foreground">
                                {String.fromCharCode(65 + oi)}
                              </span>
                              <span>{opt}</span>
                            </li>
                          ))}
                        </ol>
                      )}

                      {q.type === "tf" && (
                        <div className="mt-3 flex gap-3 text-sm">
                          <span className="inline-flex items-center gap-1.5">
                            <span className="inline-block h-4 w-4 rounded-full border border-border" />
                            True
                          </span>
                          <span className="inline-flex items-center gap-1.5">
                            <span className="inline-block h-4 w-4 rounded-full border border-border" />
                            False
                          </span>
                        </div>
                      )}
                    </div>
                  </li>
                ))
              )}
            </ol>
          </section>
        );
      })}
    </div>
  );
}
