import type { Course } from "@/lib/lms-data";

export const CATEGORIES = [
  "Empower",
  "Speaking & Listening Lab",
  "Luyện thi KET/PET",
  "Luyện thi IELTS",
  "Luyện thi Linguaskill",
  "Luyện thi EST",
  "Học liệu bồi dưỡng",
  "Khác",
] as const;
export type Category = (typeof CATEGORIES)[number];

export function categoryOf(c: Pick<Course, "title" | "subtitle">): Category {
  const t = `${c.title} ${c.subtitle}`.toLowerCase();
  if (t.includes("ielts")) return "Luyện thi IELTS";
  if (t.includes("linguaskill")) return "Luyện thi Linguaskill";
  if (t.includes("ket") || t.includes("pet")) return "Luyện thi KET/PET";
  if (t.includes("est")) return "Luyện thi EST";
  if (t.includes("listening") || t.includes("speaking") || t.includes("lab"))
    return "Speaking & Listening Lab";
  if (t.includes("bồi dưỡng") || t.includes("học liệu")) return "Học liệu bồi dưỡng";
  if (t.includes("empower") || t.includes("foundation")) return "Empower";
  return "Khác";
}
