#!/usr/bin/env node
/**
 * Generate the repo-root llms-full.txt — the single-file "full" companion to
 * llms.txt: the complete Haze UI API reference in one markdown document.
 *
 * Sources (both committed):
 *   - src/generated/props.json      — written by scripts/generate-props.mjs
 *                                      (TS Compiler API: name/type/required
 *                                      rows straight from library source)
 *   - src/generated/props-docs.json — hand-maintained description/default
 *                                      overrides plus ghost rows the generator
 *                                      cannot see (className, `...rest`,
 *                                      children, …)
 *
 * Merge semantics live in scripts/props-merge.mjs (shared with the MCP
 * docs snapshot, scripts/generate-mcp-docs.mjs) and mirror the docs
 * site's PropsTable (src/views/ComponentDetail/PropsTable.tsx): generated
 * rows keep their verbatim type string; matching doc rows layer
 * description/default on top; doc-only ghost rows are appended afterwards
 * with their own type (or —).
 *
 * The output is deterministic (sorted component/type keys, no timestamps) so
 * consecutive runs are byte-identical.
 *
 * CLI:  node scripts/generate-llms-full.mjs
 * API:  import { writeLlmsFull } from './scripts/generate-llms-full.mjs'
 *       (vite.config.mts keeps the file fresh on demo builds)
 */
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';

import { defaultRoot, invokedDirectly, readJson, runCli } from './cli-utils.mjs';
import { mergeRows, typeEntries } from './props-merge.mjs';

/** props.json is mandatory (error explains how to produce it); docs degrade to {}. */
const loadSources = (rootDir) => {
  const props = readJson(rootDir, 'src/generated/props.json', {
    hint: 'run `node scripts/generate-props.mjs` first',
  });
  const docsByType =
    readJson(rootDir, 'src/generated/props-docs.json', { optional: true }) ?? {};
  return { components: props.components ?? {}, docsByType };
};

/** A pipe would end the markdown table cell — including inside code spans. */
const escapeCell = (text) => text.replaceAll('|', '\\|').replaceAll('\n', ' ');

const codeCell = (text) => `\`${escapeCell(text)}\``;

function renderTable(rows) {
  const lines = [
    '| Prop | Type | Default | Description |',
    '| --- | --- | --- | --- |',
  ];
  for (const row of rows) {
    const def = row.default ? codeCell(row.default) : '—';
    lines.push(
      `| ${codeCell(row.name)} | ${codeCell(row.type)} | ${def} | ${escapeCell(row.description)} |`
    );
  }
  return lines.join('\n');
}

function renderComponent(name, entry, docsByType) {
  const lines = [`## ${name}`, ''];
  const imports = entry.imports ?? [];
  if (imports.length > 0) {
    lines.push(
      '```jsx',
      `import { ${imports.join(', ')} } from 'haze-ui';`,
      '```',
      ''
    );
  }
  for (const [typeName, generatedRows] of typeEntries(entry)) {
    const rows = mergeRows(generatedRows, docsByType[typeName]);
    lines.push(`### ${typeName}`, '', renderTable(rows), '');
  }
  return lines.join('\n');
}

function renderHeader(componentCount, typeTableCount) {
  return `# Haze UI — Full API Reference

> Complete props reference for all ${componentCount} Haze UI components in one
> file (${typeTableCount} type tables), generated from the library source. Do not
> edit by hand — regenerate with \`node scripts/generate-llms-full.mjs\`. For the
> curated index with overviews, design tokens and architecture notes, see
> [llms.txt](llms.txt).

## Install

Peer range \`react: ^19.0.0\` — no React 18 compatibility layer.

\`\`\`sh
npm i haze-ui
# optional peers, only for the components that need them:
npm i react-f0rm                            # FormItem
npm i @tanstack/react-table                 # DataTable
npm i recharts                              # Chart
npm i @dnd-kit/core @dnd-kit/sortable \\
      @dnd-kit/utilities                    # TagInput/TagGroup sortable
\`\`\`

## CSS: two loading modes

The JS entry imports no stylesheet — pick one mode:

\`\`\`jsx
// 1) Full stylesheet (simplest)
import 'haze-ui/styles.css';

// 2) Per-component CSS: tokens once + each component you use
import 'haze-ui/css/tokens.css';
import 'haze-ui/css/button.css';
\`\`\`

Per-component files are kebab-case names, but sub-components and cores share their
directory's family file (\`InputCore\` → \`input.css\`). Don't hardcode the mapping:
\`haze-ui/css-manifest.json\` is the machine-readable, build-generated export → css-file
map (with family absorption and a \`noCss\` list) — tooling should read it instead of
re-deriving file names.

## Components

One section per component: its \`haze-ui\` import, then a props table per exported
type. Type strings are verbatim from the TypeScript source; handwritten rows the
extractor cannot see (\`className\`, \`...rest\`, \`children\`) close each table.
`;
}

/** Build the full document from loaded sources. */
function buildDocument(components, docsByType) {
  const names = Object.keys(components).sort();
  const typeTableCount = names.reduce(
    (sum, name) => sum + typeEntries(components[name]).length,
    0
  );

  const body = names
    .map((name) => renderComponent(name, components[name], docsByType))
    .join('\n');

  return `${renderHeader(names.length, typeTableCount)}\n${body}`;
}

export function generateLlmsFull(rootDir = defaultRoot()) {
  const { components, docsByType } = loadSources(rootDir);
  return buildDocument(components, docsByType);
}

/**
 * Write llms-full.txt at the repo root. Idempotent: when the generated content
 * is unchanged the file is not touched (keeps watcher/build timestamps stable).
 */
export function writeLlmsFull(rootDir = defaultRoot()) {
  const { components, docsByType } = loadSources(rootDir);
  const content = buildDocument(components, docsByType);
  const outFile = path.join(rootDir, 'llms-full.txt');
  const unchanged =
    existsSync(outFile) &&
    readFileSync(outFile, 'utf8').trimEnd() === content.trimEnd();
  if (!unchanged) {
    writeFileSync(outFile, content);
  }
  return {
    changed: !unchanged,
    outFile,
    componentCount: Object.keys(components).length,
    lineCount: content.split('\n').length,
  };
}

if (invokedDirectly(import.meta.url)) {
  runCli('generate-llms-full', (started) => {
    const { changed, outFile, componentCount, lineCount } = writeLlmsFull();
    return `${componentCount} components, ${lineCount} lines, ${changed ? 'wrote' : 'unchanged'} ${path.relative(defaultRoot(), outFile)} in ${Date.now() - started}ms`;
  });
}
