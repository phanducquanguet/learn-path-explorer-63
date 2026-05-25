import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { TopNav } from "@/components/TopNav";
import { EXAM_SKILLS, classes as allClasses } from "@/lib/teacher-data";
import { orgs, classOrgMap, getOrg } from "@/lib/orgs";
import { useRole } from "@/contexts/RoleContext";
import {
  ClipboardCheck,
  Plus,
  Sparkles,
  Clock,
  Layers,
  Trash2,
  FileQuestion,
  Pencil,
  Eye,
  MessageSquare,
  Copy,
  Building2,
  X,
  CheckCircle2,
  CheckSquare,
  Square,
} from "lucide-react";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/admin/exams/")({
  head: () => ({ meta: [{ title: "Bài luyện thi — UNICOM LMS" }] }),
  component: ExamsList,
});

type SavedExam = {
  id?: string;
  name: string;
  levelCode: string;
  duration: number;
  description?: string;
  thumbnail?: string;
  skills: string[];
  totalQuestions?: number;
  groups?: Record<string, { questions: unknown[] }>;
  savedAt: string;
  orgId?: string;
  classIds?: string[];
  copiedFromId?: string;
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
    orgId: "org-unicom-hn",
    classIds: ["cls-a1-morning"],
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
    orgId: "org-unicom-hcm",
    classIds: ["cls-a2-weekend", "cls-b1-fast"],
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
    orgId: "org-thpt-abc",
    classIds: ["cls-b1-evening"],
  },
];

const classNameById = (id: string) =>
  allClasses.find((c) => c.id === id)?.name ?? id;

function ExamsList() {
  const { role } = useRole();
  const isAdmin = role === "admin";
  const [exams, setExams] = useState<SavedExam[]>([]);
  const [orgFilter, setOrgFilter] = useState<string>("all");
  const [selected, setSelected] = useState<string[]>([]);
  const [copyTarget, setCopyTarget] = useState<SavedExam[] | null>(null);

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

  const persist = (next: SavedExam[]) => {
    setExams(next);
    if (typeof window !== "undefined") {
      window.localStorage.setItem("unicom.exams", JSON.stringify(next));
    }
  };

  const remove = (id: string) => {
    persist(exams.filter((e) => e.id !== id));
    setSelected((s) => s.filter((x) => x !== id));
  };

  const filtered = useMemo(
    () => (orgFilter === "all" ? exams : exams.filter((e) => e.orgId === orgFilter)),
    [exams, orgFilter],
  );

  const toggleSelect = (id: string) =>
    setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));

  const openBulkCopy = () => {
    const list = exams.filter((e) => e.id && selected.includes(e.id));
    if (list.length > 0) setCopyTarget(list);
  };

  const performCopy = (
    sources: SavedExam[],
    targetOrgId: string,
    targetClassIds: string[],
  ) => {
    const stamp = Date.now();
    const clones: SavedExam[] = sources.map((src, i) => ({
      ...src,
      id: `exam-${stamp}-${i}`,
      name: `${src.name} (Bản sao)`,
      orgId: targetOrgId,
      classIds: targetClassIds,
      copiedFromId: src.id,
      savedAt: new Date().toISOString(),
    }));
    persist([...clones, ...exams]);
    setCopyTarget(null);
    setSelected([]);
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
              Mỗi bài thi gắn với 1 đơn vị và nhiều lớp. Có thể sao chép sang đơn vị khác để tái sử dụng.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Link
              to="/teacher/qa"
              className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-surface px-3.5 py-2 text-sm font-semibold text-foreground hover:bg-muted"
            >
              <MessageSquare className="h-4 w-4" /> Hỏi đáp học viên
            </Link>
            {isAdmin && (
              <Link
                to="/admin/exams/new"
                className="inline-flex items-center gap-1.5 rounded-xl px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-soft"
                style={{ background: "var(--gradient-brand)" }}
              >
                <Plus className="h-4 w-4" /> Tạo bài thi mới
              </Link>
            )}
          </div>
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
            icon={Building2}
            label="Đơn vị có bài thi"
            value={new Set(exams.map((e) => e.orgId).filter(Boolean)).size}
          />
        </div>

        {/* Toolbar: filter + bulk actions */}
        <div className="mt-6 flex flex-wrap items-center gap-2 rounded-2xl border border-border bg-surface px-4 py-3">
          <div className="inline-flex items-center gap-2 text-xs font-semibold text-muted-foreground">
            <Building2 className="h-3.5 w-3.5" /> Đơn vị:
          </div>
          <button
            onClick={() => setOrgFilter("all")}
            className={cn(
              "rounded-lg px-2.5 py-1 text-xs font-semibold transition",
              orgFilter === "all"
                ? "bg-foreground text-background"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            Tất cả ({exams.length})
          </button>
          {orgs.map((o) => {
            const count = exams.filter((e) => e.orgId === o.id).length;
            return (
              <button
                key={o.id}
                onClick={() => setOrgFilter(o.id)}
                className={cn(
                  "rounded-lg px-2.5 py-1 text-xs font-semibold transition",
                  orgFilter === o.id
                    ? "bg-foreground text-background"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {o.shortName} ({count})
              </button>
            );
          })}
          {isAdmin && selected.length > 0 && (
            <div className="ml-auto flex items-center gap-2">
              <span className="text-xs text-muted-foreground">
                Đã chọn <b className="text-foreground">{selected.length}</b> bài
              </span>
              <button
                onClick={openBulkCopy}
                className="inline-flex items-center gap-1.5 rounded-xl bg-foreground px-3 py-1.5 text-xs font-semibold text-background hover:opacity-90"
              >
                <Copy className="h-3.5 w-3.5" /> Sao chép sang đơn vị
              </button>
              <button
                onClick={() => setSelected([])}
                className="rounded-xl border border-border bg-background p-1.5 text-muted-foreground hover:text-foreground"
                aria-label="Bỏ chọn"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          )}
        </div>

        {/* List */}
        {filtered.length === 0 ? (
          <div className="mt-8 rounded-3xl border border-dashed border-border bg-surface/40 p-16 text-center">
            <ClipboardCheck className="mx-auto h-10 w-10 text-muted-foreground" />
            <div className="mt-3 font-display text-lg font-semibold text-foreground">
              Chưa có bài thi nào
            </div>
            <p className="mt-1 text-sm text-muted-foreground">
              {orgFilter === "all"
                ? "Tạo bài thi đầu tiên để học viên bắt đầu luyện tập."
                : "Đơn vị này chưa có bài thi. Hãy tạo mới hoặc sao chép từ đơn vị khác."}
            </p>
          </div>
        ) : (
          <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {filtered.map((exam) => {
              const id = exam.id ?? "";
              const isSelected = selected.includes(id);
              const org = getOrg(exam.orgId);
              return (
                <div
                  key={id}
                  className={cn(
                    "group relative flex flex-col overflow-hidden rounded-3xl border bg-surface shadow-soft transition hover:shadow-lg",
                    isSelected ? "border-primary ring-2 ring-primary/30" : "border-border",
                  )}
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
                    <div className="absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-lg bg-background/90 px-2 py-1 text-[11px] font-bold uppercase tracking-wider text-primary backdrop-blur">
                      {exam.levelCode}
                    </div>
                    {isAdmin && (
                      <div className="absolute right-3 top-3 flex gap-1.5">
                        <button
                          onClick={() => toggleSelect(id)}
                          className="rounded-lg bg-background/90 p-1.5 text-foreground backdrop-blur transition hover:bg-background"
                          aria-label="Chọn để sao chép"
                          title="Chọn để sao chép hàng loạt"
                        >
                          {isSelected ? (
                            <CheckSquare className="h-4 w-4 text-primary" />
                          ) : (
                            <Square className="h-4 w-4" />
                          )}
                        </button>
                        <button
                          onClick={() => remove(id)}
                          className="rounded-lg bg-background/90 p-1.5 text-muted-foreground opacity-0 backdrop-blur transition hover:bg-destructive/10 hover:text-destructive group-hover:opacity-100"
                          aria-label="Xóa bài thi"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    )}
                  </div>
                  <div className="flex flex-1 flex-col p-5">
                    {org && (
                      <div className="inline-flex w-fit items-center gap-1 rounded-md bg-primary/10 px-2 py-0.5 text-[11px] font-semibold text-primary">
                        <Building2 className="h-3 w-3" /> {org.shortName}
                      </div>
                    )}

                    <h3 className="mt-2 font-display text-lg font-semibold text-foreground line-clamp-1">
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

                    {exam.classIds && exam.classIds.length > 0 && (
                      <div className="mt-3 text-[11px] text-muted-foreground">
                        <span className="font-semibold text-foreground">Lớp:</span>{" "}
                        {exam.classIds.map(classNameById).join(", ")}
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

                    <div className="mt-4 flex flex-wrap gap-2">
                      <Link
                        to="/admin/exams/$examId"
                        params={{ examId: id }}
                        className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl border border-border bg-background px-3 py-2 text-xs font-semibold text-foreground hover:bg-muted"
                      >
                        <FileQuestion className="h-3.5 w-3.5" /> Xem câu hỏi
                      </Link>
                      <Link
                        to="/admin/exams/$examId/submissions"
                        params={{ examId: id }}
                        className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl bg-foreground px-3 py-2 text-xs font-semibold text-background hover:opacity-90"
                      >
                        <Eye className="h-3.5 w-3.5" /> Xem bài làm
                      </Link>
                      {isAdmin && (
                        <>
                          <button
                            onClick={() => setCopyTarget([exam])}
                            className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-border bg-background px-3 py-2 text-xs font-semibold text-foreground hover:bg-muted"
                            title="Sao chép sang đơn vị khác"
                          >
                            <Copy className="h-3.5 w-3.5" /> Sao chép
                          </button>
                          <button
                            className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-border bg-background px-3 py-2 text-xs font-semibold text-foreground hover:bg-muted"
                          >
                            <Pencil className="h-3.5 w-3.5" /> Sửa
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {copyTarget && (
        <CopyDialog
          sources={copyTarget}
          onClose={() => setCopyTarget(null)}
          onConfirm={performCopy}
        />
      )}
    </div>
  );
}

function CopyDialog({
  sources,
  onClose,
  onConfirm,
}: {
  sources: SavedExam[];
  onClose: () => void;
  onConfirm: (sources: SavedExam[], orgId: string, classIds: string[]) => void;
}) {
  const sourceOrgIds = new Set(sources.map((s) => s.orgId).filter(Boolean));
  const defaultTarget =
    orgs.find((o) => !sourceOrgIds.has(o.id))?.id ?? orgs[0]?.id ?? "";
  const [orgId, setOrgId] = useState(defaultTarget);
  const [classIds, setClassIds] = useState<string[]>([]);

  const classesInOrg = allClasses.filter((c) => classOrgMap[c.id] === orgId);
  const allSelected =
    classesInOrg.length > 0 && classesInOrg.every((c) => classIds.includes(c.id));

  const toggle = (id: string) =>
    setClassIds((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/40 p-4">
      <div className="w-full max-w-2xl overflow-hidden rounded-3xl border border-border bg-surface shadow-2xl">
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <div>
            <h2 className="font-display text-lg font-semibold text-foreground">
              Sao chép {sources.length} bài thi sang đơn vị khác
            </h2>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Bản sao giữ nguyên nội dung câu hỏi, được gán cho đơn vị và lớp đích.
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
            aria-label="Đóng"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-5 p-6">
          <div>
            <div className="mb-1.5 text-xs font-semibold text-foreground">
              Bài thi nguồn
            </div>
            <div className="flex flex-wrap gap-1.5">
              {sources.map((s) => (
                <span
                  key={s.id}
                  className="rounded-lg border border-border bg-background px-2.5 py-1 text-xs text-foreground"
                >
                  {s.name}
                  {s.orgId && (
                    <span className="ml-1.5 text-[10px] text-muted-foreground">
                      ({getOrg(s.orgId)?.shortName})
                    </span>
                  )}
                </span>
              ))}
            </div>
          </div>

          <div>
            <div className="mb-1.5 text-xs font-semibold text-foreground">
              Đơn vị đích
            </div>
            <select
              value={orgId}
              onChange={(e) => {
                setOrgId(e.target.value);
                setClassIds([]);
              }}
              className="h-10 w-full rounded-xl border border-border bg-background px-3 text-sm text-foreground outline-none focus:border-primary"
            >
              {orgs.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <div className="mb-1.5 flex items-center justify-between">
              <div className="text-xs font-semibold text-foreground">
                Gán cho lớp ({classIds.length}/{classesInOrg.length})
              </div>
              {classesInOrg.length > 0 && (
                <button
                  type="button"
                  onClick={() =>
                    setClassIds(allSelected ? [] : classesInOrg.map((c) => c.id))
                  }
                  className="text-[11px] font-semibold text-primary hover:underline"
                >
                  {allSelected ? "Bỏ chọn tất cả" : "Chọn tất cả"}
                </button>
              )}
            </div>
            {classesInOrg.length === 0 ? (
              <div className="rounded-xl border border-dashed border-border bg-muted/30 p-4 text-center text-xs text-muted-foreground">
                Đơn vị này chưa có lớp. Bài thi vẫn được sao chép và có thể gán lớp sau.
              </div>
            ) : (
              <div className="flex flex-wrap gap-2">
                {classesInOrg.map((c) => {
                  const active = classIds.includes(c.id);
                  return (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => toggle(c.id)}
                      className={cn(
                        "inline-flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-semibold transition",
                        active
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border bg-background text-muted-foreground hover:text-foreground",
                      )}
                    >
                      <span
                        className={cn(
                          "inline-flex h-4 w-4 items-center justify-center rounded border",
                          active
                            ? "border-primary bg-primary text-primary-foreground"
                            : "border-border",
                        )}
                      >
                        {active && <CheckCircle2 className="h-3 w-3" />}
                      </span>
                      {c.name}
                      <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground">
                        {c.levelCode}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 border-t border-border bg-muted/30 px-6 py-4">
          <button
            onClick={onClose}
            className="rounded-xl border border-border bg-background px-4 py-2 text-sm font-semibold text-foreground hover:bg-muted"
          >
            Hủy
          </button>
          <button
            onClick={() => onConfirm(sources, orgId, classIds)}
            className="inline-flex items-center gap-1.5 rounded-xl bg-foreground px-4 py-2 text-sm font-semibold text-background hover:opacity-90"
          >
            <Copy className="h-4 w-4" /> Sao chép {sources.length} bài
          </button>
        </div>
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
