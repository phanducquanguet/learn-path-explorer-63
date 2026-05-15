import { Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import {
  BookOpen,
  Home,
  GraduationCap,
  ClipboardCheck,
  LayoutDashboard,
  BarChart3,
  Users,
  ChevronDown,
  UserCog,
  LogOut,
  UserRound,
  Check,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useRole } from "@/contexts/RoleContext";

const studentTabs = [
  { to: "/" as const, label: "Trang chủ", icon: Home },
  { to: "/courses" as const, label: "Khóa học", icon: GraduationCap },
  { to: "/exams" as const, label: "Luyện thi", icon: ClipboardCheck },
];

const teacherTabs = [
  { to: "/teacher" as const, label: "Tổng quan", icon: LayoutDashboard },
  { to: "/teacher/classes" as const, label: "Lớp học", icon: Users },
  { to: "/courses" as const, label: "Khóa học", icon: GraduationCap },
  { to: "/teacher/exams" as const, label: "Luyện thi", icon: ClipboardCheck },
  { to: "/teacher/reports" as const, label: "Báo cáo", icon: BarChart3 },
];

export function TopNav() {
  const { role, setRole } = useRole();
  const tabs = role === "teacher" ? teacherTabs : studentTabs;
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    window.addEventListener("mousedown", onClick);
    return () => window.removeEventListener("mousedown", onClick);
  }, []);

  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6 sm:px-8">
        <Link to={role === "teacher" ? "/teacher" : "/"} className="flex items-center gap-2">
          <div
            className="flex h-9 w-9 items-center justify-center rounded-xl text-primary-foreground shadow-soft"
            style={{ background: "var(--gradient-brand)" }}
          >
            <BookOpen className="h-5 w-5" />
          </div>
          <div className="leading-tight">
            <div className="text-sm font-semibold text-foreground">UNICOM LMS</div>
            <div className="text-[11px] text-muted-foreground">
              {role === "teacher" ? "Giáo viên" : "Học viên"}
            </div>
          </div>
        </Link>

        <nav className="flex items-center gap-1 rounded-full bg-surface p-1 ring-1 ring-border shadow-soft">
          {tabs.map((t) => {
            const Icon = t.icon;
            return (
              <Link
                key={t.to}
                to={t.to}
                activeOptions={{ exact: t.to === "/" || t.to === "/teacher" }}
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

        <div className="relative flex items-center gap-2" ref={ref}>
          <span className="hidden rounded-full bg-surface px-3 py-1.5 text-xs font-medium text-muted-foreground ring-1 ring-border md:inline-flex">
            {role === "teacher" ? "👩‍🏫 4 lớp đang dạy" : "🔥 12 ngày liên tục"}
          </span>
          <button
            onClick={() => setOpen((v) => !v)}
            className="flex items-center gap-1.5 rounded-full p-0.5 pr-2 ring-1 ring-border bg-surface hover:bg-muted transition"
          >
            <div
              className={cn(
                "flex h-9 w-9 items-center justify-center rounded-full text-sm font-semibold text-primary-foreground",
                role === "teacher"
                  ? "bg-gradient-to-br from-emerald-500 to-teal-600"
                  : "bg-gradient-to-br from-primary to-chart-5",
              )}
            >
              {role === "teacher" ? "ML" : "BC"}
            </div>
            <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
          </button>

          {open && (
            <div className="absolute right-0 top-12 w-72 rounded-2xl border border-border bg-background p-2 shadow-elevated">
              <div className="flex items-center gap-3 rounded-xl bg-surface p-3">
                <div
                  className={cn(
                    "flex h-10 w-10 items-center justify-center rounded-full text-sm font-semibold text-primary-foreground",
                    role === "teacher"
                      ? "bg-gradient-to-br from-emerald-500 to-teal-600"
                      : "bg-gradient-to-br from-primary to-chart-5",
                  )}
                >
                  {role === "teacher" ? "ML" : "BC"}
                </div>
                <div className="min-w-0">
                  <div className="truncate text-sm font-semibold text-foreground">
                    {role === "teacher" ? "Cô Mai Lan" : "Bảo Châu"}
                  </div>
                  <div className="truncate text-[11px] text-muted-foreground">
                    {role === "teacher" ? "mailan@unicom.edu.vn" : "baochau@student.unicom.edu.vn"}
                  </div>
                </div>
              </div>

              <div className="mt-2 px-2 pb-1 pt-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                Chuyển đổi giao diện
              </div>
              <button
                onClick={() => {
                  setRole("student");
                  setOpen(false);
                }}
                className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-medium text-foreground hover:bg-muted"
              >
                <UserRound className="h-4 w-4" />
                <span className="flex-1 text-left">Học viên</span>
                {role === "student" && <Check className="h-4 w-4 text-primary" />}
              </button>
              <Link
                to="/teacher"
                onClick={() => {
                  setRole("teacher");
                  setOpen(false);
                }}
                className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-medium text-foreground hover:bg-muted"
              >
                <UserCog className="h-4 w-4" />
                <span className="flex-1 text-left">Giáo viên</span>
                {role === "teacher" && <Check className="h-4 w-4 text-primary" />}
              </Link>

              <div className="my-1.5 h-px bg-border" />
              <button className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-sm text-muted-foreground hover:bg-muted hover:text-foreground">
                <LogOut className="h-4 w-4" /> Đăng xuất
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
