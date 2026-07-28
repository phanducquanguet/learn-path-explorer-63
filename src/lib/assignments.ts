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
};


const A_KEY = "unicom.assignments.v1";
const S_KEY = "unicom.assignmentSubs.v1";

function seedAssignments(): Assignment[] {
  const now = Date.now();
  const cls = classes[0];
  const cls2 = classes[3] ?? classes[0];
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
  ];
}

function seedSubs(assignments: Assignment[]): AssignmentSubmission[] {
  const a = assignments[0];
  const clsStudents = students.filter((s) => a.classIds.includes(s.classId)).slice(0, 2);
  return clsStudents.map((s, i) => ({
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
  }));
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

function ensureLoaded() {
  if (_assignments === null) {
    const seeded = seedAssignments();
    _assignments = load<Assignment[]>(A_KEY, seeded);
    if (_assignments === seeded) save(A_KEY, seeded);
  }
  if (_subs === null) {
    const seeded = seedSubs(_assignments!);
    _subs = load<AssignmentSubmission[]>(S_KEY, seeded);
    if (_subs === seeded) save(S_KEY, seeded);
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

