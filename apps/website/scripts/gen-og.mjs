// Generates minimal crisp 1200x630 branded PNGs for og-en.png and og-tr.png without heavy deps.
import { mkdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { deflateSync } from 'node:zlib';

const W = 1200;
const H = 630;

function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    c ^= buf[i];
    for (let k = 0; k < 8; k++) c = (c >>> 1) ^ (c & 1 ? 0xedb88320 : 0);
  }
  return (c ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const body = Buffer.concat([Buffer.from(type, 'ascii'), data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(body), 0);
  return Buffer.concat([len, body, crc]);
}

function makeOgPng(accentRgb) {
  const stride = W * 4 + 1;
  const raw = Buffer.alloc(stride * H);
  const cx = 600;
  const cy = 315;

  for (let y = 0; y < H; y++) {
    const rowStart = y * stride;
    raw[rowStart] = 0;
    for (let x = 0; x < W; x++) {
      const p = rowStart + 1 + x * 4;
      const dx = x - cx;
      const dy = y - cy;
      const d = Math.hypot(dx, dy);
      // Subtle radial glow around center mark
      const glow = Math.max(0, 1 - d / 520) * 0.16;
      let r = Math.round(9 + accentRgb[0] * glow);
      let g = Math.round(9 + accentRgb[1] * glow);
      let b = Math.round(11 + accentRgb[2] * glow);

      // Clean outer border frame
      if (x < 12 || x >= W - 12 || y < 12 || y >= H - 12) {
        r = accentRgb[0];
        g = accentRgb[1];
        b = accentRgb[2];
      } else {
        // Brand emblem in center
        let ang = Math.atan2(dy, dx);
        if (ang < 0) ang += Math.PI * 2;
        const sector = Math.floor(ang / ((Math.PI * 2) / 3));
        const inBlade =
          d >= 52 && d <= 165 && Math.abs(ang - (sector * ((Math.PI * 2) / 3) + Math.PI / 6)) < Math.PI / 7;
        const inRing = d >= 188 && d <= 202;
        if (d <= 34 || inBlade || inRing) {
          r = accentRgb[0];
          g = accentRgb[1];
          b = accentRgb[2];
        }
      }
      raw[p] = r;
      raw[p + 1] = g;
      raw[p + 2] = b;
      raw[p + 3] = 255;
    }
  }

  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(W, 0);
  ihdr.writeUInt32BE(H, 4);
  ihdr[8] = 8;
  ihdr[9] = 6;
  const idat = deflateSync(raw, { level: 9 });
  return Buffer.concat([
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
    chunk('IHDR', ihdr),
    chunk('IDAT', idat),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

const outDir = resolve(import.meta.dirname, '..', 'public', 'og');
mkdirSync(outDir, { recursive: true });
writeFileSync(resolve(outDir, 'og-en.png'), makeOgPng([249, 115, 22]));
writeFileSync(resolve(outDir, 'og-tr.png'), makeOgPng([234, 88, 12]));
console.log('Generated OG PNGs in', outDir);
