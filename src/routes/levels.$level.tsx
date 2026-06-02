import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft, ArrowUpRight, BookOpen, CheckCircle2, Clock, Layers, Play } from "lucide-react";
import { getLevel, type Course, type Level } from "@/lib/lms-data";
import { categoryOf } from "@/lib/course-categories";

import empowerA1Asset from "@/assets/empower-a1.png.asset.json";
import levelHero from "@/assets/level-hero.jpg";

const LEVEL_COVERS: Record<string, string> = {
  A1: empowerA1Asset.url,
  A2: empowerA1Asset.url,
  B1: empowerA1Asset.url,
  B2: empowerA1Asset.url,
  C1: empowerA1Asset.url,
  C2: empowerA1Asset.url,
};

export const Route = createFileRoute("/levels/$level")({
  head: ({ params }) => ({
    meta: [
      { title: `Cấp độ ${params.level.toUpperCase()} — UNICOM LMS` },
      { name: "description", content: `Danh sách khoá học cấp độ ${params.level.toUpperCase()}.` },
    ],
  }),
  component: LevelPage,
  notFoundComponent: () => (
    <div className="p-10 text-center text-muted-foreground">Không tìm thấy cấp độ.</div>
  ),
});

function LevelPage() {
  const { level } = Route.useParams();
  const lv = getLevel(level);
  if (!lv) throw notFound();

  const totalHours = lv.courses.reduce((a, c) => a + c.hours, 0);
  const avatarBg = `linear-gradient(135deg, oklch(0.55 0.18 ${lv.hue}), oklch(0.7 0.16 ${(lv.hue + 30) % 360}))`;

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl px-6 pt-6 sm:px-8">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" /> Quay lại tổng quan
        </Link>
      </div>

      <div className="mx-auto max-w-7xl px-6 pt-5 sm:px-8">
        {/* Banner */}
        <div className="relative overflow-hidden rounded-3xl shadow-elevated ring-1 ring-border">
          <img
            src={levelHero}
            alt={`Banner cấp độ ${lv.code}`}
            width={1920}
            height={640}
            className="h-[260px] w-full object-cover sm:h-[340px] lg:h-[400px]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-transparent" />
        </div>

        {/* Overlay row: avatar + breadcrumb on left, stats on right */}
        <div className="relative z-10 -mt-14 flex flex-col gap-6 px-2 sm:px-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="flex items-end gap-5">
            <div
              className="flex h-28 w-28 shrink-0 items-center justify-center rounded-full text-3xl font-bold text-white shadow-elevated ring-4 ring-background sm:h-32 sm:w-32 sm:text-4xl"
              style={{ background: avatarBg }}
            >
              {lv.code}
            </div>
            <div className="mb-2 flex items-center gap-6 rounded-2xl bg-surface/90 px-5 py-3 shadow-soft ring-1 ring-border backdrop-blur">
              <div>
                <div className="text-sm font-semibold text-foreground">Level</div>
                <div className="text-xs text-muted-foreground">{lv.code}</div>
              </div>
              <div className="h-8 w-px bg-border" />
              <div>
                <div className="text-sm font-semibold text-foreground">{lv.code}</div>
                <div className="text-xs text-muted-foreground">{lv.name}</div>
              </div>
            </div>
          </div>

          <div className="mb-2 flex flex-wrap gap-3">
            <Stat icon={<Layers className="h-4 w-4" />} label="Khoá học" value={`${lv.courses.length}`} />
            <Stat icon={<Clock className="h-4 w-4" />} label="Tổng giờ học" value={`${totalHours}h`} />
            <Stat icon={<BookOpen className="h-4 w-4" />} label="Tiến độ" value={`${lv.progress}%`} />
          </div>
        </div>
      </div>



      <div className="mx-auto max-w-7xl px-6 py-10 sm:px-8">
        <h2 className="text-lg font-semibold tracking-tight text-foreground">Các khoá học trong cấp độ</h2>
        <p className="mt-1 text-sm text-muted-foreground">Chọn khoá phù hợp để tiếp tục lộ trình.</p>
        <div className="mt-6 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {lv.courses.map((c) => (
            <LevelCourseCard key={c.id} course={c} level={lv} />
          ))}
          {lv.courses.length === 0 && (
            <div className="col-span-full rounded-3xl border border-dashed border-border bg-surface/40 p-12 text-center text-sm text-muted-foreground">
              Chưa có khoá học nào ở cấp độ này.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function LevelCourseCard({ course, level }: { course: Course; level: Level }) {
  const cover = LEVEL_COVERS[level.code];
  const category = categoryOf(course);
  const done = course.progress >= 100;
  const started = course.progress > 0;
  return (
    <Link
      to="/courses/$courseId"
      params={{ courseId: course.id }}
      className="group relative flex flex-col overflow-hidden rounded-3xl bg-surface ring-1 ring-border shadow-soft transition hover:-translate-y-1 hover:shadow-elevated"
    >
      <div
        className="relative aspect-[16/10] w-full overflow-hidden"
        style={{
          background: `linear-gradient(135deg, oklch(0.55 0.2 ${level.hue} / 0.18), oklch(0.7 0.18 ${(level.hue + 40) % 360} / 0.18))`,
        }}
      >
        {cover ? (
          <img
            src={cover}
            alt={`Bìa khoá học ${course.title}`}
            loading="lazy"
            className="h-full w-full object-contain p-3 transition duration-500 group-hover:scale-[1.03]"
          />
        ) : null}
        <div className="absolute left-3 top-3 flex items-center gap-1.5">
          <span className="inline-flex items-center rounded-full bg-background/90 px-2 py-0.5 text-[10px] font-semibold text-foreground ring-1 ring-border backdrop-blur">
            {category}
          </span>
          <span
            className="inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white shadow-soft"
            style={{
              background: `linear-gradient(135deg, oklch(0.55 0.2 ${level.hue}), oklch(0.7 0.18 ${(level.hue + 40) % 360}))`,
            }}
          >
            {level.code}
          </span>
        </div>
        <div className="absolute right-3 top-3">
          {done ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100/95 px-2 py-1 text-[10px] font-semibold text-emerald-800 backdrop-blur">
              <CheckCircle2 className="h-3 w-3" /> Đã hoàn thành
            </span>
          ) : started ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-primary/95 px-2 py-1 text-[10px] font-semibold text-primary-foreground backdrop-blur">
              <Play className="h-3 w-3" /> Đang học
            </span>
          ) : (
            <span className="inline-flex items-center rounded-full bg-background/90 px-2 py-1 text-[10px] font-semibold text-muted-foreground ring-1 ring-border backdrop-blur">
              Chưa bắt đầu
            </span>
          )}
        </div>
      </div>

      <div className="flex flex-1 flex-col p-5">
        <h3 className="text-base font-semibold text-foreground group-hover:text-primary">
          {course.title}
        </h3>
        <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{course.subtitle}</p>

        <div className="mt-4 flex items-center gap-3 text-[11px] font-medium text-muted-foreground">
          <span className="inline-flex items-center gap-1">
            <Clock className="h-3 w-3" /> {course.hours}h
          </span>
          <span>•</span>
          <span>{course.units.length} units</span>
        </div>

        <div className="mt-4">
          <div className="flex items-center justify-between text-[11px] font-medium text-muted-foreground">
            <span>Tiến độ</span>
            <span>{course.progress}%</span>
          </div>
          <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full"
              style={{
                width: `${course.progress}%`,
                background: `linear-gradient(90deg, oklch(0.55 0.2 ${level.hue}), oklch(0.7 0.18 ${(level.hue + 40) % 360}))`,
              }}
            />
          </div>
        </div>

        <div className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-primary">
          Vào học <ArrowUpRight className="h-4 w-4 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </div>
      </div>
    </Link>
  );
}

function Stat({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-surface/80 px-4 py-3 ring-1 ring-border backdrop-blur">
      <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
        {icon} {label}
      </div>
      <div className="mt-0.5 text-base font-semibold text-foreground">{value}</div>
    </div>
  );
}

