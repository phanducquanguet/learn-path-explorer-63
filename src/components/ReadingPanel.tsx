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
  | { kind: "passages"; items: { tag: string; text: string }[] }
  | {
      kind: "mcq";
      prompt?: string;
      questions: { id: string; q: string; options: string[]; answer: number }[];
    };

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
      {
        id: "s11",
        number: 11,
        title: "LISTENING PRACTICE",
        subtitle: "Listen to the conversation and answer the questions",
        accent: "red",
        tasks: [
          {
            id: "11a",
            letter: "a",
            audio: {
              id: "t-q11",
              code: "1.84",
              label: "Conversation: At the supermarket",
              durationLabel: "1:42",
            },
            blocks: [
              {
                kind: "instruction",
                text: "Câu hỏi 11. Nghe đoạn hội thoại giữa Anna và Mark khi họ đi siêu thị. Sau đó chọn đáp án đúng (A, B, C hoặc D) cho mỗi câu hỏi dưới đây.",
              },
              {
                kind: "mcq",
                prompt: "Dựa vào audio phía trên, chọn đáp án đúng cho 5 câu hỏi sau:",
                questions: [
                  {
                    id: "q11-1",
                    q: "1. Where are Anna and Mark?",
                    options: ["At a restaurant", "At a supermarket", "At Anna's house", "At a market stall"],
                    answer: 1,
                  },
                  {
                    id: "q11-2",
                    q: "2. What does Anna want to buy first?",
                    options: ["Bread and eggs", "Fruit and vegetables", "Meat and rice", "Fish and bread"],
                    answer: 1,
                  },
                  {
                    id: "q11-3",
                    q: "3. Why doesn't Mark want fish?",
                    options: ["It is too expensive", "He doesn't like fish", "He is allergic to fish", "There is no fish today"],
                    answer: 1,
                  },
                  {
                    id: "q11-4",
                    q: "4. How many eggs do they buy?",
                    options: ["Six", "Ten", "Twelve", "Twenty"],
                    answer: 2,
                  },
                  {
                    id: "q11-5",
                    q: "5. What do they decide to cook for dinner?",
                    options: ["Rice with vegetables", "Meat with bread", "Fish and rice", "Eggs and fruit"],
                    answer: 0,
                  },
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

type TeacherQ = {
  id: string;
  text: string;
  scopeLabel: string;
  ts: number;
  status: "pending" | "answered";
  answer?: string;
};

type ChatMsg = { id: string; role: "user" | "ai"; text: string; ts: number };

type SidebarTab = "tracks" | "notes" | "teacher" | "ai";

/* ---------- Main panel ---------- */

export function ReadingPanel({
  activity,
  hue,
  onClose,
  audience = "student",
}: {
  activity: Activity;
  hue: number;
  onClose: () => void;
  audience?: "student" | "teacher";
}) {
  const isTeacher = audience === "teacher";
  const [sideTab, setSideTab] = useState<SidebarTab>("tracks");
  const [sideOpen, setSideOpen] = useState(true);
  const [notes, setNotes] = useState<Note[]>([]);
  const [draft, setDraft] = useState("");
  const [draftScope, setDraftScope] = useState<{ id: string; label: string }>({
    id: "unit",
    label: "Toàn bài",
  });
  const [playingId, setPlayingId] = useState<string | null>(null);

  const [teacherDraft, setTeacherDraft] = useState("");
  const [teacherScope, setTeacherScope] = useState<{ id: string; label: string }>({
    id: "unit",
    label: "Toàn bài",
  });
  const [teacherQs, setTeacherQs] = useState<TeacherQ[]>([]);

  const [chat, setChat] = useState<ChatMsg[]>([
    {
      id: "ai-hello",
      role: "ai",
      text: "Xin chào! Mình là AI luyện tập của bạn. Hỏi mình về từ vựng, phát âm, ngữ pháp, hoặc thử hội thoại theo chủ đề bài học nhé!",
      ts: Date.now(),
    },
  ]);
  const [chatDraft, setChatDraft] = useState("");
  const chatEndRef = useRef<HTMLDivElement>(null);

  const accent = useMemo(() => `oklch(0.55 0.18 ${hue})`, [hue]);

  const tracksByTask = useMemo(
    () =>
      samplePages.flatMap((p) =>
        p.sections.flatMap((s) =>
          s.tasks
            .filter((t) => t.audio)
            .map((t) => ({
              taskKey: `${s.number}${t.letter}`,
              sectionTitle: s.title,
              accent: s.accent,
              track: t.audio!,
            })),
        ),
      ),
    [],
  );

  const allTracks = useMemo(() => tracksByTask.map((x) => x.track), [tracksByTask]);

  const addNote = () => {
    const text = draft.trim();
    if (!text) return;
    setNotes((n) => [
      { id: crypto.randomUUID(), text, scope: draftScope.id, scopeLabel: draftScope.label, ts: Date.now() },
      ...n,
    ]);
    setDraft("");
  };

  const askTeacher = () => {
    const text = teacherDraft.trim();
    if (!text) return;
    setTeacherQs((q) => [
      {
        id: crypto.randomUUID(),
        text,
        scopeLabel: teacherScope.label,
        ts: Date.now(),
        status: "pending",
      },
      ...q,
    ]);
    setTeacherDraft("");
  };

  const sendChat = () => {
    const text = chatDraft.trim();
    if (!text) return;
    const userMsg: ChatMsg = { id: crypto.randomUUID(), role: "user", text, ts: Date.now() };
    setChat((c) => [...c, userMsg]);
    setChatDraft("");
    setTimeout(() => {
      setChat((c) => [
        ...c,
        {
          id: crypto.randomUUID(),
          role: "ai",
          text: `Câu hỏi hay! Liên quan đến "${text.slice(0, 40)}${text.length > 40 ? "…" : ""}". Mình gợi ý: thử dùng cấu trúc Present simple với "I/you/we/they" như trong bài, ví dụ: "I like fish, but I don't eat meat." Bạn thử nói lại theo sở thích của mình nhé!`,
          ts: Date.now(),
        },
      ]);
    }, 600);
  };

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [chat]);

  const sideBadge: Record<SidebarTab, number> = {
    tracks: allTracks.length,
    notes: notes.length,
    teacher: teacherQs.length,
    ai: chat.filter((m) => m.role === "user").length,
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
            onClick={() => setSideOpen((v) => !v)}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-semibold ring-1 transition",
              sideOpen
                ? "bg-foreground text-background ring-foreground"
                : "bg-surface text-foreground ring-border hover:bg-muted",
            )}
          >
            <NotebookPen className="h-3.5 w-3.5" />
            {sideOpen ? "Ẩn bảng phụ" : "Mở bảng phụ"}
          </button>
        </div>
      </div>

      {/* Body */}
      <div className={cn("grid gap-0", sideOpen ? "lg:grid-cols-[1fr_400px]" : "grid-cols-1")}>
        {/* PDF viewer */}
        <div className="bg-[oklch(0.97_0.005_260)] p-4 sm:p-6 lg:p-8 max-h-[calc(100vh-12rem)] overflow-y-auto">
          <div className="mx-auto max-w-3xl space-y-6">
            <LessonIntro
              title={activity.title}
              description={
                activity.description ??
                `Trong bài học này, học viên sẽ:\n• Học từ vựng chủ đề Food (thịt, cá, rau củ, trái cây, trứng, cơm, bánh mì).\n• Luyện phát âm 3 âm /iː/, /ɪ/, /aɪ/ và xác định trọng âm.\n• Đọc – nghe 3 đoạn ngắn về thói quen ăn uống của các gia đình.\n• Áp dụng Present simple (I/you/we/they) để nói về sở thích ăn uống của bản thân.\n• Hoàn thành phần Listening practice với 5 câu hỏi trắc nghiệm.`
              }
              accent={accent}
            />
            {samplePages.map((page) => (
              <PdfPage
                key={page.id}
                page={page}
                playingId={playingId}
                onTogglePlay={(id) => setPlayingId((cur) => (cur === id ? null : id))}
                onTakeNote={isTeacher ? undefined : (scopeId, scopeLabel) => {
                  setDraftScope({ id: scopeId, label: scopeLabel });
                  setSideTab("notes");
                  setSideOpen(true);
                }}
              />
            ))}
          </div>
        </div>


        {/* Right tabbed panel */}
        {sideOpen && (
          <aside className="border-t lg:border-t-0 lg:border-l border-border/70 bg-surface flex flex-col max-h-[calc(100vh-12rem)]">
            <div className="flex border-b border-border/70 bg-surface-2/40">
              {(
                (isTeacher
                  ? [
                      { id: "tracks", label: "Tracks", icon: ListMusic },
                      { id: "ai", label: "AI", icon: Bot },
                    ]
                  : [
                      { id: "tracks", label: "Tracks", icon: ListMusic },
                      { id: "notes", label: "Ghi chú", icon: StickyNote },
                      { id: "teacher", label: "Giáo viên", icon: GraduationCap },
                      { id: "ai", label: "AI", icon: Bot },
                    ]) as { id: SidebarTab; label: string; icon: typeof ListMusic }[]
              ).map((t) => {
                const active = sideTab === t.id;
                const Icon = t.icon;
                return (
                  <button
                    key={t.id}
                    onClick={() => setSideTab(t.id)}
                    className={cn(
                      "flex-1 inline-flex items-center justify-center gap-1.5 px-2 py-2.5 text-[11px] font-semibold transition border-b-2",
                      active
                        ? "text-foreground border-foreground bg-surface"
                        : "text-muted-foreground border-transparent hover:text-foreground",
                    )}
                  >
                    <Icon className="h-3.5 w-3.5" />
                    <span>{t.label}</span>
                    {sideBadge[t.id] > 0 && (
                      <span
                        className={cn(
                          "rounded-full px-1.5 text-[9px] font-bold",
                          active ? "bg-foreground text-background" : "bg-muted text-muted-foreground",
                        )}
                      >
                        {sideBadge[t.id]}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {sideTab === "tracks" && (
              <TracksTab
                tracksByTask={tracksByTask}
                playingId={playingId}
                onTogglePlay={(id) => setPlayingId((cur) => (cur === id ? null : id))}
                hue={hue}
              />
            )}
            {sideTab === "notes" && (
              <NotesTab
                notes={notes}
                draft={draft}
                setDraft={setDraft}
                draftScope={draftScope}
                setDraftScope={setDraftScope}
                allTracks={allTracks}
                addNote={addNote}
                onDelete={(id) => setNotes((all) => all.filter((x) => x.id !== id))}
                hue={hue}
              />
            )}
            {sideTab === "teacher" && (
              <TeacherTab
                draft={teacherDraft}
                setDraft={setTeacherDraft}
                scope={teacherScope}
                setScope={setTeacherScope}
                allTracks={allTracks}
                items={teacherQs}
                onAsk={askTeacher}
                onDelete={(id) => setTeacherQs((all) => all.filter((x) => x.id !== id))}
                hue={hue}
              />
            )}
            {sideTab === "ai" && (
              <AiTab
                chat={chat}
                draft={chatDraft}
                setDraft={setChatDraft}
                onSend={sendChat}
                endRef={chatEndRef}
                hue={hue}
              />
            )}
          </aside>
        )}
      </div>
    </div>
  );
}

/* ---------- Sidebar tabs ---------- */

function TracksTab({
  tracksByTask,
  playingId,
  onTogglePlay,
  hue,
}: {
  tracksByTask: { taskKey: string; sectionTitle: string; accent: Section["accent"]; track: AudioTrack }[];
  playingId: string | null;
  onTogglePlay: (id: string) => void;
  hue: number;
}) {
  return (
    <div className="flex-1 overflow-y-auto p-3 space-y-2">
      <div className="px-1 pb-1 text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
        Danh sách audio theo từng bài
      </div>
      {tracksByTask.map(({ taskKey, sectionTitle, accent, track }) => {
        const playing = playingId === track.id;
        const a = ACCENTS[accent];
        return (
          <div
            key={track.id}
            className={cn(
              "rounded-xl ring-1 p-3 transition",
              playing ? "bg-surface-2 ring-foreground/30 shadow-soft" : "bg-surface-2/50 ring-border/60 hover:bg-surface-2",
            )}
          >
            <div className="flex items-center gap-2 mb-1.5">
              <span
                className="rounded-md px-1.5 py-0.5 text-[10px] font-bold text-white"
                style={{ background: `oklch(0.55 0.18 ${hue})` }}
              >
                Task {taskKey}
              </span>
              <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold truncate">
                {sectionTitle}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => onTogglePlay(track.id)}
                className={cn(
                  "inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-white shadow-sm transition active:scale-95",
                  a.bg,
                )}
                aria-label={playing ? "Pause" : "Play"}
              >
                {playing ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4 translate-x-[1px]" />}
              </button>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <span className={cn("font-mono text-[12px] font-bold", a.text)}>{track.code}</span>
                  <span className="text-[11px] text-muted-foreground">· {track.durationLabel}</span>
                </div>
                <div className="truncate text-[12px] text-foreground">{track.label}</div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function NotesTab({
  notes,
  draft,
  setDraft,
  draftScope,
  setDraftScope,
  allTracks,
  addNote,
  onDelete,
  hue,
}: {
  notes: Note[];
  draft: string;
  setDraft: (v: string) => void;
  draftScope: { id: string; label: string };
  setDraftScope: (s: { id: string; label: string }) => void;
  allTracks: AudioTrack[];
  addNote: () => void;
  onDelete: (id: string) => void;
  hue: number;
}) {
  return (
    <>
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
                  onClick={() => onDelete(n.id)}
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
    </>
  );
}

function TeacherTab({
  draft,
  setDraft,
  scope,
  setScope,
  allTracks,
  items,
  onAsk,
  onDelete,
  hue,
}: {
  draft: string;
  setDraft: (v: string) => void;
  scope: { id: string; label: string };
  setScope: (s: { id: string; label: string }) => void;
  allTracks: AudioTrack[];
  items: TeacherQ[];
  onAsk: () => void;
  onDelete: (id: string) => void;
  hue: number;
}) {
  return (
    <>
      <div className="p-3 border-b border-border/70 space-y-2 bg-surface-2/40">
        <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
          <GraduationCap className="h-3.5 w-3.5" />
          Câu hỏi sẽ được gửi đến giáo viên phụ trách lớp.
        </div>
        <div className="flex flex-wrap gap-1">
          <ScopeChip active={scope.id === "unit"} onClick={() => setScope({ id: "unit", label: "Toàn bài" })}>
            Toàn bài
          </ScopeChip>
          {allTracks.map((t) => (
            <ScopeChip
              key={t.id}
              active={scope.id === t.id}
              onClick={() => setScope({ id: t.id, label: `${t.code} ${t.label}` })}
            >
              {t.code}
            </ScopeChip>
          ))}
        </div>
        <textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Em chưa hiểu phần... thầy/cô có thể giải thích lại không ạ?"
          rows={3}
          className="w-full resize-none rounded-xl border border-border bg-surface px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
        />
        <div className="flex items-center justify-between">
          <span className="text-[10px] text-muted-foreground">
            Gắn với: <span className="font-medium text-foreground">{scope.label}</span>
          </span>
          <button
            onClick={onAsk}
            disabled={!draft.trim()}
            className="inline-flex items-center gap-1 rounded-lg bg-foreground px-3 py-1.5 text-xs font-semibold text-background disabled:opacity-40"
          >
            <Send className="h-3 w-3" /> Gửi
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {items.length === 0 ? (
          <div className="text-center text-xs text-muted-foreground py-10 px-4">
            Chưa có câu hỏi nào. Hãy đặt câu hỏi cho giáo viên về phần bạn đang gặp khó khăn.
          </div>
        ) : (
          items.map((q) => (
            <div key={q.id} className="rounded-xl bg-surface-2/60 ring-1 ring-border/60 p-3 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span
                    className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold"
                    style={{
                      background: `oklch(0.95 0.04 ${hue})`,
                      color: `oklch(0.35 0.15 ${hue})`,
                    }}
                  >
                    {q.scopeLabel}
                  </span>
                  <span
                    className={cn(
                      "rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider",
                      q.status === "pending"
                        ? "bg-amber-100 text-amber-700"
                        : "bg-emerald-100 text-emerald-700",
                    )}
                  >
                    {q.status === "pending" ? "Chờ trả lời" : "Đã trả lời"}
                  </span>
                </div>
                <button
                  onClick={() => onDelete(q.id)}
                  className="text-muted-foreground hover:text-foreground"
                  aria-label="Xoá"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
              <p className="text-[13px] text-foreground whitespace-pre-wrap">{q.text}</p>
              {q.answer && (
                <div className="rounded-lg bg-emerald-50 ring-1 ring-emerald-100 p-2 text-[12px] text-emerald-900">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 mb-0.5">
                    Giáo viên
                  </div>
                  {q.answer}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </>
  );
}

function AiTab({
  chat,
  draft,
  setDraft,
  onSend,
  endRef,
  hue,
}: {
  chat: ChatMsg[];
  draft: string;
  setDraft: (v: string) => void;
  onSend: () => void;
  endRef: React.RefObject<HTMLDivElement | null>;
  hue: number;
}) {
  return (
    <>
      <div className="px-3 py-2 border-b border-border/70 bg-surface-2/40 flex items-center gap-2">
        <div
          className="flex h-7 w-7 items-center justify-center rounded-full text-white"
          style={{ background: `linear-gradient(135deg, oklch(0.55 0.2 ${hue}), oklch(0.65 0.18 ${(hue + 60) % 360}))` }}
        >
          <Sparkles className="h-3.5 w-3.5" />
        </div>
        <div className="min-w-0">
          <div className="text-[12px] font-semibold text-foreground">AI luyện tập</div>
          <div className="text-[10px] text-muted-foreground truncate">
            Hỏi đáp & hội thoại theo nội dung bài
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {chat.map((m) => {
          const isUser = m.role === "user";
          return (
            <div key={m.id} className={cn("flex gap-2", isUser && "flex-row-reverse")}>
              <div
                className={cn(
                  "h-7 w-7 shrink-0 rounded-full flex items-center justify-center text-white",
                  isUser ? "bg-foreground" : "",
                )}
                style={
                  isUser
                    ? undefined
                    : { background: `linear-gradient(135deg, oklch(0.55 0.2 ${hue}), oklch(0.65 0.18 ${(hue + 60) % 360}))` }
                }
              >
                {isUser ? <UserIcon className="h-3.5 w-3.5" /> : <Bot className="h-3.5 w-3.5" />}
              </div>
              <div
                className={cn(
                  "max-w-[80%] rounded-2xl px-3 py-2 text-[13px] leading-relaxed",
                  isUser
                    ? "bg-foreground text-background rounded-tr-sm"
                    : "bg-surface-2 ring-1 ring-border/60 text-foreground rounded-tl-sm",
                )}
              >
                {m.text}
              </div>
            </div>
          );
        })}
        <div ref={endRef} />
      </div>

      <div className="p-3 border-t border-border/70 bg-surface-2/40">
        <div className="flex items-end gap-2">
          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                onSend();
              }
            }}
            placeholder="Hỏi AI hoặc luyện hội thoại..."
            rows={2}
            className="flex-1 resize-none rounded-xl border border-border bg-surface px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
          <button
            onClick={onSend}
            disabled={!draft.trim()}
            className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-foreground text-background disabled:opacity-40"
            aria-label="Gửi"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
        <div className="mt-1 text-[10px] text-muted-foreground">
          Enter để gửi · Shift+Enter để xuống dòng
        </div>
      </div>
    </>
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

function LessonIntro({
  title,
  description,
  accent,
}: {
  title: string;
  description: string;
  accent: string;
}) {
  const [open, setOpen] = useState(true);
  const lines = description.split("\n").filter((l) => l.trim().length > 0);
  return (
    <section
      className="overflow-hidden rounded-2xl bg-surface ring-1 ring-border shadow-soft"
      style={{
        background: `linear-gradient(135deg, color-mix(in oklab, ${accent} 8%, var(--surface, #fff)), var(--surface, #fff))`,
      }}
    >
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between gap-3 px-5 py-3.5 text-left"
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <span
            className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-white"
            style={{ background: accent }}
          >
            <Sparkles className="h-3.5 w-3.5" />
          </span>
          <div className="min-w-0">
            <div className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: accent }}>
              Giới thiệu nội dung
            </div>
            <div className="truncate text-sm font-semibold text-foreground">{title}</div>
          </div>
        </div>
        <span className="text-[11px] font-semibold text-muted-foreground">
          {open ? "Thu gọn" : "Mở rộng"}
        </span>
      </button>
      {open && (
        <div className="border-t border-border/70 bg-background/60 px-5 py-4 backdrop-blur">
          <ul className="space-y-1.5 text-sm leading-relaxed text-foreground/90">
            {lines.map((l, i) => {
              const clean = l.replace(/^[-•]\s*/, "").trim();
              return (
                <li key={i} className="flex gap-2">
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full" style={{ background: accent }} />
                  <span>{clean}</span>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </section>
  );
}

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

    case "mcq":
      return <McqBlock block={block} accent={accent} />;
  }
}

function McqBlock({
  block,
  accent,
}: {
  block: Extract<Block, { kind: "mcq" }>;
  accent: Section["accent"];
}) {
  const a = ACCENTS[accent];
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [submitted, setSubmitted] = useState(false);

  const total = block.questions.length;
  const answered = Object.keys(answers).length;
  const correct = block.questions.filter((q) => answers[q.id] === q.answer).length;

  return (
    <div className="rounded-xl border border-neutral-200 bg-white p-4 space-y-4">
      {block.prompt && (
        <p className="text-[13px] font-medium text-neutral-700">{block.prompt}</p>
      )}
      <ol className="space-y-4">
        {block.questions.map((q) => {
          const picked = answers[q.id];
          return (
            <li key={q.id} className="space-y-2">
              <p className="text-[14px] font-semibold text-neutral-900">{q.q}</p>
              <div className="grid gap-1.5 sm:grid-cols-2">
                {q.options.map((opt, i) => {
                  const selected = picked === i;
                  const isCorrect = i === q.answer;
                  const showState = submitted && (selected || isCorrect);
                  return (
                    <button
                      key={i}
                      type="button"
                      onClick={() => !submitted && setAnswers((s) => ({ ...s, [q.id]: i }))}
                      className={cn(
                        "flex items-start gap-2 rounded-lg border px-3 py-2 text-left text-[13px] transition",
                        !submitted && selected && "border-neutral-900 bg-neutral-50",
                        !submitted && !selected && "border-neutral-200 hover:border-neutral-400 bg-white",
                        submitted && isCorrect && "border-emerald-500 bg-emerald-50 text-emerald-900",
                        submitted && selected && !isCorrect && "border-rose-500 bg-rose-50 text-rose-900",
                        submitted && !selected && !isCorrect && "border-neutral-200 bg-white text-neutral-500",
                        submitted && "cursor-default",
                      )}
                    >
                      <span
                        className={cn(
                          "inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full border text-[10px] font-bold",
                          selected ? "border-current" : "border-neutral-300",
                          !submitted && selected && a.text,
                        )}
                      >
                        {String.fromCharCode(65 + i)}
                      </span>
                      <span className="leading-snug">{opt}</span>
                    </button>
                  );
                })}
              </div>
            </li>
          );
        })}
      </ol>
      <div className="flex items-center justify-between border-t border-neutral-200 pt-3">
        <span className="text-[12px] text-neutral-600">
          {submitted
            ? `Kết quả: ${correct}/${total} câu đúng`
            : `Đã trả lời ${answered}/${total}`}
        </span>
        <div className="flex items-center gap-2">
          {submitted && (
            <button
              onClick={() => {
                setAnswers({});
                setSubmitted(false);
              }}
              className="rounded-lg border border-neutral-300 bg-white px-3 py-1.5 text-xs font-semibold text-neutral-700 hover:bg-neutral-50"
            >
              Làm lại
            </button>
          )}
          <button
            onClick={() => setSubmitted(true)}
            disabled={submitted || answered < total}
            className={cn(
              "rounded-lg px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-40",
              a.bg,
            )}
          >
            Nộp bài
          </button>
        </div>
      </div>
    </div>
  );
}
