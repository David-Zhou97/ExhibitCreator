# PixAI Design System

A brand & UI design system for **PixAI** — the AI anime art generator by Mewtant Inc.

> "Bright · Anime-inspired · Soft Future Tech" — 明亮感 / 二次元感 / 科技轻未来感

## About PixAI

<cite index="3-13,3-14,3-15">PixAI is a specialized AI art generator focused on creating high-quality anime and ACG-style artwork, offering a wide range of AI generation tools to help you generate customizable anime characters and illustrations effortlessly — for personal creativity, inspiration, or professional projects.</cite>

Key capabilities include <cite index="2-7,2-8,2-9,2-10,2-11">Model Market with exclusive LoRA models, powerful editing tools (inpaint/outpaint), and online LoRA/Character/Style template training</cite>, plus <cite index="2-20">the all-new "Animate" feature that creates captivating videos from static images.</cite>

Platforms: **web (pixai.art)**, **iOS / macOS / visionOS**, and **Android**.

## Sources used to build this system

The only provided materials were:

| File | What it is |
|---|---|
| `uploads/20260222-152742.png` | App icon / logo mark (white "P" glyph on dark rounded-square) |
| `uploads/Mio.png` | **Mio** — the official PixAI cat-girl mascot (full-body illustration) |
| `uploads/PixAI-Rounded-4.0-Black.otf` | Custom display font — Black weight (wordmark, hero headlines) |
| `uploads/PixAI-Rounded-4.0-Medium.otf` | Custom display font — Medium weight (display copy) |
| `uploads/PixAI-Rounded-4.0-Light.otf` | Custom display font — Light weight (subtitles, delicate headings) |

No codebase, Figma link, or screenshot library was provided — so the UI kit in this system is an **impressionistic recreation** of pixai.art based on the public product description and brand direction, not a pixel-perfect fork of the shipping UI. Flag: if you want this to match production exactly, please attach the PixAI frontend codebase or a Figma link.

The brand tokens (colors, gradient, font) come from the spec in the project kickoff.

## Visual keywords

- **明亮感 / Bright** — high-value whites and lights, airy layouts, plenty of breathing room, vivid accent pops.
- **二次元感 / Anime-inspired** — Mio the mascot, soft rounded forms, pastel purples and warm pinks, kawaii signals without leaning on emoji.
- **科技轻未来感 / Soft Future Tech** — subtle glassmorphism, soft glows, tri-color gradient accents, rounded-geometric type — futuristic but friendly, never harsh or cyberpunk.

---

## Content Fundamentals

### Voice

- **Warm, encouraging, creator-first.** Readers are treated as artists with a vision who just need help getting it out of their head.
- **You-focused, never "we" as a wall.** Copy addresses the reader directly: "Your creative journey starts here," "Turn ideas into art."
- **Invitational, not instructional.** Features are framed as doors ("Unlock…", "Discover…", "Unleash…") rather than commands.
- **Concrete, not hype-y.** It talks about what you can do (train a LoRA of your OC, animate a still, win a contest) rather than abstract "AI revolution" platitudes.

### Tone

- Bright and can-do. Excited without shouting.
- A little dreamy on marketing surfaces ("the masterpiece in your mind deserves to be seen"); practical and plain in the app itself ("Generate", "Credits left: 1,200").
- Never condescending about skill level. Beginner-friendly framing is a core promise.

### Casing

- **Title Case for feature names and page headings** — "Model Market", "Image-to-Video", "LoRA Training".
- **Sentence case for body copy and buttons**, with key nouns capitalized when referring to specific features.
- Use **◆** (black diamond) or **/** as section dividers in long-form marketing copy (pulled from the App Store listing style).

### Pronouns

- **"You"** for the reader — always.
- **"We"** used sparingly, for the PixAI team's commitments ("We recommend…", "We're thrilled…").
- **"I"** never — this is a product voice, not a single-human voice.

### Emoji

- **Rarely used in UI.** Marketing copy and release notes may use a sparse ❤ / 🤩 / ✨ but the product interface itself is emoji-light.
- When a glyph is needed (credits, premium, contests), a **custom icon or the Mio mascot** carries the load instead of an emoji.

### Vibe examples (pulled from live product copy)

- "Turn ideas into art"
- "Your creative journey starts here"
- "The masterpiece in your mind deserves to be seen"
- "Anime style, realistic, fantasy — anything goes"
- "No barriers, no pressure, just pure creativity"
- "Can't find one? Create your own."

Notice the rhythm: short declarative → longer promise → intimate one-liner. Copy often ends with an imperative invitation ("Start creating for free", "Join the Arena").

---

## Visual Foundations

### Color

Two parallel palettes: a **light-mode** set built around royal purple + pink accent, and a **dark-mode** set that shifts toward deeper violets. A signature tri-color gradient is reserved for hero banners and CTA moments.

**Brand palette (light)**
- `pixPurple` `#7E22CE` — primary
- `pixPurpleLite` `#B27AE2` — supporting
- `pixPurpleSuperLite` `#EEE5F6` — surface wash
- `pixPinkAccent` `#F75C75` — alert / accent

**Brand palette (dark)**
- `pixPurpleDark` `#8B27AE`
- `pixPurpleLiteDark` `#B27AE2`
- `pixPurpleSuperLiteDark` `#3B2250`
- `pixPinkDark` `#FB7188`

**Signature gradient** (hero banners, premium CTAs, membership surfaces):
`#9535EA → #EA79F1 → #FB7188`

Neutrals trend **cool-white** (not pure `#fff`) with a faint lavender tint to harmonize with the purples.

### Typography

- **Display / Logo / Hero headlines** — `PixAI Rounded` (custom, three weights: Light 300, Medium 500, Black 900). Black is the logo/wordmark weight; Medium works for display subheads; Light for delicate oversize treatments.
- **UI + Body** — `Roboto` (400, 500, 700). Clean, neutral, broadly legible across CJK + Latin locales (PixAI ships in 16+ languages).
- **Numeric / credits** — Roboto, tabular numerals, medium weight.

Scale is generous: hero 56–80px, H1 40px, H2 28px, body 15–16px, caption 12–13px.

### Spacing

A 4px base grid with a t-shirt scale: `2, 4, 8, 12, 16, 20, 24, 32, 48, 64, 96, 128`. Cards and major containers prefer 16–24px internal padding; hero sections 64–96px.

### Corner radii

Strongly rounded, to echo the rounded logo and the "soft future tech" vibe:
- `xs` 6px (chips, inline tags)
- `sm` 10px (inputs, small buttons)
- `md` 16px (cards)
- `lg` 24px (large modals, hero cards)
- `xl` 32px (feature panels)
- `full` 9999px (pill buttons, avatars)

### Backgrounds

- Primary surfaces are **off-white with a lavender undertone** (`#FBF8FE`) — never stark `#fff`.
- Feature / hero surfaces use **the signature tri-color gradient** diagonally (135°), sometimes softened behind a frosted-glass panel.
- Secondary accent surfaces use `pixPurpleSuperLite` (`#EEE5F6`) as a wash.
- Hand-drawn illustrations (Mio, mascot variants) float on neutral surfaces with a soft violet drop shadow rather than being contained in cards.
- No repeating patterns; the "texture" comes from mascot art + soft glow gradients.

### Animation

- **Easing:** `cubic-bezier(0.22, 1, 0.36, 1)` (ease-out-quart) for most in/out; `cubic-bezier(0.34, 1.56, 0.64, 1)` (gentle overshoot) for playful moments like adding to favorites.
- **Duration:** 180ms for micro-interactions, 260ms for panel transitions, 400–600ms for hero reveals.
- **No bouncy physics on critical flows.** Generate button glows and pulses softly while working.
- **Shimmer loaders** on image grids while generation is in progress (cool-white → lavender → cool-white sweep).

### Hover / press states

- **Hover:** +6% lightness on fills, +2px soft shadow lift, and for primary CTAs a faint outer glow in `pixPurpleLite`.
- **Press:** scale to 0.97 with 80ms ease-in; no color shift.
- **Focus:** 2px outline in `pixPurple` with 2px offset — always visible, never removed.

### Borders

- **Hairline 1px** in `rgba(126, 34, 206, 0.12)` on cards when needed, but the system prefers soft shadows over borders.
- **Inputs** use a 1.5px border in a cool gray (`#E7E3EC`), focus to `pixPurple`.

### Shadows

Soft, violet-tinted — never pure gray.

- `shadow-xs` `0 1px 2px rgba(126, 34, 206, 0.06)`
- `shadow-sm` `0 2px 8px rgba(126, 34, 206, 0.08)`
- `shadow-md` `0 8px 24px rgba(126, 34, 206, 0.12)`
- `shadow-lg` `0 20px 48px rgba(126, 34, 206, 0.18)`
- `shadow-glow` `0 0 32px rgba(234, 121, 241, 0.45)` — reserved for premium / generate CTAs

### Transparency & blur

- **Glassmorphism used sparingly** on floating toolbars, the top nav on image viewers, and premium upsell sheets — `backdrop-filter: blur(20px) saturate(1.2)` over a 70% white surface.
- Modal scrims are `rgba(26, 10, 40, 0.6)` (deep violet, not black).

### Imagery style

- **Warm-leaning pastels** with a hint of cool shadow. Never desaturated or cold B&W.
- Anime portraits are the primary image type — full-body mascots on neutral BG, or square character cards from the model market.
- No photographic imagery on brand surfaces.

### Cards

- 16px radius, soft violet shadow, no border by default.
- On hover: lifts 2px, shadow deepens, and a 1px gradient outline fades in on premium / featured cards.
- Image cards crop to their container with no internal padding; content cards use 20px padding.

### Layout rules

- **Fixed top nav** (64px tall) on the web app with frosted-glass blur when scrolled.
- **Fixed left rail** (72–240px, collapsible) holding primary nav on desktop.
- **Mobile** uses a bottom tab bar (5 slots) and a floating "Generate" FAB in the center.

### Protection gradients vs capsules

- Text over imagery uses a **bottom-to-top dark-violet protection gradient** (`rgba(26,10,40,0) → rgba(26,10,40,0.75)`).
- Where a single label floats over varied imagery, a **frosted pill capsule** is preferred over a protection gradient.

---

## Iconography

No icon font was provided in the uploads, so this system uses **Lucide** (`https://unpkg.com/lucide@latest`) as a CDN-linked substitute — it has the same soft rounded stroke personality as pixai.art's own icons. Stroke width: `1.75px`. Typical size: 20px in UI, 24px in nav rails, 16px inline.

**Flag:** If you have the real PixAI icon sprite / SVG library, drop it into `assets/icons/` and this doc should be updated to point at that instead.

Emoji: not used as a UI primitive.
Unicode glyphs: used for the ◆ bullet and ★ in rating chips only.

Raster imagery (logo mark, Mio mascot) lives in `assets/`.

---

## Index — what's in this folder

```
README.md                     ← you are here
SKILL.md                      ← Agent Skill manifest (for Claude Code users)
colors_and_type.css           ← design tokens (CSS vars + @font-face)
fonts/
  PixAI-Rounded-4.0-Light.otf
  PixAI-Rounded-4.0-Medium.otf
  PixAI-Rounded-4.0-Black.otf
assets/
  pixai-logo-mark.svg         ← app icon / "P" glyph (vector)
  pixai-logo-lockup.png       ← horizontal mark + wordmark
  mio-mascot.png              ← Mio cat-girl mascot (transparent bg, full body)
  mio-portrait.png            ← Mio close-up hero key art (16:9)
  bg-pastel-sky.png           ← pastel sky backdrop (16:9)
  key-art-fireplace.png       ← winter/holiday hero illustration
  key-art-lanterns.png        ← festival/new-year hero illustration
preview/                      ← small cards that populate the Design System tab
  logo.html, color-brand.html, color-gradient.html, ...
ui_kits/
  web/
    index.html                ← interactive recreation of the PixAI web app
    *.jsx                     ← reusable components
    README.md
```

### Quick-start for agents

1. Read `colors_and_type.css` for tokens.
2. Import the font via `@font-face` (already declared in that CSS file) — use `Roboto` from Google Fonts for body, `PixAI Rounded Black` only for logotype / special hero moments.
3. Copy imagery from `assets/` into your own project when building artifacts.
4. For components, use `ui_kits/web/*.jsx` as a starting point — they are **impressionistic**, not production-accurate.
