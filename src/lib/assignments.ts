import { classes, students } from "@/lib/teacher-data";

export type AssignmentAttachment = {
  name: string;
  size: number;
  dataUrl?: string; // for small files (demo)
};

export type AssignmentSubmission = {
  id: string;
  assignmentId: string;
  studentId: string;
  studentName: string;
  submittedAt: string;
  answerText?: string;
  file?: AssignmentAttachment;
  score?: number;
  maxScore: number;
  feedback?: string;
  gradedAt?: string;
};

export type Assignment = {
  id: string;
  title: string;
  classIds: string[];
  description: string; // đề bài (text)
  dueAt: string; // ISO
  maxScore: number;
  allowText: boolean;
  allowFile: boolean;
  createdAt: string;
  createdBy: string;
  /** Per-student deadline extensions when giáo viên mở lại nộp bài. Key = studentId, value = ISO. */
  extensions?: Record<string, string>;
};


const A_KEY = "unicom.assignments.v1";
const S_KEY = "unicom.assignmentSubs.v1";

function seedAssignments(): Assignment[] {
  const now = Date.now();
  const cls = classes[0];
  const cls2 = classes[3] ?? classes[0];
  const cls3 = classes[1] ?? classes[0];
  return [
    {
      id: "asg-1",
      title: "Viết đoạn văn 100 từ: My favorite hobby",
      classIds: [cls.id],
      description:
        "Hãy viết một đoạn văn khoảng 100 từ bằng tiếng Anh giới thiệu về sở thích của em.\nYêu cầu:\n- Sử dụng thì hiện tại đơn.\n- Có ít nhất 3 câu ghép.\n- Nộp bằng cách gõ trực tiếp hoặc tải file Word/PDF.",
      dueAt: new Date(now + 3 * 24 * 3600 * 1000).toISOString(),
      maxScore: 10,
      allowText: true,
      allowFile: true,
      createdAt: new Date(now - 2 * 24 * 3600 * 1000).toISOString(),
      createdBy: "Cô Mai Lan",
    },
    {
      id: "asg-2",
      title: "Speaking recording: Describe your hometown",
      classIds: [cls2.id, cls.id],
      description:
        "Ghi âm 1 phút miêu tả quê hương của em bằng tiếng Anh và tải file audio (mp3/m4a) lên hệ thống.",
      dueAt: new Date(now + 5 * 24 * 3600 * 1000).toISOString(),
      maxScore: 10,
      allowText: false,
      allowFile: true,
      createdAt: new Date(now - 1 * 24 * 3600 * 1000).toISOString(),
      createdBy: "Cô Mai Lan",
    },
    {
      id: "asg-closed-demo",
      title: "Reading report: A book that changed me",
      classIds: [cls3.id],
      description:
        "Chọn 1 cuốn sách em từng đọc và viết bài cảm nhận 150-200 từ (tiếng Anh).\nYêu cầu:\n- Nêu tên sách, tác giả, thể loại.\n- Nội dung chính và bài học rút ra.\n- Nộp bằng text hoặc file PDF/Word.",
      dueAt: new Date(now - 2 * 24 * 3600 * 1000).toISOString(), // đã hết hạn 2 ngày
      maxScore: 10,
      allowText: true,
      allowFile: true,
      createdAt: new Date(now - 10 * 24 * 3600 * 1000).toISOString(),
      createdBy: "Cô Mai Lan",
    },
  ];
}

function seedSubs(assignments: Assignment[]): AssignmentSubmission[] {
  const out: AssignmentSubmission[] = [];
  const a = assignments[0];
  if (a) {
    const clsStudents = students.filter((s) => (a.classIds ?? []).includes(s.classId)).slice(0, 2);
    clsStudents.forEach((s, i) => {
      out.push({
        id: `sub-${a.id}-${s.id}`,
        assignmentId: a.id,
        studentId: s.id,
        studentName: s.name,
        submittedAt: new Date(Date.now() - (i + 1) * 3600 * 1000).toISOString(),
        answerText:
          i === 0
            ? "My favorite hobby is reading books. Every evening after dinner, I spend about one hour reading novels or short stories. Reading helps me relax and improves my vocabulary. I especially love adventure stories because they bring me to new worlds. Besides reading, I also enjoy writing short diaries about my day."
            : "I like playing football with my friends on weekends. We often meet at the school yard at 4 pm.",
        maxScore: a.maxScore,
      });
    });
  }
  // Closed demo: chỉ ~50% học viên đã nộp, còn lại chưa nộp để demo mở lại
  const closed = assignments.find((x) => x.id === "asg-closed-demo");
  if (closed) {
    const clsStudents = students.filter((s) => (closed.classIds ?? []).includes(s.classId));
    const submitters = clsStudents.slice(0, Math.max(2, Math.floor(clsStudents.length / 2)));
    submitters.forEach((s, i) => {
      out.push({
        id: `sub-${closed.id}-${s.id}`,
        assignmentId: closed.id,
        studentId: s.id,
        studentName: s.name,
        submittedAt: new Date(Date.now() - (5 + i) * 24 * 3600 * 1000).toISOString(),
        answerText:
          "The book that changed me is 'The Little Prince' by Antoine de Saint-Exupéry. It is a short novella about a young prince who visits various planets. The story teaches me that what is essential is invisible to the eye. After reading it I started paying more attention to the people around me instead of material things.",
        maxScore: closed.maxScore,
        score: i === 0 ? 8.5 : undefined,
        feedback: i === 0 ? "Bài viết rõ ràng, ý tưởng tốt. Cần bổ sung thêm ví dụ cụ thể." : undefined,
        gradedAt: i === 0 ? new Date(Date.now() - 1 * 24 * 3600 * 1000).toISOString() : undefined,
      });
    });
  }
  return out;
}

function load<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function save<T>(key: string, val: T) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(key, JSON.stringify(val));
  } catch {}
}

let _assignments: Assignment[] | null = null;
let _subs: AssignmentSubmission[] | null = null;
let _sortedCache: Assignment[] | null = null;
const _subsByAssignment = new Map<string, AssignmentSubmission[]>();
const listeners = new Set<() => void>();

function migrate(a: any): Assignment {
  if (!a) return a;
  if (!Array.isArray(a.classIds)) {
    a.classIds = a.classId ? [a.classId] : [];
  }
  return a as Assignment;
}

function ensureLoaded() {
  if (_assignments === null) {
    const seeded = seedAssignments();
    const loaded = load<Assignment[]>(A_KEY, seeded);
    const arr = Array.isArray(loaded) ? loaded.map(migrate) : seeded;
    // Merge any missing seed demos (e.g. new closed-demo) into existing storage
    const ids = new Set(arr.map((a) => a.id));
    for (const s of seeded) if (!ids.has(s.id)) arr.push(s);
    _assignments = arr;
    save(A_KEY, _assignments);
  }
  if (_subs === null) {
    const seeded = seedSubs(_assignments!);
    const loaded = load<AssignmentSubmission[]>(S_KEY, seeded);
    const arr = Array.isArray(loaded) ? loaded.slice() : seeded;
    const subIds = new Set(arr.map((s) => s.id));
    for (const s of seeded) if (!subIds.has(s.id)) arr.push(s);
    _subs = arr;
    save(S_KEY, _subs);
  }
}

function invalidateCache() {
  _sortedCache = null;
  _subsByAssignment.clear();
}

function emit() {
  invalidateCache();
  listeners.forEach((l) => l());
}

export function subscribeAssignments(fn: () => void) {
  listeners.add(fn);
  return () => {
    listeners.delete(fn);
  };
}

export function listAssignments(): Assignment[] {
  ensureLoaded();
  if (!_sortedCache) {
    _sortedCache = _assignments!.slice().sort((a, b) => (a.dueAt < b.dueAt ? 1 : -1));
  }
  return _sortedCache;
}


export function getAssignment(id: string): Assignment | undefined {
  ensureLoaded();
  return _assignments!.find((a) => a.id === id);
}

export function createAssignment(input: Omit<Assignment, "id" | "createdAt">): Assignment {
  ensureLoaded();
  const a: Assignment = {
    ...input,
    id: `asg-${Date.now()}`,
    createdAt: new Date().toISOString(),
  };
  _assignments = [a, ..._assignments!];
  save(A_KEY, _assignments);
  emit();
  return a;
}

export function updateAssignment(id: string, patch: Partial<Assignment>) {
  ensureLoaded();
  _assignments = _assignments!.map((a) => (a.id === id ? { ...a, ...patch } : a));
  save(A_KEY, _assignments);
  emit();
}

export function deleteAssignment(id: string) {
  ensureLoaded();
  _assignments = _assignments!.filter((a) => a.id !== id);
  _subs = _subs!.filter((s) => s.assignmentId !== id);
  save(A_KEY, _assignments);
  save(S_KEY, _subs);
  emit();
}

export function listSubmissions(assignmentId: string): AssignmentSubmission[] {
  ensureLoaded();
  let cached = _subsByAssignment.get(assignmentId);
  if (!cached) {
    cached = _subs!.filter((s) => s.assignmentId === assignmentId);
    _subsByAssignment.set(assignmentId, cached);
  }
  return cached;
}


export function getSubmissionForStudent(
  assignmentId: string,
  studentId: string,
): AssignmentSubmission | undefined {
  ensureLoaded();
  return _subs!.find((s) => s.assignmentId === assignmentId && s.studentId === studentId);
}

export function upsertSubmission(sub: AssignmentSubmission) {
  ensureLoaded();
  const idx = _subs!.findIndex((s) => s.id === sub.id);
  if (idx >= 0) _subs![idx] = sub;
  else _subs = [sub, ..._subs!];
  save(S_KEY, _subs);
  emit();
}

export function gradeSubmission(id: string, score: number, feedback: string) {
  ensureLoaded();
  _subs = _subs!.map((s) =>
    s.id === id ? { ...s, score, feedback, gradedAt: new Date().toISOString() } : s,
  );
  save(S_KEY, _subs);
  emit();
}

/** Trả về hạn nộp áp dụng cho 1 học viên (có thể được gia hạn riêng). */
export function getEffectiveDueAt(a: Assignment, studentId: string): string {
  return a.extensions?.[studentId] ?? a.dueAt;
}

export function isClosedForStudent(a: Assignment, studentId: string, now = Date.now()): boolean {
  return new Date(getEffectiveDueAt(a, studentId)).getTime() < now;
}

/** Mở lại nộp bài cho 1 học viên (giáo viên đặt hạn mới). */
export function extendDeadline(assignmentId: string, studentId: string, newDueAt: string) {
  ensureLoaded();
  _assignments = _assignments!.map((a) =>
    a.id === assignmentId
      ? { ...a, extensions: { ...(a.extensions ?? {}), [studentId]: newDueAt } }
      : a,
  );
  save(A_KEY, _assignments);
  emit();
}

/** Current logged-in student (demo). */
export const CURRENT_STUDENT = {
  id: students[0]?.id ?? "cls-a1-morning-s1",
  name: students[0]?.name ?? "Nguyễn Minh Anh",
  classId: students[0]?.classId ?? "cls-a1-morning",
};

let _studentListCache: Assignment[] | null = null;
export function listAssignmentsForCurrentStudent(): Assignment[] {
  const all = listAssignments();
  if (!_studentListCache || _sortedCache !== all) {
    _studentListCache = all.filter((a) => a.classIds.includes(CURRENT_STUDENT.classId));
  }
  return _studentListCache;
}

