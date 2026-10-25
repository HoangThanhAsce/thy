# Asset map

Source base: `https://lunera-nest.my.canva.site/template-black-gold-graduation-rsvp/_assets/`

All media were verified as real PNG files (signature + dimensions) after download.

| Source path | Local path | Notes |
| --- | --- | --- |
| `media/<hash>.png` (29 files) | `public/sites/lunera-nest/media/<hash>.png` | same file names as the source |
| `fonts/<hash>.woff` (9 files) | `public/sites/lunera-nest/fonts/<hash>.woff` | mapping in `page-brief.md` |
| inline SVG blobs (pins, gift icons, sparkles) | `public/sites/lunera-nest/svg/<sha1>.svg` | fetched from the page's `blob:` URLs |

Key media:

| File | Use |
| --- | --- |
| `91728ea41002a89ccf70a5cbd94e02ef.png` (1535×1024) | leafy shadow background (page 1, page 2 sections 1, 3, 5, 7) |
| `ef57de5a47ac051e60e971b6fd2b5b94.png` (800×533) | envelope with wax seal |
| `ae0cf166f84c95175c5a57a6e7b0c985.png` (600×800) | graduate portrait (clipped frame) |
| `23f2b95a286d68332955398288d1cdaa.png` (799×533) | Willow Creek Estate photo (rounded frame) |
| `6bc24934a664208a608ee2a81ad32bc5.png` (799×599) | cap with gold roses |
| `35daef838cbf7dd689a7e0235e688682.png` (800×533) | gift box with laurel |

Not reproduced:

- Canva footer ("Terms & Support", "Privacy Policy", "Designed with Canva") and the
  Canva favicon — platform branding, not part of the design.
- `_assets/video/*.mp4` — luma-matte masks for Canva's sticker wipe effect.
- tickcounter.com and Canva Forms iframes — rebuilt as local components.

Replaced by the site owner:

| Source file | Local path | Notes |
| --- | --- | --- |
| `media/ae0cf166f84c95175c5a57a6e7b0c985.png` (portrait) | `public/sites/lunera-nest/media/graduate-portrait.jpg` | owner's photo, JPEG 1280×854 |
