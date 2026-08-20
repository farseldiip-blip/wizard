# COFFEE WIZARD — The Ritual

A cinematic, single-page brand experience for **Coffee Wizard**, a nocturnal coffee house. The page is a scroll-driven story: a 100-frame hero animation scrubs in sync with the scroll, animated typography enters and hands off to a branch selector and a booking call-to-action — all with a dark "quiet luxury" art direction.

> Built with vanilla HTML, CSS and JavaScript. No frameworks, no build step, no runtime dependencies.

## Features

- **Cinematic scroll-driven hero** — a 100-frame video sequence (`assets/videos/coffee_hero.mp4`) scrubbed frame-by-frame as the user scrolls, reversing on scroll-up. Frame 0 is shown on load; the video never autoplays.
- **Animated typography** — the hero eyebrow, title, subtext and CTA enter with a subtle rise and de-blur, hold, then hand off upward — all driven by the same scroll progress as the frames.
- **Branch selection** — choose between **Alexandria** and **Mansoura** from either the hero selector or the menu pills; pricing, gallery, contact and socials update instantly and persist in `localStorage`.
- **Booking CTA** — a "Book Now" action resolves to the selected branch's real `tel:` link.
- **WhatsApp ordering** — tapping a menu product opens a pre-filled WhatsApp order for the active branch.
- **Responsive & mobile-friendly** — fluid `clamp()` typography and layouts from 320px to desktop; no horizontal overflow.
- **Accessible** — semantic markup, `role="radiogroup"` with keyboard navigation, skip-link, ARIA labels, focus states, and `prefers-reduced-motion` support for the scroll-reveal animations.
- **WebGL shader (source)** — a simplex-noise flow-field shader is included in `js/shader.js` as a reference hero treatment (not currently mounted; the site ships the video-scrub hero).

## Tech Stack

- HTML
- CSS (custom properties, `clamp()`, grid/flexbox)
- JavaScript (vanilla ES, IntersectionObserver, ResizeObserver, `localStorage`)
- Google Fonts: Libre Caslon Text, Hanken Grotesk, Material Symbols

## Project Structure

```
├── index.html              # Single-page markup
├── css/
│   └── styles.css          # Design system (tokens) + component styles
├── js/
│   ├── app.js              # Rendering, hero scrubber, interactions
│   ├── data.js             # Single source of truth: branches, menu, gallery
│   └── shader.js           # Reference WebGL hero shader (unmounted)
├── assets/
│   ├── images/             # Logos, gallery, products, hero poster
│   ├── videos/
│   │   └── coffee_hero.mp4 # 100-frame, all-keyframe hero animation
│   └── frames/             # Source frames (frame-000 … frame-099) of the hero
└── .gitignore
```

## Getting Started

The site is static — there is nothing to install or build. Because the hero **seeks the video by HTTP Range requests**, serve the folder over HTTP rather than opening `index.html` from disk.

```bash
# Any static server works:
python -m http.server 8080
# or
npx serve .
```

Then open http://localhost:8080

## Deployment (GitHub Pages)

1. Push the repository to GitHub.
2. Repository **Settings → Pages**.
3. **Source**: *Deploy from a branch* → **main** → root (`/`).
4. Save. The site goes live at `https://<user>.github.io/<repo>/`.

All asset paths are relative, so the site works from any repo sub-path with no extra configuration.

## Notes

- The deployed hero uses the compiled `assets/videos/coffee_hero.mp4` (720×1280, 30 fps, 100 frames). The original frames live in `assets/frames/` as source material.
- Branch data (names, phones, WhatsApp, socials, pricing) is intentionally stored in `js/data.js` — the single place to edit real-world contact details.