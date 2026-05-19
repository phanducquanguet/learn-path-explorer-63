import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { TopNav } from "@/components/TopNav";
import { useRole } from "@/contexts/RoleContext";
import { classes } from "@/lib/teacher-data";
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
} from "lucide-react";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/admin/tests/new")({
  head: () => ({ meta: [{ title: "Tạo đề thi mới — UNICOM LMS" }] }),
  component: NewTestPage,
});

const LEVELS: QLevel[] = ["A1", "A2", "B1", "B2", "C1", "C2"];
const SKILLS: QSkill[] = ["listening", "reading", "writing", "speaking"];
const DIFFICULTIES: (QDifficulty | "mixed")[] = ["mixed", "easy", "medium", "hard"];

const STEPS = [
  { id: 1, label: "Thông tin chung" },
  { id: 2, label: "Cấu trúc đề" },
  { id: 3, label: "Chế độ" },
  { id: 4, label: "Thiết lập đề" },
  { id: 5, label: "Xem lại" },
];

type StructureItem = TestStructureItem;

function matchBank(s: StructureItem): BankQuestion[] {
  return questionBank.filter(
    (q) =>
      q.skill === s.skill &&
      q.type === s.type &&
      q.level === s.level &&
      (!s.difficulty || s.difficulty === "mixed" || q.difficulty === s.difficulty),
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
  const [classIds, setClassIds] = useState<string[]>([]);
  const [duration, setDuration] = useState(60);
  const [openAt, setOpenAt] = useState("");
  const [closeAt, setCloseAt] = useState("");
  const [structure, setStructure] = useState<StructureItem[]>([
    { skill: "reading", type: "mcq", level: "B1", difficulty: "mixed", count: 10, pickedIds: [] },
  ]);
  const [mode, setMode] = useState<"fixed" | "random">("random");
  const [randomSeed, setRandomSeed] = useState<Record<number, number>>({});
  const [previewing, setPreviewing] = useState(false);

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

  const totalQuestions = structure.reduce((s, x) => s + x.count, 0);

  // Resolve final question list per group for preview / save.
  const resolved: { item: StructureItem; questions: BankQuestion[] }[] = useMemo(() => {
    return structure.map((it, i) => {
      if (mode === "fixed") {
        const ids = it.pickedIds ?? [];
        const qs = ids
          .map((id) => questionBank.find((q) => q.id === id))
          .filter((q): q is BankQuestion => !!q);
        return { item: it, questions: qs };
      }
      return { item: it, questions: rollRandom(it, randomSeed[i] ?? 0) };
    });
  }, [structure, mode, randomSeed]);

  const submit = () => {
    if (typeof window !== "undefined") {
      const key = "unicom.admin.tests";
      const prev = JSON.parse(window.localStorage.getItem(key) ?? "[]");
      prev.push({
        id: `t-${Date.now()}`,
        name,
        description: desc,
        level,
        classIds,
        durationMinutes: duration,
        openAt,
        closeAt,
        mode,
        structure,
        createdAt: new Date().toISOString(),
      });
      window.localStorage.setItem(key, JSON.stringify(prev));
    }
    navigate({ to: "/teacher/tests" });
  };

  const canNext = (() => {
    if (step === 1) return name.trim().length > 0;
    if (step === 2) return structure.length > 0 && structure.every((s) => s.count > 0);
    if (step === 4 && mode === "fixed") {
      return structure.every((s) => (s.pickedIds?.length ?? 0) === s.count);
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
              <Field label="Lớp được giao (chọn nhiều)">
                <div className="grid grid-cols-2 gap-2">
                  {classes.map((c) => {
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
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  Mỗi dòng = một nhóm câu hỏi. Có thể chọn độ khó riêng cho từng nhóm.
                </p>
                <button
                  onClick={() =>
                    setStructure((p) => [
                      ...p,
                      { skill: "reading", type: "mcq", level, difficulty: "mixed", count: 5, pickedIds: [] },
                    ])
                  }
                  className="inline-flex items-center gap-1 rounded-lg bg-foreground px-3 py-1.5 text-xs font-semibold text-background"
                >
                  <Plus className="h-3.5 w-3.5" /> Thêm dòng
                </button>
              </div>
              <div className="overflow-hidden rounded-xl border border-border">
                <table className="w-full text-sm">
                  <thead className="bg-muted/40 text-xs uppercase tracking-wider text-muted-foreground">
                    <tr>
                      <th className="px-3 py-2 text-left">Kỹ năng</th>
                      <th className="px-3 py-2 text-left">Loại</th>
                      <th className="px-3 py-2 text-center">Cấp độ</th>
                      <th className="px-3 py-2 text-center">Độ khó</th>
                      <th className="px-3 py-2 text-center">Số câu</th>
                      <th className="px-3 py-2 text-center">Có sẵn</th>
                      <th className="px-3 py-2"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {structure.map((s, i) => {
                      const available = matchBank(s).length;
                      const short = available < s.count;
                      return (
                        <tr key={i} className="border-t border-border">
                          <td className="px-3 py-2">
                            <select
                              value={s.skill}
                              onChange={(e) =>
                                setStructure((p) =>
                                  p.map((x, idx) =>
                                    idx === i ? { ...x, skill: e.target.value as QSkill, pickedIds: [] } : x,
                                  ),
                                )
                              }
                              className="rounded-lg border border-border bg-background px-2 py-1 text-xs"
                            >
                              {SKILLS.map((k) => (
                                <option key={k} value={k}>{SKILL_LABEL[k]}</option>
                              ))}
                            </select>
                          </td>
                          <td className="px-3 py-2">
                            <select
                              value={s.type}
                              onChange={(e) =>
                                setStructure((p) =>
                                  p.map((x, idx) =>
                                    idx === i ? { ...x, type: e.target.value as QType, pickedIds: [] } : x,
                                  ),
                                )
                              }
                              className="rounded-lg border border-border bg-background px-2 py-1 text-xs"
                            >
                              {(Object.keys(TYPE_LABEL) as QType[]).map((t) => (
                                <option key={t} value={t}>{TYPE_LABEL[t]}</option>
                              ))}
                            </select>
                          </td>
                          <td className="px-3 py-2 text-center">
                            <select
                              value={s.level}
                              onChange={(e) =>
                                setStructure((p) =>
                                  p.map((x, idx) =>
                                    idx === i ? { ...x, level: e.target.value as QLevel, pickedIds: [] } : x,
                                  ),
                                )
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
                              value={s.difficulty ?? "mixed"}
                              onChange={(e) =>
                                setStructure((p) =>
                                  p.map((x, idx) =>
                                    idx === i
                                      ? { ...x, difficulty: e.target.value as QDifficulty | "mixed", pickedIds: [] }
                                      : x,
                                  ),
                                )
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
                          <td className="px-3 py-2 text-center">
                            <input
                              type="number"
                              min={1}
                              value={s.count}
                              onChange={(e) =>
                                setStructure((p) =>
                                  p.map((x, idx) =>
                                    idx === i ? { ...x, count: Number(e.target.value) } : x,
                                  ),
                                )
                              }
                              className="w-16 rounded-lg border border-border bg-background px-2 py-1 text-center text-xs"
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
                              onClick={() => setStructure((p) => p.filter((_, idx) => idx !== i))}
                              className="rounded-lg p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              <div className="rounded-xl bg-muted/40 p-3 text-sm">
                Tổng cộng: <strong>{totalQuestions} câu</strong> trong{" "}
                <strong>{structure.length}</strong> nhóm
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
            </div>
          )}

          {step === 4 && (
            <Step4Build
              structure={structure}
              setStructure={setStructure}
              mode={mode}
              resolved={resolved}
              reroll={(i) =>
                setRandomSeed((s) => ({ ...s, [i]: (s[i] ?? 0) + 1 }))
              }
            />
          )}

          {step === 5 && (
            <div className="space-y-4 text-sm">
              <div className="grid gap-2 sm:grid-cols-2">
                <Row label="Tên đề" value={name || "—"} />
                <Row label="Cấp độ" value={level} />
                <Row label="Thời lượng" value={`${duration} phút`} />
                <Row label="Lớp" value={classIds.length ? classIds.length + " lớp" : "—"} />
                <Row label="Mở" value={openAt || "—"} />
                <Row label="Đóng" value={closeAt || "—"} />
                <Row label="Tổng câu" value={String(totalQuestions)} />
                <Row label="Chế độ" value={mode === "random" ? "Bốc ngẫu nhiên" : "Cố định"} />
              </div>

              <div className="rounded-2xl border border-border bg-background p-4">
                <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Cấu trúc đề
                </div>
                <div className="space-y-2">
                  {resolved.map((r, i) => (
                    <div
                      key={i}
                      className="flex flex-wrap items-center gap-2 rounded-xl bg-muted/40 px-3 py-2 text-xs"
                    >
                      <span className="font-semibold text-foreground">
                        {SKILL_LABEL[r.item.skill]}
                      </span>
                      <span className="text-muted-foreground">•</span>
                      <span>{TYPE_LABEL[r.item.type]}</span>
                      <span className="text-muted-foreground">•</span>
                      <span>{r.item.level}</span>
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
  resolved,
  reroll,
}: {
  structure: StructureItem[];
  setStructure: React.Dispatch<React.SetStateAction<StructureItem[]>>;
  mode: "fixed" | "random";
  resolved: { item: StructureItem; questions: BankQuestion[] }[];
  reroll: (i: number) => void;
}) {
  const [openGroup, setOpenGroup] = useState(0);

  if (mode === "random") {
    return (
      <div className="space-y-3">
        <p className="text-sm text-muted-foreground">
          Hệ thống đã bốc thử một đề mẫu từ ngân hàng. Bạn có thể "Bốc lại" để xem một mẫu khác.
        </p>
        {resolved.map((r, i) => {
          const short = r.questions.length < r.item.count;
          return (
            <div key={i} className="overflow-hidden rounded-2xl border border-border bg-background">
              <div className="flex items-center justify-between gap-2 border-b border-border bg-muted/30 px-4 py-2.5">
                <div className="flex flex-wrap items-center gap-2 text-xs">
                  <span className="font-semibold text-foreground">
                    {SKILL_LABEL[r.item.skill]}
                  </span>
                  <span className="text-muted-foreground">•</span>
                  <span>{TYPE_LABEL[r.item.type]}</span>
                  <span className="text-muted-foreground">•</span>
                  <span>{r.item.level}</span>
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
                  <span
                    className={cn(
                      "rounded-md px-1.5 py-0.5 text-[10px] font-semibold",
                      short ? "bg-rose-500/10 text-rose-600" : "bg-emerald-500/10 text-emerald-600",
                    )}
                  >
                    {r.questions.length}/{r.item.count} câu
                  </span>
                </div>
                <button
                  onClick={() => reroll(i)}
                  className="inline-flex items-center gap-1 rounded-lg bg-foreground px-2.5 py-1 text-[11px] font-semibold text-background"
                >
                  <RefreshCw className="h-3 w-3" /> Bốc lại
                </button>
              </div>
              <ul className="divide-y divide-border text-sm">
                {r.questions.map((q, idx) => (
                  <li key={q.id} className="flex items-start gap-3 px-4 py-2.5">
                    <span className="mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-muted text-[11px] font-bold">
                      {idx + 1}
                    </span>
                    <span className="flex-1 text-foreground">{q.content}</span>
                    <span
                      className={cn(
                        "rounded-md px-1.5 py-0.5 text-[10px] font-semibold",
                        DIFFICULTY_COLOR[q.difficulty],
                      )}
                    >
                      {DIFFICULTY_LABEL[q.difficulty]}
                    </span>
                  </li>
                ))}
                {r.questions.length === 0 && (
                  <li className="px-4 py-6 text-center text-xs text-muted-foreground">
                    Ngân hàng chưa có câu hỏi phù hợp với cấu hình này.
                  </li>
                )}
              </ul>
            </div>
          );
        })}
      </div>
    );
  }

  // fixed mode → picker
  const cur = structure[openGroup];
  const candidates = matchBank(cur);
  const picked = cur.pickedIds ?? [];

  const toggle = (id: string) => {
    setStructure((p) =>
      p.map((x, idx) => {
        if (idx !== openGroup) return x;
        const ids = x.pickedIds ?? [];
        if (ids.includes(id)) return { ...x, pickedIds: ids.filter((y) => y !== id) };
        if (ids.length >= x.count) return x;
        return { ...x, pickedIds: [...ids, id] };
      }),
    );
  };

  return (
    <div className="space-y-3">
      <p className="text-sm text-muted-foreground">
        Chọn từng câu cho mỗi nhóm. Số câu chọn phải khớp với cấu trúc.
      </p>
      <div className="flex flex-wrap gap-2">
        {structure.map((s, i) => {
          const cnt = s.pickedIds?.length ?? 0;
          const done = cnt === s.count;
          return (
            <button
              key={i}
              onClick={() => setOpenGroup(i)}
              className={cn(
                "inline-flex items-center gap-2 rounded-xl border px-3 py-1.5 text-xs font-semibold transition",
                openGroup === i
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border bg-background hover:bg-muted",
              )}
            >
              {SKILL_LABEL[s.skill]} • {TYPE_LABEL[s.type]}
              <span
                className={cn(
                  "rounded-md px-1.5 py-0.5 text-[10px] font-bold",
                  done ? "bg-emerald-500/10 text-emerald-600" : "bg-muted text-muted-foreground",
                )}
              >
                {cnt}/{s.count}
              </span>
            </button>
          );
        })}
      </div>

      <div className="rounded-2xl border border-border bg-background">
        <div className="flex items-center justify-between gap-2 border-b border-border bg-muted/30 px-4 py-2.5 text-xs">
          <div>
            Có <strong>{candidates.length}</strong> câu phù hợp •{" "}
            <strong>{picked.length}/{cur.count}</strong> đã chọn
          </div>
          <button
            onClick={() => {
              const random = [...candidates]
                .sort(() => Math.random() - 0.5)
                .slice(0, cur.count)
                .map((q) => q.id);
              setStructure((p) =>
                p.map((x, idx) => (idx === openGroup ? { ...x, pickedIds: random } : x)),
              );
            }}
            className="inline-flex items-center gap-1 rounded-lg bg-foreground px-2.5 py-1 text-[11px] font-semibold text-background"
          >
            <Shuffle className="h-3 w-3" /> Lấy ngẫu nhiên đủ {cur.count} câu
          </button>
        </div>
        <ul className="max-h-[420px] divide-y divide-border overflow-y-auto text-sm">
          {candidates.map((q) => {
            const on = picked.includes(q.id);
            const full = picked.length >= cur.count && !on;
            return (
              <li
                key={q.id}
                className={cn(
                  "flex items-start gap-3 px-4 py-2.5",
                  on && "bg-primary/5",
                  full && "opacity-40",
                )}
              >
                <button
                  onClick={() => toggle(q.id)}
                  disabled={full}
                  className={cn(
                    "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border",
                    on ? "border-primary bg-primary text-primary-foreground" : "border-border",
                  )}
                >
                  {on && <Check className="h-3 w-3" />}
                </button>
                <div className="flex-1">
                  <div className="text-foreground">{q.content}</div>
                  <div className="mt-1 flex items-center gap-2 text-[10px] text-muted-foreground">
                    <span className="font-mono">{q.id}</span>
                    <span
                      className={cn(
                        "rounded-md px-1.5 py-0.5 font-semibold",
                        DIFFICULTY_COLOR[q.difficulty],
                      )}
                    >
                      {DIFFICULTY_LABEL[q.difficulty]}
                    </span>
                    <span>{q.points} điểm</span>
                  </div>
                </div>
              </li>
            );
          })}
          {candidates.length === 0 && (
            <li className="px-4 py-8 text-center text-xs text-muted-foreground">
              Ngân hàng chưa có câu hỏi phù hợp.
            </li>
          )}
        </ul>
      </div>
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
