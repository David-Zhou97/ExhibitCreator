/** Core data model for Exhibit Creator. */

export type Language = "en" | "zh" | "ko" | "ja";

export interface ExhibitImage {
  id: string;
  /** Data URL (uploads are resized/compressed on import). */
  src: string;
  description: string;
}

export interface ExhibitPage {
  id: string;
  title: string;
  /** Optional intro paragraph describing the gallery, shown under the title. */
  description: string;
  images: ExhibitImage[];
}

export type Cover =
  | { kind: "gradient" }
  | { kind: "image"; src: string };

export interface Exhibit {
  id: string;
  title: string;
  subtitle: string;
  inputLang: Language;
  outputLang: Language;
  cover: Cover;
  pages: ExhibitPage[];
  createdAt: number;
  updatedAt: number;
}

export const uid = () =>
  Math.random().toString(36).slice(2, 10) + Date.now().toString(36);

export const newPage = (n: number): ExhibitPage => ({
  id: uid(),
  title: `Untitled page ${n}`,
  description: "",
  images: [],
});

export function newExhibit(
  init: Pick<Exhibit, "title" | "subtitle" | "inputLang" | "outputLang" | "cover">,
): Exhibit {
  const now = Date.now();
  return { id: uid(), ...init, pages: [newPage(1)], createdAt: now, updatedAt: now };
}

export function arrayMove<T>(arr: T[], from: number, to: number): T[] {
  if (to < 0 || to >= arr.length) return arr;
  const next = arr.slice();
  const [item] = next.splice(from, 1);
  next.splice(to, 0, item);
  return next;
}

export const formatDate = (ts: number) =>
  new Date(ts).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
