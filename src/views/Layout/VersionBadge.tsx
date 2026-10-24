import type { MouseEventHandler } from 'react';

import { css } from '@linaria/core';
import { Link } from '@native-router/react';

import { isDevDocs, releasesUrl, versionInfo } from '@/views/version-info';

/* 品牌旁的版本 chip：muted、mono、圆角胶囊，hover 提亮。 */
const badge = css`
  display: inline-flex;
  align-items: center;
  height: var(--haze-space-5);
  padding: 0 var(--haze-space-2);
  border: 1px solid var(--haze-color-border);
  border-radius: var(--haze-radius-full);
  font-family: var(--haze-font-mono);
  font-size: var(--haze-text-xs);
  color: var(--haze-color-text-secondary);
  text-decoration: none;
  white-space: nowrap;
  transition:
    color 0.15s,
    border-color 0.15s;

  &:hover {
    color: var(--haze-color-text);
    border-color: var(--haze-color-border-hover);
  }
`;

/* dev 通道徽章：primary 色调区分「这不是发布版本文档」。 */
const devBadge = css`
  color: var(--haze-color-primary);
  border-color: var(--haze-color-primary-subtle);
  font-weight: var(--haze-weight-medium);

  &:hover {
    color: var(--haze-color-primary-hover);
    border-color: var(--haze-color-primary);
  }
`;

type VersionBadgeProps = {
  /** 移动端 Drawer 内点击徽标后收起抽屉（与品牌链接同款接线）。 */
  onClick?: MouseEventHandler<HTMLAnchorElement>;
};

/**
 * 文档站品牌旁的版本徽标，按部署通道区分：
 * - stable：版本号 chip，链到该 tag 的 GitHub Releases 页（归档约定见
 *   Changelog——Deploy Docs 工作流把每个发布版本的文档以只读快照存放
 *   在 /haze-ui/v/{version}/）；
 * - dev：primary 色「dev」chip，链到站内 Changelog，配合页头横幅提示
 *   正在查看开发分支文档。
 */
export default function VersionBadge({ onClick }: VersionBadgeProps) {
  if (isDevDocs) {
    return (
      <Link
        x-class={[badge, devBadge]}
        to='/changelog'
        onClick={onClick}
        title='Development build — docs for unreleased changes on main. Released docs live under /haze-ui/ and /haze-ui/v/{version}/.'
      >
        dev
      </Link>
    );
  }
  if (versionInfo.gitTag) {
    return (
      <a
        className={badge}
        href={releasesUrl}
        target='_blank'
        rel='noreferrer'
        title='Released docs are archived as read-only snapshots under /v/{version}/ — see Changelog'
      >
        {versionInfo.version}
      </a>
    );
  }
  return (
    <Link
      className={badge}
      to='/changelog'
      onClick={onClick}
      title='Released docs are archived as read-only snapshots under /v/{version}/ — see Changelog'
    >
      {versionInfo.version}
    </Link>
  );
}
