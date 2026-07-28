import { createFileRoute, Link } from "@tanstack/react-router";
import { useSyncExternalStore } from "react";
import { TopNav } from "@/components/TopNav";
import {
  listAssignmentsForCurrentStudent,
  subscribeAssignments,
  getSubmissionForStudent,
  getEffectiveDueAt,
  CURRENT_STUDENT,
  type Assignment,
} from "@/lib/assignments";
import { ClipboardList, Calendar, CheckCircle2, AlertCircle, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/assignments/")({
  head: () => ({ meta: [{ title: "Bài giao — UNICOM LMS" }] }),
  component: StudentAssignmentsPage,
});

function useList() {
  return useSyncExternalStore(
    (cb) => {
      const un = subscribeAssignments(cb);
      return () => un();
    },
    () => listAssignmentsForCurrentStudent(),
    () => listAssignmentsForCurrentStudent(),
  );
}

function StudentAssignmentsPage() {
  const items = useList();
  return (
    <div className="min-h-screen bg-background">
      <TopNav />
      <div className="mx-auto max-w-4xl px-6 pb-20 pt-10 sm:px-8">
        <h1 className="font-display text-3xl font-semibold tracking-tight">Bài giao</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Bài tập tự luận do giáo viên giao. Nộp bằng câu trả lời hoặc file đính kèm.
        </p>
        <div className="mt-6 grid gap-3">
          {items.map((a) => (
            <Row key={a.id} a={a} />
          ))}
          {items.length === 0 && (
            <div className="rounded-2xl border border-dashed border-border bg-surface p-10 text-center text-sm text-muted-foreground">
              Hiện chưa có bài giao nào.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Row({ a }: { a: Assignment }) {
  const sub = getSubmissionForStudent(a.id, CURRENT_STUDENT.id);
  const overdue = new Date(a.dueAt).getTime() < Date.now();
  const status = sub?.score !== undefined ? "graded" : sub ? "submitted" : "todo";
  return (
    <Link
      to="/assignments/$assignmentId"
      params={{ assignmentId: a.id }}
      className="group flex items-center gap-4 rounded-2xl border border-border bg-surface p-4 shadow-soft hover:border-primary/40"
    >
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
        <ClipboardList className="h-5 w-5" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="truncate font-semibold text-foreground">{a.title}</div>
        <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
          <span className={cn("inline-flex items-center gap-1", overdue && status === "todo" && "text-rose-600")}>
            <Calendar className="h-3 w-3" /> Hạn:{" "}
            {new Date(a.dueAt).toLocaleString("vi-VN", { timeZone: "Asia/Ho_Chi_Minh" })}
          </span>
          <span>Thang điểm: {a.maxScore}</span>
        </div>
      </div>
      <div className="text-right">
        {status === "graded" ? (
          <div className="text-sm">
            <div className="font-bold text-primary">
              {sub!.score}/{a.maxScore}
            </div>
            <div className="text-[11px] text-emerald-700">Đã chấm</div>
          </div>
        ) : status === "submitted" ? (
          <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-semibold text-amber-700">
            <AlertCircle className="h-3 w-3" /> Chờ chấm
          </span>
        ) : (
          <span
            className={cn(
              "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold",
              overdue ? "bg-rose-100 text-rose-700" : "bg-primary/10 text-primary",
            )}
          >
            {overdue ? "Quá hạn" : "Cần làm"}
          </span>
        )}
      </div>
      <ArrowRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
    </Link>
  );
}
