export type QSkill = "listening" | "reading" | "writing" | "speaking";
export type QType =
  | "mcq"
  | "mcq-multi"
  | "tf"
  | "short"
  | "sequence"
  | "matching"
  | "fill"
  | "select-lists"
  | "drag-drop"
  | "essay";
export type QLevel = "A1" | "A2" | "B1" | "B2" | "C1" | "C2";

export type QDifficulty = "easy" | "medium" | "hard";

export type FeedbackCriterion = {
  keyword: string;
  comment: string;
};

/** Spec cho 1 chỗ trống (dùng cho fill / select-lists / drag-drop). */
export type BlankSpec = {
  index: number;
  /** Đáp án chấp nhận (fill / drag-drop). */
  answers: string[];
  /** Tùy chọn cho select-lists (text only). */
  options?: string[];
  /** Index đáp án đúng trong options (select-lists). */
  correctOption?: number;
};

export type BankQuestion = {
  id: string;
  content: string;
  skill: QSkill;
  type: QType;
  level: QLevel;
  difficulty: QDifficulty;
  points: number;
  tags: string[];
  createdAt: string;
  options?: string[];
  correctAnswer?: string;
  solution?: string;
  feedback?: FeedbackCriterion[];
  /** Audio đính kèm câu hỏi (optional). */
  audioUrl?: string;
  /** Ảnh kèm từng option (cùng index với options). */
  optionImages?: (string | undefined)[];
  /** Đề bài có chỗ trống — fill / select-lists / drag-drop. */
  passage?: string;
  /** Spec các chỗ trống. */
  blanks?: BlankSpec[];
  /** Chế độ kéo thả: "words" hoặc "passages". */
  dragMode?: "words" | "passages";
};

export const DIFFICULTY_LABEL: Record<QDifficulty, string> = {
  easy: "Dễ",
  medium: "Trung bình",
  hard: "Khó",
};

export const DIFFICULTY_COLOR: Record<QDifficulty, string> = {
  easy: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  medium: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  hard: "bg-rose-500/10 text-rose-600 dark:text-rose-400",
};

export const SKILL_LABEL: Record<QSkill, string> = {
  listening: "Nghe",
  reading: "Đọc",
  writing: "Viết",
  speaking: "Nói",
};

export const TYPE_LABEL: Record<QType, string> = {
  mcq: "Multiple Choice",
  "mcq-multi": "Multiple Response",
  tf: "True / False",
  short: "Short Answer",
  sequence: "Sequence",
  matching: "Matching",
  fill: "Fill in the Blanks",
  "select-lists": "Select from Lists",
  "drag-drop": "Drag and Drop",
  essay: "Essay",
};

export const TYPE_DESCRIPTION: Record<QType, string> = {
  mcq: "Chọn 1 đáp án đúng trong nhiều lựa chọn",
  "mcq-multi": "Chọn nhiều đáp án đúng",
  tf: "Câu hỏi đúng hoặc sai",
  short: "Trả lời ngắn bằng văn bản",
  sequence: "Sắp xếp các mục theo thứ tự",
  matching: "Nối cặp các mục tương ứng",
  fill: "Điền vào chỗ trống — tự nhập đáp án",
  "select-lists": "Chọn đáp án từ danh sách thả xuống tại mỗi chỗ trống",
  "drag-drop": "Kéo thả từ/đoạn văn vào các chỗ trống trong đề",
  essay: "Bài viết tự luận dài",
};

const SAMPLE_CONTENTS: Record<QSkill, string[]> = {
  reading: [
    "Read the passage and choose the main idea.",
    "What does the underlined word mean?",
    "According to the article, which statement is true?",
    "Identify the author's tone in paragraph 2.",
  ],
  listening: [
    "Listen and choose the correct picture.",
    "Listen and complete the missing word.",
    "What is the speaker's opinion about ___?",
    "How does the woman feel?",
  ],
  writing: [
    "Write a short paragraph (80-100 words) about your hobbies.",
    "Write an email to your friend inviting them to a party.",
    "Describe a memorable journey in 120 words.",
    "Compose a thank-you note to your teacher.",
  ],
  speaking: [
    "Describe your favorite food in 1 minute.",
    "Talk about your weekend plan.",
    "Compare two pictures and say which one you prefer.",
    "Give your opinion about online learning.",
  ],
};

const SKILLS: QSkill[] = ["listening", "reading", "writing", "speaking"];
const TYPES: QType[] = ["mcq", "mcq-multi", "fill", "tf", "short", "essay", "matching", "sequence"];
const LEVELS: QLevel[] = ["A1", "A2", "B1", "B2", "C1"];

export const questionBank: BankQuestion[] = (() => {
  const out: BankQuestion[] = [];
  let i = 1;
  for (const skill of SKILLS) {
    for (const level of LEVELS) {
      for (const type of TYPES.slice(0, skill === "writing" || skill === "speaking" ? 3 : 6)) {
        for (let v = 0; v < 6; v++) {
        const contents = SAMPLE_CONTENTS[skill];
        const actualType: QType = skill === "writing" ? "essay" : skill === "speaking" ? "short" : type;
        const difficulty: QDifficulty = i % 3 === 0 ? "hard" : i % 3 === 1 ? "medium" : "easy";
        out.push({
          id: `Q${String(i).padStart(4, "0")}`,
          content: `[${level}] ${contents[i % contents.length]}`,
          skill,
          type: actualType,
          level,
          difficulty,
          points: type === "essay" ? 5 : type === "short" ? 2 : 1,
          tags: [skill, level.toLowerCase()],
          createdAt: new Date(2025, 0, (i % 28) + 1).toISOString(),
          options: type.startsWith("mcq") ? ["A. Option A", "B. Option B", "C. Option C", "D. Option D"] : undefined,
          correctAnswer: type.startsWith("mcq") ? "A" : type === "tf" ? "True" : undefined,
          solution: actualType === "essay"
            ? "Dear Jordan,\n\nThank you for letting me know about your trip. Unfortunately I'll be away for work that week, so I won't be able to meet you in person. While you're here, you should definitely visit the old town — the riverside walk at sunset is beautiful. Hopefully we can catch up around December when things are calmer.\n\nBest wishes,"
            : undefined,
          feedback: actualType === "essay"
            ? [
                { keyword: "Dear", comment: "Cách mở đầu email rất tự nhiên." },
                { keyword: "won't be", comment: "Nên giải thích lý do bạn không rảnh." },
                { keyword: "visit", comment: "Hãy gợi ý một địa điểm cụ thể trong khu vực." },
                { keyword: "later", comment: "Đề xuất một thời điểm khác để gặp nhau." },
              ]
            : undefined,
        });
        i++;
        }
      }
    }
  }
  return out;
})();
