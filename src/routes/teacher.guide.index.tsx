import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { TopNav } from "@/components/TopNav";
import { PageHeader } from "@/components/PageHeader";
import { guideModules, searchGuide } from "@/lib/guide-data";
import { guideIcon } from "@/lib/guide-icons";
import { BookOpen, Search, ArrowRight, ListChecks } from "lucide-react";

export const Route = createFileRoute("/teacher/guide/")({
  head: () => ({
    meta: [
      { title: "Hướng dẫn sử dụng cho giáo viên — UNICOM LMS" },
      {
        name: "description",
        content:
          "Cẩm nang sử dụng hệ thống dành cho giáo viên: lớp học, bài tập, khóa học, chấm thi, báo cáo và xử lý sự cố.",
      },
      { property: "og:title", content: "Hướng dẫn sử dụng cho giáo viên — UNICOM LMS" },
      {
        property: "og:description",
        content: "Chia thành các module nhỏ theo từng tính năng để tra cứu nhanh.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: GuideIndex,
});

function GuideIndex() {
  const [q, setQ] = useState("");
  const modules = searchGuide(q);
  const totalTopics = guideModules.reduce((s, m) => s + m.topics.length, 0);

  return (
    <div className="min-h-screen bg-background">
      <TopNav />
      <main className="mx-auto max-w-7xl px-6 pb-20 pt-10 sm:px-8">
        <PageHeader
          eyebrow="Cẩm nang giáo viên"
          eyebrowIcon={BookOpen}
          title="Hướng dẫn sử dụng"
          description={<>{guideModules.length} module · {totalTopics} hướng dẫn. Mỗi hướng dẫn trình bày theo cùng
          cấu trúc: Mục đích · Điều kiện · Các bước · Kết quả · Nếu không thành công.</>}
        />

        <div className="mt-6 max-w-xl">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Tìm thao tác, ví dụ: gia hạn, gửi duyệt, xuất báo cáo…"
              aria-label="Tìm trong hướng dẫn"
              className="h-11 w-full rounded-xl border border-border bg-surface pl-9 pr-3 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus-visible:ring-1 focus-visible:ring-ring"
            />
          </div>
        </div>

        {modules.length === 0 ? (
          <div className="mt-8 rounded-2xl border border-dashed border-border bg-surface p-10 text-center">
            <ListChecks className="mx-auto h-6 w-6 text-muted-foreground" />
            <div className="mt-3 text-sm font-semibold text-foreground">Không có kết quả</div>
            <p className="mt-1 text-xs text-muted-foreground">
              Thử từ khóa ngắn hơn, ví dụ “bài tập” hoặc “khóa học”.
            </p>
          </div>
        ) : (
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {modules.map((m) => {
              const Icon = guideIcon(m.icon);
              return (
                <Link
                  key={m.id}
                  to="/teacher/guide/$moduleId"
                  params={{ moduleId: m.id }}
                  className="group rounded-2xl border border-border bg-surface p-6 shadow-soft transition hover:-translate-y-0.5 hover:shadow-elevated"
                >
                  <div className="flex items-start justify-between">
                    <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                      <Icon className="h-5 w-5" />
                    </span>
                    <span className="text-[11px] font-semibold text-muted-foreground">
                      {String(m.order).padStart(2, "0")}
                    </span>
                  </div>
                  <h2 className="mt-4 font-display text-lg font-semibold text-foreground">
                    {m.title}
                  </h2>
                  <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{m.summary}</p>
                  <div className="mt-4 flex items-center justify-between text-xs">
                    <span className="rounded-full bg-muted px-2.5 py-1 font-medium text-muted-foreground">
                      {m.topics.length} hướng dẫn
                    </span>
                    <span className="inline-flex items-center gap-1 font-semibold text-primary">
                      Xem <ArrowRight className="h-3.5 w-3.5 transition group-hover:translate-x-0.5" />
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
