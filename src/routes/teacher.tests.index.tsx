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
  ChevronDown,
  ChevronRight,
  CornerDownRight,
  Eye,
  MoreVertical,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

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
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
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
          (() => {
            const parents = filtered.filter((t) => !t.id.includes("-sim-"));
            const childMap: Record<string, Test[]> = {};
            for (const t of filtered) {
              if (t.id.includes("-sim-")) {
                const base = t.id.split("-sim-")[0];
                (childMap[base] ||= []).push(t);
              }
            }
            const parentIds = new Set(parents.map((p) => p.id));
            const orphans = filtered.filter(
              (t) => t.id.includes("-sim-") && !parentIds.has(t.id.split("-sim-")[0]),
            );
            const cards = [...parents, ...orphans];
            return (
              <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {cards.map((t) => {
                  const st = testStatus(t);
                  const m = statusMeta(st);
                  const Icon = m.icon;
                  const org = getOrg(t.orgId);
                  const isSelected = selected.includes(t.id);
                  const children = childMap[t.id] ?? [];
                  const hasChildren = children.length > 0;
                  const isOpen = !!expanded[t.id];
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
                        <div className="flex flex-wrap items-center gap-1.5">
                          <span
                            className={cn(
                              "inline-flex items-center gap-1 rounded-full px-2 py-1 text-[11px] font-semibold",
                              m.cls,
                            )}
                          >
                            <Icon className="h-3 w-3" /> {m.label}
                          </span>
                          <span className="inline-flex items-center gap-1 rounded-md bg-foreground/5 px-1.5 py-0.5 font-mono text-[10px] font-semibold text-foreground">
                            {t.id}
                          </span>
                          {hasChildren && (
                            <span className="inline-flex items-center gap-1 rounded-md bg-primary/10 px-1.5 py-0.5 text-[10px] font-semibold text-primary">
                              <Sparkles className="h-3 w-3" /> +{children.length} mã đề phụ
                            </span>
                          )}
                        </div>
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

                      {hasChildren && (
                        <div className="relative mt-3 border-t border-dashed border-border pt-3">
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              setExpanded((s) => ({ ...s, [t.id]: !s[t.id] }));
                            }}
                            className="inline-flex w-full items-center justify-between gap-2 rounded-lg bg-muted/40 px-2.5 py-1.5 text-[11px] font-semibold text-foreground transition hover:bg-muted"
                          >
                            <span className="inline-flex items-center gap-1.5">
                              {isOpen ? (
                                <ChevronDown className="h-3.5 w-3.5" />
                              ) : (
                                <ChevronRight className="h-3.5 w-3.5" />
                              )}
                              {isOpen ? "Ẩn" : "Xem"} {children.length} mã đề phụ
                            </span>
                            <Sparkles className="h-3.5 w-3.5 text-primary" />
                          </button>
                          {isOpen && (
                            <ul className="mt-2 space-y-1.5">
                              {children.map((c) => {
                                const cst = testStatus(c);
                                const cm = statusMeta(cst);
                                return (
                                  <li
                                    key={c.id}
                                    className="relative flex items-center gap-2 rounded-lg border border-border bg-background px-2.5 py-2 text-xs"
                                  >
                                    <CornerDownRight className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                                    <div className="min-w-0 flex-1">
                                      <div className="flex flex-wrap items-center gap-1.5">
                                        <span className="rounded bg-primary/10 px-1.5 py-0.5 text-[10px] font-semibold text-primary">
                                          Mã đề phụ
                                        </span>
                                        <span
                                          className={cn(
                                            "rounded-full px-1.5 py-0.5 text-[10px] font-semibold",
                                            cm.cls,
                                          )}
                                        >
                                          {cm.label}
                                        </span>
                                        <span className="text-[10px] text-muted-foreground">
                                          {c.durationMinutes} phút · {c.submitted}/{c.registered} HS
                                        </span>
                                      </div>
                                      <div className="mt-0.5 truncate font-medium text-foreground">
                                        {c.name}
                                      </div>
                                    </div>
                                    <Link
                                      to="/teacher/tests/$testId"
                                      params={{ testId: c.id }}
                                      onClick={(e) => e.stopPropagation()}
                                      className="relative inline-flex items-center gap-1 rounded-md border border-border bg-background px-2 py-1 text-[10px] font-semibold text-foreground hover:border-primary hover:text-primary"
                                    >
                                      <Eye className="h-3 w-3" /> Chi tiết
                                    </Link>
                                  </li>
                                );
                              })}
                            </ul>
                          )}
                        </div>
                      )}

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
            );
          })()


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
  sources: Test[];
  onClose: () => void;
  onConfirm: (sources: Test[], orgId: string, classIds: string[]) => void;
}) {
  const sourceOrgIds = new Set(sources.map((s) => s.orgId).filter(Boolean));
  const defaultTarget =
    orgs.find((o) => !sourceOrgIds.has(o.id))?.id ?? orgs[0]?.id ?? "";
  const [orgId, setOrgId] = useState(defaultTarget);
  const [classIds, setClassIds] = useState<string[]>([]);

  const classesInOrg = classes.filter((c) => classOrgMap[c.id] === orgId);
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
              Sao chép {sources.length} đề thi sang đơn vị khác
            </h2>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Bản sao giữ nguyên cấu trúc đề và câu hỏi, được gán cho đơn vị và lớp đích. Lịch mở/đóng và dữ liệu nộp bài sẽ được làm mới.
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
            <div className="mb-1.5 text-xs font-semibold text-foreground">Đề thi nguồn</div>
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
            <div className="mb-1.5 text-xs font-semibold text-foreground">Đơn vị đích</div>
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
                Đơn vị này chưa có lớp. Đề vẫn được sao chép và có thể gán lớp sau.
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
            <Copy className="h-4 w-4" /> Sao chép {sources.length} đề
          </button>
        </div>
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
