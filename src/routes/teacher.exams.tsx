import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { TopNav } from "@/components/TopNav";
import { levels } from "@/lib/lms-data";
import { EXAM_SKILLS, QUIZ_KINDS } from "@/lib/teacher-data";
import {
  ClipboardCheck,
  Sparkles,
  Plus,
  Trash2,
  Headphones,
  BookOpen,
  PenLine,
  Mic,
  Languages,
  CheckCircle2,
  Save,
} from "lucide-react";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/teacher/exams")({
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

type Question = { id: string; type: string; prompt: string };
type SkillGroup = { id: string; passage: string; questions: Question[] };

function ExamBuilder() {
  const [meta, setMeta] = useState({
    name: "",
    levelCode: "B1",
    duration: 90,
    description: "",
  });
  const [selectedSkills, setSelectedSkills] = useState<string[]>(["listening", "reading"]);
  const [groups, setGroups] = useState<Record<string, SkillGroup>>({
    listening: { id: "listening", passage: "", questions: [] },
    reading: { id: "reading", passage: "", questions: [] },
  });
  const [activeSkill, setActiveSkill] = useState<string>("listening");
  const [saved, setSaved] = useState(false);

  const toggleSkill = (id: string) => {
    setSelectedSkills((prev) => {
      const next = prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id];
      setGroups((g) => {
        const copy = { ...g };
        if (!prev.includes(id)) copy[id] = { id, passage: "", questions: [] };
        else delete copy[id];
        return copy;
      });
      if (next.length > 0 && !next.includes(activeSkill)) setActiveSkill(next[0]);
      return next;
    });
  };

  const updateGroup = (skill: string, patch: Partial<SkillGroup>) =>
    setGroups((g) => ({ ...g, [skill]: { ...g[skill], ...patch } }));

  const addQuestion = (skill: string, type = "mcq") =>
    updateGroup(skill, {
      questions: [
        ...groups[skill].questions,
        { id: `q-${Date.now()}`, type, prompt: "" },
      ],
    });

  const totalQuestions = useMemo(
    () => Object.values(groups).reduce((s, g) => s + g.questions.length, 0),
    [groups],
  );

  const save = () => {
    if (typeof window !== "undefined") {
      const drafts = JSON.parse(window.localStorage.getItem("unicom.exams") || "[]");
      drafts.push({ ...meta, skills: selectedSkills, groups, savedAt: new Date().toISOString() });
      window.localStorage.setItem("unicom.exams", JSON.stringify(drafts));
    }
    setSaved(true);
  };

  const isMulti = selectedSkills.length > 1;
  const current = groups[activeSkill];

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
              Kết hợp 1 hoặc nhiều kỹ năng. Mỗi kỹ năng có nhóm câu hỏi và passage/audio riêng.
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
            <select value={meta.levelCode} onChange={(e) => setMeta({ ...meta, levelCode: e.target.value })} className="input">
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
              {EXAM_SKILLS.map((s) => {
                const Icon = SKILL_ICON[s.id] ?? ClipboardCheck;
                const active = selectedSkills.includes(s.id);
                return (
                  <button
                    key={s.id}
                    onClick={() => toggleSkill(s.id)}
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
              <aside className="rounded-2xl border border-border bg-surface p-3 shadow-soft">
                <div className="px-2 pb-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Nhóm kỹ năng
                </div>
                {selectedSkills.map((id) => {
                  const skill = EXAM_SKILLS.find((s) => s.id === id)!;
                  const Icon = SKILL_ICON[id] ?? ClipboardCheck;
                  const count = groups[id]?.questions.length ?? 0;
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
              <div className="mb-4 flex items-center gap-2">
                {(() => {
                  const Icon = SKILL_ICON[activeSkill] ?? ClipboardCheck;
                  const skill = EXAM_SKILLS.find((s) => s.id === activeSkill)!;
                  return (
                    <>
                      <div className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
                        <Icon className="h-4 w-4" />
                      </div>
                      <div className="font-display text-lg font-semibold text-foreground">
                        {skill.label}
                      </div>
                    </>
                  );
                })()}
              </div>

              {(activeSkill === "reading" || activeSkill === "listening") && (
                <Field label={activeSkill === "reading" ? "Đoạn văn (passage)" : "Audio script / link"}>
                  <textarea
                    rows={4}
                    value={current.passage}
                    onChange={(e) => updateGroup(activeSkill, { passage: e.target.value })}
                    placeholder={
                      activeSkill === "reading"
                        ? "Dán nội dung đoạn đọc..."
                        : "Dán link audio hoặc script..."
                    }
                    className="input"
                  />
                </Field>
              )}

              <div className="mt-5 flex items-center justify-between">
                <div className="text-sm font-semibold text-foreground">
                  Câu hỏi ({current.questions.length})
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {QUIZ_KINDS.slice(0, 4).map((q) => (
                    <button
                      key={q.id}
                      onClick={() => addQuestion(activeSkill, q.id)}
                      className="inline-flex items-center gap-1 rounded-lg bg-muted px-2.5 py-1.5 text-[11px] font-medium text-foreground hover:bg-foreground hover:text-background"
                    >
                      <Plus className="h-3 w-3" /> {q.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mt-3 space-y-2">
                {current.questions.length === 0 && (
                  <div className="rounded-xl border border-dashed border-border p-6 text-center text-xs text-muted-foreground">
                    Chưa có câu hỏi. Chọn loại bên trên để thêm.
                  </div>
                )}
                {current.questions.map((q, i) => (
                  <div key={q.id} className="flex items-start gap-3 rounded-xl border border-border bg-background p-3">
                    <div className="mt-1 flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 text-xs font-bold text-primary">
                      {i + 1}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                        {QUIZ_KINDS.find((k) => k.id === q.type)?.label ?? q.type}
                      </div>
                      <textarea
                        rows={2}
                        value={q.prompt}
                        onChange={(e) =>
                          updateGroup(activeSkill, {
                            questions: current.questions.map((x) =>
                              x.id === q.id ? { ...x, prompt: e.target.value } : x,
                            ),
                          })
                        }
                        placeholder="Nội dung câu hỏi..."
                        className="input mt-1"
                      />
                    </div>
                    <button
                      onClick={() =>
                        updateGroup(activeSkill, {
                          questions: current.questions.filter((x) => x.id !== q.id),
                        })
                      }
                      className="rounded-lg p-2 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
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
