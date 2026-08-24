import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export type PageHeaderStat = {
  icon?: LucideIcon;
  label: string;
  value: ReactNode;
  hint?: ReactNode;
  tone?: "primary" | "success" | "warning" | "danger" | "muted";
  onClick?: () => void;
  active?: boolean;
};

const toneClass: Record<NonNullable<PageHeaderStat["tone"]>, string> = {
  primary: "bg-primary/10 text-primary",
  success: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  warning: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  danger: "bg-destructive/10 text-destructive",
  muted: "bg-muted text-muted-foreground",
};

/**
 * Header dùng chung cho mọi màn hình menu:
 * panel bo góc, eyebrow chip, tiêu đề lớn, mô tả, hành động bên phải và dải KPI bên trong.
 */
export function PageHeader({
  eyebrow,
  eyebrowIcon: EyebrowIcon,
  title,
  description,
  actions,
  stats,
  children,
  className,
}: {
  eyebrow?: string;
  eyebrowIcon?: LucideIcon;
  title: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
  stats?: PageHeaderStat[];
  children?: ReactNode;
  className?: string;
}) {
  return (
    <section
      className={cn(
        "relative overflow-hidden rounded-2xl border border-border bg-surface p-6 shadow-soft sm:p-8",
        className,
      )}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute -right-24 -top-28 h-72 w-72 rounded-full opacity-[0.14] blur-3xl"
        style={{ background: "var(--gradient-brand)" }}
      />
      <div className="relative flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          {eyebrow && (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface-2 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              {EyebrowIcon && <EyebrowIcon className="h-3.5 w-3.5 text-primary" />}
              {eyebrow}
            </span>
          )}
          <h1 className="mt-3 font-display text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            {title}
          </h1>
          {description && (
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
              {description}
            </p>
          )}
        </div>
        {actions && <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>}
      </div>

      {stats && stats.length > 0 && (
        <div
          className={cn(
            "relative mt-6 grid gap-3",
            stats.length >= 4
              ? (stats.length >= 5 ? "sm:grid-cols-3 lg:grid-cols-5" : "sm:grid-cols-2 lg:grid-cols-4")
              : stats.length === 3
                ? "sm:grid-cols-3"
                : "sm:grid-cols-2",
          )}
        >
          {stats.map((s, i) => {
            const Icon = s.icon;
            const inner = (
              <>
                {Icon && (
                  <span
                    className={cn(
                      "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl",
                      toneClass[s.tone ?? "primary"],
                    )}
                  >
                    <Icon className="h-4 w-4" />
                  </span>
                )}
                <span className="min-w-0">
                  <span className="block font-display text-2xl font-semibold leading-tight text-foreground">
                    {s.value}
                  </span>
                  <span className="mt-0.5 block truncate text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                    {s.label}
                  </span>
                  {s.hint && (
                    <span className="mt-0.5 block truncate text-xs text-muted-foreground">
                      {s.hint}
                    </span>
                  )}
                </span>
              </>
            );
            const base =
              "flex items-center gap-3 rounded-xl border p-4 text-left transition-colors";
            return s.onClick ? (
              <button
                key={i}
                type="button"
                onClick={s.onClick}
                className={cn(
                  base,
                  s.active
                    ? "border-primary bg-primary/5"
                    : "border-border bg-surface-2 hover:bg-muted",
                )}
              >
                {inner}
              </button>
            ) : (
              <div key={i} className={cn(base, "border-border bg-surface-2")}>
                {inner}
              </div>
            );
          })}
        </div>
      )}

      {children && <div className="relative mt-6">{children}</div>}
    </section>
  );
}
