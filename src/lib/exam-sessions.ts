import { tests, type Test } from "./tests-data";
import { classes } from "./teacher-data";

/** Trạng thái của một lần tổ chức thi (đợt thi). */
export type SessionStatus =
  | "draft"
  | "upcoming"
  | "open"
  | "closed"
  | "grading"
  | "awaiting-publish"
  | "completed"
  | "cancelled";

export const SESSION_STATUS_LABEL: Record<SessionStatus, string> = {
  draft: "Bản nháp",
  upcoming: "Sắp diễn ra",
  open: "Đang mở",
  closed: "Đã đóng",
  grading: "Chờ chấm",
  "awaiting-publish": "Chờ công bố",
  completed: "Hoàn tất",
  cancelled: "Đã hủy",
};

export const SESSION_STATUS_COLOR: Record<SessionStatus, string> = {
  draft: "bg-muted text-muted-foreground",
  upcoming: "bg-sky-500/10 text-sky-600 dark:text-sky-400",
  open: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  closed: "bg-slate-500/10 text-slate-600 dark:text-slate-300",
  grading: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  "awaiting-publish": "bg-violet-500/10 text-violet-600 dark:text-violet-400",
  completed: "bg-primary/10 text-primary",
  cancelled: "bg-rose-500/10 text-rose-600 dark:text-rose-400",
};

/** Một lần tổ chức thi: đề đã duyệt + lớp + lịch. Không chứa nội dung đề. */
export type ExamSession = {
  id: string;
  /** Mã nhóm phân phối (các đợt tạo trong cùng một thao tác). */
  groupCode?: string;
  name: string;
  testId: string;
  /** Phiên bản đề được khóa cho đợt thi này. */
  testVersion: number;
  classIds: string[];
  openAt: string;
  closeAt: string;
  durationMinutes: number;
  attempts: number;
  graderName?: string;
  /** Cách công bố kết quả. */
  publishMode: "auto" | "manual";
  published?: boolean;
  /** Đã xác nhận phân phối hay còn nháp. */
  confirmed: boolean;
  cancelled?: boolean;
  cancelReason?: string;
  totalStudents: number;
  started: number;
  submitted: number;
  graded: number;
  createdBy: string;
  createdAt: string;
};

const STORE_KEY = "unicom.examSessions.v1";

function hour() {
  return Math.floor(Date.now() / 3_600_000) * 3_600_000;
}
const rel = (d: number) => new Date(hour() + d * 86_400_000).toISOString();

function classStudents(classIds: string[]) {
  return classIds.reduce((s, id) => s + (classes.find((c) => c.id === id)?.studentCount ?? 0), 0);
}

function seedSessions(): ExamSession[] {
  const approved = tests.filter((t) => (t.approvalStatus ?? "approved") === "approved");
  const pick = (i: number) => approved[i % Math.max(1, approved.length)];
  const base = [
    {
      test: pick(0),
      classIds: ["cls-b1-fast"],
      open: rel(-3),
      close: rel(-1),
      grader: "Cô Mai Lan",
      submitted: 9,
      graded: 6,
      started: 10,
      published: true,
    },
    {
      test: pick(1),
      classIds: ["cls-a2-weekend"],
      open: rel(-1),
      close: rel(1),
      grader: "Cô Mai Lan",
      submitted: 11,
      graded: 4,
      started: 14,
      published: false,
    },
    {
      test: pick(2),
      classIds: ["cls-a1-morning", "cls-a1-evening"],
      open: rel(2),
      close: rel(3),
      grader: "Thầy Quang Huy",
      submitted: 0,
      graded: 0,
      started: 0,
      published: false,
    },
    {
      test: pick(0),
      classIds: ["cls-b1-evening"],
      open: rel(5),
      close: rel(6),
      grader: "Cô Mai Lan",
      submitted: 0,
      graded: 0,
      started: 0,
      published: false,
    },
  ];

  return base.map((b, i) => ({
    id: `ses-${i + 1}`,
    groupCode: `PP-${i + 1}`,
    name: `${b.test?.name ?? "Đề thi"} — Đợt ${i + 1}`,
    testId: b.test?.id ?? "test-1",
    testVersion: 1,
    classIds: b.classIds,
    openAt: b.open,
    closeAt: b.close,
    durationMinutes: b.test?.durationMinutes ?? 60,
    attempts: 1,
    graderName: b.grader,
    publishMode: i === 0 ? "auto" : "manual",
    published: b.published,
    confirmed: i !== 3,
    totalStudents: classStudents(b.classIds),
    started: b.started,
    submitted: b.submitted,
    graded: b.graded,
    createdBy: i % 2 === 0 ? "Cô Mai Lan" : "Admin UNICOM",
    createdAt: rel(-7),
  }));
}

export function loadSessions(): ExamSession[] {
  if (typeof window === "undefined") return seedSessions();
  try {
    const raw = window.localStorage.getItem(STORE_KEY);
    if (raw) return JSON.parse(raw) as ExamSession[];
  } catch {
    /* ignore */
  }
  const seeded = seedSessions();
  saveSessions(seeded);
  return seeded;
}

export function saveSessions(list: ExamSession[]) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORE_KEY, JSON.stringify(list));
  } catch {
    /* ignore */
  }
}

/** Trạng thái suy ra theo thời gian + tiến độ chấm/công bố. */
export function sessionStatus(s: ExamSession, now = Date.now()): SessionStatus {
  if (s.cancelled) return "cancelled";
  if (!s.confirmed) return "draft";
  const open = new Date(s.openAt).getTime();
  const close = new Date(s.closeAt).getTime();
  if (now < open) return "upcoming";
  if (now <= close) return "open";
  if (s.submitted > s.graded) return "grading";
  if (!s.published) return "awaiting-publish";
  return "completed";
}

export function sessionClassNames(s: ExamSession): string[] {
  return s.classIds.map((id) => classes.find((c) => c.id === id)?.name ?? id);
}

/** Đề đã duyệt — chỉ những đề này được phân phối. */
export function approvedTests(): Test[] {
  return tests.filter((t) => (t.approvalStatus ?? "approved") === "approved");
}

export function testVersion(t: Test): number {
  return (t as Test & { version?: number }).version ?? 1;
}

/** Số mã đề (paper) của một đề thi. Đề trộn ngẫu nhiên sinh nhiều mã đề. */
export function testPaperCount(t: Test): number {
  const explicit = (t as Test & { paperCount?: number }).paperCount;
  if (explicit && explicit > 0) return explicit;
  return t.mode === "random" ? Math.max(2, Math.min(4, t.structure.length || 2)) : 1;
}
