import { createFileRoute } from "@tanstack/react-router";
import { SessionsList } from "@/components/assessment/SessionsList";

export const Route = createFileRoute("/admin/tests/sessions")({
  validateSearch: (search: Record<string, unknown>) => ({
    testId: typeof search.testId === "string" ? search.testId : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Tổ chức thi — Kiểm tra & Đánh giá — UNICOM LMS" },
      { name: "description", content: "Phân phối đề đã duyệt cho lớp và thiết lập lịch thi." },
      { property: "og:title", content: "Tổ chức thi — Kiểm tra & Đánh giá" },
      { property: "og:description", content: "Phân phối đề đã duyệt cho lớp và thiết lập lịch thi." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: () => {
    const { testId } = Route.useSearch();
    return <SessionsList scope="admin" presetTestId={testId} />;
  },
});
