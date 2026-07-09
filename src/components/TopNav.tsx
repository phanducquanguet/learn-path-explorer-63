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
  ShieldCheck,
  FileText,
  History,
  CheckCircle2,
  RefreshCw,
  XCircle,
  Upload,
  Eye,
  Video,
  Megaphone,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useRole, type Role } from "@/contexts/RoleContext";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  BIOMETRIC_KEY,
  CONSENT_ACTION_LABEL,
  getPolicyVersion,
  readConsentLog,
  type BiometricRegistration,
  type ConsentLogAction,
  type ConsentLogEntry,
  type PolicyVersion,
} from "@/lib/policy";

const studentTabs = [
  { to: "/" as const, label: "Trang chủ", icon: Home },
  { to: "/courses" as const, label: "Khóa học", icon: GraduationCap },
  { to: "/live" as const, label: "Lớp trực tuyến", icon: Video },
  { to: "/practice" as const, label: "Bài tập & Luyện thi", icon: ClipboardCheck },
  { to: "/exams" as const, label: "Thi cử", icon: ScrollText },
];

const teacherTabs = [
  { to: "/teacher" as const, label: "Tổng quan", icon: LayoutDashboard },
  { to: "/teacher/classes" as const, label: "Lớp học", icon: Users },
  { to: "/teacher/live" as const, label: "Lớp trực tuyến", icon: Video },
  { to: "/teacher/courses" as const, label: "Khóa học", icon: GraduationCap },
  { to: "/teacher/exams" as const, label: "Bài tập & Kiểm tra", icon: ClipboardCheck },
  { to: "/teacher/tests" as const, label: "Chấm thi", icon: ScrollText },
  { to: "/teacher/reports" as const, label: "Báo cáo", icon: BarChart3 },
];


const adminTabs = [
  { to: "/courses" as const, label: "Khóa học", icon: GraduationCap },
  { to: "/admin/course-approvals" as const, label: "Duyệt khóa học", icon: ShieldCheck },
  { to: "/admin/exams" as const, label: "Luyện thi", icon: ClipboardCheck },
  { to: "/admin/question-bank" as const, label: "Ngân hàng câu hỏi", icon: Library },
  { to: "/admin/tests" as const, label: "Thi cử", icon: ScrollText },
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
      phone: "+84 24 9999 0000",
      org: "UNICOM Education JSC",
    };
  if (role === "teacher")
    return {
      label: "Giáo viên",
      initials: "ML",
      gradient: "bg-gradient-to-br from-emerald-500 to-teal-600",
      name: "Cô Mai Lan",
      email: "mailan@unicom.edu.vn",
      tag: "👩‍🏫 4 lớp đang dạy",
      phone: "+84 90 123 4567",
      org: "Trung tâm UNICOM — CS Hà Nội",
    };
  return {
    label: "Học viên",
    initials: "BC",
    gradient: "bg-gradient-to-br from-primary to-chart-5",
    name: "Bảo Châu",
    email: "baochau@student.unicom.edu.vn",
    tag: "🔥 12 ngày liên tục",
    phone: "+84 98 765 4321",
    org: "Lớp B1 — UNICOM Hà Nội",
  };
}

export function TopNav() {
  const { role, setRole } = useRole();
  const tabs = role === "admin" ? adminTabs : role === "teacher" ? teacherTabs : studentTabs;
  const meta = roleMeta(role);
  const [open, setOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [privacyOpen, setPrivacyOpen] = useState(false);
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
      <div className="flex h-16 w-full items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
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
                Tài khoản
              </div>
              <button
                onClick={() => {
                  setProfileOpen(true);
                  setOpen(false);
                }}
                className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-medium text-foreground hover:bg-muted"
              >
                <UserRound className="h-4 w-4" />
                <span className="flex-1 text-left">Hồ sơ</span>
              </button>
              <button
                onClick={() => {
                  setPrivacyOpen(true);
                  setOpen(false);
                }}
                className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-medium text-foreground hover:bg-muted"
              >
                <ShieldCheck className="h-4 w-4" />
                <span className="flex-1 text-left">Quyền riêng tư &amp; Dữ liệu</span>
              </button>

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
              <Link
                to="/login"
                onClick={() => setOpen(false)}
                className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-sm text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                <LogOut className="h-4 w-4" /> Đăng xuất
              </Link>
            </div>
          )}
        </div>
      </div>

      <ProfileDialog open={profileOpen} onOpenChange={setProfileOpen} meta={meta} />
      <PrivacyDialog open={privacyOpen} onOpenChange={setPrivacyOpen} />
    </header>
  );
}

function ProfileDialog({
  open,
  onOpenChange,
  meta,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  meta: ReturnType<typeof roleMeta>;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserRound className="h-5 w-5 text-primary" />
            Hồ sơ
          </DialogTitle>
          <DialogDescription>Thông tin tài khoản của bạn trên UNICOM LMS.</DialogDescription>
        </DialogHeader>
        <div className="flex items-center gap-3 rounded-xl bg-surface p-3 ring-1 ring-border">
          <div
            className={cn(
              "flex h-12 w-12 items-center justify-center rounded-full text-base font-semibold text-primary-foreground",
              meta.gradient,
            )}
          >
            {meta.initials}
          </div>
          <div className="min-w-0">
            <div className="truncate text-sm font-semibold text-foreground">{meta.name}</div>
            <div className="truncate text-xs text-muted-foreground">{meta.label}</div>
          </div>
        </div>
        <dl className="grid grid-cols-3 gap-2 text-sm">
          <dt className="col-span-1 text-muted-foreground">Email</dt>
          <dd className="col-span-2 break-all text-foreground">{meta.email}</dd>
          <dt className="col-span-1 text-muted-foreground">Điện thoại</dt>
          <dd className="col-span-2 text-foreground">{meta.phone}</dd>
          <dt className="col-span-1 text-muted-foreground">Đơn vị</dt>
          <dd className="col-span-2 text-foreground">{meta.org}</dd>
          <dt className="col-span-1 text-muted-foreground">Vai trò</dt>
          <dd className="col-span-2 text-foreground">{meta.label}</dd>
        </dl>
      </DialogContent>
    </Dialog>
  );
}

function PrivacyDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
}) {
  const [registration, setRegistration] = useState<BiometricRegistration | null>(null);
  const [log, setLog] = useState<ConsentLogEntry[]>([]);
  const [viewing, setViewing] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    if (typeof window === "undefined") return;
    const raw = window.localStorage.getItem(BIOMETRIC_KEY);
    if (raw) {
      try {
        setRegistration(JSON.parse(raw));
      } catch {
        setRegistration(null);
      }
    } else {
      setRegistration(null);
    }
    setLog(readConsentLog());
    setViewing(null);
  }, [open]);

  const currentPolicy: PolicyVersion | null = getPolicyVersion(registration?.policyVersionId);
  const viewingPolicy: PolicyVersion | null = getPolicyVersion(viewing);
  const sortedLog = [...log].sort((a, b) => b.occurredAt.localeCompare(a.occurredAt));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[90vh] max-w-3xl flex-col overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-primary" />
            Quyền riêng tư &amp; Dữ liệu
          </DialogTitle>
          <DialogDescription>
            Lịch sử các lần xác nhận điều khoản sinh trắc học. Mỗi mục lưu lại Policy Version ID để
            truy xuất chính xác nội dung văn bản bạn đã đồng ý tại thời điểm đó.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 space-y-4 overflow-y-auto">
          {/* Current status */}
          <div className="rounded-xl border bg-surface p-3 text-xs">
            <div className="mb-2 flex items-center justify-between">
              <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                Trạng thái hiện tại
              </div>
              {registration ? (
                <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-medium text-emerald-600 ring-1 ring-emerald-500/30">
                  Đã đăng ký
                </span>
              ) : (
                <span className="rounded-full bg-amber-500/10 px-2 py-0.5 text-[10px] font-medium text-amber-600 ring-1 ring-amber-500/30">
                  Chưa đăng ký
                </span>
              )}
            </div>
            {registration ? (
              <div className="grid gap-2 sm:grid-cols-2">
                <Row label="Policy Version ID" value={registration.policyVersionId} mono />
                <Row
                  label="Thời điểm đồng ý"
                  value={new Date(registration.termsAcceptedAt).toLocaleString("vi-VN")}
                />
                <Row
                  label="Hiệu lực từ"
                  value={
                    currentPolicy
                      ? new Date(currentPolicy.effectiveDate).toLocaleDateString("vi-VN")
                      : "—"
                  }
                />
                <Row label="Phạm vi" value={currentPolicy?.scope ?? "—"} />
              </div>
            ) : (
              <div className="text-muted-foreground">
                Bạn chưa đồng ý với chính sách hiện hành. Hoàn tất đăng ký tại mục Thi cử để có thể
                tham gia thi.
              </div>
            )}
          </div>

          {/* Consent log */}
          <div>
            <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              <History className="h-3.5 w-3.5" />
              Nhật ký xác nhận điều khoản ({sortedLog.length})
            </div>
            <ol className="relative space-y-3 border-l border-border pl-5">
              {sortedLog.map((entry) => (
                <LogItem
                  key={entry.id}
                  entry={entry}
                  active={viewing === entry.policyVersionId}
                  onView={() => setViewing(entry.policyVersionId)}
                />
              ))}
              {sortedLog.length === 0 && (
                <li className="text-sm text-muted-foreground">Chưa có lịch sử xác nhận nào.</li>
              )}
            </ol>
          </div>

          {/* Policy text viewer */}
          {viewingPolicy && (
            <div className="rounded-xl border p-4">
              <div className="mb-2 flex items-start justify-between gap-2">
                <div>
                  <div className="mb-1 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-wider text-primary">
                    <FileText className="h-3 w-3" />
                    Văn bản phiên bản {viewingPolicy.id}
                  </div>
                  <h3 className="font-display text-base font-semibold text-foreground">
                    {viewingPolicy.title}
                  </h3>
                  <p className="mt-0.5 text-xs text-muted-foreground">{viewingPolicy.scope}</p>
                </div>
                <button
                  onClick={() => setViewing(null)}
                  className="rounded-full px-2 py-1 text-xs text-muted-foreground hover:bg-muted"
                >
                  Đóng
                </button>
              </div>
              <div className="max-h-64 space-y-3 overflow-y-auto pr-2 text-sm leading-relaxed">
                {viewingPolicy.sections.map((sec) => (
                  <div key={sec.title}>
                    <div className="font-semibold text-foreground">{sec.title}</div>
                    <div className="mt-1 space-y-1.5 text-muted-foreground">
                      {sec.body.map((p, i) => (
                        <p key={i}>{p}</p>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

const ACTION_ICON: Record<ConsentLogAction, typeof CheckCircle2> = {
  "consent.accepted": CheckCircle2,
  "consent.reconfirmed": RefreshCw,
  "consent.updated": Upload,
  "consent.revoked": XCircle,
};

const ACTION_TONE: Record<ConsentLogAction, string> = {
  "consent.accepted": "bg-emerald-500/10 text-emerald-600 ring-emerald-500/30",
  "consent.reconfirmed": "bg-sky-500/10 text-sky-600 ring-sky-500/30",
  "consent.updated": "bg-violet-500/10 text-violet-600 ring-violet-500/30",
  "consent.revoked": "bg-rose-500/10 text-rose-600 ring-rose-500/30",
};

function LogItem({
  entry,
  active,
  onView,
}: {
  entry: ConsentLogEntry;
  active: boolean;
  onView: () => void;
}) {
  const Icon = ACTION_ICON[entry.action];
  return (
    <li className="relative">
      <span
        className={cn(
          "absolute -left-[27px] grid h-6 w-6 place-content-center rounded-full ring-1",
          ACTION_TONE[entry.action],
        )}
      >
        <Icon className="h-3 w-3" />
      </span>
      <div
        className={cn(
          "rounded-xl border bg-background p-3 text-sm",
          active && "ring-2 ring-primary/40",
        )}
      >
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="font-medium text-foreground">{CONSENT_ACTION_LABEL[entry.action]}</div>
          <div className="text-xs text-muted-foreground">
            {new Date(entry.occurredAt).toLocaleString("vi-VN")}
          </div>
        </div>
        <div className="mt-1.5 grid gap-1 text-xs text-muted-foreground sm:grid-cols-2">
          <div>
            <span className="text-[10px] uppercase tracking-wider">Phiên bản</span>
            <div className="font-mono text-[11px] text-foreground break-all">
              {entry.policyVersionId}
            </div>
          </div>
          <div>
            <span className="text-[10px] uppercase tracking-wider">Tiêu đề</span>
            <div className="text-foreground">{entry.policyTitle}</div>
          </div>
          {entry.ipAddress && (
            <div>
              <span className="text-[10px] uppercase tracking-wider">Địa chỉ IP</span>
              <div className="text-foreground">{entry.ipAddress}</div>
            </div>
          )}
          {entry.userAgent && (
            <div>
              <span className="text-[10px] uppercase tracking-wider">Thiết bị</span>
              <div className="truncate text-foreground">{entry.userAgent}</div>
            </div>
          )}
        </div>
        {entry.note && (
          <div className="mt-2 rounded-lg bg-muted/40 px-2.5 py-1.5 text-xs text-muted-foreground">
            {entry.note}
          </div>
        )}
        <div className="mt-2 flex justify-end">
          <button
            onClick={onView}
            className="inline-flex items-center gap-1 rounded-full bg-surface px-2.5 py-1 text-[11px] font-medium text-foreground ring-1 ring-border hover:bg-muted"
          >
            <Eye className="h-3 w-3" />
            Xem văn bản đã đồng ý
          </button>
        </div>
      </div>
    </li>
  );
}

function Row({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex flex-col">
      <span className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</span>
      <span className={cn("text-foreground", mono && "font-mono text-[11px] break-all")}>
        {value}
      </span>
    </div>
  );
}

