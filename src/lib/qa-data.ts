export type QAAnswer = {
  id: string;
  authorName: string;
  authorRole: "teacher" | "admin";
  content: string;
  answeredAt: string;
};

export type CourseQuestion = {
  id: string;
  courseId: string;
  unitTitle: string;
  studentName: string;
  studentClass: string;
  askedAt: string;
  content: string;
  answers: QAAnswer[];
};

export const courseQuestions: CourseQuestion[] = [
  {
    id: "q1",
    courseId: "b1-empower",
    unitTitle: "Unit 3: Travel Stories",
    studentName: "Nguyễn Minh Anh",
    studentClass: "B1 — Fastrack",
    askedAt: "2025-05-12T10:24:00Z",
    content:
      "Em chưa hiểu rõ sự khác biệt giữa Past Simple và Present Perfect trong tình huống kể chuyện du lịch. Cô có thể giải thích lại được không ạ?",
    answers: [
      {
        id: "a1",
        authorName: "Cô Mai Lan",
        authorRole: "teacher",
        content:
          "Em dùng Past Simple khi đã biết rõ thời điểm (last year, in 2020...). Dùng Present Perfect khi nhấn mạnh kết quả/kinh nghiệm tới hiện tại (I have been to Japan).",
        answeredAt: "2025-05-12T14:00:00Z",
      },
    ],
  },
  {
    id: "q2",
    courseId: "b1-empower",
    unitTitle: "Unit 4: Work & Study",
    studentName: "Phạm Quốc Bảo",
    studentClass: "B1 — Fastrack",
    askedAt: "2025-05-14T09:10:00Z",
    content: "Bài quiz 4 câu số 7 đáp án đúng là B hay D ạ? Em thấy cả 2 đều hợp lý.",
    answers: [],
  },
  {
    id: "q3",
    courseId: "a2-empower",
    unitTitle: "Unit 2: Daily Routines",
    studentName: "Lê Thị Hương",
    studentClass: "A2 — Weekend Boost",
    askedAt: "2025-05-15T08:00:00Z",
    content: "Cô ơi từ 'commute' đọc như thế nào ạ?",
    answers: [
      {
        id: "a3",
        authorName: "Cô Mai Lan",
        authorRole: "teacher",
        content: "Đọc là /kəˈmjuːt/ nhé em. Trọng âm rơi vào âm tiết thứ hai.",
        answeredAt: "2025-05-15T08:45:00Z",
      },
    ],
  },
  {
    id: "q4",
    courseId: "a1-foundation",
    unitTitle: "Unit 1: Greetings",
    studentName: "Vũ Khánh Linh",
    studentClass: "A1 — Morning Stars",
    askedAt: "2025-05-16T07:30:00Z",
    content: "Khi gặp người lớn tuổi mình nên nói 'Hi' hay 'Hello' ạ?",
    answers: [],
  },
  {
    id: "q5",
    courseId: "b2-empower",
    unitTitle: "Unit 2: Daily Routines",
    studentName: "Đặng Thuỳ Trang",
    studentClass: "B1 — Fastrack",
    askedAt: "2025-05-16T11:00:00Z",
    content: "Phần listening tốc độ hơi nhanh, em không bắt kịp, có mẹo nào không cô?",
    answers: [],
  },
];
