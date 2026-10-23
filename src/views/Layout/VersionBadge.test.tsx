import type { Route } from '@native-router/react';

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { MemoryRouter, View } from '@native-router/react';

import { versionInfo } from '@/views/version-info';

import VersionBadge from './VersionBadge';

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

describe('VersionBadge', () => {
  it('renders the current docs version as a link to the changelog', () => {
    renderBadge();
    const link = screen.getByRole('link', { name: versionInfo.version });
    expect(link).toHaveAttribute('href', '/changelog');
    expect(link).toHaveTextContent(versionInfo.version);
  });

  it('explains the /v/{version}/ snapshot convention in its title', () => {
    renderBadge();
    expect(screen.getByRole('link')).toHaveAttribute(
      'title',
      expect.stringContaining('/v/{version}/')
    );
  });

  it('navigates to the changelog on click', async () => {
    const user = userEvent.setup();
    renderBadge();
    await user.click(screen.getByRole('link', { name: versionInfo.version }));
    expect(await screen.findByText('changelog-view')).toBeInTheDocument();
  });

  it('supports the drawer close handler without blocking navigation', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    renderBadge(onClick);
    await user.click(screen.getByRole('link', { name: versionInfo.version }));
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
