// Generates typed layout data for the clone from the extracted Canva measurements.
// node scripts/lunera-nest/generate-data.mjs [rawDir]
import fs from 'node:fs';
import crypto from 'node:crypto';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('../..', import.meta.url));
const SITE = 'lunera-nest';
const PUB = `/sites/${SITE}`;
const SVG_DIR = `${ROOT}/public/sites/${SITE}/svg`;
fs.mkdirSync(SVG_DIR, { recursive: true });
const RAW = process.argv[2] ?? `${ROOT}/docs/research/${SITE}/raw`;
const load = f => JSON.parse(fs.readFileSync(`${RAW}/${f}`, 'utf8'));

const FONTS = {
  YAFcfkb7jcU_0: 'times', YAFdJnPX3ZE_0: 'seasons', YAFcfiBJMjY_0: 'cooper',
  YAD87jbyiH0_0: 'amsterdam4', YAD87vDtOPY_0: 'amsterdam3', 'YAEl4-ppXpY_0': 'andasia',
};
const r2 = v => Math.round(v * 100) / 100;
const r4 = v => Math.round(v * 10000) / 10000;
const prop = (style, name) => { const m = new RegExp(`(?:^|;\\s*)${name}:\\s*([^;]+)`).exec(style || ''); return m?.[1].trim(); };
const rgbToHex = c => { const m = /rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/.exec(c || ''); if (!m) return c; const hex = '#' + [m[1], m[2], m[3]].map(v => (+v).toString(16).padStart(2, '0')).join(''); return m[4] !== undefined && +m[4] < 1 ? `rgba(${m[1]}, ${m[2]}, ${m[3]}, ${m[4]})` : hex; };
// Source images replaced by the site owner's own photos (source file name -> local path)
const REPLACED = {
  ae0cf166f84c95175c5a57a6e7b0c985: `${PUB}/media/graduate-portrait.jpg`,
};
const mediaKey = src => src.split('/').pop().replace('.png', '');
const localSrc = src => REPLACED[mediaKey(src)] ?? `${PUB}/media/${src.split('/').pop()}`;

// ---------- animations ----------
const animSpecs = {};
for (const f of ['anim-p1.json', 'anim-p2.json']) {
  const a = load(f);
  for (const specs of Object.values(a)) for (const s of specs) animSpecs[s.id] = s;
}
// letter animations recorded from the slower mutation timeline (relative to section start)
const manualLetters = {
  LB7pqFXMMcqjFDbs: [0, 1066], LBlZVRPB2nTsfxff: null,
  LBKxs1vgC5Ln5TZP: [0, 1304], LBSktt7BMfYC4644: [351, 2220],
  LBvj3Xfc4B2Mhlhk: [116, 1824], LBDQTDGNcLlZZpv6: [251, 2136], LBFFGfPwDT3cTWtX: [266, 2156],
  LBsBPNtk3ygWn97n: [537, 1202], LBqz8pzjSCBKY7TP: [918, 2099], LB516t0TGCG2hL6G: [971, 1847], LB0Rs11bvgh1nq6G: [1030, 2088],
};
const manualOther = {
  LBlZVRPB2nTsfxff: { type: 'lift', delay: 280, duration: 996, distance: 20.9 },
  LBKxs1vgC5Ln5TZP: { type: 'letters', delay: 0, duration: 1304 },
  LB2xgTP7yctsBtQV: { type: 'lift', delay: 84, duration: 1019, distance: 60.4 },
  LBCsJNXjRCTNyJdn: { type: 'rise', delay: 267, duration: 738, distance: 78.7 },
  LBLVWWKlNfbt2CVz: { type: 'rise', delay: 535, duration: 735, distance: 79.3 },
  LBPqlTlr8L3NKW2D: { type: 'rise', delay: 635, duration: 734, distance: 77 },
  LBnGFqrv4zjjJRSv: { type: 'wipe', delay: 819, duration: 1485 },
  LBqFpDLjY8wb4J0r: { type: 'lift', delay: 82, duration: 1021, distance: 53.6 },
  LB3xK3t1f8XTbkKy: { type: 'zoom', delay: 0, duration: 2000 },
  LBJywPncXZZ6Wx6y: { type: 'zoom', delay: 0, duration: 2000 },
};
const animFor = id => {
  if (manualOther[id]) return manualOther[id];
  if (manualLetters[id]) return { type: 'letters', delay: manualLetters[id][0], duration: manualLetters[id][1] };
  const s = animSpecs[id];
  if (!s) return undefined;
  const type = { wipe: 'wipe', rise: 'rise', fade: 'fade', scale: 'pop', lift: 'lift', letters: 'letters' }[s.type];
  if (!type || id === 'LBlsmkwrbCJ8RWCy') return undefined;
  const out = { type, delay: s.delay, duration: s.dur };
  if (s.dy) out.distance = Math.abs(s.dy);
  return out;
};

// ---------- alt text for meaningful images ----------
const ALT = {
  ef57de5a47ac051e60e971b6fd2b5b94: 'Black envelope sealed with a gold graduation-cap wax seal',
  ae0cf166f84c95175c5a57a6e7b0c985: 'Portrait of the graduate in a white dress holding her diploma',
  '23f2b95a286d68332955398288d1cdaa': 'Willow Creek Estate garden terrace',
  '6bc24934a664208a608ee2a81ad32bc5': 'Graduation cap with gold roses',
};

// ---------- element conversion ----------
const all = data => { const map = {}; for (const s of data.sections) { const q = it => { for (const e of it) { map[e.id] = e; if (e.children) q(e.children); } }; q(s.items); } return map; };
const svgFiles = new Map();
const saveSvg = text => {
  const clean = text.replace(/ original_string_length="\d+"/, '');
  const hash = crypto.createHash('sha1').update(clean).digest('hex').slice(0, 12);
  if (!svgFiles.has(hash)) { fs.writeFileSync(`${SVG_DIR}/${hash}.svg`, clean); svgFiles.set(hash, true); }
  return `${PUB}/svg/${hash}.svg`;
};

const rectOf = (e, W, yShift = 0) => [r2(e.tx - W / 2), r2(e.ty - yShift), r2(e.w), r2(e.h)];

// Personalised content (from the owner's invitation card): source run text -> new text.
// Paragraphs whose text changes render on one line, centred on the original box.
const TEXT = {
  'Olivia Carter': 'Anh Thy',
  SATURDAY: 'WEDNESDAY',
  MAY: 'NOV',
  '24': '11',
  '2031': '2026',
  'AT 6:00 PM': 'AT 9:00 AM',
  'Willow Creek Estate': 'ĐH Tài chính - Marketing',
  '2450 Rosewood Lane,': '306 Võ Văn Hát, P. Long Trường,',
  'Charleston, SC 29403': 'TP. Hồ Chí Minh',
};
// Font size (source px) for replaced text that must fit a narrower space than the original
const TEXT_SIZE = {
  'Willow Creek Estate': 14,
};
const HREF = {
  'https://www.google.com/maps/search/?api=1&query=123+Bloom+Street+San+Diego+CA': 'https://maps.app.goo.gl/zBwXqjNHn8JVH3hL7',
};

const paragraphs = e => e.paras.map(p => {
  const fam = prop(p.style, 'font-family')?.split(',')[0].trim();
  const color = rgbToHex(prop(p.style, 'color'));
  const para = {
    font: FONTS[fam] ?? (() => { throw new Error('font ' + fam); })(),
    size: r2(parseFloat(prop(p.style, '--H97cbQ'))),
    lineHeight: r2(parseFloat(prop(p.style, 'line-height'))),
    letterSpacing: r4(parseFloat(prop(p.style, 'letter-spacing')) || 0),
    color,
  };
  if (prop(p.style, 'text-transform') === 'uppercase') para.uppercase = true;
  const runs = [];
  let changed = false;
  for (const s of p.spans) {
    if (!s.text) continue;
    const run = { text: TEXT[s.text] ?? s.text };
    if (TEXT[s.text] !== undefined) changed = true;
    if (TEXT_SIZE[s.text]) para.size = TEXT_SIZE[s.text];
    const c = rgbToHex(prop(s.style, 'color')); if (c && c !== color) run.color = c;
    const w = +prop(s.style, 'font-weight'); if (w && w !== 400) run.weight = w;
    if (s.href) run.href = HREF[s.href] ?? s.href;
    const last = runs.at(-1);
    if (last && last.color === run.color && last.weight === run.weight && last.href === run.href) last.text += run.text; else runs.push(run);
  }
  para.runs = runs;
  if (changed) para.nowrap = true;
  return para;
});

const convert = (e, te, me, W, TW, MW, myShift) => {
  const el = { id: e.id };
  const base = () => {
    el.layout = { d: rectOf(e, W), t: rectOf(te, TW), m: rectOf(me, MW, myShift) };
    if (e.rot) el.rotate = e.rot;
    if (e.flip) el.flip = e.flip;
    if (e.opacity !== undefined && e.opacity !== 1) el.opacity = e.opacity;
    if (e.filter) el.filter = e.filter;
    if (e.link) el.href = e.link.href === '#page-0' ? '/ThiMBAgraduate/page-2' : e.link.href;
    const a = animFor(e.id); if (a) el.anim = a;
  };
  if (e.type === 'line') {
    el.kind = 'line'; base();
    delete el.opacity;
    // lines blur/fade in shortly after their section enters
    el.anim = { type: 'fade', delay: 200, duration: 600 };
    el.size = [r2(e.w), r2(e.h)];
    el.path = e.d.replace(/(\d+\.\d{3})\d+/g, '$1');
    el.color = rgbToHex(e.color);
    el.strokeWidth = e.strokeWidth;
    el.linecap = e.linecap;
    return el;
  }
  if (e.type === 'embed') {
    base();
    el.kind = /youtube/.test(e.src) ? 'youtube' : /tickcounter/.test(e.src) ? 'countdown' : 'rsvp';
    delete el.opacity;
    return el;
  }
  if (e.type === 'text') {
    el.kind = 'text'; base();
    const tb = (x, MWx, ys) => ({ x: r2(x.tx + (x.inner?.tx ?? 0) - MWx / 2), y: r2(x.ty + (x.inner?.ty ?? 0) - ys), k: r4(x.box.sx) });
    el.box = { w: r2(e.box.w), h: r2(e.box.h), d: tb(e, W, 0), t: tb(te, TW, 0), m: tb(me, MW, myShift) };
    el.offset = [r2(e.offset.tx), r2(e.offset.ty)];
    el.paragraphs = paragraphs(e);
    return el;
  }
  if (e.type === 'image') {
    el.kind = 'image'; base();
    el.src = e.src === 'blob' ? saveSvg(e.svgText) : localSrc(e.src);
    const key = e.src.split('/').pop().replace('.png', '');
    el.alt = ALT[key] ?? '';
    const c = e.crop;
    if (Math.abs(c.tx) > 0.5 || Math.abs(c.ty) > 0.5 || Math.abs(c.w - e.w) > 0.5 || Math.abs(c.h - e.h) > 0.5 || c.rot) {
      el.crop = [r4(c.tx / e.w), r4(c.ty / e.h), r4(c.w / e.w), r4(c.h / e.h)];
      if (c.rot) el.cropRotate = c.rot;
    }
    return el;
  }
  if (e.type === 'shape' || e.type === 'frame') {
    el.kind = 'shape'; base();
    el.size = [r2(e.w), r2(e.h)];
    el.layers = e.shapes.map(s => {
      const layer = { path: s.clip, pathScale: r4(s.fillScale) };
      if (s.background) layer.fill = rgbToHex(s.background);
      if (s.fillImage) {
        const b = s.fillImage.box;
        layer.image = { src: localSrc(s.fillImage.src), x: r2(b.tx), y: r2(b.ty), w: r2(b.w), h: r2(b.h) };
        const key = s.fillImage.src.split('/').pop().replace('.png', '');
        el.alt = ALT[key] ?? '';
      }
      if (s.stroke) layer.stroke = { viewBox: s.stroke.viewBox, path: s.stroke.d, color: s.stroke.color, width: +s.stroke.width };
      return layer;
    });
    return el;
  }
  throw new Error('unhandled ' + e.type + ' ' + e.id);
};

const pageData = (d, t, m, names, opts = {}) => {
  const W = d.viewport[0], TW = t.viewport[0], MW = m.viewport[0];
  const mAll = all(m), tAll = all(t);
  return d.sections.map((s, i) => {
    const ms = m.sections[i], ts = t.sections[i];
    const section = { id: names[i], height: { d: r2(s.h), t: r2(ts.h), m: r2(opts.mobileH0 ?? ms.h) }, background: '#ffffff', elements: [] };
    const myShift = opts.mobileH0 ? (ms.h - opts.mobileH0) * (5 / 9) : 0;
    if (opts.fillViewport) section.fillViewport = true;
    for (const e of s.items) {
      const me = mAll[e.id], te = tAll[e.id];
      if (!me || !te) throw new Error('missing layout for ' + e.id);
      const covers = e.tx <= 1 && e.ty <= 1 && e.tx + e.w >= W - 1 && e.ty + e.h >= s.h - 1;
      if (covers && e.type === 'shape') { section.background = rgbToHex(e.shapes[0].background); continue; }
      if (covers && e.type === 'image') {
        const ratio = e.w / e.h;
        const bleed = (el, Wx, H) => r4(el.w / Math.max(Wx, H * ratio));
        section.backgroundImage = { src: localSrc(e.src), ratio: r4(ratio), bleed: { d: bleed(e, W, s.h), t: bleed(te, TW, ts.h), m: bleed(me, MW, ms.h) } };
        continue;
      }
      section.elements.push(convert(e, te, me, W, TW, MW, myShift));
    }
    return section;
  });
};

const header = name => `// Generated from measurements of the published Canva page (see docs/research/${SITE}).\n// Layout values are source pixels; see ../types.ts for the coordinate model.\nimport type { PageData } from "../types";\n\nexport const ${name}: PageData = `;
const write = (file, name, data) => {
  const out = `${ROOT}/src/components/sites/${SITE}/data/${file}`;
  fs.mkdirSync(path.dirname(out), { recursive: true });
  fs.writeFileSync(out, header(name) + JSON.stringify({ sections: data }, null, 2) + ';\n');
  console.log('wrote', out);
};

write('invitation.ts', 'invitationPage', pageData(load('p1-d.json'), load('p1-t.json'), load('p1-m.json'), ['invite'], { fillViewport: true, mobileH0: 591.7 }));
write('details.ts', 'detailsPage', pageData(load('p2-d.json'), load('p2-t.json'), load('p2-m.json'), ['graduate', 'song', 'save-the-date', 'countdown', 'rsvp', 'thank-you', 'gift']));
console.log('svg files', svgFiles.size);
