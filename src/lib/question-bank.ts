export type QSkill = "listening" | "reading" | "writing" | "speaking";
export type QType =
  | "mcq"
  | "mcq-multi"
  | "fill"
  | "matching"
  | "tf"
  | "short"
  | "essay"
  | "reorder"
  | "cloze"
  | "vocab";
export type QLevel = "A1" | "A2" | "B1" | "B2" | "C1" | "C2";

export type BankQuestion = {
  id: string;
  content: string;
  skill: QSkill;
  type: QType;
  level: QLevel;
  points: number;
  tags: string[];
  createdAt: string;
  options?: string[];
  correctAnswer?: string;
};

export const SKILL_LABEL: Record<QSkill, string> = {
  listening: "Nghe",
  reading: "Đọc",
  writing: "Viết",
  speaking: "Nói",
  use: "Use of English",
};

export const TYPE_LABEL: Record<QType, string> = {
  mcq: "Trắc nghiệm 1 đáp án",
  "mcq-multi": "Trắc nghiệm nhiều đáp án",
  fill: "Điền chỗ trống",
  matching: "Nối cặp",
  tf: "Đúng/Sai",
  short: "Trả lời ngắn",
  essay: "Tự luận",
  reorder: "Sắp xếp",
  cloze: "Cloze test",
  vocab: "Từ vựng",
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
  use: [
    "Choose the correct form: She ___ to Paris last year.",
    "Fill in the blank with the correct preposition.",
    "Transform the sentence using passive voice.",
    "Choose the synonym of the underlined word.",
  ],
};

const SKILLS: QSkill[] = ["listening", "reading", "writing", "speaking", "use"];
const TYPES: QType[] = ["mcq", "mcq-multi", "fill", "tf", "short", "essay", "matching", "cloze"];
const LEVELS: QLevel[] = ["A1", "A2", "B1", "B2", "C1"];

export const questionBank: BankQuestion[] = (() => {
  const out: BankQuestion[] = [];
  let i = 1;
  for (const skill of SKILLS) {
    for (const level of LEVELS) {
      for (const type of TYPES.slice(0, skill === "writing" || skill === "speaking" ? 3 : 6)) {
        const contents = SAMPLE_CONTENTS[skill];
        out.push({
          id: `Q${String(i).padStart(4, "0")}`,
          content: `[${level}] ${contents[i % contents.length]}`,
          skill,
          type: skill === "writing" ? "essay" : skill === "speaking" ? "short" : type,
          level,
          points: type === "essay" ? 5 : type === "short" ? 2 : 1,
          tags: [skill, level.toLowerCase()],
          createdAt: new Date(2025, 0, (i % 28) + 1).toISOString(),
          options: type.startsWith("mcq") ? ["A. Option A", "B. Option B", "C. Option C", "D. Option D"] : undefined,
          correctAnswer: type.startsWith("mcq") ? "A" : type === "tf" ? "True" : undefined,
        });
        i++;
      }
    }
  }
  return out;
})();
