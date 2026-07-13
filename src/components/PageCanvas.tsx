import { useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { ImagePlus } from "lucide-react";
import type { Exhibit, ExhibitImage, ExhibitPage } from "../lib/types";
import { langOf, type UiStrings } from "../lib/lang";
import { justifiedLayout, maxImagesFor, plateNo } from "../lib/layout";
import { cls } from "./ui";

/** Fixed book-page design size: A4 landscape at 96dpi. Rendered 1:1 and
 *  scaled with CSS transforms for previews / thumbnails. */
export const PAGE_W = 1123;
export const PAGE_H = 794;

const CELL_GAP = 14;

/** Pick the translated text when viewing the translated book, falling back
 *  to the original for fields that have no translation (yet). */
const pick = (original: string, tr: string | undefined, translated: boolean) =>
  translated && tr?.trim() ? tr : original;

const plateLabel = (im: ExhibitImage, i: number, translated: boolean) =>
  pick(im.label, im.labelTr, translated).trim() || plateNo(i);

const aspectOf = (im: ExhibitImage) =>
  im.width > 0 && im.height > 0 ? im.width / im.height : 1;

interface Box {
  w: number;
  h: number;
}

/** Aspect-exact image cell with an optional plate/tag badge. */
function Cell({
  im,
  w,
  h,
  badge,
}: {
  im: ExhibitImage;
  w: number;
  h: number;
  badge?: string;
}) {
  return (
    <figure className="pc-cell" style={{ width: w, height: h, margin: 0 }}>
      <div
        className="bg-cover-img"
        role="img"
        aria-label={im.description || "Image"}
        style={{ backgroundImage: `url("${im.src}")` }}
      />
      {badge && <span className="pc-plate">{badge}</span>}
    </figure>
  );
}

/* ---- Template: gallery (justified mosaic) ----------------------------------- */

function GalleryMosaic({
  images,
  box,
  showPlates,
  translated,
}: {
  images: ExhibitImage[];
  box: Box;
  showPlates: boolean;
  translated: boolean;
}) {
  const aspects = images.map(aspectOf);
  const layout = justifiedLayout(aspects, box.w, box.h, CELL_GAP);
  return (
    <>
      {layout.rows.map((row, r) => (
        <div key={r} className="pc-row" style={{ height: layout.rowHeights[r] }}>
          {row.map((i) => (
            <Cell
              key={images[i].id}
              im={images[i]}
              w={aspects[i] * layout.rowHeights[r]}
              h={layout.rowHeights[r]}
              badge={showPlates ? plateLabel(images[i], i, translated) : undefined}
            />
          ))}
        </div>
      ))}
    </>
  );
}

/* ---- Template: edits (before → after pairs with a note) --------------------- */

const MID_W = 150; // arrow + note column between before and after
const PANEL_PAD = 14; // breathing room between an image and its backdrop panel

/** A fixed-size shaded backdrop panel with the image aspect-fit and centered
 *  on it — every pair row gets identical panels, so the page reads the same
 *  whether the sources are vertical or horizontal. */
function PairPanel({
  im,
  w,
  h,
  badge,
  translated,
}: {
  im: ExhibitImage | undefined;
  w: number;
  h: number;
  badge: string;
  translated: boolean;
}) {
  let img: ReactNode = null;
  if (im) {
    const a = aspectOf(im);
    const imgH = Math.min(h - PANEL_PAD * 2, (w - PANEL_PAD * 2) / a);
    img = (
      <div
        className="pc-pair-img bg-cover-img"
        role="img"
        aria-label={pick(im.description, im.descriptionTr, translated) || "Image"}
        style={{ width: a * imgH, height: imgH, backgroundImage: `url("${im.src}")` }}
      />
    );
  }
  return (
    <div className={cls("pc-pair-panel", !im && "empty")} style={{ width: w, height: h }}>
      {img}
      <span className="pc-plate">{badge}</span>
    </div>
  );
}

function EditPairs({
  images,
  box,
  translated,
  ui,
}: {
  images: ExhibitImage[];
  box: Box;
  translated: boolean;
  ui: UiStrings;
}) {
  const pairs: Array<[ExhibitImage, ExhibitImage | undefined]> = [];
  for (let i = 0; i < images.length; i += 2) pairs.push([images[i], images[i + 1]]);
  const slotH = (box.h - CELL_GAP * (pairs.length - 1)) / pairs.length;
  // Same panel width on every row, regardless of the images' aspect ratios.
  const colW = (box.w - MID_W - CELL_GAP * 2) / 2;

  return (
    <>
      {pairs.map(([before, after]) => {
        const note = after ? pick(after.description, after.descriptionTr, translated) : "";
        return (
          <div key={before.id} className="pc-pair-row" style={{ height: slotH }}>
            <PairPanel im={before} w={colW} h={slotH} badge={ui.before} translated={translated} />
            <div className="pc-pair-mid" style={{ width: MID_W }}>
              <span className="pc-pair-arrow">→</span>
              {note.trim() && <span className="pc-pair-note">{note}</span>}
            </div>
            <PairPanel im={after} w={colW} h={slotH} badge={ui.after} translated={translated} />
          </div>
        );
      })}
    </>
  );
}

/* ---- Template: reference (references left, result right) -------------------- */

function ReferenceSplit({
  images,
  box,
  showPlates,
  translated,
  ui,
}: {
  images: ExhibitImage[];
  box: Box;
  showPlates: boolean;
  translated: boolean;
  ui: UiStrings;
}) {
  const out = images[images.length - 1];
  const refs = images.slice(0, -1);
  const MID = 76;
  const HEAD = 30; // section header line
  const sectionH = box.h - HEAD;
  const leftW = refs.length > 0 ? Math.round((box.w - MID) * 0.44) : 0;
  const rightW = box.w - MID - leftW;
  const aOut = aspectOf(out);
  const outH = Math.min(sectionH, rightW / aOut);
  const refLayout = justifiedLayout(refs.map(aspectOf), leftW, sectionH, 10);

  return (
    <div className="pc-refsplit" style={{ width: box.w, height: box.h }}>
      {refs.length > 0 && (
        <>
          <div className="pc-refcol" style={{ width: leftW }}>
            <div className="pc-sec-head">{ui.references}</div>
            <div className="pc-refgrid">
              {refLayout.rows.map((row, r) => (
                <div key={r} className="pc-refrow" style={{ height: refLayout.rowHeights[r] }}>
                  {row.map((i) => (
                    <Cell
                      key={refs[i].id}
                      im={refs[i]}
                      w={aspectOf(refs[i]) * refLayout.rowHeights[r]}
                      h={refLayout.rowHeights[r]}
                      badge={showPlates ? plateLabel(refs[i], i, translated) : undefined}
                    />
                  ))}
                </div>
              ))}
            </div>
          </div>
          <div className="pc-pair-mid" style={{ width: MID }}>
            <span className="pc-pair-arrow">→</span>
          </div>
        </>
      )}
      <div className="pc-refcol" style={{ width: refs.length > 0 ? rightW : box.w }}>
        <div className="pc-sec-head">{ui.result}</div>
        <div className="pc-refout">
          <Cell
            im={out}
            w={aOut * outH}
            h={outH}
            badge={showPlates ? plateLabel(out, images.length - 1, translated) : undefined}
          />
        </div>
      </div>
    </div>
  );
}

/* ---- Content page ---------------------------------------------------------- */

export function PageCanvas({
  exhibit,
  page,
  pageNo,
  pageCount,
  editing = false,
  translated = false,
}: {
  exhibit: Exhibit;
  page: ExhibitPage;
  /** 1-based content page number (cover excluded). */
  pageNo: number;
  pageCount: number;
  /** Show the "add images" placeholder for empty pages (preview only). */
  editing?: boolean;
  /** Show the output-language version of all text. */
  translated?: boolean;
}) {
  const template = page.template;
  const images = page.images.slice(0, maxImagesFor(template));
  // Edits pages show the after-image description inline as the edit note,
  // so they have no caption footer.
  const captions = template === "edits" ? [] : images.filter((im) => im.description.trim());
  const showPlates = template !== "edits" && (images.length > 1 || captions.length > 0);
  const ui = langOf(translated ? exhibit.outputLang : exhibit.inputLang).ui;

  // The mosaic's box depends on how much the title/description/captions take,
  // so measure it after layout and compute the rows from real dimensions.
  const mosaicRef = useRef<HTMLDivElement>(null);
  const [box, setBox] = useState<Box>({ w: PAGE_W - 120, h: 480 });
  useLayoutEffect(() => {
    const el = mosaicRef.current;
    if (!el) return;
    const w = el.clientWidth;
    const h = el.clientHeight;
    if (w > 0 && h > 0) setBox((b) => (b.w === w && b.h === h ? b : { w, h }));
  });

  return (
    <div className="pc">
      <div className="pc-head">
        <span className="pc-overline">
          {pick(exhibit.title, exhibit.titleTr, translated).trim() || "Untitled exhibit"}
        </span>
        <span className="pc-pageno">
          {langOf(exhibit.inputLang).short} → {langOf(exhibit.outputLang).short} ·{" "}
          {plateNo(pageNo - 1)} / {plateNo(pageCount - 1)}
        </span>
      </div>
      <div className="pc-title">
        {pick(page.title, page.titleTr, translated).trim() || "Untitled page"}
      </div>
      <div className="pc-rule" />
      {page.description.trim() && (
        <p className="pc-desc">{pick(page.description, page.descriptionTr, translated)}</p>
      )}

      {images.length > 0 ? (
        <div className="pc-mosaic" ref={mosaicRef}>
          {template === "edits" ? (
            <EditPairs images={images} box={box} translated={translated} ui={ui} />
          ) : template === "reference" ? (
            <ReferenceSplit
              images={images}
              box={box}
              showPlates={showPlates}
              translated={translated}
              ui={ui}
            />
          ) : (
            <GalleryMosaic images={images} box={box} showPlates={showPlates} translated={translated} />
          )}
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
          {images.map((im, i) =>
            im.description.trim() ? (
              <div key={im.id} className="pc-caption">
                <b>{plateLabel(im, i, translated)}</b>
                <span>{pick(im.description, im.descriptionTr, translated)}</span>
              </div>
            ) : null,
          )}
        </div>
      )}
    </div>
  );
}

/* ---- Cover page --------------------------------------------------------------- */

export function CoverCanvas({
  exhibit,
  translated = false,
}: {
  exhibit: Exhibit;
  translated?: boolean;
}) {
  const { cover } = exhibit;
  const gradient = cover.kind === "gradient";
  return (
    <div className="pc pc-cover">
      {cover.kind === "gradient" ? (
        <div className="pc-cover-media pc-cover-gradient">
          <div className="pc-cover-light" />
          {/* background-image divs (not <img>): the PDF renderer inlines CSS
              backgrounds reliably, while nested <img> decoding can race the
              SVG rasterization and drop the picture from the export. */}
          <div className="pc-cover-mio">
            <div
              className="pc-cover-mio-art"
              style={{ backgroundImage: 'url("/brand/mio-mascot.png")' }}
            />
          </div>
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
        <div className="pc-cover-title">
          {pick(exhibit.title, exhibit.titleTr, translated).trim() || "Untitled exhibit"}
        </div>
        {exhibit.subtitle.trim() && (
          <div className="pc-cover-sub">
            {pick(exhibit.subtitle, exhibit.subtitleTr, translated)}
          </div>
        )}
        <div className="pc-cover-foot">
          <div
            className="pc-cover-foot-logo"
            style={{ backgroundImage: 'url("/brand/pixai-logo-mark.svg")' }}
          />
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
