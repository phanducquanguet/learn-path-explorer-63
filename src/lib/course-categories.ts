import { useEffect, useState } from "react";
import type { Course } from "@/lib/lms-data";

export type Category = string;

export const DEFAULT_CATEGORIES: Category[] = [
  "Empower",
  "Speaking & Listening Lab",
  "Luyện thi KET/PET",
  "Luyện thi IELTS",
  "Luyện thi Linguaskill",
  "Luyện thi EST",
  "Học liệu bồi dưỡng",
  "Khác",
];

const STORAGE_KEY = "unicom.course.categories";
const EVENT = "unicom:categories-changed";

function read(): Category[] {
  if (typeof window === "undefined") return DEFAULT_CATEGORIES;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_CATEGORIES;
    const arr = JSON.parse(raw);
    return Array.isArray(arr) && arr.length ? arr.map(String) : DEFAULT_CATEGORIES;
  } catch {
    return DEFAULT_CATEGORIES;
  }
}

function write(list: Category[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  window.dispatchEvent(new Event(EVENT));
}

export function getCategories(): Category[] {
  return read();
}

export function setCategories(list: Category[]) {
  write(list);
}

export function useCategories(): [Category[], (next: Category[]) => void] {
  const [list, setList] = useState<Category[]>(() => read());
  useEffect(() => {
    const sync = () => setList(read());
    window.addEventListener(EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);
  return [list, (next) => write(next)];
}

// Mặc định suy luận chương trình từ tiêu đề, ưu tiên override lưu trong localStorage
const OVERRIDE_KEY = "unicom.course.category.overrides";
function readOverrides(): Record<string, Category> {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(window.localStorage.getItem(OVERRIDE_KEY) || "{}");
  } catch {
    return {};
  }
}

export function setCourseCategory(courseId: string, category: Category) {
  if (typeof window === "undefined") return;
  const cur = readOverrides();
  cur[courseId] = category;
  window.localStorage.setItem(OVERRIDE_KEY, JSON.stringify(cur));
  window.dispatchEvent(new Event(EVENT));
}

export function categoryOf(
  c: Pick<Course, "title" | "subtitle"> & { id?: string },
): Category {
  if (c.id) {
    const ov = readOverrides()[c.id];
    if (ov) return ov;
  }
  const known = read();
  const t = `${c.title} ${c.subtitle}`.toLowerCase();
  const match = (kw: string, name: string) =>
    t.includes(kw) && known.includes(name) ? name : null;
  return (
    match("ielts", "Luyện thi IELTS") ||
    match("linguaskill", "Luyện thi Linguaskill") ||
    (t.includes("ket") || t.includes("pet") ? "Luyện thi KET/PET" : null) ||
    match("est", "Luyện thi EST") ||
    ((t.includes("listening") || t.includes("speaking") || t.includes("lab")) &&
    known.includes("Speaking & Listening Lab")
      ? "Speaking & Listening Lab"
      : null) ||
    ((t.includes("bồi dưỡng") || t.includes("học liệu")) &&
    known.includes("Học liệu bồi dưỡng")
      ? "Học liệu bồi dưỡng"
      : null) ||
    ((t.includes("empower") || t.includes("foundation")) && known.includes("Empower")
      ? "Empower"
      : null) ||
    known[known.length - 1] ||
    "Khác"
  );
}

// Backward compat export (some files import `CATEGORIES`)
export const CATEGORIES = DEFAULT_CATEGORIES;
