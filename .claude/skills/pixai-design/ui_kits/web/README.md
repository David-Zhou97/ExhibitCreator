# PixAI Web UI Kit

Impressionistic recreation of the PixAI web app. **Not a production fork** — no real codebase or Figma was available, so components are cosmetic stand-ins based on the public product description and brand spec.

## Components
- `Primitives.jsx` — `Icon`, `Wordmark`, `Button`, `Chip`, `CreditPill`
- `Navigation.jsx` — `TopNav` (frosted glass, credit pill, upgrade CTA), `SideRail`
- `PromptComposer.jsx` — prompt + negative prompt + style chips + model picker + batch + generate
- `ImageGrid.jsx` — masonry-style result grid with hover protection gradient + shimmer loader
- `Hero.jsx` — `HeroBanner` (tri-color gradient + Mio), `SectionHeader`

## Running
Open `index.html` directly. Uses React 18 + Babel (via CDN) and Lucide icons (via CDN).

## Known gaps
- No real auth, real generation, or API integration — click Generate to see the shimmer loader and a fake result batch.
- Model Market, Gallery, and Contest tabs are not implemented beyond the nav state.
- Icons are Lucide substitutes; swap for real PixAI icon sprite when available.
