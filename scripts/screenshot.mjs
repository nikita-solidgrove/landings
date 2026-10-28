// Screenshots a page at an exact viewport size and scroll positions.
// node scripts/screenshot.mjs <url> <outPrefix> <width>x<height>[m] <scrollY|selector@offset>...
// e.g. node scripts/screenshot.mjs http://localhost:5173/ai-song-generator /tmp/asg 390x760m 0 ".asg-ticker@-20"
// The trailing "m" emulates a phone (headless Chrome windows alone cannot go below ~500px).
// Prints one PNG path per stop. A stop of "full" captures the whole page in one image.
import { writeFileSync } from 'node:fs';
import { launch, sleep } from './cdp.mjs';

const [url, outPrefix, size, ...stops] = process.argv.slice(2);
if (!url || !outPrefix || !size) {
  console.error('usage: screenshot.mjs <url> <outPrefix> <width>x<height>[m] <stops...>');
  process.exit(1);
}
const mobile = size.endsWith('m');
const [width, height] = size.replace('m', '').split('x').map(Number);

const chrome = await launch();
try {
  await chrome.send('Emulation.setDeviceMetricsOverride', { width, height, deviceScaleFactor: 1, mobile });
  await chrome.send('Page.navigate', { url });
  await sleep(3500);

  // On a loaded machine photos arrive late: wait (up to a limit) for the images in view.
  const waitImages = (all, ms) => chrome.evaluate(`(async () => {
    const imgs = [...document.images].filter((img) => {
      const r = img.getBoundingClientRect();
      return r.width > 0 && (${all} || (r.bottom > 0 && r.top < innerHeight));
    });
    const pending = imgs.filter((img) => !img.complete).map((img) => new Promise((done) => {
      img.addEventListener('load', done, { once: true });
      img.addEventListener('error', done, { once: true });
    }));
    await Promise.race([Promise.all(pending), new Promise((done) => setTimeout(done, ${ms}))]);
  })()`);

  let n = 0;
  for (const stop of stops.length ? stops : ['0']) {
    let clip;
    if (stop === 'full') {
      // Reveal everything first, then shoot the full document height.
      const fullHeight = await chrome.evaluate(`(async () => {
        for (let y = 0; y < document.documentElement.scrollHeight; y += innerHeight / 2) {
          scrollTo({ top: y, behavior: 'instant' }); await new Promise((r) => setTimeout(r, 120));
        }
        scrollTo({ top: 0, behavior: 'instant' });
        return document.documentElement.scrollHeight;
      })()`);
      await waitImages(true, 15000);
      await sleep(800);
      clip = { x: 0, y: 0, width, height: fullHeight, scale: 1 };
    } else {
      const [selector, offset = '0'] = stop.includes('@') ? stop.split('@') : [null, stop];
      await chrome.evaluate(selector
        ? `(() => { const el = document.querySelector(${JSON.stringify(selector)}); if (!el) return; scrollTo({ top: el.getBoundingClientRect().top + scrollY + ${Number(offset)}, behavior: 'instant' }); })()`
        : `scrollTo({ top: ${Number(offset)}, behavior: 'instant' })`);
      await sleep(600);
      await waitImages(false, 8000);
      await sleep(800);
    }
    const shot = await chrome.send('Page.captureScreenshot', { format: 'png', ...(clip ? { clip, captureBeyondViewport: true } : {}) });
    const file = `${outPrefix}-${n++}.png`;
    writeFileSync(file, Buffer.from(shot.data, 'base64'));
    console.log(file);
  }
} finally {
  chrome.close();
}
