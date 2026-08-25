import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { TopNav } from "@/components/TopNav";
import { PageHeader } from "@/components/PageHeader";
import { useRole } from "@/contexts/RoleContext";
import {
  tests as seedTests,
  testSubmissions as seedSubmissions,
  testStatus,
  testTotalPoints,
  type Test,
} from "@/lib/tests-data";
import { classes } from "@/lib/teacher-data";
import {
  ScrollText,
  Clock,
  CheckCircle2,
  GraduationCap,
  ClipboardCheck,
  FileEdit,
  Search,
  Eye,
  Users,
  Layers,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/teacher/tests/")({
  head: () => ({
    meta: [
      { title: "Chấm thi — UNICOM LMS" },
      {
        name: "description",
        content:
          "Danh sách bài thi cần chấm: theo dõi số học viên đã nộp, tiến độ chấm và mở chi tiết để chấm từng bài làm.",
      },
      { property: "og:title", content: "Chấm thi — UNICOM LMS" },
      {
        property: "og:description",
        content: "Theo dõi tiến độ chấm thi theo từng đề và từng lớp.",
      },
    ],
  }),
  component: GradingList,
});

type GradeStatus = "not-started" | "in-progress" | "done";

type ExamRow = {
  test: Test;
  code: string;
  classNames: string[];
  registered: number;
  submitted: number;
  needGrading: number;
  graded: number;
  gradeStatus: GradeStatus;
  progress: number;
  avgScore?: number;
};

const GRADE_META: Record<GradeStatus, { label: string; cls: string }> = {
  "not-started": { label: "Chưa chấm", cls: "bg-amber-100 text-amber-700" },
  "in-progress": { label: "Đang chấm", cls: "bg-blue-100 text-blue-700" },
  done: { label: "Đã chấm xong", cls: "bg-emerald-100 text-emerald-700" },
};

function buildRows(): ExamRow[] {
  return seedTests
    .filter((t) => (t.approvalStatus ?? "approved") === "approved")
    .map((t) => {
      const subs = seedSubmissions.filter((s) => s.testId === t.id);
      const submitted = subs.filter((s) => s.status !== "in-progress").length || t.submitted;
      const graded = subs.filter((s) => s.status === "graded").length || t.graded;
      const needGrading =
        subs.filter((s) => s.status === "needs-grading" || s.status === "auto-graded").length ||
        Math.max(0, submitted - graded);
      const gradeStatus: GradeStatus =
        submitted === 0 || graded === 0 ? "not-started" : needGrading === 0 ? "done" : "in-progress";
      const scored = subs.filter((s) => s.finalScore != null);
      return {
        test: t,
        code: t.code ?? t.id.toUpperCase(),
        classNames: t.classIds.map((id) => classes.find((c) => c.id === id)?.name ?? id),
        registered: t.registered,
        submitted,
        graded,
        needGrading,
        gradeStatus,
        progress: submitted === 0 ? 0 : Math.round((graded / submitted) * 100),
        avgScore:
          t.avgScore ??
          (scored.length
            ? Math.round((scored.reduce((s, x) => s + (x.finalScore ?? 0), 0) / scored.length) * 10) / 10
            : undefined),
      };
    })
    .sort((a, b) => b.needGrading - a.needGrading);
}

function GradingList() {
  const { role } = useRole();
  const base = role === "admin" ? "/admin" : "/teacher";
  const [q, setQ] = useState("");
  const [gradeFilter, setGradeFilter] = useState<"all" | GradeStatus>("all");
  const [levelFilter, setLevelFilter] = useState("all");
  const [classFilter, setClassFilter] = useState("all");

  const rows = useMemo(() => buildRows(), []);

  const levels = useMemo(() => Array.from(new Set(rows.map((r) => r.test.level))), [rows]);
  const classOptions = useMemo(
    () => Array.from(new Set(rows.flatMap((r) => r.classNames))),
    [rows],
  );

  const counts = useMemo(
    () => ({
      exams: rows.length,
      submitted: rows.reduce((s, r) => s + r.submitted, 0),
      need: rows.reduce((s, r) => s + r.needGrading, 0),
      graded: rows.reduce((s, r) => s + r.graded, 0),
    }),
    [rows],
  );

  const filtered = useMemo(() => {
    const kw = q.trim().toLowerCase();
    return rows.filter((r) => {
      if (kw && !`${r.test.name} ${r.code}`.toLowerCase().includes(kw)) return false;
      if (gradeFilter !== "all" && r.gradeStatus !== gradeFilter) return false;
      if (levelFilter !== "all" && r.test.level !== levelFilter) return false;
      if (classFilter !== "all" && !r.classNames.includes(classFilter)) return false;
      return true;
    });
  }, [rows, q, gradeFilter, levelFilter, classFilter]);

  return (
    <div className="min-h-screen bg-background">
      <TopNav />
      <div className="mx-auto max-w-7xl px-6 pb-20 pt-10 sm:px-8">
        <PageHeader
          eyebrow="Khu vực chấm bài"
          eyebrowIcon={ScrollText}
          title="Chấm thi"
          description="Danh sách các bài thi đã tổ chức — nhấn vào từng bài thi để xem chi tiết bài làm của học viên và chấm điểm."
          stats={[
            { icon: Layers, label: "Bài thi", value: counts.exams, tone: "primary" },
            { icon: Users, label: "Lượt nộp", value: counts.submitted },
            { icon: FileEdit, label: "Cần chấm", value: counts.need, tone: "warning" },
            { icon: CheckCircle2, label: "Đã chấm", value: counts.graded, tone: "success" },
          ]}
        />

        {/* Toolbar: tìm kiếm + bộ lọc */}
        <div className="mt-6 flex flex-wrap items-center gap-3 rounded-2xl border border-border bg-surface px-4 py-3 shadow-soft">
          <div className="relative min-w-[220px] flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Tìm theo tên đề hoặc mã đề..."
              className="h-9 w-full rounded-xl border border-border bg-background pl-9 pr-3 text-sm outline-none focus:border-primary"
            />
          </div>

          <Select
            value={gradeFilter}
            onChange={(v) => setGradeFilter(v as typeof gradeFilter)}
            options={[
              { value: "all", label: "Tất cả trạng thái" },
              { value: "not-started", label: "Chưa chấm" },
              { value: "in-progress", label: "Đang chấm" },
              { value: "done", label: "Đã chấm xong" },
            ]}
          />
          <Select
            value={levelFilter}
            onChange={setLevelFilter}
            options={[
              { value: "all", label: "Tất cả trình độ" },
              ...levels.map((l) => ({ value: l, label: l })),
            ]}
          />
          <Select
            value={classFilter}
            onChange={setClassFilter}
            options={[
              { value: "all", label: "Tất cả lớp" },
              ...classOptions.map((c) => ({ value: c, label: c })),
            ]}
          />
        </div>

        {/* Bảng danh sách bài thi */}
        <div className="mt-6 overflow-hidden rounded-2xl border border-border bg-surface shadow-soft">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/50 text-xs uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold">Mã</th>
                  <th className="px-4 py-3 text-left font-semibold">Đề thi</th>
                  <th className="px-4 py-3 text-left font-semibold">Lớp</th>
                  <th className="px-4 py-3 text-left font-semibold">Trình độ</th>
                  <th className="px-4 py-3 text-left font-semibold">Đóng đề</th>
                  <th className="px-4 py-3 text-right font-semibold">Đã nộp</th>
                  <th className="px-4 py-3 text-right font-semibold">Cần chấm</th>
                  <th className="px-4 py-3 text-left font-semibold">Tiến độ chấm</th>
                  <th className="px-4 py-3 text-right font-semibold">Điểm TB</th>
                  <th className="px-4 py-3 text-left font-semibold">Trạng thái</th>
                  <th className="px-4 py-3 text-right font-semibold">Hành động</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map((r) => {
                  const gm = GRADE_META[r.gradeStatus];
                  const st = testStatus(r.test);
                  return (
                    <tr key={r.test.id} className="transition hover:bg-muted/30">
                      <td className="px-4 py-3">
                        <span className="rounded-md bg-muted px-2 py-0.5 font-mono text-[11px] font-semibold text-foreground">
                          {r.code}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <Link
                          to="/teacher/tests/$testId"
                          params={{ testId: r.test.id }}
                          className="font-medium text-foreground hover:text-primary"
                        >
                          {r.test.name}
                        </Link>
                        <div className="text-[11px] text-muted-foreground">
                          {r.test.durationMinutes} phút · {testTotalPoints(r.test)} điểm
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-1">
                          {r.classNames.slice(0, 2).map((c) => (
                            <span
                              key={c}
                              className="inline-flex items-center gap-1 rounded-md bg-muted px-2 py-0.5 text-[11px] font-medium"
                            >
                              <GraduationCap className="h-3 w-3" />
                              {c}
                            </span>
                          ))}
                          {r.classNames.length > 2 && (
                            <span className="rounded-md bg-muted px-2 py-0.5 text-[11px] font-medium">
                              +{r.classNames.length - 2}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="rounded-lg bg-primary/10 px-2 py-1 text-[11px] font-bold uppercase text-primary">
                          {r.test.level}
                        </span>
                      </td>
                      <td
                        className="px-4 py-3 text-xs text-muted-foreground"
                        suppressHydrationWarning
                      >
                        <span className="inline-flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {new Date(r.test.closeAt).toLocaleDateString("vi-VN")}
                        </span>
                        <div className="text-[11px]">
                          {st === "open" ? "Đang mở" : st === "upcoming" ? "Sắp diễn ra" : "Đã đóng"}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right text-foreground">
                        {r.submitted}
                        <span className="text-muted-foreground">/{r.registered}</span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span
                          className={cn(
                            "font-semibold",
                            r.needGrading > 0 ? "text-amber-600" : "text-muted-foreground",
                          )}
                        >
                          {r.needGrading}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="h-1.5 w-24 overflow-hidden rounded-full bg-muted">
                            <div
                              className="h-full rounded-full bg-emerald-500"
                              style={{ width: `${r.progress}%` }}
                            />
                          </div>
                          <span className="text-[11px] font-medium text-muted-foreground">
                            {r.graded}/{r.submitted}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right font-semibold text-foreground">
                        {r.avgScore ?? "—"}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={cn(
                            "inline-flex items-center gap-1 rounded-full px-2 py-1 text-[11px] font-semibold",
                            gm.cls,
                          )}
                        >
                          {gm.label}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Link
                          to="/teacher/tests/$testId"
                          params={{ testId: r.test.id }}
                          className={cn(
                            "inline-flex items-center gap-1 rounded-lg border px-2.5 py-1 text-[11px] font-semibold transition",
                            r.needGrading > 0
                              ? "border-primary bg-primary text-primary-foreground hover:opacity-90"
                              : "border-border bg-background text-foreground hover:border-primary hover:text-primary",
                          )}
                        >
                          {r.needGrading > 0 ? (
                            <>
                              <ClipboardCheck className="h-3 w-3" /> Chấm bài
                            </>
                          ) : (
                            <>
                              <Eye className="h-3 w-3" /> Chi tiết
                            </>
                          )}
                          <ChevronRight className="h-3 w-3" />
                        </Link>
                      </td>
                    </tr>
                  );
                })}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={11} className="px-4 py-12 text-center text-sm text-muted-foreground">
                      Không có bài thi nào khớp bộ lọc.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <p className="mt-3 text-xs text-muted-foreground">
          Mẹo: mở chi tiết bài thi → tab “Kết quả thi” để chấm từng bài làm, xem điểm tự động và
          nhận xét theo từng câu.
          {base === "/admin" && " Quản trị viên có thể công bố điểm sau khi chấm xong."}
        </p>
      </div>
    </div>
  );
}

function Select({
  value,
  onChange,
  options,
}: {
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="h-9 rounded-xl border border-border bg-background px-3 text-sm font-medium text-foreground outline-none focus:border-primary"
    >
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
}
