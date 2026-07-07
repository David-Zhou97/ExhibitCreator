---
name: pixai-design
description: Use this skill to generate well-branded interfaces and assets for PixAI, either for production or throwaway prototypes/mocks/etc. Contains essential design guidelines, colors, type, fonts, assets, and UI kit components for prototyping.
user-invocable: true
---

Read the README.md file within this skill, and explore the other available files.

Key files:
- `README.md` — brand overview, content fundamentals, visual foundations, iconography
- `colors_and_type.css` — drop-in CSS tokens (@font-face for PixAI Rounded Light/Medium/Black, Roboto import, color + shadow + radius + spacing vars, semantic type classes)
- `fonts/` — PixAI Rounded Light / Medium / Black OTFs
- `assets/` — logo mark PNG, Mio mascot PNG (transparent background)
- `ui_kits/web/` — JSX components for the PixAI web app (TopNav, SideRail, PromptComposer, ImageGrid, HeroBanner, primitives)
- `preview/` — small card demos of every token / component

If creating visual artifacts (slides, mocks, throwaway prototypes, etc), copy assets out and create static HTML files for the user to view. If working on production code, you can copy assets and read the rules here to become an expert in designing with this brand.

If the user invokes this skill without any other guidance, ask them what they want to build or design, ask some questions, and act as an expert designer who outputs HTML artifacts _or_ production code, depending on the need.

Brand voice in one line: bright, anime-inspired, soft future tech — warm and creator-first, "you"-focused, never emoji-heavy. Use the signature tri-color gradient (#9535EA → #EA79F1 → #FB7188) sparingly for hero/premium moments. Default to Roboto for UI; reserve PixAI Rounded for logotype and tentpole headlines.
