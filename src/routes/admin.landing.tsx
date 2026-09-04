import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  Building2,
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
} from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/PageHeader";
import { LandingPreview, type LandingSectionId } from "@/components/LandingPreview";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { orgs } from "@/lib/orgs";
import {
  allCourses,
  defaultConfig,
  loadConfigs,
  newBand,
  newReason,
  newSkill,
  newSlide,
  newSocial,
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
  { id: "reasons", label: "4. Lý do chọn Linguaskill", icon: ListChecks },
  { id: "linguaskill", label: "5. Giới thiệu bài thi Linguaskill", icon: LayoutTemplate },
  { id: "courses", label: "6. Giới thiệu khóa học", icon: GraduationCap },
  { id: "contact", label: "7. Liên hệ & mạng xã hội", icon: Phone },
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

  // Nạp cấu hình đã lưu (localStorage) sau khi hydrate.
  useEffect(() => {
    const saved = loadConfigs()[orgId];
    setCfg(saved ?? defaultConfig(orgId));
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
      [cfg.banner, cfg.about, cfg.reasons, cfg.linguaskill, cfg.courses, cfg.contact].filter(
        (s) => s.enabled,
      ).length + 1,
    [cfg],
  );

  const onSave = () => {
    saveConfig(cfg);
    setDirty(false);
    toast.success("Đã lưu thiết lập landing page", { description: cfg.brand.orgName });
  };

  const onPublish = () => {
    const next = { ...cfg, published: true };
    setCfg(next);
    saveConfig(next);
    setDirty(false);
    toast.success("Đã xuất bản landing page", { description: cfg.brand.orgName });
  };

  const onReset = () => {
    setCfg(defaultConfig(orgId));
    setDirty(true);
    toast.info("Đã đưa về mẫu mặc định (chưa lưu)");
  };

  return (
    <div className="mx-auto max-w-[1600px] space-y-6 px-4 py-6 sm:px-6">
      <PageHeader
        eyebrow="Admin platform"
        eyebrowIcon={LayoutTemplate}
        title="Thiết lập Landing page đơn vị"
        description="Chọn đơn vị, cấu hình từng khối nội dung và xem trước ngay bên phải. Khi chỉnh sửa mục nào, preview sẽ tự cuộn và làm nổi bật đúng mục đó."
        actions={
          <>
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
            <Button variant="outline" onClick={onReset}>
              <RotateCcw className="mr-2 h-4 w-4" /> Mẫu mặc định
            </Button>
            <Button variant="outline" onClick={onSave}>
              <Save className="mr-2 h-4 w-4" /> Lưu nháp
            </Button>
            <Button onClick={onPublish}>
              <Globe className="mr-2 h-4 w-4" /> Xuất bản
            </Button>
          </>
        }
        stats={[
          { icon: Building2, label: "Đơn vị", value: cfg.brand.shortName, tone: "primary" },
          { icon: ListChecks, label: "Khối đang bật", value: `${enabledCount}/7`, tone: "success" },
          {
            icon: GraduationCap,
            label: "Khóa hiển thị",
            value: cfg.courses.selectedIds.length,
            tone: "muted",
          },
          {
            icon: Eye,
            label: "Trạng thái",
            value: cfg.published ? "Đã xuất bản" : "Bản nháp",
            hint: dirty ? "Có thay đổi chưa lưu" : "Đã đồng bộ",
            tone: cfg.published ? "success" : "warning",
          },
        ]}
      />

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
                      <Field label="Đường dẫn logo (URL)">
                        <Input
                          placeholder="https://..."
                          value={cfg.brand.logoUrl}
                          onChange={(e) => update((d) => void (d.brand.logoUrl = e.target.value))}
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
                      <div className="flex items-center justify-between rounded-lg border border-border bg-surface-2 px-3 py-2">
                        <span className="text-xs font-medium text-muted-foreground">
                          Hiển thị khu vực đăng nhập ở header
                        </span>
                        <Switch
                          checked={cfg.brand.showLogin}
                          onCheckedChange={(v) => update((d) => void (d.brand.showLogin = v))}
                        />
                      </div>
                      {cfg.brand.showLogin && (
                        <Field label="Nhãn nút đăng nhập">
                          <Input
                            value={cfg.brand.loginLabel}
                            onChange={(e) =>
                              update((d) => void (d.brand.loginLabel = e.target.value))
                            }
                          />
                        </Field>
                      )}
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
                          <Input
                            value={s.title}
                            placeholder="Tiêu đề"
                            onChange={(e) =>
                              update((d) => void (d.banner.slides[i].title = e.target.value))
                            }
                          />
                          <Input
                            value={s.subtitle}
                            placeholder="Mô tả ngắn"
                            onChange={(e) =>
                              update((d) => void (d.banner.slides[i].subtitle = e.target.value))
                            }
                          />
                          <Input
                            value={s.imageUrl}
                            placeholder="URL hình ảnh"
                            onChange={(e) =>
                              update((d) => void (d.banner.slides[i].imageUrl = e.target.value))
                            }
                          />
                        </div>
                      ))}
                      <Button
                        variant="outline"
                        className="w-full"
                        onClick={() => update((d) => void d.banner.slides.push(newSlide()))}
                      >
                        <Plus className="mr-2 h-4 w-4" /> Thêm slide
                      </Button>
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
                      <Field label="URL hình ảnh minh họa">
                        <Input
                          value={cfg.about.imageUrl}
                          onChange={(e) => update((d) => void (d.about.imageUrl = e.target.value))}
                        />
                      </Field>
                    </>
                  )}

                  {id === "reasons" && (
                    <>
                      <SectionToggle
                        enabled={cfg.reasons.enabled}
                        onChange={(v) => update((d) => void (d.reasons.enabled = v))}
                      />
                      <Field label="Tiêu đề mục">
                        <Input
                          value={cfg.reasons.title}
                          onChange={(e) => update((d) => void (d.reasons.title = e.target.value))}
                        />
                      </Field>
                      {cfg.reasons.items.map((r, i) => (
                        <div key={r.id} className="space-y-2 rounded-lg border border-border p-3">
                          <div className="flex items-center justify-between">
                            <Badge variant="secondary">Lý do {i + 1}</Badge>
                            <Button
                              size="icon"
                              variant="ghost"
                              aria-label="Xóa lý do"
                              onClick={() =>
                                update((d) => {
                                  d.reasons.items = d.reasons.items.filter((x) => x.id !== r.id);
                                })
                              }
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                          <Input
                            value={r.title}
                            onChange={(e) =>
                              update((d) => void (d.reasons.items[i].title = e.target.value))
                            }
                          />
                          <Textarea
                            rows={2}
                            value={r.description}
                            onChange={(e) =>
                              update((d) => void (d.reasons.items[i].description = e.target.value))
                            }
                          />
                        </div>
                      ))}
                      <Button
                        variant="outline"
                        className="w-full"
                        onClick={() => update((d) => void d.reasons.items.push(newReason()))}
                      >
                        <Plus className="mr-2 h-4 w-4" /> Thêm lý do
                      </Button>
                    </>
                  )}

                  {id === "linguaskill" && (
                    <>
                      <SectionToggle
                        enabled={cfg.linguaskill.enabled}
                        onChange={(v) => update((d) => void (d.linguaskill.enabled = v))}
                      />
                      <Field label="Tiêu đề">
                        <Input
                          value={cfg.linguaskill.title}
                          onChange={(e) =>
                            update((d) => void (d.linguaskill.title = e.target.value))
                          }
                        />
                      </Field>
                      <Field label="Mô tả bài thi">
                        <Textarea
                          rows={4}
                          value={cfg.linguaskill.intro}
                          onChange={(e) =>
                            update((d) => void (d.linguaskill.intro = e.target.value))
                          }
                        />
                      </Field>
                      <div className="space-y-2">
                        <Label className="text-xs font-semibold text-muted-foreground">
                          Nội dung bài thi & thời gian
                        </Label>
                        {cfg.linguaskill.skills.map((s, i) => (
                          <div key={s.id} className="grid grid-cols-[1fr_1fr_1fr_1fr_auto] gap-1.5">
                            <Input
                              value={s.skill}
                              onChange={(e) =>
                                update((d) => void (d.linguaskill.skills[i].skill = e.target.value))
                              }
                            />
                            <Input
                              value={s.duration}
                              onChange={(e) =>
                                update(
                                  (d) => void (d.linguaskill.skills[i].duration = e.target.value),
                                )
                              }
                            />
                            <Input
                              value={s.format}
                              onChange={(e) =>
                                update((d) => void (d.linguaskill.skills[i].format = e.target.value))
                              }
                            />
                            <Input
                              value={s.count}
                              onChange={(e) =>
                                update((d) => void (d.linguaskill.skills[i].count = e.target.value))
                              }
                            />
                            <Button
                              size="icon"
                              variant="ghost"
                              aria-label="Xóa phần thi"
                              onClick={() =>
                                update((d) => {
                                  d.linguaskill.skills = d.linguaskill.skills.filter(
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
                          onClick={() => update((d) => void d.linguaskill.skills.push(newSkill()))}
                        >
                          <Plus className="mr-2 h-4 w-4" /> Thêm phần thi
                        </Button>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs font-semibold text-muted-foreground">
                          Thang điểm quy đổi CEFR
                        </Label>
                        {cfg.linguaskill.bands.map((b, i) => (
                          <div key={b.id} className="grid grid-cols-[1fr_1fr_1fr_auto] gap-1.5">
                            <Input
                              value={b.score}
                              onChange={(e) =>
                                update((d) => void (d.linguaskill.bands[i].score = e.target.value))
                              }
                            />
                            <Input
                              value={b.cefr}
                              onChange={(e) =>
                                update((d) => void (d.linguaskill.bands[i].cefr = e.target.value))
                              }
                            />
                            <Input
                              value={b.label}
                              onChange={(e) =>
                                update((d) => void (d.linguaskill.bands[i].label = e.target.value))
                              }
                            />
                            <Button
                              size="icon"
                              variant="ghost"
                              aria-label="Xóa mức điểm"
                              onClick={() =>
                                update((d) => {
                                  d.linguaskill.bands = d.linguaskill.bands.filter(
                                    (x) => x.id !== b.id,
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
                          onClick={() => update((d) => void d.linguaskill.bands.push(newBand()))}
                        >
                          <Plus className="mr-2 h-4 w-4" /> Thêm mức điểm
                        </Button>
                      </div>
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
                      <Field label="Ghi chú dưới tên khóa (niên khóa...)">
                        <Input
                          value={cfg.courses.note}
                          onChange={(e) => update((d) => void (d.courses.note = e.target.value))}
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
                      <Field label="Tiêu đề khối mạng xã hội">
                        <Input
                          value={cfg.contact.title}
                          onChange={(e) => update((d) => void (d.contact.title = e.target.value))}
                        />
                      </Field>
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
    </div>
  );
}
