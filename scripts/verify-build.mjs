import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { readdir, readFile } from 'node:fs/promises';
import { join, relative, sep } from 'node:path';

const root = join(process.cwd(), 'dist');
const origin = 'https://hydrotechjs.pl';
async function walk(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  return (
    await Promise.all(
      entries.map((entry) =>
        entry.isDirectory() ? walk(join(directory, entry.name)) : [join(directory, entry.name)],
      ),
    )
  ).flat();
}
function resolveFile(pathname) {
  const path = decodeURIComponent(pathname).replace(/^\//, '');
  for (const candidate of [
    join(root, path),
    join(root, path + '.html'),
    join(root, path, 'index.html'),
  ]) {
    if (existsSync(candidate) && !candidate.endsWith(sep)) return candidate;
  }
  return undefined;
}
const decode = (text) =>
  text
    .replace(/&amp;/g, '&')
    .replace(/&#39;/g, "'")
    .replace(/&quot;/g, '"');
const htmlFiles = (await walk(root)).filter(
  (file) => file.endsWith('.html') && !/google[^/\\]+\.html$/.test(file),
);
const pages = new Map();
const failures = [];
const record = (condition, message) => {
  if (!condition) failures.push(message);
};
const titles = new Set();
const descriptions = new Set();
const redirects = await readFile(join(root, '_redirects'), 'utf8');
for (const file of htmlFiles) {
  const path = '/' + relative(root, file).split(sep).join('/');
  const html = await readFile(file, 'utf8');
  const route = path === '/index.html' ? '/' : path.replace(/\.html$/, '');
  pages.set(route, html);
  record([...html.matchAll(/<h1\b/g)].length === 1, `${path}: expected one H1`);
  const title = html.match(/<title>([\s\S]*?)<\/title>/)?.[1];
  record(title && !titles.has(title), `${path}: missing/duplicate title`);
  titles.add(title);
  const description = html.match(/<meta name="description" content="([^"]*)"/)?.[1];
  record(description && !descriptions.has(description), `${path}: missing/duplicate description`);
  descriptions.add(description);
  const canonical = html.match(/<link rel="canonical" href="([^"]*)"/)?.[1];
  record(
    decode(canonical || '') === new URL(route, origin).href,
    `${path}: incorrect canonical ${canonical}`,
  );
  record(html.includes('tel:+48502313419'), `${path}: phone missing`);
  record(html.includes('class="mobile-contact"'), `${path}: mobile contact missing`);
  if (route !== '/404')
    record(
      redirects.includes(`${encodeURI(path)} ${encodeURI(route)} 301!`),
      `${path}: missing legacy redirect`,
    );
  for (const match of html.matchAll(
    /<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g,
  )) {
    try {
      const schema = JSON.parse(match[1]);
      record(!schema.aggregateRating, `${path}: stale aggregate rating`);
    } catch {
      failures.push(`${path}: invalid JSON-LD`);
    }
  }
  for (const match of html.matchAll(/\b(?:src|href|poster)="([^"]+)"/g)) {
    const value = decode(match[1]);
    if (value.startsWith('#') || /^(tel:|mailto:|data:)/.test(value)) continue;
    const url = new URL(value, origin + route);
    if (url.origin !== origin) continue;
    record(Boolean(resolveFile(url.pathname)), `${path}: missing local link/asset ${value}`);
  }
  for (const match of html.matchAll(/\bsrcset="([^"]+)"/g))
    for (const entry of match[1].split(',')) {
      const value = entry.trim().replace(/\s+\d+(?:w|x)$/, '');
      record(!/\s/.test(value), `${path}: unencoded whitespace in srcset ${value}`);
      if (value.startsWith('/'))
        record(
          Boolean(resolveFile(new URL(value, origin).pathname)),
          `${path}: missing responsive image ${value}`,
        );
    }
}
const sitemap = await readFile(join(root, 'sitemap-0.xml'), 'utf8');
const rss = await readFile(join(root, 'rss.xml'), 'utf8');
const postsDirectory = join(process.cwd(), 'src/content/posts');
for (const filename of await readdir(postsDirectory)) {
  if (!filename.endsWith('.md')) continue;
  const content = await readFile(join(postsDirectory, filename), 'utf8');
  const route = '/posts/' + filename.replace(/\.md$/, '');
  const url = new URL(route, origin).href;
  const draft = /^status:\s*["']?draft["']?\s*$/m.test(content);
  record(draft ? !pages.has(route) : pages.has(route), `Published/draft route mismatch: ${route}`);
  record(draft ? !rss.includes(url) : rss.includes(url), `Published/draft RSS mismatch: ${route}`);
}
record(!sitemap.includes('/404'), '404 must not be in sitemap');
for (const match of sitemap.matchAll(/<loc>(.*?)<\/loc>/g))
  record(Boolean(resolveFile(new URL(match[1]).pathname)), `Sitemap route missing: ${match[1]}`);
for (const route of pages.keys())
  if (route !== '/404')
    record(
      sitemap.includes(new URL(route, origin).href.replace(/\/$/, '')),
      `Missing sitemap route: ${route}`,
    );
record(pages.get('/404')?.includes('noindex, follow'), '404 must be noindex');
record(
  pages.get('/kontakt')?.includes('https://formspree.io/f/xanykwzv'),
  'Contact endpoint changed',
);
record(pages.get('/kontakt')?.includes('name="_gotcha"'), 'Contact spam trap missing');
record(redirects.endsWith('/* /404.html 404\n'), '404 fallback missing');
assert.equal(failures.length, 0, failures.join('\n'));
console.log(
  `Verified ${htmlFiles.length} pages: metadata, canonicals, local links, responsive images, JSON-LD, phone links, sitemap and redirects.`,
);
