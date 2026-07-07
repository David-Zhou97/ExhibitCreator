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

interface ExportState {
  exhibit: Exhibit;
  translated: boolean;
  done: number;
  total: number;
}

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
  const [showTranslate, setShowTranslate] = useState(false);
  const [showExport, setShowExport] = useState(false);
  const [translating, setTranslating] = useState(false);
  const [exporting, setExporting] = useState<ExportState | null>(null);
  /** Which language version of the book is shown in the editor. */
  const [viewTr, setViewTr] = useState(false);
  const exportRef = useRef<HTMLDivElement>(null);
  const exportStarted = useRef(false);

  const translatable = hasTranslations(exhibit);
  const translated = viewTr && translatable;
  const sameLang = exhibit.inputLang === exhibit.outputLang;

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

  /* ---- Translation ---- */
  async function startTranslate(apiKey: string) {
    setShowTranslate(false);
    if (
      translatable &&
      !confirm("Re-translating replaces the current translations, including any manual edits. Continue?")
    )
      return;
    setTranslating(true);
    try {
      const next = await translateExhibit(exhibit, apiKey);
      onChange(next); // translations are stored on the exhibit
      setViewTr(true); // switch the editor to the translated view for review
    } catch (err) {
      console.error(err);
      alert(`Translation failed: ${(err as Error).message}`);
    } finally {
      setTranslating(false);
    }
  }

  /* ---- PDF export ---- */
  const startExport = (asTranslated: boolean) => {
    setShowExport(false);
    setExporting({
      exhibit,
      translated: asTranslated,
      done: 0,
      total: exhibit.pages.length + 1,
    });
  };

  useEffect(() => {
    if (!exporting || exportStarted.current || !exportRef.current) return;
    exportStarted.current = true;
    (async () => {
      try {
        await exportBookPdf(exportRef.current!, pdfFilename(exhibit.title), (done, total) =>
          setExporting((s) => (s ? { ...s, done, total } : s)),
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
          value={translated ? exhibit.titleTr ?? "" : exhibit.title}
          placeholder={translated ? exhibit.title : "Untitled exhibit"}
          onChange={(e) =>
            patch(translated ? { titleTr: e.target.value } : { title: e.target.value })
          }
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
        {!sameLang && (
          <Button
            variant="soft"
            size="sm"
            icon={translating ? Loader2 : Languages}
            disabled={translating || !!exporting}
            onClick={() => setShowTranslate(true)}
          >
            {translating ? "Translating…" : translatable ? "Re-translate" : "Translate"}
          </Button>
        )}
        <Button
          variant="generate"
          size="sm"
          icon={exporting ? Loader2 : FileDown}
          disabled={!!exporting || translating}
          onClick={() => setShowExport(true)}
        >
          {exporting ? `Rendering ${exporting.done}/${exporting.total}…` : "Export PDF"}
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
            <CoverInspector exhibit={exhibit} patch={patch} translated={translated} />
          ) : (
            <PageInspector
              page={selPage}
              index={selPageIndex}
              patchPage={patchPage}
              patchImage={patchImage}
              addImages={addImages}
              translated={translated}
              outputLang={langOf(exhibit.outputLang).short}
            />
          )}
        </aside>
      </div>

      {showTranslate && (
        <TranslateModal
          exhibit={exhibit}
          onClose={() => setShowTranslate(false)}
          onTranslate={startTranslate}
        />
      )}
      {showExport && (
        <ExportModal
          exhibit={exhibit}
          hasTr={translatable}
          onClose={() => setShowExport(false)}
          onExport={startExport}
        />
      )}

      {/* Offscreen full-size book render for PDF capture */}
      {exporting && (
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

/* ---- Translate modal ---- */

function TranslateModal({
  exhibit,
  onClose,
  onTranslate,
}: {
  exhibit: Exhibit;
  onClose: () => void;
  onTranslate: (apiKey: string) => void;
}) {
  const [apiKey, setApiKey] = useState(loadApiKey);
  const output = langOf(exhibit.outputLang);

  function translate() {
    saveApiKey(apiKey);
    onTranslate(apiKey.trim());
  }

  return (
    <Modal title={`Translate into ${output.native}`} onClose={onClose}>
      <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
        <div className="inspector-note">
          Claude translates the book's text — titles, gallery descriptions, plate labels and
          captions — into <b>{output.native}</b>. Afterwards the editor switches to the
          translated view, where you can review and edit every translation before exporting;
          the language toggle in the top bar flips between the two versions.
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
      </div>
      <div className="modal-foot">
        <Button variant="dim" onClick={onClose}>
          Cancel
        </Button>
        <Button variant="generate" icon={Languages} disabled={!apiKey.trim()} onClick={translate}>
          Translate
        </Button>
      </div>
    </Modal>
  );
}

/* ---- Export modal ---- */

function ExportModal({
  exhibit,
  hasTr,
  onClose,
  onExport,
}: {
  exhibit: Exhibit;
  hasTr: boolean;
  onClose: () => void;
  onExport: (asTranslated: boolean) => void;
}) {
  const output = langOf(exhibit.outputLang);
  const sameLang = exhibit.inputLang === exhibit.outputLang;

  return (
    <Modal title="Export PDF" onClose={onClose}>
      <div className="inspector-note">
        {sameLang
          ? "The book exports as written."
          : hasTr
            ? `Export the book as written, or the ${output.native} version you reviewed. ` +
              "Fields without a translation fall back to the original text."
            : `To export a ${output.native} version, use Translate in the top bar first, ` +
              "review the result, then export."}
      </div>
      <div className="modal-foot">
        <Button variant="dim" onClick={onClose}>
          Cancel
        </Button>
        <Button
          variant={sameLang || !hasTr ? "generate" : "soft"}
          icon={FileDown}
          onClick={() => onExport(false)}
        >
          {sameLang ? "Export PDF" : "Export original"}
        </Button>
        {!sameLang && hasTr && (
          <Button variant="generate" icon={FileDown} onClick={() => onExport(true)}>
            Export {output.native}
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
  translated,
}: {
  exhibit: Exhibit;
  patch: (p: Partial<Exhibit>) => void;
  translated: boolean;
}) {
  const out = langOf(exhibit.outputLang).short;
  return (
    <>
      <div className="inspector-title">Cover</div>
      {translated && (
        <div className="inspector-note">
          Editing the <b>{langOf(exhibit.outputLang).native}</b> translation — the original
          text is shown as a placeholder when a field is empty.
        </div>
      )}
      <Field label={translated ? `Title (${out})` : "Title"}>
        <input
          className="input"
          value={translated ? exhibit.titleTr ?? "" : exhibit.title}
          placeholder={translated ? exhibit.title : "Untitled exhibit"}
          onChange={(e) =>
            patch(translated ? { titleTr: e.target.value } : { title: e.target.value })
          }
        />
      </Field>
      <Field label={translated ? `Subtitle (${out})` : "Subtitle"}>
        <input
          className="input"
          value={translated ? exhibit.subtitleTr ?? "" : exhibit.subtitle}
          placeholder={translated ? exhibit.subtitle : "A short line for the cover"}
          onChange={(e) =>
            patch(translated ? { subtitleTr: e.target.value } : { subtitle: e.target.value })
          }
        />
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
  translated,
  outputLang,
}: {
  page: ExhibitPage;
  index: number;
  patchPage: (id: string, p: Partial<ExhibitPage>) => void;
  patchImage: (page: ExhibitPage, imgId: string, p: Partial<ExhibitImage>) => void;
  addImages: (page: ExhibitPage, files: FileList | null) => Promise<void>;
  translated: boolean;
  outputLang: string;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const room = MAX_IMAGES_PER_PAGE - page.images.length;

  return (
    <>
      <div className="inspector-title">Page {plateNo(index)}</div>
      {translated && (
        <div className="inspector-note">
          Editing the <b>{outputLang}</b> translation — the original text is shown as a
          placeholder when a field is empty.
        </div>
      )}
      <Field label={translated ? `Page title (${outputLang})` : "Page title"}>
        <input
          className="input"
          value={translated ? page.titleTr ?? "" : page.title}
          placeholder={translated ? page.title : "Untitled page"}
          onChange={(e) =>
            patchPage(page.id, translated ? { titleTr: e.target.value } : { title: e.target.value })
          }
        />
      </Field>

      <Field label={translated ? `Description (${outputLang})` : "Description (optional)"}>
        <textarea
          className="textarea"
          rows={3}
          placeholder={
            translated
              ? page.description
              : "Introduce this gallery — what do these results show?"
          }
          value={translated ? page.descriptionTr ?? "" : page.description}
          onChange={(e) =>
            patchPage(
              page.id,
              translated ? { descriptionTr: e.target.value } : { description: e.target.value },
            )
          }
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
                  placeholder={translated ? im.label || plateNo(i) : `Label (default ${plateNo(i)})`}
                  value={translated ? im.labelTr ?? "" : im.label}
                  onChange={(e) =>
                    patchImage(
                      page,
                      im.id,
                      translated ? { labelTr: e.target.value } : { label: e.target.value },
                    )
                  }
                />
                <textarea
                  className="textarea"
                  rows={2}
                  placeholder={translated ? im.description : "Describe this image…"}
                  value={translated ? im.descriptionTr ?? "" : im.description}
                  onChange={(e) =>
                    patchImage(
                      page,
                      im.id,
                      translated
                        ? { descriptionTr: e.target.value }
                        : { description: e.target.value },
                    )
                  }
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
