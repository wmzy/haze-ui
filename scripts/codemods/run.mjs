#!/usr/bin/env node
/**
 * haze-ui codemod runner.
 *
 * Wraps jscodeshift with the repo's parser defaults (--parser=tsx,
 * --extensions=tsx,ts) so consumers never have to remember them.
 *
 * Usage:
 *   pnpm codemod <transform> <path>... [jscodeshift flags]
 *
 * Examples:
 *   pnpm codemod variant-to-color src --dry --print   # preview
 *   pnpm codemod variant-to-color src                 # apply
 *   pnpm codemod variant-to-color src -v 2            # per-file detail
 *
 * Everything after the paths is forwarded to the jscodeshift CLI
 * (see `node node_modules/jscodeshift/bin/jscodeshift.js --help`).
 */

import { spawnSync } from 'node:child_process';
import { existsSync, readdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const codemodDir = dirname(fileURLToPath(import.meta.url));
const transformsDir = join(codemodDir, 'transforms');

function listTransforms() {
  if (!existsSync(transformsDir)) return [];
  return readdirSync(transformsDir)
    .filter((file) => file.endsWith('.mjs'))
    .map((file) => file.replace(/\.mjs$/, ''))
    .sort();
}

function usage(stream) {
  const transforms = listTransforms();
  stream(
    [
      'Usage: pnpm codemod <transform> <path>... [jscodeshift flags]',
      '',
      'Transforms:',
      ...(transforms.length > 0
        ? transforms.map((name) => `  ${name}`)
        : ['  (none installed)']),
      '',
      'Examples:',
      '  pnpm codemod variant-to-color src --dry --print   # preview changes',
      '  pnpm codemod variant-to-color src                 # apply changes',
      '',
      'All other flags are forwarded to jscodeshift:',
      '  node node_modules/jscodeshift/bin/jscodeshift.js --help',
      'See scripts/codemods/README.md for how to write a new transform.',
    ].join('\n'),
  );
}

const [name, ...rest] = process.argv.slice(2);

if (name === '--help' || name === '-h') {
  usage(console.log);
  process.exit(0);
}
if (!name) {
  usage(console.error);
  process.exit(1);
}

const transformPath = join(transformsDir, `${name}.mjs`);
if (!existsSync(transformPath)) {
  console.error(`Unknown transform "${name}". Available transforms:`);
  for (const available of listTransforms()) console.error(`  ${available}`);
  process.exit(1);
}

const paths = rest.filter((arg) => !arg.startsWith('-'));
if (paths.length === 0) {
  console.error('Provide at least one file or directory path to transform.');
  process.exit(1);
}

const jscodeshiftBin = require.resolve('jscodeshift/bin/jscodeshift.js');

console.log(`codemod ${name} on ${paths.join(' ')}`);
const result = spawnSync(
  process.execPath,
  [
    jscodeshiftBin,
    '--transform', transformPath,
    '--parser', 'tsx',
    '--extensions', 'tsx,ts',
    '--ignore-pattern', '**/node_modules/**',
    ...rest,
  ],
  { stdio: 'inherit' },
);

if (result.error) {
  console.error(`Failed to launch jscodeshift: ${result.error.message}`);
  process.exit(1);
}
process.exit(result.status ?? 1);
