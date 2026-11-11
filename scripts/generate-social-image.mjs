import sharp from 'sharp';
import { mkdir } from 'node:fs/promises';
import { join } from 'node:path';

const root = process.cwd();
const photo = await sharp(join(root, 'public/attachments/kociol1-1200.webp'))
  .resize(470, 630, { fit: 'cover', position: 'centre' })
  .toBuffer();
const lettering = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630">
  <rect width="730" height="630" fill="#102e3c"/>
  <rect x="55" y="55" width="5" height="42" rx="2" fill="#e5b768"/>
  <g font-family="Arial, sans-serif" fill="#f7f8f4">
    <text x="80" y="88" font-size="36" font-weight="700">HydroTech <tspan fill="#e5b768">J&amp;S</tspan></text>
    <text x="55" y="160" font-size="15" letter-spacing="3" fill="#b4d2dd">HYDRAULIK · WITNICA I OKOLICE</text>
    <text x="50" y="272" font-size="88" font-weight="700" letter-spacing="-3">Woda. Ciepło.</text>
    <text x="50" y="369" font-size="88" font-weight="700" letter-spacing="-3" fill="#e5b768">Spokój.</text>
    <text x="55" y="432" font-size="22" fill="#b4d2dd">Instalacje dla Twojego domu.</text>
    <path d="M55 483H675" stroke="#3a5460"/>
    <text x="55" y="550" font-size="38" font-weight="700">502 313 419</text>
    <text x="55" y="585" font-size="18" fill="#b4d2dd">hydrotechjs.pl</text>
  </g>
  <rect x="730" y="0" width="4" height="630" fill="#e5b768"/>
</svg>`);
await mkdir(join(root, 'public/images'), { recursive: true });
await sharp({ create: { width: 1200, height: 630, channels: 3, background: '#102e3c' } })
  .composite([{ input: photo, left: 730, top: 0 }, { input: lettering }])
  .jpeg({ quality: 88 })
  .toFile(join(root, 'public/images/og-image.jpg'));
console.log('Created public/images/og-image.jpg (1200 × 630).');
