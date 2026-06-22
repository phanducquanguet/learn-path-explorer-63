import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { TopNav } from "@/components/TopNav";
import { EXAM_SKILLS, classes as teacherClasses } from "@/lib/teacher-data";
import { useRole } from "@/contexts/RoleContext";
import { usePublishStatus, STATUS_LABEL, type PublishStatus, type PublishEvent } from "@/lib/publish-status";
import { confirmPublishAction } from "@/lib/publish-actions";
import { BankPage } from "@/routes/admin.question-bank";
import {
  ClipboardCheck,
  Plus,
  Sparkles,
  Layers,
  Trash2,
  FileQuestion,
  Pencil,
  MessageSquare,
  Send,
  FileEdit,
  Library,
} from "lucide-react";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/admin/exams/")({
  head: () => ({ meta: [{ title: "Bài luyện thi — UNICOM LMS" }] }),
  component: () => <ExamsList scope="admin" />,
});


type SavedExam = {
  id?: string;
  name: string;
  levelCode: string;
  levelCodes?: string[];
  duration: number;
  description?: string;
  thumbnail?: string;
  skills: string[];
  totalQuestions?: number;
  groups?: Record<string, { questions: unknown[] }>;
  classIds?: string[];
  savedAt: string;
};

const getLevels = (e: SavedExam): string[] => {
  if (e.levelCodes && e.levelCodes.length) return e.levelCodes;
  return e.levelCode ? [e.levelCode] : [];
};

const SEED: SavedExam[] = [
  {
    id: "seed-1",
    name: "B1 Mock Test 01",
    levelCode: "B1",
    duration: 90,
    description: "Bài thi tổng hợp 4 kỹ năng theo chuẩn B1.",
    skills: ["listening", "reading", "writing"],
    totalQuestions: 42,
    savedAt: "2025-04-28T09:00:00.000Z",
  },
  {
    id: "seed-2",
    name: "A2 Reading Practice",
    levelCode: "A2",
    duration: 45,
    description: "Luyện kỹ năng đọc hiểu cấp độ A2 với 3 đoạn văn.",
    skills: ["reading"],
    totalQuestions: 20,
    savedAt: "2025-05-02T14:30:00.000Z",
  },
  {
    id: "seed-3",
    name: "Listening Mini Quiz",
    levelCode: "A1",
    duration: 20,
    description: "Bài kiểm tra nghe ngắn dành cho học viên mới.",
    skills: ["listening"],
    totalQuestions: 10,
    savedAt: "2025-05-05T08:15:00.000Z",
  },
];

const EXAMS_KEY = (scope: "admin" | "teacher") =>
  scope === "teacher" ? "unicom.teacher.exams" : "unicom.exams";
const PUBLISH_SCOPE = (scope: "admin" | "teacher") =>
  scope === "teacher" ? "teacher.exams" : "exams";

export function ExamsList({ scope = "admin" }: { scope?: "admin" | "teacher" } = {}) {
  const { role } = useRole();
  const canManage = scope === "admin" ? role === "admin" : role === "teacher";
  const [tab, setTab] = useState<"exams" | "bank">("exams");
  const [exams, setExams] = useState<SavedExam[]>([]);
  const { getStatus, toggle, wasEverPublished } = usePublishStatus(
    PUBLISH_SCOPE(scope),
    "published",
  );

  const handleTogglePublish = (id: string, name: string) => {
    const current = getStatus(id);
    const willBe: PublishStatus = current === "published" ? "draft" : "published";
    const ever = wasEverPublished(id);
    const event: PublishEvent =
      willBe === "draft" ? "unpublish" : ever ? "republish" : "first-publish";
    if (!confirmPublishAction("exam", name, event)) return;
    toggle(id);
  };
  const [statusFilter, setStatusFilter] = useState<"all" | "draft" | "published">("all");
  const [classFilter, setClassFilter] = useState<string>("all");

  useEffect(() => {
    if (typeof window === "undefined") return;
    const KEY = EXAMS_KEY(scope);
    const raw = window.localStorage.getItem(KEY);
    if (!raw) {
      const seed = scope === "admin" ? SEED : [];
      window.localStorage.setItem(KEY, JSON.stringify(seed));
      setExams(seed);
    } else {
      try {
        const parsed: SavedExam[] = JSON.parse(raw);
        // Strip org-only fields. Keep classIds for teacher scope.
        const cleaned = parsed.map(({ ...e }) => {
          const copy = { ...e } as SavedExam & {
            orgId?: string;
            classIds?: string[];
            copiedFromId?: string;
          };
          delete copy.orgId;
          if (scope !== "teacher") delete copy.classIds;
          delete copy.copiedFromId;
          return copy;
        });
        setExams(cleaned);
      } catch {
        setExams(scope === "admin" ? SEED : []);
      }
    }
  }, [scope]);

  const persist = (next: SavedExam[]) => {
    setExams(next);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(EXAMS_KEY(scope), JSON.stringify(next));
    }
  };


  const remove = (id: string) => {
    persist(exams.filter((e) => e.id !== id));
  };

  const skillLabel = (id: string) =>
    EXAM_SKILLS.find((s) => s.id === id)?.label.replace(/\s*\(.*\)/, "") ?? id;

  return (
    <div className="min-h-screen bg-background">
      <TopNav />
      <div className="mx-auto max-w-7xl px-6 pb-20 pt-10 sm:px-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-primary">
              <Sparkles className="h-3.5 w-3.5" /> Quản lý bài thi
            </span>
            <h1 className="mt-1 font-display text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
              {scope === "teacher" ? "Bài tập & Kiểm tra" : "Bài luyện thi"}
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {scope === "teacher"
                ? "Tạo bài kiểm tra và luyện tập cho học viên trong các lớp bạn được phân công."
                : "Bài thi được phân loại theo cấp độ (A1–C2) và dùng chung cho mọi học viên cùng cấp."}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {scope === "teacher" && (
              <Link
                to="/teacher/qa"
                className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-surface px-3.5 py-2 text-sm font-semibold text-foreground hover:bg-muted"
              >
                <MessageSquare className="h-4 w-4" /> Hỏi đáp học viên
              </Link>
            )}
            {canManage && tab === "exams" && (
              <Link
                to={scope === "teacher" ? "/teacher/exams/new" : "/admin/exams/new"}
                className="inline-flex items-center gap-1.5 rounded-xl px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-soft"
                style={{ background: "var(--gradient-brand)" }}
              >
                <Plus className="h-4 w-4" /> Tạo bài thi mới
              </Link>
            )}

          </div>
        </div>

        {/* Tabs: Bài luyện thi | Ngân hàng câu hỏi (chỉ giáo viên) */}
        {scope === "teacher" && (
          <div className="mt-6 inline-flex items-center gap-1 rounded-xl border border-border bg-surface p-1">
            {([
              { id: "exams" as const, label: "Bài tập & Kiểm tra", icon: ClipboardCheck },
              { id: "bank" as const, label: "Ngân hàng câu hỏi", icon: Library },
            ]).map((t) => {
              const Icon = t.icon;
              const active = tab === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => setTab(t.id)}
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-semibold transition",
                    active
                      ? "bg-foreground text-background"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  <Icon className="h-4 w-4" /> {t.label}
                </button>
              );
            })}
          </div>
        )}

        {tab === "bank" ? (
          <div className="mt-6">
            <BankPage scope={scope} embedded />
          </div>
        ) : (
          <>
        {/* Stats */}
        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          <StatCard icon={ClipboardCheck} label="Tổng số bài thi" value={exams.length} />
          <StatCard
            icon={FileQuestion}
            label="Tổng số câu hỏi"
            value={exams.reduce((s, e) => s + (e.totalQuestions ?? 0), 0)}
          />
          <StatCard
            icon={Layers}
            label="Cấp độ có bài thi"
            value={new Set(exams.map((e) => e.levelCode)).size}
          />
        </div>

        {/* Filter trạng thái xuất bản (chỉ admin) */}
        {canManage && (
          <div className="mt-6 flex flex-wrap items-center gap-2 rounded-2xl border border-border bg-surface px-4 py-3">
            <span className="text-xs font-semibold text-muted-foreground">Trạng thái:</span>
            {([
              { id: "all", label: `Tất cả (${exams.length})` },
              {
                id: "published",
                label: `Đã xuất bản (${exams.filter((e) => getStatus(e.id ?? "") === "published").length})`,
              },
              {
                id: "draft",
                label: `Bản nháp (${exams.filter((e) => getStatus(e.id ?? "") === "draft").length})`,
              },
            ] as const).map((opt) => (
              <button
                key={opt.id}
                onClick={() => setStatusFilter(opt.id)}
                className={cn(
                  "rounded-lg px-2.5 py-1 text-xs font-semibold transition",
                  statusFilter === opt.id
                    ? "bg-foreground text-background"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {opt.label}
              </button>
            ))}
          </div>
        )}

        {/* Filter theo lớp (chỉ giáo viên) */}
        {scope === "teacher" && (
          <div className="mt-3 flex flex-wrap items-center gap-2 rounded-2xl border border-border bg-surface px-4 py-3">
            <span className="text-xs font-semibold text-muted-foreground">Lớp:</span>
            <button
              onClick={() => setClassFilter("all")}
              className={cn(
                "rounded-lg px-2.5 py-1 text-xs font-semibold transition",
                classFilter === "all"
                  ? "bg-foreground text-background"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              Tất cả lớp ({exams.length})
            </button>
            {teacherClasses.map((c) => {
              const count = exams.filter((e) => (e.classIds ?? []).includes(c.id)).length;
              return (
                <button
                  key={c.id}
                  onClick={() => setClassFilter(c.id)}
                  className={cn(
                    "rounded-lg px-2.5 py-1 text-xs font-semibold transition",
                    classFilter === c.id
                      ? "bg-foreground text-background"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  {c.name} ({count})
                </button>
              );
            })}
          </div>
        )}

        {/* List */}
        {exams.length === 0 ? (
          <div className="mt-8 rounded-3xl border border-dashed border-border bg-surface/40 p-16 text-center">
            <ClipboardCheck className="mx-auto h-10 w-10 text-muted-foreground" />
            <div className="mt-3 font-display text-lg font-semibold text-foreground">
              Chưa có bài thi nào
            </div>
            <p className="mt-1 text-sm text-muted-foreground">
              Tạo bài thi đầu tiên để học viên bắt đầu luyện tập.
            </p>
          </div>
        ) : (
          <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {exams
              .filter((e) => {
                const st = getStatus(e.id ?? "");
                if (!canManage) return st === "published";
                if (statusFilter !== "all" && st !== statusFilter) return false;
                if (scope === "teacher" && classFilter !== "all") {
                  if (!(e.classIds ?? []).includes(classFilter)) return false;
                }
                return true;
              })
              .map((exam) => {
              const id = exam.id ?? "";
              const status = getStatus(id);
              const isDraft = status === "draft";
              return (
                <div
                  key={id}
                  className={cn(
                    "group relative flex flex-col overflow-hidden rounded-3xl border border-border bg-surface shadow-soft transition hover:shadow-lg",
                  )}
                >
                  <Link
                    to={scope === "teacher" ? "/teacher/exams/$examId" : "/admin/exams/$examId"}
                    params={{ examId: id }}
                    className="flex flex-1 flex-col"
                  >

                    <div className="relative aspect-[16/9] w-full overflow-hidden bg-muted">
                      {exam.thumbnail ? (
                        <img
                          src={exam.thumbnail}
                          alt={exam.name}
                          className="h-full w-full object-cover transition group-hover:scale-105"
                        />
                      ) : (
                        <div
                          className="flex h-full w-full items-center justify-center text-primary-foreground"
                          style={{ background: "var(--gradient-brand)" }}
                        >
                          <ClipboardCheck className="h-10 w-10 opacity-80" />
                        </div>
                      )}
                      <div className="absolute left-3 top-3 flex flex-wrap items-center gap-1.5">
                        <span className="inline-flex items-center gap-1.5 rounded-lg bg-background/90 px-2 py-1 text-[11px] font-bold uppercase tracking-wider text-primary backdrop-blur">
                          {exam.levelCode}
                        </span>
                        <span
                          className={cn(
                            "inline-flex items-center gap-1 rounded-lg px-2 py-1 text-[11px] font-semibold backdrop-blur",
                            isDraft
                              ? "bg-amber-100/95 text-amber-800"
                              : "bg-emerald-100/95 text-emerald-800",
                          )}
                        >
                          {isDraft ? (
                            <FileEdit className="h-3 w-3" />
                          ) : (
                            <Send className="h-3 w-3" />
                          )}
                          {STATUS_LABEL[status]}
                        </span>
                      </div>
                      {canManage && (
                        <div className="absolute right-3 top-3 flex gap-1.5">
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              remove(id);
                            }}
                            className="rounded-lg bg-background/90 p-1.5 text-muted-foreground opacity-0 backdrop-blur transition hover:bg-destructive/10 hover:text-destructive group-hover:opacity-100"
                            aria-label="Xóa bài thi"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      )}
                    </div>
                    <div className="flex flex-1 flex-col p-5">
                      <h3 className="font-display text-lg font-semibold text-foreground line-clamp-1">
                        {exam.name || "Bài thi chưa đặt tên"}
                      </h3>
                      {exam.description && (
                        <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
                          {exam.description}
                        </p>
                      )}

                      <div className="mt-3 flex flex-wrap gap-1.5">
                        {exam.skills.map((s) => (
                          <span
                            key={s}
                            className="rounded-md bg-muted px-2 py-0.5 text-[11px] font-medium text-foreground"
                          >
                            {skillLabel(s)}
                          </span>
                        ))}
                      </div>

                      {scope === "teacher" && (exam.classIds?.length ?? 0) > 0 && (
                        <div className="mt-2 flex flex-wrap items-center gap-1.5">
                          <Users className="h-3 w-3 text-muted-foreground" />
                          {(exam.classIds ?? []).map((cid) => {
                            const c = teacherClasses.find((x) => x.id === cid);
                            return (
                              <span
                                key={cid}
                                className="rounded-md bg-primary/10 px-2 py-0.5 text-[11px] font-semibold text-primary"
                              >
                                {c?.name ?? cid}
                              </span>
                            );
                          })}
                        </div>
                      )}


                      <div className="mt-4 flex items-center gap-4 border-t border-border pt-3 text-xs text-muted-foreground">
                        <span className="inline-flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5" /> {exam.duration} phút
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <FileQuestion className="h-3.5 w-3.5" /> {exam.totalQuestions ?? 0} câu
                        </span>
                        <span className="ml-auto">
                          {new Date(exam.savedAt).toLocaleDateString("vi-VN")}
                        </span>
                      </div>
                    </div>
                  </Link>

                  <div className="flex flex-wrap gap-2 px-5 pb-5">
                    {canManage && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleTogglePublish(id, exam.name || "Bài thi chưa đặt tên");
                        }}
                        className={cn(
                          "inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl px-3 py-2 text-xs font-semibold transition",
                          isDraft
                            ? "bg-emerald-600 text-white hover:bg-emerald-700"
                            : "border border-border bg-background text-foreground hover:bg-muted",
                        )}
                        title={isDraft ? "Xuất bản cho học viên" : "Chuyển về bản nháp"}
                      >
                        {isDraft ? (
                          <>
                            <Send className="h-3.5 w-3.5" /> Xuất bản
                          </>
                        ) : (
                          <>
                            <FileEdit className="h-3.5 w-3.5" /> Bỏ xuất bản
                          </>
                        )}
                      </button>
                    )}
                    {canManage && (
                      <button
                        onClick={(e) => e.stopPropagation()}
                        className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-border bg-background px-3 py-2 text-xs font-semibold text-foreground hover:bg-muted"
                      >
                        <Pencil className="h-3.5 w-3.5" /> Sửa
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
          </>
        )}
      </div>
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: number;
}) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-border bg-surface p-4 shadow-soft">
      <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <div className="text-xs text-muted-foreground">{label}</div>
        <div className="font-display text-xl font-semibold text-foreground">{value}</div>
      </div>
    </div>
  );
}
