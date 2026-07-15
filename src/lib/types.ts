/** Core data model for Exhibit Creator. */

export type Language = "en" | "zh" | "ko" | "ja";

export interface ExhibitImage {
  id: string;
  /** Data URL (uploads are resized/compressed on import). */
  src: string;
  /** Natural pixel size — drives the orientation-aware page layout. */
  width: number;
  height: number;
  /** Plate label shown on the image badge; empty = plate number ("01"). */
  label: string;
  description: string;
  /** Translations into the exhibit's output language (filled at export time). */
  labelTr?: string;
  descriptionTr?: string;
}

/** Page layout templates:
 *  - gallery:   justified mosaic of results (default)
 *  - edits:     before → after pairs with a short edit note (up to 3 pairs)
 *  - reference: reference images on the left, generated result on the right */
export type PageTemplate = "gallery" | "edits" | "reference";

export interface ExhibitPage {
  id: string;
  title: string;
  /** Optional intro paragraph describing the gallery, shown under the title. */
  description: string;
  template: PageTemplate;
  /** Interpretation depends on template: gallery = all results; edits =
   *  consecutive (before, after) pairs, the after image's description is the
   *  edit note; reference = references first, the LAST image is the result. */
  images: ExhibitImage[];
  titleTr?: string;
  descriptionTr?: string;
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
  /** Incognito: no PixAI branding anywhere, and every book page carries a
   *  diagonal "Strictly Confidential" watermark (preview and PDF). */
  incognito: boolean;
  pages: ExhibitPage[];
  createdAt: number;
  updatedAt: number;
  titleTr?: string;
  subtitleTr?: string;
}

export const uid = () =>
  Math.random().toString(36).slice(2, 10) + Date.now().toString(36);

export const newPage = (n: number): ExhibitPage => ({
  id: uid(),
  title: `Untitled page ${n}`,
  description: "",
  template: "gallery",
  images: [],
});

export function newExhibit(
  init: Pick<Exhibit, "title" | "subtitle" | "inputLang" | "outputLang" | "cover" | "incognito">,
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
