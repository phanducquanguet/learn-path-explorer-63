import { useState } from "react";
import { ArrowLeft, ClipboardList, Clock, Play, Sparkles } from "lucide-react";
import { type Activity } from "@/lib/lms-data";
import { cn } from "@/lib/utils";
import { QuizRunner } from "@/components/QuizRunner";

export function QuizPanel({
  quiz,
  hue,
  onClose,
}: {
  quiz: Activity;
  hue: number;
  onClose: () => void;
}) {
  const [started, setStarted] = useState(false);
  const accent = `oklch(0.55 0.2 ${hue})`;
  const accent2 = `oklch(0.45 0.22 ${(hue + 40) % 360})`;

  if (started) {
    return (
      <section>
        <QuizRunner quizId={quiz.id} title={quiz.title} hue={hue} onExit={onClose} />
      </section>
    );
  }

  return (
    <section className="space-y-5">
      <button
        onClick={onClose}
        className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-3.5 w-3.5" /> Quay lại khóa học
      </button>

      {/* Hero card */}
      <div
        className="relative overflow-hidden rounded-3xl p-1 shadow-elevated"
        style={{ background: `linear-gradient(135deg, ${accent}, ${accent2})` }}
      >
        <div className="relative overflow-hidden rounded-[1.4rem] bg-gradient-to-br from-foreground/95 via-foreground/90 to-foreground/95 p-7 sm:p-9">
          <div
            className="absolute -right-24 -top-24 h-72 w-72 rounded-full opacity-40 blur-3xl"
            style={{ background: `oklch(0.7 0.22 ${hue})` }}
          />
          <div className="relative text-background">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider ring-1 ring-white/20 backdrop-blur">
              <ClipboardList className="h-3.5 w-3.5" /> Bài luyện tập
            </div>
            <h1 className="mt-4 font-display text-3xl font-semibold leading-tight tracking-tight sm:text-4xl">
              {quiz.title}
            </h1>
            <p className="mt-2 max-w-xl text-sm text-background/70 sm:text-base">
              Nộp từng câu hỏi một và nhận phản hồi ngay lập tức. Điểm cao nhất sẽ được tính vào
              tổng điểm khóa học.
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              <Pill icon={<Clock className="h-3.5 w-3.5" />}>~{quiz.duration} phút</Pill>
              <Pill icon={<ClipboardList className="h-3.5 w-3.5" />}>11 câu hỏi</Pill>
              <Pill icon={<Sparkles className="h-3.5 w-3.5" />}>Không giới hạn lượt</Pill>
            </div>
            <div className="mt-6">
              <button
                onClick={() => setStarted(true)}
                className="group inline-flex items-center gap-2 rounded-2xl bg-background px-5 py-3 text-sm font-semibold text-foreground shadow-elevated transition hover:scale-[1.02]"
              >
                <Play className="h-4 w-4 fill-foreground" /> Bắt đầu làm bài
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Info grid */}
      <div className="grid gap-3 sm:grid-cols-4">
        <Info label="Số lần thử" value="∞" hint="Không giới hạn" />
        <Info label="Cách tính điểm" value="Cao nhất" hint="Trong các lần thử" />
        <Info label="Điểm đạt" value="70%" hint="Yêu cầu để qua bài" />
        <Info label="Dạng câu hỏi" value="11" hint="Đa dạng định dạng" />
      </div>

      {/* Instructions */}
      <div className="rounded-2xl bg-surface p-5 ring-1 ring-border">
        <h3 className="mb-3 font-display text-base font-semibold text-foreground">
          Hướng dẫn làm bài
        </h3>
        <ul className="space-y-2 text-sm text-muted-foreground">
          <li className="flex gap-2">
            <span className={cn("mt-1 h-1.5 w-1.5 shrink-0 rounded-full")} style={{ background: accent }} />
            Mỗi câu hỏi được nộp riêng lẻ. Bạn sẽ nhận phản hồi ngay —{" "}
            <strong className="text-foreground">Đúng</strong>,{" "}
            <strong className="text-foreground">Đúng một phần</strong>, hoặc{" "}
            <strong className="text-foreground">Sai</strong>.
          </li>
          <li className="flex gap-2">
            <span className={cn("mt-1 h-1.5 w-1.5 shrink-0 rounded-full")} style={{ background: accent }} />
            Nếu trả lời sai, đáp án đúng sẽ được hiển thị ở cuối bài để bạn xem lại.
          </li>
          <li className="flex gap-2">
            <span className={cn("mt-1 h-1.5 w-1.5 shrink-0 rounded-full")} style={{ background: accent }} />
            Sau khi hoàn thành toàn bộ câu hỏi, bạn sẽ thấy tổng điểm và có thể xem lại từng câu
            cùng đáp án chính thức.
          </li>
        </ul>
      </div>
    </section>
  );
}

function Pill({ icon, children }: { icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-background/90 ring-1 ring-white/15 backdrop-blur">
      {icon} {children}
    </span>
  );
}
function Info({ label, value, hint }: { label: string; value: string; hint: string }) {
  return (
    <div className="rounded-2xl bg-surface p-4 ring-1 ring-border">
      <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </div>
      <div className="mt-1 font-display text-xl font-bold text-foreground">{value}</div>
      <div className="text-[11px] text-muted-foreground">{hint}</div>
    </div>
  );
}
