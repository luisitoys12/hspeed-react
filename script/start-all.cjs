/**
 * HabboSpeed - Turnkey All-in-One Launcher
 * Inicia automáticamente:
 * 1. Servidor de Radio AzuraCast (puerto 8005 con stream y API nowplaying)
 * 2. Servidor Web HabboSpeed (puerto 5000 con Frontend Vite + Backend Express)
 */

const { spawn } = require('child_process');
const path = require('path');
const http = require('http');

console.log('====================================================');
console.log('      🎧 INICIANDO HABBOSPEED FULL STACK 🎧         ');
console.log('====================================================\n');

// 1. Iniciar servidor AzuraCast (Radio)
console.log(' [1/2] Levantando Servidor AzuraCast Radio (Puerto 8005)...');
const azuraProcess = spawn('node', [path.join(__dirname, 'azuracast-server.cjs')], {
  stdio: 'inherit',
  shell: true
});

azuraProcess.on('error', (err) => {
  console.error(' Error al iniciar servidor AzuraCast:', err);
});

// Esperar 2 segundos para asegurar que el puerto 8005 esté arriba
setTimeout(() => {
  console.log('\n [2/2] Levantando Servidor Web HabboSpeed (Puerto 5000)...');
  const webProcess = spawn('npm', ['run', 'dev'], {
    stdio: 'inherit',
    shell: true
  });

  webProcess.on('error', (err) => {
    console.error(' Error al iniciar Servidor Web:', err);
  });

  const cleanup = () => {
    console.log('\n Apagando todos los servicios de HabboSpeed...');
    try { azuraProcess.kill(); } catch (e) {}
    try { webProcess.kill(); } catch (e) {}
    process.exit(0);
  };

  process.on('SIGINT', cleanup);
  process.on('SIGTERM', cleanup);
}, 2000);
