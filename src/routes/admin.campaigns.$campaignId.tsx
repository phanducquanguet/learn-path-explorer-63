import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowLeft, Users, ExternalLink, GraduationCap, Check, Mail, MailCheck, X, Copy, Award } from "lucide-react";
import { TopNav } from "@/components/TopNav";
import {
  assignAllPending,
  assignRegistrantToTrial,
  getCampaignById,
  type Campaign,
} from "@/lib/campaigns";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/campaigns/$campaignId")({
  head: () => ({ meta: [{ title: "Chi tiết chiến dịch — UNICOM LMS" }] }),
  component: CampaignDetail,
});

function CampaignDetail() {
  const { campaignId } = Route.useParams();
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [mailPreview, setMailPreview] = useState<null | { type: "verify" | "welcome"; name: string; email: string }>(null);

  const refresh = () => {
    const c = getCampaignById(campaignId);
    if (!c) throw notFound();
    setCampaign(c);
  };
  useEffect(() => {
    refresh();
    const h = () => refresh();
    window.addEventListener("unicom:campaigns-updated", h);
    return () => window.removeEventListener("unicom:campaigns-updated", h);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [campaignId]);

  if (!campaign) return null;

  const pending = campaign.registrants.filter((r) => !r.assignedClassId).length;

  return (
    <>
      <TopNav />
      <main className="min-h-screen bg-muted/20 px-6 py-8">
        <div className="mx-auto max-w-6xl space-y-6">
          <Link
            to="/admin/campaigns"
            className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" /> Chiến dịch
          </Link>

          <div className="flex flex-wrap items-start justify-between gap-4 rounded-2xl border border-border bg-surface p-5 shadow-soft">
            <div>
              <h1 className="font-display text-2xl font-bold">{campaign.name}</h1>
              <p className="mt-1 text-sm text-muted-foreground">{campaign.description}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {campaign.levels.map((lv) => (
                  <span
                    key={lv}
                    className="rounded-md border border-border bg-background px-2 py-0.5 text-xs font-medium"
                  >
                    {lv}
                  </span>
                ))}
              </div>
              <div className="mt-2 text-xs text-muted-foreground">
                Lớp trial gốc: <span className="font-semibold text-foreground">{campaign.trialClassName}</span>
              </div>
            </div>
            <div className="flex flex-col items-end gap-2">
              <Link
                to="/campaigns/$slug"
                params={{ slug: campaign.slug }}
                target="_blank"
                className="inline-flex items-center gap-1 rounded-lg border border-border bg-background px-3 py-1.5 text-xs font-semibold"
              >
                <ExternalLink className="h-3 w-3" /> Mở landing đăng ký
              </Link>
              {pending > 0 && (
                <button
                  onClick={() => {
                    assignAllPending(campaign.id);
                    toast.success(`Đã gán ${pending} học viên vào lớp trial.`);
                  }}
                  className="inline-flex items-center gap-1 rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground"
                >
                  <GraduationCap className="h-3 w-3" /> Gán tất cả vào lớp trial ({pending})
                </button>
              )}
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-surface shadow-soft">
            <div className="flex items-center gap-2 border-b border-border p-4">
              <Users className="h-4 w-4 text-primary" />
              <h2 className="font-semibold">Học viên đăng ký ({campaign.registrants.length})</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted/40 text-xs uppercase tracking-wider text-muted-foreground">
                  <tr>
                    <th className="px-4 py-3 text-left">Họ tên</th>
                    <th className="px-4 py-3 text-left">Email</th>
                    <th className="px-4 py-3 text-left">SĐT</th>
                    <th className="px-4 py-3 text-center">Trình độ</th>
                    <th className="px-4 py-3 text-left">Đăng ký lúc</th>
                    <th className="px-4 py-3 text-left">Lớp trial</th>
                    <th className="px-4 py-3 text-right">Hành động</th>
                  </tr>
                </thead>
                <tbody>
                  {campaign.registrants.map((r) => (
                    <tr key={r.id} className="border-t border-border">
                      <td className="px-4 py-3 font-medium">{r.fullName}</td>
                      <td className="px-4 py-3 text-muted-foreground">{r.email}</td>
                      <td className="px-4 py-3 text-muted-foreground">{r.phone}</td>
                      <td className="px-4 py-3 text-center">
                        <span className="rounded-md border border-border bg-background px-2 py-0.5 text-xs font-semibold">
                          {r.desiredLevel}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs text-muted-foreground">
                        {new Date(r.registeredAt).toLocaleString("vi-VN")}
                      </td>
                      <td className="px-4 py-3">
                        {r.assignedClassName ? (
                          <span className="inline-flex items-center gap-1 rounded-md bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700">
                            <Check className="h-3 w-3" /> {r.assignedClassName}
                          </span>
                        ) : (
                          <span className="text-xs text-muted-foreground">Chưa gán</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap justify-end gap-1.5">
                          <button
                            onClick={() =>
                              setMailPreview({ type: "verify", name: r.fullName, email: r.email })
                            }
                            className="inline-flex items-center gap-1 rounded-lg border border-border bg-background px-2.5 py-1.5 text-xs font-semibold hover:bg-muted"
                            title="Xem mẫu mail xác nhận đăng ký"
                          >
                            <Mail className="h-3 w-3" /> Mail xác nhận
                          </button>
                          <button
                            onClick={() =>
                              setMailPreview({ type: "welcome", name: r.fullName, email: r.email })
                            }
                            className="inline-flex items-center gap-1 rounded-lg border border-emerald-200 bg-emerald-50 px-2.5 py-1.5 text-xs font-semibold text-emerald-700 hover:bg-emerald-100"
                            title="Xem mẫu mail chúc mừng đăng ký thành công"
                          >
                            <MailCheck className="h-3 w-3" /> Mail chúc mừng
                          </button>
                          {!r.assignedClassId && (
                            <button
                              onClick={() => {
                                assignRegistrantToTrial(campaign.id, r.id);
                                toast.success(`Đã gán ${r.fullName} vào lớp trial.`);
                              }}
                              className="rounded-lg bg-foreground px-3 py-1.5 text-xs font-semibold text-background"
                            >
                              Gán vào lớp trial
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                  {campaign.registrants.length === 0 && (
                    <tr>
                      <td colSpan={7} className="px-4 py-10 text-center text-muted-foreground">
                        Chưa có học viên đăng ký. Chia sẻ link landing để bắt đầu thu thập.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="rounded-2xl border border-dashed border-border p-5 text-sm text-muted-foreground">
            💡 Sau khi được gán vào lớp trial, học viên có thể được giao đề thi giống như các lớp
            đã có. Vào <Link to="/admin/exams" className="font-semibold text-primary">Luyện thi</Link> hoặc{" "}
            <Link to="/admin/tests" className="font-semibold text-primary">Thi cử</Link> và chọn lớp trial tương ứng khi giao đề.
          </div>
        </div>
      </main>

      {mailPreview && (
        <MailPreviewModal
          data={mailPreview}
          campaignName={campaign.name}
          onClose={() => setMailPreview(null)}
        />
      )}
    </>
  );
}

function MailPreviewModal({
  data,
  campaignName,
  onClose,
}: {
  data: { type: "verify" | "welcome"; name: string; email: string };
  campaignName: string;
  onClose: () => void;
}) {
  const isVerify = data.type === "verify";
  const subject = isVerify
    ? `[UNICOM] Xác nhận đăng ký thi thử — ${campaignName}`
    : `[UNICOM] Chúc mừng! Tài khoản thi thử của bạn đã sẵn sàng`;

  const copySubject = () => {
    navigator.clipboard.writeText(subject).then(() => toast.success("Đã sao chép tiêu đề."));
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl overflow-hidden rounded-2xl bg-background shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-border px-5 py-3">
          <div className="flex items-center gap-2">
            {isVerify ? (
              <Mail className="h-4 w-4 text-primary" />
            ) : (
              <MailCheck className="h-4 w-4 text-emerald-600" />
            )}
            <h3 className="font-semibold">
              {isVerify ? "Mẫu mail xác nhận đăng ký" : "Mẫu mail chúc mừng đăng ký thành công"}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-3 border-b border-border bg-muted/30 px-5 py-3 text-xs">
          <div className="flex items-start justify-between gap-3">
            <div className="space-y-1">
              <div>
                <span className="text-muted-foreground">Đến: </span>
                <span className="font-semibold">{data.name}</span>{" "}
                <span className="text-muted-foreground">&lt;{data.email}&gt;</span>
              </div>
              <div>
                <span className="text-muted-foreground">Chủ đề: </span>
                <span className="font-semibold">{subject}</span>
              </div>
            </div>
            <button
              onClick={copySubject}
              className="inline-flex shrink-0 items-center gap-1 rounded-lg border border-border bg-background px-2 py-1 text-[11px] font-semibold hover:bg-muted"
            >
              <Copy className="h-3 w-3" /> Sao chép
            </button>
          </div>
        </div>

        <div className="max-h-[60vh] overflow-y-auto px-6 py-5 text-sm leading-relaxed">
          {isVerify ? (
            <div className="space-y-3">
              <p>Xin chào <strong>{data.name}</strong>,</p>
              <p>
                Cảm ơn bạn đã đăng ký tham gia chiến dịch thi thử{" "}
                <strong>{campaignName}</strong> tại UNICOM.
              </p>
              <p>
                Để hoàn tất đăng ký và để hệ thống gửi yêu cầu tới quản trị viên tạo tài khoản dự
                thi cho bạn, vui lòng bấm vào nút xác nhận bên dưới:
              </p>
              <div className="my-4 rounded-xl border border-border bg-muted/30 p-4 text-center">
                <a
                  href="#"
                  className="inline-block rounded-lg bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground"
                >
                  Xác nhận đăng ký thi thử
                </a>
                <p className="mt-2 text-[11px] text-muted-foreground">
                  Link xác nhận có hiệu lực trong 24 giờ.
                </p>
              </div>
              <p className="text-xs text-muted-foreground">
                Nếu bạn không thực hiện đăng ký này, vui lòng bỏ qua email.
              </p>
              <p>
                Trân trọng,<br />
                <strong>UNICOM Team</strong>
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              <p>Xin chào <strong>{data.name}</strong>,</p>
              <p>
                🎉 <strong>Chúc mừng!</strong> Bạn đã đăng ký thi thử{" "}
                <strong>{campaignName}</strong> thành công. Tài khoản dự thi của bạn đã được tạo:
              </p>
              <div className="my-4 space-y-2 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm">
                <div className="flex justify-between gap-4">
                  <span className="text-muted-foreground">Tài khoản</span>
                  <span className="font-mono font-semibold">{data.email}</span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-muted-foreground">Mật khẩu mặc định</span>
                  <span className="font-mono font-semibold">123456a@</span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-muted-foreground">Đường link thi</span>
                  <a
                    href="https://exam-portal.ubos.vn"
                    className="font-mono font-semibold text-primary"
                  >
                    exam-portal.ubos.vn
                  </a>
                </div>
              </div>
              <p>
                Bạn có thể đăng nhập và <strong>vào thi bất cứ khi nào</strong> tại{" "}
                <a href="https://exam-portal.ubos.vn" className="font-semibold text-primary">
                  exam-portal.ubos.vn
                </a>
                . Vui lòng đổi mật khẩu ngay sau lần đăng nhập đầu tiên để đảm bảo an toàn.
              </p>
              <p className="text-xs text-muted-foreground">
                Cần hỗ trợ? Trả lời email này hoặc liên hệ hotline của UNICOM.
              </p>
              <p>
                Chúc bạn làm bài tốt!<br />
                <strong>UNICOM Team</strong>
              </p>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-2 border-t border-border bg-muted/20 px-5 py-3">
          <button
            onClick={onClose}
            className="rounded-lg border border-border bg-background px-4 py-2 text-sm font-medium hover:bg-muted"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
}

