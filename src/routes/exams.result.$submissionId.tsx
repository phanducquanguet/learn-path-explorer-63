import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  ClipboardCheck,
  Clock,
  FileText,
  GraduationCap,
  Mic,
  PenLine,
  ShieldAlert,
  Sparkles,
  XCircle,
} from "lucide-react";
import { TopNav } from "@/components/TopNav";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  testSubmissions,
  tests,
  type ProctorEvent,
  type TestSubmission,
} from "@/lib/tests-data";

export const Route = createFileRoute("/exams/result/$submissionId")({
  head: () => ({
    meta: [
      { title: "Kết quả bài thi — UNICOM LMS" },
      { name: "description", content: "Xem chi tiết kết quả bài thi của bạn." },
    ],
  }),
  loader: ({ params }) => {
    const sub = testSubmissions.find((s) => s.id === params.submissionId);
    if (!sub) throw notFound();
    return { sub };
  },
  component: ResultPage,
  errorComponent: ({ error }) => (
    <div className="mx-auto max-w-2xl p-10 text-center text-sm text-destructive">
      {(error as Error).message}
    </div>
  ),
  notFoundComponent: () => (
    <div className="mx-auto max-w-2xl p-10 text-center text-sm text-muted-foreground">
      Không tìm thấy kết quả bài thi.
    </div>
  ),
});

function ResultPage() {
  const { sub } = Route.useLoaderData() as { sub: TestSubmission };
  const test = tests.find((t) => t.id === sub.testId);

  const totalPoints = sub.answers.reduce((s, a) => s + a.points, 0);
  const earnedPoints = sub.answers.reduce((s, a) => s + (a.awarded ?? 0), 0);
  const pct = totalPoints > 0 ? Math.round((earnedPoints / totalPoints) * 100) : 0;

  const autoAnswers = sub.answers.filter((a) => a.type === "mcq" || a.type === "tf" || a.type === "short" && a.skill !== "speaking");
  const manualAnswers = sub.answers.filter((a) => a.type === "essay" || (a.type === "short" && a.skill === "speaking"));

  const pending = sub.status === "needs-grading" || sub.status === "auto-graded" || sub.status === "in-progress";

  return (
    <div className="min-h-screen bg-background">
      <TopNav />
      <div className="mx-auto max-w-5xl px-6 pb-20 pt-10 sm:px-8">
        <Link
          to="/exams"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Quay lại danh sách bài thi
        </Link>

        {/* Header */}
        <div className="mt-4 rounded-3xl border bg-surface p-6 shadow-soft">
          <div className="flex flex-col gap-2">
            <span className="inline-flex w-fit items-center gap-2 text-xs font-semibold uppercase tracking-wider text-primary">
              <Sparkles className="h-3.5 w-3.5" /> Kết quả bài thi
            </span>
            <h1 className="font-display text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
              {test?.name ?? "Bài thi"}
            </h1>
            <p className="text-sm text-muted-foreground">{test?.description}</p>
            <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" />
                {sub.durationMinutes ?? "—"} phút làm bài
              </span>
              <span>•</span>
              <span>
                Nộp lúc {sub.submittedAt ? formatDateTime(sub.submittedAt) : "—"}
              </span>
              <span>•</span>
              <StatusBadge status={sub.status} />
            </div>
          </div>

          {/* Score panel */}
          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            <ScoreCard
              icon={<GraduationCap className="h-4 w-4" />}
              label={pending ? "Điểm tạm tính" : "Điểm cuối"}
              value={`${(sub.finalScore ?? earnedPoints).toFixed(1)} / ${totalPoints}`}
              hint={`${pct}% tổng điểm`}
              progress={pct}
              accent="primary"
            />
            <ScoreCard
              icon={<ClipboardCheck className="h-4 w-4" />}
              label="Tự động chấm"
              value={`${sub.autoScore.toFixed(1)} đ`}
              hint="Trắc nghiệm & điền từ"
              accent="emerald"
            />
            <ScoreCard
              icon={<PenLine className="h-4 w-4" />}
              label="Giáo viên chấm"
              value={
                sub.manualScore != null
                  ? `${sub.manualScore.toFixed(1)} đ`
                  : "Đang chờ"
              }
              hint={pending ? "Bài tự luận/nói đang chờ chấm" : "Đã hoàn tất"}
              accent="amber"
            />
          </div>

          {pending && (
            <div className="mt-4 flex items-start gap-2 rounded-xl border border-amber-500/40 bg-amber-500/5 p-3 text-xs text-foreground">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
              <span>
                Một số câu tự luận/nói cần giáo viên chấm thủ công. Điểm cuối sẽ
                được cập nhật sau khi giáo viên hoàn tất.
              </span>
            </div>
          )}
        </div>

        {/* Proctor warnings */}
        {sub.proctorEvents && sub.proctorEvents.length > 0 && (
          <ProctorPanel events={sub.proctorEvents} />
        )}

        {/* Questions — paginated like the exam UI */}
        <QuestionReview answers={sub.answers} />
      </div>
    </div>
  );
}

function QuestionReview({ answers }: { answers: TestSubmission["answers"] }) {
  const [idx, setIdx] = useState(0);
  const total = answers.length;
  const current = answers[idx];

  const groups = useMemo(() => {
    const map = new Map<string, { label: string; indices: number[] }>();
    const labels: Record<string, string> = {
      listening: "Listening",
      reading: "Reading",
      speaking: "Speaking",
      writing: "Writing",
    };
    answers.forEach((a, i) => {
      const key = a.skill ?? "other";
      const label = labels[key] ?? "Khác";
      if (!map.has(key)) map.set(key, { label, indices: [] });
      map.get(key)!.indices.push(i);
    });
    return Array.from(map.values());
  }, [answers]);

  return (
    <section className="mt-8">
      <div className="mb-3 flex items-center gap-2">
        <div className="grid h-8 w-8 place-content-center rounded-lg bg-primary/10 text-primary">
          <ClipboardCheck className="h-4 w-4" />
        </div>
        <div>
          <h2 className="font-display text-lg font-semibold text-foreground">
            Xem lại bài làm theo từng câu
          </h2>
          <p className="text-xs text-muted-foreground">
            Chuyển giữa các câu để xem đáp án của bạn và đáp án đúng
          </p>
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-[260px_1fr]">
        {/* Sidebar pager */}
        <aside className="rounded-2xl border bg-surface p-4 shadow-soft lg:sticky lg:top-4 lg:self-start">
          <div className="text-sm font-semibold text-foreground">Danh sách câu hỏi</div>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Chuyển giữa các phần để xem lại đáp án.
          </p>
          <div className="mt-3 space-y-3">
            {groups.map((g) => (
              <div key={g.label}>
                <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  {g.label}
                </div>
                <div className="mt-1.5 flex flex-wrap gap-1.5">
                  {g.indices.map((i) => {
                    const a = answers[i];
                    const isActive = i === idx;
                    const isAuto = a.type !== "essay" && !(a.type === "short" && a.skill === "speaking");
                    const correct =
                      isAuto &&
                      a.correctAnswer != null &&
                      a.studentAnswer.trim().toLowerCase() ===
                        a.correctAnswer.trim().toLowerCase();
                    const pending = !isAuto && a.awarded == null;
                    return (
                      <button
                        key={a.questionId}
                        onClick={() => setIdx(i)}
                        className={`flex h-8 w-8 items-center justify-center rounded-md border text-xs font-semibold transition-colors ${
                          isActive
                            ? "border-primary bg-primary text-primary-foreground"
                            : isAuto
                              ? correct
                                ? "border-emerald-300 bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                                : "border-rose-300 bg-rose-50 text-rose-700 hover:bg-rose-100"
                              : pending
                                ? "border-amber-300 bg-amber-50 text-amber-700 hover:bg-amber-100"
                                : "border-primary/30 bg-primary/5 text-primary hover:bg-primary/10"
                        }`}
                      >
                        {i + 1}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 space-y-1.5 border-t pt-3 text-[11px] text-muted-foreground">
            <LegendDot cls="bg-emerald-100 border-emerald-300" label="Đúng" />
            <LegendDot cls="bg-rose-100 border-rose-300" label="Sai" />
            <LegendDot cls="bg-amber-100 border-amber-300" label="Chờ chấm" />
            <LegendDot cls="bg-primary/5 border-primary/30" label="Đã chấm tay" />
          </div>
        </aside>

        {/* Active question */}
        <div className="rounded-2xl border bg-surface p-5 shadow-soft">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span className="rounded-md border bg-background px-2 py-1 font-semibold text-foreground">
                Câu {idx + 1}/{total}
              </span>
              <span className="rounded-md border bg-background px-2 py-1">
                {labelType(current.type)}
              </span>
              {current.skill && (
                <span className="rounded-md border bg-background px-2 py-1 capitalize">
                  {current.skill}
                </span>
              )}
            </div>
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {(current.awarded ?? 0).toFixed(1)} / {current.points} đ
            </span>
          </div>

          <div className="mt-4">
            {current.type === "essay" || (current.type === "short" && current.skill === "speaking") ? (
              <ManualAnswerCard index={idx + 1} answer={current} />
            ) : (
              <AutoAnswerCard index={idx + 1} answer={current} />
            )}
          </div>

          <div className="mt-5 flex items-center justify-between gap-2 border-t pt-4">
            <button
              onClick={() => setIdx((i) => Math.max(0, i - 1))}
              disabled={idx === 0}
              className="inline-flex items-center gap-1 rounded-xl border bg-background px-3 py-2 text-sm font-semibold hover:bg-muted disabled:opacity-40"
            >
              <ChevronLeft className="h-4 w-4" /> Câu trước
            </button>
            <div className="text-xs text-muted-foreground">
              {idx + 1} / {total}
            </div>
            <button
              onClick={() => setIdx((i) => Math.min(total - 1, i + 1))}
              disabled={idx === total - 1}
              className="inline-flex items-center gap-1 rounded-xl bg-foreground px-4 py-2 text-sm font-semibold text-background hover:opacity-90 disabled:opacity-40"
            >
              Câu tiếp <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

function LegendDot({ cls, label }: { cls: string; label: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className={`inline-block h-4 w-4 rounded border ${cls}`} />
      {label}
    </div>
  );
}

function AutoAnswerCard({
  index,
  answer,
}: {
  index: number;
  answer: TestSubmission["answers"][number];
}) {
  const correct =
    answer.correctAnswer != null &&
    answer.studentAnswer.trim().toLowerCase() ===
      answer.correctAnswer.trim().toLowerCase();
  return (
    <div>
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            Câu {index} · {labelType(answer.type)}
          </div>
          <div className="mt-1 text-base font-medium text-foreground">
            {answer.question}
          </div>
        </div>
        <ResultPill correct={correct} awarded={answer.awarded} points={answer.points} />
      </div>
      <div className="mt-4 grid gap-2 sm:grid-cols-2">
        <KV
          label="Đáp án của bạn"
          value={answer.studentAnswer || "(bỏ trống)"}
          tone={correct ? "good" : "bad"}
        />
        {answer.correctAnswer && (
          <KV label="Đáp án đúng" value={answer.correctAnswer} tone="good" />
        )}
      </div>
    </div>
  );
}

function formatDateTime(iso: string) {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${pad(d.getUTCDate())}/${pad(d.getUTCMonth() + 1)}/${d.getUTCFullYear()} ${pad(d.getUTCHours())}:${pad(d.getUTCMinutes())}`;
}

function formatTime(iso: string) {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${pad(d.getUTCHours())}:${pad(d.getUTCMinutes())}:${pad(d.getUTCSeconds())}`;
}

function labelType(t: TestSubmission["answers"][number]["type"]) {
  return t === "mcq"
    ? "Trắc nghiệm"
    : t === "tf"
      ? "Đúng/Sai"
      : t === "essay"
        ? "Tự luận"
        : "Điền từ";
}

function StatusBadge({ status }: { status: TestSubmission["status"] }) {
  const map: Record<TestSubmission["status"], { label: string; cls: string }> = {
    graded: {
      label: "Đã chấm xong",
      cls: "bg-emerald-500/10 text-emerald-700 ring-emerald-500/30",
    },
    "needs-grading": {
      label: "Đang chờ giáo viên chấm",
      cls: "bg-amber-500/10 text-amber-700 ring-amber-500/30",
    },
    "auto-graded": {
      label: "Đã chấm tự động",
      cls: "bg-blue-500/10 text-blue-700 ring-blue-500/30",
    },
    "in-progress": {
      label: "Đang làm bài",
      cls: "bg-muted text-muted-foreground ring-border",
    },
  };
  const x = map[status];
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold ring-1 ${x.cls}`}
    >
      {x.label}
    </span>
  );
}

function ScoreCard({
  icon,
  label,
  value,
  hint,
  progress,
  accent,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  hint: string;
  progress?: number;
  accent: "primary" | "emerald" | "amber";
}) {
  const accentCls = {
    primary: "from-primary/15 to-primary/5 text-primary",
    emerald: "from-emerald-500/15 to-emerald-500/5 text-emerald-700",
    amber: "from-amber-500/15 to-amber-500/5 text-amber-700",
  }[accent];
  return (
    <div className={`rounded-2xl border bg-gradient-to-br ${accentCls} p-4`}>
      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider">
        {icon}
        {label}
      </div>
      <div className="mt-2 text-2xl font-semibold text-foreground">{value}</div>
      <div className="mt-0.5 text-xs text-muted-foreground">{hint}</div>
      {progress != null && (
        <Progress value={progress} className="mt-3 h-1.5" />
      )}
    </div>
  );
}

function Section({
  icon,
  title,
  subtitle,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mt-8">
      <div className="mb-3 flex items-center gap-2">
        <div className="grid h-8 w-8 place-content-center rounded-lg bg-primary/10 text-primary">
          {icon}
        </div>
        <div>
          <h2 className="font-display text-lg font-semibold text-foreground">
            {title}
          </h2>
          {subtitle && (
            <p className="text-xs text-muted-foreground">{subtitle}</p>
          )}
        </div>
      </div>
      {children}
    </section>
  );
}

function ResultPill({
  correct,
  awarded,
  points,
}: {
  correct: boolean;
  awarded?: number;
  points: number;
}) {
  return (
    <span
      className={`inline-flex shrink-0 items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold ring-1 ${
        correct
          ? "bg-emerald-500/10 text-emerald-700 ring-emerald-500/30"
          : "bg-rose-500/10 text-rose-700 ring-rose-500/30"
      }`}
    >
      {correct ? (
        <CheckCircle2 className="h-3.5 w-3.5" />
      ) : (
        <XCircle className="h-3.5 w-3.5" />
      )}
      {(awarded ?? (correct ? points : 0)).toFixed(1)} / {points}
    </span>
  );
}

function KV({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone?: "good" | "bad" | "neutral";
}) {
  const toneCls =
    tone === "good"
      ? "border-emerald-500/30 bg-emerald-500/5"
      : tone === "bad"
        ? "border-rose-500/30 bg-rose-500/5"
        : "bg-muted/30";
  return (
    <div className={`rounded-lg border p-2.5 ${toneCls}`}>
      <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </div>
      <div className="mt-0.5 text-sm text-foreground">{value}</div>
    </div>
  );
}

function ManualAnswerCard({
  index,
  answer,
}: {
  index: number;
  answer: TestSubmission["answers"][number];
}) {
  const isSpeaking = answer.skill === "speaking";
  const pending = answer.awarded == null;
  return (
    <div className="rounded-xl border bg-surface p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            {isSpeaking ? (
              <Mic className="h-3.5 w-3.5" />
            ) : (
              <FileText className="h-3.5 w-3.5" />
            )}
            Câu {index} · {isSpeaking ? "Nói" : "Viết"}
          </div>
          <div className="mt-1 text-sm font-medium text-foreground">
            {answer.question}
          </div>
        </div>
        <span
          className={`inline-flex shrink-0 items-center rounded-full px-2.5 py-1 text-[11px] font-semibold ring-1 ${
            pending
              ? "bg-amber-500/10 text-amber-700 ring-amber-500/30"
              : "bg-primary/10 text-primary ring-primary/30"
          }`}
        >
          {pending
            ? "Đang chờ chấm"
            : `${answer.awarded?.toFixed(1)} / ${answer.points}`}
        </span>
      </div>

      <div className="mt-3 rounded-lg border bg-muted/30 p-3">
        <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          Bài làm của bạn
        </div>
        <div className="mt-1 whitespace-pre-wrap text-sm text-foreground">
          {answer.studentAnswer}
        </div>
        {answer.studentAudioUrl && (
          <audio
            controls
            src={answer.studentAudioUrl}
            className="mt-3 w-full"
          />
        )}
      </div>

      {answer.rubric && answer.rubric.length > 0 && (
        <div className="mt-3 space-y-1.5 rounded-lg border p-3">
          <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            Rubric chấm điểm
          </div>
          {answer.rubric.map((r, i) => (
            <div
              key={i}
              className="flex items-center justify-between gap-3 text-xs"
            >
              <span className="text-foreground">{r.criterion}</span>
              <span className="font-mono text-muted-foreground">
                {r.awarded != null ? r.awarded.toFixed(2) : "—"} / {r.max}
              </span>
            </div>
          ))}
        </div>
      )}

      {answer.feedback && (
        <div className="mt-3 rounded-lg border border-primary/30 bg-primary/5 p-3">
          <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-primary">
            <PenLine className="h-3 w-3" />
            Nhận xét của giáo viên
          </div>
          <div className="mt-1 text-sm text-foreground">{answer.feedback}</div>
        </div>
      )}
    </div>
  );
}

function ProctorPanel({ events }: { events: ProctorEvent[] }) {
  const high = events.filter((e) => e.severity === "high").length;
  const med = events.filter((e) => e.severity === "medium").length;
  const low = events.filter((e) => e.severity === "low").length;

  return (
    <Section
      icon={<ShieldAlert className="h-4 w-4" />}
      title="Cảnh báo giám sát trong lúc thi"
      subtitle="Các sự kiện hệ thống ghi nhận được trong quá trình bạn làm bài"
    >
      <div className="rounded-2xl border bg-surface p-4">
        <div className="flex flex-wrap gap-2 text-[11px]">
          <Tag color="rose">Nghiêm trọng: {high}</Tag>
          <Tag color="amber">Trung bình: {med}</Tag>
          <Tag color="slate">Nhẹ: {low}</Tag>
        </div>
        <div className="mt-3 space-y-2">
          {events.map((e, i) => (
            <div
              key={i}
              className={`flex items-start gap-3 rounded-lg border p-2.5 text-xs ${
                e.severity === "high"
                  ? "border-rose-500/30 bg-rose-500/5"
                  : e.severity === "medium"
                    ? "border-amber-500/30 bg-amber-500/5"
                    : "bg-muted/30"
              }`}
            >
              <AlertTriangle
                className={`mt-0.5 h-3.5 w-3.5 shrink-0 ${
                  e.severity === "high"
                    ? "text-rose-600"
                    : e.severity === "medium"
                      ? "text-amber-600"
                      : "text-muted-foreground"
                }`}
              />
              <div className="flex-1">
                <div className="font-semibold text-foreground">
                  {proctorLabel(e.type)}
                </div>
                {e.detail && (
                  <div className="text-muted-foreground">{e.detail}</div>
                )}
              </div>
              <div className="shrink-0 font-mono text-[10px] text-muted-foreground">
                {formatTime(e.at)}
              </div>
            </div>
          ))}
        </div>
      </div>
    </Section>
  );
}

function Tag({
  color,
  children,
}: {
  color: "rose" | "amber" | "slate";
  children: React.ReactNode;
}) {
  const cls = {
    rose: "bg-rose-500/10 text-rose-700 ring-rose-500/30",
    amber: "bg-amber-500/10 text-amber-700 ring-amber-500/30",
    slate: "bg-muted text-muted-foreground ring-border",
  }[color];
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 font-semibold ring-1 ${cls}`}
    >
      {children}
    </span>
  );
}

function proctorLabel(t: ProctorEvent["type"]) {
  return (
    {
      "tab-switch": "Chuyển tab khác",
      "window-blur": "Cửa sổ mất focus",
      "leave-seat": "Rời khỏi vị trí",
      "multiple-faces": "Phát hiện nhiều khuôn mặt",
      "no-face": "Không phát hiện khuôn mặt",
      "different-face": "Khuôn mặt khác với đăng ký",
      "copy-paste": "Dán nội dung vào ô trả lời",
      "fullscreen-exit": "Thoát chế độ toàn màn hình",
      "network-drop": "Mất kết nối mạng",
    } as Record<ProctorEvent["type"], string>
  )[t];
}
