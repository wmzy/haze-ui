import type { MouseEventHandler } from 'react';

import { css } from '@linaria/core';
import { Link } from '@native-router/react';

import { versionInfo } from '@/views/version-info';

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

type VersionBadgeProps = {
  /** 移动端 Drawer 内点击徽标后收起抽屉（与品牌链接同款接线）。 */
  onClick?: MouseEventHandler<HTMLAnchorElement>;
};

/**
 * 文档站品牌旁的当前版本徽标：muted chip，链接到 Changelog。归档约定见
 * Changelog 页——Deploy Docs 工作流把每个发布版本的文档以只读快照
 * 存放在 /haze-ui/v/{version}/（构建时按版本 base 重建，资源自洽）。
 */
export default function VersionBadge({ onClick }: VersionBadgeProps) {
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
