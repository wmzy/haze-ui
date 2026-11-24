/**
 * Syntactic reader for src/views/Layout/component-groups.ts — the demo
 * sidebar contract: COMPONENT_GROUPS (group → components, in the order the
 * sidebar and llms.txt show them) plus ALIASES (route → search aliases).
 *
 * The module cannot be imported: it loads '@/generated/props.json' and runs
 * its coverage guard at load time. Its data is a plain literal, so a
 * syntax-tree read is exact — and, unlike a regex over the source text, it
 * fails loudly when the literal's shape changes instead of silently dropping
 * entries. Consumers: llms.txt (generate-llms.mjs), the search index
 * (generate-search-index.mjs) and the registry categories
 * (generate-registry.mjs) — the sidebar grouping is the single source all
 * three derive from.
 */
import path from 'node:path';

import ts from 'typescript';

import { objectProps, parseSource } from './ts-source.mjs';

const FILE = 'src/views/Layout/component-groups.ts';

const shapeError = (sourceFile, node, expected) =>
  new Error(
    `${FILE}:${sourceFile.getLineAndCharacterOfPosition(node.getStart(sourceFile)).line + 1}: ${expected} — shape changed?`
  );

/** Initializer of the top-level `const <name> = …`, undefined when absent. */
function declarationInitializer(sourceFile, name) {
  for (const statement of sourceFile.statements) {
    if (!ts.isVariableStatement(statement)) continue;
    for (const decl of statement.declarationList.declarations) {
      if (ts.isIdentifier(decl.name) && decl.name.text === name) {
        return decl.initializer;
      }
    }
  }
  return undefined;
}

/** `{ name: '…', route: '…' }` literal → { name, route }. */
function readItem(sourceFile, item) {
  if (!ts.isObjectLiteralExpression(item)) {
    throw shapeError(
      sourceFile,
      item,
      'expected an item object `{ name, route }`'
    );
  }
  const props = objectProps(item);
  const name = props.get('name');
  const route = props.get('route');
  if (
    name === undefined ||
    !ts.isStringLiteral(name) ||
    route === undefined ||
    !ts.isStringLiteral(route)
  ) {
    throw shapeError(
      sourceFile,
      item,
      "expected an item object `{ name: '…', route: '…' }`"
    );
  }
  return { name: name.text, route: route.text };
}

/** COMPONENT_GROUPS + ALIASES from component-groups.ts (syntactic read). */
export function readComponentGroups(rootDir) {
  const sourceFile = parseSource(path.join(rootDir, FILE));
  const groupArray = declarationInitializer(sourceFile, 'COMPONENT_GROUPS');
  if (groupArray === undefined || !ts.isArrayLiteralExpression(groupArray)) {
    throw new Error(
      `${FILE}: \`const COMPONENT_GROUPS = [ … ]\` not found — shape changed?`
    );
  }

  const groups = groupArray.elements.map((element) => {
    if (!ts.isObjectLiteralExpression(element)) {
      throw shapeError(
        sourceFile,
        element,
        'expected a group object `{ group, items }`'
      );
    }
    const props = objectProps(element);
    const group = props.get('group');
    const items = props.get('items');
    if (
      group === undefined ||
      !ts.isStringLiteral(group) ||
      items === undefined ||
      !ts.isArrayLiteralExpression(items)
    ) {
      throw shapeError(
        sourceFile,
        element,
        "expected a group object `{ group: '…', items: [ … ] }`"
      );
    }
    return {
      group: group.text,
      items: items.elements.map((item) => readItem(sourceFile, item)),
    };
  });
  if (groups.length === 0) {
    throw new Error(`${FILE}: COMPONENT_GROUPS is empty — shape changed?`);
  }

  const aliases = {};
  const aliasObject = declarationInitializer(sourceFile, 'ALIASES');
  if (aliasObject !== undefined && ts.isObjectLiteralExpression(aliasObject)) {
    for (const prop of aliasObject.properties) {
      if (
        !ts.isPropertyAssignment(prop) ||
        !ts.isArrayLiteralExpression(prop.initializer)
      )
        continue;
      aliases[prop.name.text] = prop.initializer.elements
        .filter(ts.isStringLiteral)
        .map((element) => element.text);
    }
  }
  return { groups, aliases };
}
