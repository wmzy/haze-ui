import { expect } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useControl } from 'react-use-control';

import LocaleProvider from '../LocaleProvider/LocaleProvider';

import NotificationCenter, {
  type NotificationCenterItem,
} from './NotificationCenter';

const feed: NotificationCenterItem[] = [
  {
    key: 'a',
    title: 'Deploy finished',
    description: 'haze-ui-site deployed to production',
    timestamp: '2m ago',
    severity: 'success',
    kind: 'task',
  },
  {
    key: 'b',
    title: 'Agent needs approval',
    description: 'Refactor agent requests access to src/lib',
    timestamp: '10m ago',
    severity: 'warning',
    kind: 'agent',
  },
  {
    key: 'c',
    title: 'Maintenance window',
    timestamp: '1h ago',
    severity: 'info',
    kind: 'system',
    read: true,
  },
];

/** The open panel element (role=dialog), reachable whether toggled or
 *  rendered open from the start. */
const panel = () => screen.getByRole('dialog', { name: 'Notifications' });

/** A notification row (the focusable `li`) by its title text. */
const row = (title: string) =>
  screen.getByText(title).closest('li')!;

describe('NotificationCenter', () => {
  it('names the trigger with the unread count', () => {
    render(<NotificationCenter items={feed} />);
    expect(
      screen.getByRole('button', { name: 'Notifications (2 unread)' })
    ).toBeInTheDocument();
  });

  it('omits the count and badge when everything is read', () => {
    render(
      <NotificationCenter items={feed.map((item) => ({ ...item, read: true }))} />
    );
    const trigger = screen.getByRole('button', { name: 'Notifications' });
    expect(trigger).toBeInTheDocument();
    expect(trigger.querySelector("[data-slot='badge']")).toBeNull();
  });

  it('caps the badge count', () => {
    const many: NotificationCenterItem[] = Array.from(
      { length: 120 },
      (_, index) => ({ key: String(index), title: `Event ${index}` })
    );
    render(<NotificationCenter items={many} />);
    expect(screen.getByText('99+')).toBeInTheDocument();
  });

  it('toggles the panel on trigger clicks', async () => {
    const user = userEvent.setup();
    render(<NotificationCenter items={feed} />);
    const trigger = screen.getByRole('button', {
      name: 'Notifications (2 unread)',
    });
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
    await user.click(trigger);
    expect(trigger).toHaveAttribute('aria-expanded', 'true');
    expect(
      screen.getByRole('dialog', { name: 'Notifications' })
    ).toBeInTheDocument();
    await user.click(trigger);
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
  });

  it('links the trigger to the panel through aria-controls', () => {
    render(<NotificationCenter items={feed} />);
    const id = screen
      .getByRole('button', { name: 'Notifications (2 unread)' })
      .getAttribute('aria-controls');
    expect(id).toBeTruthy();
    expect(document.getElementById(id!)).toBeInTheDocument();
  });

  it('works controlled through a control object', () => {
    function Harness() {
      const [open, , openCtrl] = useControl(undefined, false);
      return (
        <>
          <NotificationCenter items={feed} open={openCtrl} />
          <output data-testid='open'>{String(open)}</output>
        </>
      );
    }
    render(<Harness />);
    const trigger = screen.getByRole('button', {
      name: 'Notifications (2 unread)',
    });
    // trigger writes flow through the control
    fireEvent.click(trigger);
    expect(screen.getByTestId('open')).toHaveTextContent('true');
    // external control writes drive the panel
    fireEvent.click(trigger); // close again via control
    expect(screen.getByTestId('open')).toHaveTextContent('false');
  });

  it('renders items with severity, kind, title, description and timestamp', () => {
    render(<NotificationCenter items={feed} open />);
    const first = screen.getByText('Deploy finished').closest('li');
    expect(first).toHaveAttribute('data-severity', 'success');
    expect(first).toHaveAttribute('data-kind', 'task');
    expect(
      screen.getByText('haze-ui-site deployed to production')
    ).toBeInTheDocument();
    expect(screen.getByText('2m ago')).toBeInTheDocument();
    expect(screen.getByText('Maintenance window').closest('li')).toHaveAttribute(
      'data-kind',
      'system'
    );
  });

  it('marks unread rows with an announced dot, read rows without', () => {
    render(<NotificationCenter items={feed} open />);
    const dots = screen
      .getAllByRole('img', { name: 'Unread' })
      .map((dot) => dot.closest('li'));
    expect(dots).toHaveLength(2);
    expect(dots[0]).toBe(screen.getByText('Deploy finished').closest('li'));
    expect(dots[1]).toBe(
      screen.getByText('Agent needs approval').closest('li')
    );
    expect(
      screen.getByText('Maintenance window').closest('li')?.querySelector("[data-slot='unread-dot']")
    ).toBeNull();
  });

  it('fires onMarkAllRead and disables it without unread items', async () => {
    const user = userEvent.setup();
    const onMarkAllRead = vi.fn();
    const { rerender } = render(
      <NotificationCenter items={feed} open onMarkAllRead={onMarkAllRead} />
    );
    const button = screen.getByRole('button', { name: 'Mark all as read' });
    await user.click(button);
    expect(onMarkAllRead).toHaveBeenCalledOnce();

    rerender(
      <NotificationCenter
        items={feed.map((item) => ({ ...item, read: true }))}
        open
        onMarkAllRead={onMarkAllRead}
      />
    );
    expect(screen.getByRole('button', { name: 'Mark all as read' })).toBeDisabled();
  });

  it('fires onClearAll and disables it when the feed is empty', async () => {
    const user = userEvent.setup();
    const onClearAll = vi.fn();
    const { rerender } = render(
      <NotificationCenter items={feed} open onClearAll={onClearAll} />
    );
    await user.click(screen.getByRole('button', { name: 'Clear all' }));
    expect(onClearAll).toHaveBeenCalledOnce();

    rerender(<NotificationCenter items={[]} open onClearAll={onClearAll} />);
    expect(screen.getByRole('button', { name: 'Clear all' })).toBeDisabled();
  });

  it('shows the empty state when there are no items', () => {
    render(<NotificationCenter items={[]} open />);
    expect(screen.getByText('No notifications')).toBeInTheDocument();
    expect(screen.queryByRole('list')).toBeNull();
  });

  it('moves focus with arrows through rows and footer actions, wrapping', () => {
    render(<NotificationCenter items={feed} open />);
    // the open panel auto-focuses its first row (focus scope)
    expect(row('Deploy finished')).toHaveFocus();
    fireEvent.keyDown(row('Deploy finished'), { key: 'ArrowDown' });
    expect(row('Agent needs approval')).toHaveFocus();
    fireEvent.keyDown(row('Agent needs approval'), {
      key: 'ArrowDown',
    });
    expect(row('Maintenance window')).toHaveFocus();
    // rows first, then the footer actions — End jumps to the last one
    fireEvent.keyDown(row('Maintenance window'), { key: 'End' });
    expect(screen.getByRole('button', { name: 'Clear all' })).toHaveFocus();
    // wrapping returns to the first row
    fireEvent.keyDown(screen.getByRole('button', { name: 'Clear all' }), {
      key: 'ArrowDown',
    });
    expect(row('Deploy finished')).toHaveFocus();
    fireEvent.keyDown(row('Deploy finished'), { key: 'Home' });
    expect(row('Deploy finished')).toHaveFocus();
  });

  it('runs typeahead against row titles', () => {
    render(<NotificationCenter items={feed} open />);
    fireEvent.keyDown(row('Deploy finished'), { key: 'm' });
    expect(row('Maintenance window')).toHaveFocus();
  });

  it('closes on Escape and returns focus to the trigger', async () => {
    const user = userEvent.setup();
    render(<NotificationCenter items={feed} />);
    const trigger = screen.getByRole('button', {
      name: 'Notifications (2 unread)',
    });
    await user.click(trigger);
    expect(row('Deploy finished')).toHaveFocus();
    fireEvent.keyDown(row('Deploy finished'), { key: 'Escape' });
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
    expect(trigger).toHaveFocus();
  });

  it('closes on Tab, following the menu keyboard contract', () => {
    render(<NotificationCenter items={feed} />);
    const trigger = screen.getByRole('button', {
      name: 'Notifications (2 unread)',
    });
    fireEvent.click(trigger);
    fireEvent.keyDown(row('Deploy finished'), { key: 'Tab' });
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
  });

  it('closes on outside pointerdown in the fallback path', () => {
    render(<NotificationCenter items={feed} />);
    const trigger = screen.getByRole('button', {
      name: 'Notifications (2 unread)',
    });
    fireEvent.click(trigger);
    expect(trigger).toHaveAttribute('aria-expanded', 'true');
    fireEvent.pointerDown(document.body);
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
  });

  it('applies every classNames slot', () => {
    render(
      <NotificationCenter
        items={feed}
        open
        classNames={{
          root: 'x-root',
          trigger: 'x-trigger',
          badge: 'x-badge',
          panel: 'x-panel',
          header: 'x-header',
          title: 'x-title',
          list: 'x-list',
          item: 'x-item',
          itemIcon: 'x-item-icon',
          itemBody: 'x-item-body',
          itemTitle: 'x-item-title',
          itemDescription: 'x-item-desc',
          itemTimestamp: 'x-item-ts',
          unreadDot: 'x-dot',
          actions: 'x-actions',
          markAllRead: 'x-mar',
          clearAll: 'x-ca',
        }}
      />
    );
    const root = screen.getByText('Deploy finished').closest(
      "[data-slot='notification-center']"
    );
    expect(root).toHaveClass('x-root');
    expect(
      screen.getByRole('button', { name: 'Notifications (2 unread)' })
    ).toHaveClass('x-trigger');
    expect(
      document.querySelector("[data-slot='badge']")
    ).toHaveClass('x-badge');
    expect(panel()).toHaveClass('x-panel');
    expect(
      panel().querySelector("[data-slot='header']")
    ).toHaveClass('x-header');
    expect(panel().querySelector('h2')).toHaveClass('x-title');
    expect(panel().querySelector('ul')).toHaveClass('x-list');
    expect(screen.getByText('Deploy finished').closest('li')).toHaveClass(
      'x-item'
    );
    expect(
      panel().querySelector("[data-slot='item-icon']")
    ).toHaveClass('x-item-icon');
    expect(
      panel().querySelector("[data-slot='item-body']")
    ).toHaveClass('x-item-body');
    expect(screen.getByText('Deploy finished')).toHaveClass('x-item-title');
    expect(
      screen.getByText('haze-ui-site deployed to production')
    ).toHaveClass('x-item-desc');
    expect(screen.getByText('2m ago')).toHaveClass('x-item-ts');
    expect(
      screen.getAllByRole('img', { name: 'Unread' })[0]
    ).toHaveClass('x-dot');
    expect(
      panel().querySelector("[data-slot='actions']")
    ).toHaveClass('x-actions');
    expect(screen.getByRole('button', { name: 'Mark all as read' })).toHaveClass(
      'x-mar'
    );
    expect(screen.getByRole('button', { name: 'Clear all' })).toHaveClass('x-ca');
  });

  it('applies the empty-state classNames slot', () => {
    render(
      <NotificationCenter items={[]} open classNames={{ empty: 'x-empty' }} />
    );
    expect(screen.getByText('No notifications')).toHaveClass('x-empty');
  });

  it('applies className to the panel (Menu/Popover precedent)', () => {
    render(<NotificationCenter items={feed} open className='custom' />);
    expect(panel()).toHaveClass('custom');
  });

  it('forwards the rest of the native props onto the root span', () => {
    render(
      <NotificationCenter
        items={feed}
        data-testid='nc-root'
        title='notifications'
      />
    );
    const root = screen.getByTestId('nc-root');
    expect(root).toHaveAttribute('title', 'notifications');
    expect(root.tagName).toBe('SPAN');
  });

  it('serves copy through LocaleProvider strings overrides', () => {
    render(
      <LocaleProvider
        strings={{
          notificationCenter: { markAllRead: 'Alles gelesen' },
        }}
      >
        <NotificationCenter items={feed} open />
      </LocaleProvider>
    );
    expect(
      screen.getByRole('button', { name: 'Alles gelesen' })
    ).toBeInTheDocument();
  });

  it('has no axe violations', async () => {
    const { axe } = await import('jest-axe');
    const { unmount } = render(<NotificationCenter items={feed} />);
    const closed = await axe(document.body, {
      rules: { region: { enabled: false } },
    });
    expect(closed.violations).toEqual([]);
    unmount();

    render(<NotificationCenter items={feed} open />);
    const opened = await axe(document.body, {
      rules: { region: { enabled: false } },
    });
    expect(opened.violations).toEqual([]);
  });

  it('has no axe violations in the empty state', async () => {
    const { axe } = await import('jest-axe');
    render(<NotificationCenter items={[]} open />);
    const results = await axe(document.body, {
      rules: { region: { enabled: false } },
    });
    expect(results.violations).toEqual([]);
  });
});
