// usage: node scripts/lunera-nest/montage.mjs out.png width cols file1 file2 ...
import { createRequire } from 'node:module';
import fs from 'node:fs';
const require = createRequire(import.meta.url);
const { chromium } = require('playwright');
const [out, width, cols, ...files] = process.argv.slice(2);
const imgs = files.map(f => `<figure><img src="data:image/png;base64,${fs.readFileSync(f).toString('base64')}"><figcaption>${f.split(/[\/]/).pop()}</figcaption></figure>`).join('');
const html = `<style>body{margin:0;background:#888;display:grid;grid-template-columns:repeat(${cols},1fr);gap:6px;padding:6px;font:12px sans-serif}figure{margin:0}img{width:100%;display:block}</style>${imgs}`;
const browser = await chromium.launch({ channel: 'chrome' });
const page = await browser.newPage({ viewport: { width: +width, height: 600 } });
await page.setContent(html);
await page.screenshot({ path: out, fullPage: true });
await browser.close();
