import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { copyFileSync, mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import jscodeshift from 'jscodeshift';

import transform from '../transforms/variant-to-color.mjs';

const j = jscodeshift.withParser('tsx');
const here = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(here, '../../..');
const fixtureDir = join(here, 'fixtures', 'variant-to-color');
const input = readFileSync(join(fixtureDir, 'input.tsx'), 'utf8');
const expected = readFileSync(join(fixtureDir, 'expected-output.tsx'), 'utf8');

function run(source, options = {}) {
  const reports = [];
  const out = transform(
    { path: 'input.tsx', source },
    { j, jscodeshift: j, stats() {}, report: (msg) => reports.push(msg) },
    options,
  );
  return { out, reports };
}

test('fixture: transform output matches expected-output.tsx exactly', () => {
  const { out, reports } = run(input);
  assert.equal(out, expected);
  // two advisory reports: opaque Meter thresholds + Tag variant/color conflict
  assert.equal(reports.length, 2);
  assert.match(reports[0], /Meter thresholds is not an inline literal/);
  assert.match(reports[1], /Tag: both variant and color are set/);
});

test('renames variant to color on Alert, Badge, Banner, Tag', () => {
  const { out } = run('<Tag variant="primary">x</Tag>');
  assert.equal(out, '<Tag color="primary">x</Tag>');
});

test('renames tone to color on Sparkline but keeps its own variant', () => {
  const { out } = run("<Sparkline data={[1]} variant='area' tone='danger' />");
  assert.equal(out, "<Sparkline data={[1]} variant='area' color='danger' />");
});

test('resolves member-expression element names (Haze.Tag)', () => {
  const { out } = run('<Haze.Tag variant="success">x</Haze.Tag>');
  assert.equal(out, '<Haze.Tag color="success">x</Haze.Tag>');
});

test('keeps prop order and non-string values', () => {
  const { out } = run('<Badge size="sm" variant={kind} closable />');
  assert.equal(out, '<Badge size="sm" color={kind} closable />');
});

test('leaves variant on unrelated components (Button) untouched', () => {
  const { out } = run('<Button variant="outline">go</Button>');
  assert.equal(out, undefined);
});

test('renames tone keys inside inline Meter thresholds literals', () => {
  const { out } = run(
    "<Meter value={3} thresholds={[{ at: 60, tone: 'warning' }, { at: 85, tone: 'danger' }]} />",
  );
  assert.equal(
    out,
    "<Meter value={3} thresholds={[{ at: 60, color: 'warning' }, { at: 85, color: 'danger' }]} />",
  );
});

test('reports Meter thresholds passed as an opaque expression', () => {
  const { out, reports } = run('<Meter value={3} thresholds={THRESHOLDS} />');
  assert.equal(out, undefined);
  assert.equal(reports.length, 1);
  assert.match(reports[0], /Meter thresholds is not an inline literal/);
});

test('skips and reports when both old and new prop are present', () => {
  const { out, reports } = run('<Tag variant="success" color="primary">x</Tag>');
  assert.equal(out, undefined);
  assert.equal(reports.length, 1);
  assert.match(reports[0], /both variant and color are set/);
});

test('returns undefined for sources with nothing to rename', () => {
  assert.equal(run('const x = 1;').out, undefined);
  assert.equal(run('<Tag color="primary">x</Tag>').out, undefined);
});

test('runner CLI: pnpm codemod equivalent applies the transform to a file', () => {
  const tmp = mkdtempSync(join(tmpdir(), 'haze-codemod-'));
  const target = join(tmp, 'input.tsx');
  try {
    copyFileSync(join(fixtureDir, 'input.tsx'), target);
    const result = spawnSync(
      process.execPath,
      [join(repoRoot, 'scripts/codemods/run.mjs'), 'variant-to-color', target, '--run-in-band'],
      { cwd: repoRoot, encoding: 'utf8' },
    );
    assert.equal(result.status, 0, `runner failed:\n${result.stderr}`);
    assert.equal(readFileSync(target, 'utf8'), expected);
  } finally {
    rmSync(tmp, { recursive: true, force: true });
  }
});

test('runner CLI: rejects unknown transform names', () => {
  const result = spawnSync(
    process.execPath,
    [join(repoRoot, 'scripts/codemods/run.mjs'), 'does-not-exist', repoRoot],
    { cwd: repoRoot, encoding: 'utf8' },
  );
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /Unknown transform "does-not-exist"/);
  assert.match(result.stderr, /variant-to-color/);
});
