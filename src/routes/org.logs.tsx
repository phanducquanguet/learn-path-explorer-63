import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { TopNav } from "@/components/TopNav";
import { PageHeader } from "@/components/PageHeader";
import { currentOrg, orgLogs, type OrgLog } from "@/lib/org-admin";
import { ScrollText, Search, AlertTriangle, Info, ShieldAlert, History } from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export const Route = createFileRoute("/org/logs")({
  head: () => ({
    meta: [
      { title: "Nhật ký hệ thống — Admin đơn vị — UNICOM LMS" },
      {
        name: "description",
        content: "Theo dõi toàn bộ hoạt động của người dùng và hệ thống trong phạm vi đơn vị.",
      },
      { property: "og:title", content: "Nhật ký hệ thống — Admin đơn vị" },
      {
        property: "og:description",
        content: "Theo dõi hoạt động của người dùng và hệ thống trong đơn vị.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: OrgLogsPage,
});

const levelMeta: Record<OrgLog["level"], { label: string; cls: string; icon: typeof Info }> = {
  info: { label: "Thông tin", cls: "bg-primary/10 text-primary", icon: Info },
  warning: {
    label: "Cảnh báo",
    cls: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
    icon: AlertTriangle,
  },
  danger: { label: "Nghiêm trọng", cls: "bg-destructive/10 text-destructive", icon: ShieldAlert },
};

function OrgLogsPage() {
  const org = currentOrg();
  const [q, setQ] = useState("");
  const [level, setLevel] = useState("all");

  const filtered = useMemo(
    () =>
      orgLogs.filter((l) => {
        const okQ =
          !q.trim() ||
          `${l.actor} ${l.action} ${l.target}`.toLowerCase().includes(q.trim().toLowerCase());
        return okQ && (level === "all" || l.level === level);
      }),
    [q, level],
  );

  return (
    <div className="min-h-screen bg-background">
      <TopNav />
      <main className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <PageHeader
          eyebrow="Nhật ký hệ thống"
          eyebrowIcon={ScrollText}
          title="Lịch sử hoạt động"
          description={`Các thao tác được ghi nhận trong ${org.name} theo thời gian thực.`}
          stats={[
            { icon: History, label: "Bản ghi", value: orgLogs.length, tone: "primary" },
            {
              icon: AlertTriangle,
              label: "Cảnh báo",
              value: orgLogs.filter((l) => l.level === "warning").length,
              tone: "warning",
            },
            {
              icon: ShieldAlert,
              label: "Nghiêm trọng",
              value: orgLogs.filter((l) => l.level === "danger").length,
              tone: "danger",
            },
          ]}
        />

        <section className="mt-6 overflow-hidden rounded-2xl border border-border bg-surface shadow-soft">
          <div className="flex flex-wrap items-center gap-2 border-b border-border/60 p-4">
            <div className="relative w-full sm:w-72">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Tìm theo người thực hiện, hành động…"
                className="pl-9"
              />
            </div>
            <Select value={level} onValueChange={setLevel}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Tất cả mức độ" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả mức độ</SelectItem>
                <SelectItem value="info">Thông tin</SelectItem>
                <SelectItem value="warning">Cảnh báo</SelectItem>
                <SelectItem value="danger">Nghiêm trọng</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[820px] text-sm">
              <thead>
                <tr className="border-b border-border/60 bg-surface-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  <th className="px-4 py-3 text-left">Thời gian</th>
                  <th className="px-4 py-3 text-left">Người thực hiện</th>
                  <th className="px-4 py-3 text-left">Hành động</th>
                  <th className="px-4 py-3 text-left">Đối tượng</th>
                  <th className="px-4 py-3 text-left">Mức độ</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((l) => {
                  const m = levelMeta[l.level];
                  const Icon = m.icon;
                  return (
                    <tr key={l.id} className="border-b border-border/50 hover:bg-muted/40">
                      <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{l.at}</td>
                      <td className="px-4 py-3 font-medium text-foreground">{l.actor}</td>
                      <td className="px-4 py-3 text-foreground">{l.action}</td>
                      <td className="px-4 py-3 text-muted-foreground">{l.target}</td>
                      <td className="px-4 py-3">
                        <span
                          className={cn(
                            "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold",
                            m.cls,
                          )}
                        >
                          <Icon className="h-3 w-3" /> {m.label}
                        </span>
                      </td>
                    </tr>
                  );
                })}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-4 py-12 text-center text-sm text-muted-foreground">
                      Không có bản ghi phù hợp.
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
