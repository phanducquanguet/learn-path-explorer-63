export type CourseReview = {
  id: string;
  courseId: string;
  studentName: string;
  studentClass: string;
  teacherName: string;
  courseRating: number; // 1-5
  teacherRating: number; // 1-5
  content: string;
  createdAt: string;
};

export const courseReviews: CourseReview[] = [
  {
    id: "r1",
    courseId: "b1-empower",
    studentName: "Nguyễn Minh Anh",
    studentClass: "B1 — Fastrack",
    teacherName: "Cô Mai Lan",
    courseRating: 5,
    teacherRating: 5,
    content:
      "Khóa học rất hữu ích, nội dung sát thực tế. Cô Mai Lan giảng dễ hiểu và rất tận tâm với học viên.",
    createdAt: "2025-05-20T08:30:00Z",
  },
  {
    id: "r2",
    courseId: "b1-empower",
    studentName: "Phạm Quốc Bảo",
    studentClass: "B1 — Fastrack",
    teacherName: "Cô Mai Lan",
    courseRating: 4,
    teacherRating: 5,
    content:
      "Bài tập đa dạng, phần luyện nghe hơi nhanh nhưng cô luôn hỗ trợ kịp thời khi mình hỏi.",
    createdAt: "2025-05-22T10:00:00Z",
  },
  {
    id: "r3",
    courseId: "a2-empower",
    studentName: "Lê Thị Hương",
    studentClass: "A2 — Weekend Boost",
    teacherName: "Thầy Hoàng Nam",
    courseRating: 5,
    teacherRating: 4,
    content: "Mình thích cách sắp xếp các unit, từ vựng dễ nhớ.",
    createdAt: "2025-05-18T14:20:00Z",
  },
];
