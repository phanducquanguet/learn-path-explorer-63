import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useState } from "react";
import {
  ArrowLeft,
  BookOpen,
  CheckCircle2,
  Circle,
  ClipboardList,
  Clock,
  FileText,
  Headphones,
  Mic,
  PenLine,
  PlayCircle,
  Trophy,
  Users,
} from "lucide-react";
import { getCourse, type Activity, type Unit } from "@/lib/lms-data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/courses/$courseId")({
  head: ({ params }) => ({
    meta: [{ title: `Khoá học ${params.courseId} — UNICOM LMS` }],
  }),
  component: CoursePage,
  notFoundComponent: () => (
    <div className="p-10 text-center text-muted-foreground">Không tìm thấy khoá học.</div>
  ),
});

const activityIcon = (t: Activity["type"]) => {
  const map = {
    video: PlayCircle,
    reading: FileText,
    quiz: ClipboardList,
    speaking: Mic,
    writing: PenLine,
  };
  const Icon = map[t] ?? Headphones;
  return <Icon className="h-4 w-4" />;
};

function CoursePage() {
  const { courseId } = Route.useParams();
  const data = getCourse(courseId);
  if (!data) throw notFound();
  const { course, level } = data;

  const [activeUnitId, setActiveUnitId] = useState(course.units[0].id);
  const [tab, setTab] = useState<"lesson" | "members">("lesson");
  const activeUnit = course.units.find((u) => u.id === activeUnitId)!;

  return (
    <div className="min-h-screen bg-background">
      {/* Top bar */}
      <div className="border-b border-border bg-surface/80 backdrop-blur sticky top-0 z-20">
        <div className="mx-auto flex max-w-[1400px] items-center justify-between gap-4 px-6 py-3 sm:px-8">
          <div className="flex items-center gap-3">
            <Link
              to="/levels/$level"
              params={{ level: level.code.toLowerCase() }}
              className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4" /> {level.code}
            </Link>
            <span className="text-muted-foreground/50">/</span>
            <div>
              <div className="text-xs text-muted-foreground">Khoá học</div>
              <div className="text-sm font-semibold text-foreground">{course.title}</div>
            </div>
          </div>
          <div className="hidden items-center gap-3 md:flex">
            <div className="text-xs text-muted-foreground">Tiến độ</div>
            <div className="h-1.5 w-40 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full"
                style={{
                  width: `${course.progress}%`,
                  background: "var(--gradient-brand)",
                }}
              />
            </div>
            <div className="text-sm font-semibold text-foreground">{course.progress}%</div>
          </div>
        </div>
      </div>

      <div className="mx-auto flex max-w-[1400px] gap-6 px-4 py-6 sm:px-6 lg:px-8">
        {/* Sidebar */}
        <aside className="hidden w-80 shrink-0 lg:block">
          <div className="sticky top-20 max-h-[calc(100vh-6rem)] overflow-y-auto rounded-3xl bg-surface p-5 ring-1 ring-border shadow-soft">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              <BookOpen className="h-3.5 w-3.5" /> Lộ trình khoá học
            </div>
            <h3 className="mt-2 text-base font-semibold text-foreground">{course.title}</h3>
            <p className="text-xs text-muted-foreground">{course.units.length} units • {course.hours}h</p>

            <div className="mt-5 space-y-2">
              {course.units.map((u) => (
                <UnitItem
                  key={u.id}
                  unit={u}
                  active={u.id === activeUnitId}
                  onClick={() => setActiveUnitId(u.id)}
                />
              ))}
            </div>
          </div>
        </aside>

        {/* Main */}
        <main className="min-w-0 flex-1">
          {/* Tabs */}
          <div className="flex items-center gap-1 rounded-2xl bg-muted/60 p-1 w-fit">
            <TabBtn active={tab === "lesson"} onClick={() => setTab("lesson")}>
              <BookOpen className="mr-1.5 h-4 w-4" /> Bài học
            </TabBtn>
            <TabBtn active={tab === "members"} onClick={() => setTab("members")}>
              <Users className="mr-1.5 h-4 w-4" /> Thành viên & Điểm
            </TabBtn>
          </div>

          {tab === "lesson" ? (
            <LessonView unit={activeUnit} hue={level.hue} />
          ) : (
            <MembersView course={course} />
          )}
        </main>
      </div>
    </div>
  );
}

function TabBtn({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "inline-flex items-center rounded-xl px-4 py-2 text-sm font-medium transition",
        active ? "bg-surface text-foreground shadow-soft" : "text-muted-foreground hover:text-foreground",
      )}
    >
      {children}
    </button>
  );
}

function UnitItem({ unit, active, onClick }: { unit: Unit; active: boolean; onClick: () => void }) {
  const done = unit.activities.filter((a) => a.done).length;
  const total = unit.activities.length;
  const pct = Math.round((done / total) * 100);
  const completed = pct === 100;
  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full rounded-2xl p-3 text-left transition ring-1",
        active ? "bg-primary/5 ring-primary/30" : "ring-transparent hover:bg-muted/60",
      )}
    >
      <div className="flex items-start gap-3">
        <div
          className={cn(
            "flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-xs font-semibold",
            completed
              ? "bg-success/20 text-success-foreground"
              : active
              ? "bg-primary text-primary-foreground"
              : "bg-muted text-muted-foreground",
          )}
        >
          {completed ? <CheckCircle2 className="h-4 w-4" /> : unit.index}
        </div>
        <div className="min-w-0 flex-1">
          <div className="truncate text-sm font-medium text-foreground">{unit.title}</div>
          <div className="mt-1 flex items-center gap-2">
            <div className="h-1 flex-1 overflow-hidden rounded-full bg-muted">
              <div className="h-full rounded-full bg-primary" style={{ width: `${pct}%` }} />
            </div>
            <span className="text-[10px] font-medium text-muted-foreground">{done}/{total}</span>
          </div>
        </div>
      </div>
    </button>
  );
}

function LessonView({ unit, hue }: { unit: Unit; hue: number }) {
  return (
    <div className="mt-5 space-y-5">
      <div
        className="relative overflow-hidden rounded-3xl p-6 ring-1 ring-border shadow-soft"
        style={{
          background: `linear-gradient(135deg, oklch(0.96 0.04 ${hue}), oklch(0.98 0.02 ${(hue + 40) % 360}))`,
        }}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Unit {unit.index}
            </div>
            <h2 className="mt-1 font-display text-2xl font-semibold tracking-tight text-foreground">
              {unit.title}
            </h2>
            <p className="mt-2 max-w-2xl text-sm text-muted-foreground">{unit.description}</p>
          </div>
          {unit.score !== undefined && (
            <div className="rounded-2xl bg-surface/80 px-4 py-3 text-center ring-1 ring-border backdrop-blur">
              <div className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">Điểm</div>
              <div className="text-2xl font-bold text-foreground">{unit.score}</div>
            </div>
          )}
        </div>

        <div className="mt-5 flex flex-wrap gap-2">
          <Pill icon={<Clock className="h-3.5 w-3.5" />}>
            {unit.activities.reduce((a, x) => a + x.duration, 0)} phút
          </Pill>
          <Pill icon={<ClipboardList className="h-3.5 w-3.5" />}>{unit.activities.length} hoạt động</Pill>
          <Pill icon={<Trophy className="h-3.5 w-3.5" />}>
            {unit.activities.filter((a) => a.done).length} đã hoàn thành
          </Pill>
        </div>
      </div>

      <div className="grid gap-3">
        {unit.activities.map((a) => (
          <div
            key={a.id}
            className="group flex items-center gap-4 rounded-2xl bg-surface p-4 ring-1 ring-border transition hover:shadow-soft"
          >
            <div
              className={cn(
                "flex h-11 w-11 items-center justify-center rounded-xl",
                a.done ? "bg-success/15 text-success-foreground" : "bg-primary/10 text-primary",
              )}
            >
              {activityIcon(a.type)}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <h4 className="truncate text-sm font-semibold text-foreground">{a.title}</h4>
                <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
                  {labelType(a.type)}
                </span>
              </div>
              <div className="mt-1 flex items-center gap-3 text-xs text-muted-foreground">
                <span className="inline-flex items-center gap-1">
                  <Clock className="h-3 w-3" /> {a.duration} phút
                </span>
                {a.done ? (
                  <span className="inline-flex items-center gap-1 text-success-foreground">
                    <CheckCircle2 className="h-3 w-3" /> Đã hoàn thành
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1">
                    <Circle className="h-3 w-3" /> Chưa học
                  </span>
                )}
              </div>
            </div>
            <button
              className={cn(
                "rounded-xl px-4 py-2 text-sm font-medium transition",
                a.done
                  ? "bg-muted text-foreground hover:bg-muted/70"
                  : "text-primary-foreground shadow-soft hover:shadow-elevated",
              )}
              style={a.done ? undefined : { background: "var(--gradient-brand)" }}
            >
              {a.done ? "Xem lại" : "Bắt đầu"}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

function labelType(t: Activity["type"]) {
  return { video: "Video", reading: "Đọc", quiz: "Quiz", speaking: "Nói", writing: "Viết" }[t];
}

function Pill({ icon, children }: { icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-surface/80 px-3 py-1 text-xs font-medium text-foreground ring-1 ring-border backdrop-blur">
      {icon}
      {children}
    </span>
  );
}

function MembersView({ course }: { course: ReturnType<typeof getCourse> extends infer T ? (T extends { course: infer C } ? C : never) : never }) {
  const unitKeys = Object.keys(course.classmates[0].scores);
  return (
    <div className="mt-5 overflow-hidden rounded-3xl bg-surface ring-1 ring-border shadow-soft">
      <div className="flex items-center justify-between border-b border-border p-5">
        <div>
          <h3 className="text-base font-semibold text-foreground">Thành viên trong lớp</h3>
          <p className="text-xs text-muted-foreground">
            {course.classmates.length} học viên • Bảng điểm theo từng unit
          </p>
        </div>
        <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
          Lớp {course.level}-01
        </span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-surface-2 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              <th className="px-5 py-3">Học viên</th>
              {unitKeys.map((k) => (
                <th key={k} className="px-3 py-3 text-center">
                  {k.toUpperCase()}
                </th>
              ))}
              <th className="px-5 py-3 text-right">TB</th>
            </tr>
          </thead>
          <tbody>
            {course.classmates.map((m, i) => {
              const scores = unitKeys.map((k) => m.scores[k]);
              const avg = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
              return (
                <tr key={i} className="border-t border-border/60 hover:bg-muted/30">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-primary/80 to-chart-5/80 text-xs font-semibold text-primary-foreground">
                        {m.name.split(" ").slice(-1)[0][0]}
                      </div>
                      <div>
                        <div className="font-medium text-foreground">{m.name}</div>
                        <div className="text-xs text-muted-foreground">Học viên</div>
                      </div>
                    </div>
                  </td>
                  {scores.map((s, j) => (
                    <td key={j} className="px-3 py-3 text-center">
                      <ScoreBadge score={s} />
                    </td>
                  ))}
                  <td className="px-5 py-3 text-right">
                    <span className="font-semibold text-foreground">{avg}</span>
                    <span className="text-xs text-muted-foreground">/100</span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ScoreBadge({ score }: { score: number }) {
  const tone =
    score >= 90
      ? "bg-success/15 text-success-foreground"
      : score >= 75
      ? "bg-info/15 text-info-foreground"
      : score >= 60
      ? "bg-warning/15 text-warning-foreground"
      : "bg-destructive/15 text-destructive";
  return (
    <span className={cn("inline-flex min-w-[2.5rem] justify-center rounded-lg px-2 py-1 text-xs font-semibold", tone)}>
      {score}
    </span>
  );
}
