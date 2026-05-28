import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Clock, X, ArrowUpRight } from "lucide-react";
import { useRole } from "@/contexts/RoleContext";
import { tests, testStatus, type Test } from "@/lib/tests-data";

const DISMISS_KEY = "unicom.examFloater.dismissed";

function getDismissed(): string[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(window.localStorage.getItem(DISMISS_KEY) || "[]");
  } catch {
    return [];
  }
}

function pickNextExam(dismissed: string[]): Test | null {
  const candidates = tests
    .filter((t) => !dismissed.includes(t.id))
    .filter((t) => {
      const s = testStatus(t);
      return s === "upcoming" || s === "open";
    })
    .sort((a, b) => {
      const sa = testStatus(a);
      const sb = testStatus(b);
      // ongoing first (closing soonest), then upcoming (opening soonest)
      if (sa !== sb) return sa === "open" ? -1 : 1;
      const ka = sa === "open" ? new Date(a.closeAt).getTime() : new Date(a.openAt).getTime();
      const kb = sb === "open" ? new Date(b.closeAt).getTime() : new Date(b.openAt).getTime();
      return ka - kb;
    });
  return candidates[0] ?? null;
}

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

export function ExamCountdownFloater() {
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

  const exam = pickNextExam(dismissed);
  if (!exam) return null;

  const status = testStatus(exam);
  const target = status === "open" ? new Date(exam.closeAt).getTime() : new Date(exam.openAt).getTime();
  const remaining = target - now;

  const handleDismiss = () => {
    const next = [...dismissed, exam.id];
    setDismissed(next);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(DISMISS_KEY, JSON.stringify(next));
    }
  };

  const isLive = status === "open";

  return (
    <div className="fixed bottom-6 right-6 z-50 w-[320px] animate-in fade-in slide-in-from-bottom-4 duration-300">
      <div className="overflow-hidden rounded-2xl border border-border bg-surface/95 shadow-elevated backdrop-blur-xl">
        <div
          className={`flex items-center justify-between px-4 py-2 text-[11px] font-semibold uppercase tracking-wider text-white ${
            isLive
              ? "bg-gradient-to-r from-emerald-500 to-teal-600"
              : "bg-gradient-to-r from-violet-500 to-indigo-600"
          }`}
        >
          <span className="inline-flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5" />
            {isLive ? "Đang mở • Còn lại" : "Sắp diễn ra • Bắt đầu sau"}
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
          <div className="line-clamp-2 text-sm font-semibold text-foreground">{exam.name}</div>
          <div className="mt-1 text-[11px] text-muted-foreground">
            {exam.level} • {exam.durationMinutes} phút
          </div>

          <div className="mt-3 rounded-xl bg-muted/50 px-3 py-2.5 text-center font-mono text-xl font-bold tabular-nums text-foreground">
            {formatRemaining(remaining)}
          </div>

          <Link
            to="/exams"
            className="mt-3 inline-flex w-full items-center justify-center gap-1.5 rounded-xl bg-foreground px-3 py-2 text-xs font-semibold text-background transition hover:opacity-90"
          >
            {isLive ? "Vào làm bài" : "Xem chi tiết"}
            <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
