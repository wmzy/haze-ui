import type { Route } from '@native-router/react';

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { MemoryRouter, View } from '@native-router/react';

import VersionBadge from './VersionBadge';

/*
 * 通道行为（stable 版本号 → Releases / dev 徽章 → Changelog）由
 * version-info 的 isDevDocs/channel 驱动；这里 mock 该模块以固定通道，
 * 避免 git 状态影响断言。getter 保证每个用例读到当次的 channel。
 */
const channelState: { channel: 'stable' | 'dev' } = { channel: 'stable' };

vi.mock('@/views/version-info', async (importOriginal) => {
  const actual =
    await importOriginal<typeof import('@/views/version-info')>();
  return {
    ...actual,
    get versionInfo() {
      return {
        ...actual.versionInfo,
        version: 'v9.9.9',
        gitTag: 'v9.9.9',
        channel: channelState.channel,
      };
    },
    get isDevDocs() {
      return channelState.channel === 'dev';
    },
    get releasesUrl() {
      return 'https://github.com/wmzy/haze-ui/releases/tag/v9.9.9';
    },
  };
});

const routes = [
  {
    path: '/',
    component: () => Promise.resolve({ default: () => <div>home-view</div> }),
  },
  {
    path: '/changelog',
    component: () =>
      Promise.resolve({ default: () => <div>changelog-view</div> }),
  },
] as Route[];

function renderBadge(onClick?: () => void) {
  return render(
    <MemoryRouter routes={routes} initialEntries={['/']}>
      <VersionBadge onClick={onClick} />
      <View />
    </MemoryRouter>
  );
}

describe('VersionBadge (stable channel)', () => {
  beforeEach(() => {
    channelState.channel = 'stable';
  });

  it('renders the version as an external link to the tag release page', () => {
    renderBadge();
    const link = screen.getByRole('link', { name: 'v9.9.9' });
    expect(link).toHaveAttribute(
      'href',
      'https://github.com/wmzy/haze-ui/releases/tag/v9.9.9'
    );
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveTextContent('v9.9.9');
  });

  it('explains the /v/{version}/ snapshot convention in its title', () => {
    renderBadge();
    expect(screen.getByRole('link')).toHaveAttribute(
      'title',
      expect.stringContaining('/v/{version}/')
    );
  });

  it('has no axe violations', async () => {
    const { container } = renderBadge();
    const { axe } = await import('jest-axe');
    const results = await axe(container);
    expect(results.violations).toEqual([]);
  });
});

describe('VersionBadge (dev channel)', () => {
  beforeEach(() => {
    channelState.channel = 'dev';
  });

  it('renders a dev chip linking to the changelog', () => {
    renderBadge();
    const link = screen.getByRole('link', { name: 'dev' });
    expect(link).toHaveAttribute('href', '/changelog');
    expect(link).toHaveTextContent('dev');
    expect(link).toHaveAttribute(
      'title',
      expect.stringContaining('Development build')
    );
  });

  it('navigates to the changelog on click', async () => {
    const user = userEvent.setup();
    renderBadge();
    await user.click(screen.getByRole('link', { name: 'dev' }));
    expect(await screen.findByText('changelog-view')).toBeInTheDocument();
  });

  it('supports the drawer close handler without blocking navigation', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    renderBadge(onClick);
    await user.click(screen.getByRole('link', { name: 'dev' }));
    expect(onClick).toHaveBeenCalledTimes(1);
    expect(await screen.findByText('changelog-view')).toBeInTheDocument();
  });

  it('has no axe violations', async () => {
    const { container } = renderBadge();
    const { axe } = await import('jest-axe');
    const results = await axe(container);
    expect(results.violations).toEqual([]);
  });
});
