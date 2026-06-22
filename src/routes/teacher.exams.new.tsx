import { createFileRoute } from "@tanstack/react-router";
import { ExamBuilder } from "@/routes/admin.exams.new";

export const Route = createFileRoute("/teacher/exams/new")({
  head: () => ({ meta: [{ title: "Tạo bài luyện thi — UNICOM LMS" }] }),
  component: () => <ExamBuilder scope="teacher" />,
});
