import { createFileRoute, notFound } from "@tanstack/react-router";
import { useState } from "react";
import { BookOpen, CheckCircle2, Sparkles } from "lucide-react";
import { addRegistrant, getCampaignBySlug, type CampaignLevel } from "@/lib/campaigns";

export const Route = createFileRoute("/campaigns/$slug")({
  head: ({ params }) => ({
    meta: [
      { title: `Đăng ký test — ${params.slug}` },
      { name: "description", content: "Đăng ký test trình độ tiếng Anh miễn phí tại UNICOM." },
    ],
  }),
  component: CampaignLanding,
});

function CampaignLanding() {
  const { slug } = Route.useParams();
  const campaign = getCampaignBySlug(slug);
  if (!campaign) throw notFound();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [level, setLevel] = useState<CampaignLevel>(campaign.levels[0]);
  const [done, setDone] = useState(false);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !email || !phone) return;
    addRegistrant(slug, { fullName, email, phone, desiredLevel: level });
    setDone(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-chart-5/10">
      <header className="border-b border-border/60 bg-background/80 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center gap-2 px-6">
          <div
            className="flex h-9 w-9 items-center justify-center rounded-xl text-primary-foreground"
            style={{ background: "var(--gradient-brand)" }}
          >
            <BookOpen className="h-5 w-5" />
          </div>
          <div className="text-sm font-semibold">UNICOM English</div>
        </div>
      </header>

      <main className="mx-auto grid max-w-6xl gap-10 px-6 py-16 md:grid-cols-2">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
            <Sparkles className="h-3.5 w-3.5" /> Miễn phí · Có chứng nhận
          </div>
          <h1 className="mt-4 font-display text-4xl font-bold leading-tight">{campaign.name}</h1>
          <p className="mt-4 text-base text-muted-foreground">{campaign.description}</p>

          <ul className="mt-6 space-y-2 text-sm">
            {[
              "Bài test chuẩn Cambridge, đánh giá 4 kỹ năng",
              "Nhận lộ trình học cá nhân hoá theo trình độ",
              "Tư vấn 1-1 với giáo viên trong 24h sau khi đăng ký",
              "Ưu đãi học phí lên tới 30%",
            ].map((t) => (
              <li key={t} className="flex items-start gap-2">
                <CheckCircle2 className="mt-0.5 h-4 w-4 flex-none text-emerald-600" />
                <span>{t}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-3xl border border-border bg-background p-6 shadow-elevated">
          {done ? (
            <div className="flex flex-col items-center py-10 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                <CheckCircle2 className="h-7 w-7" />
              </div>
              <h2 className="mt-4 font-display text-2xl font-bold">Đăng ký thành công!</h2>
              <p className="mt-2 max-w-sm text-sm text-muted-foreground">
                Cảm ơn bạn đã đăng ký. Đội ngũ UNICOM sẽ liên hệ trong 24 giờ tới để sắp xếp lịch
                test.
              </p>
              <button
                onClick={() => {
                  setDone(false);
                  setFullName("");
                  setEmail("");
                  setPhone("");
                }}
                className="mt-6 rounded-lg border border-border bg-surface px-4 py-2 text-sm font-medium"
              >
                Đăng ký người khác
              </button>
            </div>
          ) : (
            <form onSubmit={submit} className="space-y-4">
              <h2 className="font-display text-xl font-bold">Đăng ký test ngay</h2>
              <p className="-mt-2 text-xs text-muted-foreground">
                Điền thông tin, chúng tôi sẽ liên hệ trong 24 giờ.
              </p>

              <F label="Họ và tên">
                <input
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                  placeholder="Nguyễn Văn A"
                />
              </F>
              <F label="Email">
                <input
                  required
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                  placeholder="ban@email.com"
                />
              </F>
              <F label="Số điện thoại">
                <input
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                  placeholder="09xx xxx xxx"
                />
              </F>
              <F label="Trình độ bạn muốn test">
                <div className="flex flex-wrap gap-2">
                  {campaign.levels.map((lv) => (
                    <button
                      type="button"
                      key={lv}
                      onClick={() => setLevel(lv)}
                      className={
                        "rounded-lg border px-3 py-1.5 text-sm font-semibold " +
                        (level === lv
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-border bg-background text-muted-foreground")
                      }
                    >
                      {lv}
                    </button>
                  ))}
                </div>
              </F>

              <button
                type="submit"
                className="w-full rounded-xl bg-primary py-3 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
              >
                Đăng ký test miễn phí
              </button>
              <p className="text-center text-[11px] text-muted-foreground">
                Bằng cách đăng ký, bạn đồng ý cho UNICOM liên hệ tư vấn qua email/điện thoại.
              </p>
            </form>
          )}
        </div>
      </main>
    </div>
  );
}

function F({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block space-y-1.5">
      <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </span>
      {children}
    </label>
  );
}
