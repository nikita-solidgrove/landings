// Minimal Chrome DevTools Protocol client: a private headless Chrome on a free port, so several
// scripts can run at the same time.
import { spawn } from 'node:child_process';
import { existsSync, mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';

export const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export async function launch() {
  const profile = mkdtempSync(join(tmpdir(), 'cdp-'));
  const chrome = spawn(CHROME, [
    '--headless=new', '--disable-gpu', '--hide-scrollbars', '--remote-debugging-port=0',
    `--user-data-dir=${profile}`, 'about:blank',
  ], { stdio: 'ignore' });

  // Never leave a Chrome behind: also when the caller crashes or is interrupted.
  const kill = () => {
    chrome.kill();
    setTimeout(() => rmSync(profile, { recursive: true, force: true }), 500);
  };
  process.once('exit', () => chrome.kill());
  for (const signal of ['SIGINT', 'SIGTERM']) process.once(signal, () => { chrome.kill(); process.exit(130); });

  let ws;
  try {
    // Chrome writes the port it picked to DevToolsActivePort (slow on a loaded machine).
    const portFile = join(profile, 'DevToolsActivePort');
    for (let i = 0; i < 600 && !existsSync(portFile); i++) await sleep(100);
    const port = readFileSync(portFile, 'utf8').split('\n')[0];

    let target;
    for (let i = 0; i < 100 && !target; i++) {
      try {
        const list = await (await fetch(`http://127.0.0.1:${port}/json`)).json();
        target = list.find((t) => t.type === 'page' && t.url === 'about:blank');
      } catch {}
      if (!target) await sleep(100);
    }
    // A slow start can leave only Chrome's own UI targets: open a tab ourselves.
    if (!target) target = await (await fetch(`http://127.0.0.1:${port}/json/new?about:blank`, { method: 'PUT' })).json();

    ws = new WebSocket(target.webSocketDebuggerUrl);
    await new Promise((resolve, reject) => {
      ws.addEventListener('open', resolve);
      ws.addEventListener('error', reject);
    });
  } catch (error) {
    kill();
    throw error;
  }
  let id = 0;
  const pending = new Map();
  ws.addEventListener('message', (event) => {
    const msg = JSON.parse(event.data);
    if (msg.id && pending.has(msg.id)) {
      pending.get(msg.id)(msg.result ?? {});
      pending.delete(msg.id);
    }
  });

  const send = (method, params = {}) =>
    new Promise((resolve) => {
      const n = ++id;
      pending.set(n, resolve);
      ws.send(JSON.stringify({ id: n, method, params }));
    });

  const evaluate = async (expression) =>
    (await send('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true })).result?.value;

  const close = () => {
    ws.close();
    chrome.kill();
    setTimeout(() => rmSync(profile, { recursive: true, force: true }), 500);
  };

  await send('Page.enable');
  return { send, evaluate, close };
}
