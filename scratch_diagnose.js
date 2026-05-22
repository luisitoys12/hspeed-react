import { chromium } from '@playwright/test';
import path from 'path';

const routes = [
  '#/',
  '#/register',
  '#/login',
  '#/herramientas',
  '#/badges',
  '#/imager',
  '#/events',
  '#/forum'
];

(async () => {
  console.log("Starting multi-page diagnostics...");
  let browser;
  try {
    browser = await chromium.launch({ headless: true });
    console.log("Browser launched successfully.");
  } catch (err) {
    console.error("Failed to launch browser.", err);
    process.exit(1);
  }

  const page = await browser.newPage();

  page.on('console', msg => {
    if (msg.type() === 'error') {
      console.log(`[BROWSER CONSOLE ERROR] ${msg.text()}`);
    }
  });

  page.on('pageerror', err => {
    console.error('[BROWSER RUNTIME CRASH]', err.stack || err.message || err);
  });

  for (const route of routes) {
    console.log(`\n-----------------------------------------`);
    console.log(`Navigating to http://localhost:5000/${route} ...`);
    try {
      await page.goto(`http://localhost:5000/${route}`, { waitUntil: 'load', timeout: 15000 });
      
      // Wait for React to mount and queryClient to resolve
      await page.waitForTimeout(2000);
      
      const html = await page.content();
      const isBlank = html.includes('id="root"></div>') || html.includes('id="root">') && html.substring(html.indexOf('id="root">')).length < 50;
      
      console.log(`Route [${route}] loaded. HTML Length: ${html.length}. Is Blank?: ${isBlank}`);
      
      const screenshotName = `screenshot_${route.replace('#/', '').replace('/', '_') || 'home'}.png`;
      const screenshotPath = path.resolve(screenshotName);
      await page.screenshot({ path: screenshotPath });
      console.log(`Screenshot saved to ${screenshotName}`);
      
      if (isBlank) {
        console.error(`🚨 BLANK PAGE DETECTED ON ROUTE: ${route}`);
      }
    } catch (error) {
      console.error(`Failed to load route ${route}:`, error.message);
    }
  }

  await browser.close();
  console.log("\nDiagnostics finished.");
})();
