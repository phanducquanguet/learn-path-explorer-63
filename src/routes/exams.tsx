import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowUpRight,
  Camera,
  CheckCircle2,
  ClipboardCheck,
  Clock,
  FileQuestion,
  IdCard,
  Layers,
  Lock,
  ScanFace,
  ShieldCheck,
  Sparkles,
  Upload,
} from "lucide-react";
import { TopNav } from "@/components/TopNav";
import { EXAM_SKILLS } from "@/lib/teacher-data";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import {
  BIOMETRIC_KEY,
  CURRENT_POLICY_VERSION_ID,
  getPolicyVersion,
  type BiometricRegistration,
  type PolicySection,
} from "@/lib/policy";

export const Route = createFileRoute("/exams")({
  head: () => ({
    meta: [
      { title: "Thi cử — UNICOM LMS" },
      { name: "description", content: "Vào cổng thi để thực hiện các bài thi chính thức." },
    ],
  }),
  component: ExamsPage,
});

type SavedExam = {
  id?: string;
  name: string;
  levelCode: string;
  duration: number;
  description?: string;
  skills: string[];
  totalQuestions?: number;
  groups?: Record<string, { questions: unknown[] }>;
  savedAt: string;
};

const TEST_PORTAL_BASE = "https://exam-portal.ubos.vn";
  id?: string;
  name: string;
  levelCode: string;
  duration: number;
  description?: string;
  skills: string[];
  totalQuestions?: number;
  groups?: Record<string, { questions: unknown[] }>;
  savedAt: string;
};

type BiometricRegistration = {
  cccdFront: string; // data url
  cccdBack: string;
  faceImage: string;
  termsAcceptedAt: string;
  registeredAt: string;
};

const TEST_PORTAL_BASE = "https://exam-portal.ubos.vn";
const BIOMETRIC_KEY = "unicom.biometric-registration";

function hueFor(id: string) {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0;
  return h % 360;
}

function skillLabel(id: string) {
  return EXAM_SKILLS.find((s) => s.id === id)?.label.replace(/\s*\(.*\)/, "") ?? id;
}

function ExamsPage() {
  const [exams, setExams] = useState<SavedExam[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [registration, setRegistration] = useState<BiometricRegistration | null>(null);
  const [openDialog, setOpenDialog] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const raw = window.localStorage.getItem("unicom.exams");
    if (raw) {
      try {
        setExams(JSON.parse(raw));
      } catch {
        setExams([]);
      }
    }
    const reg = window.localStorage.getItem(BIOMETRIC_KEY);
    if (reg) {
      try {
        setRegistration(JSON.parse(reg));
      } catch {
        setRegistration(null);
      }
    }
    setLoaded(true);
  }, []);

  const isRegistered = !!registration;

  const handleComplete = (data: BiometricRegistration) => {
    window.localStorage.setItem(BIOMETRIC_KEY, JSON.stringify(data));
    setRegistration(data);
    setOpenDialog(false);
    toast.success("Đăng ký xác thực sinh trắc học thành công");
  };

  const handleRevoke = () => {
    if (!confirm("Hủy đăng ký sẽ khiến bạn không thể tham gia thi cho đến khi đăng ký lại. Tiếp tục?")) return;
    window.localStorage.removeItem(BIOMETRIC_KEY);
    setRegistration(null);
    toast("Đã hủy đăng ký sinh trắc học");
  };

  return (
    <div className="min-h-screen bg-background">
      <TopNav />
      <div className="mx-auto max-w-7xl px-6 pb-20 pt-10 sm:px-8">
        <div className="flex flex-col gap-2">
          <span className="inline-flex w-fit items-center gap-2 text-xs font-semibold uppercase tracking-wider text-primary">
            <Sparkles className="h-3.5 w-3.5" /> Cổng thi chính thức
          </span>
          <h1 className="font-display text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            Thi cử
          </h1>
          <p className="text-sm text-muted-foreground">
            Danh sách các bài thi đã được Admin thiết lập. Bạn cần hoàn tất đăng ký khuôn mặt &amp; CCCD trước khi tham gia thi.
          </p>
        </div>

        {/* Biometric registration banner */}
        <BiometricBanner
          registration={registration}
          onOpen={() => setOpenDialog(true)}
          onRevoke={handleRevoke}
        />

        {loaded && exams.length === 0 ? (
          <div className="mt-10 rounded-3xl border border-dashed border-border bg-surface/40 p-12 text-center">
            <ClipboardCheck className="mx-auto h-10 w-10 text-muted-foreground" />
            <h3 className="mt-3 font-display text-lg font-semibold text-foreground">
              Chưa có bài thi nào
            </h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Admin chưa thiết lập bài thi. Vui lòng tạo bài thi tại màn hình Quản lý bài thi.
            </p>
          </div>
        ) : (
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {exams.map((e, idx) => {
              const id = e.id ?? `exam-${idx}`;
              const hue = hueFor(id);
              const totalQuestions =
                e.totalQuestions ??
                (e.groups
                  ? Object.values(e.groups).reduce((s, g) => s + (g?.questions?.length ?? 0), 0)
                  : 0);

              const cardInner = (
                <>
                  <div
                    className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full opacity-30 blur-3xl transition group-hover:opacity-60"
                    style={{ background: `oklch(0.78 0.18 ${hue})` }}
                  />
                  <div className="relative flex items-start justify-between">
                    <div
                      className="flex h-12 w-12 items-center justify-center rounded-2xl text-white"
                      style={{
                        background: `linear-gradient(135deg, oklch(0.5 0.2 ${hue}), oklch(0.65 0.18 ${(hue + 30) % 360}))`,
                      }}
                    >
                      <ClipboardCheck className="h-5 w-5" />
                    </div>
                    <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-1 text-[11px] font-semibold text-primary ring-1 ring-primary/20">
                      {e.levelCode}
                    </span>
                  </div>

                  <div className="relative mt-4">
                    <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                      Bài thi chính thức
                    </div>
                    <h3 className="mt-1 text-lg font-semibold text-foreground">{e.name}</h3>
                    {e.description && (
                      <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                        {e.description}
                      </p>
                    )}
                  </div>

                  <div className="relative mt-4 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                    <span className="inline-flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5" /> {e.duration} phút
                    </span>
                    <span>•</span>
                    <span className="inline-flex items-center gap-1">
                      <FileQuestion className="h-3.5 w-3.5" /> {totalQuestions} câu
                    </span>
                    <span>•</span>
                    <span className="inline-flex items-center gap-1">
                      <Layers className="h-3.5 w-3.5" /> {e.skills.length} kỹ năng
                    </span>
                  </div>

                  {e.skills.length > 0 && (
                    <div className="relative mt-3 flex flex-wrap gap-1.5">
                      {e.skills.map((s) => (
                        <span
                          key={s}
                          className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-semibold text-muted-foreground"
                        >
                          {skillLabel(s)}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="relative mt-5 flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">
                      Thiết lập: {new Date(e.savedAt).toLocaleDateString("vi-VN")}
                    </span>
                    {isRegistered ? (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-foreground px-3 py-1.5 text-xs font-semibold text-background transition group-hover:gap-2">
                        Vào cổng thi
                        <ArrowUpRight className="h-3.5 w-3.5" />
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-muted px-3 py-1.5 text-xs font-semibold text-muted-foreground">
                        <Lock className="h-3.5 w-3.5" />
                        Cần đăng ký
                      </span>
                    )}
                  </div>
                </>
              );

              const cardClass =
                "group relative overflow-hidden rounded-3xl bg-surface p-5 ring-1 ring-border shadow-soft transition hover:-translate-y-1 hover:shadow-elevated";

              return isRegistered ? (
                <a
                  key={id}
                  href={TEST_PORTAL_BASE}
                  target="_blank"
                  rel="noreferrer"
                  className={cardClass}
                >
                  {cardInner}
                </a>
              ) : (
                <button
                  key={id}
                  type="button"
                  onClick={() => {
                    toast.error("Bạn cần hoàn tất đăng ký khuôn mặt & CCCD trước khi vào thi");
                    setOpenDialog(true);
                  }}
                  className={`${cardClass} text-left cursor-not-allowed opacity-90`}
                >
                  {cardInner}
                </button>
              );
            })}
          </div>
        )}
      </div>

      <BiometricDialog
        open={openDialog}
        onOpenChange={setOpenDialog}
        existing={registration}
        onComplete={handleComplete}
      />
    </div>
  );
}

function BiometricBanner({
  registration,
  onOpen,
  onRevoke,
}: {
  registration: BiometricRegistration | null;
  onOpen: () => void;
  onRevoke: () => void;
}) {
  if (registration) {
    return (
      <div className="mt-6 flex flex-col gap-3 rounded-2xl border border-emerald-500/30 bg-emerald-500/5 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <div className="grid h-10 w-10 place-content-center rounded-xl bg-emerald-500/15 text-emerald-600">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div>
            <div className="text-sm font-semibold text-foreground">
              Đã xác thực sinh trắc học
            </div>
            <div className="text-xs text-muted-foreground">
              Đăng ký lúc {new Date(registration.registeredAt).toLocaleString("vi-VN")} · Bạn có thể tham gia bất kỳ bài thi nào bên dưới.
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={onOpen}>
            Xem lại thông tin
          </Button>
          <Button variant="ghost" size="sm" onClick={onRevoke}>
            Hủy đăng ký
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-6 flex flex-col gap-3 rounded-2xl border border-amber-500/40 bg-amber-500/5 p-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-start gap-3">
        <div className="grid h-10 w-10 place-content-center rounded-xl bg-amber-500/15 text-amber-600">
          <ScanFace className="h-5 w-5" />
        </div>
        <div>
          <div className="text-sm font-semibold text-foreground">
            Bắt buộc: Đăng ký khuôn mặt &amp; CCCD trước khi thi
          </div>
          <div className="text-xs text-muted-foreground">
            Hệ thống cần xác thực định danh (eKYC) để đảm bảo tính công bằng. Vui lòng đọc điều khoản và hoàn tất đăng ký.
          </div>
        </div>
      </div>
      <Button onClick={onOpen} className="gap-2">
        <ScanFace className="h-4 w-4" />
        Đăng ký ngay
      </Button>
    </div>
  );
}

type Step = "terms" | "cccd" | "face" | "review";

function BiometricDialog({
  open,
  onOpenChange,
  existing,
  onComplete,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  existing: BiometricRegistration | null;
  onComplete: (data: BiometricRegistration) => void;
}) {
  const [step, setStep] = useState<Step>("terms");
  const [agreed, setAgreed] = useState(false);
  const [cccdFront, setCccdFront] = useState<string>("");
  const [cccdBack, setCccdBack] = useState<string>("");
  const [faceImage, setFaceImage] = useState<string>("");

  useEffect(() => {
    if (open) {
      if (existing) {
        setStep("review");
        setAgreed(true);
        setCccdFront(existing.cccdFront);
        setCccdBack(existing.cccdBack);
        setFaceImage(existing.faceImage);
      } else {
        setStep("terms");
        setAgreed(false);
        setCccdFront("");
        setCccdBack("");
        setFaceImage("");
      }
    }
  }, [open, existing]);

  const steps: { key: Step; label: string }[] = [
    { key: "terms", label: "Điều khoản" },
    { key: "cccd", label: "CCCD" },
    { key: "face", label: "Khuôn mặt" },
    { key: "review", label: "Xác nhận" },
  ];
  const stepIdx = steps.findIndex((s) => s.key === step);

  const submit = () => {
    if (!agreed || !cccdFront || !cccdBack || !faceImage) {
      toast.error("Vui lòng hoàn tất tất cả các bước");
      return;
    }
    onComplete({
      cccdFront,
      cccdBack,
      faceImage,
      termsAcceptedAt: existing?.termsAcceptedAt ?? new Date().toISOString(),
      registeredAt: new Date().toISOString(),
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ScanFace className="h-5 w-5 text-primary" />
            Đăng ký khuôn mặt &amp; CCCD
          </DialogTitle>
          <DialogDescription>
            Quy trình eKYC bắt buộc để tham gia thi đánh giá năng lực.
          </DialogDescription>
        </DialogHeader>

        {/* Stepper */}
        <div className="flex items-center gap-2 px-1">
          {steps.map((s, i) => (
            <div key={s.key} className="flex flex-1 items-center gap-2">
              <div
                className={`grid h-6 w-6 place-content-center rounded-full text-[11px] font-semibold ${
                  i <= stepIdx
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {i < stepIdx ? <CheckCircle2 className="h-3.5 w-3.5" /> : i + 1}
              </div>
              <span
                className={`text-xs font-medium ${
                  i <= stepIdx ? "text-foreground" : "text-muted-foreground"
                }`}
              >
                {s.label}
              </span>
              {i < steps.length - 1 && <div className="h-px flex-1 bg-border" />}
            </div>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto">
          {step === "terms" && (
            <TermsStep agreed={agreed} setAgreed={setAgreed} />
          )}
          {step === "cccd" && (
            <CccdStep
              cccdFront={cccdFront}
              cccdBack={cccdBack}
              setCccdFront={setCccdFront}
              setCccdBack={setCccdBack}
            />
          )}
          {step === "face" && (
            <FaceStep faceImage={faceImage} setFaceImage={setFaceImage} />
          )}
          {step === "review" && (
            <ReviewStep
              cccdFront={cccdFront}
              cccdBack={cccdBack}
              faceImage={faceImage}
            />
          )}
        </div>

        <DialogFooter className="border-t pt-4">
          {step !== "terms" && (
            <Button
              variant="outline"
              onClick={() => setStep(steps[Math.max(0, stepIdx - 1)].key)}
            >
              Quay lại
            </Button>
          )}
          {step === "terms" && (
            <Button disabled={!agreed} onClick={() => setStep("cccd")}>
              Tôi đồng ý &amp; Tiếp tục
            </Button>
          )}
          {step === "cccd" && (
            <Button
              disabled={!cccdFront || !cccdBack}
              onClick={() => setStep("face")}
            >
              Tiếp tục
            </Button>
          )}
          {step === "face" && (
            <Button disabled={!faceImage} onClick={() => setStep("review")}>
              Tiếp tục
            </Button>
          )}
          {step === "review" && (
            <Button onClick={submit} className="gap-2">
              <CheckCircle2 className="h-4 w-4" />
              {existing ? "Cập nhật" : "Hoàn tất đăng ký"}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

const POLICY_SECTIONS: { title: string; body: string[] }[] = [
  {
    title: "Điều 1. Định nghĩa và Phạm vi thu thập",
    body: [
      "Khi bạn chọn tham gia các bài thi có tính năng giám thị ảo (Proctored Test), hệ thống của chúng tôi sẽ tiến hành thu thập các loại dữ liệu sau:",
      "• Ảnh chụp Căn cước công dân (CCCD): Hình ảnh mặt trước và mặt sau của giấy tờ tùy thân hợp pháp, còn hiệu lực.",
      "• Ảnh khuôn mặt thực tế (Live Face Image): Hình ảnh tĩnh được chụp từ camera tại thời điểm bạn làm thủ tục vào phòng thi.",
      "• Dữ liệu video/khung hình (Frame Captures): Các đoạn video hoặc hình ảnh chụp ngắt quãng khuôn mặt và biểu cảm của bạn trong suốt thời gian đếm ngược của bài thi.",
      "• Dữ liệu kỹ thuật kèm theo: Thông tin về góc chiếu sáng, chuyển động mắt, và sự hiện diện của khuôn mặt thứ hai trong khung hình để phục vụ thuật toán chống gian lận.",
    ],
  },
  {
    title: "Điều 2. Mục đích xử lý dữ liệu (Tuyệt đối và Duy nhất)",
    body: [
      "1. Trích xuất thông tin cá nhân: Nhận diện và tự động trích xuất các thông tin văn bản trên thẻ CCCD (Họ tên, Ngày sinh, Số CCCD...) để hoàn thiện hồ sơ dự thi Linguaskill.",
      "2. Xác thực định danh (eKYC): Đối chiếu ảnh khuôn mặt thực tế với ảnh chân dung in trên thẻ CCCD để đảm bảo người ngồi trước màn hình chính là chủ sở hữu hợp pháp của giấy tờ tùy thân.",
      "3. Giám sát phòng thi: AI sẽ phân tích dữ liệu video theo thời gian thực để phát hiện các dấu hiệu gian lận (thi hộ, dùng tài liệu, có người trợ giúp).",
      "4. Giải quyết khiếu nại: Làm bằng chứng đối chiếu trong trường hợp bạn có khiếu nại về điểm số hoặc quyết định hủy kết quả thi của hệ thống.",
      "Cam kết loại trừ: Dữ liệu khuôn mặt của bạn tuyệt đối không được sử dụng để bán cho bên thứ ba, không dùng để quảng cáo, và không dùng để huấn luyện (train) các mô hình AI.",
    ],
  },
  {
    title: "Điều 3. Thời gian lưu trữ và Quy tắc tự hủy",
    body: [
      "1. Thi bình thường: Dữ liệu ảnh gốc và video giám thị sẽ tự động xóa vĩnh viễn trong vòng 30 ngày kể từ khi có kết quả chính thức.",
      "2. Phát hiện gian lận: Dữ liệu bằng chứng được lưu trữ tối đa 90 ngày để phục vụ thanh tra, sau đó bị xóa.",
      "3. Xóa tài khoản: Mọi dữ liệu khuôn mặt liên kết với tài khoản sẽ được lập tức hủy bỏ.",
    ],
  },
  {
    title: "Điều 4. Nguyên tắc chia sẻ dữ liệu",
    body: [
      "Dữ liệu khuôn mặt được mã hóa an toàn và chỉ có hai nhóm được tiếp cận:",
      "1. Hệ thống thuật toán AI giám thị nội bộ.",
      "2. Nhân sự QA / CSKH có thẩm quyền – chỉ giải mã khi có yêu cầu rà soát khiếu nại từ chính bạn.",
      "Dữ liệu có thể được lưu trên máy chủ đám mây đạt chuẩn ISO 27001; nhà cung cấp hạ tầng không có chìa khóa giải mã.",
    ],
  },
  {
    title: "Điều 5. Hậu quả của việc từ chối hoặc rút lại sự đồng ý",
    body: [
      "1. Từ chối ngay từ đầu: Bạn sẽ không thể tham gia tính năng Thi cử. Bạn vẫn có thể dùng các tính năng e-learning.",
      "2. Rút lại khi đang thi: Bài thi sẽ bị đóng cưỡng chế và kết quả không được công nhận.",
      "3. Rút lại sau khi thi xong: Dữ liệu sẽ bị xóa, đồng nghĩa với việc bạn từ bỏ quyền khiếu nại về kết quả bài thi.",
    ],
  },
  {
    title: "Điều 6. Sự cố kỹ thuật và Miễn trừ trách nhiệm",
    body: [
      "1. Hệ thống không chịu trách nhiệm nếu bài thi bị hủy do yếu tố khách quan (camera hỏng, thiếu ánh sáng, mạng gián đoạn).",
      "2. Trong trường hợp Data Breach do nguyên nhân bất khả kháng, chúng tôi sẽ thông báo trong 72 giờ và áp dụng biện pháp khắc phục, nhưng được miễn trừ bồi thường thiệt hại gián tiếp.",
    ],
  },
  {
    title: "Điều 7. Quy trình xử lý yêu cầu (SLA)",
    body: [
      "Yêu cầu trích xuất bản sao dữ liệu: tối đa 10 ngày.",
      "Yêu cầu hạn chế/ngừng xử lý: trong vòng 72 giờ.",
      "Yêu cầu xóa vĩnh viễn dữ liệu: tối đa 20 ngày.",
      "Liên hệ Bộ phận Bảo vệ Dữ liệu (DPO) qua tính năng LIÊN HỆ trên hệ thống.",
    ],
  },
];

function TermsStep({ agreed, setAgreed }: { agreed: boolean; setAgreed: (v: boolean) => void }) {
  return (
    <div className="space-y-4 px-1 py-4">
      <div className="rounded-xl border bg-muted/30 p-4">
        <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-primary">
          Phụ lục
        </div>
        <h3 className="font-display text-base font-semibold text-foreground">
          Chính sách thu thập và xử lý dữ liệu khuôn mặt và Căn cước công dân
        </h3>
        <p className="mt-1 text-xs text-muted-foreground">
          Áp dụng riêng cho tính năng Thi đánh giá nội bộ / Linguaskill Mock Test trên hệ thống REAP English
        </p>
      </div>

      <div className="max-h-72 space-y-4 overflow-y-auto rounded-xl border p-4 text-sm leading-relaxed">
        {POLICY_SECTIONS.map((sec) => (
          <div key={sec.title}>
            <div className="font-semibold text-foreground">{sec.title}</div>
            <div className="mt-1 space-y-1.5 text-muted-foreground">
              {sec.body.map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </div>
          </div>
        ))}
      </div>

      <label className="flex items-start gap-3 rounded-xl border bg-surface p-3 cursor-pointer">
        <Checkbox
          checked={agreed}
          onCheckedChange={(v) => setAgreed(v === true)}
          className="mt-0.5"
        />
        <span className="text-sm text-foreground">
          Tôi đã đọc, hiểu rõ và <strong>đồng ý</strong> với toàn bộ các điều khoản về thu thập, xử lý
          và lưu trữ dữ liệu khuôn mặt &amp; CCCD nêu trên.
        </span>
      </label>
    </div>
  );
}

function ImageUploader({
  label,
  hint,
  icon,
  value,
  onChange,
}: {
  label: string;
  hint: string;
  icon: React.ReactNode;
  value: string;
  onChange: (v: string) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  const onFile = (file?: File | null) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Vui lòng chọn tệp ảnh");
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => onChange(String(e.target?.result ?? ""));
    reader.readAsDataURL(file);
  };

  return (
    <div className="rounded-xl border bg-surface p-3">
      <div className="mb-2 flex items-center gap-2">
        <div className="grid h-8 w-8 place-content-center rounded-lg bg-primary/10 text-primary">
          {icon}
        </div>
        <div>
          <div className="text-sm font-semibold text-foreground">{label}</div>
          <div className="text-[11px] text-muted-foreground">{hint}</div>
        </div>
      </div>
      {value ? (
        <div className="space-y-2">
          <img
            src={value}
            alt={label}
            className="h-40 w-full rounded-lg object-cover ring-1 ring-border"
          />
          <Button
            variant="outline"
            size="sm"
            className="w-full"
            onClick={() => inputRef.current?.click()}
          >
            Chụp / chọn lại
          </Button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="flex h-40 w-full flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-border bg-muted/30 text-muted-foreground transition hover:border-primary hover:text-primary"
        >
          <Upload className="h-5 w-5" />
          <span className="text-xs font-medium">Bấm để tải ảnh lên</span>
        </button>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture="environment"
        hidden
        onChange={(e) => onFile(e.target.files?.[0])}
      />
    </div>
  );
}

function CccdStep({
  cccdFront,
  cccdBack,
  setCccdFront,
  setCccdBack,
}: {
  cccdFront: string;
  cccdBack: string;
  setCccdFront: (v: string) => void;
  setCccdBack: (v: string) => void;
}) {
  return (
    <div className="space-y-3 px-1 py-4">
      <p className="text-sm text-muted-foreground">
        Vui lòng chụp rõ nét mặt trước và mặt sau của Căn cước công dân (còn hiệu lực).
      </p>
      <div className="grid gap-3 sm:grid-cols-2">
        <ImageUploader
          label="Mặt trước CCCD"
          hint="Hiển thị ảnh chân dung & thông tin"
          icon={<IdCard className="h-4 w-4" />}
          value={cccdFront}
          onChange={setCccdFront}
        />
        <ImageUploader
          label="Mặt sau CCCD"
          hint="Hiển thị mã QR & ngày cấp"
          icon={<IdCard className="h-4 w-4" />}
          value={cccdBack}
          onChange={setCccdBack}
        />
      </div>
    </div>
  );
}

function FaceStep({
  faceImage,
  setFaceImage,
}: {
  faceImage: string;
  setFaceImage: (v: string) => void;
}) {
  return (
    <div className="space-y-3 px-1 py-4">
      <p className="text-sm text-muted-foreground">
        Hãy chụp ảnh khuôn mặt của bạn trong điều kiện ánh sáng tốt, không đeo khẩu trang hoặc kính
        râm. Ảnh này sẽ được dùng để đối chiếu với CCCD.
      </p>
      <ImageUploader
        label="Ảnh khuôn mặt thực tế"
        hint="Nhìn thẳng vào camera, lộ rõ toàn bộ khuôn mặt"
        icon={<Camera className="h-4 w-4" />}
        value={faceImage}
        onChange={setFaceImage}
      />
    </div>
  );
}

function ReviewStep({
  cccdFront,
  cccdBack,
  faceImage,
}: {
  cccdFront: string;
  cccdBack: string;
  faceImage: string;
}) {
  const items = useMemo(
    () => [
      { label: "Mặt trước CCCD", src: cccdFront },
      { label: "Mặt sau CCCD", src: cccdBack },
      { label: "Khuôn mặt", src: faceImage },
    ],
    [cccdFront, cccdBack, faceImage],
  );
  return (
    <div className="space-y-3 px-1 py-4">
      <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-3 text-sm text-foreground">
        <div className="flex items-center gap-2 font-semibold">
          <ShieldCheck className="h-4 w-4 text-emerald-600" />
          Vui lòng kiểm tra lại trước khi xác nhận
        </div>
        <p className="mt-1 text-xs text-muted-foreground">
          Sau khi hoàn tất, hệ thống sẽ thực hiện đối chiếu eKYC và cho phép bạn vào phòng thi.
        </p>
      </div>
      <div className="grid gap-3 sm:grid-cols-3">
        {items.map((it) => (
          <div key={it.label} className="rounded-xl border bg-surface p-2">
            <img
              src={it.src}
              alt={it.label}
              className="h-32 w-full rounded-lg object-cover ring-1 ring-border"
            />
            <div className="mt-2 text-center text-xs font-medium text-foreground">
              {it.label}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
