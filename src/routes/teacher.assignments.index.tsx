import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import { TopNav } from "@/components/TopNav";
import {
  listAssignments,
  createAssignment,
  subscribeAssignments,
  listSubmissions,
  deleteAssignment,
  type Assignment,
  type AssignmentAttachment,
} from "@/lib/assignments";
import { classes } from "@/lib/teacher-data";
import { students } from "@/lib/teacher-data";
import { levels } from "@/lib/lms-data";
import {
  ClipboardList,
  Plus,
  Calendar,
  Users,
  Trash2,
  ArrowRight,
  Clock,
  AlertTriangle,
  FileCheck2,
  Paperclip,
  X,
  Copy,
  Search,
  ChevronDown,
  GraduationCap,
} from "lucide-react";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/teacher/assignments/")({
  head: () => ({ meta: [{ title: "Bài tập — UNICOM LMS" }] }),
  component: TeacherAssignmentsPage,
});

function useAssignments() {
  return useSyncExternalStore(
    (cb) => {
      const un = subscribeAssignments(cb);
      return () => un();
    },
    () => listAssignments(),
    () => listAssignments(),
  );
}

function TeacherAssignmentsPage() {
  const items = useAssignments();
  const [open, setOpen] = useState(false);
  const [duplicateOf, setDuplicateOf] = useState<Assignment | null>(null);
  const [query, setQuery] = useState("");
  const [classFilter, setClassFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<"all" | "open" | "closed">("all");

  const filteredItems = useMemo(() => {
    const q = query.trim().toLowerCase();
    const now = Date.now();
    return items.filter((a) => {
      const cls = classes.filter((c) => a.classIds.includes(c.id));
      const clsNames = cls.map((c) => c.name).join(" ");
      if (classFilter !== "all" && !a.classIds.includes(classFilter)) return false;
      if (statusFilter !== "all") {
        const isOpen = new Date(a.dueAt).getTime() >= now;
        if (statusFilter === "open" && !isOpen) return false;
        if (statusFilter === "closed" && isOpen) return false;
      }
      if (
        q &&
        !`${a.title} ${a.description} ${a.createdBy ?? ""} ${clsNames}`.toLowerCase().includes(q)
      )
        return false;
      return true;
    });
  }, [items, query, classFilter, statusFilter]);

  const hasFilters = query !== "" || classFilter !== "all" || statusFilter !== "all";

  return (
    <div className="min-h-screen bg-background">
      <TopNav />
      <div className="mx-auto max-w-6xl px-6 pb-20 pt-10 sm:px-8">
        <div>
          <h1 className="font-display text-3xl font-semibold tracking-tight">
            Bài tập
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Ra đề tự luận cho học viên, học viên nộp câu trả lời hoặc file — giáo viên chấm điểm.
          </p>
        </div>

        <KpiCards items={filteredItems} />

        {/* Search + filters + create button */}
        <div className="mt-6 rounded-2xl border border-border bg-surface p-3 shadow-soft">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Tìm bài tập, đề bài hoặc lớp..."
                className="h-10 w-full rounded-xl border border-border bg-background pl-9 pr-9 text-sm text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
              {query && (
                <button
                  onClick={() => setQuery("")}
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
                  aria-label="Xóa"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <FilterSelect
                value={classFilter}
                onChange={setClassFilter}
                icon={<GraduationCap className="h-4 w-4" />}
                options={[
                  { value: "all", label: "Tất cả lớp" },
                  ...classes.map((c) => ({ value: c.id, label: c.name })),
                ]}
              />
              <FilterSelect
                value={statusFilter}
                onChange={(v) => setStatusFilter(v as "all" | "open" | "closed")}
                icon={<Clock className="h-4 w-4" />}
                options={[
                  { value: "all", label: "Tất cả trạng thái" },
                  { value: "open", label: "Đang mở" },
                  { value: "closed", label: "Đã đóng" },
                ]}
              />
              {hasFilters && (
                <button
                  onClick={() => {
                    setQuery("");
                    setClassFilter("all");
                    setStatusFilter("all");
                  }}
                  className="inline-flex items-center gap-1 rounded-xl px-3 py-2 text-xs font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
                >
                  <X className="h-3.5 w-3.5" /> Xóa lọc
                </button>
              )}
              <div className="mx-1 hidden h-5 w-px bg-border lg:block" />
              <button
                onClick={() => setOpen(true)}
                className="inline-flex items-center gap-1.5 rounded-xl bg-foreground px-4 py-2 text-sm font-semibold text-background hover:opacity-90"
              >
                <Plus className="h-4 w-4" /> Tạo bài tập
              </button>
            </div>
          </div>
        </div>

        <div className="mt-6 grid gap-3">
          {filteredItems.map((a) => (
            <AssignmentRow key={a.id} a={a} onDuplicate={() => setDuplicateOf(a)} />
          ))}
          {filteredItems.length === 0 && (
            <div className="rounded-2xl border border-dashed border-border bg-surface p-10 text-center text-sm text-muted-foreground">
              {hasFilters
                ? "Không tìm thấy bài tập phù hợp. Thử bỏ bớt bộ lọc hoặc tìm với từ khóa khác."
                : "Chưa có bài tập nào. Bấm \"Tạo bài tập\" để bắt đầu."}
            </div>
          )}
        </div>
      </div>

      {open && <CreateAssignmentDialog onClose={() => setOpen(false)} />}
      {duplicateOf && (
        <DuplicateDialog a={duplicateOf} onClose={() => setDuplicateOf(null)} />
      )}
    </div>
  );
}

function FilterSelect({
  value,
  onChange,
  options,
  icon,
}: {
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
  icon?: React.ReactNode;
}) {
  return (
    <div className="relative min-w-[10rem]">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-10 w-full appearance-none rounded-xl border border-border bg-background pl-9 pr-8 text-sm font-medium text-foreground outline-none transition hover:border-primary/40 focus:border-primary focus:ring-2 focus:ring-primary/20"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      {icon && (
        <div className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground">
          {icon}
        </div>
      )}
      <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
    </div>
  );
}

function KpiCards({ items }: { items: Assignment[] }) {
  const now = Date.now();
  let openCount = 0;
  let closedCount = 0;
  let assigned = 0;
  let submitted = 0;
  let graded = 0;
  let pendingGrade = 0;
  let overdueMissing = 0;

  for (const a of items) {
    const isOpen = new Date(a.dueAt).getTime() >= now;
    if (isOpen) openCount++;
    else closedCount++;

    const clsStudents = students.filter((s) => (a.classIds ?? []).includes(s.classId));
    assigned += clsStudents.length;

    const subs = listSubmissions(a.id);
    submitted += subs.length;
    const g = subs.filter((s) => s.score !== undefined).length;
    graded += g;
    pendingGrade += subs.length - g;

    const submittedIds = new Set(subs.map((s) => s.studentId));
    for (const st of clsStudents) {
      if (submittedIds.has(st.id)) continue;
      const eff = new Date(a.dueAt).getTime();
      if (eff < now) overdueMissing++;
    }
  }

  const submissionRate = assigned > 0 ? Math.round((submitted / assigned) * 100) : 0;

  const cards = [
    {
      label: "Tổng bài tập",
      value: items.length,
      sub: `${openCount} đang mở · ${closedCount} đã đóng`,
      icon: ClipboardList,
      tone: "text-primary bg-primary/10",
    },
    {
      label: "Tỉ lệ nộp bài",
      value: `${submissionRate}%`,
      sub: `${submitted}/${assigned} lượt nộp`,
      icon: FileCheck2,
      tone: "text-emerald-600 bg-emerald-500/10",
    },
    {
      label: "Chờ chấm",
      value: pendingGrade,
      sub: `${graded} đã chấm`,
      icon: Clock,
      tone: "text-amber-600 bg-amber-500/10",
    },
    {
      label: "Quá hạn chưa nộp",
      value: overdueMissing,
      sub: "Học viên cần nhắc / gia hạn",
      icon: AlertTriangle,
      tone: "text-rose-600 bg-rose-500/10",
    },
  ] as const;

  return (
    <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((c) => {
        const Icon = c.icon;
        return (
          <div
            key={c.label}
            className="rounded-2xl border border-border bg-surface p-4 shadow-soft"
          >
            <div className="flex items-center justify-between">
              <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {c.label}
              </div>
              <div className={cn("flex h-8 w-8 items-center justify-center rounded-lg", c.tone)}>
                <Icon className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-2 font-display text-2xl font-semibold tracking-tight">
              {c.value}
            </div>
            <div className="mt-0.5 text-xs text-muted-foreground">{c.sub}</div>
          </div>
        );
      })}
    </div>
  );
}

function findCourseUnit(courseId?: string, unitId?: string) {
  if (!courseId) return null;
  for (const lv of levels) {
    const c = lv.courses.find((x) => x.id === courseId);
    if (c) {
      const u = unitId ? c.units.find((x) => x.id === unitId) : undefined;
      return { course: c, unit: u, level: lv.code };
    }
  }
  return null;
}

function AssignmentRow({ a, onDuplicate }: { a: Assignment; onDuplicate: () => void }) {
  const subs = listSubmissions(a.id);
  const graded = subs.filter((s) => s.score !== undefined).length;
  const pending = subs.length - graded;
  const cls = classes.filter((c) => a.classIds.includes(c.id));
  const overdue = new Date(a.dueAt).getTime() < Date.now();
  const cu = findCourseUnit(a.courseId, a.unitId);

  return (
    <Link
      to="/teacher/assignments/$assignmentId"
      params={{ assignmentId: a.id }}
      className="group flex items-center gap-4 rounded-2xl border border-border bg-surface p-4 shadow-soft hover:border-primary/40"
    >
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
        <ClipboardList className="h-5 w-5" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <div className="truncate font-semibold text-foreground">{a.title}</div>
          {a.attachments && a.attachments.length > 0 && (
            <span className="inline-flex items-center gap-1 rounded-full bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground">
              <Paperclip className="h-3 w-3" /> {a.attachments.length}
            </span>
          )}
          {cu && (
            <span
              className="inline-flex items-center gap-1 rounded-full border border-primary/20 bg-primary/5 px-1.5 py-0.5 text-[10px] font-medium text-primary"
              title={`${cu.course.title}${cu.unit ? ` · ${cu.unit.title}` : ""}`}
            >
              <GraduationCap className="h-3 w-3" /> {cu.course.title}
              {cu.unit && <span className="text-primary/70">· U{cu.unit.index}</span>}
            </span>
          )}
        </div>
        <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1">
            <Users className="h-3 w-3" /> {cls.map((c) => c.name).join(" · ") || "—"}
          </span>
          <span className={cn("inline-flex items-center gap-1", overdue && "text-rose-600")}>
            <Calendar className="h-3 w-3" /> Hạn:{" "}
            {new Date(a.dueAt).toLocaleString("vi-VN", { timeZone: "Asia/Ho_Chi_Minh" })}
          </span>
          <span>Thang điểm: {a.maxScore}</span>
        </div>
      </div>

      <div className="hidden text-right text-xs sm:block">
        <div className="font-semibold text-foreground">{subs.length} bài nộp</div>
        <div className="text-muted-foreground">
          {graded} đã chấm • <span className="text-amber-600">{pending} chờ chấm</span>
        </div>
      </div>
      <button
        onClick={(e) => {
          e.preventDefault();
          onDuplicate();
        }}
        className="rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-primary"
        aria-label="Nhân bản"
        title="Nhân bản sang lớp khác"
      >
        <Copy className="h-4 w-4" />
      </button>
      <button
        onClick={(e) => {
          e.preventDefault();
          if (confirm(`Xoá bài tập "${a.title}"?`)) deleteAssignment(a.id);
        }}
        className="rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-rose-600"
        aria-label="Xoá"
      >
        <Trash2 className="h-4 w-4" />
      </button>
      <ArrowRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
    </Link>
  );
}

function CreateAssignmentDialog({ onClose }: { onClose: () => void }) {
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [attachments, setAttachments] = useState<AssignmentAttachment[]>([]);
  const [classIds, setClassIds] = useState<string[]>(classes[0] ? [classes[0].id] : []);
  const [classQuery, setClassQuery] = useState("");
  const [classPickerOpen, setClassPickerOpen] = useState(false);
  const classPickerRef = useRef<HTMLDivElement>(null);
  const [courseId, setCourseId] = useState<string>("");
  const [unitId, setUnitId] = useState<string>("");

  useEffect(() => {
    if (!classPickerOpen) return;
    const onClick = (e: MouseEvent) => {
      if (classPickerRef.current && !classPickerRef.current.contains(e.target as Node)) {
        setClassPickerOpen(false);
      }
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [classPickerOpen]);
  const toggleClass = (id: string) =>
    setClassIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));

  // Nhóm lớp theo level cho picker
  const classesByLevel = useMemo(() => {
    const q = classQuery.trim().toLowerCase();
    const map = new Map<string, typeof classes>();
    for (const c of classes) {
      if (q && !c.name.toLowerCase().includes(q) && !c.levelCode.toLowerCase().includes(q)) continue;
      const arr = map.get(c.levelCode) ?? [];
      arr.push(c);
      map.set(c.levelCode, arr);
    }
    return Array.from(map.entries()).sort(([a], [b]) => a.localeCompare(b));
  }, [classQuery]);

  // Level của các lớp đang chọn — dùng để lọc course
  const selectedLevels = useMemo(
    () => Array.from(new Set(classes.filter((c) => classIds.includes(c.id)).map((c) => c.levelCode))),
    [classIds],
  );

  const availableCourses = useMemo(() => {
    if (selectedLevels.length === 0) return [] as { id: string; title: string; level: string }[];
    return levels
      .filter((lv) => selectedLevels.includes(lv.code))
      .flatMap((lv) => lv.courses.map((c) => ({ id: c.id, title: c.title, level: lv.code })));
  }, [selectedLevels]);

  const availableUnits = useMemo(() => {
    if (!courseId) return [] as { id: string; title: string; index: number }[];
    for (const lv of levels) {
      const c = lv.courses.find((c) => c.id === courseId);
      if (c) return c.units.map((u) => ({ id: u.id, title: u.title, index: u.index }));
    }
    return [];
  }, [courseId]);

  // Reset course/unit khi chọn level ko còn khớp
  useEffect(() => {
    if (!courseId) return;
    if (!availableCourses.some((c) => c.id === courseId)) {
      setCourseId("");
      setUnitId("");
    }
  }, [availableCourses, courseId]);
  useEffect(() => {
    if (unitId && !availableUnits.some((u) => u.id === unitId)) setUnitId("");
  }, [availableUnits, unitId]);

  const [dueAt, setDueAt] = useState(() => {
    const d = new Date(Date.now() + 3 * 24 * 3600 * 1000);
    d.setSeconds(0, 0);
    return d.toISOString().slice(0, 16);
  });
  const [maxScore, setMaxScore] = useState(10);
  const [allowText, setAllowText] = useState(true);
  const [allowFile, setAllowFile] = useState(true);
  const [allowAssistantGrading, setAllowAssistantGrading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const onPick = (files: FileList | null) => {
    if (!files) return;
    const arr: AssignmentAttachment[] = [];
    let pending = 0;
    Array.from(files).forEach((f) => {
      if (f.size > 5 * 1024 * 1024) {
        alert(`"${f.name}" quá 5MB, bỏ qua.`);
        return;
      }
      pending++;
      const reader = new FileReader();
      reader.onload = () => {
        arr.push({ name: f.name, size: f.size, dataUrl: reader.result as string });
        pending--;
        if (pending === 0) setAttachments((prev) => [...prev, ...arr]);
      };
      reader.readAsDataURL(f);
    });
    if (fileRef.current) fileRef.current.value = "";
  };

  const submit = () => {
    if (!title.trim() || !description.trim() || classIds.length === 0) return;
    // Tạo 1 bản ghi riêng cho mỗi lớp đã chọn
    let first: { id: string } | null = null;
    for (const cid of classIds) {
      const a = createAssignment({
        title: title.trim(),
        description: description.trim(),
        classIds: [cid],
        dueAt: new Date(dueAt).toISOString(),
        maxScore,
        allowText,
        allowFile: allowFile || !allowText,
        allowAssistantGrading,
        attachments: attachments.length ? attachments : undefined,
        courseId: courseId || undefined,
        unitId: unitId || undefined,
        createdBy: "Cô Mai Lan",
      });
      if (!first) first = a;
    }
    onClose();
    if (first) navigate({ to: "/teacher/assignments/$assignmentId", params: { assignmentId: first.id } });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <button className="absolute inset-0" onClick={onClose} aria-label="Close" />
      <div className="relative w-full max-w-2xl overflow-hidden rounded-2xl bg-background shadow-elevated">
        <div className="border-b border-border p-5">
          <h2 className="font-display text-lg font-semibold">Tạo bài tập mới</h2>
          <p className="text-xs text-muted-foreground">
            Nhập đề bài, đính kèm file (nếu cần). Chọn nhiều lớp sẽ tạo thành nhiều bản ghi độc lập, mỗi bản ghi một lớp.
          </p>
        </div>
        <div className="max-h-[70vh] space-y-4 overflow-y-auto p-5">
          <Field label="Tiêu đề">
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="VD: Viết đoạn văn về sở thích"
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
            />
          </Field>
          <Field label="Đề bài (nội dung yêu cầu)">
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={6}
              placeholder="Nhập yêu cầu đề bài, tiêu chí chấm, độ dài..."
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
            />
          </Field>

          <Field label={`File đính kèm cùng đề (${attachments.length})`}>
            <div className="space-y-2">
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="inline-flex items-center gap-1.5 rounded-lg border border-dashed border-border bg-background px-3 py-2 text-sm font-medium text-muted-foreground hover:border-primary/40 hover:text-foreground"
              >
                <Paperclip className="h-4 w-4" /> Chọn file đính kèm (tối đa 5MB/file)
              </button>
              <input
                ref={fileRef}
                type="file"
                multiple
                onChange={(e) => onPick(e.target.files)}
                className="hidden"
              />
              {attachments.length > 0 && (
                <ul className="divide-y divide-border rounded-lg border border-border bg-background">
                  {attachments.map((f, i) => (
                    <li key={i} className="flex items-center justify-between gap-2 px-3 py-2 text-sm">
                      <div className="min-w-0 flex items-center gap-2">
                        <Paperclip className="h-3 w-3 shrink-0 text-muted-foreground" />
                        <span className="truncate">{f.name}</span>
                        <span className="text-xs text-muted-foreground">
                          {(f.size / 1024).toFixed(1)} KB
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setAttachments((prev) => prev.filter((_, x) => x !== i))}
                        className="rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-rose-600"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </Field>

          <Field label={`Lớp giao bài (${classIds.length} đã chọn)`}>
            <div className="rounded-lg border border-border bg-background">
              <div className="flex items-center gap-2 border-b border-border px-2 py-1.5">
                <Search className="h-3.5 w-3.5 text-muted-foreground" />
                <input
                  value={classQuery}
                  onChange={(e) => setClassQuery(e.target.value)}
                  placeholder="Tìm lớp hoặc level..."
                  className="h-7 flex-1 bg-transparent text-xs outline-none placeholder:text-muted-foreground"
                />
                <button
                  type="button"
                  onClick={() => setClassIds(classes.map((c) => c.id))}
                  className="text-[11px] font-medium text-primary hover:underline"
                >
                  Chọn tất cả
                </button>
                <span className="text-muted-foreground">·</span>
                <button
                  type="button"
                  onClick={() => setClassIds([])}
                  className="text-[11px] font-medium text-muted-foreground hover:underline"
                >
                  Bỏ chọn
                </button>
              </div>
              <div className="max-h-56 space-y-2 overflow-y-auto p-2">
                {classesByLevel.length === 0 && (
                  <div className="p-2 text-xs text-muted-foreground">Không tìm thấy lớp.</div>
                )}
                {classesByLevel.map(([lvl, arr]) => {
                  const allIds = arr.map((c) => c.id);
                  const allSelected = allIds.every((id) => classIds.includes(id));
                  return (
                    <div key={lvl}>
                      <div className="mb-1 flex items-center gap-2 px-1">
                        <span className="inline-flex h-5 items-center rounded-md bg-primary/10 px-1.5 text-[10px] font-semibold text-primary">
                          {lvl}
                        </span>
                        <span className="text-[11px] text-muted-foreground">{arr.length} lớp</span>
                        <button
                          type="button"
                          onClick={() =>
                            setClassIds((prev) =>
                              allSelected
                                ? prev.filter((id) => !allIds.includes(id))
                                : Array.from(new Set([...prev, ...allIds])),
                            )
                          }
                          className="ml-auto text-[11px] font-medium text-primary hover:underline"
                        >
                          {allSelected ? "Bỏ chọn nhóm" : "Chọn cả nhóm"}
                        </button>
                      </div>
                      <div className="grid grid-cols-2 gap-1.5">
                        {arr.map((c) => {
                          const checked = classIds.includes(c.id);
                          return (
                            <label
                              key={c.id}
                              className={cn(
                                "flex cursor-pointer items-center gap-2 rounded-md border px-2 py-1.5 text-xs transition",
                                checked
                                  ? "border-primary/40 bg-primary/5 text-foreground"
                                  : "border-border bg-background text-muted-foreground hover:border-primary/30 hover:text-foreground",
                              )}
                            >
                              <input
                                type="checkbox"
                                checked={checked}
                                onChange={() => toggleClass(c.id)}
                                className="shrink-0"
                              />
                              <span className="truncate">{c.name.replace(/^[A-C][12]\s—\s/, "")}</span>
                              <span className="ml-auto text-[10px] text-muted-foreground">
                                {c.studentCount} HV
                              </span>
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            {classIds.length > 1 && (
              <div className="mt-1.5 text-[11px] text-primary">
                Sẽ tạo {classIds.length} bản ghi (mỗi lớp một bài).
              </div>
            )}
          </Field>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label={`Khóa học${availableCourses.length === 0 ? " (chọn lớp trước)" : ""}`}>
              <select
                value={courseId}
                onChange={(e) => {
                  setCourseId(e.target.value);
                  setUnitId("");
                }}
                disabled={availableCourses.length === 0}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm disabled:opacity-50"
              >
                <option value="">— Không gắn khóa học —</option>
                {availableCourses.map((c) => (
                  <option key={c.id} value={c.id}>
                    [{c.level}] {c.title}
                  </option>
                ))}
              </select>
            </Field>
            <Field label={`Unit${!courseId ? " (chọn khóa học trước)" : ""}`}>
              <select
                value={unitId}
                onChange={(e) => setUnitId(e.target.value)}
                disabled={!courseId}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm disabled:opacity-50"
              >
                <option value="">— Không gắn unit —</option>
                {availableUnits.map((u) => (
                  <option key={u.id} value={u.id}>
                    Unit {u.index}: {u.title.replace(/^Unit \d+:\s*/, "")}
                  </option>
                ))}
              </select>
            </Field>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Hạn nộp">
              <input
                type="datetime-local"
                value={dueAt}
                onChange={(e) => setDueAt(e.target.value)}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
              />
            </Field>
            <Field label="Thang điểm">
              <input
                type="number"
                min={1}
                max={100}
                value={maxScore}
                onChange={(e) => setMaxScore(Number(e.target.value) || 10)}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
              />
            </Field>
            <Field label="Hình thức nộp">
              <div className="mt-1 flex flex-col gap-1.5 text-sm">
                <label className="inline-flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={allowText}
                    onChange={(e) => setAllowText(e.target.checked)}
                  />
                  Nhập câu trả lời (text)
                </label>
                <label className="inline-flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={allowFile}
                    onChange={(e) => setAllowFile(e.target.checked)}
                  />
                  Tải file đính kèm
                </label>
                <label className="mt-1 inline-flex items-center gap-2 border-t border-border pt-2">
                  <input
                    type="checkbox"
                    checked={allowAssistantGrading}
                    onChange={(e) => setAllowAssistantGrading(e.target.checked)}
                  />
                  Cho phép trợ giảng chấm bài
                </label>
              </div>
            </Field>
          </div>
        </div>
        <div className="flex items-center justify-end gap-2 border-t border-border bg-muted/30 p-4">
          <button
            onClick={onClose}
            className="rounded-lg border border-border bg-background px-4 py-2 text-sm font-semibold hover:bg-muted"
          >
            Huỷ
          </button>
          <button
            onClick={submit}
            disabled={!title.trim() || !description.trim() || classIds.length === 0}
            className="rounded-lg bg-foreground px-4 py-2 text-sm font-semibold text-background hover:opacity-90 disabled:opacity-50"
          >
            {classIds.length > 1 ? `Tạo ${classIds.length} bài & giao` : "Tạo & giao bài"}
          </button>
        </div>
      </div>
    </div>
  );
}

function DuplicateDialog({ a, onClose }: { a: Assignment; onClose: () => void }) {
  const navigate = useNavigate();
  const existing = new Set(a.classIds);
  const options = classes.filter((c) => !existing.has(c.id));
  const [selected, setSelected] = useState<string[]>([]);
  const toggle = (id: string) =>
    setSelected((p) => (p.includes(id) ? p.filter((x) => x !== id) : [...p, id]));

  const submit = () => {
    if (selected.length === 0) return;
    let first: { id: string } | null = null;
    for (const cid of selected) {
      const clone = createAssignment({
        title: a.title,
        description: a.description,
        classIds: [cid],
        dueAt: a.dueAt,
        maxScore: a.maxScore,
        allowText: a.allowText,
        allowFile: a.allowFile,
        attachments: a.attachments,
        courseId: a.courseId,
        unitId: a.unitId,
        allowAssistantGrading: a.allowAssistantGrading,
        createdBy: a.createdBy,
      });
      if (!first) first = clone;
    }
    onClose();
    if (first) navigate({ to: "/teacher/assignments/$assignmentId", params: { assignmentId: first.id } });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <button className="absolute inset-0" onClick={onClose} aria-label="Close" />
      <div className="relative w-full max-w-md rounded-2xl bg-background p-6 shadow-elevated">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="font-display text-lg font-semibold">Nhân bản bài tập</h3>
            <p className="mt-1 text-xs text-muted-foreground">
              Chọn (các) lớp muốn nhân bản <b>"{a.title}"</b>. Mỗi lớp sẽ có 1 bản ghi riêng.
            </p>
          </div>
          <button onClick={onClose} className="rounded-lg p-1.5 hover:bg-muted">
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="mt-4 max-h-64 space-y-1 overflow-y-auto rounded-lg border border-border bg-background p-2">
          {options.map((c) => (
            <label
              key={c.id}
              className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-muted"
            >
              <input
                type="checkbox"
                checked={selected.includes(c.id)}
                onChange={() => toggle(c.id)}
              />
              <span className="flex-1">{c.name}</span>
            </label>
          ))}
          {options.length === 0 && (
            <div className="p-3 text-xs text-muted-foreground">
              Bài này đã có ở tất cả các lớp.
            </div>
          )}
        </div>
        <div className="mt-5 flex items-center justify-end gap-2">
          <button
            onClick={onClose}
            className="rounded-xl border border-border bg-background px-4 py-2 text-sm font-semibold hover:bg-muted"
          >
            Huỷ
          </button>
          <button
            onClick={submit}
            disabled={selected.length === 0}
            className="inline-flex items-center gap-1.5 rounded-xl bg-foreground px-4 py-2 text-sm font-semibold text-background hover:opacity-90 disabled:opacity-50"
          >
            <Copy className="h-4 w-4" /> Nhân bản{selected.length > 0 ? ` (${selected.length})` : ""}
          </button>
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </label>
      <div className="mt-1">{children}</div>
    </div>
  );
}
