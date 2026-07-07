/** PDF export: rasterize each rendered book page (DOM) and place them on
 *  A4-landscape pages. html-to-image renders through an SVG foreignObject,
 *  which means the BROWSER rasterizes the page — text boxes, fonts, CJK,
 *  gradients and image scaling come out pixel-identical to the preview
 *  (unlike html2canvas, which re-implements rendering and misplaces text
 *  and resamples images poorly). */

import { jsPDF } from "jspdf";
import { toCanvas } from "html-to-image";

const A4_W = 297; // mm
const A4_H = 210;

/** 3× ≈ 290 DPI on A4 and roughly matches the 2400px import cap, so images
 *  are re-sampled as little as possible. */
const PIXEL_RATIO = 3;

export async function exportBookPdf(
  root: HTMLElement,
  filename: string,
  onProgress?: (done: number, total: number) => void,
): Promise<void> {
  await document.fonts.ready;

  const pages = Array.from(root.querySelectorAll<HTMLElement>("[data-book-page]"));
  if (pages.length === 0) throw new Error("Nothing to export");

  const pdf = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });

  for (let i = 0; i < pages.length; i++) {
    // Render twice and keep the second pass: the first decodes every nested
    // resource (fonts, embedded images) into the renderer's cache, so the
    // second rasterization is guaranteed complete. Skipping this can drop
    // images from freshly-mounted pages.
    await toCanvas(pages[i], { pixelRatio: 1, backgroundColor: "#ffffff" });
    const canvas = await toCanvas(pages[i], {
      pixelRatio: PIXEL_RATIO,
      backgroundColor: "#ffffff",
    });
    if (i > 0) pdf.addPage("a4", "landscape");
    pdf.addImage(canvas.toDataURL("image/jpeg", 0.93), "JPEG", 0, 0, A4_W, A4_H);
    onProgress?.(i + 1, pages.length);
  }

  pdf.save(filename);
}

export const pdfFilename = (title: string) =>
  `${(title.trim() || "exhibit").replace(/[\\/:*?"<>|]+/g, "-")}.pdf`;
