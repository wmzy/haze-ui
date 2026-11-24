#!/usr/bin/env node
/**
 * Build dist/mcp-docs.json — the single docs snapshot served by the
 * haze-ui MCP server (mcp/index.mjs). Sources:
 *
 *   - src/generated/props.json       required — TS-extracted props tables
 *                                     (missing = fatal: run generate-props.mjs)
 *   - src/generated/props-docs.json  optional — handwritten description/default
 *                                     overrides, merged with PropsTable parity
 *   - dist/registry.json             optional — one-line descriptions
 *                                     (join key: css family ↔ registry item name)
 *   - dist/tokens/registry.js        optional — TOKEN_REGISTRY (dynamic import)
 *
 * CLI: node scripts/generate-mcp-docs.mjs
 *
 * The props merge is scripts/props-merge.mjs, shared with llms-full.txt
 * (scripts/generate-llms-full.mjs) — this snapshot additionally keeps the
 * `required` column.
 */
import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

import { defaultRoot, readJson } from './cli-utils.mjs';
import { mergeRows, typeEntries } from './props-merge.mjs';

const rootDir = defaultRoot();

/** Load the shadcn registry; degrade to no metadata when dist/ is absent. */
function loadRegistry() {
  const registry = readJson(rootDir, 'dist/registry.json', { optional: true });
  if (!registry) {
    console.error(
      'generate-mcp-docs: dist/registry.json missing — components ship without descriptions (run a lib build to include them).'
    );
    return new Map();
  }
  return new Map(registry.items.map((item) => [item.name, item]));
}

/** Load TOKEN_REGISTRY from the built token registry module. */
async function loadTokens() {
  const file = path.join(rootDir, 'dist', 'tokens', 'registry.js');
  if (!existsSync(file)) {
    console.error(
      'generate-mcp-docs: dist/tokens/registry.js missing — tokens list will be empty (run a lib build to include it).'
    );
    return [];
  }
  const mod = await import(pathToFileURL(file).href);
  return mod.TOKEN_REGISTRY ?? [];
}

/**
 * Build the component map: props tables + registry metadata, keyed by the
 * PascalCase export name (the props.json key). Registry items without a
 * props entry ('base', 'form', 'tokens', …) are not components and are
 * skipped.
 */
function buildComponents(propsComponents, docsByType, registryByFamily) {
  const components = {};
  for (const [name, entry] of Object.entries(propsComponents)) {
    const cssFamily = entry.cssFamily;
    const item = registryByFamily.get(cssFamily);
    const props = {};
    for (const [typeName, generatedRows] of typeEntries(entry)) {
      props[typeName] = mergeRows(generatedRows, docsByType[typeName], {
        required: true,
      });
    }
    components[name] = {
      cssFamily,
      importStatement:
        `import { ${(entry.imports ?? [name]).join(', ')} } from 'haze-ui';\n` +
        `import 'haze-ui/css/tokens.css';\n` +
        `import 'haze-ui/css/${cssFamily}.css';`,
      peerDeps: (item?.dependencies ?? []).filter((dep) => dep !== 'haze-ui'),
      description: item?.description ?? '',
      props,
    };
  }
  return components;
}

async function main() {
  // props.json is the one fatal input: missing means generate-props has not
  // run — the wording is kept stable for anyone matching on it.
  if (!existsSync(path.join(rootDir, 'src/generated/props.json'))) {
    console.error(
      'src/generated/props.json not found — run `node scripts/generate-props.mjs` first (fatal).'
    );
    process.exit(1);
  }
  const props = readJson(rootDir, 'src/generated/props.json');
  const docsByType =
    readJson(rootDir, 'src/generated/props-docs.json', { optional: true }) ?? {};
  const registryByFamily = loadRegistry();
  const tokens = await loadTokens();

  const components = buildComponents(props.components ?? {}, docsByType, registryByFamily);
  const snapshot = {
    generatedAt: new Date().toISOString(),
    components,
    tokens,
  };

  const out = path.join(rootDir, 'dist', 'mcp-docs.json');
  mkdirSync(path.dirname(out), { recursive: true });
  writeFileSync(out, `${JSON.stringify(snapshot, null, 2)}\n`);
  console.log(
    `generate-mcp-docs: wrote ${path.relative(rootDir, out)} — ` +
      `${Object.keys(components).length} components, ${tokens.length} tokens`
  );
}

main().catch((error) => {
  console.error(`generate-mcp-docs: ${error?.stack ?? error}`);
  process.exit(1);
});
