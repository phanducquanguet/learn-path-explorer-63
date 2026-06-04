import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowLeft,
  Bot,
  CheckCircle2,
  GraduationCap,
  ListVideo,
  NotebookPen,
  Play,
  Plus,
  Send,
  Sparkles,
  StickyNote,
  User as UserIcon,
  X,
} from "lucide-react";
import type { Activity } from "@/lib/lms-data";
import { cn } from "@/lib/utils";

/* ---------- Types ---------- */

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
type SidebarTab = "notes" | "teacher" | "ai";

/* ---------- Sample lecture content ---------- */

const lecture = {
  badge: "3A",
  title: "Present simple: I / you / we / they",
  subtitle: "Video bài giảng — ngữ pháp & cách dùng trong giao tiếp hằng ngày",
  totalDuration: "12:48",
  posterEmoji: "🎬",
};


/* ---------- Main panel ---------- */

export function VideoPanel({
  activity,
  hue,
  onClose,
}: {
  activity: Activity;
  hue: number;
  onClose: () => void;
}) {
  const [sideTab, setSideTab] = useState<SidebarTab>("notes");
  const [sideOpen, setSideOpen] = useState(true);
  const [playing, setPlaying] = useState(false);


  const [notes, setNotes] = useState<Note[]>([]);
  const [draft, setDraft] = useState("");
  const [draftScope, setDraftScope] = useState<{ id: string; label: string }>({
    id: "lecture",
    label: "Toàn bài giảng",
  });

  const [teacherDraft, setTeacherDraft] = useState("");
  const [teacherScope, setTeacherScope] = useState<{ id: string; label: string }>({
    id: "lecture",
    label: "Toàn bài giảng",
  });
  const [teacherQs, setTeacherQs] = useState<TeacherQ[]>([]);

  const [chat, setChat] = useState<ChatMsg[]>([
    {
      id: "ai-hello",
      role: "ai",
      text: "Xin chào! Mình là AI luyện tập. Hỏi mình bất cứ điều gì về nội dung video — ngữ pháp, ví dụ, hoặc thử hội thoại theo chủ đề bài học nhé!",
      ts: Date.now(),
    },
  ]);
  const [chatDraft, setChatDraft] = useState("");
  const chatEndRef = useRef<HTMLDivElement>(null);

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
          text: `Câu hỏi hay! Liên quan đến "${text.slice(0, 40)}${text.length > 40 ? "…" : ""}". Trong bài giảng "${lecture.title}", thầy có nhắc tới cấu trúc S + V cho I/you/we/they. Bạn thử đặt 2 câu khẳng định và 2 câu phủ định theo sở thích cá nhân nhé!`,
          ts: Date.now(),
        },
      ]);
    }, 600);
  };

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [chat]);

  const sideBadge: Record<SidebarTab, number> = {
    notes: notes.length,
    teacher: teacherQs.length,
    ai: chat.filter((m) => m.role === "user").length,
  };

  const scopeChips = [
    { id: "lecture", label: "Toàn bài giảng" },
    ...lecture.chapters.map((c) => ({ id: c.id, label: `Chương ${c.index} · ${c.title}` })),
  ];

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
            {lecture.badge}
          </div>
          <div className="min-w-0">
            <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Video bài giảng
            </div>
            <div className="truncate text-base font-semibold text-foreground">{activity.title}</div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="hidden md:inline-flex items-center gap-1.5 rounded-full bg-surface px-3 py-1.5 text-xs text-muted-foreground ring-1 ring-border">
            <ListVideo className="h-3.5 w-3.5" /> {lecture.chapters.length} chương · {lecture.totalDuration}
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
        {/* Video viewer */}
        <div className="bg-[oklch(0.97_0.005_260)] p-4 sm:p-6 lg:p-8 max-h-[calc(100vh-12rem)] overflow-y-auto">
          <div className="mx-auto max-w-3xl space-y-6">
            {/* Player */}
            <div
              className="relative aspect-video w-full overflow-hidden rounded-3xl ring-1 ring-border shadow-elevated"
              style={{
                background: `linear-gradient(135deg, oklch(0.25 0.06 ${hue}), oklch(0.18 0.04 ${(hue + 40) % 360}))`,
              }}
            >
              <div className="absolute inset-0 opacity-30 mix-blend-overlay [background-image:radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.4),transparent_45%),radial-gradient(circle_at_70%_80%,rgba(255,255,255,0.2),transparent_45%)]" />
              <div className="absolute inset-0 flex flex-col justify-between p-6 text-white">
                <div className="flex items-start justify-between">
                  <span className="rounded-full bg-white/15 px-2.5 py-1 text-[10px] font-bold backdrop-blur ring-1 ring-white/20">
                    {lecture.badge} • Chương {current.index}
                  </span>
                  <span className="rounded-full bg-black/30 px-2.5 py-1 text-[10px] font-mono backdrop-blur">
                    {current.startLabel} / {lecture.totalDuration}
                  </span>
                </div>
                <div className="flex items-center justify-center">
                  <button
                    onClick={() => setPlaying((p) => !p)}
                    className="group inline-flex h-20 w-20 items-center justify-center rounded-full bg-white/95 text-foreground shadow-elevated ring-1 ring-white/40 transition hover:scale-105 active:scale-95"
                    aria-label={playing ? "Pause" : "Play"}
                  >
                    <Play className={cn("h-8 w-8 translate-x-[2px]", playing && "opacity-50")} fill="currentColor" />
                  </button>
                </div>
                <div>
                  <div className="text-[11px] uppercase tracking-[0.2em] opacity-80">Đang phát</div>
                  <div className="mt-0.5 font-display text-2xl font-semibold leading-tight">
                    {current.title}
                  </div>
                  <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-white/15">
                    <div
                      className="h-full rounded-full bg-white"
                      style={{ width: `${(current.index / lecture.chapters.length) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Lecture meta */}
            <div className="rounded-2xl bg-surface ring-1 ring-border p-5 space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Bài giảng
                  </div>
                  <h2 className="mt-1 font-display text-xl font-semibold text-foreground">
                    {lecture.title}
                  </h2>
                  <p className="mt-1 text-sm text-muted-foreground">{lecture.subtitle}</p>
                </div>
                <button
                  onClick={() => {
                    setDraftScope({ id: "lecture", label: "Toàn bài giảng" });
                    setSideTab("notes");
                    setSideOpen(true);
                  }}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-foreground px-3 py-2 text-xs font-semibold text-background hover:opacity-90"
                >
                  <StickyNote className="h-3.5 w-3.5" /> Ghi chú
                </button>
              </div>
              <div className="rounded-xl bg-surface-2/60 ring-1 ring-border/60 p-3">
                <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Tóm tắt chương đang phát
                </div>
                <p className="mt-1 text-[13px] text-foreground">{current.summary}</p>
              </div>
            </div>

            {/* Chapter list */}
            <div className="rounded-2xl bg-surface ring-1 ring-border overflow-hidden">
              <div className="flex items-center justify-between px-5 py-3 border-b border-border/70 bg-surface-2/40">
                <div className="flex items-center gap-2">
                  <ListVideo className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-semibold text-foreground">
                    Danh sách chương
                  </span>
                </div>
                <span className="text-[11px] text-muted-foreground">
                  {lecture.chapters.length} chương
                </span>
              </div>
              <ul className="divide-y divide-border/60">
                {lecture.chapters.map((c) => {
                  const isActive = c.id === activeChapter;
                  const isDone = c.index < current.index;
                  return (
                    <li key={c.id}>
                      <button
                        onClick={() => {
                          setActiveChapter(c.id);
                          setPlaying(true);
                        }}
                        className={cn(
                          "w-full flex items-start gap-3 px-5 py-3 text-left transition",
                          isActive ? "bg-surface-2" : "hover:bg-surface-2/50",
                        )}
                      >
                        <div
                          className={cn(
                            "mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-[12px] font-bold",
                            isActive
                              ? "text-white shadow-sm"
                              : isDone
                                ? "bg-emerald-100 text-emerald-700"
                                : "bg-surface-2 text-muted-foreground ring-1 ring-border",
                          )}
                          style={isActive ? { background: accent } : undefined}
                        >
                          {isDone && !isActive ? <CheckCircle2 className="h-4 w-4" /> : c.index}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-2">
                            <span className={cn("text-sm font-semibold truncate", isActive ? "text-foreground" : "text-foreground/90")}>
                              {c.title}
                            </span>
                            <span className="font-mono text-[11px] text-muted-foreground shrink-0">
                              {c.startLabel} · {c.durationLabel}
                            </span>
                          </div>
                          <p className="mt-0.5 text-[12px] text-muted-foreground line-clamp-2">
                            {c.summary}
                          </p>
                        </div>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>
        </div>

        {/* Right tabbed panel */}
        {sideOpen && (
          <aside className="border-t lg:border-t-0 lg:border-l border-border/70 bg-surface flex flex-col max-h-[calc(100vh-12rem)]">
            <div className="flex border-b border-border/70 bg-surface-2/40">
              {(
                [
                  { id: "notes", label: "Ghi chú", icon: StickyNote },
                  { id: "teacher", label: "Giáo viên", icon: GraduationCap },
                  { id: "ai", label: "AI", icon: Bot },
                ] as { id: SidebarTab; label: string; icon: typeof StickyNote }[]
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

            {sideTab === "notes" && (
              <NotesTab
                notes={notes}
                draft={draft}
                setDraft={setDraft}
                draftScope={draftScope}
                setDraftScope={setDraftScope}
                scopeChips={scopeChips}
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
                scopeChips={scopeChips}
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
        "rounded-full px-2.5 py-1 text-[11px] font-semibold ring-1 transition",
        active
          ? "bg-foreground text-background ring-foreground"
          : "bg-surface text-muted-foreground ring-border hover:text-foreground",
      )}
    >
      {children}
    </button>
  );
}

function NotesTab({
  notes,
  draft,
  setDraft,
  draftScope,
  setDraftScope,
  scopeChips,
  addNote,
  onDelete,
  hue,
}: {
  notes: Note[];
  draft: string;
  setDraft: (v: string) => void;
  draftScope: { id: string; label: string };
  setDraftScope: (s: { id: string; label: string }) => void;
  scopeChips: { id: string; label: string }[];
  addNote: () => void;
  onDelete: (id: string) => void;
  hue: number;
}) {
  return (
    <>
      <div className="p-3 border-b border-border/70 space-y-2 bg-surface-2/40">
        <div className="flex flex-wrap gap-1">
          {scopeChips.map((c) => (
            <ScopeChip
              key={c.id}
              active={draftScope.id === c.id}
              onClick={() => setDraftScope(c)}
            >
              {c.id === "lecture" ? "Toàn bài" : c.label.split(" · ")[0]}
            </ScopeChip>
          ))}
        </div>
        <textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder={`Ghi chú cho "${draftScope.label}"...`}
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
            Chưa có ghi chú nào. Bạn có thể ghi chú cho cả bài giảng hoặc cho từng chương video.
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
  scopeChips,
  items,
  onAsk,
  onDelete,
  hue,
}: {
  draft: string;
  setDraft: (v: string) => void;
  scope: { id: string; label: string };
  setScope: (s: { id: string; label: string }) => void;
  scopeChips: { id: string; label: string }[];
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
          {scopeChips.map((c) => (
            <ScopeChip key={c.id} active={scope.id === c.id} onClick={() => setScope(c)}>
              {c.id === "lecture" ? "Toàn bài" : c.label.split(" · ")[0]}
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
            Hỏi đáp & hội thoại theo nội dung video
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
            placeholder="Hỏi AI về nội dung video bài giảng..."
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
      </div>
    </>
  );
}
