import { css } from '@linaria/core';

import { useSiteLocale } from '@/views/i18n';
import { stableDocsUrl } from '@/views/version-info';

/* dev 通道横幅：页头最顶部的 primary-subtle 提示条。 */
const banner = css`
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-wrap: wrap;
  gap: var(--haze-space-1);
  padding: var(--haze-space-2) var(--haze-space-4);
  border-bottom: 1px solid var(--haze-color-border);
  background: var(--haze-color-primary-subtle);
  color: var(--haze-color-text);
  font-family: var(--haze-font-sans);
  font-size: var(--haze-text-sm);
`;

const stableLink = css`
  color: var(--haze-color-primary);
  font-weight: var(--haze-weight-medium);
  text-decoration: underline;
  text-underline-offset: 2px;

  &:hover {
    color: var(--haze-color-primary-hover);
  }
`;

/**
 * dev 通道文档站的顶部提示横幅：一句话说明正在查看开发分支（未发布）
 * 文档，并给出通往稳定版文档的链接。stable 构建下由 Layout 条件渲染
 * （不挂载、不占高度）。
 */
export default function DevDocsBanner() {
  const { t } = useSiteLocale();
  return (
    <div className={banner} role='note'>
      {t.chrome.devDocsBanner}{' '}
      <a className={stableLink} href={stableDocsUrl}>
        {t.chrome.devDocsBannerStableLink}
      </a>
    </div>
  );
}
