/**
 * Shared CLI plumbing for the scripts/ generators.
 *
 * Every generator is run as `node scripts/<name>.mjs` from the package
 * root (package.json `build` / `build:demo`, CI) and prints one
 * `<name>: <summary>` line; failures print `<name>: <error>` on stderr and
 * exit 1. Five of them are additionally imported by vite.config.mts, which
 * inlines them into the config bundle — there `import.meta.url` no longer
 * points at scripts/, so the exported functions take `rootDir` and vite
 * passes it explicitly. `defaultRoot()` is only the fallback for direct
 * CLI runs.
 */
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

/** The repo root — the parent of scripts/, whatever the working directory. */
export const defaultRoot = () =>
  path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

/**
 * True when the module owning `moduleUrl` (pass `import.meta.url`) is the
 * script node was asked to run — false when it is merely imported.
 */
export function invokedDirectly(moduleUrl) {
  if (!process.argv[1]) return false;
  try {
    return moduleUrl === pathToFileURL(path.resolve(process.argv[1])).href;
  } catch {
    return false;
  }
}

/** `<name>: <error>` on stderr, exit code 1. */
export function exitWithError(name, error) {
  console.error(
    `${name}: ${error instanceof Error ? error.stack : String(error)}`
  );
  process.exit(1);
}

/**
 * Run a generator's CLI: `task` does the work and returns the text printed
 * after `<name>: `; `started` is the timestamp the `in <ms>ms` tail counts
 * from. Anything it throws goes through exitWithError.
 */
export function runCli(name, task) {
  const started = Date.now();
  try {
    console.log(`${name}: ${task(started)}`);
  } catch (error) {
    exitWithError(name, error);
  }
}

/**
 * The tail of an idempotent writer's summary line:
 * `wrote|unchanged <files relative to the repo root> in <ms>ms`.
 */
export const wroteLine = (started, changed, files) =>
  `${changed ? 'wrote' : 'unchanged'} ${[files]
    .flat()
    .map((file) => path.relative(defaultRoot(), file))
    .join(' + ')} in ${Date.now() - started}ms`;

/**
 * `fail(message)` for scripts that validate as they go (and are not wrapped
 * in runCli): `<name>: <message>` on stderr, exit code 1.
 */
export const failFor = (name) => (message) => {
  console.error(`${name}: ${message}`);
  process.exit(1);
};

/**
 * Parsed JSON of `<rootDir>/<relPath>`. A missing file is an error naming
 * it (and `hint`, telling how to produce it) unless `optional` is set, in
 * which case null is returned and the caller supplies the fallback.
 */
export function readJson(rootDir, relPath, { optional = false, hint } = {}) {
  const file = path.join(rootDir, relPath);
  if (!existsSync(file)) {
    if (optional) return null;
    throw new Error(
      `${relPath} not found${hint === undefined ? '' : ` — ${hint}`}`
    );
  }
  return JSON.parse(readFileSync(file, 'utf8'));
}
