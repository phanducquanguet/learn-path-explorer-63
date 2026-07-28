import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Radio, X, ArrowUpRight, Users } from "lucide-react";
import { useRole } from "@/contexts/RoleContext";
import { liveSessions, type LiveSession } from "@/lib/live-data";

const DISMISS_KEY = "unicom.liveFloater.dismissed";

function getDismissed(): string[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(window.localStorage.getItem(DISMISS_KEY) || "[]");
  } catch {
    return [];
  }
}

function pickSession(dismissed: string[], now: number): LiveSession | null {
  const candidates = liveSessions
    .filter((s) => !dismissed.includes(s.id))
    .map((s) => {
      const start = new Date(s.startAt).getTime();
      const end = start + s.durationMin * 60 * 1000;
      const isLive = now >= start && now <= end;
      const isSoon = start > now && start - now <= 30 * 60 * 1000; // within 30 min
      return { s, start, end, isLive, isSoon };
    })
    .filter((x) => x.isLive || x.isSoon)
    .sort((a, b) => {
      if (a.isLive !== b.isLive) return a.isLive ? -1 : 1;
      return a.start - b.start;
    });
  return candidates[0]?.s ?? null;
}

function formatRemaining(ms: number) {
  if (ms <= 0) return "00:00:00";
  const s = Math.floor(ms / 1000);
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${pad(h)}:${pad(m)}:${pad(sec)}`;
}

export function LiveSessionFloater() {
  const { role } = useRole();
  const [now, setNow] = useState(() => Date.now());
  const [dismissed, setDismissed] = useState<string[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setDismissed(getDismissed());
  }, []);

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  if (!mounted || role !== "student") return null;

  const session = pickSession(dismissed, now);
  if (!session) return null;

  const start = new Date(session.startAt).getTime();
  const end = start + session.durationMin * 60 * 1000;
  const isLive = now >= start && now <= end;
  const target = isLive ? end : start;
  const remaining = target - now;

  const handleDismiss = () => {
    const next = [...dismissed, session.id];
    setDismissed(next);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(DISMISS_KEY, JSON.stringify(next));
    }
  };

  return (
    <div className="w-[320px] animate-in fade-in slide-in-from-bottom-4 duration-300">
      <div className="overflow-hidden rounded-2xl border border-border bg-surface/95 shadow-elevated backdrop-blur-xl">
        <div
          className={`flex items-center justify-between px-4 py-2 text-[11px] font-semibold uppercase tracking-wider text-white ${
            isLive
              ? "bg-gradient-to-r from-rose-500 to-red-600"
              : "bg-gradient-to-r from-sky-500 to-blue-600"
          }`}
        >
          <span className="inline-flex items-center gap-1.5">
            {isLive ? (
              <>
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-white" />
                </span>
                Đang trực tuyến • Kết thúc sau
              </>
            ) : (
              <>
                <Radio className="h-3.5 w-3.5" />
                Sắp diễn ra • Bắt đầu sau
              </>
            )}
          </span>
          <button
            onClick={handleDismiss}
            aria-label="Đóng"
            className="rounded-md p-0.5 text-white/80 transition hover:bg-white/20 hover:text-white"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>

        <div className="p-4">
          <div className="line-clamp-2 text-sm font-semibold text-foreground">{session.title}</div>
          <div className="mt-1 flex items-center gap-2 text-[11px] text-muted-foreground">
            <span>{session.teacher}</span>
            <span>•</span>
            <span className="inline-flex items-center gap-1">
              <Users className="h-3 w-3" />
              {session.participantsCount}
            </span>
          </div>

          <div className="mt-3 rounded-xl bg-muted/50 px-3 py-2.5 text-center font-mono text-xl font-bold tabular-nums text-foreground">
            {formatRemaining(remaining)}
          </div>

          <Link
            to="/live/$sessionId"
            params={{ sessionId: session.id }}
            className="mt-3 inline-flex w-full items-center justify-center gap-1.5 rounded-xl bg-foreground px-3 py-2 text-xs font-semibold text-background transition hover:opacity-90"
          >
            {isLive ? "Vào lớp ngay" : "Xem chi tiết"}
            <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
