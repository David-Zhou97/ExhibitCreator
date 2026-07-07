/** Read an image file into a data URL, resizing large images down so
 *  exhibits stay storable and PDFs stay reasonably sized. */

const MAX_DIM = 2400; // ≈ what a full-width cell needs at the PDF's 3× render scale
const KEEP_ORIGINAL_BELOW = 900_000; // bytes

export interface ImportedImage {
  src: string;
  width: number;
  height: number;
}

export function readImageFile(file: File): Promise<ImportedImage> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      const scale = Math.min(1, MAX_DIM / Math.max(img.naturalWidth, img.naturalHeight));

      if (scale === 1 && file.size < KEEP_ORIGINAL_BELOW) {
        const reader = new FileReader();
        reader.onload = () =>
          resolve({
            src: reader.result as string,
            width: img.naturalWidth,
            height: img.naturalHeight,
          });
        reader.onerror = () => reject(reader.error);
        reader.readAsDataURL(file);
        return;
      }

      const canvas = document.createElement("canvas");
      canvas.width = Math.round(img.naturalWidth * scale);
      canvas.height = Math.round(img.naturalHeight * scale);
      const ctx = canvas.getContext("2d")!;
      ctx.fillStyle = "#ffffff"; // flatten transparency before JPEG
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.imageSmoothingQuality = "high";
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      resolve({
        src: canvas.toDataURL("image/jpeg", 0.9),
        width: canvas.width,
        height: canvas.height,
      });
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error(`Could not read ${file.name}`));
    };
    img.src = url;
  });
}

/** Decode a stored data URL just to learn its natural size (migration). */
export const measureImage = (src: string) =>
  new Promise<{ width: number; height: number }>((resolve) => {
    const img = new Image();
    img.onload = () => resolve({ width: img.naturalWidth, height: img.naturalHeight });
    img.onerror = () => resolve({ width: 1, height: 1 });
    img.src = src;
  });
