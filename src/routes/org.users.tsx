import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { TopNav } from "@/components/TopNav";
import { PageHeader } from "@/components/PageHeader";
import {
  currentOrg,
  orgUsers,
  ORG_USER_ROLE_LABEL,
  ORG_USER_STATUS_LABEL,
  type OrgUser,
} from "@/lib/org-admin";
import { Users, Search, UserPlus, Shield, GraduationCap, UserRound, Lock, Pencil } from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

export const Route = createFileRoute("/org/users")({
  head: () => ({
    meta: [
      { title: "Quản lý user — Admin đơn vị — UNICOM LMS" },
      {
        name: "description",
        content: "Quản lý tài khoản giáo viên và học viên thuộc đơn vị: phân quyền, kích hoạt, khóa.",
      },
      { property: "og:title", content: "Quản lý user — Admin đơn vị" },
      {
        property: "og:description",
        content: "Quản lý tài khoản giáo viên và học viên thuộc đơn vị.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: OrgUsersPage,
});

const statusTone: Record<OrgUser["status"], string> = {
  active: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  invited: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  locked: "bg-destructive/10 text-destructive",
};

export function OrgUsersPage() {
  const org = currentOrg();
  const [q, setQ] = useState("");
  const [role, setRole] = useState("all");
  const [status, setStatus] = useState("all");

  const filtered = useMemo(
    () =>
      orgUsers.filter((u) => {
        const okQ =
          !q.trim() ||
          `${u.name} ${u.email} ${u.phone}`.toLowerCase().includes(q.trim().toLowerCase());
        return okQ && (role === "all" || u.role === role) && (status === "all" || u.status === status);
      }),
    [q, role, status],
  );

  const teachers = orgUsers.filter((u) => u.role === "teacher").length;
  const students = orgUsers.filter((u) => u.role === "student").length;
  const locked = orgUsers.filter((u) => u.status !== "active").length;

  return (
    <div className="min-h-screen bg-background">
      <TopNav />
      <main className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <PageHeader
          eyebrow="Quản lý user"
          eyebrowIcon={Users}
          title="Người dùng của đơn vị"
          description={`Tài khoản thuộc ${org.name}. Bạn có thể mời, phân quyền và khóa tài khoản trong đơn vị.`}
          actions={
            <button
              onClick={() => toast.success("Mở biểu mẫu mời người dùng (demo).")}
              className="inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold text-primary-foreground shadow-soft"
              style={{ background: "var(--gradient-brand)" }}
            >
              <UserPlus className="h-4 w-4" /> Mời người dùng
            </button>
          }
          stats={[
            { icon: Users, label: "Tổng tài khoản", value: orgUsers.length, tone: "primary" },
            { icon: GraduationCap, label: "Giáo viên", value: teachers, tone: "success" },
            { icon: UserRound, label: "Học viên", value: students, tone: "warning" },
            { icon: Lock, label: "Chờ / khóa", value: locked, tone: "danger" },
          ]}
        />

        <section className="mt-6 overflow-hidden rounded-2xl border border-border bg-surface shadow-soft">
          <div className="flex flex-wrap items-center gap-2 border-b border-border/60 p-4">
            <div className="relative w-full sm:w-72">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Tìm theo tên, email, số điện thoại…"
                className="pl-9"
              />
            </div>
            <Select value={role} onValueChange={setRole}>
              <SelectTrigger className="w-[170px]">
                <SelectValue placeholder="Tất cả vai trò" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả vai trò</SelectItem>
                <SelectItem value="orgadmin">Admin đơn vị</SelectItem>
                <SelectItem value="teacher">Giáo viên</SelectItem>
                <SelectItem value="student">Học viên</SelectItem>
              </SelectContent>
            </Select>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Tất cả trạng thái" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả trạng thái</SelectItem>
                <SelectItem value="active">Đang hoạt động</SelectItem>
                <SelectItem value="invited">Chờ kích hoạt</SelectItem>
                <SelectItem value="locked">Đã khóa</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[880px] text-sm">
              <thead>
                <tr className="border-b border-border/60 bg-surface-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  <th className="px-4 py-3 text-left">Người dùng</th>
                  <th className="px-4 py-3 text-left">Số điện thoại</th>
                  <th className="px-4 py-3 text-left">Vai trò</th>
                  <th className="px-4 py-3 text-right">Số lớp</th>
                  <th className="px-4 py-3 text-left">Hoạt động gần nhất</th>
                  <th className="px-4 py-3 text-left">Trạng thái</th>
                  <th className="px-4 py-3 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((u) => (
                  <tr key={u.id} className="border-b border-border/50 hover:bg-muted/40">
                    <td className="px-4 py-3">
                      <div className="font-medium text-foreground">{u.name}</div>
                      <div className="text-xs text-muted-foreground">{u.email}</div>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{u.phone}</td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
                        {u.role === "orgadmin" && <Shield className="h-3 w-3" />}
                        {ORG_USER_ROLE_LABEL[u.role]}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right font-semibold text-foreground">
                      {u.classCount}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{u.lastActive}</td>
                    <td className="px-4 py-3">
                      <span
                        className={cn(
                          "rounded-full px-2.5 py-0.5 text-xs font-semibold",
                          statusTone[u.status],
                        )}
                      >
                        {ORG_USER_STATUS_LABEL[u.status]}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          title="Sửa thông tin"
                          aria-label="Sửa thông tin"
                          onClick={() => toast.info(`Sửa thông tin ${u.name}`)}
                          className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-primary"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          title={u.status === "locked" ? "Mở khóa" : "Khóa tài khoản"}
                          aria-label="Khóa tài khoản"
                          onClick={() =>
                            u.status === "locked"
                              ? toast.success(`Đã mở khóa ${u.name} (demo)`)
                              : toast.error(`Đã khóa ${u.name} (demo)`)
                          }
                          className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-destructive"
                        >
                          <Lock className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-4 py-12 text-center text-sm text-muted-foreground">
                      Không có người dùng phù hợp bộ lọc.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  );
}
