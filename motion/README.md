# Getaway.gh — motion promo

A 21.5s vertical (1080×1920) promo video, built in code from the site's own
brand tokens so it stays in sync with the product.

```bash
npm install
node render.mjs                 # capture frames + encode  → getaway-promo.mp4
node render.mjs --encode-only   # re-encode existing frames
node render.mjs --fps 60 --out promo-60.mp4
```

## How it works

`scene.html` is a single 1080×1920 page that exposes `window.renderFrame(t)`.
Every animated property is a pure function of `t` — no CSS animations, no
`requestAnimationFrame`. `render.mjs` drives Chromium one timestamp at a time
and screenshots each step, so a render is deterministic and repeatable rather
than a race against the browser's animation clock.

Frames are then encoded with H.264 / `yuv420p`, which is what Instagram,
QuickTime and mobile browsers expect.

## Brand source

Pulled from the app itself, not re-invented:

| Token | Value | From |
|---|---|---|
| `--red` | `#E84422` | `tailwind.config.js` → `vibe-red` |
| `--navy` | `#0E1C40` | `vibe-navy` |
| `--yellow` | `#FBBF24` | `vibe-yellow` |
| Display | Black Han Sans | `fontFamily.display` |
| Accent | Caveat | `fontFamily.cursive` |
| Body | Nunito | `fontFamily.body` |

Copy is taken from the live app: the rotating tagline (`TAGLINES` in
`src/pages/VibeHome.jsx`), the `YOUR NEXT GETAWAY` hero, the search
placeholder, and the activity chips. The stat counters (679 spots,
16 regions, 150+ locations) come from the homepage and README.

Fonts are vendored via `@fontsource/*` rather than the Google Fonts CDN so a
render never depends on network access.

## Editing

Scene windows live in the `S` object at the top of the `<script>` in
`scene.html`; `DURATION` must cover the last one. Each scene is a `.stage`
div, faded by the `stage()` helper and animated in `renderFrame`.

To swap the product shot, replace `../screenshots/home.png` — the browser
frame sizes itself to whatever aspect the image has.
