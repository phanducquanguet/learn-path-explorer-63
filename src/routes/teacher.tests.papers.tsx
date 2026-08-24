import { createFileRoute } from "@tanstack/react-router";
import { PapersList } from "@/components/assessment/PapersList";

export const Route = createFileRoute("/teacher/tests/papers")({
  head: () => ({
    meta: [
      { title: "Quản lý đề thi — Kiểm tra & Đánh giá — UNICOM LMS" },
      { name: "description", content: "Quản lý nội dung đề thi, trạng thái duyệt và phiên bản đề." },
      { property: "og:title", content: "Quản lý đề thi — Kiểm tra & Đánh giá" },
      { property: "og:description", content: "Quản lý nội dung đề thi, trạng thái duyệt và phiên bản đề." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: () => <PapersList scope="teacher" />,
});
