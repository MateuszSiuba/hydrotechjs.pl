import { readdir, writeFile } from 'node:fs/promises';
import { join, relative, sep } from 'node:path';

const root = join(process.cwd(), 'dist');
async function findHtml(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const nested = await Promise.all(
    entries.map((entry) => {
      const path = join(directory, entry.name);
      return entry.isDirectory() ? findHtml(path) : entry.name.endsWith('.html') ? [path] : [];
    }),
  );
  return nested.flat();
}
const files = await findHtml(root);
const redirects = ['# Generated from published routes. Preserve extensionless canonical URLs.'];
for (const file of files.sort()) {
  const path = '/' + relative(root, file).split(sep).map(encodeURIComponent).join('/');
  // Search Console verification files must remain directly accessible.
  if (/^\/google[^/]+\.html$/.test(path) || path === '/404.html') continue;
  const target = path === '/index.html' ? '/' : path.replace(/\.html$/, '');
  redirects.push(`${path} ${target} 301!`);
}
redirects.push('/* /404.html 404');
await writeFile(join(root, '_redirects'), redirects.join('\n') + '\n');
console.log(`Generated ${redirects.length - 2} canonical redirects and a 404 fallback.`);
