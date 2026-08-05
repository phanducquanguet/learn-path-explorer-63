import { classes, students } from "@/lib/teacher-data";

export type AssignmentAttachment = {
  name: string;
  size: number;
  dataUrl?: string; // for small files (demo)
};

/** Một lần nộp trước đó đã bị giáo viên gửi trả. */
export type SubmissionRevision = {
  submittedAt: string;
  answerText?: string;
  file?: AssignmentAttachment;
  score?: number;
  feedback?: string;
  /** Thời điểm giáo viên gửi trả bài này. */
  returnedAt: string;
  /** Nhận xét/lý do gửi trả của giáo viên. */
  returnNote?: string;
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
  /** Giáo viên đã gửi trả để học viên nộp lại (chưa nộp lại). */
  returnedAt?: string;
  /** Nhận xét khi gửi trả. */
  returnNote?: string;
  /** Lịch sử các lần nộp trước đã bị gửi trả (mới nhất ở cuối). */
  revisions?: SubmissionRevision[];
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
  /** File giáo viên đính kèm cùng đề bài (tối đa 5MB/file — demo). */
  attachments?: AssignmentAttachment[];
  createdAt: string;
  createdBy: string;
  /** Per-student deadline extensions when giáo viên mở lại nộp bài. Key = studentId, value = ISO. */
  extensions?: Record<string, string>;
  /** Cho phép trợ giảng chấm bài. */
  allowAssistantGrading?: boolean;
  /** Gắn với khóa học (từ lms-data). */
  courseId?: string;
  /** Gắn với unit trong khóa học đã chọn (backward compat — unit đầu tiên). */
  unitId?: string;
  /** Gắn với nhiều unit trong khóa học đã chọn. */
  unitIds?: string[];
};


const A_KEY = "unicom.assignments.v1";
const S_KEY = "unicom.assignmentSubs.v1";

function seedAssignments(): Assignment[] {
  // Anchor to the current hour so SSR and client render identical timestamps.
  const now = Math.floor(Date.now() / (3600 * 1000)) * 3600 * 1000;
  const cls = classes[0];
  const cls2 = classes[3] ?? classes[0];
  const cls3 = classes[1] ?? classes[0];
  const H = 3600 * 1000;
  const D = 24 * H;
  return [
    {
      id: "asg-1",
      title: "Viết đoạn văn 100 từ: My favorite hobby",
      classIds: [cls.id],
      description:
        "Hãy viết một đoạn văn khoảng 100 từ bằng tiếng Anh giới thiệu về sở thích của em.\nYêu cầu:\n- Sử dụng thì hiện tại đơn.\n- Có ít nhất 3 câu ghép.\n- Nộp bằng cách gõ trực tiếp hoặc tải file Word/PDF.",
      dueAt: new Date(now + 3 * D).toISOString(),
      maxScore: 10,
      allowText: true,
      allowFile: true,
      createdAt: new Date(now - 2 * D).toISOString(),
      createdBy: "Cô Mai Lan",
    },
    {
      id: "asg-2",
      title: "Speaking recording: Describe your hometown",
      classIds: [cls2.id, cls.id],
      description:
        "Ghi âm 1 phút miêu tả quê hương của em bằng tiếng Anh và tải file audio (mp3/m4a) lên hệ thống.",
      dueAt: new Date(now + 5 * D).toISOString(),
      maxScore: 10,
      allowText: false,
      allowFile: true,
      createdAt: new Date(now - 1 * D).toISOString(),
      createdBy: "Cô Mai Lan",
    },
    {
      id: "asg-3",
      title: "Grammar drill: Present Simple vs Present Continuous",
      classIds: [cls.id],
      description:
        "Hoàn thành 20 câu chia động từ giữa thì hiện tại đơn và hiện tại tiếp diễn. Nộp file Word hoặc gõ trực tiếp.",
      dueAt: new Date(now + 10 * H).toISOString(), // sắp đến hạn hôm nay
      maxScore: 20,
      allowText: true,
      allowFile: true,
      createdAt: new Date(now - 3 * D).toISOString(),
      createdBy: "Cô Mai Lan",
    },
    {
      id: "asg-4",
      title: "Listening log: BBC 6-minute English",
      classIds: [cls.id],
      description:
        "Nghe 1 tập BBC 6-minute English, ghi lại 10 từ mới kèm nghĩa và đặt câu ví dụ với mỗi từ.",
      dueAt: new Date(now + 2 * D).toISOString(), // sắp đến hạn
      maxScore: 10,
      allowText: true,
      allowFile: false,
      createdAt: new Date(now - 4 * D).toISOString(),
      createdBy: "Cô Mai Lan",
    },
    {
      id: "asg-5",
      title: "Email writing: Reply to a job offer",
      classIds: [cls.id],
      description:
        "Viết email trả lời một lời mời làm việc (accept hoặc politely decline). Độ dài 120-150 từ.",
      dueAt: new Date(now + 7 * D).toISOString(),
      maxScore: 10,
      allowText: true,
      allowFile: true,
      createdAt: new Date(now - 1 * D).toISOString(),
      createdBy: "Cô Mai Lan",
    },
    {
      id: "asg-6",
      title: "Pronunciation practice: minimal pairs",
      classIds: [cls.id],
      description:
        "Ghi âm đọc 20 cặp từ minimal pairs (ship/sheep, bit/beat...). Nộp file audio.",
      dueAt: new Date(now + 14 * D).toISOString(),
      maxScore: 10,
      allowText: false,
      allowFile: true,
      createdAt: new Date(now - 6 * H).toISOString(),
      createdBy: "Cô Mai Lan",
    },
    {
      id: "asg-7",
      title: "Vocabulary quiz: Unit 3 — Food & Drink",
      classIds: [cls.id],
      description:
        "Học 30 từ vựng chủ đề Food & Drink, viết định nghĩa và đặt câu với 15 từ tự chọn.",
      dueAt: new Date(now + 20 * H).toISOString(), // ~ hôm nay/mai
      maxScore: 15,
      allowText: true,
      allowFile: true,
      createdAt: new Date(now - 2 * D).toISOString(),
      createdBy: "Cô Mai Lan",
    },
    {
      id: "asg-8",
      title: "Short essay: My weekend plans",
      classIds: [cls.id],
      description:
        "Viết đoạn văn 80-100 từ miêu tả kế hoạch cuối tuần của em. Sử dụng 'be going to' và 'will'.",
      dueAt: new Date(now - 1 * D).toISOString(), // quá hạn 1 ngày
      maxScore: 10,
      allowText: true,
      allowFile: true,
      createdAt: new Date(now - 6 * D).toISOString(),
      createdBy: "Cô Mai Lan",
    },
    {
      id: "asg-9",
      title: "Presentation slides: My favorite country",
      classIds: [cls.id],
      description:
        "Tạo 5-7 slide PowerPoint giới thiệu một quốc gia em yêu thích, bao gồm địa lý, ẩm thực và văn hoá.",
      dueAt: new Date(now + 12 * D).toISOString(),
      maxScore: 20,
      allowText: false,
      allowFile: true,
      createdAt: new Date(now - 12 * H).toISOString(),
      createdBy: "Cô Mai Lan",
    },
    {
      id: "asg-closed-demo",
      title: "Reading report: A book that changed me",
      classIds: [cls3.id, cls.id],
      description:
        "Chọn 1 cuốn sách em từng đọc và viết bài cảm nhận 150-200 từ (tiếng Anh).\nYêu cầu:\n- Nêu tên sách, tác giả, thể loại.\n- Nội dung chính và bài học rút ra.\n- Nộp bằng text hoặc file PDF/Word.",
      dueAt: new Date(now - 2 * D).toISOString(),
      maxScore: 10,
      allowText: true,
      allowFile: true,
      createdAt: new Date(now - 10 * D).toISOString(),
      createdBy: "Cô Mai Lan",
    },
    {
      id: "asg-extended-demo",
      title: "Writing task: Describe a memorable trip",
      classIds: [cls.id],
      description:
        "Viết đoạn văn 120-150 từ miêu tả một chuyến đi đáng nhớ. Bài đã hết hạn nhưng giáo viên gia hạn thêm cho em.",
      dueAt: new Date(now - 1 * D).toISOString(), // hạn gốc: đã quá hạn 1 ngày
      maxScore: 10,
      allowText: true,
      allowFile: true,
      createdAt: new Date(now - 5 * D).toISOString(),
      createdBy: "Cô Mai Lan",
      extensions: {
        [students[0]?.id ?? "cls-a1-morning-s1"]: new Date(now + 36 * H).toISOString(),
      },
    },
    {
      id: "asg-returned-demo",
      title: "Essay: The impact of social media on teenagers",
      classIds: [cls.id],
      description:
        "Viết bài luận 150-200 từ về ảnh hưởng của mạng xã hội tới giới trẻ.\nYêu cầu:\n- Có mở bài, thân bài, kết bài rõ ràng.\n- Nêu ít nhất 2 mặt tích cực và 2 mặt tiêu cực.\n- Nộp bằng text hoặc file Word/PDF.",
      dueAt: new Date(now + 2 * D).toISOString(),
      maxScore: 10,
      allowText: true,
      allowFile: true,
      createdAt: new Date(now - 7 * D).toISOString(),
      createdBy: "Cô Mai Lan",
    },
  ];
}


function seedSubs(assignments: Assignment[]): AssignmentSubmission[] {
  const out: AssignmentSubmission[] = [];
  const NOW = Math.floor(Date.now() / (3600 * 1000)) * 3600 * 1000;
  const a = assignments[0];
  if (a) {
    const clsStudents = students.filter((s) => (a.classIds ?? []).includes(s.classId)).slice(0, 2);
    clsStudents.forEach((s, i) => {
      out.push({
        id: `sub-${a.id}-${s.id}`,
        assignmentId: a.id,
        studentId: s.id,
        studentName: s.name,
        submittedAt: new Date(NOW - (i + 1) * 3600 * 1000).toISOString(),
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
        submittedAt: new Date(NOW - (5 + i) * 24 * 3600 * 1000).toISOString(),
        answerText:
          "The book that changed me is 'The Little Prince' by Antoine de Saint-Exupéry. It is a short novella about a young prince who visits various planets. The story teaches me that what is essential is invisible to the eye. After reading it I started paying more attention to the people around me instead of material things.",
        maxScore: closed.maxScore,
        score: i === 0 ? 8.5 : undefined,
        feedback: i === 0 ? "Bài viết rõ ràng, ý tưởng tốt. Cần bổ sung thêm ví dụ cụ thể." : undefined,
        gradedAt: i === 0 ? new Date(NOW - 1 * 24 * 3600 * 1000).toISOString() : undefined,
      });
    });
  }
  // Demo: bài đã bị giáo viên gửi trả để nộp lại
  const returned = assignments.find((x) => x.id === "asg-returned-demo");
  if (returned) {
    const H = 3600 * 1000;
    const clsStudents = students.filter((s) => (returned.classIds ?? []).includes(s.classId)).slice(0, 2);
    clsStudents.forEach((s, i) => {
      const base = NOW;
      // 3 lần nộp trước đều bị gửi trả + lần nộp hiện tại đang chờ chấm
      const rounds = [
        {
          submittedAt: new Date(base - (96 + i * 6) * H).toISOString(),
          returnedAt: new Date(base - (90 + i * 6) * H).toISOString(),
          answerText:
            "Social media is very popular. Many teenagers use Facebook and TikTok every day. It is good and bad.",
          returnNote:
            "Bài còn quá ngắn (dưới 60 từ) và chưa đủ 2 mặt tích cực + 2 mặt tiêu cực. Em bổ sung thêm ví dụ cụ thể và viết lại kết bài nhé.",
        },
        {
          submittedAt: new Date(base - (72 + i * 6) * H).toISOString(),
          returnedAt: new Date(base - (66 + i * 6) * H).toISOString(),
          answerText:
            "Nowadays social media is used by most teenagers. On the positive side, it helps them keep in touch with friends and learn new things from videos. On the negative side, they spend too much time on it and sometimes see fake news. In my opinion teenagers should limit their screen time.",
          returnNote:
            "Đã dài hơn nhưng phần thân bài chưa tách đoạn, còn thiếu 1 mặt tiêu cực (ảnh hưởng giấc ngủ / so sánh bản thân). Em chỉnh lại bố cục 3 phần rõ ràng.",
        },
        {
          submittedAt: new Date(base - (36 + i * 6) * H).toISOString(),
          returnedAt: new Date(base - (30 + i * 6) * H).toISOString(),
          answerText:
            "Introduction: Social media has become a big part of teenagers' lives.\nBody: First, it helps them connect with friends and family. Second, they can learn English through short videos. However, it also has bad effects: many students lose sleep because they scroll at night, and some of them compare themselves with others and feel unhappy.\nConclusion: Social media is useful but teenagers need to control the time they spend on it.",
          returnNote:
            "Bố cục tốt. Tuy nhiên em viết dưới dạng gạch đầu dòng 'Introduction / Body / Conclusion' — bài luận cần viết thành đoạn văn liền mạch. Em sửa lại rồi nộp bản cuối nhé.",
        },
      ];
      const last = rounds[rounds.length - 1]!;
      out.push({
        id: `sub-${returned.id}-${s.id}`,
        assignmentId: returned.id,
        studentId: s.id,
        studentName: s.name,
        submittedAt: last.submittedAt,
        answerText: last.answerText,
        maxScore: returned.maxScore,
        returnedAt: last.returnedAt,
        returnNote: last.returnNote,
        revisions: rounds.slice(0, -1).map((r) => ({
          submittedAt: r.submittedAt,
          answerText: r.answerText,
          returnedAt: r.returnedAt,
          returnNote: r.returnNote,
        })),
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

/**
 * Giáo viên gửi trả bài: lần nộp hiện tại được lưu vào lịch sử (vẫn đính kèm),
 * học viên có thể nộp bài khác kèm nhận xét của giáo viên.
 */
export function returnSubmission(id: string, note: string) {
  ensureLoaded();
  const returnedAt = new Date().toISOString();
  _subs = _subs!.map((s) => {
    if (s.id !== id) return s;
    const rev: SubmissionRevision = {
      submittedAt: s.submittedAt,
      answerText: s.answerText,
      file: s.file,
      score: s.score,
      feedback: s.feedback,
      returnedAt,
      returnNote: note || undefined,
    };
    return {
      ...s,
      revisions: [...(s.revisions ?? []), rev],
      returnedAt,
      returnNote: note || undefined,
      score: undefined,
      gradedAt: undefined,
      feedback: undefined,
    };
  });
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

