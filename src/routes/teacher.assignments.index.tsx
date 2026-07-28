import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, useSyncExternalStore } from "react";
import { TopNav } from "@/components/TopNav";
import {
  listAssignments,
  createAssignment,
  subscribeAssignments,
  listSubmissions,
  deleteAssignment,
  type Assignment,
} from "@/lib/assignments";
import { classes } from "@/lib/teacher-data";
import { ClipboardList, Plus, Calendar, Users, Trash2, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/teacher/assignments/")({
  head: () => ({ meta: [{ title: "Bài giao (Assignment) — UNICOM LMS" }] }),
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

  return (
    <div className="min-h-screen bg-background">
      <TopNav />
      <div className="mx-auto max-w-6xl px-6 pb-20 pt-10 sm:px-8">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="font-display text-3xl font-semibold tracking-tight">
              Bài giao (Assignment)
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Ra đề tự luận cho học viên, học viên nộp câu trả lời hoặc file — giáo viên chấm điểm.
            </p>
          </div>
          <button
            onClick={() => setOpen(true)}
            className="inline-flex items-center gap-1.5 rounded-xl bg-foreground px-4 py-2 text-sm font-semibold text-background hover:opacity-90"
          >
            <Plus className="h-4 w-4" /> Tạo bài giao
          </button>
        </div>

        <div className="mt-6 grid gap-3">
          {items.map((a) => (
            <AssignmentRow key={a.id} a={a} />
          ))}
          {items.length === 0 && (
            <div className="rounded-2xl border border-dashed border-border bg-surface p-10 text-center text-sm text-muted-foreground">
              Chưa có bài giao nào. Bấm "Tạo bài giao" để bắt đầu.
            </div>
          )}
        </div>
      </div>

      {open && <CreateAssignmentDialog onClose={() => setOpen(false)} />}
    </div>
  );
}

function AssignmentRow({ a }: { a: Assignment }) {
  const subs = listSubmissions(a.id);
  const graded = subs.filter((s) => s.score !== undefined).length;
  const pending = subs.length - graded;
  const cls = classes.filter((c) => a.classIds.includes(c.id));
  const overdue = new Date(a.dueAt).getTime() < Date.now();

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
        <div className="truncate font-semibold text-foreground">{a.title}</div>
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
          if (confirm(`Xoá bài giao "${a.title}"?`)) deleteAssignment(a.id);
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
  const [classIds, setClassIds] = useState<string[]>(classes[0] ? [classes[0].id] : []);
  const toggleClass = (id: string) =>
    setClassIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));

  const [dueAt, setDueAt] = useState(() => {
    const d = new Date(Date.now() + 3 * 24 * 3600 * 1000);
    d.setSeconds(0, 0);
    return d.toISOString().slice(0, 16);
  });
  const [maxScore, setMaxScore] = useState(10);
  const [allowText, setAllowText] = useState(true);
  const [allowFile, setAllowFile] = useState(true);

  const submit = () => {
    if (!title.trim() || !description.trim() || classIds.length === 0) return;
    const a = createAssignment({
      title: title.trim(),
      description: description.trim(),
      classIds,
      dueAt: new Date(dueAt).toISOString(),
      maxScore,
      allowText,
      allowFile: allowFile || !allowText,
      createdBy: "Cô Mai Lan",
    });
    onClose();
    navigate({ to: "/teacher/assignments/$assignmentId", params: { assignmentId: a.id } });
  };


  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <button className="absolute inset-0" onClick={onClose} aria-label="Close" />
      <div className="relative w-full max-w-2xl overflow-hidden rounded-2xl bg-background shadow-elevated">
        <div className="border-b border-border p-5">
          <h2 className="font-display text-lg font-semibold">Tạo bài giao mới</h2>
          <p className="text-xs text-muted-foreground">
            Nhập đề bài dạng văn bản. Học viên sẽ thấy nội dung này và nộp bài.
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
          <div className="grid gap-4 sm:grid-cols-2">
          <Field label={`Lớp giao bài (${classIds.length} đã chọn)`}>
            <div className="max-h-40 overflow-y-auto rounded-lg border border-border bg-background p-2">
              {classes.map((c) => {
                const checked = classIds.includes(c.id);
                return (
                  <label
                    key={c.id}
                    className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-muted"
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleClass(c.id)}
                    />
                    <span className="flex-1">{c.name}</span>
                  </label>
                );
              })}
              {classes.length === 0 && (
                <div className="p-2 text-xs text-muted-foreground">Chưa có lớp nào.</div>
              )}
            </div>
            <div className="mt-1.5 flex gap-2 text-[11px]">
              <button
                type="button"
                onClick={() => setClassIds(classes.map((c) => c.id))}
                className="text-primary hover:underline"
              >
                Chọn tất cả
              </button>
              <button
                type="button"
                onClick={() => setClassIds([])}
                className="text-muted-foreground hover:underline"
              >
                Bỏ chọn
              </button>
            </div>
          </Field>

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
            disabled={!title.trim() || !description.trim()}
            className="rounded-lg bg-foreground px-4 py-2 text-sm font-semibold text-background hover:opacity-90 disabled:opacity-50"
          >
            Tạo & giao bài
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
