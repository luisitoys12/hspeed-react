import { createRequire } from "module";
import { rm, readFile } from "fs/promises";
import { existsSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, resolve } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(__dirname, "..");

// Posibles ubicaciones de node_modules en cPanel nodevenv
const searchPaths = [
  resolve(projectRoot, "node_modules"),
  "/home/mtyhurjnqk/nodevenv/habbospeed.tech/20/lib/node_modules",
];

function findModule(name) {
  for (const base of searchPaths) {
    const p = resolve(base, name);
    if (existsSync(p)) return p;
    // nested inside tsx
    const nested = resolve(base, "tsx", "node_modules", name);
    if (existsSync(nested)) return nested;
  }
  throw new Error(`Cannot find module '${name}' in any of: ${searchPaths.join(", ")}`);
}

// Cargar esbuild
const esbuildPath = findModule("esbuild");
console.log("[build] using esbuild from:", esbuildPath);
const { build: esbuild } = await import(resolve(esbuildPath, "lib", "main.js"));

// Cargar vite
const vitePath = findModule("vite");
console.log("[build] using vite from:", vitePath);
const { build: viteBuild } = await import(resolve(vitePath, "dist", "node", "index.js"));

// server deps to bundle
const allowlist = [
  "@google/generative-ai",
  "axios",
  "connect-pg-simple",
  "cors",
  "date-fns",
  "drizzle-orm",
  "drizzle-zod",
  "express",
  "express-rate-limit",
  "express-session",
  "jsonwebtoken",
  "memorystore",
  "multer",
  "nanoid",
  "nodemailer",
  "openai",
  "passport",
  "passport-local",
  "pg",
  "stripe",
  "uuid",
  "ws",
  "xlsx",
  "zod",
  "zod-validation-error",
];

async function buildAll() {
  await rm("dist", { recursive: true, force: true });

  console.log("building client...");
  await viteBuild();

  console.log("building server...");
  const pkg = JSON.parse(await readFile("package.json", "utf-8"));
  const allDeps = [
    ...Object.keys(pkg.dependencies || {}),
    ...Object.keys(pkg.devDependencies || {}),
  ];
  const externals = allDeps.filter((dep) => !allowlist.includes(dep));

  await esbuild({
    entryPoints: ["server/index.ts"],
    platform: "node",
    bundle: true,
    format: "cjs",
    outfile: "dist/index.cjs",
    define: {
      "process.env.NODE_ENV": '"production"',
    },
    minify: true,
    external: externals,
    logLevel: "info",
  });

  console.log("build complete: dist/index.cjs");
}

buildAll().catch((err) => {
  console.error(err);
  process.exit(1);
});
