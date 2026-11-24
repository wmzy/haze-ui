#!/usr/bin/env node
/**
 * Generate src/generated/search-index.json — the ⌘K palette's Docs tier.
 *
 * Every entry is shaped {type, label, sublabel?, route, keywords?}; five
 * kinds are collected:
 *
 *   - page:      static docs-page list (labels/keywords mirror the sidebar
 *                nav in src/views/Layout/index.tsx)
 *   - component: the sidebar's component-groups.ts (names + ALIASES search
 *                aliases, route=/components/<slug>)
 *   - api:       one generated reference page per component
 *                (route=/api/<slug>, label "<Name> API", keywords reuse the
 *                component's ALIASES)
 *   - section:   every section heading in each registered component demo —
 *                a literal <h2>, or the `title` of the demo page template's
 *                <DemoSection> (demos/shared.tsx renders it as that <h2>).
 *                The registry in ComponentDetail/index.tsx maps routes →
 *                demo files; generic headings (Demo/Props/API/Accessibility)
 *                carry no component-specific meaning and are skipped
 *   - prop:      src/generated/props-docs.json descriptions joined onto
 *                props.json routes, plus the hand-written inline
 *                `PropsTable props={[...]}` rows inside demos (FormItem /
 *                FormList / useField / useToast have no generated props.json
 *                entry — form is a known extra outside the lib components
 *                tree, useToast is a hook API table). Each row's sublabel
 *                is prefixed with the owner derived from the nearest
 *                preceding h2/h3 heading.
 *
 * Extraction is purely syntactic (ts.createSourceFile, no type checker):
 * the data sources are literal object/array initializers and JSX text. The
 * sidebar literal is read through scripts/component-groups.mjs — the same
 * reader llms.txt and the registry categories derive from.
 *
 * The output is deterministic (fixed page list, sidebar/registry source
 * order, sorted prop type names — no timestamps) so two runs produce
 * byte-identical JSON.
 *
 * CLI:  node scripts/generate-search-index.mjs
 * API:  import { writeSearchIndex } from './scripts/generate-search-index.mjs'
 *       (vite.config.mts runs it right after writeProps: the prop entries
 *       join props.json, which must be regenerated first)
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';

import ts from 'typescript';

import { defaultRoot, invokedDirectly, readJson, runCli } from './cli-utils.mjs';
import { readComponentGroups } from './component-groups.mjs';
import { objectProps, parseSource } from './ts-source.mjs';

/*
 * Docs pages surfaced as first-class search targets. Labels mirror the
 * sidebar nav; routes mirror src/views/index.tsx. Home/About are trivially
 * reachable and intentionally not indexed.
 */
const PAGES = [
  {
    label: 'Getting Started',
    sublabel: 'Guide',
    route: '/getting-started',
    keywords: ['install', 'setup', 'quickstart', 'usage'],
    zh: '快速上手',
  },
  {
    label: 'Recipes',
    sublabel: 'Guide',
    route: '/recipes',
    keywords: ['patterns', 'examples', 'member crud', 'chat adapter'],
    zh: '实战示例',
  },
  {
    label: 'AI Elements',
    sublabel: 'Guide',
    route: '/recipes/ai-elements',
    keywords: [
      'ai elements',
      'chat patterns',
      'response actions',
      'thought chain',
      'subagent trace',
      'context attachments',
      'sources',
      'follow up suggestions',
    ],
    zh: 'AI 元素',
  },
  {
    label: 'Blocks',
    sublabel: 'Demo',
    route: '/blocks',
    keywords: [
      'blocks',
      'page templates',
      'dashboard',
      'login',
      'settings',
      'composition',
      'stackblitz',
    ],
    zh: '页面区块',
  },
  {
    label: 'Dark mode',
    sublabel: 'Guide',
    route: '/guides/dark-mode',
    keywords: ['theme', 'theming', 'night', 'color scheme'],
    zh: '深色模式',
  },
  {
    label: 'Density (compact)',
    sublabel: 'Guide',
    route: '/guides/density',
    keywords: ['compact', 'spacing', 'dense'],
    zh: '密度（紧凑）',
  },
  {
    label: 'Accessibility',
    sublabel: 'Guide',
    route: '/guides/a11y',
    keywords: ['a11y', 'screen reader', 'keyboard', 'axe', 'wcag'],
    zh: '无障碍',
  },
  {
    label: 'A11y Contracts',
    sublabel: 'Guide',
    route: '/guides/a11y-contracts',
    keywords: [
      'a11y',
      'aria',
      'roles',
      'keyboard',
      'keys',
      'screen reader',
      'contracts',
    ],
    zh: '无障碍契约',
  },
  {
    label: 'WCAG 2.2 conformance',
    sublabel: 'Guide',
    route: '/guides/a11y-statement',
    keywords: [
      'wcag',
      'acr',
      'conformance',
      'vpat',
      'accessibility statement',
      'aa',
      'procurement',
    ],
    zh: 'WCAG 2.2 一致性报告',
  },
  {
    label: 'Migrating from AntD / shadcn',
    sublabel: 'Guide',
    route: '/guides/migration',
    keywords: ['antd', 'shadcn', 'upgrade', 'port'],
    zh: '从 AntD / shadcn 迁移',
  },
  {
    label: 'Deprecation policy',
    sublabel: 'Guide',
    route: '/guides/deprecation-policy',
    keywords: ['deprecated', 'deprecation', 'removal', 'codemod', 'breaking change'],
    zh: '弃用政策',
  },
  {
    label: 'Streaming a11y',
    sublabel: 'Guide',
    route: '/guides/streaming-a11y',
    keywords: ['streaming', 'screen reader', 'aria-live', 'live region', 'announce', 'chat'],
    zh: '流式无障碍',
  },
  {
    label: 'Motion presets',
    sublabel: 'Guide',
    route: '/guides/motion',
    keywords: ['motion', 'animation', 'transition', 'enter', 'exit', 'data-state', 'presence'],
    zh: '动效预设',
  },
  {
    label: 'Tokens in Figma',
    sublabel: 'Guide',
    route: '/guides/figma-tokens',
    keywords: ['figma', 'tokens studio', 'w3c', 'dtf', 'design tokens', 'variables', 'oklch'],
    zh: 'Figma 中的设计令牌',
  },
  {
    label: 'React 19 Actions',
    sublabel: 'Guide',
    route: '/guides/server-actions',
    keywords: [
      'server actions',
      'useactionstate',
      'useoptimistic',
      'form action',
      'formdata',
      'next.js',
      'pending',
      'optimistic',
    ],
    zh: 'React 19 Actions',
  },
  {
    label: 'Composition & customization',
    sublabel: 'Guide',
    route: '/guides/composition',
    keywords: [
      'composition',
      'customization',
      'escape hatch',
      'core',
      'unstyled',
      'headless',
      'as prop',
      'polymorphic',
      'classnames',
      'data-slot',
      'design tokens',
      'z-index',
      'brand theme',
    ],
    zh: '组合与定制',
  },
  {
    label: 'Design Tokens',
    sublabel: 'Reference',
    route: '/tokens',
    keywords: [
      'colors',
      'palette',
      'oklch',
      'css variables',
      'spacing',
      'typography',
    ],
    zh: '设计令牌',
  },
  {
    label: 'AI Showcase',
    sublabel: 'Demo',
    route: '/ai-showcase',
    keywords: ['chat', 'assistant', 'playground'],
    zh: 'AI 演示',
  },
  {
    label: 'Theme Editor',
    sublabel: 'Tool',
    route: '/theme-editor',
    keywords: ['brand', 'customize', 'export theme', 'palette editor'],
    zh: '主题编辑器',
  },
  {
    label: 'Changelog',
    sublabel: 'Reference',
    route: '/changelog',
    keywords: ['releases', 'version history', 'changes'],
    zh: '更新日志',
  },
  {
    label: 'Help',
    sublabel: 'Reference',
    route: '/help',
    keywords: ['faq', 'support', 'troubleshooting'],
    zh: '帮助',
  },
];

/*
 * Demo h2 titles repeated on (nearly) every component page with identical
 * boilerplate content — pure noise in a query, excluded from the index.
 * Owner-qualified variants ("Accordion Props", "useToast API") survive.
 */
const GENERIC_SECTIONS = new Set(['Demo', 'Props', 'API', 'Accessibility']);

/*
 * Section wrappers of the demo page template (src/views/ComponentDetail/
 * demos/shared.tsx). Each renders a section whose <h2> is either the
 * wrapper's `title` attribute or a fixed generic heading, so the scanner
 * reads the heading off the wrapper instead of off a literal <h2>.
 */
const SECTION_WRAPPERS = new Map([
  ['DemoSection', 'title'],
  ['PropsSection', 'Props'],
  ['AccessibilitySection', 'Accessibility'],
]);

/** Prop rows that exist on every component with a generic description. */
const GHOST_PROPS = new Set(['className', 'style']);

/*
 * The demo registry: `const demos = { route: ImportedDemo, ... }` plus the
 * default imports feeding it, resolved to absolute file paths. Only
 * registered demos are rendered, so only they are scanned.
 */
function readDemoRegistry(rootDir) {
  const file = path.join(rootDir, 'src/views/ComponentDetail/index.tsx');
  const sourceFile = parseSource(file);

  const imports = new Map();
  for (const statement of sourceFile.statements) {
    if (!ts.isImportDeclaration(statement)) continue;
    if (!statement.importClause?.name) continue;
    const specifier = statement.moduleSpecifier.text;
    const base = specifier.startsWith('@/')
      ? path.join(rootDir, 'src', specifier.slice(2))
      : path.resolve(path.dirname(file), specifier);
    for (const ext of ['.tsx', '.ts']) {
      if (existsSync(base + ext)) {
        imports.set(statement.importClause.name.text, base + ext);
        break;
      }
    }
  }

  const registry = [];
  for (const statement of sourceFile.statements) {
    if (!ts.isVariableStatement(statement)) continue;
    for (const decl of statement.declarationList.declarations) {
      if (decl.name.text !== 'demos' || !decl.initializer) continue;
      if (!ts.isObjectLiteralExpression(decl.initializer)) continue;
      for (const prop of decl.initializer.properties) {
        if (!ts.isPropertyAssignment(prop)) continue;
        if (!ts.isIdentifier(prop.initializer)) continue;
        const demoFile = imports.get(prop.initializer.text);
        if (demoFile) registry.push({ route: prop.name.text, file: demoFile });
      }
    }
  }
  return registry;
}

const ENTITIES = {
  amp: '&',
  lt: '<',
  gt: '>',
  quot: '"',
  apos: "'",
  nbsp: ' ',
};

/** JSX text keeps entity references verbatim — decode the common ones. */
function decodeEntities(text) {
  return text.replace(/&(#[xX]?[0-9a-fA-F]+|[a-zA-Z]+);/g, (match, body) => {
    if (body.startsWith('#x') || body.startsWith('#X')) {
      return String.fromCodePoint(parseInt(body.slice(2), 16));
    }
    if (body.startsWith('#')) {
      return String.fromCodePoint(parseInt(body.slice(1), 10));
    }
    return ENTITIES[body.toLowerCase()] ?? match;
  });
}

/** Concatenated JSX text of an element (nested tags walked, whitespace collapsed). */
function jsxText(element) {
  let out = '';
  const visit = (node) => {
    if (ts.isJsxText(node)) out += node.text;
    ts.forEachChild(node, visit);
  };
  visit(element);
  return decodeEntities(out).replace(/\s+/g, ' ').trim();
}

function jsxTagName(node) {
  // JsxSelfClosingElement carries `tagName`/`attributes` directly; on a
  // JsxElement both live on the opening element (TS 6 dropped the
  // shortcut properties).
  const tag = ts.isJsxSelfClosingElement(node)
    ? node.tagName
    : node.openingElement.tagName;
  return ts.isIdentifier(tag) ? tag.text : undefined;
}

function jsxAttributes(node) {
  return ts.isJsxSelfClosingElement(node)
    ? node.attributes
    : node.openingElement.attributes;
}

/** Heading text of a section wrapper: its `title` attribute, or its fixed heading. */
function wrapperHeading(node, tag) {
  const heading = SECTION_WRAPPERS.get(tag);
  if (heading !== 'title') return heading;
  for (const attr of jsxAttributes(node).properties) {
    if (!ts.isJsxAttribute(attr) || attr.name.text !== 'title') continue;
    const initializer = attr.initializer;
    const literal =
      initializer && ts.isStringLiteral(initializer)
        ? initializer
        : initializer &&
            ts.isJsxExpression(initializer) &&
            initializer.expression &&
            ts.isStringLiteralLike(initializer.expression)
          ? initializer.expression
          : undefined;
    // Same normalisation as jsxText, so a heading reads the same whichever form it was written in.
    return literal ? decodeEntities(literal.text).replace(/\s+/g, ' ').trim() : '';
  }
  return '';
}

/** Owner context for a props table, derived from its nearest heading. */
function ownerFromHeading(heading) {
  return heading
    .split(' — ')[0]
    .split(' (')[0]
    .replace(/\s+props$/i, '')
    .replace(/\s+API$/i, '')
    .trim();
}

/** h2 section titles + hand-written PropsTable rows of one demo file. */
function scanDemo(sourceFile) {
  const sections = [];
  const propRows = [];
  let lastHeading = '';

  const visit = (node) => {
    if (ts.isJsxElement(node) || ts.isJsxSelfClosingElement(node)) {
      const tag = jsxTagName(node);
      if (tag === 'h2' || tag === 'h3') {
        const text = jsxText(node);
        if (text) {
          lastHeading = text;
          if (tag === 'h2' && !GENERIC_SECTIONS.has(text)) sections.push(text);
        }
      } else if (SECTION_WRAPPERS.has(tag)) {
        const text = wrapperHeading(node, tag);
        if (text) {
          lastHeading = text;
          if (!GENERIC_SECTIONS.has(text)) sections.push(text);
        }
      } else if (tag === 'PropsTable') {
        for (const attr of jsxAttributes(node).properties) {
          if (!ts.isJsxAttribute(attr) || attr.name.text !== 'props') continue;
          const initializer = attr.initializer;
          const array =
            initializer &&
            ts.isJsxExpression(initializer) &&
            initializer.expression &&
            ts.isArrayLiteralExpression(initializer.expression)
              ? initializer.expression
              : null;
          if (!array) continue;
          for (const element of array.elements) {
            if (!ts.isObjectLiteralExpression(element)) continue;
            const props = objectProps(element);
            const name = props.get('name');
            const description = props.get('description');
            if (name && ts.isStringLiteral(name) && description && ts.isStringLiteral(description)) {
              propRows.push({
                owner: ownerFromHeading(lastHeading),
                name: name.text,
                description: description.text,
              });
            }
          }
        }
      }
    }
    ts.forEachChild(node, visit);
  };

  visit(sourceFile);
  return { sections, propRows };
}

/** Prop entries from props.json routes × props-docs.json descriptions. */
function generatedPropEntries(rootDir) {
  const props = readJson(rootDir, 'src/generated/props.json');
  const docs = readJson(rootDir, 'src/generated/props-docs.json');
  const entries = [];
  for (const component of Object.keys(props.components).sort()) {
    const entry = props.components[component];
    const typeNames = [
      ...Object.keys(entry.propsTypes),
      ...Object.keys(entry.otherTypes),
    ].sort();
    for (const typeName of typeNames) {
      const rows = docs[typeName];
      if (!Array.isArray(rows)) continue;
      const owner = typeName.replace(/Props$/, '');
      for (const row of rows) {
        if (!row.description || GHOST_PROPS.has(row.name)) continue;
        entries.push({
          type: 'prop',
          label: row.name,
          sublabel: `${owner} — ${row.description}`,
          route: `/components/${entry.routeKey}`,
        });
      }
    }
  }
  return entries;
}

/**
 * Build the search index. `rootDir` defaults to the repo root derived from
 * this file's location — pass it explicitly when this module is inlined
 * into a bundler context (vite.config.mts) where import.meta.url is
 * rewritten.
 */
export function generateSearchIndex(rootDir = defaultRoot()) {
  const propsFile = path.join(rootDir, 'src/generated/props.json');
  if (!existsSync(propsFile)) {
    throw new Error(
      `generate-search-index: ${propsFile} not found — run generate-props first`
    );
  }

  const entries = [];
  // zh title rides along as an extra search keyword: the palette's primary
  // keys stay English (component/page labels), but a Chinese query like
  // 深色模式 now hits the page tier too.
  for (const { zh, ...page } of PAGES) {
    entries.push({
      type: 'page',
      ...page,
      keywords: [...(page.keywords ?? []), ...(zh ? [zh] : [])],
    });
  }

  const { groups, aliases } = readComponentGroups(rootDir);
  const nameByRoute = new Map();
  for (const group of groups) {
    for (const item of group.items) {
      nameByRoute.set(item.route, item.name);
      entries.push({
        type: 'component',
        label: item.name,
        route: `/components/${item.route}`,
        keywords: aliases[item.route] ?? [],
      });
    }
  }

  // API tier: one generated reference page per component (mirrors the
  // /api/:componentId route); keywords reuse the component's aliases so
  // "modal" surfaces "Dialog API" just like it surfaces "Dialog".
  for (const [route, name] of nameByRoute) {
    entries.push({
      type: 'api',
      label: `${name} API`,
      sublabel: 'Reference',
      route: `/api/${route}`,
      keywords: aliases[route] ?? [],
    });
  }

  const sectionEntries = [];
  const demoPropEntries = [];
  const seenDemoProps = new Set();
  for (const { route, file } of readDemoRegistry(rootDir)) {
    const owner = nameByRoute.get(route) ?? route;
    const { sections, propRows } = scanDemo(parseSource(file));
    const seenSections = new Set();
    for (const label of sections) {
      if (seenSections.has(label)) continue;
      seenSections.add(label);
      sectionEntries.push({
        type: 'section',
        label,
        sublabel: owner,
        route: `/components/${route}`,
      });
    }
    for (const row of propRows) {
      const key = `${route}|${row.owner}|${row.name}`;
      if (seenDemoProps.has(key)) continue;
      seenDemoProps.add(key);
      demoPropEntries.push({
        type: 'prop',
        label: row.name,
        sublabel: `${row.owner} — ${row.description}`,
        route: `/components/${route}`,
      });
    }
  }
  entries.push(...sectionEntries, ...demoPropEntries, ...generatedPropEntries(rootDir));

  return entries;
}

/**
 * Write src/generated/search-index.json. Idempotent: when the generated
 * content is unchanged the file is not touched (keeps watcher/build
 * timestamps stable).
 */
export function writeSearchIndex(rootDir = defaultRoot()) {
  const data = generateSearchIndex(rootDir);
  const outDir = path.join(rootDir, 'src/generated');
  const outFile = path.join(outDir, 'search-index.json');
  const content = `${JSON.stringify(data, null, 2)}\n`;
  mkdirSync(outDir, { recursive: true });
  const unchanged =
    existsSync(outFile) &&
    (readFileSync(outFile, 'utf8').trimEnd() === content.trimEnd());
  if (!unchanged) {
    writeFileSync(outFile, content);
  }
  return { changed: !unchanged, outFile, entryCount: data.length };
}

if (invokedDirectly(import.meta.url)) {
  runCli('generate-search-index', (started) => {
    const { changed, outFile, entryCount } = writeSearchIndex();
    return `${entryCount} entries, ${changed ? 'wrote' : 'unchanged'} ${path.relative(defaultRoot(), outFile)} in ${Date.now() - started}ms`;
  });
}
