#!/usr/bin/env node
/**
 * Generate the shadcn CLI registries for haze-ui — two channels from one
 * pass (run AFTER `pnpm build`; dist/css-manifest.json is required; the
 * `pnpm build` script chains this):
 *
 * 1. GitHub registry (committed to git): root `registry.json` plus
 *    `registry/<item>.json` (flat registry-item payloads with wrapper
 *    source embedded as files[].content) and `registry/<item>.tsx`
 *    (wrapper sources). Since shadcn 2026-06 a public GitHub
 *    repository *is* a registry: the CLI reads the root registry.json
 *    and installs the repo files an item declares —
 *    `pnpm dlx shadcn@latest add wmzy/haze-ui/button`. The root index
 *    carries all items inline (an `include` list only accepts files
 *    literally named registry.json, so kebab-case per-item files cannot
 *    be composed via include), each item referencing its wrapper file
 *    by repo-relative path. The per-item JSONs additionally allow
 *    direct file-path installs (`wmzy/haze-ui/registry/button.json` —
 *    addresses ending in .json are read as files; the CLI only writes
 *    files with embedded content on that path, hence the duplication)
 *    and must stay flat registry-item payloads, not `{ items: [...] }`
 *    wrappers.
 *
 * 2. npm artifact: `dist/registry.json` (exported as `haze-ui/
 *    registry.json`, also served from unpkg). Same items, but the
 *    wrapper source is embedded as `files[].content` because a served
 *    payload has no repository to read paths from.
 *
 * ── Wrapper design ───────────────────────────────────────────────────
 * A shadcn registry normally vendors component *source* into the
 * consumer's project. That is not viable for haze-ui: the components are
 * compiled CSS-in-JS (linaria) whose classes only exist after a library
 * build, and every rule is written against `--haze-*` design tokens.
 * Copying the source would produce files that neither style nor build.
 *
 * So each registry item ships a thin *wrapper* file instead: it imports
 * the named component(s) from the npm package plus their stylesheet
 * (`haze-ui/css/<family>.css`, family resolved from the build's own
 * dist/css-manifest.json — never hand-maintained), and re-exports them.
 * `shadcn add wmzy/haze-ui/button` therefore yields a customization
 * layer the consumer owns, while `haze-ui` remains a normal npm
 * dependency that keeps updating underneath. Consumers apply the theme
 * exactly as the docs app and examples/ do: the `lightTheme` (+
 * `spacing` + `typography`) classes on a root element — see the wrapper
 * header (and the dedicated `tokens` item).
 *
 * Coverage: every *styled* named export of the main barrel
 * (src/lib/index.ts), grouped by css family. Multi-export directories
 * (Tabs/TabList/Tab/TabPanel, Splitter/SplitterPane, …)
 * merge into one item; the token classes (lightTheme/darkTheme/
 * spacing/typography across three modules) merge into the `tokens`
 * item. On top of the generated set, the hand-curated `haze-tokens`
 * item (a design-token onboarding guide installed as a markdown doc)
 * is carried over from the first manual iteration of this registry,
 * and a `base` meta item (type `registry:base`) references every
 * component item through `registryDependencies` — one command,
 * `npx shadcn add wmzy/haze-ui/base`, installs the whole design system.
 * On top of those, `registry:block` items (login-block, dashboard-block,
 * crud-block) vendor the docs-site full-page compositions from
 * src/views/Blocks/blocks/ as consumer-owned source: '@/lib' imports
 * rewritten to the 'haze-ui' barrel, the css closure prepended, npm deps
 * (zod, react-use-control) declared, and every rendered component's
 * wrapper item pulled in through registryDependencies.
 * Pure-logic exports (hooks, TOKEN_REGISTRY/COMPONENT_TOKENS,
 * LocaleProvider string packs, direction utils, the useControl
 * re-export, …) ship no css of their own and are skipped — the run log
 * lists them. Optional peer packages statically imported by a family's
 * sources (recharts, @tanstack/react-table, the dnd-kit trio,
 * react-f0rm) are detected from source and added to that item's
 * `dependencies`, so `shadcn add` installs them automatically.
 *
 * Every item also carries two metadata fields the shadcn CLI surfaces:
 * `docs` — a markdown usage string (one-line component description
 * from scripts/component-descriptions.mjs, the table llms.txt shares;
 * install command, token-activation notes) shown by `shadcn docs` —
 * and `categories` (kebab-case, derived from the demo sidebar groups
 * in src/views/Layout/component-groups.ts) for `shadcn search`
 * filtering. The run fails when the sidebar, the css families and the
 * blurb table disagree — a component missing from any of them cannot
 * pass silently.
 *
 * Static content under registry/ that the generator does not own and
 * never touches: README.md, tsconfig.json (typechecks the wrappers via
 * the package-name self-reference), haze-tokens/haze-tokens.md (the
 * curated doc item's file).
 *
 * The script self-checks both artifacts (required fields, unique
 * kebab-case names, non-empty paths/content, `haze-ui` dependency, root
 * index ↔ registry/ per-item files 1:1, referenced files exist) and
 * exits non-zero on failure.
 */
import { existsSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import path from 'node:path';

import { defaultRoot, failFor } from './cli-utils.mjs';
import { readComponentGroups } from './component-groups.mjs';
import { CSS_LESS, REGISTRY_BLURBS } from './component-descriptions.mjs';

const rootDir = defaultRoot();
const libDir = path.join(rootDir, 'src', 'lib');
const distDir = path.join(rootDir, 'dist');
const manifestPath = path.join(distDir, 'css-manifest.json');
const barrelPath = path.join(libDir, 'index.ts');
const registryDir = path.join(rootDir, 'registry');
const registryIndexPath = path.join(rootDir, 'registry.json');
const HOMEPAGE = 'https://github.com/wmzy/haze-ui';
const AUTHOR = 'wmzy <https://github.com/wmzy>';
const REGISTRY_SCHEMA = 'https://ui.shadcn.com/schema/registry.json';
const ITEM_SCHEMA = 'https://ui.shadcn.com/schema/registry-item.json';
const TOKENS_FAMILY = 'tokens';
// Files/directories under registry/ that are not generated per-item.
const REGISTRY_STATICS = new Set(['README.md', 'tsconfig.json', 'css.d.ts', 'haze-tokens']);

const fail = failFor('generate-registry');

// ---- inputs: css-manifest (build artifact) + the whole main barrel ----

let manifest;
try {
  manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));
} catch (error) {
  fail(
    `cannot read ${path.relative(rootDir, manifestPath)} (${error.code ?? error.message}). ` +
      'It is produced by pnpm build via scripts/split-css.mjs — run the build first.'
  );
}

// module spec -> { values: [public export names], types: [...] }, in barrel order.
// Clause forms handled: `Button`, `default as LocaleProvider`, `XProps as YProps`.
const modules = new Map();
for (const m of readFileSync(barrelPath, 'utf8').matchAll(
  /^export\s+(type\s+)?\{([^}]*)\}\s+from\s+['"]([^'"]+)['"]/gm
)) {
  const [, isType, names, spec] = m;
  if (!modules.has(spec)) modules.set(spec, { values: [], types: [] });
  const bucket = isType ? 'types' : 'values';
  // Strip line comments first: a comma inside a `//` note (e.g.
  // "(react-f0rm's own, component-bound)") would otherwise split into a
  // phantom export name.
  const commentFree = names.replace(/\/\/[^\n]*/g, '');
  for (const clause of commentFree.split(',')) {
    const words = clause.trim().split(/\s+/).filter(Boolean);
    if (words.length > 0) modules.get(spec)[bucket].push(words[words.length - 1]);
  }
}
if (modules.size === 0) fail('main barrel parsed empty — barrel shape changed?');

// ---- group barrel exports into css-family items, collecting skips ----

// family -> { exports: [], types: [], modules: Set<spec> }
const families = new Map();
const skipped = [];
for (const [spec, mod] of modules) {
  if (!spec.startsWith('./')) {
    for (const name of mod.values) {
      skipped.push([name, `re-export of external package '${spec}' — depend on it directly`]);
    }
    for (const name of mod.types) {
      skipped.push([`type ${name}`, 'type of an external re-export']);
    }
    continue;
  }
  const moduleFamilies = [...new Set(mod.values.map((v) => manifest.families[v]))];
  if (moduleFamilies.length > 1) {
    fail(`${spec} spans multiple css families (${moduleFamilies.join(', ')}) — split the barrel export or teach the script the mapping`);
  }
  const family = moduleFamilies[0];
  if (family === undefined) {
    const untracked = mod.values.filter((v) => !manifest.noCss.includes(v));
    if (untracked.length > 0) {
      fail(`${spec} exports not present in css-manifest.json: ${untracked.join(', ')} — rerun pnpm build so the manifest catches up`);
    }
    for (const name of mod.values) {
      skipped.push([name, 'logic-only export — ships no css of its own (noCss in css-manifest)']);
    }
    for (const name of mod.types) {
      skipped.push([`type ${name}`, 'type of a css-less module, skipped with it']);
    }
    continue;
  }
  if (!families.has(family)) families.set(family, { exports: [], types: [], modules: new Set() });
  const entry = families.get(family);
  entry.exports.push(...mod.values);
  entry.types.push(...mod.types);
  entry.modules.add(spec);
}

// The manifest and the barrel must agree exactly.
const barrelValues = new Set([...modules.values()].flatMap((mod) => mod.values));
const staleFamilies = Object.keys(manifest.families).filter((name) => !barrelValues.has(name));
if (staleFamilies.length > 0) {
  fail(`css-manifest families not exported by the main barrel: ${staleFamilies.join(', ')} — rerun pnpm build`);
}

const listSourceFiles = (dir) => {
  const files = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) files.push(...listSourceFiles(full));
    else if (/\.(ts|tsx)$/.test(entry.name) && !/\.test\.tsx$/.test(entry.name)) files.push(full);
  }
  return files;
};

// './components/Button' is a directory module; './tokens/colors' is a file
// module whose directory (src/lib/tokens) carries its siblings.
const moduleSourceDir = (spec) => {
  const base = path.join(libDir, spec.replace(/^\.\//, ''));
  if (!existsSync(base)) {
    for (const ext of ['.ts', '.tsx']) {
      if (existsSync(base + ext)) return path.dirname(base);
    }
  }
  return base;
};

const resolveLocalImport = (fromFile, spec) => {
  const base = path.resolve(path.dirname(fromFile), spec);
  for (const candidate of [
    `${base}.ts`,
    `${base}.tsx`,
    path.join(base, 'index.ts'),
    path.join(base, 'index.tsx'),
  ]) {
    if (existsSync(candidate)) return candidate;
  }
  return null;
};

// A family's runtime dependency set includes locally-imported modules
// outside its directory (e.g. TagInput → utils/sortable → @dnd-kit/core),
// so peer detection walks the relative-import closure, not just the dir.
// `valueOnly` strips type-only import/export statements first: they ship
// no runtime code (and no css), so the css closure below must not follow
// them, while peer detection keeps the conservative whole-file view.
const localImportClosure = (rootFiles, { valueOnly = false } = {}) => {
  const seen = new Set();
  const queue = [...rootFiles];
  while (queue.length > 0) {
    const file = queue.pop();
    if (seen.has(file)) continue;
    seen.add(file);
    let content = readFileSync(file, 'utf8');
    if (valueOnly) {
      content = content
        .replace(/^[ \t]*import\s+type\s[^\n]*$/gm, '')
        .replace(
          /^[ \t]*export\s+type\s+\{[\s\S]*?\}[ \t]*from[ \t]*['"][^'"]+['"];?[ \t]*$/gm,
          ''
        );
    }
    for (const m of content.matchAll(/from\s+['"](\.[^'"]+)['"]/g)) {
      const resolved = resolveLocalImport(file, m[1]);
      if (resolved !== null) queue.push(resolved);
    }
  }
  return seen;
};

// ---- transitive css closure (wrapper stylesheet imports) ----------------
//
// A component family's wrapper must import the css of every css-carrying
// component it renders, not just its own: TreeSelect renders Tree and
// Chip, so its wrapper needs tree.css and chip.css beside tree-select.css
// (a flat manifest lookup would miss them — the css-manifest maps each
// export to its own defining family only). The closure walks value-only
// relative imports (type-only statements ship no css) and maps every
// reached file to its css family through the same whole-directory rule
// split-css.mjs groups by. utils/ modules are skipped: their css rides
// inside consumer families through split-css's sharedLayers. Modules
// without a css family of their own (LocaleProvider, hooks) drop out via
// the existing-families check.

const kebabCase = (name) =>
  name.replace(/([a-z0-9])([A-Z])/g, '$1-$2').replace(/([A-Z]+)([A-Z][a-z])/g, '$1-$2').toLowerCase();

const existingFamilies = new Set(Object.values(manifest.families));

const cssFamilyOfSource = (file) => {
  const segments = path.relative(libDir, file).split(path.sep);
  if (segments[0] === 'components' && segments.length > 1) {
    const family = kebabCase(segments[1]);
    return existingFamilies.has(family) ? family : null;
  }
  if (segments[0] === 'form') return existingFamilies.has('form') ? 'form' : null;
  if (segments[0] === 'tokens') return TOKENS_FAMILY;
  return null;
};

/** Css families of every css-carrying module the family's sources reach
 *  through value-only relative imports (own family included). */
const cssClosure = (entry) => {
  const found = new Set();
  for (const spec of entry.modules) {
    const dir = moduleSourceDir(spec);
    if (!existsSync(dir)) fail(`cannot resolve module '${spec}' to a source directory under src/lib`);
    for (const file of localImportClosure(listSourceFiles(dir), { valueOnly: true })) {
      const family = cssFamilyOfSource(file);
      if (family !== null) found.add(family);
    }
  }
  return [...found].sort();
};

// ---- wrapper generation ------------------------------------------------

const wrapper = ({ components, types, css, extraCss = [] }) => {
  const importList = components.join(', ');
  // tokens first, then the family's own css, then every transitive css
  // family its sources render (see cssClosure) — deduped in order.
  const cssImports = [TOKENS_FAMILY, css, ...extraCss].filter(
    (family, index, all) => family !== undefined && all.indexOf(family) === index
  );
  const typeExport =
    types.length > 0 ? `export type { ${types.join(', ')} } from 'haze-ui';\n` : '';
  return `// haze-ui registry wrapper — generated by scripts/generate-registry.mjs.
//
// This is a thin wrapper around the published haze-ui npm package, not
// vendored component source: it re-exports the component(s) from
// 'haze-ui' and imports their stylesheet, so the package keeps updating
// underneath. Edit this file to customize — wrap, restyle, compose; that
// is what it is for. (haze-ui is compiled CSS-in-JS (linaria) styled
// against --haze-* design tokens, so vendoring the source would neither
// build nor style — forking this wrapper is the intended customization
// path.)
//
// Theming (once per app): apply the token classes to a root element, e.g.
//   import { lightTheme, spacing, typography } from 'haze-ui';
//   <div className={\`\${lightTheme} \${spacing} \${typography}\`}>…</div>
// (darkTheme is a drop-in swap). haze-ui dist modules ship their own
// 'use client' directive, so imports resolve cleanly from RSC; the
// wrapper inherits client semantics either way.

import { ${importList} } from 'haze-ui';

${cssImports.map((family) => `import 'haze-ui/css/${family}.css';`).join('\n')}

export { ${importList} };
${typeExport}`;
};

// Component categories for the shadcn `categories` field (search
// filtering), derived from the demo sidebar grouping in
// src/views/Layout/component-groups.ts: a css family's category is its
// sidebar group, mapped through GROUP_CATEGORY ('AI & Chat' becomes
// `agent`). The non-component items (tokens, haze-tokens, base) use
// `theme`.
const GROUP_CATEGORY = {
  General: 'general',
  Layout: 'layout',
  Forms: 'form',
  Overlays: 'overlay',
  'Data Display': 'data-display',
  Navigation: 'navigation',
  Feedback: 'feedback',
  'AI & Chat': 'agent',
  Utilities: 'utilities',
};

const { groups: sidebarGroups } = readComponentGroups(rootDir);

// sidebar route -> category: a component has one sidebar entry, under
// exactly one group.
const sidebarCategory = new Map();
for (const { group, items } of sidebarGroups) {
  const category = GROUP_CATEGORY[group];
  if (category === undefined) {
    fail(`sidebar group "${group}" has no entry in GROUP_CATEGORY — add one (new group in src/views/Layout/component-groups.ts)`);
  }
  for (const { route } of items) {
    if (sidebarCategory.has(route)) {
      fail(`sidebar entry "${route}" is listed in more than one group of src/views/Layout/component-groups.ts`);
    }
    sidebarCategory.set(route, category);
  }
}

// The sidebar and the build must agree: every sidebar entry is either a
// css family or a declared css-less component, and every css family has
// its sidebar entry.
for (const route of sidebarCategory.keys()) {
  if (!families.has(route) && !CSS_LESS.has(route)) {
    fail(`sidebar entry "${route}" is neither a css family nor listed in CSS_LESS (scripts/component-descriptions.mjs) — list it there when it ships no css, or rerun pnpm build when it does`);
  }
}
for (const family of CSS_LESS) {
  if (families.has(family)) {
    fail(`"${family}" is listed in CSS_LESS (scripts/component-descriptions.mjs) but is a css family — write its registry blurb and remove it from the list`);
  }
}
for (const family of families.keys()) {
  if (family !== TOKENS_FAMILY && !sidebarCategory.has(family)) {
    fail(`css family "${family}" has no sidebar entry in src/views/Layout/component-groups.ts — add the component to a group there`);
  }
}

// Every registry blurb must belong to a registry item — a description
// for a family the build does not emit is dead text.
for (const family of REGISTRY_BLURBS.keys()) {
  if (!families.has(family)) {
    fail(`a registry description is written for "${family}" but no such css family exists — remove the entry from COMPONENT_DESCRIPTIONS in scripts/component-descriptions.mjs`);
  }
}

const categoryOf = (family) => {
  if (family === TOKENS_FAMILY) return 'theme';
  const category = sidebarCategory.get(family);
  if (category === undefined) {
    fail(`no category written for "${family}" — it has no sidebar entry in src/views/Layout/component-groups.ts`);
  }
  return category;
};

// ---- item docs (markdown `docs` field, shown by `shadcn docs`) --------

const REGISTRY_URL = 'https://github.com/wmzy/haze-ui/tree/main/registry';
const fence = (lang, lines) => ['```' + lang, ...lines, '```'].join('\n');
const THEME_SNIPPET = [
  "import { lightTheme, spacing, typography } from 'haze-ui';",
  '',
  '// on <body> or any root container — darkTheme is a drop-in swap',
  '<div className={`${lightTheme} ${spacing} ${typography}`}>…</div>',
];

const installSection = (name) => ['## Install', '', fence('bash', [`npx shadcn@latest add wmzy/haze-ui/${name}`])];

const themeSection = (family) => [
  '## Theming',
  '',
  ...(family === TOKENS_FAMILY
    ? [
        "This wrapper re-exports the 'lightTheme' (or 'darkTheme'), 'spacing' and",
        "'typography' classes from 'haze-ui' and imports 'haze-ui/css/tokens.css'.",
      ]
    : [
        'haze-ui ships JS and CSS separately — the installed wrapper already imports',
        `\`haze-ui/css/tokens.css\` and \`haze-ui/css/${family}.css\`, so no extra stylesheet setup is needed.`,
      ]),
  '',
  'Activate the design tokens by applying the classes to a root element:',
  '',
  fence('jsx', THEME_SNIPPET),
];

const componentDocs = (family, description, exports) =>
  [
    description,
    '',
    `Exports: ${exports.map((name) => '`' + name + '`').join(', ')}.`,
    '',
    ...installSection(family),
    '',
    family === TOKENS_FAMILY
      ? 'The wrapper lands at `lib/haze/tokens.tsx` (via the `@lib/` target placeholder from `components.json`); the `haze-ui` npm package is installed automatically as a dependency.'
      : `The wrapper lands at \`components/ui/haze/${family}.tsx\` (via the \`@ui/\` target placeholder from \`components.json\`) and re-exports the component(s) from the \`haze-ui\` npm package, which is installed automatically.`,
    '',
    ...themeSection(family),
    '',
    `Details: ${REGISTRY_URL}`,
  ].join('\n');

const baseDocs = (itemCount) =>
  [
    'One command installs the entire haze-ui design system: the theme tokens',
    '(this item ships the token-activation wrapper) plus a thin re-export',
    `wrapper for every styled component — ${itemCount} registry items pulled`,
    'in through `registryDependencies`, resolved recursively by the CLI.',
    '',
    ...installSection('base'),
    '',
    'Each component wrapper lands at `components/ui/haze/<component>.tsx` and',
    're-exports its component from the `haze-ui` npm package (installed',
    'automatically), importing its stylesheet — no other setup is needed.',
    '',
    ...themeSection(TOKENS_FAMILY),
    '',
    `Details: ${REGISTRY_URL}`,
  ].join('\n');

const blockDocs = (block) =>
  [
    block.description,
    '',
    ...installSection(block.name),
    '',
    `The full-page source lands at \`components/block/haze/${block.name}.tsx\` (via the \`@block/\` target placeholder from \`components.json\`) — vendored, so you own and edit it. Component imports are rewritten to the \`haze-ui\` npm package, which is installed automatically${block.npmDependencies.length > 0 ? ` together with ${block.npmDependencies.map((d) => `\`${d}\``).join(' and ')}` : ''}.`,
    '',
    `The file imports the stylesheet of every component it renders (\`haze-ui/css/tokens.css\` + ${block.cssFamilies.length} component css files), so no extra stylesheet setup is needed.`,
    '',
    ...themeSection(TOKENS_FAMILY),
    '',
    `Live preview and source: https://wmzy.github.io/haze-ui/#/blocks — ${REGISTRY_URL}`,
  ].join('\n');

// ---- assemble items ----------------------------------------------------

// { name, type, title, description, dependencies, files, content } —
// `content` is channel-specific and stripped when serializing.
const items = [];
for (const [family, entry] of [...families].sort(([a], [b]) => a.localeCompare(b))) {
  const description = REGISTRY_BLURBS.get(family);
  if (description === undefined) fail(`no description written for "${family}" — add one to COMPONENT_DESCRIPTIONS in scripts/component-descriptions.mjs`);
  const isTokens = family === TOKENS_FAMILY;
  const type = isTokens ? 'registry:lib' : 'registry:ui';
  items.push({
    name: family,
    type,
    title: isTokens
      ? 'Theme tokens (lightTheme / darkTheme / autoTheme / spacing / typography)'
      : entry.exports.join(' / '),
    description,
    author: AUTHOR,
    docs: componentDocs(family, description, entry.exports),
    categories: [categoryOf(family)],
    dependencies: ['haze-ui'],
    files: [
      {
        path: `registry/${family}.tsx`,
        type,
        target: isTokens ? '@lib/haze/tokens.tsx' : `@ui/haze/${family}.tsx`,
      },
    ],
    content: wrapper({
      components: entry.exports,
      types: entry.types,
      css: family,
      extraCss: cssClosure(entry).filter((extra) => extra !== family),
    }),
  });
}

// Hand-curated doc item carried over from the first manual iteration of
// this registry (installs the token onboarding guide as a project doc).
const hazeTokensGuide = path.join(registryDir, 'haze-tokens', 'haze-tokens.md');
if (!existsSync(hazeTokensGuide)) {
  fail('registry/haze-tokens/haze-tokens.md is missing — restore it from git before regenerating');
}
items.push({
  name: 'haze-tokens',
  type: 'registry:item',
  title: 'Haze UI Tokens',
  description:
    'haze-ui 设计令牌（OKLCH 色板、间距、排版、动效）的引入与主题化指南。Design-token onboarding guide: where tokens.css lives and how to load, theme and interop it.',
  author: AUTHOR,
  docs:
    'haze-ui ships JS and CSS separately. Import the stylesheet once in your app entry: ' +
    "`import 'haze-ui/styles.css'` (full sheet) or `import 'haze-ui/css/tokens.css'` plus per-component CSS. " +
    "Activate tokens with the `lightTheme`/`darkTheme` + `spacing` + `typography` classes from 'haze-ui'. " +
    'Details: https://github.com/wmzy/haze-ui/tree/main/registry',
  dependencies: ['haze-ui'],
  categories: ['theme'],
  files: [
    {
      path: 'registry/haze-tokens/haze-tokens.md',
      type: 'registry:file',
      target: '~/docs/haze-tokens.md',
    },
  ],
  content: undefined, // doc item: the file lives in the repo, no wrapper to embed
});

// Meta item: one command installs the whole design system — the theme
// activation wrapper below plus every component item via
// registryDependencies (the CLI resolves those recursively, each bringing
// its own wrapper, stylesheet import and optional peers). Dependency
// entries are full GitHub item addresses (`<owner>/<repo>/<item>`), NOT
// plain names: the shadcn CLI resolves plain names against the official
// shadcn registry (styles/<style>/<name>.json), so `button` would install
// shadcn's own button instead of the haze-ui one — only owner/repo/item
// addresses resolve back into this repository's registry.json.
const tokensEntry = families.get(TOKENS_FAMILY);
if (!tokensEntry) fail('the tokens css family is missing — cannot build the base item');
const themeClasses = [...tokensEntry.exports].sort();
const componentItemNames = [...families.keys()].sort();
const registrySource = new URL(HOMEPAGE).pathname.replace(/^\//, '');
const ghItem = (name) => `${registrySource}/${name}`;
const baseWrapper = `// haze-ui registry base — generated by scripts/generate-registry.mjs.
//
// Meta item: 'npx shadcn add wmzy/haze-ui/base' installs the entire
// design system — this theme-activation wrapper plus, through
// registryDependencies, a thin wrapper for every styled component under
// components/ui/haze/. The implementation keeps coming from the haze-ui
// npm package; edit the wrappers to customize.
//
// Theming (once per app): apply the token classes to a root element, e.g.
//   import { lightTheme, spacing, typography } from 'haze-ui';
//   <div className={\`\${lightTheme} \${spacing} \${typography}\`}>…</div>
// (darkTheme is a drop-in swap).

import { ${themeClasses.join(', ')} } from 'haze-ui';

import 'haze-ui/css/tokens.css';

export { ${themeClasses.join(', ')} };
`;
items.push({
  name: 'base',
  type: 'registry:base',
  title: 'Haze UI base (tokens + every component wrapper)',
  description:
    'One-command setup of the whole haze-ui design system: theme tokens plus a thin wrapper for every styled component, pulled in through registryDependencies.',
  author: AUTHOR,
  docs: baseDocs(componentItemNames.length),
  categories: ['theme', 'setup'],
  dependencies: ['haze-ui'],
  registryDependencies: componentItemNames.map(ghItem),
  files: [
    {
      path: 'registry/base.tsx',
      type: 'registry:lib',
      target: '@lib/haze/base.tsx',
    },
  ],
  content: baseWrapper,
});

// ---- blocks (registry:block items vendored from the docs-site demos) --
//
// Component items ship thin wrappers (haze-ui stays a dependency); blocks
// are the opposite: full-page compositions VENDORED into the consumer's
// project — the shadcn block contract is "you own the page". The source
// of truth is src/views/Blocks/blocks/*.tsx (the docs-site Blocks
// gallery, deliberately self-contained: only '@/lib' + npm imports, all
// layout glue as inline styles over --haze-* tokens). The generator
// rewrites '@/lib…' imports to the published 'haze-ui' barrel, prepends
// the css imports for the block's component closure and embeds the
// result as files[].content.
//
// cssFamilies mirrors the per-block closure in src/views/Blocks/index.tsx
// (the battle-tested list the StackBlitz export uses) — the run fails if
// an entry is not a registry item, so the two lists cannot drift silently.
const blocksDir = path.join(rootDir, 'src', 'views', 'Blocks', 'blocks');
const BLOCKS = [
  {
    name: 'login-block',
    source: 'LoginBlock.tsx',
    title: 'Login block (brand panel + Card form loop, zod-validated)',
    description:
      'Full-page login: brand side panel plus a centered Card running the complete form loop — `useForm` + `Form` + `FormItem` over `InputCore`/`PasswordInputCore`/`CheckboxCore`, validated by one zod schema through `standardSchemaFormValidator`.',
    cssFamilies: ['card', 'form', 'input', 'password-input', 'checkbox', 'button', 'alert'],
    npmDependencies: ['zod', 'react-use-control'],
    categories: ['blocks', 'authentication', 'form'],
  },
  {
    name: 'dashboard-block',
    source: 'DashboardBlock.tsx',
    title: 'Dashboard block (AppShell + Sidebar + Stat row + DataTable)',
    description:
      'SaaS admin starter: `AppShell` + `Sidebar` navigation, `Breadcrumb` trail, a `Stat` card row and a `DataTable` with toolbar strip (density `Segmented` + `dataTableToCsv` export), client-side pagination and column toggling.',
    cssFamilies: [
      'app-shell', 'sidebar', 'tooltip', 'stat', 'data-table', 'checkbox',
      'dropdown-menu', 'empty', 'input', 'pagination', 'skeleton', 'table',
      'virtual-list', 'breadcrumb', 'button', 'badge', 'segmented', 'select',
      'chip', 'spinner', 'visually-hidden',
    ],
    npmDependencies: ['react-use-control'],
    categories: ['blocks', 'dashboard', 'data-display'],
  },
  {
    name: 'crud-block',
    source: 'CrudBlock.tsx',
    title: 'CRUD block (Tree master → DataTable detail + Dialog form + Toast)',
    description:
      'Master–detail CRUD over local state: a `Tree` picks the team, the `DataTable` lists its pipelines, a `Dialog` hosts the zod-validated create/edit `Form`, `ConfirmDialog` guards deletes and `useToast` reports every mutation.',
    cssFamilies: [
      'tree', 'data-table', 'dialog', 'confirm-dialog', 'toast', 'form',
      'input', 'select', 'button', 'badge', 'segmented', 'kbd', 'checkbox',
      'dropdown-menu', 'empty', 'pagination', 'skeleton', 'spinner', 'table',
      'virtual-list', 'visually-hidden',
    ],
    npmDependencies: ['zod', 'react-use-control'],
    categories: ['blocks', 'data-display', 'form'],
  },
  {
    name: 'settings-block',
    source: 'SettingsBlock.tsx',
    title: 'Settings block (card Tabs over Switch/RadioGroup/Select/Combobox rows)',
    description:
      'Workspace preferences page: a card-variant `Tabs` hosting Notifications / Appearance / Security sections, every row a live control — `Switch`, `RadioGroup`, `Select` and a multiple `Combobox`, all through the controllable-state pattern.',
    cssFamilies: [
      'tabs', 'switch', 'radio', 'select', 'combobox', 'chip', 'spinner',
      'virtual-list', 'button', 'card',
    ],
    npmDependencies: ['react-use-control'],
    categories: ['blocks', 'settings', 'form'],
  },
  {
    name: 'chat-block',
    source: 'ChatBlock.tsx',
    title: 'Chat block (ChatContainer + scripted AI turn + ConversationList rail)',
    description:
      'AI chat in one screen: a role="log" `ChatContainer` of `ChatMessage`s, a scripted `ThinkingIndicator` → `ToolCallCard` → `StreamingText` turn, a `ChatInput` whose send flips to stop, and a `ConversationList` rail.',
    cssFamilies: [
      'chat-container', 'chat-message', 'streaming-text', 'thinking-indicator',
      'tool-call-card', 'chat-input', 'conversation-list', 'avatar', 'badge',
      'button', 'empty', 'spinner',
    ],
    npmDependencies: ['react-use-control'],
    categories: ['blocks', 'agent'],
  },
  {
    name: 'ai-workbench-block',
    source: 'AiWorkbenchBlock.tsx',
    title: 'AI workbench block (Workbench shell + activity rail + Sources dock)',
    description:
      'The `Workbench` shell as a double-column AI desk — an `ActivityRail` + `ConversationList` sidebar, a scripted `ThinkingIndicator` → `ToolCallCard` → `StreamingText` review turn, a docked `Sources` citations panel, and `PromptInput` + `ModelPicker` as the composer.',
    cssFamilies: [
      'workbench', 'resizable', 'activity-rail', 'status-bar', 'tab-bar',
      'conversation-list', 'chat-container', 'chat-message', 'streaming-text',
      'thinking-indicator', 'tool-call-card', 'prompt-input', 'model-picker',
      'sources', 'avatar', 'badge', 'button', 'empty', 'spinner', 'tooltip',
    ],
    npmDependencies: ['lucide-react', 'react-use-control'],
    categories: ['blocks', 'agent', 'layout'],
  },
  {
    name: 'data-table-block',
    source: 'DataTableBlock.tsx',
    title: 'Data table block (filterable DataTable console with batch actions)',
    description:
      'The TanStack-backed `DataTable` as a full fleet page — sortable, resizable columns, a per-column filter row, pagination, column visibility, density, `dataTableToCsv` export and checkbox batch selection driving a bulk-action bar.',
    cssFamilies: [
      'data-table', 'checkbox', 'dropdown-menu', 'empty', 'input',
      'pagination', 'progress', 'segmented', 'select', 'skeleton', 'spinner',
      'table', 'virtual-list', 'visually-hidden', 'avatar', 'badge', 'button',
      'chip',
    ],
    npmDependencies: ['@tanstack/react-table', 'react-use-control'],
    categories: ['blocks', 'data-display'],
  },
  {
    name: 'kanban-block',
    source: 'KanbanBlock.tsx',
    title: 'Kanban block (four-column board with priority badges and progress)',
    description:
      'Four columns of issue cards with priority `Badge`s, labels, assignee `Avatar`s and `Progress` bars; cards move through the `DropdownMenu` ⋯ menu — haze-ui ships single-container sorting, not cross-column drag, so the board is static by design.',
    cssFamilies: [
      'avatar', 'avatar-group', 'badge', 'button', 'chip', 'dropdown-menu',
      'empty', 'input', 'progress', 'select', 'spinner', 'tooltip',
      'virtual-list', 'visually-hidden',
    ],
    npmDependencies: ['lucide-react', 'react-use-control'],
    categories: ['blocks', 'data-display'],
  },
  {
    name: 'form-wizard-block',
    source: 'FormWizardBlock.tsx',
    title: 'Form wizard block (Stepper over one zod Form, gated steps)',
    description:
      'Three-step workspace setup in a centered `Card`: a `Stepper` whose activeStep is a Control rides one react-f0rm `Form` so values survive step changes, `Next` awaits `trigger()` on the current step fields before advancing, and the final submit lands in an `Alert` receipt.',
    cssFamilies: [
      'stepper', 'card', 'form', 'input', 'select', 'checkbox', 'button',
      'alert', 'chip', 'spinner', 'virtual-list',
    ],
    npmDependencies: ['zod', 'react-use-control'],
    categories: ['blocks', 'form'],
  },
  {
    name: 'filter-list-block',
    source: 'FilterListBlock.tsx',
    title: 'Filter list block (filter rail + card catalog + Pagination)',
    description:
      'A browsing page, not a table page: search `Input`, category `Checkbox`es, region and sort `Select`s drive a stack of result `Card`s with `Avatar`, status `Badge` and `Rating`; active facets render as closable `Chip`s, `Empty` covers no-match and `Pagination` slices the list.',
    cssFamilies: [
      'card', 'input', 'checkbox', 'select', 'chip', 'badge', 'avatar',
      'rating', 'empty', 'pagination', 'button', 'spinner', 'virtual-list',
    ],
    npmDependencies: ['react-use-control'],
    categories: ['blocks', 'data-display', 'form'],
  },
  {
    name: 'profile-block',
    source: 'ProfileBlock.tsx',
    title: 'Profile block (identity header + Descriptions + Timeline)',
    description:
      'A member detail page: a large `Avatar` header with status `Badge`s and a controllable follow toggle, a `Descriptions` fact sheet, a `TagGroup` skill row, an `AvatarGroup` teammates strip and a `Timeline` activity feed.',
    cssFamilies: [
      'card', 'avatar', 'avatar-group', 'badge', 'button', 'descriptions',
      'timeline', 'tag-group', 'spinner',
    ],
    npmDependencies: ['react-use-control'],
    categories: ['blocks', 'data-display'],
  },
];

// Every name the main barrel exports (values + types) — the vendored block
// may only import from this set, otherwise the rewritten 'haze-ui' import
// would not compile in the consumer's project.
const barrelExports = new Set(
  [...modules.values()].flatMap((mod) => [...mod.values, ...mod.types])
);

const blockSource = (block) => {
  const file = path.join(blocksDir, block.source);
  if (!existsSync(file)) {
    fail(`block source "${path.relative(rootDir, file)}" does not exist — fix the BLOCKS entry`);
  }
  const raw = readFileSync(file, 'utf8');
  // Blocks are self-contained by contract: after rewriting '@/lib…' to the
  // published barrel, no '@/…' alias (docs-site code), no relative import
  // (gallery plumbing) and no linaria css may remain — vendored source must
  // build in a plain consumer project.
  const vendored = raw.replace(/from\s+'@\/lib[^']*'/g, "from 'haze-ui'");
  for (const m of vendored.matchAll(/from\s+'([^']*)'/g)) {
    const spec = m[1];
    if (spec.startsWith('@/') && spec !== 'haze-ui') {
      fail(`block "${block.name}" imports '${spec}' — blocks may only depend on '@/lib' and npm packages`);
    }
    if (spec.startsWith('.')) {
      fail(`block "${block.name}" has a relative import '${spec}' — blocks must be self-contained single files`);
    }
    if (spec === '@linaria/core') {
      fail(`block "${block.name}" uses linaria css — vendored block source would not build in a consumer project (inline styles over --haze-* tokens only)`);
    }
  }
  // Every named import from the rewritten barrel must exist in the public
  // package (catches a block leaning on a non-exported symbol).
  for (const m of vendored.matchAll(/import\s+(?:type\s+)?\{([^}]*)\}\s+from\s+'haze-ui'/g)) {
    for (const clause of m[1].split(',')) {
      const words = clause.trim().split(/\s+/).filter(Boolean);
      if (words.length === 0) continue;
      const name = words[words.length - 1];
      if (!barrelExports.has(name)) {
        fail(`block "${block.name}" imports "${name}" which the haze-ui barrel does not export`);
      }
    }
  }
  const cssImports = [TOKENS_FAMILY, ...[...block.cssFamilies].sort()]
    .filter((family, index, all) => all.indexOf(family) === index)
    .map((family) => `import 'haze-ui/css/${family}.css';`)
    .join('\n');
  return `// haze-ui registry block — generated by scripts/generate-registry.mjs
// from src/views/Blocks/blocks/${block.source}.
//
// Unlike the component items (thin re-export wrappers over the haze-ui npm
// package), a block is VENDORED source: a full page you own and edit.
// The component imports are rewritten from the docs site's '@/lib' alias
// to the published 'haze-ui' package and every stylesheet of the page's
// component closure is imported below, so the file is self-contained.
// npm dependencies beyond haze-ui: ${block.npmDependencies.length > 0 ? block.npmDependencies.join(', ') : 'none'}.
//
// Theming (once per app): apply the token classes to a root element, e.g.
//   import { lightTheme, spacing, typography } from 'haze-ui';
//   <div className={\`\${lightTheme} \${spacing} \${typography}\`}>…</div>
// (darkTheme is a drop-in swap).

${cssImports}

${vendored}`;
};

for (const block of BLOCKS) {
  for (const family of block.cssFamilies) {
    if (!families.has(family)) {
      fail(`block "${block.name}" cssFamilies lists "${family}" which is not a registry item — fix the entry (mirror src/views/Blocks/index.tsx)`);
    }
  }
  items.push({
    name: block.name,
    type: 'registry:block',
    title: block.title,
    description: block.description,
    author: AUTHOR,
    docs: blockDocs(block),
    categories: block.categories,
    dependencies: ['haze-ui', ...block.npmDependencies],
    // The wrapper items of every component the page renders — resolved
    // recursively by the CLI, each bringing its own stylesheet import and
    // customization seam. Full GitHub item addresses, like the base item.
    registryDependencies: block.cssFamilies.map(ghItem),
    files: [
      {
        path: `registry/${block.name}.tsx`,
        type: 'registry:block',
        target: `@block/haze/${block.name}.tsx`,
      },
    ],
    content: blockSource(block),
  });
}
items.sort((a, b) => a.name.localeCompare(b.name));

// ---- write the GitHub registry (root index + registry/ directory) -----

const stripContent = (item) => {
  const { content, ...rest } = item;
  return rest;
};

const githubIndex = {
  $schema: REGISTRY_SCHEMA,
  name: 'haze-ui',
  homepage: HOMEPAGE,
  items: items.map(stripContent),
};
writeFileSync(registryIndexPath, `${JSON.stringify(githubIndex, null, 2)}\n`);

mkdirSync(registryDir, { recursive: true });
// Per-item flat payloads are self-contained: every `files[].content` is
// embedded (wrapper source, or the repo file for doc items) so the JSON
// also works through non-GitHub channels — direct .json address, URL
// fetch — the same shape `shadcn build` emits per item.
const flatItem = (item) => {
  const files = item.files.map((file, index) => ({
    ...file,
    content:
      typeof item.content === 'string' && index === 0
        ? item.content
        : readFileSync(path.join(rootDir, file.path), 'utf8'),
  }));
  return { $schema: ITEM_SCHEMA, ...stripContent(item), files };
};
for (const item of items) {
  writeFileSync(
    path.join(registryDir, `${item.name}.json`),
    `${JSON.stringify(flatItem(item), null, 2)}\n`
  );
  if (typeof item.content === 'string') {
    writeFileSync(path.join(registryDir, `${item.name}.tsx`), item.content);
  }
}
// Drop wrapper/payload files from previous runs whose item no longer
// exists. Never touch REGISTRY_STATICS or unknown entries (self-check
// flags those instead).
const expectedFiles = new Set(
  items.flatMap((item) => [
    `${item.name}.json`,
    ...(typeof item.content === 'string' ? [`${item.name}.tsx`] : []),
  ])
);
const removedStale = [];
for (const entry of readdirSync(registryDir)) {
  if (expectedFiles.has(entry) || REGISTRY_STATICS.has(entry)) continue;
  if (/^[a-z0-9]+(-[a-z0-9]+)*\.(json|tsx)$/.test(entry)) {
    rmSync(path.join(registryDir, entry));
    removedStale.push(entry);
  }
}

// ---- write the npm artifact (dist/registry.json, embedded content) ----

const distItems = items
  .filter((item) => typeof item.content === 'string')
  .map(({ name, type, title, description, author, docs, categories, dependencies, registryDependencies, content }) => ({
    name,
    type,
    title,
    description,
    author,
    docs,
    categories,
    dependencies,
    registryDependencies, // undefined on items without cross-item refs — dropped by JSON.stringify
    files: [
      {
        path: `${type === 'registry:block' ? 'components/block/haze' : 'components/haze'}/${name}.tsx`,
        content,
        type,
      },
    ],
  }));
writeFileSync(
  path.join(distDir, 'registry.json'),
  `${JSON.stringify(
    { $schema: REGISTRY_SCHEMA, name: 'haze-ui', homepage: HOMEPAGE, items: distItems },
    null,
    2
  )}\n`
);

// ---- self-check: schema shape + cross-artifact consistency ------------

const problems = [];
const KEBAB = /^[a-z][a-z0-9]*(-[a-z0-9]+)*$/;

const checkItems = (label, list, { requireContent }) => {
  const seen = new Set();
  for (const item of list) {
    if (seen.has(item.name)) problems.push(`${label}: duplicate item name "${item.name}"`);
    seen.add(item.name);
    if (typeof item.name !== 'string' || !KEBAB.test(item.name)) {
      problems.push(`${label}: item name "${item.name}" is missing or not kebab-case`);
    }
    for (const field of ['type', 'title', 'description']) {
      if (typeof item[field] !== 'string' || item[field].trim() === '') {
        problems.push(`${label}: item "${item.name}" field "${field}" missing or empty`);
      }
    }
    if (typeof item.docs !== 'string' || item.docs.trim() === '') {
      problems.push(`${label}: item "${item.name}" field "docs" missing or empty`);
    }
    if (!Array.isArray(item.categories) || item.categories.length === 0) {
      problems.push(`${label}: item "${item.name}" field "categories" missing or empty`);
    } else {
      for (const category of item.categories) {
        if (typeof category !== 'string' || !KEBAB.test(category)) {
          problems.push(`${label}: item "${item.name}" category "${category}" is not lowercase kebab-case`);
        }
      }
    }
    if (item.registryDependencies !== undefined) {
      if (!Array.isArray(item.registryDependencies)) {
        problems.push(`${label}: item "${item.name}" field "registryDependencies" is not an array`);
      } else {
        for (const dep of item.registryDependencies) {
          // Plain names resolve against the OFFICIAL shadcn registry in the
          // CLI, so cross-item references must be owner/repo/item addresses.
          if (
            typeof dep !== 'string' ||
            !/^[^/\s]+\/[^/\s]+\/[a-z0-9]+(-[a-z0-9]+)*$/.test(dep)
          ) {
            problems.push(
              `${label}: item "${item.name}" registryDependency "${dep}" is not an <owner>/<repo>/<kebab-item> address`
            );
          }
        }
      }
    }
    if (!Array.isArray(item.files) || item.files.length === 0) {
      problems.push(`${label}: item "${item.name}" has no files`);
    }
    for (const file of item.files ?? []) {
      if (typeof file.path !== 'string' || file.path.trim() === '') {
        problems.push(`${label}: item "${item.name}" has a files[] entry with no path`);
      }
      if (typeof file.type !== 'string' || file.type.trim() === '') {
        problems.push(`${label}: item "${item.name}" file "${file.path}" has no type`);
      }
      if (file.type === 'registry:file' && typeof file.target !== 'string') {
        problems.push(`${label}: item "${item.name}" file "${file.path}" needs a target (registry:file)`);
      }
      if (requireContent && (typeof file.content !== 'string' || file.content.trim() === '')) {
        problems.push(`${label}: item "${item.name}" file "${file.path}" has no content`);
      }
    }
    if (!Array.isArray(item.dependencies) || !item.dependencies.includes('haze-ui')) {
      problems.push(`${label}: item "${item.name}" dependencies missing "haze-ui"`);
    }
  }
  return new Set(list.map((item) => item.name));
};

const githubNames = checkItems('registry.json', githubIndex.items, { requireContent: false });
checkItems('dist/registry.json', distItems, { requireContent: true });

// Root index ↔ registry/ directory: every item has a per-item JSON (and a
// .tsx when it wraps components), every generated file maps back to an
// item, and nothing unknown lingers at the top level.
const onDisk = new Set(readdirSync(registryDir));
const payloadStems = new Set();
for (const name of githubNames) {
  for (const ext of ['.json', '.tsx']) {
    if (ext === '.tsx' && !items.some((item) => item.name === name && typeof item.content === 'string')) {
      continue;
    }
    if (!onDisk.has(`${name}${ext}`)) {
      problems.push(`registry/: expected "registry/${name}${ext}" (declared by the root index) is missing`);
    }
  }
  const payloadPath = path.join(registryDir, `${name}.json`);
  const payload = JSON.parse(readFileSync(payloadPath, 'utf8'));
  payloadStems.add(name);
  if (payload.name !== name) {
    problems.push(`registry/${name}.json declares name "${payload.name}"`);
  }
  const indexed = githubIndex.items.find((candidate) => candidate.name === name);
  const withoutContent = (files) => files.map(({ content, ...file }) => file);
  if (JSON.stringify(withoutContent(payload.files)) !== JSON.stringify(indexed.files)) {
    problems.push(`registry/${name}.json files differ from the root index entry`);
  }
  for (const file of payload.files) {
    if (typeof file.content !== 'string' || file.content.trim() === '') {
      problems.push(`registry/${name}.json file "${file.path}" has no embedded content`);
    }
  }
}
for (const entry of onDisk) {
  const stem = entry.replace(/\.(json|tsx)$/, '');
  if (REGISTRY_STATICS.has(entry)) continue;
  if (!payloadStems.has(stem)) problems.push(`registry/: "${entry}" has no item in the root index`);
}
// Every wrapper the index declares must exist and be non-empty; every css
// family from the build must be covered.
for (const item of githubIndex.items) {
  for (const file of item.files) {
    if (!existsSync(path.join(rootDir, file.path))) {
      problems.push(`registry.json: item "${item.name}" references missing file "${file.path}"`);
    }
  }
}
const manifestFamilies = new Set(Object.values(manifest.families));
for (const family of manifestFamilies) {
  if (!githubNames.has(family)) problems.push(`css family "${family}" from css-manifest has no registry item`);
}

// The base meta item must reference exactly the component item set:
// every registryDependencies entry resolves to a real item in this
// registry (strip the owner/repo/ address prefix), and every css family
// (tokens included) is covered — `shadcn add …/base` really installs the
// whole system.
const baseItems = githubIndex.items.filter((item) => item.name === 'base');
if (baseItems.length !== 1) {
  problems.push(`registry.json: expected exactly one "base" meta item, found ${baseItems.length}`);
} else {
  const depName = (dep) => dep.split('/').pop();
  const baseDeps = new Set((baseItems[0].registryDependencies ?? []).map(depName));
  for (const dep of baseItems[0].registryDependencies ?? []) {
    if (!githubNames.has(depName(dep))) {
      problems.push(`registry.json: base registryDependency "${dep}" matches no item`);
    }
    if (depName(dep) === 'base') problems.push('registry.json: base registryDependency includes itself');
  }
  for (const family of manifestFamilies) {
    if (!baseDeps.has(family)) {
      problems.push(`registry.json: base does not cover css family "${family}" — add it to the base item`);
    }
  }
}

// Block items: type `registry:block`, vendored single-file source, and
// every registryDependency must resolve to a real item of this registry
// (the wrapper items the CLI pulls in recursively). npm deps beyond
// haze-ui (zod, react-use-control) are part of the contract the vendored
// source relies on — checkItems already enforces haze-ui itself.
const blockItems = githubIndex.items.filter((item) => item.type === 'registry:block');
if (blockItems.length === 0) {
  problems.push('registry.json: no registry:block items — the BLOCKS list in the generator is empty?');
}
for (const item of blockItems) {
  if (item.files.length !== 1 || !item.files[0].path.endsWith('.tsx')) {
    problems.push(`registry.json: block "${item.name}" must vendor exactly one .tsx source file`);
  }
  if (!Array.isArray(item.registryDependencies) || item.registryDependencies.length === 0) {
    problems.push(`registry.json: block "${item.name}" has no registryDependencies — it must reference the wrapper items of its component closure`);
  }
  for (const dep of item.registryDependencies ?? []) {
    if (!githubNames.has(dep.split('/').pop())) {
      problems.push(`registry.json: block "${item.name}" registryDependency "${dep}" matches no item`);
    }
  }
  const declared = new Set(item.dependencies);
  const vendored = items.find((candidate) => candidate.name === item.name)?.content ?? '';
  for (const pkg of ['zod', 'react-use-control']) {
    if (vendored.includes(`from '${pkg}'`) && !declared.has(pkg)) {
      problems.push(`registry.json: block "${item.name}" imports "${pkg}" but does not declare it in dependencies`);
    }
  }
}

if (problems.length > 0) {
  for (const problem of problems) console.error(`generate-registry: self-check failed — ${problem}`);
  process.exit(1);
}

// ---- report ------------------------------------------------------------

const peerItems = items.filter((item) => item.dependencies.length > 1);
console.log(
  `generate-registry: ${items.length} items / ` +
    `${items.reduce((n, item) => n + item.title.split(' / ').length, 0)} components — ` +
    `root registry.json + registry/ (${expectedFiles.size} generated files) + dist/registry.json`
);
const baseReportItem = items.find((item) => item.name === 'base');
console.log(
  `  base item: registryDependencies on ${baseReportItem.registryDependencies.length} component items ` +
    `(tokens + every css family) — npx shadcn@latest add wmzy/haze-ui/base installs the whole system`
);
const blockReportItems = items.filter((item) => item.type === 'registry:block');
if (blockReportItems.length > 0) {
  console.log(
    `  blocks (${blockReportItems.length}): ${blockReportItems
      .map((item) => `${item.name} ← ${item.registryDependencies.length} wrapper items`)
      .join(', ')}`
  );
}
if (peerItems.length > 0) {
  console.log(
    `  optional peers added: ${peerItems
      .map((item) => `${item.name} → ${item.dependencies.slice(1).join(', ')}`)
      .join('; ')}`
  );
}
if (removedStale.length > 0) console.log(`  removed stale registry/ files: ${removedStale.join(', ')}`);
console.log(`  skipped exports (${skipped.length}):`);
for (const [name, reason] of skipped) console.log(`    ${name} — ${reason}`);
