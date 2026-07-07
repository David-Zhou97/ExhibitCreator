import { useEffect, useRef, useState, type ReactNode } from "react";
import {
  ArrowLeft, Check, ChevronDown, ChevronUp, FileDown, ImagePlus,
  Languages, Loader2, Plus, Trash2, X,
} from "lucide-react";
import {
  arrayMove, newPage, uid,
  type Exhibit, type ExhibitImage, type ExhibitPage,
} from "../lib/types";
import { readImageFile } from "../lib/images";
import { MAX_IMAGES_PER_PAGE, plateNo } from "../lib/layout";
import { exportBookPdf, pdfFilename } from "../lib/pdf";
import { hasTranslations, loadApiKey, saveApiKey, translateExhibit } from "../lib/translate";
import { langOf } from "../lib/lang";
import { CoverCanvas, PAGE_H, PAGE_W, PageCanvas, Scaled } from "../components/PageCanvas";
import { Button, cls, CoverPicker, Field, IconBtn, LangBadge, LangChips, Modal, Wordmark } from "../components/ui";

type Selection = "cover" | string; // page id

type ExportState =
  | { phase: "translate" }
  | { phase: "render"; exhibit: Exhibit; translated: boolean; done: number; total: number };

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
  const [showExport, setShowExport] = useState(false);
  const [exporting, setExporting] = useState<ExportState | null>(null);
  /** Which language version of the book is shown in the editor. */
  const [viewTr, setViewTr] = useState(false);
  const exportRef = useRef<HTMLDivElement>(null);
  const exportStarted = useRef(false);

  const translatable = hasTranslations(exhibit);
  const translated = viewTr && translatable;

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
      const imported = await Promise.all(list.slice(0, Math.max(room, 0)).map(readImageFile));
      const images: ExhibitImage[] = imported.map((imp) => ({
        id: uid(),
        ...imp,
        label: "",
        description: "",
      }));
      patchPage(page.id, { images: [...page.images, ...images] });
    } catch (err) {
      alert((err as Error).message);
    }
  }

  const patchImage = (page: ExhibitPage, imgId: string, p: Partial<ExhibitImage>) =>
    patchPage(page.id, { images: page.images.map((im) => (im.id === imgId ? { ...im, ...p } : im)) });

  /* ---- PDF export ---- */
  async function startExport(translate: boolean, apiKey: string) {
    setShowExport(false);
    const total = exhibit.pages.length + 1;
    if (!translate) {
      setExporting({ phase: "render", exhibit, translated: false, done: 0, total });
      return;
    }
    setExporting({ phase: "translate" });
    try {
      const next = await translateExhibit(exhibit, apiKey);
      onChange(next); // keep translations in the saved exhibit
      setViewTr(true); // switch the editor to the translated view
      setExporting({ phase: "render", exhibit: next, translated: true, done: 0, total });
    } catch (err) {
      console.error(err);
      alert(`Translation failed: ${(err as Error).message}`);
      setExporting(null);
    }
  }

  useEffect(() => {
    if (exporting?.phase !== "render" || exportStarted.current || !exportRef.current) return;
    exportStarted.current = true;
    (async () => {
      try {
        await exportBookPdf(exportRef.current!, pdfFilename(exhibit.title), (done, total) =>
          setExporting((s) => (s?.phase === "render" ? { ...s, done, total } : s)),
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
          onChange={(e) => patch({ title: e.target.value, titleTr: undefined })}
        />
        <div style={{ flex: 1 }} />
        {translatable && (
          <div className="lang-toggle" role="group" aria-label="Book language">
            <button
              type="button"
              className={cls("lang-toggle-opt", !viewTr && "active")}
              onClick={() => setViewTr(false)}
            >
              {langOf(exhibit.inputLang).native}
            </button>
            <button
              type="button"
              className={cls("lang-toggle-opt", viewTr && "active")}
              onClick={() => setViewTr(true)}
            >
              {langOf(exhibit.outputLang).native}
            </button>
          </div>
        )}
        <LangBadge input={exhibit.inputLang} output={exhibit.outputLang} />
        <span className="save-hint">
          <Check size={12} strokeWidth={2.5} /> Saved locally
        </span>
        <Button
          variant="generate"
          size="sm"
          icon={exporting ? Loader2 : FileDown}
          disabled={!!exporting}
          onClick={() => setShowExport(true)}
        >
          {!exporting
            ? "Export PDF"
            : exporting.phase === "translate"
              ? "Translating…"
              : `Rendering ${exporting.done}/${exporting.total}…`}
        </Button>
      </header>

      <div className="editor-grid">
        {/* ---- Page rail ---- */}
        <aside className="rail">
          <div className="rail-section">Book</div>
          <div className="thumb-wrap">
            <button type="button" className={cls("thumb", sel === "cover" && "sel")} onClick={() => setSel("cover")}>
              <Scaled width={160}>
                <CoverCanvas exhibit={exhibit} translated={translated} />
              </Scaled>
            </button>
            <div className="thumb-label">Cover</div>
          </div>
          {exhibit.pages.map((page, i) => (
            <div className="thumb-wrap" key={page.id}>
              <button type="button" className={cls("thumb", sel === page.id && "sel")} onClick={() => setSel(page.id)}>
                <Scaled width={160}>
                  <PageCanvas exhibit={exhibit} page={page} pageNo={i + 1} pageCount={exhibit.pages.length + 1} editing translated={translated} />
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
            <CoverCanvas exhibit={exhibit} translated={translated} />
          ) : (
            <PageCanvas
              exhibit={exhibit}
              page={selPage}
              pageNo={selPageIndex + 1}
              pageCount={exhibit.pages.length + 1}
              editing
              translated={translated}
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

      {showExport && (
        <ExportModal exhibit={exhibit} onClose={() => setShowExport(false)} onExport={startExport} />
      )}

      {/* Offscreen full-size book render for PDF capture */}
      {exporting?.phase === "render" && (
        <div ref={exportRef} aria-hidden style={{ position: "absolute", top: 0, left: -2 * PAGE_W, width: PAGE_W }}>
          <div data-book-page>
            <CoverCanvas exhibit={exporting.exhibit} translated={exporting.translated} />
          </div>
          {exporting.exhibit.pages.map((page, i) => (
            <div data-book-page key={page.id}>
              <PageCanvas
                exhibit={exporting.exhibit}
                page={page}
                pageNo={i + 1}
                pageCount={exporting.exhibit.pages.length + 1}
                translated={exporting.translated}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ---- Export modal ---- */

function ExportModal({
  exhibit,
  onClose,
  onExport,
}: {
  exhibit: Exhibit;
  onClose: () => void;
  onExport: (translate: boolean, apiKey: string) => void;
}) {
  const [apiKey, setApiKey] = useState(loadApiKey);
  const output = langOf(exhibit.outputLang);
  const sameLang = exhibit.inputLang === exhibit.outputLang;

  function exportTranslated() {
    saveApiKey(apiKey);
    onExport(true, apiKey.trim());
  }

  return (
    <Modal title="Export PDF" onClose={onClose}>
      <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
        {sameLang ? (
          <div className="inspector-note">
            Input and output language are both {output.native}, so there is nothing to
            translate — the book exports as written.
          </div>
        ) : (
          <>
            <div className="inspector-note">
              Claude can translate the book's text — titles, gallery descriptions, plate
              labels and captions — into <b>{output.native}</b> and export the translated
              book. Afterwards you can flip between the original and translated views with
              the language toggle in the top bar. Translations are regenerated on each
              translated export.
            </div>
            <Field label="Anthropic API key">
              <input
                className="input"
                type="password"
                placeholder="sk-ant-…"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
              />
            </Field>
            <div className="inspector-note">
              The key is stored only in this browser and sent only to the Anthropic API.
            </div>
          </>
        )}
      </div>
      <div className="modal-foot">
        <Button variant="dim" onClick={onClose}>
          Cancel
        </Button>
        <Button variant={sameLang ? "generate" : "soft"} icon={FileDown} onClick={() => onExport(false, "")}>
          {sameLang ? "Export PDF" : "Export original"}
        </Button>
        {!sameLang && (
          <Button variant="generate" icon={Languages} disabled={!apiKey.trim()} onClick={exportTranslated}>
            Translate & export
          </Button>
        )}
      </div>
    </Modal>
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
          onChange={(e) => patch({ title: e.target.value, titleTr: undefined })} />
      </Field>
      <Field label="Subtitle">
        <input className="input" value={exhibit.subtitle} placeholder="A short line for the cover"
          onChange={(e) => patch({ subtitle: e.target.value, subtitleTr: undefined })} />
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
          onChange={(e) => patchPage(page.id, { title: e.target.value, titleTr: undefined })} />
      </Field>

      <Field label="Description (optional)">
        <textarea
          className="textarea"
          rows={3}
          placeholder="Introduce this gallery — what do these results show?"
          value={page.description}
          onChange={(e) => patchPage(page.id, { description: e.target.value, descriptionTr: undefined })}
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
              <div className="img-row-main" style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <input
                  className="input input-sm"
                  placeholder={`Label (default ${plateNo(i)})`}
                  value={im.label}
                  onChange={(e) => patchImage(page, im.id, { label: e.target.value, labelTr: undefined })}
                />
                <textarea
                  className="textarea"
                  rows={2}
                  placeholder="Describe this image…"
                  value={im.description}
                  onChange={(e) => patchImage(page, im.id, { description: e.target.value, descriptionTr: undefined })}
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
        Frames follow each image's orientation — wide images get wide frames, tall images
        tall ones — and fill the page automatically (up to {MAX_IMAGES_PER_PAGE}). Labels
        replace the plate numbers on the page; descriptions appear as captions along the
        bottom.
      </div>
    </>
  );
}
