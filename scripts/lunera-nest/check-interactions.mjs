// node scripts/lunera-nest/check-interactions.mjs [baseUrl] [screenshotDir]
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const { chromium } = require('playwright');
const BASE = process.argv[2] ?? 'http://localhost:3100';
const OUT = process.argv[3] ?? (await import('node:os')).tmpdir();
const browser = await chromium.launch({ channel: 'chrome' });
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await ctx.newPage();
const errors = [];
const external = [];
page.on('console', m => { if (m.type() === 'error' || m.type() === 'warning') errors.push(`${m.type()}: ${m.text().slice(0, 200)}`); });
page.on('pageerror', e => errors.push('pageerror ' + e.message));
page.on('request', r => { const u = new URL(r.url()); if (!['localhost', '127.0.0.1'].includes(u.hostname)) external.push(r.method() + ' ' + u.host); });
const log = (...a) => console.log(...a);

await page.goto(BASE + '/', { waitUntil: 'load' });
log('root redirect ->', new URL(page.url()).pathname);
await page.waitForTimeout(3500);
log('nav active:', await page.$$eval('.ln-nav li', ls => ls.map(l => `${l.textContent}:${l.hasAttribute('data-active')}:${getComputedStyle(l).opacity}:${getComputedStyle(l).fontWeight}`)));
// hover inactive item
await page.hover('.ln-nav li:not([data-active]) a'); await page.waitForTimeout(250);
log('hover inactive opacity:', await page.$eval('.ln-nav li:not([data-active])', l => getComputedStyle(l).opacity));
// all animated elements visible after settle
log('hidden after settle (p1):', await page.$$eval('[data-anim]', els => els.filter(e => +getComputedStyle(e).opacity < 0.99).map(e => e.className)));
// envelope click
const env = await page.$('a.ln-link');
const box = await env.boundingBox();
await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2);
await page.waitForURL(u => /\/page-2\/?$/.test(u.pathname), { timeout: 10000 });
log('envelope click ->', new URL(page.url()).pathname);
await page.waitForTimeout(2500);
log('nav active p2:', await page.$$eval('.ln-nav li', ls => ls.map(l => `${l.textContent}:${l.hasAttribute('data-active')}`)));

// scroll through with the wheel like a visitor, then check everything has revealed
const total = await page.evaluate(() => document.documentElement.scrollHeight);
await page.mouse.move(720, 450);
for (let y = 0; y < total; y += 400) { await page.mouse.wheel(0, 400); await page.waitForTimeout(250); }
await page.waitForTimeout(4000);
log('hidden after full scroll (p2):', await page.$$eval('[data-anim]', els => els.filter(e => +getComputedStyle(e).opacity < 0.99 && !e.closest('[data-anim]')?.parentElement?.closest('[data-anim]')).map(e => e.className + ' ' + getComputedStyle(e).opacity)));
log('sections revealed:', await page.$$eval('[data-section]', s => s.map(x => `${x.dataset.section}:${x.hasAttribute('data-in')}`).join(' ')));

// view location link
log('view location link:', await page.$eval('a[href*="google.com/maps"]', a => `${a.textContent} -> ${a.href} target=${a.target}`));
// youtube iframe sits on the play button
const play = await page.evaluate(() => { const f = document.querySelector('.ln-song'); f.scrollIntoView({ block: 'center' }); const r = f.getBoundingClientRect(); const top = document.elementFromPoint(r.x + r.width / 2, r.y + r.height * 0.55); return `${f.src} opacity=${getComputedStyle(f).opacity} hitTest=${top?.tagName}.${top?.className}`; });
log('song embed:', play);

// countdown ticks
await page.evaluate(() => document.querySelector('.ln-countdown').scrollIntoView({ block: 'center' }));
const c1 = await page.$eval('.ln-countdown', e => e.textContent);
await page.waitForTimeout(2100);
const c2 = await page.$eval('.ln-countdown', e => e.textContent);
log('countdown:', c1, '->', c2);

// RSVP form
await page.evaluate(() => document.querySelector('.ln-rsvp').scrollIntoView({ block: 'center' }));
await page.waitForTimeout(500);
const before = external.length;
await page.click('.ln-rsvp-submit');
log('empty submit status:', await page.$eval('.ln-rsvp-status', e => e.textContent));
await page.fill('.ln-rsvp-name', 'Test Guest');
await page.click('text=Yes, I’ll be there!');
await page.click('text=Me +1');
await page.fill('.ln-rsvp-message', 'Congrats!');
log('checked options:', await page.$$eval('.ln-rsvp-option[data-checked]', l => l.map(x => x.textContent)));
await page.screenshot({ path: OUT + '/rsvp-filled.png', clip: await (await page.$('.ln-rsvp')).boundingBox() });
await page.click('.ln-rsvp-submit');
await page.waitForTimeout(500);
log('submit status:', await page.$eval('.ln-rsvp-status', e => e.textContent));
log('external requests during form use:', external.slice(before));
// keyboard: tab into radio group
await page.focus('.ln-rsvp-name'); await page.keyboard.press('Tab');
log('focus after tab:', await page.evaluate(() => `${document.activeElement.tagName} ${document.activeElement.value}`));

// nav back to page 1
await page.evaluate(() => window.scrollTo(0, 0));
await page.click('.ln-nav >> text=Page 1');
await page.waitForURL(u => /\/template-black-gold-graduation-rsvp\/?$/.test(u.pathname));
await page.waitForTimeout(3000);
log('nav Page 1 ->', new URL(page.url()).pathname, 'hidden:', await page.$$eval('[data-anim]', els => els.filter(e => +getComputedStyle(e).opacity < 0.99).length));

// horizontal overflow across widths
for (const [w, h] of [[320, 700], [390, 844], [600, 900], [768, 1024], [1024, 768], [1200, 900], [1440, 900], [1920, 1080], [2560, 1300]]) {
  const p = await ctx.newPage(); await p.setViewportSize({ width: w, height: h });
  const res = [];
  for (const path of ['/template-black-gold-graduation-rsvp', '/template-black-gold-graduation-rsvp/page-2']) {
    await p.goto(BASE + path, { waitUntil: 'load' }); await p.waitForTimeout(800);
    res.push(await p.evaluate(() => `${document.documentElement.scrollWidth}/${innerWidth}`));
  }
  log(`overflow ${w}x${h}:`, res.join(' '));
  await p.close();
}
log('console errors/warnings:', errors.length ? errors : 'none');
log('external hosts:', [...new Set(external)].join(', '));
await browser.close();
