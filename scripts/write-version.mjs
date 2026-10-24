/**
 * Demo 构建前运行：把当前 git 状态写入 src/generated/version.json，
 * 供文档站页头与 Changelog 展示「本文档对应哪个版本」。
 *
 * - channel：stable（release tag 构建，发布到 gh-pages 根）/ dev（main
 *   构建，发布到 /dev/ 子树）——页头徽章与横幅据此区分通道。
 * - 降级：git 不可用（或仓库无 tag）时写 dev 占位，构建不因此失败。
 * - 幂等：version/gitTag/commit/channel 与现有文件一致时保留原
 *   buildDate，重复运行零 diff（version.json 入库，避免本地
 *   build:demo 弄脏工作区）。
 */
import { execFileSync } from 'node:child_process';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const target = resolve(
  dirname(fileURLToPath(import.meta.url)),
  '../src/generated/version.json'
);

/** git 命令失败（无 git / 浅克隆无 tag / 非仓库）一律返回 null。 */
function git(args) {
  try {
    const out = execFileSync('git', args, {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    });
    return out.trim() || null;
  } catch {
    return null;
  }
}

/**
 * 文档通道：stable = release tag 构建（发布到 gh-pages 根），dev = main
 * 分支构建（发布到 gh-pages /dev/ 子树）。来源（按优先级）：
 * 1. HAZE_DOCS_CHANNEL 环境变量（CI 显式指定，传非法值直接报错——
 *    通道拼错却静默部署到错误子树的代价远大于构建失败）；
 * 2. HEAD 恰好落在某个 tag 上 → stable（本地构建的推导兜底）；
 * 3. 其余情况（含 git 不可用）→ dev。
 */
function resolveChannel() {
  const fromEnv = process.env.HAZE_DOCS_CHANNEL;
  if (fromEnv != null) {
    if (fromEnv !== 'stable' && fromEnv !== 'dev') {
      throw new Error(
        `HAZE_DOCS_CHANNEL must be 'stable' or 'dev', got '${fromEnv}'`
      );
    }
    return fromEnv;
  }
  // HEAD 恰好在 tag 上（describe --exact-match 成功）→ stable 发布构建；
  // 否则是分支/工作区构建 → dev。
  return git(['describe', '--tags', '--exact-match', 'HEAD'])
    ? 'stable'
    : 'dev';
}

const gitTag = git(['describe', '--tags', '--abbrev=0']);
const commit = git(['rev-parse', 'HEAD']);
const next = {
  version: gitTag ?? 'dev',
  gitTag,
  commit,
  channel: resolveChannel(),
  buildDate: new Date().toISOString(),
};

let current = null;
try {
  current = JSON.parse(readFileSync(target, 'utf8'));
} catch {
  // 占位文件缺失或损坏，走全量写入。
}

const derivedUnchanged =
  current != null &&
  current.version === next.version &&
  current.gitTag === next.gitTag &&
  current.commit === next.commit &&
  current.channel === next.channel &&
  typeof current.buildDate === 'string';

if (derivedUnchanged) {
  console.log(
    `version.json up to date: ${next.version} (${next.channel}) @ ${commit ?? 'unknown'}`
  );
} else {
  mkdirSync(dirname(target), { recursive: true });
  writeFileSync(target, `${JSON.stringify(next, null, 2)}\n`);
  console.log(
    `version.json written: ${next.version} (${next.channel}) @ ${commit ?? 'unknown'}`
  );
}
