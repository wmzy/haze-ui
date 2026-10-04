import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { ActivityRail, ActivityRailItem } from './index';

const icon = (testId: string) => <svg data-testid={testId} viewBox="0 0 16 16" />;

/** handlers are module-level so each test can assert call isolation. */
const handlers = {
  explorer: vi.fn(),
  search: vi.fn(),
  settings: vi.fn(),
  account: vi.fn(),
};

function RailFixture() {
  return (
    <ActivityRail aria-label="Primary">
      <ActivityRailItem
        icon={icon('icon-explorer')}
        label="Explorer"
        active
        badge="3"
        onSelect={handlers.explorer}
      />
      <ActivityRailItem
        icon={icon('icon-search')}
        label="Search"
        onSelect={handlers.search}
      />
      <ActivityRailItem
        icon={icon('icon-settings')}
        label="Settings"
        onSelect={handlers.settings}
      />
      <ActivityRailItem
        icon={icon('icon-account')}
        label="Account"
        slot="end"
        onSelect={handlers.account}
      />
    </ActivityRail>
  );
}

function railRoot() {
  return screen.getByRole('navigation', { name: 'Primary' });
}

function item(name: string) {
  return screen.getByRole('button', { name });
}

describe('ActivityRail', () => {
  it('renders a navigation landmark named by the consumer aria-label', () => {
    render(<RailFixture />);
    const nav = railRoot();
    expect(nav).toHaveAttribute('data-slot', 'activity-rail');
    expect(item('Explorer')).toBeInTheDocument();
  });

  it('renders items as type=button icon buttons with hidden icon slots', () => {
    render(<RailFixture />);
    for (const name of ['Explorer', 'Search', 'Settings', 'Account']) {
      expect(item(name)).toHaveAttribute('type', 'button');
    }
    const iconSlot = screen.getByTestId('icon-explorer').parentElement;
    expect(iconSlot).toHaveAttribute('data-slot', 'activity-rail-item-icon');
    expect(iconSlot).toHaveAttribute('aria-hidden', 'true');
  });

  it('marks the active item with aria-current and a rail-side indicator', () => {
    render(<RailFixture />);
    const explorer = item('Explorer');
    const search = item('Search');

    expect(explorer).toHaveAttribute('aria-current', 'true');
    expect(
      explorer.querySelector('[data-slot="activity-rail-item-indicator"]'),
    ).toBeInTheDocument();

    expect(search).not.toHaveAttribute('aria-current');
    expect(
      search.querySelector('[data-slot="activity-rail-item-indicator"]'),
    ).not.toBeInTheDocument();
  });

  it('calls onSelect when an item is clicked', async () => {
    const user = userEvent.setup();
    render(<RailFixture />);
    await user.click(item('Search'));
    expect(handlers.search).toHaveBeenCalledTimes(1);
    expect(handlers.explorer).not.toHaveBeenCalled();
  });

  it('composes a native onClick with onSelect', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(
      <ActivityRail aria-label="Primary">
        <ActivityRailItem
          icon={icon('icon-x')}
          label="X"
          onClick={onClick}
          onSelect={handlers.search}
        />
      </ActivityRail>,
    );
    await user.click(item('X'));
    expect(onClick).toHaveBeenCalledTimes(1);
    expect(handlers.search).toHaveBeenCalledTimes(1);
  });

  it('renders the badge through the Badge component overlay', () => {
    render(<RailFixture />);
    const explorer = item('Explorer');
    const badgeText = within(explorer).getByText('3');
    expect(badgeText.closest('[data-slot="badge"]')).toBeInTheDocument();
    expect(badgeText.closest('[data-slot="activity-rail-item-badge"]')).toBeInTheDocument();

    const search = item('Search');
    expect(
      search.querySelector('[data-slot="activity-rail-item-badge"]'),
    ).not.toBeInTheDocument();
  });

  it('sinks end-slot items into a bottom-aligned group', () => {
    render(<RailFixture />);
    const nav = railRoot();
    const end = nav.querySelector('[data-slot="activity-rail-end"]');
    expect(end).toBeInTheDocument();
    expect(end).toContainElement(item('Account'));
    expect(item('Explorer').closest('[data-slot="activity-rail-end"]')).toBeNull();
    // The group is the track's last block child, after every start item.
    expect(nav.lastElementChild).toBe(end);
  });

  it('activates items with Tab and Enter', async () => {
    const user = userEvent.setup();
    render(<RailFixture />);
    await user.tab();
    expect(item('Explorer')).toHaveFocus();
    await user.tab();
    expect(item('Search')).toHaveFocus();
    await user.keyboard('{Enter}');
    expect(handlers.search).toHaveBeenCalledTimes(1);
  });

  it('wires the hover label through Tooltip', () => {
    render(<RailFixture />);
    const explorer = item('Explorer');
    const trigger = explorer.closest('[data-slot="trigger"]');
    const tooltip = screen.getByRole('tooltip', { name: 'Explorer', hidden: true });
    expect(trigger).toHaveAttribute('aria-describedby', tooltip.id);
  });

  it('shows the label tooltip on hover', async () => {
    render(<RailFixture />);
    const trigger = item('Search').closest('[data-slot="trigger"]');
    const tooltip = screen.getByRole('tooltip', { name: 'Search', hidden: true });
    fireEvent.mouseEnter(trigger!);
    await waitFor(() =>
      expect(tooltip).toHaveAttribute('data-state', 'open'),
    );
  });

  it('forwards native props to the nav and items', async () => {
    const user = userEvent.setup();
    const { rerender } = render(
      <ActivityRail aria-label="Primary" id="rail" data-testid="rail-nav">
        <ActivityRailItem icon={icon('icon-a')} label="A" className="custom-item" />
      </ActivityRail>,
    );
    expect(railRoot()).toHaveAttribute('id', 'rail');
    expect(railRoot()).toHaveAttribute('data-testid', 'rail-nav');
    expect(item('A')).toHaveClass('custom-item');

    rerender(
      <ActivityRail aria-label="Primary">
        <ActivityRailItem
          icon={icon('icon-b')}
          label="B"
          disabled
          onSelect={handlers.account}
        />
      </ActivityRail>,
    );
    const disabled = item('B');
    expect(disabled).toBeDisabled();
    await user.click(disabled);
    expect(handlers.account).not.toHaveBeenCalled();
  });

  it('has no axe violations', async () => {
    const { axe } = await import('jest-axe');
    render(<RailFixture />);
    const results = await axe(document.body, {
      rules: { region: { enabled: false } },
    });
    expect(results.violations).toEqual([]);
  });
});
