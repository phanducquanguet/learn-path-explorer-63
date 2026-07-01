export type ExamEventStatus = "upcoming" | "live" | "finished";

export type ExamEvent = {
  id: string;
  /** Tên bộ đề / kỳ (không phải tên đề phụ). Dùng làm phụ đề, không phải header chính. */
  name: string;
  /** Mã ca thi ngắn gọn – dùng làm header chính của card monitor. */
  sessionCode: string;
  /** Các lớp cùng thi trong ca này (trong cùng một đơn vị). */
  classes: { id: string; name: string }[];
  orgName: string;
  startAt: string;
  endAt: string;
  durationMinutes: number;
  paperCount: number; // số mã đề trong bộ
  candidateCount: number;
  status: ExamEventStatus;
  proctor?: string;
};

// Dates are fixed (demo) để tránh hydration mismatch giữa SSR và client.
export const examEvents: ExamEvent[] = [
  {
    id: "evt-b1-midterm",
    name: "Bộ đề giữa kỳ B1 — Tháng 6/2026",
    sessionCode: "CA-01/07 · 14:00",
    classes: [
      { id: "cls-b1-fast", name: "B1 — Fastrack" },
      { id: "cls-b1-evening", name: "B1 — Buổi tối" },
    ],
    orgName: "UNICOM HN",
    startAt: "2026-07-01T14:00:00+07:00",
    endAt: "2026-07-01T15:30:00+07:00",
    durationMinutes: 90,
    paperCount: 4,
    candidateCount: 42,
    status: "live",
    proctor: "GV. Nguyễn Thu Hà",
  },
  {
    id: "evt-a2-final",
    name: "Bộ đề cuối khóa A2 — Đợt 3",
    sessionCode: "CA-01/07 · 15:30",
    classes: [
      { id: "cls-a2-weekend", name: "A2 — Cuối tuần" },
      { id: "cls-a2-morning", name: "A2 — Buổi sáng" },
      { id: "cls-a2-evening", name: "A2 — Buổi tối" },
    ],
    orgName: "UNICOM HN",
    startAt: "2026-07-01T15:30:00+07:00",
    endAt: "2026-07-01T17:00:00+07:00",
    durationMinutes: 90,
    paperCount: 3,
    candidateCount: 56,
    status: "live",
    proctor: "GV. Trần Minh Đức",
  },
  {
    id: "evt-b2-placement",
    name: "Bộ đề xếp lớp B2 — Khóa hè",
    sessionCode: "CA-02/07 · 08:30",
    classes: [
      { id: "cls-b2-intensive", name: "B2 — Intensive" },
      { id: "cls-b2-standard", name: "B2 — Standard" },
    ],
    orgName: "UNICOM HCM",
    startAt: "2026-07-02T08:30:00+07:00",
    endAt: "2026-07-02T10:00:00+07:00",
    durationMinutes: 90,
    paperCount: 2,
    candidateCount: 60,
    status: "upcoming",
    proctor: "GV. Lê Bảo Trân",
  },
  {
    id: "evt-a1-progress",
    name: "Bộ đề kiểm tra tiến độ A1 — Tuần 8",
    sessionCode: "CA-30/06 · 09:00",
    classes: [{ id: "cls-a1-basic", name: "A1 — Cơ bản" }],
    orgName: "UNICOM ĐN",
    startAt: "2026-06-30T09:00:00+07:00",
    endAt: "2026-06-30T10:30:00+07:00",
    durationMinutes: 90,
    paperCount: 2,
    candidateCount: 22,
    status: "finished",
    proctor: "GV. Phạm Hoài Nam",
  },
];

export const getExamEvent = (id: string) => examEvents.find((e) => e.id === id);
