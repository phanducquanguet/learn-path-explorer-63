import { useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { BookOpen, Mail, Lock, Eye, EyeOff, ArrowRight } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Đăng nhập — UNICOM LMS" },
      { name: "description", content: "Đăng nhập vào hệ thống học tập UNICOM LMS." },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Vui lòng nhập đầy đủ email và mật khẩu");
      return;
    }
    toast.success("Đăng nhập thành công");
    navigate({ to: "/" });
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

        <div className="rounded-3xl border border-border bg-background p-8 shadow-elevated">
          <div className="mb-6">
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">Chào mừng trở lại</h1>
            <p className="mt-1.5 text-sm text-muted-foreground">
              Đăng nhập để tiếp tục hành trình học tập của bạn.
            </p>
          </div>

          <form onSubmit={submit} className="space-y-4">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-foreground">Email</label>
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

            <div>
              <div className="mb-1.5 flex items-center justify-between">
                <label className="block text-xs font-medium text-foreground">Mật khẩu</label>
                <Link
                  to="/forgot-password"
                  className="text-xs font-medium text-primary hover:underline"
                >
                  Quên mật khẩu?
                </Link>
              </div>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  type={show ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-xl border border-border bg-surface py-2.5 pl-10 pr-10 text-sm text-foreground placeholder:text-muted-foreground/70 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
                <button
                  type="button"
                  onClick={() => setShow((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-semibold text-primary-foreground shadow-soft transition hover:opacity-95"
              style={{ background: "var(--gradient-brand)" }}
            >
              Đăng nhập <ArrowRight className="h-4 w-4" />
            </button>
          </form>

          <p className="mt-6 text-center text-xs text-muted-foreground">
            Chưa có tài khoản?{" "}
            <a href="#" className="font-medium text-primary hover:underline">
              Liên hệ quản trị viên
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
