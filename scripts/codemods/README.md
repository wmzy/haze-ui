# Codemods

One-shot AST transforms that mechanically upgrade consumer code across
haze-ui releases. Powered by [jscodeshift](https://github.com/facebook/jscodeshift)
(runner wraps the CLI with this repo's parser defaults: `--parser=tsx`,
`--extensions=tsx,ts`, plus a default `**/node_modules/**` ignore), so the
same command works on plain `.ts`, `.tsx` and JSX.

## Usage

```bash
pnpm codemod <transform> <path>... [jscodeshift flags]

# preview the diff without touching files
pnpm codemod variant-to-color src --dry --print

# apply
pnpm codemod variant-to-color src

# per-file detail (conflicts, skips)
pnpm codemod variant-to-color src -v 2
```

Everything after the paths is forwarded to the jscodeshift CLI
(`node node_modules/jscodeshift/bin/jscodeshift.js --help` lists all flags).
`pnpm codemod` with no arguments lists the installed transforms.

Transforms never guess: when they cannot prove a rename is safe (opaque
expression values, elements that already carry both the old and the new
prop) they skip and print a `REP` line naming the file and the reason —
grep the output for `REP` after a run and resolve those by hand.

## Available transforms

| Transform | Migration | Changelog evidence |
| --- | --- | --- |
| `variant-to-color` | v1.34.0 "unify color prop": `variant` → `color` on Alert/Badge/Banner/Tag, `tone` → `color` on Sparkline, `thresholds[].tone` → `thresholds[].color` on Meter. Values were not remapped — every old value is still valid on the new prop. | `CHANGELOG.md` v1.34.0 Features: "add masked/phone inputs, rebuild ScrollArea, unify color prop ([1c4e323](https://github.com/wmzy/haze-ui/commit/1c4e32358552e1de8b34dc564932280dd6f4134f))" |

Scope of `variant-to-color`: JSX attributes only (not `createElement` calls);
Sparkline's own `variant` (`'line' | 'area'`) and `variant` on other
components (e.g. Button) are unrelated and untouched; Meter `thresholds`
renames only inline object literals — identifiers/member/call expressions
are reported and left alone.

## Writing a new codemod

1. Add `transforms/<name>.mjs` exporting a default jscodeshift transform:

   ```js
   export default function myTransform(file, api) {
     const j = api.jscodeshift;
     const root = j(file.source);
     // ... mutate the AST in place (renames keep node position) ...
     return changed ? root.toSource() : undefined;
   }
   ```

   Return `undefined` (or the unchanged source) when nothing changed so the
   CLI reports the file as skipped/unmodified. Use `api.report(msg)` for
   advisory skips and `api.stats(name, n)` for counters; both surface in the
   CLI summary.

2. Keep migrations table-driven where possible — see the `PROP_RENAMES` /
   `ARRAY_FIELD_RENAMES` maps in `variant-to-color.mjs` (per-component prop
   renames, optional old→new string value maps, and object-key renames
   inside array-ish attributes such as `thresholds`).

3. Add fixtures `__tests__/fixtures/<name>/input.tsx` and
   `expected-output.tsx`, plus `__tests__/<name>.test.mjs`:

   - a fixture test asserting `transform(input) === expected-output`,
   - focused tests for each behavior (order preservation, unrelated
     components, conflicts, opaque values),
   - one CLI test spawning `run.mjs` on a temp copy.

   The suite runs on node:test (vitest's `include` only covers `src/` and
   `mcp/`):

   ```bash
   pnpm test:codemods
   ```

4. Register the transform in the table above with its changelog evidence.

Gotchas learned here: `Collection.find` silently returns nothing when given
an array of types — query one type per `find` call; babel-flavored ASTs
(tsx parser) use `ObjectProperty`, not estree's `Property`, so probe both
one at a time.

## Version policy

Breaking changes in a future **major** release MUST ship with a codemod in
this directory (transform + fixtures + tests + README row), referenced from
the CHANGELOG entry — a mechanical rename without an automated migration is
a release blocker. Fixes/minors may add codemods opportunistically (as this
directory does retroactively for v1.34.0).

Codemods are append-only and stable once released: never edit a transform
that shipped (consumers may have pinned its name in upgrade docs/scripts) —
write a new one instead. Names are lowercase-kebab and describe the
mechanical change (`variant-to-color`, not the release version).
