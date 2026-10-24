import { render, screen } from '@testing-library/react';

import DevDocsBanner from './DevDocsBanner';

/*
 * Banner 文案由 i18n 词典提供（en 源 + 各语言覆盖，见
 * src/views/i18n）；这里 mock useSiteLocale 固定词典片段，只测渲染
 * 接线：句子 + 通往稳定版文档的链接。vitest 下 BASE_URL 为 '/'，故
 * stableDocsUrl 亦为 '/'（dev 构建时才会带 /haze-ui/dev/ 前缀）。
 */
vi.mock('@/views/i18n', () => ({
  useSiteLocale: () => ({
    locale: 'en',
    setLocale: vi.fn(),
    t: {
      chrome: {
        devDocsBanner: 'MOCK_DEV_BANNER',
        devDocsBannerStableLink: 'MOCK_STABLE_LINK',
      },
    },
  }),
}));

describe('DevDocsBanner', () => {
  it('renders the dev-docs notice with a link to the stable docs', () => {
    render(<DevDocsBanner />);
    expect(screen.getByText('MOCK_DEV_BANNER')).toBeInTheDocument();
    const link = screen.getByRole('link', { name: 'MOCK_STABLE_LINK' });
    expect(link).toHaveAttribute('href', '/');
  });

  it('is exposed to assistive tech as a note', () => {
    render(<DevDocsBanner />);
    expect(screen.getByRole('note')).toBeInTheDocument();
  });

  it('has no axe violations', async () => {
    const { container } = render(<DevDocsBanner />);
    const { axe } = await import('jest-axe');
    const results = await axe(container);
    expect(results.violations).toEqual([]);
  });
});
