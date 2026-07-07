/** PDF export: rasterize each rendered book page (DOM) with html2canvas and
 *  place them on A4-landscape pages. Rendering the real DOM keeps the PixAI
 *  fonts, CJK text, gradients and crops pixel-identical to the preview. */

import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";

const A4_W = 297; // mm
const A4_H = 210;

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
    const canvas = await html2canvas(pages[i], {
      scale: 2,
      useCORS: true,
      backgroundColor: "#ffffff",
      logging: false,
    });
    if (i > 0) pdf.addPage("a4", "landscape");
    pdf.addImage(canvas.toDataURL("image/jpeg", 0.92), "JPEG", 0, 0, A4_W, A4_H);
    onProgress?.(i + 1, pages.length);
  }

  pdf.save(filename);
}

export const pdfFilename = (title: string) =>
  `${(title.trim() || "exhibit").replace(/[\\/:*?"<>|]+/g, "-")}.pdf`;
