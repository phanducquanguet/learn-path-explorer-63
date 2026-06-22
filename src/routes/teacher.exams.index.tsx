import { createFileRoute } from "@tanstack/react-router";
import { ExamsList } from "@/routes/admin.exams.index";

export const Route = createFileRoute("/teacher/exams/")({
  head: () => ({ meta: [{ title: "Luyện thi của tôi — UNICOM LMS" }] }),
  component: () => <ExamsList scope="teacher" />,
});
