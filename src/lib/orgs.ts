// Đơn vị (trường / trung tâm) trong hệ thống UNICOM.
// Một bài thi chỉ thuộc 1 đơn vị, nhưng có thể gán cho nhiều lớp trong đơn vị đó.
// Có thể sao chép bài thi sang đơn vị khác.

export type Org = {
  id: string;
  name: string;
  shortName: string;
  type: "center" | "school";
  city: string;
};

export const orgs: Org[] = [
  {
    id: "org-unicom-hn",
    name: "UNICOM Hà Nội",
    shortName: "UNICOM HN",
    type: "center",
    city: "Hà Nội",
  },
  {
    id: "org-unicom-hcm",
    name: "UNICOM Hồ Chí Minh",
    shortName: "UNICOM HCM",
    type: "center",
    city: "TP. Hồ Chí Minh",
  },
  {
    id: "org-thpt-abc",
    name: "Trường THPT ABC",
    shortName: "THPT ABC",
    type: "school",
    city: "Đà Nẵng",
  },
];

// Bảng map class → org (giữ tách rời để không phải sửa shape ClassRoom hiện có).
export const classOrgMap: Record<string, string> = {
  "cls-a1-morning": "org-unicom-hn",
  "cls-a1-evening": "org-unicom-hn",
  "cls-a2-weekend": "org-unicom-hcm",
  "cls-b1-fast": "org-unicom-hcm",
  "cls-b1-evening": "org-thpt-abc",
};

export function getOrg(id?: string | null) {
  return orgs.find((o) => o.id === id);
}

export function classesOfOrg(orgId: string, allClasses: { id: string }[]) {
  return allClasses.filter((c) => classOrgMap[c.id] === orgId);
}
