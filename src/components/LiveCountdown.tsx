import { useEffect, useMemo, useState } from "react";
import { Clock, Hourglass, PlayCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { type LiveSession } from "@/lib/live-data";

function formatRemaining(ms: number) {
  if (ms <= 0) return "00:00:00";
  const s = Math.floor(ms / 1000);
  const d = Math.floor(s / 86400);
  const h = Math.floor((s % 86400) / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  const pad = (n: number) => String(n).padStart(2, "0");
  if (d > 0) return `${d} ngày ${pad(h)}:${pad(m)}:${pad(sec)}`;
  return `${pad(h)}:${pad(m)}:${pad(sec)}`;
}

function timeParts(ms: number) {
  const s = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor((s % 86400) / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  return {
    h: String(h).padStart(2, "0"),
    m: String(m).padStart(2, "0"),
    s: String(sec).padStart(2, "0"),
  };
}

type Phase = "ended" | "upcoming" | "safe" | "warning" | "urgent";

function getPhase(remaining: number, total: number, started: boolean): Phase {
  if (!started) return "upcoming";
  if (remaining <= 0) return "ended";
  const ratio = total > 0 ? remaining / total : 0;
  if (ratio <= 0.15 || remaining <= 10 * 60 * 1000) return "urgent";
  if (ratio <= 0.35) return "warning";
  return "safe";
}

const phaseStyles: Record<
  Phase,
  { bar: string; glow: string; label: string; icon: React.ReactNode }
> = {
  ended: {
    bar: "bg-white/20",
    glow: "shadow-white/10",
    label: "text-white/60",
    icon: <Clock className="h-4 w-4" />,
  },
  upcoming: {
    bar: "bg-sky-500",
    glow: "shadow-sky-500/40",
    label: "text-sky-300",
    icon: <PlayCircle className="h-4 w-4" />,
  },
  safe: {
    bar: "bg-emerald-500",
    glow: "shadow-emerald-500/40",
    label: "text-emerald-300",
    icon: <Hourglass className="h-4 w-4" />,
  },
  warning: {
    bar: "bg-amber-500",
    glow: "shadow-amber-500/40",
    label: "text-amber-300",
    icon: <Hourglass className="h-4 w-4" />,
  },
  urgent: {
    bar: "bg-red-500",
    glow: "shadow-red-500/50",
    label: "text-red-300",
    icon: <Hourglass className="h-4 w-4" />,
  },
};

export function LiveCountdown({
  session,
  size = "compact",
}: {
  session: LiveSession;
  size?: "compact" | "prominent";
}) {
  const [now, setNow] = useState(() => Date.now());
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const start = useMemo(() => new Date(session.startAt).getTime(), [session.startAt]);
  const end = useMemo(() => start + session.durationMin * 60 * 1000, [start, session.durationMin]);
  const total = useMemo(() => end - start, [start, end]);

  const { phase, remaining, label, percent } = useMemo(() => {
    if (now >= end) {
      return { phase: "ended" as Phase, remaining: 0, label: "Đã kết thúc", percent: 0 };
    }
    if (now < start) {
      const r = start - now;
      return { phase: "upcoming" as Phase, remaining: r, label: "Bắt đầu sau", percent: 100 };
    }
    const r = end - now;
    const p = getPhase(r, total, true);
    return { phase: p, remaining: r, label: "Còn lại", percent: Math.max(0, (r / total) * 100) };
  }, [now, start, end, total]);

  const styles = phaseStyles[phase];
  const parts = timeParts(remaining);
  const urgentPulse = phase === "urgent";

  if (!mounted) {
    return (
      <span
        className={cn(
          "inline-flex items-center gap-1.5 rounded-full bg-black/60 px-3 py-1 text-xs font-medium text-white/80 backdrop-blur",
          size === "prominent" && "rounded-xl px-4 py-2",
        )}
      >
        <Clock className="h-3 w-3" /> --:--:--
      </span>
    );
  }

  if (size === "compact") {
    return (
      <span
        className={cn(
          "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold text-white backdrop-blur",
          phase === "ended" && "bg-white/10",
          phase === "upcoming" && "bg-sky-500/90",
          phase === "safe" && "bg-emerald-500/90",
          phase === "warning" && "bg-amber-500/90",
          phase === "urgent" && "bg-red-500/90 animate-pulse",
        )}
      >
        {phase === "ended" ? <Clock className="h-3 w-3" /> : <Hourglass className="h-3 w-3" />}
        {label} {formatRemaining(remaining)}
      </span>
    );
  }

  return (
    <div
      className={cn(
        "relative flex items-center gap-3 rounded-xl border border-white/10 bg-black/70 px-4 py-2.5 backdrop-blur",
        "transition-colors duration-300",
        urgentPulse && "animate-pulse",
      )}
    >
      {/* Ring progress */}
      <div className="relative flex h-11 w-11 shrink-0 items-center justify-center">
        <svg className="h-11 w-11 -rotate-90" viewBox="0 0 36 36">
          <circle cx="18" cy="18" r="15" fill="none" stroke="currentColor" strokeWidth="3" className="text-white/10" />
          <circle
            cx="18"
            cy="18"
            r="15"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
            strokeDasharray={94}
            strokeDashoffset={94 - (94 * percent) / 100}
            className={cn("transition-all duration-1000", styles.label)}
          />
        </svg>
        <div className={cn("absolute inset-0 flex items-center justify-center text-white", styles.label)}>
          {styles.icon}
        </div>
      </div>

      {/* Time display */}
      <div className="flex flex-col items-start leading-none">
        <span className={cn("text-[10px] font-semibold uppercase tracking-wider", styles.label)}>
          {label}
        </span>
        <div className="mt-0.5 flex items-baseline gap-0.5 text-2xl font-bold tabular-nums tracking-tight text-white">
          <span>{parts.h}</span>
          <span className="text-white/40">:</span>
          <span>{parts.m}</span>
          <span className="text-white/40">:</span>
          <span>{parts.s}</span>
        </div>
      </div>

      {/* Bottom progress bar */}
      <div className="absolute inset-x-0 bottom-0 h-1 overflow-hidden rounded-b-xl">
        <div
          className={cn("h-full transition-all duration-1000", styles.bar)}
          style={{ width: `${percent}%` }}
        />
      </div>

      {/* Glow */}
      <div
        className={cn(
          "pointer-events-none absolute -inset-px rounded-xl opacity-40 blur-sm transition-opacity",
          styles.glow,
        )}
        style={{ boxShadow: "0 0 24px 2px currentColor" }}
      />
    </div>
  );
}
