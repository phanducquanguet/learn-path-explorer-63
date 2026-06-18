import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { TopNav } from "@/components/TopNav";
import { classes, students } from "@/lib/teacher-data";
import { levels } from "@/lib/lms-data";
import {
  BarChart3,
  Sparkles,
  CheckCircle2,
  TrendingUp,
  Trophy,
  Activity,
  AlertTriangle,
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  LineChart,
  Line,
  Legend,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from "recharts";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/teacher/reports")({
  head: () => ({ meta: [{ title: "Báo cáo & Phân tích — UNICOM LMS" }] }),
  component: ReportsPage,
});

const MASTERY_BUCKETS = [
  { key: "excellent", label: "Xuất sắc (≥85)", min: 85, color: "oklch(0.7 0.16 155)" },
  { key: "good", label: "Khá (70-84)", min: 70, color: "oklch(0.7 0.15 220)" },
  { key: "average", label: "Trung bình (55-69)", min: 55, color: "oklch(0.78 0.14 75)" },
  { key: "atrisk", label: "Cần hỗ trợ (<55)", min: 0, color: "oklch(0.65 0.2 25)" },
] as const;

function studentAvg(s: { scoresByUnit: { score: number }[] }) {
  return s.scoresByUnit.reduce((a, x) => a + x.score, 0) / Math.max(1, s.scoresByUnit.length);
}

function ReportsPage() {
  const [classId, setClassId] = useState<string>("all");

  const selectedClasses = useMemo(
    () => (classId === "all" ? classes : classes.filter((c) => c.id === classId)),
    [classId],
  );

  const scoreData = selectedClasses.map((c) => ({
    name: c.name.replace(/^.*— /, ""),
    score: c.avgScore,
    progress: c.avgProgress,
    attendance: c.attendance,
  }));

  // Progress trend (mock 6-week)
  const trend = Array.from({ length: 6 }).map((_, i) => {
    const week = `T${i + 1}`;
    const obj: Record<string, number | string> = { week };
    selectedClasses.forEach((c) => {
      const base = Math.max(20, c.avgProgress - (5 - i) * 8);
      obj[c.name.replace(/^.*— /, "")] = Math.min(100, Math.round(base + ((i * 7 + c.id.length) % 5)));
    });
    return obj;
  });

  const targetIds = new Set(selectedClasses.map((c) => c.id));
  const studentsInScope = students.filter((s) => targetIds.has(s.classId));
  const avg = (k: "listening" | "reading" | "writing" | "speaking") =>
    Math.round(
      studentsInScope.reduce((a, s) => a + s.skills[k], 0) /
        Math.max(1, studentsInScope.length),
    );
  const radarData = [
    { skill: "Nghe", value: avg("listening") },
    { skill: "Đọc", value: avg("reading") },
    { skill: "Viết", value: avg("writing") },
    { skill: "Nói", value: avg("speaking") },
  ];

  // Mastery distribution per class (stacked)
  const masteryData = selectedClasses.map((c) => {
    const members = students.filter((s) => s.classId === c.id);
    const row: Record<string, number | string> = {
      name: c.name.replace(/^.*— /, ""),
    };
    for (const b of MASTERY_BUCKETS) row[b.label] = 0;
    for (const s of members) {
      const a = studentAvg(s);
      const b = MASTERY_BUCKETS.find((b) => a >= b.min)!;
      row[b.label] = (row[b.label] as number) + 1;
    }
    return row;
  });

  // Tiến độ trung bình theo khóa học (mỗi lớp có nhiều khóa, mỗi khóa có chương trình riêng)
  const courseProgress = useMemo(() => {
    const rows: { name: string; level: string; progress: number; score: number; learners: number }[] = [];
    const seen = new Set<string>();
    for (const cls of selectedClasses) {
      const lv = levels.find((l) => l.code === cls.levelCode);
      if (!lv) continue;
      const clsStudents = studentsInScope.filter((s) => s.classId === cls.id);
      for (const c of lv.courses) {
        const key = `${cls.id}::${c.id}`;
        if (seen.has(key)) continue;
        seen.add(key);
        const avgScore = clsStudents.length
          ? Math.round(clsStudents.reduce((a, s) => a + studentAvg(s), 0) / clsStudents.length)
          : 0;
        // Mỗi học viên có tiến độ khóa riêng — lệch nhẹ quanh course.progress theo điểm TB
        const progress = clsStudents.length
          ? Math.max(
              0,
              Math.min(
                100,
                Math.round(
                  clsStudents.reduce((a, s) => {
                    const bias = (studentAvg(s) - 70) * 0.4;
                    return a + Math.max(0, Math.min(100, c.progress + bias));
                  }, 0) / clsStudents.length,
                ),
              ),
            )
          : c.progress;
        const short = c.title.length > 26 ? c.title.slice(0, 24) + "…" : c.title;
        rows.push({
          name: `${cls.levelCode} · ${short}`,
          level: cls.levelCode,
          progress,
          score: avgScore,
          learners: clsStudents.length,
        });
      }
    }
    return rows.sort((a, b) => b.progress - a.progress).slice(0, 10);
  }, [selectedClasses, studentsInScope]);


  // Top học viên & học viên cần quan tâm
  const ranked = useMemo(
    () =>
      studentsInScope
        .map((s) => ({ ...s, avg: Math.round(studentAvg(s)) }))
        .sort((a, b) => b.avg - a.avg),
    [studentsInScope],
  );
  const topStudents = ranked.slice(0, 5);
  const atRiskStudents = ranked.filter((s) => s.avg < 55).slice(0, 5);

  // KPIs
  const totalUnits = studentsInScope.reduce((a, s) => a + s.scoresByUnit.length, 0);
  const passedUnits = studentsInScope.reduce(
    (a, s) => a + s.scoresByUnit.filter((u) => u.score >= 60).length,
    0,
  );
  const completionRate = totalUnits ? Math.round((passedUnits / totalUnits) * 100) : 0;
  const atRiskCount = atRiskStudents.length;
  const totalStudents = studentsInScope.length || classes.reduce((a, c) => a + c.studentCount, 0);
  const avgScore = Math.round(
    selectedClasses.reduce((a, c) => a + c.avgScore, 0) / Math.max(1, selectedClasses.length),
  );
  const avgProgress = Math.round(
    selectedClasses.reduce((a, c) => a + c.avgProgress, 0) / Math.max(1, selectedClasses.length),
  );

  return (
    <div className="min-h-screen bg-background">
      <TopNav />
      <div className="mx-auto max-w-7xl px-6 pb-20 pt-10 sm:px-8">
        <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <span className="inline-flex w-fit items-center gap-2 text-xs font-semibold uppercase tracking-wider text-primary">
              <Sparkles className="h-3.5 w-3.5" /> Phân tích dữ liệu
            </span>
            <h1 className="mt-1 font-display text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
              Báo cáo & Phân tích
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Theo dõi tiến độ học tập, mức độ thành thạo và học viên cần quan tâm trong các lớp đang quản lý.
            </p>
          </div>
          <div className="flex items-center gap-2 rounded-xl border border-border bg-surface p-2 shadow-soft">
            <span className="text-xs font-medium text-muted-foreground">Phạm vi:</span>
            <select
              value={classId}
              onChange={(e) => setClassId(e.target.value)}
              className="h-8 rounded-lg border border-border bg-background px-2 text-xs font-semibold text-foreground outline-none focus:border-primary"
            >
              <option value="all">Tất cả lớp ({classes.length})</option>
              {classes.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.role === "primary" ? "GV chính" : "Trợ giảng"})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* KPI */}
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Kpi icon={Trophy} label="Điểm TB" value={avgScore} suffix="/100" tint="from-emerald-500 to-teal-600" />
          <Kpi icon={TrendingUp} label="Tiến độ TB" value={`${avgProgress}%`} tint="from-violet-500 to-indigo-600" />
          <Kpi icon={CheckCircle2} label="Tỉ lệ hoàn thành bài" value={`${completionRate}%`} tint="from-sky-500 to-cyan-600" />
          <Kpi icon={AlertTriangle} label="HV cần hỗ trợ" value={atRiskCount} suffix={`/${totalStudents}`} tint="from-rose-500 to-orange-600" />
        </div>

        {/* Charts grid */}
        <div className="mt-8 grid gap-5 lg:grid-cols-2">
          <Card title="Điểm trung bình theo lớp" subtitle="So sánh điểm trung bình giữa các lớp">
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={scoreData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} domain={[0, 100]} />
                <Tooltip />
                <Bar dataKey="score" fill="oklch(0.55 0.18 260)" radius={[6, 6, 0, 0]} name="Điểm TB" />
              </BarChart>
            </ResponsiveContainer>
          </Card>

          <Card title="Phân bố mức độ học viên" subtitle="Số học viên theo từng nhóm năng lực trong mỗi lớp">
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={masteryData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                {MASTERY_BUCKETS.map((b) => (
                  <Bar key={b.key} dataKey={b.label} stackId="m" fill={b.color} radius={[2, 2, 0, 0]} />
                ))}
              </BarChart>
            </ResponsiveContainer>
          </Card>

          <Card title="Tiến độ học tập theo tuần" subtitle="Diễn biến % tiến độ 6 tuần gần đây">
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={trend}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="week" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} domain={[0, 100]} />
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                {selectedClasses.map((c, i) => (
                  <Line
                    key={c.id}
                    type="monotone"
                    dataKey={c.name.replace(/^.*— /, "")}
                    stroke={`oklch(0.6 0.18 ${(i * 60 + 200) % 360})`}
                    strokeWidth={2}
                    dot={{ r: 3 }}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </Card>

          <Card title="Phân bố kỹ năng" subtitle="Trung bình 4 kỹ năng của học viên trong phạm vi">
            <ResponsiveContainer width="100%" height={260}>
              <RadarChart data={radarData}>
                <PolarGrid stroke="hsl(var(--border))" />
                <PolarAngleAxis dataKey="skill" tick={{ fontSize: 12 }} />
                <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fontSize: 10 }} />
                <Radar
                  name="Điểm TB"
                  dataKey="value"
                  stroke="oklch(0.55 0.2 25)"
                  fill="oklch(0.55 0.2 25)"
                  fillOpacity={0.3}
                />
                <Tooltip />
              </RadarChart>
            </ResponsiveContainer>
          </Card>

          <Card
            title="Điểm trung bình & Tỉ lệ đạt theo Unit"
            subtitle="Theo dõi mức độ thành thạo của học viên qua từng Unit"
            wide
          >
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={unitProgress}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="unit" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} domain={[0, 100]} unit="%" />
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Bar dataKey="score" name="Điểm TB" fill="oklch(0.55 0.2 280)" radius={[6, 6, 0, 0]} />
                <Bar dataKey="passRate" name="Tỉ lệ đạt (≥60)" fill="oklch(0.7 0.15 155)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </div>

        {/* Top + At-risk students */}
        <div className="mt-8 grid gap-5 lg:grid-cols-2">
          <Card title="Top học viên" subtitle="5 học viên có điểm trung bình cao nhất trong phạm vi">
            <ul className="space-y-2">
              {topStudents.length === 0 && (
                <li className="text-center text-xs text-muted-foreground">Chưa có dữ liệu</li>
              )}
              {topStudents.map((s, i) => (
                <li key={s.id} className="flex items-center justify-between rounded-xl bg-muted/40 px-3 py-2">
                  <div className="flex items-center gap-2">
                    <div className="grid h-7 w-7 place-items-center rounded-full bg-foreground text-[11px] font-bold text-background">
                      {i + 1}
                    </div>
                    <div>
                      <div className="text-sm font-medium text-foreground">{s.name}</div>
                      <div className="text-[11px] text-muted-foreground">
                        {classes.find((c) => c.id === s.classId)?.name}
                      </div>
                    </div>
                  </div>
                  <div className="text-sm font-bold text-emerald-600">{s.avg}</div>
                </li>
              ))}
            </ul>
          </Card>

          <Card
            title="Học viên cần quan tâm"
            subtitle="Điểm TB < 55 — cần giáo viên hỗ trợ thêm"
          >
            <ul className="space-y-2">
              {atRiskStudents.length === 0 && (
                <li className="rounded-xl bg-emerald-50 px-3 py-3 text-center text-xs font-medium text-emerald-700">
                  🎉 Tất cả học viên đang theo kịp tiến độ
                </li>
              )}
              {atRiskStudents.map((s) => (
                <li key={s.id} className="flex items-center justify-between rounded-xl bg-rose-50 px-3 py-2">
                  <div className="flex items-center gap-2">
                    <div className="grid h-7 w-7 place-items-center rounded-full bg-rose-500 text-[11px] font-bold text-white">
                      <AlertTriangle className="h-3.5 w-3.5" />
                    </div>
                    <div>
                      <div className="text-sm font-medium text-foreground">{s.name}</div>
                      <div className="text-[11px] text-muted-foreground">
                        {classes.find((c) => c.id === s.classId)?.name} · {s.lastActive}
                      </div>
                    </div>
                  </div>
                  <div className="text-sm font-bold text-rose-600">{s.avg}</div>
                </li>
              ))}
            </ul>
          </Card>
        </div>

        {/* Class breakdown table */}
        <div className="mt-10 overflow-hidden rounded-2xl border border-border bg-surface shadow-soft">
          <div className="flex items-center justify-between border-b border-border p-5">
            <div>
              <h3 className="text-base font-semibold text-foreground">Chi tiết theo lớp</h3>
              <p className="text-xs text-muted-foreground">
                So sánh nhanh điểm số, tiến độ và mức độ tham gia.
              </p>
            </div>
            <BarChart3 className="h-5 w-5 text-muted-foreground" />
          </div>
          <table className="w-full text-sm">
            <thead className="bg-surface-2 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="px-5 py-3">Lớp</th>
                <th className="px-3 py-3 text-center">Cấp độ</th>
                <th className="px-3 py-3 text-center">Vai trò</th>
                <th className="px-3 py-3 text-center">Sĩ số</th>
                <th className="px-3 py-3 text-center">Điểm TB</th>
                <th className="px-3 py-3 text-center">Tiến độ</th>
                <th className="px-5 py-3 text-right">Tham gia</th>
              </tr>
            </thead>
            <tbody>
              {selectedClasses.map((c) => (
                <tr key={c.id} className="border-t border-border/60 hover:bg-muted/30">
                  <td className="px-5 py-3 font-medium text-foreground">{c.name}</td>
                  <td className="px-3 py-3 text-center">
                    <span className="rounded-md bg-primary/10 px-2 py-0.5 text-[11px] font-bold text-primary">
                      {c.levelCode}
                    </span>
                  </td>
                  <td className="px-3 py-3 text-center text-xs">
                    <span
                      className={cn(
                        "rounded-full px-2 py-0.5 font-semibold",
                        c.role === "primary"
                          ? "bg-amber-500/10 text-amber-700"
                          : "bg-sky-500/10 text-sky-700",
                      )}
                    >
                      {c.role === "primary" ? "GV chính" : "Trợ giảng"}
                    </span>
                  </td>
                  <td className="px-3 py-3 text-center text-foreground">{c.studentCount}</td>
                  <td className="px-3 py-3 text-center font-semibold text-foreground">{c.avgScore}</td>
                  <td className="px-3 py-3">
                    <div className="flex items-center justify-center gap-2">
                      <div className="h-1.5 w-20 overflow-hidden rounded-full bg-muted">
                        <div
                          className="h-full rounded-full"
                          style={{
                            width: `${c.avgProgress}%`,
                            background: "var(--gradient-brand)",
                          }}
                        />
                      </div>
                      <span className="text-xs font-semibold text-foreground">{c.avgProgress}%</span>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-right">
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600">
                      <Activity className="h-3 w-3" /> {c.attendance}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function Kpi({
  icon: Icon,
  label,
  value,
  suffix,
  tint,
}: {
  icon: typeof Trophy;
  label: string;
  value: string | number;
  suffix?: string;
  tint: string;
}) {
  return (
    <div className="rounded-2xl border border-border bg-surface p-5 shadow-soft">
      <div className={`inline-flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${tint} text-white`}>
        <Icon className="h-5 w-5" />
      </div>
      <div className="mt-4 flex items-baseline gap-1">
        <span className="text-2xl font-bold text-foreground">{value}</span>
        {suffix && <span className="text-xs text-muted-foreground">{suffix}</span>}
      </div>
      <div className="mt-0.5 text-xs text-muted-foreground">{label}</div>
    </div>
  );
}

function Card({
  title,
  subtitle,
  children,
  wide,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  wide?: boolean;
}) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-border bg-surface p-5 shadow-soft",
        wide && "lg:col-span-2",
      )}
    >
      <div className="mb-3">
        <div className="text-sm font-semibold text-foreground">{title}</div>
        {subtitle && <div className="text-xs text-muted-foreground">{subtitle}</div>}
      </div>
      {children}
    </div>
  );
}
