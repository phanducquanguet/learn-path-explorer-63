import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { TopNav } from "@/components/TopNav";
import { EXAM_SKILLS } from "@/lib/teacher-data";
import {
  ClipboardCheck,
  Plus,
  Sparkles,
  Clock,
  Layers,
  Trash2,
  FileQuestion,
  Pencil,
} from "lucide-react";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/teacher/exams")({
  head: () => ({ meta: [{ title: "Bài luyện thi — UNICOM LMS" }] }),
  component: ExamsList,
});

type SavedExam = {
  id?: string;
  name: string;
  levelCode: string;
  duration: number;
  description?: string;
  skills: string[];
  totalQuestions?: number;
  groups?: Record<string, { questions: unknown[] }>;
  savedAt: string;
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

function ExamsList() {
  const [exams, setExams] = useState<SavedExam[]>([]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const raw = window.localStorage.getItem("unicom.exams");
    if (!raw) {
      window.localStorage.setItem("unicom.exams", JSON.stringify(SEED));
      setExams(SEED);
    } else {
      try {
        setExams(JSON.parse(raw));
      } catch {
        setExams(SEED);
      }
    }
  }, []);

  const remove = (idx: number) => {
    const next = exams.filter((_, i) => i !== idx);
    setExams(next);
    if (typeof window !== "undefined") {
      window.localStorage.setItem("unicom.exams", JSON.stringify(next));
    }
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
              Bài luyện thi
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Danh sách các bài luyện thi đã tạo. Tạo mới để bổ sung vào kho bài thi.
            </p>
          </div>
          <Link
            to="/teacher/exams/new"
            className="inline-flex items-center gap-1.5 rounded-xl px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-soft"
            style={{ background: "var(--gradient-brand)" }}
          >
            <Plus className="h-4 w-4" /> Tạo bài thi mới
          </Link>
        </div>

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
            label="Cấp độ phủ"
            value={new Set(exams.map((e) => e.levelCode)).size}
          />
        </div>

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
            <Link
              to="/teacher/exams/new"
              className="mt-5 inline-flex items-center gap-1.5 rounded-xl px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-soft"
              style={{ background: "var(--gradient-brand)" }}
            >
              <Plus className="h-4 w-4" /> Tạo bài thi mới
            </Link>
          </div>
        ) : (
          <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {exams.map((exam, idx) => (
              <div
                key={exam.id ?? idx}
                className="group relative flex flex-col rounded-3xl border border-border bg-surface p-5 shadow-soft transition hover:shadow-lg"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="inline-flex items-center gap-1.5 rounded-lg bg-primary/10 px-2 py-1 text-[11px] font-bold uppercase tracking-wider text-primary">
                    {exam.levelCode}
                  </div>
                  <button
                    onClick={() => remove(idx)}
                    className="rounded-lg p-1.5 text-muted-foreground opacity-0 transition hover:bg-destructive/10 hover:text-destructive group-hover:opacity-100"
                    aria-label="Xóa bài thi"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>

                <h3 className="mt-3 font-display text-lg font-semibold text-foreground line-clamp-1">
                  {exam.name || "Bài thi chưa đặt tên"}
                </h3>
                {exam.description && (
                  <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
                    {exam.description}
                  </p>
                )}

                <div className="mt-4 flex flex-wrap gap-1.5">
                  {exam.skills.map((s) => (
                    <span
                      key={s}
                      className="rounded-md bg-muted px-2 py-0.5 text-[11px] font-medium text-foreground"
                    >
                      {skillLabel(s)}
                    </span>
                  ))}
                </div>

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

                <div className="mt-4 flex gap-2">
                  <button
                    className={cn(
                      "flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl border border-border bg-background px-3 py-2 text-xs font-semibold text-foreground hover:bg-muted",
                    )}
                  >
                    <Pencil className="h-3.5 w-3.5" /> Chỉnh sửa
                  </button>
                  <button className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl bg-foreground px-3 py-2 text-xs font-semibold text-background hover:opacity-90">
                    Xem trước
                  </button>
                </div>
              </div>
            ))}
          </div>
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
