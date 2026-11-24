/**
 * Syntax-tree readers for the scripts that read demo-app sources as data
 * (src/views/**): the sidebar contract (component-groups.mjs), the demo
 * registry and the route table (generate-search-index.mjs,
 * generate-sitemap.mjs). Purely syntactic — ts.createSourceFile, no type
 * checker, no program — for literals the app owns at run time.
 */
import { readFileSync } from 'node:fs';

import ts from 'typescript';

/** Parse one .ts/.tsx file (TSX kind: the demo sources contain JSX). */
export function parseSource(file) {
  return ts.createSourceFile(
    file,
    readFileSync(file, 'utf8'),
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TSX
  );
}

/** Property assignments of an object literal keyed by property name. */
export function objectProps(obj) {
  const map = new Map();
  for (const prop of obj.properties) {
    if (ts.isPropertyAssignment(prop))
      map.set(prop.name.text, prop.initializer);
  }
  return map;
}
