import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Clock,
  Search,
  
  Layers,
  Users,
  Eye,
  Sparkles,
  ArrowLeft,
  MessageSquare,
} from "lucide-react";
import { TopNav } from "@/components/TopNav";
import { classes as allClasses } from "@/lib/teacher-data";
import { levels } from "@/lib/lms-data";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

type ApprovalStatus = "draft" | "pending" | "approved" | "rejected";

type DraftNode = {
  id: string;
  kind: string;
  title?: string;
  description?: string;
  fileName?: string;
  duration?: number;
  children?: DraftNode[];
  questions?: unknown[];
};

type DraftUnit = {
  id: string;
  title?: string;
  desc?: string;
  nodes?: DraftNode[];
};

type DraftCourse = {
  id: string;
  title?: string;
  subtitle?: string;
  description?: string;
  thumbnail?: string;
  category?: string;
  levelCode?: string;
  hours?: number;
  units?: DraftUnit[];
  visibility?: "system" | "classes";
  classIds?: string[];
  createdBy?: "teacher" | "admin";
  approvalStatus?: ApprovalStatus;
  pendingVisibility?: "system" | "classes";
  pendingClassIds?: string[];
  submittedAt?: string;
  reviewedAt?: string;
  reviewerNote?: string;
};

const NODE_KIND_LABEL: Record<string, string> = {
  group: "Nhóm",
  video: "Video bài giảng",
  "video-speaking": "Luyện nói",
  pdf: "Tài liệu PDF",
  "pdf-audio": "PDF kèm audio",
  practice: "Bài thực hành",
  scorm: "Gói SCORM",
  h5p: "Gói H5P",
  question: "Câu hỏi",
};

const STORAGE_KEY = "unicom.uploaded.courses";

export const Route = createFileRoute("/admin/course-approvals")({
  head: () => ({
    meta: [
      { title: "Phê duyệt khóa học — UNICOM LMS" },
      {
        name: "description",
        content:
          "Admin xem xét và phê duyệt các khóa học do giáo viên đề xuất publish cho học viên.",
      },
    ],
  }),
  component: ApprovalsPage,
});

function ApprovalsPage() {
  const [drafts, setDrafts] = useState<DraftCourse[]>([]);
  const [query, setQuery] = useState("");
  const [tab, setTab] = useState<"pending" | "approved" | "rejected" | "all">("pending");
  const [reviewing, setReviewing] = useState<DraftCourse | null>(null);
  const [rejecting, setRejecting] = useState<DraftCourse | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      const existing: DraftCourse[] = raw ? JSON.parse(raw) : [];
      const hasTeacherDraft = existing.some((d) => d.createdBy === "teacher");
      if (!hasTeacherDraft) {
        const seeded = [...existing, ...buildDemoTeacherDrafts()];
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(seeded));
        setDrafts(seeded);
      } else {
        setDrafts(existing);
      }
    } catch {
      setDrafts([]);
    }
  }, []);


  const persist = (next: DraftCourse[]) => {
    setDrafts(next);
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {}
  };

  const updateDraft = (id: string, patch: Partial<DraftCourse>) =>
    persist(drafts.map((d) => (d.id === id ? { ...d, ...patch } : d)));

  const teacherDrafts = useMemo(
    () => drafts.filter((d) => d.createdBy === "teacher"),
    [drafts],
  );

  const counts = useMemo(
    () => ({
      pending: teacherDrafts.filter((d) => d.approvalStatus === "pending").length,
      approved: teacherDrafts.filter((d) => d.approvalStatus === "approved").length,
      rejected: teacherDrafts.filter((d) => d.approvalStatus === "rejected").length,
      all: teacherDrafts.length,
    }),
    [teacherDrafts],
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return teacherDrafts
      .filter((d) => (tab === "all" ? true : (d.approvalStatus ?? "draft") === tab))
      .filter((d) => {
        if (!q) return true;
        return `${d.title ?? ""} ${d.subtitle ?? ""} ${d.levelCode ?? ""}`
          .toLowerCase()
          .includes(q);
      })
      .sort((a, b) => (b.submittedAt ?? "").localeCompare(a.submittedAt ?? ""));
  }, [teacherDrafts, tab, query]);

  const approve = (d: DraftCourse) => {
    const visibility = d.pendingVisibility ?? d.visibility ?? "classes";
    const classIds =
      visibility === "classes" ? (d.pendingClassIds ?? d.classIds ?? []) : [];
    updateDraft(d.id, {
      visibility,
      classIds,
      approvalStatus: "approved",
      reviewedAt: new Date().toISOString(),
      pendingVisibility: undefined,
      pendingClassIds: undefined,
      reviewerNote: undefined,
    });
    setReviewing(null);
  };

  const reject = (d: DraftCourse, note: string) => {
    updateDraft(d.id, {
      approvalStatus: "rejected",
      reviewedAt: new Date().toISOString(),
      reviewerNote: note || "Không đạt yêu cầu.",
    });
    setRejecting(null);
    setReviewing(null);
  };

  return (
    <div className="min-h-screen bg-background">
      <TopNav />
      <div className="mx-auto max-w-7xl px-6 pb-20 pt-10 sm:px-8">
        <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
          <div className="flex flex-col gap-2">
            <span className="inline-flex w-fit items-center gap-2 text-xs font-semibold uppercase tracking-wider text-primary">
              <Sparkles className="h-3.5 w-3.5" /> Phê duyệt
            </span>
            <h1 className="font-display text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
              Duyệt khóa học của giáo viên
            </h1>
            <p className="text-sm text-muted-foreground">
              {counts.pending} chờ duyệt • {counts.approved} đã duyệt • {counts.rejected} bị từ
              chối
            </p>
          </div>
          <Link
            to="/courses"
            className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-border bg-surface px-3 text-sm font-medium text-foreground hover:bg-muted"
          >
            <ArrowLeft className="h-4 w-4" /> Về danh sách khóa học
          </Link>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-4">
          <Kpi label="Chờ duyệt" value={counts.pending} icon={Clock} tone="amber" />
          <Kpi label="Đã duyệt" value={counts.approved} icon={CheckCircle2} tone="emerald" />
          <Kpi label="Bị từ chối" value={counts.rejected} icon={XCircle} tone="red" />
          <Kpi label="Tổng đề xuất GV" value={counts.all} icon={ShieldCheck} />
        </div>

        <div className="mt-8 rounded-2xl border border-border bg-surface p-3 shadow-soft">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Tìm theo tên khóa, cấp độ..."
                className="h-10 w-full rounded-xl border border-border bg-background pl-9 pr-3 text-sm text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <div className="flex flex-wrap items-center gap-1 rounded-xl bg-muted/40 p-1">
              {([
                { key: "pending", label: "Chờ duyệt", count: counts.pending },
                { key: "approved", label: "Đã duyệt", count: counts.approved },
                { key: "rejected", label: "Bị từ chối", count: counts.rejected },
                { key: "all", label: "Tất cả", count: counts.all },
              ] as const).map((t) => (
                <button
                  key={t.key}
                  onClick={() => setTab(t.key)}
                  className={cn(
                    "inline-flex h-8 items-center gap-1.5 rounded-lg px-3 text-xs font-semibold transition",
                    tab === t.key
                      ? "bg-surface text-foreground shadow-soft"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  {t.label}
                  <span
                    className={cn(
                      "inline-flex h-5 min-w-[20px] items-center justify-center rounded-md px-1 text-[10px] font-bold",
                      tab === t.key
                        ? "bg-primary/10 text-primary"
                        : "bg-muted text-muted-foreground",
                    )}
                  >
                    {t.count}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-6 overflow-hidden rounded-2xl border border-border bg-surface shadow-soft">
          <table className="w-full text-sm">
            <thead className="bg-muted/40 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="px-4 py-3">Khóa học</th>
                <th className="px-4 py-3">Cấp độ</th>
                <th className="px-4 py-3">Đề xuất phạm vi</th>
                <th className="px-4 py-3">Gửi lúc</th>
                <th className="px-4 py-3">Trạng thái</th>
                <th className="px-4 py-3 text-right">Hành động</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-sm text-muted-foreground">
                    Không có khóa học phù hợp.
                  </td>
                </tr>
              )}
              {filtered.map((d) => {
                const lv = levels.find((l) => l.code === d.levelCode);
                const status = (d.approvalStatus ?? "draft") as ApprovalStatus;
                const scope = scopeSummary(d);
                return (
                  <tr key={d.id} className="border-t border-border">
                    <td className="px-4 py-3">
                      <div className="font-semibold text-foreground">
                        {d.title || "Khóa học chưa đặt tên"}
                      </div>
                      <div className="line-clamp-1 text-xs text-muted-foreground">
                        {d.subtitle || "—"}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">
                      {lv ? lv.code : d.levelCode || "—"}
                    </td>
                    <td className="px-4 py-3 text-xs">{scope}</td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">
                      {d.submittedAt ? new Date(d.submittedAt).toLocaleString("vi-VN") : "—"}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={status} />
                      {status === "rejected" && d.reviewerNote && (
                        <div className="mt-1 text-[11px] italic text-red-600">
                          "{d.reviewerNote}"
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-1.5">
                        <button
                          onClick={() => setReviewing(d)}
                          className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-border bg-surface px-2.5 text-xs font-semibold text-foreground hover:bg-muted"
                        >
                          <Eye className="h-3 w-3" /> Xem
                        </button>
                        {status === "pending" && (
                          <>
                            <button
                              onClick={() => approve(d)}
                              className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-emerald-600 px-2.5 text-xs font-semibold text-white hover:bg-emerald-700"
                            >
                              <CheckCircle2 className="h-3 w-3" /> Duyệt
                            </button>
                            <button
                              onClick={() => setRejecting(d)}
                              className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-red-200 bg-red-50 px-2.5 text-xs font-semibold text-red-600 hover:bg-red-100 dark:border-red-900/40 dark:bg-red-950/30"
                            >
                              <XCircle className="h-3 w-3" /> Từ chối
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Review dialog */}
      <Dialog open={!!reviewing} onOpenChange={(o) => !o && setReviewing(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle>Chi tiết khóa học đề xuất</DialogTitle>
            <DialogDescription>
              Xem qua thông tin và nội dung trước khi quyết định duyệt hoặc từ chối.
            </DialogDescription>
          </DialogHeader>
          {reviewing && (
            <div className="space-y-4 text-sm overflow-y-auto pr-1">
              <div className="rounded-xl border border-border bg-background p-4">
                <div className="text-base font-semibold text-foreground">
                  {reviewing.title || "Khóa học chưa đặt tên"}
                </div>
                <div className="text-xs text-muted-foreground">
                  {reviewing.subtitle || "—"}
                </div>
                {reviewing.description && (
                  <p className="mt-2 whitespace-pre-line text-xs text-muted-foreground">
                    {reviewing.description}
                  </p>
                )}
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs sm:grid-cols-4">
                <Meta icon={Layers} label="Cấp độ" value={reviewing.levelCode || "—"} />
                <Meta
                  icon={Users}
                  label="Số Units"
                  value={String(reviewing.units?.length ?? 0)}
                />
                <Meta
                  icon={Clock}
                  label="Giờ học"
                  value={`${reviewing.hours ?? 0}h`}
                />
                <Meta
                  icon={Sparkles}
                  label="Danh mục"
                  value={reviewing.category || "—"}
                />
              </div>
              <div className="rounded-xl border border-border bg-background p-3 text-xs">
                <div className="font-semibold text-foreground">Đề xuất phạm vi publish</div>
                <div className="mt-1 text-muted-foreground">{scopeSummary(reviewing)}</div>
              </div>

              <div className="rounded-xl border border-border bg-background">
                <div className="flex items-center justify-between border-b border-border px-4 py-2.5">
                  <div className="text-sm font-semibold text-foreground">
                    Nội dung chi tiết khóa học
                  </div>
                  <span className="text-[11px] text-muted-foreground">
                    {reviewing.units?.length ?? 0} Unit •{" "}
                    {reviewing.units?.reduce(
                      (s, u) => s + countNodes(u.nodes ?? []),
                      0,
                    ) ?? 0}{" "}
                    hoạt động
                  </span>
                </div>
                <div className="divide-y divide-border">
                  {(!reviewing.units || reviewing.units.length === 0) && (
                    <div className="px-4 py-6 text-center text-xs text-muted-foreground">
                      Khóa học chưa có Unit nào.
                    </div>
                  )}
                  {reviewing.units?.map((u, i) => (
                    <div key={u.id} className="px-4 py-3">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="text-sm font-semibold text-foreground">
                            {u.title || `Unit ${i + 1}`}
                          </div>
                          {u.desc && (
                            <div className="mt-0.5 text-xs text-muted-foreground">
                              {u.desc}
                            </div>
                          )}
                        </div>
                        <span className="inline-flex h-5 shrink-0 items-center rounded-md bg-muted px-2 text-[10px] font-semibold text-muted-foreground">
                          {countNodes(u.nodes ?? [])} hoạt động
                        </span>
                      </div>
                      {u.nodes && u.nodes.length > 0 && (
                        <ul className="mt-2 space-y-1">
                          {u.nodes.map((n) => (
                            <NodeRow key={n.id} node={n} depth={0} />
                          ))}
                        </ul>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {reviewing.approvalStatus === "rejected" && reviewing.reviewerNote && (
                <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-700 dark:border-red-900/40 dark:bg-red-950/30">
                  <span className="font-semibold">Lý do từ chối trước đó:</span>{" "}
                  {reviewing.reviewerNote}
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <button
              onClick={() => setReviewing(null)}
              className="inline-flex h-9 items-center rounded-lg border border-border bg-surface px-3 text-sm font-medium hover:bg-muted"
            >
              Đóng
            </button>
            {reviewing && reviewing.approvalStatus === "pending" && (
              <>
                <button
                  onClick={() => setRejecting(reviewing)}
                  className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-red-200 bg-red-50 px-3 text-sm font-semibold text-red-600 hover:bg-red-100 dark:border-red-900/40 dark:bg-red-950/30"
                >
                  <XCircle className="h-3.5 w-3.5" /> Từ chối
                </button>
                <button
                  onClick={() => approve(reviewing)}
                  className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-emerald-600 px-3 text-sm font-semibold text-white hover:bg-emerald-700"
                >
                  <CheckCircle2 className="h-3.5 w-3.5" /> Phê duyệt publish
                </button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>


      {/* Reject dialog */}
      <RejectDialog
        draft={rejecting}
        onClose={() => setRejecting(null)}
        onReject={reject}
      />
    </div>
  );
}

function scopeSummary(d: DraftCourse) {
  const v = d.pendingVisibility ?? d.visibility;
  const ids = d.pendingVisibility
    ? (d.pendingClassIds ?? [])
    : (d.classIds ?? []);
  if (!v) return "Chưa khai báo phạm vi";
  if (v === "system") return `Toàn bộ lớp cấp độ ${d.levelCode ?? ""}`;
  const names = allClasses
    .filter((c) => ids.includes(c.id))
    .map((c) => c.name);
  if (names.length === 0) return "Chưa chọn lớp nào";
  return `${names.length} lớp: ${names.join(", ")}`;
}

function countNodes(nodes: DraftNode[]): number {
  let n = 0;
  for (const node of nodes) {
    if (node.kind === "group") {
      n += countNodes(node.children ?? []);
    } else {
      n += 1;
    }
  }
  return n;
}

function NodeRow({ node, depth }: { node: DraftNode; depth: number }) {
  const label = NODE_KIND_LABEL[node.kind] ?? node.kind;
  const isGroup = node.kind === "group";
  const isPractice = node.kind === "practice";
  const childCount = isGroup
    ? (node.children?.length ?? 0)
    : isPractice
      ? (node.questions?.length ?? 0)
      : 0;
  return (
    <li>
      <div
        className="flex items-start gap-2 rounded-lg border border-border/60 bg-muted/30 px-2.5 py-1.5"
        style={{ marginLeft: depth * 14 }}
      >
        <span className="mt-0.5 inline-flex h-5 shrink-0 items-center rounded-md bg-primary/10 px-1.5 text-[10px] font-semibold uppercase tracking-wider text-primary">
          {label}
        </span>
        <div className="min-w-0 flex-1">
          <div className="truncate text-xs font-medium text-foreground">
            {node.title || "(không tên)"}
          </div>
          {node.description && (
            <div className="line-clamp-1 text-[11px] text-muted-foreground">
              {node.description}
            </div>
          )}
        </div>
        {node.fileName && (
          <span className="shrink-0 truncate text-[10px] text-muted-foreground">
            {node.fileName}
          </span>
        )}
        {isPractice && (
          <span className="shrink-0 text-[10px] text-muted-foreground">
            {childCount} câu hỏi
          </span>
        )}
        {typeof node.duration === "number" && !isGroup && !isPractice && (
          <span className="shrink-0 text-[10px] text-muted-foreground">
            {node.duration}'
          </span>
        )}
      </div>
      {isGroup && node.children && node.children.length > 0 && (
        <ul className="mt-1 space-y-1">
          {node.children.map((c) => (
            <NodeRow key={c.id} node={c} depth={depth + 1} />
          ))}
        </ul>
      )}
    </li>
  );
}




function StatusBadge({ status }: { status: ApprovalStatus }) {
  const map: Record<ApprovalStatus, { label: string; cls: string }> = {
    draft: { label: "Bản nháp", cls: "bg-slate-100 text-slate-700" },
    pending: { label: "Chờ duyệt", cls: "bg-amber-100 text-amber-700" },
    approved: { label: "Đã duyệt", cls: "bg-emerald-100 text-emerald-700" },
    rejected: { label: "Bị từ chối", cls: "bg-red-100 text-red-700" },
  };
  const s = map[status];
  return (
    <span
      className={cn(
        "inline-flex h-6 items-center rounded-md px-2 text-[11px] font-semibold uppercase tracking-wider",
        s.cls,
      )}
    >
      {s.label}
    </span>
  );
}

function Kpi({
  label,
  value,
  icon: Icon,
  tone,
}: {
  label: string;
  value: number;
  icon: typeof ShieldCheck;
  tone?: "emerald" | "amber" | "red";
}) {
  return (
    <div className="rounded-2xl border border-border bg-surface p-4 shadow-soft">
      <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
        <Icon className="h-3.5 w-3.5" /> {label}
      </div>
      <div
        className={cn(
          "mt-2 font-display text-2xl font-semibold",
          tone === "emerald" && "text-emerald-600",
          tone === "amber" && "text-amber-600",
          tone === "red" && "text-red-600",
          !tone && "text-foreground",
        )}
      >
        {value}
      </div>
    </div>
  );
}

function Meta({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Layers;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-border bg-background p-2.5">
      <div className="flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
        <Icon className="h-3 w-3" /> {label}
      </div>
      <div className="mt-0.5 text-sm font-semibold text-foreground">{value}</div>
    </div>
  );
}

function RejectDialog({
  draft,
  onClose,
  onReject,
}: {
  draft: DraftCourse | null;
  onClose: () => void;
  onReject: (d: DraftCourse, note: string) => void;
}) {
  const [note, setNote] = useState("");
  useEffect(() => {
    setNote("");
  }, [draft?.id]);

  return (
    <Dialog open={!!draft} onOpenChange={(o) => !o && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Từ chối khóa học</DialogTitle>
          <DialogDescription>
            Gửi lý do để giáo viên chỉnh sửa và gửi lại.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-2">
          <label className="text-xs font-semibold text-foreground">Lý do từ chối</label>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={4}
            placeholder="VD: Thiếu hoạt động luyện nghe, tài liệu chưa khớp cấp độ..."
            className="w-full rounded-xl border border-border bg-background p-3 text-sm text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
          />
          <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
            <MessageSquare className="h-3 w-3" /> Lý do sẽ hiển thị trên thẻ khóa học của giáo viên.
          </div>
        </div>
        <DialogFooter>
          <button
            onClick={onClose}
            className="inline-flex h-9 items-center rounded-lg border border-border bg-surface px-3 text-sm font-medium hover:bg-muted"
          >
            Hủy
          </button>
          <button
            onClick={() => draft && onReject(draft, note.trim())}
            disabled={!note.trim()}
            className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-red-600 px-3 text-sm font-semibold text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <XCircle className="h-3.5 w-3.5" /> Xác nhận từ chối
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function buildDemoTeacherDrafts(): DraftCourse[] {
  const now = Date.now();
  const submittedPending = new Date(now - 1000 * 60 * 60 * 6).toISOString(); // 6h trước
  const submittedRejected = new Date(now - 1000 * 60 * 60 * 48).toISOString(); // 2 ngày trước
  const reviewedRejected = new Date(now - 1000 * 60 * 60 * 24).toISOString();

  const demoClassIds = allClasses.slice(0, 2).map((c) => c.id);

  const pending: DraftCourse = {
    id: `demo-pending-${now}`,
    title: "English for Daily Communication",
    subtitle: "Khóa giao tiếp tiếng Anh cho người đi làm — 6 tuần",
    description:
      "Khóa học giúp học viên tự tin giao tiếp tiếng Anh trong các tình huống công sở và đời sống. Mỗi unit gồm video bài giảng, tài liệu PDF, bài luyện nói và quiz đánh giá cuối bài.",
    category: "Empower",
    levelCode: "A2",
    hours: 24,
    createdBy: "teacher",
    approvalStatus: "pending",
    submittedAt: submittedPending,
    pendingVisibility: "classes",
    pendingClassIds: demoClassIds,
    visibility: "classes",
    classIds: demoClassIds,
    units: [
      {
        id: "demo-u1",
        title: "Unit 1: Greetings & Self-introduction",
        desc: "Làm quen, chào hỏi và giới thiệu bản thân trong môi trường công sở.",
        nodes: [
          {
            id: "demo-u1-n1",
            kind: "video",
            title: "Video bài giảng: How to greet professionally",
            description: "12 phút video giảng giải các mẫu câu chào hỏi phổ biến.",
            duration: 12,
            fileName: "u1-greetings.mp4",
          },
          {
            id: "demo-u1-n2",
            kind: "pdf",
            title: "Tài liệu: Common greeting phrases",
            description: "Tổng hợp 30 mẫu câu chào hỏi và giới thiệu.",
            fileName: "u1-handout.pdf",
          },
          {
            id: "demo-u1-n3",
            kind: "video-speaking",
            title: "Luyện nói: Self introduction",
            description: "Học viên ghi âm phần giới thiệu bản thân trong 60 giây.",
            duration: 5,
          },
          {
            id: "demo-u1-n4",
            kind: "practice",
            title: "Quiz cuối Unit 1",
            description: "Đánh giá nhanh về từ vựng và mẫu câu vừa học.",
            questions: [{}, {}, {}, {}, {}, {}, {}, {}],
          },
        ],
      },
      {
        id: "demo-u2",
        title: "Unit 2: Talking about your job",
        desc: "Mô tả công việc, phòng ban và trách nhiệm hàng ngày.",
        nodes: [
          {
            id: "demo-u2-n1",
            kind: "video",
            title: "Video: Describing your role",
            duration: 10,
            fileName: "u2-role.mp4",
          },
          {
            id: "demo-u2-g1",
            kind: "group",
            title: "Tài liệu tham khảo",
            description: "PDF kèm audio để luyện nghe theo trang.",
            children: [
              {
                id: "demo-u2-g1-n1",
                kind: "pdf-audio",
                title: "Job vocabulary handbook",
                fileName: "u2-jobs.pdf",
              },
              {
                id: "demo-u2-g1-n2",
                kind: "h5p",
                title: "Tương tác: Match the job titles",
                fileName: "u2-match.h5p",
              },
            ],
          },
          {
            id: "demo-u2-n3",
            kind: "practice",
            title: "Bài thực hành Unit 2",
            questions: [{}, {}, {}, {}, {}, {}, {}, {}, {}, {}],
          },
        ],
      },
      {
        id: "demo-u3",
        title: "Unit 3: Meetings & Small talk",
        desc: "Tham gia họp, đặt câu hỏi và trò chuyện ngoài lề.",
        nodes: [
          {
            id: "demo-u3-n1",
            kind: "video",
            title: "Video: Joining a meeting",
            duration: 14,
            fileName: "u3-meeting.mp4",
          },
          {
            id: "demo-u3-n2",
            kind: "scorm",
            title: "Bài tương tác SCORM: Meeting roleplay",
            fileName: "u3-roleplay.zip",
          },
          {
            id: "demo-u3-n3",
            kind: "practice",
            title: "Quiz tổng kết",
            questions: [{}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}],
          },
        ],
      },
    ],
  };

  const rejected: DraftCourse = {
    id: `demo-rejected-${now}`,
    title: "Business Writing Essentials",
    subtitle: "Viết email và báo cáo công việc hiệu quả",
    description: "Khóa học cô đọng kỹ năng viết email, memo và báo cáo trong môi trường doanh nghiệp.",
    category: "Empower",
    levelCode: "B1",
    hours: 16,
    createdBy: "teacher",
    approvalStatus: "rejected",
    submittedAt: submittedRejected,
    reviewedAt: reviewedRejected,
    reviewerNote:
      "Nội dung Unit 2 còn thiếu phần bài tập thực hành. Vui lòng bổ sung quiz cuối bài trước khi gửi lại.",
    pendingVisibility: "classes",
    pendingClassIds: demoClassIds,
    visibility: "classes",
    classIds: demoClassIds,
    units: [
      {
        id: "demo-r-u1",
        title: "Unit 1: Email structure",
        desc: "Cấu trúc email công việc chuẩn.",
        nodes: [
          {
            id: "demo-r-u1-n1",
            kind: "video",
            title: "Video: Anatomy of a business email",
            duration: 9,
            fileName: "r-u1-email.mp4",
          },
          {
            id: "demo-r-u1-n2",
            kind: "pdf",
            title: "Template: Email samples",
            fileName: "r-u1-templates.pdf",
          },
        ],
      },
      {
        id: "demo-r-u2",
        title: "Unit 2: Writing reports",
        desc: "Cấu trúc báo cáo và cách trình bày số liệu.",
        nodes: [
          {
            id: "demo-r-u2-n1",
            kind: "video",
            title: "Video: Report structure",
            duration: 11,
            fileName: "r-u2-report.mp4",
          },
        ],
      },
    ],
  };

  return [pending, rejected];
}

