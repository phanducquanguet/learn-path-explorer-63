import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { TopNav } from "@/components/TopNav";
import {
  teacherProposedTests,
  testDisplayStatus,
  testQuestionCount,
  TEST_STATUS_LABEL,
  type TestDisplayStatus,
} from "@/lib/tests-data";
import { getOrg, orgs } from "@/lib/orgs";
import { classes } from "@/lib/teacher-data";
import {
  ShieldCheck,
  Building2,
  User,
  Clock,
  Calendar,
  ListChecks,
  Filter,
  Eye,
  Search,
} from "lucide-react";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/admin/test-approvals/")({
  head: () => ({
    meta: [
      { title: "Duyệt đề thi — UNICOM LMS" },
      {
        name: "description",
        content:
          "Danh sách đề thi do giáo viên đề xuất: thông tin người đề xuất, đơn vị, cấu trúc đề và trạng thái duyệt.",
      },
      { property: "og:title", content: "Duyệt đề thi — UNICOM LMS" },
      {
        property: "og:description",
        content: "Quản trị viên xem và duyệt các đề thi do giáo viên đề xuất.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: TestApprovalsList,
});

const STATUS_PILL: Record<TestDisplayStatus, string> = {
  draft: "bg-muted text-muted-foreground",
  pending: "bg-amber-100 text-amber-700",
  approved: "bg-indigo-100 text-indigo-700",
  open: "bg-emerald-100 text-emerald-700",
  closed: "bg-rose-100 text-rose-700",
};

const dt = (iso: string) =>
  new Date(iso).toLocaleString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Asia/Ho_Chi_Minh",
  });

function TestApprovalsList() {
  const rows = useMemo(() => teacherProposedTests(), []);
  const [status, setStatus] = useState<"all" | TestDisplayStatus>("pending");
  const [orgFilter, setOrgFilter] = useState<string>("all");
  const [q, setQ] = useState("");

  const counts = useMemo(() => {
    const c: Record<string, number> = { all: rows.length };
    for (const t of rows) {
      const s = testDisplayStatus(t);
      c[s] = (c[s] ?? 0) + 1;
    }
    return c;
  }, [rows]);

  const filtered = useMemo(
    () =>
      rows.filter((t) => {
        if (status !== "all" && testDisplayStatus(t) !== status) return false;
        if (orgFilter !== "all" && (t.createdByOrgId ?? t.orgId) !== orgFilter) return false;
        const needle = q.trim().toLowerCase();
        if (
          needle &&
          !`${t.name} ${t.code ?? ""} ${t.createdByName ?? ""}`.toLowerCase().includes(needle)
        )
          return false;
        return true;
      }),
    [rows, status, orgFilter, q],
  );

  return (
    <div className="min-h-screen bg-background">
      <TopNav />
      <div className="mx-auto max-w-7xl px-6 pb-20 pt-10 sm:px-8">
        <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-primary">
          <ShieldCheck className="h-3.5 w-3.5" /> Kiểm duyệt nội dung
        </span>
        <h1 className="mt-1 font-display text-3xl font-semibold tracking-tight sm:text-4xl">
          Duyệt đề thi
        </h1>
        <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
          Các đề thi do giáo viên đề xuất. Xem chi tiết đề theo đúng format đã tạo trước khi duyệt
          hoặc trả lại để chỉnh sửa.
        </p>

        <div className="mt-6 grid gap-3 sm:grid-cols-4">
          <Stat label="Tổng đề đề xuất" value={counts.all ?? 0} />
          <Stat label="Chờ duyệt" value={counts.pending ?? 0} accent="amber" />
          <Stat label="Đã duyệt / Đang mở" value={(counts.approved ?? 0) + (counts.open ?? 0)} accent="emerald" />
          <Stat label="Đã trả lại (nháp)" value={counts.draft ?? 0} />
        </div>

        {/* Filters */}
        <div className="mt-6 flex flex-wrap items-center gap-3 rounded-2xl border border-border bg-surface px-4 py-3">
          <div className="inline-flex items-center gap-2 text-xs font-semibold text-muted-foreground">
            <Filter className="h-3.5 w-3.5" /> Lọc:
          </div>
          <div className="inline-flex flex-wrap items-center gap-1">
            {(["pending", "approved", "open", "draft", "closed", "all"] as const).map((s) => (
              <button
                key={s}
                onClick={() => setStatus(s)}
                className={cn(
                  "rounded-lg px-2.5 py-1 text-xs font-semibold transition",
                  status === s
                    ? "bg-foreground text-background"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {s === "all" ? "Tất cả" : TEST_STATUS_LABEL[s]} ({counts[s] ?? 0})
              </button>
            ))}
          </div>
          <div className="h-5 w-px bg-border" />
          <select
            value={orgFilter}
            onChange={(e) => setOrgFilter(e.target.value)}
            className="h-8 rounded-lg border border-border bg-background px-2 text-xs font-medium outline-none focus:border-primary"
          >
            <option value="all">Tất cả đơn vị</option>
            {orgs.map((o) => (
              <option key={o.id} value={o.id}>
                {o.name}
              </option>
            ))}
          </select>
          <div className="ml-auto inline-flex h-8 items-center gap-2 rounded-lg border border-border bg-background px-2">
            <Search className="h-3.5 w-3.5 text-muted-foreground" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Tìm tên đề, mã đề, giáo viên…"
              className="w-56 bg-transparent text-xs outline-none placeholder:text-muted-foreground"
            />
          </div>
        </div>

        {/* Table */}
        <div className="mt-6 overflow-hidden rounded-2xl border border-border bg-surface shadow-soft">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/50 text-xs uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold">Đề thi</th>
                  <th className="px-4 py-3 text-left font-semibold">Giáo viên đề xuất</th>
                  <th className="px-4 py-3 text-left font-semibold">Đơn vị</th>
                  <th className="px-4 py-3 text-left font-semibold">Cấu trúc</th>
                  <th className="px-4 py-3 text-left font-semibold">Lịch thi</th>
                  <th className="px-4 py-3 text-left font-semibold">Trạng thái</th>
                  <th className="px-4 py-3 text-right font-semibold">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map((t) => {
                  const s = testDisplayStatus(t);
                  const org = getOrg(t.createdByOrgId ?? t.orgId);
                  const cls = t.classIds
                    .map((id) => classes.find((c) => c.id === id)?.name ?? id)
                    .join(", ");
                  return (
                    <tr key={t.id} className="align-top transition hover:bg-muted/30">
                      <td className="px-4 py-3">
                        <Link
                          to="/admin/test-approvals/$testId"
                          params={{ testId: t.id }}
                          className="font-medium text-foreground hover:text-primary"
                        >
                          {t.name}
                        </Link>
                        <div className="mt-1 flex items-center gap-2 text-[11px] text-muted-foreground">
                          {t.code && (
                            <span className="rounded bg-muted px-1.5 py-0.5 font-mono"># {t.code}</span>
                          )}
                          <span>{cls}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center gap-1.5 text-foreground">
                          <User className="h-3.5 w-3.5 text-muted-foreground" />
                          {t.createdByName ?? t.createdBy}
                        </span>
                        <div className="mt-1 text-[11px] text-muted-foreground" suppressHydrationWarning>
                          Gửi lúc {dt(t.createdAt)}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center gap-1.5 rounded-md bg-muted px-2 py-0.5 text-[11px] font-medium">
                          <Building2 className="h-3 w-3" /> {org?.name ?? "—"}
                        </span>
                        {org?.city && (
                          <div className="mt-1 text-[11px] text-muted-foreground">{org.city}</div>
                        )}
                      </td>
                      <td className="px-4 py-3 text-xs text-muted-foreground">
                        <span className="inline-flex items-center gap-1 text-foreground">
                          <ListChecks className="h-3.5 w-3.5" /> {testQuestionCount(t)} câu ·{" "}
                          {t.structure.length} phần
                        </span>
                        <div className="mt-1 inline-flex items-center gap-1">
                          <Clock className="h-3 w-3" /> {t.durationMinutes} phút ·{" "}
                          {t.mode === "fixed" ? "Đề cố định" : "Đề trộn"}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-xs" suppressHydrationWarning>
                        <div className="inline-flex items-center gap-1 text-emerald-600">
                          <Calendar className="h-3 w-3" /> {dt(t.openAt)}
                        </div>
                        <div className="mt-1 text-rose-600">{dt(t.closeAt)}</div>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={cn(
                            "inline-flex rounded-full px-2 py-1 text-[11px] font-semibold",
                            STATUS_PILL[s],
                          )}
                        >
                          {TEST_STATUS_LABEL[s]}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Link
                          to="/admin/test-approvals/$testId"
                          params={{ testId: t.id }}
                          className={cn(
                            "inline-flex items-center gap-1 rounded-lg border px-2.5 py-1 text-[11px] font-semibold transition",
                            s === "pending"
                              ? "border-primary bg-primary text-primary-foreground hover:opacity-90"
                              : "border-border bg-background text-foreground hover:border-primary hover:text-primary",
                          )}
                        >
                          {s === "pending" ? (
                            <>
                              <ShieldCheck className="h-3 w-3" /> Duyệt đề
                            </>
                          ) : (
                            <>
                              <Eye className="h-3 w-3" /> Chi tiết
                            </>
                          )}
                        </Link>
                      </td>
                    </tr>
                  );
                })}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-4 py-12 text-center text-sm text-muted-foreground">
                      Không có đề thi nào khớp bộ lọc.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

function Stat({
  label,
  value,
  accent,
}: {
  label: string;
  value: number | string;
  accent?: "amber" | "emerald";
}) {
  return (
    <div className="rounded-2xl border border-border bg-surface p-4 shadow-soft">
      <div className="text-xs font-medium text-muted-foreground">{label}</div>
      <div
        className={cn(
          "mt-1 font-display text-2xl font-semibold tracking-tight",
          accent === "amber" && "text-amber-600",
          accent === "emerald" && "text-emerald-600",
          !accent && "text-foreground",
        )}
      >
        {value}
      </div>
    </div>
  );
}
