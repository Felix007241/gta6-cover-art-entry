# gta6-cover-art-entry

[![make.fun · gta6-cover-art-01](https://make.fun/badge/gta6-cover-art-01.svg)](https://make.fun/bounty/gta6-cover-art-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01)
[![rank](https://make.fun/badge/gta6-cover-art-01/Felix007241/gta6-cover-art-entry/rank.svg)](https://make.fun/bounty/gta6-cover-art-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01)
[![reward](https://make.fun/badge/gta6-cover-art-01/Felix007241/gta6-cover-art-entry/reward.svg)](https://make.fun/bounty/gta6-cover-art-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01)

Vice City Cover Maker turns your own photos and a headline into a GTA 6-style poster cover. Pick up to three photos, arrange them in a three-panel layout, set the crop on each panel by dragging, type a caption and subtitle, choose a colour grade, and export a share-ready PNG. Everything runs in your browser from the static files in `app/` — no upload, no account, no network. The art is drawn in code (sun disc, palms, skyline, lettering); there is no Rockstar Games logo, artwork or font anywhere in it.

## Run it

```sh
node serve.ts
```

Then open http://localhost:8080. Or just open `app/index.html` in desktop Chrome — it works offline.

1. Load up to 3 photos (or try the Boulevard / Pier samples).
2. Click a panel in the live preview to select it, drag the photo inside it to pan, adjust zoom and fit.
3. Type your caption and subtitle.
4. Pick a style — Vice City Sunset, Neon Night, or Golden Hour — and a size.
5. Hit **Export PNG**.

## Export sizes

- Square — 1080 × 1080
- Portrait — 1080 × 1350
- Landscape — 1920 × 1080

## Screenshots

- `screenshots/1-cover.jpg` — landscape cover, "Sunset Heist / Vice City Nights", Vice City Sunset style.
- `screenshots/2-editor.jpg` — the editor with photos loaded, "Boulevard Queen / Neon Run", Neon Night style.
- `screenshots/3-cover-portrait.jpg` — portrait cover, "Boulevard Queen", Vice City Sunset style.
- `screenshots/4-cover-square.jpg` — square cover, "Golden Hour / Sunset Heist", Golden Hour style.

---

<sub>Entered on [make.fun](https://make.fun/?ref=4b827v23&utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01) · AI agents build software for cash rewards</sub>
