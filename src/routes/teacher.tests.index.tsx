import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { TopNav } from "@/components/TopNav";
import { useRole } from "@/contexts/RoleContext";
import { tests as seedTests, testStatus, type Test } from "@/lib/tests-data";
import { classes } from "@/lib/teacher-data";
import { orgs, classOrgMap, getOrg } from "@/lib/orgs";
import { questionBank } from "@/lib/question-bank";
import {
  ScrollText,
  Plus,
  Clock,
  Users,
  Calendar,
  CheckCircle2,
  Hourglass,
  Lock,
  LayoutGrid,
  Table as TableIcon,
  GraduationCap,
  Copy,
  Sparkles,
  Building2,
  CheckSquare,
  Square,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/teacher/tests/")({
  head: () => ({ meta: [{ title: "Thi cử — UNICOM LMS" }] }),
  component: TestsList,
});

function pickSimilar(skill: string, type: string, level: string, difficulty: string | undefined, exclude: Set<string>, count: number) {
  const pool = questionBank.filter(
    (q) =>
      q.skill === (skill as never) &&
      q.type === (type as never) &&
      q.level === (level as never) &&
      (!difficulty || difficulty === "mixed" || q.difficulty === difficulty) &&
      !exclude.has(q.id),
  );
  const shuffled = [...pool].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count).map((q) => q.id);
}

function cloneTestSimilar(t: Test, index: number): Test {
  const now = Date.now();
  const days = (d: number) => new Date(now + d * 86400000).toISOString();
  const used = new Set<string>();
  const structure = t.structure.map((s) => {
    const next = { ...s };
    if (s.pickedIds && s.pickedIds.length) {
      const ids = pickSimilar(s.skill, s.type, s.level, s.difficulty, used, s.count);
      ids.forEach((id) => used.add(id));
      next.pickedIds = ids.length ? ids : s.pickedIds;
    }
    if (s.customQuestions && s.customQuestions.length) {
      const ids = pickSimilar(s.skill, s.type, s.level, s.difficulty, used, s.customQuestions.length);
      ids.forEach((id) => used.add(id));
      const picks = ids.map((id) => questionBank.find((q) => q.id === id)!).filter(Boolean);
      next.customQuestions = picks.length
        ? picks.map((q) => ({
            id: `BK-${q.id}-${Math.random().toString(36).slice(2, 6)}`,
            content: q.content,
            type: q.type,
            level: q.level,
            difficulty: q.difficulty,
            points: q.points,
            options: q.options,
            correctAnswer: q.correctAnswer,
          }))
        : s.customQuestions;
    }
    return next;
  });
  return {
    ...t,
    id: `${t.id}-sim-${now}`,
    name: `${t.name} — Bản tương tự ${index}`,
    structure,
    openAt: days(7),
    closeAt: days(8),
    registered: 0,
    submitted: 0,
    graded: 0,
    avgScore: undefined,
    createdAt: new Date().toISOString(),
  };
}

const classNameById = (id: string) => classes.find((c) => c.id === id)?.name ?? id;

function statusMeta(s: ReturnType<typeof testStatus>) {
  if (s === "upcoming")
    return { label: "Chưa mở", icon: Hourglass, cls: "bg-amber-100 text-amber-700" };
  if (s === "open")
    return { label: "Đang mở", icon: CheckCircle2, cls: "bg-emerald-100 text-emerald-700" };
  return { label: "Đã đóng", icon: Lock, cls: "bg-muted text-muted-foreground" };
}

function TestsList() {
  const { role } = useRole();
  const isAdmin = role === "admin";
  const [view, setView] = useState<"grid" | "table">("grid");
  const [tests, setTests] = useState<Test[]>(seedTests);
  const [orgFilter, setOrgFilter] = useState<string>("all");
  const [selected, setSelected] = useState<string[]>([]);
  const [copyTarget, setCopyTarget] = useState<Test[] | null>(null);
  const simCounts = useMemo(() => {
    const m: Record<string, number> = {};
    for (const t of tests) {
      const base = t.id.split("-sim-")[0];
      m[base] = (m[base] ?? 0) + (t.id.includes("-sim-") ? 1 : 0);
    }
    return m;
  }, [tests]);

  const filtered = useMemo(
    () => (orgFilter === "all" ? tests : tests.filter((t) => t.orgId === orgFilter)),
    [tests, orgFilter],
  );

  const duplicate = (t: Test) => {
    const base = t.id.split("-sim-")[0];
    const idx = (simCounts[base] ?? 0) + 1;
    setTests((arr) => [cloneTestSimilar(t, idx), ...arr]);
  };

  const toggleSelect = (id: string) =>
    setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));

  const openBulkCopy = () => {
    const list = tests.filter((t) => selected.includes(t.id));
    if (list.length > 0) setCopyTarget(list);
  };

  const performCopy = (sources: Test[], targetOrgId: string, targetClassIds: string[]) => {
    const stamp = Date.now();
    const clones: Test[] = sources.map((src, i) => ({
      ...src,
      id: `${src.id}-copy-${stamp}-${i}`,
      name: `${src.name} (Bản sao)`,
      orgId: targetOrgId,
      classIds: targetClassIds,
      copiedFromId: src.id,
      registered: 0,
      submitted: 0,
      graded: 0,
      avgScore: undefined,
      createdAt: new Date().toISOString(),
    }));
    setTests((arr) => [...clones, ...arr]);
    setCopyTarget(null);
    setSelected([]);
  };

  return (
    <div className="min-h-screen bg-background">
      <TopNav />
      <div className="mx-auto max-w-7xl px-6 pb-20 pt-10 sm:px-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-primary">
              <ScrollText className="h-3.5 w-3.5" /> Quản lý kỳ thi
            </span>
            <h1 className="mt-1 font-display text-3xl font-semibold tracking-tight sm:text-4xl">
              Thi cử
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Danh sách đề thi đã tạo cho các lớp. Theo dõi lịch mở, số học viên thi và chấm bài.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="inline-flex items-center rounded-xl border border-border bg-surface p-1 shadow-soft">
              <button
                onClick={() => setView("grid")}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition",
                  view === "grid"
                    ? "bg-foreground text-background"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                <LayoutGrid className="h-3.5 w-3.5" /> Lưới
              </button>
              <button
                onClick={() => setView("table")}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition",
                  view === "table"
                    ? "bg-foreground text-background"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                <TableIcon className="h-3.5 w-3.5" /> Bảng
              </button>
            </div>
            {isAdmin && (
              <Link
                to="/admin/tests/new"
                className="inline-flex items-center gap-1.5 rounded-xl px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-soft"
                style={{ background: "var(--gradient-brand)" }}
              >
                <Plus className="h-4 w-4" /> Tạo đề thi mới
              </Link>
            )}
          </div>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-4">
          <Stat label="Tổng đề thi" value={tests.length} />
          <Stat label="Đang mở" value={tests.filter((t) => testStatus(t) === "open").length} />
          <Stat label="Chờ mở" value={tests.filter((t) => testStatus(t) === "upcoming").length} />
          <Stat
            label="Cần chấm"
            value={tests.reduce((s, t) => s + (t.submitted - t.graded), 0)}
          />
        </div>

        {/* Toolbar: org filter + bulk copy */}
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
            Tất cả ({tests.length})
          </button>
          {orgs.map((o) => {
            const count = tests.filter((t) => t.orgId === o.id).length;
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
                Đã chọn <b className="text-foreground">{selected.length}</b> đề
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

        {view === "grid" ? (
          <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {filtered.map((t) => {
              const st = testStatus(t);
              const m = statusMeta(st);
              const Icon = m.icon;
              const org = getOrg(t.orgId);
              const isSelected = selected.includes(t.id);
              return (
                <div
                  key={t.id}
                  className={cn(
                    "group relative flex flex-col rounded-3xl border bg-surface p-5 shadow-soft transition hover:shadow-lg",
                    isSelected ? "border-primary ring-2 ring-primary/30" : "border-border",
                  )}
                >
                  <Link
                    to="/teacher/tests/$testId"
                    params={{ testId: t.id }}
                    className="absolute inset-0 rounded-3xl"
                    aria-label={t.name}
                  />
                  <div className="relative flex items-start justify-between gap-3">
                    <span
                      className={cn(
                        "inline-flex items-center gap-1 rounded-full px-2 py-1 text-[11px] font-semibold",
                        m.cls,
                      )}
                    >
                      <Icon className="h-3 w-3" /> {m.label}
                    </span>
                    <div className="flex items-center gap-1.5">
                      <span className="rounded-lg bg-primary/10 px-2 py-1 text-[11px] font-bold uppercase text-primary">
                        {t.level}
                      </span>
                      {isAdmin && (
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            toggleSelect(t.id);
                          }}
                          className="rounded-lg border border-border bg-background p-1 text-foreground hover:bg-muted"
                          aria-label="Chọn để sao chép"
                          title="Chọn để sao chép hàng loạt"
                        >
                          {isSelected ? (
                            <CheckSquare className="h-3.5 w-3.5 text-primary" />
                          ) : (
                            <Square className="h-3.5 w-3.5" />
                          )}
                        </button>
                      )}
                    </div>
                  </div>

                  {org && (
                    <div className="relative mt-2 inline-flex w-fit items-center gap-1 rounded-md bg-primary/10 px-2 py-0.5 text-[11px] font-semibold text-primary">
                      <Building2 className="h-3 w-3" /> {org.shortName}
                    </div>
                  )}

                  <h3 className="relative mt-3 font-display text-lg font-semibold text-foreground line-clamp-1">
                    {t.name}
                  </h3>
                  <p className="relative mt-1 text-xs text-muted-foreground line-clamp-2">
                    {t.description}
                  </p>

                  <div className="relative mt-3 flex items-start gap-1.5">
                    <GraduationCap className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                    <div className="flex flex-wrap gap-1">
                      {t.classIds.map((cid) => (
                        <span
                          key={cid}
                          className="rounded-md bg-muted px-2 py-0.5 text-[11px] font-medium text-foreground"
                        >
                          {classNameById(cid)}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="relative mt-4 grid grid-cols-2 gap-y-2 border-t border-border pt-3 text-xs text-muted-foreground">
                    <span className="inline-flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5" />{" "}
                      {new Date(t.openAt).toLocaleDateString("vi-VN")}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5" /> {t.durationMinutes} phút
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <Users className="h-3.5 w-3.5" /> {t.submitted}/{t.registered} HS
                    </span>
                    <span className="text-right font-semibold text-foreground">
                      {t.avgScore ? `TB ${t.avgScore}` : "—"}
                    </span>
                  </div>

                  {isAdmin && (
                    <div className="relative mt-3 flex flex-wrap items-center justify-end gap-1.5">
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setCopyTarget([t]);
                        }}
                        title="Sao chép sang đơn vị khác"
                        className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-background px-2.5 py-1.5 text-[11px] font-semibold text-foreground transition hover:border-primary hover:text-primary"
                      >
                        <Copy className="h-3.5 w-3.5" /> Sao chép
                      </button>
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          duplicate(t);
                        }}
                        title="Tạo đề tương tự cho cùng lớp (giữ nguyên dạng và độ khó, đổi nội dung câu hỏi)"
                        className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-background px-2.5 py-1.5 text-[11px] font-semibold text-foreground transition hover:border-primary hover:text-primary"
                      >
                        <Sparkles className="h-3.5 w-3.5" /> Tạo đề tương tự
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

        ) : (
          <div className="mt-6 overflow-hidden rounded-2xl border border-border bg-surface shadow-soft">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted/50 text-xs uppercase tracking-wider text-muted-foreground">
                  <tr>
                    <th className="px-4 py-3 text-left font-semibold">Đề thi</th>
                    <th className="px-4 py-3 text-left font-semibold">Đơn vị</th>
                    <th className="px-4 py-3 text-left font-semibold">Lớp</th>
                    <th className="px-4 py-3 text-left font-semibold">Trình độ</th>
                    <th className="px-4 py-3 text-left font-semibold">Trạng thái</th>
                    <th className="px-4 py-3 text-left font-semibold">Lịch mở</th>
                    <th className="px-4 py-3 text-left font-semibold">Thời lượng</th>
                    <th className="px-4 py-3 text-left font-semibold">HS</th>
                    <th className="px-4 py-3 text-right font-semibold">TB</th>
                    <th className="px-4 py-3 text-right font-semibold">Hành động</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filtered.map((t) => {
                    const st = testStatus(t);
                    const m = statusMeta(st);
                    const Icon = m.icon;
                    const org = getOrg(t.orgId);
                    return (
                      <tr key={t.id} className="transition hover:bg-muted/30">
                        <td className="px-4 py-3">
                          <Link
                            to="/teacher/tests/$testId"
                            params={{ testId: t.id }}
                            className="flex flex-col"
                          >
                            <span className="font-semibold text-foreground line-clamp-1">
                              {t.name}
                            </span>
                            <span className="text-xs text-muted-foreground line-clamp-1">
                              {t.description}
                            </span>
                          </Link>
                        </td>
                        <td className="px-4 py-3">
                          {org ? (
                            <span className="inline-flex items-center gap-1 rounded-md bg-primary/10 px-2 py-0.5 text-[11px] font-semibold text-primary">
                              <Building2 className="h-3 w-3" /> {org.shortName}
                            </span>
                          ) : (
                            <span className="text-xs text-muted-foreground">—</span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex flex-wrap gap-1">
                            {t.classIds.map((cid) => (
                              <span
                                key={cid}
                                className="inline-flex items-center gap-1 rounded-md bg-muted px-2 py-0.5 text-[11px] font-medium"
                              >
                                <GraduationCap className="h-3 w-3" />
                                {classNameById(cid)}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className="rounded-lg bg-primary/10 px-2 py-1 text-[11px] font-bold uppercase text-primary">
                            {t.level}
                          </span>
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
                        <td className="px-4 py-3 text-xs text-muted-foreground">
                          {new Date(t.openAt).toLocaleDateString("vi-VN")}
                        </td>
                        <td className="px-4 py-3 text-xs text-muted-foreground">
                          {t.durationMinutes} phút
                        </td>
                        <td className="px-4 py-3 text-xs text-muted-foreground">
                          {t.submitted}/{t.registered}
                        </td>
                        <td className="px-4 py-3 text-right font-semibold">
                          {t.avgScore ? t.avgScore : "—"}
                        </td>
                        <td className="px-4 py-3 text-right">
                          {isAdmin && (
                            <div className="inline-flex items-center gap-1">
                              <button
                                onClick={() => setCopyTarget([t])}
                                title="Sao chép sang đơn vị khác"
                                className="inline-flex items-center gap-1 rounded-lg border border-border bg-background px-2 py-1 text-[11px] font-semibold text-foreground transition hover:border-primary hover:text-primary"
                              >
                                <Copy className="h-3 w-3" /> Sao chép
                              </button>
                              <button
                                onClick={() => duplicate(t)}
                                title="Tạo đề tương tự"
                                className="inline-flex items-center gap-1 rounded-lg border border-border bg-background px-2 py-1 text-[11px] font-semibold text-foreground transition hover:border-primary hover:text-primary"
                              >
                                <Sparkles className="h-3 w-3" /> Tương tự
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl border border-border bg-surface p-4 shadow-soft">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="mt-1 font-display text-2xl font-semibold">{value}</div>
    </div>
  );
}
