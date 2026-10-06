// Opens a deployed web build the way testers do (Safari on iPhone, Safari on a Mac, Chrome) and
// fails unless the splash renders with no page errors. ship.mjs runs it before promoting anything.
// Screenshots go to .smoke/<browser>.png for a human (or Claude) to eyeball.
// Usage: node scripts/smoke-web.mjs <url>
// Browsers: npx playwright install webkit chromium (once per machine).
import { mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium, devices, webkit } from 'playwright';

const url = process.argv[2];
if (!url) { console.error('usage: node scripts/smoke-web.mjs <url>'); process.exit(2); }
const out = join(dirname(fileURLToPath(import.meta.url)), '..', '.smoke');
mkdirSync(out, { recursive: true });

const runs = [
  ['safari-iphone', webkit, devices['iPhone 15']],
  ['safari-mac', webkit, {}],
  ['chrome', chromium, {}],
];
// The splash always shows the title block; if it isn't there the app didn't boot.
const SIGN_OF_LIFE = /IRON/;

let failed = 0;
for (const [name, type, device] of runs) {
  const errors = [];
  let browser;
  try {
    browser = await type.launch();
    const page = await (await browser.newContext(device)).newPage();
    page.on('pageerror', (e) => errors.push(e.message));
    await page.goto(url, { waitUntil: 'load', timeout: 45000 });
    // Not networkidle: the splash animates forever. Poll for the title instead.
    const ok = await page.waitForFunction((re) => new RegExp(re).test(document.body.innerText), SIGN_OF_LIFE.source, { timeout: 20000 })
      .then(() => true, () => false);
    await page.waitForTimeout(1500);
    await page.screenshot({ path: join(out, `${name}.png`) });
    if (!ok) errors.unshift('the app never rendered (blank page)');
  } catch (e) {
    errors.push(e.message.split('\n')[0]);
  } finally {
    await browser?.close();
  }
  console.log(`  ${errors.length ? '✗' : '✓'} ${name}${errors.length ? `: ${errors.join(' | ')}` : ''}`);
  if (errors.length) failed++;
}
console.log(`  screenshots: ${out}`);
process.exit(failed ? 1 : 0);
