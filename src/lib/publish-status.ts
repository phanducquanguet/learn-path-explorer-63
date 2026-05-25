import { useCallback, useEffect, useState } from "react";

export type PublishStatus = "draft" | "published";

const KEY = (scope: string) => `unicom.publish.${scope}`;

function read(scope: string): Record<string, PublishStatus> {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(window.localStorage.getItem(KEY(scope)) || "{}");
  } catch {
    return {};
  }
}

/**
 * Lưu trạng thái xuất bản theo ID trong localStorage.
 * `defaultStatus` áp dụng khi chưa có override (vd: seed data mặc định "published",
 * dữ liệu mới tạo mặc định "draft").
 */
export function usePublishStatus(scope: string, defaultStatus: PublishStatus = "published") {
  const [map, setMap] = useState<Record<string, PublishStatus>>({});

  useEffect(() => {
    setMap(read(scope));
  }, [scope]);

  const persist = useCallback(
    (next: Record<string, PublishStatus>) => {
      setMap(next);
      if (typeof window !== "undefined") {
        window.localStorage.setItem(KEY(scope), JSON.stringify(next));
      }
    },
    [scope],
  );

  const getStatus = useCallback(
    (id: string): PublishStatus => map[id] ?? defaultStatus,
    [map, defaultStatus],
  );

  const setStatus = useCallback(
    (id: string, status: PublishStatus) => {
      persist({ ...map, [id]: status });
    },
    [map, persist],
  );

  const toggle = useCallback(
    (id: string) => {
      const current = map[id] ?? defaultStatus;
      persist({ ...map, [id]: current === "published" ? "draft" : "published" });
    },
    [map, persist, defaultStatus],
  );

  return { getStatus, setStatus, toggle };
}

export const STATUS_LABEL: Record<PublishStatus, string> = {
  draft: "Bản nháp",
  published: "Đã xuất bản",
};
