import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useState } from "react";
import { TopNav } from "@/components/TopNav";
import { getTest, getTestSubmissions, testStatus, type TestSubmission, type ProctorEvent, type ProctorEventType } from "@/lib/tests-data";
import { SKILL_LABEL, TYPE_LABEL, questionBank, type BankQuestion, type QSkill } from "@/lib/question-bank";
import { classes, students } from "@/lib/teacher-data";
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
  ChevronDown,
  ChevronUp,
  ShieldAlert,
  Eye,
  EyeOff,
  Users2,
  UserX,
  Monitor,
  Wifi,
  Clipboard,
  LogOut,
  AlertTriangle,
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
  const [tab, setTab] = useState<"overview" | "monitor" | "structure" | "questions" | "results">("overview");
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
          <ArrowLeft className="h-4 w-4" /> Trở lại Chấm thi
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
              { id: "monitor", label: "Giám sát", icon: Monitor },
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
          <ProctorOverview
            subs={subs}
            onOpenSubmission={(s) => {
              setTab("results");
              setGrading(s);
            }}
          />
        )}

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
                <Row label="Mở lúc" value={new Date(test.openAt).toLocaleString("vi-VN")} suppressHydration />
                <Row label="Đóng lúc" value={new Date(test.closeAt).toLocaleString("vi-VN")} suppressHydration />
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

        {tab === "monitor" && (
          <MonitorTab
            test={test}
            subs={subs}
            onOpenSubmission={(s) => {
              setTab("results");
              setGrading(s);
            }}
          />
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
                    <td className="px-4 py-3 text-muted-foreground">{s.type === "mixed" ? "Trộn" : TYPE_LABEL[s.type]}</td>
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
                  <th className="px-4 py-3 text-center">Giám sát</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {subs.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="px-4 py-10 text-center text-muted-foreground">
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
                      <td className="px-4 py-3 text-center">
                        <ProctorBadge events={s.proctorEvents} />
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

function Row({ label, value, suppressHydration }: { label: string; value: string; suppressHydration?: boolean }) {
  return (
    <div className="flex justify-between border-b border-border/60 py-2 last:border-0">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium text-foreground" suppressHydrationWarning={suppressHydration}>{value}</span>
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

const RUBRIC_DESCRIPTORS: Record<string, { keywords: string[]; bands: { range: string; desc: string }[] }> = {
  writing: {
    keywords: ["Task achievement", "Coherence & Cohesion", "Lexical resource", "Grammar accuracy", "Số từ", "Liên kết câu", "Đa dạng cấu trúc"],
    bands: [
      { range: "Tốt (80–100%)", desc: "Đủ ý, mạch lạc, từ vựng phong phú, ít lỗi ngữ pháp." },
      { range: "Khá (60–79%)", desc: "Đủ ý chính, mạch lạc nhưng còn rườm rà, có lỗi nhỏ." },
      { range: "Trung bình (40–59%)", desc: "Thiếu ý phụ, lặp từ, có lỗi ngữ pháp ảnh hưởng nghĩa." },
      { range: "Yếu (<40%)", desc: "Lạc đề/thiếu ý, lỗi nhiều, khó hiểu." },
    ],
  },
  speaking: {
    keywords: ["Pronunciation", "Fluency", "Vocabulary", "Grammar", "Ngữ điệu", "Tốc độ nói", "Tự nhiên"],
    bands: [
      { range: "Tốt (80–100%)", desc: "Phát âm rõ, nói trôi chảy, từ vựng đa dạng, ngữ pháp chính xác." },
      { range: "Khá (60–79%)", desc: "Hiểu được, có ngập ngừng nhẹ, vài lỗi nhỏ." },
      { range: "Trung bình (40–59%)", desc: "Ngập ngừng nhiều, phát âm sai một số âm, lỗi ngữ pháp." },
      { range: "Yếu (<40%)", desc: "Khó hiểu, ngắt quãng, vốn từ hạn chế." },
    ],
  },
};

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
  const initialAwarded = useState(() => submission.answers.map((a) => a.awarded))[0];
  const [openRubric, setOpenRubric] = useState<Set<number>>(new Set());
  const [matched, setMatched] = useState<Record<string, Set<string>>>({});
  const toggleRubric = (i: number) =>
    setOpenRubric((prev) => {
      const n = new Set(prev);
      if (n.has(i)) n.delete(i);
      else n.add(i);
      return n;
    });
  const toggleMatch = (qid: string, k: string) =>
    setMatched((prev) => {
      const n = new Set(prev[qid] ?? []);
      if (n.has(k)) n.delete(k);
      else n.add(k);
      return { ...prev, [qid]: n };
    });
  const suggestedScore = (a: (typeof answers)[number]) => {
    const kws = RUBRIC_DESCRIPTORS[a.skill === "speaking" ? "speaking" : "writing"].keywords;
    const m = matched[a.questionId]?.size ?? 0;
    return Math.round(((m / kws.length) * a.points) / 0.25) * 0.25;
  };
  const update = (i: number, patch: Partial<(typeof answers)[number]>) =>
    setAnswers((p) => p.map((a, idx) => (idx === i ? { ...a, ...patch } : a)));


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
          <ProctorPanel events={submission.proctorEvents} startedAt={submission.startedAt} />

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
                  <div className="text-right text-xs">
                    <div className="text-muted-foreground">
                      Đã chấm trước:{" "}
                      <span className="font-semibold text-foreground">
                        {initialAwarded[i] ?? "—"}
                      </span>
                    </div>
                    <div className="text-muted-foreground">
                      Hiện tại:{" "}
                      <span className="font-semibold text-primary">
                        {a.awarded ?? 0}/{a.points}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="grid gap-6 p-6 lg:grid-cols-[1.6fr_1fr]">
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
                  </div>

                  {/* Cột phải: rubric keyword + nhập điểm + nhận xét */}
                  <div className="space-y-4">
                    {(() => {
                      const kws =
                        RUBRIC_DESCRIPTORS[isSpeaking ? "speaking" : "writing"].keywords;
                      const matchedSet = matched[a.questionId] ?? new Set<string>();
                      const sug = suggestedScore(a);
                      const prev = initialAwarded[i];
                      const current = a.awarded;
                      const overridden = current !== undefined && current !== sug;
                      return (
                        <>
                          <button
                            type="button"
                            onClick={() => toggleRubric(i)}
                            className="flex w-full items-center justify-between rounded-xl border border-dashed border-border bg-muted/30 px-4 py-2.5 text-xs font-semibold text-muted-foreground hover:bg-muted hover:text-foreground"
                          >
                            <span>
                              {openRubric.has(i) ? "Ẩn" : "Xem"} keyword tham khảo (
                              {isSpeaking ? "Speaking" : "Writing"}) • Đã match{" "}
                              <strong className="text-foreground">
                                {matchedSet.size}/{kws.length}
                              </strong>
                            </span>
                            {openRubric.has(i) ? (
                              <ChevronUp className="h-3.5 w-3.5" />
                            ) : (
                              <ChevronDown className="h-3.5 w-3.5" />
                            )}
                          </button>

                          {openRubric.has(i) && (
                            <div className="space-y-3 rounded-2xl border border-border bg-muted/20 p-4">
                              <div className="text-[11px] text-muted-foreground">
                                Bấm vào keyword học viên đã thể hiện trong bài để hệ thống tự gợi
                                ý điểm.
                              </div>
                              <div className="flex flex-wrap gap-1.5">
                                {kws.map((k) => {
                                  const on = matchedSet.has(k);
                                  return (
                                    <button
                                      key={k}
                                      type="button"
                                      onClick={() => toggleMatch(a.questionId, k)}
                                      className={cn(
                                        "rounded-full px-2.5 py-1 text-[11px] font-medium ring-1 transition",
                                        on
                                          ? "bg-emerald-500 text-white ring-emerald-500"
                                          : "bg-background text-foreground ring-border hover:ring-foreground/40",
                                      )}
                                    >
                                      {on ? "✓ " : ""}
                                      {k}
                                    </button>
                                  );
                                })}
                              </div>
                              <div className="flex items-center justify-between rounded-xl bg-background p-3 ring-1 ring-border">
                                <div className="text-xs">
                                  <div className="text-muted-foreground">
                                    Điểm gợi ý theo keyword
                                  </div>
                                  <div className="font-display text-xl font-semibold text-emerald-600">
                                    {sug.toFixed(2)}
                                    <span className="ml-1 text-xs text-muted-foreground">
                                      / {a.points}
                                    </span>
                                  </div>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => update(i, { awarded: sug })}
                                  className="rounded-lg bg-foreground px-3 py-1.5 text-xs font-semibold text-background hover:opacity-90"
                                >
                                  Áp dụng vào ô điểm
                                </button>
                              </div>
                            </div>
                          )}

                          <div className="rounded-2xl border border-border bg-background p-4">
                            <div className="flex items-center justify-between">
                              <label className="text-xs font-semibold text-muted-foreground">
                                Điểm giáo viên chấm (0 – {a.points})
                              </label>
                              {overridden && (
                                <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold text-amber-700">
                                  Đã chỉnh tay
                                </span>
                              )}
                            </div>
                            <div className="mt-2 flex items-center gap-3">
                              <input
                                type="number"
                                min={0}
                                max={a.points}
                                step={0.25}
                                value={current ?? ""}
                                onChange={(e) =>
                                  update(i, {
                                    awarded:
                                      e.target.value === ""
                                        ? undefined
                                        : Number(e.target.value),
                                  })
                                }
                                className="w-24 rounded-lg border border-border bg-background px-3 py-2 text-center text-lg font-semibold focus:outline-none focus:ring-2 focus:ring-primary/30"
                              />
                              <span className="text-sm text-muted-foreground">
                                / {a.points} đ
                              </span>
                            </div>
                            <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-muted-foreground">
                              {prev !== undefined && (
                                <span>
                                  Đã chấm trước:{" "}
                                  <strong className="text-foreground">{prev}</strong>
                                </span>
                              )}
                              <span>
                                Theo keyword:{" "}
                                <strong className="text-emerald-600">{sug.toFixed(2)}</strong>
                              </span>
                            </div>
                          </div>

                          <div className="rounded-2xl border border-border bg-background p-4">
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
                        </>
                      );
                    })()}
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
        .filter((q) => q.skill === item.skill && (item.type === "mixed" || q.type === item.type) && q.level === item.level)
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

const EVENT_META: Record<ProctorEventType, { label: string; icon: React.ComponentType<{ className?: string }> }> = {
  "tab-switch": { label: "Chuyển tab", icon: Monitor },
  "window-blur": { label: "Mất focus cửa sổ", icon: EyeOff },
  "leave-seat": { label: "Rời khỏi vị trí", icon: LogOut },
  "multiple-faces": { label: "Nhiều khuôn mặt", icon: Users2 },
  "no-face": { label: "Không có khuôn mặt", icon: UserX },
  "different-face": { label: "Khuôn mặt khác", icon: UserX },
  "copy-paste": { label: "Sao chép / dán", icon: Clipboard },
  "fullscreen-exit": { label: "Thoát toàn màn hình", icon: Eye },
  "network-drop": { label: "Mất kết nối", icon: Wifi },
};

const SEV_COLOR = {
  low: "bg-amber-50 text-amber-700 ring-amber-200",
  medium: "bg-orange-50 text-orange-700 ring-orange-200",
  high: "bg-red-50 text-red-700 ring-red-200",
} as const;

function ProctorBadge({ events }: { events?: ProctorEvent[] }) {
  if (!events || events.length === 0)
    return (
      <span className="inline-flex items-center gap-1 text-[11px] text-emerald-700">
        <CheckCircle2 className="h-3.5 w-3.5" /> Sạch
      </span>
    );
  const high = events.filter((e) => e.severity === "high").length;
  const tone = high > 0 ? "bg-red-100 text-red-700" : "bg-amber-100 text-amber-700";
  return (
    <span className={cn("inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold", tone)}>
      <ShieldAlert className="h-3.5 w-3.5" /> {events.length} cảnh báo
      {high > 0 && <span className="ml-0.5">• {high} nghiêm trọng</span>}
    </span>
  );
}

function ProctorPanel({ events, startedAt }: { events?: ProctorEvent[]; startedAt: string }) {
  const [open, setOpen] = useState(true);
  const list = events ?? [];
  const high = list.filter((e) => e.severity === "high").length;
  const med = list.filter((e) => e.severity === "medium").length;
  const low = list.filter((e) => e.severity === "low").length;
  const startMs = new Date(startedAt).getTime();

  if (list.length === 0)
    return (
      <div className="flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50/60 px-5 py-3 text-sm text-emerald-800">
        <CheckCircle2 className="h-5 w-5" />
        <div>
          <div className="font-semibold">Không phát hiện bất thường</div>
          <div className="text-xs text-emerald-700/80">Hệ thống giám sát không ghi nhận sự kiện đáng chú ý trong suốt bài thi.</div>
        </div>
      </div>
    );

  return (
    <div className="overflow-hidden rounded-3xl border border-red-200 bg-red-50/40 shadow-soft">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between gap-3 px-6 py-4 text-left hover:bg-red-50/60"
      >
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-red-100 p-2 text-red-700">
            <ShieldAlert className="h-5 w-5" />
          </div>
          <div>
            <div className="font-display text-base font-semibold text-red-800">
              Cảnh báo giám sát thi ({list.length})
            </div>
            <div className="mt-0.5 flex flex-wrap items-center gap-2 text-[11px]">
              {high > 0 && <span className="rounded-full bg-red-100 px-2 py-0.5 font-semibold text-red-700">{high} nghiêm trọng</span>}
              {med > 0 && <span className="rounded-full bg-orange-100 px-2 py-0.5 font-semibold text-orange-700">{med} trung bình</span>}
              {low > 0 && <span className="rounded-full bg-amber-100 px-2 py-0.5 font-semibold text-amber-700">{low} nhẹ</span>}
            </div>
          </div>
        </div>
        {open ? <ChevronUp className="h-5 w-5 text-red-700" /> : <ChevronDown className="h-5 w-5 text-red-700" />}
      </button>
      {open && (
        <div className="border-t border-red-200 bg-background">
          <ol className="divide-y divide-border">
            {list.map((e, idx) => {
              const meta = EVENT_META[e.type];
              const I = meta.icon;
              const at = new Date(e.at);
              const offsetSec = Math.max(0, Math.round((at.getTime() - startMs) / 1000));
              const mm = String(Math.floor(offsetSec / 60)).padStart(2, "0");
              const ss = String(offsetSec % 60).padStart(2, "0");
              return (
                <li key={idx} className="flex items-start gap-3 px-6 py-3">
                  <div className={cn("mt-0.5 rounded-lg p-1.5 ring-1", SEV_COLOR[e.severity])}>
                    <I className="h-4 w-4" />
                  </div>
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2 text-sm">
                      <span className="font-semibold text-foreground">{meta.label}</span>
                      <span className={cn("rounded-full px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider", SEV_COLOR[e.severity])}>
                        {e.severity === "high" ? "Nghiêm trọng" : e.severity === "medium" ? "Trung bình" : "Nhẹ"}
                      </span>
                    </div>
                    {e.detail && <p className="mt-0.5 text-xs text-muted-foreground">{e.detail}</p>}
                  </div>
                  <div className="text-right text-xs text-muted-foreground" suppressHydrationWarning>
                    <div className="font-mono font-semibold text-foreground">{mm}:{ss}</div>
                    <div>{at.toLocaleTimeString("vi-VN")}</div>
                    <div>{at.toLocaleDateString("vi-VN")}</div>
                  </div>
                </li>
              );
            })}
          </ol>
          <div className="flex items-center gap-2 border-t border-border bg-muted/30 px-6 py-2.5 text-[11px] text-muted-foreground">
            <AlertTriangle className="h-3.5 w-3.5" />
            Mốc thời gian tính từ lúc học viên bắt đầu bài thi.
          </div>
        </div>
      )}
    </div>
  );
}

function ProctorOverview({
  subs,
  onOpenSubmission,
}: {
  subs: TestSubmission[];
  onOpenSubmission: (s: TestSubmission) => void;
}) {
  const all = subs.flatMap((s) => (s.proctorEvents ?? []).map((e) => ({ e, s })));
  const high = all.filter((x) => x.e.severity === "high").length;
  const med = all.filter((x) => x.e.severity === "medium").length;
  const low = all.filter((x) => x.e.severity === "low").length;
  const flagged = subs.filter((s) => (s.proctorEvents?.length ?? 0) > 0);
  const ranked = [...flagged].sort((a, b) => {
    const sev = (s: TestSubmission) =>
      (s.proctorEvents ?? []).reduce(
        (acc, e) => acc + (e.severity === "high" ? 5 : e.severity === "medium" ? 2 : 1),
        0,
      );
    return sev(b) - sev(a);
  });

  if (all.length === 0) {
    return (
      <div className="mt-6 flex items-center gap-3 rounded-3xl border border-emerald-200 bg-emerald-50/60 px-6 py-4 text-sm text-emerald-800">
        <CheckCircle2 className="h-5 w-5" />
        <div>
          <div className="font-semibold">Không có cảnh báo giám sát</div>
          <div className="text-xs text-emerald-700/80">
            Tất cả học viên đều làm bài bình thường, không phát hiện bất thường.
          </div>
        </div>
      </div>
    );
  }

  const tone =
    high > 0
      ? "border-red-300 bg-gradient-to-br from-red-50 to-orange-50"
      : "border-amber-300 bg-gradient-to-br from-amber-50 to-yellow-50";
  const accent = high > 0 ? "text-red-700" : "text-amber-800";

  return (
    <div className={cn("mt-6 overflow-hidden rounded-3xl border shadow-elevated", tone)}>
      <div className="flex flex-wrap items-start justify-between gap-4 px-6 py-5">
        <div className="flex items-center gap-4">
          <div
            className={cn(
              "rounded-2xl p-3 ring-1",
              high > 0 ? "bg-red-100 text-red-700 ring-red-200" : "bg-amber-100 text-amber-700 ring-amber-200",
            )}
          >
            <ShieldAlert className="h-6 w-6" />
          </div>
          <div>
            <div className={cn("font-display text-2xl font-semibold", accent)}>
              {all.length} cảnh báo giám sát
            </div>
            <div className="mt-0.5 text-xs text-muted-foreground">
              Ghi nhận từ {flagged.length}/{subs.length} học viên đã có dữ liệu giám sát.
            </div>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <SevPill tone="red" count={high} label="Nghiêm trọng" />
          <SevPill tone="orange" count={med} label="Trung bình" />
          <SevPill tone="amber" count={low} label="Nhẹ" />
        </div>
      </div>

      <div className="border-t border-white/60 bg-background/70 px-6 py-4 backdrop-blur">
        <div className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
          Học viên cần chú ý
        </div>
        <ul className="divide-y divide-border">
          {ranked.slice(0, 5).map((s) => {
            const evs = s.proctorEvents ?? [];
            const h = evs.filter((e) => e.severity === "high").length;
            const m = evs.filter((e) => e.severity === "medium").length;
            const l = evs.filter((e) => e.severity === "low").length;
            return (
              <li
                key={s.id}
                className="flex flex-wrap items-center justify-between gap-3 py-2.5"
              >
                <div className="min-w-0">
                  <div className="truncate text-sm font-semibold text-foreground">
                    {s.studentName}
                  </div>
                  <div className="text-xs text-muted-foreground">{s.studentClass}</div>
                </div>
                <div className="flex items-center gap-2">
                  {h > 0 && <SevPill tone="red" count={h} compact />}
                  {m > 0 && <SevPill tone="orange" count={m} compact />}
                  {l > 0 && <SevPill tone="amber" count={l} compact />}
                  <button
                    onClick={() => onOpenSubmission(s)}
                    className="rounded-lg bg-foreground px-2.5 py-1 text-[11px] font-semibold text-background hover:opacity-90"
                  >
                    Xem chi tiết
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}

function SevPill({
  tone,
  count,
  label,
  compact,
}: {
  tone: "red" | "orange" | "amber";
  count: number;
  label?: string;
  compact?: boolean;
}) {
  const map = {
    red: "bg-red-100 text-red-700 ring-red-200",
    orange: "bg-orange-100 text-orange-700 ring-orange-200",
    amber: "bg-amber-100 text-amber-800 ring-amber-200",
  } as const;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ring-1",
        map[tone],
        compact && "px-2 py-0.5 text-[11px]",
      )}
    >
      <span className="font-display text-sm font-bold leading-none">{count}</span>
      {label && <span className="text-[11px] font-medium opacity-80">{label}</span>}
    </span>
  );
}

function MonitorTab({
  test,
  subs,
  onOpenSubmission,
}: {
  test: ReturnType<typeof getTest> extends infer T ? Exclude<T, undefined> : never;
  subs: TestSubmission[];
  onOpenSubmission: (s: TestSubmission) => void;
}) {
  // Roster = tất cả học viên trong các lớp được giao.
  const roster = students.filter((st) => test.classIds.includes(st.classId));
  const [classFilter, setClassFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<"all" | "not-started" | "in-progress" | "submitted">("all");
  const [query, setQuery] = useState("");

  // Map học viên -> submission (theo tên + tên lớp).
  const subByName = new Map<string, TestSubmission>();
  subs.forEach((s) => subByName.set(`${s.studentName}__${s.studentClass}`, s));

  type Row = {
    student: (typeof roster)[number];
    className: string;
    sub?: TestSubmission;
    state: "not-started" | "in-progress" | "submitted";
  };
  const rows: Row[] = roster.map((st) => {
    const className = classes.find((c) => c.id === st.classId)?.name ?? st.classId;
    const sub = subByName.get(`${st.name}__${className}`);
    let state: Row["state"] = "not-started";
    if (sub) {
      state = sub.status === "in-progress" ? "in-progress" : "submitted";
    }
    return { student: st, className, sub, state };
  });

  const filtered = rows.filter((r) => {
    if (classFilter !== "all" && r.student.classId !== classFilter) return false;
    if (statusFilter !== "all" && r.state !== statusFilter) return false;
    if (query.trim()) {
      const q = query.trim().toLowerCase();
      if (!r.student.name.toLowerCase().includes(q) && !r.student.email.toLowerCase().includes(q))
        return false;
    }
    return true;
  });

  const counts = {
    total: rows.length,
    notStarted: rows.filter((r) => r.state === "not-started").length,
    inProgress: rows.filter((r) => r.state === "in-progress").length,
    submitted: rows.filter((r) => r.state === "submitted").length,
  };

  const st = testStatus(test);
  const classOpts = test.classIds
    .map((id) => classes.find((c) => c.id === id))
    .filter((c): c is NonNullable<typeof c> => !!c);

  return (
    <div className="mt-6 space-y-4">
      <div className="grid gap-3 sm:grid-cols-4">
        <MonStat tone="slate" icon={Users2} label="Tổng học viên" value={counts.total} />
        <MonStat tone="rose" icon={UserX} label="Chưa vào thi" value={counts.notStarted} />
        <MonStat tone="blue" icon={Monitor} label="Đang làm bài" value={counts.inProgress} />
        <MonStat tone="emerald" icon={CheckCircle2} label="Đã nộp bài" value={counts.submitted} />
      </div>

      {st === "upcoming" && (
        <div className="rounded-xl bg-amber-50 p-3 text-xs text-amber-900">
          Bài thi chưa mở. Học viên sẽ chỉ vào được sau {new Date(test.openAt).toLocaleString("vi-VN")}.
        </div>
      )}

      <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-border bg-surface p-3">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Tìm theo tên, email…"
          className="min-w-[200px] flex-1 rounded-lg border border-border bg-background px-3 py-1.5 text-sm"
        />
        <select
          value={classFilter}
          onChange={(e) => setClassFilter(e.target.value)}
          className="rounded-lg border border-border bg-background px-2 py-1.5 text-xs font-semibold"
        >
          <option value="all">Tất cả lớp ({roster.length})</option>
          {classOpts.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
        {(["all", "not-started", "in-progress", "submitted"] as const).map((s) => {
          const label =
            s === "all"
              ? "Tất cả"
              : s === "not-started"
                ? "Chưa thi"
                : s === "in-progress"
                  ? "Đang làm"
                  : "Đã nộp";
          return (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={cn(
                "rounded-full px-3 py-1 text-xs font-semibold transition",
                statusFilter === s
                  ? "bg-foreground text-background"
                  : "bg-muted text-muted-foreground hover:bg-muted/70",
              )}
            >
              {label}
            </button>
          );
        })}
      </div>

      <div className="overflow-hidden rounded-2xl border border-border bg-surface shadow-soft">
        <table className="w-full text-sm">
          <thead className="bg-muted/40 text-xs uppercase tracking-wider text-muted-foreground">
            <tr>
              <th className="px-4 py-3 text-left">Học viên</th>
              <th className="px-4 py-3 text-left">Lớp</th>
              <th className="px-4 py-3 text-center">Trạng thái</th>
              <th className="px-4 py-3 text-left">Bắt đầu lúc</th>
              <th className="px-4 py-3 text-left">Nộp lúc</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-10 text-center text-muted-foreground">
                  Không có học viên phù hợp với bộ lọc.
                </td>
              </tr>
            ) : (
              filtered.map((r) => (
                <tr
                  key={r.student.id}
                  className="border-t border-border hover:bg-muted/30 cursor-pointer"
                  onClick={() => r.sub && onOpenSubmission(r.sub)}
                >
                  <td className="px-4 py-3">
                    <div className="font-medium text-foreground">{r.student.name}</div>
                    <div className="text-[11px] text-muted-foreground">{r.student.email}</div>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{r.className}</td>
                  <td className="px-4 py-3 text-center">
                    <MonStatePill state={r.state} />
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {r.sub?.startedAt
                      ? new Date(r.sub.startedAt).toLocaleString("vi-VN")
                      : "—"}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {r.sub?.submittedAt
                      ? new Date(r.sub.submittedAt).toLocaleString("vi-VN")
                      : "—"}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function MonStat({
  tone,
  icon: Icon,
  label,
  value,
}: {
  tone: "slate" | "rose" | "blue" | "emerald";
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: number;
}) {
  const map = {
    slate: "bg-slate-50 text-slate-700 ring-slate-200",
    rose: "bg-rose-50 text-rose-700 ring-rose-200",
    blue: "bg-blue-50 text-blue-700 ring-blue-200",
    emerald: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  } as const;
  return (
    <div className={cn("rounded-2xl px-4 py-3 ring-1", map[tone])}>
      <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider opacity-80">
        <Icon className="h-3.5 w-3.5" /> {label}
      </div>
      <div className="mt-1 font-display text-2xl font-bold">{value}</div>
    </div>
  );
}

function MonStatePill({ state }: { state: "not-started" | "in-progress" | "submitted" }) {
  const map = {
    "not-started": { c: "bg-rose-100 text-rose-700", t: "Chưa vào thi" },
    "in-progress": { c: "bg-blue-100 text-blue-700", t: "Đang làm bài" },
    submitted: { c: "bg-emerald-100 text-emerald-700", t: "Đã nộp" },
  } as const;
  const m = map[state];
  return (
    <span className={cn("rounded-full px-2 py-0.5 text-[11px] font-semibold", m.c)}>{m.t}</span>
  );
}
