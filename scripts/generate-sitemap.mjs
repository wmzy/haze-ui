#!/usr/bin/env node
/**
 * Generate public/sitemap.xml + public/robots.txt for the docs site
 * (GitHub Pages deployment — see the `deploy` script).
 *
 * URLs are enumerated from the app's own route sources, never a
 * hand-maintained list:
 *   - static paths come from src/views/index.tsx (the HistoryRouter route
 *     table — every `path:` literal in that file is a route);
 *   - the dynamic '/components/:name' route expands to one URL per
 *     registered demo key in src/views/ComponentDetail/index.tsx — only
 *     registered demos render, every other name 404s, so the registry is
 *     the authoritative page set.
 *
 * The site origin is package.json's "homepage" — the same URL the demo
 * build's vite `base: '/haze-ui/'` serves under, and the one robots.txt
 * must reference absolutely.
 *
 * The output is deterministic (route declaration + demo registry order, no
 * timestamps) and writes are idempotent (untouched when unchanged).
 *
 * CLI:  node scripts/generate-sitemap.mjs
 * API:  import { writeSitemap } from './scripts/generate-sitemap.mjs'
 *       (vite.config.mts runs it in the props-docgen plugin's
 *       configResolved, next to writeSearchIndex)
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

import ts from 'typescript';

const defaultRoot = () =>
  path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

/** The dynamic component route in src/views/index.tsx. */
const COMPONENT_ROUTE = '/components/:name';

function parseSource(file) {
  return ts.createSourceFile(
    file,
    readFileSync(file, 'utf8'),
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TSX
  );
}

/** Every `path: '...'` literal in src/views/index.tsx, declaration order. */
function readStaticRoutes(rootDir) {
  const sourceFile = parseSource(
    path.join(rootDir, 'src/views/index.tsx')
  );
  const routes = [];
  const visit = (node) => {
    if (
      ts.isPropertyAssignment(node) &&
      ts.isIdentifier(node.name) &&
      node.name.text === 'path' &&
      ts.isStringLiteral(node.initializer)
    ) {
      routes.push(node.initializer.text);
    }
    ts.forEachChild(node, visit);
  };
  ts.forEachChild(sourceFile, visit);
  return [...new Set(routes)];
}

/** Keys of the `const demos = { ... }` registry (the rendered component pages). */
function readComponentRoutes(rootDir) {
  const sourceFile = parseSource(
    path.join(rootDir, 'src/views/ComponentDetail/index.tsx')
  );
  for (const statement of sourceFile.statements) {
    if (!ts.isVariableStatement(statement)) continue;
    for (const decl of statement.declarationList.declarations) {
      if (!ts.isIdentifier(decl.name) || decl.name.text !== 'demos') continue;
      if (!ts.isObjectLiteralExpression(decl.initializer)) continue;
      const routes = [];
      for (const prop of decl.initializer.properties) {
        if (!ts.isPropertyAssignment(prop)) continue;
        if (ts.isIdentifier(prop.name) || ts.isStringLiteral(prop.name)) {
          routes.push(prop.name.text);
        }
      }
      return routes;
    }
  }
  throw new Error(
    'generate-sitemap: `const demos = { ... }` not found in src/views/ComponentDetail/index.tsx'
  );
}

const escapeXml = (text) =>
  text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

/**
 * All sitemap routes (site-relative, '/components/button' style), static
 * declaration order with the dynamic component route expanded in place.
 * `rootDir` defaults to the repo root — pass it explicitly when this
 * module is inlined into a bundler context (vite.config.mts).
 */
export function generateSitemapRoutes(rootDir = defaultRoot()) {
  const staticRoutes = readStaticRoutes(rootDir);
  if (!staticRoutes.includes(COMPONENT_ROUTE)) {
    throw new Error(
      `generate-sitemap: ${COMPONENT_ROUTE} missing from src/views/index.tsx — route table changed?`
    );
  }
  const componentRoutes = readComponentRoutes(rootDir);
  if (componentRoutes.length === 0) {
    throw new Error(
      'generate-sitemap: demo registry in src/views/ComponentDetail/index.tsx is empty'
    );
  }
  return staticRoutes.flatMap((route) =>
    route === COMPONENT_ROUTE
      ? componentRoutes.map((name) => `/components/${name}`)
      : [route]
  );
}

/**
 * Write public/sitemap.xml + public/robots.txt. Idempotent: files whose
 * content is unchanged are not touched (keeps watcher/build timestamps
 * stable).
 */
export function writeSitemap(rootDir = defaultRoot()) {
  const pkg = JSON.parse(
    readFileSync(path.join(rootDir, 'package.json'), 'utf8')
  );
  if (typeof pkg.homepage !== 'string' || !/^https?:\/\//.test(pkg.homepage)) {
    throw new Error(
      'generate-sitemap: package.json "homepage" must be the deployed site URL'
    );
  }
  const origin = pkg.homepage.replace(/\/+$/, '');
  const routes = generateSitemapRoutes(rootDir);

  const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${routes
  .map(
    (route) =>
      `  <url><loc>${escapeXml(
        route === '/' ? `${origin}/` : `${origin}${route}`
      )}</loc></url>`
  )
  .join('\n')}
</urlset>
`;
  const robotsTxt = `User-agent: *
Allow: /

Sitemap: ${origin}/sitemap.xml
`;

  const outDir = path.join(rootDir, 'public');
  mkdirSync(outDir, { recursive: true });
  let changed = false;
  const outFiles = [];
  for (const [file, content] of [
    ['sitemap.xml', sitemapXml],
    ['robots.txt', robotsTxt],
  ]) {
    const outFile = path.join(outDir, file);
    const unchanged =
      existsSync(outFile) &&
      readFileSync(outFile, 'utf8').trimEnd() === content.trimEnd();
    if (!unchanged) {
      writeFileSync(outFile, content);
      changed = true;
    }
    outFiles.push(outFile);
  }
  return { changed, outFiles, urlCount: routes.length };
}

const invokedDirectly = () => {
  if (!process.argv[1]) return false;
  try {
    return import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href;
  } catch {
    return false;
  }
};

if (invokedDirectly()) {
  try {
    const started = Date.now();
    const { changed, outFiles, urlCount } = writeSitemap();
    console.log(
      `generate-sitemap: ${urlCount} urls, ${changed ? 'wrote' : 'unchanged'} ${outFiles
        .map((file) => path.relative(defaultRoot(), file))
        .join(' + ')} in ${Date.now() - started}ms`
    );
  } catch (error) {
    console.error(
      `generate-sitemap: ${error instanceof Error ? error.stack : String(error)}`
    );
    process.exit(1);
  }
}
