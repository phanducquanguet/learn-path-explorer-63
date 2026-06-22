import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { TopNav } from "@/components/TopNav";
import { EXAM_SKILLS } from "@/lib/teacher-data";
import type { CustomQuestion } from "@/lib/tests-data";
import type { QSkill } from "@/lib/question-bank";
import { SKILL_LABEL } from "@/lib/question-bank";
import { SubmissionsView } from "@/routes/admin.exams.$examId.submissions";
import { getSubmissionsByExam } from "@/lib/exam-submissions";
import {
  ArrowLeft,
  Clock,
  FileQuestion,
  BarChart3,
  HelpCircle,
  FileAudio,
  FileText as FileTextIcon,
  ClipboardCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/admin/exams/$examId")({
  head: ({ params }) => ({
    meta: [{ title: `Bài luyện thi ${params.examId} — UNICOM LMS` }],
  }),
  component: () => {
    const { examId } = Route.useParams();
    return <ExamDetail examId={examId} scope="admin" />;
  },
});


type QuestionBlock = {
  id: string;
  kind: "single" | "group";
  media: string;
  questions: CustomQuestion[];
};

type SkillGroup = {
  id: QSkill;
  blocks: QuestionBlock[];
};

type SavedExam = {
  id?: string;
  name: string;
  levelCode: string;
  duration: number;
  description?: string;
  skills: string[];
  totalQuestions?: number;
  groups?: Record<string, SkillGroup>;
  savedAt: string;
};

export function ExamDetail({
  examId,
  scope = "admin",
}: {
  examId: string;
  scope?: "admin" | "teacher";
}) {
  const [exam, setExam] = useState<SavedExam | null>(null);
  const [tab, setTab] = useState<"overview" | "questions" | "results">("overview");
  const pendingCount = useMemo(
    () => getSubmissionsByExam(examId).filter((s) => s.status === "pending").length,
    [examId],
  );

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const key = scope === "teacher" ? "unicom.teacher.exams" : "unicom.exams";
      const raw = window.localStorage.getItem(key);
      const list: SavedExam[] = raw ? JSON.parse(raw) : [];
      const found =
        list.find((e) => e.id === examId) ?? list[Number(examId)] ?? null;
      setExam(found);
    } catch {
      setExam(null);
    }
  }, [examId, scope]);


  const skillLabel = (id: string) =>
    EXAM_SKILLS.find((s) => s.id === id)?.label.replace(/\s*\(.*\)/, "") ?? id;

  const totalFromGroups = useMemo(() => {
    if (!exam?.groups) return 0;
    return Object.values(exam.groups).reduce(
      (s, g) => s + g.blocks.reduce((a, b) => a + b.questions.length, 0),
      0,
    );
  }, [exam]);

  if (!exam) {
    return (
      <div className="min-h-screen bg-background">
        <TopNav />
        <div className="mx-auto max-w-4xl px-6 pt-16 text-center">
          <Link
            to={scope === "teacher" ? "/teacher/exams" : "/admin/exams"}
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" /> Trở lại Luyện thi
          </Link>
          <div className="mt-8 rounded-3xl border border-dashed border-border bg-surface/40 p-16">
            <FileQuestion className="mx-auto h-10 w-10 text-muted-foreground" />
            <h1 className="mt-3 font-display text-xl font-semibold">
              Không tìm thấy bài luyện thi
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Bài luyện thi này có thể đã bị xóa hoặc chưa được tạo.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <TopNav />
      <div className="mx-auto max-w-6xl px-6 pb-20 pt-10 sm:px-8">
        <Link
          to={scope === "teacher" ? "/teacher/exams" : "/admin/exams"}
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" /> Trở lại Luyện thi
        </Link>

        <div className="mt-4 flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="rounded-lg bg-primary/10 px-2 py-1 text-[11px] font-bold uppercase text-primary">
                {exam.levelCode}
              </span>
              <div className="flex flex-wrap gap-1.5">
                {exam.skills.map((s) => (
                  <span
                    key={s}
                    className="rounded-md bg-muted px-2 py-0.5 text-[11px] font-medium text-foreground"
                  >
                    {skillLabel(s)}
                  </span>
                ))}
              </div>
            </div>
            <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight">
              {exam.name}
            </h1>
            {exam.description && (
              <p className="mt-1 text-sm text-muted-foreground">{exam.description}</p>
            )}
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            <Mini icon={Clock} label="Thời lượng" value={`${exam.duration}'`} />
            <Mini
              icon={FileQuestion}
              label="Số câu"
              value={String(exam.totalQuestions ?? totalFromGroups)}
            />
            <button
              onClick={() => setTab("results")}
              className={cn(
                "rounded-xl border px-3 py-2 text-left transition",
                pendingCount > 0
                  ? "border-amber-300 bg-amber-50 hover:bg-amber-100"
                  : "border-border bg-surface hover:bg-muted",
              )}
            >
              <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                <ClipboardCheck className="h-3 w-3" /> Cần chấm
              </div>
              <div
                className={cn(
                  "mt-0.5 text-sm font-semibold",
                  pendingCount > 0 ? "text-amber-700" : "text-foreground",
                )}
              >
                {pendingCount} bài
              </div>
            </button>
          </div>
        </div>

        <div className="mt-6 flex w-fit gap-1 rounded-xl bg-surface p-1 ring-1 ring-border">
          {(
            [
              { id: "overview", label: "Tổng quan", icon: BarChart3 },
              { id: "questions", label: "Câu hỏi", icon: HelpCircle },
              { id: "results", label: "Kết quả học viên", icon: ClipboardCheck },
            ] as const
          ).map((t) => {
            const I = t.icon;
            return (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium",
                  tab === t.id
                    ? "bg-foreground text-background"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                <I className="h-4 w-4" /> {t.label}
                {t.id === "results" && pendingCount > 0 && (
                  <span className="rounded-full bg-amber-500 px-1.5 text-[10px] font-bold text-white">
                    {pendingCount}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {tab === "overview" && (
          <div className="mt-6 grid gap-4 lg:grid-cols-2">
            <div className="rounded-3xl border border-border bg-surface p-6 shadow-soft">
              <h2 className="font-semibold text-foreground">Thông tin chung</h2>
              <div className="mt-3 space-y-2 text-sm">
                <Row label="Cấp độ" value={exam.levelCode} />
                <Row label="Thời lượng" value={`${exam.duration} phút`} />
                <Row
                  label="Số kỹ năng"
                  value={String(exam.skills.length)}
                />
                <Row
                  label="Tổng câu hỏi"
                  value={String(exam.totalQuestions ?? totalFromGroups)}
                />
                <Row
                  label="Tạo lúc"
                  value={new Date(exam.savedAt).toLocaleString("vi-VN")}
                />
              </div>
            </div>
            <div className="rounded-3xl border border-border bg-surface p-6 shadow-soft">
              <h2 className="font-semibold text-foreground">Cấu trúc theo kỹ năng</h2>
              <div className="mt-3 space-y-2 text-sm">
                {exam.skills.length === 0 ? (
                  <p className="text-muted-foreground">Chưa có kỹ năng nào.</p>
                ) : (
                  exam.skills.map((s) => {
                    const count =
                      exam.groups?.[s]?.blocks.reduce(
                        (a, b) => a + b.questions.length,
                        0,
                      ) ?? 0;
                    return (
                      <Row
                        key={s}
                        label={skillLabel(s)}
                        value={`${count} câu`}
                      />
                    );
                  })
                )}
              </div>
            </div>
          </div>
        )}

        {tab === "questions" && (
          <QuestionsTab
            skills={exam.skills as QSkill[]}
            groups={exam.groups}
          />
        )}

        {tab === "results" && (
          <div className="mt-6">
            <SubmissionsView examId={exam.id ?? examId} />
          </div>
        )}
      </div>
    </div>
  );
}

function QuestionsTab({
  skills,
  groups,
}: {
  skills: QSkill[];
  groups?: Record<string, SkillGroup>;
}) {
  if (!groups || Object.keys(groups).length === 0) {
    return (
      <div className="mt-6 rounded-3xl border border-dashed border-border bg-surface/40 p-16 text-center">
        <FileQuestion className="mx-auto h-10 w-10 text-muted-foreground" />
        <h3 className="mt-3 font-display text-lg font-semibold">
          Bài luyện thi này chưa có dữ liệu câu hỏi chi tiết
        </h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Mở trình tạo bài luyện thi để bổ sung câu hỏi cho từng kỹ năng.
        </p>
      </div>
    );
  }

  const skillsInOrder = skills.filter((s) => groups[s]?.blocks.length);
  const totalQuestions = Object.values(groups).reduce(
    (s, g) => s + g.blocks.reduce((a, b) => a + b.questions.length, 0),
    0,
  );
  const multiSkill = skillsInOrder.length > 1;

  return (
    <div className="mt-6 space-y-6">
      <div className="flex items-center justify-between rounded-2xl border border-border bg-surface px-4 py-3 text-sm">
        <span className="text-muted-foreground">
          Tổng <span className="font-semibold text-foreground">{totalQuestions}</span> câu hỏi
          {multiSkill && ` • Phân loại theo ${skillsInOrder.length} kỹ năng`}
        </span>
      </div>

      {skillsInOrder.map((skill) => {
        const group = groups[skill]!;
        const skillTotal = group.blocks.reduce(
          (a, b) => a + b.questions.length,
          0,
        );
        let counter = 0;
        return (
          <section
            key={skill}
            className="overflow-hidden rounded-3xl border border-border bg-surface shadow-soft"
          >
            <header className="flex items-center justify-between border-b border-border bg-muted/40 px-6 py-3">
              <div className="flex items-center gap-2">
                <span className="rounded-lg bg-primary/10 px-2 py-1 text-[11px] font-bold uppercase text-primary">
                  Kỹ năng
                </span>
                <h3 className="font-display text-base font-semibold">
                  {SKILL_LABEL[skill] ?? skill}
                </h3>
              </div>
              <span className="text-xs text-muted-foreground">{skillTotal} câu</span>
            </header>

            <div className="divide-y divide-border">
              {group.blocks.map((block) => (
                <div key={block.id} className="px-6 py-5">
                  {block.kind === "group" && block.media && (
                    <div className="mb-4 rounded-xl bg-muted/40 p-3 text-sm">
                      <div className="mb-1 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                        {skill === "listening" ? (
                          <>
                            <FileAudio className="h-3 w-3" /> Audio / Script
                          </>
                        ) : (
                          <>
                            <FileTextIcon className="h-3 w-3" /> Đoạn văn
                          </>
                        )}
                      </div>
                      <p className="whitespace-pre-wrap text-foreground">
                        {block.media}
                      </p>
                    </div>
                  )}

                  <ol className="space-y-4">
                    {block.questions.map((q) => {
                      counter += 1;
                      return (
                        <li key={q.id} className="flex items-start gap-3 text-sm">
                          <span className="mt-0.5 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-muted text-xs font-semibold text-muted-foreground">
                            {counter}
                          </span>
                          <div className="min-w-0 flex-1">
                            <p className="font-medium leading-relaxed text-foreground">
                              {q.content || (
                                <em className="text-muted-foreground">
                                  (Chưa có nội dung)
                                </em>
                              )}
                            </p>

                            {(q.type === "mcq" || q.type === "mcq-multi") &&
                              q.options && (
                                <ol className="mt-3 space-y-1.5 pl-1">
                                  {q.options.map((opt, oi) => (
                                    <li
                                      key={oi}
                                      className="flex items-start gap-2 text-sm text-foreground"
                                    >
                                      <span className="mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-border text-[11px] font-semibold text-muted-foreground">
                                        {String.fromCharCode(65 + oi)}
                                      </span>
                                      <span>{opt}</span>
                                    </li>
                                  ))}
                                </ol>
                              )}

                            {q.type === "tf" && (
                              <div className="mt-3 flex gap-3 text-sm">
                                <span className="inline-flex items-center gap-1.5">
                                  <span className="inline-block h-4 w-4 rounded-full border border-border" />
                                  True
                                </span>
                                <span className="inline-flex items-center gap-1.5">
                                  <span className="inline-block h-4 w-4 rounded-full border border-border" />
                                  False
                                </span>
                              </div>
                            )}
                          </div>
                        </li>
                      );
                    })}
                  </ol>
                </div>
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}

function Mini({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-border bg-surface px-3 py-2">
      <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
        <Icon className="h-3 w-3" /> {label}
      </div>
      <div className="mt-0.5 text-sm font-semibold text-foreground">{value}</div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between border-b border-border/60 py-2 last:border-0">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium text-foreground">{value}</span>
    </div>
  );
}
