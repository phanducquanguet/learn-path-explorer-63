import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { TopNav } from "@/components/TopNav";
import { useRole } from "@/contexts/RoleContext";
import { classes } from "@/lib/teacher-data";
import {
  SKILL_LABEL,
  TYPE_LABEL,
  type QLevel,
  type QSkill,
  type QType,
} from "@/lib/question-bank";
import type { TestStructureItem } from "@/lib/tests-data";
import { ArrowLeft, Plus, Trash2, ScrollText, ChevronRight, Check } from "lucide-react";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/admin/tests/new")({
  head: () => ({ meta: [{ title: "Tạo đề thi mới — UNICOM LMS" }] }),
  component: NewTestPage,
});

const LEVELS: QLevel[] = ["A1", "A2", "B1", "B2", "C1", "C2"];
const SKILLS: QSkill[] = ["listening", "reading", "writing", "speaking"];

const STEPS = [
  { id: 1, label: "Thông tin chung" },
  { id: 2, label: "Cấu trúc đề" },
  { id: 3, label: "Chế độ" },
  { id: 4, label: "Xem lại" },
];

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
  const [structure, setStructure] = useState<TestStructureItem[]>([
    { skill: "reading", type: "mcq", level: "B1", count: 10 },
  ]);
  const [mode, setMode] = useState<"fixed" | "random">("random");

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

  return (
    <div className="min-h-screen bg-background">
      <TopNav />
      <div className="mx-auto max-w-4xl px-6 pb-20 pt-10 sm:px-8">
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
        <div className="mt-6 flex items-center gap-2">
          {STEPS.map((s, i) => (
            <div key={s.id} className="flex items-center gap-2">
              <div
                className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold",
                  step >= s.id ? "bg-foreground text-background" : "bg-muted text-muted-foreground",
                )}
              >
                {step > s.id ? <Check className="h-4 w-4" /> : s.id}
              </div>
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
                  Mỗi dòng = một nhóm câu hỏi sẽ được bốc từ Ngân hàng. Đảm bảo các đề có cùng cấu
                  trúc dù bốc ngẫu nhiên.
                </p>
                <button
                  onClick={() =>
                    setStructure((p) => [
                      ...p,
                      { skill: "reading", type: "mcq", level, count: 5 },
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
                      <th className="px-3 py-2 text-center">Số câu</th>
                      <th className="px-3 py-2"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {structure.map((s, i) => (
                      <tr key={i} className="border-t border-border">
                        <td className="px-3 py-2">
                          <select
                            value={s.skill}
                            onChange={(e) =>
                              setStructure((p) =>
                                p.map((x, idx) =>
                                  idx === i ? { ...x, skill: e.target.value as QSkill } : x,
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
                                  idx === i ? { ...x, type: e.target.value as QType } : x,
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
                                  idx === i ? { ...x, level: e.target.value as QLevel } : x,
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
                        <td className="px-3 py-2 text-right">
                          <button
                            onClick={() => setStructure((p) => p.filter((_, idx) => idx !== i))}
                            className="rounded-lg p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="rounded-xl bg-muted/40 p-3 text-sm">
                Tổng cộng: <strong>{totalQuestions} câu</strong> trong <strong>{structure.length}</strong>{" "}
                nhóm
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
                    title: "Bốc ngẫu nhiên",
                    desc: "Mỗi học viên nhận một đề khác nhau, được bốc tự động từ Ngân hàng theo đúng cấu trúc đã chọn. Tất cả đề có cùng số lượng câu, cùng loại, cùng cấp độ.",
                  },
                  {
                    id: "fixed" as const,
                    title: "Đề cố định",
                    desc: "Toàn bộ học viên cùng làm một đề. Admin chọn thủ công từng câu hỏi từ Ngân hàng (sẽ làm ở bước sau).",
                  },
                ] as const
              ).map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => setMode(opt.id)}
                  className={cn(
                    "block w-full rounded-2xl border p-4 text-left transition",
                    mode === opt.id
                      ? "border-primary bg-primary/5"
                      : "border-border bg-background hover:bg-muted",
                  )}
                >
                  <div className="font-semibold text-foreground">{opt.title}</div>
                  <p className="mt-1 text-xs text-muted-foreground">{opt.desc}</p>
                </button>
              ))}
            </div>
          )}

          {step === 4 && (
            <div className="space-y-3 text-sm">
              <Row label="Tên đề" value={name || "—"} />
              <Row label="Cấp độ" value={level} />
              <Row label="Thời lượng" value={`${duration} phút`} />
              <Row label="Lớp" value={classIds.length ? classIds.length + " lớp" : "—"} />
              <Row label="Mở" value={openAt || "—"} />
              <Row label="Đóng" value={closeAt || "—"} />
              <Row label="Tổng câu" value={String(totalQuestions)} />
              <Row label="Chế độ" value={mode === "random" ? "Bốc ngẫu nhiên" : "Cố định"} />
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
          {step < 4 ? (
            <button
              onClick={() => setStep((s) => s + 1)}
              className="rounded-xl px-4 py-2 text-sm font-semibold text-primary-foreground shadow-soft"
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
    <div className="flex justify-between border-b border-border/60 py-2 last:border-0">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium text-foreground">{value}</span>
    </div>
  );
}
