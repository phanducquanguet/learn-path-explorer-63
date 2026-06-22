import { useMemo, useState } from "react";
import { Star, Send, MessageCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { courseReviews as seed, type CourseReview } from "@/lib/course-reviews";

type Role = "student" | "teacher" | "admin";

const STORAGE_KEY = "unicom.course.reviews";

function loadAll(): CourseReview[] {
  if (typeof window === "undefined") return seed;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return seed;
    const extra = JSON.parse(raw) as CourseReview[];
    return [...extra, ...seed];
  } catch {
    return seed;
  }
}

function persistExtras(extras: CourseReview[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(extras));
}

function Stars({
  value,
  onChange,
  size = 16,
}: {
  value: number;
  onChange?: (v: number) => void;
  size?: number;
}) {
  return (
    <div className="inline-flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          disabled={!onChange}
          onClick={() => onChange?.(n)}
          className={cn(
            "rounded p-0.5 transition",
            onChange && "hover:scale-110 cursor-pointer",
            !onChange && "cursor-default",
          )}
          aria-label={`${n} sao`}
        >
          <Star
            style={{ width: size, height: size }}
            className={cn(
              n <= value ? "fill-amber-400 text-amber-400" : "fill-none text-muted-foreground/40",
            )}
          />
        </button>
      ))}
    </div>
  );
}

export function CourseReviewsView({
  courseId,
  teacherName = "Giáo viên phụ trách",
  role,
}: {
  courseId: string;
  teacherName?: string;
  role: Role;
}) {
  const [all, setAll] = useState<CourseReview[]>(() => loadAll());
  const list = useMemo(
    () => all.filter((r) => r.courseId === courseId),
    [all, courseId],
  );

  const [courseRating, setCourseRating] = useState(5);
  const [teacherRating, setTeacherRating] = useState(5);
  const [content, setContent] = useState("");

  const isStudent = role === "student";
  const myName = "Bảo Châu";
  const myClass = "B1 — Fastrack";

  const avg = (key: "courseRating" | "teacherRating") =>
    list.length === 0
      ? 0
      : Math.round((list.reduce((s, r) => s + r[key], 0) / list.length) * 10) / 10;

  const submit = () => {
    if (!content.trim()) return;
    const r: CourseReview = {
      id: `r-${Date.now()}`,
      courseId,
      studentName: myName,
      studentClass: myClass,
      teacherName,
      courseRating,
      teacherRating,
      content: content.trim(),
      createdAt: new Date().toISOString(),
    };
    const next = [r, ...all];
    setAll(next);
    // only persist extras (those not in seed)
    const seedIds = new Set(seed.map((x) => x.id));
    persistExtras(next.filter((x) => !seedIds.has(x.id)));
    setContent("");
    setCourseRating(5);
    setTeacherRating(5);
  };

  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_360px]">
      {/* List */}
      <div className="space-y-3">
        {isStudent && (
          <div className="rounded-3xl border border-border bg-surface p-5 shadow-soft">
            <div className="text-sm font-semibold text-foreground">
              Gửi nhận xét của bạn
            </div>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl bg-muted/40 p-3">
                <div className="text-xs font-medium text-muted-foreground">
                  Đánh giá khóa học
                </div>
                <div className="mt-1.5">
                  <Stars value={courseRating} onChange={setCourseRating} size={22} />
                </div>
              </div>
              <div className="rounded-2xl bg-muted/40 p-3">
                <div className="text-xs font-medium text-muted-foreground">
                  Đánh giá giáo viên ({teacherName})
                </div>
                <div className="mt-1.5">
                  <Stars value={teacherRating} onChange={setTeacherRating} size={22} />
                </div>
              </div>
            </div>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={4}
              placeholder="Chia sẻ cảm nhận của bạn về khóa học và giáo viên..."
              className="mt-3 w-full rounded-2xl border border-border bg-background p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
            <div className="mt-3 flex justify-end">
              <button
                onClick={submit}
                disabled={!content.trim()}
                className="inline-flex items-center gap-1.5 rounded-xl px-4 py-2 text-sm font-semibold text-primary-foreground shadow-soft disabled:opacity-50"
                style={{ background: "var(--gradient-brand)" }}
              >
                <Send className="h-4 w-4" /> Gửi nhận xét
              </button>
            </div>
          </div>
        )}

        {list.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-border bg-surface/50 p-10 text-center text-sm text-muted-foreground">
            <MessageCircle className="mx-auto mb-2 h-6 w-6 opacity-50" />
            Chưa có nhận xét nào cho khóa học này.
          </div>
        ) : (
          list.map((r) => (
            <div
              key={r.id}
              className="rounded-3xl border border-border bg-surface p-5 shadow-soft"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <div className="text-sm font-semibold text-foreground">
                    {r.studentName}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {r.studentClass} • {new Date(r.createdAt).toLocaleString("vi-VN")}
                  </div>
                </div>
              </div>
              <div className="mt-3 grid gap-2 sm:grid-cols-2">
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-muted-foreground">Khóa học:</span>
                  <Stars value={r.courseRating} />
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-muted-foreground">
                    Giáo viên ({r.teacherName}):
                  </span>
                  <Stars value={r.teacherRating} />
                </div>
              </div>
              <p className="mt-3 rounded-2xl bg-muted/40 p-3 text-sm text-foreground">
                {r.content}
              </p>
            </div>
          ))
        )}
      </div>

      {/* Summary */}
      <aside className="space-y-3">
        <div className="rounded-3xl border border-border bg-surface p-5 shadow-soft">
          <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Tổng quan đánh giá
          </div>
          <div className="mt-3 space-y-3">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Khóa học</span>
                <span className="text-sm font-semibold text-foreground">
                  {avg("courseRating") || "—"}/5
                </span>
              </div>
              <div className="mt-1">
                <Stars value={Math.round(avg("courseRating"))} />
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Giáo viên</span>
                <span className="text-sm font-semibold text-foreground">
                  {avg("teacherRating") || "—"}/5
                </span>
              </div>
              <div className="mt-1">
                <Stars value={Math.round(avg("teacherRating"))} />
              </div>
            </div>
            <div className="border-t border-border pt-3 text-xs text-muted-foreground">
              {list.length} lượt nhận xét
            </div>
          </div>
        </div>
        {!isStudent && (
          <div className="rounded-3xl border border-dashed border-border bg-surface/60 p-4 text-xs text-muted-foreground">
            Chế độ chỉ xem dành cho {role === "admin" ? "Admin" : "Giáo viên"}.
            Học viên có thể gửi nhận xét từ giao diện học của họ.
          </div>
        )}
      </aside>
    </div>
  );
}
