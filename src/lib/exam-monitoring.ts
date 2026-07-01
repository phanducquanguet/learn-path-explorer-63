export type MonitorStatus = "not-started" | "in-progress" | "paused" | "submitted";

export type SectionProgress = {
  skill: string; // "listening" | "reading" | "writing" | "speaking" | ...
  label: string;
  total: number;
  done: number;
};

export type MonitorSession = {
  id: string;
  examId: string;
  studentName: string;
  studentClass: string;
  status: MonitorStatus;
  startedAt?: string;
  lastActiveAt?: string;
  submittedAt?: string;
  elapsedMinutes: number;
  currentSection?: string; // skill id
  sections: SectionProgress[];
  ip?: string;
  device?: string;
};

const mkSections = (overrides: Partial<Record<string, [number, number]>> = {}): SectionProgress[] => {
  const base: Array<[string, string, number]> = [
    ["listening", "Nghe", 20],
    ["reading", "Đọc", 20],
    ["writing", "Viết", 2],
    ["speaking", "Nói", 3],
  ];
  return base.map(([skill, label, total]) => {
    const ov = overrides[skill];
    return { skill, label, total: ov?.[1] ?? total, done: ov?.[0] ?? 0 };
  });
};

export const initialMonitorSessions = (examId: string): MonitorSession[] => [
  {
    id: "m-1",
    examId,
    studentName: "Nguyễn Minh Anh",
    studentClass: "B1 — Fastrack",
    status: "in-progress",
    startedAt: new Date(Date.now() - 42 * 60_000).toISOString(),
    lastActiveAt: new Date(Date.now() - 15_000).toISOString(),
    elapsedMinutes: 42,
    currentSection: "writing",
    sections: mkSections({ listening: [20, 20], reading: [20, 20], writing: [1, 2], speaking: [0, 3] }),
    ip: "10.0.12.45",
    device: "Chrome • Windows",
  },
  {
    id: "m-2",
    examId,
    studentName: "Trần Hữu Phúc",
    studentClass: "B1 — Fastrack",
    status: "in-progress",
    startedAt: new Date(Date.now() - 30 * 60_000).toISOString(),
    lastActiveAt: new Date(Date.now() - 5_000).toISOString(),
    elapsedMinutes: 30,
    currentSection: "reading",
    sections: mkSections({ listening: [20, 20], reading: [12, 20], writing: [0, 2], speaking: [0, 3] }),
    ip: "10.0.12.51",
    device: "Safari • iPad",
  },
  {
    id: "m-3",
    examId,
    studentName: "Lê Thị Hương",
    studentClass: "B1 — Fastrack",
    status: "paused",
    startedAt: new Date(Date.now() - 55 * 60_000).toISOString(),
    lastActiveAt: new Date(Date.now() - 6 * 60_000).toISOString(),
    elapsedMinutes: 49,
    currentSection: "listening",
    sections: mkSections({ listening: [14, 20], reading: [0, 20], writing: [0, 2], speaking: [0, 3] }),
    ip: "10.0.12.60",
    device: "Chrome • MacBook",
  },
  {
    id: "m-4",
    examId,
    studentName: "Vũ Khánh Linh",
    studentClass: "B1 — Fastrack",
    status: "not-started",
    elapsedMinutes: 0,
    sections: mkSections(),
  },
  {
    id: "m-5",
    examId,
    studentName: "Đỗ Hoàng Nam",
    studentClass: "B1 — Fastrack",
    status: "submitted",
    startedAt: new Date(Date.now() - 90 * 60_000).toISOString(),
    submittedAt: new Date(Date.now() - 8 * 60_000).toISOString(),
    lastActiveAt: new Date(Date.now() - 8 * 60_000).toISOString(),
    elapsedMinutes: 82,
    sections: mkSections({ listening: [20, 20], reading: [20, 20], writing: [2, 2], speaking: [3, 3] }),
    ip: "10.0.12.77",
    device: "Chrome • Windows",
  },
  {
    id: "m-6",
    examId,
    studentName: "Phạm Bảo Ngọc",
    studentClass: "B1 — Fastrack",
    status: "not-started",
    elapsedMinutes: 0,
    sections: mkSections(),
  },
];
