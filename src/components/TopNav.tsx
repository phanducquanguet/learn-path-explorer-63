import { Link } from "@tanstack/react-router";
import { BookOpen, Home, GraduationCap, ClipboardCheck } from "lucide-react";
import { cn } from "@/lib/utils";

const tabs = [
  { to: "/" as const, label: "Trang chủ", icon: Home },
  { to: "/courses" as const, label: "Khóa học", icon: GraduationCap },
  { to: "/exams" as const, label: "Luyện thi", icon: ClipboardCheck },
];

export function TopNav() {
  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6 sm:px-8">
        <Link to="/" className="flex items-center gap-2">
          <div
            className="flex h-9 w-9 items-center justify-center rounded-xl text-primary-foreground shadow-soft"
            style={{ background: "var(--gradient-brand)" }}
          >
            <BookOpen className="h-5 w-5" />
          </div>
          <div className="leading-tight">
            <div className="text-sm font-semibold text-foreground">UNICOM LMS</div>
            <div className="text-[11px] text-muted-foreground">Học viên</div>
          </div>
        </Link>

        <nav className="flex items-center gap-1 rounded-full bg-surface p-1 ring-1 ring-border shadow-soft">
          {tabs.map((t) => {
            const Icon = t.icon;
            return (
              <Link
                key={t.to}
                to={t.to}
                activeOptions={{ exact: t.to === "/" }}
                className={cn(
                  "inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-colors",
                  "text-muted-foreground hover:text-foreground",
                )}
                activeProps={{
                  className:
                    "inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium text-primary-foreground shadow-soft",
                  style: { background: "var(--gradient-brand)" },
                }}
              >
                <Icon className="h-4 w-4" />
                <span className="hidden sm:inline">{t.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          <span className="hidden rounded-full bg-surface px-3 py-1.5 text-xs font-medium text-muted-foreground ring-1 ring-border md:inline-flex">
            🔥 12 ngày liên tục
          </span>
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-primary to-chart-5 text-sm font-semibold text-primary-foreground">
            BC
          </div>
        </div>
      </div>
    </header>
  );
}
