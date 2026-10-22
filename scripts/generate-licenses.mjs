#!/usr/bin/env node
/**
 * Generate dist/THIRD-PARTY-NOTICES.md — the third-party license inventory
 * that ships inside the npm package (`files: ["dist", ...]`).
 *
 * Scope: the runtime `dependencies` of package.json plus their transitive
 * runtime dependency closure. Peer dependencies (react/react-dom) are
 * provided by consumers, not bundled, so they are deliberately excluded;
 * optionalDependencies are skipped too so the output stays deterministic
 * across platforms (platform-specific optionals resolve differently).
 *
 * Resolution walks the graph with one require function per package, each
 * anchored at that package's (realpath'd) manifest: pnpm links dependencies
 * as siblings inside the .pnpm store, so a child resolves from its parent's
 * anchor, not the repo root. Packages whose exports map hides both
 * ./package.json and the main entry (e.g. @tiptap/pm) fall back to the
 * hoisted node_modules location; their transitive deps still resolve because
 * the anchor is realpath'd before descending.
 *
 * Output is fully deterministic (name-sorted): re-running the script with
 * an unchanged lockfile reproduces a byte-identical file. Packages without
 * a machine-readable license field are listed as UNKNOWN — triage those by
 * hand, do not guess.
 */
import { mkdirSync, readFileSync, writeFileSync, existsSync, realpathSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('..', import.meta.url));
const outPath = join(root, 'dist', 'THIRD-PARTY-NOTICES.md');

/** Resolve the package.json of `name` from `anchor` (a parent package.json). */
function resolvePackageJson(name, anchorRequire) {
  try {
    return anchorRequire.resolve(`${name}/package.json`);
  } catch {
    // Exports map hides ./package.json: resolve the entry, walk up to the
    // owning package root (pnpm store paths resolve through symlinks to
    // node_modules/.pnpm/<pkg>@<ver>/node_modules/<pkg>/).
    try {
      let dir = dirname(anchorRequire.resolve(name));
      for (;;) {
        const candidate = join(dir, 'package.json');
        if (existsSync(candidate)) return candidate;
        const parent = dirname(dir);
        if (parent === dir) break;
        dir = parent;
      }
    } catch {
      // no resolvable entry either — fall through
    }
    // Last resort: the plain hoisted location (npm layout).
    const fallback = join(root, 'node_modules', name, 'package.json');
    return existsSync(fallback) ? fallback : null;
  }
}

/** License field: string, { type }, or legacy `licenses` array. */
function extractLicense(manifest) {
  const { license, licenses } = manifest;
  if (typeof license === 'string') return license;
  if (license && typeof license === 'object' && typeof license.type === 'string') {
    return license.type;
  }
  if (Array.isArray(licenses)) {
    const parts = licenses
      .map((item) => (typeof item === 'string' ? item : item && item.type))
      .filter((item) => typeof item === 'string');
    if (parts.length > 0) return parts.join(' OR ');
  }
  return 'UNKNOWN';
}

/** Repository field (string shorthand, object with url, git+/git@ forms). */
function extractRepository(manifest) {
  const repo = manifest.repository;
  let url = null;
  if (typeof repo === 'string') url = repo;
  else if (repo && typeof repo === 'object' && typeof repo.url === 'string') url = repo.url;
  if (!url) return null;
  url = url
    .replace(/^git\+/, '')
    .replace(/^git@github\.com:/, 'https://github.com/')
    .replace(/^git:\/\//, 'https://')
    .replace(/\.git$/, '');
  // Shorthands: "github:user/repo" or plain "user/repo".
  const shorthand = url.match(/^(?:github:)?([A-Za-z0-9._-]+)\/([A-Za-z0-9._-]+)$/);
  if (shorthand) url = `https://github.com/${shorthand[1]}/${shorthand[2]}`;
  return /^https:\/\//.test(url) ? url : null;
}

const own = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8'));
const packages = new Map();

function collect(name, anchorRequire, direct) {
  if (packages.has(name)) return;
  const path = resolvePackageJson(name, anchorRequire);
  if (!path) {
    packages.set(name, { name, version: 'UNKNOWN', license: 'UNKNOWN', repository: null, direct });
    console.warn(`[generate-licenses] not installed, cannot inspect: ${name}`);
    return;
  }
  const manifest = JSON.parse(readFileSync(path, 'utf8'));
  packages.set(name, {
    name,
    version: typeof manifest.version === 'string' ? manifest.version : 'UNKNOWN',
    license: extractLicense(manifest),
    repository: extractRepository(manifest),
    homepage: typeof manifest.homepage === 'string' ? manifest.homepage : null,
    direct,
  });
  // Anchor transitive lookups at this package's own manifest — realpath'd, so
  // pnpm's symlinked layout resolves to the .pnpm store directory where the
  // package's dependencies live as siblings (the node_modules symlink path
  // only sees root-level packages).
  let anchorPath = path;
  try {
    anchorPath = realpathSync(path);
  } catch {
    // keep the unresolved path
  }
  const childRequire = createRequire(anchorPath);
  for (const dep of Object.keys(manifest.dependencies ?? {})) collect(dep, childRequire, false);
}

const rootRequire = createRequire(join(root, 'package.json'));
for (const name of Object.keys(own.dependencies ?? {})) collect(name, rootRequire, true);

const sorted = [...packages.values()].sort((a, b) => a.name.localeCompare(b.name));

// License roll-up for the summary statement.
const byLicense = new Map();
for (const pkg of sorted) {
  byLicense.set(pkg.license, (byLicense.get(pkg.license) ?? 0) + 1);
}
const licenseLines = [...byLicense.entries()]
  .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
  .map(([license, count]) => `- ${license}: ${count} package${count === 1 ? '' : 's'}`);

function repoCell(pkg) {
  const label = pkg.repository ? pkg.repository.replace(/^https?:\/\//, '') : pkg.homepage;
  const href = pkg.repository ?? pkg.homepage;
  return href ? `[${label}](${href})` : '—';
}

const lines = [
  '# Third-Party Notices',
  '',
  `This file was generated by \`scripts/generate-licenses.mjs\` from the runtime`,
  `\`dependencies\` of ${own.name} and their transitive runtime dependency`,
  'closures. Do not edit it by hand — regenerate with `node scripts/generate-licenses.mjs`.',
  '',
  `${own.name} is distributed under the ${own.license} license. It incorporates`,
  'and redistributes the third-party packages listed below; each entry names the',
  "package's license as declared in its package manifest and links to its source",
  'repository, where the full license text can be found. Recipients of this',
  'distribution remain responsible for complying with each package\u2019s license',
  'terms. Packages marked UNKNOWN declare no machine-readable license field and',
  'must be verified manually before redistribution.',
  '',
  '## License summary',
  '',
  ...licenseLines,
  '',
  '## Packages',
  '',
  '| Package | Version | License | Repository |',
  '| --- | --- | --- | --- |',
  ...sorted.map((pkg) => `| \`${pkg.name}\` | ${pkg.version} | ${pkg.license} | ${repoCell(pkg)} |`),
  '',
];

mkdirSync(dirname(outPath), { recursive: true });
writeFileSync(outPath, `${lines.join('\n')}\n`, 'utf8');

const unknown = byLicense.get('UNKNOWN') ?? 0;
console.log(
  `[generate-licenses] wrote dist/THIRD-PARTY-NOTICES.md — ${sorted.length} packages ` +
    `(${sorted.length - unknown} licensed, ${unknown} UNKNOWN)`,
);
