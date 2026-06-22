import { createFileRoute } from "@tanstack/react-router";
import { BankPage } from "@/routes/admin.question-bank";

export const Route = createFileRoute("/teacher/question-bank")({
  head: () => ({ meta: [{ title: "Ngân hàng câu hỏi của tôi — UNICOM LMS" }] }),
  component: () => <BankPage scope="teacher" />,
});
