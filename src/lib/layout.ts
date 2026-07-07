/** Art-book mosaic layouts. Each image count maps to a CSS grid template
 *  that fills the page; images auto-crop via object-fit: cover. Odd pages
 *  mirror the template so spreads feel editorial rather than repetitive. */

export interface Mosaic {
  cols: string;
  rows: string;
  areas?: string;
}

export const MAX_IMAGES_PER_PAGE = 8;
export const AREA_NAMES = "abcdefgh";

const TEMPLATES: Record<number, Mosaic> = {
  1: { cols: "1fr", rows: "1fr", areas: '"a"' },
  2: { cols: "3fr 2fr", rows: "1fr", areas: '"a b"' },
  3: { cols: "3fr 2fr", rows: "1fr 1fr", areas: '"a b" "a c"' },
  4: { cols: "2fr 1fr 1fr", rows: "1fr 1fr", areas: '"a b c" "a d d"' },
  5: { cols: "2fr 1fr 1fr", rows: "1fr 1fr", areas: '"a b c" "a d e"' },
  6: { cols: "1fr 1fr 1fr", rows: "1fr 1fr", areas: '"a b c" "d e f"' },
  7: { cols: "2fr 1fr 1fr 1fr", rows: "1fr 1fr", areas: '"a b c d" "a e f g"' },
  8: { cols: "1fr 1fr 1fr 1fr", rows: "1fr 1fr", areas: '"a b c d" "e f g h"' },
};

/** Horizontally mirror a template (token-reversal keeps areas rectangular). */
function mirror(m: Mosaic): Mosaic {
  if (!m.areas) return m;
  const rows = m.areas.match(/"[^"]+"/g) ?? [];
  const areas = rows
    .map((r) => `"${r.replace(/"/g, "").split(" ").reverse().join(" ")}"`)
    .join(" ");
  return { ...m, cols: m.cols.split(" ").reverse().join(" "), areas };
}

export function mosaicFor(count: number, mirrored = false): Mosaic {
  const t = TEMPLATES[Math.min(Math.max(count, 1), MAX_IMAGES_PER_PAGE)];
  return mirrored ? mirror(t) : t;
}

export const plateNo = (i: number) => String(i + 1).padStart(2, "0");
