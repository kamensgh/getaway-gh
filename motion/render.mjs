// Renders scene.html to a frame sequence, then encodes it to MP4.
//
//   node render.mjs [--fps 30] [--out getaway-promo.mp4]
//
// Frames are captured deterministically: the page exposes renderFrame(t),
// so each screenshot is an exact function of time rather than a race with
// whatever the browser's animation clock happened to be doing.

import { chromium } from 'playwright';
import { spawn } from 'node:child_process';
import { mkdir, rm } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));

const arg = (flag, fallback) => {
  const i = process.argv.indexOf(flag);
  return i === -1 ? fallback : process.argv[i + 1];
};

const FPS = Number(arg('--fps', 30));
const OUT = arg('--out', 'getaway-promo.mp4');
const WIDTH = 1080;
const HEIGHT = 1920;

const CHROME = '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
// Playwright ships a stripped ffmpeg (VP8/WebM only), so use the full build.
const { default: ffmpegInstaller } = await import('@ffmpeg-installer/ffmpeg');
const FFMPEG = ffmpegInstaller.path;

const framesDir = path.join(here, 'frames');

const run = (bin, args) =>
  new Promise((resolve, reject) => {
    const p = spawn(bin, args, { stdio: ['ignore', 'ignore', 'pipe'] });
    let err = '';
    p.stderr.on('data', d => { err += d; });
    p.on('close', code =>
      code === 0 ? resolve() : reject(new Error(`${path.basename(bin)} exited ${code}\n${err.slice(-1500)}`))
    );
  });

// --encode-only re-encodes the frames already on disk, for when you are
// tuning compression rather than the animation itself.
const encodeOnly = process.argv.includes('--encode-only');

if (!encodeOnly) {
await rm(framesDir, { recursive: true, force: true });
await mkdir(framesDir, { recursive: true });

const browser = await chromium.launch({ executablePath: CHROME });
const page = await browser.newPage({
  viewport: { width: WIDTH, height: HEIGHT },
  deviceScaleFactor: 1,
});

await page.goto('file://' + path.join(here, 'scene.html'), { waitUntil: 'load' });

// Webfonts and the screenshot must be decoded before the first capture,
// or the opening frames render in a fallback face.
await page.evaluate(() => document.fonts.ready);
await page.evaluate(() => Promise.all(
  [...document.images].map(img => img.complete ? null : img.decode().catch(() => null))
));

const duration = await page.evaluate(() => window.SCENE_DURATION);
const total = Math.round(duration * FPS);
console.log(`Rendering ${total} frames (${duration}s @ ${FPS}fps) at ${WIDTH}x${HEIGHT}`);

for (let f = 0; f < total; f++) {
  const t = f / FPS;
  await page.evaluate(time => window.renderFrame(time), t);
  await page.screenshot({
    path: path.join(framesDir, String(f).padStart(5, '0') + '.png'),
    animations: 'disabled',
  });
  if (f % 60 === 0) console.log(`  frame ${f}/${total}`);
}

await browser.close();
console.log('Frames captured.');
}

console.log('Encoding…');

const outPath = path.join(here, OUT);
await run(FFMPEG, [
  '-y',
  '-framerate', String(FPS),
  '-i', path.join(framesDir, '%05d.png'),
  '-c:v', 'libx264',
  '-preset', 'slow',
  '-crf', '18',
  // yuv420p + even dimensions keep this playable in Instagram/QuickTime,
  // which reject the 4:4:4 that libx264 would otherwise pick from RGB input.
  '-pix_fmt', 'yuv420p',
  '-movflags', '+faststart',
  outPath,
]);

console.log(`Done → ${outPath}`);
