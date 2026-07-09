import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowLeft, Users, ExternalLink, GraduationCap, Check } from "lucide-react";
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
                      <td className="px-4 py-3 text-right">
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
    </>
  );
}
