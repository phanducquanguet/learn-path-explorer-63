import { useMemo, useState } from "react";
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  FileText,
  GraduationCap,
  Headphones,
  Mic,
  NotebookPen,
  Pause,
  Play,
  Plus,
  Send,
  StickyNote,
  Volume2,
  X,
} from "lucide-react";
import type { Activity } from "@/lib/lms-data";
import { cn } from "@/lib/utils";

type Note = { id: string; text: string; ts: number };
type TeacherQ = { id: string; text: string; ts: number; status: "pending" | "answered"; answer?: string };
type SideTab = "notes" | "teacher";


type Attachment =
  | { kind: "video"; label: string; src?: string }
  | { kind: "pdf"; label: string; pages?: number }
  | { kind: "audio"; label: string; duration?: string };

const demoAttachments: Attachment[] = [
  { kind: "video", label: "Mẫu phát âm — Native speaker" },
  { kind: "pdf", label: "Tài liệu phiên âm IPA", pages: 6 },
  { kind: "audio", label: "Âm thanh chậm để luyện nghe", duration: "2:14" },
];

const demoWords = [
  { word: "communicate", ipa: "/kəˈmjuːnɪkeɪt/", meaning: "giao tiếp" },
  { word: "pronunciation", ipa: "/prəˌnʌnsiˈeɪʃən/", meaning: "sự phát âm" },
  { word: "vocabulary", ipa: "/vəˈkæbjələri/", meaning: "từ vựng" },
  { word: "confidence", ipa: "/ˈkɒnfɪdəns/", meaning: "sự tự tin" },
  { word: "fluency", ipa: "/ˈfluːənsi/", meaning: "sự lưu loát" },
];

export function SpeakingPanel({
  activity,
  hue,
  onClose,
}: {
  activity: Activity;
  hue: number;
  onClose: () => void;
}) {
  const accent = useMemo(() => `oklch(0.55 0.18 ${hue})`, [hue]);
  const [idx, setIdx] = useState(0);
  const [recording, setRecording] = useState(false);
  const [playingVideo, setPlayingVideo] = useState(false);
  const [playingAudio, setPlayingAudio] = useState(false);

  // Sidebar (ẩn mặc định)
  const [sideOpen, setSideOpen] = useState(false);
  const [sideTab, setSideTab] = useState<SideTab>("notes");
  const [notes, setNotes] = useState<Note[]>([]);
  const [noteDraft, setNoteDraft] = useState("");
  const [teacherQs, setTeacherQs] = useState<TeacherQ[]>([]);
  const [teacherDraft, setTeacherDraft] = useState("");

  const total = demoWords.length;
  const current = demoWords[idx];

  const addNote = () => {
    const t = noteDraft.trim();
    if (!t) return;
    setNotes((n) => [{ id: crypto.randomUUID(), text: t, ts: Date.now() }, ...n]);
    setNoteDraft("");
  };
  const askTeacher = () => {
    const t = teacherDraft.trim();
    if (!t) return;
    setTeacherQs((q) => [
      { id: crypto.randomUUID(), text: t, ts: Date.now(), status: "pending" },
      ...q,
    ]);
    setTeacherDraft("");
  };
  const sideBadge: Record<SideTab, number> = {
    notes: notes.length,
    teacher: teacherQs.length,
  };

  return (
    <div className="overflow-hidden rounded-3xl bg-surface shadow-soft ring-1 ring-border">
      {/* Header */}
      <div
        className="flex flex-wrap items-center justify-between gap-3 border-b border-border/70 px-5 py-4"
        style={{
          background: `linear-gradient(120deg, oklch(0.97 0.03 ${hue}) 0%, oklch(0.99 0.01 ${(hue + 40) % 360}) 100%)`,
        }}
      >
        <div className="flex min-w-0 items-center gap-3">
          <button
            onClick={onClose}
            className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-surface text-muted-foreground ring-1 ring-border hover:text-foreground"
            aria-label="Quay lại khoá học"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl font-display font-bold text-white"
            style={{
              background: `linear-gradient(135deg, ${accent}, oklch(0.65 0.18 ${(hue + 40) % 360}))`,
            }}
          >
            <Mic className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Luyện nói
            </div>
            <div className="truncate text-base font-semibold text-foreground">{activity.title}</div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="hidden md:inline-flex items-center gap-1.5 rounded-full bg-surface px-3 py-1.5 text-xs text-muted-foreground ring-1 ring-border">
            <Mic className="h-3.5 w-3.5" /> {activity.duration} phút
          </span>
          <button
            onClick={() => setSideOpen((v) => !v)}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-semibold ring-1 transition",
              sideOpen
                ? "bg-foreground text-background ring-foreground"
                : "bg-surface text-foreground ring-border hover:bg-muted",
            )}
          >
            <NotebookPen className="h-3.5 w-3.5" />
            {sideOpen ? "Ẩn bảng phụ" : "Ghi chú & Hỏi giáo viên"}
          </button>
        </div>
      </div>

      {/* Body */}
      <div className={cn("grid gap-0", sideOpen ? "lg:grid-cols-[1fr_380px]" : "grid-cols-1")}>
      <div className="space-y-6 p-5 sm:p-7 lg:p-8">
        {activity.description && (
          <div className="rounded-2xl bg-muted/40 p-4 text-sm leading-relaxed text-foreground/90">
            {activity.description}
          </div>
        )}

        {/* Media attachments */}
        <section className="space-y-3">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            Tài liệu đi kèm
          </div>
          <div className="grid gap-3 lg:grid-cols-3">
            {/* Video */}
            <div className="rounded-2xl bg-background p-3 ring-1 ring-border">
              <div className="mb-2 flex items-center gap-1.5 text-[11px] font-semibold text-foreground">
                <Play className="h-3.5 w-3.5 text-primary" /> Video
              </div>
              <button
                onClick={() => setPlayingVideo((p) => !p)}
                className="relative flex aspect-video w-full items-center justify-center overflow-hidden rounded-xl text-white"
                style={{
                  background: `linear-gradient(135deg, oklch(0.25 0.06 ${hue}), oklch(0.18 0.04 ${(hue + 40) % 360}))`,
                }}
              >
                <span className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-white/95 text-foreground shadow-elevated">
                  {playingVideo ? (
                    <Pause className="h-6 w-6" fill="currentColor" />
                  ) : (
                    <Play className="h-6 w-6 translate-x-[2px]" fill="currentColor" />
                  )}
                </span>
              </button>
              <div className="mt-2 truncate text-xs text-muted-foreground">
                {demoAttachments[0].label}
              </div>
            </div>

            {/* PDF */}
            <div className="rounded-2xl bg-background p-3 ring-1 ring-border">
              <div className="mb-2 flex items-center gap-1.5 text-[11px] font-semibold text-foreground">
                <FileText className="h-3.5 w-3.5 text-primary" /> PDF
              </div>
              <div className="flex aspect-video w-full flex-col items-center justify-center rounded-xl bg-muted/60 text-foreground">
                <FileText className="h-10 w-10 text-primary/70" />
                <div className="mt-1 text-xs text-muted-foreground">
                  {(demoAttachments[1] as { pages?: number }).pages} trang
                </div>
              </div>
              <div className="mt-2 flex items-center justify-between gap-2 text-xs">
                <span className="truncate text-muted-foreground">{demoAttachments[1].label}</span>
                <button className="rounded-lg bg-foreground px-2.5 py-1 text-[11px] font-semibold text-background hover:opacity-90">
                  Mở
                </button>
              </div>
            </div>

            {/* Audio */}
            <div className="rounded-2xl bg-background p-3 ring-1 ring-border">
              <div className="mb-2 flex items-center gap-1.5 text-[11px] font-semibold text-foreground">
                <Headphones className="h-3.5 w-3.5 text-primary" /> Audio
              </div>
              <div className="flex aspect-video w-full flex-col items-center justify-center gap-2 rounded-xl bg-muted/60">
                <button
                  onClick={() => setPlayingAudio((p) => !p)}
                  className="inline-flex h-12 w-12 items-center justify-center rounded-full text-white shadow-elevated"
                  style={{ background: accent }}
                >
                  {playingAudio ? <Pause className="h-5 w-5" fill="currentColor" /> : <Play className="h-5 w-5 translate-x-[2px]" fill="currentColor" />}
                </button>
                <div className="text-[11px] text-muted-foreground">
                  {(demoAttachments[2] as { duration?: string }).duration}
                </div>
              </div>
              <div className="mt-2 truncate text-xs text-muted-foreground">
                {demoAttachments[2].label}
              </div>
            </div>
          </div>
        </section>

        {/* Word practice */}
        <section
          className="rounded-3xl border border-border bg-gradient-to-br p-6 sm:p-8"
          style={{
            backgroundImage: `linear-gradient(135deg, oklch(0.97 0.04 ${hue}) 0%, oklch(0.99 0.01 ${(hue + 40) % 360}) 100%)`,
          }}
        >
          <div className="mb-4 flex items-center justify-between text-xs font-semibold text-muted-foreground">
            <span>Luyện phát âm theo từ</span>
            <span>
              Từ <span className="text-foreground">{idx + 1}</span> / {total}
            </span>
          </div>

          <div className="mb-5 h-1.5 w-full overflow-hidden rounded-full bg-background/80 ring-1 ring-border">
            <div
              className="h-full transition-all"
              style={{
                width: `${((idx + 1) / total) * 100}%`,
                background: accent,
              }}
            />
          </div>

          <div className="rounded-2xl bg-background p-6 text-center shadow-soft ring-1 ring-border sm:p-8">
            <div className="text-3xl font-bold tracking-tight text-foreground sm:text-5xl">
              {current.word}
            </div>
            <div className="mt-2 font-mono text-sm text-primary sm:text-base">{current.ipa}</div>
            <div className="mt-1 text-sm text-muted-foreground">{current.meaning}</div>

            <div className="mt-5 flex items-center justify-center gap-2">
              <button
                onClick={() => setPlayingAudio((p) => !p)}
                className="inline-flex items-center gap-1.5 rounded-full bg-muted px-3 py-2 text-xs font-semibold text-foreground hover:bg-muted/70"
                title="Nghe mẫu"
              >
                <Volume2 className="h-3.5 w-3.5" /> Nghe mẫu
              </button>
              <button
                onClick={() => setRecording((r) => !r)}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-full px-5 py-2 text-sm font-semibold text-white shadow-soft transition",
                  recording && "animate-pulse",
                )}
                style={{
                  background: recording
                    ? "oklch(0.55 0.22 25)"
                    : accent,
                }}
              >
                <Mic className="h-4 w-4" />
                {recording ? "Đang ghi… bấm để dừng" : "Đọc từ này"}
              </button>
            </div>
          </div>

          <div className="mt-5 flex items-center justify-between gap-2">
            <button
              onClick={() => {
                setIdx((i) => Math.max(0, i - 1));
                setRecording(false);
              }}
              disabled={idx === 0}
              className="inline-flex items-center gap-1.5 rounded-xl bg-surface px-4 py-2.5 text-sm font-semibold text-foreground ring-1 ring-border hover:bg-muted disabled:opacity-40"
            >
              <ChevronLeft className="h-4 w-4" /> Trước
            </button>

            <div className="hidden flex-1 items-center justify-center gap-1.5 sm:flex">
              {demoWords.map((_, i) => (
                <button
                  key={i}
                  onClick={() => {
                    setIdx(i);
                    setRecording(false);
                  }}
                  className={cn(
                    "h-2 rounded-full transition-all",
                    i === idx ? "w-6" : "w-2",
                  )}
                  style={{
                    background: i <= idx ? accent : "oklch(0.9 0.01 260)",
                  }}
                  aria-label={`Từ ${i + 1}`}
                />
              ))}
            </div>

            {idx < total - 1 ? (
              <button
                onClick={() => {
                  setIdx((i) => i + 1);
                  setRecording(false);
                }}
                className="inline-flex items-center gap-1.5 rounded-xl bg-foreground px-4 py-2.5 text-sm font-semibold text-background hover:opacity-90"
              >
                Next <ChevronRight className="h-4 w-4" />
              </button>
            ) : (
              <button
                onClick={onClose}
                className="inline-flex items-center gap-1.5 rounded-xl px-4 py-2.5 text-sm font-semibold text-white"
                style={{ background: accent }}
              >
                Hoàn thành
              </button>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
