/** Aspect-exact justified layout: images are split into 1–3 rows in reading
 *  order. Every frame gets exactly its image's aspect ratio — a horizontal
 *  image gets a wide frame, a vertical image a tall one — so nothing is
 *  cropped or distorted. The partition is chosen so the rows' natural height
 *  best fills the canvas; if they'd overflow, everything scales down
 *  uniformly, and any leftover space becomes centered margins. */

import type { PageTemplate } from "./types";

export const MAX_IMAGES_PER_PAGE = 8;
const MAX_ROWS = 3;

/** Image capacity per page template: 3 before/after pairs, or up to 6
 *  references plus one result, or an 8-image gallery. */
export const maxImagesFor = (template: PageTemplate): number =>
  template === "edits" ? 6 : template === "reference" ? 7 : MAX_IMAGES_PER_PAGE;

export const plateNo = (i: number) => String(i + 1).padStart(2, "0");

export interface JustifiedLayout {
  /** Contiguous groups of image indices, one per row (reading order kept). */
  rows: number[][];
  /** Pixel height of each row; cell width = aspect × row height. */
  rowHeights: number[];
}

/**
 * @param aspects  natural width/height per image
 * @param boxW/boxH  content-box size of the mosaic area, px
 * @param gap  gap between cells and rows, px
 */
export function justifiedLayout(
  aspects: number[],
  boxW: number,
  boxH: number,
  gap: number,
): JustifiedLayout {
  const n = aspects.length;
  if (n === 0 || boxW <= 0 || boxH <= 0) return { rows: [], rowHeights: [] };

  let bestSizes: number[] = [n];
  let bestHeights: number[] = [boxH];
  let bestCost = Infinity;

  for (const sizes of compositions(n, Math.min(n, MAX_ROWS))) {
    // Natural height of each full-width row, then how well the stack fills the box.
    const heights: number[] = [];
    let start = 0;
    for (const size of sizes) {
      const sum = aspects.slice(start, start + size).reduce((a, b) => a + b, 0);
      heights.push((boxW - gap * (size - 1)) / sum);
      start += size;
    }
    const total = heights.reduce((a, b) => a + b, 0) + gap * (sizes.length - 1);
    const cost = Math.abs(Math.log(total / boxH));
    if (cost < bestCost - 1e-9) {
      bestCost = cost;
      bestSizes = sizes;
      bestHeights = heights;
    }
  }

  // Shrink uniformly if the natural stack would overflow the box.
  const usable = boxH - gap * (bestSizes.length - 1);
  const natural = bestHeights.reduce((a, b) => a + b, 0);
  const s = Math.min(1, usable / natural);

  let i = 0;
  return {
    rows: bestSizes.map((size) => Array.from({ length: size }, () => i++)),
    rowHeights: bestHeights.map((h) => h * s),
  };
}

/** All ways to split n items into 1..maxParts contiguous non-empty groups. */
function* compositions(n: number, maxParts: number): Generator<number[]> {
  function* go(remaining: number, parts: number): Generator<number[]> {
    if (parts === 1) {
      yield [remaining];
      return;
    }
    for (let first = 1; first <= remaining - (parts - 1); first++) {
      for (const rest of go(remaining - first, parts - 1)) yield [first, ...rest];
    }
  }
  for (let k = 1; k <= maxParts; k++) yield* go(n, k);
}
