import { toast } from "sonner";
import type { PublishEvent } from "./publish-status";

type Scope = "course" | "exam";

const LABEL: Record<Scope, string> = {
  course: "Khóa học",
  exam: "Bài thi",
};

/**
 * Hiển thị xác nhận (nếu cần) rồi thông báo theo sự kiện xuất bản.
 * - first-publish: toast thành công, không cần xác nhận.
 * - republish: cảnh báo có thể xóa dữ liệu học viên hiện có, cần xác nhận.
 * - unpublish: cảnh báo thu hồi khỏi học viên + có thể xóa dữ liệu, cần xác nhận.
 *
 * Trả về true nếu đã thực hiện, false nếu người dùng hủy.
 */
export function confirmPublishAction(
  scope: Scope,
  name: string,
  event: PublishEvent,
): boolean {
  const label = LABEL[scope];
  const lower = label.toLowerCase();

  if (event === "first-publish") {
    toast.success(`${label} đã được xuất bản`, {
      description: `"${name}" hiện đã hiển thị cho học viên.`,
    });
    return true;
  }

  if (event === "republish") {
    const ok =
      typeof window === "undefined"
        ? true
        : window.confirm(
            `Tái xuất bản "${name}"?\n\nDữ liệu bài làm / tiến độ hiện có của học viên trên ${lower} này có thể bị xóa hoặc làm mới. Bạn có chắc chắn?`,
          );
    if (!ok) return false;
    toast.warning(`Đã tái xuất bản ${lower}`, {
      description: `"${name}" đã cập nhật cho học viên. Dữ liệu cũ (nếu có) đã được làm mới.`,
    });
    return true;
  }

  // unpublish
  const ok =
    typeof window === "undefined"
      ? true
      : window.confirm(
          `Thu hồi xuất bản "${name}"?\n\n${label} sẽ bị ẩn khỏi học viên và dữ liệu bài làm / tiến độ liên quan có thể bị xóa. Bạn có chắc chắn?`,
        );
  if (!ok) return false;
  toast.error(`Đã thu hồi xuất bản`, {
    description: `"${name}" hiện ở trạng thái Bản nháp và không còn hiển thị cho học viên.`,
  });
  return true;
}
