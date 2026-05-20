import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { TopNav } from "@/components/TopNav";
import { useRole } from "@/contexts/RoleContext";
import {
  questionBank,
  SKILL_LABEL,
  TYPE_LABEL,
  TYPE_DESCRIPTION,
  DIFFICULTY_LABEL,
  DIFFICULTY_COLOR,
  type BankQuestion,
  type QSkill,
  type QLevel,
  type QType,
  type QDifficulty,
  type FeedbackCriterion,
  type BlankSpec,
} from "@/lib/question-bank";
import {
  Library,
  Search,
  Plus,
  Copy,
  Trash2,
  Pencil,
  ArrowLeft,
  X,
  Eye,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  CheckSquare,
  Square,
  FileQuestion,
  Tag as TagIcon,
  CircleDot,
  ToggleLeft,
  Type as TypeIcon,
  ListOrdered,
  GitCompareArrows,
  TextCursorInput,
  MousePointerSquareDashed,
  Move,
  FileText,
  Image as ImageIcon,
  Music,
  GripVertical,
  Upload,
} from "lucide-react";
import { cn } from "@/lib/utils";

const TYPE_ICON: Record<QType, typeof Plus> = {
  mcq: CircleDot,
  "mcq-multi": CheckSquare,
  tf: ToggleLeft,
  short: TypeIcon,
  sequence: ListOrdered,
  matching: GitCompareArrows,
  fill: TextCursorInput,
  "select-lists": MousePointerSquareDashed,
  "drag-drop": Move,
  essay: FileText,
};

const TYPE_ORDER: QType[] = [
  "mcq",
  "mcq-multi",
  "tf",
  "short",
  "sequence",
  "fill",
  "select-lists",
  "drag-drop",
  "essay",
];

export const Route = createFileRoute("/admin/question-bank")({
  head: () => ({ meta: [{ title: "Ngân hàng câu hỏi — UNICOM LMS" }] }),
  component: BankPage,
});

const SKILLS: QSkill[] = ["listening", "reading", "writing", "speaking"];
const LEVELS: QLevel[] = ["A1", "A2", "B1", "B2", "C1", "C2"];
const PAGE_SIZE = 20;

type SortKey = "newest" | "oldest" | "points-desc" | "points-asc" | "id";

const SKILL_COLOR: Record<QSkill, string> = {
  listening: "bg-sky-500/10 text-sky-600 dark:text-sky-400",
  reading: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  writing: "bg-violet-500/10 text-violet-600 dark:text-violet-400",
  speaking: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
};

function BankPage() {
  const { role } = useRole();
  const [items, setItems] = useState<BankQuestion[]>(questionBank);
  const [skill, setSkill] = useState<QSkill | "all">("all");
  const [level, setLevel] = useState<QLevel | "all">("all");
  const [type, setType] = useState<QType | "all">("all");
  const [difficulty, setDifficulty] = useState<QDifficulty | "all">("all");
  const [q, setQ] = useState("");
  const [sort, setSort] = useState<SortKey>("newest");
  const [editing, setEditing] = useState<BankQuestion | null>(null);
  const [previewing, setPreviewing] = useState<BankQuestion | null>(null);
  const [creating, setCreating] = useState(false);
  const [picking, setPicking] = useState(false);
  const [pickedType, setPickedType] = useState<QType>("mcq");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [page, setPage] = useState(1);
  

  const filtered = useMemo(() => {
    const list = items.filter(
      (it) =>
        (skill === "all" || it.skill === skill) &&
        (level === "all" || it.level === level) &&
        (type === "all" || it.type === type) &&
        (difficulty === "all" || it.difficulty === difficulty) &&
        (!q.trim() ||
          it.content.toLowerCase().includes(q.toLowerCase()) ||
          it.id.toLowerCase().includes(q.toLowerCase()) ||
          it.tags.some((t) => t.toLowerCase().includes(q.toLowerCase()))),
    );
    const sorted = [...list].sort((a, b) => {
      switch (sort) {
        case "newest":
          return b.createdAt.localeCompare(a.createdAt);
        case "oldest":
          return a.createdAt.localeCompare(b.createdAt);
        case "points-desc":
          return b.points - a.points;
        case "points-asc":
          return a.points - b.points;
        case "id":
          return a.id.localeCompare(b.id);
      }
    });
    return sorted;
  }, [items, skill, level, type, difficulty, q, sort]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const paged = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  const skillCounts = useMemo(() => {
    const m: Record<string, number> = {};
    items.forEach((it) => (m[it.skill] = (m[it.skill] || 0) + 1));
    return m;
  }, [items]);

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

  const remove = (id: string) => {
    setItems((p) => p.filter((x) => x.id !== id));
    setSelected((p) => {
      const n = new Set(p);
      n.delete(id);
      return n;
    });
  };
  const duplicate = (it: BankQuestion) =>
    setItems((p) => [
      { ...it, id: nextId(items), createdAt: new Date().toISOString() },
      ...p,
    ]);

  const resetFilters = () => {
    setSkill("all");
    setLevel("all");
    setType("all");
    setDifficulty("all");
    setQ("");
    setPage(1);
  };

  const toggleSelect = (id: string) =>
    setSelected((p) => {
      const n = new Set(p);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });
  const toggleSelectPage = () => {
    const ids = paged.map((x) => x.id);
    const allOn = ids.every((i) => selected.has(i));
    setSelected((p) => {
      const n = new Set(p);
      if (allOn) ids.forEach((i) => n.delete(i));
      else ids.forEach((i) => n.add(i));
      return n;
    });
  };
  const bulkDelete = () => {
    if (!confirm(`Xóa ${selected.size} câu hỏi đã chọn?`)) return;
    setItems((p) => p.filter((x) => !selected.has(x.id)));
    setSelected(new Set());
  };




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
          <div className="flex flex-wrap items-center gap-2">

            <button
              onClick={() => setPicking(true)}
              className="inline-flex items-center gap-1.5 rounded-xl px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-soft"
              style={{ background: "var(--gradient-brand)" }}
            >
              <Plus className="h-4 w-4" /> Thêm câu hỏi
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          <StatCard label="Tổng câu" value={items.length} />
          {SKILLS.map((s) => (
            <StatCard key={s} label={SKILL_LABEL[s]} value={skillCounts[s] || 0} skill={s} />
          ))}
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-[260px_1fr]">
          <aside className="space-y-4 rounded-2xl border border-border bg-surface p-4 shadow-soft h-fit lg:sticky lg:top-20">
            <div className="flex items-center justify-between">
              <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                Bộ lọc
              </div>
              <button
                onClick={resetFilters}
                className="text-[11px] font-semibold text-primary hover:underline"
              >
                Đặt lại
              </button>
            </div>
            <FilterSection label="Kỹ năng">
              <Chip on={skill === "all"} onClick={() => { setSkill("all"); setPage(1); }}>Tất cả</Chip>
              {SKILLS.map((s) => (
                <Chip key={s} on={skill === s} onClick={() => { setSkill(s); setPage(1); }}>
                  {SKILL_LABEL[s]}
                </Chip>
              ))}
            </FilterSection>
            <FilterSection label="Cấp độ">
              <Chip on={level === "all"} onClick={() => { setLevel("all"); setPage(1); }}>Tất cả</Chip>
              {LEVELS.map((l) => (
                <Chip key={l} on={level === l} onClick={() => { setLevel(l); setPage(1); }}>{l}</Chip>
              ))}
            </FilterSection>
            <FilterSection label="Độ khó">
              <Chip on={difficulty === "all"} onClick={() => { setDifficulty("all"); setPage(1); }}>Tất cả</Chip>
              {(Object.keys(DIFFICULTY_LABEL) as QDifficulty[]).map((d) => (
                <Chip key={d} on={difficulty === d} onClick={() => { setDifficulty(d); setPage(1); }}>{DIFFICULTY_LABEL[d]}</Chip>
              ))}
            </FilterSection>
            <FilterSection label="Loại">
              <Chip on={type === "all"} onClick={() => { setType("all"); setPage(1); }}>Tất cả</Chip>
              {(Object.keys(TYPE_LABEL) as QType[]).map((t) => (
                <Chip key={t} on={type === t} onClick={() => { setType(t); setPage(1); }}>{TYPE_LABEL[t]}</Chip>
              ))}
            </FilterSection>
          </aside>

          <main>
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative flex-1 min-w-[220px]">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  value={q}
                  onChange={(e) => { setQ(e.target.value); setPage(1); }}
                  placeholder="Tìm theo nội dung, ID hoặc tag..."
                  className="w-full rounded-xl border border-border bg-surface py-2.5 pl-10 pr-3 text-sm"
                />
              </div>
              <div className="relative">
                <ArrowUpDown className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                <select
                  value={sort}
                  onChange={(e) => setSort(e.target.value as SortKey)}
                  className="rounded-xl border border-border bg-surface py-2.5 pl-8 pr-3 text-sm font-medium"
                >
                  <option value="newest">Mới nhất</option>
                  <option value="oldest">Cũ nhất</option>
                  <option value="points-desc">Điểm cao → thấp</option>
                  <option value="points-asc">Điểm thấp → cao</option>
                  <option value="id">Theo ID</option>
                </select>
              </div>
            </div>

            <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
              <span>
                {filtered.length} / {items.length} câu hỏi
              </span>
              {selected.size > 0 && (
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-foreground">{selected.size} đã chọn</span>
                  <button
                    onClick={bulkDelete}
                    className="inline-flex items-center gap-1 rounded-lg bg-destructive/10 px-2.5 py-1 text-xs font-semibold text-destructive hover:bg-destructive/20"
                  >
                    <Trash2 className="h-3 w-3" /> Xóa
                  </button>
                  <button
                    onClick={() => setSelected(new Set())}
                    className="text-xs font-semibold hover:underline"
                  >
                    Bỏ chọn
                  </button>
                </div>
              )}
            </div>

            {paged.length === 0 ? (
              <div className="mt-3 rounded-2xl border border-dashed border-border bg-surface p-12 text-center">
                <FileQuestion className="mx-auto h-10 w-10 text-muted-foreground" />
                <p className="mt-3 text-sm font-semibold">Không tìm thấy câu hỏi</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Thử thay đổi bộ lọc hoặc thêm câu hỏi mới
                </p>
                <button
                  onClick={resetFilters}
                  className="mt-4 rounded-lg border border-border bg-background px-3 py-1.5 text-xs font-semibold hover:bg-muted"
                >
                  Xóa bộ lọc
                </button>
              </div>
            ) : (
              <div className="mt-3 overflow-hidden rounded-2xl border border-border bg-surface shadow-soft">
                <table className="w-full text-sm">
                  <thead className="bg-muted/40 text-xs uppercase tracking-wider text-muted-foreground">
                    <tr>
                      <th className="px-3 py-3 text-left w-8">
                        <button
                          onClick={toggleSelectPage}
                          className="text-muted-foreground hover:text-foreground"
                        >
                          {paged.every((x) => selected.has(x.id)) ? (
                            <CheckSquare className="h-4 w-4" />
                          ) : (
                            <Square className="h-4 w-4" />
                          )}
                        </button>
                      </th>
                      <th className="px-3 py-3 text-left">ID</th>
                      <th className="px-3 py-3 text-left">Nội dung</th>
                      <th className="px-3 py-3">Kỹ năng</th>
                      <th className="px-3 py-3">Loại</th>
                      <th className="px-3 py-3">Lv</th>
                      <th className="px-3 py-3">Độ khó</th>
                      <th className="px-3 py-3">Điểm</th>
                      <th className="px-3 py-3"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {paged.map((it) => {
                      const isSel = selected.has(it.id);
                      return (
                        <tr
                          key={it.id}
                          className={cn(
                            "border-t border-border hover:bg-muted/30",
                            isSel && "bg-primary/5",
                          )}
                        >
                          <td className="px-3 py-2">
                            <button
                              onClick={() => toggleSelect(it.id)}
                              className="text-muted-foreground hover:text-foreground"
                            >
                              {isSel ? (
                                <CheckSquare className="h-4 w-4 text-primary" />
                              ) : (
                                <Square className="h-4 w-4" />
                              )}
                            </button>
                          </td>
                          <td className="px-3 py-2 font-mono text-xs text-muted-foreground">
                            {it.id}
                          </td>
                          <td className="px-3 py-2 max-w-xl">
                            <button
                              onClick={() => setPreviewing(it)}
                              className="block w-full truncate text-left hover:text-primary"
                            >
                              {it.content}
                            </button>
                          </td>
                          <td className="px-3 py-2 text-center">
                            <span
                              className={cn(
                                "rounded-full px-2 py-0.5 text-[10px] font-semibold",
                                SKILL_COLOR[it.skill],
                              )}
                            >
                              {SKILL_LABEL[it.skill]}
                            </span>
                          </td>
                          <td className="px-3 py-2 text-center text-xs text-muted-foreground">
                            {TYPE_LABEL[it.type]}
                          </td>
                          <td className="px-3 py-2 text-center">
                            <span className="rounded bg-primary/10 px-1.5 py-0.5 text-[10px] font-bold text-primary">
                              {it.level}
                            </span>
                          </td>
                          <td className="px-3 py-2 text-center">
                            <span
                              className={cn(
                                "rounded-full px-2 py-0.5 text-[10px] font-semibold",
                                DIFFICULTY_COLOR[it.difficulty],
                              )}
                            >
                              {DIFFICULTY_LABEL[it.difficulty]}
                            </span>
                          </td>
                          <td className="px-3 py-2 text-center font-semibold">{it.points}</td>
                          <td className="px-3 py-2 text-right">
                            <div className="inline-flex gap-1">
                              <IconBtn onClick={() => setPreviewing(it)} title="Xem">
                                <Eye className="h-3.5 w-3.5" />
                              </IconBtn>
                              <IconBtn onClick={() => setEditing(it)} title="Sửa">
                                <Pencil className="h-3.5 w-3.5" />
                              </IconBtn>
                              <IconBtn onClick={() => duplicate(it)} title="Nhân bản">
                                <Copy className="h-3.5 w-3.5" />
                              </IconBtn>
                              <IconBtn
                                onClick={() => remove(it.id)}
                                title="Xóa"
                                danger
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </IconBtn>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>

                {/* Pagination */}
                <div className="flex items-center justify-between border-t border-border bg-muted/30 px-4 py-2.5 text-xs">
                  <span className="text-muted-foreground">
                    Trang {safePage} / {totalPages} • Hiển thị {paged.length} câu
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      disabled={safePage === 1}
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      className="inline-flex h-7 items-center gap-1 rounded-lg border border-border bg-background px-2 font-semibold disabled:opacity-40 hover:bg-muted"
                    >
                      <ChevronLeft className="h-3.5 w-3.5" /> Trước
                    </button>
                    <button
                      disabled={safePage === totalPages}
                      onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                      className="inline-flex h-7 items-center gap-1 rounded-lg border border-border bg-background px-2 font-semibold disabled:opacity-40 hover:bg-muted"
                    >
                      Sau <ChevronRight className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </main>
        </div>
      </div>

      {picking && (
        <TypePickerDialog
          onClose={() => setPicking(false)}
          onPick={(t) => {
            setPickedType(t);
            setPicking(false);
            setCreating(true);
          }}
        />
      )}

      {(editing || creating) && (
        <EditDialog
          question={editing}
          initialType={pickedType}
          onClose={() => {
            setEditing(null);
            setCreating(false);
          }}
          onSave={(qn) => {
            if (editing) {
              setItems((p) => p.map((x) => (x.id === qn.id ? qn : x)));
            } else {
              setItems((p) => [{ ...qn, id: nextId(items) }, ...p]);
            }
            setEditing(null);
            setCreating(false);
          }}
        />
      )}

      {previewing && (
        <PreviewDialog
          question={previewing}
          onClose={() => setPreviewing(null)}
          onEdit={() => {
            setEditing(previewing);
            setPreviewing(null);
          }}
        />
      )}
    </div>
  );
}

function nextId(items: BankQuestion[]) {
  const max = items.reduce((m, it) => {
    const n = parseInt(it.id.replace(/\D/g, ""), 10);
    return Number.isFinite(n) && n > m ? n : m;
  }, 0);
  return `Q${String(max + 1).padStart(4, "0")}`;
}

function StatCard({
  label,
  value,
  skill,
}: {
  label: string;
  value: number;
  skill?: QSkill;
}) {
  return (
    <div className="rounded-2xl border border-border bg-surface p-3 shadow-soft">
      <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </div>
      <div className="mt-1 flex items-baseline gap-1.5">
        <span className="font-display text-2xl font-semibold">{value}</span>
        {skill && (
          <span className={cn("h-2 w-2 rounded-full", SKILL_COLOR[skill])} />
        )}
      </div>
    </div>
  );
}

function IconBtn({
  onClick,
  children,
  title,
  danger,
}: {
  onClick: () => void;
  children: React.ReactNode;
  title: string;
  danger?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      title={title}
      className={cn(
        "rounded-lg p-1.5 text-muted-foreground transition",
        danger
          ? "hover:bg-destructive/10 hover:text-destructive"
          : "hover:bg-muted hover:text-foreground",
      )}
    >
      {children}
    </button>
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

function PreviewDialog({
  question,
  onClose,
  onEdit,
}: {
  question: BankQuestion;
  onClose: () => void;
  onEdit: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <button onClick={onClose} className="absolute inset-0" aria-label="Close" />
      <div className="relative w-full max-w-2xl rounded-3xl bg-background p-6 shadow-elevated">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="font-mono text-[11px] text-muted-foreground">{question.id}</span>
              <span
                className={cn(
                  "rounded-full px-2 py-0.5 text-[10px] font-semibold",
                  SKILL_COLOR[question.skill],
                )}
              >
                {SKILL_LABEL[question.skill]}
              </span>
              <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-semibold">
                {TYPE_LABEL[question.type]}
              </span>
              <span className="rounded bg-primary/10 px-1.5 py-0.5 text-[10px] font-bold text-primary">
                {question.level}
              </span>
              <span
                className={cn(
                  "rounded-full px-2 py-0.5 text-[10px] font-semibold",
                  DIFFICULTY_COLOR[question.difficulty],
                )}
              >
                {DIFFICULTY_LABEL[question.difficulty]}
              </span>
              <span className="text-[10px] text-muted-foreground">• {question.points} điểm</span>
            </div>
            <h2 className="mt-2 font-display text-lg font-semibold leading-snug">
              {question.content}
            </h2>
          </div>
          <button onClick={onClose} className="rounded-lg p-2 hover:bg-muted">
            <X className="h-4 w-4" />
          </button>
        </div>

        {question.options && question.options.length > 0 && (
          <div className="mt-4 space-y-1.5">
            <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Đáp án
            </div>
            {question.options.map((o, i) => (
              <div
                key={i}
                className={cn(
                  "rounded-xl border px-3 py-2 text-sm",
                  question.correctAnswer && o.startsWith(question.correctAnswer)
                    ? "border-emerald-500/40 bg-emerald-500/5"
                    : "border-border",
                )}
              >
                {o}
              </div>
            ))}
          </div>
        )}

        {question.correctAnswer && !question.options?.length && question.type !== "essay" && (
          <div className="mt-4 rounded-xl border border-emerald-500/40 bg-emerald-500/5 p-3 text-sm">
            <div className="text-[11px] font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
              Đáp án mẫu
            </div>
            <div className="mt-1">{question.correctAnswer}</div>
          </div>
        )}

        {question.type === "essay" && (
          <div className="mt-4 space-y-3">
            {question.solution && (
              <div className="rounded-xl border border-violet-500/30 bg-violet-500/5 p-3">
                <div className="text-[11px] font-semibold uppercase tracking-wider text-violet-600 dark:text-violet-400">
                  Solution (bài mẫu)
                </div>
                <pre className="mt-2 whitespace-pre-wrap font-sans text-sm leading-relaxed text-foreground">
                  {question.solution}
                </pre>
              </div>
            )}
            {question.feedback && question.feedback.length > 0 && (
              <div className="rounded-xl border border-border bg-surface">
                <div className="border-b border-border px-3 py-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Feedback / Rubric ({question.feedback.length} tiêu chí)
                </div>
                <div className="divide-y divide-border">
                  {question.feedback.map((c, i) => (
                    <div key={i} className="grid grid-cols-[140px_1fr] gap-3 px-3 py-2 text-sm">
                      <span className="font-mono text-xs font-semibold text-violet-600 dark:text-violet-400">
                        {c.keyword || "—"}
                      </span>
                      <span className="text-foreground">{c.comment}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {question.tags.length > 0 && (
          <div className="mt-4 flex flex-wrap items-center gap-1.5">
            <TagIcon className="h-3 w-3 text-muted-foreground" />
            {question.tags.map((t) => (
              <span key={t} className="rounded-full bg-muted px-2 py-0.5 text-[10px]">
                {t}
              </span>
            ))}
          </div>
        )}

        <div className="mt-6 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="rounded-xl border border-border bg-background px-4 py-2 text-sm font-semibold hover:bg-muted"
          >
            Đóng
          </button>
          <button
            onClick={onEdit}
            className="inline-flex items-center gap-1.5 rounded-xl px-4 py-2 text-sm font-semibold text-primary-foreground shadow-soft"
            style={{ background: "var(--gradient-brand)" }}
          >
            <Pencil className="h-3.5 w-3.5" /> Chỉnh sửa
          </button>
        </div>
      </div>
    </div>
  );
}

async function fileToDataURL(f: File): Promise<string> {
  return await new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(String(r.result));
    r.onerror = reject;
    r.readAsDataURL(f);
  });
}

function EditDialog({
  question,
  initialType,
  onClose,
  onSave,
}: {
  question: BankQuestion | null;
  initialType?: QType;
  onClose: () => void;
  onSave: (q: BankQuestion) => void;
}) {
  const defaultsForType = (t: QType): Partial<BankQuestion> => {
    if (t === "mcq" || t === "mcq-multi")
      return { options: ["", "", "", ""], correctAnswer: t === "mcq" ? "A" : "A,B", optionImages: [] };
    if (t === "tf") return { options: ["True", "False"], correctAnswer: "True" };
    if (t === "sequence") return { options: ["Bước 1", "Bước 2", "Bước 3"], correctAnswer: "1,2,3" };
    if (t === "fill")
      return {
        passage: "Điền vào chỗ trống: I [1] to school every day.",
        blanks: [{ index: 1, answers: ["go", "walk"] }],
      };
    if (t === "select-lists")
      return {
        passage: "She [1] coffee in the morning.",
        blanks: [
          { index: 1, options: ["drinks", "drink", "drank"], correctOption: 0, answers: [] },
        ],
      };
    if (t === "drag-drop" || t === "matching")
      return {
        dragMode: "words",
        passage: "He [1] to the [2] every Sunday.",
        blanks: [
          { index: 1, answers: ["goes"] },
          { index: 2, answers: ["park"] },
        ],
      };
    if (t === "essay")
      return {
        solution: "",
        feedback: [
          { keyword: "", comment: "" },
          { keyword: "", comment: "" },
        ],
      };
    return { options: undefined };
  };

  const startingType = initialType ?? question?.type ?? "mcq";
  const [form, setForm] = useState<BankQuestion>(
    question ?? {
      id: "",
      content: "",
      skill: "reading",
      type: startingType,
      level: "A1",
      difficulty: "medium",
      points: startingType === "essay" ? 5 : startingType === "short" ? 2 : 1,
      tags: [],
      createdAt: new Date().toISOString(),
      correctAnswer: "",
      ...defaultsForType(startingType),
    },
  );
  const [extrasOpen, setExtrasOpen] = useState(false);

  const isMcq = form.type === "mcq" || form.type === "mcq-multi";
  const isMcqMulti = form.type === "mcq-multi";
  const isEssay = form.type === "essay";
  const isShort = form.type === "short";
  const isTF = form.type === "tf";
  const isSequence = form.type === "sequence";
  const isFill = form.type === "fill";
  const isSelectLists = form.type === "select-lists";
  const isDragDrop = form.type === "drag-drop" || form.type === "matching";

  // ---------- MCQ helpers ----------
  const opts = form.options ?? [];
  const optImages = form.optionImages ?? [];
  const updateOption = (i: number, v: string) => {
    const next = [...opts];
    next[i] = v;
    setForm({ ...form, options: next });
  };
  const setOptionImage = async (i: number, file: File | null) => {
    const next = [...optImages];
    next[i] = file ? await fileToDataURL(file) : undefined;
    setForm({ ...form, optionImages: next });
  };
  const addOption = () => setForm({ ...form, options: [...opts, ""] });
  const removeOption = (i: number) => {
    const nOpts = opts.filter((_, x) => x !== i);
    const nImgs = optImages.filter((_, x) => x !== i);
    setForm({ ...form, options: nOpts, optionImages: nImgs });
  };
  const toggleMultiCorrect = (letter: string) => {
    const cur = (form.correctAnswer ?? "").split(",").filter(Boolean);
    const set = new Set(cur);
    if (set.has(letter)) set.delete(letter);
    else set.add(letter);
    setForm({ ...form, correctAnswer: Array.from(set).sort().join(",") });
  };

  // ---------- Audio question ----------
  const setQuestionAudio = async (file: File | null) => {
    setForm({ ...form, audioUrl: file ? await fileToDataURL(file) : undefined });
  };

  // ---------- Sequence ----------
  const seqOrder = (form.correctAnswer ?? (form.options ?? []).map((_, i) => i + 1).join(","))
    .split(",")
    .map((s) => Number(s))
    .filter((n) => !Number.isNaN(n));
  const moveSeq = (from: number, to: number) => {
    const arr = [...seqOrder];
    const [it] = arr.splice(from, 1);
    arr.splice(to, 0, it);
    setForm({ ...form, correctAnswer: arr.join(",") });
  };

  // ---------- Blanks ----------
  const blanks = form.blanks ?? [];
  const nextBlankIndex = (blanks.reduce((m, b) => Math.max(m, b.index), 0) || 0) + 1;
  const addBlank = () => {
    const idx = nextBlankIndex;
    const newBlank: BlankSpec = isSelectLists
      ? { index: idx, options: ["", "", ""], correctOption: 0, answers: [] }
      : { index: idx, answers: [""] };
    setForm({
      ...form,
      passage: (form.passage ?? "") + ` [${idx}]`,
      blanks: [...blanks, newBlank],
    });
  };
  const updateBlank = (idx: number, patch: Partial<BlankSpec>) => {
    setForm({
      ...form,
      blanks: blanks.map((b) => (b.index === idx ? { ...b, ...patch } : b)),
    });
  };
  const removeBlank = (idx: number) => {
    setForm({
      ...form,
      passage: (form.passage ?? "").replace(new RegExp(`\\s*\\[${idx}\\]`, "g"), ""),
      blanks: blanks.filter((b) => b.index !== idx),
    });
  };

  const canSave = form.content.trim().length > 0;

  const inputCls =
    "w-full rounded-lg border border-border bg-background px-2 py-1.5 text-sm";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <button onClick={onClose} className="absolute inset-0" aria-label="Close" />
      <div className="relative max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-3xl bg-background p-6 shadow-elevated">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h2 className="font-display text-lg font-semibold">
              {question ? "Sửa câu hỏi" : "Thêm câu hỏi mới"}
            </h2>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-2.5 py-1 text-[11px] font-semibold text-primary">
              {(() => {
                const Icon = TYPE_ICON[form.type];
                return <Icon className="h-3.5 w-3.5" />;
              })()}
              {TYPE_LABEL[form.type]}
            </span>
          </div>
          <button onClick={onClose} className="rounded-lg p-2 hover:bg-muted">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-4 space-y-4">
          <div>
            <label className="text-xs font-semibold text-muted-foreground">
              Nội dung câu hỏi *
            </label>
            <textarea
              value={form.content}
              onChange={(e) => setForm({ ...form, content: e.target.value })}
              rows={2}
              placeholder="Nhập nội dung câu hỏi / yêu cầu cho học viên..."
              className="mt-1 w-full rounded-xl border border-border bg-background p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Field label="Kỹ năng">
              <select
                value={form.skill}
                onChange={(e) => setForm({ ...form, skill: e.target.value as QSkill })}
                className={inputCls}
              >
                {SKILLS.map((s) => (
                  <option key={s} value={s}>{SKILL_LABEL[s]}</option>
                ))}
              </select>
            </Field>
            <Field label="Cấp độ">
              <select
                value={form.level}
                onChange={(e) => setForm({ ...form, level: e.target.value as QLevel })}
                className={inputCls}
              >
                {LEVELS.map((l) => (
                  <option key={l} value={l}>{l}</option>
                ))}
              </select>
            </Field>
            <Field label="Độ khó">
              <select
                value={form.difficulty}
                onChange={(e) => setForm({ ...form, difficulty: e.target.value as QDifficulty })}
                className={inputCls}
              >
                {(Object.keys(DIFFICULTY_LABEL) as QDifficulty[]).map((d) => (
                  <option key={d} value={d}>{DIFFICULTY_LABEL[d]}</option>
                ))}
              </select>
            </Field>
            <Field label="Điểm">
              <input
                type="number"
                min={1}
                value={form.points}
                onChange={(e) => setForm({ ...form, points: Number(e.target.value) })}
                className={inputCls}
              />
            </Field>
          </div>

          {/* ===== Optional attachments ===== */}
          <div className="rounded-2xl border border-dashed border-border">
            <button
              type="button"
              onClick={() => setExtrasOpen((v) => !v)}
              className="flex w-full items-center justify-between gap-2 px-4 py-2.5 text-xs font-semibold text-muted-foreground hover:bg-muted/40"
            >
              <span className="inline-flex items-center gap-2">
                <Upload className="h-3.5 w-3.5" /> Tệp đính kèm (tùy chọn): audio cho câu hỏi, ảnh cho từng lựa chọn
              </span>
              <span>{extrasOpen ? "Ẩn" : "Hiện"}</span>
            </button>
            {extrasOpen && (
              <div className="space-y-3 border-t border-border bg-muted/20 px-4 py-3">
                <div>
                  <label className="text-[11px] font-semibold text-muted-foreground">
                    <Music className="mr-1 inline h-3 w-3" /> Audio câu hỏi
                  </label>
                  <div className="mt-1 flex items-center gap-2">
                    <input
                      type="file"
                      accept="audio/*"
                      onChange={(e) => setQuestionAudio(e.target.files?.[0] ?? null)}
                      className="text-xs"
                    />
                    {form.audioUrl && (
                      <button
                        onClick={() => setQuestionAudio(null)}
                        className="rounded-md p-1 text-rose-500 hover:bg-rose-500/10"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                  {form.audioUrl && (
                    <audio controls src={form.audioUrl} className="mt-2 h-8 w-full" />
                  )}
                </div>
                <p className="text-[11px] text-muted-foreground">
                  Ảnh cho từng lựa chọn có thể tải ngay trên từng dòng đáp án (nếu loại câu hỏi có lựa chọn).
                </p>
              </div>
            )}
          </div>

          {/* ===== Type-specific editors ===== */}

          {isMcq && (
            <div>
              <div className="mb-1.5 flex items-center justify-between">
                <label className="text-xs font-semibold text-muted-foreground">
                  Lựa chọn {isMcqMulti ? "(chọn nhiều đáp án đúng)" : "(chọn đáp án đúng)"}
                </label>
                <button
                  onClick={addOption}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
                >
                  <Plus className="h-3 w-3" /> Thêm lựa chọn
                </button>
              </div>
              <div className="space-y-2">
                {opts.map((o, i) => {
                  const letter = String.fromCharCode(65 + i);
                  const correctSet = (form.correctAnswer ?? "").split(",").filter(Boolean);
                  const isCorrect = isMcqMulti
                    ? correctSet.includes(letter)
                    : form.correctAnswer === letter;
                  return (
                    <div key={i} className="rounded-xl border border-border bg-muted/20 p-2">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() =>
                            isMcqMulti
                              ? toggleMultiCorrect(letter)
                              : setForm({ ...form, correctAnswer: letter })
                          }
                          className={cn(
                            "inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-xs font-bold",
                            isCorrect
                              ? "bg-emerald-500 text-white"
                              : "bg-muted text-muted-foreground hover:bg-muted/70",
                          )}
                          title={isCorrect ? "Đáp án đúng" : "Đặt làm đáp án đúng"}
                        >
                          {letter}
                        </button>
                        <input
                          value={o}
                          onChange={(e) => updateOption(i, e.target.value)}
                          placeholder={`Phương án ${letter}`}
                          className={cn(inputCls, "flex-1")}
                        />
                        <label className="inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-md border border-border text-muted-foreground hover:bg-muted" title="Tải ảnh cho lựa chọn">
                          <ImageIcon className="h-3.5 w-3.5" />
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => setOptionImage(i, e.target.files?.[0] ?? null)}
                          />
                        </label>
                        <button
                          onClick={() => removeOption(i)}
                          className="rounded-md p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                      {optImages[i] && (
                        <div className="mt-2 flex items-center gap-2">
                          <img
                            src={optImages[i]}
                            alt=""
                            className="h-16 w-16 rounded-md border border-border object-cover"
                          />
                          <button
                            onClick={() => setOptionImage(i, null)}
                            className="text-[11px] font-semibold text-rose-500 hover:underline"
                          >
                            Bỏ ảnh
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {isTF && (
            <div>
              <label className="text-xs font-semibold text-muted-foreground">Đáp án đúng</label>
              <div className="mt-1 flex gap-2">
                {["True", "False"].map((v) => (
                  <button
                    key={v}
                    type="button"
                    onClick={() => setForm({ ...form, correctAnswer: v })}
                    className={cn(
                      "flex-1 rounded-xl border px-4 py-2 text-sm font-semibold",
                      form.correctAnswer === v
                        ? "border-emerald-500 bg-emerald-500/10 text-emerald-600"
                        : "border-border bg-background hover:bg-muted",
                    )}
                  >
                    {v}
                  </button>
                ))}
              </div>
            </div>
          )}

          {(isShort || (!isMcq && !isTF && !isSequence && !isFill && !isSelectLists && !isDragDrop && !isEssay)) && (
            <div>
              <label className="text-xs font-semibold text-muted-foreground">
                Đáp án mẫu
              </label>
              <input
                value={form.correctAnswer ?? ""}
                onChange={(e) => setForm({ ...form, correctAnswer: e.target.value })}
                placeholder="Nhập đáp án mẫu"
                className={cn(inputCls, "mt-1")}
              />
            </div>
          )}

          {isSequence && (
            <div className="space-y-3">
              <div>
                <div className="mb-1.5 flex items-center justify-between">
                  <label className="text-xs font-semibold text-muted-foreground">
                    Các mục (được đánh số tự động)
                  </label>
                  <button
                    onClick={() => {
                      const next = [...opts, ""];
                      setForm({
                        ...form,
                        options: next,
                        correctAnswer: next.map((_, i) => i + 1).join(","),
                      });
                    }}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
                  >
                    <Plus className="h-3 w-3" /> Thêm mục
                  </button>
                </div>
                <div className="space-y-1.5">
                  {opts.map((o, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <span className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-foreground text-xs font-bold text-background">
                        {i + 1}
                      </span>
                      <input
                        value={o}
                        onChange={(e) => updateOption(i, e.target.value)}
                        placeholder={`Mục ${i + 1}`}
                        className={cn(inputCls, "flex-1")}
                      />
                      <button
                        onClick={() => {
                          const next = opts.filter((_, x) => x !== i);
                          setForm({
                            ...form,
                            options: next,
                            correctAnswer: next.map((_, j) => j + 1).join(","),
                          });
                        }}
                        className="rounded-md p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-muted-foreground">
                  Đáp án — kéo thả các số theo thứ tự đúng
                </label>
                <div className="mt-1 flex flex-wrap gap-2 rounded-xl border border-dashed border-border bg-muted/30 p-3">
                  {seqOrder.map((n, i) => (
                    <div
                      key={`${n}-${i}`}
                      draggable
                      onDragStart={(e) => e.dataTransfer.setData("text/plain", String(i))}
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={(e) => {
                        e.preventDefault();
                        const from = Number(e.dataTransfer.getData("text/plain"));
                        if (!Number.isNaN(from) && from !== i) moveSeq(from, i);
                      }}
                      className="inline-flex cursor-grab items-center gap-1.5 rounded-lg border border-border bg-background px-3 py-1.5 text-sm font-semibold shadow-sm active:cursor-grabbing"
                    >
                      <GripVertical className="h-3 w-3 text-muted-foreground" />
                      <span className="font-mono">{n}</span>
                      <span className="text-xs text-muted-foreground">— {opts[n - 1] ?? ""}</span>
                    </div>
                  ))}
                </div>
                <p className="mt-1 text-[11px] text-muted-foreground">
                  Thứ tự hiện tại: <code className="font-mono">{seqOrder.join(", ")}</code>
                </p>
              </div>
            </div>
          )}

          {(isFill || isSelectLists || isDragDrop) && (
            <div className="space-y-3 rounded-2xl border border-primary/20 bg-primary/[0.03] p-4">
              {isDragDrop && (
                <div className="flex items-center gap-2 text-xs">
                  <span className="font-semibold text-muted-foreground">Chế độ kéo thả:</span>
                  {(["words", "passages"] as const).map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setForm({ ...form, dragMode: m })}
                      className={cn(
                        "rounded-md px-2.5 py-1 text-[11px] font-semibold",
                        (form.dragMode ?? "words") === m
                          ? "bg-primary text-primary-foreground"
                          : "bg-background border border-border text-muted-foreground hover:bg-muted",
                      )}
                    >
                      {m === "words" ? "Kéo từ" : "Kéo đoạn văn"}
                    </button>
                  ))}
                </div>
              )}

              <div>
                <div className="mb-1 flex items-center justify-between">
                  <label className="text-xs font-semibold text-muted-foreground">
                    Đề bài (sử dụng <code className="rounded bg-muted px-1 font-mono">[1] [2] …</code> làm chỗ trống)
                  </label>
                  <button
                    onClick={addBlank}
                    className="inline-flex items-center gap-1 rounded-md bg-foreground px-2 py-1 text-[11px] font-semibold text-background"
                  >
                    <Plus className="h-3 w-3" /> Thêm chỗ trống
                  </button>
                </div>
                <textarea
                  value={form.passage ?? ""}
                  onChange={(e) => setForm({ ...form, passage: e.target.value })}
                  rows={3}
                  placeholder={
                    isDragDrop && form.dragMode === "passages"
                      ? "Dán đoạn văn có các vị trí [1], [2] cần kéo thả đoạn văn vào..."
                      : "Vd: She [1] coffee in the [2] morning."
                  }
                  className="w-full rounded-xl border border-border bg-background p-3 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>

              <div className="space-y-2">
                <div className="text-xs font-semibold text-muted-foreground">
                  Đáp án cho từng chỗ trống
                </div>
                {blanks.map((b) => (
                  <div key={b.index} className="rounded-xl border border-border bg-background p-3">
                    <div className="mb-2 flex items-center justify-between">
                      <span className="inline-flex h-6 items-center gap-1 rounded-md bg-primary/10 px-2 text-[11px] font-bold text-primary">
                        [{b.index}]
                      </span>
                      <button
                        onClick={() => removeBlank(b.index)}
                        className="rounded-md p-1 text-rose-500 hover:bg-rose-500/10"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>

                    {isSelectLists ? (
                      <div className="space-y-1.5">
                        <div className="text-[11px] font-semibold text-muted-foreground">
                          Tùy chọn cho danh sách thả xuống (text only)
                        </div>
                        {(b.options ?? []).map((opt, oi) => (
                          <div key={oi} className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => updateBlank(b.index, { correctOption: oi })}
                              className={cn(
                                "inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-[11px] font-bold",
                                b.correctOption === oi
                                  ? "bg-emerald-500 text-white"
                                  : "bg-muted text-muted-foreground hover:bg-muted/70",
                              )}
                              title="Đặt là đáp án đúng"
                            >
                              ✓
                            </button>
                            <input
                              value={opt}
                              onChange={(e) => {
                                const next = [...(b.options ?? [])];
                                next[oi] = e.target.value;
                                updateBlank(b.index, { options: next });
                              }}
                              placeholder={`Lựa chọn ${oi + 1}`}
                              className={cn(inputCls, "flex-1")}
                            />
                            <button
                              onClick={() => {
                                const next = (b.options ?? []).filter((_, x) => x !== oi);
                                const cor = b.correctOption ?? 0;
                                updateBlank(b.index, {
                                  options: next,
                                  correctOption: cor >= next.length ? Math.max(0, next.length - 1) : cor,
                                });
                              }}
                              className="rounded-md p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        ))}
                        <button
                          onClick={() =>
                            updateBlank(b.index, { options: [...(b.options ?? []), ""] })
                          }
                          className="inline-flex items-center gap-1 text-[11px] font-semibold text-primary hover:underline"
                        >
                          <Plus className="h-3 w-3" /> Thêm lựa chọn
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-1.5">
                        <div className="text-[11px] font-semibold text-muted-foreground">
                          {isDragDrop
                            ? form.dragMode === "passages"
                              ? "Đoạn văn đúng cần kéo vào chỗ trống này"
                              : "Từ/cụm từ đúng cần kéo vào"
                            : "Đáp án chấp nhận (mỗi dòng 1 đáp án)"}
                        </div>
                        {(b.answers ?? []).map((a, ai) => (
                          <div key={ai} className="flex items-center gap-2">
                            {isDragDrop && form.dragMode === "passages" ? (
                              <textarea
                                value={a}
                                onChange={(e) => {
                                  const next = [...(b.answers ?? [])];
                                  next[ai] = e.target.value;
                                  updateBlank(b.index, { answers: next });
                                }}
                                rows={2}
                                placeholder="Nhập đoạn văn..."
                                className={cn(inputCls, "flex-1")}
                              />
                            ) : (
                              <input
                                value={a}
                                onChange={(e) => {
                                  const next = [...(b.answers ?? [])];
                                  next[ai] = e.target.value;
                                  updateBlank(b.index, { answers: next });
                                }}
                                placeholder={isFill ? "Đáp án chấp nhận" : "Từ đúng"}
                                className={cn(inputCls, "flex-1")}
                              />
                            )}
                            <button
                              onClick={() => {
                                const next = (b.answers ?? []).filter((_, x) => x !== ai);
                                updateBlank(b.index, { answers: next });
                              }}
                              className="rounded-md p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        ))}
                        {isFill && (
                          <button
                            onClick={() =>
                              updateBlank(b.index, { answers: [...(b.answers ?? []), ""] })
                            }
                            className="inline-flex items-center gap-1 text-[11px] font-semibold text-primary hover:underline"
                          >
                            <Plus className="h-3 w-3" /> Thêm đáp án chấp nhận
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                ))}
                {blanks.length === 0 && (
                  <div className="rounded-lg border border-dashed border-border p-3 text-center text-xs text-muted-foreground">
                    Chưa có chỗ trống nào. Bấm "Thêm chỗ trống" để bắt đầu.
                  </div>
                )}
              </div>

              {isDragDrop && (
                <p className="text-[11px] text-muted-foreground">
                  Học viên sẽ thấy danh sách {form.dragMode === "passages" ? "đoạn văn" : "từ"} (gồm các đáp án ở trên + nhiễu) và kéo thả vào đúng chỗ trống.
                </p>
              )}
            </div>
          )}

          {isEssay && (
            <div className="space-y-4 rounded-2xl border border-violet-500/30 bg-violet-500/5 p-4">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-violet-600 dark:text-violet-400">
                <FileText className="h-3.5 w-3.5" /> Câu hỏi tự luận — không có đáp án cố định
              </div>
              <div>
                <label className="text-xs font-semibold text-muted-foreground">
                  Bài mẫu tham khảo *
                </label>
                <textarea
                  value={form.solution ?? ""}
                  onChange={(e) => setForm({ ...form, solution: e.target.value })}
                  rows={6}
                  placeholder="Viết một bài mẫu để học viên đối chiếu sau khi nộp..."
                  className="mt-1 w-full rounded-xl border border-border bg-background p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>
              <div>
                <div className="mb-1.5 flex items-center justify-between">
                  <label className="text-xs font-semibold text-muted-foreground">
                    Feedback / Rubric chấm điểm
                  </label>
                  <button
                    onClick={() =>
                      setForm({
                        ...form,
                        feedback: [...(form.feedback ?? []), { keyword: "", comment: "" }],
                      })
                    }
                    className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
                  >
                    <Plus className="h-3 w-3" /> Thêm tiêu chí
                  </button>
                </div>
                <div className="space-y-1.5">
                  {(form.feedback ?? []).map((c, i) => (
                    <div key={i} className="grid grid-cols-[140px_1fr_auto] items-center gap-2">
                      <input
                        value={c.keyword}
                        onChange={(e) => {
                          const next = [...(form.feedback ?? [])];
                          next[i] = { ...c, keyword: e.target.value };
                          setForm({ ...form, feedback: next });
                        }}
                        placeholder="Từ khóa, vd: Dear"
                        className={cn(inputCls, "font-mono")}
                      />
                      <input
                        value={c.comment}
                        onChange={(e) => {
                          const next = [...(form.feedback ?? [])];
                          next[i] = { ...c, comment: e.target.value };
                          setForm({ ...form, feedback: next });
                        }}
                        placeholder="Nhận xét hiển thị cho học viên..."
                        className={inputCls}
                      />
                      <button
                        onClick={() => {
                          const next = (form.feedback ?? []).filter((_, x) => x !== i);
                          setForm({ ...form, feedback: next });
                        }}
                        className="rounded-md p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="mt-6 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="rounded-xl border border-border bg-background px-4 py-2 text-sm font-semibold hover:bg-muted"
          >
            Hủy
          </button>
          <button
            disabled={!canSave}
            onClick={() => onSave(form)}
            className="rounded-xl px-4 py-2 text-sm font-semibold text-primary-foreground shadow-soft disabled:opacity-50"
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
      <label className="text-xs font-semibold text-muted-foreground">{label}</label>
      <div className="mt-1">{children}</div>
    </div>
  );
}

function TypePickerDialog({
  onClose,
  onPick,
}: {
  onClose: () => void;
  onPick: (t: QType) => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <button onClick={onClose} className="absolute inset-0" aria-label="Close" />
      <div className="relative max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-3xl bg-background p-6 shadow-elevated">
        <div className="flex items-start justify-between gap-3">
          <div>
            <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-primary">
              <FileQuestion className="h-3.5 w-3.5" /> Chọn loại câu hỏi
            </span>
            <h2 className="mt-1 font-display text-xl font-semibold">
              Bạn muốn tạo loại câu hỏi nào?
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Chọn một loại để bắt đầu soạn thảo nội dung và đáp án.
            </p>
          </div>
          <button onClick={onClose} className="rounded-lg p-2 hover:bg-muted">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {TYPE_ORDER.map((t) => {
            const Icon = TYPE_ICON[t];
            return (
              <button
                key={t}
                onClick={() => onPick(t)}
                className="group flex flex-col items-center gap-2 rounded-2xl border border-border bg-surface p-4 text-center transition hover:-translate-y-0.5 hover:border-primary/40 hover:bg-primary/5 hover:shadow-soft"
              >
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary transition group-hover:scale-110">
                  <Icon className="h-7 w-7" />
                </div>
                <div className="text-sm font-semibold leading-tight">{TYPE_LABEL[t]}</div>
                <div className="text-[11px] leading-snug text-muted-foreground">
                  {TYPE_DESCRIPTION[t]}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
