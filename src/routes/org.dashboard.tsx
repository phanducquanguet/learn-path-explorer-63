import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Legend,
} from "recharts";
import { TopNav } from "@/components/TopNav";
import { PageHeader } from "@/components/PageHeader";
import { currentOrg } from "@/lib/org-admin";
import {
  dashClasses,
  dashCourses,
  dashStudents,
  dashTeachers,
  hardestActivities,
  LEVELS,
  STATUS_COLOR,
  STATUS_LABEL,
  studentProgress,
  studentStatus,
  weeklyTrend,
  type DashStudent,
  type OrgStudentStatus,
} from "@/lib/org-dashboard";
import {
  Activity,
  AlertTriangle,
  BarChart3,
  GraduationCap,
  LayoutDashboard,
  TrendingUp,
  UserCheck,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export const Route = createFileRoute("/org/dashboard")({
  head: () => ({
    meta: [
      { title: "Tổng quan đơn vị — Admin đơn vị — UNICOM LMS" },
      {
        name: "description",
        content:
          "Dashboard tổng quan toàn đơn vị: tiến độ học tập, tỷ lệ pass lần đầu, lớp cần quan tâm và học viên cần hỗ trợ.",
      },
      { property: "og:title", content: "Tổng quan đơn vị — Admin đơn vị" },
      {
        property: "og:description",
        content: "Theo dõi sức khỏe học tập toàn đơn vị và ưu tiên các trường hợp cần xử lý.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: OrgDashboardPage,
});

const RANGE_LABEL: Record<string, string> = {
  "7": "7 ngày gần nhất",
  "30": "30 ngày gần nhất",
  "90": "90 ngày gần nhất",
  all: "Toàn thời gian",
};

function OrgDashboardPage() {
  const org = currentOrg();
  const [range, setRange] = useState("30");
  const [level, setLevel] = useState("all");
  const [classId, setClassId] = useState("all");
  const [teacher, setTeacher] = useState("all");
  const [course, setCourse] = useState("all");

  const classOptions = dashClasses.filter((c) => {
    return (level === "all" || c.level === level) && (teacher === "all" || c.teacher === teacher);
  });
  const courseOptions = dashCourses.filter((c) => level === "all" || c.level === level);

  const students = useMemo(
    () =>
      dashStudents.filter(
        (s) =>
          (level === "all" || s.level === level) &&
          (classId === "all" || s.classId === classId) &&
          (teacher === "all" || s.teacher === teacher) &&
          (course === "all" || s.course === course),
      ),
    [level, classId, teacher, course],
  );

  const kpi = useMemo(() => agg(students), [students]);
  const activeStudents = students.filter((s) => s.active).length;
  const atRisk = students.filter((s) => studentStatus(s) === "at-risk");

  const teachersInScope = new Set(students.map((s) => s.teacher)).size;

  // Tiến độ theo Level
  const levelData = LEVELS.map((l) => {
    const g = students.filter((s) => s.level === l);
    return { level: l, progress: Math.round(agg(g).progress * 100), students: g.length };
  }).filter((d) => d.students > 0);

  // Phân bổ trạng thái HV
  const statusData = (Object.keys(STATUS_LABEL) as OrgStudentStatus[]).map((k) => ({
    key: k,
    name: STATUS_LABEL[k],
    value: students.filter((s) => studentStatus(s) === k).length,
  })).filter((d) => d.value > 0);

  // Hiệu quả theo lớp
  const classRows = useMemo(() => {
    const ids = Array.from(new Set(students.map((s) => s.classId)));
    return ids
      .map((id) => {
        const g = students.filter((s) => s.classId === id);
        const a = agg(g);
        return {
          id,
          teacher: g[0]?.teacher ?? "—",
          level: g[0]?.level ?? "—",
          size: g.length,
          progress: Math.round(a.progress * 100),
          firstPass: Math.round(a.firstPass * 100),
          atRisk: g.filter((s) => studentStatus(s) === "at-risk").length,
          stuck: g.filter((s) => s.currentAttempts >= 4 && s.stuckDays >= 3).length,
        };
      })
      .sort((x, y) => x.progress - y.progress);
  }, [students]);

  const attentionClasses = [...classRows]
    .sort((a, b) => b.atRisk - a.atRisk || a.progress - b.progress)
    .slice(0, 5);

  // Theo giáo viên
  const teacherRows = useMemo(() => {
    const names = Array.from(new Set(students.map((s) => s.teacher)));
    return names
      .map((n) => {
        const g = students.filter((s) => s.teacher === n);
        const a = agg(g);
        return {
          name: n,
          classes: new Set(g.map((s) => s.classId)).size,
          students: g.length,
          progress: Math.round(a.progress * 100),
          atRisk: g.filter((s) => studentStatus(s) === "at-risk").length,
        };
      })
      .sort((x, y) => y.students - x.students);
  }, [students]);

  const attentionSignals = classRows
    .filter((c) => c.atRisk >= 3 || c.progress < 50 || c.firstPass < 60)
    .sort((a, b) => b.atRisk - a.atRisk || a.progress - b.progress)
    .slice(0, 4);

  // Học viên cần hỗ trợ (ưu tiên cao nhất)
  const priorityStudents = [...atRisk]
    .sort(
      (a, b) =>
        b.currentAttempts - a.currentAttempts ||
        b.stuckDays - a.stuckDays ||
        studentProgress(a) - studentProgress(b),
    )
    .slice(0, 6);

  // Theo khóa học
  const courseRows = useMemo(() => {
    const names = Array.from(new Set(students.map((s) => s.course)));
    return names
      .map((n) => {
        const g = students.filter((s) => s.course === n);
        const a = agg(g);
        return {
          name: n,
          level: g[0]?.level ?? "—",
          students: g.length,
          progress: Math.round(a.progress * 100),
          firstPass: Math.round(a.firstPass * 100),
        };
      })
      .sort((x, y) => x.progress - y.progress);
  }, [students]);

  const activities = hardestActivities.filter(
    (a) => (level === "all" || a.level === level) && (course === "all" || a.course === course),
  );

  const resetLevel = (v: string) => {
    setLevel(v);
    setClassId("all");
    setCourse("all");
  };

  return (
    <div className="min-h-screen bg-background">
      <TopNav />
      <main className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <PageHeader
          eyebrow="Dashboard đơn vị"
          eyebrowIcon={LayoutDashboard}
          title="Tổng quan đơn vị"
          description={`${org.name} — ${RANGE_LABEL[range]}. Theo dõi sức khỏe học tập, xác định nơi có vấn đề và ưu tiên đối tượng cần xử lý.`}
          stats={[
            { icon: Users, label: "Tổng học viên", value: students.length, hint: "Đang tham gia học tập", tone: "primary" },
            {
              icon: Activity,
              label: "Học viên hoạt động",
              value: `${activeStudents}/${students.length}`,
              hint: `${students.length ? Math.round((activeStudents / students.length) * 100) : 0}% có hoạt động trong kỳ`,
              tone: "success",
            },
            {
              icon: TrendingUp,
              label: "Tiến độ trung bình",
              value: `${Math.round(kpi.progress * 100)}%`,
              hint: "Activity đã pass / cần hoàn thành",
              tone: "primary",
            },
            {
              icon: UserCheck,
              label: "Pass lần đầu",
              value: `${Math.round(kpi.firstPass * 100)}%`,
              hint: "Activity đạt ngay lần làm đầu",
              tone: "warning",
            },
            {
              icon: AlertTriangle,
              label: "Học viên cần hỗ trợ",
              value: `${atRisk.length}/${students.length}`,
              hint: "Gặp khó khăn trong quá trình học",
              tone: "danger",
            },
            {
              icon: GraduationCap,
              label: "Giáo viên phụ trách",
              value: `${teachersInScope}/${dashTeachers.length}`,
              hint: "Đang có lớp phụ trách",
              tone: "muted",
            },
          ]}
        >
          <div className="flex flex-wrap items-center gap-2">
            <FilterBox label="Thời gian">
              <Select value={range} onValueChange={setRange}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(RANGE_LABEL).map(([k, v]) => (
                    <SelectItem key={k} value={k}>
                      {v}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FilterBox>
            <FilterBox label="Cấp độ">
              <Select value={level} onValueChange={resetLevel}>
                <SelectTrigger className="w-[130px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả</SelectItem>
                  {LEVELS.map((l) => (
                    <SelectItem key={l} value={l}>
                      {l}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FilterBox>
            <FilterBox label="Lớp">
              <Select value={classId} onValueChange={setClassId}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả</SelectItem>
                  {classOptions.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FilterBox>
            <FilterBox label="Giáo viên">
              <Select
                value={teacher}
                onValueChange={(v) => {
                  setTeacher(v);
                  setClassId("all");
                }}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả</SelectItem>
                  {dashTeachers.map((t) => (
                    <SelectItem key={t} value={t}>
                      {t}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FilterBox>
            <FilterBox label="Khóa học">
              <Select value={course} onValueChange={setCourse}>
                <SelectTrigger className="w-[190px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả</SelectItem>
                  {courseOptions.map((c) => (
                    <SelectItem key={c.name} value={c.name}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FilterBox>
          </div>
        </PageHeader>

        {/* Tầng 1 — sức khỏe toàn đơn vị */}
        <div className="mt-6 grid gap-4 lg:grid-cols-2">
          <Card title="Tiến độ học tập theo Level" hint="Bấm vào cột để lọc theo Level">
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={levelData} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                <XAxis dataKey="level" tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                <YAxis unit="%" tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                <Tooltip
                  formatter={(v: number) => [`${v}%`, "Tiến độ TB"]}
                  contentStyle={tooltipStyle}
                />
                <Bar
                  dataKey="progress"
                  radius={[8, 8, 0, 0]}
                  onClick={(d: { level?: string }) => d.level && resetLevel(d.level)}
                >
                  {levelData.map((d) => (
                    <Cell
                      key={d.level}
                      cursor="pointer"
                      fill={d.progress < 45 ? "hsl(0 72% 55%)" : d.progress < 60 ? "hsl(38 92% 50%)" : "hsl(var(--primary))"}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </Card>

          <Card title="Phân bổ trạng thái học viên" hint="Sức khỏe học tập toàn đơn vị">
            <div className="flex flex-col items-center gap-4 sm:flex-row">
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={statusData} dataKey="value" nameKey="name" innerRadius={52} outerRadius={86} paddingAngle={2}>
                    {statusData.map((d) => (
                      <Cell key={d.key} fill={STATUS_COLOR[d.key]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={tooltipStyle} formatter={(v: number, n) => [`${v} HV`, n as string]} />
                  <Legend verticalAlign="bottom" iconType="circle" wrapperStyle={{ fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>

        <div className="mt-4">
          <Card title="Xu hướng học tập theo thời gian" hint="Tiến độ trung bình & pass lần đầu theo tuần">
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={weeklyTrend} margin={{ top: 8, right: 12, left: -18, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                <XAxis dataKey="week" tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                <YAxis unit="%" tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => `${v}%`} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Line
                  type="monotone"
                  dataKey="progress"
                  name="Tiến độ TB"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2.5}
                  dot={{ r: 3 }}
                />
                <Line
                  type="monotone"
                  dataKey="firstPass"
                  name="Pass lần đầu"
                  stroke="hsl(160 70% 42%)"
                  strokeWidth={2}
                  strokeDasharray="5 4"
                  dot={{ r: 3 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </Card>
        </div>

        {/* Tầng 2 — xác định nơi có vấn đề */}
        <div className="mt-4 grid gap-4 lg:grid-cols-2">
          <Card title="Hiệu quả học tập theo lớp" hint="Tiến độ và tỷ lệ pass lần đầu">
            <ResponsiveContainer width="100%" height={Math.max(240, classRows.length * 34)}>
              <BarChart
                layout="vertical"
                data={classRows}
                margin={{ top: 4, right: 16, left: 4, bottom: 0 }}
                barGap={2}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={false} />
                <XAxis type="number" unit="%" domain={[0, 100]} tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                <YAxis type="category" dataKey="id" width={58} tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => `${v}%`} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Bar dataKey="progress" name="Tiến độ" fill="hsl(var(--primary))" radius={[0, 6, 6, 0]} />
                <Bar dataKey="firstPass" name="Pass lần đầu" fill="hsl(160 70% 42%)" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>

          <Card
            title="Lớp cần quan tâm"
            hint="Ưu tiên theo số HV cần hỗ trợ, sau đó tiến độ thấp"
            action={
              <Link to="/org/classes" className="text-xs font-semibold text-primary hover:underline">
                Xem tất cả lớp
              </Link>
            }
          >
            <Table head={["Lớp", "Giáo viên", "Tiến độ", "HV cần hỗ trợ"]} align={["l", "l", "r", "r"]}>
              {attentionClasses.map((c) => (
                <tr key={c.id} className="border-b border-border/50 last:border-0">
                  <td className="px-3 py-2.5">
                    <span className="font-semibold text-foreground">{c.id}</span>
                    <span className="ml-2 rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-semibold text-primary">
                      {c.level}
                    </span>
                  </td>
                  <td className="px-3 py-2.5 text-muted-foreground">{c.teacher}</td>
                  <td className="px-3 py-2.5 text-right">
                    <ProgressPill value={c.progress} />
                  </td>
                  <td className="px-3 py-2.5 text-right font-semibold text-destructive">{c.atRisk}</td>
                </tr>
              ))}
            </Table>
          </Card>
        </div>

        <div className="mt-4 grid gap-4 lg:grid-cols-2">
          <Card title="Tình hình lớp theo giáo viên" hint="Số lớp, học viên và tiến độ tổng thể">
            <Table head={["Giáo viên", "Số lớp", "Số HV", "Tiến độ TB", "Cần hỗ trợ"]} align={["l", "r", "r", "r", "r"]}>
              {teacherRows.map((t) => (
                <tr key={t.name} className="border-b border-border/50 last:border-0">
                  <td className="px-3 py-2.5 font-medium text-foreground">{t.name}</td>
                  <td className="px-3 py-2.5 text-right">{t.classes}</td>
                  <td className="px-3 py-2.5 text-right">{t.students}</td>
                  <td className="px-3 py-2.5 text-right">
                    <ProgressPill value={t.progress} />
                  </td>
                  <td className="px-3 py-2.5 text-right font-semibold text-foreground">{t.atRisk}</td>
                </tr>
              ))}
            </Table>
          </Card>

          <Card title="Giáo viên / lớp cần chú ý" hint="Tín hiệu cần Admin kiểm tra, không phải đánh giá năng lực">
            <div className="space-y-3">
              {attentionSignals.map((c) => (
                <Link
                  key={c.id}
                  to="/org/classes"
                  className="block rounded-xl border border-border bg-surface-2 p-3 transition-colors hover:bg-muted"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-semibold text-foreground">{c.teacher}</span>
                    <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-semibold text-primary">
                      {c.id}
                    </span>
                  </div>
                  <ul className="mt-2 space-y-1 text-xs text-muted-foreground">
                    <li>
                      {c.atRisk}/{c.size} HV cần hỗ trợ · Tiến độ {c.progress}%
                    </li>
                    <li>
                      Pass lần đầu {c.firstPass}% · {c.stuck} HV đang bị kẹt Activity
                    </li>
                  </ul>
                </Link>
              ))}
              {attentionSignals.length === 0 && (
                <p className="py-8 text-center text-sm text-muted-foreground">
                  Không có lớp nào phát tín hiệu cần chú ý trong phạm vi lọc.
                </p>
              )}
            </div>
          </Card>
        </div>

        {/* Tầng 3 — đối tượng cần xử lý */}
        <div className="mt-4 grid gap-4 lg:grid-cols-2">
          <Card title="Activity khó nhất toàn đơn vị" hint="Tỷ lệ HV cần ≥ 3 lần để pass">
            <Table head={["Activity", "Khóa học", "HV đã làm", "≥3 lần để pass"]} align={["l", "l", "r", "r"]}>
              {activities.map((a) => (
                <tr key={`${a.course}-${a.activity}`} className="border-b border-border/50 last:border-0">
                  <td className="px-3 py-2.5 font-medium text-foreground">{a.activity}</td>
                  <td className="px-3 py-2.5 text-muted-foreground">{a.course}</td>
                  <td className="px-3 py-2.5 text-right">{a.learners}</td>
                  <td className="px-3 py-2.5 text-right font-semibold text-amber-600 dark:text-amber-400">
                    {a.hardRate}%
                  </td>
                </tr>
              ))}
              {activities.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-3 py-8 text-center text-sm text-muted-foreground">
                    Không có dữ liệu Activity trong phạm vi lọc.
                  </td>
                </tr>
              )}
            </Table>
          </Card>

          <Card
            title="Học viên cần hỗ trợ"
            hint="Ưu tiên theo số lần làm và thời gian bị kẹt"
            action={
              <Link to="/org/users" className="text-xs font-semibold text-primary hover:underline">
                Xem tất cả học viên
              </Link>
            }
          >
            <Table head={["Học viên", "Lớp", "Activity hiện tại", "Số lần", "Kẹt"]} align={["l", "l", "l", "r", "r"]}>
              {priorityStudents.map((s) => (
                <tr key={s.id} className="border-b border-border/50 last:border-0">
                  <td className="px-3 py-2.5 font-medium text-foreground">{s.name}</td>
                  <td className="px-3 py-2.5 text-muted-foreground">{s.classId}</td>
                  <td className="px-3 py-2.5 text-muted-foreground">{s.currentActivity}</td>
                  <td className="px-3 py-2.5 text-right font-semibold text-foreground">{s.currentAttempts}</td>
                  <td className="px-3 py-2.5 text-right text-destructive">{s.stuckDays} ngày</td>
                </tr>
              ))}
              {priorityStudents.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-3 py-8 text-center text-sm text-muted-foreground">
                    Không có học viên cần hỗ trợ trong phạm vi lọc.
                  </td>
                </tr>
              )}
            </Table>
          </Card>
        </div>

        <div className="mt-4">
          <Card title="Tiến độ & pass lần đầu theo khóa học" hint="Phát hiện khóa học có kết quả thấp bất thường trong cùng Level">
            <Table head={["Khóa học", "Level", "Số HV", "Tiến độ TB", "Pass lần đầu"]} align={["l", "l", "r", "r", "r"]}>
              {courseRows.map((c) => (
                <tr key={c.name} className="border-b border-border/50 last:border-0">
                  <td className="px-3 py-2.5 font-medium text-foreground">{c.name}</td>
                  <td className="px-3 py-2.5">
                    <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-semibold text-primary">
                      {c.level}
                    </span>
                  </td>
                  <td className="px-3 py-2.5 text-right">{c.students}</td>
                  <td className="px-3 py-2.5 text-right">
                    <ProgressPill value={c.progress} />
                  </td>
                  <td className="px-3 py-2.5 text-right font-semibold text-foreground">{c.firstPass}%</td>
                </tr>
              ))}
            </Table>
          </Card>
        </div>

        <p className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
          <BarChart3 className="h-3.5 w-3.5" /> Chỉ số ưu tiên tiến độ, tỷ lệ pass lần đầu và tình
          trạng kẹt Activity — không dùng điểm cuối làm chỉ số duy nhất.
        </p>
      </main>
    </div>
  );
}

function agg(list: DashStudent[]) {
  const total = list.reduce((s, x) => s + x.activitiesTotal, 0);
  const passed = list.reduce((s, x) => s + x.activitiesPassed, 0);
  const attempts = list.reduce((s, x) => s + x.attemptsTotal, 0);
  const firstPass = list.reduce((s, x) => s + x.firstPassCount, 0);
  return {
    progress: total ? passed / total : 0,
    firstPass: attempts ? firstPass / attempts : 0,
  };
}

const tooltipStyle = {
  borderRadius: 12,
  border: "1px solid hsl(var(--border))",
  background: "hsl(var(--popover))",
  color: "hsl(var(--popover-foreground))",
  fontSize: 12,
};

function FilterBox({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </span>
      {children}
    </div>
  );
}

function Card({
  title,
  hint,
  action,
  children,
}: {
  title: string;
  hint?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-border bg-surface p-5 shadow-soft">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="font-display text-base font-semibold text-foreground">{title}</h2>
          {hint && <p className="mt-0.5 text-xs text-muted-foreground">{hint}</p>}
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}

function Table({
  head,
  align,
  children,
}: {
  head: string[];
  align: ("l" | "r")[];
  children: React.ReactNode;
}) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[460px] text-sm">
        <thead>
          <tr className="border-b border-border/60 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            {head.map((h, i) => (
              <th key={h} className={cn("px-3 py-2", align[i] === "r" ? "text-right" : "text-left")}>
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>{children}</tbody>
      </table>
    </div>
  );
}

function ProgressPill({ value }: { value: number }) {
  return (
    <span
      className={cn(
        "inline-flex rounded-full px-2 py-0.5 text-xs font-semibold",
        value < 45
          ? "bg-destructive/10 text-destructive"
          : value < 60
            ? "bg-amber-500/10 text-amber-600 dark:text-amber-400"
            : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
      )}
    >
      {value}%
    </span>
  );
}
