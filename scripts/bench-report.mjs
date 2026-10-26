#!/usr/bin/env node
// Transform `vitest bench --reporter=json` output into github-action-benchmark
// entries (`tool: customSmallerIsBetter`), so benchmark-action/github-action-benchmark@v1
// can chart the trend and alert on regressions.
//
// Usage: node scripts/bench-report.mjs [input.json] [output.json]
//   input  — vitest bench JSON (default: bench.json)
//   output — github-action-benchmark JSON (default: bench-report.json)
//
// Zero runtime dependencies (node:fs only). Input schema (vitest bench JSON
// reporter): testResults[].assertionResults[].benchmarks[].tasks[] where each
// task carries `latency` (ms/op) and `throughput` (ops/s) stat objects with
// mean/moe/rme/samplesCount. Each task becomes two entries — latency (ms) and
// throughput (ops/s) — named distinctly so they chart as separate series.
// NOTE on alerting: under customSmallerIsBetter a latency rise is a regression
// (correct), while a throughput rise is an improvement that may trigger a
// false alert comment; fail-on-alert stays false for exactly that reason.

import { readFileSync, writeFileSync } from 'node:fs';

const UNITS = /** @type {const} */ ({ latency: 'ms', throughput: 'ops/s' });
const DECIMALS = { latency: 6, throughput: 2 };

/** Extract component + scenario identity from a vitest bench entry. */
function toIdentity(benchName, taskName) {
  // benchName: "Select benchmarks > toggles the floating panel open and closed"
  const [suiteName = '', ...rest] = benchName.split('>').map((part) => part.trim());
  const component = suiteName.replace(/\s+benchmarks?$/, '') || suiteName;
  const scenario = rest.join(' > ');
  // Component + full scenario path keeps series unique even if two suites
  // reuse a task name (github-action-benchmark keys history by `name`).
  return [component, ...rest.filter(Boolean), taskName].filter(Boolean).join(' · ');
}

function toEntry(identity, kind, stats) {
  const value = Number(stats.mean.toFixed(DECIMALS[kind]));
  if (!Number.isFinite(value)) {
    throw new Error(`${identity} (${kind}): mean is not a finite number`);
  }
  return {
    name: `${identity} · ${kind}`,
    unit: UNITS[kind],
    value,
    extra: `±${Number(stats.moe.toFixed(DECIMALS[kind]))} ${UNITS[kind]} (rme ${stats.rme.toFixed(2)}%, n=${stats.samplesCount})`,
  };
}

function transform(report) {
  const entries = [];
  for (const file of report.testResults ?? []) {
    for (const assertion of file.assertionResults ?? []) {
      for (const bench of assertion.benchmarks ?? []) {
        for (const task of bench.tasks ?? []) {
          const identity = toIdentity(bench.name ?? '', task.name ?? '');
          for (const kind of /** @type {('latency' | 'throughput')[]} */ (Object.keys(UNITS))) {
            const stats = task[kind];
            if (!stats || typeof stats.mean !== 'number') continue;
            entries.push(toEntry(identity, kind, stats));
          }
        }
      }
    }
  }
  return entries;
}

/** github-action-benchmark customSmallerIsBetter schema check. */
function validate(entries) {
  if (entries.length === 0) {
    throw new Error('no benchmark entries found — did vitest bench change its JSON schema?');
  }
  for (const entry of entries) {
    if (!entry.name || typeof entry.name !== 'string') throw new Error(`bad name: ${JSON.stringify(entry)}`);
    if (!(entry.unit in { ms: 1, 'ops/s': 1 }) || typeof entry.unit !== 'string') {
      throw new Error(`bad unit on ${entry.name}: ${entry.unit}`);
    }
    if (typeof entry.value !== 'number' || !Number.isFinite(entry.value)) {
      throw new Error(`bad value on ${entry.name}: ${entry.value}`);
    }
  }
}

const [inputPath = 'bench.json', outputPath = 'bench-report.json'] = process.argv.slice(2);
const report = JSON.parse(readFileSync(inputPath, 'utf8'));
const entries = transform(report);
validate(entries);
writeFileSync(outputPath, `${JSON.stringify(entries, null, 2)}\n`);
console.log(`bench-report: ${entries.length} entries written to ${outputPath}`);
for (const entry of entries) {
  console.log(`  ${entry.name} = ${entry.value} ${entry.unit} ${entry.extra}`);
}
