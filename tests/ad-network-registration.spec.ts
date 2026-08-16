import { test, expect } from "@playwright/test";

test.use({ headless: true });

// Ad networks suitable for gaming/fansite content
const AD_NETWORKS = [
  {
    name: "Google AdSense",
    url: "https://www.google.com/adsense/start/",
    description: "Best for quality content, high CPM, strict approval",
    requirements:
      "Original content, 6+ months old site, privacy policy, contact page",
  },
  {
    name: "Ezoic",
    url: "https://www.ezoic.com/",
    description:
      "AI optimization, good for gaming sites, lower traffic minimum",
    requirements: "10k sessions/month, original content",
  },
  {
    name: "Media.net",
    url: "https://www.media.net/",
    description: "Contextual ads, good for content sites, Yahoo/Bing powered",
    requirements: "Quality content, English primary language",
  },
  {
    name: "Adsterra",
    url: "https://www.adsterra.com/",
    description:
      "Good for gaming/entertainment, fast approval, multiple formats",
    requirements: "No minimum traffic, adult/gaming friendly",
  },
  {
    name: "AdMaven",
    url: "https://ad-maven.com/",
    description: "Popunders, push notifications, good for gaming",
    requirements: "No strict minimum, fast approval",
  },
  {
    name: "HilltopAds",
    url: "https://hilltopads.com/",
    description: "CPM network, gaming friendly, multiple ad formats",
    requirements: "Low traffic minimum, fast approval",
  },
  {
    name: "PropellerAds",
    url: "https://propellerads.com/",
    description: "Push notifications, interstitials, good for gaming",
    requirements: "No minimum traffic, quick setup",
  },
  {
    name: "Monetag (ex PropellerAds)",
    url: "https://monetag.com/",
    description: "Multi-format monetization, gaming friendly",
    requirements: "Easy approval, multiple payment methods",
  },
];

test.describe("Ad Network Registration Helper", () => {
  test("Open all ad network registration pages", async ({ page }) => {
    console.log("\n🎯 HABBOSPEED AD NETWORK REGISTRATION HELPER\n");
    console.log("===========================================\n");

    for (const network of AD_NETWORKS) {
      console.log(`\n📌 ${network.name}`);
      console.log(`   URL: ${network.url}`);
      console.log(`   Description: ${network.description}`);
      console.log(`   Requirements: ${network.requirements}`);

      try {
        await page.goto(network.url, {
          waitUntil: "domcontentloaded",
          timeout: 30000,
        });
        await page.waitForTimeout(2000);

        // Try to find sign-up/register button
        const signUpSelectors = [
          'a:has-text("Sign Up")',
          'a:has-text("Sign up")',
          'a:has-text("Register")',
          'a:has-text("Get Started")',
          'a:has-text("Start Now")',
          'button:has-text("Sign Up")',
          'button:has-text("Register")',
          '[href*="signup"]',
          '[href*="register"]',
          '[href*="join"]',
        ];

        let found = false;
        for (const selector of signUpSelectors) {
          const element = page.locator(selector).first();
          if (await element.isVisible({ timeout: 1000 }).catch(() => false)) {
            console.log(`   ✅ Found signup button: ${selector}`);
            found = true;
            break;
          }
        }

        if (!found) {
          console.log(`   ⚠️  No obvious signup button found - check manually`);
        }

        // Take screenshot for reference
        await page
          .screenshot({
            path: `screenshots/ad-networks/${network.name.replace(/\s+/g, "-").toLowerCase()}.png`,
            fullPage: true,
          })
          .catch(() => console.log("   ⚠️  Screenshot failed"));
      } catch (error) {
        console.log(`   ❌ Error loading ${network.name}: ${error.message}`);
      }
    }

    console.log("\n\n✅ All ad network pages opened!");
    console.log("📁 Screenshots saved in screenshots/ad-networks/");
    console.log("\n📋 NEXT STEPS:");
    console.log("1. Review each network requirements");
    console.log("2. Prepare your site (privacy policy, contact, content)");
    console.log("3. Apply to 2-3 networks simultaneously");
    console.log("4. Start with Adsterra/AdMaven (easiest approval)");
    console.log("5. Apply to Ezoic after 10k sessions/month");
    console.log("6. Apply to AdSense last (strictest)");
  });
});

test("Check Habbospeed site readiness for ad networks", async ({ page }) => {
  console.log("\n🔍 CHECKING HABBOSPEED SITE READINESS\n");
  console.log("=====================================\n");

  const checks = [
    { name: "Privacy Policy", url: "/privacy", selector: "text=Privacy" },
    { name: "Contact Page", url: "/contact", selector: "text=Contact" },
    { name: "About/About Us", url: "/about", selector: "text=About" },
    { name: "Terms of Service", url: "/terms", selector: "text=Terms" },
    { name: "Cookie Policy", url: "/cookies", selector: "text=Cookie" },
  ];

  for (const check of checks) {
    try {
      await page.goto(`http://localhost:5000${check.url}`, {
        waitUntil: "domcontentloaded",
        timeout: 10000,
      });
      const exists = await page
        .locator(check.selector)
        .first()
        .isVisible({ timeout: 3000 })
        .catch(() => false);
      console.log(
        `${exists ? "✅" : "❌"} ${check.name}: ${exists ? "Found" : "Missing"} (${check.url})`,
      );
    } catch {
      console.log(`❌ ${check.name}: Page not accessible (${check.url})`);
    }
  }

  // Check content quality
  try {
    await page.goto("http://localhost:5000/", {
      waitUntil: "domcontentloaded",
      timeout: 10000,
    });
    const content = await page.textContent("body");
    const wordCount =
      content?.split(/\s+/).filter((w) => w.length > 3).length || 0;
    console.log(
      `\n📝 Homepage word count: ~${wordCount} words ${wordCount >= 300 ? "✅" : "❌ (need 300+)"}`,
    );

    // Check for ads.txt
    try {
      const adsTxt = await page.goto("http://localhost:5000/ads.txt", {
        waitUntil: "domcontentloaded",
        timeout: 5000,
      });
      console.log(
        `📄 ads.txt: ${adsTxt?.status() === 200 ? "✅ Found" : "❌ Missing"}`,
      );
    } catch {
      console.log("📄 ads.txt: ❌ Missing (required for AdSense)");
    }

    // Check robots.txt
    try {
      const robotsTxt = await page.goto("http://localhost:5000/robots.txt", {
        waitUntil: "domcontentloaded",
        timeout: 5000,
      });
      console.log(
        `🤖 robots.txt: ${robotsTxt?.status() === 200 ? "✅ Found" : "❌ Missing"}`,
      );
    } catch {
      console.log("🤖 robots.txt: ❌ Missing");
    }
  } catch (error) {
    console.log(`\n❌ Could not check homepage: ${error.message}`);
  }

  console.log("\n📋 SITE READINESS CHECKLIST:");
  console.log("☐ Privacy Policy page");
  console.log("☐ Contact page with form/email");
  console.log("☐ Terms of Service");
  console.log("☐ Cookie Policy");
  console.log("☐ About/Team page");
  console.log("☐ ads.txt file (for AdSense)");
  console.log("☐ robots.txt");
  console.log("☐ SSL/HTTPS enabled");
  console.log("☐ Fast loading speed");
  console.log("☐ Mobile responsive");
  console.log("☐ Original content (300+ words per page)");
  console.log("☐ No copyrighted content");
});

test("Generate ads.txt template for AdSense", async ({ page }) => {
  console.log("\n📄 GENERATING ADS.TXT TEMPLATE\n");
  console.log("================================\n");

  const adsTxtContent = `# Google AdSense
google.com, pub-XXXXXXXXXXXXXXXX, DIRECT, f08c47fec0942fa0

# Adsterra
adsterra.com, YOUR_ADSTERRA_ID, RESELLER

# Ezoic
ezoic.com, YOUR_EZOIC_ID, RESELLER

# AdMaven
ad-maven.com, YOUR_ADMAVEN_ID, RESELLER

# HilltopAds
hilltopads.com, YOUR_HILLTOPADS_ID, RESELLER

# AdMaven
ad-maven.com, YOUR_ADMAVEN_ID, RESELLER`;

  console.log(adsTxtContent);
  console.log("\n📝 Save this as /public/ads.txt and replace placeholder IDs");
  console.log(
    "📝 Each network will give you their specific line after approval",
  );
});

test("Open specific network for manual registration", async ({ page }) => {
  // Change this to the network you want to register on first
  const targetNetwork = "Adsterra"; // Change: 'Ezoic', 'AdSense', 'AdMaven', etc.

  const network = AD_NETWORKS.find((n) => n.name === targetNetwork);
  if (!network) {
    console.log(`Network "${targetNetwork}" not found`);
    return;
  }

  console.log(`\n🎯 Opening ${network.name} registration page...`);
  await page.goto(network.url, {
    waitUntil: "domcontentloaded",
    timeout: 30000,
  });
  await page.waitForTimeout(3000);

  // Take full page screenshot
  await page.screenshot({
    path: `screenshots/${network.name.replace(/\s+/g, "-").toLowerCase()}-registration.png`,
    fullPage: true,
  });

  console.log(`\n✅ ${network.name} page loaded`);
  console.log("📋 Now manually complete the registration form");
  console.log("📋 Requirements:", network.requirements);
  console.log("📋 Keep this browser window open to complete registration");
});
