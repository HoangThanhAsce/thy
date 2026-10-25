# Verification (2026-10-25)

Comparisons were made with Playwright driving local Chrome, source and clone at the
same viewport and scroll position, after entrance animations settled. Montages are in
`docs/design-references/lunera-nest/` (left = source, right = clone).

## Section heights (px)

| Viewport | Page | Source | Clone |
| --- | --- | --- | --- |
| 1440×900 | 1 | 909 | 909 |
| 1440×900 | 2 | 1061 · 521 · 922 · 835 · 1257 · 642 · 832 | identical |
| 1024×768 | 1 | 875 | 875 |
| 1024×768 | 2 | 1027 · 504 · 882 · 791 · 1214 · 619 · 805 | identical |
| 390×844 | 1 | 796 | 796 |
| 390×844 | 2 | 827 · 407 · 707 · 620 · 822 · 497 · 656 | identical |

## Behaviour checked

- `/` redirects to page 1; nav active/hover states; `Page 1` ⇄ `Page 2` client navigation.
- Envelope click opens page 2 (source behaviour).
- VIEW LOCATION opens the source's Google Maps search in a new tab.
- Hidden YouTube player sits on the play button (hit test returns the iframe).
- Countdown ticks every second toward 2027-07-01 00:00 PDT.
- RSVP: radio options select, validation messages, success message; no network requests.
- Every section reveals on scroll; no element left hidden after a full wheel scroll.
- No horizontal overflow at 320, 390, 600, 768, 1024, 1200, 1440, 1920, 2560.
- Console: only a WebGPU warning emitted inside the YouTube iframe.
- `npm run check` passes (lint, typecheck, production build).

## Known differences

- The Canva footer bar is omitted, so the last section cannot scroll quite to the top
  of the viewport (36px less scroll range).
- RSVP form: the source widget fails to load and prints "We couldn't load the form";
  the clone shows a working local form instead and leaves that line empty until submit.
  Selected-option styling is not observable on the source and was designed to match.
- The two animated stickers (caps in "song" and "thank you") appear without Canva's
  luma-matte video wipe.
- Between reference widths the reflow is an interpolation of Canva's sampled scale
  curve. Exact at 390 / 1024 / 1440; mobile widths far from 390 (≈ 500–767px) render
  wide elements (envelope, form) smaller than Canva, which clamps them to 92vw.
- Entrance animations use measured types, delays and durations with CSS easing curves
  fitted to the observed mid-point progress; frame-exact timing is not guaranteed.

## Personalisation (2026-10-26)

The clone is now the owner's own invitation, so it intentionally differs from the
Canva source in these places (overrides live in `scripts/lunera-nest/generate-data.mjs`):

- Routes moved to `/ThiMBAgraduate` and `/ThiMBAgraduate/page-2`; the old
  `/template-black-gold-graduation-rsvp/*` paths redirect there (301, `public/_redirects`).
- Name "Olivia Carter" → "Anh Thy"; portrait replaced by the owner's photo
  (`media/graduate-portrait.jpg`, cropped into the frame instead of stretched).
- Date block → WEDNESDAY · NOV 11 2026 · AT 9:00 AM; countdown targets
  2026-11-11 09:00 (UTC+7).
- Venue → ĐH Tài chính - Marketing, 306 Võ Văn Hát, P. Long Trường, TP. Hồ Chí Minh;
  VIEW LOCATION opens https://maps.app.goo.gl/zBwXqjNHn8JVH3hL7.
- The Canva "Times New Roman MT" files lack ư ờ ạ ọ ồ, so Tinos (metric-compatible,
  Google Fonts, `--font-ln-vi`) supplies those glyphs.
- The venue photo is still the source's estate image.
