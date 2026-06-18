import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { TopNav } from "@/components/TopNav";
import {
  Video,
  Calendar,
  Users,
  PlayCircle,
  Radio,
  Search,
  Clock,
  Eye,
  Sparkles,
  ArrowUpRight,
  CalendarDays,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { liveSessions, recordings, formatStartAt, relativeFromNow } from "@/lib/live-data";

export const Route = createFileRoute("/live/")({
  head: () => ({ meta: [{ title: "Lớp học trực tuyến — UNICOM LMS" }] }),
  component: LiveIndexPage,
});

function LiveIndexPage() {
  const [tab, setTab] = useState<"upcoming" | "recordings">("upcoming");
  const [q, setQ] = useState("");

  const liveNow = useMemo(() => liveSessions.filter((s) => s.status === "live"), []);
  const upcoming = useMemo(
    () =>
      liveSessions
        .filter((s) => s.status === "scheduled")
        .filter((s) =>
          q ? `${s.title} ${s.classCode} ${s.topic}`.toLowerCase().includes(q.toLowerCase()) : true,
        )
        .sort((a, b) => new Date(a.startAt).getTime() - new Date(b.startAt).getTime()),
    [q],
  );

  const filteredRecordings = useMemo(
    () =>
      recordings.filter((r) =>
        q ? `${r.title} ${r.classCode}`.toLowerCase().includes(q.toLowerCase()) : true,
      ),
    [q],
  );

  return (
    <div className="min-h-screen bg-background">
      <TopNav />
      <div className="mx-auto max-w-7xl px-6 pb-20 pt-10 sm:px-8">
        <div className="flex flex-col gap-2">
          <span className="inline-flex w-fit items-center gap-2 text-xs font-semibold uppercase tracking-wider text-primary">
            <Sparkles className="h-3.5 w-3.5" /> Học cùng giáo viên
          </span>
          <h1 className="font-display text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            Lớp học trực tuyến
          </h1>
          <p className="text-sm text-muted-foreground">
            Tham gia buổi học trực tiếp, đặt câu hỏi, raise hand và xem lại bản ghi bất cứ lúc nào.
          </p>
        </div>

        {liveNow.length > 0 && (
          <div className="mt-8 space-y-3">
            {liveNow.map((s) => (
              <Link
                key={s.id}
                to="/live/$sessionId"
                params={{ sessionId: s.id }}
                className="group relative flex flex-col gap-4 overflow-hidden rounded-2xl border border-red-200 bg-gradient-to-r from-red-50 via-rose-50 to-white p-5 shadow-sm transition hover:shadow-md sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex items-start gap-4">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-red-500 text-white shadow-soft">
                    <Radio className="h-6 w-6 animate-pulse" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center gap-1 rounded-full bg-red-500 px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-white">
                        <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" /> Đang diễn ra
                      </span>
                      <span className="text-xs text-muted-foreground" suppressHydrationWarning>
                        Bắt đầu {relativeFromNow(s.startAt)}
                      </span>
                    </div>
                    <h3 className="mt-1 text-base font-semibold text-foreground">{s.title}</h3>
                    <p className="text-sm text-muted-foreground">
                      {s.classCode} · {s.teacher} · {s.participantsCount} người đang học
                    </p>
                  </div>
                </div>
                <span className="inline-flex items-center gap-2 self-start rounded-full bg-red-500 px-5 py-2.5 text-sm font-semibold text-white shadow-soft transition group-hover:bg-red-600 sm:self-auto">
                  Vào lớp ngay <ArrowUpRight className="h-4 w-4" />
                </span>
              </Link>
            ))}
          </div>
        )}

        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="inline-flex rounded-full bg-surface p-1 ring-1 ring-border">
            <TabBtn active={tab === "upcoming"} onClick={() => setTab("upcoming")} icon={<Calendar className="h-4 w-4" />}>
              Lịch học sắp tới
            </TabBtn>
            <TabBtn active={tab === "recordings"} onClick={() => setTab("recordings")} icon={<PlayCircle className="h-4 w-4" />}>
              Bản ghi ({recordings.length})
            </TabBtn>
          </div>
          <div className="relative w-full sm:w-72">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Tìm buổi học, chủ đề..."
              className="h-10 w-full rounded-full border border-border bg-card pl-10 pr-4 text-sm outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>
        </div>

        {tab === "upcoming" ? (
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {upcoming.map((s) => (
              <article
                key={s.id}
                className="flex flex-col gap-4 rounded-2xl border border-border/60 bg-card p-5 shadow-sm transition hover:shadow-md"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-primary">
                      {s.level}
                    </span>
                    <h3 className="mt-2 text-base font-semibold text-foreground">{s.title}</h3>
                    <p className="text-sm text-muted-foreground">{s.topic}</p>
                  </div>
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <Video className="h-5 w-5" />
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-muted-foreground">
                  <span className="inline-flex items-center gap-1.5" suppressHydrationWarning>
                    <CalendarDays className="h-3.5 w-3.5" /> {formatStartAt(s.startAt)}
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5" /> {s.durationMin} phút
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <Users className="h-3.5 w-3.5" /> {s.participantsCount} học viên
                  </span>
                </div>
                <div className="flex items-center justify-between border-t border-border/60 pt-4">
                  <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 text-xs font-semibold text-white">
                      {s.teacherInitials}
                    </div>
                    <div className="text-xs">
                      <div className="font-medium text-foreground">{s.teacher}</div>
                      <div className="text-muted-foreground">{s.classCode}</div>
                    </div>
                  </div>
                  <Link
                    to="/live/$sessionId"
                    params={{ sessionId: s.id }}
                    className="inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground transition hover:opacity-90"
                  >
                    Xem chi tiết <ArrowUpRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </article>
            ))}
            {upcoming.length === 0 && (
              <div className="col-span-full rounded-2xl border border-dashed border-border bg-surface/50 p-10 text-center text-sm text-muted-foreground">
                Không có buổi học nào sắp tới.
              </div>
            )}
          </div>
        ) : (
          <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredRecordings.map((r) => (
              <Link
                key={r.id}
                to="/live/$sessionId"
                params={{ sessionId: r.sessionId }}
                className="group flex flex-col overflow-hidden rounded-2xl border border-border/60 bg-card shadow-sm transition hover:shadow-md"
              >
                <div className="relative flex aspect-video items-center justify-center bg-gradient-to-br from-slate-800 via-slate-900 to-black">
                  <PlayCircle className="h-14 w-14 text-white/90 transition group-hover:scale-110" />
                  <span className="absolute bottom-2 right-2 rounded bg-black/70 px-2 py-0.5 text-[11px] font-medium text-white">
                    {r.durationMin}:00
                  </span>
                </div>
                <div className="flex flex-1 flex-col gap-2 p-4">
                  <h3 className="text-sm font-semibold text-foreground line-clamp-2">{r.title}</h3>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>{r.classCode}</span>
                    <span className="inline-flex items-center gap-1">
                      <Eye className="h-3 w-3" /> {r.views}
                    </span>
                  </div>
                  <div className="text-[11px] text-muted-foreground">{formatStartAt(r.recordedAt)}</div>
                </div>
              </Link>
            ))}
            {filteredRecordings.length === 0 && (
              <div className="col-span-full rounded-2xl border border-dashed border-border bg-surface/50 p-10 text-center text-sm text-muted-foreground">
                Chưa có bản ghi nào.
              </div>
            )}
          </div>
        )}
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
