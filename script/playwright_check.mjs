import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

const base = 'http://127.0.0.1:5000';
const pages = ['/', '/armario', '/catalog', '/marketplace', '/badges', '/futbol-hub', '/radio'];

(async () => {
  const browser = await chromium.launch();
  const context = await browser.newContext();
  const results = [];
  await fs.promises.mkdir(path.join(process.cwd(), 'test-output'), { recursive: true });

  for (const p of pages) {
    const page = await context.newPage();
    const url = `${base}/#${p}`;
    const logs = [];
    page.on('console', (msg) => {
      logs.push({ type: 'console', level: msg.type(), text: msg.text() });
    });
    page.on('pageerror', (err) => {
      logs.push({ type: 'pageerror', message: err.message, stack: err.stack });
    });
    page.on('requestfailed', (req) => {
      logs.push({ type: 'requestfailed', url: req.url(), method: req.method(), failure: req.failure()?.errorText });
    });

    console.log('Visiting', url);
    try {
      const resp = await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 15000 });
      await page.waitForTimeout(800); // let some async requests fire
      const screenshotPath = path.join('test-output', `${p === '/' ? 'home' : p.replace(/\//g, '_')}.png`);
      await page.screenshot({ path: screenshotPath, fullPage: true });
      results.push({ page: p, status: resp?.status() ?? null, url, logs, screenshot: screenshotPath });
    } catch (err) {
      console.error('Error visiting', url, err.message);
      results.push({ page: p, status: 'error', url, error: err.message });
    }
    await page.close();
  }

  await browser.close();
  await fs.promises.writeFile(path.join('test-output', 'results.json'), JSON.stringify(results, null, 2));
  console.log('Playwright check complete. Results saved to test-output/results.json');
})();
