const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const POSTS_DIR = path.join(ROOT, 'posts');
const MANIFEST_PATH = path.join(POSTS_DIR, 'posts.json');
const SITEMAP_PATH = path.join(ROOT, 'sitemap.xml');
const SITE_URL = 'https://hydrotechjs.pl';

const readJson = (filePath) => JSON.parse(fs.readFileSync(filePath, 'utf-8'));

const normalizeNewlines = (content) => content.replace(/\r\n/g, '\n').replace(/\r/g, '\n');

const parseFrontMatter = (content) => {
    const normalized = normalizeNewlines(content);
    const frontMatterRegex = /^---\n([\s\S]*?)\n---/;
    const match = normalized.match(frontMatterRegex);
    if (!match) return null;

    const frontMatter = match[1];
    const post = {};
    frontMatter.split('\n').forEach(line => {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith('-')) return;
        if (!trimmed.includes(':')) return;
        const colonIndex = trimmed.indexOf(':');
        const key = trimmed.substring(0, colonIndex).trim();
        let value = trimmed.substring(colonIndex + 1).trim();
        value = value.replace(/^["']|["']$/g, '');
        post[key] = value;
    });

    return post;
};

const formatDate = (value) => {
    if (!value) return null;
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return null;
    return date.toISOString().slice(0, 10);
};

const dateFromFilename = (filename) => {
    const match = filename.match(/^(\d{4}-\d{2}-\d{2})/);
    return match ? match[1] : null;
};

const getPostLastmod = (filename) => {
    const filePath = path.join(POSTS_DIR, filename);
    if (!fs.existsSync(filePath)) return null;
    const content = fs.readFileSync(filePath, 'utf-8');
    const frontMatter = parseFrontMatter(content);
    if (frontMatter && frontMatter.date) {
        return formatDate(frontMatter.date) || dateFromFilename(filename);
    }
    return dateFromFilename(filename);
};

const encodePath = (p) => encodeURI(p);

const buildUrlEntry = ({ loc, lastmod, changefreq, priority }) => {
    return `  <url>\n    <loc>${loc}</loc>\n    ${lastmod ? `<lastmod>${lastmod}</lastmod>` : ''}\n    <changefreq>${changefreq}</changefreq>\n    <priority>${priority}</priority>\n  </url>`;
};

const buildSitemap = () => {
    const today = new Date().toISOString().slice(0, 10);

    const staticUrls = [
        { loc: `${SITE_URL}/`, changefreq: 'weekly', priority: '1.0' },
        { loc: `${SITE_URL}/uslugi.html`, changefreq: 'monthly', priority: '0.9' },
        { loc: `${SITE_URL}/blog.html`, changefreq: 'weekly', priority: '0.8' },
        { loc: `${SITE_URL}/kontakt.html`, changefreq: 'monthly', priority: '0.7' }
    ].map(entry => buildUrlEntry({ ...entry, lastmod: today }));

    const manifest = readJson(MANIFEST_PATH);
    const postUrls = manifest.map(entry => {
        const filename = entry.file || entry.filename || entry;
        const htmlFile = filename.replace(/\.md$/i, '.html');
        const loc = `${SITE_URL}/posts/${encodePath(htmlFile)}`;
        const lastmod = getPostLastmod(filename);
        return buildUrlEntry({
            loc,
            lastmod,
            changefreq: 'yearly',
            priority: '0.6'
        });
    });

    const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"\n        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">\n\n${staticUrls.join('\n')}\n\n${postUrls.join('\n')}\n\n</urlset>\n`;

    fs.writeFileSync(SITEMAP_PATH, xml, 'utf-8');
    console.log('sitemap.xml updated.');
};

buildSitemap();
