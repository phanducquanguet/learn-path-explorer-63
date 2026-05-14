import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  CheckCircle2,
  Play,
  Clock,
  Sparkles,
  GraduationCap,
  Search,
  LayoutGrid,
  List,
  ChevronDown,
  X,
  BookOpen,
} from "lucide-react";
import { levels, type Course, type Level } from "@/lib/lms-data";
import { TopNav } from "@/components/TopNav";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/courses/")({
  head: () => ({
    meta: [
      { title: "Khóa học — UNICOM LMS" },
      { name: "description", content: "Danh sách khóa học theo chương trình và cấp độ." },
    ],
  }),
  component: CoursesListPage,
});

// ----- Category derivation -----
const CATEGORIES = [
  "Empower",
  "Speaking & Listening Lab",
  "Luyện thi KET/PET",
  "Luyện thi IELTS",
  "Luyện thi Linguaskill",
  "Luyện thi EST",
  "Học liệu bồi dưỡng",
  "Khác",
] as const;
type Category = (typeof CATEGORIES)[number];

function categoryOf(c: Course): Category {
  const t = `${c.title} ${c.subtitle}`.toLowerCase();
  if (t.includes("ielts")) return "Luyện thi IELTS";
  if (t.includes("linguaskill")) return "Luyện thi Linguaskill";
  if (t.includes("ket") || t.includes("pet")) return "Luyện thi KET/PET";
  if (t.includes("est")) return "Luyện thi EST";
  if (t.includes("listening") || t.includes("speaking") || t.includes("lab"))
    return "Speaking & Listening Lab";
  if (t.includes("bồi dưỡng") || t.includes("học liệu")) return "Học liệu bồi dưỡng";
  if (t.includes("empower") || t.includes("foundation")) return "Empower";
  return "Khác";
}

type Status = "all" | "in-progress" | "completed" | "not-started";
type View = "grid" | "list";
type GroupBy = "category" | "level";

function CoursesListPage() {
  const allCourses = useMemo(
    () =>
      levels.flatMap((lv) =>
        lv.courses.map((c) => ({ course: c, level: lv, category: categoryOf(c) })),
      ),
    [],
  );

  const [query, setQuery] = useState("");
  const [levelFilter, setLevelFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<Category | "all">("all");
  const [status, setStatus] = useState<Status>("all");
  const [view, setView] = useState<View>("grid");
  const [groupBy, setGroupBy] = useState<GroupBy>("category");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return allCourses.filter(({ course, level, category }) => {
      if (levelFilter !== "all" && level.code !== levelFilter) return false;
      if (categoryFilter !== "all" && category !== categoryFilter) return false;
      if (status === "completed" && course.progress < 100) return false;
      if (status === "in-progress" && (course.progress === 0 || course.progress >= 100))
        return false;
      if (status === "not-started" && course.progress > 0) return false;
      if (
        q &&
        !`${course.title} ${course.subtitle} ${level.code} ${category}`
          .toLowerCase()
          .includes(q)
      )
        return false;
      return true;
    });
  }, [allCourses, query, levelFilter, categoryFilter, status]);

  const groups = useMemo(() => {
    const map = new Map<string, typeof filtered>();
    for (const item of filtered) {
      const key = groupBy === "category" ? item.category : `Cấp độ ${item.level.code}`;
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(item);
    }
    // stable order
    if (groupBy === "category") {
      return CATEGORIES.filter((c) => map.has(c)).map((c) => ({
        key: c,
        items: map.get(c)!,
      }));
    }
    return levels
      .map((lv) => `Cấp độ ${lv.code}`)
      .filter((k) => map.has(k))
      .map((k) => ({ key: k, items: map.get(k)! }));
  }, [filtered, groupBy]);

  const totalCompleted = allCourses.filter((x) => x.course.progress >= 100).length;
  const hasFilters =
    query !== "" || levelFilter !== "all" || categoryFilter !== "all" || status !== "all";

  return (
    <div className="min-h-screen bg-background">
      <TopNav />
      <div className="mx-auto max-w-7xl px-6 pb-20 pt-10 sm:px-8">
        {/* Header */}
        <div className="flex flex-col gap-2">
          <span className="inline-flex w-fit items-center gap-2 text-xs font-semibold uppercase tracking-wider text-primary">
            <Sparkles className="h-3.5 w-3.5" /> Tất cả khóa học
          </span>
          <h1 className="font-display text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            Danh sách khóa học
          </h1>
          <p className="text-sm text-muted-foreground">
            {allCourses.length} khóa học • {totalCompleted} đã hoàn thành •{" "}
            {filtered.length} đang hiển thị
          </p>
        </div>

        {/* Toolbar */}
        <div className="mt-8 rounded-2xl border border-border bg-surface p-3 shadow-soft">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Tìm khóa học, chương trình hoặc cấp độ..."
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

            {/* Filters */}
            <div className="flex flex-wrap items-center gap-2">
              <FilterSelect
                value={categoryFilter}
                onChange={(v) => setCategoryFilter(v as Category | "all")}
                options={[
                  { value: "all", label: "Tất cả chương trình" },
                  ...CATEGORIES.map((c) => ({ value: c, label: c })),
                ]}
              />
              <FilterSelect
                value={levelFilter}
                onChange={setLevelFilter}
                options={[
                  { value: "all", label: "Tất cả cấp độ" },
                  ...levels.map((l) => ({ value: l.code, label: `Cấp độ ${l.code}` })),
                ]}
              />
              <FilterSelect
                value={status}
                onChange={(v) => setStatus(v as Status)}
                options={[
                  { value: "all", label: "Mọi trạng thái" },
                  { value: "in-progress", label: "Đang học" },
                  { value: "completed", label: "Đã hoàn thành" },
                  { value: "not-started", label: "Chưa bắt đầu" },
                ]}
              />

              {/* Group by */}
              <div className="flex items-center gap-1 rounded-xl border border-border bg-background p-1 text-xs">
                {(["category", "level"] as const).map((g) => (
                  <button
                    key={g}
                    onClick={() => setGroupBy(g)}
                    className={cn(
                      "rounded-lg px-2.5 py-1.5 font-medium transition",
                      groupBy === g
                        ? "bg-foreground text-background"
                        : "text-muted-foreground hover:text-foreground",
                    )}
                  >
                    {g === "category" ? "Theo chương trình" : "Theo cấp độ"}
                  </button>
                ))}
              </div>

              {/* View toggle */}
              <div className="flex items-center gap-1 rounded-xl border border-border bg-background p-1">
                <button
                  onClick={() => setView("grid")}
                  className={cn(
                    "rounded-lg p-1.5 transition",
                    view === "grid"
                      ? "bg-foreground text-background"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                  aria-label="Lưới"
                >
                  <LayoutGrid className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setView("list")}
                  className={cn(
                    "rounded-lg p-1.5 transition",
                    view === "list"
                      ? "bg-foreground text-background"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                  aria-label="Danh sách"
                >
                  <List className="h-4 w-4" />
                </button>
              </div>

              {hasFilters && (
                <button
                  onClick={() => {
                    setQuery("");
                    setLevelFilter("all");
                    setCategoryFilter("all");
                    setStatus("all");
                  }}
                  className="inline-flex items-center gap-1 rounded-xl px-3 py-1.5 text-xs font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
                >
                  <X className="h-3.5 w-3.5" /> Xóa bộ lọc
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Empty state */}
        {filtered.length === 0 && (
          <div className="mt-12 rounded-3xl border border-dashed border-border bg-surface/40 p-12 text-center">
            <BookOpen className="mx-auto mb-3 h-8 w-8 text-muted-foreground" />
            <p className="text-sm font-medium text-foreground">
              Không tìm thấy khóa học phù hợp
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Thử bỏ bớt bộ lọc hoặc tìm với từ khóa khác.
            </p>
          </div>
        )}

        {/* Groups */}
        {groups.map((group) => (
          <section key={group.key} className="mt-10">
            <div className="flex items-baseline justify-between border-b border-border pb-3">
              <h2 className="font-display text-lg font-semibold text-foreground">
                {group.key}
              </h2>
              <span className="text-xs text-muted-foreground">
                {group.items.length} khóa học
              </span>
            </div>

            {view === "grid" ? (
              <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {group.items.map(({ course, level }) => (
                  <CourseCard key={course.id} course={course} level={level} />
                ))}
              </div>
            ) : (
              <div className="mt-3 overflow-hidden rounded-2xl border border-border bg-surface shadow-soft">
                {group.items.map(({ course, level, category }, i) => (
                  <CourseRow
                    key={course.id}
                    course={course}
                    level={level}
                    category={category}
                    isLast={i === group.items.length - 1}
                  />
                ))}
              </div>
            )}
          </section>
        ))}
      </div>
    </div>
  );
}

// ----- Filter Select -----
function FilterSelect({
  value,
  onChange,
  options,
}: {
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-9 appearance-none rounded-xl border border-border bg-background pl-3 pr-8 text-xs font-medium text-foreground outline-none transition hover:border-primary/40 focus:border-primary focus:ring-2 focus:ring-primary/20"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
    </div>
  );
}

// ----- Card -----
function CourseCard({ course, level }: { course: Course; level: Level }) {
  const done = course.progress >= 100;
  const started = course.progress > 0;
  return (
    <Link
      to="/courses/$courseId"
      params={{ courseId: course.id }}
      className="group relative overflow-hidden rounded-3xl bg-surface p-5 ring-1 ring-border shadow-soft transition hover:-translate-y-1 hover:shadow-elevated"
    >
      <div
        className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full opacity-30 blur-3xl transition group-hover:opacity-60"
        style={{ background: `oklch(0.78 0.18 ${level.hue})` }}
      />
      <div className="relative flex items-start justify-between">
        <div
          className="flex h-12 w-12 items-center justify-center rounded-2xl text-primary-foreground"
          style={{
            background: `linear-gradient(135deg, oklch(0.5 0.18 ${level.hue}), oklch(0.65 0.18 ${(level.hue + 30) % 360}))`,
          }}
        >
          <GraduationCap className="h-5 w-5" />
        </div>
        <StatusBadge done={done} started={started} />
      </div>

      <div className="relative mt-4">
        <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
          Cấp độ {level.code}
        </div>
        <h3 className="mt-1 text-lg font-semibold text-foreground">{course.title}</h3>
        <p className="mt-1 text-xs text-muted-foreground">{course.subtitle}</p>
      </div>

      <div className="relative mt-4">
        <div className="flex items-center justify-between text-[11px] font-medium text-muted-foreground">
          <span className="inline-flex items-center gap-1">
            <Clock className="h-3 w-3" /> {course.hours}h • {course.units.length} units
          </span>
          <span>{course.progress}%</span>
        </div>
        <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full"
            style={{
              width: `${course.progress}%`,
              background: `linear-gradient(90deg, oklch(0.55 0.2 ${level.hue}), oklch(0.7 0.18 ${(level.hue + 40) % 360}))`,
            }}
          />
        </div>
      </div>
    </Link>
  );
}

// ----- List Row -----
function CourseRow({
  course,
  level,
  category,
  isLast,
}: {
  course: Course;
  level: Level;
  category: Category;
  isLast: boolean;
}) {
  const done = course.progress >= 100;
  const started = course.progress > 0;
  return (
    <Link
      to="/courses/$courseId"
      params={{ courseId: course.id }}
      className={cn(
        "group flex items-center gap-4 px-4 py-3 transition hover:bg-muted/40",
        !isLast && "border-b border-border",
      )}
    >
      <div
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-primary-foreground"
        style={{
          background: `linear-gradient(135deg, oklch(0.5 0.18 ${level.hue}), oklch(0.65 0.18 ${(level.hue + 30) % 360}))`,
        }}
      >
        <GraduationCap className="h-4 w-4" />
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
            {level.code}
          </span>
          <span className="text-[10px] text-muted-foreground">•</span>
          <span className="text-[10px] text-muted-foreground">{category}</span>
        </div>
        <div className="mt-0.5 truncate text-sm font-semibold text-foreground">
          {course.title}
        </div>
        <div className="truncate text-xs text-muted-foreground">{course.subtitle}</div>
      </div>

      <div className="hidden shrink-0 items-center gap-1.5 text-xs text-muted-foreground sm:flex">
        <Clock className="h-3.5 w-3.5" /> {course.hours}h
      </div>

      <div className="hidden w-40 shrink-0 md:block">
        <div className="flex items-center justify-between text-[10px] font-medium text-muted-foreground">
          <span>{course.units.length} units</span>
          <span>{course.progress}%</span>
        </div>
        <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full"
            style={{
              width: `${course.progress}%`,
              background: `linear-gradient(90deg, oklch(0.55 0.2 ${level.hue}), oklch(0.7 0.18 ${(level.hue + 40) % 360}))`,
            }}
          />
        </div>
      </div>

      <StatusBadge done={done} started={started} />
    </Link>
  );
}

function StatusBadge({ done, started }: { done: boolean; started: boolean }) {
  if (done)
    return (
      <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-success/15 px-2.5 py-1 text-[11px] font-semibold text-success-foreground ring-1 ring-success/30">
        <CheckCircle2 className="h-3 w-3" /> Đã học
      </span>
    );
  if (started)
    return (
      <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-primary/10 px-2.5 py-1 text-[11px] font-semibold text-primary ring-1 ring-primary/20">
        <Play className="h-3 w-3" /> Đang học
      </span>
    );
  return (
    <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-muted px-2.5 py-1 text-[11px] font-semibold text-muted-foreground ring-1 ring-border">
      Chưa bắt đầu
    </span>
  );
}
