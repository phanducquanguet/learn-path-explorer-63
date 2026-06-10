import { useMemo, useState } from "react";
import { Check, X, RotateCcw, CheckCircle2, XCircle, Volume2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { BankQuestion, SubQuestion } from "@/lib/question-bank";

/**
 * Trình xem câu hỏi dưới góc nhìn học viên.
 * - Cho phép admin/giáo viên nhập thử đáp án
 * - Bấm "Kiểm tra" để xem đúng/sai và đáp án chuẩn
 */
export function QuestionStudentPreview({ question }: { question: BankQuestion }) {
  const [answer, setAnswer] = useState<any>(() => initialAnswer(question));
  const [checked, setChecked] = useState(false);

  const result = useMemo(
    () => (checked ? grade(question, answer) : null),
    [checked, question, answer],
  );

  const reset = () => {
    setAnswer(initialAnswer(question));
    setChecked(false);
  };

  const isGroup = question.type === "group";

  return (
    <div className="space-y-4">
      {/* Đề bài — ẩn header passage khi là Question Set (sẽ render split-view bên dưới) */}
      {!isGroup && (
        <div className="rounded-2xl border border-border bg-surface p-4">
          {question.imageUrl && (
            <img
              src={question.imageUrl}
              alt=""
              className="mb-3 max-h-60 rounded-lg object-contain"
            />
          )}
          {question.audioUrl && (
            <audio controls src={question.audioUrl} className="mb-3 w-full" />
          )}
          {question.videoUrl && (
            <video controls src={question.videoUrl} className="mb-3 w-full rounded-lg" />
          )}
          <div className="text-sm leading-relaxed">
            {question.passage ? (
              <PassageView passage={question.passage} />
            ) : (
              <span>{question.content}</span>
            )}
          </div>
        </div>
      )}

      {/* Vùng trả lời */}
      <AnswerArea
        question={question}
        answer={answer}
        setAnswer={(v) => {
          setAnswer(v);
          if (checked) setChecked(false);
        }}
        checked={checked}
        result={result}
      />

      {/* Hành động */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="text-xs text-muted-foreground">
          Đang xem dưới góc nhìn <span className="font-semibold text-foreground">học viên</span>.
          Bấm <span className="font-semibold">Kiểm tra</span> để xem đáp án.
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={reset}
            className="inline-flex items-center gap-1 rounded-lg border border-border bg-background px-3 py-1.5 text-xs font-semibold hover:bg-muted"
          >
            <RotateCcw className="h-3 w-3" /> Làm lại
          </button>
          <button
            onClick={() => setChecked(true)}
            className="inline-flex items-center gap-1.5 rounded-lg bg-foreground px-3 py-1.5 text-xs font-semibold text-background hover:opacity-90"
          >
            <Check className="h-3.5 w-3.5" /> Kiểm tra
          </button>
        </div>
      </div>

      {/* Kết quả tổng */}
      {checked && result && (
        <div
          className={cn(
            "flex items-start gap-2 rounded-xl border p-3 text-sm",
            result.correct
              ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
              : "border-rose-500/40 bg-rose-500/10 text-rose-700 dark:text-rose-300",
          )}
        >
          {result.correct ? (
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
          ) : (
            <XCircle className="mt-0.5 h-4 w-4 shrink-0" />
          )}
          <div>
            <div className="font-semibold">
              {result.correct ? "Chính xác!" : "Chưa đúng"}
            </div>
            {result.detail && <div className="mt-0.5 text-xs opacity-90">{result.detail}</div>}
          </div>
        </div>
      )}
    </div>
  );
}

/* ============================================================
 * Khu vực trả lời cho từng loại câu hỏi
 * ============================================================ */

function AnswerArea({
  question,
  answer,
  setAnswer,
  checked,
  result,
}: {
  question: BankQuestion;
  answer: any;
  setAnswer: (v: any) => void;
  checked: boolean;
  result: { correct: boolean; detail?: string } | null;
}) {
  const t = question.type;

  if (t === "mcq" || t === "tf") {
    const options = t === "tf" ? ["True", "False"] : question.options ?? [];
    const correctLetter = (question.correctAnswer ?? "").trim();
    return (
      <div className="space-y-2">
        {options.map((opt, i) => {
          const letter = t === "tf" ? opt : String.fromCharCode(65 + i);
          const isSelected = answer === letter;
          const isCorrect = letter === correctLetter || opt.startsWith(correctLetter);
          return (
            <button
              key={i}
              onClick={() => setAnswer(letter)}
              className={cn(
                "flex w-full items-start gap-3 rounded-xl border px-3 py-2.5 text-left text-sm transition",
                checked && isCorrect && "border-emerald-500/60 bg-emerald-500/10",
                checked && isSelected && !isCorrect && "border-rose-500/60 bg-rose-500/10",
                !checked && isSelected && "border-primary bg-primary/5",
                !checked && !isSelected && "border-border hover:bg-muted/50",
              )}
            >
              <span className="mt-0.5 font-mono text-xs font-bold">{letter}.</span>
              <span className="flex-1">{opt}</span>
              {checked && isCorrect && <Check className="h-4 w-4 text-emerald-600" />}
              {checked && isSelected && !isCorrect && <X className="h-4 w-4 text-rose-600" />}
            </button>
          );
        })}
      </div>
    );
  }

  if (t === "mcq-multi") {
    const options = question.options ?? [];
    const correctSet = new Set((question.correctAnswer ?? "").split(",").map((s) => s.trim()));
    const selected: string[] = answer ?? [];
    const toggle = (letter: string) => {
      if (selected.includes(letter)) setAnswer(selected.filter((l) => l !== letter));
      else setAnswer([...selected, letter]);
    };
    return (
      <div className="space-y-2">
        {options.map((opt, i) => {
          const letter = String.fromCharCode(65 + i);
          const isSelected = selected.includes(letter);
          const isCorrect = correctSet.has(letter);
          return (
            <button
              key={i}
              onClick={() => toggle(letter)}
              className={cn(
                "flex w-full items-start gap-3 rounded-xl border px-3 py-2.5 text-left text-sm transition",
                checked && isCorrect && "border-emerald-500/60 bg-emerald-500/10",
                checked && isSelected && !isCorrect && "border-rose-500/60 bg-rose-500/10",
                !checked && isSelected && "border-primary bg-primary/5",
                !checked && !isSelected && "border-border hover:bg-muted/50",
              )}
            >
              <span
                className={cn(
                  "mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded border",
                  isSelected ? "border-primary bg-primary text-primary-foreground" : "border-border",
                )}
              >
                {isSelected && <Check className="h-3 w-3" />}
              </span>
              <span className="flex-1">
                <span className="font-mono text-xs font-bold">{letter}.</span> {opt}
              </span>
            </button>
          );
        })}
      </div>
    );
  }

  if (t === "short") {
    return (
      <div className="space-y-2">
        <input
          value={answer ?? ""}
          onChange={(e) => setAnswer(e.target.value)}
          placeholder="Nhập câu trả lời..."
          className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm"
        />
        {checked && (
          <div className="rounded-lg border border-emerald-500/40 bg-emerald-500/5 px-3 py-2 text-xs">
            <span className="font-semibold">Đáp án đúng:</span> {question.correctAnswer || "—"}
          </div>
        )}
      </div>
    );
  }

  if (t === "sequence") {
    const items: string[] = answer ?? question.options ?? [];
    const correct = (question.correctAnswer ?? "")
      .split(",")
      .map((n) => Number(n.trim()) - 1);
    const move = (from: number, to: number) => {
      const next = [...items];
      const [v] = next.splice(from, 1);
      next.splice(to, 0, v);
      setAnswer(next);
    };
    return (
      <div className="space-y-2">
        {items.map((it, i) => {
          const originalIdx = (question.options ?? []).indexOf(it);
          const isCorrectPos = checked && correct[i] === originalIdx;
          return (
            <div
              key={i}
              className={cn(
                "flex items-center gap-2 rounded-xl border px-3 py-2 text-sm",
                checked && isCorrectPos && "border-emerald-500/60 bg-emerald-500/10",
                checked && !isCorrectPos && "border-rose-500/60 bg-rose-500/10",
                !checked && "border-border",
              )}
            >
              <span className="font-mono text-xs text-muted-foreground">{i + 1}.</span>
              <span className="flex-1">{it}</span>
              <button
                onClick={() => i > 0 && move(i, i - 1)}
                className="rounded p-1 text-xs hover:bg-muted disabled:opacity-30"
                disabled={i === 0}
              >
                ↑
              </button>
              <button
                onClick={() => i < items.length - 1 && move(i, i + 1)}
                className="rounded p-1 text-xs hover:bg-muted disabled:opacity-30"
                disabled={i === items.length - 1}
              >
                ↓
              </button>
            </div>
          );
        })}
        {checked && (
          <div className="rounded-lg border border-emerald-500/40 bg-emerald-500/5 px-3 py-2 text-xs">
            <span className="font-semibold">Thứ tự đúng:</span>{" "}
            {correct.map((idx) => (question.options ?? [])[idx]).join(" → ")}
          </div>
        )}
      </div>
    );
  }

  if (t === "fill" || t === "drag-drop" || t === "select-lists") {
    const blanks = question.blanks ?? [];
    const values: Record<number, string> = answer ?? {};
    const setBlank = (idx: number, v: string) => setAnswer({ ...values, [idx]: v });
    const pool =
      t === "drag-drop"
        ? [
            ...blanks.flatMap((b) => b.answers),
            ...(question.distractors ?? []),
          ]
        : [];
    return (
      <div className="space-y-3">
        <div className="rounded-xl border border-border bg-background p-3 text-sm leading-7">
          <ClozeRender
            passage={question.passage ?? ""}
            blanks={blanks}
            values={values}
            checked={checked}
            type={t}
            onChange={setBlank}
          />
        </div>
        {t === "drag-drop" && (
          <div className="flex flex-wrap gap-1.5 rounded-xl border border-dashed border-border p-2">
            <span className="text-[11px] font-semibold text-muted-foreground">Từ kéo:</span>
            {pool.map((w, i) => (
              <span
                key={i}
                className="rounded-md border border-border bg-muted px-2 py-0.5 text-xs"
              >
                {w}
              </span>
            ))}
          </div>
        )}
        {checked && (
          <div className="rounded-lg border border-emerald-500/40 bg-emerald-500/5 px-3 py-2 text-xs">
            <div className="font-semibold">Đáp án đúng:</div>
            {blanks.map((b) => {
              const ans =
                t === "select-lists"
                  ? b.options?.[b.correctOption ?? 0] ?? ""
                  : b.answers.join(" / ");
              return (
                <div key={b.index}>
                  [{b.index}] {ans}
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  if (t === "matching") {
    const pairs = question.matchingPairs ?? [];
    const targets = Array.from(new Set(pairs.map((p) => p.target)));
    const values: Record<number, string> = answer ?? {};
    return (
      <div className="space-y-2">
        {pairs.map((p, i) => {
          const v = values[i] ?? "";
          const isCorrect = v === p.target;
          return (
            <div
              key={i}
              className={cn(
                "flex items-center gap-3 rounded-xl border px-3 py-2 text-sm",
                checked && isCorrect && "border-emerald-500/60 bg-emerald-500/10",
                checked && !isCorrect && "border-rose-500/60 bg-rose-500/10",
                !checked && "border-border",
              )}
            >
              <div className="flex flex-1 items-center gap-2">
                {p.itemImage && (
                  <img src={p.itemImage} alt="" className="h-10 w-10 rounded object-cover" />
                )}
                {p.itemAudio && <Volume2 className="h-4 w-4 text-muted-foreground" />}
                <span className="font-medium">{p.item}</span>
              </div>
              <span className="text-muted-foreground">→</span>
              <select
                value={v}
                onChange={(e) => setAnswer({ ...values, [i]: e.target.value })}
                className="rounded-md border border-border bg-background px-2 py-1 text-sm"
              >
                <option value="">— Chọn —</option>
                {targets.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
              {checked && !isCorrect && (
                <span className="text-xs text-emerald-600">({p.target})</span>
              )}
            </div>
          );
        })}
      </div>
    );
  }

  if (t === "error-correction") {
    const errors = question.errors ?? [];
    const values: Record<number, string> = answer ?? {};
    return (
      <div className="space-y-3">
        <div className="rounded-lg border border-dashed border-border bg-muted/30 px-3 py-2 text-[11px] text-muted-foreground">
          Hướng dẫn: với mỗi cụm <span className="line-through text-rose-600">gạch ngang đỏ</span> trong đoạn văn, hãy gõ lại từ/cụm đúng vào ô bên dưới (có thể là một hoặc nhiều từ).
        </div>
        <div className="rounded-xl border border-border bg-background p-4 text-sm leading-[2.6]">
          {renderErrorCorrection(question.passage ?? "", errors, values, (idx, v) =>
            setAnswer({ ...values, [idx]: v }),
          )}
        </div>
        {checked && (
          <div className="rounded-lg border border-emerald-500/40 bg-emerald-500/5 px-3 py-2 text-xs">
            <div className="font-semibold">Sửa đúng:</div>
            {errors.map((e) => (
              <div key={e.index}>
                [{e.index}] <span className="line-through text-rose-600">{e.wrong}</span> →{" "}
                <span className="text-emerald-700 dark:text-emerald-400">{e.correct}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  if (t === "essay") {
    return (
      <div className="space-y-2">
        <textarea
          value={answer ?? ""}
          onChange={(e) => setAnswer(e.target.value)}
          rows={6}
          placeholder="Viết bài của bạn ở đây..."
          className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm"
        />
        <div className="text-[11px] text-muted-foreground">
          {(answer ?? "").trim().split(/\s+/).filter(Boolean).length} từ
        </div>
        {checked && question.solution && (
          <div className="rounded-xl border border-violet-500/30 bg-violet-500/5 p-3 text-xs">
            <div className="font-semibold text-violet-700 dark:text-violet-300">Bài mẫu</div>
            <pre className="mt-1 whitespace-pre-wrap font-sans text-foreground">
              {question.solution}
            </pre>
          </div>
        )}
      </div>
    );
  }

  if (t === "speaking") {
    return (
      <div className="rounded-xl border border-dashed border-border bg-muted/30 p-4 text-sm text-muted-foreground">
        Câu hỏi nói — học viên sẽ thấy nút ghi âm để trả lời theo đề bài.
      </div>
    );
  }

  if (t === "group") {
    const subs = question.subQuestions ?? [];
    const values: Record<string, any> = answer ?? {};
    return (
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* Bài đọc — cột trái, sticky để học viên đọc song song khi cuộn câu hỏi */}
        <div className="lg:sticky lg:top-4 lg:self-start">
          <div className="rounded-2xl border border-border bg-surface">
            <div className="flex items-center justify-between border-b border-border px-4 py-2.5">
              <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Bài đọc
              </div>
              {question.content && (
                <div className="truncate text-xs text-muted-foreground">{question.content}</div>
              )}
            </div>
            <div className="max-h-[70vh] overflow-y-auto p-4">
              {question.imageUrl && (
                <img
                  src={question.imageUrl}
                  alt=""
                  className="mb-3 max-h-60 rounded-lg object-contain"
                />
              )}
              {question.audioUrl && (
                <audio controls src={question.audioUrl} className="mb-3 w-full" />
              )}
              {question.videoUrl && (
                <video controls src={question.videoUrl} className="mb-3 w-full rounded-lg" />
              )}
              <div className="whitespace-pre-wrap text-sm leading-relaxed">
                {question.passage || question.content}
              </div>
            </div>
          </div>
        </div>

        {/* Câu hỏi — cột phải, cuộn độc lập */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Câu hỏi ({subs.length})
            </div>
            <div className="text-xs text-muted-foreground">
              Đọc bài bên trái, trả lời câu hỏi bên phải.
            </div>
          </div>
          {subs.map((sub, i) => (
            <div key={sub.id} className="rounded-xl border border-border bg-surface p-3">
              <div className="mb-2 text-xs font-semibold text-muted-foreground">
                Câu {i + 1}: {sub.content}
              </div>
              <SubAnswerArea
                sub={sub}
                value={values[sub.id]}
                onChange={(v) => setAnswer({ ...values, [sub.id]: v })}
                checked={checked}
              />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-dashed border-border p-4 text-sm text-muted-foreground">
      Loại câu hỏi này chưa hỗ trợ xem trước góc nhìn học viên.
    </div>
  );
}

function SubAnswerArea({
  sub,
  value,
  onChange,
  checked,
}: {
  sub: SubQuestion;
  value: any;
  onChange: (v: any) => void;
  checked: boolean;
}) {
  if (sub.type === "mcq" || sub.type === "tf") {
    const options = sub.type === "tf" ? ["True", "False"] : sub.options ?? [];
    const correct = (sub.correctAnswer ?? "").trim();
    return (
      <div className="space-y-1.5">
        {options.map((opt, i) => {
          const letter = sub.type === "tf" ? opt : String.fromCharCode(65 + i);
          const isSelected = value === letter;
          const isCorrect = letter === correct || opt.startsWith(correct);
          return (
            <button
              key={i}
              onClick={() => onChange(letter)}
              className={cn(
                "flex w-full items-start gap-2 rounded-lg border px-2.5 py-1.5 text-left text-xs",
                checked && isCorrect && "border-emerald-500/60 bg-emerald-500/10",
                checked && isSelected && !isCorrect && "border-rose-500/60 bg-rose-500/10",
                !checked && isSelected && "border-primary bg-primary/5",
                !checked && !isSelected && "border-border hover:bg-muted/50",
              )}
            >
              <span className="font-mono font-bold">{letter}.</span>
              <span className="flex-1">{opt}</span>
            </button>
          );
        })}
      </div>
    );
  }
  return (
    <input
      value={value ?? ""}
      onChange={(e) => onChange(e.target.value)}
      placeholder="Trả lời..."
      className="w-full rounded-lg border border-border bg-background px-2.5 py-1.5 text-xs"
    />
  );
}

/* ============================================================
 * Helpers
 * ============================================================ */

function PassageView({ passage }: { passage: string }) {
  // Render passage có [n] như literal — chỉ dùng cho hiển thị non-interactive
  return <span className="whitespace-pre-wrap">{passage}</span>;
}

function ClozeRender({
  passage,
  blanks,
  values,
  checked,
  type,
  onChange,
}: {
  passage: string;
  blanks: { index: number; answers: string[]; options?: string[]; correctOption?: number }[];
  values: Record<number, string>;
  checked: boolean;
  type: "fill" | "drag-drop" | "select-lists";
  onChange: (idx: number, v: string) => void;
}) {
  const parts = passage.split(/(\[\d+\])/g);
  return (
    <>
      {parts.map((part, i) => {
        const m = part.match(/^\[(\d+)\]$/);
        if (!m) return <span key={i}>{part}</span>;
        const idx = Number(m[1]);
        const blank = blanks.find((b) => b.index === idx);
        const v = values[idx] ?? "";
        const isCorrect = blank ? isBlankCorrect(blank, v, type) : false;
        if (type === "select-lists" && blank?.options) {
          return (
            <select
              key={i}
              value={v}
              onChange={(e) => onChange(idx, e.target.value)}
              className={cn(
                "mx-1 inline-block rounded-md border bg-background px-2 py-0.5 text-sm",
                checked && isCorrect && "border-emerald-500/60 bg-emerald-500/10",
                checked && !isCorrect && "border-rose-500/60 bg-rose-500/10",
                !checked && "border-border",
              )}
            >
              <option value="">—</option>
              {blank.options.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          );
        }
        return (
          <input
            key={i}
            value={v}
            onChange={(e) => onChange(idx, e.target.value)}
            placeholder={`[${idx}]`}
            className={cn(
              "mx-1 inline-block w-24 rounded-md border bg-background px-2 py-0.5 text-sm",
              checked && isCorrect && "border-emerald-500/60 bg-emerald-500/10",
              checked && !isCorrect && "border-rose-500/60 bg-rose-500/10",
              !checked && "border-border",
            )}
          />
        );
      })}
    </>
  );
}

function renderErrorCorrection(
  passage: string,
  errors: { index: number; wrong: string; correct: string }[],
  values: Record<number, string>,
  onChange: (idx: number, v: string) => void,
) {
  const parts = passage.split(/(\[\d+\])/g);
  return parts.map((part, i) => {
    const m = part.match(/^\[(\d+)\]$/);
    if (!m) return <span key={i}>{part}</span>;
    const idx = Number(m[1]);
    const err = errors.find((e) => e.index === idx);
    const wrongText = err?.wrong ?? "";
    const correctText = err?.correct ?? "";
    // Chiều rộng input ước theo độ dài từ sai / đáp án (hỗ trợ nhiều từ)
    const ch = Math.max(8, wrongText.length, correctText.length) + 2;
    return (
      <span
        key={i}
        className="mx-1 inline-flex flex-col items-center align-middle gap-0.5"
      >
        <span
          className="rounded bg-rose-500/10 px-1.5 py-0.5 text-xs text-rose-600 line-through whitespace-nowrap"
          title="Cụm sai cần sửa"
        >
          {wrongText || "—"}
        </span>
        <input
          value={values[idx] ?? ""}
          onChange={(e) => onChange(idx, e.target.value)}
          placeholder="viết lại cho đúng..."
          style={{ width: `${ch}ch` }}
          className="inline-block min-w-[6rem] max-w-full rounded-md border border-emerald-500/40 bg-background px-1.5 py-0.5 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-emerald-500"
        />
      </span>
    );
  });
}

/* ============================================================
 * Logic chấm
 * ============================================================ */

function initialAnswer(q: BankQuestion): any {
  if (q.type === "mcq" || q.type === "tf") return "";
  if (q.type === "mcq-multi") return [];
  if (q.type === "sequence") return [...(q.options ?? [])];
  if (q.type === "fill" || q.type === "drag-drop" || q.type === "select-lists") return {};
  if (q.type === "matching") return {};
  if (q.type === "error-correction") return {};
  if (q.type === "group") return {};
  return "";
}

function isBlankCorrect(
  blank: { answers: string[]; options?: string[]; correctOption?: number },
  v: string,
  type: "fill" | "drag-drop" | "select-lists",
) {
  if (type === "select-lists") {
    return v === (blank.options?.[blank.correctOption ?? 0] ?? "");
  }
  return blank.answers.some((a) => a.trim().toLowerCase() === v.trim().toLowerCase());
}

function grade(q: BankQuestion, a: any): { correct: boolean; detail?: string } {
  const t = q.type;
  if (t === "mcq" || t === "tf") {
    const correct = (q.correctAnswer ?? "").trim();
    const ok =
      a === correct ||
      (q.options ?? []).some((o, i) => String.fromCharCode(65 + i) === a && o.startsWith(correct));
    return { correct: ok, detail: ok ? "" : `Đáp án đúng: ${correct}` };
  }
  if (t === "mcq-multi") {
    const correct = (q.correctAnswer ?? "").split(",").map((s) => s.trim()).filter(Boolean).sort();
    const ans = ((a as string[]) ?? []).slice().sort();
    const ok = correct.length === ans.length && correct.every((c, i) => c === ans[i]);
    return { correct: ok, detail: ok ? "" : `Đáp án đúng: ${correct.join(", ")}` };
  }
  if (t === "short") {
    const ok = (a ?? "").trim().toLowerCase() === (q.correctAnswer ?? "").trim().toLowerCase();
    return { correct: ok };
  }
  if (t === "sequence") {
    const correct = (q.correctAnswer ?? "").split(",").map((n) => Number(n.trim()) - 1);
    const ordered = (a as string[]) ?? [];
    const ok = correct.every((idx, i) => (q.options ?? [])[idx] === ordered[i]);
    return { correct: ok };
  }
  if (t === "fill" || t === "drag-drop" || t === "select-lists") {
    const blanks = q.blanks ?? [];
    const values = (a as Record<number, string>) ?? {};
    const wrong = blanks.filter((b) => !isBlankCorrect(b, values[b.index] ?? "", t));
    return {
      correct: wrong.length === 0,
      detail: wrong.length > 0 ? `Sai ${wrong.length}/${blanks.length} chỗ trống` : "",
    };
  }
  if (t === "matching") {
    const pairs = q.matchingPairs ?? [];
    const values = (a as Record<number, string>) ?? {};
    const wrong = pairs.filter((p, i) => values[i] !== p.target);
    return { correct: wrong.length === 0, detail: wrong.length > 0 ? `Sai ${wrong.length}/${pairs.length}` : "" };
  }
  if (t === "error-correction") {
    const errors = q.errors ?? [];
    const values = (a as Record<number, string>) ?? {};
    const wrong = errors.filter(
      (e) => (values[e.index] ?? "").trim().toLowerCase() !== e.correct.trim().toLowerCase(),
    );
    return { correct: wrong.length === 0, detail: wrong.length > 0 ? `Sai ${wrong.length}/${errors.length}` : "" };
  }
  if (t === "essay" || t === "speaking") {
    return { correct: true, detail: "Loại tự luận / nói cần giáo viên chấm thủ công." };
  }
  if (t === "group") {
    return { correct: true, detail: "Xem từng câu con để biết đáp án." };
  }
  return { correct: false };
}
