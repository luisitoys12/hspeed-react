hspeed-react — cPanel deploy package

Contenido de esta carpeta:

- index.cjs ← Bundle del servidor (generado por esbuild)
- public/ ← Archivos estáticos del cliente (index.html, assets)
- package.json ← Copiar al servidor para instalar dependencias
- package-lock.json
- .htaccess ← Reglas Apache para SPA y cache
- .env.example ← Ejemplo de variables de entorno
- .env ← Variables usadas para prueba local
- app.js ← Wrapper para Phusion Passenger (cPanel)
- .cpanel.yml ← Hook para despliegue automático desde Git

Prueba local (desde la raíz del repo):

```bash
# arrancar en background (usa el bundle en cpanel-deploy):
node cpanel-deploy/index.cjs &
# o con npm (si quieres usar script start):
# npm run start
```

Notas:

- En cPanel, usa "Setup Node.js App" y apunta a esta carpeta.
- Asegúrate de configurar las variables de entorno en cPanel o subir un `.env` seguro.
- Si no tienes base de datos, usa `USE_MEMSTORAGE=true`.
