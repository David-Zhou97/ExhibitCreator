import { useRef, type ReactNode, type ButtonHTMLAttributes } from "react";
import { ArrowRight, Check, Upload, X, type LucideIcon } from "lucide-react";
import type { Cover, Language } from "../lib/types";
import { LANGUAGES, langOf } from "../lib/lang";
import { readImageFile } from "../lib/images";

export const cls = (...parts: Array<string | false | null | undefined>) =>
  parts.filter(Boolean).join(" ");

/* ---- Button -------------------------------------------------------------- */

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "generate" | "soft" | "dim" | "on-brand";
  size?: "sm" | "md" | "lg";
  icon?: LucideIcon;
  block?: boolean;
};

export function Button({
  variant = "primary",
  size = "md",
  icon: Icon,
  block,
  className,
  children,
  ...rest
}: ButtonProps) {
  return (
    <button
      className={cls(
        "btn",
        `btn-${variant}`,
        size !== "md" && `btn-${size}`,
        block && "btn-block",
        className,
      )}
      {...rest}
    >
      {Icon && <Icon size={size === "sm" ? 14 : 16} strokeWidth={1.75} />}
      {children}
    </button>
  );
}

export function IconBtn({
  icon: Icon,
  danger,
  label,
  size = 16,
  className,
  ...rest
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  icon: LucideIcon;
  danger?: boolean;
  label: string;
  size?: number;
}) {
  return (
    <button
      className={cls("icon-btn", danger && "danger", className)}
      title={label}
      aria-label={label}
      {...rest}
    >
      <Icon size={size} strokeWidth={1.75} />
    </button>
  );
}

/* ---- Field / Modal -------------------------------------------------------- */

export function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="field">
      <span className="field-label">{label}</span>
      {children}
    </div>
  );
}

export function Modal({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: ReactNode;
}) {
  return (
    <div className="modal-scrim" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal" role="dialog" aria-label={title}>
        <div className="modal-head">
          <span className="modal-title">{title}</span>
          <IconBtn icon={X} label="Close" onClick={onClose} />
        </div>
        {children}
      </div>
    </div>
  );
}

/* ---- Brand ----------------------------------------------------------------- */

export function Wordmark() {
  return (
    <div className="wordmark-row">
      <img src="/brand/pixai-logo-mark.svg" alt="PixAI" style={{ width: 28, height: 28 }} />
      <span className="wordmark-text">
        Pix<span className="fill-gradient">AI</span>
      </span>
    </div>
  );
}

export function LangBadge({ input, output }: { input: Language; output: Language }) {
  return (
    <span className="lang-badge">
      {langOf(input).short}
      <ArrowRight size={11} strokeWidth={2.25} />
      {langOf(output).short}
    </span>
  );
}

/* ---- Language picker -------------------------------------------------------- */

export function LangChips({
  value,
  onChange,
  exclude,
}: {
  value: Language;
  onChange: (lang: Language) => void;
  /** Hide one language (e.g. the source language in a target picker). */
  exclude?: Language;
}) {
  return (
    <div className="chip-row">
      {LANGUAGES.filter((l) => l.code !== exclude).map((l) => (
        <button
          key={l.code}
          type="button"
          className={cls("chip", value === l.code && "active")}
          onClick={() => onChange(l.code)}
        >
          {l.native}
        </button>
      ))}
    </div>
  );
}

/* ---- Cover picker ------------------------------------------------------------ */

const COVER_PRESETS = [
  "/brand/mio-portrait.png",
  "/brand/bg-pastel-sky.png",
  "/brand/key-art-fireplace.png",
  "/brand/key-art-lanterns.png",
];

export function CoverPicker({
  value,
  onChange,
}: {
  value: Cover;
  onChange: (cover: Cover) => void;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const isPreset = value.kind === "image" && COVER_PRESETS.includes(value.src);
  const isCustom = value.kind === "image" && !isPreset;

  async function onUpload(files: FileList | null) {
    if (!files?.[0]) return;
    try {
      onChange({ kind: "image", src: (await readImageFile(files[0])).src });
    } catch (err) {
      alert((err as Error).message);
    }
  }

  return (
    <div className="cover-opts">
      <button
        type="button"
        className={cls("cover-opt", "gradient", value.kind === "gradient" && "sel")}
        title="PixAI brand gradient"
        onClick={() => onChange({ kind: "gradient" })}
      >
        <img
          src="/brand/mio-mascot.png"
          alt=""
          style={{ objectFit: "contain", objectPosition: "bottom", padding: "8px 0 0" }}
        />
        {value.kind === "gradient" && <Sel />}
      </button>
      {COVER_PRESETS.map((src) => (
        <button
          key={src}
          type="button"
          className={cls("cover-opt", value.kind === "image" && value.src === src && "sel")}
          title="Brand key art"
          onClick={() => onChange({ kind: "image", src })}
        >
          <img src={src} alt="" />
          {value.kind === "image" && value.src === src && <Sel />}
        </button>
      ))}
      <button
        type="button"
        className={cls("cover-opt", !isCustom && "upload", isCustom && "sel")}
        title="Upload a cover image"
        onClick={() => fileRef.current?.click()}
      >
        {isCustom ? <img src={(value as { src: string }).src} alt="" /> : <Upload size={18} strokeWidth={1.75} />}
        {isCustom && <Sel />}
      </button>
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        hidden
        onChange={(e) => {
          void onUpload(e.target.files);
          e.target.value = "";
        }}
      />
    </div>
  );
}

const Sel = () => (
  <span className="cover-opt-check">
    <Check size={11} strokeWidth={3} />
  </span>
);
