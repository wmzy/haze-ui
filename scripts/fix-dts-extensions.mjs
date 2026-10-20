/*
 * 产出的 .d.ts 相对导入补 .js 扩展名（arethetypeswrong --profile esm-only
 * 门禁项：node16-ESM 类型解析拒绝无扩展名相对导入，bundler 宽容所以本地
 * vite/webpack 消费者从未暴露）。tsc 的 rewriteRelativeImportExtensions
 * 只重写源码里显式带 .ts/.tsx 扩展的导入，本仓库源码是 bundler 风格的
 * 无扩展名导入，故在 tsc + tsc-alias 之后做一次确定性文本重写：
 *
 *   from './FormItem'  →  from './FormItem.js'
 *
 * 只补确实解析到兄弟 .d.ts 的说明符（specifier + '.d.ts' 存在），带扩展名
 * 的（.js/.json/.css）与包名导入一律不动。幂等：重跑不会再改已补过的。
 */

import { existsSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const typesDir = join(
  dirname(fileURLToPath(import.meta.url)),
  '..',
  'dist',
  'types'
);

if (!existsSync(typesDir)) {
  console.error(`fix-dts-extensions: ${typesDir} 不存在——先跑完整 build`);
  process.exit(1);
}

const files = [];
(function walk(dir) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) walk(full);
    else if (entry.name.endsWith('.d.ts')) files.push(full);
  }
})(typesDir);

// from '<spec>' 与 import('<spec>') 两种载体；保留原引号字符。
const SPECIFIER = /(\bfrom\s*|\bimport\(\s*)(['"])(\.\.?\/[^'"]+)\2/g;
const SKIP = /\.(?:[cm]?[jt]sx?|json|css)$/;

// node16-ESM 无目录解析：目录导入必须显式落到 /index.js。
// 命中形态二选一：兄弟文件（./x → x.d.ts）或目录索引（./x → x/index.d.ts）。
function resolveTarget(file, specifier) {
  const base = join(dirname(file), specifier);
  if (existsSync(`${base}.d.ts`)) return `${specifier}.js`;
  if (existsSync(join(base, 'index.d.ts'))) return `${specifier}/index.js`;
  return null;
}

let rewrittenCount = 0;
let touchedFiles = 0;

for (const file of files) {
  const source = readFileSync(file, 'utf8');
  let changed = false;
  const output = source.replace(
    SPECIFIER,
    (match, carrier, quote, specifier) => {
      if (SKIP.test(specifier)) return match;
      const target = resolveTarget(file, specifier);
      if (!target) return match;
      changed = true;
      rewrittenCount += 1;
      return `${carrier}${quote}${target}${quote}`;
    }
  );
  if (changed) {
    writeFileSync(file, output);
    touchedFiles += 1;
  }
}

console.log(
  `fix-dts-extensions: ${rewrittenCount} 个相对导入补 .js（${touchedFiles}/${files.length} 个 .d.ts 文件）`
);
