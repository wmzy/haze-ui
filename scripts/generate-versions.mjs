/**
 * Demo 构建前运行：产出文档站全局版本切换器（页头 VersionSwitcher）
 * 的数据源 src/generated/versions.json。
 *
 * 三通道部署（.github/workflows/deploy.yml）下文档同时存在于：
 * - stable（release 构建）→ gh-pages 根 /haze-ui/；
 * - dev（main 构建）→ /haze-ui/dev/ 子树；
 * - 历史版本 → /haze-ui/v/{version}/ 只读快照。
 *
 * 清单形态（与 deploy.yml 稳定通道写入站点根 versions.json 的产物同构）：
 * {
 *   "latest": "v1.34.1",
 *   "entries": [
 *     { "version": "v1.34.1", "url": "/haze-ui/" },
 *     { "version": "v1.33.0", "url": "/haze-ui/v/v1.33.0/" },
 *     { "version": "dev",     "url": "/haze-ui/dev/" }
 *   ]
 * }
 * - latest 恒指站点根（每次 stable 发布都会重刷根，无需探测）；
 * - 其余条目仅收录线上确实存在的 /v/{version}/ 快照：GitHub Releases
 *   只说明「发过版」，不保证该版本的文档被归档过（归档机制上线前的
 *   版本、stable 部署未跑的发布都没有快照，线上以 404.html 兜底），
 *   因此逐个 HEAD 探测线上路径，避免切换器提供死链；
 * - dev 通道是固定项，恒在最后。
 *
 * 降级策略（脚本永不非零退出，构建不因它失败）：
 * - Releases API 拉取失败（离线/限流）：若 versions.json 已存在则原样
 *   保留；不存在则用 git tag（退 package.json version）写最小兜底清单；
 * - 单个探测请求失败按「快照不存在」处理（宁缺勿死链）。
 *
 * 幂等：内容未变化时不写文件（versions.json 入库，避免本地 build:demo
 * 弄脏工作区——与 write-version.mjs 同一契约）。
 */
import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const target = resolve(here, '../src/generated/versions.json');
const pkg = JSON.parse(readFileSync(resolve(here, '../package.json'), 'utf8'));

const REPO = 'wmzy/haze-ui';
/** 线上站点：探测快照存在性用完整 origin；清单内 url 为同源绝对路径。 */
const SITE_ORIGIN = 'https://wmzy.github.io';
const SITE_BASE = '/haze-ui/';
/** 最多收录的 release 数：切换器场景足够，同时控制探测请求数。 */
const MAX_RELEASES = 30;
const FETCH_TIMEOUT_MS = 15_000;
const PROBE_TIMEOUT_MS = 10_000;
/** 限流/瞬时故障退避重试（匿名 API 每小时 60 次，CI 里容易撞上）。 */
const API_ATTEMPTS = 3;

const sleep = (ms) => new Promise((done) => setTimeout(done, ms));

/**
 * 带退避的 fetch：网络异常、429、5xx 重试；其余状态（含 404）原样
 * 返回，由调用方按语义处理。最终仍失败则抛出最后一个错误。
 */
async function fetchWithRetry(url, headers) {
  let lastError = new Error(`fetch failed: ${url}`);
  for (let attempt = 1; attempt <= API_ATTEMPTS; attempt += 1) {
    if (attempt > 1) await sleep(attempt * 1000);
    try {
      const res = await fetch(url, {
        headers,
        signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
      });
      if (res.status === 429 || res.status >= 500) {
        lastError = new Error(`HTTP ${res.status} for ${url}`);
        continue;
      }
      return res;
    } catch (error) {
      lastError = error;
    }
  }
  throw lastError;
}

/** GitHub Releases（新→旧）里的版本 tag（v 前缀语义化 tag，去重）。 */
async function fetchReleaseTags() {
  const headers = {
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
    'User-Agent': 'haze-ui-docs',
  };
  const token = process.env.GITHUB_TOKEN ?? process.env.GH_TOKEN;
  if (token) headers.Authorization = `Bearer ${token}`;
  const res = await fetchWithRetry(
    `https://api.github.com/repos/${REPO}/releases?per_page=100`,
    headers
  );
  if (!res.ok) throw new Error(`GitHub Releases API responded ${res.status}`);
  const releases = await res.json();
  const tags = [];
  for (const release of releases) {
    if (release.draft) continue;
    if (!/^v\d+\.\d+\.\d+/.test(release.tag_name)) continue;
    if (!tags.includes(release.tag_name)) tags.push(release.tag_name);
  }
  return tags;
}

/** HEAD 探测线上 /v/{version}/ 快照：Pages 对缺失路径返回 404 状态。 */
async function snapshotExists(tag) {
  try {
    const res = await fetch(`${SITE_ORIGIN}${SITE_BASE}v/${tag}/`, {
      method: 'HEAD',
      signal: AbortSignal.timeout(PROBE_TIMEOUT_MS),
    });
    return res.status === 200;
  } catch {
    return false;
  }
}

/** 兜底 latest：git 最近 tag → package.json version（补 v 前缀）→ 'dev'。 */
function fallbackLatest() {
  try {
    const tag = execFileSync('git', ['describe', '--tags', '--abbrev=0'], {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    }).trim();
    if (tag) return tag;
  } catch {
    // 无 git / 无 tag：退 package.json。
  }
  const version = String(pkg.version ?? '');
  return version && version !== '0.0.0-development'
    ? `v${version.replace(/^v/, '')}`
    : 'dev';
}

/** 离线兜底清单：latest → 根 + dev 固定项（两地址不依赖归档存在）。 */
function fallbackManifest() {
  const latest = fallbackLatest();
  if (latest === 'dev') {
    return { latest, entries: [{ version: 'dev', url: `${SITE_BASE}dev/` }] };
  }
  return {
    latest,
    entries: [
      { version: latest, url: SITE_BASE },
      { version: 'dev', url: `${SITE_BASE}dev/` },
    ],
  };
}

async function buildManifest() {
  const tags = (await fetchReleaseTags()).slice(0, MAX_RELEASES);
  const [latest, ...older] = tags;
  if (latest == null) throw new Error('no versioned releases published');
  const probes = await Promise.all(older.map(snapshotExists));
  const archived = older.filter((_, index) => probes[index]);
  console.log(
    `generate-versions: latest ${latest}, ${archived.length}/${older.length} older releases archived live`
  );
  return {
    latest,
    entries: [
      { version: latest, url: SITE_BASE },
      ...archived.map((tag) => ({ version: tag, url: `${SITE_BASE}v/${tag}/` })),
      { version: 'dev', url: `${SITE_BASE}dev/` },
    ],
  };
}

async function main() {
  let manifest;
  try {
    manifest = await buildManifest();
  } catch (error) {
    const reason = error?.message ?? error;
    if (existsSync(target)) {
      console.warn(
        `generate-versions: releases unavailable (${reason}) — keeping existing src/generated/versions.json`
      );
      return;
    }
    manifest = fallbackManifest();
    console.warn(
      `generate-versions: releases unavailable (${reason}) — wrote fallback manifest (latest ${manifest.latest})`
    );
  }

  const next = `${JSON.stringify(manifest, null, 2)}\n`;
  let current = null;
  try {
    current = readFileSync(target, 'utf8');
  } catch {
    // 首次生成。
  }
  if (current === next) {
    console.log('generate-versions: versions.json up to date');
    return;
  }
  mkdirSync(dirname(target), { recursive: true });
  writeFileSync(target, next);
  console.log('generate-versions: versions.json written');
}

main().catch((error) => {
  // 兜底中的兜底：清单缺失只降级切换器 UI，任何未预期异常都不该让
  // demo 构建失败。
  console.warn(`generate-versions: unexpected failure — ${error?.message ?? error}`);
});
