import { createFileRoute } from "@tanstack/react-router";
import { ExamDetail } from "@/routes/admin.exams.$examId";

export const Route = createFileRoute("/teacher/exams/$examId")({
  head: ({ params }) => ({
    meta: [{ title: `Bài luyện thi ${params.examId} — UNICOM LMS` }],
  }),
  component: () => {
    const { examId } = Route.useParams();
    return <ExamDetail examId={examId} scope="teacher" />;
  },
});
