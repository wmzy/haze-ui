#!/usr/bin/env node
/**
 * Generate the repo-root llms.txt — the curated index for LLM coding agents.
 *
 * The file is split in three parts:
 *   1. a hand-written preamble (the template function below — install, CSS
 *      loading modes, architecture notes) with the component count
 *      interpolated;
 *   2. a generated "## Components" section — group headers and entries
 *      read straight from src/views/Layout/component-groups.ts (the demo
 *      sidebar contract, through scripts/component-groups.mjs), one bullet
 *      per entry using the blurb table in
 *      scripts/component-descriptions.mjs (shared with the registry);
 *   3. hand-written closing sections (design tokens, floating tiers,
 *      headless, forms, agent protocol, links).
 *
 * Every sidebar entry needs a blurb and every blurb a sidebar entry —
 * either mismatch fails the run, so adding a component without its
 * sentence cannot pass silently.
 *
 * The output is deterministic (no timestamps) so consecutive runs are
 * byte-identical.
 *
 * CLI:  node scripts/generate-llms.mjs
 * API:  import { writeLlms } from './scripts/generate-llms.mjs'
 *       (package.json build:demo regenerates it before vite build)
 */
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';

import { defaultRoot, invokedDirectly, runCli, wroteLine } from './cli-utils.mjs';
import { readComponentGroups } from './component-groups.mjs';
import { LLMS_BLURBS } from './component-descriptions.mjs';
import { RSC_SAFE_MODULES } from './rsc-safe.mjs';

/**
 * Display names for bullets that present a family, not a single component
 * (the sidebar key stays the canonical lookup). Unlisted entries render
 * their sidebar name.
 */
const DISPLAY_NAMES = {
  Radio: 'Radio / RadioGroup',
  Form: 'Form (FormItem)',
  FloatButton: 'FloatButton / FloatButtonGroup',
};

/**
 * Parse the `haze-ui/headless` barrel. Every export clause carries a JSDoc
 * one-liner (the module's own curation contract) and sits under a
 * `// --- Title ---` divider — both are read straight from source so the
 * llms.txt section can never drift from the barrel.
 */
function parseHeadless(rootDir) {
  const file = path.join(rootDir, 'src/lib/headless/index.ts');
  const source = readFileSync(file, 'utf8');

  const sections = [];
  const divider = /^\/\/ -{20,}\n\/\/ (.+)\n\/\/ -{20,}$/gm;
  for (const match of source.matchAll(divider)) {
    sections.push({
      title: match[1].replace(/\s+\([^)]*\)\s*$/, ''),
      entries: [],
      start: match.index,
      end: Number.POSITIVE_INFINITY,
    });
  }
  if (sections.length === 0) {
    throw new Error(
      `no section dividers parsed from ${path.relative(rootDir, file)} — shape changed?`
    );
  }
  for (const [i, section] of sections.entries()) {
    if (i > 0) sections[i - 1].end = section.start;
  }

  // The JSDoc body may not cross its own `*/` (negative lookahead), so a
  // match can never swallow an import statement between two blocks.
  const clause =
    /\/\*\*((?:(?!\*\/)[\s\S])*)\*\/\s*export\s+(?:(type)\s+)?(?:\{([^}]+)\}|([A-Za-z_$][\w$]*)\s*=)/g;
  for (const match of source.matchAll(clause)) {
    const [, doc, typeKeyword, braced, aliased] = match;
    const section = sections.find(
      (s) => match.index >= s.start && match.index < s.end
    );
    if (!section) {
      throw new Error(
        `headless export outside any section divider (offset ${match.index}) — shape changed?`
      );
    }
    const names =
      braced !== undefined
        ? braced.split(',').map((name) => name.trim()).filter(Boolean)
        : [aliased];
    const blurb = doc
      .split('\n')
      .map((line) => line.replace(/^\s*\*\s?/, ''))
      .join(' ')
      .replace(/\s+/g, ' ')
      .replace(/\{@link\s+([^}\s]+)[^}]*\}/g, '`$1`')
      .trim();
    if (blurb === '') {
      throw new Error(
        `no JSDoc blurb above an export in ${path.relative(rootDir, file)} — the headless barrel requires one per export`
      );
    }
    for (const name of names) {
      section.entries.push({
        name,
        isType: typeKeyword !== undefined || aliased !== undefined,
        blurb,
      });
    }
  }
  const exportCount = sections.reduce((sum, s) => sum + s.entries.length, 0);
  if (exportCount === 0) {
    throw new Error(
      `no export clauses parsed from ${path.relative(rootDir, file)} — shape changed?`
    );
  }
  return { sections, exportCount };
}

/**
 * Parse the `haze-ui/hooks` barrel: value-export names (each clause may list
 * several) plus a count of the `export type { … }` clauses that follow them.
 */
function parseHooks(rootDir) {
  const file = path.join(rootDir, 'src/lib/hooks/index.ts');
  const source = readFileSync(file, 'utf8');
  const names = [];
  for (const match of source.matchAll(/^export\s+\{([^}]+)\}\s+from/gm)) {
    for (const raw of match[1].split(',')) {
      const name = raw.trim();
      if (name !== '') names.push(name);
    }
  }
  const typeCount = [...source.matchAll(/^export\s+type\s+\{/gm)].length;
  if (names.length === 0) {
    throw new Error(
      `no value exports parsed from ${path.relative(rootDir, file)} — shape changed?`
    );
  }
  return { names, typeCount };
}

/**
 * Parse the `haze-ui/icons` barrel: the count of lucide-react re-exports and
 * the presence of the `hazeIconSize` scale export.
 */
function parseIcons(rootDir) {
  const file = path.join(rootDir, 'src/lib/icons/index.ts');
  const source = readFileSync(file, 'utf8');
  const count = [
    ...source.matchAll(
      /^export\s+\{\s*([A-Za-z_$][\w$]*)\s*\}\s+from\s+'lucide-react';/gm
    ),
  ].length;
  if (count === 0 || !/export const hazeIconSize/.test(source)) {
    throw new Error(
      `icon re-exports not parsed from ${path.relative(rootDir, file)} — shape changed?`
    );
  }
  return { count };
}

function renderComponents(groups) {
  const lines = ['## Components', ''];
  const sidebarRoutes = new Set(groups.flatMap(({ items }) => items.map((item) => item.route)));
  const orphan = [...LLMS_BLURBS.keys()].find((route) => !sidebarRoutes.has(route));
  if (orphan !== undefined) {
    throw new Error(
      `llms.txt blurb written for "${orphan}" but it is not a sidebar entry in src/views/Layout/component-groups.ts — remove it from COMPONENT_DESCRIPTIONS in scripts/component-descriptions.mjs`
    );
  }
  for (const { group, items } of groups) {
    lines.push(`### ${group}`, '');
    for (const { name, route } of items) {
      const blurb = LLMS_BLURBS.get(route);
      if (blurb === undefined) {
        throw new Error(
          `no llms.txt blurb written for "${route}" (${name}) — add it to COMPONENT_DESCRIPTIONS in scripts/component-descriptions.mjs`
        );
      }
      lines.push(`- **${DISPLAY_NAMES[name] ?? name}** — ${blurb}`);
    }
    lines.push('');
  }
  return lines.join('\n');
}

/**
 * Render the generated Headless / Hooks / Icons sections. All three read the
 * subpath barrels via the parsers above — llms.txt stays current whenever a
 * primitive, hook or glyph is added, with no second table to maintain.
 */
function renderHeadless({ sections, exportCount }) {
  const lines = [
    '## Headless primitives',
    '',
    '`haze-ui/headless` re-exports the behavior layer the components are built',
    'on — the floating engine, exit animations, the `Portal` primitive, focus',
    'scope, pure collision math, menu/submenu keyboard machinery, RTL direction',
    'resolution, ref composition, View-Transition-wrapped state flips and the',
    'document-level interaction hooks — for component authors assembling their',
    'own panels. Same source, same version as the styled library; stable public',
    `API with the same semver commitment. The full export surface (${exportCount} entries):`,
    '',
  ];
  for (const { title, entries } of sections) {
    lines.push(`### ${title}`, '');
    for (const { name, isType, blurb } of entries) {
      lines.push(`- \`${name}\`${isType ? ' (type)' : ''} — ${blurb}`);
    }
    lines.push('');
  }
  return lines.join('\n');
}

function renderHooks({ names, typeCount }) {
  return `## Hooks

\`haze-ui/hooks\` is the standalone hooks entry — ${names.length} value exports
(plus ${typeCount} options/result type clauses) with no component code:
clipboard, dark mode, debounce, fullscreen, hotkeys, viewport and element
observation, idle, network, orientation, reduced motion, storage-persisted
state (\`useLocalStorage\`/\`useSessionStorage\` over the shared
\`useStorageState\` kernel: JSON persisted, cross-tab \`storage\` events,
Control-friendly) and the tab title. The overlay-relevant subset is also
re-exported from \`haze-ui/headless\`; a curated selection ships on the main
barrel.

${names.map((name) => `\`${name}\``).join(', ')}
`;
}

function renderIcons({ count }) {
  return `## Icons

\`haze-ui/icons\` re-exports ${count} curated [lucide-react](https://lucide.dev)
glyphs — the common UI vocabulary (navigation chevrons, form feedback, media,
communication, files, commerce) as individual named exports in alphabetical
order. \`lucide-react\` is a regular dependency with \`sideEffects: false\` and
stays external in the lib build: an icon never imported costs zero bytes, and
consumers who import none of them tree-shake the package out entirely. The full
1800+ lucide catalog stays one direct \`lucide-react\` import away.

Pair with the \`Icon\` component — \`<Icon icon={Check} size='sm' />\` — and use
the frozen \`hazeIconSize\` map (\`{ sm: 16, md: 20, lg: 24 }\`, the \`Icon\`
size scale) when a lucide glyph renders outside \`<Icon>\` so both paths agree
on the size scale.
`;
}

const preamble = (componentCount, rscSafeCount) => `# Haze UI

> React 19 UI component library built on the \`ControlOrValue<T>\` protocol: every stateful
> component accepts one state prop (\`checked?: Control<T> | T\`) that works controlled *and*
> uncontrolled, powered by [react-use-control](https://github.com/wmzy/react-use-control).

- [Full API reference (llms-full.txt)](llms-full.txt): every component's props, types,
  defaults and descriptions in one generated file.

${componentCount} components in 9 groups (see below), styled with Linaria (zero-runtime CSS-in-JS)
against \`--haze-*\` design tokens. ESM-only, \`preserveModules\` dist, tree-shakeable.
\`'use client'\` is pre-injected on interactive modules; ${rscSafeCount} static, hook-free modules
(tokens + presentational components) ship without it and render as React Server
Components. RTL is systemic: logical CSS properties, mirrored horizontal-key
semantics and mirrored floating placements under \`dir="rtl"\`. Peer range
\`react: ^19.0.0\` — no React 18 compatibility layer.

## Install

\`\`\`sh
npm i haze-ui
\`\`\`

Only \`react\` and \`react-dom\` are peers. Every engine — \`react-f0rm\` (forms),
\`@tanstack/react-table\` (DataTable), \`recharts\` (Chart), the \`@dnd-kit\` trio
(sortable tags), \`qrcode\` (QRCode) — is a regular dependency installed with
haze-ui, and bundlers still tree-shake the ones your imports never reach.

shadcn CLI users can instead \`pnpm dlx shadcn@latest add wmzy/haze-ui/<item>\`
— this repo is a GitHub registry (root \`registry.json\`); each item installs a
thin wrapper that re-exports from the npm package (see \`registry/README.md\`).

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
`;

const closing = ({ headless, hooks, icons }) => `## Design tokens

Colors are generated in **OKLCH** from \`src/lib/tokens/palette.ts\`: 12-step primitive
scales (gray/blue/green/amber/red × light/dark) plus semantic aliases. Interaction
states (hover/active/subtle/focus-ring/border-hover) are **CSS relative-color formulas**
— \`oklch(from var(--haze-color-primary) calc(l - 0.045) c h)\` — so overriding
\`--haze-color-primary\` on a theme class re-derives the whole interaction family at
runtime, no rebuild. Themes ship as classes: apply \`lightTheme\` (or \`darkTheme\`, or the zero-JS system-following \`autoTheme\`) plus
\`spacing\` and \`typography\` to a root element. Browser baseline: Chrome/Edge 119+,
Safari 16.4+, Firefox 128+ (relative-color syntax, no hex fallbacks).
The registry also ships as [W3C Design Tokens](https://tr.designtokens.org/) JSON —
\`haze-ui/design-tokens/light.json\` and \`dark.json\`, plus five brand archives
(\`violet\`/\`teal\`/\`cyan\`/\`orange\`/\`rose\` × light/dark) — for Tokens Studio /
Style Dictionary pipelines; the [Tokens in Figma guide](https://wmzy.github.io/haze-ui/guides/figma-tokens)
walks the import. All tokens are plain CSS custom properties prefixed \`--haze-*\`.

## Floating overlays: three tiers

Popover, DropdownMenu, Tooltip, ContextMenu, Combobox and Datepicker panels pick an
engine by feature detection: (1) native \`popover\` attribute + CSS anchor positioning
(position-area grid with fallbacks), (2) \`popover\` alone, (3) a JS-positioned fallback.
Modern engines take tier 1; positioning and light-dismiss behavior stay consistent
across tiers. Panel placements are logical: under \`dir="rtl"\` the horizontal side
mirrors automatically (tier 1 uses logical \`position-area\` values where engines
accept them, tier 2 mirrors in JS).

Dialog, Drawer, BottomSheet, Popover and DropdownMenu accept a \`ref\` exposing
\`{ open(), close(), focusTrigger() }\` — the same state outlet as user interaction,
controlled-mode aware. Dialog, Drawer and BottomSheet also take a \`viewTransition?: boolean\`:
open/close flips wrapped in the View Transitions API (\`startViewTransition\` + \`flushSync\`),
auto-degrading without engine support or under reduced motion.

${headless}
${hooks}
${icons}## Locale packs

\`haze-ui/locales\` re-exports the string packs standalone — \`enUS\` (the same
object as \`defaultStrings\`), \`zhCN\`, \`jaJP\`, \`deDE\`, \`frFR\`, \`esES\`, \`itIT\`,
\`ptBR\`, \`ruRU\`, \`koKR\`, \`arSA\`, plus \`createStrings(base, overrides)\` and the
\`HazeStrings\`/\`LocaleProviderProps\` types — for bundle-splitting a single pack
or type-checking a custom one. No components travel with the import; the
\`LocaleProvider\` itself stays on the main entry.

## Forms: react-f0rm integration

Form state belongs to [react-f0rm](https://github.com/wmzy/react-f0rm) (a haze-ui dependency).
haze-ui ships controlled cores — \`InputCore\`, \`SelectCore\`, \`SwitchCore\`, \`TextareaCore\`,
\`TagInputCore\`, \`TransferCore\`, \`UploadCore\`, \`CheckboxCore\`, … — that speak the plain
\`{value, onChange}\` pair its headless \`useField\` hook emits, with zero adapters.
\`FormItem\` wraps the hook's state in label, error and aria wiring, with declarative
binding via \`as\`/\`input\` props. The sugar components (\`Input\`, \`Select\`, …) keep the
\`ControlOrValue<T>\` API for standalone use outside forms. The whole form surface is
re-exported from the haze-ui barrel — \`FormItem\`, \`FormList\`, the instance factories
\`Form\`/\`useForm()\`/\`createForm()\`, \`FormProvider\`/\`useFormContext\`, the imperative
APIs (\`useFieldArray\`, \`useWatch\`, \`setValue\`/\`getValue\`/\`getValues\`/\`reset\`,
\`trigger\`, \`setFocus\`) and the schema resolvers (\`zodResolver\`,
\`standardSchemaResolver\`, …) — so app code never needs react-f0rm as a direct
dependency: import everything from \`haze-ui\` and let the regular dependency resolve
underneath.

## AI-friendly distribution

- \`haze-ui/registry.json\` (npm artifact; also at <https://unpkg.com/haze-ui/registry.json>)
  is a shadcn/ui-compatible registry covering every component family (plus a \`base\`
  meta item that installs the whole system in one command). Its items are thin wrapper
  files that re-export the published component and import its stylesheet — haze-ui stays
  an npm dependency underneath, so wrappers are your customization layer, not vendored
  source.
- \`haze-ui/css-manifest.json\` maps every export to its css file (see "CSS" above).

## For coding agents

A self-contained, machine-executable setup protocol — every step is copy-paste safe.

1. Install the library:

   \`\`\`sh
   npm i haze-ui
   \`\`\`

   \`react\` and \`react-dom\` are the only peers; all engine packages (form,
   table, chart, dnd, qr) arrive as regular dependencies and never enter
   the bundle for components you don't import.

   Peer range is \`react: ^19.0.0\`; there is no React 18 compatibility layer.

2. Load CSS — the JS entry imports no stylesheet, so pick one mode:

   \`\`\`jsx
   import 'haze-ui/styles.css'; // mode 1: full stylesheet (simplest)
   \`\`\`

   \`\`\`jsx
   import 'haze-ui/css/tokens.css'; // mode 2: tokens once…
   import 'haze-ui/css/button.css'; // …plus each component you use
   \`\`\`

3. Derive per-component CSS file names from \`haze-ui/css-manifest.json\`
   (build-generated export → css-file map, with family absorption and a
   \`noCss\` list) — never hardcode or re-derive file names yourself.

4. Stateful props are \`ControlOrValue<T>\`: pass a plain value for uncontrolled
   use, or a \`Control<T>\` from react-use-control for controlled use — one
   prop, no \`defaultXxx\` mirror API.

5. Every component's full props table (name/type/default/description, types
   verbatim from source) lives in [llms-full.txt](llms-full.txt) — generated,
   always current.

To install the agent components via the shadcn CLI instead, see
[registry/README.md](https://github.com/wmzy/haze-ui/blob/main/registry/README.md).

## Accessibility references

Two docs-site references cover the accessibility surface: the per-component
keyboard & ARIA contract tables (<https://wmzy.github.io/haze-ui/guides/a11y-contracts>
— roles, \`aria-*\` attributes and handled keys per component, extracted from each
component's test suite by \`scripts/generate-a11y-contracts.mjs\`) and the streaming
a11y guide (<https://wmzy.github.io/haze-ui/guides/streaming-a11y> — live-region
patterns for transient UI: aria-busy placement, throttled announcements,
interruption tiers, async option loading and lazy trees).

## Links

- Docs & demos: <https://wmzy.github.io/haze-ui/>
- GitHub: <https://github.com/wmzy/haze-ui>
- npm: <https://www.npmjs.com/package/haze-ui>

The Components section above is generated from the demo sidebar contract
(\`src/views/Layout/component-groups.ts\`) plus the blurb table in
\`scripts/component-descriptions.mjs\` (shared with the shadcn registry); the
Headless / Hooks / Icons sections are generated from the subpath barrels
(\`src/lib/headless/index.ts\`, \`src/lib/hooks/index.ts\`,
\`src/lib/icons/index.ts\`) — every export is enumerated with the JSDoc blurb
written next to it in source. Regenerate with \`node scripts/generate-llms.mjs\`
when any of those change. The preamble and the remaining closing sections are
maintained by hand.
`;

/** Build the full document. */
export function generateLlms(rootDir = defaultRoot()) {
  const groups = readComponentGroups(rootDir).groups;
  const componentCount = groups.reduce((sum, group) => sum + group.items.length, 0);
  // The RSC-safe count comes from the manifest the build itself uses
  // (scripts/rsc-safe.mjs) — never a hand-updated number.
  return `${preamble(componentCount, RSC_SAFE_MODULES.size)}\n${renderComponents(groups)}\n${closing({
    headless: renderHeadless(parseHeadless(rootDir)),
    hooks: renderHooks(parseHooks(rootDir)),
    icons: renderIcons(parseIcons(rootDir)),
  })}`;
}

/**
 * Write llms.txt at the repo root. Idempotent: when the generated content
 * is unchanged the file is not touched (keeps watcher/build timestamps
 * stable).
 */
export function writeLlms(rootDir = defaultRoot()) {
  const content = generateLlms(rootDir);
  const outFile = path.join(rootDir, 'llms.txt');
  const unchanged =
    existsSync(outFile) &&
    readFileSync(outFile, 'utf8').trimEnd() === content.trimEnd();
  if (!unchanged) {
    writeFileSync(outFile, content);
  }
  const groups = readComponentGroups(rootDir).groups;
  return {
    changed: !unchanged,
    outFile,
    componentCount: groups.reduce((sum, g) => sum + g.items.length, 0),
    groupCount: groups.length,
  };
}

if (invokedDirectly(import.meta.url)) {
  runCli('generate-llms', (started) => {
    const { changed, outFile, componentCount, groupCount } = writeLlms();
    return `${componentCount} components in ${groupCount} groups, ${wroteLine(started, changed, outFile)}`;
  });
}
