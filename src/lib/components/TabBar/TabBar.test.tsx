import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { TabBar, TabBarItem } from './index';

const icon = (testId: string) => <svg data-testid={testId} viewBox="0 0 16 16" />;

/** handlers are module-level so each test can assert call isolation. */
const handlers = {
  home: vi.fn(),
  homeReselect: vi.fn(),
  search: vi.fn(),
  saved: vi.fn(),
  profile: vi.fn(),
};

function BarFixture() {
  return (
    <TabBar aria-label="Primary">
      <TabBarItem
        icon={icon('icon-home')}
        label="Home"
        active
        badge="3"
        onSelect={handlers.home}
        onReselect={handlers.homeReselect}
      />
      <TabBarItem
        icon={icon('icon-search')}
        label="Search"
        onSelect={handlers.search}
      />
      <TabBarItem
        icon={icon('icon-saved')}
        label="Saved"
        onSelect={handlers.saved}
      />
      <TabBarItem
        icon={icon('icon-profile')}
        label="Profile"
        onSelect={handlers.profile}
      />
    </TabBar>
  );
}

function barRoot() {
  return screen.getByRole('navigation', { name: 'Primary' });
}

function item(name: string) {
  return screen.getByRole('button', { name });
}

describe('TabBar', () => {
  it('renders a navigation landmark named by the consumer aria-label', () => {
    render(<BarFixture />);
    const nav = barRoot();
    expect(nav).toHaveAttribute('data-slot', 'tab-bar');
    expect(item('Home')).toBeInTheDocument();
  });

  it('renders items as type=button with an icon-over-label structure', () => {
    render(<BarFixture />);
    const home = item('Home');
    expect(home).toHaveAttribute('type', 'button');
    expect(home).toHaveAttribute('data-slot', 'tab-bar-item');

    // The icon slot is hidden from the name computation; the visible label
    // supplies the accessible name (proven by the role queries above).
    const iconSlot = screen.getByTestId('icon-home').parentElement;
    expect(iconSlot).toHaveAttribute('data-slot', 'tab-bar-item-icon');
    expect(iconSlot).toHaveAttribute('aria-hidden', 'true');

    const label = within(home).getByText('Home');
    expect(label).toHaveAttribute('data-slot', 'tab-bar-item-label');
  });

  it('marks the active item with aria-current and a top indicator', () => {
    render(<BarFixture />);
    const home = item('Home');
    const search = item('Search');

    expect(home).toHaveAttribute('aria-current', 'true');
    expect(
      home.querySelector('[data-slot="tab-bar-item-indicator"]'),
    ).toBeInTheDocument();

    expect(search).not.toHaveAttribute('aria-current');
    expect(
      search.querySelector('[data-slot="tab-bar-item-indicator"]'),
    ).not.toBeInTheDocument();
  });

  it('calls onSelect when a non-active item is clicked', async () => {
    const user = userEvent.setup();
    render(<BarFixture />);
    await user.click(item('Search'));
    expect(handlers.search).toHaveBeenCalledTimes(1);
    expect(handlers.home).not.toHaveBeenCalled();
    expect(handlers.homeReselect).not.toHaveBeenCalled();
  });

  it('calls onReselect — not onSelect — when the active item is clicked', async () => {
    const user = userEvent.setup();
    render(<BarFixture />);
    await user.click(item('Home'));
    expect(handlers.homeReselect).toHaveBeenCalledTimes(1);
    expect(handlers.home).not.toHaveBeenCalled();
  });

  it('composes a native onClick with the select handlers', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(
      <TabBar aria-label="Primary">
        <TabBarItem
          icon={icon('icon-x')}
          label="X"
          onClick={onClick}
          onSelect={handlers.search}
        />
      </TabBar>,
    );
    await user.click(item('X'));
    expect(onClick).toHaveBeenCalledTimes(1);
    expect(handlers.search).toHaveBeenCalledTimes(1);
  });

  it('renders the badge through the Badge component overlay', () => {
    render(<BarFixture />);
    const home = item('Home');
    const badgeText = within(home).getByText('3');
    expect(badgeText.closest('[data-slot="badge"]')).toBeInTheDocument();
    expect(badgeText.closest('[data-slot="tab-bar-item-badge"]')).toBeInTheDocument();

    const search = item('Search');
    expect(
      search.querySelector('[data-slot="tab-bar-item-badge"]'),
    ).not.toBeInTheDocument();
  });

  it('activates items with Tab and Enter', async () => {
    const user = userEvent.setup();
    render(<BarFixture />);
    await user.tab();
    expect(item('Home')).toHaveFocus();
    // Enter on the active item fires the reselect branch via keyboard too.
    await user.keyboard('{Enter}');
    expect(handlers.homeReselect).toHaveBeenCalledTimes(1);
    expect(handlers.home).not.toHaveBeenCalled();

    await user.tab();
    expect(item('Search')).toHaveFocus();
    await user.keyboard('{Enter}');
    expect(handlers.search).toHaveBeenCalledTimes(1);
  });

  it('carries the horizontal-scroll track class', () => {
    render(<BarFixture />);
    // jsdom cannot compute Linaria CSS (css: false) — the observable
    // contract is that the track element wears the `bar` class, the one
    // declaring overflow-x: auto for the crowded/too-many-items case.
    expect(barRoot()).toHaveClass('haze-TabBar__bar');
  });

  it('forwards native props to the nav and items', async () => {
    const user = userEvent.setup();
    const { rerender } = render(
      <TabBar aria-label="Primary" id="bar" data-testid="bar-nav">
        <TabBarItem icon={icon('icon-a')} label="A" className="custom-item" />
      </TabBar>,
    );
    expect(barRoot()).toHaveAttribute('id', 'bar');
    expect(barRoot()).toHaveAttribute('data-testid', 'bar-nav');
    expect(item('A')).toHaveClass('custom-item');

    rerender(
      <TabBar aria-label="Primary">
        <TabBarItem
          icon={icon('icon-b')}
          label="B"
          disabled
          onSelect={handlers.profile}
        />
      </TabBar>,
    );
    const disabled = item('B');
    expect(disabled).toBeDisabled();
    await user.click(disabled);
    expect(handlers.profile).not.toHaveBeenCalled();
  });

  it('has no axe violations', async () => {
    const { axe } = await import('jest-axe');
    render(<BarFixture />);
    const results = await axe(document.body, {
      rules: { region: { enabled: false } },
    });
    expect(results.violations).toEqual([]);
  });
});
