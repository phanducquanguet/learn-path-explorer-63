import { createFileRoute, Link, useNavigate, notFound } from "@tanstack/react-router";
import { useState } from "react";
import { TopNav } from "@/components/TopNav";
import { useRole } from "@/contexts/RoleContext";
import {
  getTest,
  approveTest,
  sendBackTest,
  testDisplayStatus,
  testQuestionCount,
  TEST_STATUS_LABEL,
} from "@/lib/tests-data";
import { classes } from "@/lib/teacher-data";
import { getOrg } from "@/lib/orgs";
import {
  SKILL_LABEL,
  TYPE_LABEL,
  DIFFICULTY_LABEL,
  type QDifficulty,
} from "@/lib/question-bank";
import { toast } from "sonner";
import {
  ArrowLeft,
  ShieldCheck,
  Undo2,
  PlayCircle,
  Building2,
  User,
  Calendar,
  Clock,
  Users,
  ListChecks,
  MessageSquare,
  AlertTriangle,
} from "lucide-react";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/admin/test-approvals/$testId")({
  head: ({ params }) => ({
    meta: [
      { title: `Duyệt đề ${params.testId} — UNICOM LMS` },
      {
        name: "description",
        content: "Chi tiết đề thi do giáo viên đề xuất theo đúng format đã tạo, kèm hành động duyệt.",
      },
      { property: "og:title", content: "Chi tiết đề thi chờ duyệt — UNICOM LMS" },
      {
        property: "og:description",
        content: "Xem cấu trúc đề, người đề xuất và đơn vị trước khi duyệt.",
      },
      { property: "og:type", content: "article" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: TestApprovalDetail,
});

const CURRENT_ADMIN = "admin.dung";

const dt = (iso: string) =>
  new Date(iso).toLocaleString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Asia/Ho_Chi_Minh",
  });

function TestApprovalDetail() {
  const { testId } = Route.useParams();
  const navigate = useNavigate();
  const test = getTest(testId);
  if (!test) throw notFound();
  const { role } = useRole();
  const [note, setNote] = useState("");

  const status = testDisplayStatus(test);
  const isPending = test.approvalStatus === "pending";
  const canReview = role === "admin" && isPending;
  const org = getOrg(test.createdByOrgId ?? test.orgId);
  const testOrg = getOrg(test.orgId);
  const cls = test.classIds.map((id) => classes.find((c) => c.id === id)?.name ?? id);

  const doApprove = () => {
    approveTest(test.id, CURRENT_ADMIN, note || undefined);
    toast.success("Đã duyệt đề thi", {
      description: `Đề "${test.name}" sẽ tự động mở lúc ${dt(test.openAt)}.`,
    });
    navigate({ to: "/admin/test-approvals" });
  };

  const doSendBack = () => {
    if (!note.trim()) {
      toast.error("Vui lòng nhập ghi chú để giáo viên biết cần sửa gì.");
      return;
    }
    sendBackTest(test.id, CURRENT_ADMIN, note);
    toast.warning("Đã trả lại đề cho giáo viên", {
      description: `Đề "${test.name}" chuyển về trạng thái Bản nháp.`,
    });
    navigate({ to: "/admin/test-approvals" });
  };

  return (
    <div className="min-h-screen bg-background">
      <TopNav />
      <div className="mx-auto max-w-5xl px-6 pb-20 pt-10 sm:px-8">
        <Link
          to="/admin/test-approvals"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" /> Trở lại danh sách duyệt đề
        </Link>

        <div className="mt-4 flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="rounded-lg bg-primary/10 px-2 py-1 font-bold uppercase text-primary">
                {test.level}
              </span>
              {test.code && (
                <span className="rounded-md bg-muted px-2 py-1 font-mono text-foreground/70">
                  # {test.code}
                </span>
              )}
              <span
                className={cn(
                  "rounded-full px-2 py-1 font-semibold",
                  status === "pending" && "bg-amber-100 text-amber-700",
                  status === "draft" && "bg-muted text-muted-foreground",
                  status === "approved" && "bg-indigo-100 text-indigo-700",
                  status === "open" && "bg-emerald-100 text-emerald-700",
                  status === "closed" && "bg-rose-100 text-rose-700",
                )}
              >
                {TEST_STATUS_LABEL[status]}
              </span>
            </div>
            <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight">{test.name}</h1>
            <p className="mt-1 max-w-2xl text-sm text-muted-foreground">{test.description}</p>
          </div>

          <Link
            to="/admin/tests/$testId/review"
            params={{ testId: test.id }}
            search={{ sim: 1 }}
            className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-background px-4 py-2.5 text-sm font-semibold hover:border-primary hover:text-primary"
          >
            <PlayCircle className="h-4 w-4" /> Xem như thí sinh
          </Link>
        </div>

        {/* Người đề xuất */}
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <div className="rounded-2xl border border-border bg-surface p-5 shadow-soft">
            <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Giáo viên đề xuất
            </div>
            <div className="mt-3 space-y-2 text-sm">
              <Row icon={User} label="Người đề xuất" value={test.createdByName ?? test.createdBy ?? "—"} />
              <Row icon={Building2} label="Đơn vị giáo viên" value={org?.name ?? "—"} />
              <Row icon={Building2} label="Đơn vị của đề" value={testOrg?.name ?? "—"} />
              <Row icon={Calendar} label="Gửi đề lúc" value={dt(test.createdAt)} />
            </div>
            {test.proposalNote && (
              <div className="mt-4 rounded-xl bg-muted/60 p-3 text-xs text-foreground/80">
                <div className="mb-1 inline-flex items-center gap-1 font-semibold">
                  <MessageSquare className="h-3.5 w-3.5" /> Ghi chú của giáo viên
                </div>
                {test.proposalNote}
              </div>
            )}
          </div>

          <div className="rounded-2xl border border-border bg-surface p-5 shadow-soft">
            <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Thiết lập đề thi
            </div>
            <div className="mt-3 space-y-2 text-sm">
              <Row icon={Clock} label="Thời lượng" value={`${test.durationMinutes} phút`} />
              <Row
                icon={ListChecks}
                label="Cấu trúc"
                value={`${testQuestionCount(test)} câu · ${test.structure.length} phần · ${
                  test.mode === "fixed" ? "Đề cố định" : "Đề trộn ngẫu nhiên"
                }`}
              />
              <Row icon={Calendar} label="Mở lúc" value={dt(test.openAt)} />
              <Row icon={Calendar} label="Đóng lúc" value={dt(test.closeAt)} />
              <Row icon={Users} label="Lớp áp dụng" value={cls.join(", ") || "—"} />
            </div>
          </div>
        </div>

        {test.reviewNote && (
          <div className="mt-4 flex items-start gap-2 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
            <div>
              <div className="font-semibold">Ghi chú duyệt trước đó</div>
              <p className="mt-0.5">{test.reviewNote}</p>
              {test.reviewedBy && (
                <p className="mt-1 text-xs opacity-80" suppressHydrationWarning>
                  {test.reviewedBy}
                  {test.reviewedAt ? ` · ${dt(test.reviewedAt)}` : ""}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Chi tiết format đề */}
        <h2 className="mt-8 font-display text-xl font-semibold tracking-tight">
          Chi tiết đề thi theo format đã tạo
        </h2>
        <div className="mt-3 space-y-3">
          {test.structure.map((s, i) => {
            const questions = [
              ...(s.customQuestions ?? []).map((q) => ({ id: q.id, content: q.content, points: q.points })),
              ...(s.customBank ?? []).map((q) => ({
                id: q.id,
                content: q.content,
                points: (q as { points?: number }).points,
              })),
            ];
            return (
              <div
                key={i}
                className="rounded-2xl border border-border bg-surface p-5 shadow-soft"
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span className="grid h-7 w-7 place-items-center rounded-lg bg-primary/10 text-xs font-bold text-primary">
                      {i + 1}
                    </span>
                    <span className="font-semibold">
                      Phần {i + 1} — {SKILL_LABEL[s.skill]}
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 text-[11px]">
                    <Tag>{s.type === "mixed" ? "Trộn nhiều dạng" : TYPE_LABEL[s.type]}</Tag>
                    <Tag>Trình độ {s.level}</Tag>
                    <Tag>
                      {s.difficulty && s.difficulty !== "mixed"
                        ? DIFFICULTY_LABEL[s.difficulty as QDifficulty]
                        : "Độ khó trộn"}
                    </Tag>
                    <Tag>{s.count} câu</Tag>
                    {s.sectionDurationMinutes != null && <Tag>{s.sectionDurationMinutes} phút</Tag>}
                  </div>
                </div>

                {s.tags && s.tags.length > 0 && (
                  <div className="mt-3 flex flex-wrap items-center gap-1 text-[11px] text-muted-foreground">
                    Tag:
                    {s.tags.map((t) => (
                      <span key={t} className="rounded bg-muted px-1.5 py-0.5 font-medium">
                        {t}
                      </span>
                    ))}
                  </div>
                )}

                {s.pickedIds && s.pickedIds.length > 0 && (
                  <div className="mt-3 text-xs text-muted-foreground">
                    Câu hỏi chọn thủ công:{" "}
                    <span className="font-mono text-foreground/80">{s.pickedIds.join(", ")}</span>
                  </div>
                )}

                {questions.length > 0 && (
                  <ol className="mt-3 space-y-2 text-sm">
                    {questions.map((q, qi) => (
                      <li key={q.id ?? qi} className="rounded-xl bg-muted/50 p-3">
                        <div className="flex items-start justify-between gap-3">
                          <span className="text-foreground/90">
                            {qi + 1}. {q.content}
                          </span>
                          {q.points != null && (
                            <span className="shrink-0 rounded bg-background px-1.5 py-0.5 text-[11px] font-semibold">
                              {q.points} điểm
                            </span>
                          )}
                        </div>
                      </li>
                    ))}
                  </ol>
                )}

                {questions.length === 0 && !s.pickedIds?.length && (
                  <p className="mt-3 text-xs text-muted-foreground">
                    Câu hỏi được bốc tự động từ ngân hàng câu hỏi theo tiêu chí trên khi thí sinh vào
                    thi.
                  </p>
                )}
              </div>
            );
          })}
        </div>

        {/* Hành động duyệt */}
        <div className="mt-8 rounded-2xl border border-border bg-surface p-5 shadow-soft">
          <div className="text-sm font-semibold">Quyết định duyệt</div>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={3}
            placeholder="Ghi chú cho giáo viên (bắt buộc khi trả lại chỉnh sửa)…"
            className="mt-3 w-full rounded-xl border border-border bg-background p-3 text-sm outline-none focus:border-primary"
          />
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <button
              onClick={doApprove}
              disabled={!canReview}
              className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-soft transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ShieldCheck className="h-4 w-4" /> Duyệt đề
            </button>
            <button
              onClick={doSendBack}
              disabled={!canReview}
              className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-background px-4 py-2.5 text-sm font-semibold transition hover:border-amber-400 hover:text-amber-700 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <Undo2 className="h-4 w-4" /> Trả lại chỉnh sửa
            </button>
            {!canReview && (
              <span className="text-xs text-muted-foreground">
                {role !== "admin"
                  ? "Chỉ quản trị viên mới được duyệt đề thi."
                  : "Đề này không ở trạng thái chờ duyệt."}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function Row({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start justify-between gap-3">
      <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
        <Icon className="h-3.5 w-3.5" /> {label}
      </span>
      <span className="text-right text-sm font-medium text-foreground" suppressHydrationWarning>
        {value}
      </span>
    </div>
  );
}

function Tag({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-md bg-muted px-2 py-0.5 font-semibold text-foreground/70">
      {children}
    </span>
  );
}
