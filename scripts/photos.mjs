// Contact sheet of Unsplash photos, to pick from candidate ids by eye.
//   node scripts/photos.mjs <out.png> <id> [<id> ...]
// Ids work with https://images.unsplash.com/photo-<id>?w=…&h=…&fit=crop&auto=format.
// Finding ids is done by hand on unsplash.com (license=free) in a normal browser.
import { mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { launch, sleep } from './cdp.mjs';

const [out, ...ids] = process.argv.slice(2);
if (!out || !ids.length) {
  console.error('usage: photos.mjs <out.png> <id>...');
  process.exit(1);
}

const cells = ids
  .map((id, i) => `<figure><img src="https://images.unsplash.com/photo-${id}?w=360&h=360&fit=crop&auto=format&q=60"><figcaption>${i}: ${id}</figcaption></figure>`)
  .join('');
const html = `<!doctype html><meta charset="utf-8"><style>body{margin:0;padding:8px;background:#eee;font:12px sans-serif;display:flex;flex-wrap:wrap;gap:8px}figure{margin:0;width:220px}img{width:220px;height:220px;object-fit:cover;display:block}</style>${cells}`;
const file = join(mkdtempSync(join(tmpdir(), 'sheet-')), 'sheet.html');
writeFileSync(file, html);

const height = Math.ceil(ids.length / 5) * 250 + 20;
const chrome = await launch();
try {
  await chrome.send('Emulation.setDeviceMetricsOverride', { width: 1176, height, deviceScaleFactor: 1, mobile: false });
  await chrome.send('Page.navigate', { url: `file://${file}` });
  await sleep(4000);
  const shot = await chrome.send('Page.captureScreenshot', { format: 'png' });
  writeFileSync(out, Buffer.from(shot.data, 'base64'));
  console.log(out);
} finally {
  chrome.close();
}
