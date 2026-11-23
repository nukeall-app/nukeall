import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { deflateSync } from 'node:zlib';

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

function pngChunk(type, data) {
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
  ihdr[8] = 8;
  ihdr[9] = 6;
  ihdr[10] = 0;
  ihdr[11] = 0;
  ihdr[12] = 0;

  const stride = width * 4 + 1;
  const raw = Buffer.alloc(stride * height);
  for (let y = 0; y < height; y++) {
    raw[y * stride] = 0;
    rgba.copy(raw, y * stride + 1, y * width * 4, (y + 1) * width * 4);
  }
  const idat = deflateSync(raw, { level: 9 });
  return Buffer.concat([sig, pngChunk('IHDR', ihdr), pngChunk('IDAT', idat), pngChunk('IEND', Buffer.alloc(0))]);
}

function encodeIco(pngEntries) {
  const count = pngEntries.length;
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(count, 4);

  const dir = Buffer.alloc(16 * count);
  let offset = 6 + 16 * count;
  const bodies = [];

  for (let i = 0; i < count; i++) {
    const { size, png } = pngEntries[i];
    const base = i * 16;
    dir[base] = size >= 256 ? 0 : size;
    dir[base + 1] = size >= 256 ? 0 : size;
    dir[base + 2] = 0;
    dir[base + 3] = 0;
    dir.writeUInt16LE(1, base + 4);
    dir.writeUInt16LE(32, base + 6);
    dir.writeUInt32LE(png.length, base + 8);
    dir.writeUInt32LE(offset, base + 12);
    offset += png.length;
    bodies.push(png);
  }

  return Buffer.concat([header, dir, ...bodies]);
}

function shortestAngleDiff(a, b) {
  let d = a - b;
  while (d > Math.PI) d -= Math.PI * 2;
  while (d < -Math.PI) d += Math.PI * 2;
  return Math.abs(d);
}

const BLADE_ANGLES = [-Math.PI / 2, Math.PI / 6, (5 * Math.PI) / 6];
const BLADE_HALF_SPAN = (28 * Math.PI) / 180;

function samplePixel(nx, ny, half) {
  // Coordinates normalized in [-1, 1] relative to icon center.
  const corner = 0.44;
  const limit = 1 - corner;
  const ax = Math.max(0, Math.abs(nx) - limit);
  const ay = Math.max(0, Math.abs(ny) - limit);
  const boxDist = Math.hypot(ax, ay);
  if (boxDist > corner) {
    return [0, 0, 0, 0];
  }

  // Dark slate card gradient (#09090b -> #18181b) with crisp subtle #27272a border.
  const gradT = Math.max(0, Math.min(1, (nx + ny + 2) / 4));
  let r = 9 + gradT * (24 - 9);
  let g = 9 + gradT * (24 - 9);
  let b = 11 + gradT * (27 - 11);

  if (corner - boxDist <= 0.032) {
    r = 39;
    g = 39;
    b = 42;
  }

  const d = Math.hypot(nx, ny);

  // Outer orange ring (matching docs/assets/logo.svg geometry, scaled slightly for crisp favicon visibility).
  const ringInner = 0.675;
  const ringOuter = 0.775;
  const coreRadius = 0.16;
  const bladeInner = 0.255;
  const bladeOuter = 0.605;

  let isOrange = false;
  let shadeT = 0.5;

  if (d >= ringInner && d <= ringOuter) {
    isOrange = true;
    shadeT = gradT;
  } else if (d <= coreRadius) {
    isOrange = true;
    shadeT = 0.35 + 0.3 * (d / coreRadius);
  } else if (d >= bladeInner && d <= bladeOuter) {
    const ang = Math.atan2(ny, nx);
    for (const target of BLADE_ANGLES) {
      if (shortestAngleDiff(ang, target) <= BLADE_HALF_SPAN) {
        isOrange = true;
        shadeT = Math.max(0, Math.min(1, (ny + bladeOuter) / (2 * bladeOuter)));
        break;
      }
    }
  }

  if (isOrange) {
    // #fb923c (251,146,60) -> #ea580c (234,88,12)
    r = 251 + shadeT * (234 - 251);
    g = 146 + shadeT * (88 - 146);
    b = 60 + shadeT * (12 - 60);
  } else if (d < ringInner) {
    // Soft ambient radial warm glow inside the ring.
    const glow = Math.max(0, 1 - d / ringInner) * 0.14;
    r = Math.min(255, r + glow * 249);
    g = Math.min(255, g + glow * 115);
    b = Math.min(255, b + glow * 22);
  }

  return [r, g, b, 255];
}

function renderIcon(size) {
  const SS = 4; // 4x4 supersampling for smooth vector-grade curves
  const buf = Buffer.alloc(size * size * 4);
  const half = size / 2;

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      let accR = 0;
      let accG = 0;
      let accB = 0;
      let accA = 0;

      for (let sy = 0; sy < SS; sy++) {
        for (let sx = 0; sx < SS; sx++) {
          const px = x + (sx + 0.5) / SS;
          const py = y + (sy + 0.5) / SS;
          const nx = (px - half) / half;
          const ny = (py - half) / half;
          const [sr, sg, sb, sa] = samplePixel(nx, ny, half);
          const alphaWeight = sa / 255;
          accR += sr * alphaWeight;
          accG += sg * alphaWeight;
          accB += sb * alphaWeight;
          accA += sa;
        }
      }

      const samples = SS * SS;
      const outA = accA / samples;
      const idx = (y * size + x) * 4;
      if (outA < 0.5) {
        buf[idx] = 0;
        buf[idx + 1] = 0;
        buf[idx + 2] = 0;
        buf[idx + 3] = 0;
      } else {
        const cov = accA / 255;
        buf[idx] = Math.round(accR / cov);
        buf[idx + 1] = Math.round(accG / cov);
        buf[idx + 2] = Math.round(accB / cov);
        buf[idx + 3] = Math.round(outA);
      }
    }
  }
  return encodePng(size, size, buf);
}

const outDir = resolve(import.meta.dirname, '..', 'apps', 'website', 'public');
mkdirSync(outDir, { recursive: true });

const pngOutputs = [
  { name: 'favicon-48.png', size: 48 },
  { name: 'favicon-96.png', size: 96 },
  { name: 'apple-touch-icon.png', size: 180 },
  { name: 'icon-192.png', size: 192 },
  { name: 'icon-512.png', size: 512 },
];

for (const { name, size } of pngOutputs) {
  const file = resolve(outDir, name);
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, renderIcon(size));
  console.log('generated', name);
}

const icoEntries = [16, 32, 48].map((size) => ({ size, png: renderIcon(size) }));
writeFileSync(resolve(outDir, 'favicon.ico'), encodeIco(icoEntries));
console.log('generated favicon.ico');
