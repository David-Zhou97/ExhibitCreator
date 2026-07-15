import { useState } from "react";
import { BookOpen, EyeOff, Plus, Trash2 } from "lucide-react";
import { newExhibit, formatDate, type Cover, type Exhibit, type Language } from "../lib/types";
import { Button, cls, CoverPicker, Field, IconBtn, isBrandCover, LangBadge, LangChips, Modal, Wordmark } from "../components/ui";

export function Home({
  exhibits,
  onOpen,
  onCreate,
  onDelete,
}: {
  exhibits: Exhibit[];
  onOpen: (id: string) => void;
  onCreate: (exhibit: Exhibit) => void;
  onDelete: (id: string) => void;
}) {
  const [creating, setCreating] = useState(false);
  const sorted = [...exhibits].sort((a, b) => b.updatedAt - a.updatedAt);

  return (
    <div>
      <header className="top-nav">
        <Wordmark />
        <span className="app-name-tag">Exhibit Creator</span>
      </header>

      <div className="home-wrap">
        <section className="home-hero">
          <div className="home-hero-light" />
          <div className="home-hero-copy">
            <div className="home-hero-overline">Internal · Model Capabilities</div>
            <h1 className="home-hero-title">Show what our models can do</h1>
            <p className="home-hero-sub">
              Craft art-book exhibits of model capabilities — pick your language pair, arrange
              your results beautifully, and share the whole book as a PDF.
            </p>
            <Button variant="on-brand" size="lg" icon={Plus} onClick={() => setCreating(true)}>
              New exhibit
            </Button>
          </div>
          <img className="home-hero-mio" src="/brand/mio-mascot.png" alt="Mio" />
        </section>

        {sorted.length === 0 ? (
          <div className="empty-state">
            <img src="/brand/mio-mascot.png" alt="" />
            <h2>Your creative journey starts here</h2>
            <p>No exhibits yet — create your first one and turn model outputs into art.</p>
            <Button variant="generate" icon={Plus} onClick={() => setCreating(true)}>
              Create your first exhibit
            </Button>
          </div>
        ) : (
          <>
            <div className="section-head">
              <div>
                <h2 className="section-title">Your exhibits</h2>
                <div className="section-sub">Saved locally in this browser.</div>
              </div>
            </div>
            <div className="ex-grid">
              {sorted.map((ex) => (
                <ExhibitCard key={ex.id} exhibit={ex} onOpen={() => onOpen(ex.id)} onDelete={() => onDelete(ex.id)} />
              ))}
              <button type="button" className="new-card" onClick={() => setCreating(true)}>
                <Plus size={22} strokeWidth={1.75} />
                New exhibit
              </button>
            </div>
          </>
        )}
      </div>

      {creating && (
        <NewExhibitModal
          onClose={() => setCreating(false)}
          onCreate={(ex) => {
            setCreating(false);
            onCreate(ex);
          }}
        />
      )}
    </div>
  );
}

function ExhibitCard({
  exhibit,
  onOpen,
  onDelete,
}: {
  exhibit: Exhibit;
  onOpen: () => void;
  onDelete: () => void;
}) {
  return (
    <div className="ex-card" onClick={onOpen} role="button" tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && onOpen()}>
      <div className="ex-cover">
        {exhibit.cover.kind === "image" ? (
          <img className="full" src={exhibit.cover.src} alt="" />
        ) : exhibit.incognito ? (
          <div className="ex-cover-gradient ink">
            <EyeOff size={28} strokeWidth={1.5} />
          </div>
        ) : (
          <>
            <div className="ex-cover-gradient" />
            <img className="ex-cover-mio" src="/brand/mio-mascot.png" alt="" />
          </>
        )}
      </div>
      <IconBtn
        className="ex-del"
        icon={Trash2}
        danger
        label="Delete exhibit"
        onClick={(e) => {
          e.stopPropagation();
          if (confirm(`Delete “${exhibit.title || "Untitled exhibit"}”? This can't be undone.`)) onDelete();
        }}
      />
      <div className="ex-body">
        <div className="ex-title">{exhibit.title.trim() || "Untitled exhibit"}</div>
        <div className="ex-meta">
          <LangBadge input={exhibit.inputLang} output={exhibit.outputLang} />
          <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
            <BookOpen size={12} strokeWidth={1.75} />
            {exhibit.pages.length} {exhibit.pages.length === 1 ? "page" : "pages"}
          </span>
          <span>·</span>
          <span>{formatDate(exhibit.updatedAt)}</span>
        </div>
      </div>
    </div>
  );
}

function NewExhibitModal({
  onClose,
  onCreate,
}: {
  onClose: () => void;
  onCreate: (exhibit: Exhibit) => void;
}) {
  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [inputLang, setInputLang] = useState<Language>("en");
  const [outputLang, setOutputLang] = useState<Language>("ja");
  const [cover, setCover] = useState<Cover>({ kind: "gradient" });
  const [incognito, setIncognito] = useState(false);

  function setMode(inc: boolean) {
    setIncognito(inc);
    // Brand key-art covers don't exist in incognito mode.
    if (inc && isBrandCover(cover)) setCover({ kind: "gradient" });
  }

  return (
    <Modal title="New exhibit" onClose={onClose}>
      <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
        <Field label="Title">
          <input
            className="input"
            autoFocus
            placeholder="e.g. Translation quality — spring release"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </Field>
        <Field label="Subtitle (optional)">
          <input
            className="input"
            placeholder="A short line for the cover"
            value={subtitle}
            onChange={(e) => setSubtitle(e.target.value)}
          />
        </Field>
        <Field label="Mode">
          <div className="chip-row">
            <button type="button" className={cls("chip", !incognito && "active")} onClick={() => setMode(false)}>
              PixAI branded
            </button>
            <button type="button" className={cls("chip", incognito && "active")} onClick={() => setMode(true)}>
              Incognito
            </button>
          </div>
        </Field>
        {incognito && (
          <div className="inspector-note">
            Incognito removes all PixAI branding and stamps a “Strictly Confidential”
            watermark across every page of the book, including the exported PDF.
          </div>
        )}
        <Field label="Input language">
          <LangChips value={inputLang} onChange={setInputLang} />
        </Field>
        <Field label="Output language">
          <LangChips value={outputLang} onChange={setOutputLang} />
        </Field>
        <Field label="Cover image">
          <CoverPicker value={cover} onChange={setCover} incognito={incognito} />
        </Field>
      </div>
      <div className="modal-foot">
        <Button variant="dim" onClick={onClose}>
          Cancel
        </Button>
        <Button
          variant="generate"
          icon={Plus}
          disabled={!title.trim()}
          onClick={() =>
            onCreate(
              newExhibit({
                title: title.trim(),
                subtitle: subtitle.trim(),
                inputLang,
                outputLang,
                cover,
                incognito,
              }),
            )
          }
        >
          Create exhibit
        </Button>
      </div>
    </Modal>
  );
}
