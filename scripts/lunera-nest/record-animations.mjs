// node scripts/lunera-nest/record-animations.mjs <url> <out.json> <w> <h>
// Records entrance animations per element: scrolls each section into view and observes inline style changes.
import { createRequire } from 'node:module';
import fs from 'node:fs';
const require = createRequire(import.meta.url);
const { chromium } = require('playwright');
const [url, out, w, h] = process.argv.slice(2);
const browser = await chromium.launch({ channel: 'chrome' });
const page = await browser.newPage({ viewport: { width: +w, height: +h } });
await page.addInitScript(() => {
  window.__log = [];
  new MutationObserver(ms => {
    for (const m of ms) {
      const el = m.target; const top = el.closest?.('._0xkaeQ'); if (!top) continue;
      const sec = top.closest('section'); const secIdx = [...document.querySelectorAll('section')].indexOf(sec);
      const letter = el.classList?.contains('jfNO9A') || el.classList?.contains('zV8YKg');
      window.__log.push([performance.now(), top.id, secIdx, el === top ? 'S' : letter ? 'L' : el.classList?.contains('DF_utQ') ? 'I' : 'O', el.getAttribute('style') || '']);
    }
  }).observe(document, { subtree: true, attributes: true, attributeFilter: ['style'] });
});
const P = s => { const o = {}; let m; if ((m = /translate\(([-\de.]+)px,\s*([-\de.]+)px\)/.exec(s))) { o.x = +m[1]; o.y = +m[2]; } if ((m = /scale\(([-\de.]+)/.exec(s))) o.s = +m[1]; const op = /opacity:\s*([\d.]+)/.exec(s); o.o = op ? +op[1] : 1; const q = /--q1eooA:\s*([\d.]+)/.exec(s); if (q) o.q = +q[1]; return o; };
const result = {}; const triggers = {};
const analyse = (log) => {
  const per = new Map();
  for (const [t, id, sec, kind, s] of log) { if (!per.has(id)) per.set(id, { sec, S: [], I: [], L: [] }); const r = per.get(id); if (r[kind]) r[kind].push([t, P(s)]); }
  const bySec = new Map();
  for (const [id, r] of per) {
    const all = [...r.S, ...r.I, ...r.L]; if (all.length < 4) continue;
    const t0 = Math.min(...all.map(a => a[0])); const t1 = Math.max(...all.map(a => a[0]));
    const a = r.S[0]?.[1] ?? {}, b = r.S.at(-1)?.[1] ?? {};
    const ia = r.I[0]?.[1] ?? {}, ib = r.I.at(-1)?.[1] ?? {};
    const spec = { id, sec: r.sec, start: t0, dur: Math.round(t1 - t0) };
    if (r.L.length > 3 && Math.min(...r.L.map(l => l[1].q ?? 1)) < 0.9) {
      spec.type = 'letters';
      spec.letterSamples = r.L.length;
    }
    const dx = (a.x ?? 0) - (b.x ?? 0), dy = (a.y ?? 0) - (b.y ?? 0), idx = (ia.x ?? 0) - (ib.x ?? 0), idy = (ia.y ?? 0) - (ib.y ?? 0);
    if (Math.abs(dx) > 2 && Math.abs(idx) > 2) spec.type = 'wipe';
    else if (Math.abs(dy) > 2 && r.S.length > 3) { spec.type = spec.type ? spec.type + '+rise' : 'rise'; spec.dy = Math.round(dy * 10) / 10; }
    else if (Math.abs(idy) > 2) { spec.type = spec.type ? spec.type + '+lift' : 'lift'; spec.dy = Math.round(idy * 10) / 10; }
    else if (a.s !== undefined && Math.abs(a.s - (b.s ?? 1)) > 0.02 && !spec.type) { spec.type = 'scale'; spec.fromScale = a.s; }
    else if (!spec.type && a.o !== b.o) spec.type = 'fade';
    if (a.o !== undefined && a.o < (b.o ?? 1)) spec.fromOpacity = a.o;
    // easing: progress at 50% time on the main channel
    const ch = r.S.length > 3 ? r.S : r.I;
    if (ch.length > 4) {
      const key = ['x', 'y', 's', 'o'].find(k => ch[0][1][k] !== undefined && ch.at(-1)[1][k] !== undefined && Math.abs(ch[0][1][k] - ch.at(-1)[1][k]) > 0.01);
      if (key) { const tm = (ch[0][0] + ch.at(-1)[0]) / 2; const mid = ch.find(c => c[0] >= tm); spec.midProgress = Math.round((mid[1][key] - ch[0][1][key]) / (ch.at(-1)[1][key] - ch[0][1][key]) * 100) / 100; spec.channel = key; }
    }
    if (!spec.type || spec.dur < 60) continue;
    if (!bySec.has(r.sec)) bySec.set(r.sec, []); bySec.get(r.sec).push(spec);
  }
  return bySec;
};
await page.goto(url, { waitUntil: 'load', timeout: 60000 });
await page.waitForTimeout(5000);
const secs = await page.$$eval('section', ss => ss.map(s => s.offsetTop));
let log = await page.evaluate(() => window.__log);
const take = (bySec, onlySec) => {
  for (const [sec, specs] of bySec) {
    if (onlySec !== undefined && sec !== onlySec) continue;
    if (result[sec]) continue;
    const base = Math.min(...specs.map(s => s.start));
    result[sec] = specs.map(s => ({ ...s, delay: Math.round(s.start - base), start: undefined })).sort((a, b) => a.delay - b.delay);
  }
};
take(analyse(log), 0);
for (let i = 1; i < secs.length; i++) {
  await page.evaluate(() => { window.__log = []; });
  // wheel down in steps until the section top reaches ~60% of the viewport, like a visitor would
  const target = secs[i] - (+h) * 0.6;
  let cur = await page.$eval('.ZRRuDw', e => e.scrollTop);
  await page.mouse.move(+w / 2, +h / 2);
  while (cur < target) { await page.mouse.wheel(0, 60); await page.waitForTimeout(60); cur = await page.$eval('.ZRRuDw', e => e.scrollTop); const firstSecs = await page.evaluate(() => [...new Set(window.__log.map(l => l[2]))]); for (const fs2 of firstSecs) if (!(fs2 in triggers)) triggers[fs2] = { scrollTop: cur, sectionTop: secs[fs2], visiblePx: cur + (+h) - secs[fs2] }; }
  await page.waitForTimeout(500);
  await page.$eval('.ZRRuDw', (e, y) => { e.scrollTop = y; }, secs[i]);
  await page.waitForTimeout(4500);
  log = await page.evaluate(() => window.__log);
  take(analyse(log));
}
fs.writeFileSync(out, JSON.stringify(result, null, 1)); console.log('TRIGGERS', JSON.stringify(triggers));
for (const [sec, specs] of Object.entries(result)) for (const s of specs) console.log(sec, s.id, s.type, `delay=${s.delay} dur=${s.dur}`, s.dy ?? '', s.fromScale ?? '', s.fromOpacity ?? '', `mid=${s.midProgress}(${s.channel})`);
await browser.close();
