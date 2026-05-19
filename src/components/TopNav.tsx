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
  ScrollText,
  Library,
  Shield,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useRole, type Role } from "@/contexts/RoleContext";

const studentTabs = [
  { to: "/" as const, label: "Trang chủ", icon: Home },
  { to: "/courses" as const, label: "Khóa học", icon: GraduationCap },
  { to: "/practice" as const, label: "Luyện thi", icon: ClipboardCheck },
  { to: "/exams" as const, label: "Thi cử", icon: ScrollText },
];

const teacherTabs = [
  { to: "/teacher" as const, label: "Tổng quan", icon: LayoutDashboard },
  { to: "/teacher/classes" as const, label: "Lớp học", icon: Users },
  { to: "/courses" as const, label: "Khóa học", icon: GraduationCap },
  { to: "/teacher/exams" as const, label: "Luyện thi", icon: ClipboardCheck },
  { to: "/teacher/tests" as const, label: "Thi cử", icon: ScrollText },
  { to: "/teacher/reports" as const, label: "Báo cáo", icon: BarChart3 },
];

const adminTabs = [
  { to: "/courses" as const, label: "Khóa học", icon: GraduationCap },
  { to: "/teacher/exams" as const, label: "Luyện thi", icon: ClipboardCheck },
  { to: "/teacher/tests" as const, label: "Thi cử", icon: ScrollText },
  { to: "/admin/question-bank" as const, label: "Ngân hàng câu hỏi", icon: Library },
  { to: "/teacher/reports" as const, label: "Báo cáo", icon: BarChart3 },
];

function roleMeta(role: Role) {
  if (role === "admin")
    return {
      label: "Quản trị viên",
      initials: "AD",
      gradient: "bg-gradient-to-br from-violet-500 to-fuchsia-600",
      name: "Admin UNICOM",
      email: "admin@unicom.edu.vn",
      tag: "🛡️ Full access",
    };
  if (role === "teacher")
    return {
      label: "Giáo viên",
      initials: "ML",
      gradient: "bg-gradient-to-br from-emerald-500 to-teal-600",
      name: "Cô Mai Lan",
      email: "mailan@unicom.edu.vn",
      tag: "👩‍🏫 4 lớp đang dạy",
    };
  return {
    label: "Học viên",
    initials: "BC",
    gradient: "bg-gradient-to-br from-primary to-chart-5",
    name: "Bảo Châu",
    email: "baochau@student.unicom.edu.vn",
    tag: "🔥 12 ngày liên tục",
  };
}

export function TopNav() {
  const { role, setRole } = useRole();
  const tabs = role === "admin" ? adminTabs : role === "teacher" ? teacherTabs : studentTabs;
  const meta = roleMeta(role);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    window.addEventListener("mousedown", onClick);
    return () => window.removeEventListener("mousedown", onClick);
  }, []);

  const homeFor = (r: Role) => (r === "student" ? "/" : "/teacher");

  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6 sm:px-8">
        <Link to={homeFor(role)} className="flex items-center gap-2">
          <div
            className="flex h-9 w-9 items-center justify-center rounded-xl text-primary-foreground shadow-soft"
            style={{ background: "var(--gradient-brand)" }}
          >
            <BookOpen className="h-5 w-5" />
          </div>
          <div className="leading-tight">
            <div className="text-sm font-semibold text-foreground">UNICOM LMS</div>
            <div className="text-[11px] text-muted-foreground">{meta.label}</div>
          </div>
        </Link>

        <nav className="flex items-center gap-1 rounded-full bg-surface p-1 ring-1 ring-border shadow-soft overflow-x-auto max-w-[60vw]">
          {tabs.map((t) => {
            const Icon = t.icon;
            return (
              <Link
                key={t.to}
                to={t.to}
                activeOptions={{ exact: t.to === "/" || t.to === "/teacher" }}
                className={cn(
                  "inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-colors whitespace-nowrap",
                  "text-muted-foreground hover:text-foreground",
                )}
                activeProps={{
                  className:
                    "inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium text-primary-foreground shadow-soft whitespace-nowrap",
                  style: { background: "var(--gradient-brand)" },
                }}
              >
                <Icon className="h-4 w-4" />
                <span className="hidden lg:inline">{t.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="relative flex items-center gap-2" ref={ref}>
          <span className="hidden rounded-full bg-surface px-3 py-1.5 text-xs font-medium text-muted-foreground ring-1 ring-border md:inline-flex">
            {meta.tag}
          </span>
          <button
            onClick={() => setOpen((v) => !v)}
            className="flex items-center gap-1.5 rounded-full p-0.5 pr-2 ring-1 ring-border bg-surface hover:bg-muted transition"
          >
            <div
              className={cn(
                "flex h-9 w-9 items-center justify-center rounded-full text-sm font-semibold text-primary-foreground",
                meta.gradient,
              )}
            >
              {meta.initials}
            </div>
            <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
          </button>

          {open && (
            <div className="absolute right-0 top-12 w-72 rounded-2xl border border-border bg-background p-2 shadow-elevated">
              <div className="flex items-center gap-3 rounded-xl bg-surface p-3">
                <div
                  className={cn(
                    "flex h-10 w-10 items-center justify-center rounded-full text-sm font-semibold text-primary-foreground",
                    meta.gradient,
                  )}
                >
                  {meta.initials}
                </div>
                <div className="min-w-0">
                  <div className="truncate text-sm font-semibold text-foreground">{meta.name}</div>
                  <div className="truncate text-[11px] text-muted-foreground">{meta.email}</div>
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
              <Link
                to="/teacher"
                onClick={() => {
                  setRole("admin");
                  setOpen(false);
                }}
                className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-medium text-foreground hover:bg-muted"
              >
                <Shield className="h-4 w-4" />
                <span className="flex-1 text-left">Quản trị viên</span>
                {role === "admin" && <Check className="h-4 w-4 text-primary" />}
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
