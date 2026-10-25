// Builds the link-preview image from the owner's invitation card, cropped below the
// date line so the address and phone numbers stay out of the preview.
// node scripts/lunera-nest/make-og-image.mjs <info.jpg> [out] [cropHeight=1274] [width=1200]
import { createRequire } from 'node:module';
import fs from 'node:fs';
const require = createRequire(import.meta.url);
const { chromium } = require('playwright');
const [src, out = 'public/sites/lunera-nest/og-invitation.jpg', cropH = '1274', outW = '1200'] = process.argv.slice(2);
const b64 = fs.readFileSync(src).toString('base64');
const browser = await chromium.launch({ channel: 'chrome' });
const page = await browser.newPage();
const data = await page.evaluate(async ([b64, cropH, outW]) => {
  const img = new Image(); img.src = 'data:image/jpeg;base64,' + b64; await img.decode();
  const scale = outW / img.naturalWidth;
  const c = document.createElement('canvas'); c.width = outW; c.height = Math.round(cropH * scale);
  const ctx = c.getContext('2d'); ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(img, 0, 0, img.naturalWidth, cropH, 0, 0, c.width, c.height);
  return { url: c.toDataURL('image/jpeg', 0.88), w: c.width, h: c.height };
}, [b64, +cropH, +outW]);
fs.writeFileSync(out, Buffer.from(data.url.split(',')[1], 'base64'));
console.log('wrote', out, data.w, 'x', data.h);
await browser.close();
