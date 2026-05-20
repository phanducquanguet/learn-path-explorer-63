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
  GripVertical,
  Pencil,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { TYPE_LABEL, TYPE_DESCRIPTION, type QType } from "@/lib/question-bank";

/* ============================== Types ============================== */

export type QKind = QType;

/** Các dạng câu hỏi dùng trong activity builder — đồng bộ với Ngân hàng câu hỏi
 *  nhưng KHÔNG cần cấp độ (level) hay độ khó (difficulty). */
export const QUIZ_KINDS: { id: QType; label: string; description: string }[] = (
  ["mcq", "mcq-multi", "tf", "short", "fill", "matching", "sequence", "select-lists", "drag-drop", "essay", "speaking", "error-correction"] as QType[]
).map((id) => ({ id, label: TYPE_LABEL[id], description: TYPE_DESCRIPTION[id] }));

type Common = { id: string; title: string };

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
  prompt?: string; // câu hỏi luyện nói
};
export type PdfNode = Common & {
  kind: "pdf";
  fileName?: string;
};
export type PdfAudioNode = Common & {
  kind: "pdf-audio";
  fileName?: string;
  audioFileName?: string;
};
export type PracticeNode = Common & {
  kind: "practice";
  instructions?: string;
  audioFileName?: string;
  questions: QuestionNode[];
};
export type QuestionNode = Common & {
  kind: "question";
  qType: QKind;
  prompt: string;
  options: string[]; // for choice / matching / drag
  correct: number[]; // indices marked correct
  sampleAnswer?: string;
  points: number;
};
export type GroupNode = Common & {
  kind: "group";
  description?: string;
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

const ACTIVITY_OPTIONS: { kind: AnyNode["kind"]; label: string; icon: React.ElementType }[] = [
  { kind: "video", label: "Video bài giảng", icon: FileVideo },
  { kind: "video-speaking", label: "Video + luyện nói", icon: Mic },
  { kind: "pdf", label: "Tài liệu PDF", icon: FileText },
  { kind: "pdf-audio", label: "PDF kèm audio", icon: Headphones },
  { kind: "practice", label: "Bài thực hành", icon: ListChecks },
];

const KIND_ICON: Record<AnyNode["kind"], React.ElementType> = {
  group: FolderPlus,
  video: FileVideo,
  "video-speaking": Mic,
  pdf: FileText,
  "pdf-audio": Headphones,
  practice: ListChecks,
  question: Pencil,
};

const KIND_LABEL: Record<AnyNode["kind"], string> = {
  group: "Group",
  video: "Video",
  "video-speaking": "Video + Nói",
  pdf: "PDF",
  "pdf-audio": "PDF + Audio",
  practice: "Thực hành",
  question: "Câu hỏi",
};

/* ============================== Helpers ============================== */

const uid = () => `n-${Math.random().toString(36).slice(2, 9)}`;

function makeNode(kind: AnyNode["kind"], qType?: QKind): AnyNode {
  const base = { id: uid() };
  switch (kind) {
    case "group":
      return { ...base, kind, title: "Nhóm mới", description: "", children: [] };
    case "video":
      return { ...base, kind, title: "Video bài giảng", duration: 10 };
    case "video-speaking":
      return { ...base, kind, title: "Video luyện nói", duration: 5, prompt: "" };
    case "pdf":
      return { ...base, kind, title: "Tài liệu PDF" };
    case "pdf-audio":
      return { ...base, kind, title: "PDF kèm audio" };
    case "practice":
      return { ...base, kind, title: "Bài thực hành", instructions: "", questions: [] };
    case "question": {
      const q = qType ?? "mcq";
      const needsOptions = ["mcq", "mcq-multi", "matching", "drag-drop", "tf", "sequence", "select-lists", "error-correction"].includes(q);
      return {
        ...base,
        kind: "question",
        qType: q,
        title: QUIZ_KINDS.find((k) => k.id === q)?.label ?? "Câu hỏi",
        prompt: "",
        options: needsOptions
          ? q === "tf"
            ? ["Đúng", "Sai"]
            : q === "error-correction"
              ? ["She", "go", "to", "school"]
              : ["Lựa chọn A", "Lựa chọn B"]
          : [],
        correct: q === "tf" ? [0] : [],
        points: q === "essay" ? 5 : q === "short" || q === "speaking" ? 2 : 1,
      };
    }
  }
}

function mapTree(nodes: AnyNode[], fn: (n: AnyNode) => AnyNode | null): AnyNode[] {
  const out: AnyNode[] = [];
  for (const n of nodes) {
    const next = fn(n);
    if (!next) continue;
    if (next.kind === "group") {
      out.push({ ...next, children: mapTree(next.children, fn) });
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
  }
  return null;
}

function addInto(nodes: AnyNode[], parentId: string | null, child: AnyNode): AnyNode[] {
  if (parentId === null) return [...nodes, child];
  return nodes.map((n) => {
    if (n.kind !== "group") return n;
    if (n.id === parentId) return { ...n, children: [...n.children, child] };
    return { ...n, children: addInto(n.children, parentId, child) };
  });
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

  const selected = useMemo(() => (selectedId ? findNode(nodes, selectedId) : null), [nodes, selectedId]);

  const updateNode = (id: string, patch: Partial<AnyNode>) => {
    onChange(
      mapTree(nodes, (n) => (n.id === id ? ({ ...n, ...patch } as AnyNode) : n)),
    );
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

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-[320px_1fr]">
      {/* LEFT: tree */}
      <div className="rounded-2xl border border-border bg-background p-3">
        <div className="mb-2 flex items-center justify-between px-1">
          <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Cấu trúc nội dung
          </div>
          <AddMenuButton open={addMenuFor === "__root__"} onToggle={(v) => setAddMenuFor(v ? "__root__" : null)} onPick={(n) => addNode(null, n)} />
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
                onSelect={setSelectedId}
                onToggle={(id) => setExpanded((e) => ({ ...e, [id]: !e[id] }))}
                onRemove={removeNode}
                onAdd={addNode}
                onOpenAddMenu={setAddMenuFor}
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
        ) : (
          <NodeEditor node={selected} onChange={(p) => updateNode(selected.id, p)} onRemove={() => removeNode(selected.id)} />
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
  onSelect,
  onToggle,
  onRemove,
  onAdd,
  onOpenAddMenu,
}: {
  node: AnyNode;
  depth: number;
  selectedId: string | null;
  expanded: Record<string, boolean>;
  addMenuFor: string | null;
  onSelect: (id: string) => void;
  onToggle: (id: string) => void;
  onRemove: (id: string) => void;
  onAdd: (parentId: string | null, n: AnyNode) => void;
  onOpenAddMenu: (id: string | null) => void;
}) {
  const Icon = KIND_ICON[node.kind];
  const isGroup = node.kind === "group";
  const isOpen = isGroup && (expanded[node.id] ?? true);
  const isSelected = selectedId === node.id;

  return (
    <li>
      <div
        className={cn(
          "group flex items-center gap-1 rounded-lg px-1.5 py-1.5 text-sm",
          isSelected ? "bg-primary/10 text-primary" : "hover:bg-muted/60 text-foreground",
        )}
        style={{ paddingLeft: 6 + depth * 14 }}
      >
        {isGroup ? (
          <button onClick={() => onToggle(node.id)} className="rounded p-0.5 text-muted-foreground hover:bg-muted">
            {isOpen ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
          </button>
        ) : (
          <span className="w-4" />
        )}
        <Icon className={cn("h-3.5 w-3.5 shrink-0", isSelected ? "text-primary" : "text-muted-foreground")} />
        <button onClick={() => onSelect(node.id)} className="flex-1 truncate text-left">
          {node.title || <span className="italic text-muted-foreground">Chưa đặt tên</span>}
        </button>
        <span className="hidden text-[10px] uppercase tracking-wider text-muted-foreground group-hover:inline">
          {KIND_LABEL[node.kind]}
        </span>
        {isGroup && (
          <AddMenuButton
            small
            open={addMenuFor === node.id}
            onToggle={(v) => onOpenAddMenu(v ? node.id : null)}
            onPick={(n) => onAdd(node.id, n)}
          />
        )}
        <button onClick={() => onRemove(node.id)} className="rounded p-1 text-muted-foreground opacity-0 hover:bg-destructive/10 hover:text-destructive group-hover:opacity-100">
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>
      {isGroup && isOpen && node.children.length > 0 && (
        <ul className="space-y-0.5">
          {node.children.map((c) => (
            <TreeRow
              key={c.id}
              node={c}
              depth={depth + 1}
              selectedId={selectedId}
              expanded={expanded}
              addMenuFor={addMenuFor}
              onSelect={onSelect}
              onToggle={onToggle}
              onRemove={onRemove}
              onAdd={onAdd}
              onOpenAddMenu={onOpenAddMenu}
            />
          ))}
        </ul>
      )}
    </li>
  );
}

/* ============================== Add menu ============================== */

function AddMenuButton({
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
}: {
  node: AnyNode;
  onChange: (patch: Partial<AnyNode>) => void;
  onRemove: () => void;
}) {
  const Icon = KIND_ICON[node.kind];
  return (
    <div>
      <div className="mb-4 flex items-start gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <Icon className="h-5 w-5" />
        </div>
        <div className="flex-1">
          <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            {KIND_LABEL[node.kind]}
            {node.kind === "question" && ` • ${QUIZ_KINDS.find((k) => k.id === node.qType)?.label}`}
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

      {node.kind === "group" && <GroupEditor node={node} onChange={onChange as (p: Partial<GroupNode>) => void} />}
      {node.kind === "video" && <VideoEditor node={node} onChange={onChange as (p: Partial<VideoNode>) => void} />}
      {node.kind === "video-speaking" && (
        <VideoSpeakingEditor node={node} onChange={onChange as (p: Partial<VideoSpeakingNode>) => void} />
      )}
      {node.kind === "pdf" && <PdfEditor node={node} onChange={onChange as (p: Partial<PdfNode>) => void} />}
      {node.kind === "pdf-audio" && (
        <PdfAudioEditor node={node} onChange={onChange as (p: Partial<PdfAudioNode>) => void} />
      )}
      {node.kind === "practice" && (
        <PracticeEditor node={node} onChange={onChange as (p: Partial<PracticeNode>) => void} />
      )}
      {node.kind === "question" && (
        <QuestionEditor node={node} onChange={onChange as (p: Partial<QuestionNode>) => void} />
      )}
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

function GroupEditor({ node, onChange }: { node: GroupNode; onChange: (p: Partial<GroupNode>) => void }) {
  return (
    <div className="space-y-4">
      <Row label="Mô tả nhóm">
        <textarea
          rows={3}
          value={node.description ?? ""}
          onChange={(e) => onChange({ description: e.target.value })}
          placeholder="VD: Nhóm video theo từng chapter, nhóm câu hỏi luyện tập..."
          className="ui-input"
        />
      </Row>
      <div className="rounded-xl bg-muted/40 p-3 text-xs text-muted-foreground">
        Thêm các mục con vào nhóm bằng nút <span className="font-semibold text-foreground">+</span> ở dòng nhóm bên trái.
        Nhóm đang chứa <span className="font-semibold text-foreground">{node.children.length}</span> mục.
      </div>
    </div>
  );
}

function VideoEditor({ node, onChange }: { node: VideoNode; onChange: (p: Partial<VideoNode>) => void }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <Row label="Thời lượng (phút)">
        <input type="number" value={node.duration ?? 0} onChange={(e) => onChange({ duration: Number(e.target.value) })} className="ui-input" />
      </Row>
      <Row label="Thumbnail (tuỳ chọn)">
        <FileBox icon={ImageIcon} label="Chọn ảnh thumbnail" fileName={node.thumbnail} onChange={(thumbnail) => onChange({ thumbnail })} accept="image/*" />
      </Row>
      <div className="sm:col-span-2">
        <Row label="Tệp video">
          <FileBox icon={FileVideo} label="Tải lên video" fileName={node.fileName} onChange={(fileName) => onChange({ fileName })} accept="video/*" />
        </Row>
      </div>
    </div>
  );
}

function VideoSpeakingEditor({ node, onChange }: { node: VideoSpeakingNode; onChange: (p: Partial<VideoSpeakingNode>) => void }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <Row label="Thời lượng (phút)">
        <input type="number" value={node.duration ?? 0} onChange={(e) => onChange({ duration: Number(e.target.value) })} className="ui-input" />
      </Row>
      <Row label="Tệp video">
        <FileBox icon={FileVideo} label="Tải lên video" fileName={node.fileName} onChange={(fileName) => onChange({ fileName })} accept="video/*" />
      </Row>
      <div className="sm:col-span-2">
        <Row label="Câu hỏi / chủ đề luyện nói">
          <textarea rows={3} value={node.prompt ?? ""} onChange={(e) => onChange({ prompt: e.target.value })} placeholder="VD: Sau khi xem video, mô tả thói quen ăn uống của bạn..." className="ui-input" />
        </Row>
      </div>
    </div>
  );
}

function PdfEditor({ node, onChange }: { node: PdfNode; onChange: (p: Partial<PdfNode>) => void }) {
  return (
    <Row label="Tệp PDF">
      <FileBox icon={FileText} label="Tải lên PDF" fileName={node.fileName} onChange={(fileName) => onChange({ fileName })} accept=".pdf" />
    </Row>
  );
}

function PdfAudioEditor({ node, onChange }: { node: PdfAudioNode; onChange: (p: Partial<PdfAudioNode>) => void }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <Row label="Tệp PDF">
        <FileBox icon={FileText} label="Tải lên PDF" fileName={node.fileName} onChange={(fileName) => onChange({ fileName })} accept=".pdf" />
      </Row>
      <Row label="Tệp audio đi kèm">
        <FileBox icon={Music2} label="Tải lên audio" fileName={node.audioFileName} onChange={(audioFileName) => onChange({ audioFileName })} accept="audio/*" />
      </Row>
    </div>
  );
}

function PracticeEditor({ node, onChange }: { node: PracticeNode; onChange: (p: Partial<PracticeNode>) => void }) {
  const [pickerOpen, setPickerOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const addQuestion = (qType: QKind) => {
    const q = makeNode("question", qType) as QuestionNode;
    onChange({ questions: [...node.questions, q] });
    setEditingId(q.id);
    setPickerOpen(false);
  };
  const updateQuestion = (id: string, patch: Partial<QuestionNode>) => {
    onChange({ questions: node.questions.map((q) => (q.id === id ? { ...q, ...patch } : q)) });
  };
  const removeQuestion = (id: string) => {
    onChange({ questions: node.questions.filter((q) => q.id !== id) });
    if (editingId === id) setEditingId(null);
  };

  return (
    <div className="space-y-4">
      <Row label="Hướng dẫn / Đề bài">
        <textarea rows={3} value={node.instructions ?? ""} onChange={(e) => onChange({ instructions: e.target.value })} placeholder="VD: Đọc đoạn văn và trả lời các câu hỏi bên dưới..." className="ui-input" />
      </Row>
      <Row label="Audio (nếu có)">
        <FileBox icon={Music2} label="Audio đi kèm" fileName={node.audioFileName} onChange={(audioFileName) => onChange({ audioFileName })} accept="audio/*" />
      </Row>

      <div>
        <div className="mb-2 flex items-center justify-between">
          <div className="text-xs font-semibold text-foreground">
            Câu hỏi trong bài thực hành ({node.questions.length})
          </div>
          <div className="relative">
            <button
              onClick={() => setPickerOpen((v) => !v)}
              className="inline-flex items-center gap-1 rounded-md bg-primary px-2.5 py-1.5 text-[11px] font-semibold text-primary-foreground hover:opacity-90"
            >
              <Plus className="h-3 w-3" /> Thêm câu hỏi
            </button>
            {pickerOpen && (
              <>
                <div className="fixed inset-0 z-30" onClick={() => setPickerOpen(false)} />
                <div className="absolute right-0 z-40 mt-1 w-72 rounded-xl border border-border bg-popover p-2 shadow-lg">
                  <div className="px-2 pb-1 pt-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Chọn dạng câu hỏi
                  </div>
                  <div className="grid grid-cols-2 gap-1">
                    {QUIZ_KINDS.map((q) => (
                      <button
                        key={q.id}
                        onClick={() => addQuestion(q.id)}
                        className="rounded-md px-2 py-1.5 text-left text-[11px] hover:bg-muted"
                        title={q.description}
                      >
                        {q.label}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {node.questions.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border p-6 text-center text-xs text-muted-foreground">
            Chưa có câu hỏi nào. Bấm <span className="font-semibold text-foreground">Thêm câu hỏi</span> để chọn dạng từ ngân hàng câu hỏi.
          </div>
        ) : (
          <div className="space-y-2">
            {node.questions.map((q, idx) => {
              const open = editingId === q.id;
              return (
                <div key={q.id} className="rounded-xl border border-border bg-background">
                  <div className="flex items-center gap-2 px-3 py-2">
                    <span className="flex h-6 w-6 items-center justify-center rounded-md bg-primary/10 text-[11px] font-bold text-primary">{idx + 1}</span>
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                      {QUIZ_KINDS.find((k) => k.id === q.qType)?.label}
                    </span>
                    <span className="flex-1 truncate text-sm text-foreground">
                      {q.prompt || <span className="italic text-muted-foreground">Chưa có nội dung</span>}
                    </span>
                    <button
                      onClick={() => setEditingId(open ? null : q.id)}
                      className="rounded-md border border-border px-2 py-1 text-[11px] font-semibold text-foreground hover:bg-muted"
                    >
                      {open ? "Đóng" : "Sửa"}
                    </button>
                    <button
                      onClick={() => removeQuestion(q.id)}
                      className="rounded-md p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  {open && (
                    <div className="border-t border-border p-3">
                      <QuestionEditor node={q} onChange={(p) => updateQuestion(q.id, p)} />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

/* ============================== Question editor ============================== */

function QuestionEditor({ node, onChange }: { node: QuestionNode; onChange: (p: Partial<QuestionNode>) => void }) {
  const q = node.qType;
  const hasOptions = ["mcq", "mcq-multi", "matching", "drag-drop", "tf", "sequence", "select-lists", "error-correction"].includes(q);
  const multiCorrect = q === "mcq-multi" || q === "drag-drop" || q === "select-lists" || q === "error-correction";
  const showSample = ["short", "fill", "essay", "speaking", "error-correction"].includes(q);

  const toggleCorrect = (i: number) => {
    let next: number[];
    if (multiCorrect) {
      next = node.correct.includes(i) ? node.correct.filter((x) => x !== i) : [...node.correct, i];
    } else {
      next = [i];
    }
    onChange({ correct: next });
  };

  const updateOpt = (i: number, v: string) => {
    const opts = [...node.options];
    opts[i] = v;
    onChange({ options: opts });
  };
  const addOpt = () => onChange({ options: [...node.options, `Lựa chọn ${String.fromCharCode(65 + node.options.length)}`] });
  const removeOpt = (i: number) =>
    onChange({
      options: node.options.filter((_, x) => x !== i),
      correct: node.correct.filter((x) => x !== i).map((x) => (x > i ? x - 1 : x)),
    });

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-[1fr_120px]">
        <Row label="Dạng câu hỏi">
          <select
            value={q}
            onChange={(e) => {
              const newType = e.target.value as QKind;
              const fresh = makeNode("question", newType) as QuestionNode;
              onChange({ qType: newType, options: fresh.options, correct: fresh.correct });
            }}
            className="ui-input"
          >
            {QUIZ_KINDS.map((k) => (
              <option key={k.id} value={k.id}>
                {k.label}
              </option>
            ))}
          </select>
        </Row>
        <Row label="Điểm">
          <input type="number" min={0} value={node.points} onChange={(e) => onChange({ points: Number(e.target.value) })} className="ui-input" />
        </Row>
      </div>

      <Row label="Nội dung câu hỏi">
        <textarea rows={3} value={node.prompt} onChange={(e) => onChange({ prompt: e.target.value })} placeholder="Nhập nội dung câu hỏi..." className="ui-input" />
      </Row>

      {hasOptions && (
        <div>
          <div className="mb-2 flex items-center justify-between">
            <div className="text-xs font-semibold text-foreground">
              {q === "matching" ? "Cặp ghép" : q === "sequence" ? "Các mục cần sắp xếp (đúng thứ tự)" : q === "error-correction" ? "Các từ/cụm trong câu (tích chọn từ sai)" : "Lựa chọn"}
            </div>
            {q !== "tf" && (
              <button onClick={addOpt} className="inline-flex items-center gap-1 rounded-md bg-primary/10 px-2 py-1 text-[11px] font-semibold text-primary hover:bg-primary/20">
                <Plus className="h-3 w-3" /> Thêm
              </button>
            )}
          </div>
          <div className="overflow-hidden rounded-xl border border-border">
            <div className="grid grid-cols-[40px_50px_1fr_36px] items-center gap-2 bg-muted/50 px-3 py-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              <span />
              <span>{q === "sequence" ? "STT" : q === "error-correction" ? "Sai" : "Đúng"}</span>
              <span>Nội dung</span>
              <span />
            </div>
            {node.options.map((opt, i) => (
              <div key={i} className="grid grid-cols-[40px_50px_1fr_36px] items-center gap-2 border-t border-border bg-background px-3 py-1.5">
                <GripVertical className="h-3.5 w-3.5 text-muted-foreground" />
                {q === "sequence" ? (
                  <span className="text-center text-xs font-semibold text-muted-foreground">{i + 1}</span>
                ) : (
                  <input
                    type={multiCorrect ? "checkbox" : "radio"}
                    name={`q-${node.id}-correct`}
                    checked={node.correct.includes(i)}
                    onChange={() => toggleCorrect(i)}
                    className="mx-auto h-4 w-4"
                  />
                )}
                <input value={opt} onChange={(e) => updateOpt(i, e.target.value)} className="ui-input border-0 bg-transparent p-1" />
                {q !== "tf" && (
                  <button onClick={() => removeOpt(i)} className="rounded p-1 text-muted-foreground hover:bg-destructive/10 hover:text-destructive">
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {showSample && (
        <Row label="Đáp án mẫu / Gợi ý chấm">
          <textarea
            rows={3}
            value={node.sampleAnswer ?? ""}
            onChange={(e) => onChange({ sampleAnswer: e.target.value })}
            placeholder="Câu trả lời tham khảo dùng để chấm..."
            className="ui-input"
          />
        </Row>
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
