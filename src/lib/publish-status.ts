import { useCallback, useEffect, useState } from "react";

export type PublishStatus = "draft" | "published";

const KEY = (scope: string) => `unicom.publish.${scope}`;
const HIST_KEY = (scope: string) => `unicom.publish.${scope}.history`;

function read<T>(key: string): T {
  if (typeof window === "undefined") return {} as T;
  try {
    return JSON.parse(window.localStorage.getItem(key) || "{}");
  } catch {
    return {} as T;
  }
}

export type PublishEvent = "first-publish" | "republish" | "unpublish";

/**
 * Quản lý trạng thái xuất bản theo ID + lịch sử để phân biệt lần đầu xuất bản
 * và tái xuất bản (có thể đã có dữ liệu học viên).
 */
export function usePublishStatus(scope: string, defaultStatus: PublishStatus = "published") {
  const [map, setMap] = useState<Record<string, PublishStatus>>({});
  const [history, setHistory] = useState<Record<string, boolean>>({});

  useEffect(() => {
    setMap(read<Record<string, PublishStatus>>(KEY(scope)));
    setHistory(read<Record<string, boolean>>(HIST_KEY(scope)));
  }, [scope]);

  const getStatus = useCallback(
    (id: string): PublishStatus => map[id] ?? defaultStatus,
    [map, defaultStatus],
  );

  /**
   * Trả về true nếu mục này đã từng được xuất bản (kể cả khi seed mặc định "published").
   */
  const wasEverPublished = useCallback(
    (id: string): boolean => history[id] === true || (map[id] ?? defaultStatus) === "published",
    [history, map, defaultStatus],
  );

  /**
   * Chuyển trạng thái và trả về loại sự kiện để UI hiển thị thông báo phù hợp.
   */
  const toggle = useCallback(
    (id: string): { next: PublishStatus; event: PublishEvent } => {
      const current = map[id] ?? defaultStatus;
      const next: PublishStatus = current === "published" ? "draft" : "published";
      const ever = history[id] === true || current === "published";

      const nextMap = { ...map, [id]: next };
      const nextHist = next === "published" ? { ...history, [id]: true } : history;

      setMap(nextMap);
      setHistory(nextHist);
      if (typeof window !== "undefined") {
        window.localStorage.setItem(KEY(scope), JSON.stringify(nextMap));
        window.localStorage.setItem(HIST_KEY(scope), JSON.stringify(nextHist));
      }

      let event: PublishEvent;
      if (next === "draft") event = "unpublish";
      else if (ever) event = "republish";
      else event = "first-publish";

      return { next, event };
    },
    [map, history, scope, defaultStatus],
  );

  return { getStatus, toggle, wasEverPublished };
}

export const STATUS_LABEL: Record<PublishStatus, string> = {
  draft: "Bản nháp",
  published: "Đã xuất bản",
};
