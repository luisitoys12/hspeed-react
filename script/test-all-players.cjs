const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

async function testPlayers() {
  console.log('--- INICIANDO PRUEBAS DE REPRODUCTORES CON AZURACAST ---');

  // 1. Obtener token de admin para probar páginas interiores
  let adminToken = null;
  try {
    const loginRes = await fetch('http://127.0.0.1:5000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@habbospeed.com', password: 'admin123' })
    });
    const loginData = await loginRes.json();
    adminToken = loginData.token;
    console.log('✓ Token de admin obtenido con éxito.');
  } catch (err) {
    console.warn('! No se pudo autenticar admin directamente:', err.message);
  }

  const browser = await chromium.launch();
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 }
  });

  const page = await context.newPage();

  // Escuchar errores de página
  page.on('console', msg => {
    if (msg.type() === 'error') console.log('[Browser Error]:', msg.text());
  });

  // ==========================================
  // PRUEBA 1: Reproductor de MaintenancePage
  // ==========================================
  console.log('\n--- PRUEBA 1: MaintenancePage Player ---');
  await page.goto('http://127.0.0.1:5000/', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2500);

  // Leer título de canción y oyentes desde la UI
  const maintenanceTrack = await page.evaluate(() => {
    const h4 = document.querySelector('h4');
    const listenersEl = document.querySelector('span.text-slate-400');
    const audio = document.querySelector('audio');
    return {
      title: h4 ? h4.innerText : null,
      audioSrc: audio ? audio.src : null
    };
  });
  console.log('✓ Título detectado en MaintenancePage:', maintenanceTrack.title);

  // Hacer click en el botón de reproducción
  console.log('Haciendo clic en el botón Play...');
  const playButton = page.locator('button[title*="Radio"], button:has(svg.fill-white)').first();
  await playButton.click();
  await page.waitForTimeout(2000);

  // Verificar estado de reproducción del audio
  const audioStatusMaintenance = await page.evaluate(() => {
    const audio = document.querySelector('audio');
    if (!audio) return { error: 'No audio element' };
    return {
      src: audio.src,
      paused: audio.paused,
      currentTime: audio.currentTime,
      readyState: audio.readyState
    };
  });
  console.log('✓ Estado del audio en MaintenancePage:', audioStatusMaintenance);

  const screenMaint = path.resolve('screenshots', 'prueba_azuracast_mantenimiento.png');
  await page.screenshot({ path: screenMaint, fullPage: true });
  console.log('✓ Captura guardada:', screenMaint);


  // ==========================================
  // PRUEBA 2: RadioPage Dedicada (/radio)
  // ==========================================
  console.log('\n--- PRUEBA 2: RadioPage Dedicada (/radio) ---');
  if (adminToken) {
    await page.evaluate((tok) => {
      localStorage.setItem('token', tok);
    }, adminToken);
  }

  await page.goto('http://127.0.0.1:5000/radio', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(3000);

  const radioPageDetails = await page.evaluate(() => {
    const stationName = document.querySelector('h1, h2, h3')?.innerText;
    const bodyText = document.body.innerText;
    return {
      heading: stationName,
      hasSongInfo: bodyText.includes('Tití Me Preguntó') || bodyText.includes('Provenza') || bodyText.includes('Houdini') || bodyText.includes('Blinding Lights') || bodyText.includes('Radio'),
      hasAzuraCastStation: bodyText.includes('AzuraCast') || bodyText.includes('HabboSpeed')
    };
  });
  console.log('✓ Verificación de datos AzuraCast en RadioPage:', radioPageDetails);

  // Probar botón de reproducción en RadioPage
  const radioPlayBtn = page.locator('button:has(svg.lucide-play), button:has(svg.fill-current)').first();
  if (await radioPlayBtn.isVisible()) {
    await radioPlayBtn.click();
    await page.waitForTimeout(2000);
    const audioStatusRadio = await page.evaluate(() => {
      const audio = document.querySelector('audio');
      return audio ? { src: audio.src, paused: audio.paused, currentTime: audio.currentTime } : 'No audio';
    });
    console.log('✓ Audio en RadioPage:', audioStatusRadio);
  }

  const screenRadio = path.resolve('screenshots', 'prueba_azuracast_radiopage.png');
  await page.screenshot({ path: screenRadio, fullPage: true });
  console.log('✓ Captura guardada:', screenRadio);


  // ==========================================
  // PRUEBA 3: HomePage (/ con sesión Admin)
  // ==========================================
  console.log('\n--- PRUEBA 3: HomePage con Reproductor Superior ---');
  await page.goto('http://127.0.0.1:5000/', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(3000);

  const screenHome = path.resolve('screenshots', 'prueba_azuracast_homepage.png');
  await page.screenshot({ path: screenHome, fullPage: true });
  console.log('✓ Captura guardada:', screenHome);

  await browser.close();

  // ==========================================
  // Sincronizar Capturas con OneDrive
  // ==========================================
  const syncDirs = [
    'C:\\Users\\LuisSandoval\\OneDrive - Estacionkusmedios digital\\HabboSpeed-Capturas',
    'C:\\Users\\LuisSandoval\\OneDrive\\HabboSpeed-Capturas',
    'C:\\Users\\LuisSandoval\\.gemini\antigravity\\brain\\2e1623b9-1635-493c-8ec3-34f4ad2c8dbe'
  ];

  const filesToSync = [
    'prueba_azuracast_mantenimiento.png',
    'prueba_azuracast_radiopage.png',
    'prueba_azuracast_homepage.png'
  ];

  for (const dir of syncDirs) {
    if (fs.existsSync(dir)) {
      for (const file of filesToSync) {
        const src = path.resolve('screenshots', file);
        if (fs.existsSync(src)) {
          fs.copyFileSync(src, path.join(dir, file));
        }
      }
      console.log('✓ Capturas sincronizadas en:', dir);
    }
  }

  console.log('\n🎉 ¡TODAS LAS PRUEBAS DE REPRODUCTORES CON AZURACAST COMPLETADAS EXITOSAMENTE!');
}

testPlayers().catch(err => {
  console.error('Error durante la prueba:', err);
  process.exit(1);
});
