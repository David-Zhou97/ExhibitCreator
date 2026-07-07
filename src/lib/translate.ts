/** Translate all exhibit copy (titles, descriptions, labels, captions) into
 *  the exhibit's output language with Claude, right before PDF export.
 *  Runs directly from the browser with a user-provided API key. */

import Anthropic from "@anthropic-ai/sdk";
import type { Exhibit } from "./types";
import { langOf } from "./lang";

const MODEL = "claude-opus-4-8";
const KEY_STORAGE = "exhibit-creator:anthropic-key";

export const loadApiKey = () => localStorage.getItem(KEY_STORAGE) ?? "";
export const saveApiKey = (key: string) => localStorage.setItem(KEY_STORAGE, key.trim());

interface Segment {
  id: string;
  text: string;
}

const OUTPUT_SCHEMA = {
  type: "object",
  properties: {
    translations: {
      type: "array",
      items: {
        type: "object",
        properties: {
          id: { type: "string" },
          text: { type: "string" },
        },
        required: ["id", "text"],
        additionalProperties: false,
      },
    },
  },
  required: ["translations"],
  additionalProperties: false,
} as const;

/** Returns a copy of the exhibit with every `…Tr` field (re)filled. */
export async function translateExhibit(exhibit: Exhibit, apiKey: string): Promise<Exhibit> {
  const segments: Segment[] = [];
  const add = (id: string, text: string) => {
    if (text.trim()) segments.push({ id, text: text.trim() });
  };
  add("title", exhibit.title);
  add("subtitle", exhibit.subtitle);
  for (const p of exhibit.pages) {
    add(`page:${p.id}:title`, p.title);
    add(`page:${p.id}:desc`, p.description);
    for (const im of p.images) {
      add(`img:${im.id}:label`, im.label);
      add(`img:${im.id}:desc`, im.description);
    }
  }
  if (segments.length === 0) return exhibit;

  const from = langOf(exhibit.inputLang);
  const to = langOf(exhibit.outputLang);

  const client = new Anthropic({ apiKey, dangerouslyAllowBrowser: true });
  let response: Anthropic.Message;
  try {
    response = await client.messages.create({
      model: MODEL,
      max_tokens: 16000,
      thinking: { type: "adaptive" },
      system:
        `You translate the copy of a bilingual art-book exhibit from ${from.english} to ${to.english}. ` +
        `The exhibit showcases AI model capabilities; the copy consists of titles, short gallery ` +
        `descriptions, image plate labels, and captions. Translate each segment naturally, in a ` +
        `polished tone suited to a printed gallery catalogue. Keep labels as short as the original. ` +
        `Return one translation per input segment, preserving each segment's id exactly.`,
      messages: [{ role: "user", content: JSON.stringify({ segments }) }],
      output_config: { format: { type: "json_schema", schema: OUTPUT_SCHEMA } },
    });
  } catch (err) {
    if (err instanceof Anthropic.AuthenticationError)
      throw new Error("The API key was rejected — check it and try again.");
    if (err instanceof Anthropic.RateLimitError)
      throw new Error("Rate limited by the API — wait a moment and try again.");
    if (err instanceof Anthropic.APIConnectionError)
      throw new Error("Could not reach the Anthropic API — check your connection.");
    throw err;
  }

  if (response.stop_reason === "refusal") throw new Error("The translation request was declined.");
  if (response.stop_reason === "max_tokens")
    throw new Error("The book is too large to translate in one pass.");

  const text = response.content.find((b) => b.type === "text");
  if (!text || text.type !== "text") throw new Error("The model returned no translation.");

  const parsed = JSON.parse(text.text) as { translations: Segment[] };
  const byId = new Map(parsed.translations.map((t) => [t.id, t.text]));
  const tr = (id: string): string | undefined => byId.get(id)?.trim() || undefined;

  return {
    ...exhibit,
    titleTr: tr("title"),
    subtitleTr: tr("subtitle"),
    pages: exhibit.pages.map((p) => ({
      ...p,
      titleTr: tr(`page:${p.id}:title`),
      descriptionTr: tr(`page:${p.id}:desc`),
      images: p.images.map((im) => ({
        ...im,
        labelTr: tr(`img:${im.id}:label`),
        descriptionTr: tr(`img:${im.id}:desc`),
      })),
    })),
    updatedAt: Date.now(),
  };
}

/** Exhibit with all translations removed (for "export original only"). */
export function stripTranslations(exhibit: Exhibit): Exhibit {
  return {
    ...exhibit,
    titleTr: undefined,
    subtitleTr: undefined,
    pages: exhibit.pages.map((p) => ({
      ...p,
      titleTr: undefined,
      descriptionTr: undefined,
      images: p.images.map((im) => ({ ...im, labelTr: undefined, descriptionTr: undefined })),
    })),
  };
}
