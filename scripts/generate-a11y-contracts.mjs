#!/usr/bin/env node
/**
 * Generate src/generated/a11y-contracts.json for the demo docs site
 * (/guides/a11y-contracts).
 *
 * Per component directory under src/lib/components, the script reads every
 * co-located *.test.ts(x) and extracts the accessibility surface the suite
 * actually pins:
 *
 *   - roles:   first argument of getByRole/findByRole/queryByRole (+ All
 *              variants) plus `role="…"` JSX literals rendered in test
 *              fixtures;
 *   - aria:    attribute names from toHaveAttribute('aria-…', …) assertions;
 *   - keys:    keyboard contract — `key: '…'` literals (fireEvent/
 *              dispatchEvent payloads), userEvent key syntax inside
 *              user.keyboard()/user.type() strings ('{ArrowDown}', '{ }'),
 *              a bare space argument to user.keyboard(), and user.tab()
 *              calls (the canonical Tab press without a string);
 *   - testCount: registered it() cases (it / it.skip / it.only / it.each
 *              chains / fit) — a coverage-depth reference, not a contract.
 *
 * Extraction is purely syntactic (ts.createSourceFile, no type checker),
 * same as generate-search-index.mjs. Canonical key names are matched
 * case-insensitively against the list below; the space key is stored as
 * ' ' (userEvent's bare-space and '{Space}'/'{ }' spellings all map to it).
 *
 * The output is sorted and deduped (components by name, roles/aria/keys
 * ascending) so two runs on the same tree differ only in `generatedAt`.
 *
 * CLI:  node scripts/generate-a11y-contracts.mjs
 * API:  import { writeA11yContracts } from './scripts/generate-a11y-contracts.mjs'
 *       (vite.config.mts keeps the file fresh on docs builds, next to
 *       writeProps)
 */
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import ts from 'typescript';

const defaultRoot = () =>
  path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

/** Canonical keyboard-contract key names (case-insensitive source match). */
const CANONICAL_KEYS = [
  'ArrowUp',
  'ArrowDown',
  'ArrowLeft',
  'ArrowRight',
  'PageUp',
  'PageDown',
  'Home',
  'End',
  'Enter',
  'Escape',
  'Tab',
  'Backspace',
  'Delete',
  ' ',
];

const KEY_BY_LOWER = new Map(CANONICAL_KEYS.map((key) => [key.toLowerCase(), key]));
// userEvent spells the space key '{Space}' in a few suites.
KEY_BY_LOWER.set('space', ' ');

/** Canonical name for a matched key spelling, or undefined when not a key. */
const canonicalKey = (name) => KEY_BY_LOWER.get(name.trim().toLowerCase());

/** Receiver identifiers whose .keyboard()/.type()/.tab() carry userEvent key syntax. */
const USER_EVENT_RECEIVERS = /^(user|userEvent)$/;

/**
 * Does this call expression register one test? Covers `it(…)`, `fit(…)`,
 * `it.skip(…)`, `it.only(…)` and the outer call of `it.each(…)(…)` chains
 * (each registered parametrized case counts as one — a depth reference,
 * not an executed-case census).
 */
function registersTest(call) {
  let callee = call.expression;
  /** Property names that namespace rather than register — `test.describe`
   * (suite, not test) and the lifecycle hooks share the `test.`/`it.`
   * receiver and a string first argument, so without this guard they
   * inflate the count. Valid chain members (each/skip/only/fixme) are
   * allowed through. */
  const NON_REGISTERING = new Set([
    'describe',
    'beforeEach',
    'afterEach',
    'beforeAll',
    'afterAll',
  ]);
  while (
    ts.isCallExpression(callee) ||
    ts.isPropertyAccessExpression(callee)
  ) {
    if (
      ts.isPropertyAccessExpression(callee) &&
      NON_REGISTERING.has(callee.name.text)
    ) {
      return false;
    }
    callee = callee.expression;
  }
  if (!ts.isIdentifier(callee) || !/^(f?it|test)$/.test(callee.text)) {
    return false;
  }
  const first = call.arguments[0];
  return (
    first !== undefined &&
    (ts.isStringLiteral(first) ||
      ts.isNoSubstitutionTemplateLiteral(first) ||
      ts.isTemplateExpression(first))
  );
}

/** Extract {roles, aria, keys, testCount} from one test file's syntax tree. */
function scanTestFile(sourceFile) {
  const roles = new Set();
  const aria = new Set();
  const keys = new Set();
  let testCount = 0;

  const addKey = (spelling) => {
    const canonical = canonicalKey(spelling);
    if (canonical !== undefined) keys.add(canonical);
  };

  const visit = (node) => {
    if (ts.isCallExpression(node)) {
      const callee = node.expression;

      // screen.getByRole(…) / getByRole(…) / findByRole / queryByRole and
      // their All variants — the callee is a property access on `screen`
      // or a bare identifier depending on the import style.
      const byRoleName = ts.isPropertyAccessExpression(callee)
        ? callee.name.text
        : ts.isIdentifier(callee)
          ? callee.text
          : '';
      if (byRoleName.endsWith('ByRole')) {
        const first = node.arguments[0];
        if (first !== undefined && ts.isStringLiteral(first)) {
          roles.add(first.text);
        }
      }

      // expect(…).toHaveAttribute('aria-…', …) — attribute name only.
      if (
        ts.isPropertyAccessExpression(callee) &&
        callee.name.text === 'toHaveAttribute'
      ) {
        const first = node.arguments[0];
        if (
          first !== undefined &&
          ts.isStringLiteral(first) &&
          first.text.startsWith('aria-')
        ) {
          aria.add(first.text);
        }
      }

      // user.tab() — the Tab press without a string argument.
      if (
        ts.isPropertyAccessExpression(callee) &&
        callee.name.text === 'tab' &&
        ts.isIdentifier(callee.expression) &&
        USER_EVENT_RECEIVERS.test(callee.expression.text)
      ) {
        keys.add('Tab');
      }

      // user.keyboard('…') / user.type(el, '…') — userEvent key syntax.
      if (
        ts.isPropertyAccessExpression(callee) &&
        (callee.name.text === 'keyboard' || callee.name.text === 'type')
      ) {
        for (const arg of node.arguments) {
          if (!ts.isStringLiteral(arg)) continue;
          // {Token} syntax anywhere in the string ('{ArrowDown}', '{ }').
          for (const token of arg.text.matchAll(/\{([^{}]*)\}/g)) {
            addKey(token[1].trim() === '' ? ' ' : token[1]);
          }
          // keyboard() takes bare keypresses: any space outside {tokens}
          // is a space press (type() enters prose — bare chars there are
          // not part of the keyboard contract).
          if (callee.name.text === 'keyboard') {
            const bare = arg.text.replace(/\{[^{}]*\}/g, '');
            if (bare.includes(' ')) keys.add(' ');
          }
        }
      }

      if (registersTest(node)) testCount += 1;
    }

    // role="…" rendered by test fixtures — intrinsic elements only: a
    // `role` attribute on a capitalized component is its own prop
    // (ChatMessage's user/assistant/system), not an ARIA role.
    if (ts.isJsxAttribute(node) && node.name.text === 'role') {
      const tag = node.parent?.tagName;
      if (
        tag !== undefined &&
        ts.isIdentifier(tag) &&
        /^[a-z]/.test(tag.text)
      ) {
        const init = node.initializer;
        if (init !== undefined && ts.isStringLiteral(init)) {
          roles.add(init.text);
        }
      }
    }

    // fireEvent.keyDown(el, { key: 'ArrowDown' }) style payloads.
    if (
      ts.isPropertyAssignment(node) &&
      ts.isIdentifier(node.name) &&
      node.name.text === 'key' &&
      ts.isStringLiteral(node.initializer)
    ) {
      addKey(node.initializer.text);
    }

    ts.forEachChild(node, visit);
  };

  visit(sourceFile);
  return {
    roles: [...roles].sort(),
    aria: [...aria].sort(),
    keys: [...keys].sort(),
    testCount,
  };
}

/** Component directories with their co-located test files, name-sorted. */
function listComponentTests(rootDir) {
  const componentsDir = path.join(rootDir, 'src/lib/components');
  if (!existsSync(componentsDir)) {
    throw new Error(
      `generate-a11y-contracts: ${componentsDir} not found — run from the repo root`
    );
  }
  return readdirSync(componentsDir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => ({
      component: entry.name,
      files: readdirSync(path.join(componentsDir, entry.name), {
        withFileTypes: true,
      })
        .filter(
          (file) => file.isFile() && /\.test\.tsx?$/.test(file.name)
        )
        .map((file) => path.join(componentsDir, entry.name, file.name))
        .sort(),
    }))
    .filter(({ files }) => files.length > 0)
    .sort((a, b) => a.component.localeCompare(b.component));
}

/**
 * Build the contracts index. `rootDir` defaults to the repo root derived
 * from this file's location — pass it explicitly when this module is
 * inlined into a bundler context (vite.config.mts) where import.meta.url
 * is rewritten.
 */
export function generateA11yContracts(rootDir = defaultRoot()) {
  const components = listComponentTests(rootDir).map(
    ({ component, files }) => {
      const roles = new Set();
      const aria = new Set();
      const keys = new Set();
      let testCount = 0;
      for (const file of files) {
        const sourceFile = ts.createSourceFile(
          file,
          readFileSync(file, 'utf8'),
          ts.ScriptTarget.Latest,
          true,
          /\.tsx$/.test(file) ? ts.ScriptKind.TSX : ts.ScriptKind.TS
        );
        const found = scanTestFile(sourceFile);
        for (const role of found.roles) roles.add(role);
        for (const name of found.aria) aria.add(name);
        for (const key of found.keys) keys.add(key);
        testCount += found.testCount;
      }
      return {
        component,
        roles: [...roles].sort(),
        aria: [...aria].sort(),
        keys: [...keys].sort(),
        testCount,
      };
    }
  );
  if (components.length === 0) {
    throw new Error(
      'generate-a11y-contracts: no component test files under src/lib/components — nothing to extract'
    );
  }
  return { generatedAt: new Date().toISOString(), components };
}

/**
 * Write src/generated/a11y-contracts.json. Semi-idempotent: when the
 * extracted `components` payload is unchanged the file is not touched
 * (the previous `generatedAt` survives, keeping watcher/build timestamps
 * stable — same policy as writeProps).
 */
export function writeA11yContracts(rootDir = defaultRoot()) {
  const data = generateA11yContracts(rootDir);
  const outDir = path.join(rootDir, 'src/generated');
  const outFile = path.join(outDir, 'a11y-contracts.json');

  let changed = true;
  if (existsSync(outFile)) {
    try {
      const previous = JSON.parse(readFileSync(outFile, 'utf8'));
      if (
        JSON.stringify(previous.components) === JSON.stringify(data.components)
      ) {
        changed = false;
      }
    } catch {
      /* corrupt previous output — rewrite it */
    }
  }
  if (changed) {
    mkdirSync(outDir, { recursive: true });
    writeFileSync(outFile, `${JSON.stringify(data, null, 2)}\n`);
  }
  return { changed, outFile, componentCount: data.components.length };
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
    const { changed, outFile, componentCount } = writeA11yContracts();
    console.log(
      `generate-a11y-contracts: ${componentCount} components, ${changed ? 'wrote' : 'unchanged'} ${path.relative(defaultRoot(), outFile)} in ${Date.now() - started}ms`
    );
  } catch (error) {
    console.error(
      `generate-a11y-contracts: ${error instanceof Error ? error.stack : String(error)}`
    );
    process.exit(1);
  }
}
