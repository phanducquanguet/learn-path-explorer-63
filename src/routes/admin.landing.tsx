import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  Building2,
  ChevronDown,
  Eye,
  Globe,
  Images,
  Info,
  LayoutTemplate,
  Monitor,
  Plus,
  RotateCcw,
  Save,
  Smartphone,
  Sparkles,
  Trash2,
  GraduationCap,
  Phone,
  ListChecks,
  Pencil,
} from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/PageHeader";
import { TopNav } from "@/components/TopNav";
import { LandingPreview, type LandingSectionId } from "@/components/LandingPreview";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { orgs } from "@/lib/orgs";
import {
  allCourses,
  defaultConfig,
  loadConfigs,
  newSlide,
  newSocial,
  newQuickLink,
  removeConfig,
  saveConfig,
  type LandingConfig,
} from "@/lib/landing-config";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/admin/landing")({
  head: () => ({
    meta: [
      { title: "Thiết lập Landing page đơn vị — UNICOM" },
      {
        name: "description",
        content:
          "Admin platform thiết lập landing page riêng cho từng đơn vị: nhận diện thương hiệu, banner, giới thiệu, Linguaskill, khóa học, liên hệ — kèm preview trực tiếp.",
      },
      { property: "og:title", content: "Thiết lập Landing page đơn vị — UNICOM" },
      {
        property: "og:description",
        content: "Cấu hình và xem trước landing page của từng đơn vị ngay khi chỉnh sửa.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: LandingBuilderPage,
});

const SECTION_META: { id: LandingSectionId; label: string; icon: typeof Info }[] = [
  { id: "brand", label: "1. Nhận diện thương hiệu", icon: Sparkles },
  { id: "banner", label: "2. Banner & hình ảnh động", icon: Images },
  { id: "about", label: "3. Giới thiệu nhà trường", icon: Info },
  { id: "courses", label: "4. Giới thiệu khóa học", icon: GraduationCap },
  { id: "contact", label: "5. Footer", icon: Phone },
];

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs font-semibold text-muted-foreground">{label}</Label>
      {children}
    </div>
  );
}

function SectionToggle({
  enabled,
  onChange,
}: {
  enabled: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between rounded-lg border border-border bg-surface-2 px-3 py-2">
      <span className="text-xs font-medium text-muted-foreground">Hiển thị mục này trên landing</span>
      <Switch checked={enabled} onCheckedChange={onChange} />
    </div>
  );
}

function LandingBuilderPage() {
  const [orgId, setOrgId] = useState(orgs[0].id);
  const [cfg, setCfg] = useState<LandingConfig>(() => defaultConfig(orgs[0].id));
  const [focus, setFocus] = useState<LandingSectionId | null>("brand");
  const [device, setDevice] = useState<"desktop" | "mobile">("desktop");
  const [dirty, setDirty] = useState(false);
  const [configs, setConfigs] = useState<Record<string, LandingConfig>>({});
  const [activeTab, setActiveTab] = useState("organizations");
  const [orgListOpen, setOrgListOpen] = useState(true);

  // Nạp cấu hình đã lưu (localStorage) sau khi hydrate.
  useEffect(() => {
    const all = loadConfigs();
    setConfigs(all);
    setCfg(all[orgId] ?? defaultConfig(orgId));
    setDirty(false);
  }, [orgId]);

  const update = (fn: (draft: LandingConfig) => void) => {
    setCfg((prev) => {
      const next: LandingConfig = JSON.parse(JSON.stringify(prev));
      fn(next);
      return next;
    });
    setDirty(true);
  };

  const enabledCount = useMemo(
    () =>
      [cfg.banner, cfg.about, cfg.courses, cfg.contact].filter((s) => s.enabled).length + 1,
    [cfg],
  );

  const customCount = useMemo(
    () => orgs.filter((o) => configs[o.id]).length,
    [configs],
  );

  const persist = (next: LandingConfig) => {
    saveConfig(next);
    setConfigs((prev) => ({ ...prev, [next.orgId]: next }));
  };

  const onSave = () => {
    persist(cfg);
    setDirty(false);
    toast.success("Đã lưu thiết lập landing page", { description: cfg.brand.orgName });
  };

  const onPublish = () => {
    const next = { ...cfg, published: true };
    setCfg(next);
    persist(next);
    setDirty(false);
    toast.success("Đã xuất bản landing page", { description: cfg.brand.orgName });
  };

  const onReset = () => {
    setCfg(defaultConfig(orgId));
    setDirty(true);
    toast.info("Đã đưa về mẫu mặc định (chưa lưu)");
  };

  /** Lưu cấu hình của 1 đơn vị ngay trên danh sách. */
  const onSaveOrg = (id: string) => {
    const next = id === orgId ? cfg : (configs[id] ?? defaultConfig(id));
    persist(next);
    if (id === orgId) setDirty(false);
    toast.success("Đã lưu landing page", { description: next.brand.orgName });
  };

  const onPublishOrg = (id: string) => {
    const base = id === orgId ? cfg : (configs[id] ?? defaultConfig(id));
    const next = { ...base, published: true };
    persist(next);
    if (id === orgId) {
      setCfg(next);
      setDirty(false);
    }
    toast.success("Đã xuất bản landing page", { description: next.brand.orgName });
  };

  /** Đưa đơn vị về dùng landing mặc định (xóa thiết lập riêng). */
  const onUseDefault = (id: string) => {
    removeConfig(id);
    setConfigs((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
    if (id === orgId) {
      setCfg(defaultConfig(id));
      setDirty(false);
    }
    toast.info("Đơn vị đang dùng landing page mặc định");
  };



  return (
    <div className="min-h-screen bg-background">
      <TopNav />
      <div className="mx-auto max-w-[1600px] space-y-6 px-4 py-6 sm:px-6">
      <PageHeader
        eyebrow="Admin platform"
        eyebrowIcon={LayoutTemplate}
        title="Thiết lập Landing page đơn vị"
        description="Chọn đơn vị, cấu hình từng khối nội dung và xem trước ngay bên phải. Khi chỉnh sửa mục nào, preview sẽ tự cuộn và làm nổi bật đúng mục đó."
      />

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="h-11 w-full justify-start rounded-xl border border-border bg-surface p-1">
          <TabsTrigger value="organizations" className="h-9 gap-2 px-5">
            <Building2 className="h-4 w-4" /> Đơn vị
          </TabsTrigger>
          <TabsTrigger value="landing" className="h-9 gap-2 px-5">
            <LayoutTemplate className="h-4 w-4" /> Landing page
          </TabsTrigger>
        </TabsList>

        <TabsContent value="organizations" className="mt-0">
          <Collapsible open={orgListOpen} onOpenChange={setOrgListOpen} className="overflow-hidden rounded-2xl border border-border bg-surface shadow-soft">
            <div className="flex flex-wrap items-center gap-2 border-b border-border bg-surface-2 px-4 py-3">
              <Building2 className="h-4 w-4 text-primary" />
              <span className="text-sm font-semibold">Danh sách đơn vị</span>
              <Badge variant="secondary">{customCount} thiết lập riêng</Badge>
              <Badge variant="outline">{orgs.length - customCount} dùng mặc định</Badge>
              <CollapsibleTrigger asChild>
                <Button size="icon" variant="ghost" className="ml-auto" aria-label={orgListOpen ? "Thu gọn danh sách" : "Mở rộng danh sách"}>
                  <ChevronDown className={cn("h-4 w-4 transition-transform", orgListOpen && "rotate-180")} />
                </Button>
              </CollapsibleTrigger>
            </div>
            <CollapsibleContent className="divide-y divide-border">
          {orgs.map((o) => {
            const saved = configs[o.id];
            const isEditing = o.id === orgId;
            const status = !saved
              ? { label: "Dùng landing mặc định", variant: "outline" as const }
              : saved.published
                ? { label: "Đã xuất bản", variant: "default" as const }
                : { label: "Bản nháp", variant: "secondary" as const };
            return (
              <div key={o.id} className="flex flex-wrap items-center gap-3 px-4 py-3">
                <div className="min-w-[220px] flex-1">
                  <div className="flex items-center gap-2 text-sm font-semibold">
                    {o.name}
                    {isEditing && <Badge variant="secondary">Đang chỉnh</Badge>}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {o.city} · /{o.shortName.toLowerCase().replace(/\s+/g, "-")}
                  </p>
                </div>
                <Badge variant={status.variant}>{status.label}</Badge>
                <div className="flex flex-wrap items-center gap-2">
                  <Button size="sm" variant={isEditing ? "default" : "outline"} onClick={() => { setOrgId(o.id); setActiveTab("landing"); }}>
                    <Pencil className="mr-2 h-4 w-4" /> Sửa
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => onSaveOrg(o.id)}>
                    <Save className="mr-2 h-4 w-4" /> Lưu
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => onPublishOrg(o.id)}>
                    <Globe className="mr-2 h-4 w-4" /> Xuất bản
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => onUseDefault(o.id)}>
                    <RotateCcw className="mr-2 h-4 w-4" /> Landing mặc định
                  </Button>
                </div>
              </div>
            );
          })}
            </CollapsibleContent>
          </Collapsible>
        </TabsContent>

        <TabsContent value="landing" className="mt-0 space-y-6">

      {/* Thanh chức năng của đơn vị đang chỉnh */}
      <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-border bg-surface p-3 shadow-soft">
        <Select value={orgId} onValueChange={setOrgId}>
          <SelectTrigger className="w-[220px]">
            <Building2 className="mr-2 h-4 w-4 text-muted-foreground" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {orgs.map((o) => (
              <SelectItem key={o.id} value={o.id}>
                {o.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Badge variant="outline" className="gap-1">
          <ListChecks className="h-3.5 w-3.5" /> {enabledCount}/5 khối đang bật
        </Badge>
        <Badge variant={dirty ? "secondary" : "outline"}>
          {dirty ? "Có thay đổi chưa lưu" : "Đã đồng bộ"}
        </Badge>
        <div className="ml-auto flex flex-wrap items-center gap-2">
          <Button variant="outline" onClick={onReset}>
            <RotateCcw className="mr-2 h-4 w-4" /> Mẫu mặc định
          </Button>
          <Button variant="outline" onClick={onSave}>
            <Save className="mr-2 h-4 w-4" /> Lưu nháp
          </Button>
          <Button onClick={onPublish}>
            <Globe className="mr-2 h-4 w-4" /> Xuất bản
          </Button>
        </div>
      </div>


      <div className="grid gap-6 xl:grid-cols-[minmax(0,440px)_minmax(0,1fr)]">
        {/* Bảng thiết lập */}
        <div className="space-y-3">
          <Accordion
            type="single"
            collapsible
            value={focus ?? undefined}
            onValueChange={(v) => setFocus((v || null) as LandingSectionId | null)}
            className="space-y-3"
          >
            {SECTION_META.map(({ id, label, icon: Icon }) => (
              <AccordionItem
                key={id}
                value={id}
                className={cn(
                  "overflow-hidden rounded-xl border bg-surface px-4 shadow-soft",
                  focus === id ? "border-primary" : "border-border",
                )}
              >
                <AccordionTrigger className="text-sm font-semibold hover:no-underline">
                  <span className="flex items-center gap-2">
                    <Icon className="h-4 w-4 text-primary" />
                    {label}
                  </span>
                </AccordionTrigger>
                <AccordionContent className="space-y-3 pb-4">
                  {id === "brand" && (
                    <>
                      <Field label="Tên trường / tổ chức">
                        <Input
                          value={cfg.brand.orgName}
                          onChange={(e) => update((d) => void (d.brand.orgName = e.target.value))}
                        />
                      </Field>
                      <Field label="Tên viết tắt">
                        <Input
                          value={cfg.brand.shortName}
                          onChange={(e) => update((d) => void (d.brand.shortName = e.target.value))}
                        />
                      </Field>
                      <Field label="Màu thương hiệu">
                        <div className="flex items-center gap-2">
                          <input
                            type="color"
                            aria-label="Chọn màu thương hiệu"
                            value={cfg.accent}
                            onChange={(e) => update((d) => void (d.accent = e.target.value))}
                            className="h-9 w-12 cursor-pointer rounded-lg border border-border bg-surface-2"
                          />
                          <Input
                            value={cfg.accent}
                            onChange={(e) => update((d) => void (d.accent = e.target.value))}
                          />
                        </div>
                      </Field>
                    </>
                  )}

                  {id === "banner" && (
                    <>
                      <SectionToggle
                        enabled={cfg.banner.enabled}
                        onChange={(v) => update((d) => void (d.banner.enabled = v))}
                      />
                      {cfg.banner.slides.map((s, i) => (
                        <div key={s.id} className="space-y-2 rounded-lg border border-border p-3">
                          <div className="flex items-center justify-between">
                            <Badge variant="secondary">Slide {i + 1}</Badge>
                            <Button
                              size="icon"
                              variant="ghost"
                              aria-label="Xóa slide"
                              onClick={() =>
                                update((d) => {
                                  d.banner.slides = d.banner.slides.filter((x) => x.id !== s.id);
                                })
                              }
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                          {s.imageUrl ? (
                            <div className="relative overflow-hidden rounded-lg">
                              <img
                                src={s.imageUrl}
                                alt={`Slide ${i + 1}`}
                                className="h-24 w-full rounded-lg object-cover"
                              />
                              <label className="absolute inset-0 grid cursor-pointer place-items-center bg-black/40 text-xs font-medium text-white opacity-0 transition-opacity hover:opacity-100">
                                Đổi ảnh
                                <input
                                  type="file"
                                  accept="image/*"
                                  className="hidden"
                                  onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (!file) return;
                                    const reader = new FileReader();
                                    reader.onload = () =>
                                      update(
                                        (d) =>
                                          void (d.banner.slides[i].imageUrl = String(
                                            reader.result,
                                          )),
                                      );
                                    reader.readAsDataURL(file);
                                  }}
                                />
                              </label>
                            </div>
                          ) : (
                            <label className="flex h-24 w-full cursor-pointer flex-col items-center justify-center gap-1 rounded-lg border border-dashed border-border text-xs text-muted-foreground transition-colors hover:border-primary/50 hover:text-foreground">
                              <Plus className="h-4 w-4" />
                              Upload ảnh slide
                              <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (!file) return;
                                  const reader = new FileReader();
                                  reader.onload = () =>
                                    update(
                                      (d) =>
                                        void (d.banner.slides[i].imageUrl = String(reader.result)),
                                    );
                                  reader.readAsDataURL(file);
                                }}
                              />
                            </label>
                          )}
                        </div>
                      ))}
                      <Button
                        variant="outline"
                        className="w-full"
                        onClick={() => update((d) => void d.banner.slides.push(newSlide()))}
                      >
                        <Plus className="mr-2 h-4 w-4" /> Thêm slide
                      </Button>
                      <p className="text-xs text-muted-foreground">
                        Mỗi slide chỉ cần upload 1 ảnh banner (khuyến nghị tỷ lệ ngang, vd
                        1200×400).
                      </p>
                    </>
                  )}

                  {id === "about" && (
                    <>
                      <SectionToggle
                        enabled={cfg.about.enabled}
                        onChange={(v) => update((d) => void (d.about.enabled = v))}
                      />
                      <Field label="Dòng dẫn (eyebrow)">
                        <Input
                          value={cfg.about.eyebrow}
                          onChange={(e) => update((d) => void (d.about.eyebrow = e.target.value))}
                        />
                      </Field>
                      <Field label="Tiêu đề">
                        <Input
                          value={cfg.about.title}
                          onChange={(e) => update((d) => void (d.about.title = e.target.value))}
                        />
                      </Field>
                      <Field label="Nội dung giới thiệu">
                        <Textarea
                          rows={5}
                          value={cfg.about.body}
                          onChange={(e) => update((d) => void (d.about.body = e.target.value))}
                        />
                      </Field>
                      <Field label="Hình ảnh minh họa">
                        {cfg.about.imageUrl ? (
                          <div className="relative overflow-hidden rounded-lg">
                            <img
                              src={cfg.about.imageUrl}
                              alt="Ảnh giới thiệu"
                              className="h-32 w-full rounded-lg object-cover"
                            />
                            <label className="absolute inset-0 grid cursor-pointer place-items-center bg-black/40 text-xs font-medium text-white opacity-0 transition-opacity hover:opacity-100">
                              Đổi ảnh
                              <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (!file) return;
                                  const reader = new FileReader();
                                  reader.onload = () =>
                                    update((d) => void (d.about.imageUrl = String(reader.result)));
                                  reader.readAsDataURL(file);
                                }}
                              />
                            </label>
                          </div>
                        ) : (
                          <label className="flex h-32 w-full cursor-pointer flex-col items-center justify-center gap-1 rounded-lg border border-dashed border-border text-xs text-muted-foreground transition-colors hover:border-primary/50 hover:text-foreground">
                            <Plus className="h-4 w-4" />
                            Upload ảnh minh họa
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (!file) return;
                                const reader = new FileReader();
                                reader.onload = () =>
                                  update((d) => void (d.about.imageUrl = String(reader.result)));
                                reader.readAsDataURL(file);
                              }}
                            />
                          </label>
                        )}
                      </Field>
                    </>
                  )}

                  {id === "courses" && (
                    <>
                      <SectionToggle
                        enabled={cfg.courses.enabled}
                        onChange={(v) => update((d) => void (d.courses.enabled = v))}
                      />
                      <Field label="Tiêu đề mục">
                        <Input
                          value={cfg.courses.title}
                          onChange={(e) => update((d) => void (d.courses.title = e.target.value))}
                        />
                      </Field>
                      <div className="space-y-1.5">
                        <Label className="text-xs font-semibold text-muted-foreground">
                          Khóa học hiển thị ({cfg.courses.selectedIds.length}/{allCourses.length})
                        </Label>
                        <div className="max-h-64 space-y-1 overflow-y-auto rounded-lg border border-border p-2">
                          {allCourses.map((c) => {
                            const on = cfg.courses.selectedIds.includes(c.id);
                            return (
                              <button
                                key={c.id}
                                type="button"
                                onClick={() =>
                                  update((d) => {
                                    d.courses.selectedIds = on
                                      ? d.courses.selectedIds.filter((x) => x !== c.id)
                                      : [...d.courses.selectedIds, c.id];
                                  })
                                }
                                className={cn(
                                  "flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left text-xs transition-colors",
                                  on ? "bg-primary/10 text-foreground" : "hover:bg-muted",
                                )}
                              >
                                <Badge variant={on ? "default" : "secondary"}>{c.level}</Badge>
                                <span className="min-w-0 flex-1 truncate">{c.title}</span>
                                {on && <Eye className="h-3.5 w-3.5 text-primary" />}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </>
                  )}

                  {id === "contact" && (
                    <>
                      <SectionToggle
                        enabled={cfg.contact.enabled}
                        onChange={(v) => update((d) => void (d.contact.enabled = v))}
                      />
                      <Field label="Địa chỉ">
                        <Input
                          value={cfg.contact.address}
                          onChange={(e) => update((d) => void (d.contact.address = e.target.value))}
                        />
                      </Field>
                      <div className="grid grid-cols-2 gap-2">
                        <Field label="Điện thoại">
                          <Input
                            value={cfg.contact.phone}
                            onChange={(e) => update((d) => void (d.contact.phone = e.target.value))}
                          />
                        </Field>
                        <Field label="Email">
                          <Input
                            value={cfg.contact.email}
                            onChange={(e) => update((d) => void (d.contact.email = e.target.value))}
                          />
                        </Field>
                        <Field label="Website">
                          <Input
                            value={cfg.contact.website}
                            onChange={(e) =>
                              update((d) => void (d.contact.website = e.target.value))
                            }
                          />
                        </Field>
                        <Field label="Mã số thuế">
                          <Input
                            value={cfg.contact.taxCode}
                            onChange={(e) =>
                              update((d) => void (d.contact.taxCode = e.target.value))
                            }
                          />
                        </Field>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs font-semibold text-muted-foreground">
                          Liên kết mạng xã hội
                        </Label>
                        {cfg.contact.socials.map((s, i) => (
                          <div key={s.id} className="grid grid-cols-[110px_1fr_auto] gap-1.5">
                            <Input
                              value={s.platform}
                              onChange={(e) =>
                                update((d) => void (d.contact.socials[i].platform = e.target.value))
                              }
                            />
                            <Input
                              value={s.url}
                              onChange={(e) =>
                                update((d) => void (d.contact.socials[i].url = e.target.value))
                              }
                            />
                            <Button
                              size="icon"
                              variant="ghost"
                              aria-label="Xóa liên kết"
                              onClick={() =>
                                update((d) => {
                                  d.contact.socials = d.contact.socials.filter(
                                    (x) => x.id !== s.id,
                                  );
                                })
                              }
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        ))}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => update((d) => void d.contact.socials.push(newSocial()))}
                        >
                          <Plus className="mr-2 h-4 w-4" /> Thêm liên kết
                        </Button>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center justify-between gap-2">
                          <Label className="text-xs font-semibold text-muted-foreground">
                            Liên kết nhanh ở footer
                          </Label>
                          <SectionToggle
                            enabled={cfg.contact.quickLinks.enabled}
                            onChange={(v) => update((d) => void (d.contact.quickLinks.enabled = v))}
                          />
                        </div>
                        {cfg.contact.quickLinks.enabled && (
                          <>
                            <Field label="Tiêu đề mục liên kết nhanh">
                              <Input
                                value={cfg.contact.quickLinks.title}
                                onChange={(e) =>
                                  update((d) => void (d.contact.quickLinks.title = e.target.value))
                                }
                              />
                            </Field>
                            {cfg.contact.quickLinks.links.map((l, i) => (
                              <div key={l.id} className="grid grid-cols-[140px_1fr_auto] gap-1.5">
                                <Input
                                  value={l.title}
                                  placeholder="Tiêu đề"
                                  onChange={(e) =>
                                    update(
                                      (d) => void (d.contact.quickLinks.links[i].title = e.target.value),
                                    )
                                  }
                                />
                                <Input
                                  value={l.url}
                                  placeholder="https://"
                                  onChange={(e) =>
                                    update(
                                      (d) => void (d.contact.quickLinks.links[i].url = e.target.value),
                                    )
                                  }
                                />
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  aria-label="Xóa liên kết nhanh"
                                  onClick={() =>
                                    update((d) => {
                                      d.contact.quickLinks.links = d.contact.quickLinks.links.filter(
                                        (x) => x.id !== l.id,
                                      );
                                    })
                                  }
                                >
                                  <Trash2 className="h-4 w-4 text-destructive" />
                                </Button>
                              </div>
                            ))}
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                update((d) => void d.contact.quickLinks.links.push(newQuickLink()))
                              }
                            >
                              <Plus className="mr-2 h-4 w-4" /> Thêm liên kết nhanh
                            </Button>
                          </>
                        )}
                      </div>
                    </>
                  )}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>

        {/* Preview trực tiếp */}
        <div className="xl:sticky xl:top-6 xl:self-start">
          <div className="overflow-hidden rounded-2xl border border-border bg-surface shadow-soft">
            <div className="flex items-center gap-2 border-b border-border bg-surface-2 px-4 py-2.5">
              <Eye className="h-4 w-4 text-primary" />
              <span className="text-sm font-semibold">Xem trước landing page</span>
              <span className="truncate text-xs text-muted-foreground">
                / {cfg.brand.shortName.toLowerCase().replace(/\s+/g, "-")}
              </span>
              <div className="ml-auto flex items-center gap-1">
                <Button
                  size="icon"
                  variant={device === "desktop" ? "default" : "ghost"}
                  aria-label="Xem bản desktop"
                  onClick={() => setDevice("desktop")}
                >
                  <Monitor className="h-4 w-4" />
                </Button>
                <Button
                  size="icon"
                  variant={device === "mobile" ? "default" : "ghost"}
                  aria-label="Xem bản mobile"
                  onClick={() => setDevice("mobile")}
                >
                  <Smartphone className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div className="max-h-[78vh] overflow-y-auto bg-muted/40 p-4">
              <div
                className={cn(
                  "mx-auto overflow-hidden rounded-xl border border-border shadow-soft transition-all",
                  device === "mobile" ? "w-[390px]" : "w-full",
                )}
              >
                <LandingPreview cfg={cfg} focus={focus} />
              </div>
            </div>
          </div>
        </div>
      </div>
        </TabsContent>
      </Tabs>
      </div>
    </div>
  );
}

