// Next 16 static export writes per-segment RSC payloads as nested folders
// (`__next.a/b/__PAGE__.txt`) while the client router requests the flat, dot-joined
// name (`__next.a.b.__PAGE__.txt`). Copy each nested payload to the flat name so
// client navigations and prefetches don't 404 on static hosts such as Cloudflare Pages.
// Usage: node scripts/fix-export-segments.mjs [outDir]
import fs from 'node:fs';
import path from 'node:path';

const outDir = path.resolve(process.argv[2] ?? 'out');
let copied = 0;

function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (!entry.isDirectory()) continue;
    if (entry.name.startsWith('__next.')) flatten(full, dir);
    else walk(full);
  }
}

/** Copy every file under a nested `__next.*` folder next to it with a dot-joined name. */
function flatten(segmentDir, parent) {
  const visit = (dir) => {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        visit(full);
        continue;
      }
      const rel = path.relative(parent, full).split(path.sep).join('.');
      const target = path.join(parent, rel);
      if (!fs.existsSync(target)) {
        fs.copyFileSync(full, target);
        copied++;
      }
    }
  };
  visit(segmentDir);
}

if (!fs.existsSync(outDir)) {
  console.error(`fix-export-segments: ${outDir} not found (run next build first)`);
  process.exit(1);
}
walk(outDir);
console.log(`fix-export-segments: wrote ${copied} flat segment file(s) in ${path.relative(process.cwd(), outDir) || '.'}`);
