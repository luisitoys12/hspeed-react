import { chromium } from '@playwright/test';

(async () => {
  console.log("Starting Playwright login test...");
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  page.on('console', msg => console.log(`[BROWSER] ${msg.text()}`));

  try {
    console.log("Navigating to login page...");
    await page.goto('http://localhost:5000/#/login', { waitUntil: 'load' });
    
    // Wait for form
    await page.waitForSelector('form');
    
    console.log("Filling credentials...");
    // Try to find the email and password inputs
    await page.fill('input[type="email"]', 'admin@habbospeed.com');
    await page.fill('input[type="password"]', 'admin');
    
    console.log("Submitting form...");
    await page.click('button[type="submit"]');
    
    // Wait for navigation or a toast message indicating success/failure
    await page.waitForTimeout(3000);
    
    const html = await page.content();
    if (html.includes('Credenciales inv')) {
      console.error("LOGIN FAILED: Credenciales inválidas shown on screen.");
    } else {
      console.log("LOGIN SUCCESS: No invalid credentials message.");
    }
    
    await page.screenshot({ path: 'screenshot_test_login.png' });
    console.log("Saved screenshot to screenshot_test_login.png");

  } catch (error) {
    console.error("Test failed:", error);
  } finally {
    await browser.close();
  }
})();
