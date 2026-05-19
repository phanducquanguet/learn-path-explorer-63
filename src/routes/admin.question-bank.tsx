import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useRef, useState } from "react";
import { TopNav } from "@/components/TopNav";
import { useRole } from "@/contexts/RoleContext";
import {
  questionBank,
  SKILL_LABEL,
  TYPE_LABEL,
  TYPE_DESCRIPTION,
  type BankQuestion,
  type QSkill,
  type QLevel,
  type QType,
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
  Download,
  Upload,
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
  "matching",
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
  const [q, setQ] = useState("");
  const [sort, setSort] = useState<SortKey>("newest");
  const [editing, setEditing] = useState<BankQuestion | null>(null);
  const [previewing, setPreviewing] = useState<BankQuestion | null>(null);
  const [creating, setCreating] = useState(false);
  const [picking, setPicking] = useState(false);
  const [pickedType, setPickedType] = useState<QType>("mcq");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [page, setPage] = useState(1);
  const fileRef = useRef<HTMLInputElement>(null);

  const filtered = useMemo(() => {
    const list = items.filter(
      (it) =>
        (skill === "all" || it.skill === skill) &&
        (level === "all" || it.level === level) &&
        (type === "all" || it.type === type) &&
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
  }, [items, skill, level, type, q, sort]);

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

  const exportJson = () => {
    const blob = new Blob([JSON.stringify(items, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `question-bank-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };
  const importJson = async (f: File) => {
    try {
      const txt = await f.text();
      const data = JSON.parse(txt) as BankQuestion[];
      if (Array.isArray(data)) setItems((p) => [...data, ...p]);
    } catch {
      alert("File JSON không hợp lệ");
    }
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
            <input
              ref={fileRef}
              type="file"
              accept="application/json"
              className="hidden"
              onChange={(e) => e.target.files?.[0] && importJson(e.target.files[0])}
            />
            <button
              onClick={() => fileRef.current?.click()}
              className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-surface px-3 py-2 text-sm font-semibold hover:bg-muted"
            >
              <Upload className="h-4 w-4" /> Nhập
            </button>
            <button
              onClick={exportJson}
              className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-surface px-3 py-2 text-sm font-semibold hover:bg-muted"
            >
              <Download className="h-4 w-4" /> Xuất
            </button>
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

      {(editing || creating) && (
        <EditDialog
          question={editing}
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

        {question.correctAnswer && !question.options?.length && (
          <div className="mt-4 rounded-xl border border-emerald-500/40 bg-emerald-500/5 p-3 text-sm">
            <div className="text-[11px] font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
              Đáp án mẫu
            </div>
            <div className="mt-1">{question.correctAnswer}</div>
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
      options: ["A. ", "B. ", "C. ", "D. "],
      correctAnswer: "A",
    },
  );
  const [tagInput, setTagInput] = useState("");

  const isMcq = form.type === "mcq" || form.type === "mcq-multi";
  const hasOptions = isMcq || form.type === "matching" || form.type === "sequence" || form.type === "select-lists" || form.type === "drag-drop";

  const addTag = () => {
    const v = tagInput.trim();
    if (!v || form.tags.includes(v)) return;
    setForm({ ...form, tags: [...form.tags, v] });
    setTagInput("");
  };
  const removeTag = (t: string) =>
    setForm({ ...form, tags: form.tags.filter((x) => x !== t) });

  const updateOption = (i: number, v: string) => {
    const opts = [...(form.options ?? [])];
    opts[i] = v;
    setForm({ ...form, options: opts });
  };
  const addOption = () =>
    setForm({ ...form, options: [...(form.options ?? []), ""] });
  const removeOption = (i: number) =>
    setForm({ ...form, options: (form.options ?? []).filter((_, x) => x !== i) });

  const canSave = form.content.trim().length > 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <button onClick={onClose} className="absolute inset-0" aria-label="Close" />
      <div className="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl bg-background p-6 shadow-elevated">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-lg font-semibold">
            {question ? "Sửa câu hỏi" : "Thêm câu hỏi mới"}
          </h2>
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
              rows={3}
              placeholder="Nhập nội dung câu hỏi..."
              className="mt-1 w-full rounded-xl border border-border bg-background p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
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

          {hasOptions && (
            <div>
              <div className="mb-1.5 flex items-center justify-between">
                <label className="text-xs font-semibold text-muted-foreground">
                  Lựa chọn
                </label>
                <button
                  onClick={addOption}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
                >
                  <Plus className="h-3 w-3" /> Thêm lựa chọn
                </button>
              </div>
              <div className="space-y-1.5">
                {(form.options ?? []).map((o, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <input
                      value={o}
                      onChange={(e) => updateOption(i, e.target.value)}
                      placeholder={`Lựa chọn ${i + 1}`}
                      className="flex-1 rounded-lg border border-border bg-background px-2 py-1.5 text-sm"
                    />
                    <button
                      onClick={() => removeOption(i)}
                      className="rounded-lg p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div>
            <label className="text-xs font-semibold text-muted-foreground">
              Đáp án đúng / mẫu
            </label>
            <input
              value={form.correctAnswer ?? ""}
              onChange={(e) => setForm({ ...form, correctAnswer: e.target.value })}
              placeholder={isMcq ? "Ví dụ: A" : "Nhập đáp án mẫu (không bắt buộc)"}
              className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-muted-foreground">Tags</label>
            <div className="mt-1 flex flex-wrap items-center gap-1.5 rounded-xl border border-border bg-background p-2">
              {form.tags.map((t) => (
                <span
                  key={t}
                  className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-[11px] font-semibold"
                >
                  {t}
                  <button
                    onClick={() => removeTag(t)}
                    className="text-muted-foreground hover:text-destructive"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
              <input
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addTag();
                  }
                }}
                placeholder="Thêm tag và nhấn Enter"
                className="flex-1 min-w-[140px] bg-transparent px-1 py-0.5 text-sm outline-none"
              />
            </div>
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
