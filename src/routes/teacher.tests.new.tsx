import { createFileRoute } from "@tanstack/react-router";
import { TestExamBuilder } from "@/routes/admin.tests.new";

export const Route = createFileRoute("/teacher/tests/new")({
  head: () => ({
    meta: [
      { title: "Tạo đề thi — UNICOM LMS" },
      { name: "description", content: "Giáo viên soạn đề thi, chọn câu hỏi và gửi đề xuất duyệt." },
      { property: "og:title", content: "Tạo đề thi — UNICOM LMS" },
      { property: "og:description", content: "Giáo viên soạn đề thi, chọn câu hỏi và gửi đề xuất duyệt." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: () => <TestExamBuilder kind="test" scope="teacher" />,
});
