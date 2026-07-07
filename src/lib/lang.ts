import type { Language } from "./types";

export interface LangInfo {
  code: Language;
  /** Native name, shown on covers & pickers. */
  native: string;
  english: string;
  short: string;
}

export const LANGUAGES: LangInfo[] = [
  { code: "en", native: "English", english: "English", short: "EN" },
  { code: "zh", native: "中文", english: "Chinese", short: "ZH" },
  { code: "ko", native: "한국어", english: "Korean", short: "KO" },
  { code: "ja", native: "日本語", english: "Japanese", short: "JA" },
];

export const langOf = (code: Language): LangInfo =>
  LANGUAGES.find((l) => l.code === code) ?? LANGUAGES[0];
