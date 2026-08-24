import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import DropdownMenu from './DropdownMenu';
import DropdownMenuTrigger from './DropdownMenuTrigger';
import DropdownMenuContent from './DropdownMenuContent';
import DropdownMenuItem from './DropdownMenuItem';
import DropdownMenuSeparator from './DropdownMenuSeparator';

function renderMenu(props?: { itemDisabled?: boolean }) {
  render(
    <DropdownMenu>
      <DropdownMenuTrigger>Open</DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem>Alpha</DropdownMenuItem>
        <DropdownMenuItem disabled={props?.itemDisabled}>Beta</DropdownMenuItem>
        <DropdownMenuItem>Gamma</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>,
  );
  return screen.getByRole('button', { name: 'Open' });
}

function menuItems() {
  return screen.getAllByRole('menuitem');
}

describe('DropdownMenu', () => {
  it('renders trigger', () => {
    render(
      <DropdownMenu>
        <DropdownMenuTrigger>Open</DropdownMenuTrigger>
      </DropdownMenu>,
    );
    expect(screen.getByText('Open')).toBeInTheDocument();
  });

  it('shows content when trigger clicked', async () => {
    const user = userEvent.setup();
    render(
      <DropdownMenu>
        <DropdownMenuTrigger>Open</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem>Item 1</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>,
    );
    await user.click(screen.getByText('Open'));
    expect(screen.getByText('Item 1')).toBeInTheDocument();
  });

  it('hides content when item clicked', async () => {
    const user = userEvent.setup();
    render(
      <DropdownMenu>
        <DropdownMenuTrigger>Open</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem>Item 1</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>,
    );
    await user.click(screen.getByText('Open'));
    await user.click(screen.getByText('Item 1'));
    expect(screen.queryByText('Item 1')).not.toBeInTheDocument();
  });

  it('calls item onClick', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(
      <DropdownMenu>
        <DropdownMenuTrigger>Open</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem onClick={onClick}>Item 1</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>,
    );
    await user.click(screen.getByText('Open'));
    await user.click(screen.getByText('Item 1'));
    expect(onClick).toHaveBeenCalled();
  });

  it('renders separator', () => {
    const { container } = render(
      <DropdownMenu open>
        <DropdownMenuContent>
          <DropdownMenuItem>Item 1</DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem>Item 2</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>,
    );
    expect(container.querySelector('[role="separator"]')).toBeInTheDocument();
  });

  it('applies className to content', () => {
    render(
      <DropdownMenu open>
        <DropdownMenuContent className="custom">
          <DropdownMenuItem>Item</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>,
    );
    expect(screen.getByText('Item').parentElement).toHaveClass('custom');
  });

  it('does not call onClick when item is disabled', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(
      <DropdownMenu open>
        <DropdownMenuContent>
          <DropdownMenuItem onClick={onClick} disabled>Item</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>,
    );
    await user.click(screen.getByText('Item'));
    expect(onClick).not.toHaveBeenCalled();
  });

  it('exposes menu semantics and trigger aria wiring when open', async () => {
    const user = userEvent.setup();
    const trigger = renderMenu();
    expect(trigger).toHaveAttribute('aria-haspopup', 'menu');
    expect(trigger).toHaveAttribute('aria-expanded', 'false');

    await user.click(trigger);
    expect(trigger).toHaveAttribute('aria-expanded', 'true');
    const menu = screen.getByRole('menu');
    expect(trigger).toHaveAttribute('aria-controls', menu.id);
    expect(menuItems()).toHaveLength(3);
    expect(menuItems()[0]).toHaveAttribute('role', 'menuitem');
  });

  it('opens with ArrowDown and focuses the first item', async () => {
    const user = userEvent.setup();
    const trigger = renderMenu();
    trigger.focus();
    await user.keyboard('{ArrowDown}');
    expect(screen.getByRole('menu')).toBeInTheDocument();
    expect(menuItems()[0]).toHaveFocus();
  });

  it('opens with ArrowUp and focuses the last item', async () => {
    const user = userEvent.setup();
    const trigger = renderMenu();
    trigger.focus();
    await user.keyboard('{ArrowUp}');
    expect(menuItems()[2]).toHaveFocus();
  });

  it('moves focus with ArrowDown/ArrowUp, wrapping and skipping disabled items', async () => {
    const user = userEvent.setup();
    const trigger = renderMenu({ itemDisabled: true });
    trigger.focus();
    await user.keyboard('{ArrowDown}');
    // Beta is disabled: ArrowDown from Alpha skips straight to Gamma
    await user.keyboard('{ArrowDown}');
    expect(menuItems()[2]).toHaveFocus();
    // wrap past the end back to Alpha
    await user.keyboard('{ArrowDown}');
    expect(menuItems()[0]).toHaveFocus();
    // wrap past the start (over disabled Beta) back to Gamma
    await user.keyboard('{ArrowUp}');
    expect(menuItems()[2]).toHaveFocus();
  });

  it('jumps to first/last item with Home/End', async () => {
    const user = userEvent.setup();
    const trigger = renderMenu();
    trigger.focus();
    await user.keyboard('{ArrowDown}');
    await user.keyboard('{End}');
    expect(menuItems()[2]).toHaveFocus();
    await user.keyboard('{Home}');
    expect(menuItems()[0]).toHaveFocus();
  });

  it('closes on Escape and returns focus to the trigger', async () => {
    const user = userEvent.setup();
    const trigger = renderMenu();
    trigger.focus();
    await user.keyboard('{ArrowDown}');
    expect(menuItems()[0]).toHaveFocus();
    await user.keyboard('{Escape}');
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
    expect(trigger).toHaveFocus();
  });

  it('closes on Tab without losing focus to body', async () => {
    const user = userEvent.setup();
    const trigger = renderMenu();
    trigger.focus();
    await user.keyboard('{ArrowDown}');
    await user.keyboard('{Tab}');
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
    expect(trigger).toHaveFocus();
  });

  it('moves focus by typeahead on first character', async () => {
    const user = userEvent.setup();
    const trigger = renderMenu();
    trigger.focus();
    await user.keyboard('{ArrowDown}');
    await user.keyboard('g');
    expect(menuItems()[2]).toHaveFocus();
    // characters typed within the window accumulate: 'ga' matches
    // nothing, so focus stays put
    await user.keyboard('a');
    expect(menuItems()[2]).toHaveFocus();
  });

  it('returns focus to the trigger after selecting an item with the keyboard', async () => {
    const user = userEvent.setup();
    const trigger = renderMenu();
    trigger.focus();
    await user.keyboard('{ArrowDown}');
    await user.keyboard('{Enter}');
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
    expect(trigger).toHaveFocus();
  });

  it('keeps exactly one tab stop among items (roving tabindex)', async () => {
    const user = userEvent.setup();
    const trigger = renderMenu();
    trigger.focus();
    await user.keyboard('{ArrowDown}');
    await user.keyboard('{ArrowDown}');
    const tabbables = menuItems().filter((el) => el.tabIndex === 0);
    expect(tabbables).toHaveLength(1);
    expect(tabbables[0]).toBe(menuItems()[1]);
  });

  it('has no axe violations while open', async () => {
    const { axe } = await import('jest-axe');
    const user = userEvent.setup();
    const trigger = renderMenu();
    await user.click(trigger);
    // 'region' fires for any content outside a landmark — an artifact of
    // the bare test document, not the component.
    const results = await axe(document.body, {
      rules: { region: { enabled: false } },
    });
    expect(results.violations).toEqual([]);
  });
});
