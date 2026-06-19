import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { TopNav } from "@/components/TopNav";
import { useRole } from "@/contexts/RoleContext";
import { classes } from "@/lib/teacher-data";
import { orgs, classOrgMap } from "@/lib/orgs";
import {
  SKILL_LABEL,
  TYPE_LABEL,
  DIFFICULTY_LABEL,
  DIFFICULTY_COLOR,
  questionBank,
  type BankQuestion,
  type QLevel,
  type QSkill,
  type QType,
  type QDifficulty,
} from "@/lib/question-bank";
import type { TestStructureItem } from "@/lib/tests-data";
import { EditDialog, TypePickerDialog } from "@/routes/admin.question-bank";
import {
  ArrowLeft,
  Plus,
  Trash2,
  ScrollText,
  ChevronRight,
  Check,
  Eye,
  Shuffle,
  ListChecks,
  RefreshCw,
  X,
  ArrowUp,
  ArrowDown,
  Sparkles,
  PencilLine,
} from "lucide-react";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/admin/tests/new")({
  head: () => ({ meta: [{ title: "Tạo đề thi mới — UNICOM LMS" }] }),
  component: NewTestPage,
});

const LEVELS: QLevel[] = ["A1", "A2", "B1", "B2", "C1", "C2"];
const SKILLS: QSkill[] = ["listening", "reading", "writing", "speaking"];
const DIFFICULTIES: (QDifficulty | "mixed")[] = ["mixed", "easy", "medium", "hard"];
const TYPES_BY_SKILL: Record<QSkill, QType[]> = {
  listening: ["mcq", "mcq-multi", "tf", "short", "fill", "matching", "sequence"],
  reading: ["mcq", "mcq-multi", "tf", "short", "fill", "matching", "sequence", "select-lists", "drag-drop", "error-correction"],
  writing: ["essay", "short", "error-correction"],
  speaking: ["speaking", "short"],
};

const STEPS = [
  { id: 1, label: "Thông tin chung" },
  { id: 2, label: "Cấu trúc đề" },
  { id: 3, label: "Chế độ" },
  { id: 4, label: "Thiết lập đề" },
  { id: 5, label: "Xem lại" },
];

type StructureItem = TestStructureItem;

function matchBank(s: StructureItem): BankQuestion[] {
  // Lọc theo Kỹ năng + Cấp độ + Loại + Độ khó + Tags (any-match).
  const wanted = (s.tags ?? []).map((t) => t.trim().toLowerCase()).filter(Boolean);
  return questionBank.filter(
    (q) =>
      q.skill === s.skill &&
      q.level === s.level &&
      (!s.type || s.type === "mixed" || q.type === s.type) &&
      (!s.difficulty || s.difficulty === "mixed" || q.difficulty === s.difficulty) &&
      (wanted.length === 0 ||
        q.tags.some((t) => wanted.includes(t.toLowerCase()))),
  );
}


function rollRandom(s: StructureItem, seed = 0): BankQuestion[] {
  const pool = matchBank(s);
  const shuffled = [...pool]
    .map((q, i) => ({ q, k: ((i + 1) * 9301 + seed * 49297 + Date.now()) % 233280 }))
    .sort((a, b) => a.k - b.k)
    .map((x) => x.q);
  return shuffled.slice(0, s.count);
}

function NewTestPage() {
  const { role } = useRole();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");
  const [level, setLevel] = useState<QLevel>("B1");
  const [orgId, setOrgId] = useState<string>(orgs[0]?.id ?? "");
  const [classIds, setClassIds] = useState<string[]>([]);
  const [duration, setDuration] = useState(60);
  const [openAt, setOpenAt] = useState("");
  const [closeAt, setCloseAt] = useState("");
  const [structure, setStructure] = useState<StructureItem[]>([
    { skill: "listening", type: "mcq", level: "B1", difficulty: "mixed", count: 10, sectionDurationMinutes: 15, pickedIds: [] },
    { skill: "reading", type: "mcq", level: "B1", difficulty: "mixed", count: 10, sectionDurationMinutes: 20, pickedIds: [] },
    { skill: "speaking", type: "short", level: "B1", difficulty: "mixed", count: 3, sectionDurationMinutes: 10, pickedIds: [] },
    { skill: "writing", type: "essay", level: "B1", difficulty: "mixed", count: 2, sectionDurationMinutes: 25, pickedIds: [] },
  ]);
  const [mode, setMode] = useState<"fixed" | "random" | "manual">("random");
  const [enforceOrder, setEnforceOrder] = useState(false);
  const [previewing, setPreviewing] = useState(false);

  const totalQuestions = structure.reduce((s, x) => s + x.count, 0);

  // Auto-fill random picks when entering step 4 in random mode (only for groups still empty).
  useEffect(() => {
    if (step !== 4 || mode !== "random") return;
    setStructure((prev) => {
      let changed = false;
      const next = prev.map((it) => {
        if (it.count <= 0) return it;
        if (it.pickedIds && it.pickedIds.length > 0) return it;
        const picks = rollRandom(it).map((q) => q.id);
        if (picks.length === 0) return it;
        changed = true;
        return { ...it, pickedIds: picks };
      });
      return changed ? next : prev;
    });
  }, [step, mode]);

  // Resolve final question list per group. Manual mode uses customBank; otherwise pickedIds.
  const resolved: { item: StructureItem; questions: BankQuestion[] }[] = useMemo(() => {
    return structure.map((it) => {
      if (mode === "manual") {
        return { item: it, questions: it.customBank ?? [] };
      }
      const ids = it.pickedIds ?? [];
      const qs = ids
        .map((id) => questionBank.find((q) => q.id === id))
        .filter((q): q is BankQuestion => !!q);
      return { item: it, questions: qs };
    });
  }, [structure, mode]);

  if (role !== "admin") {
    return (
      <div className="min-h-screen bg-background">
        <TopNav />
        <div className="mx-auto max-w-3xl px-6 py-20 text-center">
          <ScrollText className="mx-auto h-12 w-12 text-muted-foreground" />
          <h1 className="mt-4 font-display text-2xl font-semibold">Chỉ Quản trị viên</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Chỉ Quản trị viên mới có thể tạo đề thi.
          </p>
        </div>
      </div>
    );
  }

  const submit = () => {
    if (typeof window !== "undefined") {
      const key = "unicom.admin.tests";
      const prev = JSON.parse(window.localStorage.getItem(key) ?? "[]");
      prev.push({
        id: `t-${Date.now()}`,
        name,
        description: desc,
        level,
        orgId,
        classIds,
        durationMinutes: duration,
        openAt,
        closeAt,
        mode,
        enforceOrder,
        structure,
        createdAt: new Date().toISOString(),
      });
      window.localStorage.setItem(key, JSON.stringify(prev));
    }
    navigate({ to: "/teacher/tests" });
  };

  const canNext = (() => {
    if (step === 1) return name.trim().length > 0;
    if (step === 2) return structure.some((s) => s.count > 0);
    if (step === 4) {
      if (mode === "manual") {
        return structure
          .filter((s) => s.count > 0)
          .every((s) => (s.customBank?.length ?? 0) === s.count);
      }
      return structure
        .filter((s) => s.count > 0)
        .every((s) => (s.pickedIds?.length ?? 0) === s.count);
    }
    return true;
  })();


  return (
    <div className="min-h-screen bg-background">
      <TopNav />
      <div className="mx-auto max-w-5xl px-6 pb-20 pt-10 sm:px-8">
        <Link
          to="/teacher/tests"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" /> Trở lại Thi cử
        </Link>

        <h1 className="mt-4 font-display text-3xl font-semibold tracking-tight">
          Tạo đề thi mới
        </h1>

        {/* Steps */}
        <div className="mt-6 flex flex-wrap items-center gap-2">
          {STEPS.map((s, i) => (
            <div key={s.id} className="flex items-center gap-2">
              <button
                onClick={() => s.id < step && setStep(s.id)}
                className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold",
                  step >= s.id ? "bg-foreground text-background" : "bg-muted text-muted-foreground",
                )}
              >
                {step > s.id ? <Check className="h-4 w-4" /> : s.id}
              </button>
              <span
                className={cn(
                  "text-sm font-medium",
                  step === s.id ? "text-foreground" : "text-muted-foreground",
                )}
              >
                {s.label}
              </span>
              {i < STEPS.length - 1 && <ChevronRight className="h-4 w-4 text-muted-foreground" />}
            </div>
          ))}
        </div>

        <div className="mt-6 rounded-3xl border border-border bg-surface p-6 shadow-soft">
          {step === 1 && (
            <div className="space-y-4">
              <Field label="Tên đề thi">
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="VD: Kiểm tra cuối kỳ B1 — Tháng 6"
                  className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm"
                />
              </Field>
              <Field label="Mô tả">
                <textarea
                  value={desc}
                  onChange={(e) => setDesc(e.target.value)}
                  rows={3}
                  className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm"
                />
              </Field>
              <div className="grid gap-3 sm:grid-cols-2">
                <Field label="Cấp độ">
                  <select
                    value={level}
                    onChange={(e) => setLevel(e.target.value as QLevel)}
                    className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm"
                  >
                    {LEVELS.map((l) => (
                      <option key={l}>{l}</option>
                    ))}
                  </select>
                </Field>
                <Field label="Thời lượng (phút)">
                  <input
                    type="number"
                    value={duration}
                    onChange={(e) => setDuration(Number(e.target.value))}
                    className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm"
                  />
                </Field>
              </div>
              <Field label="Đơn vị (trường / trung tâm)">
                <select
                  value={orgId}
                  onChange={(e) => {
                    setOrgId(e.target.value);
                    setClassIds([]);
                  }}
                  className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm"
                >
                  {orgs.map((o) => (
                    <option key={o.id} value={o.id}>
                      {o.name}
                    </option>
                  ))}
                </select>
                <p className="mt-1 text-[11px] text-muted-foreground">
                  Bài thi chỉ thuộc 1 đơn vị. Có thể sao chép sang đơn vị khác sau khi tạo.
                </p>
              </Field>
              <Field label="Lớp được giao (chỉ trong đơn vị đã chọn)">
                {(() => {
                  const classesInOrg = classes.filter(
                    (c) => classOrgMap[c.id] === orgId,
                  );
                  if (classesInOrg.length === 0) {
                    return (
                      <div className="rounded-xl border border-dashed border-border bg-muted/30 p-4 text-center text-xs text-muted-foreground">
                        Đơn vị này chưa có lớp. Bạn vẫn có thể tạo bài và gán lớp sau.
                      </div>
                    );
                  }
                  return (
                    <div className="grid grid-cols-2 gap-2">
                      {classesInOrg.map((c) => {
                        const on = classIds.includes(c.id);
                        return (
                          <button
                            key={c.id}
                            onClick={() =>
                              setClassIds((p) =>
                                on ? p.filter((x) => x !== c.id) : [...p, c.id],
                              )
                            }
                            className={cn(
                              "rounded-xl border px-3 py-2 text-left text-xs font-semibold transition",
                              on
                                ? "border-primary bg-primary/10 text-primary"
                                : "border-border bg-background hover:bg-muted",
                            )}
                          >
                            {c.name}
                            <div className="text-[10px] font-normal text-muted-foreground">
                              {c.studentCount} HS • {c.levelCode}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  );
                })()}
              </Field>
              <div className="grid gap-3 sm:grid-cols-2">
                <Field label="Mở lúc">
                  <input
                    type="datetime-local"
                    value={openAt}
                    onChange={(e) => setOpenAt(e.target.value)}
                    className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm"
                  />
                </Field>
                <Field label="Đóng lúc">
                  <input
                    type="datetime-local"
                    value={closeAt}
                    onChange={(e) => setCloseAt(e.target.value)}
                    className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm"
                  />
                </Field>
              </div>
              <p className="rounded-lg bg-amber-50 p-3 text-xs text-amber-900">
                Học sinh vào trước giờ mở sẽ không thể bắt đầu làm bài.
              </p>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Thêm các <strong>cấu trúc đề</strong> theo kỹ năng (VD: Nghe, Nói). Trong mỗi cấu trúc có thể thêm nhiều dòng với loại câu hỏi, độ khó và số câu khác nhau.
              </p>

              {(() => {
                const usedSkills = Array.from(new Set(structure.map((s) => s.skill)));
                const availableSkills = SKILLS.filter((sk) => !usedSkills.includes(sk));
                return (
                  <>
                    {usedSkills.length === 0 && (
                      <div className="rounded-2xl border border-dashed border-border bg-muted/30 p-8 text-center text-sm text-muted-foreground">
                        Chưa có cấu trúc nào. Nhấn “Thêm cấu trúc đề” bên dưới để bắt đầu.
                      </div>
                    )}

                    {usedSkills.map((sk) => {
                      const rowsWithIdx = structure
                        .map((r, i) => ({ r, i }))
                        .filter((x) => x.r.skill === sk);
                      const skillCount = rowsWithIdx.reduce((a, x) => a + x.r.count, 0);
                      const skillMinutes = rowsWithIdx.reduce(
                        (a, x) => a + (x.r.sectionDurationMinutes ?? 0),
                        0,
                      );
                      return (
                        <div
                          key={sk}
                          className="overflow-hidden rounded-2xl border border-border bg-background"
                        >
                          <div className="flex items-center justify-between gap-3 border-b border-border bg-muted/40 px-4 py-2.5">
                            <div className="flex items-center gap-2">
                              <span className="rounded-md bg-foreground/5 px-2 py-0.5 text-xs font-bold uppercase tracking-wider text-foreground">
                                {SKILL_LABEL[sk]}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                {rowsWithIdx.length} dòng · {skillCount} câu
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <label className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
                                ⏱ Thời gian
                                <input
                                  type="number"
                                  min={0}
                                  value={rowsWithIdx[0]?.r.sectionDurationMinutes ?? ""}
                                  onChange={(e) => {
                                    const v = e.target.value;
                                    const minutes =
                                      v === "" ? undefined : Math.max(0, Number(v));
                                    const firstIdx = rowsWithIdx[0]?.i;
                                    setStructure((p) =>
                                      p.map((x, k) => {
                                        if (x.skill !== sk) return x;
                                        if (k === firstIdx)
                                          return { ...x, sectionDurationMinutes: minutes };
                                        return { ...x, sectionDurationMinutes: undefined };
                                      }),
                                    );
                                  }}
                                  placeholder="—"
                                  className="w-16 rounded-lg border border-border bg-background px-2 py-1 text-center text-xs"
                                />
                                <span className="text-muted-foreground">phút</span>
                              </label>
                              <button
                                onClick={() =>
                                  setStructure((p) => p.filter((x) => x.skill !== sk))
                                }
                                className="rounded-md p-1 text-rose-500 hover:bg-rose-500/10"
                                title="Xóa cấu trúc này"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </div>
                          <table className="w-full text-sm">
                            <thead className="text-xs uppercase tracking-wider text-muted-foreground">
                              <tr className="border-b border-border">
                                <th className="px-3 py-2 text-left">#</th>
                                <th className="px-3 py-2 text-left">Loại câu hỏi</th>
                                <th className="px-3 py-2 text-center">Cấp độ</th>
                                <th className="px-3 py-2 text-center">Độ khó</th>
                                <th className="px-3 py-2 text-left">Tags</th>
                                <th className="px-3 py-2 text-center">Số câu</th>
                                <th className="px-3 py-2 text-center">Thời gian (phút)</th>
                                <th className="px-3 py-2 text-center">Có sẵn</th>
                                <th className="px-3 py-2"></th>
                              </tr>
                            </thead>
                            <tbody>
                              {rowsWithIdx.map(({ r: row, i: idx }, localIdx) => {
                                const available = matchBank(row).length;
                                const short = available < row.count;
                                const upsertAt = (patch: Partial<StructureItem>) => {
                                  setStructure((p) =>
                                    p.map((x, k) =>
                                      k === idx ? { ...x, ...patch, pickedIds: [] } : x,
                                    ),
                                  );
                                };
                                return (
                                  <tr key={idx} className="border-t border-border">
                                    <td className="px-3 py-2 text-xs font-semibold text-muted-foreground">
                                      {localIdx + 1}
                                    </td>
                                    <td className="px-3 py-2">
                                      <select
                                        value={row.type}
                                        onChange={(e) =>
                                          upsertAt({ type: e.target.value as QType | "mixed" })
                                        }
                                        className="rounded-lg border border-border bg-background px-2 py-1 text-xs"
                                      >
                                        <option value="mixed">Trộn nhiều dạng</option>
                                        {TYPES_BY_SKILL[row.skill].map((t) => (
                                          <option key={t} value={t}>
                                            {TYPE_LABEL[t]}
                                          </option>
                                        ))}
                                      </select>
                                    </td>
                                    <td className="px-3 py-2 text-center">
                                      <select
                                        value={row.level}
                                        onChange={(e) =>
                                          upsertAt({ level: e.target.value as QLevel })
                                        }
                                        className="rounded-lg border border-border bg-background px-2 py-1 text-xs"
                                      >
                                        {LEVELS.map((l) => (
                                          <option key={l}>{l}</option>
                                        ))}
                                      </select>
                                    </td>
                                    <td className="px-3 py-2 text-center">
                                      <select
                                        value={row.difficulty ?? "mixed"}
                                        onChange={(e) =>
                                          upsertAt({
                                            difficulty: e.target.value as QDifficulty | "mixed",
                                          })
                                        }
                                        className="rounded-lg border border-border bg-background px-2 py-1 text-xs"
                                      >
                                        {DIFFICULTIES.map((d) => (
                                          <option key={d} value={d}>
                                            {d === "mixed" ? "Trộn" : DIFFICULTY_LABEL[d]}
                                          </option>
                                        ))}
                                      </select>
                                    </td>
                                    <td className="px-3 py-2">
                                      <input
                                        type="text"
                                        value={(row.tags ?? []).join(", ")}
                                        onChange={(e) => {
                                          const tags = e.target.value
                                            .split(",")
                                            .map((t) => t.trim())
                                            .filter(Boolean);
                                          upsertAt({ tags });
                                        }}
                                        placeholder="grammar, unit-3"
                                        className="w-44 rounded-lg border border-border bg-background px-2 py-1 text-xs"
                                      />
                                    </td>
                                    <td className="px-3 py-2 text-center">
                                      <input
                                        type="number"
                                        min={0}
                                        value={row.count}
                                        onChange={(e) =>
                                          upsertAt({ count: Math.max(0, Number(e.target.value)) })
                                        }
                                        className="w-20 rounded-lg border border-border bg-background px-2 py-1 text-center text-xs"
                                      />
                                    </td>
                                    <td className="px-3 py-2 text-center">
                                      <span
                                        className={cn(
                                          "rounded-md px-2 py-0.5 text-[11px] font-semibold",
                                          short
                                            ? "bg-rose-500/10 text-rose-600"
                                            : "bg-emerald-500/10 text-emerald-600",
                                        )}
                                      >
                                        {available}
                                      </span>
                                    </td>
                                    <td className="px-3 py-2 text-right">
                                      <button
                                        onClick={() =>
                                          setStructure((p) => p.filter((_, k) => k !== idx))
                                        }
                                        className="rounded-md p-1 text-rose-500 hover:bg-rose-500/10"
                                        title="Xóa dòng"
                                      >
                                        <Trash2 className="h-3.5 w-3.5" />
                                      </button>
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                          <div className="border-t border-border bg-muted/20 px-3 py-2">
                            <button
                              onClick={() =>
                                setStructure((p) => {
                                  const defaultType: QType | "mixed" =
                                    TYPES_BY_SKILL[sk][0] ?? "mixed";
                                  return [
                                    ...p,
                                    {
                                      skill: sk,
                                      type: defaultType,
                                      level,
                                      difficulty: "mixed",
                                      count: 5,
                                      sectionDurationMinutes: 10,
                                      pickedIds: [],
                                    },
                                  ];
                                })
                              }
                              className="inline-flex items-center gap-1.5 rounded-lg border border-dashed border-border bg-background px-2.5 py-1.5 text-xs font-semibold hover:bg-muted"
                            >
                              <Plus className="h-3.5 w-3.5" /> Thêm dòng vào {SKILL_LABEL[sk]}
                            </button>
                          </div>
                        </div>
                      );
                    })}

                    {availableSkills.length > 0 && (
                      <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-dashed border-border bg-muted/20 p-3">
                        <span className="text-xs font-semibold text-muted-foreground">
                          Thêm cấu trúc đề:
                        </span>
                        {availableSkills.map((sk) => {
                          const defaultType: QType | "mixed" = TYPES_BY_SKILL[sk][0] ?? "mixed";
                          return (
                            <button
                              key={sk}
                              onClick={() =>
                                setStructure((p) => [
                                  ...p,
                                  {
                                    skill: sk,
                                    type: defaultType,
                                    level,
                                    difficulty: "mixed",
                                    count: 5,
                                    sectionDurationMinutes: 10,
                                    pickedIds: [],
                                  },
                                ])
                              }
                              className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-background px-3 py-1.5 text-xs font-semibold hover:bg-muted"
                            >
                              <Plus className="h-3.5 w-3.5" /> {SKILL_LABEL[sk]}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </>
                );
              })()}

              <div className="space-y-2 rounded-xl bg-muted/40 p-3 text-sm">
                <div>
                  Tổng cộng: <strong>{totalQuestions} câu</strong> qua{" "}
                  <strong>{structure.filter((s) => s.count > 0).length}</strong> dòng cấu trúc
                  {(() => {
                    const sec = structure.reduce((a, s) => a + (s.sectionDurationMinutes ?? 0), 0);
                    if (sec === 0) return null;
                    const over = sec > duration;
                    return (
                      <span className={cn("ml-2", over ? "text-rose-600" : "text-muted-foreground")}>
                        • Tổng thời gian các phần: <strong>{sec} phút</strong>{" "}
                        {over && `(vượt thời lượng ${duration} phút)`}
                      </span>
                    );
                  })()}
                </div>
                {(() => {
                  const bySkill = new Map<QSkill, { minutes: number; count: number; rows: number }>();
                  structure.forEach((s) => {
                    if (s.count <= 0) return;
                    const cur = bySkill.get(s.skill) ?? { minutes: 0, count: 0, rows: 0 };
                    cur.minutes += s.sectionDurationMinutes ?? 0;
                    cur.count += s.count;
                    cur.rows += 1;
                    bySkill.set(s.skill, cur);
                  });
                  if (bySkill.size === 0) return null;
                  return (
                    <div className="flex flex-wrap items-center gap-1.5 pt-1">
                      <span className="text-xs text-muted-foreground">Thời gian theo kỹ năng:</span>
                      {SKILLS.filter((sk) => bySkill.has(sk)).map((sk) => {
                        const info = bySkill.get(sk)!;
                        return (
                          <span
                            key={sk}
                            className="inline-flex items-center gap-1 rounded-full border border-border bg-background px-2.5 py-1 text-[11px] font-semibold"
                          >
                            <span className="text-foreground">{SKILL_LABEL[sk]}</span>
                            <span className="text-muted-foreground">·</span>
                            <span className="text-primary">
                              ⏱ {info.minutes || "—"}
                              {info.minutes ? "'" : ""}
                            </span>
                            <span className="text-muted-foreground">· {info.count} câu</span>
                          </span>
                        );
                      })}
                    </div>
                  );
                })()}
              </div>
            </div>
          )}


          {step === 3 && (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                Chọn cách bốc câu hỏi cho học viên.
              </p>
              {(
                [
                  {
                    id: "random" as const,
                    icon: Shuffle,
                    title: "Bốc ngẫu nhiên từ ngân hàng",
                    desc: "Mỗi học viên nhận một đề khác nhau, được bốc tự động theo cấu trúc + độ khó đã chọn.",
                  },
                  {
                    id: "fixed" as const,
                    icon: ListChecks,
                    title: "Chọn thủ công từ ngân hàng",
                    desc: "Toàn bộ học viên cùng làm một đề. Bạn sẽ chọn từng câu ở bước kế tiếp.",
                  },
                  {
                    id: "manual" as const,
                    icon: PencilLine,
                    title: "Tạo mới toàn bộ câu hỏi bằng tay",
                    desc: "Tự soạn từng câu cho mỗi kỹ năng — không lấy từ ngân hàng. Phù hợp khi đề thi cần nội dung riêng.",
                  },
                ] as const
              ).map((opt) => {
                const Icon = opt.icon;
                return (
                  <button
                    key={opt.id}
                    onClick={() => setMode(opt.id)}
                    className={cn(
                      "flex w-full items-start gap-3 rounded-2xl border p-4 text-left transition",
                      mode === opt.id
                        ? "border-primary bg-primary/5"
                        : "border-border bg-background hover:bg-muted",
                    )}
                  >
                    <div
                      className={cn(
                        "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl",
                        mode === opt.id ? "bg-primary text-primary-foreground" : "bg-muted text-foreground",
                      )}
                    >
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="font-semibold text-foreground">{opt.title}</div>
                      <p className="mt-1 text-xs text-muted-foreground">{opt.desc}</p>
                    </div>
                  </button>
                );
              })}

              <label
                className={cn(
                  "mt-2 flex cursor-pointer items-start gap-3 rounded-2xl border p-4 transition",
                  enforceOrder ? "border-primary bg-primary/5" : "border-border bg-background hover:bg-muted",
                )}
              >
                <input
                  type="checkbox"
                  checked={enforceOrder}
                  onChange={(e) => setEnforceOrder(e.target.checked)}
                  className="mt-1 h-4 w-4 rounded border-border accent-primary"
                />
                <div>
                  <div className="font-semibold text-foreground">
                    Bắt buộc làm bài theo đúng thứ tự cấu trúc đề
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Học viên phải hoàn thành lần lượt theo flow đã định (VD: Nghe → Đọc → Nói → Viết) và không thể quay lại phần trước hay chọn nhảy bài.
                  </p>
                </div>
              </label>
            </div>
          )}

          {step === 4 && (
            <Step4Build
              structure={structure}
              setStructure={setStructure}
              mode={mode}
            />
          )}

          {step === 5 && (
            <div className="space-y-4 text-sm">
              <div className="grid gap-2 sm:grid-cols-2">
                <Row label="Tên đề" value={name || "—"} />
                <Row label="Cấp độ" value={level} />
                <Row label="Thời lượng" value={`${duration} phút`} />
                <Row label="Đơn vị" value={orgs.find((o) => o.id === orgId)?.name ?? "—"} />
                <Row label="Lớp" value={classIds.length ? classIds.length + " lớp" : "—"} />
                <Row label="Mở" value={openAt || "—"} />
                <Row label="Đóng" value={closeAt || "—"} />
                <Row label="Tổng câu" value={String(totalQuestions)} />
                <Row label="Chế độ" value={mode === "random" ? "Bốc ngẫu nhiên" : mode === "manual" ? "Tự soạn" : "Cố định"} />
                <Row label="Thứ tự làm bài" value={enforceOrder ? "Bắt buộc theo flow" : "Tự do"} />
              </div>

              <div className="rounded-2xl border border-border bg-background p-4">
                <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Cấu trúc đề
                </div>
                <div className="space-y-2">
                  {resolved.filter((r) => r.item.count > 0).map((r, i) => (
                    <div
                      key={i}
                      className="flex flex-wrap items-center gap-2 rounded-xl bg-muted/40 px-3 py-2 text-xs"
                    >
                      <span className="font-semibold text-foreground">
                        {SKILL_LABEL[r.item.skill]}
                      </span>
                      <span className="text-muted-foreground">•</span>
                      <span>{r.item.level}</span>
                      <span className="text-muted-foreground">•</span>
                      <span className="rounded-md bg-background px-1.5 py-0.5 text-[10px] font-semibold">
                        {r.item.type === "mixed" ? "Trộn dạng" : TYPE_LABEL[r.item.type]}
                      </span>
                      {r.item.difficulty && r.item.difficulty !== "mixed" && (
                        <span
                          className={cn(
                            "rounded-md px-1.5 py-0.5 text-[10px] font-semibold",
                            DIFFICULTY_COLOR[r.item.difficulty],
                          )}
                        >
                          {DIFFICULTY_LABEL[r.item.difficulty]}
                        </span>
                      )}
                      {r.item.sectionDurationMinutes ? (
                        <span className="rounded-md bg-primary/10 px-1.5 py-0.5 text-[10px] font-semibold text-primary">
                          ⏱ {r.item.sectionDurationMinutes}'
                        </span>
                      ) : null}
                      <span className="ml-auto font-semibold text-foreground">
                        {r.questions.length}/{r.item.count} câu
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <button
                onClick={() => setPreviewing(true)}
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-border bg-background px-4 py-2.5 text-sm font-semibold hover:bg-muted"
              >
                <Eye className="h-4 w-4" /> Xem đề như học sinh
              </button>
            </div>
          )}
        </div>

        <div className="mt-4 flex justify-between">
          <button
            onClick={() => setStep((s) => Math.max(1, s - 1))}
            disabled={step === 1}
            className="rounded-xl border border-border bg-background px-4 py-2 text-sm font-semibold disabled:opacity-40"
          >
            Quay lại
          </button>
          {step < 5 ? (
            <button
              onClick={() => setStep((s) => s + 1)}
              disabled={!canNext}
              className="rounded-xl px-4 py-2 text-sm font-semibold text-primary-foreground shadow-soft disabled:opacity-40"
              style={{ background: "var(--gradient-brand)" }}
            >
              Tiếp tục
            </button>
          ) : (
            <button
              onClick={submit}
              className="rounded-xl px-4 py-2 text-sm font-semibold text-primary-foreground shadow-soft"
              style={{ background: "var(--gradient-brand)" }}
            >
              Tạo đề thi
            </button>
          )}
        </div>
      </div>

      {previewing && (
        <StudentPreview
          name={name}
          duration={duration}
          resolved={resolved}
          onClose={() => setPreviewing(false)}
        />
      )}
    </div>
  );
}

/* ---------- Step 4: Build ---------- */

function Step4Build({
  structure,
  setStructure,
  mode,
}: {
  structure: StructureItem[];
  setStructure: React.Dispatch<React.SetStateAction<StructureItem[]>>;
  mode: "fixed" | "random" | "manual";
}) {
  const [openGroup, setOpenGroup] = useState(0);

  // Keep openGroup valid if structure shrinks.
  useEffect(() => {
    if (openGroup > structure.length - 1) setOpenGroup(Math.max(0, structure.length - 1));
  }, [structure.length, openGroup]);

  const moveGroup = (i: number, dir: -1 | 1) => {
    const j = i + dir;
    if (j < 0 || j >= structure.length) return;
    setStructure((p) => {
      const next = [...p];
      [next[i], next[j]] = [next[j], next[i]];
      return next;
    });
    if (openGroup === i) setOpenGroup(j);
    else if (openGroup === j) setOpenGroup(i);
  };

  const intro =
    mode === "random"
      ? 'Hệ thống đã bốc ngẫu nhiên một đề mẫu. Bạn có thể thêm/bớt câu hỏi, sắp xếp lại, hoặc bấm "Làm mới" để bốc lại từ đầu.'
      : mode === "manual"
        ? "Tự soạn từng câu hỏi cho mỗi kỹ năng. Nhấn “Thêm câu hỏi” để soạn mới, hoặc “Thêm từ ngân hàng” nếu muốn tái sử dụng câu có sẵn."
        : "Chọn từng câu thủ công cho mỗi nhóm. Dùng bộ lọc bên dưới để thu hẹp theo cấp độ và độ khó. Bấm “Tương tự” trên một câu đã chọn để thêm nhanh câu cùng dạng từ ngân hàng.";

  return (
    <div className="space-y-3">
      <p className="text-sm text-muted-foreground">{intro}</p>

      {/* Group tabs with reorder controls */}
      <div className="flex flex-wrap gap-2">
        {structure.map((s, i) => {
          if (s.count <= 0) return null;
          const cnt = mode === "manual" ? (s.customBank?.length ?? 0) : (s.pickedIds?.length ?? 0);
          const done = cnt === s.count;
          const active = openGroup === i;
          return (
            <div
              key={i}
              className={cn(
                "inline-flex items-center gap-1 rounded-xl border px-1.5 py-1 transition",
                active
                  ? "border-primary bg-primary/10"
                  : "border-border bg-background hover:bg-muted",
              )}
            >
              <button
                onClick={() => moveGroup(i, -1)}
                disabled={i === 0}
                title="Lên"
                className="rounded-md p-1 text-muted-foreground hover:bg-muted disabled:opacity-30"
              >
                <ArrowUp className="h-3 w-3" />
              </button>
              <button
                onClick={() => moveGroup(i, 1)}
                disabled={i === structure.length - 1}
                title="Xuống"
                className="rounded-md p-1 text-muted-foreground hover:bg-muted disabled:opacity-30"
              >
                <ArrowDown className="h-3 w-3" />
              </button>
              <button
                onClick={() => setOpenGroup(i)}
                className={cn(
                  "inline-flex items-center gap-2 px-2 py-0.5 text-xs font-semibold",
                  active ? "text-primary" : "text-foreground",
                )}
              >
                {i + 1}. {SKILL_LABEL[s.skill]}
                <span
                  className={cn(
                    "rounded-md px-1.5 py-0.5 text-[10px] font-bold",
                    done
                      ? "bg-emerald-500/10 text-emerald-600"
                      : "bg-muted text-muted-foreground",
                  )}
                >
                  {cnt}/{s.count}
                </span>
              </button>
            </div>
          );
        })}
      </div>

      {mode === "manual" ? (
        <ManualEditor
          key={openGroup}
          structure={structure}
          openGroup={openGroup}
          setStructure={setStructure}
        />
      ) : (
        <GroupEditor
          key={openGroup}
          structure={structure}
          openGroup={openGroup}
          setStructure={setStructure}
          mode={mode}
        />
      )}
    </div>
  );
}

function GroupEditor({
  structure,
  openGroup,
  setStructure,
  mode,
}: {
  structure: StructureItem[];
  openGroup: number;
  setStructure: React.Dispatch<React.SetStateAction<StructureItem[]>>;
  mode: "fixed" | "random";
}) {
  const cur = structure[openGroup];
  const picked = cur.pickedIds ?? [];
  const [filterLevel, setFilterLevel] = useState<QLevel | "all">(cur.level);
  const [filterDiff, setFilterDiff] = useState<QDifficulty | "all">(
    cur.difficulty && cur.difficulty !== "mixed" ? cur.difficulty : "all",
  );
  const [search, setSearch] = useState("");

  const pickedQs = useMemo(
    () =>
      picked
        .map((id) => questionBank.find((q) => q.id === id))
        .filter((q): q is BankQuestion => !!q),
    [picked],
  );

  const candidates = useMemo(() => {
    const q = search.trim().toLowerCase();
    return questionBank.filter(
      (x) =>
        x.skill === cur.skill &&
        (filterLevel === "all" || x.level === filterLevel) &&
        (filterDiff === "all" || x.difficulty === filterDiff) &&
        (!q || x.content.toLowerCase().includes(q) || x.id.toLowerCase().includes(q)),
    );
  }, [cur.skill, filterLevel, filterDiff, search]);

  const updateGroup = (fn: (g: StructureItem) => StructureItem) => {
    setStructure((p) => p.map((x, idx) => (idx === openGroup ? fn(x) : x)));
  };

  const addOne = (id: string) => {
    const ids = picked;
    if (ids.includes(id) || ids.length >= cur.count) return;
    updateGroup((g) => ({ ...g, pickedIds: [...(g.pickedIds ?? []), id] }));
  };

  const removeAt = (idx: number) => {
    updateGroup((g) => ({
      ...g,
      pickedIds: (g.pickedIds ?? []).filter((_, i) => i !== idx),
    }));
  };

  const moveItem = (idx: number, dir: -1 | 1) => {
    const j = idx + dir;
    updateGroup((g) => {
      const ids = [...(g.pickedIds ?? [])];
      if (j < 0 || j >= ids.length) return g;
      [ids[idx], ids[j]] = [ids[j], ids[idx]];
      return { ...g, pickedIds: ids };
    });
  };

  const rerollAll = () => {
    const ids = rollRandom(cur).map((q) => q.id);
    updateGroup((g) => ({ ...g, pickedIds: ids }));
  };

  const fillRandom = () => {
    const remaining = cur.count - picked.length;
    if (remaining <= 0) return;
    const pool = candidates.filter((q) => !picked.includes(q.id));
    const random = [...pool]
      .sort(() => Math.random() - 0.5)
      .slice(0, remaining)
      .map((q) => q.id);
    updateGroup((g) => ({ ...g, pickedIds: [...(g.pickedIds ?? []), ...random] }));
  };

  /** Tìm 1 câu trong ngân hàng tương tự câu đã chọn (cùng kỹ năng + loại + cấp độ + độ khó) và thêm vào. */
  const addSimilar = (idx: number) => {
    if (picked.length >= cur.count) return;
    const ref = questionBank.find((q) => q.id === picked[idx]);
    if (!ref) return;
    const pool = questionBank.filter(
      (x) =>
        !picked.includes(x.id) &&
        x.skill === ref.skill &&
        x.type === ref.type &&
        x.level === ref.level &&
        x.difficulty === ref.difficulty,
    );
    // Nới rộng nếu không có khớp tuyệt đối
    const relaxed = pool.length
      ? pool
      : questionBank.filter(
          (x) => !picked.includes(x.id) && x.skill === ref.skill && x.type === ref.type && x.level === ref.level,
        );
    if (relaxed.length === 0) return;
    const pick = relaxed[Math.floor(Math.random() * relaxed.length)];
    updateGroup((g) => {
      const ids = [...(g.pickedIds ?? [])];
      ids.splice(idx + 1, 0, pick.id);
      return { ...g, pickedIds: ids };
    });
  };

  const selectClass =
    "h-8 rounded-lg border border-border bg-background px-2 text-xs font-medium outline-none focus:border-primary";

  return (
    <div className="grid gap-3 lg:grid-cols-2">
      {/* LEFT: picked list (editable) */}
      <div className="overflow-hidden rounded-2xl border border-border bg-background">
        <div className="flex items-center justify-between gap-2 border-b border-border bg-muted/30 px-4 py-2.5 text-xs">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-semibold text-foreground">Câu hỏi trong đề</span>
            <span
              className={cn(
                "rounded-md px-1.5 py-0.5 text-[10px] font-bold",
                picked.length === cur.count
                  ? "bg-emerald-500/10 text-emerald-600"
                  : "bg-amber-500/10 text-amber-600",
              )}
            >
              {picked.length}/{cur.count}
            </span>
          </div>
          {mode === "random" && (
            <button
              onClick={rerollAll}
              className="inline-flex items-center gap-1 rounded-lg bg-foreground px-2.5 py-1 text-[11px] font-semibold text-background"
            >
              <RefreshCw className="h-3 w-3" /> Làm mới
            </button>
          )}
        </div>
        <ul className="max-h-[460px] divide-y divide-border overflow-y-auto text-sm">
          {pickedQs.map((q, idx) => (
            <li key={`${q.id}-${idx}`} className="flex items-start gap-2 px-3 py-2.5">
              <span className="mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-muted text-[11px] font-bold">
                {idx + 1}
              </span>
              <div className="flex-1">
                <div className="text-foreground">{q.content}</div>
                <div className="mt-1 flex items-center gap-2 text-[10px] text-muted-foreground">
                  <span className="font-mono">{q.id}</span>
                  <span className="rounded-md bg-muted px-1.5 py-0.5 font-semibold">{q.level}</span>
                  <span
                    className={cn(
                      "rounded-md px-1.5 py-0.5 font-semibold",
                      DIFFICULTY_COLOR[q.difficulty],
                    )}
                  >
                    {DIFFICULTY_LABEL[q.difficulty]}
                  </span>
                </div>
              </div>
              <div className="flex shrink-0 flex-col gap-0.5">
                <button
                  onClick={() => moveItem(idx, -1)}
                  disabled={idx === 0}
                  className="rounded-md p-1 text-muted-foreground hover:bg-muted disabled:opacity-30"
                  title="Lên"
                >
                  <ArrowUp className="h-3 w-3" />
                </button>
                <button
                  onClick={() => moveItem(idx, 1)}
                  disabled={idx === pickedQs.length - 1}
                  className="rounded-md p-1 text-muted-foreground hover:bg-muted disabled:opacity-30"
                  title="Xuống"
                >
                  <ArrowDown className="h-3 w-3" />
                </button>
              </div>
              <button
                onClick={() => addSimilar(idx)}
                disabled={picked.length >= cur.count}
                className="inline-flex items-center gap-1 rounded-md px-1.5 py-1 text-[10px] font-semibold text-violet-600 hover:bg-violet-500/10 disabled:opacity-30"
                title="Thêm câu tương tự từ ngân hàng (cùng kỹ năng, loại, cấp độ, độ khó)"
              >
                <Sparkles className="h-3 w-3" /> Tương tự
              </button>
              <button
                onClick={() => removeAt(idx)}
                className="rounded-md p-1 text-rose-500 hover:bg-rose-500/10"
                title="Xóa"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </li>
          ))}
          {pickedQs.length === 0 && (
            <li className="px-4 py-8 text-center text-xs text-muted-foreground">
              Chưa có câu hỏi nào. Thêm từ ngân hàng bên cạnh.
            </li>
          )}
        </ul>
      </div>

      {/* RIGHT: candidates (add from bank) */}
      <div className="overflow-hidden rounded-2xl border border-border bg-background">
        <div className="flex flex-wrap items-center gap-2 border-b border-border bg-muted/30 px-3 py-2.5 text-xs">
          <span className="font-semibold text-foreground">Ngân hàng</span>
          <div className="flex items-center gap-1.5">
            <span className="text-muted-foreground">Cấp</span>
            <select
              value={filterLevel}
              onChange={(e) => setFilterLevel(e.target.value as QLevel | "all")}
              className={selectClass}
            >
              <option value="all">Tất cả</option>
              {LEVELS.map((l) => (
                <option key={l} value={l}>
                  {l}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-muted-foreground">Độ khó</span>
            <select
              value={filterDiff}
              onChange={(e) => setFilterDiff(e.target.value as QDifficulty | "all")}
              className={selectClass}
            >
              <option value="all">Tất cả</option>
              <option value="easy">{DIFFICULTY_LABEL.easy}</option>
              <option value="medium">{DIFFICULTY_LABEL.medium}</option>
              <option value="hard">{DIFFICULTY_LABEL.hard}</option>
            </select>
          </div>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm câu..."
            className="h-8 min-w-[140px] flex-1 rounded-lg border border-border bg-background px-2.5 text-xs outline-none focus:border-primary"
          />
          <button
            onClick={fillRandom}
            disabled={picked.length >= cur.count}
            className="inline-flex items-center gap-1 rounded-lg bg-foreground px-2.5 py-1 text-[11px] font-semibold text-background disabled:opacity-40"
            title="Thêm ngẫu nhiên cho đủ số lượng từ bộ lọc hiện tại"
          >
            <Shuffle className="h-3 w-3" /> Thêm ngẫu nhiên
          </button>
        </div>
        <ul className="max-h-[460px] divide-y divide-border overflow-y-auto text-sm">
          {candidates.map((q) => {
            const on = picked.includes(q.id);
            const full = picked.length >= cur.count && !on;
            return (
              <li
                key={q.id}
                className={cn(
                  "flex items-start gap-2 px-3 py-2.5",
                  on && "bg-primary/5",
                  full && "opacity-40",
                )}
              >
                <div className="flex-1">
                  <div className="text-foreground">{q.content}</div>
                  <div className="mt-1 flex items-center gap-2 text-[10px] text-muted-foreground">
                    <span className="font-mono">{q.id}</span>
                    <span className="rounded-md bg-muted px-1.5 py-0.5 font-semibold">
                      {q.level}
                    </span>
                    <span
                      className={cn(
                        "rounded-md px-1.5 py-0.5 font-semibold",
                        DIFFICULTY_COLOR[q.difficulty],
                      )}
                    >
                      {DIFFICULTY_LABEL[q.difficulty]}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => addOne(q.id)}
                  disabled={on || full}
                  className={cn(
                    "inline-flex h-7 shrink-0 items-center gap-1 rounded-md px-2 text-[11px] font-semibold",
                    on
                      ? "bg-emerald-500/10 text-emerald-600"
                      : "bg-foreground text-background hover:opacity-90 disabled:opacity-40",
                  )}
                >
                  {on ? (
                    <>
                      <Check className="h-3 w-3" /> Đã thêm
                    </>
                  ) : (
                    <>
                      <Plus className="h-3 w-3" /> Thêm
                    </>
                  )}
                </button>
              </li>
            );
          })}
          {candidates.length === 0 && (
            <li className="px-4 py-8 text-center text-xs text-muted-foreground">
              Không có câu hỏi nào khớp bộ lọc hiện tại.
            </li>
          )}
        </ul>
      </div>
    </div>
  );
}

/* ---------- Step 4: Manual editor (soạn mới câu hỏi) ---------- */

function ManualEditor({
  structure,
  openGroup,
  setStructure,
}: {
  structure: StructureItem[];
  openGroup: number;
  setStructure: React.Dispatch<React.SetStateAction<StructureItem[]>>;
}) {
  const cur = structure[openGroup];
  const list = cur.customBank ?? [];
  const [picking, setPicking] = useState(false);
  const [editing, setEditing] = useState<{ idx: number; q: BankQuestion } | null>(null);
  const [creatingType, setCreatingType] = useState<QType | null>(null);

  const updateGroup = (fn: (g: StructureItem) => StructureItem) => {
    setStructure((p) => p.map((x, i) => (i === openGroup ? fn(x) : x)));
  };

  const removeAt = (idx: number) => {
    updateGroup((g) => ({ ...g, customBank: (g.customBank ?? []).filter((_, i) => i !== idx) }));
  };

  const moveItem = (idx: number, dir: -1 | 1) => {
    const j = idx + dir;
    updateGroup((g) => {
      const arr = [...(g.customBank ?? [])];
      if (j < 0 || j >= arr.length) return g;
      [arr[idx], arr[j]] = [arr[j], arr[idx]];
      return { ...g, customBank: arr };
    });
  };

  const isFull = list.length >= cur.count;

  const handleSave = (q: BankQuestion) => {
    if (editing) {
      // update existing
      const idx = editing.idx;
      updateGroup((g) => ({
        ...g,
        customBank: (g.customBank ?? []).map((c, i) => (i === idx ? q : c)),
      }));
      setEditing(null);
    } else {
      // new
      const newQ: BankQuestion = {
        ...q,
        id: q.id || `CQ-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        skill: cur.skill,
      };
      updateGroup((g) => ({ ...g, customBank: [...(g.customBank ?? []), newQ] }));
      setCreatingType(null);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-border bg-muted/30 px-4 py-2.5 text-xs">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-foreground">{SKILL_LABEL[cur.skill]}</span>
          <span
            className={cn(
              "rounded-md px-1.5 py-0.5 text-[10px] font-bold",
              list.length === cur.count
                ? "bg-emerald-500/10 text-emerald-600"
                : "bg-amber-500/10 text-amber-600",
            )}
          >
            {list.length}/{cur.count}
          </span>
        </div>
        <button
          onClick={() => setPicking(true)}
          disabled={isFull}
          className="inline-flex items-center gap-1 rounded-lg bg-foreground px-2.5 py-1 text-[11px] font-semibold text-background disabled:opacity-40"
        >
          <Plus className="h-3 w-3" /> Thêm câu hỏi
        </button>
      </div>

      {list.length === 0 && (
        <div className="rounded-2xl border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
          Chưa có câu hỏi nào. Nhấn “Thêm câu hỏi” để chọn loại và soạn theo form tương ứng.
        </div>
      )}

      <ul className="space-y-2">
        {list.map((q, idx) => (
          <li
            key={q.id}
            className="flex items-start gap-2 rounded-2xl border border-border bg-background px-3 py-2.5 text-sm"
          >
            <span className="mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-muted text-[11px] font-bold">
              {idx + 1}
            </span>
            <div className="flex-1">
              <div className="text-foreground">{q.content || <span className="italic text-muted-foreground">(Chưa có nội dung)</span>}</div>
              <div className="mt-1 flex flex-wrap items-center gap-2 text-[10px] text-muted-foreground">
                <span className="rounded-md bg-muted px-1.5 py-0.5 font-semibold">{TYPE_LABEL[q.type]}</span>
                <span className="rounded-md bg-muted px-1.5 py-0.5 font-semibold">{q.level}</span>
                <span
                  className={cn(
                    "rounded-md px-1.5 py-0.5 font-semibold",
                    DIFFICULTY_COLOR[q.difficulty],
                  )}
                >
                  {DIFFICULTY_LABEL[q.difficulty]}
                </span>
              </div>
            </div>
            <div className="flex shrink-0 items-center gap-1">
              <button
                onClick={() => moveItem(idx, -1)}
                disabled={idx === 0}
                className="rounded-md p-1 text-muted-foreground hover:bg-muted disabled:opacity-30"
                title="Lên"
              >
                <ArrowUp className="h-3 w-3" />
              </button>
              <button
                onClick={() => moveItem(idx, 1)}
                disabled={idx === list.length - 1}
                className="rounded-md p-1 text-muted-foreground hover:bg-muted disabled:opacity-30"
                title="Xuống"
              >
                <ArrowDown className="h-3 w-3" />
              </button>
              <button
                onClick={() => setEditing({ idx, q })}
                className="rounded-md px-2 py-1 text-[11px] font-semibold text-primary hover:bg-primary/10"
              >
                Sửa
              </button>
              <button
                onClick={() => removeAt(idx)}
                className="rounded-md p-1 text-rose-500 hover:bg-rose-500/10"
                title="Xóa"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          </li>
        ))}
      </ul>

      {picking && (
        <TypePickerDialog
          onClose={() => setPicking(false)}
          onPick={(t) => {
            setPicking(false);
            setCreatingType(t);
          }}
        />
      )}

      {(editing || creatingType) && (
        <EditDialog
          question={editing?.q ?? null}
          initialType={creatingType ?? undefined}
          onClose={() => {
            setEditing(null);
            setCreatingType(null);
          }}
          onSave={handleSave}
        />
      )}
    </div>
  );
}



/* ---------- Student-like preview ---------- */


function StudentPreview({
  name,
  duration,
  resolved,
  onClose,
}: {
  name: string;
  duration: number;
  resolved: { item: StructureItem; questions: BankQuestion[] }[];
  onClose: () => void;
}) {
  const bySkill = useMemo(() => {
    const map = new Map<QSkill, BankQuestion[]>();
    for (const r of resolved) {
      const arr = map.get(r.item.skill) ?? [];
      map.set(r.item.skill, [...arr, ...r.questions]);
    }
    return Array.from(map.entries());
  }, [resolved]);

  const [activeSkill, setActiveSkill] = useState<QSkill>(bySkill[0]?.[0] ?? "reading");
  const active = bySkill.find(([s]) => s === activeSkill)?.[1] ?? [];

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-background">
      <div className="flex items-center justify-between border-b border-border bg-surface px-6 py-3">
        <div>
          <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Xem trước (chế độ học sinh)
          </div>
          <div className="font-display text-lg font-semibold">
            {name || "Đề thi chưa đặt tên"}
          </div>
        </div>
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <span className="rounded-md bg-muted px-2 py-1 font-semibold text-foreground">
            ⏱ {duration} phút
          </span>
          <button
            onClick={onClose}
            className="inline-flex items-center gap-1 rounded-lg bg-foreground px-3 py-1.5 text-xs font-semibold text-background"
          >
            <X className="h-3.5 w-3.5" /> Đóng
          </button>
        </div>
      </div>

      <div className="grid flex-1 grid-cols-[220px_1fr] overflow-hidden">
        <aside className="overflow-y-auto border-r border-border bg-surface p-3">
          <div className="mb-2 px-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            Kỹ năng
          </div>
          {bySkill.map(([skill, qs]) => (
            <button
              key={skill}
              onClick={() => setActiveSkill(skill)}
              className={cn(
                "flex w-full items-center justify-between rounded-xl px-3 py-2 text-sm font-medium transition",
                activeSkill === skill
                  ? "bg-primary/10 text-primary"
                  : "text-foreground hover:bg-muted",
              )}
            >
              <span>{SKILL_LABEL[skill]}</span>
              <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-bold text-muted-foreground">
                {qs.length}
              </span>
            </button>
          ))}
        </aside>

        <main className="overflow-y-auto p-6">
          <div className="mx-auto max-w-3xl space-y-4">
            {active.map((q, idx) => (
              <PreviewQuestion key={q.id} q={q} index={idx + 1} />
            ))}
            {active.length === 0 && (
              <div className="rounded-2xl border border-dashed border-border p-12 text-center text-sm text-muted-foreground">
                Chưa có câu hỏi cho kỹ năng này.
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

function PreviewQuestion({ q, index }: { q: BankQuestion; index: number }) {
  return (
    <div className="rounded-2xl border border-border bg-surface p-5 shadow-soft">
      <div className="flex items-start gap-3">
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-xs font-bold text-primary">
          {index}
        </span>
        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            <span>{TYPE_LABEL[q.type]}</span>
            <span
              className={cn(
                "rounded-md px-1.5 py-0.5 normal-case",
                DIFFICULTY_COLOR[q.difficulty],
              )}
            >
              {DIFFICULTY_LABEL[q.difficulty]}
            </span>
            <span>• {q.points} điểm</span>
          </div>
          <p className="mt-2 text-sm text-foreground">{q.content}</p>

          {q.type === "mcq" && q.options && (
            <div className="mt-3 space-y-2">
              {q.options.map((opt, i) => (
                <label
                  key={i}
                  className="flex cursor-pointer items-center gap-2 rounded-xl border border-border bg-background px-3 py-2 text-sm hover:bg-muted"
                >
                  <input type="radio" name={q.id} className="h-4 w-4" />
                  <span>{opt}</span>
                </label>
              ))}
            </div>
          )}
          {q.type === "tf" && (
            <div className="mt-3 flex gap-2">
              {["True", "False"].map((v) => (
                <label
                  key={v}
                  className="flex flex-1 cursor-pointer items-center gap-2 rounded-xl border border-border bg-background px-3 py-2 text-sm hover:bg-muted"
                >
                  <input type="radio" name={q.id} className="h-4 w-4" />
                  <span>{v}</span>
                </label>
              ))}
            </div>
          )}
          {(q.type === "short" || q.type === "fill") && (
            <input
              placeholder="Câu trả lời của bạn..."
              className="mt-3 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm"
            />
          )}
          {q.type === "essay" && (
            <textarea
              rows={5}
              placeholder="Viết bài của bạn..."
              className="mt-3 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm"
            />
          )}
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

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between rounded-xl bg-muted/30 px-3 py-2">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium text-foreground">{value}</span>
    </div>
  );
}
