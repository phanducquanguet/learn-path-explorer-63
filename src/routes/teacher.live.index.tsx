import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { TopNav } from "@/components/TopNav";
import {
  Video,
  Calendar,
  Plus,
  Radio,
  PlayCircle,
  Clock,
  Users,
  Sparkles,
  CalendarDays,
  X,
  ArrowUpRight,
  Eye,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { liveSessions, recordings, formatStartAt, relativeFromNow } from "@/lib/live-data";

export const Route = createFileRoute("/teacher/live/")({
  head: () => ({ meta: [{ title: "Lớp trực tuyến (Giáo viên) — UNICOM LMS" }] }),
  component: TeacherLivePage,
});

function TeacherLivePage() {
  const [tab, setTab] = useState<"schedule" | "recordings">("schedule");
  const [showCreate, setShowCreate] = useState(false);

  const liveNow = useMemo(() => liveSessions.filter((s) => s.status === "live"), []);
  const scheduled = useMemo(
    () =>
      liveSessions
        .filter((s) => s.status === "scheduled")
        .sort((a, b) => new Date(a.startAt).getTime() - new Date(b.startAt).getTime()),
    [],
  );

  return (
    <div className="min-h-screen bg-background">
      <TopNav />
      <div className="mx-auto max-w-7xl px-6 pb-20 pt-10 sm:px-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex flex-col gap-2">
            <span className="inline-flex w-fit items-center gap-2 text-xs font-semibold uppercase tracking-wider text-primary">
              <Sparkles className="h-3.5 w-3.5" /> Giảng dạy trực tiếp
            </span>
            <h1 className="font-display text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
              Lớp trực tuyến của tôi
            </h1>
            <p className="text-sm text-muted-foreground">
              Đặt lịch buổi học, vào lớp giảng dạy, chia sẻ màn hình và quản lý bản ghi.
            </p>
          </div>
          <button
            onClick={() => setShowCreate(true)}
            className="inline-flex items-center gap-2 self-start rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-soft hover:opacity-90"
          >
            <Plus className="h-4 w-4" /> Đặt lịch buổi học mới
          </button>
        </div>

        {/* Stats */}
        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          <StatCard
            icon={<Radio className="h-5 w-5" />}
            label="Đang diễn ra"
            value={liveNow.length}
            tone="red"
          />
          <StatCard
            icon={<CalendarDays className="h-5 w-5" />}
            label="Buổi học sắp tới"
            value={scheduled.length}
            tone="blue"
          />
          <StatCard
            icon={<PlayCircle className="h-5 w-5" />}
            label="Bản ghi đã lưu"
            value={recordings.length}
            tone="emerald"
          />
        </div>

        {/* Live now */}
        {liveNow.length > 0 && (
          <div className="mt-8 space-y-3">
            {liveNow.map((s) => (
              <div
                key={s.id}
                className="flex flex-col gap-4 overflow-hidden rounded-2xl border border-red-200 bg-gradient-to-r from-red-50 via-rose-50 to-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex items-start gap-4">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-red-500 text-white shadow-soft">
                    <Radio className="h-6 w-6 animate-pulse" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center gap-1 rounded-full bg-red-500 px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-white">
                        <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" /> Lớp của bạn đang LIVE
                      </span>
                    </div>
                    <h3 className="mt-1 text-base font-semibold text-foreground">{s.title}</h3>
                    <p className="text-sm text-muted-foreground">
                      {s.classCode} · {s.participantsCount} học viên đang tham gia
                    </p>
                  </div>
                </div>
                <Link
                  to="/teacher/live/$sessionId"
                  params={{ sessionId: s.id }}
                  className="inline-flex items-center gap-2 self-start rounded-full bg-red-500 px-5 py-2.5 text-sm font-semibold text-white shadow-soft hover:bg-red-600 sm:self-auto"
                >
                  Tiếp tục giảng dạy <ArrowUpRight className="h-4 w-4" />
                </Link>
              </div>
            ))}
          </div>
        )}

        {/* Tabs */}
        <div className="mt-8 inline-flex rounded-full bg-surface p-1 ring-1 ring-border">
          <TabBtn active={tab === "schedule"} onClick={() => setTab("schedule")} icon={<Calendar className="h-4 w-4" />}>
            Lịch giảng dạy
          </TabBtn>
          <TabBtn active={tab === "recordings"} onClick={() => setTab("recordings")} icon={<PlayCircle className="h-4 w-4" />}>
            Bản ghi
          </TabBtn>
        </div>

        {tab === "schedule" ? (
          <div className="mt-6 overflow-hidden rounded-2xl border border-border/60 bg-card shadow-sm">
            <table className="w-full text-sm">
              <thead className="bg-surface text-xs uppercase tracking-wide text-muted-foreground">
                <tr>
                  <th className="px-4 py-3 text-left">Buổi học</th>
                  <th className="px-4 py-3 text-left">Lớp</th>
                  <th className="px-4 py-3 text-left">Thời gian</th>
                  <th className="px-4 py-3 text-left">Học viên</th>
                  <th className="px-4 py-3 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {scheduled.map((s) => (
                  <tr key={s.id} className="hover:bg-surface/40">
                    <td className="px-4 py-3">
                      <div className="font-medium text-foreground">{s.title}</div>
                      <div className="text-xs text-muted-foreground">{s.topic}</div>
                    </td>
                    <td className="px-4 py-3 text-foreground">
                      <span className="rounded bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary">
                        {s.level}
                      </span>
                      <span className="ml-2 text-xs text-muted-foreground">{s.classCode}</span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-foreground" suppressHydrationWarning>{formatStartAt(s.startAt)}</div>
                      <div className="text-xs text-muted-foreground" suppressHydrationWarning>
                        {s.durationMin} phút · {relativeFromNow(s.startAt)}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      <span className="inline-flex items-center gap-1.5">
                        <Users className="h-3.5 w-3.5" /> {s.participantsCount}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        to="/teacher/live/$sessionId"
                        params={{ sessionId: s.id }}
                        className="inline-flex items-center gap-1.5 rounded-full bg-primary px-3.5 py-1.5 text-xs font-semibold text-primary-foreground hover:opacity-90"
                      >
                        <Video className="h-3.5 w-3.5" /> Bắt đầu giảng
                      </Link>
                    </td>
                  </tr>
                ))}
                {scheduled.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-4 py-10 text-center text-sm text-muted-foreground">
                      Chưa có lịch buổi học. Bấm "Đặt lịch buổi học mới" để tạo.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {recordings.map((r) => (
              <div
                key={r.id}
                className="flex flex-col overflow-hidden rounded-2xl border border-border/60 bg-card shadow-sm"
              >
                <div className="relative flex aspect-video items-center justify-center bg-gradient-to-br from-slate-800 to-black">
                  <PlayCircle className="h-14 w-14 text-white/90" />
                  <span className="absolute bottom-2 right-2 rounded bg-black/70 px-2 py-0.5 text-[11px] font-medium text-white">
                    {r.durationMin}:00
                  </span>
                </div>
                <div className="flex flex-1 flex-col gap-2 p-4">
                  <h3 className="text-sm font-semibold text-foreground line-clamp-2">{r.title}</h3>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>{r.classCode}</span>
                    <span className="inline-flex items-center gap-1">
                      <Eye className="h-3 w-3" /> {r.views} lượt xem
                    </span>
                  </div>
                  <div className="text-[11px] text-muted-foreground">{formatStartAt(r.recordedAt)}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create dialog */}
      {showCreate && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur"
          onClick={() => setShowCreate(false)}
        >
          <div
            className="w-full max-w-lg rounded-2xl bg-card p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-lg font-semibold text-foreground">Đặt lịch buổi học mới</h2>
                <p className="text-xs text-muted-foreground">Thiết lập thời gian, nội dung và lớp tham gia.</p>
              </div>
              <button
                onClick={() => setShowCreate(false)}
                className="rounded-full p-1 text-muted-foreground hover:bg-muted"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <form
              className="mt-5 space-y-3"
              onSubmit={(e) => {
                e.preventDefault();
                setShowCreate(false);
              }}
            >
              <Field label="Tiêu đề buổi học">
                <input className="input" placeholder="VD: Speaking Practice — Daily Routines" />
              </Field>
              <Field label="Lớp">
                <select className="input">
                  <option>B1-EVE-02 — B1 Nền tảng (Tối T2-T4-T6)</option>
                  <option>B2-IELTS-01 — B2 Bứt phá (IELTS Foundation)</option>
                </select>
              </Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Ngày & giờ bắt đầu">
                  <input type="datetime-local" className="input" />
                </Field>
                <Field label="Thời lượng (phút)">
                  <input type="number" defaultValue={60} className="input" />
                </Field>
              </div>
              <Field label="Chủ đề / Nội dung">
                <textarea className="input min-h-[80px]" placeholder="Mô tả nội dung buổi học..." />
              </Field>
              <label className="flex items-center gap-2 text-sm text-muted-foreground">
                <input type="checkbox" defaultChecked /> Tự động ghi hình buổi học
              </label>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreate(false)}
                  className="rounded-full px-4 py-2 text-sm text-muted-foreground hover:bg-muted"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="rounded-full bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90"
                >
                  Tạo buổi học
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style>{`.input{display:block;width:100%;border-radius:10px;border:1px solid hsl(var(--border));background:hsl(var(--card));padding:8px 12px;font-size:14px;outline:none}.input:focus{box-shadow:0 0 0 2px hsl(var(--primary)/0.3)}`}</style>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1 block text-xs font-medium text-foreground">{label}</label>
      {children}
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  tone,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  tone: "red" | "blue" | "emerald";
}) {
  const toneClass = {
    red: "bg-red-50 text-red-600",
    blue: "bg-primary/10 text-primary",
    emerald: "bg-emerald-50 text-emerald-600",
  }[tone];
  return (
    <div className="flex items-center gap-4 rounded-2xl border border-border/60 bg-card p-5 shadow-sm">
      <div className={cn("flex h-12 w-12 items-center justify-center rounded-xl", toneClass)}>
        {icon}
      </div>
      <div>
        <div className="text-2xl font-semibold text-foreground">{value}</div>
        <div className="text-xs text-muted-foreground">{label}</div>
      </div>
    </div>
  );
}

function TabBtn({
  active,
  onClick,
  icon,
  children,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition",
        active
          ? "bg-primary text-primary-foreground shadow-soft"
          : "text-muted-foreground hover:text-foreground",
      )}
    >
      {icon}
      {children}
    </button>
  );
}
