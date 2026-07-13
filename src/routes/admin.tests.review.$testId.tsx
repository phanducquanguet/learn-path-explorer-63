import { createFileRoute, Link, useNavigate, notFound } from "@tanstack/react-router";
import { useState } from "react";
import { TopNav } from "@/components/TopNav";
import { useRole } from "@/contexts/RoleContext";
import { QuizRunner } from "@/components/QuizRunner";
import {
  getTest,
  approveTest,
  sendBackTest,
  testDisplayStatus,
  TEST_STATUS_LABEL,
} from "@/lib/tests-data";
import { classes } from "@/lib/teacher-data";
import { getOrg } from "@/lib/orgs";
import { SKILL_LABEL, TYPE_LABEL } from "@/lib/question-bank";
import { toast } from "sonner";
import {
  ArrowLeft,
  ShieldCheck,
  Undo2,
  Eye,
  Calendar,
  Clock,
  Users,
  Building2,
  User,
  AlertTriangle,
  ListChecks,
  X,
  PlayCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";

const LEVEL_HUE: Record<string, number> = {
  A1: 150,
  A2: 180,
  B1: 220,
  B2: 260,
  C1: 300,
  C2: 20,
};

export const Route = createFileRoute("/admin/tests/review/$testId")({
  head: ({ params }) => ({
    meta: [{ title: `Duyệt đề ${params.testId} — UNICOM LMS` }],
  }),
  validateSearch: (s: Record<string, unknown>) => ({
    sim: s.sim === 1 || s.sim === "1" ? 1 : undefined,
  }),
  component: ReviewPage,
});

// Người dùng hiện tại (giả lập). Trong LMS thật sẽ lấy từ session.
const CURRENT_ADMIN = "admin.dung";

function ReviewPage() {
  const { testId } = Route.useParams();
  const { sim } = Route.useSearch();
  const navigate = useNavigate();
  const test = getTest(testId);
  if (!test) throw notFound();
  const { role } = useRole();
  const isAdmin = role === "admin";

  const [note, setNote] = useState("");
  const [simOpen, setSimOpen] = useState(sim === 1);
  const hue = LEVEL_HUE[test.level] ?? 220;
  const status = testDisplayStatus(test);
  const isPending = test.approvalStatus === "pending";
  const isSelfCreated = test.createdBy === CURRENT_ADMIN;
  const canReview = isAdmin && isPending && !isSelfCreated;

  const cls = test.classIds.map((id) => classes.find((c) => c.id === id)?.name ?? id);
  const org = getOrg(test.orgId);
  const totalQuestions = test.structure.reduce((s, x) => s + x.count, 0);

  const doApprove = () => {
    approveTest(test.id, CURRENT_ADMIN, note || undefined);
    toast.success("Đã duyệt đề thi", {
      description: `Đề "${test.name}" sẽ tự động mở lúc ${new Date(test.openAt).toLocaleString("vi-VN")}.`,
    });
    navigate({ to: "/admin/tests" });
  };

  const doSendBack = () => {
    if (!note.trim()) {
      toast.error("Vui lòng nhập ghi chú trước khi trả lại chỉnh sửa.");
      return;
    }
    sendBackTest(test.id, CURRENT_ADMIN, note);
    toast.warning("Đã trả lại đề để chỉnh sửa", {
      description: `Đề "${test.name}" đã chuyển về trạng thái Bản nháp.`,
    });
    navigate({ to: "/admin/tests" });
  };

  return (
    <div className="min-h-screen bg-background">
      <TopNav />
      <div className="mx-auto max-w-5xl px-6 pb-20 pt-10 sm:px-8">
        <Link
          to="/admin/tests"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" /> Trở lại danh sách đề thi
        </Link>

        <div className="mt-4 flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs">
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
                  "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold",
                  status === "pending"
                    ? "bg-amber-100 text-amber-700"
                    : status === "approved"
                      ? "bg-sky-100 text-sky-700"
                      : status === "open"
                        ? "bg-emerald-100 text-emerald-700"
                        : status === "draft"
                          ? "bg-muted text-muted-foreground"
                          : "bg-rose-100 text-rose-700",
                )}
              >
                {TEST_STATUS_LABEL[status]}
              </span>
            </div>
            <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight">
              Duyệt đề: {test.name}
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">{test.description}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link
              to="/teacher/tests/$testId"
              params={{ testId: test.id }}
              className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-surface px-4 py-2.5 text-sm font-semibold text-foreground shadow-soft hover:bg-muted"
            >
              <Eye className="h-4 w-4" /> Xem tĩnh
            </Link>
            <button
              onClick={() => setSimOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-xl px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-soft hover:opacity-90"
              style={{ background: "var(--gradient-brand)" }}
            >
              <PlayCircle className="h-4 w-4" /> Mô phỏng làm bài & chấm
            </button>
          </div>
        </div>


        {isSelfCreated && (
          <div className="mt-5 flex items-start gap-2 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
            <div>
              <b>Bạn là người tạo đề này.</b> Vì lý do kiểm soát chéo, người tạo đề không thể tự
              duyệt đề của chính mình. Vui lòng nhờ một quản trị viên khác duyệt.
            </div>
          </div>
        )}

        <div className="mt-6 grid gap-4 lg:grid-cols-3">
          <div className="rounded-2xl border border-border bg-surface p-5 shadow-soft lg:col-span-2">
            <h2 className="text-sm font-semibold text-foreground">Thông tin đề</h2>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <Info icon={Building2} label="Đơn vị" value={org?.name ?? "—"} />
              <Info
                icon={Users}
                label="Lớp áp dụng"
                value={cls.join(", ") || "Chưa gán lớp"}
              />
              <Info
                icon={Calendar}
                label="Mở lúc"
                value={new Date(test.openAt).toLocaleString("vi-VN")}
              />
              <Info
                icon={Calendar}
                label="Đóng lúc"
                value={new Date(test.closeAt).toLocaleString("vi-VN")}
              />
              <Info icon={Clock} label="Thời lượng" value={`${test.durationMinutes} phút`} />
              <Info icon={ListChecks} label="Tổng câu hỏi" value={String(totalQuestions)} />
              <Info icon={User} label="Người tạo" value={test.createdBy ?? "—"} />
              <Info
                icon={ShieldCheck}
                label="Chế độ đề"
                value={test.mode === "random" ? "Bốc ngẫu nhiên" : "Cố định"}
              />
            </div>

            <h3 className="mt-6 text-sm font-semibold text-foreground">Cấu trúc đề</h3>
            <div className="mt-2 overflow-hidden rounded-xl border border-border">
              <table className="w-full text-sm">
                <thead className="bg-muted/40 text-xs uppercase tracking-wider text-muted-foreground">
                  <tr>
                    <th className="px-3 py-2 text-left">#</th>
                    <th className="px-3 py-2 text-left">Kỹ năng</th>
                    <th className="px-3 py-2 text-left">Loại câu hỏi</th>
                    <th className="px-3 py-2 text-center">Cấp độ</th>
                    <th className="px-3 py-2 text-center">Số câu</th>
                  </tr>
                </thead>
                <tbody>
                  {test.structure.map((s, i) => (
                    <tr key={i} className="border-t border-border">
                      <td className="px-3 py-2 text-muted-foreground">{i + 1}</td>
                      <td className="px-3 py-2 font-medium">{SKILL_LABEL[s.skill]}</td>
                      <td className="px-3 py-2 text-muted-foreground">
                        {s.type === "mixed" ? "Trộn" : TYPE_LABEL[s.type]}
                      </td>
                      <td className="px-3 py-2 text-center">
                        <span className="rounded bg-primary/10 px-2 py-0.5 text-[11px] font-bold text-primary">
                          {s.level}
                        </span>
                      </td>
                      <td className="px-3 py-2 text-center font-semibold">{s.count}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-surface p-5 shadow-soft">
            <h2 className="text-sm font-semibold text-foreground">Duyệt đề</h2>
            <p className="mt-1 text-xs text-muted-foreground">
              Sau khi duyệt, nếu chưa đến giờ mở, đề sẽ hiển thị{" "}
              <b>Đã duyệt</b>. Đến giờ mở sẽ tự chuyển sang <b>Đang mở</b>.
            </p>

            <label className="mt-4 block text-xs font-semibold text-foreground">
              Ghi chú (bắt buộc khi trả lại chỉnh sửa)
            </label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={4}
              placeholder="Nhận xét chung, gợi ý chỉnh sửa..."
              className="mt-1 w-full rounded-xl border border-border bg-background p-3 text-sm outline-none focus:border-primary"
            />

            <div className="mt-4 space-y-2">
              <button
                disabled={!canReview}
                onClick={doApprove}
                className="inline-flex w-full items-center justify-center gap-1.5 rounded-xl px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-soft disabled:cursor-not-allowed disabled:opacity-50"
                style={{ background: "var(--gradient-brand)" }}
              >
                <ShieldCheck className="h-4 w-4" /> Duyệt đề
              </button>
              <button
                disabled={!canReview}
                onClick={doSendBack}
                className="inline-flex w-full items-center justify-center gap-1.5 rounded-xl border border-border bg-background px-4 py-2.5 text-sm font-semibold text-foreground hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Undo2 className="h-4 w-4" /> Trả lại chỉnh sửa
              </button>
            </div>

            {!isPending && (
              <div className="mt-3 rounded-xl bg-muted/40 p-3 text-xs text-muted-foreground">
                Đề đang ở trạng thái <b>{TEST_STATUS_LABEL[status]}</b>, không cần duyệt lại.
              </div>
            )}

            {test.reviewedBy && (
              <div className="mt-3 rounded-xl border border-border bg-background p-3 text-xs text-muted-foreground">
                Lần duyệt gần nhất: <b className="text-foreground">{test.reviewedBy}</b> —{" "}
                {test.reviewedAt
                  ? new Date(test.reviewedAt).toLocaleString("vi-VN")
                  : ""}
                {test.reviewNote && (
                  <div className="mt-1 rounded-lg bg-muted/60 p-2 text-foreground">
                    “{test.reviewNote}”
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {simOpen && (
        <div className="fixed inset-0 z-50 flex flex-col bg-background/95 backdrop-blur-sm">
          <div className="flex items-center justify-between border-b border-border bg-surface px-6 py-3">
            <div className="flex items-center gap-3">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-2.5 py-1 text-[11px] font-semibold text-primary">
                <PlayCircle className="h-3.5 w-3.5" /> Mô phỏng làm bài
              </span>
              <div className="text-sm font-semibold text-foreground">{test.name}</div>
              {test.code && (
                <span className="rounded-md bg-muted px-2 py-0.5 font-mono text-[11px] text-foreground/70">
                  # {test.code}
                </span>
              )}
              <span className="hidden text-xs text-muted-foreground sm:inline">
                Trải nghiệm y hệt thí sinh · nộp bài để xem chấm điểm tự động
              </span>
            </div>
            <button
              onClick={() => setSimOpen(false)}
              className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-background px-3 py-1.5 text-xs font-semibold text-foreground hover:bg-muted"
            >
              <X className="h-3.5 w-3.5" /> Đóng mô phỏng
            </button>
          </div>
          <div className="flex-1 overflow-y-auto">
            <div className="mx-auto max-w-5xl px-6 py-8">
              <QuizRunner
                quizId={test.id}
                title={test.name}
                examCode={test.code}
                durationMinutes={test.durationMinutes}
                hue={hue}
                onExit={() => setSimOpen(false)}
              />

            </div>
          </div>
        </div>
      )}
    </div>
  );
}


function Info({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-border bg-background p-3">
      <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
        <Icon className="h-3 w-3" /> {label}
      </div>
      <div className="mt-1 text-sm font-semibold text-foreground">{value}</div>
    </div>
  );
}
