const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const ROOT = path.resolve(__dirname, '..');
const TARGET_DIRS = [
    path.join(ROOT, 'attachments'),
    path.join(ROOT, 'images')
];

const SIZES = [480, 768, 1200];
const SUPPORTED_EXT = new Set(['.jpg', '.jpeg', '.png']);

const walkDir = (dir, files = []) => {
    if (!fs.existsSync(dir)) return files;

    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
            walkDir(fullPath, files);
        } else {
            const ext = path.extname(entry.name).toLowerCase();
            if (SUPPORTED_EXT.has(ext)) {
                files.push(fullPath);
            }
        }
    }

    return files;
};

const ensureDerived = async (inputPath) => {
    const { dir, name } = path.parse(inputPath);

    const tasks = SIZES.flatMap((size) => {
        const avifPath = path.join(dir, `${name}-${size}.avif`);
        const webpPath = path.join(dir, `${name}-${size}.webp`);

        const jobs = [];

        if (!fs.existsSync(avifPath)) {
            jobs.push(
                sharp(inputPath)
                    .resize({ width: size, withoutEnlargement: true })
                    .toFormat('avif', { quality: 50 })
                    .toFile(avifPath)
            );
        }

        if (!fs.existsSync(webpPath)) {
            jobs.push(
                sharp(inputPath)
                    .resize({ width: size, withoutEnlargement: true })
                    .toFormat('webp', { quality: 75 })
                    .toFile(webpPath)
            );
        }

        return jobs;
    });

    if (tasks.length > 0) {
        await Promise.all(tasks);
    }
};

const run = async () => {
    const files = TARGET_DIRS.flatMap((dir) => walkDir(dir));

    for (const file of files) {
        await ensureDerived(file);
    }

    console.log('Image optimization complete.');
};

run().catch((error) => {
    console.error('Image optimization failed:', error);
    process.exit(1);
});
