// Dữ liệu demo cho vai trò "Admin đơn vị" — chỉ phạm vi 1 đơn vị.
import { classes } from "@/lib/teacher-data";
import { classOrgMap, getOrg } from "@/lib/orgs";

/** Đơn vị mà admin đơn vị đang quản lý (demo). */
export const CURRENT_ORG_ID = "org-unicom-hn";

export function currentOrg() {
  return getOrg(CURRENT_ORG_ID)!;
}

export type OrgClassRow = {
  id: string;
  code: string;
  name: string;
  level: string;
  faculty?: string;
  memberCount: number;
  courseCount: number;
  teacher: string;
  schedule: string;
};

const extra: OrgClassRow[] = [
  {
    id: "cls-seed-1",
    code: "Ươm mầm",
    name: "Lớp mầm",
    level: "A1",
    memberCount: 0,
    courseCount: 1,
    teacher: "Chưa phân công",
    schedule: "Chưa xếp lịch",
  },
];

export function orgClassRows(orgId: string = CURRENT_ORG_ID): OrgClassRow[] {
  const mapped = classes
    .filter((c) => classOrgMap[c.id] === orgId)
    .map<OrgClassRow>((c) => ({
      id: c.id,
      code: `${c.levelCode}class`,
      name: c.name,
      level: c.levelCode,
      memberCount: c.studentCount,
      courseCount: c.levelCode === "A1" ? 5 : c.levelCode === "A2" ? 4 : 3,
      teacher: c.role === "primary" ? "Cô Mai Lan" : "Thầy Quang Huy",
      schedule: c.schedule,
    }));
  return [...mapped, ...extra];
}

export type OrgUser = {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: "orgadmin" | "teacher" | "student";
  status: "active" | "invited" | "locked";
  classCount: number;
  lastActive: string;
};

export const orgUsers: OrgUser[] = [
  { id: "u-1", name: "Nguyễn Duy Hưng", email: "hung.nd@unicom.edu.vn", phone: "0901 234 567", role: "orgadmin", status: "active", classCount: 0, lastActive: "Hôm nay" },
  { id: "u-2", name: "Cô Mai Lan", email: "mailan@unicom.edu.vn", phone: "0902 111 222", role: "teacher", status: "active", classCount: 3, lastActive: "Hôm nay" },
  { id: "u-3", name: "Thầy Quang Huy", email: "quanghuy@unicom.edu.vn", phone: "0903 333 444", role: "teacher", status: "active", classCount: 2, lastActive: "Hôm qua" },
  { id: "u-4", name: "Trần Thu Hà", email: "thuha@unicom.edu.vn", phone: "0904 555 666", role: "teacher", status: "invited", classCount: 0, lastActive: "Chưa đăng nhập" },
  { id: "u-5", name: "Lương Bảo Châu", email: "baochau@student.unicom.edu.vn", phone: "0905 777 888", role: "student", status: "active", classCount: 1, lastActive: "2 giờ trước" },
  { id: "u-6", name: "Phạm Quốc Bảo", email: "quocbao@student.unicom.edu.vn", phone: "0906 999 000", role: "student", status: "locked", classCount: 1, lastActive: "12/08/2026" },
  { id: "u-7", name: "Vũ Khánh Linh", email: "khanhlinh@student.unicom.edu.vn", phone: "0907 121 314", role: "student", status: "active", classCount: 2, lastActive: "Hôm nay" },
];

export const ORG_USER_ROLE_LABEL: Record<OrgUser["role"], string> = {
  orgadmin: "Admin đơn vị",
  teacher: "Giáo viên",
  student: "Học viên",
};

export const ORG_USER_STATUS_LABEL: Record<OrgUser["status"], string> = {
  active: "Đang hoạt động",
  invited: "Chờ kích hoạt",
  locked: "Đã khóa",
};

export type OrgLog = {
  id: string;
  at: string; // dd/MM/yyyy HH:mm
  actor: string;
  action: string;
  target: string;
  level: "info" | "warning" | "danger";
};

export const orgLogs: OrgLog[] = [
  { id: "l-1", at: "27/08/2026 09:12", actor: "Cô Mai Lan", action: "Tạo đề thi", target: "Cambridge English Test — A2", level: "info" },
  { id: "l-2", at: "27/08/2026 08:40", actor: "Nguyễn Duy Hưng", action: "Duyệt đề thi", target: "CET-A2-01", level: "info" },
  { id: "l-3", at: "26/08/2026 21:05", actor: "Hệ thống", action: "Đóng đề thi tự động", target: "CET-A1-03", level: "warning" },
  { id: "l-4", at: "26/08/2026 17:30", actor: "Thầy Quang Huy", action: "Thêm học viên vào lớp", target: "A2 — Weekend Boost", level: "info" },
  { id: "l-5", at: "26/08/2026 15:18", actor: "Nguyễn Duy Hưng", action: "Khóa tài khoản", target: "quocbao@student.unicom.edu.vn", level: "danger" },
  { id: "l-6", at: "25/08/2026 11:02", actor: "Cô Mai Lan", action: "Công bố điểm", target: "A1 — Morning Stars", level: "info" },
  { id: "l-7", at: "25/08/2026 09:47", actor: "Hệ thống", action: "Nhập khẩu lớp học", target: "12 lớp từ tệp Excel", level: "info" },
  { id: "l-8", at: "24/08/2026 16:20", actor: "Nguyễn Duy Hưng", action: "Cập nhật thông tin đơn vị", target: "UNICOM Hà Nội", level: "warning" },
];
