import { questionBank, type QSkill, type QType, type QLevel, type QDifficulty, type BankQuestion } from "./question-bank";

export type CustomQuestion = {
  id: string;
  content: string;
  type: QType;
  level: QLevel;
  difficulty: QDifficulty;
  points: number;
  options?: string[];
  correctAnswer?: string;
  /** Bài mẫu tham khảo cho câu hỏi tự luận. */
  solution?: string;
  /** Dàn ý gợi ý cho giáo viên dựa vào chấm điểm. */
  outline?: string;
  /** Rubric chấm tự động cho essay. */
  feedback?: { keyword: string; comment: string }[];
};


export type TestStructureItem = {
  skill: QSkill;
  /** Loại câu hỏi cụ thể, hoặc "mixed" để bốc trộn nhiều dạng. */
  type: QType | "mixed";
  level: QLevel;
  count: number;
  /** "mixed" = không giới hạn độ khó (bốc trộn). */
  difficulty?: QDifficulty | "mixed";
  /** Lọc theo tag (any-match): câu hỏi cần có ít nhất 1 tag trong danh sách. */
  tags?: string[];
  /** Giới hạn thời gian làm phần này (phút). Bỏ trống = dùng chung tổng thời lượng. */
  sectionDurationMinutes?: number;

  /** Câu hỏi đã chọn thủ công (mode fixed). */
  pickedIds?: string[];
  /** Câu hỏi do người dùng tự soạn (mode manual). */
  customQuestions?: CustomQuestion[];
  /** Câu hỏi tự soạn dạng BankQuestion (hỗ trợ đầy đủ form như ngân hàng câu hỏi). */
  customBank?: BankQuestion[];
};

export type TestApprovalStatus = "draft" | "pending" | "approved";

export type Test = {
  id: string;
  /** Mã đề hiển thị (VD: FLYER-NB-TEST). */
  code?: string;
  /** Các mã đề con / mã đề thay thế (nếu có nhiều phiên bản). */
  altCodes?: string[];
  name: string;
  description: string;
  /** Đơn vị (trường / trung tâm) mà bài thi thuộc về. */
  orgId?: string;
  classIds: string[];
  level: QLevel;
  durationMinutes: number;
  openAt: string;
  closeAt: string;
  mode: "fixed" | "random";
  structure: TestStructureItem[];
  registered: number;
  submitted: number;
  graded: number;
  avgScore?: number;
  createdAt: string;
  /** Nếu được tạo bằng cách sao chép từ bài khác. */
  copiedFromId?: string;
  /** Người tạo đề (mã / tên). Dùng để chặn tự duyệt đề của chính mình. */
  createdBy?: string;
  /** Tên hiển thị của người đề xuất đề. */
  createdByName?: string;
  /** Vai trò người đề xuất: giáo viên hoặc admin. */
  createdByRole?: "teacher" | "admin";
  /** Đơn vị của người đề xuất (có thể khác đơn vị của đề). */
  createdByOrgId?: string;
  /** Ghi chú của giáo viên khi gửi đề xuất. */
  proposalNote?: string;
  /** Trạng thái duyệt (nháp / chờ duyệt / đã duyệt). */
  approvalStatus?: TestApprovalStatus;
  reviewedBy?: string;
  reviewedAt?: string;
  reviewNote?: string;
};

export type ProctorEventType =
  | "tab-switch"
  | "window-blur"
  | "leave-seat"
  | "multiple-faces"
  | "no-face"
  | "different-face"
  | "copy-paste"
  | "fullscreen-exit"
  | "network-drop";

export type ProctorEvent = {
  at: string; // ISO timestamp
  type: ProctorEventType;
  severity: "low" | "medium" | "high";
  detail?: string;
};

export type TestSubmission = {
  id: string;
  testId: string;
  studentName: string;
  studentClass: string;
  startedAt: string;
  submittedAt?: string;
  durationMinutes?: number;
  autoScore: number;
  manualScore?: number;
  finalScore?: number;
  status: "in-progress" | "auto-graded" | "needs-grading" | "graded";
  /** Lượt làm thứ mấy của học viên trên cùng một đề (mặc định 1). */
  attemptNo?: number;
  /** Số lượt tối đa được phép cho đề này (null/undefined = không giới hạn). */
  attemptsAllowed?: number | null;
  proctorEvents?: ProctorEvent[];
  answers: {

    questionId: string;
    question: string;
    type: "mcq" | "essay" | "short" | "tf";
    skill?: "reading" | "listening" | "writing" | "speaking" | "vocabulary" | "grammar";
    studentAnswer: string;
    studentAudioUrl?: string;
    correctAnswer?: string;
    points: number;
    awarded?: number;
    feedback?: string;
    rubric?: { criterion: string; max: number; awarded?: number; note?: string }[];
  }[];
};

const now = Date.now();
const days = (d: number) => new Date(now + d * 86400000).toISOString();

export const tests: Test[] = [
  {
    id: "test-1",
    name: "Kiểm tra giữa kỳ B1 — Tháng 5",
    description: "Bài kiểm tra giữa kỳ tổng hợp Reading + Listening + Writing.",
    orgId: "org-unicom-hcm",
    classIds: ["cls-b1-fast"],
    level: "B1",
    durationMinutes: 90,
    openAt: days(-3),
    closeAt: days(-1),
    mode: "random",
    structure: [
      { skill: "reading", type: "mcq", level: "B1", count: 10 },
      { skill: "listening", type: "mcq", level: "B1", count: 8 },
      { skill: "writing", type: "essay", level: "B1", count: 1 },
      { skill: "reading", type: "fill", level: "B1", count: 6 },
    ],
    registered: 10,
    submitted: 9,
    graded: 6,
    avgScore: 7.4,
    createdAt: days(-10),
    code: "B1-MID-05",
    altCodes: ["B1-MID-05-A", "B1-MID-05-B", "B1-MID-05-C"],
    createdBy: "admin.hoa",
    approvalStatus: "approved",
    reviewedBy: "admin.dung",
    reviewedAt: days(-9),
  },
  {
    id: "test-2",
    name: "Quiz Unit 3 — A1 Morning Stars",
    description: "Quiz nhỏ kiểm tra từ vựng và ngữ pháp Unit 3.",
    orgId: "org-unicom-hn",
    classIds: ["cls-a1-morning"],
    level: "A1",
    durationMinutes: 30,
    openAt: days(1),
    closeAt: days(2),
    mode: "fixed",
    structure: [
      { skill: "reading", type: "mcq", level: "A1", count: 10 },
      { skill: "reading", type: "tf", level: "A1", count: 5 },
    ],
    registered: 14,
    submitted: 0,
    graded: 0,
    createdAt: days(-2),
    code: "A1-QUIZ-U3",
    createdBy: "admin.linh",
    approvalStatus: "pending",
  },
  {
    id: "test-3",
    name: "Đề thi cuối khóa A2 — Weekend Boost",
    description: "Đề thi cuối khóa 4 kỹ năng.",
    orgId: "org-unicom-hcm",
    classIds: ["cls-a2-weekend"],
    level: "A2",
    durationMinutes: 120,
    openAt: days(7),
    closeAt: days(8),
    mode: "random",
    structure: [
      { skill: "reading", type: "mcq", level: "A2", count: 15 },
      { skill: "listening", type: "mcq", level: "A2", count: 10 },
      { skill: "writing", type: "essay", level: "A2", count: 2 },
      { skill: "speaking", type: "short", level: "A2", count: 3 },
    ],
    registered: 16,
    submitted: 0,
    graded: 0,
    createdAt: days(-1),
    code: "A2-FIN-WKB",
    createdBy: "admin.linh",
    approvalStatus: "approved",
    reviewedBy: "admin.dung",
    reviewedAt: days(-1),
  },
  {
    id: "test-4",
    name: "Mock Test B1 — Evening Pro",
    description: "Bài thi thử mô phỏng đề thi chuẩn B1.",
    orgId: "org-thpt-abc",
    classIds: ["cls-b1-evening"],
    level: "B1",
    durationMinutes: 100,
    openAt: days(-1),
    closeAt: days(3),
    mode: "random",
    structure: [
      { skill: "reading", type: "mcq", level: "B1", count: 12 },
      { skill: "listening", type: "mcq", level: "B1", count: 10 },
      { skill: "reading", type: "fill", level: "B1", count: 5 },
      { skill: "writing", type: "essay", level: "B1", count: 1 },
    ],
    registered: 13,
    submitted: 5,
    graded: 2,
    avgScore: 6.8,
    createdAt: days(-4),
    code: "B1-MOCK-EVE",
    altCodes: ["B1-MOCK-EVE-A", "B1-MOCK-EVE-B"],
    createdBy: "admin.hoa",
    approvalStatus: "draft",
  },
  {
    id: "test-1-sim-1700000001",
    name: "Kiểm tra giữa kỳ B1 — Tháng 5 — Bản tương tự 1",
    description: "Bản tương tự (đổi câu hỏi, giữ cấu trúc & độ khó).",
    orgId: "org-unicom-hcm",
    classIds: ["cls-b1-fast"],
    level: "B1",
    durationMinutes: 90,
    openAt: days(-3),
    closeAt: days(-1),
    mode: "random",
    structure: [
      { skill: "reading", type: "mcq", level: "B1", count: 10 },
      { skill: "listening", type: "mcq", level: "B1", count: 8 },
      { skill: "writing", type: "essay", level: "B1", count: 1 },
      { skill: "reading", type: "fill", level: "B1", count: 6 },
    ],
    registered: 10,
    submitted: 8,
    graded: 5,
    avgScore: 7.1,
    createdAt: days(-9),
  },
  {
    id: "test-1-sim-1700000002",
    name: "Kiểm tra giữa kỳ B1 — Tháng 5 — Bản tương tự 2",
    description: "Bản tương tự (đổi câu hỏi, giữ cấu trúc & độ khó).",
    orgId: "org-unicom-hcm",
    classIds: ["cls-b1-fast"],
    level: "B1",
    durationMinutes: 90,
    openAt: days(-3),
    closeAt: days(-1),
    mode: "random",
    structure: [
      { skill: "reading", type: "mcq", level: "B1", count: 10 },
      { skill: "listening", type: "mcq", level: "B1", count: 8 },
      { skill: "writing", type: "essay", level: "B1", count: 1 },
      { skill: "reading", type: "fill", level: "B1", count: 6 },
    ],
    registered: 10,
    submitted: 7,
    graded: 4,
    avgScore: 6.9,
    createdAt: days(-8),
  },
  {
    id: "test-4-sim-1700000003",
    name: "Mock Test B1 — Evening Pro — Bản tương tự 1",
    description: "Bản tương tự (đổi câu hỏi, giữ cấu trúc & độ khó).",
    orgId: "org-thpt-abc",
    classIds: ["cls-b1-evening"],
    level: "B1",
    durationMinutes: 100,
    openAt: days(-1),
    closeAt: days(3),
    mode: "random",
    structure: [
      { skill: "reading", type: "mcq", level: "B1", count: 12 },
      { skill: "listening", type: "mcq", level: "B1", count: 10 },
      { skill: "reading", type: "fill", level: "B1", count: 5 },
      { skill: "writing", type: "essay", level: "B1", count: 1 },
    ],
    registered: 13,
    submitted: 4,
    graded: 2,
    avgScore: 7.0,
    createdAt: days(-3),
  },
  // ————— Đề do giáo viên đề xuất, chờ admin duyệt —————
  {
    id: "test-prop-1",
    name: "Flyers Progress Test — Unit 5",
    description:
      "Đề kiểm tra tiến độ sau Unit 5, tập trung Reading & Listening, có 1 phần Writing ngắn.",
    orgId: "org-unicom-hn",
    classIds: ["cls-a1-morning"],
    level: "A1",
    durationMinutes: 45,
    openAt: days(3),
    closeAt: days(4),
    mode: "fixed",
    structure: [
      { skill: "reading", type: "mcq", level: "A1", count: 12, difficulty: "easy" },
      { skill: "listening", type: "mcq", level: "A1", count: 8, difficulty: "easy" },
      { skill: "reading", type: "fill", level: "A1", count: 5, difficulty: "medium" },
      { skill: "writing", type: "essay", level: "A1", count: 1, difficulty: "medium" },
    ],
    registered: 14,
    submitted: 0,
    graded: 0,
    createdAt: days(-1),
    code: "FLYER-U5-PT",
    createdBy: "gv.mai",
    createdByName: "Nguyễn Thị Mai",
    createdByRole: "teacher",
    createdByOrgId: "org-unicom-hn",
    proposalNote:
      "Đề dùng cho lớp A1 Morning Stars, nhờ thầy/cô duyệt trước ngày mở để em kịp thông báo học viên.",
    approvalStatus: "pending",
  },
  {
    id: "test-prop-2",
    name: "B2 Speaking & Writing Checkpoint",
    description: "Đề đánh giá 2 kỹ năng sản sinh, chấm theo rubric CEFR B1–B2.",
    orgId: "org-unicom-hcm",
    classIds: ["cls-b1-fast"],
    level: "B2",
    durationMinutes: 60,
    openAt: days(5),
    closeAt: days(6),
    mode: "fixed",
    structure: [
      { skill: "writing", type: "essay", level: "B2", count: 2, difficulty: "hard" },
      { skill: "speaking", type: "short", level: "B2", count: 3, difficulty: "medium" },
    ],
    registered: 12,
    submitted: 0,
    graded: 0,
    createdAt: days(-2),
    code: "B2-SPW-CP",
    createdBy: "gv.tuan",
    createdByName: "Trần Anh Tuấn",
    createdByRole: "teacher",
    createdByOrgId: "org-unicom-hcm",
    proposalNote: "Cần duyệt sớm để chuẩn bị phòng thi Speaking.",
    approvalStatus: "pending",
  },
  {
    id: "test-prop-3",
    name: "A2 Grammar Booster Test",
    description: "Đề tổng hợp ngữ pháp A2 dành cho lớp cuối tuần.",
    orgId: "org-thpt-abc",
    classIds: ["cls-b1-evening"],
    level: "A2",
    durationMinutes: 40,
    openAt: days(8),
    closeAt: days(9),
    mode: "random",
    structure: [
      { skill: "reading", type: "mcq", level: "A2", count: 20, difficulty: "mixed" },
      { skill: "reading", type: "fill", level: "A2", count: 10, difficulty: "medium" },
    ],
    registered: 18,
    submitted: 0,
    graded: 0,
    createdAt: days(-4),
    code: "A2-GRM-BST",
    createdBy: "gv.hanh",
    createdByName: "Lê Thị Hạnh",
    createdByRole: "teacher",
    createdByOrgId: "org-thpt-abc",
    approvalStatus: "pending",
  },
  {
    id: "test-prop-4",
    name: "B1 Listening Lab Quiz 02",
    description: "Quiz nghe ngắn theo Unit 7 của B1 Listening & Speaking Labs.",
    orgId: "org-unicom-hcm",
    classIds: ["cls-a2-weekend"],
    level: "B1",
    durationMinutes: 25,
    openAt: days(-1),
    closeAt: days(6),
    mode: "fixed",
    structure: [
      { skill: "listening", type: "mcq", level: "B1", count: 10, difficulty: "medium" },
      { skill: "listening", type: "tf", level: "B1", count: 5, difficulty: "easy" },
    ],
    registered: 16,
    submitted: 3,
    graded: 1,
    createdAt: days(-6),
    code: "B1-LIS-Q02",
    createdBy: "gv.mai",
    createdByName: "Nguyễn Thị Mai",
    createdByRole: "teacher",
    createdByOrgId: "org-unicom-hn",
    approvalStatus: "approved",
    reviewedBy: "admin.dung",
    reviewedAt: days(-5),
  },
  {
    id: "test-prop-5",
    name: "A1 Vocabulary Spot Check",
    description: "Đề nhỏ kiểm tra từ vựng, đã bị trả lại vì thiếu phần đáp án mẫu.",
    orgId: "org-unicom-hn",
    classIds: ["cls-a1-evening"],
    level: "A1",
    durationMinutes: 20,
    openAt: days(4),
    closeAt: days(5),
    mode: "fixed",
    structure: [{ skill: "reading", type: "mcq", level: "A1", count: 15, difficulty: "easy" }],
    registered: 11,
    submitted: 0,
    graded: 0,
    createdAt: days(-7),
    code: "A1-VOC-SC",
    createdBy: "gv.hanh",
    createdByName: "Lê Thị Hạnh",
    createdByRole: "teacher",
    createdByOrgId: "org-thpt-abc",
    approvalStatus: "draft",
    reviewedBy: "admin.dung",
    reviewedAt: days(-6),
    reviewNote: "Bổ sung đáp án mẫu cho 3 câu cuối và tăng thời lượng lên 25 phút.",
  },
];

export const testSubmissions: TestSubmission[] = [
  {
    id: "ts-1",
    testId: "test-1",
    studentName: "Nguyễn Minh Anh",
    studentClass: "B1 — Fastrack",
    startedAt: days(-3),
    submittedAt: days(-3),
    durationMinutes: 82,
    autoScore: 18,
    manualScore: 4,
    finalScore: 22,
    status: "graded",
    proctorEvents: [
      { at: new Date(now - 3 * 86400000 + 12 * 60000).toISOString(), type: "tab-switch", severity: "medium", detail: "Chuyển sang tab khác trong 8 giây" },
      { at: new Date(now - 3 * 86400000 + 27 * 60000).toISOString(), type: "window-blur", severity: "low", detail: "Cửa sổ thi mất focus 3 giây" },
      { at: new Date(now - 3 * 86400000 + 55 * 60000).toISOString(), type: "no-face", severity: "medium", detail: "Không phát hiện khuôn mặt trong 12 giây" },
    ],
    answers: [
      {
        questionId: "Q0001",
        question: "[B1] Read the passage and choose the main idea.",
        type: "mcq",
        studentAnswer: "A",
        correctAnswer: "A",
        points: 1,
        awarded: 1,
      },
      {
        questionId: "Q0050",
        question: "[B1] Write a short paragraph (80-100 words) about your hobbies.",
        type: "essay",
        skill: "writing",
        studentAnswer:
          "I really enjoy playing guitar. I started learning when I was 12 and now I play in a small band. We practice every Saturday and sometimes perform at school events. Music helps me relax and express myself.",
        points: 5,
        awarded: 4,
        feedback: "Tốt, ý mạch lạc. Cần đa dạng cấu trúc câu hơn.",
        rubric: [
          { criterion: "Nội dung & ý tưởng (Task achievement)", max: 1.5, awarded: 1.25 },
          { criterion: "Tổ chức & mạch lạc (Coherence)", max: 1.0, awarded: 0.75 },
          { criterion: "Từ vựng (Lexical resource)", max: 1.0, awarded: 1.0 },
          { criterion: "Ngữ pháp & độ chính xác", max: 1.5, awarded: 1.0 },
        ],
      },
      {
        questionId: "Q0080",
        question: "[B1] Speaking Part 1: Describe your most memorable trip in 1-2 minutes.",
        type: "short",
        skill: "speaking",
        studentAnswer: "(Bản ghi âm 1'45) — học viên kể về chuyến đi Đà Nẵng cùng gia đình.",
        studentAudioUrl: "/audio/sample-speaking.mp3",
        points: 5,
        awarded: 4,
        feedback: "Phát âm rõ, ý mạch lạc. Chú ý nhấn trọng âm 'family', 'memorable'.",
      },
      {
        questionId: "Q0082",
        question:
          "[B1] Speaking Part 2 (Picture description): Look at the picture of a busy market and describe what you see in 60-90 seconds.",
        type: "short",
        skill: "speaking",
        studentAnswer:
          "(Bản ghi âm 1'05) — học viên miêu tả khu chợ truyền thống: gian hàng rau củ, người mua kẻ bán, không khí nhộn nhịp.",
        studentAudioUrl: "/audio/sample-speaking-picture.mp3",
        points: 5,
        awarded: 4.25,
        feedback: "Miêu tả chi tiết tốt, ý phong phú. Cần thêm từ nối để mạch lạc hơn.",
      },

    ],
  },
  {
    id: "ts-2",
    testId: "test-1",
    studentName: "Trần Hữu Phúc",
    studentClass: "B1 — Fastrack",
    startedAt: days(-3),
    submittedAt: days(-3),
    durationMinutes: 88,
    autoScore: 16,
    manualScore: 3,
    finalScore: 19,
    status: "graded",
    proctorEvents: [
      { at: new Date(now - 3 * 86400000 + 5 * 60000).toISOString(), type: "fullscreen-exit", severity: "high", detail: "Thoát chế độ toàn màn hình" },
      { at: new Date(now - 3 * 86400000 + 6 * 60000).toISOString(), type: "tab-switch", severity: "high", detail: "Chuyển tab 22 giây" },
      { at: new Date(now - 3 * 86400000 + 14 * 60000).toISOString(), type: "multiple-faces", severity: "high", detail: "Phát hiện 2 khuôn mặt trong khung hình" },
      { at: new Date(now - 3 * 86400000 + 30 * 60000).toISOString(), type: "different-face", severity: "high", detail: "Khuôn mặt khác với ảnh đăng ký" },
      { at: new Date(now - 3 * 86400000 + 41 * 60000).toISOString(), type: "leave-seat", severity: "medium", detail: "Rời khỏi vị trí 45 giây" },
      { at: new Date(now - 3 * 86400000 + 62 * 60000).toISOString(), type: "copy-paste", severity: "medium", detail: "Dán nội dung dài (320 ký tự) vào ô trả lời" },
      { at: new Date(now - 3 * 86400000 + 70 * 60000).toISOString(), type: "tab-switch", severity: "medium", detail: "Chuyển tab 10 giây" },
    ],
    answers: [
      {
        questionId: "Q0001",
        question: "[B1] Read the passage and choose the main idea.",
        type: "mcq",
        studentAnswer: "B",
        correctAnswer: "A",
        points: 1,
        awarded: 0,
      },
      {
        questionId: "Q0050",
        question: "[B1] Write a short paragraph (80-100 words) about your hobbies.",
        type: "essay",
        skill: "writing",
        studentAnswer:
          "My hobby is cooking. I learn from YouTube and cook for my family every weekend. My favorite dish is phở bò.",
        points: 5,
        awarded: 3,
        feedback: "Ý ngắn, cần phát triển thêm chi tiết và ví dụ.",
        rubric: [
          { criterion: "Nội dung & ý tưởng (Task achievement)", max: 1.5, awarded: 0.75 },
          { criterion: "Tổ chức & mạch lạc (Coherence)", max: 1.0, awarded: 0.75 },
          { criterion: "Từ vựng (Lexical resource)", max: 1.0, awarded: 0.75 },
          { criterion: "Ngữ pháp & độ chính xác", max: 1.5, awarded: 0.75 },
        ],
      },
    ],
  },

  {
    id: "ts-3",
    testId: "test-1",
    studentName: "Lê Thị Hương",
    studentClass: "B1 — Fastrack",
    startedAt: days(-3),
    submittedAt: days(-3),
    durationMinutes: 90,
    autoScore: 22,
    manualScore: 9,
    finalScore: 31,
    status: "graded",
    proctorEvents: [
      { at: new Date(now - 3 * 86400000 + 18 * 60000).toISOString(), type: "network-drop", severity: "low", detail: "Mất kết nối 4 giây rồi kết nối lại" },
    ],
    answers: [
      {
        questionId: "Q0001",
        question: "[B1] Read the passage and choose the main idea.",
        type: "mcq",
        studentAnswer: "A",
        correctAnswer: "A",
        points: 1,
        awarded: 1,
      },
      {
        questionId: "Q0050",
        question: "[B1] Write a short paragraph (80-100 words) about your hobbies.",
        type: "essay",
        skill: "writing",
        studentAnswer:
          "I love reading books, especially historical novels. Reading takes me to different worlds and times. I read at least one book per month.",
        points: 5,
        awarded: 4.5,
        feedback: "Diễn đạt rõ ràng, ý mạch lạc. Cần thêm ví dụ cụ thể.",
        rubric: [
          { criterion: "Nội dung & ý tưởng (Task achievement)", max: 1.5, awarded: 1.25 },
          { criterion: "Tổ chức & mạch lạc (Coherence)", max: 1.0, awarded: 1.0 },
          { criterion: "Từ vựng (Lexical resource)", max: 1.0, awarded: 1.0 },
          { criterion: "Ngữ pháp & độ chính xác", max: 1.5, awarded: 1.25 },
        ],
      },
      {
        questionId: "Q0081",
        question: "[B1] Speaking: Talk about a person who has influenced you.",
        type: "short",
        skill: "speaking",
        studentAnswer: "(Bản ghi âm 1'30) — học viên kể về người thầy chủ nhiệm cấp 3.",
        studentAudioUrl: "/audio/sample-speaking-2.mp3",
        points: 5,
        awarded: 4.5,
        feedback: "Phát âm tốt, ý cảm xúc. Lưu ý phát âm 'influenced' và 'memorable'.",
        rubric: [
          { criterion: "Phát âm (Pronunciation)", max: 1.25, awarded: 1.0 },
          { criterion: "Lưu loát (Fluency)", max: 1.25, awarded: 1.25 },
          { criterion: "Từ vựng (Vocabulary)", max: 1.25, awarded: 1.25 },
          { criterion: "Ngữ pháp (Grammar)", max: 1.25, awarded: 1.0 },

        ],
      },
    ],
  },
];

/* ------------------------------------------------------------------ */
/* Demo: một học viên làm cùng một đề nhiều lượt                       */
/* ------------------------------------------------------------------ */

const attemptBase = testSubmissions.find((s) => s.id === "ts-1")!;
attemptBase.attemptNo = 3;
attemptBase.attemptsAllowed = 3;

function makeEarlierAttempt(opts: {
  id: string;
  attemptNo: number;
  daysAgo: number;
  factor: number;
  durationMinutes: number;
  status: TestSubmission["status"];
  wrongMcq?: boolean;
  highWarnings?: number;
}): TestSubmission {
  const at = (min: number) =>
    new Date(now - opts.daysAgo * 86400000 + min * 60000).toISOString();
  const answers = attemptBase.answers.map((a) => {
    const raw = (a.awarded ?? 0) * opts.factor;
    const awarded =
      a.points <= 1
        ? opts.wrongMcq
          ? 0
          : (a.awarded ?? 0)
        : Math.round(raw * 4) / 4;
    const graded = opts.status === "graded" || a.points <= 1;
    return {
      ...a,
      studentAnswer:
        a.points <= 1 && opts.wrongMcq ? "C" : a.studentAnswer,
      awarded: graded ? awarded : undefined,
      feedback: graded
        ? opts.factor < 0.6
          ? "Bài còn nhiều lỗi cơ bản, ý chưa phát triển đủ. Cần luyện thêm cấu trúc câu."
          : "Có tiến bộ rõ so với lượt trước. Chú ý dùng từ nối và kiểm tra thời của động từ."
        : undefined,
      rubric: a.rubric?.map((r) => ({
        ...r,
        awarded: graded ? Math.round(r.max * opts.factor * 4) / 4 : undefined,
      })),
    };
  });
  const earned = answers.reduce((s, a) => s + (a.awarded ?? 0), 0);
  const autoScore = answers
    .filter((a) => a.type === "mcq" || a.type === "tf")
    .reduce((s, a) => s + (a.awarded ?? 0), 0);
  const proctorEvents: ProctorEvent[] = [
    { at: at(9), type: "window-blur", severity: "low", detail: "Cửa sổ thi mất focus 4 giây" },
    { at: at(24), type: "tab-switch", severity: "medium", detail: "Chuyển sang tab khác trong 11 giây" },
  ];
  for (let i = 0; i < (opts.highWarnings ?? 0); i++) {
    proctorEvents.push({
      at: at(35 + i * 12),
      type: i % 2 === 0 ? "fullscreen-exit" : "multiple-faces",
      severity: "high",
      detail: i % 2 === 0 ? "Thoát chế độ toàn màn hình" : "Phát hiện 2 khuôn mặt trong khung hình",
    });
  }
  return {
    ...attemptBase,
    id: opts.id,
    attemptNo: opts.attemptNo,
    attemptsAllowed: 3,
    startedAt: at(0),
    submittedAt: at(opts.durationMinutes),
    durationMinutes: opts.durationMinutes,
    autoScore,
    manualScore: opts.status === "graded" ? Math.round((earned - autoScore) * 10) / 10 : undefined,
    finalScore: opts.status === "graded" ? Math.round(earned * 10) / 10 : undefined,
    status: opts.status,
    proctorEvents,
    answers,
  };
}

testSubmissions.splice(
  testSubmissions.indexOf(attemptBase),
  0,
  makeEarlierAttempt({
    id: "ts-1-a1",
    attemptNo: 1,
    daysAgo: 24,
    factor: 0.45,
    durationMinutes: 95,
    status: "graded",
    wrongMcq: true,
    highWarnings: 2,
  }),
  makeEarlierAttempt({
    id: "ts-1-a2",
    attemptNo: 2,
    daysAgo: 12,
    factor: 0.75,
    durationMinutes: 88,
    status: "graded",
  }),
);

/** Tất cả các lượt làm của cùng một học viên trên cùng một đề (lượt 1 → n). */
export function attemptsOfSubmission(sub: TestSubmission) {
  return testSubmissions
    .filter((s) => s.testId === sub.testId && s.studentName === sub.studentName)
    .sort(
      (a, b) =>
        (a.attemptNo ?? 1) - (b.attemptNo ?? 1) ||
        new Date(a.startedAt).getTime() - new Date(b.startedAt).getTime(),
    );
}

export function submissionScore(sub: TestSubmission) {
  const total = sub.answers.reduce((s, a) => s + a.points, 0);
  const awarded = sub.answers.reduce((s, a) => s + (a.awarded ?? 0), 0);
  const earned = Math.min(total, sub.finalScore ?? awarded);
  return { total, earned, pct: total > 0 ? Math.round((earned / total) * 100) : 0 };
}

export function getTest(id: string) {
  return tests.find((t) => t.id === id);
}

export function getTestSubmissions(testId: string) {
  return testSubmissions.filter((s) => s.testId === testId);
}

export function testStatus(t: Test): "upcoming" | "open" | "closed" {
  const n = Date.now();
  if (n < new Date(t.openAt).getTime()) return "upcoming";
  if (n > new Date(t.closeAt).getTime()) return "closed";
  return "open";
}

export type TestDisplayStatus =
  | "draft"
  | "pending"
  | "approved"
  | "open"
  | "closed";

export const TEST_STATUS_LABEL: Record<TestDisplayStatus, string> = {
  draft: "Bản nháp",
  pending: "Chờ duyệt",
  approved: "Đã duyệt",
  open: "Đang mở",
  closed: "Đã đóng",
};

export function testDisplayStatus(t: Test): TestDisplayStatus {
  const approval = t.approvalStatus ?? "approved";
  if (approval === "draft") return "draft";
  if (approval === "pending") return "pending";
  const s = testStatus(t);
  if (s === "upcoming") return "approved";
  if (s === "open") return "open";
  return "closed";
}

/** Tổng số lượt hoạt động của một đề (đăng ký / nộp bài). */
export function testActivityCount(t: Test): number {
  return t.registered + t.submitted;
}


export function approveTest(id: string, reviewer: string, note?: string) {
  const t = tests.find((x) => x.id === id);
  if (!t) return;
  t.approvalStatus = "approved";
  t.reviewedBy = reviewer;
  t.reviewedAt = new Date().toISOString();
  if (note) t.reviewNote = note;
}

export function sendBackTest(id: string, reviewer: string, note?: string) {
  const t = tests.find((x) => x.id === id);
  if (!t) return;
  t.approvalStatus = "draft";
  t.reviewedBy = reviewer;
  t.reviewedAt = new Date().toISOString();
  if (note) t.reviewNote = note;
}

/** Danh sách đề do giáo viên đề xuất (mọi trạng thái duyệt). */
export function teacherProposedTests(): Test[] {
  return tests.filter((t) => t.createdByRole === "teacher");
}

/** Số đề đang chờ duyệt (dùng cho badge menu). */
export function pendingApprovalCount(): number {
  return teacherProposedTests().filter((t) => t.approvalStatus === "pending").length;
}

/** Tổng số câu hỏi của một đề (theo cấu trúc đã tạo). */
export function testQuestionCount(t: Test): number {
  return t.structure.reduce((s, x) => s + x.count, 0);
}

/** Tổng điểm của một đề (ưu tiên điểm câu hỏi đã soạn/chọn, mặc định 1 điểm/câu). */
export function testTotalPoints(t: Test): number {
  return t.structure.reduce((sum, item) => {
    const custom = [
      ...(item.customQuestions ?? []).map((q) => q.points ?? 1),
      ...(item.customBank ?? []).map((q) => q.points ?? 1),
    ];
    if (custom.length > 0) {
      const extra = Math.max(0, item.count - custom.length);
      return sum + custom.reduce((a, b) => a + b, 0) + extra;
    }
    if (item.pickedIds?.length) {
      const picked = item.pickedIds.map(
        (id) => questionBank.find((q) => q.id === id)?.points ?? 1,
      );
      const extra = Math.max(0, item.count - picked.length);
      return sum + picked.reduce((a, b) => a + b, 0) + extra;
    }
    return sum + item.count;
  }, 0);
}
