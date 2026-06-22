import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  ClipboardList,
  Clock,
  FileQuestion,
  GraduationCap,
  Layers,
  Play,
  Sparkles,
  Users,
} from "lucide-react";
import { TopNav } from "@/components/TopNav";
import { QuizRunner } from "@/components/QuizRunner";
import { EXAM_SKILLS, classes as teacherClasses } from "@/lib/teacher-data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/practice")({
  head: () => ({
    meta: [
      { title: "Bài tập & Luyện thi — UNICOM LMS" },
      {
        name: "description",
        content:
          "Tổng hợp bài tập do giáo viên giao và các đề luyện thi của trung tâm — làm bài trực tiếp trên hệ thống.",
      },
    ],
  }),
  component: PracticePage,
});

type Source = "admin" | "teacher";

type SavedExam = {
  id?: string;
  name: string;
  levelCode: string;
  duration: number;
  description?: string;
  thumbnail?: string;
  skills: string[];
  totalQuestions?: number;
  classIds?: string[];
  savedAt: string;
};

type Item = SavedExam & { id: string; source: Source };

const ADMIN_KEY = "unicom.exams";
const TEACHER_KEY = "unicom.teacher.exams";
const PUBLISH_KEY = (scope: string) => `unicom.publish.${scope}`;

function readJSON<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function hueFor(id: string) {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0;
  return h % 360;
}

function skillLabel(id: string) {
  return EXAM_SKILLS.find((s) => s.id === id)?.label.replace(/\s*\(.*\)/, "") ?? id;
}

const TEACHER_DEMO: SavedExam[] = [
  {
    id: "demo-teacher-1",
    name: "[Cô Mai Lan] Bài tập tuần 3 — Reading & Vocabulary",
    levelCode: "B1",
    duration: 30,
    description:
      "Bài tập tuần dành cho lớp B1 — Fastrack: 2 đoạn đọc ngắn + 15 câu từ vựng theo chủ đề Travel.",
    skills: ["reading"],
    totalQuestions: 22,
    classIds: ["cls-b1-fast"],
    savedAt: new Date(Date.now() - 2 * 86400000).toISOString(),
  },
  {
    id: "demo-teacher-2",
    name: "[Cô Mai Lan] Listening Homework — Daily Talk",
    levelCode: "A2",
    duration: 20,
    description:
      "Bài tập nghe về hội thoại đời thường. Nộp trước buổi học tiếp theo để cô chữa trên lớp.",
    skills: ["listening"],
    totalQuestions: 12,
    classIds: ["cls-a2-weekend"],
    savedAt: new Date(Date.now() - 1 * 86400000).toISOString(),
  },
  {
    id: "demo-teacher-3",
    name: "[Thầy Quang] Writing Practice — Short Email",
    levelCode: "B1",
    duration: 25,
    description:
      "Luyện viết email ngắn (~120 từ) trả lời lời mời. Có rubric chấm điểm chi tiết.",
    skills: ["writing"],
    totalQuestions: 1,
    classIds: ["cls-b1-fast"],
    savedAt: new Date(Date.now() - 5 * 3600000).toISOString(),
  },
];

function loadItems(): Item[] {
  const adminExams = readJSON<SavedExam[]>(ADMIN_KEY, []);
  let teacherExams = readJSON<SavedExam[]>(TEACHER_KEY, []);

  // Seed demo nếu chưa có bài tập nào của giáo viên trong localStorage,
  // để học viên thấy ngay sự khác biệt với bài do admin tạo.
  const hasDemo = teacherExams.some((e) => e.id?.startsWith("demo-teacher-"));
  if (!hasDemo) {
    teacherExams = [...TEACHER_DEMO, ...teacherExams];
    if (typeof window !== "undefined") {
      window.localStorage.setItem(TEACHER_KEY, JSON.stringify(teacherExams));
    }
  }

  const adminPub = readJSON<Record<string, "draft" | "published">>(
    PUBLISH_KEY("exams"),
    {},
  );
  const teacherPub = readJSON<Record<string, "draft" | "published">>(
    PUBLISH_KEY("teacher.exams"),
    {},
  );

  const adminItems: Item[] = adminExams
    .filter((e) => e.id && (adminPub[e.id] ?? "published") === "published")
    .map((e) => ({ ...e, id: e.id!, source: "admin" as const }));

  const teacherItems: Item[] = teacherExams
    .filter((e) => e.id && (teacherPub[e.id] ?? "published") === "published")
    .map((e) => ({ ...e, id: e.id!, source: "teacher" as const }));

  return [...teacherItems, ...adminItems];
}


function PracticePage() {
  const [items, setItems] = useState<Item[]>([]);
  const [active, setActive] = useState<Item | null>(null);
  const [phase, setPhase] = useState<"info" | "running">("info");
  const [tab, setTab] = useState<"all" | "teacher" | "admin">("all");

  useEffect(() => {
    setItems(loadItems());
  }, []);

  const filtered = useMemo(
    () => (tab === "all" ? items : items.filter((i) => i.source === tab)),
    [items, tab],
  );

  const counts = useMemo(
    () => ({
      all: items.length,
      teacher: items.filter((i) => i.source === "teacher").length,
      admin: items.filter((i) => i.source === "admin").length,
    }),
    [items],
  );

  if (active) {
    const hue = hueFor(active.id);
    return (
      <div className="min-h-screen bg-background">
        <TopNav />
        <div className="mx-auto max-w-6xl px-6 pb-20 pt-6 sm:px-8">
          {phase === "info" ? (
            <div className="overflow-hidden rounded-3xl bg-surface ring-1 ring-border shadow-soft">
              <div
                className="relative p-7 text-white sm:p-9"
                style={{
                  background: `linear-gradient(135deg, oklch(0.45 0.22 ${hue}), oklch(0.6 0.18 ${(hue + 40) % 360}))`,
                }}
              >
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-white/85">
                  <Sparkles className="h-3.5 w-3.5" />
                  {active.source === "teacher"
                    ? "Bài tập từ giáo viên"
                    : "Bài luyện thi của trung tâm"}
                </div>
                <h1 className="mt-3 font-display text-3xl font-semibold sm:text-4xl">
                  {active.name}
                </h1>
                {active.description && (
                  <p className="mt-2 max-w-2xl text-sm text-white/85">{active.description}</p>
                )}
                <div className="mt-5 flex flex-wrap items-center gap-2 text-xs">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 ring-1 ring-white/20">
                    Cấp độ {active.levelCode}
                  </span>
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 ring-1 ring-white/20">
                    <Clock className="h-3.5 w-3.5" /> {active.duration} phút
                  </span>
                  {active.totalQuestions != null && (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 ring-1 ring-white/20">
                      {active.totalQuestions} câu
                    </span>
                  )}
                  {active.skills.map((s) => (
                    <span
                      key={s}
                      className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 ring-1 ring-white/20"
                    >
                      {skillLabel(s)}
                    </span>
                  ))}
                </div>
              </div>

              <div className="border-t border-border p-7 sm:p-9">
                <div className="text-sm font-semibold text-foreground">Hướng dẫn làm bài</div>
                <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                  <li className="flex gap-2">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-foreground" />
                    Bài làm được chấm điểm tức thì và có giải thích chi tiết sau khi nộp.
                  </li>
                  <li className="flex gap-2">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-foreground" />
                    Không giới hạn số lần làm — bạn có thể luyện lại để cải thiện điểm số.
                  </li>
                </ul>

                <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
                  <button
                    onClick={() => {
                      setActive(null);
                      setPhase("info");
                    }}
                    className="inline-flex items-center gap-2 rounded-xl bg-surface px-4 py-2.5 text-sm font-medium text-muted-foreground ring-1 ring-border hover:bg-muted hover:text-foreground"
                  >
                    Huỷ
                  </button>
                  <button
                    onClick={() => setPhase("running")}
                    className="inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold text-white shadow-soft hover:opacity-95"
                    style={{
                      background: `linear-gradient(135deg, oklch(0.5 0.2 ${hue}), oklch(0.65 0.18 ${(hue + 30) % 360}))`,
                    }}
                  >
                    <Play className="h-4 w-4" /> Bắt đầu làm bài
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <QuizRunner
              quizId={active.id}
              title={active.name}
              hue={hue}
              onExit={() => {
                setActive(null);
                setPhase("info");
              }}
            />
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <TopNav />
      <div className="mx-auto max-w-7xl px-6 pb-20 pt-10 sm:px-8">
        <div className="flex flex-col gap-2">
          <span className="inline-flex w-fit items-center gap-2 text-xs font-semibold uppercase tracking-wider text-primary">
            <Sparkles className="h-3.5 w-3.5" /> Luyện tập trên hệ thống
          </span>
          <h1 className="font-display text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            Bài tập &amp; Luyện thi
          </h1>
          <p className="text-sm text-muted-foreground">
            Tổng hợp bài tập do giáo viên giao trong lớp của bạn và các đề luyện thi của trung
            tâm. Tất cả đều được làm và chấm điểm trực tiếp tại đây.
          </p>
        </div>

        {/* Tabs nguồn bài */}
        <div className="mt-6 inline-flex items-center gap-1 rounded-xl border border-border bg-surface p-1">
          {(
            [
              { id: "all" as const, label: `Tất cả (${counts.all})`, icon: ClipboardList },
              {
                id: "teacher" as const,
                label: `Bài tập giáo viên (${counts.teacher})`,
                icon: GraduationCap,
              },
              {
                id: "admin" as const,
                label: `Đề luyện thi (${counts.admin})`,
                icon: Layers,
              },
            ]
          ).map((t) => {
            const Icon = t.icon;
            const activeTab = tab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-semibold transition",
                  activeTab
                    ? "bg-foreground text-background"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                <Icon className="h-4 w-4" /> {t.label}
              </button>
            );
          })}
        </div>

        {filtered.length === 0 ? (
          <div className="mt-8 rounded-3xl border border-dashed border-border bg-surface/40 p-16 text-center">
            <ClipboardList className="mx-auto h-10 w-10 text-muted-foreground" />
            <div className="mt-3 font-display text-lg font-semibold text-foreground">
              Chưa có bài nào
            </div>
            <p className="mt-1 text-sm text-muted-foreground">
              Khi giáo viên giao bài tập hoặc trung tâm xuất bản đề luyện thi mới, bạn sẽ thấy ở
              đây.
            </p>
          </div>
        ) : (
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((p) => {
              const hue = hueFor(p.id);
              const isTeacher = p.source === "teacher";
              return (
                <button
                  key={p.id}
                  onClick={() => {
                    setActive(p);
                    setPhase("info");
                  }}
                  className="group relative overflow-hidden rounded-3xl bg-surface p-5 text-left ring-1 ring-border shadow-soft transition hover:-translate-y-1 hover:shadow-elevated"
                >
                  <div
                    className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full opacity-30 blur-3xl transition group-hover:opacity-60"
                    style={{ background: `oklch(0.78 0.18 ${hue})` }}
                  />
                  <div className="relative flex items-start justify-between gap-2">
                    <div
                      className="flex h-12 w-12 items-center justify-center rounded-2xl text-white"
                      style={{
                        background: `linear-gradient(135deg, oklch(0.5 0.2 ${hue}), oklch(0.65 0.18 ${(hue + 30) % 360}))`,
                      }}
                    >
                      {isTeacher ? (
                        <GraduationCap className="h-5 w-5" />
                      ) : (
                        <Layers className="h-5 w-5" />
                      )}
                    </div>
                    <span
                      className={cn(
                        "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold ring-1",
                        isTeacher
                          ? "bg-emerald-500/10 text-emerald-700 ring-emerald-500/20"
                          : "bg-primary/10 text-primary ring-primary/20",
                      )}
                    >
                      {isTeacher ? "Giáo viên" : "Trung tâm"}
                    </span>
                  </div>

                  <div className="relative mt-4">
                    <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                      Cấp độ {p.levelCode}
                    </div>
                    <h3 className="mt-1 line-clamp-1 text-lg font-semibold text-foreground">
                      {p.name}
                    </h3>
                    {p.description && (
                      <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                        {p.description}
                      </p>
                    )}
                  </div>

                  <div className="relative mt-3 flex flex-wrap gap-1.5">
                    {p.skills.slice(0, 4).map((s) => (
                      <span
                        key={s}
                        className="rounded-md bg-muted px-2 py-0.5 text-[11px] font-medium text-foreground"
                      >
                        {skillLabel(s)}
                      </span>
                    ))}
                  </div>

                  {isTeacher && (p.classIds?.length ?? 0) > 0 && (
                    <div className="relative mt-2 flex flex-wrap items-center gap-1.5">
                      <Users className="h-3 w-3 text-muted-foreground" />
                      {(p.classIds ?? []).slice(0, 3).map((cid) => {
                        const c = teacherClasses.find((x) => x.id === cid);
                        return (
                          <span
                            key={cid}
                            className="rounded-md bg-emerald-500/10 px-2 py-0.5 text-[11px] font-semibold text-emerald-700"
                          >
                            {c?.name ?? cid}
                          </span>
                        );
                      })}
                    </div>
                  )}

                  <div className="relative mt-4 flex items-center gap-4 border-t border-border pt-3 text-xs text-muted-foreground">
                    <span className="inline-flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5" /> {p.duration} phút
                    </span>
                    {p.totalQuestions != null && (
                      <>
                        <span>•</span>
                        <span className="inline-flex items-center gap-1">
                          <FileQuestion className="h-3.5 w-3.5" /> {p.totalQuestions} câu
                        </span>
                      </>
                    )}
                  </div>

                  <div className="relative mt-4 flex items-center justify-end">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-foreground px-3 py-1.5 text-xs font-semibold text-background transition group-hover:gap-2">
                      <Play className="h-3.5 w-3.5" /> Bắt đầu
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
