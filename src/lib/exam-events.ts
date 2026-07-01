export type ExamEventStatus = "upcoming" | "live" | "finished";

export type ExamEvent = {
  id: string;
  name: string; // Tên kỳ thi (không phải tên đề)
  classId: string;
  className: string;
  orgName: string;
  startAt: string;
  endAt: string;
  durationMinutes: number;
  paperCount: number; // số đề phụ trong kỳ
  candidateCount: number;
  status: ExamEventStatus;
  proctor?: string;
};

const iso = (offsetMin: number) => new Date(Date.now() + offsetMin * 60_000).toISOString();

export const examEvents: ExamEvent[] = [
  {
    id: "evt-b1-midterm",
    name: "Kỳ thi giữa kỳ B1 — Tháng 6/2026",
    classId: "cls-b1-fast",
    className: "B1 — Fastrack",
    orgName: "UNICOM HN",
    startAt: iso(-45),
    endAt: iso(45),
    durationMinutes: 90,
    paperCount: 4,
    candidateCount: 24,
    status: "live",
    proctor: "GV. Nguyễn Thu Hà",
  },
  {
    id: "evt-a2-final",
    name: "Kỳ thi cuối khóa A2 — Đợt 3",
    classId: "cls-a2-weekend",
    className: "A2 — Cuối tuần",
    orgName: "UNICOM HN",
    startAt: iso(-20),
    endAt: iso(70),
    durationMinutes: 90,
    paperCount: 3,
    candidateCount: 18,
    status: "live",
    proctor: "GV. Trần Minh Đức",
  },
  {
    id: "evt-b2-placement",
    name: "Kỳ thi xếp lớp B2 — Khóa hè",
    classId: "cls-b2-intensive",
    className: "B2 — Intensive",
    orgName: "UNICOM HCM",
    startAt: iso(90),
    endAt: iso(180),
    durationMinutes: 90,
    paperCount: 2,
    candidateCount: 30,
    status: "upcoming",
    proctor: "GV. Lê Bảo Trân",
  },
  {
    id: "evt-a1-progress",
    name: "Kiểm tra tiến độ A1 — Tuần 8",
    classId: "cls-a1-basic",
    className: "A1 — Cơ bản",
    orgName: "UNICOM ĐN",
    startAt: iso(-240),
    endAt: iso(-150),
    durationMinutes: 90,
    paperCount: 2,
    candidateCount: 22,
    status: "finished",
    proctor: "GV. Phạm Hoài Nam",
  },
];

export const getExamEvent = (id: string) => examEvents.find((e) => e.id === id);
