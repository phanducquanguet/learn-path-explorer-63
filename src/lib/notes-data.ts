export type LessonNote = {
  id: string;
  courseId: string;
  unitId: string;
  unitTitle: string;
  activityId: string;
  activityTitle: string;
  activityType: "video" | "reading" | "quiz" | "speaking" | "writing";
  scopeLabel: string;
  content: string;
  createdAt: string;
};

export const lessonNotes: LessonNote[] = [
  {
    id: "n1",
    courseId: "a1-foundation",
    unitId: "u1",
    unitTitle: "Unit 1: Hello!",
    activityId: "a1-1",
    activityTitle: "Greetings — Video bài giảng",
    activityType: "video",
    scopeLabel: "Toàn bài giảng",
    content:
      "Phân biệt cách chào trong tình huống trang trọng (Good morning) và thân mật (Hi/Hey).",
    createdAt: "2025-05-10T08:20:00Z",
  },
  {
    id: "n2",
    courseId: "a1-foundation",
    unitId: "u1",
    unitTitle: "Unit 1: Hello!",
    activityId: "a1-2",
    activityTitle: "Greetings — Reading & Listening",
    activityType: "reading",
    scopeLabel: "Task 1A",
    content: "Từ mới: nationality, hometown, occupation. Ghi nhớ cách phát âm /ˌnæʃəˈnæləti/.",
    createdAt: "2025-05-11T10:05:00Z",
  },
  {
    id: "n3",
    courseId: "a1-foundation",
    unitId: "u2",
    unitTitle: "Unit 2: Daily Routines",
    activityId: "a2-1",
    activityTitle: "Daily routines — Vocabulary",
    activityType: "reading",
    scopeLabel: "Toàn unit",
    content: "Cấu trúc: I usually + V / I never + V. Adverbs of frequency đứng trước động từ thường.",
    createdAt: "2025-05-13T09:00:00Z",
  },
  {
    id: "n4",
    courseId: "b1-empower",
    unitId: "u3",
    unitTitle: "Unit 3: Travel Stories",
    activityId: "a3-2",
    activityTitle: "Past Simple vs Present Perfect",
    activityType: "video",
    scopeLabel: "Toàn bài giảng",
    content:
      "Past Simple: thời điểm xác định. Present Perfect: kinh nghiệm/kết quả tới hiện tại. Ví dụ: I went to Paris last year vs I have been to Paris.",
    createdAt: "2025-05-12T15:30:00Z",
  },
  {
    id: "n5",
    courseId: "b1-empower",
    unitId: "u4",
    unitTitle: "Unit 4: Work & Study",
    activityId: "a4-1",
    activityTitle: "Work & Study — Reading",
    activityType: "reading",
    scopeLabel: "Task 2B",
    content: "Collocations: pursue a career, take a course, juggle work and study.",
    createdAt: "2025-05-14T11:20:00Z",
  },
  {
    id: "n6",
    courseId: "b1-empower",
    unitId: "u4",
    unitTitle: "Unit 4: Work & Study",
    activityId: "a4-3",
    activityTitle: "Quiz 4 — Tổng hợp",
    activityType: "quiz",
    scopeLabel: "Câu 7",
    content: "Câu 7 còn đang phân vân giữa B và D, cần hỏi cô.",
    createdAt: "2025-05-14T11:40:00Z",
  },
  {
    id: "n7",
    courseId: "a2-empower",
    unitId: "u2",
    unitTitle: "Unit 2: Daily Routines",
    activityId: "a2-2",
    activityTitle: "Daily routines — Listening",
    activityType: "reading",
    scopeLabel: "Track 2",
    content: "Từ 'commute' /kəˈmjuːt/ — trọng âm rơi vào âm tiết thứ 2.",
    createdAt: "2025-05-15T08:50:00Z",
  },
];
