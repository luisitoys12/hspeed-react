// ============================================================
//  hspeed-react — Punto de entrada para Phusion Passenger (cPanel)
//
//  cPanel "Setup Node.js App" usa Phusion Passenger, que espera
//  un archivo JavaScript que exporte una app de Express.
//  Este wrapper carga el bundle compilado (dist/index.cjs) y lo
//  re-exporta para Passenger.
// ============================================================

const path = require("path");

// Cargar variables de .env si existe (dotenv-like manual)
try {
  const fs = require("fs");
  const envPath = path.join(__dirname, ".env");
  if (fs.existsSync(envPath)) {
    const content = fs.readFileSync(envPath, "utf-8");
    for (const line of content.split("\n")) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const eqIdx = trimmed.indexOf("=");
      if (eqIdx === -1) continue;
      const key = trimmed.slice(0, eqIdx).trim();
      let val = trimmed.slice(eqIdx + 1).trim();
      // quitar comillas envolventes
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
        val = val.slice(1, -1);
      }
      if (!process.env[key]) {
        process.env[key] = val;
      }
    }
  }
} catch (e) {
  console.error("[app.js] No se pudo leer .env:", e.message);
}

// Asegurar puerto de Passenger
if (!process.env.PORT && process.env.PASSENGER_PORT) {
  process.env.PORT = process.env.PASSENGER_PORT;
}

// Cargar el bundle del servidor compilado
const app = require("./index.cjs");

// Si el bundle exporta la app directamente, re-exportarla
module.exports = app;
