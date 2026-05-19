import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { TopNav } from "@/components/TopNav";
import { ManualQuestionEditor } from "@/components/ManualQuestionEditor";
import { levels } from "@/lib/lms-data";
import { EXAM_SKILLS } from "@/lib/teacher-data";
import type { CustomQuestion } from "@/lib/tests-data";
import type { QLevel, QSkill } from "@/lib/question-bank";
import {
  ClipboardCheck,
  Sparkles,
  Headphones,
  BookOpen,
  PenLine,
  Mic,
  Languages,
  CheckCircle2,
  Save,
  Plus,
  Trash2,
  FileAudio,
  FileText,
} from "lucide-react";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/teacher/exams/new")({
  head: () => ({ meta: [{ title: "Tạo bài luyện thi — UNICOM LMS" }] }),
  component: ExamBuilder,
});

const SKILL_ICON: Record<string, React.ComponentType<{ className?: string }>> = {
  listening: Headphones,
  reading: BookOpen,
  writing: PenLine,
  speaking: Mic,
  use: Languages,
};

const EDITOR_SKILLS: QSkill[] = ["listening", "reading", "writing", "speaking"];

/** Khối câu hỏi:
 * - listening: có audio (URL/script) dùng chung cho 1 hoặc nhiều câu hỏi
 * - reading: có passage dùng chung cho 1 hoặc nhiều câu hỏi
 * - speaking/writing: media = "", luôn chứa đúng 1 câu hỏi
 */
type QuestionBlock = {
  id: string;
  /** "single" = 1 câu hỏi (media tuỳ chọn). "group" = 1 audio/passage dùng cho nhiều câu. */
  kind: "single" | "group";
  media: string;
  questions: CustomQuestion[];
};

type SkillGroup = {
  id: QSkill;
  blocks: QuestionBlock[];
};

const newBlockId = () => `B-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;

const emptyQuestion = (skill: QSkill, level: QLevel): CustomQuestion => {
  const isWriting = skill === "writing";
  const isSpeaking = skill === "speaking";
  const type = isWriting ? "essay" : isSpeaking ? "short" : "mcq";
  return {
    id: `CQ-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    content: "",
    type,
    level,
    difficulty: "medium",
    points: type === "essay" ? 5 : type === "short" ? 2 : 1,
    options: type === "mcq" ? ["", "", "", ""] : undefined,
    correctAnswer: type === "mcq" ? "A" : undefined,
  };
};

function ExamBuilder() {
  const [meta, setMeta] = useState({
    name: "",
    levelCode: "B1" as QLevel,
    duration: 90,
    description: "",
  });
  const [selectedSkills, setSelectedSkills] = useState<QSkill[]>(["listening", "reading"]);
  const [groups, setGroups] = useState<Record<string, SkillGroup>>({
    listening: { id: "listening", blocks: [] },
    reading: { id: "reading", blocks: [] },
  });
  const [activeSkill, setActiveSkill] = useState<QSkill>("listening");
  const [saved, setSaved] = useState(false);

  const toggleSkill = (id: QSkill) => {
    setSelectedSkills((prev) => {
      const next = prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id];
      setGroups((g) => {
        const copy = { ...g };
        if (!prev.includes(id)) copy[id] = { id, blocks: [] };
        else delete copy[id];
        return copy;
      });
      if (next.length > 0 && !next.includes(activeSkill)) setActiveSkill(next[0]);
      return next;
    });
  };

  const updateGroup = (skill: string, patch: Partial<SkillGroup>) =>
    setGroups((g) => ({ ...g, [skill]: { ...g[skill], ...patch } }));

  const totalQuestions = useMemo(
    () =>
      Object.values(groups).reduce(
        (s, g) => s + g.blocks.reduce((a, b) => a + b.questions.length, 0),
        0,
      ),
    [groups],
  );

  const navigate = useNavigate();
  const save = () => {
    if (typeof window !== "undefined") {
      const drafts = JSON.parse(window.localStorage.getItem("unicom.exams") || "[]");
      drafts.push({
        id: `exam-${Date.now()}`,
        ...meta,
        skills: selectedSkills,
        groups,
        totalQuestions,
        savedAt: new Date().toISOString(),
      });
      window.localStorage.setItem("unicom.exams", JSON.stringify(drafts));
    }
    setSaved(true);
    setTimeout(() => navigate({ to: "/teacher/exams" }), 700);
  };

  const isMulti = selectedSkills.length > 1;
  const current = groups[activeSkill];
  const hasMedia = activeSkill === "listening" || activeSkill === "reading";

  /* ---------- Block ops ---------- */
  const addBlock = (kind: "single" | "group" = "single") => {
    const blk: QuestionBlock = {
      id: newBlockId(),
      kind,
      media: "",
      questions:
        kind === "group" ? [] : [emptyQuestion(activeSkill, meta.levelCode)],
    };
    updateGroup(activeSkill, { blocks: [...current.blocks, blk] });
  };

  const updateBlock = (id: string, patch: Partial<QuestionBlock>) =>
    updateGroup(activeSkill, {
      blocks: current.blocks.map((b) => (b.id === id ? { ...b, ...patch } : b)),
    });

  const removeBlock = (id: string) =>
    updateGroup(activeSkill, { blocks: current.blocks.filter((b) => b.id !== id) });

  return (
    <div className="min-h-screen bg-background">
      <TopNav />
      <div className="mx-auto max-w-7xl px-6 pb-20 pt-10 sm:px-8">
        <span className="inline-flex w-fit items-center gap-2 text-xs font-semibold uppercase tracking-wider text-primary">
          <Sparkles className="h-3.5 w-3.5" /> Bài luyện thi
        </span>
        <div className="flex items-end justify-between gap-3">
          <div>
            <h1 className="mt-1 font-display text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
              Tạo bài luyện thi
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Kết hợp 1 hoặc nhiều kỹ năng. Nghe/Đọc có thể gom nhiều câu hỏi vào chung 1 audio hoặc 1 đoạn văn.
            </p>
          </div>
          <button
            onClick={save}
            className="inline-flex items-center gap-1.5 rounded-xl px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-soft"
            style={{ background: "var(--gradient-brand)" }}
          >
            <Save className="h-4 w-4" /> Lưu bài thi
          </button>
        </div>

        {saved && (
          <div className="mt-4 inline-flex items-center gap-2 rounded-xl bg-emerald-500/10 px-3 py-2 text-sm font-medium text-emerald-700">
            <CheckCircle2 className="h-4 w-4" /> Đã lưu bài thi với {totalQuestions} câu hỏi.
          </div>
        )}

        {/* Meta */}
        <div className="mt-6 grid gap-4 rounded-3xl border border-border bg-surface p-6 shadow-soft sm:grid-cols-4">
          <Field label="Tên bài thi" cls="sm:col-span-2">
            <input
              value={meta.name}
              onChange={(e) => setMeta({ ...meta, name: e.target.value })}
              placeholder="VD: B1 Mock Test 01"
              className="input"
            />
          </Field>
          <Field label="Cấp độ">
            <select
              value={meta.levelCode}
              onChange={(e) => setMeta({ ...meta, levelCode: e.target.value as QLevel })}
              className="input"
            >
              {levels.map((l) => (
                <option key={l.code} value={l.code}>
                  {l.code}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Thời lượng (phút)">
            <input
              type="number"
              value={meta.duration}
              onChange={(e) => setMeta({ ...meta, duration: Number(e.target.value) })}
              className="input"
            />
          </Field>
          <div className="sm:col-span-4">
            <Field label="Mô tả">
              <textarea
                rows={2}
                value={meta.description}
                onChange={(e) => setMeta({ ...meta, description: e.target.value })}
                className="input"
              />
            </Field>
          </div>
          <div className="sm:col-span-4">
            <div className="mb-1.5 text-xs font-semibold text-foreground">Kỹ năng tích hợp</div>
            <div className="flex flex-wrap gap-2">
              {EXAM_SKILLS.filter((s) => EDITOR_SKILLS.includes(s.id as QSkill)).map((s) => {
                const id = s.id as QSkill;
                const Icon = SKILL_ICON[id] ?? ClipboardCheck;
                const active = selectedSkills.includes(id);
                return (
                  <button
                    key={id}
                    onClick={() => toggleSkill(id)}
                    className={cn(
                      "inline-flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-semibold transition",
                      active
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border bg-background text-muted-foreground hover:text-foreground",
                    )}
                  >
                    <Icon className="h-3.5 w-3.5" />
                    {s.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Editor */}
        {selectedSkills.length === 0 ? (
          <div className="mt-6 rounded-3xl border border-dashed border-border bg-surface/40 p-12 text-center text-sm text-muted-foreground">
            Chọn ít nhất 1 kỹ năng để bắt đầu soạn câu hỏi.
          </div>
        ) : (
          <div className={cn("mt-6 grid gap-4", isMulti ? "lg:grid-cols-[260px_1fr]" : "")}>
            {isMulti && (
              <aside className="rounded-2xl border border-border bg-surface p-3 shadow-soft self-start">
                <div className="px-2 pb-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Nhóm kỹ năng
                </div>
                {selectedSkills.map((id) => {
                  const skill = EXAM_SKILLS.find((s) => s.id === id)!;
                  const Icon = SKILL_ICON[id] ?? ClipboardCheck;
                  const count = (groups[id]?.blocks ?? []).reduce(
                    (a, b) => a + b.questions.length,
                    0,
                  );
                  const active = activeSkill === id;
                  return (
                    <button
                      key={id}
                      onClick={() => setActiveSkill(id)}
                      className={cn(
                        "flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium transition",
                        active ? "bg-primary/10 text-primary" : "text-foreground hover:bg-muted",
                      )}
                    >
                      <Icon className="h-4 w-4" />
                      <span className="flex-1 text-left">{skill.label}</span>
                      <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-bold text-muted-foreground">
                        {count}
                      </span>
                    </button>
                  );
                })}
              </aside>
            )}

            <div className="rounded-3xl border border-border bg-surface p-6 shadow-soft">
              <div className="mb-4 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  {(() => {
                    const Icon = SKILL_ICON[activeSkill] ?? ClipboardCheck;
                    const skill = EXAM_SKILLS.find((s) => s.id === activeSkill)!;
                    return (
                      <>
                        <div className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
                          <Icon className="h-4 w-4" />
                        </div>
                        <div>
                          <div className="font-display text-lg font-semibold text-foreground">
                            {skill.label}
                          </div>
                          <div className="text-[11px] text-muted-foreground">
                            {hasMedia
                              ? activeSkill === "listening"
                                ? "Mỗi khối gồm 1 audio + 1 hoặc nhiều câu hỏi."
                                : "Mỗi khối gồm 1 đoạn văn + 1 hoặc nhiều câu hỏi."
                              : activeSkill === "speaking"
                              ? "Mỗi câu hỏi → 1 lượt thu âm trả lời."
                              : "Mỗi câu hỏi → 1 bài viết trả lời."}
                          </div>
                        </div>
                      </>
                    );
                  })()}
                </div>
                <button
                  onClick={addBlock}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-foreground px-3 py-2 text-xs font-semibold text-background hover:opacity-90"
                >
                  <Plus className="h-3.5 w-3.5" />
                  {hasMedia
                    ? activeSkill === "listening"
                      ? "Thêm khối Audio"
                      : "Thêm khối Đoạn văn"
                    : "Thêm câu hỏi"}
                </button>
              </div>

              {current.blocks.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-border p-12 text-center text-sm text-muted-foreground">
                  {hasMedia
                    ? `Chưa có khối nào. Nhấn "${
                        activeSkill === "listening" ? "Thêm khối Audio" : "Thêm khối Đoạn văn"
                      }" để bắt đầu.`
                    : 'Chưa có câu hỏi. Nhấn "Thêm câu hỏi" để bắt đầu.'}
                </div>
              ) : (
                <div className="space-y-4">
                  {current.blocks.map((blk, bi) => (
                    <BlockCard
                      key={blk.id}
                      index={bi}
                      block={blk}
                      skill={activeSkill}
                      level={meta.levelCode}
                      hasMedia={hasMedia}
                      onUpdate={(p) => updateBlock(blk.id, p)}
                      onRemove={() => removeBlock(blk.id)}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <style>{`
        .input {
          height: 2.5rem;
          width: 100%;
          border-radius: 0.75rem;
          border: 1px solid hsl(var(--border) / 1);
          background: var(--background, #fff);
          padding: 0 0.875rem;
          font-size: 0.875rem;
          color: var(--foreground);
          outline: none;
          transition: all .15s ease;
        }
        textarea.input { height: auto; padding: .625rem .875rem; }
        .input:focus { border-color: oklch(0.55 0.18 260); box-shadow: 0 0 0 3px oklch(0.55 0.18 260 / 0.18); }
      `}</style>
    </div>
  );
}

function BlockCard({
  index,
  block,
  skill,
  level,
  hasMedia,
  onUpdate,
  onRemove,
}: {
  index: number;
  block: QuestionBlock;
  skill: QSkill;
  level: QLevel;
  hasMedia: boolean;
  onUpdate: (p: Partial<QuestionBlock>) => void;
  onRemove: () => void;
}) {
  const isListening = skill === "listening";
  const isReading = skill === "reading";
  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-background">
      <div className="flex items-center justify-between gap-2 border-b border-border bg-muted/40 px-4 py-2.5">
        <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
          <span className="inline-flex h-6 w-6 items-center justify-center rounded-md bg-foreground text-[11px] font-bold text-background">
            {index + 1}
          </span>
          {isListening ? (
            <>
              <FileAudio className="h-4 w-4 text-primary" /> Khối Audio
            </>
          ) : isReading ? (
            <>
              <FileText className="h-4 w-4 text-primary" /> Khối Đoạn văn
            </>
          ) : (
            <>Câu hỏi</>
          )}
          <span className="rounded-md bg-muted px-1.5 py-0.5 text-[10px] font-bold text-muted-foreground">
            {block.questions.length} câu
          </span>
        </div>
        <button
          onClick={onRemove}
          className="rounded-md p-1.5 text-rose-500 hover:bg-rose-500/10"
          title="Xoá khối"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>

      <div className="space-y-4 p-4">
        {hasMedia && (
          <Field label={isListening ? "Audio (URL hoặc script)" : "Đoạn văn (passage)"}>
            <textarea
              rows={isListening ? 2 : 5}
              value={block.media}
              onChange={(e) => onUpdate({ media: e.target.value })}
              placeholder={
                isListening
                  ? "Dán link audio (.mp3 / streaming) hoặc nội dung script..."
                  : "Dán nội dung đoạn đọc..."
              }
              className="input"
            />
          </Field>
        )}

        <ManualQuestionEditor
          skill={skill}
          level={level}
          questions={block.questions}
          onChange={(qs) => onUpdate({ questions: qs })}
          hideBank
          hideHeader
          maxCount={hasMedia ? undefined : 1}
        />
      </div>
    </div>
  );
}

function Field({
  label,
  cls,
  children,
}: {
  label: string;
  cls?: string;
  children: React.ReactNode;
}) {
  return (
    <label className={cn("block", cls)}>
      <div className="mb-1.5 text-xs font-semibold text-foreground">{label}</div>
      {children}
    </label>
  );
}
