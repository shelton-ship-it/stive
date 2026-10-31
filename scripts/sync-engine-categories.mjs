#!/usr/bin/env node
import { existsSync, mkdirSync, renameSync, readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const enginesRoot = join(root, "packages", "engines");
const catalogPath = join(enginesRoot, "catalog.json");
const checkOnly = process.argv.includes("--check");

function fail(message) {
  console.error(`engine-category-sync: ${message}`);
  process.exitCode = 1;
}

const catalog = JSON.parse(readFileSync(catalogPath, "utf8"));
const categories = catalog.categories;
if (!Array.isArray(categories) || categories.length === 0) {
  throw new Error("catalog.json must define a non-empty categories array");
}

const seen = new Set();
for (const category of categories) {
  if (!category.id || !Array.isArray(category.engines) || !category.dashboard) {
    throw new Error("Each category requires id, dashboard and engines");
  }
  const dashboardPath = join(enginesRoot, category.dashboard);
  if (!existsSync(dashboardPath)) {
    if (checkOnly) fail(`missing category dashboard: ${category.dashboard}`);
    else mkdirSync(dashboardPath, { recursive: true });
  }

  for (const engine of category.engines) {
    if (seen.has(engine)) throw new Error(`duplicate engine in catalog: ${engine}`);
    seen.add(engine);
    const legacyPath = join(enginesRoot, engine);
    const targetPath = join(enginesRoot, "categories", category.id, engine);
    const legacyExists = existsSync(legacyPath);
    const targetExists = existsSync(targetPath);

    if (legacyExists && targetExists) {
      fail(`both legacy and categorized paths exist for ${engine}; refusing to overwrite either`);
      continue;
    }
    if (targetExists) continue;
    if (!legacyExists) {
      fail(`engine ${engine} is missing at both ${legacyPath} and ${targetPath}`);
      continue;
    }
    if (checkOnly) {
      fail(`engine ${engine} is still at legacy path packages/engines/${engine}`);
      continue;
    }
    mkdirSync(dirname(targetPath), { recursive: true });
    renameSync(legacyPath, targetPath);
    console.log(`moved packages/engines/${engine} -> packages/engines/categories/${category.id}/${engine}`);
  }
}

if (process.exitCode) process.exit(process.exitCode);
console.log(checkOnly ? "Engine category structure is aligned with catalog.json." : "Engine category synchronization complete.");
