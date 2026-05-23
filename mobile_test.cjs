const { chromium, devices } = require('playwright');
const fs = require('fs');

(async () => {
  const browser = await chromium.launch({ headless: true });
  // Simulate an iPhone 13 Pro
  const iPhone = devices['iPhone 13 Pro'];
  const context = await browser.newContext({
    ...iPhone,
  });
  const page = await context.newPage();

  console.log('Navigating to homepage...');
  await page.goto('http://localhost:5000', { timeout: 120000 });
  
  
  // Wait for the app to render
  await page.waitForTimeout(3000);
  
  const artifactsDir = 'C:/Users/opc/.gemini/antigravity/brain/b2144b1d-9480-4028-9310-49c55cc34097';
  
  await page.screenshot({ path: `${artifactsDir}/mobile_home.png`, fullPage: true });
  console.log('Screenshot of homepage saved as mobile_home.png');

  // Let's try navigating to the marketplace / herramientas
  console.log('Navigating to Herramientas...');
  await page.goto('http://localhost:5000/herramientas', { timeout: 120000 });
  await page.waitForTimeout(3000);
  await page.screenshot({ path: `${artifactsDir}/mobile_herramientas.png`, fullPage: true });
  console.log('Screenshot of herramientas saved as mobile_herramientas.png');

  await browser.close();
})();
