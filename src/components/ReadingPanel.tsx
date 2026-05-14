import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  FileText,
  Headphones,
  NotebookPen,
  Pause,
  Play,
  Plus,
  StickyNote,
  X,
} from "lucide-react";
import type { Activity } from "@/lib/lms-data";
import { cn } from "@/lib/utils";

type AudioClip = {
  id: string;
  label: string;
  speakers: string;
  durationLabel: string;
  transcript: { who: string; text: string }[];
};

type ReadingPage = {
  id: string;
  number: number;
  title: string;
  kicker: string;
  paragraphs: string[];
  callout?: { title: string; text: string };
  vocab?: { word: string; meaning: string }[];
  audio?: AudioClip;
};

const samplePages: ReadingPage[] = [
  {
    id: "p1",
    number: 1,
    title: "Lesson 3A — Living abroad",
    kicker: "Reading & Listening",
    paragraphs: [
      "Moving to a new country can be both exciting and overwhelming. Most people experience a phase called the honeymoon, when everything feels fresh and inspiring — the food, the streets, even the way strangers greet each other.",
      "After a few months, however, small frustrations start to build up. Simple tasks like opening a bank account or understanding a doctor's appointment can suddenly feel exhausting. Researchers call this stage culture shock.",
    ],
    callout: {
      title: "Before you read",
      text: "Discuss with a partner: What would you miss most if you moved to another country for a year?",
    },
  },
  {
    id: "p2",
    number: 2,
    title: "Conversation 1 — Getting settled",
    kicker: "Listening practice",
    paragraphs: [
      "Listen to two students, Mia and Karim, talking about their first weeks studying abroad in Manchester. Take notes on what surprised each of them and how they handled it.",
    ],
    audio: {
      id: "a1",
      label: "Track 3.1 — Mia & Karim",
      speakers: "Mia · Karim",
      durationLabel: "2:14",
      transcript: [
        { who: "Mia", text: "Honestly, the first week was a blur. I kept getting lost on the bus." },
        { who: "Karim", text: "Same here! I missed my stop three times on day one." },
        { who: "Mia", text: "What helped me was just asking people. Everyone's been really friendly." },
        { who: "Karim", text: "Yeah, and the corner shop near campus basically adopted me." },
      ],
    },
  },
  {
    id: "p3",
    number: 3,
    title: "Conversation 2 — Making it home",
    kicker: "Listening practice",
    paragraphs: [
      "Now listen to a follow-up chat three months later. Notice how their tone changes when they talk about routines, friends, and food they actually cook now.",
    ],
    audio: {
      id: "a2",
      label: "Track 3.2 — Three months in",
      speakers: "Mia · Karim",
      durationLabel: "1:48",
      transcript: [
        { who: "Karim", text: "I finally cooked a proper meal last night — not just instant noodles." },
        { who: "Mia", text: "Look at you! I joined a climbing club, it's basically my second family now." },
        { who: "Karim", text: "That's the trick, right? Find your people and the city starts to feel like home." },
      ],
    },
    vocab: [
      { word: "settle in", meaning: "to start feeling comfortable in a new place" },
      { word: "homesick", meaning: "sad because you miss home" },
      { word: "pick up (a language)", meaning: "to learn something gradually" },
    ],
  },
  {
    id: "p4",
    number: 4,
    title: "After reading",
    kicker: "Reflection",
    paragraphs: [
      "Write a short paragraph (60–80 words) about a time you adapted to something new. Use at least three words from the vocabulary list above.",
    ],
    callout: {
      title: "Tip",
      text: "Try to include one example of past simple and one example of present perfect in your answer.",
    },
  },
];

type Note = { id: string; text: string; scope: string; scopeLabel: string; ts: number };

export function ReadingPanel({
  activity,
  hue,
  onClose,
}: {
  activity: Activity;
  hue: number;
  onClose: () => void;
}) {
  const [notesOpen, setNotesOpen] = useState(true);
  const [notes, setNotes] = useState<Note[]>([]);
  const [draft, setDraft] = useState("");
  const [draftScope, setDraftScope] = useState<{ id: string; label: string }>({
    id: "unit",
    label: "Whole unit",
  });
  const [playingId, setPlayingId] = useState<string | null>(null);

  const accent = useMemo(() => `oklch(0.55 0.18 ${hue})`, [hue]);

  const addNote = () => {
    const text = draft.trim();
    if (!text) return;
    setNotes((n) => [
      { id: crypto.randomUUID(), text, scope: draftScope.id, scopeLabel: draftScope.label, ts: Date.now() },
      ...n,
    ]);
    setDraft("");
  };

  return (
    <div className="rounded-3xl bg-surface ring-1 ring-border shadow-soft overflow-hidden">
      {/* Header */}
      <div
        className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 border-b border-border/70"
        style={{
          background: `linear-gradient(120deg, oklch(0.97 0.03 ${hue}) 0%, oklch(0.99 0.01 ${(hue + 40) % 360}) 100%)`,
        }}
      >
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={onClose}
            className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-surface ring-1 ring-border text-muted-foreground hover:text-foreground"
            aria-label="Quay lại khoá học"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl text-white"
            style={{ background: `linear-gradient(135deg, ${accent}, oklch(0.65 0.18 ${(hue + 40) % 360}))` }}
          >
            <FileText className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Bài đọc hiểu
            </div>
            <div className="truncate text-base font-semibold text-foreground">{activity.title}</div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="hidden md:inline-flex items-center gap-1.5 rounded-full bg-surface px-3 py-1.5 text-xs text-muted-foreground ring-1 ring-border">
            <Headphones className="h-3.5 w-3.5" /> {samplePages.filter((p) => p.audio).length} audio segments
          </span>
          <button
            onClick={() => setNotesOpen((v) => !v)}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-semibold ring-1 transition",
              notesOpen
                ? "bg-foreground text-background ring-foreground"
                : "bg-surface text-foreground ring-border hover:bg-muted",
            )}
          >
            <NotebookPen className="h-3.5 w-3.5" />
            {notesOpen ? "Ẩn ghi chú" : `Ghi chú (${notes.length})`}
          </button>
        </div>
      </div>

      {/* Body */}
      <div className={cn("grid gap-0", notesOpen ? "lg:grid-cols-[1fr_360px]" : "grid-cols-1")}>
        {/* PDF viewer */}
        <div className="bg-[oklch(0.97_0.005_260)] p-4 sm:p-6 lg:p-8 max-h-[calc(100vh-12rem)] overflow-y-auto">
          <div className="mx-auto max-w-3xl space-y-6">
            {samplePages.map((page) => (
              <PdfPage
                key={page.id}
                page={page}
                hue={hue}
                isPlaying={playingId === page.audio?.id}
                onTogglePlay={() =>
                  setPlayingId((cur) => (cur === page.audio?.id ? null : page.audio?.id ?? null))
                }
                onTakeNote={(scopeId, scopeLabel) => {
                  setDraftScope({ id: scopeId, label: scopeLabel });
                  setNotesOpen(true);
                }}
              />
            ))}
          </div>
        </div>

        {/* Notes panel */}
        {notesOpen && (
          <aside className="border-t lg:border-t-0 lg:border-l border-border/70 bg-surface flex flex-col max-h-[calc(100vh-12rem)]">
            <div className="px-4 py-3 border-b border-border/70 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <StickyNote className="h-4 w-4 text-muted-foreground" />
                <div className="text-sm font-semibold text-foreground">Sổ tay của tôi</div>
              </div>
              <span className="text-[11px] text-muted-foreground">{notes.length} ghi chú</span>
            </div>

            <div className="p-3 border-b border-border/70 space-y-2 bg-surface-2/40">
              <div className="flex flex-wrap gap-1">
                <ScopeChip
                  active={draftScope.id === "unit"}
                  onClick={() => setDraftScope({ id: "unit", label: "Whole unit" })}
                >
                  Toàn bài
                </ScopeChip>
                {samplePages
                  .filter((p) => p.audio)
                  .map((p) => (
                    <ScopeChip
                      key={p.audio!.id}
                      active={draftScope.id === p.audio!.id}
                      onClick={() => setDraftScope({ id: p.audio!.id, label: p.audio!.label })}
                    >
                      {p.audio!.label}
                    </ScopeChip>
                  ))}
              </div>
              <textarea
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder={`Take a note for "${draftScope.label}"...`}
                rows={3}
                className="w-full resize-none rounded-xl border border-border bg-surface px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-muted-foreground">
                  Gắn với: <span className="font-medium text-foreground">{draftScope.label}</span>
                </span>
                <button
                  onClick={addNote}
                  disabled={!draft.trim()}
                  className="inline-flex items-center gap-1 rounded-lg bg-foreground px-3 py-1.5 text-xs font-semibold text-background disabled:opacity-40"
                >
                  <Plus className="h-3 w-3" /> Lưu ghi chú
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-3 space-y-2">
              {notes.length === 0 ? (
                <div className="text-center text-xs text-muted-foreground py-10 px-4">
                  Chưa có ghi chú nào. Bạn có thể take note cho cả unit hoặc cho từng audio segment.
                </div>
              ) : (
                notes.map((n) => (
                  <div
                    key={n.id}
                    className="rounded-xl bg-surface-2/60 ring-1 ring-border/60 p-3"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span
                        className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold"
                        style={{
                          background: `oklch(0.95 0.04 ${hue})`,
                          color: `oklch(0.35 0.15 ${hue})`,
                        }}
                      >
                        {n.scopeLabel}
                      </span>
                      <button
                        onClick={() => setNotes((all) => all.filter((x) => x.id !== n.id))}
                        className="text-muted-foreground hover:text-foreground"
                        aria-label="Xoá"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                    <p className="text-[13px] text-foreground whitespace-pre-wrap">{n.text}</p>
                  </div>
                ))
              )}
            </div>
          </aside>
        )}
      </div>
    </div>
  );
}

function ScopeChip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-medium ring-1 transition",
        active
          ? "bg-foreground text-background ring-foreground"
          : "bg-surface text-muted-foreground ring-border hover:text-foreground",
      )}
    >
      {children}
    </button>
  );
}

function PdfPage({
  page,
  hue,
  isPlaying,
  onTogglePlay,
  onTakeNote,
}: {
  page: ReadingPage;
  hue: number;
  isPlaying: boolean;
  onTogglePlay: () => void;
  onTakeNote: (scopeId: string, scopeLabel: string) => void;
}) {
  return (
    <article className="relative bg-white rounded-xl shadow-[0_8px_30px_-12px_rgba(0,0,0,0.18)] ring-1 ring-black/5 overflow-hidden">
      {/* page header strip */}
      <div className="flex items-center justify-between px-6 py-3 border-b border-black/5 bg-[oklch(0.99_0.005_260)]">
        <div className="text-[10px] font-semibold uppercase tracking-[0.2em] text-neutral-500">
          {page.kicker}
        </div>
        <div className="text-[10px] text-neutral-400">Page {page.number}</div>
      </div>

      <div className="px-6 sm:px-10 py-8 space-y-5">
        <h2 className="font-display text-2xl font-bold text-neutral-900">{page.title}</h2>

        {page.paragraphs.map((p, i) => (
          <p key={i} className="text-[15px] leading-relaxed text-neutral-700">
            {p}
          </p>
        ))}

        {page.callout && (
          <div
            className="rounded-2xl p-4 ring-1"
            style={{
              background: `oklch(0.97 0.03 ${hue})`,
              borderColor: `oklch(0.85 0.08 ${hue})`,
              boxShadow: `inset 3px 0 0 oklch(0.6 0.18 ${hue})`,
            }}
          >
            <div className="text-[10px] font-bold uppercase tracking-wider text-neutral-600">
              {page.callout.title}
            </div>
            <div className="mt-1 text-sm text-neutral-700">{page.callout.text}</div>
          </div>
        )}

        {page.audio && (
          <AudioSegment
            clip={page.audio}
            hue={hue}
            isPlaying={isPlaying}
            onTogglePlay={onTogglePlay}
            onTakeNote={() => onTakeNote(page.audio!.id, page.audio!.label)}
          />
        )}

        {page.vocab && (
          <div className="rounded-2xl border border-dashed border-neutral-300 p-4">
            <div className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 mb-2">
              Key vocabulary
            </div>
            <ul className="grid gap-1.5 sm:grid-cols-2">
              {page.vocab.map((v) => (
                <li key={v.word} className="text-sm text-neutral-700">
                  <span className="font-semibold text-neutral-900">{v.word}</span>
                  <span className="text-neutral-500"> — {v.meaning}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </article>
  );
}

function AudioSegment({
  clip,
  hue,
  isPlaying,
  onTogglePlay,
  onTakeNote,
}: {
  clip: AudioClip;
  hue: number;
  isPlaying: boolean;
  onTogglePlay: () => void;
  onTakeNote: () => void;
}) {
  // Fake progress driven by interval when playing
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!isPlaying) return;
    const id = window.setInterval(() => {
      setProgress((p) => (p >= 100 ? 0 : p + 1.2));
    }, 120);
    return () => window.clearInterval(id);
  }, [isPlaying]);

  return (
    <div
      className="rounded-2xl p-4 ring-1"
      style={{
        background: `linear-gradient(120deg, oklch(0.98 0.02 ${hue}), oklch(0.96 0.03 ${(hue + 40) % 360}))`,
        borderColor: `oklch(0.9 0.05 ${hue})`,
      }}
    >
      <div className="flex items-center gap-3">
        <button
          onClick={onTogglePlay}
          className="inline-flex h-11 w-11 items-center justify-center rounded-full text-white shadow-md transition active:scale-95"
          style={{ background: `oklch(0.55 0.18 ${hue})` }}
          aria-label={isPlaying ? "Pause" : "Play"}
        >
          {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5 translate-x-[1px]" />}
        </button>
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <div className="truncate text-sm font-semibold text-neutral-800">{clip.label}</div>
            <div className="text-[11px] text-neutral-500">{clip.durationLabel}</div>
          </div>
          <div className="text-[11px] text-neutral-500">{clip.speakers}</div>
          <div className="mt-2 h-1.5 rounded-full bg-black/10 overflow-hidden">
            <div
              className="h-full rounded-full transition-[width] duration-100"
              style={{
                width: `${progress}%`,
                background: `oklch(0.55 0.18 ${hue})`,
              }}
            />
          </div>
        </div>
        <button
          onClick={onTakeNote}
          className="inline-flex items-center gap-1.5 rounded-xl bg-white px-3 py-2 text-xs font-semibold text-neutral-800 ring-1 ring-black/10 hover:bg-neutral-50"
        >
          <NotebookPen className="h-3.5 w-3.5" /> Take note
        </button>
      </div>

      <details className="mt-3 group">
        <summary className="cursor-pointer text-[11px] font-semibold uppercase tracking-wider text-neutral-500 hover:text-neutral-700">
          Show transcript
        </summary>
        <div className="mt-2 space-y-1.5 rounded-xl bg-white/70 p-3 ring-1 ring-black/5">
          {clip.transcript.map((line, i) => (
            <div key={i} className="text-sm text-neutral-700">
              <span
                className="font-semibold"
                style={{ color: `oklch(0.4 0.15 ${hue + (i % 2 ? 40 : 0)})` }}
              >
                {line.who}:
              </span>{" "}
              {line.text}
            </div>
          ))}
        </div>
      </details>
    </div>
  );
}
