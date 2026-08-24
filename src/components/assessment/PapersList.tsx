import { useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { TopNav } from "@/components/TopNav";
import { PageHeader } from "@/components/PageHeader";
import {
  tests as seedTests,
  testQuestionCount,
  type Test,
  type TestApprovalStatus,
} from "@/lib/tests-data";
import { testVersion } from "@/lib/exam-sessions";
import { orgs } from "@/lib/orgs";
import {
  ASSESSMENT_DESCRIPTION,
  ASSESSMENT_TITLE,
} from "@/components/assessment/AssessmentTabs";
import {
  FileText,
  Plus,
  Send,
  Copy,
  Eye,
  PencilLine,
  CalendarClock,
  GitBranch,
  Undo2,
  Clock,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

/** Trạng thái duyệt hiển thị ở màn hình Đề thi (không dùng Đang mở / Đã đóng). */
type PaperStatus = TestApprovalStatus | "revise" | "retired";

const STATUS_LABEL: Record<PaperStatus, string> = {
  draft: "Bản nháp",
  pending: "Chờ duyệt",
  revise: "Yêu cầu chỉnh sửa",
  approved: "Đã duyệt",
  retired: "Ngừng sử dụng",
};

const STATUS_COLOR: Record<PaperStatus, string> = {
  draft: "bg-muted text-muted-foreground",
  pending: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  revise: "bg-orange-500/10 text-orange-600 dark:text-orange-400",
  approved: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  retired: "bg-slate-500/10 text-slate-500",
};

function paperStatus(t: Test): PaperStatus {
  const a = t.approvalStatus ?? "approved";
  if (a === "draft" && t.reviewNote) return "revise";
  return a;
}

function fmtDate(iso: string) {
  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    timeZone: "Asia/Ho_Chi_Minh",
  }).format(new Date(iso));
}

export function PapersList({ scope = "admin" }: { scope?: AssessmentScope } = {}) {
  const [papers, setPapers] = useState<Test[]>(() =>
    seedTests.filter((t) => !t.id.includes("-sim-")),
  );
  const [status, setStatus] = useState<PaperStatus | "all">("all");
  const [query, setQuery] = useState("");

  const visible = useMemo(
    () =>
      scope === "teacher"
        ? papers.filter((t) => t.createdByRole !== "admin" || t.classIds.length > 0)
        : papers,
    [papers, scope],
  );

  const counts = useMemo(() => {
    const by = (s: PaperStatus) => visible.filter((t) => paperStatus(t) === s).length;
    return {
      total: visible.length,
      draft: by("draft"),
      pending: by("pending"),
      revise: by("revise"),
      approved: by("approved"),
    };
  }, [visible]);

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return visible.filter((t) => {
      if (status !== "all" && paperStatus(t) !== status) return false;
      if (q && !`${t.name} ${t.code ?? ""} ${t.createdByName ?? t.createdBy ?? ""}`.toLowerCase().includes(q))
        return false;
      return true;
    });
  }, [visible, status, query]);

  function submitForReview(id: string) {
    setPapers((prev) =>
      prev.map((t) => (t.id === id ? { ...t, approvalStatus: "pending", reviewNote: undefined } : t)),
    );
    toast.success("Đã gửi đề cho Admin Platform duyệt");
  }

  function withdraw(id: string) {
    setPapers((prev) =>
      prev.map((t) => (t.id === id ? { ...t, approvalStatus: "draft", reviewNote: undefined } : t)),
    );
    toast.success("Đã thu hồi yêu cầu duyệt — đề trở về Bản nháp");
  }

  function duplicate(t: Test) {
    const copy: Test = {
      ...t,
      id: `${t.id}-copy-${Math.random().toString(36).slice(2, 7)}`,
      name: `${t.name} (bản sao)`,
      approvalStatus: "draft",
      reviewNote: undefined,
      copiedFromId: t.id,
    };
    setPapers((prev) => [copy, ...prev]);
    toast.success("Đã nhân bản đề — bản sao ở trạng thái Bản nháp");
  }

  function newVersion(t: Test) {
    const next: Test = {
      ...t,
      id: `${t.id}-v${testVersion(t) + 1}`,
      approvalStatus: "draft",
      reviewNote: undefined,
    };
    (next as Test & { version?: number }).version = testVersion(t) + 1;
    setPapers((prev) => [next, ...prev]);
    toast.success(`Đã tạo phiên bản ${testVersion(t) + 1} (Bản nháp)`);
  }

  const statCards: { key: PaperStatus | "all"; label: string; value: number }[] = [
    { key: "all", label: "Tổng số đề", value: counts.total },
    { key: "draft", label: "Bản nháp", value: counts.draft },
    { key: "pending", label: "Chờ duyệt", value: counts.pending },
    { key: "revise", label: "Yêu cầu chỉnh sửa", value: counts.revise },
    { key: "approved", label: "Đã duyệt", value: counts.approved },
  ];

  return (
    <div className="min-h-screen bg-background">
      <TopNav />
      <div className="mx-auto max-w-7xl px-6 pb-20 pt-10 sm:px-8">
        <PageHeader
          eyebrow="Nội dung đề dùng chung"
          eyebrowIcon={FileText}
          title={ASSESSMENT_TITLE}
          description={ASSESSMENT_DESCRIPTION}
          actions={
            <Link
              to={scope === "admin" ? "/admin/tests/new" : "/teacher/tests/new"}
              className="inline-flex items-center gap-1.5 rounded-xl px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-soft"
              style={{ background: "var(--gradient-brand)" }}
            >
              <Plus className="h-4 w-4" /> Tạo đề thi
            </Link>
          }
          stats={statCards.map((c) => ({
            label: c.label,
            value: c.value,
            onClick: () => setStatus(c.key),
            active: status === c.key,
          }))}
        >
          <AssessmentTabBar scope={scope} active="papers" />
        </PageHeader>

        <div className="mt-6 flex flex-wrap items-center gap-2">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Tìm theo tên đề, mã đề, người tạo…"
            className="h-10 min-w-[260px] flex-1 rounded-xl border border-border bg-background px-3.5 text-sm outline-none focus:ring-2 focus:ring-primary/30"
          />
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as PaperStatus | "all")}
            className="h-10 rounded-xl border border-border bg-background px-3 text-sm"
          >
            <option value="all">Tất cả trạng thái</option>
            {(Object.keys(STATUS_LABEL) as PaperStatus[]).map((s) => (
              <option key={s} value={s}>
                {STATUS_LABEL[s]}
              </option>
            ))}
          </select>
        </div>

        <div className="mt-4 overflow-x-auto rounded-2xl border border-border bg-surface">
          <table className="w-full min-w-[1000px] text-sm">
            <thead className="bg-muted/50 text-xs uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="px-4 py-3 text-left font-semibold">Tên đề</th>
                <th className="px-4 py-3 text-left font-semibold">Level</th>
                <th className="px-4 py-3 text-right font-semibold">Số câu</th>
                <th className="px-4 py-3 text-right font-semibold">Thời lượng</th>
                <th className="px-4 py-3 text-left font-semibold">Nguồn đề</th>
                <th className="px-4 py-3 text-left font-semibold">Người tạo</th>
                <th className="px-4 py-3 text-center font-semibold">Phiên bản</th>
                <th className="px-4 py-3 text-left font-semibold">Trạng thái</th>
                <th className="px-4 py-3 text-left font-semibold">Cập nhật</th>
                <th className="px-4 py-3 text-right font-semibold">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((t) => {
                const st = paperStatus(t);
                const org = orgs.find((o) => o.id === (t.createdByOrgId ?? t.orgId));
                return (
                  <tr key={t.id} className="border-t border-border/60 align-middle">
                    <td className="px-4 py-3">
                      <div className="font-semibold text-foreground">{t.name}</div>
                      <div className="mt-0.5 text-xs text-muted-foreground">
                        {t.code ? `# ${t.code}` : "—"} {org ? `· ${org.name}` : ""}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="rounded-lg bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary">
                        {t.level}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums">{testQuestionCount(t)}</td>
                    <td className="px-4 py-3 text-right tabular-nums">
                      <span className="inline-flex items-center gap-1 text-muted-foreground">
                        <Clock className="h-3.5 w-3.5" /> {t.durationMinutes}′
                      </span>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {t.createdByRole === "teacher" ? "Giáo viên" : "Platform"}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {t.createdByName ?? t.createdBy ?? "—"}
                    </td>
                    <td className="px-4 py-3 text-center tabular-nums">v{testVersion(t)}</td>
                    <td className="px-4 py-3">
                      <span
                        className={cn(
                          "rounded-full px-2.5 py-1 text-xs font-semibold",
                          STATUS_COLOR[st],
                        )}
                      >
                        {STATUS_LABEL[st]}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">
                      {fmtDate(t.reviewedAt ?? t.createdAt)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap items-center justify-end gap-1.5">
                        <Link
                          to="/admin/tests/$testId/review"
                          params={{ testId: t.id }}
                          search={{ sim: undefined }}
                          className="inline-flex items-center gap-1 rounded-lg border border-border px-2 py-1 text-xs font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
                        >
                          <Eye className="h-3.5 w-3.5" /> Xem
                        </Link>
                        {(st === "draft" || st === "revise") && (
                          <>
                            <Link
                              to={scope === "admin" ? "/admin/tests/new" : "/teacher/tests/new"}
                              className="inline-flex items-center gap-1 rounded-lg border border-border px-2 py-1 text-xs font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
                            >
                              <PencilLine className="h-3.5 w-3.5" /> Sửa
                            </Link>
                            <button
                              onClick={() => submitForReview(t.id)}
                              className="inline-flex items-center gap-1 rounded-lg bg-primary/10 px-2 py-1 text-xs font-semibold text-primary hover:bg-primary/15"
                            >
                              <Send className="h-3.5 w-3.5" /> Gửi duyệt
                            </button>
                          </>
                        )}
                        {st === "pending" && (
                          <button
                            onClick={() => withdraw(t.id)}
                            className="inline-flex items-center gap-1 rounded-lg border border-border px-2 py-1 text-xs font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
                          >
                            <Undo2 className="h-3.5 w-3.5" /> Thu hồi
                          </button>
                        )}
                        {st === "approved" && (
                          <>
                            <Link
                              to={scope === "admin" ? "/admin/tests/sessions" : "/teacher/tests/sessions"}
                              search={{ testId: t.id }}
                              className="inline-flex items-center gap-1 rounded-lg bg-primary/10 px-2 py-1 text-xs font-semibold text-primary hover:bg-primary/15"
                            >
                              <CalendarClock className="h-3.5 w-3.5" /> Phân phối đề
                            </Link>
                            <button
                              onClick={() => newVersion(t)}
                              className="inline-flex items-center gap-1 rounded-lg border border-border px-2 py-1 text-xs font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
                            >
                              <GitBranch className="h-3.5 w-3.5" /> Phiên bản mới
                            </button>
                          </>
                        )}
                        <button
                          onClick={() => duplicate(t)}
                          className="inline-flex items-center gap-1 rounded-lg border border-border px-2 py-1 text-xs font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
                        >
                          <Copy className="h-3.5 w-3.5" /> Nhân bản
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {rows.length === 0 && (
                <tr>
                  <td colSpan={10} className="px-4 py-12 text-center text-sm text-muted-foreground">
                    Không có đề thi phù hợp bộ lọc.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-xs text-muted-foreground">
          Màn hình đề thi chỉ quản lý nội dung đề. Lớp áp dụng, giờ mở và giờ đóng được thiết lập tại
          tab <strong>Tổ chức thi</strong>.
        </p>
      </div>
    </div>
  );
}
