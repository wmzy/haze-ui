import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import ContextMenu from './ContextMenu';
import ContextMenuTrigger from './ContextMenuTrigger';
import ContextMenuContent from './ContextMenuContent';
import ContextMenuItem from './ContextMenuItem';
import ContextMenuSeparator from './ContextMenuSeparator';

describe('ContextMenu', () => {
  it('throws when trigger is used outside ContextMenu', () => {
    // silence React's error-boundary noise about the render throw
    const spy = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    expect(() =>
      render(<ContextMenuTrigger>host</ContextMenuTrigger>)
    ).toThrow('ContextMenu components must be used within <ContextMenu>');
    spy.mockRestore();
  });

  it('renders children', () => {
    render(
      <ContextMenu>
        <ContextMenuTrigger>
          <div>Right click me</div>
        </ContextMenuTrigger>
      </ContextMenu>,
    );
    expect(screen.getByText('Right click me')).toBeInTheDocument();
  });

  it('shows content on right click', () => {
    render(
      <ContextMenu>
        <ContextMenuTrigger>
          <div>Target</div>
        </ContextMenuTrigger>
        <ContextMenuContent>
          <ContextMenuItem>Copy</ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>,
    );
    fireEvent.contextMenu(screen.getByText('Target'));
    expect(screen.getByText('Copy')).toBeInTheDocument();
  });

  it('hides content when item clicked', async () => {
    const user = userEvent.setup();
    render(
      <ContextMenu>
        <ContextMenuTrigger>
          <div>Target</div>
        </ContextMenuTrigger>
        <ContextMenuContent>
          <ContextMenuItem>Copy</ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>,
    );
    fireEvent.contextMenu(screen.getByText('Target'));
    await user.click(screen.getByText('Copy'));
    // Animated exit: the panel unmounts once the fade-out settles —
    // immediate in jsdom (no CSS durations), but across the double rAF
    // of whenExitSettles, hence waitFor.
    await waitFor(() =>
      expect(screen.queryByText('Copy')).not.toBeInTheDocument()
    );
  });

  it('calls item onClick', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(
      <ContextMenu>
        <ContextMenuTrigger>
          <div>Target</div>
        </ContextMenuTrigger>
        <ContextMenuContent>
          <ContextMenuItem onClick={onClick}>Copy</ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>,
    );
    fireEvent.contextMenu(screen.getByText('Target'));
    await user.click(screen.getByText('Copy'));
    expect(onClick).toHaveBeenCalled();
  });

  it('renders separator', () => {
    render(
      <ContextMenu open>
        <ContextMenuContent>
          <ContextMenuItem>Item</ContextMenuItem>
          <ContextMenuSeparator />
          <ContextMenuItem>Other</ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>,
    );
    expect(document.querySelector('[role="separator"]')).toBeInTheDocument();
  });

  it('does not call onClick when disabled', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(
      <ContextMenu open>
        <ContextMenuContent>
          <ContextMenuItem onClick={onClick} disabled>Item</ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>,
    );
    await user.click(screen.getByText('Item'));
    expect(onClick).not.toHaveBeenCalled();
  });

  it('exposes menu semantics when open', () => {
    render(
      <ContextMenu open>
        <ContextMenuContent>
          <ContextMenuItem>Copy</ContextMenuItem>
          <ContextMenuItem>Paste</ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>,
    );
    expect(screen.getByRole('menu')).toBeInTheDocument();
    expect(screen.getAllByRole('menuitem')).toHaveLength(2);
  });

  it('moves focus with ArrowDown through items', () => {
    render(
      <ContextMenu open>
        <ContextMenuContent>
          <ContextMenuItem>Copy</ContextMenuItem>
          <ContextMenuItem>Paste</ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>,
    );
    // Opening auto-focuses the first item (useFocusScope).
    expect(screen.getByText('Copy')).toHaveFocus();
    fireEvent.keyDown(screen.getByText('Copy'), { key: 'ArrowDown' });
    expect(screen.getByText('Paste')).toHaveFocus();
  });

  it('closes on Escape', async () => {
    render(
      <ContextMenu open>
        <ContextMenuContent>
          <ContextMenuItem>Copy</ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>,
    );
    fireEvent.keyDown(screen.getByRole('menu'), { key: 'Escape' });
    // Same animated-exit handover as the item-click close.
    await waitFor(() =>
      expect(screen.queryByRole('menu')).not.toBeInTheDocument()
    );
  });

  it('focuses the first item when opened', () => {
    render(
      <ContextMenu>
        <ContextMenuTrigger>
          <div>Target</div>
        </ContextMenuTrigger>
        <ContextMenuContent>
          <ContextMenuItem>Copy</ContextMenuItem>
          <ContextMenuItem>Paste</ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>,
    );
    fireEvent.contextMenu(screen.getByText('Target'));
    expect(screen.getByText('Copy')).toHaveFocus();
  });

  it('returns focus to the right-click target on Escape', () => {
    render(
      <ContextMenu>
        <ContextMenuTrigger>
          <div tabIndex={0}>Target</div>
        </ContextMenuTrigger>
        <ContextMenuContent>
          <ContextMenuItem>Copy</ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>,
    );
    // Focused right-click target: the scope's return-focus destination.
    const target = screen.getByText('Target');
    target.focus();
    fireEvent.contextMenu(target);
    expect(screen.getByText('Copy')).toHaveFocus();
    fireEvent.keyDown(screen.getByText('Copy'), { key: 'Escape' });
    expect(target).toHaveFocus();
  });

  it('mirrors the animated lifecycle as data-state on the panel', async () => {
    render(
      <ContextMenu>
        <ContextMenuTrigger>
          <div>Target</div>
        </ContextMenuTrigger>
        <ContextMenuContent>
          <ContextMenuItem>Copy</ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>,
    );
    fireEvent.contextMenu(screen.getByText('Target'));
    expect(screen.getByRole('menu')).toHaveAttribute('data-state', 'open');
    fireEvent.keyDown(screen.getByRole('menu'), { key: 'Escape' });
    // 'closed' lands immediately (it drives the fade-out); the unmount
    // is what waits for the exit to settle.
    expect(screen.getByRole('menu')).toHaveAttribute('data-state', 'closed');
    await waitFor(() =>
      expect(screen.queryByRole('menu')).not.toBeInTheDocument()
    );
  });

  it('renders nothing before the first open', () => {
    render(
      <ContextMenu>
        <ContextMenuTrigger>
          <div>Target</div>
        </ContextMenuTrigger>
        <ContextMenuContent>
          <ContextMenuItem>Copy</ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>,
    );
    // `exited` starts true for a never-opened animated panel.
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
  });

  it('has no axe violations', async () => {
    const { axe } = await import('jest-axe');
    render(
      <ContextMenu>
        <ContextMenuTrigger>
          <div>Target</div>
        </ContextMenuTrigger>
        <ContextMenuContent>
          <ContextMenuItem>Copy</ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>,
    );
    const results = await axe(document.body, {
      rules: { region: { enabled: false } },
    });
    expect(results.violations).toEqual([]);
  });

  it('has no axe violations when open', async () => {
    const { axe } = await import('jest-axe');
    render(
      <ContextMenu>
        <ContextMenuTrigger>
          <div>Target</div>
        </ContextMenuTrigger>
        <ContextMenuContent>
          <ContextMenuItem>Copy</ContextMenuItem>
          <ContextMenuSeparator />
          <ContextMenuItem disabled>Paste</ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>,
    );
    fireEvent.contextMenu(screen.getByText('Target'));
    const results = await axe(document.body, {
      rules: { region: { enabled: false } },
    });
    expect(results.violations).toEqual([]);
  });
});
