import { createFileRoute, Link } from "@tanstack/react-router";
import { useSyncExternalStore, useMemo, useState, useEffect } from "react";
import { TopNav } from "@/components/TopNav";
import { PageHeader } from "@/components/PageHeader";
import {
  listAssignmentsForCurrentStudent,
  subscribeAssignments,
  getSubmissionForStudent,
  getEffectiveDueAt,
  CURRENT_STUDENT,
  type Assignment,
} from "@/lib/assignments";
import { ClipboardList, Calendar, AlertCircle, ArrowRight, CheckCircle2, Clock, AlarmClock, ListTodo, Search, X, ChevronDown, ArrowUpDown } from "lucide-react";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/assignments/")({
  head: () => ({ meta: [{ title: "Bài tập — UNICOM LMS" }] }),
  component: StudentAssignmentsPage,
});

function useList() {
  return useSyncExternalStore(
    (cb) => {
      const un = subscribeAssignments(cb);
      return () => un();
    },
    () => listAssignmentsForCurrentStudent(),
    () => listAssignmentsForCurrentStudent(),
  );
}

const DAY = 24 * 3600 * 1000;

function getUrgency(dueMs: number, now: number): "overdue" | "today" | "soon" | "normal" {
  const diff = dueMs - now;
  if (diff < 0) return "overdue";
  if (diff <= DAY) return "today";
  if (diff <= 3 * DAY) return "soon";
  return "normal";
}

type StatusFilter = "all" | "todo" | "submitted" | "graded" | "overdue";
type SortOption = "dueAsc" | "dueDesc" | "nameAsc" | "nameDesc";

function StudentAssignmentsPage() {
  const items = useList();
  const [now, setNow] = useState(0);
  useEffect(() => setNow(Date.now()), []);

  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [sort, setSort] = useState<SortOption>("dueAsc");

  const processedItems = useMemo(() => {
    const q = query.trim().toLowerCase();
    const filtered = items.filter((a) => {
      const sub = getSubmissionForStudent(a.id, CURRENT_STUDENT.id);
      const dueMs = new Date(getEffectiveDueAt(a, CURRENT_STUDENT.id)).getTime();
      const status = sub?.score !== undefined ? "graded" : sub ? "submitted" : dueMs < now ? "overdue" : "todo";
      if (statusFilter !== "all" && status !== statusFilter) return false;
      if (q && !`${a.title} ${a.description ?? ""}`.toLowerCase().includes(q)) return false;
      return true;
    });

    return filtered.sort((a, b) => {
      switch (sort) {
        case "dueAsc":
          return new Date(getEffectiveDueAt(a, CURRENT_STUDENT.id)).getTime() - new Date(getEffectiveDueAt(b, CURRENT_STUDENT.id)).getTime();
        case "dueDesc":
          return new Date(getEffectiveDueAt(b, CURRENT_STUDENT.id)).getTime() - new Date(getEffectiveDueAt(a, CURRENT_STUDENT.id)).getTime();
        case "nameAsc":
          return a.title.localeCompare(b.title);
        case "nameDesc":
          return b.title.localeCompare(a.title);
        default:
          return 0;
      }
    });
  }, [items, query, statusFilter, sort, now]);

  const stats = useMemo(() => {
    let todo = 0, submitted = 0, graded = 0, dueSoon = 0, overdue = 0;
    for (const a of items) {
      const sub = getSubmissionForStudent(a.id, CURRENT_STUDENT.id);
      const dueMs = new Date(getEffectiveDueAt(a, CURRENT_STUDENT.id)).getTime();
      if (sub?.score !== undefined) graded++;
      else if (sub) submitted++;
      else {
        todo++;
        const u = getUrgency(dueMs, now);
        if (u === "overdue") overdue++;
        else if (u === "today" || u === "soon") dueSoon++;
      }
    }
    return { total: items.length, todo, submitted, graded, dueSoon, overdue };
  }, [items, now]);

  const hasFilters = query !== "" || statusFilter !== "all" || sort !== "dueAsc";

  return (
    <div className="min-h-screen bg-background">
      <TopNav />
      <div className="mx-auto max-w-4xl px-6 pb-20 pt-10 sm:px-8">
        <PageHeader
          eyebrow="Bài tập của tôi"
          eyebrowIcon={ListTodo}
          title="Bài tập"
          description="Bài tập tự luận do giáo viên giao. Nộp bằng câu trả lời hoặc file đính kèm."
          stats={[
            { icon: ListTodo, label: "Cần làm", value: stats.todo, tone: "primary" },
            { icon: AlarmClock, label: "Sắp đến hạn", value: stats.dueSoon, tone: "warning" },
            { icon: Clock, label: "Chờ chấm", value: stats.submitted, tone: "muted" },
            { icon: CheckCircle2, label: "Đã chấm", value: stats.graded, tone: "success" },
          ]}
        />

        {stats.overdue > 0 && (
          <div className="mt-3 flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-medium text-rose-700">
            <AlertCircle className="h-4 w-4" /> Bạn đang có {stats.overdue} bài quá hạn chưa nộp.
          </div>
        )}

        {/* Search + filters + sort */}
        <div className="mt-6 rounded-2xl border border-border bg-surface p-3 shadow-soft">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Tìm bài tập..."
                className="h-10 w-full rounded-xl border border-border bg-background pl-9 pr-9 text-sm text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
              {query && (
                <button
                  onClick={() => setQuery("")}
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
                  aria-label="Xóa"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <FilterSelect
                value={statusFilter}
                onChange={(v) => setStatusFilter(v as StatusFilter)}
                icon={<Clock className="h-4 w-4" />}
                options={[
                  { value: "all", label: "Tất cả trạng thái" },
                  { value: "todo", label: "Cần làm" },
                  { value: "submitted", label: "Chờ chấm" },
                  { value: "graded", label: "Đã chấm" },
                  { value: "overdue", label: "Quá hạn" },
                ]}
              />
              <FilterSelect
                value={sort}
                onChange={(v) => setSort(v as SortOption)}
                icon={<ArrowUpDown className="h-4 w-4" />}
                options={[
                  { value: "dueAsc", label: "Hạn gần nhất" },
                  { value: "dueDesc", label: "Hạn xa nhất" },
                  { value: "nameAsc", label: "Tên A → Z" },
                  { value: "nameDesc", label: "Tên Z → A" },
                ]}
              />
              {hasFilters && (
                <button
                  onClick={() => {
                    setQuery("");
                    setStatusFilter("all");
                    setSort("dueAsc");
                  }}
                  className="inline-flex items-center gap-1 rounded-xl px-3 py-2 text-xs font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
                >
                  <X className="h-3.5 w-3.5" /> Xóa lọc
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="mt-6 grid gap-3">
          {processedItems.map((a) => (
            <Row key={a.id} a={a} now={now} />
          ))}
          {processedItems.length === 0 && (
            <div className="rounded-2xl border border-dashed border-border bg-surface p-10 text-center text-sm text-muted-foreground">
              {hasFilters
                ? "Không tìm thấy bài tập phù hợp. Thử bỏ bớt bộ lọc hoặc tìm với từ khóa khác."
                : "Hiện chưa có bài tập nào."}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function FilterSelect({
  value,
  onChange,
  options,
  icon,
}: {
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
  icon?: React.ReactNode;
}) {
  return (
    <div className="relative min-w-[10rem]">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-10 w-full appearance-none rounded-xl border border-border bg-background pl-9 pr-8 text-sm font-medium text-foreground outline-none transition hover:border-primary/40 focus:border-primary focus:ring-2 focus:ring-primary/20"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      {icon && (
        <div className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground">
          {icon}
        </div>
      )}
      <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
    </div>
  );
}

function KpiCard({
  icon,
  label,
  value,
  tone,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  tone: "primary" | "amber" | "sky" | "emerald";
}) {
  const toneCls = {
    primary: "bg-primary/10 text-primary",
    amber: "bg-amber-100 text-amber-700",
    sky: "bg-sky-100 text-sky-700",
    emerald: "bg-emerald-100 text-emerald-700",
  }[tone];
  return (
    <div className="rounded-2xl border border-border bg-surface p-4 shadow-soft">
      <div className="flex items-center gap-2">
        <span className={cn("inline-flex h-7 w-7 items-center justify-center rounded-lg", toneCls)}>{icon}</span>
        <span className="text-xs font-medium text-muted-foreground">{label}</span>
      </div>
      <div className="mt-2 font-display text-2xl font-semibold tracking-tight">{value}</div>
    </div>
  );
}

function formatRemain(ms: number): string {
  const abs = Math.abs(ms);
  const h = Math.floor(abs / 3600000);
  if (h < 1) {
    const m = Math.max(1, Math.floor(abs / 60000));
    return `${m} phút`;
  }
  if (h < 24) return `${h} giờ`;
  const d = Math.floor(h / 24);
  const rh = h % 24;
  return rh > 0 ? `${d} ngày ${rh} giờ` : `${d} ngày`;
}

function Row({ a, now }: { a: Assignment; now: number }) {
  const sub = getSubmissionForStudent(a.id, CURRENT_STUDENT.id);
  const effectiveDue = getEffectiveDueAt(a, CURRENT_STUDENT.id);
  const dueMs = new Date(effectiveDue).getTime();
  const urgency = getUrgency(dueMs, now);
  const overdue = urgency === "overdue";
  const status = sub?.score !== undefined ? "graded" : sub ? "submitted" : "todo";
  const extended = !!a.extensions?.[CURRENT_STUDENT.id];
  const showWarning = status === "todo" && (urgency === "today" || urgency === "soon");
  return (
    <Link
      to="/assignments/$assignmentId"
      params={{ assignmentId: a.id }}
      className="group flex items-center gap-4 rounded-2xl border border-border bg-surface p-4 shadow-soft hover:border-primary/40"
    >
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
        <ClipboardList className="h-5 w-5" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <div className="truncate font-semibold text-foreground">{a.title}</div>
          {extended && status === "todo" && !overdue && (
            <span className="inline-flex items-center gap-1 rounded-full bg-violet-100 px-2 py-0.5 text-[11px] font-semibold text-violet-700">
              <AlarmClock className="h-3 w-3" /> Đã gia hạn · còn {formatRemain(dueMs - now)}
            </span>
          )}
          {showWarning && !extended && (
            <span
              className={cn(
                "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold",
                urgency === "today"
                  ? "bg-rose-100 text-rose-700"
                  : "bg-amber-100 text-amber-700",
              )}
            >
              <AlarmClock className="h-3 w-3" />
              {urgency === "today" ? `Còn ${formatRemain(dueMs - now)}` : `Sắp đến hạn · ${formatRemain(dueMs - now)}`}
            </span>
          )}
        </div>
        <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
          <span className={cn("inline-flex items-center gap-1", overdue && status === "todo" && "text-rose-600")}>
            <Calendar className="h-3 w-3" /> Hạn:{" "}
            {new Date(effectiveDue).toLocaleString("vi-VN", { timeZone: "Asia/Ho_Chi_Minh" })}
          </span>
          <span>Thang điểm: {a.maxScore}</span>
        </div>
      </div>
      <div className="text-right">
        {status === "graded" ? (
          <div className="text-sm">
            <div className="font-bold text-primary">
              {sub!.score}/{a.maxScore}
            </div>
            <div className="text-[11px] text-emerald-700">Đã chấm</div>
          </div>
        ) : status === "submitted" ? (
          <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-semibold text-amber-700">
            <AlertCircle className="h-3 w-3" /> Chờ chấm
          </span>
        ) : (
          <span
            className={cn(
              "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold",
              overdue ? "bg-rose-100 text-rose-700" : "bg-primary/10 text-primary",
            )}
          >
            {overdue ? "Quá hạn" : "Cần làm"}
          </span>
        )}
      </div>
      <ArrowRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
    </Link>
  );
}
