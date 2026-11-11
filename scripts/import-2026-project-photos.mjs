import sharp from 'sharp';
import { mkdir } from 'node:fs/promises';
import { join } from 'node:path';

// Original uploads stay in place. Website copies have descriptive, date-based names.
const groups = [
  { prefix: '2026-06-26-stacja-zmiekczania-wody', files: ['w1', 'w2'] },
  { prefix: '2026-07-25-instalacja-kotlowni-gazowej', files: ['o1', 'o2', 'o3'] },
  { prefix: '2026-09-29-kotlownia-gazowa-zasobnik', files: ['z1', 'z2', 'z3', 'z4'] },
];
const destination = join(process.cwd(), 'public/attachments');
await mkdir(destination, { recursive: true });
for (const group of groups) {
  for (const file of group.files) {
    const source = join(process.cwd(), `${file}.jpeg`);
    const base = join(destination, `${group.prefix}-${file}`);
    await sharp(source).rotate().jpeg({ quality: 92 }).toFile(`${base}.jpg`);
    for (const size of [480, 768, 1200]) {
      await Promise.all([
        sharp(source)
          .rotate()
          .resize({ width: size, withoutEnlargement: true })
          .webp({ quality: 82 })
          .toFile(`${base}-${size}.webp`),
        sharp(source)
          .rotate()
          .resize({ width: size, withoutEnlargement: true })
          .avif({ quality: 52, effort: 4 })
          .toFile(`${base}-${size}.avif`),
      ]);
    }
    console.log(`Prepared ${group.prefix}-${file}: original-size JPEG + responsive WebP/AVIF.`);
  }
}
