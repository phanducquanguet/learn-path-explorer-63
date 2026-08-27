import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  ArrowUpRight,
  BarChart3,
  BookOpenCheck,
  Clock,
  FileQuestion,
  History,
  Lock,
  Repeat2,
  Shuffle,
  Sparkles,
  Target,
} from "lucide-react";
import { TopNav } from "@/components/TopNav";
import { PageHeader } from "@/components/PageHeader";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import {
  cefrOf,
  PASS_THRESHOLD,
  pctOf,
  practiceSummaries,
  type PracticeSummary,
} from "@/lib/practice-attempts";

export const Route = createFileRoute("/practice-tests/")({
  head: () => ({
    meta: [
      { title: "Luyện thi — UNICOM LMS" },
      {
        name: "description",
        content:
          "Chọn đề theo cấp độ lớp, luyện lại nhiều lần và xem lại kết quả từng lượt làm bài.",
      },
      { property: "og:title", content: "Luyện thi — UNICOM LMS" },
      {
        property: "og:description",
        content: "Đề luyện thi của học viên: số lượt còn lại, điểm cao nhất và lịch sử từng lượt.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: PracticeTestsPage,
});

type Filter = "all" | "available" | "done" | "used-up";

function PracticeTestsPage() {
  const summaries = useMemo(() => practiceSummaries(), []);
  const [filter, setFilter] = useState<Filter>("all");

  const totals = useMemo(() => {
    const attempts = summaries.reduce((s, x) => s + x.used, 0);
    const papers = summaries.reduce((s, x) => s + x.test.paperCount, 0);
    const scored = summaries.filter((s) => s.best);
    const avgBest =
      scored.length > 0
        ? Math.round(scored.reduce((s, x) => s + pctOf(x.best!), 0) / scored.length)
        : 0;
    return { attempts, papers, avgBest };
  }, [summaries]);

  const list = useMemo(
    () =>
      summaries.filter((s) => {
        if (filter === "available") return s.canRetake;
        if (filter === "done") return s.used > 0;
        if (filter === "used-up") return !s.canRetake;
        return true;
      }),
    [summaries, filter],
  );

  return (
    <div className="min-h-screen bg-background">
      <TopNav />
      <div className="mx-auto max-w-7xl px-6 pb-20 pt-8 sm:px-8">
        <PageHeader
          eyebrow="Luyện tập & tự đánh giá"
          eyebrowIcon={Sparkles}
          title="Luyện thi"
          description="Chọn đề theo cấp độ lớp của bạn. Mỗi đề có số lượt làm riêng — làm xong bạn có thể xem lại kết quả từng lượt và so sánh tiến bộ."
          stats={[
            { icon: BookOpenCheck, label: "Đề luyện", value: summaries.length },
            { icon: Shuffle, label: "Mã đề", value: totals.papers, tone: "muted" },
            { icon: Repeat2, label: "Lượt đã làm", value: totals.attempts, tone: "primary" },
            {
              icon: Target,
              label: "Điểm tốt nhất TB",
              value: `${totals.avgBest}%`,
              tone: totals.avgBest >= PASS_THRESHOLD ? "success" : "warning",
            },
          ]}
        />

        <div className="mt-6 inline-flex flex-wrap items-center gap-1 rounded-xl border border-border bg-surface p-1">
          {(
            [
              { id: "all" as const, label: `Tất cả (${summaries.length})` },
              {
                id: "available" as const,
                label: `Còn lượt (${summaries.filter((s) => s.canRetake).length})`,
              },
              {
                id: "done" as const,
                label: `Đã có kết quả (${summaries.filter((s) => s.used > 0).length})`,
              },
              {
                id: "used-up" as const,
                label: `Hết lượt (${summaries.filter((s) => !s.canRetake).length})`,
              },
            ]
          ).map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id)}
              className={cn(
                "rounded-lg px-3 py-1.5 text-sm font-semibold transition",
                filter === tab.id
                  ? "bg-foreground text-background"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="mt-6 grid gap-4 lg:grid-cols-3 sm:grid-cols-2">
          {list.map((s) => (
            <PracticeCard key={s.test.id} s={s} />
          ))}
        </div>

        {list.length === 0 && (
          <div className="mt-6 rounded-2xl border border-dashed border-border bg-surface/40 p-16 text-center text-sm text-muted-foreground">
            Không có đề nào khớp bộ lọc này.
          </div>
        )}
      </div>
    </div>
  );
}

function PracticeCard({ s }: { s: PracticeSummary }) {
  const { test, used, remaining, canRetake, latest, best } = s;
  const latestPct = latest ? pctOf(latest) : null;

  return (
    <div className="flex flex-col rounded-2xl border border-border bg-surface p-5 shadow-soft transition hover:shadow-elevated">
      <div className="flex flex-wrap items-center gap-2">
        <span className="rounded-md border border-border bg-surface-2 px-2 py-0.5 font-mono text-[11px] font-semibold text-foreground">
          {test.code}
        </span>
        {canRetake ? (
          <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
            Sẵn sàng
          </span>
        ) : (
          <span className="rounded-full bg-muted px-2 py-0.5 text-[11px] font-semibold text-muted-foreground">
            Hết lượt
          </span>
        )}
        {used > 0 && (
          <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-semibold text-primary">
            Đã có kết quả
          </span>
        )}
      </div>

      <h3 className="mt-3 font-display text-lg font-semibold leading-snug text-foreground">
        {test.name}
      </h3>
      <p className="mt-1 text-xs text-muted-foreground">
        {test.level} • {test.className}
      </p>

      <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
        <Meta icon={Clock} text={`${test.durationMinutes} phút`} />
        <Meta icon={FileQuestion} text={`${test.questionCount} câu`} />
        <Meta icon={Shuffle} text={`${test.paperCount} mã đề`} />
        <Meta
          icon={Repeat2}
          text={
            test.maxAttempts == null
              ? `${used} lượt • không giới hạn`
              : `${used}/${test.maxAttempts} lượt`
          }
        />
      </div>

      {latest && latestPct != null ? (
        <div className="mt-4 rounded-xl border border-border bg-surface-2 p-3">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-muted-foreground">
              {used > 1 ? `Lượt gần nhất (lần ${latest.attemptNo}/${used})` : "Kết quả"}
            </span>
            <span className="font-mono font-semibold text-foreground">
              {latest.earned} / {latest.total} ({latestPct}%)
            </span>
          </div>
          <Progress value={latestPct} className="mt-2 h-1.5" />
          <div className="mt-2 flex flex-wrap items-center gap-2 text-[11px]">
            <span className="rounded-full bg-primary/10 px-2 py-0.5 font-semibold text-primary">
              CEFR {cefrOf(latestPct)}
            </span>
            {latest.status === "needs-grading" && (
              <span className="rounded-full bg-amber-500/10 px-2 py-0.5 font-semibold text-amber-600 dark:text-amber-400">
                Chờ chấm tự luận
              </span>
            )}
            {used > 1 && best && (
              <span className="text-muted-foreground">
                Cao nhất: lần {best.attemptNo} — {pctOf(best)}%
              </span>
            )}
          </div>
        </div>
      ) : (
        <div className="mt-4 rounded-xl border border-dashed border-border p-3 text-xs text-muted-foreground">
          Bạn chưa làm đề này lần nào.
        </div>
      )}

      <div className="mt-auto flex items-center gap-2 pt-4">
        {canRetake ? (
          <Link
            to="/practice-tests/$testId"
            params={{ testId: test.id }}
            className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-foreground px-3 py-2.5 text-sm font-semibold text-background hover:opacity-90"
          >
            {used > 0 ? "Luyện lại" : "Luyện ngay"} <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
        ) : (
          <span className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-muted px-3 py-2.5 text-sm font-semibold text-muted-foreground">
            <Lock className="h-3.5 w-3.5" /> Hết lượt
          </span>
        )}
        <Link
          to="/practice-tests/$testId"
          params={{ testId: test.id }}
          aria-label="Xem lịch sử lượt làm"
          className={cn(
            "inline-flex h-10 w-10 items-center justify-center rounded-xl border border-border text-muted-foreground hover:bg-muted hover:text-foreground",
            used === 0 && "pointer-events-none opacity-40",
          )}
        >
          {used > 1 ? <History className="h-4 w-4" /> : <BarChart3 className="h-4 w-4" />}
        </Link>
      </div>

      {remaining != null && canRetake && used > 0 && (
        <p className="mt-2 text-[11px] text-muted-foreground">
          Còn {remaining} lượt làm.
        </p>
      )}
    </div>
  );
}

function Meta({
  icon: Icon,
  text,
}: {
  icon: React.ComponentType<{ className?: string }>;
  text: string;
}) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-surface-2 px-2 py-1.5 text-muted-foreground">
      <Icon className="h-3.5 w-3.5 shrink-0" /> <span className="truncate">{text}</span>
    </span>
  );
}
