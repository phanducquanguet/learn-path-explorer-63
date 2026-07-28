import { useEffect, useState } from "react";
import { Clock } from "lucide-react";
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

export function LiveCountdown({ session }: { session: LiveSession }) {
  const [now, setNow] = useState(() => Date.now());
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  if (!mounted) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-black/60 px-3 py-1 text-xs font-medium text-white/80 backdrop-blur">
        <Clock className="h-3 w-3" /> --:--:--
      </span>
    );
  }

  const start = new Date(session.startAt).getTime();
  const end = start + session.durationMin * 60 * 1000;

  if (now >= end) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-white/60 backdrop-blur">
        <Clock className="h-3 w-3" /> Đã kết thúc
      </span>
    );
  }

  if (now < start) {
    const remaining = start - now;
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-sky-500/90 px-3 py-1 text-xs font-semibold text-white backdrop-blur">
        <Clock className="h-3 w-3" /> Bắt đầu sau {formatRemaining(remaining)}
      </span>
    );
  }

  const remaining = end - now;
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-black/60 px-3 py-1 text-xs font-medium text-white backdrop-blur">
      <Clock className="h-3 w-3" /> Còn lại {formatRemaining(remaining)}
    </span>
  );
}
