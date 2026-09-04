import { useEffect, useRef } from "react";
import { GraduationCap, Globe, Mail, MapPin, Phone, ChevronRight } from "lucide-react";
import { allCourses, type LandingConfig } from "@/lib/landing-config";

export type LandingSectionId =
  | "brand"
  | "banner"
  | "about"
  | "reasons"
  | "linguaskill"
  | "courses"
  | "contact";

/**
 * Bản preview landing page của đơn vị — mô phỏng trang thật (nền trắng riêng,
 * không phụ thuộc theme app) để admin thấy ngay thay đổi khi thiết lập.
 */
export function LandingPreview({
  cfg,
  focus,
}: {
  cfg: LandingConfig;
  focus?: LandingSectionId | null;
}) {
  const refs = useRef<Partial<Record<LandingSectionId, HTMLElement | null>>>({});

  useEffect(() => {
    if (!focus) return;
    refs.current[focus]?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [focus]);

  const accent = cfg.accent || "#1d4ed8";
  const reg = (id: LandingSectionId) => (el: HTMLElement | null) => {
    refs.current[id] = el;
  };
  const box = (id: LandingSectionId) =>
    ({
      outline: focus === id ? `2px solid ${accent}` : "none",
      outlineOffset: 4,
      borderRadius: 12,
      transition: "outline-color 150ms",
    }) as const;

  const courses = allCourses.filter((c) => cfg.courses.selectedIds.includes(c.id));

  return (
    <div style={{ background: "#ffffff", color: "#111827", fontSize: 13 }}>
      {/* Header / nhận diện thương hiệu */}
      <header
        ref={reg("brand")}
        style={{
          ...box("brand"),
          background: accent,
          color: "#fff",
          padding: "12px 16px",
          display: "flex",
          alignItems: "center",
          gap: 12,
        }}
      >
        {cfg.brand.logoUrl ? (
          <img src={cfg.brand.logoUrl} alt={cfg.brand.orgName} style={{ height: 36, width: 36, borderRadius: 999, objectFit: "cover", background: "#fff" }} />
        ) : (
          <span style={{ height: 36, width: 36, borderRadius: 999, background: "rgba(255,255,255,.2)", display: "grid", placeItems: "center" }}>
            <GraduationCap size={18} />
          </span>
        )}
        <span style={{ minWidth: 0 }}>
          <strong style={{ display: "block", fontSize: 15, lineHeight: 1.2 }}>{cfg.brand.orgName}</strong>
          {cfg.brand.shortName && (
            <span style={{ fontSize: 11, opacity: 0.85 }}>{cfg.brand.shortName}</span>
          )}
        </span>
        {cfg.brand.showLogin && (
          <span style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ background: "rgba(255,255,255,.15)", borderRadius: 8, padding: "6px 10px", fontSize: 11 }}>
              email / mật khẩu
            </span>
            <span style={{ background: "#fff", color: accent, borderRadius: 8, padding: "6px 12px", fontSize: 12, fontWeight: 600 }}>
              {cfg.brand.loginLabel || "Đăng nhập"}
            </span>
          </span>
        )}
      </header>

      <div style={{ padding: 16, display: "grid", gap: 20 }}>
        {/* Banner */}
        {cfg.banner.enabled && (
          <section ref={reg("banner")} style={box("banner")}>
            <div style={{ display: "grid", gap: 10 }}>
              {cfg.banner.slides.slice(0, 1).map((s) => (
                <div
                  key={s.id}
                  style={{
                    position: "relative",
                    overflow: "hidden",
                    borderRadius: 12,
                    minHeight: 150,
                    background: s.imageUrl ? `center/cover no-repeat url(${s.imageUrl})` : `linear-gradient(120deg, ${accent}, ${accent}22)`,
                    color: "#fff",
                    display: "flex",
                    alignItems: "flex-end",
                    padding: 16,
                  }}
                >
                  <div>
                    <div style={{ fontSize: 20, fontWeight: 700, textTransform: "uppercase", lineHeight: 1.25 }}>{s.title}</div>
                    <div style={{ opacity: 0.9, marginTop: 4 }}>{s.subtitle}</div>
                  </div>
                </div>
              ))}
              {cfg.banner.slides.length > 1 && (
                <div style={{ display: "flex", gap: 8 }}>
                  {cfg.banner.slides.slice(1).map((s) => (
                    <div
                      key={s.id}
                      style={{
                        flex: 1,
                        borderRadius: 10,
                        minHeight: 56,
                        padding: 8,
                        fontSize: 11,
                        color: "#fff",
                        background: s.imageUrl ? `center/cover no-repeat url(${s.imageUrl})` : `linear-gradient(120deg, ${accent}cc, ${accent}55)`,
                      }}
                    >
                      {s.title}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>
        )}

        {/* Giới thiệu nhà trường */}
        {cfg.about.enabled && (
          <section
            ref={reg("about")}
            style={{ ...box("about"), display: "grid", gridTemplateColumns: "1.6fr 1fr", gap: 16, border: "1px solid #e5e7eb", padding: 16 }}
          >
            <div>
              <div style={{ color: accent, fontWeight: 600, fontSize: 11 }}>{cfg.about.eyebrow}</div>
              <h2 style={{ fontSize: 17, fontWeight: 700, margin: "6px 0 8px" }}>{cfg.about.title}</h2>
              <p style={{ color: "#4b5563", lineHeight: 1.7 }}>{cfg.about.body}</p>
            </div>
            <div
              style={{
                borderRadius: 10,
                minHeight: 110,
                background: cfg.about.imageUrl ? `center/cover no-repeat url(${cfg.about.imageUrl})` : "#f3f4f6",
                display: "grid",
                placeItems: "center",
                color: "#9ca3af",
                fontSize: 11,
              }}
            >
              {!cfg.about.imageUrl && "Ảnh giới thiệu"}
            </div>
          </section>
        )}

        {/* Lý do chọn Linguaskill */}
        {cfg.reasons.enabled && (
          <section ref={reg("reasons")} style={{ ...box("reasons"), background: "#f9fafb", padding: 16 }}>
            <h2 style={{ textAlign: "center", fontSize: 16, fontWeight: 700, marginBottom: 12 }}>{cfg.reasons.title}</h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10 }}>
              {cfg.reasons.items.map((r, i) => (
                <div key={r.id} style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 10, padding: 10 }}>
                  <div style={{ color: accent, fontWeight: 700, fontSize: 12 }}>{i + 1}. {r.title}</div>
                  <p style={{ color: "#6b7280", marginTop: 4, fontSize: 11, lineHeight: 1.6 }}>{r.description}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Giới thiệu bài thi Linguaskill */}
        {cfg.linguaskill.enabled && (
          <section ref={reg("linguaskill")} style={{ ...box("linguaskill"), border: "1px solid #e5e7eb", padding: 16 }}>
            <h2 style={{ fontSize: 17, fontWeight: 700, color: accent }}>{cfg.linguaskill.title}</h2>
            <p style={{ color: "#4b5563", marginTop: 6, lineHeight: 1.7 }}>{cfg.linguaskill.intro}</p>
            <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 12, marginTop: 12 }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 11 }}>
                <thead>
                  <tr style={{ background: `${accent}14`, textAlign: "left" }}>
                    <th style={{ padding: 6 }}>Phần thi</th>
                    <th style={{ padding: 6 }}>Thời lượng</th>
                    <th style={{ padding: 6 }}>Hình thức</th>
                    <th style={{ padding: 6 }}>Số câu</th>
                  </tr>
                </thead>
                <tbody>
                  {cfg.linguaskill.skills.map((s) => (
                    <tr key={s.id} style={{ borderTop: "1px solid #e5e7eb" }}>
                      <td style={{ padding: 6, fontWeight: 600 }}>{s.skill}</td>
                      <td style={{ padding: 6 }}>{s.duration}</td>
                      <td style={{ padding: 6 }}>{s.format}</td>
                      <td style={{ padding: 6 }}>{s.count}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 11 }}>
                <thead>
                  <tr style={{ background: "#f3f4f6", textAlign: "left" }}>
                    <th style={{ padding: 6 }}>Điểm</th>
                    <th style={{ padding: 6 }}>CEFR</th>
                    <th style={{ padding: 6 }}>Xếp loại</th>
                  </tr>
                </thead>
                <tbody>
                  {cfg.linguaskill.bands.map((b) => (
                    <tr key={b.id} style={{ borderTop: "1px solid #e5e7eb" }}>
                      <td style={{ padding: 6 }}>{b.score}</td>
                      <td style={{ padding: 6, fontWeight: 700, color: accent }}>{b.cefr}</td>
                      <td style={{ padding: 6 }}>{b.label}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {/* Khóa học */}
        {cfg.courses.enabled && (
          <section ref={reg("courses")} style={box("courses")}>
            <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 10 }}>{cfg.courses.title}</h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10 }}>
              {courses.map((c) => (
                <div key={c.id} style={{ border: "1px solid #e5e7eb", borderRadius: 10, overflow: "hidden" }}>
                  <div
                    style={{
                      height: 62,
                      background: `linear-gradient(135deg, ${accent}, ${accent}77)`,
                      color: "#fff",
                      display: "flex",
                      alignItems: "flex-end",
                      padding: 8,
                      fontWeight: 800,
                      fontSize: 16,
                    }}
                  >
                    {c.level}
                  </div>
                  <div style={{ padding: 8 }}>
                    <div style={{ fontWeight: 600, fontSize: 11, color: accent }}>{c.title}</div>
                    <div style={{ color: "#9ca3af", fontSize: 10, marginTop: 2 }}>{cfg.courses.note}</div>
                    <div style={{ marginTop: 6, display: "inline-flex", alignItems: "center", gap: 2, fontSize: 10, color: accent, fontWeight: 600 }}>
                      Đăng ký / Tìm hiểu <ChevronRight size={11} />
                    </div>
                  </div>
                </div>
              ))}
              {courses.length === 0 && (
                <div style={{ color: "#9ca3af", fontSize: 11 }}>Chưa chọn khóa học nào để hiển thị.</div>
              )}
            </div>
          </section>
        )}
      </div>

      {/* Liên hệ & mạng xã hội */}
      {cfg.contact.enabled && (
        <footer
          ref={reg("contact")}
          style={{ ...box("contact"), background: "#0f172a", color: "#e5e7eb", padding: 16, display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 16 }}
        >
          <div>
            <div style={{ fontWeight: 700, textTransform: "uppercase", fontSize: 12 }}>{cfg.brand.orgName}</div>
            <div style={{ fontSize: 11, marginTop: 8, display: "grid", gap: 4, color: "#cbd5e1" }}>
              <span style={{ display: "flex", gap: 6 }}><MapPin size={12} /> {cfg.contact.address}</span>
              <span style={{ display: "flex", gap: 6 }}><Phone size={12} /> {cfg.contact.phone}</span>
              <span style={{ display: "flex", gap: 6 }}><Mail size={12} /> {cfg.contact.email}</span>
              <span style={{ display: "flex", gap: 6 }}><Globe size={12} /> {cfg.contact.website}</span>
              {cfg.contact.taxCode && <span style={{ opacity: 0.7 }}>MST: {cfg.contact.taxCode}</span>}
            </div>
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 12 }}>{cfg.contact.title}</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 8 }}>
              {cfg.contact.socials.map((s) => (
                <span key={s.id} style={{ background: accent, color: "#fff", borderRadius: 999, padding: "4px 10px", fontSize: 10 }}>
                  {s.platform}
                </span>
              ))}
            </div>
          </div>
        </footer>
      )}
    </div>
  );
}
