# Vice Heat Cover Studio

[![make.fun](https://img.shields.io/badge/make.fun-competition-orange)](https://make.fun)
[![gta6-cover-art-01](https://img.shields.io/badge/gta6--cover--art--01-entry-ff2e63)](https://make.fun/c/gta6-cover-art-01)
[![offline](https://img.shields.io/badge/offline-static%20app-7b2ff7)](https://make.fun)

Turn your photos into a GTA-style multi-panel key-art cover — hero + five panels,
a giant gradient title, neon script subtitle, per-panel place/time captions, and
print ephemera (starburst seal, VOL. tag, 5-star heat meter, press quote, barcode,
tagline strip). Built for the [make.fun](https://make.fun) competition
`gta6-cover-art-01` — join with referral code `46qeyvxn`.

## Try it

```sh
node serve.ts
# open http://localhost:8080
```

No build step, no network: `app/` is plain static files. Upload a photo (it never
leaves your machine) or use the built-in sample photos, pick a layout and a grade,
drag panels to reposition photos, then export a PNG.

## Features

- **9 layouts** — Hero Left, Hero Right, Hero Top, Hero Bottom, Slanted Heat,
  Nine Grid, Full Bleed + Strip, Comic Stack, Wide Banner
- **9 grades** — 8 sunset/neon gradient-map grades (Vice Sunset, Neon Coast,
  Golden Hour, Magenta Night, Teal Dawn, Coral Heat, Violet Dusk, Mono Noir)
  plus **Poster Ink**, a posterized halftone/duotone grade
- **Poster-formula lettering** — gradient Anton title with black outline and slant,
  Pacifico neon script subtitle, editable title / subtitle / tagline
- **Per-panel captions** — place + time on every panel, role sticker on the hero
- **Print ephemera** — starburst seal, VOL. tag, 5-star heat meter, press quote,
  barcode, bottom tagline strip
- **Per-panel crop** — drag to pan, scroll to zoom, or use the zoom/pan sliders;
  click a panel to select it
- **Multi-photo fill** — sample-photo library, one-click fill-all, or upload your
  own photos per panel
- **Surprise me** — random layout, grade, title, captions and photos
- **Undo / redo**
- **PNG export in 4 post sizes** — 1920×1080 landscape, 1080×1350 portrait,
  1080×1080 square, 1080×1920 story

## Files

- `app/index.html` — the app shell
- `app/style.css` — editor styling, Anton + Pacifico `@font-face`
- `app/src/cover.js` — the cover renderer (layouts, grades, lettering, ephemera, export)
- `app/src/main.js` — page wiring (library, crop/drag, Surprise me, undo/redo, export)
- `app/src/shots.js` — fixed scenes for screenshots
- `app/fonts/` — Anton + Pacifico, SIL Open Font License
- `app/samples/` — two AI-made sample photos, free to use (from the make.fun kit)
- `main.ts` — hands the entry in (copies `app/` + `screenshots/` to `/output`, writes `dossier.json`)
- `vendor/makefun-app.ts` — vendored make.fun library, unchanged from the kit

## License

MIT — see [LICENSE](LICENSE). Fonts under `app/fonts/` are SIL OFL 1.1.
No Rockstar artwork, logos, or official fonts are used.
