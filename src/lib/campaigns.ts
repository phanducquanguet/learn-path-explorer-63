export type CampaignLevel = "A1" | "A2" | "B1" | "B2" | "C1";
export type CampaignStatus = "draft" | "active" | "closed";

export type CampaignRegistrant = {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  desiredLevel: CampaignLevel;
  registeredAt: string;
  assignedClassId?: string;
  assignedClassName?: string;
};

export type Campaign = {
  id: string;
  slug: string;
  name: string;
  description: string;
  levels: CampaignLevel[];
  trialClassName: string; // pattern: e.g. "Trial · {level} · {campaign}"
  status: CampaignStatus;
  createdAt: string;
  registrants: CampaignRegistrant[];
};

const KEY = "unicom.campaigns.v1";

const seed = (): Campaign[] => [
  {
    id: "cmp-summer-2026",
    slug: "summer-test-2026",
    name: "Kỳ test miễn phí mùa hè 2026",
    description:
      "Đăng ký test trình độ tiếng Anh miễn phí, nhận lộ trình học và học bổng lên đến 30% học phí.",
    levels: ["A1", "A2", "B1", "B2"],
    trialClassName: "Trial Summer 2026",
    status: "active",
    createdAt: new Date("2026-06-01T08:00:00+07:00").toISOString(),
    registrants: [
      {
        id: "r-1",
        fullName: "Nguyễn Vãng Lai",
        email: "vanglai01@gmail.com",
        phone: "0912 345 678",
        desiredLevel: "B1",
        registeredAt: new Date("2026-06-05T10:12:00+07:00").toISOString(),
      },
      {
        id: "r-2",
        fullName: "Trần Hồng Nhung",
        email: "nhungth@gmail.com",
        phone: "0987 111 222",
        desiredLevel: "A2",
        registeredAt: new Date("2026-06-06T14:22:00+07:00").toISOString(),
        assignedClassId: "trial-a2",
        assignedClassName: "Trial Summer 2026 · A2",
      },
    ],
  },
];

const read = (): Campaign[] => {
  if (typeof window === "undefined") return seed();
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) {
      const s = seed();
      window.localStorage.setItem(KEY, JSON.stringify(s));
      return s;
    }
    return JSON.parse(raw) as Campaign[];
  } catch {
    return seed();
  }
};

const write = (list: Campaign[]) => {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(KEY, JSON.stringify(list));
  window.dispatchEvent(new CustomEvent("unicom:campaigns-updated"));
};

export const listCampaigns = () => read();
export const getCampaignById = (id: string) => read().find((c) => c.id === id);
export const getCampaignBySlug = (slug: string) => read().find((c) => c.slug === slug);

export const createCampaign = (input: Omit<Campaign, "id" | "createdAt" | "registrants">) => {
  const list = read();
  const c: Campaign = {
    ...input,
    id: `cmp-${Date.now()}`,
    createdAt: new Date().toISOString(),
    registrants: [],
  };
  write([c, ...list]);
  return c;
};

export const updateCampaign = (id: string, patch: Partial<Campaign>) => {
  const list = read().map((c) => (c.id === id ? { ...c, ...patch } : c));
  write(list);
};

export const addRegistrant = (
  slug: string,
  data: Omit<CampaignRegistrant, "id" | "registeredAt">,
) => {
  const list = read();
  const idx = list.findIndex((c) => c.slug === slug);
  if (idx < 0) throw new Error("Campaign not found");
  const reg: CampaignRegistrant = {
    ...data,
    id: `r-${Date.now()}`,
    registeredAt: new Date().toISOString(),
  };
  list[idx] = { ...list[idx], registrants: [reg, ...list[idx].registrants] };
  write(list);
  return reg;
};

export const assignRegistrantToTrial = (campaignId: string, registrantId: string) => {
  const list = read();
  const idx = list.findIndex((c) => c.id === campaignId);
  if (idx < 0) return;
  const c = list[idx];
  const registrants = c.registrants.map((r) =>
    r.id === registrantId
      ? {
          ...r,
          assignedClassId: `trial-${r.desiredLevel.toLowerCase()}`,
          assignedClassName: `${c.trialClassName} · ${r.desiredLevel}`,
        }
      : r,
  );
  list[idx] = { ...c, registrants };
  write(list);
};

export const assignAllPending = (campaignId: string) => {
  const list = read();
  const idx = list.findIndex((c) => c.id === campaignId);
  if (idx < 0) return;
  const c = list[idx];
  const registrants = c.registrants.map((r) =>
    r.assignedClassId
      ? r
      : {
          ...r,
          assignedClassId: `trial-${r.desiredLevel.toLowerCase()}`,
          assignedClassName: `${c.trialClassName} · ${r.desiredLevel}`,
        },
  );
  list[idx] = { ...c, registrants };
  write(list);
};
