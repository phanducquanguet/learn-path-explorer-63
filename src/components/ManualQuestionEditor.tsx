import { useMemo, useState } from "react";
import {
  ArrowDown,
  ArrowUp,
  Check,
  ListChecks,
  Plus,
  Trash2,
} from "lucide-react";
import {
  DIFFICULTY_COLOR,
  DIFFICULTY_LABEL,
  SKILL_LABEL,
  TYPE_LABEL,
  questionBank,
  type BankQuestion,
  type QDifficulty,
  type QLevel,
  type QSkill,
  type QType,
} from "@/lib/question-bank";
import type { CustomQuestion } from "@/lib/tests-data";
import { cn } from "@/lib/utils";

const LEVELS: QLevel[] = ["A1", "A2", "B1", "B2", "C1", "C2"];

export const Q_TYPES_BY_SKILL: Record<QSkill, QType[]> = {
  listening: ["mcq", "tf", "short", "fill"],
  reading: ["mcq", "tf", "short", "fill"],
  speaking: ["short"],
  writing: ["essay", "short"],
};

type Props = {
  skill: QSkill;
  level: QLevel;
  defaultDifficulty?: QDifficulty;
  questions: CustomQuestion[];
  onChange: (next: CustomQuestion[]) => void;
  /** undefined = unlimited */
  maxCount?: number;
  /** Hiển thị tiêu đề thanh header (mặc định: tên kỹ năng) */
  title?: string;
  /** Ẩn nút "Thêm từ ngân hàng" */
  hideBank?: boolean;
  /** Ẩn thanh header tổng (số câu/nút thêm). Khi true component chỉ render danh sách. */
  hideHeader?: boolean;
};

export function ManualQuestionEditor({
  skill,
  level,
  defaultDifficulty,
  questions,
  onChange,
  maxCount,
  title,
  hideBank,
  hideHeader,
}: Props) {
  const list = questions;
  const allowedTypes = Q_TYPES_BY_SKILL[skill];

  const [bankOpen, setBankOpen] = useState(false);
  const [bankLevel, setBankLevel] = useState<QLevel | "all">(level);
  const [bankDiff, setBankDiff] = useState<QDifficulty | "all">(
    defaultDifficulty ?? "all",
  );
  const [bankSearch, setBankSearch] = useState("");

  const isFull = maxCount !== undefined && list.length >= maxCount;

  const addNew = () => {
    if (isFull) return;
    const defType = allowedTypes[0];
    const isMcq = defType === "mcq";
    const nq: CustomQuestion = {
      id: `CQ-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      content: "",
      type: defType,
      level,
      difficulty: defaultDifficulty ?? "medium",
      points: defType === "essay" ? 5 : defType === "short" ? 2 : 1,
      options: isMcq ? ["", "", "", ""] : undefined,
      correctAnswer: isMcq ? "A" : defType === "tf" ? "True" : undefined,
    };
    onChange([...list, nq]);
  };

  const addFromBank = (q: BankQuestion) => {
    if (isFull) return;
    if (list.some((c) => c.id === `BK-${q.id}`)) return;
    const allowed = allowedTypes.includes(q.type) ? q.type : allowedTypes[0];
    const nq: CustomQuestion = {
      id: `BK-${q.id}`,
      content: q.content,
      type: allowed,
      level: q.level,
      difficulty: q.difficulty,
      points: q.points,
      options: q.options ? [...q.options] : allowed === "mcq" ? ["", "", "", ""] : undefined,
      correctAnswer: q.correctAnswer,
    };
    onChange([...list, nq]);
  };

  const bankCandidates = useMemo(() => {
    const q = bankSearch.trim().toLowerCase();
    return questionBank.filter(
      (x) =>
        x.skill === skill &&
        (bankLevel === "all" || x.level === bankLevel) &&
        (bankDiff === "all" || x.difficulty === bankDiff) &&
        (!q || x.content.toLowerCase().includes(q) || x.id.toLowerCase().includes(q)),
    );
  }, [skill, bankLevel, bankDiff, bankSearch]);

  const updateAt = (idx: number, patch: Partial<CustomQuestion>) => {
    onChange(list.map((c, i) => (i === idx ? { ...c, ...patch } : c)));
  };
  const removeAt = (idx: number) => onChange(list.filter((_, i) => i !== idx));
  const moveItem = (idx: number, dir: -1 | 1) => {
    const j = idx + dir;
    if (j < 0 || j >= list.length) return;
    const arr = [...list];
    [arr[idx], arr[j]] = [arr[j], arr[idx]];
    onChange(arr);
  };

  const inputClass =
    "w-full rounded-lg border border-border bg-background px-2.5 py-1.5 text-sm outline-none focus:border-primary";
  const bankSelectClass =
    "h-8 rounded-lg border border-border bg-background px-2 text-xs font-medium outline-none focus:border-primary";

  return (
    <div className="space-y-3">
      {!hideHeader && (
      <div className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-border bg-muted/30 px-4 py-2.5 text-xs">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-foreground">{title ?? SKILL_LABEL[skill]}</span>
          <span
            className={cn(
              "rounded-md px-1.5 py-0.5 text-[10px] font-bold",
              maxCount !== undefined && list.length === maxCount
                ? "bg-emerald-500/10 text-emerald-600"
                : "bg-amber-500/10 text-amber-600",
            )}
          >
            {list.length}
            {maxCount !== undefined ? `/${maxCount}` : ""}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {!hideBank && (
          <button
            onClick={() => setBankOpen((v) => !v)}
            disabled={isFull}
            className={cn(
              "inline-flex items-center gap-1 rounded-lg border px-2.5 py-1 text-[11px] font-semibold transition disabled:opacity-40",
              bankOpen
                ? "border-primary bg-primary/10 text-primary"
                : "border-border bg-background hover:bg-muted",
            )}
          >
            <ListChecks className="h-3 w-3" />
            {bankOpen ? "Đóng ngân hàng" : "Thêm từ ngân hàng"}
          </button>
          )}
          <button
            onClick={addNew}
            disabled={isFull}
            className="inline-flex items-center gap-1 rounded-lg bg-foreground px-2.5 py-1 text-[11px] font-semibold text-background disabled:opacity-40"
          >
            <Plus className="h-3 w-3" /> Thêm câu hỏi
          </button>
        </div>
      </div>
      )}

      {!hideBank && bankOpen && (
        <div className="overflow-hidden rounded-2xl border border-border bg-background">
          <div className="flex flex-wrap items-center gap-2 border-b border-border bg-muted/30 px-3 py-2.5 text-xs">
            <span className="font-semibold text-foreground">Ngân hàng câu hỏi</span>
            <div className="flex items-center gap-1.5">
              <span className="text-muted-foreground">Cấp</span>
              <select
                value={bankLevel}
                onChange={(e) => setBankLevel(e.target.value as QLevel | "all")}
                className={bankSelectClass}
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
                value={bankDiff}
                onChange={(e) => setBankDiff(e.target.value as QDifficulty | "all")}
                className={bankSelectClass}
              >
                <option value="all">Tất cả</option>
                <option value="easy">{DIFFICULTY_LABEL.easy}</option>
                <option value="medium">{DIFFICULTY_LABEL.medium}</option>
                <option value="hard">{DIFFICULTY_LABEL.hard}</option>
              </select>
            </div>
            <input
              value={bankSearch}
              onChange={(e) => setBankSearch(e.target.value)}
              placeholder="Tìm câu..."
              className="h-8 min-w-[140px] flex-1 rounded-lg border border-border bg-background px-2.5 text-xs outline-none focus:border-primary"
            />
          </div>
          <ul className="max-h-[360px] divide-y divide-border overflow-y-auto text-sm">
            {bankCandidates.map((q) => {
              const on = list.some((c) => c.id === `BK-${q.id}`);
              const full = isFull && !on;
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
                      <span className="rounded-md bg-muted px-1.5 py-0.5 font-semibold">
                        {TYPE_LABEL[q.type]}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => addFromBank(q)}
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
            {bankCandidates.length === 0 && (
              <li className="px-4 py-8 text-center text-xs text-muted-foreground">
                Không có câu hỏi nào khớp bộ lọc hiện tại.
              </li>
            )}
          </ul>
        </div>
      )}

      {list.length === 0 && (
        <div className="rounded-2xl border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
          Chưa có câu hỏi nào. Nhấn “Thêm câu hỏi” để bắt đầu soạn.
        </div>
      )}

      <div className="space-y-3">
        {list.map((c, idx) => {
          const isMcq = c.type === "mcq";
          return (
            <div key={c.id} className="overflow-hidden rounded-2xl border border-border bg-background">
              <div className="flex items-center justify-between gap-2 border-b border-border bg-muted/30 px-3 py-2 text-xs">
                <div className="flex items-center gap-2">
                  <span className="inline-flex h-6 w-6 items-center justify-center rounded-md bg-foreground text-[11px] font-bold text-background">
                    {idx + 1}
                  </span>
                  <span className="font-mono text-[10px] text-muted-foreground">{c.id}</span>
                </div>
                <div className="flex items-center gap-1">
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
                    onClick={() => removeAt(idx)}
                    className="rounded-md p-1 text-rose-500 hover:bg-rose-500/10"
                    title="Xóa"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
              <div className="space-y-2.5 p-3">
                <div className="grid gap-2 sm:grid-cols-3">
                  <label className="text-[11px] font-semibold text-muted-foreground">
                    Loại câu hỏi
                    <select
                      value={c.type}
                      onChange={(e) => {
                        const t = e.target.value as QType;
                        updateAt(idx, {
                          type: t,
                          options: t === "mcq" ? c.options ?? ["", "", "", ""] : undefined,
                          correctAnswer: t === "mcq" ? "A" : t === "tf" ? "True" : undefined,
                          points: t === "essay" ? 5 : t === "short" ? 2 : 1,
                        });
                      }}
                      className={cn(inputClass, "mt-1")}
                    >
                      {allowedTypes.map((t) => (
                        <option key={t} value={t}>
                          {TYPE_LABEL[t]}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="text-[11px] font-semibold text-muted-foreground">
                    Cấp độ
                    <select
                      value={c.level}
                      onChange={(e) => updateAt(idx, { level: e.target.value as QLevel })}
                      className={cn(inputClass, "mt-1")}
                    >
                      {LEVELS.map((l) => (
                        <option key={l} value={l}>
                          {l}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="text-[11px] font-semibold text-muted-foreground">
                    Độ khó
                    <select
                      value={c.difficulty}
                      onChange={(e) => updateAt(idx, { difficulty: e.target.value as QDifficulty })}
                      className={cn(inputClass, "mt-1")}
                    >
                      <option value="easy">{DIFFICULTY_LABEL.easy}</option>
                      <option value="medium">{DIFFICULTY_LABEL.medium}</option>
                      <option value="hard">{DIFFICULTY_LABEL.hard}</option>
                    </select>
                  </label>
                </div>
                <label className="block text-[11px] font-semibold text-muted-foreground">
                  Nội dung câu hỏi
                  <textarea
                    value={c.content}
                    onChange={(e) => updateAt(idx, { content: e.target.value })}
                    rows={2}
                    placeholder="Nhập đề bài..."
                    className={cn(inputClass, "mt-1 font-normal text-foreground")}
                  />
                </label>

                {isMcq && (
                  <div className="space-y-1.5">
                    <div className="text-[11px] font-semibold text-muted-foreground">Đáp án</div>
                    {(c.options ?? ["", "", "", ""]).map((opt, oi) => {
                      const letter = String.fromCharCode(65 + oi);
                      const correct = c.correctAnswer === letter;
                      return (
                        <div key={oi} className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => updateAt(idx, { correctAnswer: letter })}
                            className={cn(
                              "inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-[11px] font-bold",
                              correct
                                ? "bg-emerald-500 text-white"
                                : "bg-muted text-muted-foreground hover:bg-muted/70",
                            )}
                            title={correct ? "Đáp án đúng" : "Đặt làm đáp án đúng"}
                          >
                            {letter}
                          </button>
                          <input
                            value={opt}
                            onChange={(e) => {
                              const next = [...(c.options ?? ["", "", "", ""])];
                              next[oi] = e.target.value;
                              updateAt(idx, { options: next });
                            }}
                            placeholder={`Phương án ${letter}`}
                            className={inputClass}
                          />
                        </div>
                      );
                    })}
                  </div>
                )}

                {c.type === "tf" && (
                  <label className="block text-[11px] font-semibold text-muted-foreground">
                    Đáp án đúng
                    <select
                      value={c.correctAnswer ?? "True"}
                      onChange={(e) => updateAt(idx, { correctAnswer: e.target.value })}
                      className={cn(inputClass, "mt-1")}
                    >
                      <option value="True">True</option>
                      <option value="False">False</option>
                    </select>
                  </label>
                )}

                {(c.type === "short" || c.type === "fill") && (
                  <label className="block text-[11px] font-semibold text-muted-foreground">
                    Đáp án tham khảo (tùy chọn)
                    <input
                      value={c.correctAnswer ?? ""}
                      onChange={(e) => updateAt(idx, { correctAnswer: e.target.value })}
                      className={cn(inputClass, "mt-1")}
                      placeholder="VD: Hà Nội"
                    />
                  </label>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
