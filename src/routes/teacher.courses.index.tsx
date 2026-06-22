import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  Search,
  X,
  ChevronDown,
  GraduationCap,
  Users,
  TrendingUp,
  Trophy,
  Layers,
  Sparkles,
  ArrowRight,
  MessageSquare,
  Plus,
  UserCheck,
  Send,
  Pencil,
  Trash2,
  Check,
} from "lucide-react";
import { TopNav } from "@/components/TopNav";
import { levels, type Course, type Level } from "@/lib/lms-data";
import { classes, students } from "@/lib/teacher-data";
import { cn } from "@/lib/utils";
import empowerA1Asset from "@/assets/empower-a1.png.asset.json";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

const COURSE_COVERS: Record<string, string> = {};
const LEVEL_COVERS: Record<string, string> = {
  A1: empowerA1Asset.url,
  A2: empowerA1Asset.url,
  B1: empowerA1Asset.url,
  B2: empowerA1Asset.url,
  C1: empowerA1Asset.url,
  C2: empowerA1Asset.url,
};

export const Route = createFileRoute("/teacher/courses/")({
  head: () => ({
    meta: [
      { title: "Khóa học của tôi — UNICOM LMS" },
      {
        name: "description",
        content:
          "Quản trị khóa học từ góc nhìn giáo viên: theo dõi học viên, điểm số và năng lực trên các lớp.",
      },
    ],
  }),
  component: TeacherCoursesPage,
});

type ApprovalStatus = "draft" | "pending" | "approved" | "rejected";

type DraftCourse = {
  id: string;
  title?: string;
  subtitle?: string;
  levelCode?: string;
  hours?: number;
  units?: { id: string }[];
  visibility?: "system" | "classes";
  classIds?: string[];
  createdBy?: "teacher" | "admin";
  // Phê duyệt
  approvalStatus?: ApprovalStatus;
  pendingVisibility?: "system" | "classes";
  pendingClassIds?: string[];
  submittedAt?: string;
  reviewedAt?: string;
  reviewerNote?: string;
};

type CourseRow = {
  course: Course;
  level: Level;
  classCount: number;
  studentCount: number;
  avgProgress: number;
  avgScore: number;
  origin: "system" | "teacher";
  publishedClassNames?: string[];
  isPublished?: boolean;
  approvalStatus?: ApprovalStatus;
  reviewerNote?: string;
  draft?: DraftCourse;
};

function useCourseStats(): CourseRow[] {
  return useMemo(() => {
    return levels.flatMap((lv) =>
      lv.courses.map<CourseRow>((course) => {
        const lvClasses = classes.filter((c) => c.levelCode === lv.code);
        const lvStudents = students.filter((s) =>
          lvClasses.some((c) => c.id === s.classId),
        );
        const avgProgress = lvClasses.length
          ? Math.round(
              lvClasses.reduce((s, c) => s + c.avgProgress, 0) / lvClasses.length,
            )
          : course.progress;
        const allScores = lvStudents.flatMap((s) => s.scoresByUnit.map((u) => u.score));
        const avgScore = allScores.length
          ? Math.round(allScores.reduce((s, n) => s + n, 0) / allScores.length)
          : 0;
        return {
          course,
          level: lv,
          classCount: lvClasses.length,
          studentCount: lvStudents.length,
          avgProgress,
          avgScore,
          origin: "system",
        };
      }),
    );
  }, []);
}

const STORAGE_KEY = "unicom.uploaded.courses";

function TeacherCoursesPage() {
  const systemRows = useCourseStats();
  const [drafts, setDrafts] = useState<DraftCourse[]>([]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      setDrafts(raw ? JSON.parse(raw) : []);
    } catch {
      setDrafts([]);
    }
  }, []);

  const persist = (next: DraftCourse[]) => {
    setDrafts(next);
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {}
  };
  const updateDraft = (id: string, patch: Partial<DraftCourse>) =>
    persist(drafts.map((d) => (d.id === id ? { ...d, ...patch } : d)));
  const deleteDraft = (id: string) => persist(drafts.filter((d) => d.id !== id));

  const teacherRows = useMemo<CourseRow[]>(() => {
    return drafts
      .filter((d) => d.createdBy !== "admin")
      .map<CourseRow>((d) => {
        const lv = levels.find((l) => l.code === d.levelCode) ?? levels[0];
        const approved = d.approvalStatus === "approved";
        // Chỉ tính publish khi đã được admin duyệt
        const effectiveVisibility = approved ? d.visibility : undefined;
        const effectiveClassIds = approved ? (d.classIds ?? []) : [];
        const publishedClassIds =
          effectiveVisibility === "system"
            ? classes.filter((c) => c.levelCode === lv.code).map((c) => c.id)
            : effectiveClassIds;
        const lvClasses = classes.filter((c) => publishedClassIds.includes(c.id));
        const lvStudents = students.filter((s) =>
          lvClasses.some((c) => c.id === s.classId),
        );
        const fakeCourse: Course = {
          id: d.id,
          title: d.title || "Khóa học chưa đặt tên",
          subtitle: d.subtitle || "",
          level: lv.code,
          hours: d.hours ?? 0,
          progress: 0,
          units: (d.units ?? []).map((u, i) => ({
            id: u.id,
            index: i + 1,
            title: "",
            description: "",
            activities: [],
          })),
          classmates: [],
        };
        return {
          course: fakeCourse,
          level: lv,
          classCount: lvClasses.length,
          studentCount: lvStudents.length,
          avgProgress: lvClasses.length
            ? Math.round(
                lvClasses.reduce((s, c) => s + c.avgProgress, 0) / lvClasses.length,
              )
            : 0,
          avgScore: 0,
          origin: "teacher",
          publishedClassNames: lvClasses.map((c) => c.name),
          isPublished: approved && lvClasses.length > 0,
          approvalStatus: d.approvalStatus ?? "draft",
          reviewerNote: d.reviewerNote,
          draft: d,
        };
      });
  }, [drafts]);

  const rows = useMemo(() => [...teacherRows, ...systemRows], [teacherRows, systemRows]);
  const [query, setQuery] = useState("");
  const [levelFilter, setLevelFilter] = useState("all");
  const [originFilter, setOriginFilter] = useState<"all" | "system" | "teacher">("all");
  const [statusFilter, setStatusFilter] = useState<"all" | ApprovalStatus>("all");

  const teacherCounts = useMemo(
    () => ({
      all: teacherRows.length,
      pending: teacherRows.filter((r) => (r.approvalStatus ?? "draft") === "pending").length,
      approved: teacherRows.filter((r) => (r.approvalStatus ?? "draft") === "approved").length,
      rejected: teacherRows.filter((r) => (r.approvalStatus ?? "draft") === "rejected").length,
      draft: teacherRows.filter((r) => (r.approvalStatus ?? "draft") === "draft").length,
    }),
    [teacherRows],
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return rows.filter(({ course, level, origin, approvalStatus }) => {
      if (levelFilter !== "all" && level.code !== levelFilter) return false;
      if (originFilter !== "all" && origin !== originFilter) return false;
      if (statusFilter !== "all") {
        if (origin !== "teacher") return false;
        if ((approvalStatus ?? "draft") !== statusFilter) return false;
      }
      if (q && !`${course.title} ${course.subtitle} ${level.code}`.toLowerCase().includes(q))
        return false;
      return true;
    });
  }, [rows, query, levelFilter, originFilter, statusFilter]);

  const totalStudents = rows.reduce((s, r) => s + r.studentCount, 0);
  const totalClasses = classes.length;

  const [publishingId, setPublishingId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [viewingNoteId, setViewingNoteId] = useState<string | null>(null);
  const publishingDraft = drafts.find((d) => d.id === publishingId) ?? null;
  const deletingDraft = drafts.find((d) => d.id === confirmDeleteId) ?? null;
  const viewingNoteDraft = drafts.find((d) => d.id === viewingNoteId) ?? null;

  return (
    <div className="min-h-screen bg-background">
      <TopNav />
      <div className="mx-auto max-w-7xl px-6 pb-20 pt-10 sm:px-8">
        {/* Header */}
        <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
          <div className="flex flex-col gap-2">
            <span className="inline-flex w-fit items-center gap-2 text-xs font-semibold uppercase tracking-wider text-primary">
              <Sparkles className="h-3.5 w-3.5" /> Khóa học của tôi
            </span>
            <h1 className="font-display text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
              Quản trị khóa học
            </h1>
            <p className="text-sm text-muted-foreground">
              {rows.length} khóa học ({teacherRows.length} tự tạo) • {totalClasses} lớp đang dạy •{" "}
              {totalStudents} lượt học viên
            </p>
          </div>
          <div className="flex flex-wrap gap-2 sm:self-end">
            <Link
              to="/teacher/qa"
              className="inline-flex h-10 items-center gap-1.5 rounded-xl border border-border bg-surface px-4 text-sm font-semibold text-foreground shadow-soft transition hover:bg-muted"
            >
              <MessageSquare className="h-4 w-4" /> Hỏi đáp học viên
            </Link>
            <Link
              to="/teacher/upload"
              className="inline-flex h-10 items-center gap-1.5 rounded-xl px-4 text-sm font-semibold text-primary-foreground shadow-soft transition hover:opacity-90"
              style={{ background: "var(--gradient-brand)" }}
            >
              <Plus className="h-4 w-4" /> Tạo khóa học mới
            </Link>
          </div>
        </div>

        {/* KPI strip */}
        <div className="mt-6 grid gap-3 sm:grid-cols-4">
          <Kpi icon={GraduationCap} label="Khóa học" value={rows.length} />
          <Kpi icon={Layers} label="Lớp đang dạy" value={totalClasses} />
          <Kpi icon={Users} label="Lượt học viên" value={totalStudents} />
          <Kpi
            icon={Trophy}
            label="Điểm TB toàn hệ thống"
            value={
              rows.length
                ? Math.round(rows.reduce((s, r) => s + r.avgScore, 0) / rows.length)
                : 0
            }
            suffix="đ"
          />
        </div>

        {/* Toolbar */}
        <div className="mt-8 rounded-2xl border border-border bg-surface p-3 shadow-soft">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Tìm khóa học, cấp độ..."
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
            <div className="flex items-center gap-2">
              <div className="relative">
                <select
                  value={originFilter}
                  onChange={(e) => setOriginFilter(e.target.value as typeof originFilter)}
                  className="h-9 appearance-none rounded-xl border border-border bg-background pl-3 pr-8 text-xs font-medium text-foreground outline-none transition hover:border-primary/40 focus:border-primary focus:ring-2 focus:ring-primary/20"
                >
                  <option value="all">Tất cả nguồn</option>
                  <option value="system">Khóa hệ thống</option>
                  <option value="teacher">Khóa tự tạo</option>
                </select>
                <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
              </div>
              <div className="relative">
                <select
                  value={levelFilter}
                  onChange={(e) => setLevelFilter(e.target.value)}
                  className="h-9 appearance-none rounded-xl border border-border bg-background pl-3 pr-8 text-xs font-medium text-foreground outline-none transition hover:border-primary/40 focus:border-primary focus:ring-2 focus:ring-primary/20"
                >
                  <option value="all">Tất cả cấp độ</option>
                  {levels.map((l) => (
                    <option key={l.code} value={l.code}>
                      Cấp độ {l.code}
                    </option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
              </div>
            </div>
          </div>
        </div>

        {/* Approval status tabs (cho khóa tự tạo) */}
        <div className="mt-4 flex flex-wrap items-center gap-1 rounded-xl bg-muted/40 p-1">
          {([
            { key: "all", label: "Tất cả", count: teacherCounts.all + (originFilter === "teacher" ? 0 : systemRows.length) },
            { key: "pending", label: "Chờ duyệt", count: teacherCounts.pending },
            { key: "approved", label: "Đã duyệt", count: teacherCounts.approved },
            { key: "rejected", label: "Bị từ chối", count: teacherCounts.rejected },
          ] as const).map((t) => (
            <button
              key={t.key}
              onClick={() => setStatusFilter(t.key)}
              className={cn(
                "inline-flex h-8 items-center gap-1.5 rounded-lg px-3 text-xs font-semibold transition",
                statusFilter === t.key
                  ? "bg-surface text-foreground shadow-soft"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {t.label}
              <span
                className={cn(
                  "inline-flex h-5 min-w-[20px] items-center justify-center rounded-md px-1 text-[10px] font-bold",
                  statusFilter === t.key
                    ? "bg-primary/10 text-primary"
                    : "bg-muted text-muted-foreground",
                )}
              >
                {t.count}
              </span>
            </button>
          ))}
          {statusFilter !== "all" && (
            <span className="ml-2 text-[11px] text-muted-foreground">
              (lọc trên khóa do bạn tạo)
            </span>
          )}
        </div>


        {/* Rows */}
        <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((row) => (
            <TeacherCourseCard
              key={row.course.id}
              {...row}
              onPublish={() => setPublishingId(row.course.id)}
              onDelete={() => setConfirmDeleteId(row.course.id)}
              onViewNote={() => setViewingNoteId(row.course.id)}
            />
          ))}
          {filtered.length === 0 && (
            <div className="col-span-full rounded-3xl border border-dashed border-border bg-surface/40 p-12 text-center">
              <GraduationCap className="mx-auto mb-3 h-8 w-8 text-muted-foreground" />
              <p className="text-sm font-medium text-foreground">
                Không tìm thấy khóa học phù hợp
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Publish dialog */}
      <PublishDialog
        draft={publishingDraft}
        onClose={() => setPublishingId(null)}
        onSave={(patch) => {
          if (publishingId) updateDraft(publishingId, patch);
          setPublishingId(null);
        }}
      />

      {/* Delete confirm */}
      <Dialog open={!!confirmDeleteId} onOpenChange={(o) => !o && setConfirmDeleteId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Xóa khóa học?</DialogTitle>
            <DialogDescription>
              Khóa học "{deletingDraft?.title || "Chưa đặt tên"}" sẽ bị xóa vĩnh viễn khỏi danh sách
              của bạn. Học viên sẽ không còn thấy khóa này.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <button
              onClick={() => setConfirmDeleteId(null)}
              className="inline-flex h-9 items-center rounded-lg border border-border bg-surface px-3 text-sm font-medium hover:bg-muted"
            >
              Hủy
            </button>
            <button
              onClick={() => {
                if (confirmDeleteId) deleteDraft(confirmDeleteId);
                setConfirmDeleteId(null);
              }}
              className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-red-600 px-3 text-sm font-semibold text-white hover:bg-red-700"
            >
              <Trash2 className="h-3.5 w-3.5" /> Xóa
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View admin rejection note */}
      <Dialog open={!!viewingNoteId} onOpenChange={(o) => !o && setViewingNoteId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nhận xét từ admin</DialogTitle>
            <DialogDescription>
              Khóa học "{viewingNoteDraft?.title || "Chưa đặt tên"}" đã bị từ chối publish.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 text-sm">
            <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-red-700 dark:border-red-900/40 dark:bg-red-950/30">
              <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider">
                <MessageSquare className="h-3 w-3" /> Lý do từ chối
              </div>
              <div className="mt-1.5 text-sm leading-relaxed">
                {viewingNoteDraft?.reviewerNote || "Admin chưa để lại nhận xét cụ thể."}
              </div>
            </div>
            {viewingNoteDraft?.reviewedAt && (
              <div className="text-[11px] text-muted-foreground">
                Đánh giá lúc:{" "}
                {new Date(viewingNoteDraft.reviewedAt).toLocaleString("vi-VN")}
              </div>
            )}
          </div>
          <DialogFooter>
            <button
              onClick={() => setViewingNoteId(null)}
              className="inline-flex h-9 items-center rounded-lg border border-border bg-surface px-3 text-sm font-medium hover:bg-muted"
            >
              Đóng
            </button>
            <button
              onClick={() => {
                const id = viewingNoteId;
                setViewingNoteId(null);
                if (id) setPublishingId(id);
              }}
              className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-primary px-3 text-sm font-semibold text-primary-foreground hover:opacity-90"
            >
              <Send className="h-3.5 w-3.5" /> Chỉnh sửa & gửi lại
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Kpi({
  icon: Icon,
  label,
  value,
  suffix,
}: {
  icon: typeof GraduationCap;
  label: string;
  value: number;
  suffix?: string;
}) {
  return (
    <div className="rounded-2xl border border-border bg-surface p-4 shadow-soft">
      <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
        <Icon className="h-3.5 w-3.5" /> {label}
      </div>
      <div className="mt-2 font-display text-2xl font-semibold text-foreground">
        {value}
        {suffix && <span className="ml-0.5 text-base font-medium text-muted-foreground">{suffix}</span>}
      </div>
    </div>
  );
}

function TeacherCourseCard({
  course,
  level,
  classCount,
  studentCount,
  avgProgress,
  origin,
  publishedClassNames,
  isPublished,
  approvalStatus,
  reviewerNote,
  onPublish,
  onDelete,
  onViewNote,
}: CourseRow & { onPublish: () => void; onDelete: () => void; onViewNote: () => void }) {
  const cover = COURSE_COVERS[course.id] ?? LEVEL_COVERS[level.code];
  const isTeacherOwn = origin === "teacher";
  const cardClass =
    "group flex flex-col overflow-hidden rounded-3xl border border-border bg-surface shadow-soft transition hover:-translate-y-0.5 hover:shadow-elevated";

  const stop = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const inner = (
    <>
      <div
        className="relative h-44 w-full overflow-hidden"
        style={{
          background: `linear-gradient(135deg, oklch(0.55 0.2 ${level.hue} / 0.18), oklch(0.7 0.18 ${(level.hue + 40) % 360} / 0.18))`,
        }}
      >
        {cover ? (
          <img
            src={cover}
            alt={`Bìa khoá học ${course.title}`}
            loading="lazy"
            className="h-full w-full object-contain p-3 transition duration-500 group-hover:scale-[1.03]"
          />
        ) : null}
        <span
          className="absolute left-3 top-3 inline-flex h-6 items-center rounded-md px-2 text-[11px] font-semibold uppercase tracking-wider text-white shadow-soft"
          style={{
            background: `linear-gradient(135deg, oklch(0.55 0.2 ${level.hue}), oklch(0.7 0.18 ${(level.hue + 40) % 360}))`,
          }}
        >
          {level.code}
        </span>
        {isTeacherOwn && (
          <div className="absolute right-3 top-3 flex flex-col items-end gap-1">
            <span className="inline-flex h-6 items-center gap-1 rounded-md bg-foreground/90 px-2 text-[11px] font-semibold uppercase tracking-wider text-background shadow-soft">
              <UserCheck className="h-3 w-3" /> Tự tạo
            </span>
            {(() => {
              const status: ApprovalStatus = approvalStatus ?? "draft";
              const map: Record<ApprovalStatus, { label: string; cls: string }> = {
                draft: { label: "Chưa gửi duyệt", cls: "bg-slate-500/90 text-white" },
                pending: { label: "Chờ duyệt", cls: "bg-amber-500/90 text-white" },
                approved: {
                  label: isPublished ? "Đã duyệt · publish" : "Đã duyệt",
                  cls: "bg-emerald-600/90 text-white",
                },
                rejected: { label: "Bị từ chối", cls: "bg-red-600/90 text-white" },
              };
              const s = map[status];
              return (
                <span
                  className={cn(
                    "inline-flex h-5 items-center rounded-md px-2 text-[10px] font-semibold uppercase tracking-wider shadow-soft",
                    s.cls,
                  )}
                >
                  {s.label}
                </span>
              );
            })()}
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-4 p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              {course.units.length} units • {course.hours}h
            </div>
            <h3 className="mt-1.5 truncate text-base font-semibold text-foreground group-hover:text-primary">
              {course.title}
            </h3>
            <p className="line-clamp-1 text-xs text-muted-foreground">{course.subtitle}</p>
          </div>
          <ArrowRight className="mt-1 h-4 w-4 shrink-0 text-muted-foreground transition group-hover:translate-x-0.5 group-hover:text-primary" />
        </div>

        <div className="grid grid-cols-2 gap-2 text-center">
          <Stat label="Lớp" value={classCount} />
          <Stat label="Học viên" value={studentCount} />
        </div>

        {isTeacherOwn && approvalStatus === "rejected" && (
          <div className="flex items-start justify-between gap-2 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-[11px] text-red-700 dark:border-red-900/40 dark:bg-red-950/30">
            <div className="min-w-0 flex-1">
              <div className="font-semibold">Khóa học bị admin từ chối</div>
              <div className="mt-0.5 line-clamp-1 text-red-600/80">
                {reviewerNote ? `"${reviewerNote}"` : "Bấm để xem nhận xét chi tiết."}
              </div>
            </div>
            <button
              onClick={(e) => {
                stop(e);
                onViewNote();
              }}
              className="inline-flex h-7 shrink-0 items-center gap-1 rounded-md border border-red-300 bg-white px-2 text-[11px] font-semibold text-red-700 hover:bg-red-100 dark:border-red-900/40 dark:bg-red-950/40"
            >
              <MessageSquare className="h-3 w-3" /> Xem nhận xét
            </button>
          </div>
        )}

        {isTeacherOwn && approvalStatus === "pending" && (
          <div className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-[11px] text-amber-700 dark:border-amber-900/40 dark:bg-amber-950/30">
            Yêu cầu publish đang chờ admin phê duyệt.
          </div>
        )}

        {isTeacherOwn && publishedClassNames && publishedClassNames.length > 0 && (
          <div className="rounded-xl bg-muted/40 px-3 py-2 text-[11px] text-muted-foreground">
            <span className="font-semibold text-foreground">Đã publish:</span>{" "}
            {publishedClassNames.join(", ")}
          </div>
        )}

        <div className="mt-auto">
          <div className="flex items-center justify-between text-[11px] font-medium text-muted-foreground">
            <span className="inline-flex items-center gap-1">
              <TrendingUp className="h-3 w-3" /> Tiến độ trung bình các lớp
            </span>
            <span>{avgProgress}%</span>
          </div>
          <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full"
              style={{
                width: `${avgProgress}%`,
                background: `linear-gradient(90deg, oklch(0.55 0.2 ${level.hue}), oklch(0.7 0.18 ${(level.hue + 40) % 360}))`,
              }}
            />
          </div>
        </div>

        {isTeacherOwn && (
          <div className="-mx-1 flex flex-wrap items-center gap-1.5 border-t border-border pt-3">
            {(() => {
              const status: ApprovalStatus = approvalStatus ?? "draft";
              const isPending = status === "pending";
              const label =
                status === "approved"
                  ? "Gửi duyệt lại"
                  : status === "rejected"
                    ? "Gửi lại"
                    : status === "pending"
                      ? "Đang chờ duyệt"
                      : "Gửi duyệt";
              return (
                <button
                  onClick={(e) => {
                    stop(e);
                    if (!isPending) onPublish();
                  }}
                  disabled={isPending}
                  className={cn(
                    "inline-flex h-8 items-center gap-1.5 rounded-lg px-2.5 text-xs font-semibold",
                    isPending
                      ? "cursor-not-allowed bg-muted text-muted-foreground"
                      : "bg-primary text-primary-foreground hover:opacity-90",
                  )}
                >
                  <Send className="h-3 w-3" /> {label}
                </button>
              );
            })()}
            <Link
              to="/teacher/upload"
              search={{ edit: course.id }}
              onClick={(e) => e.stopPropagation()}
              className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-border bg-surface px-2.5 text-xs font-semibold text-foreground hover:bg-muted"
            >
              <Pencil className="h-3 w-3" /> Sửa
            </Link>
            <button
              onClick={(e) => {
                stop(e);
                onDelete();
              }}
              className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-red-200 bg-red-50 px-2.5 text-xs font-semibold text-red-600 hover:bg-red-100 dark:border-red-900/40 dark:bg-red-950/30"
            >
              <Trash2 className="h-3 w-3" /> Xóa
            </button>
          </div>
        )}
      </div>
    </>
  );

  return (
    <Link
      to="/teacher/courses/$courseId"
      params={{ courseId: course.id }}
      className={cardClass}
    >
      {inner}
    </Link>
  );
}

function Stat({
  label,
  value,
  tone,
}: {
  label: string;
  value: string | number;
  tone?: "primary" | "emerald";
}) {
  return (
    <div className="rounded-xl bg-background p-2 ring-1 ring-border">
      <div className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
        {label}
      </div>
      <div
        className={cn(
          "mt-0.5 text-sm font-semibold text-foreground",
          tone === "primary" && "text-primary",
          tone === "emerald" && "text-emerald-600",
        )}
      >
        {value}
      </div>
    </div>
  );
}

function PublishDialog({
  draft,
  onClose,
  onSave,
}: {
  draft: DraftCourse | null;
  onClose: () => void;
  onSave: (patch: Partial<DraftCourse>) => void;
}) {
  const [visibility, setVisibility] = useState<"system" | "classes">("classes");
  const [selected, setSelected] = useState<string[]>([]);

  useEffect(() => {
    if (draft) {
      const v =
        draft.pendingVisibility ?? draft.visibility ?? "classes";
      setVisibility(v === "system" ? "system" : "classes");
      setSelected(draft.pendingClassIds ?? draft.classIds ?? []);
    }
  }, [draft?.id]);

  const levelCode = draft?.levelCode ?? "A1";
  const availableClasses = classes.filter((c) => c.levelCode === levelCode);

  const toggle = (id: string) =>
    setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));

  return (
    <Dialog open={!!draft} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Gửi yêu cầu publish</DialogTitle>
          <DialogDescription>
            Chọn phạm vi muốn publish cho khóa "{draft?.title || "Chưa đặt tên"}" (cấp độ{" "}
            {levelCode}). Yêu cầu sẽ được gửi tới admin để phê duyệt trước khi học viên thấy.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-border bg-surface p-3 hover:bg-muted/40">
            <input
              type="radio"
              checked={visibility === "classes"}
              onChange={() => setVisibility("classes")}
              className="mt-0.5"
            />
            <div>
              <div className="text-sm font-semibold text-foreground">Chọn lớp cụ thể</div>
              <div className="text-xs text-muted-foreground">
                Chỉ những lớp được tick mới thấy khóa học này.
              </div>
            </div>
          </label>

          {visibility === "classes" && (
            <div className="max-h-56 space-y-1.5 overflow-auto rounded-xl border border-border bg-background p-2">
              {availableClasses.length === 0 && (
                <div className="px-3 py-4 text-center text-xs text-muted-foreground">
                  Bạn chưa có lớp nào ở cấp độ {levelCode}.
                </div>
              )}
              {availableClasses.map((c) => {
                const on = selected.includes(c.id);
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => toggle(c.id)}
                    className={cn(
                      "flex w-full items-center justify-between rounded-lg border px-3 py-2 text-left text-xs transition",
                      on
                        ? "border-primary bg-primary/10 text-foreground"
                        : "border-border bg-surface hover:bg-muted/40",
                    )}
                  >
                    <span className="font-medium">{c.name}</span>
                    {on && <Check className="h-3.5 w-3.5 text-primary" />}
                  </button>
                );
              })}
            </div>
          )}

          <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-border bg-surface p-3 hover:bg-muted/40">
            <input
              type="radio"
              checked={visibility === "system"}
              onChange={() => setVisibility("system")}
              className="mt-0.5"
            />
            <div>
              <div className="text-sm font-semibold text-foreground">
                Toàn bộ lớp cấp độ {levelCode}
              </div>
              <div className="text-xs text-muted-foreground">
                Mọi lớp bạn quản lý ở cấp độ này đều được publish.
              </div>
            </div>
          </label>
        </div>

        <DialogFooter>
          <button
            onClick={onClose}
            className="inline-flex h-9 items-center rounded-lg border border-border bg-surface px-3 text-sm font-medium hover:bg-muted"
          >
            Hủy
          </button>
          <button
            onClick={() =>
              onSave({
                pendingVisibility: visibility,
                pendingClassIds: visibility === "classes" ? selected : [],
                approvalStatus: "pending",
                submittedAt: new Date().toISOString(),
                reviewerNote: undefined,
              })
            }
            disabled={visibility === "classes" && selected.length === 0}
            className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-primary px-3 text-sm font-semibold text-primary-foreground hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Send className="h-3.5 w-3.5" /> Gửi yêu cầu duyệt
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
