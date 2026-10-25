// Captures the 1200×630 link-preview image from page 1 of a running site.
// node scripts/lunera-nest/capture-og-image.mjs <baseUrl> [out=public/sites/lunera-nest/og-image.jpg]
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const { chromium } = require('playwright');
const [base, out = 'public/sites/lunera-nest/og-image.jpg'] = process.argv.slice(2);
const browser = await chromium.launch({ channel: 'chrome' });
// 1440px layout scaled to 1200 wide: a 1440x756 slice becomes 1200x630
const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1200 / 1440 });
await page.goto(base + '/ThiMBAgraduate/', { waitUntil: 'load' });
await page.waitForTimeout(4500);
const box = await page.evaluate(() => {
  const r = [...document.querySelectorAll('[data-section] .ln-text, [data-section] .ln-el')].map(e => e.getBoundingClientRect()).filter(r => r.width < 1000);
  return { top: Math.min(...r.map(x => x.top)), bottom: Math.max(...r.map(x => x.bottom)) };
});
const mid = (box.top + box.bottom) / 2;
const y = Math.max(48, Math.round(mid - 378));
console.log('content', Math.round(box.top), Math.round(box.bottom), 'clip y', y);
await page.screenshot({ path: out, type: 'jpeg', quality: 88, clip: { x: 0, y, width: 1440, height: 756 } });
await browser.close();
