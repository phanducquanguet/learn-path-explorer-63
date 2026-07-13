import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { TopNav } from "@/components/TopNav";
import { useRole } from "@/contexts/RoleContext";
import {
  tests as seedTests,
  testDisplayStatus,
  TEST_STATUS_LABEL,
  type Test,
  type TestDisplayStatus,
} from "@/lib/tests-data";
import { classes } from "@/lib/teacher-data";
import { orgs, classOrgMap, getOrg } from "@/lib/orgs";
import { questionBank } from "@/lib/question-bank";
import {
  ScrollText,
  Plus,
  Clock,
  Calendar,
  CheckCircle2,
  Copy,
  Sparkles,
  Building2,
  X,
  Activity,
  FileText,
  FileEdit,
  Send,
  ShieldCheck,
  Lock,
  ExternalLink,
  Eye,
  MoreHorizontal,
  PlayCircle,
  Filter,
  ClipboardCheck,
} from "lucide-react";

import { cn } from "@/lib/utils";

export const Route = createFileRoute("/admin/tests/")({
  head: () => ({ meta: [{ title: "Thi cử — UNICOM LMS" }] }),
  component: AdminTestsList,
});

/* ------------ helpers copy / sim (giữ nguyên như trước) ------------ */
function pickSimilar(
  skill: string,
  type: string,
  level: string,
  difficulty: string | undefined,
  exclude: Set<string>,
  count: number,
) {
  const pool = questionBank.filter(
    (q) =>
      q.skill === (skill as never) &&
      (!type || type === "mixed" || q.type === (type as never)) &&
      q.level === (level as never) &&
      (!difficulty || difficulty === "mixed" || q.difficulty === difficulty) &&
      !exclude.has(q.id),
  );
  const shuffled = [...pool].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count).map((q) => q.id);
}

function cloneTestSimilar(t: Test, index: number): Test {
  const now = Date.now();
  const days = (d: number) => new Date(now + d * 86400000).toISOString();
  const used = new Set<string>();
  const structure = t.structure.map((s) => {
    const next = { ...s };
    if (s.pickedIds && s.pickedIds.length) {
      const ids = pickSimilar(s.skill, s.type, s.level, s.difficulty, used, s.count);
      ids.forEach((id) => used.add(id));
      next.pickedIds = ids.length ? ids : s.pickedIds;
    }
    return next;
  });
  return {
    ...t,
    id: `${t.id}-sim-${now}`,
    code: t.code ? `${t.code}-SIM${index}` : undefined,
    name: `${t.name} — Bản tương tự ${index}`,
    structure,
    openAt: days(7),
    closeAt: days(8),
    registered: 0,
    submitted: 0,
    graded: 0,
    avgScore: undefined,
    createdAt: new Date().toISOString(),
    approvalStatus: "pending",
    reviewedBy: undefined,
    reviewedAt: undefined,
  };
}

const classNameById = (id: string) => classes.find((c) => c.id === id)?.name ?? id;

/* --------------------- status pills ---------------------- */
const STATUS_STYLE: Record<TestDisplayStatus, { dot: string; badge: string }> = {
  draft: {
    dot: "bg-muted-foreground",
    badge: "bg-muted text-muted-foreground",
  },
  pending: {
    dot: "bg-amber-500",
    badge: "bg-amber-100 text-amber-700",
  },
  approved: {
    dot: "bg-sky-500",
    badge: "bg-sky-100 text-sky-700",
  },
  open: {
    dot: "bg-emerald-500",
    badge: "bg-emerald-100 text-emerald-700",
  },
  closed: {
    dot: "bg-rose-500",
    badge: "bg-rose-100 text-rose-700",
  },
};

const STATUS_ICON: Record<TestDisplayStatus, React.ComponentType<{ className?: string }>> = {
  draft: FileEdit,
  pending: ClipboardCheck,
  approved: ShieldCheck,
  open: CheckCircle2,
  closed: Lock,
};

function StatusPill({ status }: { status: TestDisplayStatus }) {
  const s = STATUS_STYLE[status];
  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold", s.badge)}>
      <span className={cn("h-1.5 w-1.5 rounded-full", s.dot)} />
      {TEST_STATUS_LABEL[status]}
    </span>
  );
}

/* --------------------- main list ---------------------- */
function AdminTestsList() {
  const { role } = useRole();
  const isAdmin = role === "admin";
  const [tests, setTests] = useState<Test[]>(seedTests);
  const [orgFilter, setOrgFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<TestDisplayStatus | "all">("all");
  
  const [copyTarget, setCopyTarget] = useState<Test[] | null>(null);
  const [query, setQuery] = useState("");

  const counts = useMemo(() => {
    const c: Record<TestDisplayStatus, number> = {
      draft: 0, pending: 0, approved: 0, open: 0, closed: 0,
    };
    for (const t of tests) c[testDisplayStatus(t)]++;
    return c;
  }, [tests]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return tests.filter((t) => {
      if (orgFilter !== "all" && t.orgId !== orgFilter) return false;
      if (statusFilter !== "all" && testDisplayStatus(t) !== statusFilter) return false;
      if (q) {
        const hay = `${t.name} ${t.code ?? ""}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [tests, orgFilter, statusFilter, query]);

  const simCounts = useMemo(() => {
    const m: Record<string, number> = {};
    for (const t of tests) {
      const base = t.id.split("-sim-")[0];
      m[base] = (m[base] ?? 0) + (t.id.includes("-sim-") ? 1 : 0);
    }
    return m;
  }, [tests]);

  const duplicate = (t: Test) => {
    const base = t.id.split("-sim-")[0];
    const idx = (simCounts[base] ?? 0) + 1;
    setTests((arr) => [cloneTestSimilar(t, idx), ...arr]);
  };

  const toggleSelect = (id: string) =>
    setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));

  const openBulkCopy = () => {
    const list = tests.filter((t) => selected.includes(t.id));
    if (list.length > 0) setCopyTarget(list);
  };

  const performCopy = (sources: Test[], targetOrgId: string, targetClassIds: string[]) => {
    const stamp = Date.now();
    const clones: Test[] = sources.map((src, i) => ({
      ...src,
      id: `${src.id}-copy-${stamp}-${i}`,
      code: src.code ? `${src.code}-COPY` : undefined,
      name: `${src.name} (bản sao)`,
      orgId: targetOrgId,
      classIds: targetClassIds,
      copiedFromId: src.id,
      registered: 0,
      submitted: 0,
      graded: 0,
      avgScore: undefined,
      createdAt: new Date().toISOString(),
      approvalStatus: "pending",
      reviewedBy: undefined,
      reviewedAt: undefined,
    }));
    setTests((arr) => [...clones, ...arr]);
    setCopyTarget(null);
    setSelected([]);
  };

  const allSelectedInFilter =
    filtered.length > 0 && filtered.every((t) => selected.includes(t.id));
  const toggleSelectAll = () => {
    if (allSelectedInFilter) {
      setSelected((s) => s.filter((id) => !filtered.some((t) => t.id === id)));
    } else {
      setSelected((s) => Array.from(new Set([...s, ...filtered.map((t) => t.id)])));
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <TopNav />
      <div className="mx-auto max-w-7xl px-6 pb-20 pt-10 sm:px-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-primary">
              <ScrollText className="h-3.5 w-3.5" /> Quản lý kỳ thi
            </span>
            <h1 className="mt-1 font-display text-3xl font-semibold tracking-tight sm:text-4xl">
              Thi cử
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Danh sách đề thi. Đề mới tạo sẽ chuyển sang trạng thái{" "}
              <b>Chờ duyệt</b> để admin khác duyệt trước khi mở.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Link
              to="/admin/tests/monitor"
              className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-surface px-4 py-2.5 text-sm font-semibold text-foreground shadow-soft hover:bg-muted"
            >
              <Activity className="h-4 w-4 text-emerald-500" /> Giám sát kỳ thi
            </Link>
            {isAdmin && (
              <Link
                to="/admin/tests/new"
                className="inline-flex items-center gap-1.5 rounded-xl px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-soft"
                style={{ background: "var(--gradient-brand)" }}
              >
                <Plus className="h-4 w-4" /> Tạo đề mới
              </Link>
            )}
          </div>
        </div>

        {/* 5 thẻ thống kê */}
        <div className="mt-6 grid gap-3 sm:grid-cols-3 lg:grid-cols-5">
          <StatCard icon={FileText} label="Tổng đề thi" value={tests.length} />
          <StatCard icon={FileEdit} label="Bản nháp" value={counts.draft} tone="muted" />
          <StatCard icon={ClipboardCheck} label="Chờ duyệt" value={counts.pending} tone="amber" />
          <StatCard icon={ShieldCheck} label="Đã duyệt" value={counts.approved} tone="sky" />
          <StatCard icon={CheckCircle2} label="Đang mở" value={counts.open} tone="emerald" />
        </div>

        {/* Toolbar: chip trạng thái + search + org */}
        <div className="mt-6 flex flex-col gap-3 rounded-2xl border border-border bg-surface p-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="inline-flex items-center gap-1 pr-1 text-xs font-semibold text-muted-foreground">
              <Filter className="h-3.5 w-3.5" /> Trạng thái:
            </span>
            <FilterChip
              active={statusFilter === "all"}
              onClick={() => setStatusFilter("all")}
              label={`Tất cả (${tests.length})`}
            />
            {(Object.keys(counts) as TestDisplayStatus[]).map((s) => (
              <FilterChip
                key={s}
                active={statusFilter === s}
                onClick={() => setStatusFilter(s)}
                label={`${TEST_STATUS_LABEL[s]} (${counts[s]})`}
                tone={s}
              />
            ))}
          </div>

          <div className="flex items-center gap-2">
            <div className="relative">
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Tìm theo tên hoặc mã đề…"
                className="h-9 w-56 rounded-lg border border-border bg-background pl-3 pr-8 text-xs outline-none focus:border-primary"
              />
              {query && (
                <button
                  onClick={() => setQuery("")}
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-0.5 text-muted-foreground hover:bg-muted"
                >
                  <X className="h-3 w-3" />
                </button>
              )}
            </div>
            <select
              value={orgFilter}
              onChange={(e) => setOrgFilter(e.target.value)}
              className="h-9 rounded-lg border border-border bg-background px-2 text-xs text-foreground outline-none focus:border-primary"
            >
              <option value="all">Tất cả đơn vị</option>
              {orgs.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.shortName}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Bulk actions bar */}
        {isAdmin && selected.length > 0 && (
          <div className="mt-3 flex items-center gap-2 rounded-xl border border-border bg-primary/5 px-4 py-2">
            <span className="text-xs text-muted-foreground">
              Đã chọn <b className="text-foreground">{selected.length}</b> đề
            </span>
            <div className="ml-auto flex items-center gap-2">
              <button
                onClick={openBulkCopy}
                className="inline-flex items-center gap-1.5 rounded-xl bg-foreground px-3 py-1.5 text-xs font-semibold text-background hover:opacity-90"
              >
                <Copy className="h-3.5 w-3.5" /> Sao chép sang đơn vị
              </button>
              <button
                onClick={() => setSelected([])}
                className="rounded-xl border border-border bg-background p-1.5 text-muted-foreground hover:text-foreground"
                aria-label="Bỏ chọn"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* Bảng */}
        <div className="mt-4 overflow-hidden rounded-2xl border border-border bg-surface shadow-soft">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-border bg-muted/40 text-xs uppercase tracking-wider text-muted-foreground">
                <tr>
                  {isAdmin && (
                    <th className="w-10 px-3 py-3 text-left font-semibold">
                      <button
                        onClick={toggleSelectAll}
                        className="inline-flex items-center text-foreground"
                        aria-label="Chọn tất cả"
                      >
                        {allSelectedInFilter ? (
                          <CheckSquare className="h-4 w-4 text-primary" />
                        ) : (
                          <Square className="h-4 w-4" />
                        )}
                      </button>
                    </th>
                  )}
                  <th className="w-10 px-2 py-3 text-left font-semibold">#</th>
                  <th className="px-4 py-3 text-left font-semibold">Đề thi</th>
                  <th className="px-4 py-3 text-left font-semibold">Đơn vị</th>
                  <th className="px-4 py-3 text-left font-semibold">Lịch thi</th>
                  <th className="px-4 py-3 text-left font-semibold">Hoạt động</th>
                  <th className="px-4 py-3 text-left font-semibold">Trạng thái</th>
                  <th className="px-4 py-3 text-right font-semibold">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map((t, idx) => {
                  const st = testDisplayStatus(t);
                  const org = getOrg(t.orgId);
                  const isSelected = selected.includes(t.id);
                  const isSim = t.id.includes("-sim-");
                  const activity = t.submitted;
                  const pendingGrade = Math.max(0, t.submitted - t.graded);
                  return (
                    <tr
                      key={t.id}
                      className={cn(
                        "transition hover:bg-muted/30",
                        isSelected && "bg-primary/5",
                      )}
                    >
                      {isAdmin && (
                        <td className="px-3 py-3">
                          <button
                            onClick={() => toggleSelect(t.id)}
                            className="inline-flex items-center"
                            aria-label="Chọn"
                          >
                            {isSelected ? (
                              <CheckSquare className="h-4 w-4 text-primary" />
                            ) : (
                              <Square className="h-4 w-4 text-muted-foreground" />
                            )}
                          </button>
                        </td>
                      )}
                      <td className="px-2 py-3 text-xs text-muted-foreground">{idx + 1}</td>
                      <td className="px-4 py-3">
                        <Link
                          to="/teacher/tests/$testId"
                          params={{ testId: t.id }}
                          className="flex flex-col gap-0.5"
                        >
                          <span className="flex items-center gap-1.5 font-semibold text-foreground line-clamp-1">
                            {t.name}
                            {isSim && (
                              <span className="inline-flex items-center gap-0.5 rounded bg-primary/10 px-1.5 py-0.5 text-[10px] font-semibold text-primary">
                                <Sparkles className="h-2.5 w-2.5" /> tương tự
                              </span>
                            )}
                          </span>
                          <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[11px] text-muted-foreground">
                            {t.code && (
                              <span className="rounded bg-muted px-1.5 py-0.5 font-mono text-[10px] text-foreground/70">
                                # {t.code}
                              </span>
                            )}
                            <span className="truncate">
                              {t.classIds.map(classNameById).join(", ") || "—"}
                            </span>
                            <span>·</span>
                            <span className="font-semibold text-primary">{t.level}</span>
                            <span>·</span>
                            <span className="inline-flex items-center gap-1">
                              <Clock className="h-3 w-3" /> {t.durationMinutes} phút
                            </span>
                          </div>
                        </Link>
                      </td>
                      <td className="px-4 py-3">
                        {org ? (
                          <span className="inline-flex items-center gap-1 rounded-md bg-primary/10 px-2 py-0.5 text-[11px] font-semibold text-primary">
                            <Building2 className="h-3 w-3" /> {org.shortName}
                          </span>
                        ) : (
                          <span className="text-xs text-muted-foreground">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-xs" suppressHydrationWarning>
                        <div className="flex items-center gap-1.5 text-emerald-700">
                          <Calendar className="h-3 w-3" />
                          {new Date(t.openAt).toLocaleString("vi-VN", {
                            hour: "2-digit",
                            minute: "2-digit",
                            day: "2-digit",
                            month: "2-digit",
                            year: "numeric",
                          })}
                        </div>
                        <div className="mt-0.5 flex items-center gap-1.5 text-rose-600">
                          <Calendar className="h-3 w-3" />
                          {new Date(t.closeAt).toLocaleString("vi-VN", {
                            hour: "2-digit",
                            minute: "2-digit",
                            day: "2-digit",
                            month: "2-digit",
                            year: "numeric",
                          })}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2 text-xs">
                          <span className="inline-flex items-center gap-1 rounded-md bg-muted px-2 py-0.5 font-semibold text-foreground">
                            <FileText className="h-3 w-3" /> {activity}
                          </span>
                          {pendingGrade > 0 && (
                            <span className="inline-flex items-center gap-1 rounded-md bg-amber-100 px-2 py-0.5 font-semibold text-amber-700">
                              <ClipboardCheck className="h-3 w-3" /> {pendingGrade}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <StatusPill status={st} />
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1">
                          {st === "pending" && isAdmin && (
                            <Link
                              to="/admin/tests/$testId/review"
                              params={{ testId: t.id }}
                              className="inline-flex items-center gap-1 rounded-lg bg-amber-500 px-2.5 py-1.5 text-[11px] font-semibold text-white hover:bg-amber-600"
                              title="Duyệt đề"
                            >
                              <ShieldCheck className="h-3 w-3" /> Duyệt
                            </Link>
                          )}
                          <Link
                            to="/teacher/tests/$testId"
                            params={{ testId: t.id }}
                            className="rounded-lg border border-border bg-background p-1.5 text-muted-foreground hover:border-primary hover:text-primary"
                            title="Mở"
                          >
                            <ExternalLink className="h-3.5 w-3.5" />
                          </Link>
                          <Link
                            to="/teacher/tests/$testId"
                            params={{ testId: t.id }}
                            className="rounded-lg border border-border bg-background p-1.5 text-muted-foreground hover:border-primary hover:text-primary"
                            title="Xem chi tiết"
                          >
                            <Eye className="h-3.5 w-3.5" />
                          </Link>
                          {isAdmin && (
                            <RowMenu t={t} onCopy={() => setCopyTarget([t])} onDuplicate={() => duplicate(t)} />
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {filtered.length === 0 && (
                  <tr>
                    <td
                      colSpan={isAdmin ? 8 : 7}
                      className="px-4 py-12 text-center text-sm text-muted-foreground"
                    >
                      Không có đề thi nào khớp bộ lọc.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {copyTarget && (
        <CopyDialog
          sources={copyTarget}
          onClose={() => setCopyTarget(null)}
          onConfirm={performCopy}
        />
      )}
    </div>
  );
}

/* --------------------- small pieces ---------------------- */

function FilterChip({
  active,
  onClick,
  label,
  tone,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  tone?: TestDisplayStatus;
}) {
  const dot = tone ? STATUS_STYLE[tone].dot : undefined;
  return (
    <button
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-semibold transition",
        active
          ? "bg-foreground text-background"
          : "text-muted-foreground hover:text-foreground",
      )}
    >
      {dot && <span className={cn("h-1.5 w-1.5 rounded-full", dot)} />}
      {label}
    </button>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  tone,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: number | string;
  tone?: "muted" | "amber" | "sky" | "emerald";
}) {
  const toneCls =
    tone === "amber"
      ? "text-amber-600 bg-amber-50"
      : tone === "sky"
        ? "text-sky-600 bg-sky-50"
        : tone === "emerald"
          ? "text-emerald-600 bg-emerald-50"
          : tone === "muted"
            ? "text-muted-foreground bg-muted"
            : "text-primary bg-primary/10";
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-border bg-surface p-4 shadow-soft">
      <div className={cn("flex h-10 w-10 items-center justify-center rounded-xl", toneCls)}>
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <div className="text-xs font-medium text-muted-foreground">{label}</div>
        <div className="font-display text-2xl font-semibold tracking-tight text-foreground">
          {value}
        </div>
      </div>
    </div>
  );
}

function RowMenu({
  t,
  onCopy,
  onDuplicate,
}: {
  t: Test;
  onCopy: () => void;
  onDuplicate: () => void;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="rounded-lg border border-border bg-background p-1.5 text-muted-foreground hover:border-primary hover:text-primary"
        title="Thêm hành động"
      >
        <MoreHorizontal className="h-3.5 w-3.5" />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full z-20 mt-1 w-52 overflow-hidden rounded-xl border border-border bg-surface text-xs shadow-elevated">
            <button
              onClick={() => {
                setOpen(false);
                onCopy();
              }}
              className="flex w-full items-center gap-2 px-3 py-2 text-left hover:bg-muted"
            >
              <Copy className="h-3.5 w-3.5" /> Sao chép sang đơn vị khác
            </button>
            <button
              onClick={() => {
                setOpen(false);
                onDuplicate();
              }}
              className="flex w-full items-center gap-2 px-3 py-2 text-left hover:bg-muted"
            >
              <Sparkles className="h-3.5 w-3.5" /> Tạo đề tương tự
            </button>
            <Link
              to="/admin/tests/$testId/review"
              params={{ testId: t.id }}
              search={{ sim: 1 }}
              onClick={() => setOpen(false)}
              className="flex w-full items-center gap-2 px-3 py-2 text-left hover:bg-muted"
            >
              <PlayCircle className="h-3.5 w-3.5" /> Mô phỏng làm bài & chấm
            </Link>
            {t.approvalStatus === "pending" && (
              <Link
                to="/admin/tests/$testId/review"
                params={{ testId: t.id }}
                onClick={() => setOpen(false)}
                className="flex w-full items-center gap-2 px-3 py-2 text-left hover:bg-muted"
              >
                <ShieldCheck className="h-3.5 w-3.5" /> Đi tới trang duyệt
              </Link>
            )}
          </div>
        </>
      )}
    </div>
  );
}

/* --------------------- CopyDialog (giữ nguyên) ---------------------- */
function CopyDialog({
  sources,
  onClose,
  onConfirm,
}: {
  sources: Test[];
  onClose: () => void;
  onConfirm: (sources: Test[], orgId: string, classIds: string[]) => void;
}) {
  const sourceOrgIds = new Set(sources.map((s) => s.orgId).filter(Boolean));
  const defaultTarget =
    orgs.find((o) => !sourceOrgIds.has(o.id))?.id ?? orgs[0]?.id ?? "";
  const [orgId, setOrgId] = useState(defaultTarget);
  const [classIds, setClassIds] = useState<string[]>([]);

  const classesInOrg = classes.filter((c) => classOrgMap[c.id] === orgId);
  const allSelected =
    classesInOrg.length > 0 && classesInOrg.every((c) => classIds.includes(c.id));
  const toggle = (id: string) =>
    setClassIds((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/40 p-4">
      <div className="w-full max-w-2xl overflow-hidden rounded-3xl border border-border bg-surface shadow-2xl">
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <div>
            <h2 className="font-display text-lg font-semibold text-foreground">
              Sao chép {sources.length} đề thi sang đơn vị khác
            </h2>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Bản sao giữ nguyên cấu trúc đề và câu hỏi, được gán cho đơn vị và lớp đích. Lịch
              mở/đóng và dữ liệu nộp bài sẽ được làm mới.
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
            aria-label="Đóng"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-5 p-6">
          <div>
            <div className="mb-1.5 text-xs font-semibold text-foreground">Đề thi nguồn</div>
            <div className="flex flex-wrap gap-1.5">
              {sources.map((s) => (
                <span
                  key={s.id}
                  className="rounded-lg border border-border bg-background px-2.5 py-1 text-xs text-foreground"
                >
                  {s.name}
                  {s.orgId && (
                    <span className="ml-1.5 text-[10px] text-muted-foreground">
                      ({getOrg(s.orgId)?.shortName})
                    </span>
                  )}
                </span>
              ))}
            </div>
          </div>

          <div>
            <div className="mb-1.5 text-xs font-semibold text-foreground">Đơn vị đích</div>
            <select
              value={orgId}
              onChange={(e) => {
                setOrgId(e.target.value);
                setClassIds([]);
              }}
              className="h-10 w-full rounded-xl border border-border bg-background px-3 text-sm text-foreground outline-none focus:border-primary"
            >
              {orgs.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <div className="mb-1.5 flex items-center justify-between">
              <div className="text-xs font-semibold text-foreground">
                Gán cho lớp ({classIds.length}/{classesInOrg.length})
              </div>
              {classesInOrg.length > 0 && (
                <button
                  type="button"
                  onClick={() =>
                    setClassIds(allSelected ? [] : classesInOrg.map((c) => c.id))
                  }
                  className="text-[11px] font-semibold text-primary hover:underline"
                >
                  {allSelected ? "Bỏ chọn tất cả" : "Chọn tất cả"}
                </button>
              )}
            </div>
            {classesInOrg.length === 0 ? (
              <div className="rounded-xl border border-dashed border-border bg-muted/30 p-4 text-center text-xs text-muted-foreground">
                Đơn vị này chưa có lớp. Đề vẫn được sao chép và có thể gán lớp sau.
              </div>
            ) : (
              <div className="flex flex-wrap gap-2">
                {classesInOrg.map((c) => {
                  const active = classIds.includes(c.id);
                  return (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => toggle(c.id)}
                      className={cn(
                        "inline-flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-semibold transition",
                        active
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border bg-background text-muted-foreground hover:text-foreground",
                      )}
                    >
                      <span
                        className={cn(
                          "inline-flex h-4 w-4 items-center justify-center rounded border",
                          active
                            ? "border-primary bg-primary text-primary-foreground"
                            : "border-border",
                        )}
                      >
                        {active && <CheckCircle2 className="h-3 w-3" />}
                      </span>
                      {c.name}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 border-t border-border bg-muted/30 px-6 py-3">
          <button
            onClick={onClose}
            className="rounded-xl border border-border bg-background px-3 py-1.5 text-sm font-semibold text-foreground hover:bg-muted"
          >
            Huỷ
          </button>
          <button
            onClick={() => onConfirm(sources, orgId, classIds)}
            className="inline-flex items-center gap-1.5 rounded-xl bg-foreground px-3 py-1.5 text-sm font-semibold text-background hover:opacity-90"
          >
            <Copy className="h-3.5 w-3.5" /> Sao chép
          </button>
        </div>
      </div>
    </div>
  );
}
