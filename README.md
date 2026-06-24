# Saathi — marketing site

A single-page marketing site for **Saathi**, a voice-first accessibility layer for the
phone people already own. Static HTML/CSS/JS — no build step.

Design: bold-hybrid — dark cinematic canvas with a warm, trustworthy accent (deep green +
gold), big Fraunces display type over accessible Atkinson Hyperlegible body text. Inspired
structurally by landonorris.com, re-skinned for Saathi's brand.

## Files
- `index.html` — all page markup
- `styles.css` — full design system + responsive layout
- `main.js` — scroll reveals, stat count-up, nav state, waitlist form (client-side)

## Local preview
Open `index.html` directly, or serve the folder:

```bash
npx serve .
```

## Hosting (Render — static site)
- **Build command:** `echo "static, no build"`
- **Publish directory:** `./`

Deploys automatically on every push to `main`.
