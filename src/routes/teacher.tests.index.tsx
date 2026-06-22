import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { TopNav } from "@/components/TopNav";
import { useRole } from "@/contexts/RoleContext";
import {
  tests as seedTests,
  testSubmissions as seedSubmissions,
  type Test,
  type TestSubmission,
} from "@/lib/tests-data";
import { classes } from "@/lib/teacher-data";
import {
  ScrollText,
  Plus,
  Clock,
  CheckCircle2,
  Hourglass,
  GraduationCap,
  Sparkles,
  ClipboardCheck,
  FileEdit,
  Filter,
  Eye,
} from "lucide-react";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/teacher/tests/")({
  head: () => ({ meta: [{ title: "Chấm thi — UNICOM LMS" }] }),
  component: TestsList,
});

type ExamKind = "test" | "practice";

type Row = {
  submissionId: string;
  testId: string;
  testName: string;
  kind: ExamKind;
  level: string;
  studentName: string;
  studentClass: string;
  submittedAt?: string;
  durationMinutes?: number;
  autoScore: number;
  manualScore?: number;
  finalScore?: number;
  status: TestSubmission["status"];
};

// Một số bài làm "Luyện thi" để demo — bổ sung cho seed submissions hiện có
// (toàn bộ seedSubmissions là loại "Bài thi").
const PRACTICE_SUBMISSIONS: Row[] = [
  {
    submissionId: "ps-1",
    testId: "seed-1",
    testName: "B1 Mock Test 01",
    kind: "practice",
    level: "B1",
    studentName: "Trần Bảo Châu",
    studentClass: "B1 — Fastrack",
    submittedAt: new Date(Date.now() - 6 * 3600 * 1000).toISOString(),
    durationMinutes: 78,
    autoScore: 26,
    status: "needs-grading",
  },
  {
    submissionId: "ps-2",
    testId: "seed-2",
    testName: "A2 Reading Practice",
    kind: "practice",
    level: "A2",
    studentName: "Lê Quốc Khánh",
    studentClass: "A2 — Buổi tối",
    submittedAt: new Date(Date.now() - 26 * 3600 * 1000).toISOString(),
    durationMinutes: 38,
    autoScore: 14,
    manualScore: 4,
    finalScore: 18,
    status: "graded",
  },
  {
    submissionId: "ps-3",
    testId: "seed-3",
    testName: "Listening Mini Quiz",
    kind: "practice",
    level: "A1",
    studentName: "Phạm Thu Hà",
    studentClass: "A1 — Sáng thứ 7",
    submittedAt: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
    durationMinutes: 18,
    autoScore: 7,
    status: "auto-graded",
  },
];

function statusMeta(s: TestSubmission["status"]) {
  if (s === "needs-grading")
    return { label: "Cần chấm", icon: FileEdit, cls: "bg-amber-100 text-amber-700" };
  if (s === "in-progress")
    return { label: "Đang làm", icon: Hourglass, cls: "bg-blue-100 text-blue-700" };
  if (s === "auto-graded")
    return { label: "Đã chấm tự động", icon: Sparkles, cls: "bg-indigo-100 text-indigo-700" };
  return { label: "Đã chấm", icon: CheckCircle2, cls: "bg-emerald-100 text-emerald-700" };
}

function kindMeta(k: ExamKind) {
  return k === "test"
    ? { label: "Bài thi", cls: "bg-primary/10 text-primary ring-primary/20" }
    : { label: "Luyện thi", cls: "bg-emerald-500/10 text-emerald-700 ring-emerald-500/20" };
}

function rowsFromTests(): Row[] {
  const byId = new Map<string, Test>(seedTests.map((t) => [t.id, t]));
  return seedSubmissions.map((s) => {
    const t = byId.get(s.testId);
    return {
      submissionId: s.id,
      testId: s.testId,
      testName: t?.name ?? s.testId,
      kind: "test" as const,
      level: t?.level ?? "—",
      studentName: s.studentName,
      studentClass: s.studentClass,
      submittedAt: s.submittedAt,
      durationMinutes: s.durationMinutes,
      autoScore: s.autoScore,
      manualScore: s.manualScore,
      finalScore: s.finalScore,
      status: s.status,
    };
  });
}

function TestsList() {
  const { role } = useRole();
  const isAdmin = role === "admin";
  const [statusFilter, setStatusFilter] = useState<"need" | "all" | "graded">("need");
  const [kindFilter, setKindFilter] = useState<"all" | ExamKind>("all");
  const [classFilter, setClassFilter] = useState<string>("all");

  const rows: Row[] = useMemo(
    () => [...rowsFromTests(), ...PRACTICE_SUBMISSIONS],
    [],
  );

  const counts = useMemo(
    () => ({
      total: rows.length,
      need: rows.filter((r) => r.status === "needs-grading" || r.status === "auto-graded").length,
      graded: rows.filter((r) => r.status === "graded").length,
      test: rows.filter((r) => r.kind === "test").length,
      practice: rows.filter((r) => r.kind === "practice").length,
    }),
    [rows],
  );

  const classOptions = useMemo(() => {
    const set = new Set(rows.map((r) => r.studentClass));
    return Array.from(set);
  }, [rows]);

  const filtered = useMemo(() => {
    return rows.filter((r) => {
      if (statusFilter === "need" && !(r.status === "needs-grading" || r.status === "auto-graded"))
        return false;
      if (statusFilter === "graded" && r.status !== "graded") return false;
      if (kindFilter !== "all" && r.kind !== kindFilter) return false;
      if (classFilter !== "all" && r.studentClass !== classFilter) return false;
      return true;
    });
  }, [rows, statusFilter, kindFilter, classFilter]);

  return (
    <div className="min-h-screen bg-background">
      <TopNav />
      <div className="mx-auto max-w-7xl px-6 pb-20 pt-10 sm:px-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-primary">
              <ScrollText className="h-3.5 w-3.5" /> Khu vực chấm bài
            </span>
            <h1 className="mt-1 font-display text-3xl font-semibold tracking-tight sm:text-4xl">
              Chấm thi
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Danh sách bài làm của học viên từ các bài thi và bài luyện thi — chọn từng bài để
              chấm điểm tự luận hoặc rà soát kết quả.
            </p>
          </div>
          {isAdmin && (
            <Link
              to="/admin/tests/new"
              className="inline-flex items-center gap-1.5 rounded-xl px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-soft"
              style={{ background: "var(--gradient-brand)" }}
            >
              <Plus className="h-4 w-4" /> Tạo bài tập mới
            </Link>
          )}
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-4">
          <Stat label="Tổng bài làm" value={counts.total} />
          <Stat label="Cần chấm" value={counts.need} accent="amber" />
          <Stat label="Đã chấm" value={counts.graded} accent="emerald" />
          <Stat label="Bài thi / Luyện thi" value={`${counts.test} / ${counts.practice}`} />
        </div>

        {/* Toolbar filters */}
        <div className="mt-6 flex flex-wrap items-center gap-3 rounded-2xl border border-border bg-surface px-4 py-3">
          <div className="inline-flex items-center gap-2 text-xs font-semibold text-muted-foreground">
            <Filter className="h-3.5 w-3.5" /> Lọc:
          </div>

          <ChipGroup
            value={statusFilter}
            onChange={setStatusFilter}
            options={[
              { id: "need", label: `Cần chấm (${counts.need})` },
              { id: "graded", label: `Đã chấm (${counts.graded})` },
              { id: "all", label: `Tất cả (${counts.total})` },
            ]}
          />

          <div className="h-5 w-px bg-border" />

          <ChipGroup
            value={kindFilter}
            onChange={setKindFilter}
            options={[
              { id: "all", label: "Tất cả loại" },
              { id: "test", label: `Bài thi (${counts.test})` },
              { id: "practice", label: `Luyện thi (${counts.practice})` },
            ]}
          />

          <div className="h-5 w-px bg-border" />

          <div className="inline-flex items-center gap-2">
            <span className="text-xs font-semibold text-muted-foreground">Lớp:</span>
            <select
              value={classFilter}
              onChange={(e) => setClassFilter(e.target.value)}
              className="h-8 rounded-lg border border-border bg-background px-2 text-xs font-medium text-foreground outline-none focus:border-primary"
            >
              <option value="all">Tất cả lớp</option>
              {classOptions.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="mt-6 overflow-hidden rounded-2xl border border-border bg-surface shadow-soft">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/50 text-xs uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold">Học viên</th>
                  <th className="px-4 py-3 text-left font-semibold">Lớp</th>
                  <th className="px-4 py-3 text-left font-semibold">Bài làm</th>
                  <th className="px-4 py-3 text-left font-semibold">Loại</th>
                  <th className="px-4 py-3 text-left font-semibold">Trình độ</th>
                  <th className="px-4 py-3 text-left font-semibold">Nộp lúc</th>
                  <th className="px-4 py-3 text-right font-semibold">Điểm tự động</th>
                  <th className="px-4 py-3 text-right font-semibold">Điểm cuối</th>
                  <th className="px-4 py-3 text-left font-semibold">Trạng thái</th>
                  <th className="px-4 py-3 text-right font-semibold">Hành động</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map((r) => {
                  const m = statusMeta(r.status);
                  const Icon = m.icon;
                  const k = kindMeta(r.kind);
                  const isPractice = r.kind === "practice";
                  return (
                    <tr key={r.submissionId} className="transition hover:bg-muted/30">
                      <td className="px-4 py-3 font-medium text-foreground">{r.studentName}</td>
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center gap-1 rounded-md bg-muted px-2 py-0.5 text-[11px] font-medium">
                          <GraduationCap className="h-3 w-3" />
                          {r.studentClass}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-foreground">
                        <span className="line-clamp-1">{r.testName}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={cn(
                            "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold ring-1",
                            k.cls,
                          )}
                        >
                          {k.label}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="rounded-lg bg-primary/10 px-2 py-1 text-[11px] font-bold uppercase text-primary">
                          {r.level}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs text-muted-foreground" suppressHydrationWarning>
                        {r.submittedAt ? new Date(r.submittedAt).toLocaleString("vi-VN") : "—"}
                        {r.durationMinutes != null && (
                          <span className="ml-1 inline-flex items-center gap-1">
                            <Clock className="h-3 w-3" /> {r.durationMinutes}p
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right text-foreground">{r.autoScore}</td>
                      <td className="px-4 py-3 text-right font-semibold text-foreground">
                        {r.finalScore ?? "—"}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={cn(
                            "inline-flex items-center gap-1 rounded-full px-2 py-1 text-[11px] font-semibold",
                            m.cls,
                          )}
                        >
                          <Icon className="h-3 w-3" /> {m.label}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        {isPractice ? (
                          <button
                            disabled
                            title="Bài luyện thi đã chấm tự động"
                            className="inline-flex items-center gap-1 rounded-lg border border-border bg-background px-2.5 py-1 text-[11px] font-semibold text-muted-foreground"
                          >
                            <Eye className="h-3 w-3" /> Xem
                          </button>
                        ) : (
                          <Link
                            to="/teacher/tests/$testId"
                            params={{ testId: r.testId }}
                            className={cn(
                              "inline-flex items-center gap-1 rounded-lg border px-2.5 py-1 text-[11px] font-semibold transition",
                              r.status === "needs-grading"
                                ? "border-primary bg-primary text-primary-foreground hover:opacity-90"
                                : "border-border bg-background text-foreground hover:border-primary hover:text-primary",
                            )}
                          >
                            {r.status === "needs-grading" ? (
                              <>
                                <ClipboardCheck className="h-3 w-3" /> Chấm bài
                              </>
                            ) : (
                              <>
                                <Eye className="h-3 w-3" /> Chi tiết
                              </>
                            )}
                          </Link>
                        )}
                      </td>
                    </tr>
                  );
                })}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={10} className="px-4 py-12 text-center text-sm text-muted-foreground">
                      Không có bài làm nào khớp bộ lọc.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

function Stat({
  label,
  value,
  accent,
}: {
  label: string;
  value: number | string;
  accent?: "amber" | "emerald";
}) {
  return (
    <div className="rounded-2xl border border-border bg-surface p-4 shadow-soft">
      <div className="text-xs font-medium text-muted-foreground">{label}</div>
      <div
        className={cn(
          "mt-1 font-display text-2xl font-semibold tracking-tight",
          accent === "amber" && "text-amber-600",
          accent === "emerald" && "text-emerald-600",
          !accent && "text-foreground",
        )}
      >
        {value}
      </div>
    </div>
  );
}

function ChipGroup<T extends string>({
  value,
  onChange,
  options,
}: {
  value: T;
  onChange: (v: T) => void;
  options: { id: T; label: string }[];
}) {
  return (
    <div className="inline-flex items-center gap-1">
      {options.map((opt) => (
        <button
          key={opt.id}
          onClick={() => onChange(opt.id)}
          className={cn(
            "rounded-lg px-2.5 py-1 text-xs font-semibold transition",
            value === opt.id
              ? "bg-foreground text-background"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

// Giữ tham chiếu để tránh warning khi `classes` chưa dùng ở các nhánh khác.
void classes;
