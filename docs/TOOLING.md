# HabboSpeed — Tooling Guide

Documentación del stack de herramientas de desarrollo del proyecto.

---

## CI/CD — GitHub Actions

Archivo: `.github/workflows/ci.yml`

Se ejecuta automáticamente en cada `push` y `pull_request` a `main`.

**Pasos:**
1. `npm ci` — instala dependencias limpias
2. `npm run check` — verificación de tipos TypeScript (`tsc`)
3. `npm run build` — build completo de producción

> ⚠️ El workflow no necesita DATABASE_URL real. Se pasa un placeholder para que el build no crashee por variables de entorno faltantes.

---

## Pre-commit Hooks — Husky + lint-staged

Archivos: `.husky/pre-commit`, `package.json` → `lint-staged`

**Instalación inicial (solo una vez por desarrollador):**
```bash
npm install
# Husky se instala automáticamente vía el script "prepare"
```

**Qué hace antes de cada commit:**
- Archivos `*.ts` y `*.tsx`: formatea con Prettier
- Archivos `*.json`, `*.css`, `*.md`: formatea con Prettier

> 📌 ESLint no está incluido todavía porque el proyecto no tiene configuración de ESLint. Para agregarlo:
> ```bash
> npm install -D eslint @typescript-eslint/parser @typescript-eslint/eslint-plugin eslint-plugin-react-hooks
> npx eslint --init
> ```
> Luego agrega `"eslint --fix"` al array de `*.{ts,tsx}` en la sección `lint-staged` del `package.json`.

---

## Herramientas pendientes (requieren registro)

| Herramienta | Propósito | Registro en |
|---|---|---|
| **Sentry** | Error tracking en React y Express | sentry.io |
| **PostHog** | Analytics y feature flags | posthog.com |
| **OpenReplay** | Session replay (alternativa open source a LogRocket) | openreplay.com o self-hosted |

---

## Prettier — Configuración recomendada

Crea un archivo `.prettierrc` en la raíz:

```json
{
  "semi": true,
  "singleQuote": false,
  "tabWidth": 2,
  "trailingComma": "es5",
  "printWidth": 100,
  "plugins": ["prettier-plugin-tailwindcss"]
}
```

Y agrega `prettier-plugin-tailwindcss` para ordenar automáticamente las clases de Tailwind:
```bash
npm install -D prettier-plugin-tailwindcss
```
