import { createFileRoute, Link, useNavigate, notFound } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  Building2,
  CheckCircle2,
  ChevronDown,
  Clock,
  FileText,
  Headphones,
  Layers,
  Mic,
  PlayCircle,
  ClipboardList,
  Package,
  Sparkles,
  Users,
  XCircle,
  Eye,
  Download,
} from "lucide-react";
import { TopNav } from "@/components/TopNav";
import { cn } from "@/lib/utils";
import { getOrg } from "@/lib/orgs";
import { classes as allClasses } from "@/lib/teacher-data";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

type ApprovalStatus = "draft" | "pending" | "approved" | "rejected";

type QuizQuestion = {
  q?: string;
  options?: string[];
  answer?: number;
  explain?: string;
};

type PdfPage = { page: number; heading?: string; body?: string };

type DraftNode = {
  id: string;
  kind: string;
  title?: string;
  description?: string;
  fileName?: string;
  duration?: number;
  children?: DraftNode[];
  questions?: QuizQuestion[];
  // Nội dung học liệu thật do giáo viên upload
  videoUrl?: string;
  thumbnail?: string;
  transcript?: string;
  pages?: PdfPage[];
  audioUrl?: string;
  prompt?: string;
  tips?: string[];
  sampleAnswer?: string;
  embedUrl?: string;
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
  orgId?: string;
  teacherName?: string;
  teacherEmail?: string;
  teacherPhone?: string;
  teacherNote?: string;
  createdBy?: "teacher" | "admin";
  approvalStatus?: ApprovalStatus;
  pendingVisibility?: "system" | "classes";
  pendingClassIds?: string[];
  submittedAt?: string;
  reviewedAt?: string;
  reviewerNote?: string;
};


const STORAGE_KEY = "unicom.uploaded.courses";

const KIND_META: Record<
  string,
  { label: string; icon: typeof PlayCircle; tone: string }
> = {
  video: { label: "Video bài giảng", icon: PlayCircle, tone: "text-rose-600 bg-rose-50" },
  "video-speaking": { label: "Luyện nói", icon: Mic, tone: "text-purple-600 bg-purple-50" },
  pdf: { label: "Tài liệu PDF", icon: FileText, tone: "text-blue-600 bg-blue-50" },
  "pdf-audio": { label: "PDF + Audio", icon: Headphones, tone: "text-cyan-600 bg-cyan-50" },
  practice: { label: "Bài thực hành", icon: ClipboardList, tone: "text-emerald-600 bg-emerald-50" },
  scorm: { label: "Gói SCORM", icon: Package, tone: "text-amber-600 bg-amber-50" },
  h5p: { label: "Gói H5P", icon: Sparkles, tone: "text-indigo-600 bg-indigo-50" },
  group: { label: "Nhóm", icon: Layers, tone: "text-slate-600 bg-slate-100" },
};

export const Route = createFileRoute("/admin/course-approvals/$draftId")({
  head: () => ({
    meta: [{ title: "Chi tiết khóa học đề xuất — UNICOM LMS" }],
  }),
  component: DraftDetailPage,
  notFoundComponent: () => (
    <div className="p-10 text-center text-muted-foreground">Không tìm thấy khóa học.</div>
  ),
});

function loadDrafts(): DraftCourse[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as DraftCourse[]) : [];
  } catch {
    return [];
  }
}

function flattenNodes(nodes: DraftNode[]): DraftNode[] {
  const out: DraftNode[] = [];
  for (const n of nodes) {
    if (n.kind === "group") out.push(...flattenNodes(n.children ?? []));
    else out.push(n);
  }
  return out;
}

function DraftDetailPage() {
  const { draftId } = Route.useParams();
  const navigate = useNavigate();
  const [drafts, setDrafts] = useState<DraftCourse[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [activeNodeId, setActiveNodeId] = useState<string | null>(null);
  const [openUnits, setOpenUnits] = useState<Record<string, boolean>>({});
  const [rejecting, setRejecting] = useState(false);
  const [note, setNote] = useState("");

  useEffect(() => {
    setDrafts(loadDrafts());
    setLoaded(true);
  }, []);

  const draft = useMemo(() => drafts.find((d) => d.id === draftId), [drafts, draftId]);

  useEffect(() => {
    if (!draft) return;
    const initial: Record<string, boolean> = {};
    (draft.units ?? []).forEach((u, i) => (initial[u.id] = i === 0));
    setOpenUnits(initial);
    const firstNode = flattenNodes(draft.units?.[0]?.nodes ?? [])[0];
    if (firstNode) setActiveNodeId(firstNode.id);
  }, [draft?.id]);

  if (!loaded) {
    return (
      <div className="min-h-screen bg-background">
        <TopNav />
        <div className="p-10 text-center text-sm text-muted-foreground">Đang tải...</div>
      </div>
    );
  }
  if (!draft) throw notFound();

  const persist = (next: DraftCourse[]) => {
    setDrafts(next);
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {}
  };
  const update = (patch: Partial<DraftCourse>) =>
    persist(drafts.map((d) => (d.id === draftId ? { ...d, ...patch } : d)));

  const approve = () => {
    const visibility = draft.pendingVisibility ?? draft.visibility ?? "classes";
    const classIds =
      visibility === "classes" ? (draft.pendingClassIds ?? draft.classIds ?? []) : [];
    update({
      visibility,
      classIds,
      approvalStatus: "approved",
      reviewedAt: new Date().toISOString(),
      pendingVisibility: undefined,
      pendingClassIds: undefined,
      reviewerNote: undefined,
    });
    navigate({ to: "/admin/course-approvals" });
  };

  const reject = () => {
    update({
      approvalStatus: "rejected",
      reviewedAt: new Date().toISOString(),
      reviewerNote: note.trim() || "Không đạt yêu cầu.",
    });
    setRejecting(false);
    navigate({ to: "/admin/course-approvals" });
  };

  const allNodes = (draft.units ?? []).flatMap((u) => flattenNodes(u.nodes ?? []));
  const activeNode = allNodes.find((n) => n.id === activeNodeId) ?? allNodes[0] ?? null;
  const org = getOrg(draft.orgId);
  const status = (draft.approvalStatus ?? "draft") as ApprovalStatus;
  const totalActivities = allNodes.length;

  const scopeText = (() => {
    const v = draft.pendingVisibility ?? draft.visibility;
    const ids = draft.pendingVisibility
      ? (draft.pendingClassIds ?? [])
      : (draft.classIds ?? []);
    if (!v) return "Chưa khai báo phạm vi";
    if (v === "system") return `Toàn bộ lớp cấp độ ${draft.levelCode ?? ""}`;
    const names = allClasses.filter((c) => ids.includes(c.id)).map((c) => c.name);
    if (names.length === 0) return "Chưa chọn lớp nào";
    return `${names.length} lớp: ${names.join(", ")}`;
  })();

  return (
    <div className="min-h-screen bg-background">
      <TopNav />
      <div className="mx-auto max-w-7xl px-6 pb-20 pt-8 sm:px-8">
        {/* Header */}
        <div className="flex flex-col gap-4">
          <Link
            to="/admin/course-approvals"
            className="inline-flex w-fit items-center gap-1.5 text-sm font-medium text-muted-foreground transition hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" /> Về danh sách duyệt
          </Link>

          <div className="flex flex-col gap-4 rounded-2xl border border-border bg-surface p-6 shadow-soft lg:flex-row lg:items-start lg:justify-between">
            <div className="flex-1 space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <StatusBadge status={status} />
                {org && (
                  <span className="inline-flex items-center gap-1 rounded-md bg-primary/10 px-2 py-0.5 text-[11px] font-semibold text-primary">
                    <Building2 className="h-3 w-3" /> {org.shortName}
                  </span>
                )}
                {draft.levelCode && (
                  <span className="inline-flex items-center gap-1 rounded-md bg-muted px-2 py-0.5 text-[11px] font-semibold text-muted-foreground">
                    <Layers className="h-3 w-3" /> {draft.levelCode}
                  </span>
                )}
                {draft.category && (
                  <span className="inline-flex items-center gap-1 rounded-md bg-muted px-2 py-0.5 text-[11px] font-semibold text-muted-foreground">
                    <Sparkles className="h-3 w-3" /> {draft.category}
                  </span>
                )}
              </div>
              <h1 className="font-display text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
                {draft.title || "Khóa học chưa đặt tên"}
              </h1>
              {draft.subtitle && (
                <p className="text-sm text-muted-foreground">{draft.subtitle}</p>
              )}
              {draft.description && (
                <p className="whitespace-pre-line text-sm text-muted-foreground">
                  {draft.description}
                </p>
              )}
              <div className="flex flex-wrap gap-4 pt-1 text-xs text-muted-foreground">
                <span className="inline-flex items-center gap-1">
                  <Users className="h-3.5 w-3.5" /> GV: {draft.teacherName || "—"}
                </span>
                <span className="inline-flex items-center gap-1">
                  <Layers className="h-3.5 w-3.5" /> {draft.units?.length ?? 0} Units
                </span>
                <span className="inline-flex items-center gap-1">
                  <ClipboardList className="h-3.5 w-3.5" /> {totalActivities} hoạt động
                </span>
                <span className="inline-flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5" /> {draft.hours ?? 0} giờ
                </span>
                <span className="inline-flex items-center gap-1">
                  <Eye className="h-3.5 w-3.5" /> Phạm vi: {scopeText}
                </span>
              </div>
            </div>

            {status === "pending" && (
              <div className="flex shrink-0 gap-2">
                <button
                  onClick={() => setRejecting(true)}
                  className="inline-flex h-10 items-center gap-1.5 rounded-xl border border-red-200 bg-red-50 px-4 text-sm font-semibold text-red-600 hover:bg-red-100 dark:border-red-900/40 dark:bg-red-950/30"
                >
                  <XCircle className="h-4 w-4" /> Từ chối
                </button>
                <button
                  onClick={approve}
                  className="inline-flex h-10 items-center gap-1.5 rounded-xl bg-emerald-600 px-4 text-sm font-semibold text-white hover:bg-emerald-700"
                >
                  <CheckCircle2 className="h-4 w-4" /> Phê duyệt publish
                </button>
              </div>
            )}
          </div>

          {status === "rejected" && draft.reviewerNote && (
            <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-700 dark:border-red-900/40 dark:bg-red-950/30">
              <span className="font-semibold">Lý do từ chối:</span> {draft.reviewerNote}
            </div>
          )}
        </div>

        {/* Sender info */}

        <div className="mt-4 rounded-2xl border border-border bg-surface p-5 shadow-soft">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary/10 text-base font-semibold text-primary">
                {(draft.teacherName || "GV")
                  .split(" ")
                  .slice(-2)
                  .map((w) => w[0])
                  .join("")
                  .toUpperCase()}
              </div>
              <div>
                <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Người gửi
                </div>
                <div className="text-sm font-semibold text-foreground">
                  {draft.teacherName || "—"}
                </div>
                <div className="text-xs text-muted-foreground">
                  {org?.name || "—"}
                  {draft.teacherEmail && <> • {draft.teacherEmail}</>}
                  {draft.teacherPhone && <> • {draft.teacherPhone}</>}
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 text-xs sm:flex sm:items-center sm:gap-6">
              <div>
                <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Ngày gửi
                </div>
                <div className="text-foreground">
                  {draft.submittedAt
                    ? new Date(draft.submittedAt).toLocaleString("vi-VN")
                    : "—"}
                </div>
              </div>
              {draft.reviewedAt && (
                <div>
                  <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Ngày xử lý
                  </div>
                  <div className="text-foreground">
                    {new Date(draft.reviewedAt).toLocaleString("vi-VN")}
                  </div>
                </div>
              )}
            </div>
          </div>
          {draft.teacherNote && (
            <div className="mt-4 rounded-xl border border-border bg-background p-3 text-xs">
              <div className="font-semibold text-foreground">Lời nhắn của giáo viên</div>
              <p className="mt-1 whitespace-pre-line text-muted-foreground">
                {draft.teacherNote}
              </p>
            </div>
          )}
        </div>


        {/* Body: sidebar + preview */}
        <div className="mt-6 grid gap-4 lg:grid-cols-[340px_1fr]">
          {/* Sidebar units */}
          <aside className="rounded-2xl border border-border bg-surface shadow-soft">
            <div className="border-b border-border px-4 py-3">
              <div className="text-sm font-semibold text-foreground">Nội dung khóa học</div>
              <div className="mt-0.5 text-[11px] text-muted-foreground">
                {draft.units?.length ?? 0} Unit • {totalActivities} hoạt động
              </div>
            </div>
            <div className="max-h-[70vh] overflow-y-auto p-2">
              {(!draft.units || draft.units.length === 0) && (
                <div className="px-3 py-8 text-center text-xs text-muted-foreground">
                  Khóa học chưa có Unit nào.
                </div>
              )}
              {draft.units?.map((u, i) => {
                const open = openUnits[u.id] ?? false;
                const nodes = flattenNodes(u.nodes ?? []);
                return (
                  <div key={u.id} className="mb-1">
                    <button
                      onClick={() =>
                        setOpenUnits((s) => ({ ...s, [u.id]: !open }))
                      }
                      className="flex w-full items-center justify-between gap-2 rounded-lg px-3 py-2 text-left transition hover:bg-muted"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="truncate text-sm font-semibold text-foreground">
                          {u.title || `Unit ${i + 1}`}
                        </div>
                        <div className="text-[11px] text-muted-foreground">
                          {nodes.length} hoạt động
                        </div>
                      </div>
                      <ChevronDown
                        className={cn(
                          "h-4 w-4 shrink-0 text-muted-foreground transition",
                          open && "rotate-180",
                        )}
                      />
                    </button>
                    {open && (
                      <ul className="mt-1 space-y-0.5 pl-2">
                        {nodes.map((n) => {
                          const meta = KIND_META[n.kind] ?? {
                            label: n.kind,
                            icon: FileText,
                            tone: "text-slate-600 bg-slate-100",
                          };
                          const Icon = meta.icon;
                          const isActive = activeNodeId === n.id;
                          return (
                            <li key={n.id}>
                              <button
                                onClick={() => setActiveNodeId(n.id)}
                                className={cn(
                                  "flex w-full items-start gap-2 rounded-lg px-2.5 py-1.5 text-left transition",
                                  isActive
                                    ? "bg-primary/10 text-primary"
                                    : "hover:bg-muted text-foreground",
                                )}
                              >
                                <span
                                  className={cn(
                                    "mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-md",
                                    meta.tone,
                                  )}
                                >
                                  <Icon className="h-3.5 w-3.5" />
                                </span>
                                <span className="min-w-0 flex-1">
                                  <span className="block truncate text-xs font-medium">
                                    {n.title || "(không tên)"}
                                  </span>
                                  <span className="block text-[10px] text-muted-foreground">
                                    {meta.label}
                                    {typeof n.duration === "number" && ` • ${n.duration}'`}
                                    {n.kind === "practice" &&
                                      ` • ${n.questions?.length ?? 0} câu`}
                                  </span>
                                </span>
                              </button>
                            </li>
                          );
                        })}
                        {nodes.length === 0 && (
                          <li className="px-3 py-2 text-[11px] text-muted-foreground">
                            Chưa có hoạt động
                          </li>
                        )}
                      </ul>
                    )}
                  </div>
                );
              })}
            </div>
          </aside>

          {/* Preview pane */}
          <section className="rounded-2xl border border-border bg-surface shadow-soft">
            {activeNode ? (
              <NodePreview node={activeNode} />
            ) : (
              <div className="flex h-64 items-center justify-center text-sm text-muted-foreground">
                Chọn một hoạt động bên trái để xem trước.
              </div>
            )}
          </section>
        </div>
      </div>

      {/* Reject dialog */}
      <Dialog open={rejecting} onOpenChange={(o) => !o && setRejecting(false)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Từ chối khóa học</DialogTitle>
            <DialogDescription>
              Gửi lý do để giáo viên chỉnh sửa và gửi lại.
            </DialogDescription>
          </DialogHeader>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={4}
            placeholder="VD: Thiếu hoạt động luyện nghe, tài liệu chưa khớp cấp độ..."
            className="w-full rounded-xl border border-border bg-background p-3 text-sm text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
          />
          <DialogFooter>
            <button
              onClick={() => setRejecting(false)}
              className="inline-flex h-9 items-center rounded-lg border border-border bg-surface px-3 text-sm font-medium hover:bg-muted"
            >
              Hủy
            </button>
            <button
              onClick={reject}
              disabled={!note.trim()}
              className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-red-600 px-3 text-sm font-semibold text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <XCircle className="h-3.5 w-3.5" /> Xác nhận từ chối
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function NodePreview({ node }: { node: DraftNode }) {
  const meta = KIND_META[node.kind] ?? {
    label: node.kind,
    icon: FileText,
    tone: "text-slate-600 bg-slate-100",
  };
  const Icon = meta.icon;

  return (
    <div className="flex flex-col">
      {/* Activity header */}
      <div className="flex items-start gap-3 border-b border-border px-6 py-4">
        <span
          className={cn(
            "inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl",
            meta.tone,
          )}
        >
          <Icon className="h-5 w-5" />
        </span>
        <div className="min-w-0 flex-1">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            {meta.label}
          </div>
          <div className="truncate text-base font-semibold text-foreground">
            {node.title || "(không tên)"}
          </div>
          {node.description && (
            <p className="mt-1 text-xs text-muted-foreground">{node.description}</p>
          )}
        </div>
        <div className="flex shrink-0 flex-col items-end gap-1 text-[11px] text-muted-foreground">
          {typeof node.duration === "number" && (
            <span className="inline-flex items-center gap-1">
              <Clock className="h-3 w-3" /> {node.duration} phút
            </span>
          )}
          {node.kind === "practice" && (
            <span>{node.questions?.length ?? 0} câu hỏi</span>
          )}
        </div>
      </div>

      {/* Preview body — render real content */}
      <div className="space-y-4 p-6">
        {(node.kind === "video" || node.kind === "video-speaking") && (
          <>
            <div className="aspect-video w-full overflow-hidden rounded-xl bg-slate-900 text-white">
              {node.videoUrl ? (
                <video
                  src={node.videoUrl}
                  poster={node.thumbnail}
                  controls
                  className="h-full w-full"
                />
              ) : (
                <div className="flex h-full flex-col items-center justify-center gap-2">
                  <PlayCircle className="h-14 w-14 opacity-80" />
                  <div className="text-sm opacity-80">
                    {node.fileName || "Video chưa có URL phát"}
                  </div>
                </div>
              )}
            </div>
            {node.transcript && (
              <div className="rounded-xl border border-border bg-background p-4">
                <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Transcript / Lời thoại
                </div>
                <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-foreground">
                  {node.transcript}
                </p>
              </div>
            )}
            {node.kind === "video-speaking" && node.prompt && (
              <div className="rounded-xl border border-purple-200 bg-purple-50/60 p-4 dark:border-purple-900/40 dark:bg-purple-950/20">
                <div className="text-[11px] font-semibold uppercase tracking-wider text-purple-700">
                  Yêu cầu luyện nói
                </div>
                <p className="mt-1 text-sm text-foreground">{node.prompt}</p>
                {node.tips && node.tips.length > 0 && (
                  <ul className="mt-2 list-disc space-y-1 pl-5 text-xs text-muted-foreground">
                    {node.tips.map((t, i) => (
                      <li key={i}>{t}</li>
                    ))}
                  </ul>
                )}
                {node.sampleAnswer && (
                  <div className="mt-3 rounded-lg border border-border bg-background p-3 text-xs">
                    <div className="font-semibold text-foreground">Bài mẫu của GV</div>
                    <p className="mt-1 whitespace-pre-line text-muted-foreground">
                      {node.sampleAnswer}
                    </p>
                  </div>
                )}
              </div>
            )}
          </>
        )}

        {(node.kind === "pdf" || node.kind === "pdf-audio") && (
          <>
            <div className="flex items-center justify-between rounded-xl border border-border bg-background px-4 py-3">
              <div className="flex items-center gap-2 text-sm">
                <FileText className="h-4 w-4 text-blue-600" />
                <span className="font-semibold text-foreground">
                  {node.fileName || "Tài liệu PDF"}
                </span>
                {node.pages && (
                  <span className="text-xs text-muted-foreground">
                    • {node.pages.length} trang
                  </span>
                )}
              </div>
              <button className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-border bg-surface px-3 text-xs font-semibold hover:bg-muted">
                <Download className="h-3 w-3" /> Tải xuống
              </button>
            </div>
            {node.kind === "pdf-audio" && node.audioUrl && (
              <audio src={node.audioUrl} controls className="w-full" />
            )}
            {node.pages && node.pages.length > 0 ? (
              <div className="space-y-3">
                {node.pages.map((p) => (
                  <article
                    key={p.page}
                    className="rounded-xl border border-border bg-background p-5"
                  >
                    <div className="flex items-center justify-between border-b border-border pb-2">
                      <h4 className="text-sm font-semibold text-foreground">
                        {p.heading || `Trang ${p.page}`}
                      </h4>
                      <span className="text-[10px] font-semibold text-muted-foreground">
                        Trang {p.page}
                      </span>
                    </div>
                    <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-foreground">
                      {p.body}
                    </p>
                  </article>
                ))}
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-border bg-muted/30 p-8 text-center text-xs text-muted-foreground">
                Tài liệu chưa có nội dung trích xuất để xem trước.
              </div>
            )}
          </>
        )}

        {node.kind === "practice" && (
          <div className="space-y-3">
            <div className="rounded-xl border border-border bg-background p-4">
              <div className="text-xs text-muted-foreground">
                Bài thực hành gồm{" "}
                <span className="font-semibold text-foreground">
                  {node.questions?.length ?? 0}
                </span>{" "}
                câu hỏi.
              </div>
            </div>
            <ol className="space-y-3">
              {(node.questions ?? []).map((q, i) => (
                <li
                  key={i}
                  className="rounded-xl border border-border bg-background p-4"
                >
                  <div className="text-sm font-semibold text-foreground">
                    Câu {i + 1}. {q.q || "(chưa có nội dung)"}
                  </div>
                  {q.options && q.options.length > 0 && (
                    <ul className="mt-2 space-y-1.5">
                      {q.options.map((opt, oi) => {
                        const isCorrect = q.answer === oi;
                        return (
                          <li
                            key={oi}
                            className={cn(
                              "flex items-start gap-2 rounded-lg border px-3 py-2 text-sm",
                              isCorrect
                                ? "border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-900/40 dark:bg-emerald-950/20"
                                : "border-border bg-muted/30 text-foreground",
                            )}
                          >
                            <span className="mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-md border border-border bg-surface text-[10px] font-bold">
                              {String.fromCharCode(65 + oi)}
                            </span>
                            <span className="flex-1">{opt}</span>
                            {isCorrect && (
                              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                            )}
                          </li>
                        );
                      })}
                    </ul>
                  )}
                  {q.explain && (
                    <div className="mt-2 rounded-lg bg-muted/40 px-3 py-2 text-xs text-muted-foreground">
                      <span className="font-semibold">Giải thích:</span> {q.explain}
                    </div>
                  )}
                </li>
              ))}
            </ol>
          </div>
        )}

        {(node.kind === "scorm" || node.kind === "h5p") && (
          <div className="rounded-xl border border-border bg-background p-6">
            <div className="flex items-center gap-3">
              <Package className="h-8 w-8 text-amber-600" />
              <div>
                <div className="text-sm font-semibold text-foreground">
                  Gói {node.kind.toUpperCase()}: {node.fileName || "(chưa có file)"}
                </div>
                <div className="text-xs text-muted-foreground">
                  Nội dung tương tác sẽ nhúng iframe khi học viên truy cập.
                </div>
              </div>
            </div>
            {node.embedUrl ? (
              <iframe
                src={node.embedUrl}
                title={node.title}
                className="mt-4 h-[420px] w-full rounded-lg border border-border bg-white"
              />
            ) : (
              <div className="mt-4 flex h-48 items-center justify-center rounded-lg border border-dashed border-border bg-muted/30 text-xs text-muted-foreground">
                Chưa có URL nhúng để xem trước.
              </div>
            )}
          </div>
        )}

        {!["video", "video-speaking", "pdf", "pdf-audio", "practice", "scorm", "h5p"].includes(
          node.kind,
        ) && (
          <div className="rounded-xl border border-dashed border-border bg-muted/30 p-8 text-center text-sm text-muted-foreground">
            {node.fileName || "Hoạt động chưa có nội dung xem trước."}
          </div>
        )}
      </div>

    </div>
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
