import { useMemo, useState } from "react";
import {
  ChevronDown,
  ChevronRight,
  FileText,
  FileVideo,
  FolderPlus,
  Headphones,
  ListChecks,
  Mic,
  Music2,
  Plus,
  Trash2,
  Upload,
  Image as ImageIcon,
  Pencil,
  Layers,
  CircleDot,
  CheckSquare,
  ToggleLeft,
  Type as TypeIcon,
  ListOrdered,
  GitCompareArrows,
  TextCursorInput,
  MousePointerSquareDashed,
  Move,
  Music as MusicIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  TYPE_LABEL,
  type BankQuestion,
  type QType,
} from "@/lib/question-bank";
import { EditDialog, TYPE_ORDER_COURSE, makeDefaultBankQuestion } from "@/routes/admin.question-bank";

/* ============================== Types ============================== */

type Common = { id: string; title: string; description?: string; requirePrevious?: boolean };

export type VideoNode = Common & {
  kind: "video";
  duration?: number;
  fileName?: string;
  thumbnail?: string;
};
export type VideoSpeakingNode = Common & {
  kind: "video-speaking";
  duration?: number;
  fileName?: string;
  prompt?: string;
};
export type PdfNode = Common & {
  kind: "pdf";
  fileName?: string;
  hiddenFromStudents?: boolean;
};
export type PdfAudioNode = Common & {
  kind: "pdf-audio";
  fileName?: string;
  audioFileName?: string;
  hiddenFromStudents?: boolean;
};
export type PracticeNode = Common & {
  kind: "practice";
  instructions?: string;
  audioFileName?: string;
  questions: QuestionNode[];
  maxAttempts?: number | null;
  passingScore?: number;
};
/** Câu hỏi giờ là wrapper mỏng quanh BankQuestion để đồng bộ UI với Ngân hàng câu hỏi. */
export type QuestionNode = {
  id: string;
  kind: "question";
  bank: BankQuestion;
};
export type GroupNode = Common & {
  kind: "group";
  children: AnyNode[];
};
export type AnyNode =
  | VideoNode
  | VideoSpeakingNode
  | PdfNode
  | PdfAudioNode
  | PracticeNode
  | QuestionNode
  | GroupNode;

type LeafKind = Exclude<AnyNode["kind"], "question">;
const ACTIVITY_OPTIONS: { kind: LeafKind; label: string; icon: React.ElementType }[] = [
  { kind: "video", label: "Video bài giảng", icon: FileVideo },
  { kind: "video-speaking", label: "Video + luyện nói", icon: Mic },
  { kind: "pdf", label: "Tài liệu PDF", icon: FileText },
  { kind: "pdf-audio", label: "PDF kèm audio", icon: Headphones },
  { kind: "practice", label: "Bài thực hành", icon: ListChecks },
];

const KIND_ICON: Record<Exclude<AnyNode["kind"], "question">, React.ElementType> = {
  group: FolderPlus,
  video: FileVideo,
  "video-speaking": Mic,
  pdf: FileText,
  "pdf-audio": Headphones,
  practice: ListChecks,
};

const KIND_LABEL: Record<Exclude<AnyNode["kind"], "question">, string> = {
  group: "Group",
  video: "Video",
  "video-speaking": "Video + Nói",
  pdf: "PDF",
  "pdf-audio": "PDF + Audio",
  practice: "Thực hành",
};

const Q_TYPE_ICON: Record<QType, React.ElementType> = {
  mcq: CircleDot,
  "mcq-multi": CheckSquare,
  tf: ToggleLeft,
  short: TypeIcon,
  sequence: ListOrdered,
  matching: GitCompareArrows,
  fill: TextCursorInput,
  "select-lists": MousePointerSquareDashed,
  "drag-drop": Move,
  essay: FileText,
  speaking: MusicIcon,
  "error-correction": Pencil,
  group: Layers,
};

const CONTAINER_KINDS: AnyNode["kind"][] = ["group", "practice"];
const isContainer = (k: AnyNode["kind"]) => CONTAINER_KINDS.includes(k);

/* ============================== Helpers ============================== */

const uid = () => `n-${Math.random().toString(36).slice(2, 9)}`;

function makeNode(kind: Exclude<AnyNode["kind"], "question">): AnyNode {
  const base = { id: uid() };
  switch (kind) {
    case "group":
      return { ...base, kind, title: "Nhóm mới", description: "", children: [] };
    case "video":
      return { ...base, kind, title: "Video bài giảng", description: "", duration: 10 };
    case "video-speaking":
      return { ...base, kind, title: "Video luyện nói", description: "", duration: 5, prompt: "" };
    case "pdf":
      return { ...base, kind, title: "Tài liệu PDF", description: "" };
    case "pdf-audio":
      return { ...base, kind, title: "PDF kèm audio", description: "" };
    case "practice":
      return { ...base, kind, title: "Bài thực hành", description: "", instructions: "", questions: [] };
  }
}

function makeQuestionFromBank(bank: BankQuestion): QuestionNode {
  return { id: uid(), kind: "question", bank };
}

function mapTree(nodes: AnyNode[], fn: (n: AnyNode) => AnyNode | null): AnyNode[] {
  const out: AnyNode[] = [];
  for (const n of nodes) {
    const next = fn(n);
    if (!next) continue;
    if (next.kind === "group") {
      out.push({ ...next, children: mapTree(next.children, fn) });
    } else if (next.kind === "practice") {
      const qs: QuestionNode[] = [];
      for (const q of next.questions) {
        const r = fn(q);
        if (r && r.kind === "question") qs.push(r);
      }
      out.push({ ...next, questions: qs });
    } else {
      out.push(next);
    }
  }
  return out;
}

function findNode(nodes: AnyNode[], id: string): AnyNode | null {
  for (const n of nodes) {
    if (n.id === id) return n;
    if (n.kind === "group") {
      const x = findNode(n.children, id);
      if (x) return x;
    }
    if (n.kind === "practice") {
      const q = n.questions.find((q) => q.id === id);
      if (q) return q;
    }
  }
  return null;
}

function addInto(nodes: AnyNode[], parentId: string | null, child: AnyNode): AnyNode[] {
  if (parentId === null) return [...nodes, child];
  return nodes.map((n) => {
    if (n.kind === "group") {
      if (n.id === parentId) return { ...n, children: [...n.children, child] };
      return { ...n, children: addInto(n.children, parentId, child) };
    }
    if (n.kind === "practice" && n.id === parentId && child.kind === "question") {
      return { ...n, questions: [...n.questions, child] };
    }
    return n;
  });
}

function containerCount(n: AnyNode): number {
  if (n.kind === "group") return n.children.length;
  if (n.kind === "practice") return n.questions.length;
  return 0;
}

function questionLabel(q: QuestionNode) {
  return q.bank.content?.trim() || q.bank.passage?.trim() || "Chưa có nội dung";
}

/* ============================== Component ============================== */

export function UnitActivityBuilder({
  nodes,
  onChange,
}: {
  nodes: AnyNode[];
  onChange: (nodes: AnyNode[]) => void;
}) {
  const [selectedId, setSelectedId] = useState<string | null>(nodes[0]?.id ?? null);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [addMenuFor, setAddMenuFor] = useState<string | null>("__root__");
  const [qTypeMenuFor, setQTypeMenuFor] = useState<string | null>(null); // practiceId

  const selected = useMemo(() => (selectedId ? findNode(nodes, selectedId) : null), [nodes, selectedId]);

  const updateNode = (id: string, patch: Partial<AnyNode>) => {
    onChange(mapTree(nodes, (n) => (n.id === id ? ({ ...n, ...patch } as AnyNode) : n)));
  };
  const removeNode = (id: string) => {
    onChange(mapTree(nodes, (n) => (n.id === id ? null : n)));
    if (selectedId === id) setSelectedId(null);
  };
  const addNode = (parentId: string | null, node: AnyNode) => {
    onChange(addInto(nodes, parentId, node));
    setSelectedId(node.id);
    if (parentId) setExpanded((e) => ({ ...e, [parentId]: true }));
    setAddMenuFor(null);
  };

  // Tạo câu hỏi mới với type đã chọn, chèn vào practice và chọn để chỉnh sửa
  const createQuestionOfType = (practiceId: string, type: QType) => {
    const bank = makeDefaultBankQuestion(type);
    const q = makeQuestionFromBank(bank);
    onChange(addInto(nodes, practiceId, q));
    setSelectedId(q.id);
    setExpanded((e) => ({ ...e, [practiceId]: true }));
    setQTypeMenuFor(null);
  };
  const updateQuestionBank = (questionId: string, bank: BankQuestion) => {
    onChange(
      mapTree(nodes, (n) =>
        n.kind === "question" && n.id === questionId ? { ...n, bank } : n,
      ),
    );
  };

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-[340px_1fr]">
      {/* LEFT: tree */}
      <div className="rounded-2xl border border-border bg-background p-3">
        <div className="mb-2 flex items-center justify-between px-1">
          <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Cấu trúc nội dung
          </div>
          <AddActivityMenuButton open={addMenuFor === "__root__"} onToggle={(v) => setAddMenuFor(v ? "__root__" : null)} onPick={(n) => addNode(null, n)} />
        </div>

        <div className="mb-2 flex items-center gap-3 px-1 text-[10px] text-muted-foreground">
          <span className="inline-flex items-center gap-1"><Layers className="h-3 w-3 text-amber-500" /> Khối chứa</span>
          <span className="inline-flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-muted-foreground" /> Mục lẻ</span>
        </div>

        {nodes.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border p-6 text-center text-xs text-muted-foreground">
            Bấm <span className="font-semibold text-foreground">+</span> để thêm activity hoặc group.
          </div>
        ) : (
          <ul className="space-y-0.5">
            {nodes.map((n) => (
              <TreeRow
                key={n.id}
                node={n}
                depth={0}
                selectedId={selectedId}
                expanded={expanded}
                addMenuFor={addMenuFor}
                qTypeMenuFor={qTypeMenuFor}
                onSelect={(id) => setSelectedId(id)}
                onToggle={(id) => setExpanded((e) => ({ ...e, [id]: !e[id] }))}
                onRemove={removeNode}
                onAdd={addNode}
                onOpenAddMenu={setAddMenuFor}
                onOpenQTypeMenu={setQTypeMenuFor}
                onPickQuestionType={createQuestionOfType}
              />
            ))}
          </ul>
        )}
      </div>

      {/* RIGHT: editor */}
      <div className="rounded-2xl border border-border bg-background p-5">
        {!selected ? (
          <div className="flex h-full min-h-[280px] items-center justify-center text-sm text-muted-foreground">
            Chọn một mục bên trái để chỉnh sửa nội dung.
          </div>
        ) : selected.kind === "question" ? (
          <EditDialog
            key={selected.id}
            embedded
            autoSave
            editableType
            hideLevelDifficulty
            question={selected.bank}
            onClose={() => setSelectedId(null)}
            onSave={(bank) => updateQuestionBank(selected.id, bank)}
            onDelete={() => removeNode(selected.id)}
          />
        ) : (
          <NodeEditor
            node={selected}
            onChange={(p) => updateNode(selected.id, p)}
            onRemove={() => removeNode(selected.id)}
            onAddQuestion={(practiceId) => {
              setQTypeMenuFor(practiceId);
              setExpanded((e) => ({ ...e, [practiceId]: true }));
            }}
            onEditQuestion={(id) => setSelectedId(id)}
            onPickQuestionType={createQuestionOfType}
            qTypeMenuFor={qTypeMenuFor}
            onOpenQTypeMenu={setQTypeMenuFor}
          />
        )}
      </div>
    </div>
  );
}

/* ============================== Tree row ============================== */

function TreeRow({
  node,
  depth,
  selectedId,
  expanded,
  addMenuFor,
  qTypeMenuFor,
  onSelect,
  onToggle,
  onRemove,
  onAdd,
  onOpenAddMenu,
  onOpenQTypeMenu,
  onPickQuestionType,
}: {
  node: AnyNode;
  depth: number;
  selectedId: string | null;
  expanded: Record<string, boolean>;
  addMenuFor: string | null;
  qTypeMenuFor: string | null;
  onSelect: (id: string) => void;
  onToggle: (id: string) => void;
  onRemove: (id: string) => void;
  onAdd: (parentId: string | null, n: AnyNode) => void;
  onOpenAddMenu: (id: string | null) => void;
  onOpenQTypeMenu: (id: string | null) => void;
  onPickQuestionType: (practiceId: string, type: QType) => void;
}) {
  const isQuestion = node.kind === "question";
  const Icon = isQuestion ? Q_TYPE_ICON[node.bank.type] : KIND_ICON[node.kind];
  const container = isContainer(node.kind);
  const isOpen = container && (expanded[node.id] ?? true);
  const isSelected = selectedId === node.id;
  const count = container ? containerCount(node) : 0;

  const children: AnyNode[] =
    node.kind === "group" ? node.children : node.kind === "practice" ? node.questions : [];

  const title = isQuestion ? questionLabel(node) : node.title;
  const kindLabel = isQuestion ? TYPE_LABEL[node.bank.type] : KIND_LABEL[node.kind];

  const rowCls = container
    ? cn(
        "group flex items-center gap-1 rounded-lg border px-1.5 py-2 text-sm font-medium transition",
        isSelected
          ? "border-primary/40 bg-primary/10 text-primary"
          : "border-amber-200/60 bg-amber-50/40 dark:border-amber-900/30 dark:bg-amber-950/20 text-foreground hover:bg-amber-50/70",
      )
    : cn(
        "group flex items-center gap-1 rounded-lg px-1.5 py-1.5 text-sm",
        isSelected ? "bg-primary/10 text-primary" : "hover:bg-muted/60 text-foreground",
      );

  return (
    <li>
      <div className={rowCls} style={{ paddingLeft: 6 + depth * 14 }}>
        {container ? (
          <button onClick={() => onToggle(node.id)} className="rounded p-0.5 text-muted-foreground hover:bg-muted">
            {isOpen ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
          </button>
        ) : (
          <span className="flex w-4 items-center justify-center">
            <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/60" />
          </span>
        )}
        <Icon
          className={cn(
            "h-3.5 w-3.5 shrink-0",
            isSelected ? "text-primary" : container ? "text-amber-600" : "text-muted-foreground",
          )}
        />
        <button onClick={() => onSelect(node.id)} className="flex-1 truncate text-left">
          {title || <span className="italic text-muted-foreground">Chưa đặt tên</span>}
        </button>
        {container && (
          <span
            className={cn(
              "rounded-full px-1.5 py-0.5 text-[10px] font-semibold",
              isSelected ? "bg-primary/20 text-primary" : "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
            )}
            title={`${count} mục con`}
          >
            {count}
          </span>
        )}
        <span className="hidden text-[10px] uppercase tracking-wider text-muted-foreground group-hover:inline">
          {kindLabel}
        </span>
        {node.kind === "group" && (
          <AddActivityMenuButton
            small
            open={addMenuFor === node.id}
            onToggle={(v) => onOpenAddMenu(v ? node.id : null)}
            onPick={(n) => onAdd(node.id, n)}
          />
        )}
        {node.kind === "practice" && (
          <QuestionTypeMenuButton
            small
            open={qTypeMenuFor === node.id}
            onToggle={(v) => onOpenQTypeMenu(v ? node.id : null)}
            onPick={(t) => onPickQuestionType(node.id, t)}
          />
        )}
        <button onClick={() => onRemove(node.id)} className="rounded p-1 text-muted-foreground opacity-0 hover:bg-destructive/10 hover:text-destructive group-hover:opacity-100">
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>
      {container && isOpen && children.length > 0 && (
        <ul className="relative space-y-0.5">
          <span
            className="pointer-events-none absolute top-0 bottom-1 w-px bg-border"
            style={{ left: 6 + depth * 14 + 8 }}
          />
          {children.map((c) => (
            <TreeRow
              key={c.id}
              node={c}
              depth={depth + 1}
              selectedId={selectedId}
              expanded={expanded}
              addMenuFor={addMenuFor}
              qTypeMenuFor={qTypeMenuFor}
              onSelect={onSelect}
              onToggle={onToggle}
              onRemove={onRemove}
              onAdd={onAdd}
              onOpenAddMenu={onOpenAddMenu}
              onOpenQTypeMenu={onOpenQTypeMenu}
              onPickQuestionType={onPickQuestionType}
            />
          ))}
        </ul>
      )}
    </li>
  );
}

/* ============================== Question type menu ============================== */

function QuestionTypeMenuButton({
  open,
  onToggle,
  onPick,
  small,
}: {
  open: boolean;
  onToggle: (v: boolean) => void;
  onPick: (t: QType) => void;
  small?: boolean;
}) {
  return (
    <div className="relative">
      <button
        onClick={() => onToggle(!open)}
        className={cn(
          "inline-flex items-center gap-1 rounded-lg bg-primary/10 font-semibold text-primary hover:bg-primary/20",
          small ? "px-1.5 py-0.5 text-[10px]" : "px-2.5 py-1.5 text-xs",
        )}
        title="Thêm câu hỏi"
      >
        <Plus className={small ? "h-3 w-3" : "h-3.5 w-3.5"} />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-30" onClick={() => onToggle(false)} />
          <div className="absolute right-0 z-40 mt-1 w-60 rounded-xl border border-border bg-popover p-1.5 shadow-lg">
            <div className="px-2 pb-1 pt-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              Chọn dạng câu hỏi
            </div>
            <div className="max-h-72 overflow-y-auto">
              {TYPE_ORDER_COURSE.map((t) => {
                const I = Q_TYPE_ICON[t];
                return (
                  <button
                    key={t}
                    onClick={() => onPick(t)}
                    className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-xs hover:bg-muted"
                  >
                    <I className="h-3.5 w-3.5 text-primary" /> {TYPE_LABEL[t]}
                  </button>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

/* ============================== Add activity menu ============================== */

function AddActivityMenuButton({
  open,
  onToggle,
  onPick,
  small,
}: {
  open: boolean;
  onToggle: (v: boolean) => void;
  onPick: (n: AnyNode) => void;
  small?: boolean;
}) {
  return (
    <div className="relative">
      <button
        onClick={() => onToggle(!open)}
        className={cn(
          "inline-flex items-center gap-1 rounded-lg bg-primary/10 font-semibold text-primary hover:bg-primary/20",
          small ? "px-1.5 py-0.5 text-[10px]" : "px-2.5 py-1.5 text-xs",
        )}
        title="Thêm"
      >
        <Plus className={small ? "h-3 w-3" : "h-3.5 w-3.5"} /> {!small && "Thêm"}
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-30" onClick={() => onToggle(false)} />
          <div className="absolute right-0 z-40 mt-1 w-64 rounded-xl border border-border bg-popover p-2 shadow-lg">
            <div className="px-2 pb-1 pt-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              Khối / Tài liệu
            </div>
            <button
              onClick={() => onPick(makeNode("group"))}
              className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-xs hover:bg-muted"
            >
              <FolderPlus className="h-3.5 w-3.5 text-amber-500" /> Group (Nhóm)
            </button>
            {ACTIVITY_OPTIONS.map(({ kind, label, icon: I }) => (
              <button
                key={kind}
                onClick={() => onPick(makeNode(kind))}
                className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-xs hover:bg-muted"
              >
                <I className="h-3.5 w-3.5 text-primary" /> {label}
              </button>
            ))}
            <div className="mt-1 rounded-md bg-muted/40 px-2 py-1.5 text-[10px] text-muted-foreground">
              Câu hỏi được thêm bên trong <span className="font-semibold text-foreground">Bài thực hành</span>.
            </div>
          </div>
        </>
      )}
    </div>
  );
}

/* ============================== Node editors ============================== */

function NodeEditor({
  node,
  onChange,
  onRemove,
  onAddQuestion,
  onEditQuestion,
  qTypeMenuFor,
  onOpenQTypeMenu,
  onPickQuestionType,
}: {
  node: Exclude<AnyNode, QuestionNode>;
  onChange: (patch: Partial<AnyNode>) => void;
  onRemove: () => void;
  onAddQuestion: (practiceId: string) => void;
  onEditQuestion: (questionId: string) => void;
  qTypeMenuFor: string | null;
  onOpenQTypeMenu: (id: string | null) => void;
  onPickQuestionType: (practiceId: string, type: QType) => void;
}) {
  const Icon = KIND_ICON[node.kind];
  const container = isContainer(node.kind);
  return (
    <div>
      <div className="mb-4 flex items-start gap-3">
        <div
          className={cn(
            "flex h-10 w-10 items-center justify-center rounded-xl",
            container ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300" : "bg-primary/10 text-primary",
          )}
        >
          <Icon className="h-5 w-5" />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            <span>{KIND_LABEL[node.kind]}</span>
            {container && (
              <span className="rounded-full bg-amber-100 px-1.5 py-0.5 text-[9px] text-amber-700 dark:bg-amber-900/40 dark:text-amber-300">
                Khối chứa
              </span>
            )}
          </div>
          <input
            value={node.title}
            onChange={(e) => onChange({ title: e.target.value } as Partial<AnyNode>)}
            placeholder="Tiêu đề"
            className="mt-1 w-full border-0 bg-transparent p-0 text-lg font-semibold text-foreground outline-none placeholder:text-muted-foreground"
          />
        </div>
        <button
          onClick={onRemove}
          className="rounded-lg border border-border p-2 text-muted-foreground hover:border-destructive hover:text-destructive"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>

      <div className="mb-5 space-y-3">
        <Row label="Giới thiệu nội dung">
          <textarea
            rows={2}
            value={node.description ?? ""}
            onChange={(e) => onChange({ description: e.target.value } as Partial<AnyNode>)}
            placeholder="Mô tả ngắn về nội dung của phần này — học viên sẽ nhìn thấy trước khi bắt đầu."
            className="ui-input"
          />
        </Row>
        <label className="flex items-start gap-3 rounded-xl border border-border bg-muted/30 px-3 py-2.5">
          <input
            type="checkbox"
            checked={node.requirePrevious ?? false}
            onChange={(e) => onChange({ requirePrevious: e.target.checked } as Partial<AnyNode>)}
            className="mt-0.5 h-4 w-4 rounded border-border accent-primary"
          />
          <div className="flex-1">
            <div className="text-xs font-semibold text-foreground">Yêu cầu hoàn thành nội dung trước đó</div>
            <div className="text-[11px] text-muted-foreground">
              Học viên phải hoàn thành mục liền trước trong unit thì mới có thể bắt đầu mục này.
            </div>
          </div>
        </label>
      </div>

      {node.kind === "group" && <GroupEditor node={node} />}
      {node.kind === "video" && <VideoEditor node={node} onChange={onChange as (p: Partial<VideoNode>) => void} />}
      {node.kind === "video-speaking" && (
        <VideoSpeakingEditor node={node} onChange={onChange as (p: Partial<VideoSpeakingNode>) => void} />
      )}
      {node.kind === "pdf" && <PdfEditor node={node} onChange={onChange as (p: Partial<PdfNode>) => void} />}
      {node.kind === "pdf-audio" && (
        <PdfAudioEditor node={node} onChange={onChange as (p: Partial<PdfAudioNode>) => void} />
      )}
      {node.kind === "practice" && (
        <PracticeEditor
          node={node}
          onChange={onChange as (p: Partial<PracticeNode>) => void}
          onEditQuestion={onEditQuestion}
          qTypeMenuOpen={qTypeMenuFor === node.id}
          onOpenQTypeMenu={(open) => onOpenQTypeMenu(open ? node.id : null)}
          onPickQuestionType={(t) => onPickQuestionType(node.id, t)}
        />
      )}

      <style>{`
        .ui-input {
          width: 100%;
          border-radius: 0.625rem;
          border: 1px solid hsl(var(--border) / 1);
          background: var(--background, #fff);
          padding: 0.5rem 0.75rem;
          font-size: 0.875rem;
          color: var(--foreground);
          outline: none;
        }
        .ui-input:focus { border-color: oklch(0.55 0.18 260); box-shadow: 0 0 0 3px oklch(0.55 0.18 260 / 0.18); }
      `}</style>
    </div>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <div className="mb-1.5 text-xs font-semibold text-foreground">{label}</div>
      {children}
    </label>
  );
}

function FileBox({
  icon: I,
  label,
  fileName,
  onChange,
  accept,
}: {
  icon: React.ElementType;
  label: string;
  fileName?: string;
  onChange: (name: string) => void;
  accept?: string;
}) {
  return (
    <label className="flex cursor-pointer items-center gap-3 rounded-xl border-2 border-dashed border-border bg-background px-4 py-3 text-sm text-muted-foreground hover:border-primary hover:text-primary">
      <I className="h-4 w-4" />
      <span className="flex-1 truncate">{fileName || label}</span>
      <Upload className="h-3.5 w-3.5" />
      <input type="file" accept={accept} className="hidden" onChange={(e) => onChange(e.target.files?.[0]?.name || "")} />
    </label>
  );
}

function GroupEditor({ node }: { node: GroupNode }) {
  return (
    <div className="rounded-xl bg-muted/40 p-3 text-xs text-muted-foreground">
      Thêm các mục con vào nhóm bằng nút <span className="font-semibold text-foreground">+</span> ở dòng nhóm bên trái.
      Nhóm đang chứa <span className="font-semibold text-foreground">{node.children.length}</span> mục.
    </div>
  );
}

function VideoEditor({ node, onChange }: { node: VideoNode; onChange: (p: Partial<VideoNode>) => void }) {
  return (
    <div className="grid gap-4">
      <Row label="Tệp video">
        <FileBox icon={FileVideo} label="Tải lên video" fileName={node.fileName} onChange={(fileName) => onChange({ fileName })} accept="video/*" />
      </Row>
    </div>
  );
}

function VideoSpeakingEditor({ node, onChange }: { node: VideoSpeakingNode; onChange: (p: Partial<VideoSpeakingNode>) => void }) {
  return (
    <div className="grid gap-4">
      <Row label="Tệp video">
        <FileBox icon={FileVideo} label="Tải lên video" fileName={node.fileName} onChange={(fileName) => onChange({ fileName })} accept="video/*" />
      </Row>
      <Row label="Câu hỏi / chủ đề luyện nói">
        <textarea rows={3} value={node.prompt ?? ""} onChange={(e) => onChange({ prompt: e.target.value })} placeholder="VD: Sau khi xem video, mô tả thói quen ăn uống của bạn..." className="ui-input" />
      </Row>
    </div>
  );
}

function PdfEditor({ node, onChange }: { node: PdfNode; onChange: (p: Partial<PdfNode>) => void }) {
  return (
    <div className="space-y-4">
      <Row label="Tệp PDF">
        <FileBox icon={FileText} label="Tải lên PDF" fileName={node.fileName} onChange={(fileName) => onChange({ fileName })} accept=".pdf" />
      </Row>
      <HiddenFromStudentsToggle checked={!!node.hiddenFromStudents} onChange={(v) => onChange({ hiddenFromStudents: v })} />
    </div>
  );
}

function PdfAudioEditor({ node, onChange }: { node: PdfAudioNode; onChange: (p: Partial<PdfAudioNode>) => void }) {
  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <Row label="Tệp PDF">
          <FileBox icon={FileText} label="Tải lên PDF" fileName={node.fileName} onChange={(fileName) => onChange({ fileName })} accept=".pdf" />
        </Row>
        <Row label="Tệp audio đi kèm">
          <FileBox icon={Music2} label="Tải lên audio" fileName={node.audioFileName} onChange={(audioFileName) => onChange({ audioFileName })} accept="audio/*" />
        </Row>
      </div>
      <HiddenFromStudentsToggle checked={!!node.hiddenFromStudents} onChange={(v) => onChange({ hiddenFromStudents: v })} />
    </div>
  );
}

function HiddenFromStudentsToggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex items-start gap-3 rounded-xl border border-border bg-surface/60 px-3 py-2.5">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="mt-0.5 h-4 w-4 rounded border-border accent-primary"
      />
      <div className="flex-1">
        <div className="text-xs font-semibold text-foreground">Ẩn tài liệu với học viên</div>
        <div className="text-[11px] text-muted-foreground">
          Khi bật, chỉ giáo viên thấy tài liệu này. Học viên sẽ không nhìn thấy trong giao diện học tập.
        </div>
      </div>
    </label>
  );
}

function PracticeEditor({
  node,
  onChange,
  onEditQuestion,
  qTypeMenuOpen,
  onOpenQTypeMenu,
  onPickQuestionType,
}: {
  node: PracticeNode;
  onChange: (p: Partial<PracticeNode>) => void;
  onEditQuestion: (questionId: string) => void;
  qTypeMenuOpen: boolean;
  onOpenQTypeMenu: (open: boolean) => void;
  onPickQuestionType: (type: QType) => void;
}) {
  const removeQuestion = (id: string) => {
    onChange({ questions: node.questions.filter((q) => q.id !== id) });
  };

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className="text-xs font-semibold text-foreground">
            Số lần thử
          </label>
          <input
            type="number"
            min={1}
            value={node.maxAttempts ?? ""}
            onChange={(e) => {
              const v = e.target.value.trim();
              onChange({ maxAttempts: v === "" ? null : Math.max(1, Number(v)) });
            }}
            placeholder="Không giới hạn"
            className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none"
          />
          <p className="mt-1 text-[11px] text-muted-foreground">Để trống = không giới hạn lượt làm.</p>
        </div>
        <div>
          <label className="text-xs font-semibold text-foreground">
            Điểm đạt (%)
          </label>
          <input
            type="number"
            min={0}
            max={100}
            value={node.passingScore ?? ""}
            onChange={(e) => {
              const v = e.target.value.trim();
              onChange({ passingScore: v === "" ? undefined : Math.min(100, Math.max(0, Number(v))) });
            }}
            placeholder="Ví dụ 70"
            className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none"
          />
          <p className="mt-1 text-[11px] text-muted-foreground">Học viên đạt khi điểm ≥ ngưỡng này.</p>
        </div>
      </div>

      <div>
        <div className="mb-2 flex items-center justify-between">
          <div className="text-xs font-semibold text-foreground">
            Câu hỏi trong bài thực hành ({node.questions.length})
          </div>
          <QuestionTypeMenuButton
            open={qTypeMenuOpen}
            onToggle={onOpenQTypeMenu}
            onPick={onPickQuestionType}
          />
        </div>

        {node.questions.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border p-6 text-center text-xs text-muted-foreground">
            Chưa có câu hỏi nào. Bấm <span className="font-semibold text-foreground">+</span> để chọn dạng và soạn bằng form của ngân hàng.
          </div>
        ) : (
          <ul className="space-y-1">
            {node.questions.map((q, idx) => {
              const Icon = Q_TYPE_ICON[q.bank.type];
              return (
                <li
                  key={q.id}
                  className="group flex items-center gap-2 rounded-lg border border-border bg-background px-2.5 py-1.5 text-sm hover:bg-muted/40"
                >
                  <span className="inline-flex h-5 w-5 shrink-0 items-center justify-center rounded bg-muted text-[10px] font-bold text-muted-foreground">
                    {idx + 1}
                  </span>
                  <Icon className="h-3.5 w-3.5 shrink-0 text-primary" />
                  <button
                    onClick={() => onEditQuestion(q.id)}
                    className="flex-1 truncate text-left text-foreground hover:text-primary"
                    title={questionLabel(q)}
                  >
                    {questionLabel(q) || <span className="italic text-muted-foreground">(Chưa có nội dung)</span>}
                  </button>
                  <span className="shrink-0 rounded bg-muted px-1.5 py-0.5 text-[10px] font-semibold text-muted-foreground">
                    {TYPE_LABEL[q.bank.type]}
                  </span>
                  <button
                    onClick={() => removeQuestion(q.id)}
                    className="rounded p-1 text-muted-foreground opacity-0 hover:bg-destructive/10 hover:text-destructive group-hover:opacity-100"
                    title="Xóa"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
