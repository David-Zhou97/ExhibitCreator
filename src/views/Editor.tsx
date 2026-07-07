import { useEffect, useRef, useState, type ReactNode } from "react";
import {
  ArrowLeft, Check, ChevronDown, ChevronUp, FileDown, ImagePlus,
  Loader2, Plus, Trash2, X,
} from "lucide-react";
import {
  arrayMove, newPage, uid,
  type Exhibit, type ExhibitImage, type ExhibitPage,
} from "../lib/types";
import { readImageFile } from "../lib/images";
import { MAX_IMAGES_PER_PAGE, plateNo } from "../lib/layout";
import { exportBookPdf, pdfFilename } from "../lib/pdf";
import { CoverCanvas, PAGE_H, PAGE_W, PageCanvas, Scaled } from "../components/PageCanvas";
import { Button, cls, CoverPicker, Field, IconBtn, LangBadge, LangChips, Wordmark } from "../components/ui";

type Selection = "cover" | string; // page id

export function Editor({
  exhibit,
  onChange,
  onBack,
}: {
  exhibit: Exhibit;
  onChange: (exhibit: Exhibit) => void;
  onBack: () => void;
}) {
  const [sel, setSel] = useState<Selection>("cover");
  const [exporting, setExporting] = useState<{ done: number; total: number } | null>(null);
  const exportRef = useRef<HTMLDivElement>(null);
  const exportStarted = useRef(false);

  const selPageIndex = exhibit.pages.findIndex((p) => p.id === sel);
  const selPage = selPageIndex >= 0 ? exhibit.pages[selPageIndex] : null;

  /* ---- mutations ---- */
  const patch = (p: Partial<Exhibit>) => onChange({ ...exhibit, ...p, updatedAt: Date.now() });
  const patchPage = (id: string, p: Partial<ExhibitPage>) =>
    patch({ pages: exhibit.pages.map((pg) => (pg.id === id ? { ...pg, ...p } : pg)) });

  function addPage() {
    const page = newPage(exhibit.pages.length + 1);
    patch({ pages: [...exhibit.pages, page] });
    setSel(page.id);
  }

  function deletePage(id: string) {
    const page = exhibit.pages.find((p) => p.id === id);
    if (!page) return;
    if (page.images.length > 0 && !confirm(`Delete “${page.title || "this page"}” and its ${page.images.length} image(s)?`)) return;
    patch({ pages: exhibit.pages.filter((p) => p.id !== id) });
    if (sel === id) setSel("cover");
  }

  const movePage = (index: number, dir: -1 | 1) =>
    patch({ pages: arrayMove(exhibit.pages, index, index + dir) });

  async function addImages(page: ExhibitPage, files: FileList | null) {
    if (!files || files.length === 0) return;
    const room = MAX_IMAGES_PER_PAGE - page.images.length;
    const list = Array.from(files);
    if (list.length > room) {
      alert(`Pages hold up to ${MAX_IMAGES_PER_PAGE} images — adding the first ${room}.`);
    }
    try {
      const srcs = await Promise.all(list.slice(0, Math.max(room, 0)).map(readImageFile));
      const images: ExhibitImage[] = srcs.map((src) => ({ id: uid(), src, description: "" }));
      patchPage(page.id, { images: [...page.images, ...images] });
    } catch (err) {
      alert((err as Error).message);
    }
  }

  const patchImage = (page: ExhibitPage, imgId: string, p: Partial<ExhibitImage>) =>
    patchPage(page.id, { images: page.images.map((im) => (im.id === imgId ? { ...im, ...p } : im)) });

  /* ---- PDF export ---- */
  useEffect(() => {
    if (!exporting || exportStarted.current || !exportRef.current) return;
    exportStarted.current = true;
    (async () => {
      try {
        await exportBookPdf(exportRef.current!, pdfFilename(exhibit.title), (done, total) =>
          setExporting({ done, total }),
        );
      } catch (err) {
        console.error(err);
        alert(`PDF export failed: ${(err as Error).message}`);
      } finally {
        exportStarted.current = false;
        setExporting(null);
      }
    })();
  }, [exporting, exhibit.title]);

  return (
    <div className="editor-root">
      <header className="top-nav">
        <IconBtn icon={ArrowLeft} label="Back to exhibits" size={18} onClick={onBack} />
        <Wordmark />
        <span className="app-name-tag">Exhibit Creator</span>
        <input
          className="bare-input"
          style={{ flex: 1, maxWidth: 420 }}
          value={exhibit.title}
          placeholder="Untitled exhibit"
          onChange={(e) => patch({ title: e.target.value })}
        />
        <div style={{ flex: 1 }} />
        <LangBadge input={exhibit.inputLang} output={exhibit.outputLang} />
        <span className="save-hint">
          <Check size={12} strokeWidth={2.5} /> Saved locally
        </span>
        <Button
          variant="generate"
          size="sm"
          icon={exporting ? Loader2 : FileDown}
          disabled={!!exporting}
          onClick={() => setExporting({ done: 0, total: exhibit.pages.length + 1 })}
        >
          {exporting ? (
            <>Rendering {exporting.done}/{exporting.total}…</>
          ) : (
            "Export PDF"
          )}
        </Button>
      </header>

      <div className="editor-grid">
        {/* ---- Page rail ---- */}
        <aside className="rail">
          <div className="rail-section">Book</div>
          <div className="thumb-wrap">
            <button type="button" className={cls("thumb", sel === "cover" && "sel")} onClick={() => setSel("cover")}>
              <Scaled width={160}>
                <CoverCanvas exhibit={exhibit} />
              </Scaled>
            </button>
            <div className="thumb-label">Cover</div>
          </div>
          {exhibit.pages.map((page, i) => (
            <div className="thumb-wrap" key={page.id}>
              <button type="button" className={cls("thumb", sel === page.id && "sel")} onClick={() => setSel(page.id)}>
                <Scaled width={160}>
                  <PageCanvas exhibit={exhibit} page={page} pageNo={i + 1} pageCount={exhibit.pages.length + 1} editing />
                </Scaled>
              </button>
              <div className="thumb-tools">
                <IconBtn icon={ChevronUp} label="Move page up" size={13} disabled={i === 0}
                  onClick={() => movePage(i, -1)} />
                <IconBtn icon={ChevronDown} label="Move page down" size={13} disabled={i === exhibit.pages.length - 1}
                  onClick={() => movePage(i, 1)} />
                <IconBtn icon={Trash2} label="Delete page" size={13} danger onClick={() => deletePage(page.id)} />
              </div>
              <div className="thumb-label">{plateNo(i)} · {page.title.trim() || "Untitled"}</div>
            </div>
          ))}
          <Button variant="dim" size="sm" icon={Plus} block onClick={addPage} style={{ marginTop: 6 }}>
            Add page
          </Button>
        </aside>

        {/* ---- Stage ---- */}
        <FitStage>
          {sel === "cover" || !selPage ? (
            <CoverCanvas exhibit={exhibit} />
          ) : (
            <PageCanvas
              exhibit={exhibit}
              page={selPage}
              pageNo={selPageIndex + 1}
              pageCount={exhibit.pages.length + 1}
              editing
            />
          )}
        </FitStage>

        {/* ---- Inspector ---- */}
        <aside className="inspector">
          {sel === "cover" || !selPage ? (
            <CoverInspector exhibit={exhibit} patch={patch} />
          ) : (
            <PageInspector
              page={selPage}
              index={selPageIndex}
              patchPage={patchPage}
              patchImage={patchImage}
              addImages={addImages}
            />
          )}
        </aside>
      </div>

      {/* Offscreen full-size book render for PDF capture */}
      {exporting && (
        <div ref={exportRef} aria-hidden style={{ position: "absolute", top: 0, left: -2 * PAGE_W, width: PAGE_W }}>
          <div data-book-page>
            <CoverCanvas exhibit={exhibit} />
          </div>
          {exhibit.pages.map((page, i) => (
            <div data-book-page key={page.id}>
              <PageCanvas exhibit={exhibit} page={page} pageNo={i + 1} pageCount={exhibit.pages.length + 1} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ---- Center stage that scales the page to fit ---- */

function FitStage({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.5);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const update = () =>
      setScale(Math.min((el.clientWidth - 72) / PAGE_W, (el.clientHeight - 72) / PAGE_H, 1));
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return (
    <main ref={ref} className="stage">
      <div className="stage-card" style={{ width: PAGE_W * scale, height: PAGE_H * scale }}>
        <div style={{ transform: `scale(${scale})`, transformOrigin: "top left" }}>{children}</div>
      </div>
    </main>
  );
}

/* ---- Inspectors ---- */

function CoverInspector({
  exhibit,
  patch,
}: {
  exhibit: Exhibit;
  patch: (p: Partial<Exhibit>) => void;
}) {
  return (
    <>
      <div className="inspector-title">Cover</div>
      <Field label="Title">
        <input className="input" value={exhibit.title} placeholder="Untitled exhibit"
          onChange={(e) => patch({ title: e.target.value })} />
      </Field>
      <Field label="Subtitle">
        <input className="input" value={exhibit.subtitle} placeholder="A short line for the cover"
          onChange={(e) => patch({ subtitle: e.target.value })} />
      </Field>
      <Field label="Input language">
        <LangChips value={exhibit.inputLang} onChange={(l) => patch({ inputLang: l })} />
      </Field>
      <Field label="Output language">
        <LangChips value={exhibit.outputLang} onChange={(l) => patch({ outputLang: l })} />
      </Field>
      <Field label="Cover image">
        <CoverPicker value={exhibit.cover} onChange={(cover) => patch({ cover })} />
      </Field>
      <div className="inspector-note">
        The language pair and cover appear on the first page of the exported PDF.
      </div>
    </>
  );
}

function PageInspector({
  page,
  index,
  patchPage,
  patchImage,
  addImages,
}: {
  page: ExhibitPage;
  index: number;
  patchPage: (id: string, p: Partial<ExhibitPage>) => void;
  patchImage: (page: ExhibitPage, imgId: string, p: Partial<ExhibitImage>) => void;
  addImages: (page: ExhibitPage, files: FileList | null) => Promise<void>;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const room = MAX_IMAGES_PER_PAGE - page.images.length;

  return (
    <>
      <div className="inspector-title">Page {plateNo(index)}</div>
      <Field label="Page title">
        <input className="input" value={page.title} placeholder="Untitled page"
          onChange={(e) => patchPage(page.id, { title: e.target.value })} />
      </Field>

      <Field label="Description (optional)">
        <textarea
          className="textarea"
          rows={3}
          placeholder="Introduce this gallery — what do these results show?"
          value={page.description}
          onChange={(e) => patchPage(page.id, { description: e.target.value })}
        />
      </Field>

      <Field label={`Images (${page.images.length}/${MAX_IMAGES_PER_PAGE})`}>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {page.images.map((im, i) => (
            <div className="img-row" key={im.id}>
              <div style={{ position: "relative", flex: "none" }}>
                <img className="img-row-thumb" src={im.src} alt="" />
                <span className="img-row-no">{plateNo(i)}</span>
              </div>
              <div className="img-row-main">
                <textarea
                  className="textarea"
                  rows={2}
                  placeholder="Describe this image…"
                  value={im.description}
                  onChange={(e) => patchImage(page, im.id, { description: e.target.value })}
                />
              </div>
              <div className="img-row-tools">
                <IconBtn icon={ChevronUp} label="Move image earlier" size={13} disabled={i === 0}
                  onClick={() => patchPage(page.id, { images: arrayMove(page.images, i, i - 1) })} />
                <IconBtn icon={ChevronDown} label="Move image later" size={13} disabled={i === page.images.length - 1}
                  onClick={() => patchPage(page.id, { images: arrayMove(page.images, i, i + 1) })} />
                <IconBtn icon={X} label="Remove image" size={13} danger
                  onClick={() => patchPage(page.id, { images: page.images.filter((x) => x.id !== im.id) })} />
              </div>
            </div>
          ))}
          <Button variant="soft" size="sm" icon={ImagePlus} block disabled={room <= 0}
            onClick={() => fileRef.current?.click()}>
            {room > 0 ? "Add images" : "Page is full"}
          </Button>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            multiple
            hidden
            onChange={(e) => {
              void addImages(page, e.target.files);
              e.target.value = "";
            }}
          />
        </div>
      </Field>
      <div className="inspector-note">
        Images arrange themselves automatically to fill the page — the layout adapts to how many
        you add (up to {MAX_IMAGES_PER_PAGE}), cropping each to fit. Descriptions appear as
        numbered captions along the bottom of the page.
      </div>
    </>
  );
}
