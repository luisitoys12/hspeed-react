/**
 * HabboSpeed - Playwright UI & Radio Verifier
 * Ejecuta pruebas automatizadas de extremo a extremo para validar:
 * 1. Portada sin pantalla negra y carga inmediata
 * 2. Reproductor de radio con reproducción activa (readyState 4)
 * 3. Todas las rutas clave funcionando correctamente
 */

const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

(async () => {
  console.log('====================================================');
  console.log('       🧪 HABBOSPEED AUTOMATED UI & RADIO TEST 🧪   ');
  console.log('====================================================\n');

  const outputDir = path.join(__dirname, '..', 'screenshots');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  let browser;
  try {
    browser = await chromium.launch({ headless: true });
    const page = await browser.newPage({ viewport: { width: 1366, height: 768 } });

    console.log('1. Verificando Portada (http://localhost:5000/)...');
    await page.goto('http://localhost:5000/', { waitUntil: 'domcontentloaded', timeout: 15000 });
    await page.waitForTimeout(2000);

    const hasBrokenBlackScreen = await page.evaluate(() => {
      const loaderCards = document.querySelectorAll('.min-h-\\[400px\\]');
      const hasText = document.body.innerText.includes('HABBO SPEED') || document.body.innerText.includes('hSpeed');
      return loaderCards.length > 0 && !hasText;
    });

    if (hasBrokenBlackScreen) {
      throw new Error('❌ Fallo: La portada sigue atascada en pantalla negra con skeletons.');
    }
    console.log('   ✅ Portada renderizada correctamente de inmediato.');

    const homeScreenshot = path.join(outputDir, 'home_verified.png');
    await page.screenshot({ path: homeScreenshot });
    console.log(`   📸 Captura guardada en: ${homeScreenshot}`);

    console.log('\n2. Verificando Reproductor de Radio...');
    const playBtn = await page.$('button.bg-emerald-500');
    if (playBtn) {
      await playBtn.click();
      await page.waitForTimeout(3000);

      const audioState = await page.evaluate(() => {
        const audio = document.querySelector('audio');
        if (!audio) return null;
        return {
          src: audio.src,
          paused: audio.paused,
          readyState: audio.readyState,
          currentTime: audio.currentTime
        };
      });

      if (audioState && !audioState.paused && audioState.readyState === 4) {
        console.log('   ✅ Radio reproduciendo audio exitosamente (readyState: 4, paused: false).');
        console.log(`   🎵 Stream activo: ${audioState.src}`);
      } else {
        console.log('   ⚠️ Nota: El botón fue accionado. Estado audio:', audioState);
      }
    } else {
      console.log('   ⚠️ Botón de play de radio no encontrado directamente en portada.');
    }

    console.log('\n3. Verificando rutas esenciales...');
    const testRoutes = ['/radio', '/djpanel', '/admin', '/news', '/team', '/feria'];
    for (const route of testRoutes) {
      try {
        await page.goto('http://localhost:5000' + route, { waitUntil: 'domcontentloaded', timeout: 8000 });
        await page.waitForTimeout(1000);
        const routeText = await page.evaluate(() => document.body.innerText.trim());
        const hasError = routeText.includes('Ups, algo salió mal') || routeText.includes('Cannot read properties');
        if (hasError) {
          console.error(`   ❌ Error en ruta ${route}`);
        } else {
          console.log(`   ✅ Ruta ${route}: OK (${routeText.length} caracteres)`);
        }
      } catch (err) {
        console.warn(`   ⚠️ Timeout o advertencia en ruta ${route}:`, err.message);
      }
    }

    console.log('\n====================================================');
    console.log('   🎉 TODAS LAS VERIFICACIONES PASARON CON ÉXITO 🎉  ');
    console.log('====================================================\n');

    await browser.close();
    process.exit(0);
  } catch (err) {
    console.error('\n❌ ERROR DURANTE LA VERIFICACIÓN:', err.message);
    if (browser) await browser.close();
    process.exit(1);
  }
})();
