import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { TopNav } from "@/components/TopNav";
import { levels, getCourse } from "@/lib/lms-data";
import { classes as teacherClasses } from "@/lib/teacher-data";
import { useCategories, categoryOf, type Category } from "@/lib/course-categories";
import {
  Upload,
  BookOpen,
  Layers,
  ListChecks,
  Plus,
  Trash2,
  ChevronRight,
  ChevronLeft,
  CheckCircle2,
  Sparkles,
  Settings2,
  Users,
  Globe2,
  Lock,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { CategoriesManager } from "@/components/CategoriesManager";
import { UnitActivityBuilder, type AnyNode } from "@/components/UnitActivityBuilder";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

export const Route = createFileRoute("/teacher/upload")({
  head: () => ({ meta: [{ title: "Quản lý khóa học — UNICOM LMS" }] }),
  validateSearch: (s: Record<string, unknown>) => ({
    edit: typeof s.edit === "string" ? s.edit : undefined,
    mode: s.mode === "admin" ? ("admin" as const) : ("teacher" as const),
  }),
  component: UploadPage,
});

type UnitDraft = {
  id: string;
  title: string;
  desc: string;
  requirePrevious?: boolean;
  teacherOnly?: boolean;
  nodes: AnyNode[];
};

function UploadPage() {
  const { edit, mode } = Route.useSearch();
  const isEdit = !!edit;
  const isTeacher = mode === "teacher";
  const [categories] = useCategories();
  const [step, setStep] = useState(0);
  const [managerOpen, setManagerOpen] = useState(false);
  const [course, setCourse] = useState({
    title: "",
    subtitle: "",
    levelCode: "A1",
    category: "Empower" as Category,
    hours: 36,
    description: "",
    thumbnail: "",
  });
  const [units, setUnits] = useState<UnitDraft[]>([
    { id: "u1", title: "Unit 1: Greetings & Introductions", desc: "", nodes: [] },
  ]);
  // Phân phối: với GV mặc định là "classes" (chỉ lớp đã chọn). Với admin = "system" (toàn hệ thống theo level).
  const [visibility, setVisibility] = useState<"system" | "classes">(
    isTeacher ? "classes" : "system",
  );
  const [classIds, setClassIds] = useState<string[]>([]);
  const [saved, setSaved] = useState(false);

  // Lớp gợi ý theo cấp độ đang chọn (giáo viên thường chỉ phân phối cho lớp cùng level).
  const eligibleClasses = useMemo(
    () => teacherClasses.filter((c) => c.levelCode === course.levelCode),
    [course.levelCode],
  );


  // Prefill khi sửa
  useEffect(() => {
    if (!edit) return;
    const found = getCourse(edit);
    if (found) {
      setCourse({
        title: found.course.title,
        subtitle: found.course.subtitle,
        levelCode: found.level.code,
        category: categoryOf(found.course),
        hours: found.course.hours,
        description: "",
        thumbnail: "",
      });
      setUnits(
        found.course.units.map((u) => ({
          id: u.id,
          title: u.title,
          desc: u.description,
          nodes: [],
        })),
      );
      return;
    }
    if (typeof window !== "undefined") {
      const drafts = JSON.parse(
        window.localStorage.getItem("unicom.uploaded.courses") || "[]",
      );
      const d = drafts.find((x: { id?: string }) => x.id === edit);
      if (d) {
        setCourse({
          title: d.title || "",
          subtitle: d.subtitle || "",
          levelCode: d.levelCode || "A1",
          category: d.category || "Empower",
          hours: d.hours || 36,
          description: d.description || "",
          thumbnail: d.thumbnail || "",
        });
        if (Array.isArray(d.units)) setUnits(d.units);
        if (d.visibility === "system" || d.visibility === "classes") setVisibility(d.visibility);
        if (Array.isArray(d.classIds)) setClassIds(d.classIds);
      }
    }
  }, [edit]);

  const steps = [
    { label: "Khóa học", icon: BookOpen },
    { label: "Units", icon: Layers },
    { label: "Activities", icon: ListChecks },
    { label: "Phân phối", icon: Users },
  ];

  const addUnit = () =>
    setUnits((u) => [
      ...u,
      { id: `u${u.length + 1}`, title: `Unit ${u.length + 1}: New Unit`, desc: "", nodes: [] },
    ]);

  const save = () => {
    if (typeof window !== "undefined") {
      const drafts = JSON.parse(window.localStorage.getItem("unicom.uploaded.courses") || "[]");
      const payload = {
        ...course,
        units,
        visibility,
        classIds: visibility === "classes" ? classIds : [],
        createdBy: isTeacher ? "teacher" : "admin",
        savedAt: new Date().toISOString(),
      };

      if (isEdit) {
        const idx = drafts.findIndex((x: { id?: string }) => x.id === edit);
        if (idx >= 0) drafts[idx] = { ...drafts[idx], ...payload };
        else drafts.push({ id: edit, ...payload });
      } else {
        drafts.push({ id: `course-${Date.now()}`, ...payload });
      }
      window.localStorage.setItem("unicom.uploaded.courses", JSON.stringify(drafts));
    }
    setSaved(true);
  };

  return (
    <div className="min-h-screen bg-background">
      <TopNav />
      <div className="mx-auto max-w-5xl px-6 pb-20 pt-10 sm:px-8">
        <span className="inline-flex w-fit items-center gap-2 text-xs font-semibold uppercase tracking-wider text-primary">
          <Sparkles className="h-3.5 w-3.5" /> {isEdit ? "Chỉnh sửa nội dung" : "Tạo nội dung mới"}
        </span>
        <h1 className="mt-1 font-display text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
          {isEdit ? "Chỉnh sửa khóa học" : "Tải lên khóa học"}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Cấu trúc: Khóa học → Units → Activities (video, PDF, hoặc 11 dạng bài tập).
        </p>


        {/* Stepper */}
        <div className="mt-8 flex items-center gap-2">
          {steps.map((s, i) => {
            const Icon = s.icon;
            const active = i === step;
            const done = i < step;
            return (
              <div key={s.label} className="flex items-center gap-2">
                <button
                  onClick={() => setStep(i)}
                  className={cn(
                    "inline-flex items-center gap-2 rounded-xl px-3.5 py-2 text-sm font-medium transition",
                    active
                      ? "bg-foreground text-background"
                      : done
                        ? "bg-emerald-500/10 text-emerald-700"
                        : "bg-surface text-muted-foreground ring-1 ring-border",
                  )}
                >
                  {done ? <CheckCircle2 className="h-4 w-4" /> : <Icon className="h-4 w-4" />}
                  Bước {i + 1}: {s.label}
                </button>
                {i < steps.length - 1 && <ChevronRight className="h-4 w-4 text-muted-foreground" />}
              </div>
            );
          })}
        </div>

        <div className="mt-6 rounded-3xl border border-border bg-surface p-6 shadow-soft">
          {step === 0 && (
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Tên khóa học" required>
                <input
                  value={course.title}
                  onChange={(e) => setCourse({ ...course, title: e.target.value })}
                  placeholder="VD: A1 Foundation"
                  className="input"
                />
              </Field>
              <Field label="Phụ đề / Mô tả ngắn">
                <input
                  value={course.subtitle}
                  onChange={(e) => setCourse({ ...course, subtitle: e.target.value })}
                  placeholder="Nền tảng tiếng Anh giao tiếp"
                  className="input"
                />
              </Field>
              <Field label="Chương trình (category)" required>
                <div className="flex items-center gap-2">
                  <select
                    value={course.category}
                    onChange={(e) => {
                      if (e.target.value === "__manage__") {
                        setManagerOpen(true);
                        return;
                      }
                      setCourse({ ...course, category: e.target.value as Category });
                    }}
                    className="input flex-1"
                  >
                    {categories.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                    <option disabled>──────────</option>
                    <option value="__manage__">⚙ Quản lý chương trình…</option>
                  </select>
                  <button
                    type="button"
                    onClick={() => setManagerOpen(true)}
                    title="Quản lý chương trình"
                    className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-background text-muted-foreground hover:border-primary hover:text-primary"
                  >
                    <Settings2 className="h-4 w-4" />
                  </button>
                </div>
              </Field>
              <Field label="Cấp độ" required>
                <select
                  value={course.levelCode}
                  onChange={(e) => setCourse({ ...course, levelCode: e.target.value })}
                  className="input"
                >
                  {levels.map((l) => (
                    <option key={l.code} value={l.code}>
                      {l.code} — {l.name}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Số giờ học">
                <input
                  type="number"
                  value={course.hours}
                  onChange={(e) => setCourse({ ...course, hours: Number(e.target.value) })}
                  className="input"
                />
              </Field>
              <div className="sm:col-span-2">
                <Field label="Mô tả chi tiết">
                  <textarea
                    value={course.description}
                    onChange={(e) => setCourse({ ...course, description: e.target.value })}
                    rows={4}
                    className="input"
                    placeholder="Mục tiêu, đối tượng học, đầu ra..."
                  />
                </Field>
              </div>
              <div className="sm:col-span-2">
                <Field label="Thumbnail (tải ảnh)">
                  <label className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border bg-background px-4 py-8 text-sm text-muted-foreground hover:border-primary">
                    <Upload className="h-4 w-4" />
                    {course.thumbnail || "Kéo thả hoặc bấm chọn ảnh"}
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) =>
                        setCourse({ ...course, thumbnail: e.target.files?.[0]?.name || "" })
                      }
                    />
                  </label>
                </Field>
              </div>
            </div>
          )}

          {step === 1 && (
            <div className="space-y-4">
              {units.map((u, idx) => (
                <div key={u.id} className="rounded-2xl border border-border bg-background p-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-sm font-bold text-primary">
                      {idx + 1}
                    </div>
                    <input
                      value={u.title}
                      onChange={(e) =>
                        setUnits((arr) => arr.map((x) => (x.id === u.id ? { ...x, title: e.target.value } : x)))
                      }
                      className="input flex-1"
                    />
                    <button
                      onClick={() => setUnits((arr) => arr.filter((x) => x.id !== u.id))}
                      className="rounded-lg p-2 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                  <textarea
                    value={u.desc}
                    onChange={(e) =>
                      setUnits((arr) => arr.map((x) => (x.id === u.id ? { ...x, desc: e.target.value } : x)))
                    }
                    rows={2}
                    placeholder="Mục tiêu của unit"
                    className="input mt-3"
                  />
                  {idx > 0 && (
                    <label className="mt-3 flex items-start gap-3 rounded-xl border border-border bg-surface/60 px-3 py-2.5">
                      <input
                        type="checkbox"
                        checked={u.requirePrevious ?? false}
                        onChange={(e) =>
                          setUnits((arr) =>
                            arr.map((x) =>
                              x.id === u.id ? { ...x, requirePrevious: e.target.checked } : x,
                            ),
                          )
                        }
                        className="mt-0.5 h-4 w-4 rounded border-border accent-primary"
                      />
                      <div className="flex-1">
                        <div className="text-xs font-semibold text-foreground">
                          Yêu cầu hoàn thành unit trước đó
                        </div>
                        <div className="text-[11px] text-muted-foreground">
                          Học viên phải hoàn thành Unit {idx} thì mới mở khóa unit này.
                        </div>
                      </div>
                    </label>
                  )}
                  <label className="mt-2 flex items-start gap-3 rounded-xl border border-amber-500/30 bg-amber-500/5 px-3 py-2.5">
                    <input
                      type="checkbox"
                      checked={u.teacherOnly ?? false}
                      onChange={(e) =>
                        setUnits((arr) =>
                          arr.map((x) =>
                            x.id === u.id ? { ...x, teacherOnly: e.target.checked } : x,
                          ),
                        )
                      }
                      className="mt-0.5 h-4 w-4 rounded border-border accent-amber-600"
                    />
                    <div className="flex-1">
                      <div className="text-xs font-semibold text-amber-700">
                        Chỉ dành cho giáo viên
                      </div>
                      <div className="text-[11px] text-muted-foreground">
                        Nội dung trong unit này (đáp án, hướng dẫn giảng dạy, tài liệu nội bộ…) chỉ
                        giáo viên thấy được. Học viên sẽ không nhìn thấy unit này.
                      </div>
                    </div>
                  </label>
                </div>
              ))}
              <button
                onClick={addUnit}
                className="inline-flex items-center gap-2 rounded-xl border border-dashed border-border bg-background px-4 py-2.5 text-sm font-medium text-muted-foreground hover:border-primary hover:text-primary"
              >
                <Plus className="h-4 w-4" /> Thêm Unit
              </button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              {units.map((u) => (
                <div key={u.id} className="rounded-2xl border border-border bg-surface/50 p-4">
                  <div className="mb-3 flex items-center gap-2">
                    <Layers className="h-4 w-4 text-primary" />
                    <div className="font-semibold text-foreground">{u.title}</div>
                  </div>
                  <UnitActivityBuilder
                    nodes={u.nodes}
                    onChange={(nodes) =>
                      setUnits((arr) => arr.map((x) => (x.id === u.id ? { ...x, nodes } : x)))
                    }
                  />
                </div>
              ))}
              {saved && (
                <div className="rounded-xl bg-emerald-500/10 px-4 py-3 text-sm font-medium text-emerald-700">
                  ✓ Đã lưu khóa học vào bản nháp. Học viên sẽ thấy trên giao diện học tập.
                </div>
              )}
            </div>
          )}
        </div>

        <div className="mt-5 flex items-center justify-between">
          <button
            onClick={() => setStep((s) => Math.max(0, s - 1))}
            disabled={step === 0}
            className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-surface px-4 py-2.5 text-sm font-medium text-foreground hover:bg-muted disabled:opacity-40"
          >
            <ChevronLeft className="h-4 w-4" /> Quay lại
          </button>
          {step < steps.length - 1 ? (
            <button
              onClick={() => setStep((s) => s + 1)}
              className="inline-flex items-center gap-1.5 rounded-xl bg-foreground px-4 py-2.5 text-sm font-semibold text-background hover:opacity-90"
            >
              Tiếp tục <ChevronRight className="h-4 w-4" />
            </button>
          ) : (
            <button
              onClick={save}
              className="inline-flex items-center gap-1.5 rounded-xl px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-soft"
              style={{ background: "var(--gradient-brand)" }}
            >
              <CheckCircle2 className="h-4 w-4" /> Lưu khóa học
            </button>
          )}
        </div>
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

      <Dialog open={managerOpen} onOpenChange={setManagerOpen}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>Quản lý chương trình</DialogTitle>
            <DialogDescription>
              Thêm, sửa, xóa hoặc sắp xếp danh sách chương trình.
            </DialogDescription>
          </DialogHeader>
          <CategoriesManager onClose={() => setManagerOpen(false)} />
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <label className="block">
      <div className="mb-1.5 text-xs font-semibold text-foreground">
        {label} {required && <span className="text-destructive">*</span>}
      </div>
      {children}
    </label>
  );
}

