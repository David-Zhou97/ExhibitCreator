import type { Language } from "./types";

/** Static template strings rendered on book pages (before/after tags,
 *  section headers) — shown in the language of the current book view. */
export interface UiStrings {
  before: string;
  after: string;
  references: string;
  result: string;
}

export interface LangInfo {
  code: Language;
  /** Native name, shown on covers & pickers. */
  native: string;
  english: string;
  short: string;
  ui: UiStrings;
}

export const LANGUAGES: LangInfo[] = [
  {
    code: "en", native: "English", english: "English", short: "EN",
    ui: { before: "Before", after: "After", references: "References", result: "Result" },
  },
  {
    code: "zh", native: "中文", english: "Chinese", short: "ZH",
    ui: { before: "原图", after: "编辑后", references: "参考图", result: "生成结果" },
  },
  {
    code: "ko", native: "한국어", english: "Korean", short: "KO",
    ui: { before: "편집 전", after: "편집 후", references: "참조 이미지", result: "결과" },
  },
  {
    code: "ja", native: "日本語", english: "Japanese", short: "JA",
    ui: { before: "加工前", after: "加工後", references: "参照画像", result: "生成結果" },
  },
];

export const langOf = (code: Language): LangInfo =>
  LANGUAGES.find((l) => l.code === code) ?? LANGUAGES[0];
