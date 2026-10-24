import versionJson from '@/generated/version.json';

/**
 * 文档通道：src/generated/version.json 的 channel 字段由
 * scripts/write-version.mjs 在 demo 构建前写入。
 * - stable：release tag 构建，发布到 gh-pages 根（/haze-ui/）；
 * - dev：main 分支构建，发布到 gh-pages /dev/ 子树（/haze-ui/dev/）。
 */
export type DocsChannel = 'stable' | 'dev';

/**
 * src/generated/version.json 由 scripts/write-version.mjs 在 demo 构建前
 * 从 git 写入（无 git 时为 dev 占位）。字段可能为 null，展示侧必须兜底。
 */
export type VersionInfo = {
  version: string;
  gitTag: string | null;
  commit: string | null;
  buildDate: string | null;
  channel: DocsChannel;
};

const raw = versionJson as Omit<VersionInfo, 'channel'> & {
  channel?: DocsChannel;
};

/** 旧产物缺 channel 时按 version 占位推导（'dev' → dev，其余 → stable）。 */
export const versionInfo: VersionInfo = {
  ...raw,
  channel: raw.channel ?? (raw.version === 'dev' ? 'dev' : 'stable'),
};

/** 当前站点是否为 dev 通道（驱动页头「dev」徽章与横幅）。 */
export const isDevDocs = versionInfo.channel === 'dev';

const REPO = 'wmzy/haze-ui';

/** GitHub Releases：stable 徽章链到当前 tag 的 release 页，无 tag 退到列表页。 */
export const releasesUrl = versionInfo.gitTag
  ? `https://github.com/${REPO}/releases/tag/${versionInfo.gitTag}`
  : `https://github.com/${REPO}/releases`;

/** 「查看源码」链接：有 tag 指向 tag 的 tree，降级时指向 main。 */
export const sourceUrl = `https://github.com/${REPO}/tree/${
  versionInfo.gitTag ?? 'main'
}`;

/**
 * 稳定通道站点根：dev 构建 base 为 '/haze-ui/dev/'，去掉尾部 'dev/'
 * 即得稳定版文档根；非 dev 构建下与 BASE_URL 相同（横幅不渲染）。
 */
export const stableDocsUrl = import.meta.env.BASE_URL.replace(/dev\/$/, '');

export const shortCommit = versionInfo.commit
  ? versionInfo.commit.slice(0, 7)
  : null;
