import { createFileRoute } from "@tanstack/react-router";
import { Fragment, useMemo, useState } from "react";
import { TopNav } from "@/components/TopNav";
import { PageHeader } from "@/components/PageHeader";
import { currentOrg, orgClassRows } from "@/lib/org-admin";
import {
  Building2,
  Search,
  Upload,
  Plus,
  ChevronDown,
  UserPlus,
  FilePlus2,
  BookOpen,
  Pencil,
  Trash2,
  Users,
  GraduationCap,
  Layers,
} from "lucide-react";
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

export const Route = createFileRoute("/org/classes")({
  head: () => ({
    meta: [
      { title: "Quản lý đơn vị — Danh sách lớp học — UNICOM LMS" },
      {
        name: "description",
        content:
          "Admin đơn vị quản lý danh sách lớp học, thành viên và khóa học trong phạm vi đơn vị của mình.",
      },
      { property: "og:title", content: "Quản lý đơn vị — Danh sách lớp học" },
      {
        property: "og:description",
        content: "Danh sách lớp học, thành viên và khóa học của đơn vị.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: OrgClassesPage,
});

function OrgClassesPage() {
  const org = currentOrg();
  const rows = useMemo(() => orgClassRows(), []);
  const [q, setQ] = useState("");
  const [level, setLevel] = useState("all");
  const [expanded, setExpanded] = useState<string | null>(null);

  const levelOptions = useMemo(
    () => Array.from(new Set(rows.map((r) => r.level))).sort(),
    [rows],
  );

  const filtered = rows.filter((r) => {
    const okQ =
      !q.trim() ||
      `${r.code} ${r.name} ${r.level} ${r.teacher}`.toLowerCase().includes(q.trim().toLowerCase());
    const okLevel = level === "all" || r.level === level;
    return okQ && okLevel;
  });

  const totalMembers = rows.reduce((s, r) => s + r.memberCount, 0);
  const totalCourses = rows.reduce((s, r) => s + r.courseCount, 0);

  return (
    <div className="min-h-screen bg-background">
      <TopNav />
      <main className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <PageHeader
          eyebrow="Quản lý đơn vị"
          eyebrowIcon={Building2}
          title="Danh sách lớp học"
          description={`Phạm vi quản lý: ${org.name} — ${org.city}. Bạn chỉ thấy dữ liệu thuộc đơn vị của mình.`}
          actions={
            <>
              <button
                onClick={() => toast.info("Chọn tệp Excel để nhập khẩu lớp học (demo).")}
                className="inline-flex items-center gap-2 rounded-xl border border-border bg-surface px-4 py-2 text-sm font-medium text-foreground hover:bg-muted"
              >
                <Upload className="h-4 w-4" /> Nhập khẩu lớp học
              </button>
              <button
                onClick={() => toast.success("Mở biểu mẫu thêm lớp học (demo).")}
                className="inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold text-primary-foreground shadow-soft"
                style={{ background: "var(--gradient-brand)" }}
              >
                <Plus className="h-4 w-4" /> Thêm lớp học
              </button>
            </>
          }
          stats={[
            { icon: Layers, label: "Lớp học", value: rows.length, tone: "primary" },
            { icon: Users, label: "Thành viên", value: totalMembers, tone: "success" },
            { icon: GraduationCap, label: "Lượt gán khóa học", value: totalCourses, tone: "warning" },
            {
              icon: Building2,
              label: "Đơn vị",
              value: org.shortName,
              tone: "muted",
            },
          ]}
        />

        <section className="mt-6 overflow-hidden rounded-2xl border border-border bg-surface shadow-soft">
          <div className="flex flex-wrap items-center justify-end gap-2 border-b border-border/60 p-4">
            <div className="relative w-full sm:w-72">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Tìm kiếm mã lớp, tên lớp, giáo viên…"
                className="pl-9"
              />
            </div>
            <Select value={level} onValueChange={setLevel}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Tất cả level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả level</SelectItem>
                {levelOptions.map((l) => (
                  <SelectItem key={l} value={l}>
                    {l}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-sm">
              <thead>
                <tr className="border-b border-border/60 bg-surface-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  <th className="w-16 px-4 py-3 text-left">Mở rộng</th>
                  <th className="px-4 py-3 text-left">Mã lớp</th>
                  <th className="px-4 py-3 text-left">Tên lớp</th>
                  <th className="px-4 py-3 text-left">Level</th>
                  <th className="px-4 py-3 text-left">Khoa</th>
                  <th className="px-4 py-3 text-right">Số thành viên</th>
                  <th className="px-4 py-3 text-right">Số khóa học</th>
                  <th className="px-4 py-3 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((r) => {
                  const open = expanded === r.id;
                  return (
                    <Fragment key={r.id}>
                      <tr className="border-b border-border/50 hover:bg-muted/40">
                        <td className="px-4 py-3">
                          <button
                            onClick={() => setExpanded(open ? null : r.id)}
                            aria-label="Mở rộng"
                            className="flex h-7 w-7 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground"
                          >
                            <ChevronDown
                              className={cn("h-4 w-4 transition-transform", open && "rotate-180")}
                            />
                          </button>
                        </td>
                        <td className="px-4 py-3 font-semibold text-primary">{r.code}</td>
                        <td className="px-4 py-3 font-medium text-foreground">{r.name}</td>
                        <td className="px-4 py-3">
                          <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary">
                            {r.level}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">{r.faculty ?? "—"}</td>
                        <td className="px-4 py-3 text-right font-semibold text-foreground">
                          {r.memberCount}
                        </td>
                        <td className="px-4 py-3 text-right font-semibold text-foreground">
                          {r.courseCount}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-end gap-1">
                            <IconAction
                              icon={UserPlus}
                              label="Thêm thành viên"
                              onClick={() => toast.success(`Thêm thành viên vào ${r.name}`)}
                            />
                            <IconAction
                              icon={FilePlus2}
                              label="Gán khóa học"
                              onClick={() => toast.success(`Gán khóa học cho ${r.name}`)}
                            />
                            <IconAction
                              icon={BookOpen}
                              label="Xem chương trình"
                              onClick={() => toast.info(`Chương trình học của ${r.name}`)}
                            />
                            <IconAction
                              icon={Pencil}
                              label="Sửa lớp"
                              onClick={() => toast.info(`Sửa thông tin ${r.name}`)}
                            />
                            <IconAction
                              icon={Trash2}
                              label="Xóa lớp"
                              danger
                              onClick={() => toast.error(`Đã yêu cầu xóa ${r.name} (demo)`)}
                            />
                          </div>
                        </td>
                      </tr>
                      {open && (
                        <tr className="border-b border-border/50 bg-surface-2/60">
                          <td colSpan={8} className="px-6 py-4">
                            <div className="grid gap-4 sm:grid-cols-3">
                              <Detail label="Giáo viên phụ trách" value={r.teacher} />
                              <Detail label="Lịch học" value={r.schedule} />
                              <Detail label="Đơn vị" value={org.name} />
                            </div>
                          </td>
                        </tr>
                      )}
                    </Fragment>
                  );
                })}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={8} className="px-4 py-12 text-center text-sm text-muted-foreground">
                      Không có lớp học phù hợp bộ lọc.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between border-t border-border/60 px-4 py-3 text-xs text-muted-foreground">
            <span>
              Hiển thị {filtered.length} / {rows.length} lớp
            </span>
            <span className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-primary text-xs font-semibold text-primary">
              1
            </span>
          </div>
        </section>
      </main>
    </div>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border bg-surface p-3">
      <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </div>
      <div className="mt-1 text-sm font-medium text-foreground">{value}</div>
    </div>
  );
}

function IconAction({
  icon: Icon,
  label,
  onClick,
  danger,
}: {
  icon: typeof Pencil;
  label: string;
  onClick: () => void;
  danger?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      title={label}
      aria-label={label}
      className={cn(
        "flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted",
        danger ? "hover:text-destructive" : "hover:text-primary",
      )}
    >
      <Icon className="h-4 w-4" />
    </button>
  );
}
