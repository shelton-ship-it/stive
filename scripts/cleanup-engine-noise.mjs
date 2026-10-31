#!/usr/bin/env node
import { readdirSync, existsSync, readFileSync, statSync } from "node:fs";
import { join, resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const enginesRoot = join(root, "packages", "engines");
const catalogPath = join(enginesRoot, "catalog.json");
if (!existsSync(catalogPath)) throw new Error("Missing packages/engines/catalog.json");

const catalog = JSON.parse(readFileSync(catalogPath, "utf8"));
const allowedRootEntries = new Set(["catalog.json", "catalog.schema.json", "categories"]);
const catalogEngines = new Set(catalog.categories.flatMap((category) => category.engines));
const problems = [];

for (const entry of readdirSync(enginesRoot)) {
  if (allowedRootEntries.has(entry)) continue;
  problems.push(`Unexpected root entry: packages/engines/${entry}`);
}

const categoriesRoot = join(enginesRoot, "categories");
if (!existsSync(categoriesRoot)) {
  problems.push("Missing packages/engines/categories/");
} else {
  for (const category of catalog.categories) {
    const categoryPath = join(categoriesRoot, category.id);
    if (!existsSync(categoryPath) || !statSync(categoryPath).isDirectory()) {
      problems.push(`Missing category directory: categories/${category.id}`);
      continue;
    }
    const categoryEntries = new Set(readdirSync(categoryPath));
    if (!categoryEntries.has("dashboard")) {
      problems.push(`Missing dashboard: categories/${category.id}/dashboard`);
    }
    for (const engine of category.engines) {
      const enginePath = join(categoryPath, engine);
      if (!existsSync(enginePath) || !statSync(enginePath).isDirectory()) {
        problems.push(`Catalog engine missing from category: categories/${category.id}/${engine}`);
      }
    }
    for (const entry of categoryEntries) {
      if (entry === "dashboard") continue;
      if (!catalogEngines.has(entry) || !category.engines.includes(entry)) {
        problems.push(`Entry outside catalog/category: categories/${category.id}/${entry}`);
      }
    }
  }
  const knownCategories = new Set(catalog.categories.map((category) => category.id));
  for (const entry of readdirSync(categoriesRoot)) {
    if (!knownCategories.has(entry)) problems.push(`Category outside catalog: categories/${entry}`);
  }
}

if (problems.length) {
  console.error("Engine structure noise detected:");
  for (const problem of problems) console.error(` - ${problem}`);
  console.error("No files were deleted. Remove or relocate entries deliberately, then rerun this check.");
  process.exit(1);
}
console.log("No unexpected entries found under packages/engines.");
