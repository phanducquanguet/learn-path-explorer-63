import { useState } from "react";
import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { TopNav } from "@/components/TopNav";
import { findModule, guideModules, rolePermissions, troubleshooting } from "@/lib/guide-data";
import { guideIcon } from "@/lib/guide-icons";
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Target,
  ListChecks,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";

export const Route = createFileRoute("/teacher/guide/$moduleId")({
  loader: ({ params }) => {
    const mod = findModule(params.moduleId);
    if (!mod) throw notFound();
    return { mod };
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return {
        meta: [{ title: "Không tìm thấy hướng dẫn" }, { name: "robots", content: "noindex" }],
      };
    }
    const title = `${loaderData.mod.title} — Hướng dẫn giáo viên`;
    return {
      meta: [
        { title },
        { name: "description", content: loaderData.mod.summary },
        { property: "og:title", content: title },
        { property: "og:description", content: loaderData.mod.summary },
        { property: "og:type", content: "article" },
        { name: "twitter:card", content: "summary" },
      ],
    };
  },
  component: GuideModulePage,
  notFoundComponent: GuideNotFound,
});

function GuideNotFound() {
  return (
    <div className="min-h-screen bg-background">
      <TopNav />
      <main className="mx-auto max-w-2xl px-6 py-24 text-center">
        <h1 className="font-display text-2xl font-semibold text-foreground">
          Không tìm thấy module hướng dẫn
        </h1>
        <Link
          to="/teacher/guide"
          className="mt-5 inline-flex h-9 items-center rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground"
        >
          Về danh sách hướng dẫn
        </Link>
      </main>
    </div>
  );
}

function GuideModulePage() {
  const { mod } = Route.useLoaderData();
  const Icon = guideIcon(mod.icon);
  const [openId, setOpenId] = useState<string | null>(mod.topics[0]?.id ?? null);

  const idx = guideModules.findIndex((m) => m.id === mod.id);
  const prev = guideModules[idx - 1];
  const next = guideModules[idx + 1];

  return (
    <div className="min-h-screen bg-background">
      <TopNav />
      <main className="mx-auto max-w-7xl px-6 pb-20 pt-8 sm:px-8">
        <nav className="flex items-center gap-1.5 text-xs text-muted-foreground" aria-label="Breadcrumb">
          <Link to="/teacher/guide" className="hover:text-foreground">
            Hướng dẫn sử dụng
          </Link>
          <ChevronRight className="h-3 w-3" />
          <span className="text-foreground">{mod.title}</span>
        </nav>

        <div className="mt-4 grid gap-8 lg:grid-cols-[260px_1fr]">
          {/* Sidebar module list */}
          <aside className="hidden lg:block">
            <div className="sticky top-24 rounded-2xl border border-border bg-surface p-2">
              {guideModules.map((m) => {
                const active = m.id === mod.id;
                return (
                  <Link
                    key={m.id}
                    to="/teacher/guide/$moduleId"
                    params={{ moduleId: m.id }}
                    className={`block rounded-xl px-3 py-2 text-sm transition-colors ${
                      active
                        ? "bg-primary/10 font-semibold text-primary"
                        : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                    }`}
                  >
                    {String(m.order).padStart(2, "0")}. {m.title}
                  </Link>
                );
              })}
            </div>
          </aside>

          <div className="min-w-0">
            <div className="flex items-start gap-4">
              <span className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Icon className="h-6 w-6" />
              </span>
              <div>
                <h1 className="font-display text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
                  {mod.title}
                </h1>
                <p className="mt-1 max-w-2xl text-sm leading-relaxed text-muted-foreground">
                  {mod.summary}
                </p>
              </div>
            </div>

            <div className="mt-6 space-y-3">
              {mod.topics.map((t) => {
                const open = openId === t.id;
                return (
                  <section key={t.id} className="overflow-hidden rounded-2xl border border-border bg-surface">
                    <button
                      onClick={() => setOpenId(open ? null : t.id)}
                      aria-expanded={open}
                      className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left transition-colors hover:bg-muted/40"
                    >
                      <span className="text-sm font-semibold text-foreground sm:text-base">
                        {t.title}
                      </span>
                      <ChevronDown
                        className={`h-4 w-4 shrink-0 text-muted-foreground transition-transform ${open ? "rotate-180" : ""}`}
                      />
                    </button>

                    {open && (
                      <div className="border-t border-border px-5 py-5">
                        <div className="rounded-xl bg-muted/40 p-4">
                          <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                            <Target className="h-3.5 w-3.5" /> Mục đích
                          </div>
                          <p className="mt-1 text-sm text-foreground">{t.purpose}</p>
                        </div>

                        <div className="mt-5 grid gap-5 md:grid-cols-2">
                          <div>
                            <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                              Điều kiện
                            </div>
                            <ul className="mt-2 space-y-1.5">
                              {t.conditions.map((c) => (
                                <li key={c} className="flex gap-2 text-sm text-foreground">
                                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary/60" />
                                  <span className="leading-relaxed">{c}</span>
                                </li>
                              ))}
                            </ul>
                          </div>

                          <div>
                            <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                              <ListChecks className="h-3.5 w-3.5" /> Các bước
                            </div>
                            <ol className="mt-2 space-y-2">
                              {t.steps.map((s, i) => (
                                <li key={s} className="flex gap-2.5 text-sm text-foreground">
                                  <span className="mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-primary/10 text-[11px] font-bold text-primary">
                                    {i + 1}
                                  </span>
                                  <span className="leading-relaxed">{s}</span>
                                </li>
                              ))}
                            </ol>
                          </div>
                        </div>

                        <div className="mt-5 rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-4">
                          <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider text-emerald-700">
                            <CheckCircle2 className="h-3.5 w-3.5" /> Kết quả
                          </div>
                          <p className="mt-1 text-sm text-foreground">{t.result}</p>
                        </div>

                        <div className="mt-3 rounded-xl border border-amber-500/30 bg-amber-500/5 p-4">
                          <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider text-amber-700">
                            <AlertTriangle className="h-3.5 w-3.5" /> Nếu không thành công
                          </div>
                          <ul className="mt-2 space-y-1.5">
                            {t.fallbacks.map((f) => (
                              <li key={f} className="flex gap-2 text-sm text-foreground">
                                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-500/70" />
                                <span className="leading-relaxed">{f}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    )}
                  </section>
                );
              })}
            </div>

            {mod.id === "vai-tro" && (
              <div className="mt-6 overflow-hidden rounded-2xl border border-border bg-surface">
                <div className="border-b border-border px-5 py-3 text-sm font-semibold text-foreground">
                  Bảng phân quyền Giáo viên · Trợ giảng
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[640px] text-left">
                    <thead>
                      <tr className="border-b border-border text-xs uppercase tracking-wide text-muted-foreground">
                        <th className="px-5 py-3 font-semibold">Công việc</th>
                        <th className="px-5 py-3 font-semibold">Giáo viên</th>
                        <th className="px-5 py-3 font-semibold">Trợ giảng</th>
                      </tr>
                    </thead>
                    <tbody>
                      {rolePermissions.map((r) => (
                        <tr key={r.task} className="border-b border-border/60 text-sm hover:bg-muted/40">
                          <td className="px-5 py-3 font-medium text-foreground">{r.task}</td>
                          <td className="px-5 py-3 text-muted-foreground">{r.teacher}</td>
                          <td className="px-5 py-3 text-muted-foreground">{r.assistant}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {mod.id === "xu-ly-su-co" && (
              <div className="mt-6 overflow-hidden rounded-2xl border border-border bg-surface">
                <div className="border-b border-border px-5 py-3 text-sm font-semibold text-foreground">
                  Tra nhanh tình huống thường gặp
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[560px] text-left">
                    <thead>
                      <tr className="border-b border-border text-xs uppercase tracking-wide text-muted-foreground">
                        <th className="px-5 py-3 font-semibold">Tình huống</th>
                        <th className="px-5 py-3 font-semibold">Cách xử lý</th>
                      </tr>
                    </thead>
                    <tbody>
                      {troubleshooting.map((r) => (
                        <tr key={r.issue} className="border-b border-border/60 text-sm hover:bg-muted/40">
                          <td className="w-64 px-5 py-3 font-medium text-foreground">{r.issue}</td>
                          <td className="px-5 py-3 text-muted-foreground">{r.fix}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            <div className="mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-5">
              {prev ? (
                <Link
                  to="/teacher/guide/$moduleId"
                  params={{ moduleId: prev.id }}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-surface px-3.5 py-2 text-xs font-semibold text-foreground hover:bg-muted"
                >
                  <ChevronLeft className="h-3.5 w-3.5" /> {prev.title}
                </Link>
              ) : (
                <span />
              )}
              {next && (
                <Link
                  to="/teacher/guide/$moduleId"
                  params={{ moduleId: next.id }}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-surface px-3.5 py-2 text-xs font-semibold text-foreground hover:bg-muted"
                >
                  {next.title} <ChevronRight className="h-3.5 w-3.5" />
                </Link>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
