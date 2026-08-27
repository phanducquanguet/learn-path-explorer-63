import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  ArrowLeft,
  ArrowUpRight,
  CheckCircle2,
  ChevronDown,
  Clock,
  Crown,
  Minus,
  Repeat2,
  Target,
  TrendingDown,
  TrendingUp,
  XCircle,
} from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { TopNav } from "@/components/TopNav";
import { PageHeader } from "@/components/PageHeader";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import {
  cefrOf,
  PASS_THRESHOLD,
  pctOf,
  practiceTests,
  SKILL_LABEL,
  summaryOf,
  type PracticeAttempt,
} from "@/lib/practice-attempts";

export const Route = createFileRoute("/practice-tests/$testId")({
  loader: ({ params }) => {
    const test = practiceTests.find((t) => t.id === params.testId);
    if (!test) throw notFound();
    return { testId: test.id, name: test.name };
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return {
        meta: [{ title: "Không tìm thấy đề luyện thi" }, { name: "robots", content: "noindex" }],
      };
    }
    return {
      meta: [
        { title: `${loaderData.name} — Kết quả luyện thi` },
        {
          name: "description",
          content: `Lịch sử các lượt làm và điểm chi tiết của đề ${loaderData.name}.`,
        },
        { property: "og:title", content: `${loaderData.name} — Kết quả luyện thi` },
        {
          property: "og:description",
          content: "So sánh điểm từng lượt làm, điểm theo kỹ năng và xem lại từng câu hỏi.",
        },
        { property: "og:type", content: "article" },
        { name: "twitter:card", content: "summary_large_image" },
      ],
    };
  },
  component: PracticeDetail,
  notFoundComponent: () => (
    <div className="mx-auto max-w-2xl p-16 text-center text-sm text-muted-foreground">
      Không tìm thấy đề luyện thi.
    </div>
  ),
});

const fmt = (iso: string) =>
  new Date(iso).toLocaleString("vi-VN", {
    timeZone: "Asia/Ho_Chi_Minh",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

function PracticeDetail() {
  const { testId } = Route.useLoaderData();
  const s = useMemo(() => summaryOf(practiceTests.find((t) => t.id === testId)!), [testId]);
  const { test, attempts, used, remaining, canRetake, best, latest, avgPct, deltaPct } = s;
  const multi = used > 1;
  const [openId, setOpenId] = useState<string | null>(latest?.id ?? null);

  const trend = attempts.map((a) => ({
    name: `Lần ${a.attemptNo}`,
    pct: pctOf(a),
    ...Object.fromEntries(
      a.skills.map((sk) => [
        SKILL_LABEL[sk.skill],
        sk.total > 0 ? Math.round((sk.earned / sk.total) * 100) : 0,
      ]),
    ),
  }));

  return (
    <div className="min-h-screen bg-background">
      <TopNav />
      <div className="mx-auto max-w-6xl px-6 pb-20 pt-8 sm:px-8">
        <Link
          to="/practice-tests"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Về danh sách đề luyện thi
        </Link>

        <div className="mt-4">
          <PageHeader
            eyebrow={`${test.code} • ${test.level}`}
            title={test.name}
            description={test.description}
            actions={
              canRetake ? (
                <span className="inline-flex items-center gap-1.5 rounded-xl bg-foreground px-4 py-2.5 text-sm font-semibold text-background">
                  {used > 0 ? "Luyện lại" : "Luyện ngay"} <ArrowUpRight className="h-4 w-4" />
                </span>
              ) : (
                <span className="rounded-xl bg-muted px-4 py-2.5 text-sm font-semibold text-muted-foreground">
                  Đã hết lượt làm
                </span>
              )
            }
            stats={[
              {
                icon: Repeat2,
                label: "Lượt đã dùng",
                value:
                  test.maxAttempts == null ? `${used}` : `${used}/${test.maxAttempts}`,
                hint:
                  test.maxAttempts == null
                    ? "Không giới hạn lượt"
                    : remaining === 0
                      ? "Đã hết lượt"
                      : `Còn ${remaining} lượt`,
                tone: canRetake ? "primary" : "muted",
              },
              {
                icon: Crown,
                label: "Điểm cao nhất",
                value: best ? `${pctOf(best)}%` : "—",
                hint: best ? `Lần ${best.attemptNo} • ${best.earned}/${best.total}` : undefined,
                tone: "success",
              },
              {
                icon: Target,
                label: "Lượt gần nhất",
                value: latest ? `${pctOf(latest)}%` : "—",
                hint: latest ? `CEFR ${cefrOf(pctOf(latest))}` : undefined,
              },
              {
                icon: deltaPct == null ? Minus : deltaPct >= 0 ? TrendingUp : TrendingDown,
                label: multi ? "Tiến bộ so lượt trước" : "Điểm trung bình",
                value:
                  multi && deltaPct != null
                    ? `${deltaPct > 0 ? "+" : ""}${deltaPct}%`
                    : `${avgPct}%`,
                tone: multi && deltaPct != null && deltaPct < 0 ? "danger" : "success",
              },
            ]}
          />
        </div>

        {used === 0 ? (
          <div className="mt-6 rounded-2xl border border-dashed border-border bg-surface/40 p-16 text-center">
            <p className="text-sm text-muted-foreground">
              Bạn chưa làm đề này. Sau khi nộp bài, kết quả từng lượt sẽ hiển thị tại đây.
            </p>
          </div>
        ) : (
          <>
            {multi && (
              <div className="mt-6 grid gap-4 lg:grid-cols-2">
                <Panel
                  title="Tiến bộ qua từng lượt"
                  hint={`Ngưỡng đạt ${PASS_THRESHOLD}% tổng điểm`}
                >
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={trend} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                        <XAxis dataKey="name" tick={{ fontSize: 12 }} stroke="var(--muted-foreground)" />
                        <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} stroke="var(--muted-foreground)" />
                        <Tooltip
                          formatter={(v: number) => `${v}%`}
                          contentStyle={{
                            background: "var(--surface)",
                            border: "1px solid var(--border)",
                            borderRadius: 12,
                            fontSize: 12,
                          }}
                        />
                        <Line
                          type="monotone"
                          dataKey="pct"
                          name="Tổng điểm"
                          stroke="var(--primary)"
                          strokeWidth={2.5}
                          dot={{ r: 4 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </Panel>

                <Panel title="So sánh điểm theo kỹ năng" hint="% điểm đạt của mỗi kỹ năng">
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={trend} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                        <XAxis dataKey="name" tick={{ fontSize: 12 }} stroke="var(--muted-foreground)" />
                        <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} stroke="var(--muted-foreground)" />
                        <Tooltip
                          formatter={(v: number) => `${v}%`}
                          contentStyle={{
                            background: "var(--surface)",
                            border: "1px solid var(--border)",
                            borderRadius: 12,
                            fontSize: 12,
                          }}
                        />
                        <Legend wrapperStyle={{ fontSize: 12 }} />
                        {test.skills.map((sk, i) => (
                          <Bar
                            key={sk}
                            dataKey={SKILL_LABEL[sk]}
                            radius={[6, 6, 0, 0]}
                            fill={
                              ["var(--primary)", "#10b981", "#f59e0b", "#8b5cf6"][i % 4]
                            }
                          />
                        ))}
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </Panel>
              </div>
            )}

            <div className="mt-6 space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="font-display text-lg font-semibold text-foreground">
                  {multi ? `Lịch sử ${used} lượt làm` : "Kết quả bài làm"}
                </h2>
                {multi && (
                  <span className="text-xs text-muted-foreground">
                    Mới nhất hiển thị trước • nhấn để xem chi tiết từng câu
                  </span>
                )}
              </div>

              {[...attempts].reverse().map((a, idx, arr) => {
                const prev = arr[idx + 1];
                const delta = prev ? pctOf(a) - pctOf(prev) : null;
                return (
                  <AttemptRow
                    key={a.id}
                    attempt={a}
                    isBest={multi && best?.id === a.id}
                    isLatest={multi && latest?.id === a.id}
                    delta={delta}
                    open={openId === a.id}
                    onToggle={() => setOpenId(openId === a.id ? null : a.id)}
                  />
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function Panel({
  title,
  hint,
  children,
}: {
  title: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-border bg-surface p-5 shadow-soft">
      <div className="flex items-baseline justify-between gap-3">
        <h3 className="font-semibold text-foreground">{title}</h3>
        {hint && <span className="text-[11px] text-muted-foreground">{hint}</span>}
      </div>
      <div className="mt-4">{children}</div>
    </section>
  );
}

function AttemptRow({
  attempt,
  isBest,
  isLatest,
  delta,
  open,
  onToggle,
}: {
  attempt: PracticeAttempt;
  isBest: boolean;
  isLatest: boolean;
  delta: number | null;
  open: boolean;
  onToggle: () => void;
}) {
  const pct = pctOf(attempt);
  const passed = pct >= PASS_THRESHOLD;

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-surface shadow-soft">
      <button
        onClick={onToggle}
        className="flex w-full flex-wrap items-center gap-4 p-4 text-left hover:bg-muted/50"
      >
        <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-surface-2 font-display text-base font-semibold text-foreground">
          {attempt.attemptNo}
        </span>

        <span className="min-w-[190px] flex-1">
          <span className="flex flex-wrap items-center gap-1.5">
            <span className="font-semibold text-foreground">Lần {attempt.attemptNo}</span>
            {isLatest && (
              <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary">
                Mới nhất
              </span>
            )}
            {isBest && (
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
                <Crown className="h-3 w-3" /> Cao nhất
              </span>
            )}
            {attempt.status === "needs-grading" && (
              <span className="rounded-full bg-amber-500/10 px-2 py-0.5 text-[10px] font-semibold text-amber-600 dark:text-amber-400">
                Chờ chấm
              </span>
            )}
          </span>
          <span className="mt-1 flex flex-wrap items-center gap-2 text-[11px] text-muted-foreground">
            <span>{fmt(attempt.submittedAt)}</span>
            <span>•</span>
            <span className="inline-flex items-center gap-1">
              <Clock className="h-3 w-3" /> {attempt.durationMinutes} phút
            </span>
          </span>
        </span>

        <span className="w-40">
          <span className="flex items-baseline justify-between gap-2">
            <span className="font-mono text-sm font-semibold text-foreground">
              {attempt.earned} / {attempt.total}
            </span>
            <span
              className={cn(
                "text-xs font-semibold",
                passed ? "text-emerald-600 dark:text-emerald-400" : "text-amber-600 dark:text-amber-400",
              )}
            >
              {pct}%
            </span>
          </span>
          <Progress value={pct} className="mt-1.5 h-1.5" />
        </span>

        <span className="rounded-full bg-primary/10 px-2.5 py-1 text-[11px] font-semibold text-primary">
          CEFR {cefrOf(pct)}
        </span>

        <span
          className={cn(
            "w-20 text-right text-xs font-semibold",
            delta == null
              ? "text-muted-foreground"
              : delta > 0
                ? "text-emerald-600 dark:text-emerald-400"
                : delta < 0
                  ? "text-destructive"
                  : "text-muted-foreground",
          )}
        >
          {delta == null ? "—" : `${delta > 0 ? "+" : ""}${delta}%`}
        </span>

        <ChevronDown
          className={cn(
            "h-4 w-4 shrink-0 text-muted-foreground transition",
            open && "rotate-180",
          )}
        />
      </button>

      {open && (
        <div className="border-t border-border bg-surface-2/40 p-4 sm:p-5">
          {attempt.note && (
            <p className="mb-4 rounded-xl border border-border bg-surface p-3 text-xs text-muted-foreground">
              {attempt.note}
            </p>
          )}

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {attempt.skills.map((sk) => {
              const p = sk.total > 0 ? Math.round((sk.earned / sk.total) * 100) : 0;
              return (
                <div key={sk.skill} className="rounded-xl border border-border bg-surface p-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-foreground">
                      {SKILL_LABEL[sk.skill]}
                    </span>
                    <span className="font-mono text-xs text-muted-foreground">
                      {sk.earned} / {sk.total}
                    </span>
                  </div>
                  <Progress value={p} className="mt-2 h-1.5" />
                  <div className="mt-1 text-[11px] text-muted-foreground">
                    {p}% • {sk.questions} câu
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-4 overflow-hidden rounded-xl border border-border bg-surface">
            <div className="border-b border-border px-4 py-2.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Xem lại từng câu
            </div>
            <ul className="divide-y divide-border">
              {attempt.answers.map((ans) => {
                const full = ans.awarded >= ans.points;
                const zero = ans.awarded === 0;
                return (
                  <li key={ans.no} className="flex gap-3 px-4 py-3 text-sm">
                    <span className="mt-0.5">
                      {full ? (
                        <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                      ) : zero ? (
                        <XCircle className="h-4 w-4 text-destructive" />
                      ) : (
                        <Minus className="h-4 w-4 text-amber-500" />
                      )}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2 text-[11px] text-muted-foreground">
                        <span className="font-semibold text-foreground">Câu {ans.no}</span>
                        <span className="rounded-md bg-muted px-1.5 py-0.5 font-medium">
                          {SKILL_LABEL[ans.skill]}
                        </span>
                      </div>
                      <p className="mt-1 font-medium text-foreground">{ans.question}</p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        Bạn trả lời:{" "}
                        <span className="text-foreground">{ans.studentAnswer}</span>
                      </p>
                      {ans.correctAnswer && !full && (
                        <p className="text-xs text-muted-foreground">
                          Đáp án đúng:{" "}
                          <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                            {ans.correctAnswer}
                          </span>
                        </p>
                      )}
                      {ans.feedback && (
                        <p className="mt-1 text-xs italic text-muted-foreground">{ans.feedback}</p>
                      )}
                    </div>
                    <span className="shrink-0 font-mono text-xs font-semibold text-foreground">
                      {ans.awarded} / {ans.points}
                    </span>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
