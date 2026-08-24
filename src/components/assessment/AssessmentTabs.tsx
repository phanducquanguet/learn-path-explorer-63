import { Link } from "@tanstack/react-router";
import { Library, FileText, CalendarClock, ClipboardCheck } from "lucide-react";
import { cn } from "@/lib/utils";

export type AssessmentScope = "admin" | "teacher";
export type AssessmentTabKey = "bank" | "papers" | "sessions" | "grading";

export const ASSESSMENT_TITLE = "Kiểm tra & Đánh giá";
export const ASSESSMENT_DESCRIPTION =
  "Quản lý câu hỏi, đề thi, lịch tổ chức và kết quả kiểm tra của các lớp được phân công.";

type TabDef = { key: AssessmentTabKey; label: string; icon: typeof Library; to: string };

export function assessmentTabs(scope: AssessmentScope): TabDef[] {
  if (scope === "admin") {
    return [
      { key: "bank", label: "Ngân hàng câu hỏi", icon: Library, to: "/admin/question-bank" },
      { key: "papers", label: "Đề thi", icon: FileText, to: "/admin/tests" },
      { key: "sessions", label: "Tổ chức thi", icon: CalendarClock, to: "/admin/tests/sessions" },
      { key: "grading", label: "Chấm thi", icon: ClipboardCheck, to: "/admin/test-approvals" },
    ];
  }
  return [
    { key: "bank", label: "Ngân hàng câu hỏi", icon: Library, to: "/teacher/question-bank" },
    { key: "papers", label: "Đề thi", icon: FileText, to: "/teacher/tests/papers" },
    { key: "sessions", label: "Tổ chức thi", icon: CalendarClock, to: "/teacher/tests/sessions" },
    { key: "grading", label: "Chấm thi", icon: ClipboardCheck, to: "/teacher/tests" },
  ];
}

export function AssessmentTabBar({
  scope,
  active,
}: {
  scope: AssessmentScope;
  active: AssessmentTabKey;
}) {
  return (
    <nav className="mt-6 flex flex-wrap items-center gap-1 rounded-2xl bg-surface p-1 ring-1 ring-border">
      {assessmentTabs(scope).map((t) => {
        const Icon = t.icon;
        const isActive = t.key === active;
        return (
          <Link
            key={t.key}
            to={t.to}
            className={cn(
              "inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition-colors",
              isActive
                ? "text-primary-foreground shadow-soft"
                : "text-muted-foreground hover:text-foreground",
            )}
            style={isActive ? { background: "var(--gradient-brand)" } : undefined}
          >
            <Icon className="h-4 w-4" />
            {t.label}
          </Link>
        );
      })}
    </nav>
  );
}
