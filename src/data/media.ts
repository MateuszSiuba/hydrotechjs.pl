import { existsSync } from 'node:fs';
import { join } from 'node:path';
// Existing photos have pre-generated variants. Reuse them without changing article URLs.
export function imageBase(src?: string) {
  if (!src?.startsWith('/attachments/') || /\.(mp4|mov|webm)$/i.test(src)) return undefined;
  const base = src.replace(/\.(jpe?g|png|webp|avif)$/i, '').replace(/-(480|768|1200)$/, '');
  return existsSync(join(process.cwd(), 'public', `${base}-480.avif`)) &&
    existsSync(join(process.cwd(), 'public', `${base}-1200.webp`))
    ? base
    : undefined;
}
