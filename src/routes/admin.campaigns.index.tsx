import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Megaphone, Plus, ExternalLink, Users, Copy } from "lucide-react";
import { TopNav } from "@/components/TopNav";
import {
  createCampaign,
  listCampaigns,
  type Campaign,
  type CampaignLevel,
} from "@/lib/campaigns";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/campaigns/")({
  head: () => ({
    meta: [
      { title: "Chiến dịch — UNICOM LMS" },
      { name: "description", content: "Quản lý chiến dịch thi test dành cho học viên vãng lai." },
    ],
  }),
  component: CampaignsPage,
});

const ALL_LEVELS: CampaignLevel[] = ["A1", "A2", "B1", "B2", "C1"];

function CampaignsPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [levels, setLevels] = useState<CampaignLevel[]>(["A1", "A2", "B1", "B2"]);

  const refresh = () => setCampaigns(listCampaigns());
  useEffect(() => {
    refresh();
    const h = () => refresh();
    window.addEventListener("unicom:campaigns-updated", h);
    return () => window.removeEventListener("unicom:campaigns-updated", h);
  }, []);

  const slugify = (s: string) =>
    s
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/đ/g, "d")
      .replace(/[^a-z0-9\s-]/g, "")
      .trim()
      .replace(/\s+/g, "-");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || levels.length === 0) {
      toast.error("Vui lòng nhập tên chiến dịch và chọn trình độ.");
      return;
    }
    const baseSlug = slugify(name) || `chien-dich-${Date.now()}`;
    createCampaign({
      slug: baseSlug,
      name: name.trim(),
      description: description.trim(),
      levels,
      trialClassName: `Trial · ${name.trim()}`,
      status: "active",
    });
    toast.success("Đã tạo chiến dịch mới.");
    setShowForm(false);
    setName("");
    setDescription("");
    setLevels(["A1", "A2", "B1", "B2"]);
  };

  const copyLink = (slug: string) => {
    const url = `${window.location.origin}/campaigns/${slug}`;
    navigator.clipboard.writeText(url).then(() => toast.success("Đã sao chép link đăng ký."));
  };

  return (
    <>
      <TopNav />
      <main className="min-h-screen bg-muted/20 px-6 py-8">
        <div className="mx-auto max-w-6xl space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                <Megaphone className="h-3.5 w-3.5" /> Chiến dịch tuyển sinh
              </div>
              <h1 className="mt-2 font-display text-3xl font-bold">Chiến dịch thi test</h1>
              <p className="text-sm text-muted-foreground">
                Tạo landing page thu thập đăng ký test trình độ từ học viên vãng lai.
              </p>
            </div>
            <button
              onClick={() => setShowForm((v) => !v)}
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
            >
              <Plus className="h-4 w-4" /> Tạo chiến dịch
            </button>
          </div>

          {showForm && (
            <form
              onSubmit={submit}
              className="rounded-2xl border border-border bg-surface p-5 shadow-soft space-y-4"
            >
              <div className="grid gap-4 md:grid-cols-2">
                <Field label="Tên chiến dịch">
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="VD: Test miễn phí mùa thu 2026"
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                  />
                </Field>
                <Field label="Trình độ mở đăng ký">
                  <div className="flex flex-wrap gap-2">
                    {ALL_LEVELS.map((lv) => {
                      const on = levels.includes(lv);
                      return (
                        <button
                          type="button"
                          key={lv}
                          onClick={() =>
                            setLevels((prev) =>
                              on ? prev.filter((x) => x !== lv) : [...prev, lv],
                            )
                          }
                          className={
                            "rounded-lg border px-3 py-1.5 text-xs font-semibold " +
                            (on
                              ? "border-primary bg-primary text-primary-foreground"
                              : "border-border bg-background text-muted-foreground")
                          }
                        >
                          {lv}
                        </button>
                      );
                    })}
                  </div>
                </Field>
              </div>
              <Field label="Mô tả ngắn (hiển thị trên landing)">
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                />
              </Field>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="rounded-lg border border-border bg-background px-4 py-2 text-sm font-medium"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"
                >
                  Tạo chiến dịch
                </button>
              </div>
            </form>
          )}

          <div className="grid gap-4 md:grid-cols-2">
            {campaigns.map((c) => (
              <div
                key={c.id}
                className="rounded-2xl border border-border bg-surface p-5 shadow-soft"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span
                      className={
                        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold " +
                        (c.status === "active"
                          ? "bg-emerald-100 text-emerald-700"
                          : c.status === "draft"
                            ? "bg-amber-100 text-amber-700"
                            : "bg-muted text-muted-foreground")
                      }
                    >
                      {c.status === "active"
                        ? "Đang mở"
                        : c.status === "draft"
                          ? "Nháp"
                          : "Đã đóng"}
                    </span>
                    <h3 className="mt-2 font-display text-lg font-semibold">{c.name}</h3>
                    <p className="line-clamp-2 text-xs text-muted-foreground">{c.description}</p>
                  </div>
                  <div className="text-right">
                    <div className="inline-flex items-center gap-1 rounded-lg bg-primary/10 px-2 py-1 text-xs font-semibold text-primary">
                      <Users className="h-3 w-3" /> {c.registrants.length}
                    </div>
                  </div>
                </div>
                <div className="mt-3 flex flex-wrap gap-1">
                  {c.levels.map((lv) => (
                    <span
                      key={lv}
                      className="rounded-md border border-border bg-background px-2 py-0.5 text-[11px] font-medium"
                    >
                      {lv}
                    </span>
                  ))}
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  <Link
                    to="/admin/campaigns/$campaignId"
                    params={{ campaignId: c.id }}
                    className="inline-flex items-center gap-1 rounded-lg bg-foreground px-3 py-1.5 text-xs font-semibold text-background"
                  >
                    Xem chi tiết
                  </Link>
                  <Link
                    to="/campaigns/$slug"
                    params={{ slug: c.slug }}
                    target="_blank"
                    className="inline-flex items-center gap-1 rounded-lg border border-border bg-background px-3 py-1.5 text-xs font-semibold"
                  >
                    <ExternalLink className="h-3 w-3" /> Xem landing
                  </Link>
                  <button
                    onClick={() => copyLink(c.slug)}
                    className="inline-flex items-center gap-1 rounded-lg border border-border bg-background px-3 py-1.5 text-xs font-semibold"
                  >
                    <Copy className="h-3 w-3" /> Sao chép link
                  </button>
                </div>
              </div>
            ))}
            {campaigns.length === 0 && (
              <div className="col-span-full rounded-2xl border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
                Chưa có chiến dịch nào. Bấm "Tạo chiến dịch" để bắt đầu.
              </div>
            )}
          </div>
        </div>
      </main>
    </>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block space-y-1.5">
      <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </span>
      {children}
    </label>
  );
}
