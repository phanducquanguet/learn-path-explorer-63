import { useMemo, useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { TopNav } from "@/components/TopNav";
import { PageHeader } from "@/components/PageHeader";
import {
  tests as seedTests,
  testQuestionCount,
  testTotalPoints,
  type Test,
  type TestApprovalStatus,
} from "@/lib/tests-data";
import { type AssessmentScope } from "@/components/assessment/AssessmentTabs";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  FileText,
  Plus,
  Send,
  Copy,
  Eye,
  PencilLine,
  Files,
  Trash2,
  Clock,
  MoreHorizontal,
  ChevronDown,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

/** Trạng thái duyệt hiển thị ở màn hình Đề thi. */
type PaperStatus = TestApprovalStatus;

const STATUS_LABEL: Record<PaperStatus, string> = {
  draft: "Bản nháp",
  pending: "Chờ duyệt",
  approved: "Đã duyệt",
};

const STATUS_COLOR: Record<PaperStatus, string> = {
  draft: "bg-muted text-muted-foreground",
  pending: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  approved: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
};

function paperStatus(t: Test): PaperStatus {
  return t.approvalStatus ?? "approved";
}

function newCode(base?: string) {
  const suffix = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `${(base ?? "TEST").split("-").slice(0, 3).join("-")}-${suffix}`;
}

export function PapersList({ scope = "admin" }: { scope?: AssessmentScope } = {}) {
  const navigate = useNavigate();
  const [papers, setPapers] = useState<Test[]>(() =>
    seedTests.filter((t) => !t.id.includes("-sim-")),
  );
  const [status, setStatus] = useState<PaperStatus | "all">("all");
  const [query, setQuery] = useState("");

  const editPath = scope === "admin" ? "/admin/tests/new" : "/teacher/tests/new";

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
      approved: by("approved"),
    };
  }, [visible]);

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return visible.filter((t) => {
      if (status !== "all" && paperStatus(t) !== status) return false;
      if (q && !`${t.name} ${t.code ?? ""}`.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [visible, status, query]);

  function submitForReview(id: string) {
    setPapers((prev) =>
      prev.map((t) => (t.id === id ? { ...t, approvalStatus: "pending", reviewNote: undefined } : t)),
    );
    toast.success("Đã gửi đề cho Admin Platform duyệt");
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
    toast.success("Đã sao chép đề — bản sao ở trạng thái Bản nháp");
  }

  function similarPaper(t: Test) {
    const code = newCode(t.code);
    const next: Test = {
      ...t,
      id: `${t.id}-alt-${Math.random().toString(36).slice(2, 7)}`,
      code,
      name: `${t.name} — mã ${code}`,
      approvalStatus: "draft",
      reviewNote: undefined,
      copiedFromId: t.id,
    };
    setPapers((prev) => [next, ...prev]);
    toast.success(`Đã tạo đề tương tự với mã đề mới: ${code}`);
  }

  function remove(t: Test) {
    setPapers((prev) => prev.filter((p) => p.id !== t.id));
    toast.success("Đã xóa đề thi");
  }

  const statCards: { key: PaperStatus | "all"; label: string; value: number }[] = [
    { key: "all", label: "Tổng số đề", value: counts.total },
    { key: "draft", label: "Bản nháp", value: counts.draft },
    { key: "pending", label: "Chờ duyệt", value: counts.pending },
    { key: "approved", label: "Đã duyệt", value: counts.approved },
  ];

  return (
    <div className="min-h-screen bg-background">
      <TopNav />
      <div className="mx-auto max-w-7xl px-6 pb-20 pt-10 sm:px-8">
        <PageHeader
          eyebrow="Quản lý đề thi"
          eyebrowIcon={FileText}
          title="Quản lý đề thi"
          description="Quản lý nội dung đề thi, trạng thái duyệt và phiên bản đề."
          actions={
            <Link
              to={editPath}
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
        />

        <div className="mt-6 flex flex-wrap items-center gap-2">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Tìm theo tên đề, mã đề…"
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
          <table className="w-full min-w-[900px] text-sm">
            <thead className="bg-muted/50 text-xs uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="px-4 py-3 text-left font-semibold">Mã</th>
                <th className="px-4 py-3 text-left font-semibold">Tên đề</th>
                <th className="px-4 py-3 text-right font-semibold">Số câu hỏi</th>
                <th className="px-4 py-3 text-right font-semibold">Tổng điểm</th>
                <th className="px-4 py-3 text-right font-semibold">Thời gian làm bài</th>
                <th className="px-4 py-3 text-left font-semibold">Level</th>
                <th className="px-4 py-3 text-left font-semibold">Trạng thái</th>
                <th className="px-4 py-3 text-right font-semibold">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((t) => {
                const st = paperStatus(t);
                return (
                  <tr key={t.id} className="border-t border-border/60 align-middle">
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="font-mono text-xs text-muted-foreground">
                          {t.code ?? "—"}
                        </span>
                        {t.altCodes && t.altCodes.length > 0 && (
                          <Popover>
                            <PopoverTrigger asChild>
                              <button
                                type="button"
                                className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary hover:bg-primary/20"
                              >
                                +{t.altCodes.length} mã đề
                                <ChevronDown className="h-3 w-3" />
                              </button>
                            </PopoverTrigger>
                            <PopoverContent align="start" className="w-56 p-2">
                              <p className="mb-1.5 text-xs font-medium text-muted-foreground">
                                Các mã đề con
                              </p>
                              <div className="flex flex-wrap gap-1">
                                {t.altCodes.map((code) => (
                                  <span
                                    key={code}
                                    className="rounded-md bg-muted px-2 py-1 font-mono text-xs text-foreground"
                                  >
                                    {code}
                                  </span>
                                ))}
                              </div>
                            </PopoverContent>
                          </Popover>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 font-semibold text-foreground">{t.name}</td>
                    <td className="px-4 py-3 text-right tabular-nums">{testQuestionCount(t)}</td>
                    <td className="px-4 py-3 text-right tabular-nums">{testTotalPoints(t)}</td>
                    <td className="px-4 py-3 text-right tabular-nums">
                      <span className="inline-flex items-center gap-1 text-muted-foreground">
                        <Clock className="h-3.5 w-3.5" /> {t.durationMinutes}′
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="rounded-lg bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary">
                        {t.level}
                      </span>
                    </td>
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
                    <td className="px-4 py-3">
                      <div className="flex justify-end">
                        <DropdownMenu>
                          <DropdownMenuTrigger
                            aria-label="Thao tác"
                            className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-border text-muted-foreground hover:bg-muted hover:text-foreground"
                          >
                            <MoreHorizontal className="h-4 w-4" />
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-52">
                            <DropdownMenuItem
                              onClick={() =>
                                navigate({
                                  to: "/admin/tests/$testId/review",
                                  params: { testId: t.id },
                                  search: { sim: undefined },
                                })
                              }
                            >
                              <Eye className="mr-2 h-4 w-4" /> Xem đề
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => navigate({ to: editPath })}>
                              <PencilLine className="mr-2 h-4 w-4" /> Sửa
                            </DropdownMenuItem>
                            {st === "draft" && (
                              <DropdownMenuItem onClick={() => submitForReview(t.id)}>
                                <Send className="mr-2 h-4 w-4" /> Gửi duyệt
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => duplicate(t)}>
                              <Copy className="mr-2 h-4 w-4" /> Sao chép
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => similarPaper(t)}>
                              <Files className="mr-2 h-4 w-4" /> Tạo đề tương tự
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-destructive focus:text-destructive"
                              onClick={() => remove(t)}
                            >
                              <Trash2 className="mr-2 h-4 w-4" /> Xóa
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {rows.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center text-sm text-muted-foreground">
                    Không có đề thi phù hợp bộ lọc.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-xs text-muted-foreground">
          Màn hình đề thi chỉ quản lý nội dung đề. Lớp áp dụng, giờ mở và giờ đóng được thiết lập tại
          tab <strong>Phân phối đề thi</strong>.
        </p>
      </div>
    </div>
  );
}
