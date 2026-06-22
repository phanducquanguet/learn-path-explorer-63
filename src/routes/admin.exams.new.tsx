import { createFileRoute } from "@tanstack/react-router";
import { TestExamBuilder } from "@/routes/admin.tests.new";

export const Route = createFileRoute("/admin/exams/new")({
  head: () => ({ meta: [{ title: "Tạo bài luyện thi — UNICOM LMS" }] }),
  component: () => <TestExamBuilder kind="exam" scope="admin" />,
});

// Re-export so existing imports of ExamBuilder keep compiling.
export const ExamBuilder = ({ scope = "admin" }: { scope?: "admin" | "teacher" } = {}) => (
  <TestExamBuilder kind="exam" scope={scope} />
);
