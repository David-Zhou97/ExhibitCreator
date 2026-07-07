import type { CSSProperties, ReactNode } from "react";
import { ImagePlus } from "lucide-react";
import type { Exhibit, ExhibitPage } from "../lib/types";
import { langOf } from "../lib/lang";
import { AREA_NAMES, mosaicFor, plateNo } from "../lib/layout";

/** Fixed book-page design size: A4 landscape at 96dpi. Rendered 1:1 and
 *  scaled with CSS transforms for previews / thumbnails. */
export const PAGE_W = 1123;
export const PAGE_H = 794;

/* ---- Content page ---------------------------------------------------------- */

export function PageCanvas({
  exhibit,
  page,
  pageNo,
  pageCount,
  editing = false,
}: {
  exhibit: Exhibit;
  page: ExhibitPage;
  /** 1-based content page number (cover excluded). */
  pageNo: number;
  pageCount: number;
  /** Show the "add images" placeholder for empty pages (preview only). */
  editing?: boolean;
}) {
  const mosaic = mosaicFor(page.images.length, pageNo % 2 === 0);
  const captions = page.images.filter((im) => im.description.trim());
  const showPlates = page.images.length > 1 || captions.length > 0;

  const gridStyle: CSSProperties = {
    gridTemplateColumns: mosaic.cols,
    gridTemplateRows: mosaic.rows,
    gridTemplateAreas: mosaic.areas,
  };

  return (
    <div className="pc">
      <div className="pc-head">
        <span className="pc-overline">{exhibit.title.trim() || "Untitled exhibit"}</span>
        <span className="pc-pageno">
          {langOf(exhibit.inputLang).short} → {langOf(exhibit.outputLang).short} ·{" "}
          {plateNo(pageNo - 1)} / {plateNo(pageCount - 1)}
        </span>
      </div>
      <div className="pc-title">{page.title.trim() || "Untitled page"}</div>
      <div className="pc-rule" />

      {page.images.length > 0 ? (
        <div className="pc-mosaic" style={gridStyle}>
          {page.images.map((im, i) => (
            <figure key={im.id} className="pc-cell" style={{ gridArea: AREA_NAMES[i], margin: 0 }}>
              <img src={im.src} alt={im.description || `Image ${i + 1}`} />
              {showPlates && <span className="pc-plate">{plateNo(i)}</span>}
            </figure>
          ))}
        </div>
      ) : editing ? (
        <div className="pc-empty">
          <ImagePlus size={30} strokeWidth={1.5} />
          <span>Add images from the panel on the right</span>
        </div>
      ) : (
        <div className="pc-mosaic" />
      )}

      {captions.length > 0 && (
        <div className="pc-captions">
          {page.images.map((im, i) =>
            im.description.trim() ? (
              <div key={im.id} className="pc-caption">
                <b>{plateNo(i)}</b>
                <span>{im.description}</span>
              </div>
            ) : null,
          )}
        </div>
      )}
    </div>
  );
}

/* ---- Cover page --------------------------------------------------------------- */

export function CoverCanvas({ exhibit }: { exhibit: Exhibit }) {
  const { cover } = exhibit;
  const gradient = cover.kind === "gradient";
  return (
    <div className="pc pc-cover">
      {cover.kind === "gradient" ? (
        <div className="pc-cover-media pc-cover-gradient">
          <div className="pc-cover-light" />
          <img className="pc-cover-mio" src="/brand/mio-mascot.png" alt="" />
          <div className="pc-cover-scrim" />
        </div>
      ) : (
        <div className="pc-cover-media">
          <img className="full" src={cover.src} alt="" />
          <div className="pc-cover-scrim" />
        </div>
      )}
      <div className={gradient ? "pc-cover-content with-mio" : "pc-cover-content"}>
        <span className="pc-cover-lang">
          {langOf(exhibit.inputLang).native}
          <span style={{ opacity: 0.75 }}>→</span>
          {langOf(exhibit.outputLang).native}
        </span>
        <div className="pc-cover-title">{exhibit.title.trim() || "Untitled exhibit"}</div>
        {exhibit.subtitle.trim() && <div className="pc-cover-sub">{exhibit.subtitle}</div>}
        <div className="pc-cover-foot">
          <img src="/brand/pixai-logo-mark.svg" alt="" />
          <span>PixAI · Model Capabilities Exhibit</span>
        </div>
      </div>
    </div>
  );
}

/* ---- Scaled wrapper -------------------------------------------------------------- */

/** Renders a full-size page scaled down to `width` px. */
export function Scaled({ width, children }: { width: number; children: ReactNode }) {
  const s = width / PAGE_W;
  return (
    <div style={{ width, height: Math.round(PAGE_H * s), position: "relative", overflow: "hidden" }}>
      <div style={{ position: "absolute", top: 0, left: 0, transform: `scale(${s})`, transformOrigin: "top left" }}>
        {children}
      </div>
    </div>
  );
}
