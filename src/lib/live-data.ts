export type LiveStatus = "live" | "scheduled" | "ended";

export type LiveSession = {
  id: string;
  title: string;
  classCode: string;
  className: string;
  level: string;
  teacher: string;
  teacherInitials: string;
  startAt: string; // ISO
  durationMin: number;
  status: LiveStatus;
  participantsCount: number;
  topic: string;
  agenda: string[];
  meetingUrl?: string;
  hasRecording?: boolean;
  recordingDurationMin?: number;
};

export type Recording = {
  id: string;
  sessionId: string;
  title: string;
  classCode: string;
  recordedAt: string;
  durationMin: number;
  views: number;
  thumbnail?: string;
};

export type LiveParticipant = {
  id: string;
  name: string;
  initials: string;
  role: "teacher" | "student";
  cameraOn: boolean;
  micOn: boolean;
  handRaised: boolean;
  presenting?: boolean;
  joinedAt: string;
};

export type ChatMessage = {
  id: string;
  authorId: string;
  authorName: string;
  role: "teacher" | "student";
  content: string;
  at: string;
};

export const liveSessions: LiveSession[] = [
  {
    id: "live-001",
    title: "Speaking Practice — Daily Routines",
    classCode: "B1-EVE-02",
    className: "B1 — Nền tảng (Tối T2-T4-T6)",
    level: "B1",
    teacher: "Cô Mai Lan",
    teacherInitials: "ML",
    startAt: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
    durationMin: 75,
    status: "live",
    participantsCount: 18,
    topic: "Unit 4 · Speaking — Talking about your day",
    agenda: [
      "Warm-up: Vocabulary review (10 phút)",
      "Practice: Pair speaking về thói quen hàng ngày",
      "Q&A & feedback từ giáo viên",
    ],
    meetingUrl: "https://meet.unicom.edu.vn/live-001",
  },
  {
    id: "live-002",
    title: "Grammar Deep Dive — Present Perfect",
    classCode: "B1-EVE-02",
    className: "B1 — Nền tảng (Tối T2-T4-T6)",
    level: "B1",
    teacher: "Cô Mai Lan",
    teacherInitials: "ML",
    startAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    durationMin: 60,
    status: "scheduled",
    participantsCount: 22,
    topic: "Unit 5 · Grammar — Present Perfect vs Past Simple",
    agenda: [
      "Review nhanh thì quá khứ đơn",
      "Giới thiệu Present Perfect — cấu trúc & dấu hiệu",
      "Bài tập áp dụng + chữa bài",
    ],
  },
  {
    id: "live-003",
    title: "IELTS Writing Task 2 — Workshop",
    classCode: "B2-IELTS-01",
    className: "B2 — Bứt phá (IELTS Foundation)",
    level: "B2",
    teacher: "Thầy Quang Huy",
    teacherInitials: "QH",
    startAt: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
    durationMin: 90,
    status: "scheduled",
    participantsCount: 15,
    topic: "Writing Task 2 — Opinion Essay structure",
    agenda: [
      "Phân tích đề mẫu band 7+",
      "Lập dàn ý theo cấu trúc PEEL",
      "Viết & peer-review trực tiếp",
    ],
  },
  {
    id: "live-004",
    title: "Listening Skills — Note-taking",
    classCode: "B1-EVE-02",
    className: "B1 — Nền tảng (Tối T2-T4-T6)",
    level: "B1",
    teacher: "Cô Mai Lan",
    teacherInitials: "ML",
    startAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    durationMin: 70,
    status: "ended",
    participantsCount: 20,
    topic: "Unit 3 · Listening — Kỹ thuật ghi chú nhanh",
    agenda: ["Giới thiệu Cornell method", "Luyện nghe đoạn hội thoại", "Tổng kết"],
    hasRecording: true,
    recordingDurationMin: 68,
  },
  {
    id: "live-005",
    title: "Pronunciation Clinic",
    classCode: "B1-EVE-02",
    className: "B1 — Nền tảng (Tối T2-T4-T6)",
    level: "B1",
    teacher: "Cô Mai Lan",
    teacherInitials: "ML",
    startAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    durationMin: 60,
    status: "ended",
    participantsCount: 17,
    topic: "Âm /θ/ và /ð/ — Phân biệt và luyện tập",
    agenda: [],
    hasRecording: true,
    recordingDurationMin: 58,
  },
];

export const recordings: Recording[] = liveSessions
  .filter((s) => s.hasRecording)
  .map((s) => ({
    id: `rec-${s.id}`,
    sessionId: s.id,
    title: s.title,
    classCode: s.classCode,
    recordedAt: s.startAt,
    durationMin: s.recordingDurationMin ?? s.durationMin,
    views: Math.floor(Math.random() * 40) + 10,
  }));

export const liveParticipants: LiveParticipant[] = [
  {
    id: "u-teacher",
    name: "Cô Mai Lan",
    initials: "ML",
    role: "teacher",
    cameraOn: true,
    micOn: true,
    handRaised: false,
    presenting: true,
    joinedAt: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
  },
  { id: "u-1", name: "Bảo Châu", initials: "BC", role: "student", cameraOn: true, micOn: false, handRaised: true, joinedAt: new Date().toISOString() },
  { id: "u-2", name: "Minh Anh", initials: "MA", role: "student", cameraOn: true, micOn: false, handRaised: false, joinedAt: new Date().toISOString() },
  { id: "u-3", name: "Quốc Khánh", initials: "QK", role: "student", cameraOn: false, micOn: false, handRaised: false, joinedAt: new Date().toISOString() },
  { id: "u-4", name: "Thu Hà", initials: "TH", role: "student", cameraOn: true, micOn: true, handRaised: false, joinedAt: new Date().toISOString() },
  { id: "u-5", name: "Đức Anh", initials: "DA", role: "student", cameraOn: false, micOn: false, handRaised: true, joinedAt: new Date().toISOString() },
  { id: "u-6", name: "Linh Chi", initials: "LC", role: "student", cameraOn: true, micOn: false, handRaised: false, joinedAt: new Date().toISOString() },
  { id: "u-7", name: "Hải Đăng", initials: "HD", role: "student", cameraOn: false, micOn: false, handRaised: false, joinedAt: new Date().toISOString() },
  { id: "u-8", name: "Phương Vy", initials: "PV", role: "student", cameraOn: true, micOn: false, handRaised: false, joinedAt: new Date().toISOString() },
];

export const initialChat: ChatMessage[] = [
  {
    id: "m-1",
    authorId: "u-teacher",
    authorName: "Cô Mai Lan",
    role: "teacher",
    content: "Chào cả lớp! Hôm nay chúng ta sẽ luyện speaking về daily routines nhé.",
    at: new Date(Date.now() - 12 * 60 * 1000).toISOString(),
  },
  {
    id: "m-2",
    authorId: "u-2",
    authorName: "Minh Anh",
    role: "student",
    content: "Em đã sẵn sàng ạ 🙌",
    at: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
  },
  {
    id: "m-3",
    authorId: "u-teacher",
    authorName: "Cô Mai Lan",
    role: "teacher",
    content: "Các bạn mở slide trang 24 giúp cô nhé.",
    at: new Date(Date.now() - 8 * 60 * 1000).toISOString(),
  },
  {
    id: "m-4",
    authorId: "u-4",
    authorName: "Thu Hà",
    role: "student",
    content: "Cô ơi, từ 'routine' phát âm thế nào ạ?",
    at: new Date(Date.now() - 4 * 60 * 1000).toISOString(),
  },
];

export function getLiveSession(id: string): LiveSession | undefined {
  return liveSessions.find((s) => s.id === id);
}

export function formatStartAt(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleString("vi-VN", {
    weekday: "short",
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function relativeFromNow(iso: string): string {
  const diff = new Date(iso).getTime() - Date.now();
  const abs = Math.abs(diff);
  const min = Math.round(abs / 60000);
  if (min < 60) return diff >= 0 ? `trong ${min} phút` : `${min} phút trước`;
  const h = Math.round(min / 60);
  if (h < 24) return diff >= 0 ? `trong ${h} giờ` : `${h} giờ trước`;
  const d = Math.round(h / 24);
  return diff >= 0 ? `trong ${d} ngày` : `${d} ngày trước`;
}
