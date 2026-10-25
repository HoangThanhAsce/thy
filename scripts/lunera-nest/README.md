# Lunera Nest measurement scripts

Tooling used to measure the Canva source and regenerate
`src/components/sites/lunera-nest/data/*.ts`. All browser scripts drive the locally
installed Chrome through Playwright (`channel: 'chrome'`).

Raw measurements live in `docs/research/lunera-nest/raw/`.

```bash
SRC=https://lunera-nest.my.canva.site/template-black-gold-graduation-rsvp
RAW=docs/research/lunera-nest/raw

# 1. Element geometry at the three reference widths (desktop / tablet / mobile)
node scripts/lunera-nest/extract-layout.mjs "$SRC/"       $RAW/p1-d.json 1440 900
node scripts/lunera-nest/extract-layout.mjs "$SRC/"       $RAW/p1-t.json 1024 768
node scripts/lunera-nest/extract-layout.mjs "$SRC/"       $RAW/p1-m.json 390 844
node scripts/lunera-nest/extract-layout.mjs "$SRC/page-2" $RAW/p2-d.json 1440 900
node scripts/lunera-nest/extract-layout.mjs "$SRC/page-2" $RAW/p2-t.json 1024 768
node scripts/lunera-nest/extract-layout.mjs "$SRC/page-2" $RAW/p2-m.json 390 844

# 2. Entrance animations (desktop)
node scripts/lunera-nest/record-animations.mjs "$SRC/"       $RAW/anim-p1.json 1440 900
node scripts/lunera-nest/record-animations.mjs "$SRC/page-2" $RAW/anim-p2.json 1440 900

# 3. Typed layout data + inline SVG assets
node scripts/lunera-nest/generate-data.mjs

# 4. Verification against a running clone (npm run dev)
node scripts/lunera-nest/compare-sections.mjs "$SRC/page-2" \
  http://localhost:3000/template-black-gold-graduation-rsvp/page-2 1440 900 /tmp/p2-1440
node scripts/lunera-nest/check-interactions.mjs http://localhost:3000
node scripts/lunera-nest/montage.mjs out.png 1600 2 a.png b.png
```

Notes:

- Each extraction takes a few minutes: Canva virtualises sections, so the script scrolls
  through the page and waits for animations to settle at every step.
- `generate-data.mjs` holds the manual pieces: alt text, letter-animation timings
  that the recorder misses for late sections, and Canva font id → local font key.
- Page 1 is "fit to screen"; its mobile intrinsic height (591.7px at 390px wide) was
  measured at 390×600 and is passed to the generator as `mobileH0`.
- Media and fonts were downloaded once with `curl` from the source `_assets/` paths
  (see `docs/research/lunera-nest/asset-map.md`); the scripts do not re-download them.
