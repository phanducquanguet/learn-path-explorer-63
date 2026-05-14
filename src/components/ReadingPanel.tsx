import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowLeft,
  Bot,
  GraduationCap,
  Headphones,
  ListMusic,
  NotebookPen,
  Pause,
  Play,
  Plus,
  Send,
  Sparkles,
  StickyNote,
  User as UserIcon,
  Volume2,
  X,
} from "lucide-react";
import type { Activity } from "@/lib/lms-data";
import { cn } from "@/lib/utils";

/* ---------- Types ---------- */

type AudioTrack = {
  id: string;
  code: string; // e.g. "1.72"
  label: string; // descriptive label
  durationLabel: string;
  transcript?: { who?: string; text: string }[];
};

type Block =
  | { kind: "instruction"; text: string }
  | { kind: "wordbox"; words: string[] }
  | { kind: "imageGrid"; items: { n: number; emoji: string; caption: string }[] }
  | { kind: "speechBubble"; text: string }
  | { kind: "soundTable"; columns: { label: string; items: string[] }[] }
  | { kind: "passage"; text: string; tag?: string }
  | { kind: "passages"; items: { tag: string; text: string }[] };

type Task = {
  id: string;
  letter: string; // a, b, c, d, e
  audio?: AudioTrack;
  blocks: Block[];
};

type Section = {
  id: string;
  number: number;
  title: string;
  subtitle?: string;
  accent: "red" | "orange";
  tasks: Task[];
};

type Page = {
  id: string;
  pageNumber: number;
  badge: string; // "3A"
  title: string;
  tags: { kind: "G" | "V"; text: string }[];
  sections: Section[];
};

/* ---------- Sample content (mirrors the uploaded textbook page) ---------- */

const samplePages: Page[] = [
  {
    id: "p22",
    pageNumber: 22,
    badge: "3A",
    title: "Do you like fish?",
    tags: [
      { kind: "G", text: "Present simple: I / you / we / they" },
      { kind: "V", text: "Food 1" },
    ],
    sections: [
      {
        id: "s1",
        number: 1,
        title: "VOCABULARY",
        subtitle: "Food 1",
        accent: "red",
        tasks: [
          {
            id: "1a",
            letter: "a",
            audio: { id: "t-172a", code: "1.72", label: "Match & listen", durationLabel: "0:48" },
            blocks: [
              { kind: "instruction", text: "Match pictures 1–7 with the words in the box. Then listen and check." },
              { kind: "wordbox", words: ["fruit", "rice", "meat", "bread", "vegetables", "eggs", "fish"] },
              {
                kind: "imageGrid",
                items: [
                  { n: 1, emoji: "🥩", caption: "" },
                  { n: 2, emoji: "🐟", caption: "" },
                  { n: 3, emoji: "🥬", caption: "" },
                  { n: 4, emoji: "🍌", caption: "" },
                  { n: 5, emoji: "🍚", caption: "" },
                  { n: 6, emoji: "🥚", caption: "" },
                  { n: 7, emoji: "🍞", caption: "" },
                ],
              },
            ],
          },
          {
            id: "1b",
            letter: "b",
            audio: { id: "t-172b", code: "1.72", label: "Pronunciation", durationLabel: "0:36" },
            blocks: [
              {
                kind: "instruction",
                text: "Pronunciation Listen to the words in 1a again. Which word has more than one syllable? Underline the stressed syllable.",
              },
            ],
          },
          {
            id: "1c",
            letter: "c",
            blocks: [
              { kind: "instruction", text: "Say two things you like." },
              { kind: "speechBubble", text: "I like fruit and I like fish." },
            ],
          },
          {
            id: "1d",
            letter: "d",
            audio: { id: "t-173", code: "1.73", label: "Sound and spelling", durationLabel: "1:04" },
            blocks: [
              { kind: "instruction", text: "Sound and spelling /iː/, /ɪ/ and /aɪ/. Listen and practise these sounds: 1 /iː/ meat   2 /ɪ/ fish   3 /aɪ/ I'm" },
              {
                kind: "soundTable",
                columns: [
                  { label: "Sound 1 /iː/", items: ["meat"] },
                  { label: "Sound 2 /ɪ/", items: ["fish"] },
                  { label: "Sound 3 /aɪ/", items: ["I'm"] },
                ],
              },
            ],
          },
          {
            id: "1e",
            letter: "e",
            blocks: [{ kind: "instruction", text: "Now go to Vocabulary Focus 3A online." }],
          },
        ],
      },
      {
        id: "s2",
        number: 2,
        title: "READING AND GRAMMAR",
        subtitle: "Present simple: I / you / we / they — positive and negative",
        accent: "orange",
        tasks: [
          {
            id: "2a",
            letter: "a",
            blocks: [
              {
                kind: "instruction",
                text: "Which words in 1a can you see in pictures 1–3? Which word isn't in the pictures?",
              },
            ],
          },
          {
            id: "2b",
            letter: "b",
            audio: {
              id: "t-177",
              code: "1.77",
              label: "Food for one week — read & listen",
              durationLabel: "1:52",
              transcript: [
                { who: "a", text: "They eat a lot of fruit and vegetables every day. And they eat meat with rice. They like eggs, but they don't eat bread or fish. They don't like fish." },
                { who: "b", text: "They eat meat and eggs every day, but they don't eat fish. And they don't eat vegetables, but they eat fruit. They really like bread." },
                { who: "c", text: "They eat a lot of rice and vegetables. They like fruit and they eat bread. They don't eat fish or meat. They are vegetarians." },
              ],
            },
            blocks: [
              {
                kind: "instruction",
                text: "Read and listen to texts a–c. Match them with the families in pictures 1–3.",
              },
              {
                kind: "passages",
                items: [
                  { tag: "a", text: "They eat a lot of fruit and vegetables every day. And they eat meat with rice. They like eggs, but they don't eat bread or fish. They don't like fish." },
                  { tag: "b", text: "They eat meat and eggs every day, but they don't eat fish. And they don't eat vegetables, but they eat fruit. They really like bread." },
                  { tag: "c", text: "They eat a lot of rice and vegetables. They like fruit and they eat bread. They don't eat fish or meat. They are vegetarians." },
                ],
              },
            ],
          },
        ],
      },
    ],
  },
];

/* ---------- Notes ---------- */

type Note = { id: string; text: string; scope: string; scopeLabel: string; ts: number };

/* ---------- Main panel ---------- */

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
    label: "Toàn bài",
  });
  const [playingId, setPlayingId] = useState<string | null>(null);

  const accent = useMemo(() => `oklch(0.55 0.18 ${hue})`, [hue]);

  const allTracks = useMemo(
    () =>
      samplePages.flatMap((p) =>
        p.sections.flatMap((s) => s.tasks.filter((t) => t.audio).map((t) => t.audio!)),
      ),
    [],
  );

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
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl text-white font-display font-bold"
            style={{ background: `linear-gradient(135deg, ${accent}, oklch(0.65 0.18 ${(hue + 40) % 360}))` }}
          >
            3A
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
            <Headphones className="h-3.5 w-3.5" /> {allTracks.length} audio tracks
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
                playingId={playingId}
                onTogglePlay={(id) => setPlayingId((cur) => (cur === id ? null : id))}
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
                  onClick={() => setDraftScope({ id: "unit", label: "Toàn bài" })}
                >
                  Toàn bài
                </ScopeChip>
                {allTracks.map((t) => (
                  <ScopeChip
                    key={t.id}
                    active={draftScope.id === t.id}
                    onClick={() => setDraftScope({ id: t.id, label: `${t.code} ${t.label}` })}
                  >
                    {t.code}
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
                  Chưa có ghi chú nào. Bạn có thể take note cho cả unit hoặc cho từng track audio.
                </div>
              ) : (
                notes.map((n) => (
                  <div key={n.id} className="rounded-xl bg-surface-2/60 ring-1 ring-border/60 p-3">
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

/* ---------- Building blocks ---------- */

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

const ACCENTS: Record<Section["accent"], { bg: string; text: string; ring: string; soft: string }> = {
  red: { bg: "bg-rose-600", text: "text-rose-700", ring: "ring-rose-200", soft: "bg-rose-50" },
  orange: { bg: "bg-orange-500", text: "text-orange-700", ring: "ring-orange-200", soft: "bg-orange-50" },
};

function PdfPage({
  page,
  playingId,
  onTogglePlay,
  onTakeNote,
}: {
  page: Page;
  playingId: string | null;
  onTogglePlay: (id: string) => void;
  onTakeNote: (scopeId: string, scopeLabel: string) => void;
}) {
  return (
    <article className="relative bg-white rounded-xl shadow-[0_8px_30px_-12px_rgba(0,0,0,0.18)] ring-1 ring-black/5 overflow-hidden">
      {/* Page header — black + orange band like the textbook */}
      <div className="relative">
        <div className="flex items-stretch">
          <div className="flex items-center gap-4 bg-neutral-900 px-6 py-5 text-white flex-1 [clip-path:polygon(0_0,100%_0,calc(100%-28px)_100%,0_100%)]">
            <div className="font-display text-4xl font-bold leading-none">{page.badge}</div>
            <div className="font-display text-2xl font-semibold">{page.title}</div>
          </div>
          <div className="flex flex-col justify-center bg-orange-500 px-6 py-3 text-white text-xs font-semibold space-y-0.5 [clip-path:polygon(28px_0,100%_0,100%_100%,0_100%)] -ml-7">
            {page.tags.map((t, i) => (
              <div key={i} className="flex items-center gap-2">
                <span className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-white/25 text-[10px] font-bold">
                  {t.kind}
                </span>
                <span className="italic">{t.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="p-6 sm:p-8 space-y-7">
        {page.sections.map((section) => (
          <SectionView
            key={section.id}
            section={section}
            playingId={playingId}
            onTogglePlay={onTogglePlay}
            onTakeNote={onTakeNote}
          />
        ))}
      </div>

      <div className="px-6 py-3 border-t border-black/5 flex items-center justify-between bg-[oklch(0.99_0.005_260)]">
        <div className="text-[10px] text-neutral-400">Page {page.pageNumber}</div>
        <div className="text-[10px] text-neutral-400">UNICOM • Reading & Listening</div>
      </div>
    </article>
  );
}

function SectionView({
  section,
  playingId,
  onTogglePlay,
  onTakeNote,
}: {
  section: Section;
  playingId: string | null;
  onTogglePlay: (id: string) => void;
  onTakeNote: (scopeId: string, scopeLabel: string) => void;
}) {
  const a = ACCENTS[section.accent];
  return (
    <section>
      <div className="flex items-baseline gap-2 mb-3">
        <span
          className={cn(
            "inline-flex h-6 w-6 items-center justify-center rounded-sm text-white text-xs font-bold",
            a.bg,
          )}
        >
          {section.number}
        </span>
        <h3 className="font-display text-base font-bold uppercase tracking-wider text-neutral-900">
          {section.title}
        </h3>
        {section.subtitle && (
          <span className="text-sm italic text-neutral-700">{section.subtitle}</span>
        )}
      </div>

      <div className="space-y-4 pl-1">
        {section.tasks.map((task) => (
          <TaskView
            key={task.id}
            task={task}
            accent={section.accent}
            playing={!!task.audio && playingId === task.audio.id}
            onTogglePlay={() => task.audio && onTogglePlay(task.audio.id)}
            onTakeNote={() =>
              task.audio
                ? onTakeNote(task.audio.id, `${task.audio.code} ${task.audio.label}`)
                : onTakeNote(task.id, `Task ${section.number}${task.letter}`)
            }
          />
        ))}
      </div>
    </section>
  );
}

function TaskView({
  task,
  accent,
  playing,
  onTogglePlay,
  onTakeNote,
}: {
  task: Task;
  accent: Section["accent"];
  playing: boolean;
  onTogglePlay: () => void;
  onTakeNote: () => void;
}) {
  const a = ACCENTS[accent];
  return (
    <div className="flex gap-3">
      <span className={cn("font-display font-bold text-base shrink-0 w-5 leading-7", a.text)}>
        {task.letter}
      </span>
      <div className="flex-1 min-w-0 space-y-3">
        {task.audio && (
          <AudioChip
            track={task.audio}
            accent={accent}
            playing={playing}
            onToggle={onTogglePlay}
            onTakeNote={onTakeNote}
          />
        )}
        {task.blocks.map((block, i) => (
          <BlockView key={i} block={block} accent={accent} />
        ))}
      </div>
    </div>
  );
}

function AudioChip({
  track,
  accent,
  playing,
  onToggle,
  onTakeNote,
}: {
  track: AudioTrack;
  accent: Section["accent"];
  playing: boolean;
  onToggle: () => void;
  onTakeNote: () => void;
}) {
  const a = ACCENTS[accent];
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!playing) return;
    const id = window.setInterval(() => {
      setProgress((p) => (p >= 100 ? 0 : p + 1.5));
    }, 120);
    return () => window.clearInterval(id);
  }, [playing]);

  return (
    <div className={cn("inline-flex items-center gap-2 rounded-full pl-1 pr-3 py-1 ring-1", a.soft, a.ring)}>
      <button
        onClick={onToggle}
        className={cn(
          "inline-flex h-7 w-7 items-center justify-center rounded-full text-white shadow-sm transition active:scale-95",
          a.bg,
        )}
        aria-label={playing ? "Pause" : "Play"}
      >
        {playing ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5 translate-x-[1px]" />}
      </button>
      <span className={cn("font-mono text-[11px] font-bold", a.text)}>{track.code}</span>
      <span className="text-[11px] text-neutral-600 hidden sm:inline">· {track.label}</span>
      {playing && (
        <span className="hidden sm:flex items-center gap-1.5">
          <span className="h-1 w-20 rounded-full bg-black/10 overflow-hidden">
            <span
              className={cn("block h-full rounded-full transition-[width] duration-100", a.bg)}
              style={{ width: `${progress}%` }}
            />
          </span>
          <span className="text-[10px] text-neutral-500">{track.durationLabel}</span>
        </span>
      )}
      <button
        onClick={onTakeNote}
        className="inline-flex items-center gap-1 rounded-full bg-white/80 px-2 py-0.5 text-[10px] font-semibold text-neutral-700 ring-1 ring-black/5 hover:bg-white"
        title="Take note for this audio"
      >
        <NotebookPen className="h-3 w-3" /> Note
      </button>
    </div>
  );
}

function BlockView({ block, accent }: { block: Block; accent: Section["accent"] }) {
  const a = ACCENTS[accent];
  switch (block.kind) {
    case "instruction":
      return <p className="text-[14px] leading-relaxed text-neutral-800">{block.text}</p>;

    case "wordbox":
      return (
        <div className="inline-flex flex-wrap gap-x-4 gap-y-1 rounded border border-neutral-300 bg-neutral-50 px-3 py-1.5 text-sm font-medium text-neutral-800">
          {block.words.map((w) => (
            <span key={w}>{w}</span>
          ))}
        </div>
      );

    case "imageGrid":
      return (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {block.items.map((it) => (
            <div
              key={it.n}
              className="relative aspect-square rounded-lg ring-1 ring-black/10 overflow-hidden bg-gradient-to-br from-neutral-50 to-neutral-100 grid place-items-center"
            >
              <span className="text-5xl">{it.emoji}</span>
              <span className="absolute top-1.5 left-1.5 inline-flex h-5 w-5 items-center justify-center rounded-full border border-rose-500 bg-white text-[10px] font-bold text-rose-600">
                {it.n}
              </span>
            </div>
          ))}
        </div>
      );

    case "speechBubble":
      return (
        <div className="inline-block rounded-2xl bg-pink-100 text-neutral-800 px-4 py-2 text-sm shadow-sm">
          {block.text}
        </div>
      );

    case "soundTable":
      return (
        <div className="overflow-hidden rounded border border-neutral-300">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-neutral-50">
                {block.columns.map((c) => (
                  <th
                    key={c.label}
                    className="text-left px-3 py-1.5 font-semibold text-neutral-700 border-r last:border-r-0 border-neutral-300"
                  >
                    {c.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr>
                {block.columns.map((c, i) => (
                  <td key={i} className="px-3 py-2 text-neutral-700 border-r last:border-r-0 border-t border-neutral-300 italic">
                    {c.items.join(", ")}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      );

    case "passage":
      return (
        <div className="relative rounded-md bg-amber-50/60 px-4 py-3 text-sm text-neutral-800 italic">
          {block.tag && (
            <span className={cn("absolute -left-2 -top-2 inline-flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold text-white", a.bg)}>
              {block.tag}
            </span>
          )}
          {block.text}
        </div>
      );

    case "passages":
      return (
        <div className="grid gap-3 sm:grid-cols-3">
          {block.items.map((p) => (
            <div
              key={p.tag}
              className="relative rounded-md bg-amber-50/70 ring-1 ring-amber-100 px-4 py-3 text-[13px] text-neutral-800 italic"
            >
              <span className={cn("absolute -left-2 -top-2 inline-flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-bold text-white shadow", a.bg)}>
                {p.tag}
              </span>
              <Volume2 className="absolute right-2 top-2 h-3 w-3 text-amber-600/60" />
              {p.text}
            </div>
          ))}
        </div>
      );
  }
}
