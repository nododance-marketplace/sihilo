import { readFile, mkdir, copyFile, rm, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const out = path.join(root, 'dist');
if (path.dirname(out) !== root || path.basename(out) !== 'dist') throw new Error('Unsafe output directory');
await rm(out, { recursive: true, force: true });
await mkdir(out, { recursive: true });
const files = new Set(['index.html', 'css/styles.css', 'css/photography.css', 'js/main.js', 'robots.txt', 'sitemap.xml']);
const html = await readFile(path.join(root, 'index.html'), 'utf8');
for (const match of html.matchAll(/(?:assets|\/images)\/[a-zA-Z0-9_./-]+\.(?:png|jpg|ico|webp|avif)/g)) files.add(match[0].replace(/^\//, ''));
let bytes = 0;
for (const relative of files) {
  const source = path.join(root, relative.startsWith('images/') ? 'public' : '', relative);
  const target = path.join(out, relative);
  await mkdir(path.dirname(target), { recursive: true });
  await copyFile(source, target);
  bytes += (await stat(target)).size;
}
console.log(`Built ${files.size} files (${(bytes / 1024 / 1024).toFixed(2)} MiB). Original library and review documents remain local.`);
