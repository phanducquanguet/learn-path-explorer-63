import { createFileRoute } from "@tanstack/react-router";
import { ExamsList } from "@/routes/admin.exams.index";

export const Route = createFileRoute("/teacher/exams/")({
  head: () => ({ meta: [{ title: "Bài tập & Kiểm tra — UNICOM LMS" }] }),
  component: () => <ExamsList scope="teacher" />,
});
