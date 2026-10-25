// node scripts/lunera-nest/compare-sections.mjs <sourceUrl> <localUrl> <w> <h> <outPrefix>
// Captures every section of source and local at the same viewport after entrance animations settle.
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const { chromium } = require('playwright');
const [src, local, w, h, out] = process.argv.slice(2);
const browser = await chromium.launch({ channel: 'chrome' });

async function capture(url, isSource) {
  const page = await browser.newPage({ viewport: { width: +w, height: +h } });
  const errors = [];
  page.on('console', m => { if (m.type() === 'error') errors.push(m.text().slice(0, 200)); });
  page.on('pageerror', e => errors.push('pageerror ' + e.message.slice(0, 200)));
  page.on('response', r => { if (r.status() >= 400) errors.push(`${r.status()} ${r.url().slice(0, 150)}`); });
  await page.goto(url, { waitUntil: 'load', timeout: 60000 });
  await page.waitForTimeout(3500);
  const sel = isSource ? 'section' : '[data-section]';
  const n = await page.$$eval(sel, s => s.length);
  const info = [];
  for (let i = 0; i < n; i++) {
    if (isSource) {
      for (let k = 0; k < 3; k++) { await page.$eval('.ZRRuDw', (e, i) => { const s = document.querySelectorAll('section')[i]; e.scrollTop += s.getBoundingClientRect().top - 48; }, i); await page.waitForTimeout(300); }
    } else {
      await page.evaluate(i => { const s = document.querySelectorAll('[data-section]')[i]; window.scrollTo(0, s.getBoundingClientRect().top + scrollY - 48); }, i);
    }
    await page.waitForTimeout(4200);
    const el = (await page.$$(sel))[i];
    const box = await el.boundingBox();
    info.push(`${i}: ${Math.round(box.width)}x${Math.round(box.height)}`);
    // clip to the visible viewport area under the nav
    const clipH = Math.min(box.height, +h - 48);
    await page.screenshot({ path: `${out}-${isSource ? 'src' : 'loc'}-${i}.png`, clip: { x: 0, y: 48, width: +w, height: clipH } });
    if (box.height > +h - 48) {
      // second capture for the remainder of tall sections
      if (isSource) await page.$eval('.ZRRuDw', (e, d) => { e.scrollTop += d; }, box.height - (+h - 48));
      else await page.evaluate(d => window.scrollBy(0, d), box.height - (+h - 48));
      await page.waitForTimeout(600);
      await page.screenshot({ path: `${out}-${isSource ? 'src' : 'loc'}-${i}b.png`, clip: { x: 0, y: 48, width: +w, height: +h - 48 } });
    }
  }
  console.log(isSource ? 'SOURCE' : 'LOCAL', info.join(' | '), errors.length ? '\n  errors: ' + errors.join('\n  ') : '');
  await page.close();
  return n;
}
await capture(src, true);
await capture(local, false);
await browser.close();
