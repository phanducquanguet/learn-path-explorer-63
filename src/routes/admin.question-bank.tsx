import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { TopNav } from "@/components/TopNav";
import { useRole } from "@/contexts/RoleContext";
import {
  questionBank,
  SKILL_LABEL,
  TYPE_LABEL,
  type BankQuestion,
  type QSkill,
  type QLevel,
  type QType,
} from "@/lib/question-bank";
import { Library, Search, Plus, Copy, Trash2, Pencil, ArrowLeft, X } from "lucide-react";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/admin/question-bank")({
  head: () => ({ meta: [{ title: "Ngân hàng câu hỏi — UNICOM LMS" }] }),
  component: BankPage,
});

const SKILLS: QSkill[] = ["listening", "reading", "writing", "speaking", "use"];
const LEVELS: QLevel[] = ["A1", "A2", "B1", "B2", "C1", "C2"];

function BankPage() {
  const { role } = useRole();
  const [items, setItems] = useState<BankQuestion[]>(questionBank);
  const [skill, setSkill] = useState<QSkill | "all">("all");
  const [level, setLevel] = useState<QLevel | "all">("all");
  const [type, setType] = useState<QType | "all">("all");
  const [q, setQ] = useState("");
  const [editing, setEditing] = useState<BankQuestion | null>(null);
  const [creating, setCreating] = useState(false);

  if (role !== "admin") {
    return (
      <div className="min-h-screen bg-background">
        <TopNav />
        <div className="mx-auto max-w-3xl px-6 py-20 text-center">
          <Library className="mx-auto h-12 w-12 text-muted-foreground" />
          <h1 className="mt-4 font-display text-2xl font-semibold">Chỉ Quản trị viên</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Trang Ngân hàng câu hỏi chỉ dành cho Quản trị viên.
          </p>
          <Link
            to="/teacher"
            className="mt-6 inline-flex rounded-xl bg-foreground px-4 py-2 text-sm font-semibold text-background"
          >
            Về Tổng quan
          </Link>
        </div>
      </div>
    );
  }

  const filtered = useMemo(() => {
    return items.filter(
      (it) =>
        (skill === "all" || it.skill === skill) &&
        (level === "all" || it.level === level) &&
        (type === "all" || it.type === type) &&
        (!q.trim() || it.content.toLowerCase().includes(q.toLowerCase()) || it.id.toLowerCase().includes(q.toLowerCase())),
    );
  }, [items, skill, level, type, q]);

  const remove = (id: string) => setItems((p) => p.filter((x) => x.id !== id));
  const duplicate = (it: BankQuestion) =>
    setItems((p) => [
      { ...it, id: `Q${String(items.length + 1).padStart(4, "0")}`, createdAt: new Date().toISOString() },
      ...p,
    ]);

  return (
    <div className="min-h-screen bg-background">
      <TopNav />
      <div className="mx-auto max-w-7xl px-6 pb-20 pt-10 sm:px-8">
        <Link
          to="/teacher"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" /> Trở lại
        </Link>

        <div className="mt-4 flex flex-wrap items-end justify-between gap-4">
          <div>
            <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-primary">
              <Library className="h-3.5 w-3.5" /> Ngân hàng câu hỏi
            </span>
            <h1 className="mt-1 font-display text-3xl font-semibold tracking-tight">
              Quản lý câu hỏi
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {items.length} câu hỏi • dùng để bốc ngẫu nhiên cho đề thi
            </p>
          </div>
          <button
            onClick={() => setCreating(true)}
            className="inline-flex items-center gap-1.5 rounded-xl px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-soft"
            style={{ background: "var(--gradient-brand)" }}
          >
            <Plus className="h-4 w-4" /> Thêm câu hỏi
          </button>
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-[260px_1fr]">
          <aside className="space-y-4 rounded-2xl border border-border bg-surface p-4 shadow-soft h-fit">
            <FilterSection label="Kỹ năng">
              <Chip on={skill === "all"} onClick={() => setSkill("all")}>Tất cả</Chip>
              {SKILLS.map((s) => (
                <Chip key={s} on={skill === s} onClick={() => setSkill(s)}>
                  {SKILL_LABEL[s]}
                </Chip>
              ))}
            </FilterSection>
            <FilterSection label="Cấp độ">
              <Chip on={level === "all"} onClick={() => setLevel("all")}>Tất cả</Chip>
              {LEVELS.map((l) => (
                <Chip key={l} on={level === l} onClick={() => setLevel(l)}>{l}</Chip>
              ))}
            </FilterSection>
            <FilterSection label="Loại">
              <Chip on={type === "all"} onClick={() => setType("all")}>Tất cả</Chip>
              {(Object.keys(TYPE_LABEL) as QType[]).map((t) => (
                <Chip key={t} on={type === t} onClick={() => setType(t)}>{TYPE_LABEL[t]}</Chip>
              ))}
            </FilterSection>
          </aside>

          <main>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Tìm theo nội dung hoặc ID..."
                className="w-full rounded-xl border border-border bg-surface py-2.5 pl-10 pr-3 text-sm"
              />
            </div>
            <div className="mt-3 text-xs text-muted-foreground">
              {filtered.length} / {items.length} câu hỏi
            </div>
            <div className="mt-3 overflow-hidden rounded-2xl border border-border bg-surface shadow-soft">
              <table className="w-full text-sm">
                <thead className="bg-muted/40 text-xs uppercase tracking-wider text-muted-foreground">
                  <tr>
                    <th className="px-3 py-3 text-left">ID</th>
                    <th className="px-3 py-3 text-left">Nội dung</th>
                    <th className="px-3 py-3">Kỹ năng</th>
                    <th className="px-3 py-3">Loại</th>
                    <th className="px-3 py-3">Lv</th>
                    <th className="px-3 py-3">Điểm</th>
                    <th className="px-3 py-3"></th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.slice(0, 60).map((it) => (
                    <tr key={it.id} className="border-t border-border hover:bg-muted/30">
                      <td className="px-3 py-2 font-mono text-xs text-muted-foreground">{it.id}</td>
                      <td className="px-3 py-2 max-w-xl truncate">{it.content}</td>
                      <td className="px-3 py-2 text-center text-xs">{SKILL_LABEL[it.skill]}</td>
                      <td className="px-3 py-2 text-center text-xs">{TYPE_LABEL[it.type]}</td>
                      <td className="px-3 py-2 text-center">
                        <span className="rounded bg-primary/10 px-1.5 py-0.5 text-[10px] font-bold text-primary">
                          {it.level}
                        </span>
                      </td>
                      <td className="px-3 py-2 text-center font-semibold">{it.points}</td>
                      <td className="px-3 py-2 text-right">
                        <div className="inline-flex gap-1">
                          <button
                            onClick={() => setEditing(it)}
                            className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => duplicate(it)}
                            className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
                          >
                            <Copy className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => remove(it.id)}
                            className="rounded-lg p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filtered.length > 60 && (
                <div className="border-t border-border bg-muted/30 px-4 py-2 text-center text-xs text-muted-foreground">
                  Hiển thị 60 câu đầu — dùng bộ lọc để thu hẹp
                </div>
              )}
            </div>
          </main>
        </div>
      </div>

      {(editing || creating) && (
        <EditDialog
          question={editing}
          onClose={() => {
            setEditing(null);
            setCreating(false);
          }}
          onSave={(q) => {
            if (editing) {
              setItems((p) => p.map((x) => (x.id === q.id ? q : x)));
            } else {
              setItems((p) => [
                { ...q, id: `Q${String(items.length + 1).padStart(4, "0")}` },
                ...p,
              ]);
            }
            setEditing(null);
            setCreating(false);
          }}
        />
      )}
    </div>
  );
}

function FilterSection({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </div>
      <div className="flex flex-wrap gap-1.5">{children}</div>
    </div>
  );
}

function Chip({
  on,
  onClick,
  children,
}: {
  on: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "rounded-full px-2.5 py-1 text-[11px] font-semibold transition",
        on
          ? "bg-foreground text-background"
          : "bg-muted text-muted-foreground hover:text-foreground",
      )}
    >
      {children}
    </button>
  );
}

function EditDialog({
  question,
  onClose,
  onSave,
}: {
  question: BankQuestion | null;
  onClose: () => void;
  onSave: (q: BankQuestion) => void;
}) {
  const [form, setForm] = useState<BankQuestion>(
    question ?? {
      id: "",
      content: "",
      skill: "reading",
      type: "mcq",
      level: "A1",
      points: 1,
      tags: [],
      createdAt: new Date().toISOString(),
    },
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <button onClick={onClose} className="absolute inset-0" />
      <div className="relative w-full max-w-2xl rounded-3xl bg-background p-6 shadow-elevated">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-lg font-semibold">
            {question ? "Sửa câu hỏi" : "Thêm câu hỏi mới"}
          </h2>
          <button onClick={onClose} className="rounded-lg p-2 hover:bg-muted">
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="mt-4 space-y-3">
          <div>
            <label className="text-xs text-muted-foreground">Nội dung câu hỏi</label>
            <textarea
              value={form.content}
              onChange={(e) => setForm({ ...form, content: e.target.value })}
              rows={3}
              className="mt-1 w-full rounded-xl border border-border bg-background p-3 text-sm"
            />
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Field label="Kỹ năng">
              <select
                value={form.skill}
                onChange={(e) => setForm({ ...form, skill: e.target.value as QSkill })}
                className="w-full rounded-lg border border-border bg-background px-2 py-1.5 text-sm"
              >
                {SKILLS.map((s) => (
                  <option key={s} value={s}>{SKILL_LABEL[s]}</option>
                ))}
              </select>
            </Field>
            <Field label="Loại">
              <select
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value as QType })}
                className="w-full rounded-lg border border-border bg-background px-2 py-1.5 text-sm"
              >
                {(Object.keys(TYPE_LABEL) as QType[]).map((t) => (
                  <option key={t} value={t}>{TYPE_LABEL[t]}</option>
                ))}
              </select>
            </Field>
            <Field label="Cấp độ">
              <select
                value={form.level}
                onChange={(e) => setForm({ ...form, level: e.target.value as QLevel })}
                className="w-full rounded-lg border border-border bg-background px-2 py-1.5 text-sm"
              >
                {LEVELS.map((l) => (
                  <option key={l} value={l}>{l}</option>
                ))}
              </select>
            </Field>
            <Field label="Điểm">
              <input
                type="number"
                min={1}
                value={form.points}
                onChange={(e) => setForm({ ...form, points: Number(e.target.value) })}
                className="w-full rounded-lg border border-border bg-background px-2 py-1.5 text-sm"
              />
            </Field>
          </div>
          <div>
            <label className="text-xs text-muted-foreground">Đáp án mẫu (nếu có)</label>
            <input
              value={form.correctAnswer ?? ""}
              onChange={(e) => setForm({ ...form, correctAnswer: e.target.value })}
              className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm"
            />
          </div>
        </div>
        <div className="mt-6 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="rounded-xl border border-border bg-background px-4 py-2 text-sm font-semibold hover:bg-muted"
          >
            Hủy
          </button>
          <button
            onClick={() => onSave(form)}
            className="rounded-xl px-4 py-2 text-sm font-semibold text-primary-foreground shadow-soft"
            style={{ background: "var(--gradient-brand)" }}
          >
            Lưu
          </button>
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="text-xs text-muted-foreground">{label}</label>
      <div className="mt-1">{children}</div>
    </div>
  );
}
