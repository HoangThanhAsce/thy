// node scripts/lunera-nest/extract-layout.mjs <url> <outJson> <w> <h>
// Scrolls the Canva inner scroller section by section (sections are virtualised),
// waits for entrance animations to settle and records every element's final geometry.
import { createRequire } from 'node:module';
import fs from 'node:fs';
const require = createRequire(import.meta.url);
const { chromium } = require('playwright');
const [url, out, w, h] = process.argv.slice(2);
const browser = await chromium.launch({ channel: 'chrome' });
const page = await browser.newPage({ viewport: { width: +w, height: +h } });
await page.goto(url, { waitUntil: 'load', timeout: 60000 });
await page.waitForTimeout(4000);
const total = await page.$eval('.ZRRuDw', e => e.scrollHeight);
const sections = {};
for (let y = 0; ; y += 300) {
  await page.$eval('.ZRRuDw', (e, y) => { e.scrollTop = y; }, Math.min(y, total));
  await page.waitForTimeout(2600);
  const got = await page.evaluate(async () => {
    const num = v => Math.round(parseFloat(v) * 1000) / 1000;
    const T = t => {
      const o = { tx: 0, ty: 0, rot: 0, sx: 1, sy: 1 };
      if (!t) return o;
      let m;
      if ((m = /translate\(([-\de.]+)px,\s*([-\de.]+)px\)/.exec(t))) { o.tx = num(m[1]); o.ty = num(m[2]); }
      if ((m = /rotate\(([-\de.]+)deg\)/.exec(t))) o.rot = num(m[1]);
      if ((m = /scale\(([-\de.]+)(?:,\s*([-\de.]+))?\)/.exec(t))) { o.sx = num(m[1]); o.sy = num(m[2] ?? m[1]); }
      return o;
    };
    const blobs = {};
    const fetchBlob = async u => (blobs[u] ??= await fetch(u).then(r => r.text()).catch(() => null));
    const txt = n => n.nodeType === 3 ? n.textContent : n.tagName === 'BR' ? '\n' : [...n.childNodes].map(txt).join('');
    const paras = root => [...root.querySelectorAll('p, li')].map(p => ({
      tag: p.tagName, cls: p.className, style: p.getAttribute('style'),
      spans: [...p.childNodes].map(n => n.nodeType === 3 ? { text: n.textContent } : n.tagName === 'BR' ? { text: '\n' } : {
        text: txt(n), style: n.getAttribute('style') ?? n.querySelector('.a_GcMg')?.getAttribute('style') ?? null,
        href: n.tagName === 'A' ? n.getAttribute('href') : n.querySelector?.('a')?.getAttribute('href') ?? undefined,
        hrefTarget: n.tagName === 'A' ? n.getAttribute('target') : undefined,
      }),
    }));
    const shapeOf = el => [...el.querySelectorAll('.hWv4NA')].map(hw => {
      const clip = hw.querySelector('svg._7KaXww clipPath path')?.getAttribute('d');
      const fillEl = hw.querySelector('.bFnJ2A');
      const fst = fillEl?.style;
      const stroke = hw.parentElement.querySelector(':scope > svg.qY_pAA') ?? hw.querySelector('svg.qY_pAA');
      const sp = stroke?.querySelector(':scope > path');
      const img = fillEl?.querySelector('img');
      return {
        w: num(hw.style.width), h: num(hw.style.height),
        clip, fillW: num(fst?.width), fillH: num(fst?.height), fillScale: T(fst?.transform).sx,
        background: fst?.background || null,
        fillImage: img ? { src: img.getAttribute('src'), box: (() => { const q = img.closest('.qhHTGg'); return q ? { w: num(q.style.width), h: num(q.style.height), ...T(q.style.transform.replace(/translate\(([-\de.]+)px, ([-\de.]+)px\) translate.*$/, 'translate($1px, $2px)')) } : null; })() } : null,
        stroke: sp ? { viewBox: stroke.getAttribute('viewBox'), d: sp.getAttribute('d'), color: sp.getAttribute('stroke'), width: sp.getAttribute('stroke-width'), dash: sp.getAttribute('stroke-dasharray'), linecap: sp.getAttribute('stroke-linecap') } : null,
      };
    });
    const elem = async el => {
      const st = el.style;
      const o = { id: el.id, w: num(st.width), h: num(st.height), ...T(st.transform) };
      if (st.opacity) o.opacity = num(st.opacity);
      const filt = el.querySelector(':scope > .xx0k8Q, :scope > div > .xx0k8Q');
      if (filt?.style.filter) o.filter = filt.style.filter;
      const flipEl = el.querySelector('.uk_25A');
      const flip = T(flipEl?.style.transform);
      if (flip.sx !== 1 || flip.sy !== 1) o.flip = [flip.sx, flip.sy];
      const link = el.querySelector(':scope > a._3zDNwA'); if (link) o.link = { href: link.getAttribute('href'), target: link.getAttribute('target') };
      const kids = [...el.querySelectorAll('.DF_utQ._0xkaeQ')].filter(k => k.parentElement.closest('.DF_utQ._0xkaeQ') === el);
      if (kids.length) { o.type = 'group'; o.children = []; for (const k of kids) o.children.push(await elem(k)); return o; }
      const iframe = el.querySelector('iframe'); if (iframe) { o.type = 'embed'; o.src = iframe.getAttribute('src'); return o; }
      const textBox = el.querySelector('.aF9o6Q');
      if (textBox) {
        o.type = 'text';
        const inner = textBox.closest('.DF_utQ:not(._0xkaeQ)');
        o.inner = inner ? { w: num(inner.style.width), h: num(inner.style.height), ...T(inner.style.transform) } : null;
        o.box = { w: num(textBox.style.width), h: num(textBox.style.height), ...T(textBox.style.transform), writing: textBox.style.writingMode };
        o.offset = T(textBox.querySelector(':scope > div')?.style.transform);
        o.paras = paras(textBox);
        o.textAlignVertical = getComputedStyle(textBox).justifyContent;
        const shapes = shapeOf(el); if (shapes.length) o.shapes = shapes;
        return o;
      }
      if (el.querySelector('.hWv4NA')) {
        const shapes = shapeOf(el);
        o.type = shapes.some(s => s.fillImage) ? 'frame' : 'shape';
        o.shapes = shapes;
        return o;
      }
      const img = el.querySelector('img');
      if (img) {
        o.type = el.querySelector('canvas') ? 'animatedImage' : 'image';
        const iz = img.closest('.Izwocg');
        o.crop = { w: num(iz.style.width), h: num(iz.style.height), ...T(iz.style.transform) };
        const src = img.getAttribute('src');
        if (src.startsWith('blob:')) { o.src = 'blob'; o.svgText = await fetchBlob(src); } else o.src = src;
        o.nat = [img.naturalWidth, img.naturalHeight];
        return o;
      }
      o.type = 'unknown'; o.html = el.innerHTML.slice(0, 3000);
      return o;
    };
    const res = {};
    const allSections = [...document.querySelectorAll('section')];
    for (const s of document.querySelectorAll('._mXnjA')) {
      const sec = s.closest('section');
      const idx = allSections.indexOf(sec);
      const r = s.getBoundingClientRect();
      const visible = Math.max(0, Math.min(r.bottom, innerHeight) - Math.max(r.top, 48));
      const items = [];
      for (const el of s.querySelectorAll(':scope > .DF_utQ')) {
        if (el.matches('._0xkaeQ')) { items.push(await elem(el)); continue; }
        const svg = el.querySelector('svg.Fe_H_Q');
        if (!svg) continue;
        // Canva line element
        const vis = svg.querySelector('g path');
        items.push({
          id: el.id, type: 'line', w: num(el.style.width), h: num(el.style.height), ...T(el.style.transform),
          opacity: el.style.opacity ? num(el.style.opacity) : undefined,
          color: svg.style.stroke, d: vis.getAttribute('d'), strokeWidth: +vis.getAttribute('stroke-width'), linecap: vis.getAttribute('stroke-linecap'),
          dash: vis.getAttribute('stroke-dasharray'),
        });
      }
      res[idx] = { idx, w: num(s.style.width), h: num(s.style.height), bg: s.querySelector('.fbzKiw')?.getAttribute('style'), sectionBg: sec.getAttribute('style'), visible, fullyVisible: r.top >= 48 - 1 && r.bottom <= innerHeight + 1, items };
    }
    return res;
  });
  for (const [k, v] of Object.entries(got)) {
    const prev = sections[k];
    // keep the observation where the section was most visible, preferring later (settled) samples
    if (!prev || v.visible >= prev.visible - 1) sections[k] = v;
  }
  if (y >= total) break;
}
fs.writeFileSync(out, JSON.stringify({ url, viewport: [+w, +h], sections: Object.values(sections).sort((a, b) => a.idx - b.idx) }, null, 1));
console.log(out, Object.values(sections).map(s => `${s.idx}:${s.h}:${s.items.length}`).join(' '));
await browser.close();
