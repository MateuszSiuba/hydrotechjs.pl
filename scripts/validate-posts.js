const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const POSTS_DIR = path.join(ROOT, 'posts');
const MANIFEST_PATH = path.join(POSTS_DIR, 'posts.json');

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

const validate = () => {
    const manifest = readJson(MANIFEST_PATH);
    let hasErrors = false;

    manifest.forEach(entry => {
        const filename = entry.file || entry.filename || entry;
        const filePath = path.join(POSTS_DIR, filename);

        if (!fs.existsSync(filePath)) {
            console.error(`Missing post file: ${filename}`);
            hasErrors = true;
            return;
        }

        const content = fs.readFileSync(filePath, 'utf-8');
        const frontMatter = parseFrontMatter(content);

        if (!frontMatter) {
            console.error(`Missing front matter in: ${filename}`);
            hasErrors = true;
            return;
        }

        if (!frontMatter.title) {
            console.warn(`Missing title in: ${filename}`);
        }

        if (!frontMatter.date) {
            console.warn(`Missing date in: ${filename}`);
        }

        if (!frontMatter.status) {
            console.warn(`Missing status in: ${filename}`);
        }

        if (!frontMatter.description && !frontMatter.seo_description) {
            console.warn(`Missing description in: ${filename}`);
        }
    });

    if (hasErrors) {
        process.exit(1);
    }

    console.log('Post validation passed.');
};

validate();
