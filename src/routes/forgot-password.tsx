import { useEffect, useMemo, useRef, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
  BookOpen,
  Mail,
  ArrowRight,
  ArrowLeft,
  ShieldCheck,
  KeyRound,
  CheckCircle2,
  Lock,
  Eye,
  EyeOff,
  Copy,
  Inbox,
  Star,
  Reply,
  Forward,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

type Step = "email" | "otp" | "reset" | "done";

export const Route = createFileRoute("/forgot-password")({
  head: () => ({
    meta: [
      { title: "Quên mật khẩu — UNICOM LMS" },
      { name: "description", content: "Lấy lại mật khẩu tài khoản UNICOM LMS." },
    ],
  }),
  component: ForgotPasswordPage,
});

const RESEND_SECONDS = 120;

function genOtp() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

function ForgotPasswordPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [demoOtp, setDemoOtp] = useState<string>("");
  const [mailOpen, setMailOpen] = useState(false);
  const [sentAt, setSentAt] = useState<Date | null>(null);

  const handleSendOtp = () => {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.error("Vui lòng nhập email hợp lệ");
      return;
    }
    const otp = genOtp();
    setDemoOtp(otp);
    setSentAt(new Date());
    setMailOpen(true);
    toast.success(`Đã gửi mã OTP đến ${email}`);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-surface via-background to-surface px-4 py-10">
      <div className="w-full max-w-md">
        <Link to="/" className="mb-8 flex items-center justify-center gap-2">
          <div
            className="flex h-11 w-11 items-center justify-center rounded-2xl text-primary-foreground shadow-soft"
            style={{ background: "var(--gradient-brand)" }}
          >
            <BookOpen className="h-6 w-6" />
          </div>
          <div className="leading-tight">
            <div className="text-base font-semibold text-foreground">UNICOM LMS</div>
            <div className="text-[11px] text-muted-foreground">Hệ thống học tập</div>
          </div>
        </Link>

        <Stepper step={step} />

        <div className="mt-5 rounded-3xl border border-border bg-background p-8 shadow-elevated">
          {step === "email" && (
            <EmailStep
              email={email}
              setEmail={setEmail}
              onSend={handleSendOtp}
              onContinue={() => {
                if (!demoOtp) {
                  toast.error("Vui lòng bấm 'Gửi mã OTP' trước");
                  return;
                }
                setStep("otp");
              }}
              demoOtp={demoOtp}
              onOpenMail={() => setMailOpen(true)}
            />
          )}

          {step === "otp" && (
            <OtpStep
              email={email}
              expected={demoOtp}
              onBack={() => setStep("email")}
              onResend={() => {
                const otp = genOtp();
                setDemoOtp(otp);
                setSentAt(new Date());
                setMailOpen(true);
                toast.success("Đã gửi lại mã OTP");
              }}
              onVerified={() => setStep("reset")}
              onOpenMail={() => setMailOpen(true)}
            />
          )}

          {step === "reset" && (
            <ResetStep
              onDone={() => setStep("done")}
            />
          )}

          {step === "done" && (
            <DoneStep onLogin={() => navigate({ to: "/login" })} />
          )}
        </div>

        {step !== "done" && (
          <p className="mt-6 text-center text-xs text-muted-foreground">
            Nhớ ra mật khẩu?{" "}
            <Link to="/login" className="font-medium text-primary hover:underline">
              Quay lại đăng nhập
            </Link>
          </p>
        )}
      </div>

      <DemoMailDialog
        open={mailOpen}
        onOpenChange={setMailOpen}
        email={email}
        otp={demoOtp}
        sentAt={sentAt}
        onClose={() => {
          setMailOpen(false);
          if (step === "email") setStep("otp");
        }}
      />
    </div>
  );
}

function DemoMailDialog({
  open,
  onOpenChange,
  email,
  otp,
  sentAt,
  onClose,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  email: string;
  otp: string;
  sentAt: Date | null;
  onClose: () => void;
}) {
  const time = sentAt
    ? sentAt.toLocaleString("vi-VN", { hour: "2-digit", minute: "2-digit", day: "2-digit", month: "2-digit", year: "numeric" })
    : "";

  const copyOtp = () => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(otp);
      toast.success("Đã sao chép mã OTP");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl gap-0 overflow-hidden rounded-2xl p-0">
        {/* Mail header bar */}
        <div className="flex items-center gap-2 border-b border-border bg-surface px-5 py-3">
          <Inbox className="h-4 w-4 text-primary" />
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Hộp thư demo
          </span>
          <span className="ml-auto text-[11px] text-muted-foreground">Chỉ hiển thị cho FE</span>
        </div>

        <div className="px-6 pt-5">
          <DialogHeader className="space-y-2">
            <DialogTitle className="text-lg">Mã OTP khôi phục mật khẩu — UNICOM LMS</DialogTitle>
            <DialogDescription className="sr-only">Email demo chứa mã OTP</DialogDescription>
          </DialogHeader>

          <div className="mt-3 flex items-start justify-between gap-3 border-b border-border pb-3">
            <div className="flex items-start gap-3">
              <div
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-bold text-primary-foreground"
                style={{ background: "var(--gradient-brand)" }}
              >
                UC
              </div>
              <div className="min-w-0">
                <div className="text-sm font-medium text-foreground">
                  UNICOM LMS{" "}
                  <span className="font-normal text-muted-foreground">&lt;no-reply@unicom.edu.vn&gt;</span>
                </div>
                <div className="text-xs text-muted-foreground">
                  đến <span className="font-medium text-foreground">{email || "bạn"}</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <span className="text-[11px]">{time}</span>
              <Star className="h-3.5 w-3.5" />
            </div>
          </div>

          {/* Mail body */}
          <div className="space-y-4 py-5 text-sm text-foreground">
            <p>Xin chào,</p>
            <p>
              Bạn đã yêu cầu khôi phục mật khẩu cho tài khoản UNICOM LMS. Vui lòng sử dụng mã OTP
              bên dưới để tiếp tục. Mã có hiệu lực trong <strong>10 phút</strong>.
            </p>

            <div className="rounded-2xl border border-dashed border-primary/40 bg-primary/5 p-5 text-center">
              <div className="text-[11px] font-semibold uppercase tracking-wider text-primary">
                Mã xác thực (OTP)
              </div>
              <div className="mt-2 font-mono text-3xl font-bold tracking-[0.4em] text-foreground">
                {otp}
              </div>
              <button
                type="button"
                onClick={copyOtp}
                className="mt-3 inline-flex items-center gap-1.5 rounded-lg border border-border bg-background px-3 py-1.5 text-xs font-medium text-foreground hover:bg-muted"
              >
                <Copy className="h-3.5 w-3.5" /> Sao chép mã
              </button>
            </div>

            <p className="text-xs text-muted-foreground">
              Nếu bạn không yêu cầu khôi phục mật khẩu, vui lòng bỏ qua email này.
            </p>
            <p className="text-xs text-muted-foreground">— Đội ngũ UNICOM LMS</p>
          </div>

          {/* Mail action toolbar */}
          <div className="flex items-center gap-1 border-t border-border py-2 text-muted-foreground">
            <button className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs hover:bg-muted">
              <Reply className="h-3.5 w-3.5" /> Trả lời
            </button>
            <button className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs hover:bg-muted">
              <Forward className="h-3.5 w-3.5" /> Chuyển tiếp
            </button>
            <button className="ml-auto inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs hover:bg-muted">
              <Trash2 className="h-3.5 w-3.5" /> Xoá
            </button>
          </div>
        </div>

        <DialogFooter className="border-t border-border bg-surface px-6 py-3 sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex items-center justify-center gap-2 rounded-xl px-5 py-2 text-sm font-semibold text-primary-foreground shadow-soft transition hover:opacity-95"
            style={{ background: "var(--gradient-brand)" }}
          >
            Đóng & nhập mã OTP <ArrowRight className="h-4 w-4" />
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function Stepper({ step }: { step: Step }) {
  const items: { key: Step; label: string; icon: any }[] = [
    { key: "email", label: "Email", icon: Mail },
    { key: "otp", label: "Xác thực OTP", icon: ShieldCheck },
    { key: "reset", label: "Mật khẩu mới", icon: KeyRound },
    { key: "done", label: "Hoàn tất", icon: CheckCircle2 },
  ];
  const activeIdx = items.findIndex((i) => i.key === step);
  return (
    <div className="flex items-center justify-between gap-2 px-1">
      {items.map((it, i) => {
        const Icon = it.icon;
        const done = i < activeIdx;
        const active = i === activeIdx;
        return (
          <div key={it.key} className="flex flex-1 items-center gap-2">
            <div
              className={cn(
                "flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold transition",
                done && "bg-primary text-primary-foreground",
                active && "bg-primary text-primary-foreground ring-4 ring-primary/15",
                !done && !active && "bg-surface text-muted-foreground ring-1 ring-border",
              )}
            >
              <Icon className="h-4 w-4" />
            </div>
            {i < items.length - 1 && (
              <div
                className={cn(
                  "h-0.5 flex-1 rounded-full transition",
                  i < activeIdx ? "bg-primary" : "bg-border",
                )}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

function EmailStep({
  email,
  setEmail,
  onSend,
  onContinue,
  demoOtp,
}: {
  email: string;
  setEmail: (v: string) => void;
  onSend: () => void;
  onContinue: () => void;
  demoOtp: string;
}) {
  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight text-foreground">Quên mật khẩu</h1>
      <p className="mt-1.5 text-sm text-muted-foreground">
        Nhập email đăng nhập, chúng tôi sẽ gửi mã OTP để xác thực.
      </p>

      <div className="mt-6">
        <label className="mb-1.5 block text-xs font-medium text-foreground">Email tài khoản</label>
        <div className="relative">
          <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="ban@unicom.edu.vn"
            className="w-full rounded-xl border border-border bg-surface py-2.5 pl-10 pr-3 text-sm text-foreground placeholder:text-muted-foreground/70 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>
      </div>

      <button
        type="button"
        onClick={onSend}
        className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-border bg-surface py-2.5 text-sm font-semibold text-foreground transition hover:bg-muted"
      >
        {demoOtp ? "Gửi lại mã OTP" : "Gửi mã OTP"}
      </button>

      {demoOtp && (
        <div className="mt-4 rounded-2xl border border-dashed border-primary/40 bg-primary/5 p-4">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <div className="text-[11px] font-semibold uppercase tracking-wider text-primary">
                Mã OTP demo (chỉ để FE thử nghiệm)
              </div>
              <div className="mt-1 font-mono text-2xl font-bold tracking-[0.4em] text-foreground">
                {demoOtp}
              </div>
              <div className="mt-1 text-[11px] text-muted-foreground">
                Email gửi đến: <span className="font-medium text-foreground">{email}</span>
              </div>
            </div>
            <button
              onClick={() => {
                if (typeof navigator !== "undefined" && navigator.clipboard) {
                  navigator.clipboard.writeText(demoOtp);
                  toast.success("Đã sao chép mã OTP");
                }
              }}
              className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-background text-muted-foreground hover:text-foreground"
              title="Sao chép"
            >
              <Copy className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      <button
        type="button"
        onClick={onContinue}
        disabled={!demoOtp}
        className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-semibold text-primary-foreground shadow-soft transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-50"
        style={{ background: "var(--gradient-brand)" }}
      >
        Nhập mã OTP <ArrowRight className="h-4 w-4" />
      </button>
    </div>
  );
}

function OtpStep({
  email,
  expected,
  onBack,
  onResend,
  onVerified,
}: {
  email: string;
  expected: string;
  onBack: () => void;
  onResend: () => void;
  onVerified: () => void;
}) {
  const [digits, setDigits] = useState<string[]>(Array(6).fill(""));
  const [seconds, setSeconds] = useState(RESEND_SECONDS);
  const inputs = useRef<Array<HTMLInputElement | null>>([]);

  useEffect(() => {
    if (seconds <= 0) return;
    const t = setInterval(() => setSeconds((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(t);
  }, [seconds]);

  const fullOtp = digits.join("");

  const handleChange = (i: number, val: string) => {
    const v = val.replace(/\D/g, "").slice(0, 1);
    const next = [...digits];
    next[i] = v;
    setDigits(next);
    if (v && i < 5) inputs.current[i + 1]?.focus();
  };

  const handleKeyDown = (i: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !digits[i] && i > 0) {
      inputs.current[i - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    const t = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (!t) return;
    e.preventDefault();
    const next = Array(6).fill("");
    for (let i = 0; i < t.length; i++) next[i] = t[i];
    setDigits(next);
    inputs.current[Math.min(t.length, 5)]?.focus();
  };

  const verify = () => {
    if (fullOtp.length !== 6) {
      toast.error("Vui lòng nhập đủ 6 số");
      return;
    }
    if (fullOtp !== expected) {
      toast.error("Mã OTP không chính xác");
      return;
    }
    toast.success("Xác thực thành công");
    onVerified();
  };

  const mm = String(Math.floor(seconds / 60)).padStart(2, "0");
  const ss = String(seconds % 60).padStart(2, "0");

  return (
    <div>
      <button
        onClick={onBack}
        className="mb-3 inline-flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-3.5 w-3.5" /> Quay lại
      </button>
      <h1 className="text-2xl font-semibold tracking-tight text-foreground">Nhập mã OTP</h1>
      <p className="mt-1.5 text-sm text-muted-foreground">
        Chúng tôi đã gửi mã 6 số đến <span className="font-medium text-foreground">{email}</span>.
      </p>

      <div className="mt-6 flex items-center justify-between gap-2">
        {digits.map((d, i) => (
          <input
            key={i}
            ref={(el) => {
              inputs.current[i] = el;
            }}
            value={d}
            onChange={(e) => handleChange(i, e.target.value)}
            onKeyDown={(e) => handleKeyDown(i, e)}
            onPaste={handlePaste}
            inputMode="numeric"
            maxLength={1}
            className="h-14 w-12 rounded-xl border border-border bg-surface text-center font-mono text-xl font-bold text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        ))}
      </div>

      <div className="mt-4 flex items-center justify-between text-xs">
        <span className="text-muted-foreground">
          Không nhận được mã? {seconds > 0 && <span className="font-medium text-foreground">{mm}:{ss}</span>}
        </span>
        <button
          onClick={() => {
            onResend();
            setSeconds(RESEND_SECONDS);
            setDigits(Array(6).fill(""));
            inputs.current[0]?.focus();
          }}
          disabled={seconds > 0}
          className="font-semibold text-primary hover:underline disabled:cursor-not-allowed disabled:text-muted-foreground disabled:no-underline"
        >
          Gửi lại mã
        </button>
      </div>

      <button
        type="button"
        onClick={verify}
        className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-semibold text-primary-foreground shadow-soft transition hover:opacity-95"
        style={{ background: "var(--gradient-brand)" }}
      >
        Xác thực <ArrowRight className="h-4 w-4" />
      </button>
    </div>
  );
}

function ResetStep({ onDone }: { onDone: () => void }) {
  const [pw, setPw] = useState("");
  const [pw2, setPw2] = useState("");
  const [show, setShow] = useState(false);

  const checks = useMemo(
    () => [
      { label: "Ít nhất 8 ký tự", ok: pw.length >= 8 },
      { label: "Có chữ hoa và chữ thường", ok: /[a-z]/.test(pw) && /[A-Z]/.test(pw) },
      { label: "Có ít nhất 1 số", ok: /\d/.test(pw) },
    ],
    [pw],
  );
  const allOk = checks.every((c) => c.ok);

  const submit = () => {
    if (!allOk) {
      toast.error("Mật khẩu chưa đáp ứng yêu cầu");
      return;
    }
    if (pw !== pw2) {
      toast.error("Mật khẩu xác nhận không khớp");
      return;
    }
    toast.success("Đã cập nhật mật khẩu");
    onDone();
  };

  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight text-foreground">Đặt mật khẩu mới</h1>
      <p className="mt-1.5 text-sm text-muted-foreground">
        Mật khẩu mới sẽ được dùng cho các lần đăng nhập sau.
      </p>

      <div className="mt-6 space-y-4">
        <PasswordInput
          label="Mật khẩu mới"
          value={pw}
          onChange={setPw}
          show={show}
          setShow={setShow}
        />
        <PasswordInput
          label="Xác nhận mật khẩu"
          value={pw2}
          onChange={setPw2}
          show={show}
          setShow={setShow}
        />
      </div>

      <ul className="mt-4 space-y-1.5">
        {checks.map((c) => (
          <li key={c.label} className="flex items-center gap-2 text-xs">
            <CheckCircle2
              className={cn(
                "h-3.5 w-3.5",
                c.ok ? "text-emerald-600" : "text-muted-foreground/50",
              )}
            />
            <span className={cn(c.ok ? "text-foreground" : "text-muted-foreground")}>
              {c.label}
            </span>
          </li>
        ))}
      </ul>

      <button
        type="button"
        onClick={submit}
        className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-semibold text-primary-foreground shadow-soft transition hover:opacity-95"
        style={{ background: "var(--gradient-brand)" }}
      >
        Xác nhận <ArrowRight className="h-4 w-4" />
      </button>
    </div>
  );
}

function PasswordInput({
  label,
  value,
  onChange,
  show,
  setShow,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  show: boolean;
  setShow: (v: boolean) => void;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-medium text-foreground">{label}</label>
      <div className="relative">
        <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          type={show ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="••••••••"
          className="w-full rounded-xl border border-border bg-surface py-2.5 pl-10 pr-10 text-sm text-foreground placeholder:text-muted-foreground/70 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
        />
        <button
          type="button"
          onClick={() => setShow(!show)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
        >
          {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>
    </div>
  );
}

function DoneStep({ onLogin }: { onLogin: () => void }) {
  return (
    <div className="text-center">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
        <CheckCircle2 className="h-8 w-8" />
      </div>
      <h1 className="mt-5 text-2xl font-semibold tracking-tight text-foreground">
        Đặt lại mật khẩu thành công
      </h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Vui lòng đăng nhập lại bằng mật khẩu mới để tiếp tục sử dụng hệ thống.
      </p>
      <button
        type="button"
        onClick={onLogin}
        className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-semibold text-primary-foreground shadow-soft transition hover:opacity-95"
        style={{ background: "var(--gradient-brand)" }}
      >
        Đăng nhập ngay <ArrowRight className="h-4 w-4" />
      </button>
    </div>
  );
}
