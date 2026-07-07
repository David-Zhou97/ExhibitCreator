import { useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { ImagePlus } from "lucide-react";
import type { Exhibit, ExhibitImage, ExhibitPage } from "../lib/types";
import { langOf } from "../lib/lang";
import { justifiedLayout, plateNo } from "../lib/layout";

/** Fixed book-page design size: A4 landscape at 96dpi. Rendered 1:1 and
 *  scaled with CSS transforms for previews / thumbnails. */
export const PAGE_W = 1123;
export const PAGE_H = 794;

const CELL_GAP = 14;

const plateLabel = (im: ExhibitImage, i: number) => im.label.trim() || plateNo(i);

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
  const captions = page.images.filter((im) => im.description.trim());
  const showPlates = page.images.length > 1 || captions.length > 0;

  // The mosaic's box depends on how much the title/description/captions take,
  // so measure it after layout and compute the rows from real dimensions.
  const mosaicRef = useRef<HTMLDivElement>(null);
  const [box, setBox] = useState({ w: PAGE_W - 120, h: 480 });
  useLayoutEffect(() => {
    const el = mosaicRef.current;
    if (!el) return;
    const w = el.clientWidth;
    const h = el.clientHeight;
    if (w > 0 && h > 0) setBox((b) => (b.w === w && b.h === h ? b : { w, h }));
  });

  const aspects = page.images.map((im) =>
    im.width > 0 && im.height > 0 ? im.width / im.height : 1,
  );
  const layout = justifiedLayout(aspects, box.w, box.h, CELL_GAP);

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
      {page.titleTr?.trim() && <div className="pc-title-tr">{page.titleTr}</div>}
      <div className="pc-rule" />
      {page.description.trim() && <p className="pc-desc">{page.description}</p>}
      {page.descriptionTr?.trim() && <p className="pc-desc pc-desc-tr">{page.descriptionTr}</p>}

      {page.images.length > 0 ? (
        <div className="pc-mosaic" ref={mosaicRef}>
          {layout.rows.map((row, r) => (
            <div key={r} className="pc-row" style={{ height: layout.rowHeights[r] }}>
              {row.map((i) => {
                const im = page.images[i];
                return (
                  <figure
                    key={im.id}
                    className="pc-cell"
                    style={{ width: aspects[i] * layout.rowHeights[r], margin: 0 }}
                  >
                    {/* background-image instead of <img object-fit:cover>: html2canvas
                        (PDF export) ignores object-fit and would stretch the image,
                        but it renders background-size: cover correctly. Cells are
                        aspect-exact, so nothing is cropped either way. */}
                    <div
                      className="bg-cover-img"
                      role="img"
                      aria-label={im.description || `Image ${i + 1}`}
                      style={{ backgroundImage: `url("${im.src}")` }}
                    />
                    {showPlates && (
                      <span className="pc-plate">
                        {plateLabel(im, i)}
                        {im.labelTr?.trim() ? ` · ${im.labelTr}` : ""}
                      </span>
                    )}
                  </figure>
                );
              })}
            </div>
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
                <b>{plateLabel(im, i)}</b>
                <span>
                  {im.description}
                  {im.descriptionTr?.trim() && (
                    <span className="pc-caption-tr">{im.descriptionTr}</span>
                  )}
                </span>
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
          <div className="bg-cover-img" style={{ backgroundImage: `url("${cover.src}")` }} />
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
        {exhibit.titleTr?.trim() && <div className="pc-cover-title-tr">{exhibit.titleTr}</div>}
        {exhibit.subtitle.trim() && <div className="pc-cover-sub">{exhibit.subtitle}</div>}
        {exhibit.subtitleTr?.trim() && (
          <div className="pc-cover-sub pc-cover-sub-tr">{exhibit.subtitleTr}</div>
        )}
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
