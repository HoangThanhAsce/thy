# Lunera Nest — Black & Gold Graduation RSVP

Source: Canva-published site (authorized for reproduction, see `TARGET.md`).

## Route map

| Source | Local route | Owner |
| --- | --- | --- |
| `https://lunera-nest.my.canva.site/template-black-gold-graduation-rsvp/` | `/ThiMBAgraduate` | `src/app/ThiMBAgraduate/page.tsx` |
| `https://lunera-nest.my.canva.site/template-black-gold-graduation-rsvp/page-2` | `/ThiMBAgraduate/page-2` | `src/app/ThiMBAgraduate/page-2/page.tsx` |
| — | `/` | redirects to page 1 (`src/app/page.tsx`) |

Shared code lives in `src/components/sites/lunera-nest/`; assets in `public/sites/lunera-nest/`.

## How the source is built

- Canva "website" output: every section is an artboard with absolutely positioned
  elements (images, shapes drawn as clip-path + SVG stroke, lines, text boxes, embeds).
  Positions are computed by Canva's runtime per viewport, not by CSS.
- The page scrolls inside `.ZRRuDw` (an inner scroller under a 48px sticky nav).
  Sections are virtualised: only sections near the viewport are mounted.
- Nav: `Page 1` / `Page 2`, Times New Roman MT 15px, `rgb(48,66,84)`, inactive items
  `opacity: .7` (hover → 1), active item bold. Bottom border `#00000012`.

### Responsive rule (measured)

| Viewport width | Layout | Scale of one design px |
| --- | --- | --- |
| ≥ ~1096px | desktop artboard, design width 1366, centred | `min(1, vw / 1366)` |
| 768 – 1095px | Canva reflow (tablet sample at 1024) | 0.9278 @768 … 0.9677 @1024 … 0.9753 @1090 |
| < 768px | Canva reflow (mobile sample at 390) | 0.7537 @320, 0.7998 @390, 0.8868 @600 |

Sampled scale points: 320 .7537 · 360 .7816 · 390 .7998 · 430 .8212 · 500 .8524 ·
600 .8868 · 700 .9131 · 800 .9339 · 900 .9508 · 1024 .9677 · 1090 .9753; 1099 → .8045 (desktop).

- Page 1's section is "fit to screen": height = max(content, viewport − 48px). Extra
  height is distributed 5/9 above and 4/9 below the content (verified at 1440×900/1200
  and 390×600/844).
- Page 2 sections have fixed heights (desktop 1061 · 521 · 922 · 835 · 1257 · 642 · 832).
- Full-bleed photos are centred cover fits, sometimes overscanned ("bleed" factor).
- On mobile the widest elements are clamped to 92vw (envelope, RSVP form).

## Sections

Page 1 — `invite`: script "You're Invited!" (Andasia 48), divider, "Olivia Carter"
(The Seasons 48, tracking .072em), "CLASS OF 2026" (Times 18.67, tracking .126em,
`#ae8d65`), black envelope with wax seal (links to page 2), divider, "OPEN INVITATION".

Page 2:
1. `graduate` — cap image, "MEET THE GRADUATE", framed portrait, name, class line,
   "A NEW CHAPTER BEGINS", two-line caption.
2. `song` — dark (`#1e1e1e`) music player drawn from shapes/lines/images; a YouTube
   player (`ebhw7Kk1Cbw`) sits on top at opacity 0, so the play button starts the song.
3. `save-the-date` — script title, date block with two 1px dividers, venue card
   (photo, "Willow Creek Estate", address, VIEW LOCATION → Google Maps search).
4. `countdown` — dark; tickcounter widget counting to 2027-07-01 00:00
   America/Los_Angeles, stops at zero; script captions with roses image.
5. `rsvp` — "RSVP" (Cooper BT), Canva Forms element (583×928 source units): name,
   attendance (2 options), guests (3 options), message, Submit RSVP.
6. `thank-you` — dark; script "Thank You!", captions, ornament, "CLASS OF 2026".
7. `gift` — gift icon, "CONGRATULATE THE Graduate", gift card (Cash App $YourName),
   "Cheers to NEW BEGINNINGS".

## Fonts (files served by the source)

| Canva id | Family | Weights used → file |
| --- | --- | --- |
| YAFcfkb7jcU | Times New Roman MT | 400 `5da9fdda…`, 700 `46eea847…` |
| YAFdJnPX3ZE | The Seasons | 400 `8dcc63e6…` |
| YAFcfiBJMjY | Cooper BT | 300/400 → Light `f76edc00…` |
| YAD87jbyiH0 | Amsterdam Four | 400 `89b176a7…` |
| YAD87vDtOPY | Amsterdam Three | 400 `7edd5476…` |
| YAEl4-ppXpY | Andasia | 400 `2e051da8…` |
| YAFdJqtgR5I | Hagrid Text (form) | 400 `232659a7…`, 600/700 → Bold `c403b003…` |

## Motion (measured with mutation timelines, desktop)

Each section plays its entrance when it enters the viewport (once).

| Type | Behaviour | Typical timing |
| --- | --- | --- |
| wipe | text revealed left→right by a sliding mask | 1.5–3.5s, ease-out (≈ .88 progress at half time) |
| rise | translateY ≈ 78px → 0 with fade | 0.7–1.1s, ease-out |
| fade | opacity 0 → 1 | 0.5s |
| pop | scale .75 → 1 with fade | 0.7s |
| lift | text slides up inside its box | ~1s, strong ease-out |
| letters | per-letter opacity stagger (`--q1eooA`) | 1–2.2s total |
| zoom | gift icon 0.9 → 1.03 → 1 with fade | ~2s |
| pulse | play button scale .86 ↔ 1.12, infinite | 0.86s period |

Canva also plays luma-matte video wipes (mp4 masks) on two sticker images; the clone
shows those images without the mask effect.
