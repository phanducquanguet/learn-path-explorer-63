import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { TopNav } from "@/components/TopNav";
import {
  useCategories,
  DEFAULT_CATEGORIES,
  type Category,
} from "@/lib/course-categories";
import { Layers, Plus, Trash2, GripVertical, Save, RotateCcw, Sparkles } from "lucide-react";

export const Route = createFileRoute("/admin/categories")({
  head: () => ({ meta: [{ title: "Chương trình khóa học — UNICOM LMS" }] }),
  component: CategoriesPage,
});

function CategoriesPage() {
  const [stored, setStored] = useCategories();
  const [list, setList] = useState<Category[]>(stored);
  const [draft, setDraft] = useState("");
  const [saved, setSaved] = useState(false);

  const dirty = JSON.stringify(list) !== JSON.stringify(stored);

  const add = () => {
    const v = draft.trim();
    if (!v || list.includes(v)) return;
    setList([...list, v]);
    setDraft("");
    setSaved(false);
  };
  const update = (i: number, v: string) => {
    const next = [...list];
    next[i] = v;
    setList(next);
    setSaved(false);
  };
  const remove = (i: number) => {
    setList(list.filter((_, idx) => idx !== i));
    setSaved(false);
  };
  const move = (i: number, dir: -1 | 1) => {
    const j = i + dir;
    if (j < 0 || j >= list.length) return;
    const next = [...list];
    [next[i], next[j]] = [next[j], next[i]];
    setList(next);
    setSaved(false);
  };
  const save = () => {
    const clean = list.map((s) => s.trim()).filter(Boolean);
    setStored(clean);
    setList(clean);
    setSaved(true);
  };
  const reset = () => {
    setList(DEFAULT_CATEGORIES);
    setSaved(false);
  };

  return (
    <div className="min-h-screen bg-background">
      <TopNav />
      <div className="mx-auto max-w-3xl px-6 pb-20 pt-10 sm:px-8">
        <span className="inline-flex w-fit items-center gap-2 text-xs font-semibold uppercase tracking-wider text-primary">
          <Sparkles className="h-3.5 w-3.5" /> Quản trị danh mục
        </span>
        <h1 className="mt-1 font-display text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
          Chương trình khóa học
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Khai báo danh sách chương trình (category) dùng khi tạo/chỉnh sửa khóa học.
        </p>

        <div className="mt-8 rounded-3xl border border-border bg-surface p-6 shadow-soft">
          <div className="flex items-center gap-2">
            <input
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && add()}
              placeholder="Tên chương trình mới, vd: Luyện thi TOEIC"
              className="h-10 flex-1 rounded-xl border border-border bg-background px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
            <button
              onClick={add}
              className="inline-flex items-center gap-1.5 rounded-xl px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-soft transition hover:opacity-90"
              style={{ background: "var(--gradient-brand)" }}
            >
              <Plus className="h-4 w-4" /> Thêm
            </button>
          </div>

          <div className="mt-5 space-y-2">
            {list.map((cat, i) => (
              <div
                key={`${i}-${cat}`}
                className="flex items-center gap-2 rounded-xl border border-border bg-background px-3 py-2"
              >
                <div className="flex flex-col">
                  <button
                    onClick={() => move(i, -1)}
                    disabled={i === 0}
                    className="text-muted-foreground hover:text-foreground disabled:opacity-30"
                    aria-label="Lên"
                  >
                    ▲
                  </button>
                  <button
                    onClick={() => move(i, 1)}
                    disabled={i === list.length - 1}
                    className="text-muted-foreground hover:text-foreground disabled:opacity-30"
                    aria-label="Xuống"
                  >
                    ▼
                  </button>
                </div>
                <GripVertical className="h-4 w-4 text-muted-foreground" />
                <Layers className="h-4 w-4 text-primary" />
                <input
                  value={cat}
                  onChange={(e) => update(i, e.target.value)}
                  className="h-9 flex-1 rounded-lg border border-transparent bg-transparent px-2 text-sm outline-none hover:border-border focus:border-primary"
                />
                <button
                  onClick={() => remove(i)}
                  className="rounded-lg p-2 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                  aria-label="Xóa"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
            {list.length === 0 && (
              <div className="rounded-xl border border-dashed border-border p-8 text-center text-xs text-muted-foreground">
                Chưa có chương trình nào.
              </div>
            )}
          </div>

          <div className="mt-6 flex items-center justify-between">
            <button
              onClick={reset}
              className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-background px-4 py-2.5 text-sm font-medium text-muted-foreground hover:text-foreground"
            >
              <RotateCcw className="h-4 w-4" /> Khôi phục mặc định
            </button>
            <div className="flex items-center gap-3">
              {saved && !dirty && (
                <span className="text-xs font-medium text-emerald-600">✓ Đã lưu</span>
              )}
              <button
                onClick={save}
                disabled={!dirty}
                className="inline-flex items-center gap-1.5 rounded-xl px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-soft transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                style={{ background: "var(--gradient-brand)" }}
              >
                <Save className="h-4 w-4" /> Lưu thay đổi
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
