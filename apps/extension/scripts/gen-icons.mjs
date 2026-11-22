import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { deflateSync } from 'node:zlib';

const SIZES = [16, 32, 48, 128];

function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    c ^= buf[i];
    for (let k = 0; k < 8; k++) {
      c = (c >>> 1) ^ (c & 1 ? 0xedb88320 : 0);
    }
  }
  return (c ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const tag = Buffer.from(type, 'ascii');
  const body = Buffer.concat([tag, data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(body), 0);
  return Buffer.concat([len, body, crc]);
}

function encodePng(width, height, rgba) {
  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 6; // RGBA
  ihdr[10] = 0;
  ihdr[11] = 0;
  ihdr[12] = 0;

  const stride = width * 4 + 1;
  const raw = Buffer.alloc(stride * height);
  for (let y = 0; y < height; y++) {
    raw[y * stride] = 0; // filter none
    rgba.copy(raw, y * stride + 1, y * width * 4, (y + 1) * width * 4);
  }
  const idat = deflateSync(raw, { level: 9 });
  return Buffer.concat([sig, chunk('IHDR', ihdr), chunk('IDAT', idat), chunk('IEND', Buffer.alloc(0))]);
}

function renderIcon(size) {
  const buf = Buffer.alloc(size * size * 4);
  const cx = (size - 1) / 2;
  const cy = (size - 1) / 2;
  const radius = size * 0.45;
  const inner = size * 0.14;
  const bladeIn = size * 0.19;
  const bladeOut = size * 0.37;

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const dx = x - cx;
      const dy = y - cy;
      const d = Math.hypot(dx, dy);
      const idx = (y * size + x) * 4;

      // Rounded-square dark background (#0a0a0c)
      const corner = size * 0.22;
      const ax = Math.max(0, Math.abs(dx) - (size / 2 - corner));
      const ay = Math.max(0, Math.abs(dy) - (size / 2 - corner));
      const inBox = Math.hypot(ax, ay) <= corner;

      if (!inBox) {
        buf[idx] = 0;
        buf[idx + 1] = 0;
        buf[idx + 2] = 0;
        buf[idx + 3] = 0;
        continue;
      }

      // Base dark
      let r = 14;
      let g = 14;
      let b = 18;
      let a = 255;

      // Subtle orange ring border
      if (d <= radius && d >= radius - Math.max(1, size * 0.05)) {
        r = 249;
        g = 115;
        b = 22;
      } else {
        // Center dot + 3 trefoil blades
        let ang = Math.atan2(dy, dx); // -PI..PI
        if (ang < 0) ang += Math.PI * 2;
        const sector = Math.floor(ang / ((Math.PI * 2) / 3));
        const inBlade =
          d >= bladeIn &&
          d <= bladeOut &&
          Math.abs(ang - (sector * ((Math.PI * 2) / 3) + Math.PI / 6)) < Math.PI / 7;

        if (d <= inner || inBlade) {
          // Orange -> red gradient
          const t = Math.min(1, d / bladeOut);
          r = Math.round(249 - t * 15);
          g = Math.round(115 - t * 50);
          b = Math.round(22 + t * 20);
        }
      }

      buf[idx] = r;
      buf[idx + 1] = g;
      buf[idx + 2] = b;
      buf[idx + 3] = a;
    }
  }
  return encodePng(size, size, buf);
}

const outDir = resolve(import.meta.dirname, '..', 'public', 'icon');
mkdirSync(outDir, { recursive: true });
for (const size of SIZES) {
  const file = resolve(outDir, `${size}.png`);
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, renderIcon(size));
  console.log('generated', file);
}
