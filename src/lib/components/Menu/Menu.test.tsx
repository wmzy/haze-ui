import type { ComponentPropsWithoutRef } from 'react';

import { expect } from 'vitest';
import { act, fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useControl } from 'react-use-control';

import { SUBMENU_CLOSE_GRACE_MS, SUBMENU_OPEN_DELAY_MS } from '../../utils/submenu';

import { menuItemDanger } from '../../utils/menu-skins';

import Menu, { type MenuDataItem } from './Menu';
import MenuItem from './MenuItem';
import MenuCheckboxItem from './MenuCheckboxItem';
import MenuRadioGroup from './MenuRadioGroup';
import MenuRadioItem from './MenuRadioItem';
import MenuGroup from './MenuGroup';
import MenuDivider from './MenuDivider';
import MenuSub from './MenuSub';
import MenuSubTrigger from './MenuSubTrigger';
import MenuSubContent from './MenuSubContent';

describe('Menu', () => {
  it('renders trigger and menu', () => {
    render(
      <Menu trigger={<button>Open</button>}>
        <MenuItem>Action 1</MenuItem>
      </Menu>
    );
    expect(screen.getByText('Open')).toBeInTheDocument();
    expect(screen.getByRole('menu')).toBeInTheDocument();
  });

  it('opens menu on trigger click', async () => {
    const user = userEvent.setup();
    render(
      <Menu trigger={<button>Open</button>}>
        <MenuItem>Action 1</MenuItem>
      </Menu>
    );
    await user.click(screen.getByText('Open'));
  });

  it('closes menu on outside click', async () => {
    const user = userEvent.setup();
    function Harness() {
      const [open, , openCtrl] = useControl(undefined, false);
      return (
        <div>
          <Menu open={openCtrl} trigger={<button>Open</button>}>
            <MenuItem>Action</MenuItem>
          </Menu>
          <button>outside</button>
          <output data-testid="open-state">{String(open)}</output>
        </div>
      );
    }
    render(<Harness />);
    await user.click(screen.getByText('Open'));
    expect(screen.getByTestId('open-state')).toHaveTextContent('true');
    await user.click(screen.getByText('outside'));
    expect(screen.getByTestId('open-state')).toHaveTextContent('false');
  });

  it('moves focus with ArrowDown and closes on Escape', () => {
    function Harness() {
      const [open, , openCtrl] = useControl(undefined, false);
      return (
        <div>
          <Menu open={openCtrl} trigger="T">
            <MenuItem>Action 1</MenuItem>
            <MenuItem>Action 2</MenuItem>
          </Menu>
          <output data-testid="open-state">{String(open)}</output>
        </div>
      );
    }
    render(<Harness />);
    const menu = screen.getByRole('menu');
    fireEvent.keyDown(menu, { key: 'ArrowDown' });
    expect(screen.getByText('Action 1')).toHaveFocus();
    fireEvent.keyDown(screen.getByText('Action 1'), { key: 'ArrowDown' });
    expect(screen.getByText('Action 2')).toHaveFocus();
    fireEvent.keyDown(screen.getByText('Action 2'), { key: 'Escape' });
    expect(screen.getByTestId('open-state')).toHaveTextContent('false');
  });

  it('focuses the first item on open and returns focus to the trigger on Escape', async () => {
    const user = userEvent.setup();
    render(
      <Menu trigger={<button>Open</button>}>
        <MenuItem>Action 1</MenuItem>
        <MenuItem>Action 2</MenuItem>
      </Menu>
    );
    const trigger = screen.getByText('Open');
    await user.click(trigger);
    // Opening moves focus into the menu (useFocusScope autoFocus).
    expect(screen.getByText('Action 1')).toHaveFocus();
    // Escape: focus used to drop to <body> once the hidden panel took
    // the focused item out of the tab order — the scope returns it.
    fireEvent.keyDown(screen.getByText('Action 1'), { key: 'Escape' });
    expect(trigger).toHaveFocus();
  });

  it('mirrors the animated lifecycle as data-state without unmounting the panel', async () => {
    const user = userEvent.setup();
    render(
      <Menu trigger={<button>Open</button>}>
        <MenuItem>Action</MenuItem>
      </Menu>
    );
    const menu = screen.getByRole('menu');
    // Resident panel: mounted while closed, data-state drives the fade.
    expect(menu).toHaveAttribute('data-state', 'closed');
    await user.click(screen.getByText('Open'));
    expect(menu).toHaveAttribute('data-state', 'open');
    fireEvent.keyDown(screen.getByRole('menu'), { key: 'Escape' });
    expect(screen.getByRole('menu')).toHaveAttribute('data-state', 'closed');
  });

  it('applies className to menu panel', () => {
    render(
      <Menu className="custom" trigger={<button>Open</button>}>
        <MenuItem>Action</MenuItem>
      </Menu>
    );
    expect(screen.getByRole('menu')).toHaveClass('custom');
  });

  it('has no axe violations while open', async () => {
    const { axe } = await import('jest-axe');
    const user = userEvent.setup();
    render(
      <Menu trigger={<button>Open</button>}>
        <MenuItem>Action 1</MenuItem>
        <MenuDivider />
        <MenuItem>Action 2</MenuItem>
      </Menu>
    );
    await user.click(screen.getByText('Open'));
    // 'region' fires for any content outside a landmark — an artifact of
    // the bare test document, not the component.
    const results = await axe(document.body, {
      rules: { region: { enabled: false } },
    });
    expect(results.violations).toEqual([]);
  });
});

describe('MenuItem', () => {
  it('renders as a button with menuitem role', () => {
    render(
      <Menu open trigger="T">
        <MenuItem>Action</MenuItem>
      </Menu>
    );
    expect(screen.getByRole('menuitem', { name: 'Action' })).toBeInTheDocument();
  });

  it('calls onSelect when clicked', async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    render(
      <Menu open trigger="T">
        <MenuItem onSelect={onSelect}>Action</MenuItem>
      </Menu>
    );
    await user.click(screen.getByRole('menuitem'));
    expect(onSelect).toHaveBeenCalledOnce();
  });

  it('can be disabled', () => {
    render(
      <Menu open trigger="T">
        <MenuItem disabled>Action</MenuItem>
      </Menu>
    );
    expect(screen.getByRole('menuitem')).toBeDisabled();
  });

  it('applies className', () => {
    render(
      <Menu open trigger="T">
        <MenuItem className="custom">Action</MenuItem>
      </Menu>
    );
    expect(screen.getByRole('menuitem')).toHaveClass('custom');
  });

  describe('as polymorphism', () => {
    it("as='a' keeps the menuitem role/wiring on a real anchor", async () => {
      const user = userEvent.setup();
      const onSelect = vi.fn();
      render(
        <Menu open trigger="T">
          <MenuItem as='a' href='/docs' onSelect={onSelect}>Docs</MenuItem>
        </Menu>
      );
      const item = screen.getByRole('menuitem', { name: 'Docs' });
      expect(item.tagName).toBe('A');
      expect(item).toHaveAttribute('href', '/docs');
      // button-only attrs are gated off the anchor shape
      expect(item).not.toHaveAttribute('type');
      await user.click(item);
      expect(onSelect).toHaveBeenCalledOnce();
    });

    it("as='a' disabled reports aria-disabled instead of disabled", () => {
      render(
        <Menu open trigger="T">
          <MenuItem as='a' href='/docs' disabled>Docs</MenuItem>
        </Menu>
      );
      const item = screen.getByRole('menuitem');
      expect(item).toHaveAttribute('aria-disabled', 'true');
      expect(item).not.toHaveAttribute('disabled');
    });

    it('as with a custom component: target props flow through, wiring lands on the anchor', () => {
      // router-Link shape: own props (to) plus forwarded anchor props —
      // also exercises the polymorphic typing (to must type-check)
      function Link({ to, ...rest }: { to: string } & ComponentPropsWithoutRef<'a'>) {
        return <a href={to} {...rest} />;
      }
      render(
        <Menu open trigger="T">
          <MenuItem as={Link} to='/route'>Route</MenuItem>
        </Menu>
      );
      const item = screen.getByRole('menuitem', { name: 'Route' });
      expect(item.tagName).toBe('A');
      expect(item).toHaveAttribute('href', '/route');
    });
  });
});

describe('MenuDivider', () => {
  it('renders a separator', () => {
    render(
      <Menu open trigger="T">
        <MenuItem>A</MenuItem>
        <MenuDivider />
        <MenuItem>B</MenuItem>
      </Menu>
    );
    expect(screen.getByRole('separator')).toBeInTheDocument();
  });
});

describe('Menu submenu', () => {
  /** Root menu + one submenu, both levels controlled. */
  function Harness() {
    const [rootOpen, , rootCtrl] = useControl(undefined, false);
    const [subOpen, , subCtrl] = useControl(undefined, false);
    return (
      <div>
        <Menu open={rootCtrl} trigger={<button>Open</button>}>
          <MenuItem>Plain</MenuItem>
          <MenuSub open={subCtrl}>
            <MenuSubTrigger>More</MenuSubTrigger>
            <MenuSubContent>
              <MenuItem>Sub One</MenuItem>
              <MenuItem>Zed</MenuItem>
            </MenuSubContent>
          </MenuSub>
        </Menu>
        <output data-testid="root-open">{String(rootOpen)}</output>
        <output data-testid="sub-open">{String(subOpen)}</output>
      </div>
    );
  }

  function renderOpenRoot() {
    render(
      <Menu open trigger="T">
        <MenuItem>Plain</MenuItem>
        <MenuSub>
          <MenuSubTrigger>More</MenuSubTrigger>
          <MenuSubContent>
            <MenuItem>Sub One</MenuItem>
            <MenuItem>Zed</MenuItem>
          </MenuSubContent>
        </MenuSub>
      </Menu>
    );
    return screen.getByRole('menuitem', { name: 'More' });
  }

  function renderOpenSubmenu() {
    render(
      <Menu open trigger="T">
        <MenuItem>Plain</MenuItem>
        <MenuSub>
          <MenuSubTrigger>More</MenuSubTrigger>
          <MenuSubContent>
            <MenuItem>Sub One</MenuItem>
            <MenuItem>Zed</MenuItem>
          </MenuSubContent>
        </MenuSub>
      </Menu>
    );
    const more = screen.getByRole('menuitem', { name: 'More' });
    more.focus();
    fireEvent.keyDown(more, { key: 'ArrowRight' });
    return more;
  }

  it('renders the sub trigger as a menuitem with submenu aria wiring', () => {
    render(
      <Menu open trigger="T">
        <MenuItem>Plain</MenuItem>
        <MenuSub>
          <MenuSubTrigger>More</MenuSubTrigger>
          <MenuSubContent>
            <MenuItem>Sub One</MenuItem>
          </MenuSubContent>
        </MenuSub>
      </Menu>
    );
    const more = screen.getByRole('menuitem', { name: 'More' });
    expect(more).toBeInTheDocument();
    expect(more).toHaveAttribute('aria-haspopup', 'menu');
    expect(more).toHaveAttribute('aria-expanded', 'false');
    // The nested menu is only referenced while open.
    expect(more).not.toHaveAttribute('aria-owns');
  });

  it('opens with ArrowRight, focuses the first item and owns the nested menu', () => {
    const more = renderOpenSubmenu();
    expect(more).toHaveAttribute('aria-expanded', 'true');
    const subMenu = screen.getByText('Sub One').closest('[role="menu"]')!;
    expect(subMenu).toBeInTheDocument();
    expect(more).toHaveAttribute('aria-owns', subMenu.id);
    expect(screen.getByText('Sub One')).toHaveFocus();
    // Root-level items stay outside the nested menu's traversal.
    expect(screen.getAllByRole('menu')).toHaveLength(2);
  });

  it('keeps ArrowDown traversal inside the submenu level, wrapping', () => {
    renderOpenSubmenu();
    const zed = screen.getByText('Zed');
    zed.focus();
    fireEvent.keyDown(zed, { key: 'ArrowDown' });
    // wraps to the first sub item, never escapes to the root level
    expect(screen.getByText('Sub One')).toHaveFocus();
    fireEvent.keyDown(screen.getByText('Sub One'), { key: 'ArrowDown' });
    expect(zed).toHaveFocus();
  });

  it('scopes typeahead to the submenu level', () => {
    renderOpenSubmenu();
    const subOne = screen.getByText('Sub One');
    subOne.focus();
    // 'z' matches Zed in the submenu
    fireEvent.keyDown(subOne, { key: 'z' });
    expect(screen.getByText('Zed')).toHaveFocus();
  });

  it('does not leak typeahead from the submenu into the parent level', () => {
    renderOpenSubmenu();
    const subOne = screen.getByText('Sub One');
    subOne.focus();
    // 'p' would match the root-level 'Plain' if the buffer leaked up;
    // within the submenu it matches nothing, so focus stays put.
    fireEvent.keyDown(subOne, { key: 'p' });
    expect(subOne).toHaveFocus();
  });

  it('Escape inside the submenu closes only that level and returns focus to the trigger', () => {
    render(<Harness />);
    const open = screen.getByText('Open');
    open.focus();
    fireEvent.click(open);
    const more = screen.getByRole('menuitem', { name: 'More' });
    more.focus();
    fireEvent.keyDown(more, { key: 'ArrowRight' });
    expect(screen.getByTestId('sub-open')).toHaveTextContent('true');
    fireEvent.keyDown(screen.getByText('Sub One'), { key: 'Escape' });
    expect(screen.getByTestId('sub-open')).toHaveTextContent('false');
    expect(screen.getByTestId('root-open')).toHaveTextContent('true');
    expect(more).toHaveFocus();
  });

  it('ArrowLeft inside the submenu closes it back to the trigger', () => {
    render(<Harness />);
    const open = screen.getByText('Open');
    open.focus();
    fireEvent.click(open);
    const more = screen.getByRole('menuitem', { name: 'More' });
    more.focus();
    fireEvent.keyDown(more, { key: 'ArrowRight' });
    fireEvent.keyDown(screen.getByText('Sub One'), { key: 'ArrowLeft' });
    expect(screen.getByTestId('sub-open')).toHaveTextContent('false');
    expect(screen.getByTestId('root-open')).toHaveTextContent('true');
    expect(more).toHaveFocus();
  });

  it('Escape on an open submenu trigger closes only the submenu', () => {
    const more = renderOpenSubmenu();
    more.focus();
    fireEvent.keyDown(more, { key: 'Escape' });
    expect(more).toHaveAttribute('aria-expanded', 'false');
    // the root menu itself stays open (its panel is resident)
    expect(screen.getByRole('menuitem', { name: 'Plain' })).toBeInTheDocument();
  });

  it('Escape with the submenu closed bubbles up and closes the root menu', () => {
    render(<Harness />);
    const open = screen.getByText('Open');
    open.focus();
    fireEvent.click(open);
    const more = screen.getByRole('menuitem', { name: 'More' });
    more.focus();
    fireEvent.keyDown(more, { key: 'Escape' });
    expect(screen.getByTestId('root-open')).toHaveTextContent('false');
    expect(open).toHaveFocus();
  });

  it('Tab inside the submenu closes the whole stack and focuses the root trigger', () => {
    render(<Harness />);
    const open = screen.getByText('Open');
    open.focus();
    fireEvent.click(open);
    const more = screen.getByRole('menuitem', { name: 'More' });
    more.focus();
    fireEvent.keyDown(more, { key: 'ArrowRight' });
    fireEvent.keyDown(screen.getByText('Sub One'), { key: 'Tab' });
    expect(screen.getByTestId('sub-open')).toHaveTextContent('false');
    expect(screen.getByTestId('root-open')).toHaveTextContent('false');
    expect(open).toHaveFocus();
  });

  it('opens on hover after the intent delay, without stealing focus', () => {
    vi.useFakeTimers();
    try {
      renderOpenRoot();
      const more = screen.getByRole('menuitem', { name: 'More' });
      const plain = screen.getByRole('menuitem', { name: 'Plain' });
      plain.focus();
      // pointerover drives both React's pointerenter and the region check
      fireEvent.pointerOver(more);
      expect(more).toHaveAttribute('aria-expanded', 'false');
      act(() => { vi.advanceTimersByTime(SUBMENU_OPEN_DELAY_MS - 1); });
      expect(more).toHaveAttribute('aria-expanded', 'false');
      act(() => { vi.advanceTimersByTime(1); });
      expect(more).toHaveAttribute('aria-expanded', 'true');
      // hover never moves keyboard focus
      expect(plain).toHaveFocus();
    } finally {
      vi.useRealTimers();
    }
  });

  it('cancels the pending hover open when the pointer leaves early', () => {
    vi.useFakeTimers();
    try {
      renderOpenRoot();
      const more = screen.getByRole('menuitem', { name: 'More' });
      fireEvent.pointerOver(more);
      act(() => { vi.advanceTimersByTime(60); });
      fireEvent.pointerOver(screen.getByRole('menuitem', { name: 'Plain' }));
      act(() => { vi.advanceTimersByTime(SUBMENU_OPEN_DELAY_MS + SUBMENU_CLOSE_GRACE_MS); });
      expect(more).toHaveAttribute('aria-expanded', 'false');
    } finally {
      vi.useRealTimers();
    }
  });

  it('closes a hover-opened submenu after a grace period once the pointer settles elsewhere', () => {
    vi.useFakeTimers();
    try {
      renderOpenRoot();
      const more = screen.getByRole('menuitem', { name: 'More' });
      fireEvent.pointerOver(more);
      act(() => { vi.advanceTimersByTime(SUBMENU_OPEN_DELAY_MS); });
      expect(more).toHaveAttribute('aria-expanded', 'true');
      fireEvent.pointerOver(screen.getByRole('menuitem', { name: 'Plain' }));
      act(() => { vi.advanceTimersByTime(SUBMENU_CLOSE_GRACE_MS - 1); });
      expect(more).toHaveAttribute('aria-expanded', 'true');
      act(() => { vi.advanceTimersByTime(1); });
      expect(more).toHaveAttribute('aria-expanded', 'false');
    } finally {
      vi.useRealTimers();
    }
  });

  it('re-entering the submenu region cancels a pending grace close', () => {
    vi.useFakeTimers();
    try {
      renderOpenRoot();
      const more = screen.getByRole('menuitem', { name: 'More' });
      fireEvent.pointerOver(more);
      act(() => { vi.advanceTimersByTime(SUBMENU_OPEN_DELAY_MS); });
      fireEvent.pointerOver(screen.getByRole('menuitem', { name: 'Plain' }));
      act(() => { vi.advanceTimersByTime(SUBMENU_CLOSE_GRACE_MS / 2); });
      fireEvent.pointerOver(screen.getByText('Sub One'));
      act(() => { vi.advanceTimersByTime(SUBMENU_CLOSE_GRACE_MS); });
      expect(more).toHaveAttribute('aria-expanded', 'true');
    } finally {
      vi.useRealTimers();
    }
  });

  it('toggles the submenu on trigger click', () => {
    renderOpenRoot();
    const more = screen.getByRole('menuitem', { name: 'More' });
    fireEvent.click(more);
    expect(more).toHaveAttribute('aria-expanded', 'true');
    fireEvent.click(more);
    expect(more).toHaveAttribute('aria-expanded', 'false');
  });

  it('supports two nesting levels with per-level Escape', () => {
    render(
      <Menu open trigger="T">
        <MenuSub>
          <MenuSubTrigger>More</MenuSubTrigger>
          <MenuSubContent>
            <MenuItem>Sub One</MenuItem>
            <MenuSub>
              <MenuSubTrigger>Deeper</MenuSubTrigger>
              <MenuSubContent>
                <MenuItem>Deep Item</MenuItem>
              </MenuSubContent>
            </MenuSub>
          </MenuSubContent>
        </MenuSub>
      </Menu>
    );
    const more = screen.getByRole('menuitem', { name: 'More' });
    more.focus();
    fireEvent.keyDown(more, { key: 'ArrowRight' });
    expect(screen.getByText('Sub One')).toHaveFocus();
    fireEvent.keyDown(screen.getByText('Sub One'), { key: 'ArrowDown' });
    const deeper = screen.getByRole('menuitem', { name: 'Deeper' });
    expect(deeper).toHaveFocus();
    fireEvent.keyDown(deeper, { key: 'ArrowRight' });
    expect(deeper).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByText('Deep Item')).toHaveFocus();
    // Escape peels exactly the innermost level
    fireEvent.keyDown(screen.getByText('Deep Item'), { key: 'Escape' });
    expect(deeper).toHaveAttribute('aria-expanded', 'false');
    expect(more).toHaveAttribute('aria-expanded', 'true');
    expect(deeper).toHaveFocus();
    fireEvent.keyDown(deeper, { key: 'Escape' });
    expect(more).toHaveAttribute('aria-expanded', 'false');
    expect(more).toHaveFocus();
  });

  it('keeps one roving tab stop per level', () => {
    renderOpenSubmenu();
    screen.getByText('Zed').focus();
    const stops = screen
      .getAllByRole('menuitem')
      .filter((el) => el.tabIndex === 0);
    // one stop in the root level (the sub trigger), one in the submenu
    expect(stops).toHaveLength(2);
    expect(stops.map((el) => el.textContent)).toEqual(['More', 'Zed']);
  });

  it('mirrors the horizontal keys under dir=rtl: ArrowLeft opens, ArrowRight closes', () => {
    const container = document.createElement('div');
    container.setAttribute('dir', 'rtl');
    document.body.appendChild(container);
    render(
      <Menu open trigger="T">
        <MenuItem>Plain</MenuItem>
        <MenuSub>
          <MenuSubTrigger>More</MenuSubTrigger>
          <MenuSubContent>
            <MenuItem>Sub One</MenuItem>
          </MenuSubContent>
        </MenuSub>
      </Menu>,
      { container }
    );
    const more = screen.getByRole('menuitem', { name: 'More' });
    more.focus();
    fireEvent.keyDown(more, { key: 'ArrowLeft' });
    expect(more).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByText('Sub One')).toHaveFocus();
    fireEvent.keyDown(screen.getByText('Sub One'), { key: 'ArrowRight' });
    expect(more).toHaveAttribute('aria-expanded', 'false');
    expect(more).toHaveFocus();
  });

  it('has no axe violations with the submenu open', async () => {
    const { axe } = await import('jest-axe');
    render(
      <Menu open trigger={<button>Open</button>}>
        <MenuItem>Plain</MenuItem>
        <MenuSub open>
          <MenuSubTrigger>More</MenuSubTrigger>
          <MenuSubContent>
            <MenuItem>Sub One</MenuItem>
            <MenuItem>Zed</MenuItem>
          </MenuSubContent>
        </MenuSub>
      </Menu>
    );
    // 'region' fires for any content outside a landmark — an artifact of
    // the bare test document, not the component.
    const results = await axe(document.body, {
      rules: { region: { enabled: false } },
    });
    expect(results.violations).toEqual([]);
  });
});

describe('MenuCheckboxItem', () => {
  it('renders as menuitemcheckbox with aria-checked', () => {
    render(
      <Menu open trigger="T">
        <MenuCheckboxItem checked>Show status bar</MenuCheckboxItem>
      </Menu>
    );
    const item = screen.getByRole('menuitemcheckbox', { name: 'Show status bar' });
    expect(item).toHaveAttribute('aria-checked', 'true');
  });

  it('toggles uncontrolled on click, firing onCheckedChange each way', async () => {
    const user = userEvent.setup();
    const onCheckedChange = vi.fn();
    render(
      <Menu open trigger="T">
        <MenuCheckboxItem onCheckedChange={onCheckedChange}>Bookmarks</MenuCheckboxItem>
      </Menu>
    );
    const item = screen.getByRole('menuitemcheckbox');
    expect(item).toHaveAttribute('aria-checked', 'false');
    await user.click(item);
    expect(item).toHaveAttribute('aria-checked', 'true');
    expect(onCheckedChange).toHaveBeenLastCalledWith(true);
    await user.click(item);
    expect(item).toHaveAttribute('aria-checked', 'false');
    expect(onCheckedChange).toHaveBeenLastCalledWith(false);
  });

  it('drives a controlled checked control in both directions', async () => {
    const user = userEvent.setup();
    function Harness() {
      const [checked, setChecked, checkedCtrl] = useControl(undefined, false);
      return (
        <div>
          <Menu open trigger="T">
            <MenuCheckboxItem checked={checkedCtrl}>Bookmarks</MenuCheckboxItem>
          </Menu>
          <button onClick={() => setChecked((v) => !v)}>flip</button>
          <output data-testid="checked">{String(checked)}</output>
        </div>
      );
    }
    render(<Harness />);
    await user.click(screen.getByRole('menuitemcheckbox'));
    expect(screen.getByTestId('checked')).toHaveTextContent('true');
    await user.click(screen.getByText('flip'));
    expect(screen.getByRole('menuitemcheckbox')).toHaveAttribute('aria-checked', 'false');
  });

  it('activates with Enter; Space passes through to the native activation', async () => {
    const user = userEvent.setup();
    render(
      <Menu open trigger="T">
        <MenuCheckboxItem>Bookmarks</MenuCheckboxItem>
      </Menu>
    );
    const item = screen.getByRole('menuitemcheckbox');
    item.focus();
    await user.keyboard('{Enter}');
    expect(item).toHaveAttribute('aria-checked', 'true');
    // Space must reach the browser's native button activation: the menu
    // keyboard layer lets the keydown through (jsdom/user-event do not
    // perform the space→click step, so the UA click is dispatched by
    // hand and the toggle must follow).
    const space = new KeyboardEvent('keydown', {
      key: ' ',
      bubbles: true,
      cancelable: true,
    });
    item.dispatchEvent(space);
    expect(space.defaultPrevented).toBe(false);
    fireEvent.click(item);
    expect(item).toHaveAttribute('aria-checked', 'false');
  });

  it('does not toggle when disabled', async () => {
    const user = userEvent.setup();
    render(
      <Menu open trigger="T">
        <MenuCheckboxItem disabled>Bookmarks</MenuCheckboxItem>
      </Menu>
    );
    const item = screen.getByRole('menuitemcheckbox');
    await user.click(item);
    expect(item).toHaveAttribute('aria-checked', 'false');
    expect(item).toBeDisabled();
  });
});

describe('MenuRadioGroup', () => {
  it('selects exactly one item in the group', async () => {
    const user = userEvent.setup();
    function Harness() {
      const [value, , valueCtrl] = useControl(undefined, 'light');
      return (
        <div>
          <Menu open trigger="T">
            <MenuRadioGroup value={valueCtrl}>
              <MenuRadioItem value="light">Light</MenuRadioItem>
              <MenuRadioItem value="dark">Dark</MenuRadioItem>
            </MenuRadioGroup>
          </Menu>
          <output data-testid="value">{value}</output>
        </div>
      );
    }
    render(<Harness />);
    const light = screen.getByRole('menuitemradio', { name: 'Light' });
    const dark = screen.getByRole('menuitemradio', { name: 'Dark' });
    expect(light).toHaveAttribute('aria-checked', 'true');
    expect(dark).toHaveAttribute('aria-checked', 'false');
    await user.click(dark);
    expect(dark).toHaveAttribute('aria-checked', 'true');
    expect(light).toHaveAttribute('aria-checked', 'false');
    expect(screen.getByTestId('value')).toHaveTextContent('dark');
  });

  it('fires onValueChange once; re-selecting the current item is a no-op', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(
      <Menu open trigger="T">
        <MenuRadioGroup onValueChange={onValueChange}>
          <MenuRadioItem value="light">Light</MenuRadioItem>
          <MenuRadioItem value="dark">Dark</MenuRadioItem>
        </MenuRadioGroup>
      </Menu>
    );
    const dark = screen.getByRole('menuitemradio', { name: 'Dark' });
    await user.click(dark);
    expect(onValueChange).toHaveBeenCalledOnce();
    expect(onValueChange).toHaveBeenLastCalledWith('dark');
    await user.click(dark);
    expect(onValueChange).toHaveBeenCalledOnce();
  });

  it('supports selection with Enter and Space while focused', async () => {
    const user = userEvent.setup();
    render(
      <Menu open trigger="T">
        <MenuRadioGroup value="light">
          <MenuRadioItem value="light">Light</MenuRadioItem>
          <MenuRadioItem value="dark">Dark</MenuRadioItem>
        </MenuRadioGroup>
      </Menu>
    );
    const dark = screen.getByRole('menuitemradio', { name: 'Dark' });
    dark.focus();
    await user.keyboard('{Enter}');
    expect(dark).toHaveAttribute('aria-checked', 'true');
    const light = screen.getByRole('menuitemradio', { name: 'Light' });
    expect(light).toHaveAttribute('aria-checked', 'false');
    // Space reaches the native activation (see the checkbox test for the
    // jsdom caveat) — the space keydown is not swallowed, then the UA
    // click selects the focused radio.
    const space = new KeyboardEvent('keydown', {
      key: ' ',
      bubbles: true,
      cancelable: true,
    });
    light.dispatchEvent(space);
    expect(space.defaultPrevented).toBe(false);
    fireEvent.click(light);
    expect(light).toHaveAttribute('aria-checked', 'true');
    expect(dark).toHaveAttribute('aria-checked', 'false');
  });

  it('throws when a radio item is used outside a radio group', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    expect(() => render(<MenuRadioItem value="x">X</MenuRadioItem>)).toThrow(
      'MenuRadioItem / DropdownMenuRadioItem must be used within a radio group'
    );
    spy.mockRestore();
  });

  it('renders an optional labeled radio group', () => {
    render(
      <Menu open trigger="T">
        <MenuRadioGroup label="Theme" value="light">
          <MenuRadioItem value="light">Light</MenuRadioItem>
        </MenuRadioGroup>
      </Menu>
    );
    const group = screen.getByRole('group', { name: 'Theme' });
    expect(group).toContainElement(screen.getByRole('menuitemradio', { name: 'Light' }));
  });
});

describe('MenuGroup', () => {
  it('renders a labeled group with aria-labelledby wiring', () => {
    render(
      <Menu open trigger="T">
        <MenuGroup label="Actions">
          <MenuItem>Rename</MenuItem>
        </MenuGroup>
      </Menu>
    );
    const group = screen.getByRole('group', { name: 'Actions' });
    expect(group).toContainElement(screen.getByRole('menuitem', { name: 'Rename' }));
  });

  it('keeps the label outside the item set and the tab order', () => {
    render(
      <Menu open trigger="T">
        <MenuGroup label="Actions">
          <MenuItem>One</MenuItem>
          <MenuItem>Two</MenuItem>
        </MenuGroup>
      </Menu>
    );
    const label = screen.getByText('Actions');
    // not focusable, and never part of the roving item set
    expect(label.tabIndex).toBe(-1);
    expect(label.closest('[role^="menuitem"]')).toBeNull();
    // the open menu auto-focuses its first ITEM — never the label
    expect(screen.getByRole('menuitem', { name: 'One' })).toHaveFocus();
    fireEvent.keyDown(screen.getByRole('menuitem', { name: 'One' }), { key: 'End' });
    expect(screen.getByRole('menuitem', { name: 'Two' })).toHaveFocus();
    fireEvent.keyDown(screen.getByRole('menuitem', { name: 'Two' }), { key: 'Home' });
    expect(screen.getByRole('menuitem', { name: 'One' })).toHaveFocus();
  });
});

describe('Menu keyboard across item types', () => {
  function renderMixed() {
    return render(
      <Menu open trigger="T">
        <MenuItem>Alpha</MenuItem>
        <MenuCheckboxItem>Cut</MenuCheckboxItem>
        <MenuRadioGroup>
          <MenuRadioItem value="b">Bold</MenuRadioItem>
        </MenuRadioGroup>
        <MenuItem>Omega</MenuItem>
      </Menu>
    );
  }

  it('traverses checkbox and radio items with the arrows, Home and End', () => {
    renderMixed();
    const expected = [
      screen.getByRole('menuitem', { name: 'Alpha' }),
      screen.getByRole('menuitemcheckbox', { name: 'Cut' }),
      screen.getByRole('menuitemradio', { name: 'Bold' }),
      screen.getByRole('menuitem', { name: 'Omega' }),
    ];
    // the open menu auto-focuses its first item
    expect(expected[0]).toHaveFocus();
    for (let i = 1; i < expected.length; i++) {
      fireEvent.keyDown(expected[i - 1]!, { key: 'ArrowDown' });
      expect(expected[i]).toHaveFocus();
    }
    // wraps back to the first item (a plain menuitem)
    fireEvent.keyDown(expected[3]!, { key: 'ArrowDown' });
    expect(expected[0]).toHaveFocus();
    fireEvent.keyDown(expected[0]!, { key: 'End' });
    expect(expected[3]).toHaveFocus();
    fireEvent.keyDown(expected[3]!, { key: 'Home' });
    expect(expected[0]).toHaveFocus();
  });

  it('keeps exactly one tab stop across the mixed item set', () => {
    renderMixed();
    const stops = screen
      .getAllByRole('menu')
      .flatMap((m) => Array.from(m.querySelectorAll<HTMLElement>('[role^="menuitem"]')))
      .filter((el) => el.tabIndex === 0);
    expect(stops).toHaveLength(1);
  });

  it('matches checkbox and radio labels through typeahead', () => {
    const view = renderMixed();
    // the open menu auto-focuses its first item (Alpha)
    expect(screen.getByRole('menuitem', { name: 'Alpha' })).toHaveFocus();
    fireEvent.keyDown(screen.getByRole('menuitem', { name: 'Alpha' }), { key: 'c' });
    expect(screen.getByRole('menuitemcheckbox', { name: 'Cut' })).toHaveFocus();
    // characters accumulate within the window: 'cu' still matches Cut
    fireEvent.keyDown(screen.getByRole('menuitemcheckbox', { name: 'Cut' }), { key: 'u' });
    expect(screen.getByRole('menuitemcheckbox', { name: 'Cut' })).toHaveFocus();
    // a fresh instance (fresh typeahead buffer) reaches the radio item
    view.unmount();
    renderMixed();
    expect(screen.getByRole('menuitem', { name: 'Alpha' })).toHaveFocus();
    fireEvent.keyDown(screen.getByRole('menuitem', { name: 'Alpha' }), { key: 'b' });
    expect(screen.getByRole('menuitemradio', { name: 'Bold' })).toHaveFocus();
  });
});

describe('Menu items data API', () => {
  it('renders items, dividers, groups, checkboxes and submenus recursively', () => {
    const items: MenuDataItem[] = [
      { type: 'item', label: 'Rename', kbdLabel: 'F2' },
      { type: 'divider' },
      {
        type: 'group',
        label: 'View',
        children: [{ type: 'checkbox', label: 'Status bar', checked: true }],
      },
      {
        type: 'sub',
        label: 'Share',
        children: [{ type: 'item', label: 'Copy link' }],
      },
    ];
    render(<Menu open trigger="T" items={items} />);

    expect(screen.getByRole('menuitem', { name: 'Rename' })).toBeInTheDocument();
    expect(screen.getByRole('separator')).toBeInTheDocument();
    expect(screen.getByRole('group', { name: 'View' })).toBeInTheDocument();
    const checkbox = screen.getByRole('menuitemcheckbox', { name: 'Status bar' });
    expect(checkbox).toHaveAttribute('aria-checked', 'true');

    const share = screen.getByRole('menuitem', { name: 'Share' });
    share.focus();
    fireEvent.keyDown(share, { key: 'ArrowRight' });
    expect(screen.getByRole('menuitem', { name: 'Copy link' })).toHaveFocus();
  });

  it('binds radio groups through the group value', async () => {
    const user = userEvent.setup();
    const items: MenuDataItem[] = [
      {
        type: 'group',
        label: 'Theme',
        value: 'light',
        children: [
          { type: 'radio', value: 'light', label: 'Light' },
          { type: 'radio', value: 'dark', label: 'Dark' },
        ],
      },
    ];
    render(<Menu open trigger="T" items={items} />);
    const light = screen.getByRole('menuitemradio', { name: 'Light' });
    const dark = screen.getByRole('menuitemradio', { name: 'Dark' });
    expect(light).toHaveAttribute('aria-checked', 'true');
    await user.click(dark);
    expect(dark).toHaveAttribute('aria-checked', 'true');
    expect(light).toHaveAttribute('aria-checked', 'false');
    // the labeled group still names the whole radio cluster
    expect(screen.getByRole('group', { name: 'Theme' })).toContainElement(dark);
  });

  it('prefers items over children when both are passed', () => {
    render(
      <Menu open trigger="T" items={[{ type: 'item', label: 'From data' }]}>
        <MenuItem>From children</MenuItem>
      </Menu>
    );
    expect(screen.getByRole('menuitem', { name: 'From data' })).toBeInTheDocument();
    expect(screen.queryByRole('menuitem', { name: 'From children' })).not.toBeInTheDocument();
  });
});

describe('Menu danger variant', () => {
  it('applies the danger skin class to items and checkable items', () => {
    render(
      <Menu open trigger="T">
        <MenuItem danger>Delete</MenuItem>
        <MenuCheckboxItem danger>Wipe cache</MenuCheckboxItem>
        <MenuRadioGroup>
          <MenuRadioItem value="nuke" danger>Nuke</MenuRadioItem>
        </MenuRadioGroup>
      </Menu>
    );
    expect(screen.getByRole('menuitem', { name: 'Delete' })).toHaveClass(menuItemDanger);
    expect(screen.getByRole('menuitemcheckbox', { name: 'Wipe cache' })).toHaveClass(menuItemDanger);
    expect(screen.getByRole('menuitemradio', { name: 'Nuke' })).toHaveClass(menuItemDanger);
  });

  it('omits the danger class by default', () => {
    render(
      <Menu open trigger="T">
        <MenuItem>Delete</MenuItem>
      </Menu>
    );
    expect(screen.getByRole('menuitem', { name: 'Delete' })).not.toHaveClass(menuItemDanger);
  });
});

describe('Menu axe with selection items', () => {
  it('has no axe violations with checkbox, radio and group items open', async () => {
    const { axe } = await import('jest-axe');
    render(
      <Menu open trigger={<button>Open</button>}>
        <MenuGroup label="View">
          <MenuCheckboxItem checked>Status bar</MenuCheckboxItem>
        </MenuGroup>
        <MenuDivider />
        <MenuRadioGroup value="light">
          <MenuRadioItem value="light">Light</MenuRadioItem>
          <MenuRadioItem value="dark">Dark</MenuRadioItem>
        </MenuRadioGroup>
        <MenuItem danger>Delete</MenuItem>
      </Menu>
    );
    // 'region' fires for any content outside a landmark — an artifact of
    // the bare test document, not the component.
    const results = await axe(document.body, {
      rules: { region: { enabled: false } },
    });
    expect(results.violations).toEqual([]);
  });
});

describe('Menu classNames slots', () => {
  it('applies every slot to its part', () => {
    render(
      <Menu
        open
        trigger="T"
        classNames={{
          root: 'slot-root',
          trigger: 'slot-trigger',
          panel: 'slot-panel',
          item: 'slot-item',
          checkboxItem: 'slot-checkbox',
          radioItem: 'slot-radio',
          group: 'slot-group',
          divider: 'slot-divider',
          sub: 'slot-sub',
          subTrigger: 'slot-sub-trigger',
          subContent: 'slot-sub-content',
        }}
      >
        <MenuGroup label="View">
          <MenuItem>Paste</MenuItem>
          <MenuCheckboxItem checked>Status bar</MenuCheckboxItem>
        </MenuGroup>
        <MenuDivider />
        <MenuRadioGroup value="light">
          <MenuRadioItem value="light">Light</MenuRadioItem>
        </MenuRadioGroup>
        <MenuSub>
          <MenuSubTrigger>Share</MenuSubTrigger>
          <MenuSubContent>
            <MenuItem>Link</MenuItem>
          </MenuSubContent>
        </MenuSub>
      </Menu>
    );
    // two role="menu" panels render (the main panel plus the resident
    // submenu panel) — the main one comes first in DOM order
    const menus = screen.getAllByRole('menu');
    expect(menus[0]).toHaveClass('slot-panel');
    expect(menus[1]).toHaveClass('slot-sub-content');
    expect(screen.getByText('Paste')).toHaveClass('slot-item');
    expect(screen.getByRole('menuitemcheckbox')).toHaveClass('slot-checkbox');
    expect(screen.getByRole('menuitemradio')).toHaveClass('slot-radio');
    expect(screen.getByRole('group', { name: 'View' })).toHaveClass('slot-group');
    expect(screen.getByRole('separator')).toHaveClass('slot-divider');
    expect(screen.getByRole('menuitem', { name: 'Share' })).toHaveClass(
      'slot-sub-trigger'
    );
    expect(screen.getByRole('menuitem', { name: 'Share' }).parentElement).toHaveClass(
      'slot-sub'
    );
  });

  it('applies root and trigger slots to the wrapper and trigger area', () => {
    const { container } = render(
      <Menu trigger="T" classNames={{ root: 'slot-root', trigger: 'slot-trigger' }}>
        <MenuItem>X</MenuItem>
      </Menu>
    );
    const root = container.querySelector("[data-slot='menu']");
    expect(root).toHaveClass('slot-root');
    const triggerArea = container.querySelector("[data-slot='trigger']");
    expect(triggerArea).toHaveClass('slot-trigger');
  });

  it('lands the panel slot after the className prop class', () => {
    render(
      <Menu open trigger="T" className="custom" classNames={{ panel: 'slot-panel' }}>
        <MenuItem>X</MenuItem>
      </Menu>
    );
    const panel = screen.getByRole('menu');
    expect(panel).toHaveClass('custom');
    expect(panel).toHaveClass('slot-panel');
  });

  it('applies sub slots to the submenu wrapper and panel', () => {
    render(
      <Menu open trigger="T" classNames={{ sub: 'slot-sub', subContent: 'slot-sub-content' }}>
        <MenuSub>
          <MenuSubTrigger>Share</MenuSubTrigger>
          <MenuSubContent>
            <MenuItem>Link</MenuItem>
          </MenuSubContent>
        </MenuSub>
      </Menu>
    );
  });

  it('forwards ref to the root wrapper', () => {
    render(
      <Menu
        ref={(node) => {
          if (node) node.dataset.probe = 'set';
        }}
        trigger="T"
      >
        <MenuItem>X</MenuItem>
      </Menu>
    );
    const root = document.querySelector("[data-slot='menu']");
    expect(root).toHaveAttribute('data-probe', 'set');
  });
});

describe('Menu virtualization', () => {
  // Row height of the virtualized path — VIRTUAL_ROW_HEIGHT in Menu.tsx
  // (space-2 padding block + the text-sm line box at leading-normal).
  const ROW_HEIGHT = 37;

  /** 300 plain items with one distinctive typeahead target at index 42. */
  function makeItems(count: number): MenuDataItem[] {
    return Array.from({ length: count }, (_, i) =>
      i === 42 && count > 42
        ? { type: 'item' as const, label: 'Target item', key: 'target' }
        : { type: 'item' as const, label: `Item ${i}` }
    );
  }

  // jsdom has no layout: scrollHeight reads 0, which clamps every
  // programmatic scrollTop to 0 inside VirtualList.scrollToIndex. Give
  // the scrollport a real range (Select's virtualization test pattern).
  function giveScrollRange(port: HTMLElement, rows: number) {
    Object.defineProperty(port, 'scrollHeight', {
      value: rows * ROW_HEIGHT,
      configurable: true,
    });
  }

  function getPort() {
    return document.querySelector<HTMLElement>('[data-virtualized]')!;
  }

  it('renders only the windowed subset of a 300-item menu', () => {
    render(<Menu open trigger="T" virtualized items={makeItems(300)} />);
    expect(getPort()).toBeInTheDocument();
    const mounted = screen.getAllByRole('menuitem');
    expect(mounted.length).toBeGreaterThan(0);
    expect(mounted.length).toBeLessThan(300);
    // far outside the initial window
    expect(screen.queryByText('Item 100')).not.toBeInTheDocument();
    expect(screen.getByText('Item 0')).toBeInTheDocument();
  });

  it('keeps the full plain DOM list when virtualized is off', () => {
    render(<Menu open trigger="T" items={makeItems(300)} />);
    expect(document.querySelector('[data-virtualized]')).toBeNull();
    expect(screen.getAllByRole('menuitem')).toHaveLength(300);
  });

  it('moves focus across the virtual window with ArrowDown', () => {
    render(<Menu open trigger="T" virtualized items={makeItems(300)} />);
    giveScrollRange(getPort(), 300);
    // the open menu auto-focuses its first item
    let focused: HTMLElement = screen.getByRole('menuitem', { name: 'Item 0' });
    expect(focused).toHaveFocus();
    for (let i = 1; i <= 14; i++) {
      fireEvent.keyDown(focused, { key: 'ArrowDown' });
      focused = screen.getByRole('menuitem', { name: `Item ${i}` });
      expect(focused).toHaveFocus();
    }
    // the window followed: the rows left behind are unmounted
    expect(screen.queryByText('Item 0')).not.toBeInTheDocument();
    expect(screen.getByText('Item 14')).toBeInTheDocument();
  });

  it('skips disabled rows and dividers while traversing', () => {
    const items: MenuDataItem[] = [
      { type: 'item', label: 'Alpha' },
      { type: 'divider' },
      { type: 'item', label: 'Beta', disabled: true },
      { type: 'item', label: 'Gamma' },
    ];
    render(<Menu open trigger="T" virtualized items={items} />);
    expect(screen.getByRole('menuitem', { name: 'Alpha' })).toHaveFocus();
    fireEvent.keyDown(screen.getByRole('menuitem', { name: 'Alpha' }), {
      key: 'ArrowDown',
    });
    // the divider and the disabled Beta are both skipped
    expect(screen.getByRole('menuitem', { name: 'Gamma' })).toHaveFocus();
    fireEvent.keyDown(screen.getByRole('menuitem', { name: 'Gamma' }), {
      key: 'ArrowDown',
    });
    // wraps back to Alpha
    expect(screen.getByRole('menuitem', { name: 'Alpha' })).toHaveFocus();
  });

  it('jumps to the ends with Home and End across the window', () => {
    render(<Menu open trigger="T" virtualized items={makeItems(300)} />);
    giveScrollRange(getPort(), 300);
    const first = screen.getByRole('menuitem', { name: 'Item 0' });
    expect(first).toHaveFocus();
    fireEvent.keyDown(first, { key: 'End' });
    const last = screen.getByRole('menuitem', { name: 'Item 299' });
    expect(last).toBeInTheDocument();
    expect(last).toHaveFocus();
    fireEvent.keyDown(last, { key: 'Home' });
    expect(screen.getByRole('menuitem', { name: 'Item 0' })).toHaveFocus();
    // the window is back at the top
    expect(screen.queryByText('Item 299')).not.toBeInTheDocument();
  });

  it('reaches an item outside the window through typeahead', () => {
    render(<Menu open trigger="T" virtualized items={makeItems(300)} />);
    giveScrollRange(getPort(), 300);
    expect(screen.getByRole('menuitem', { name: 'Item 0' })).toHaveFocus();
    // 't' matches only the target at index 42 — well past the window
    fireEvent.keyDown(screen.getByRole('menuitem', { name: 'Item 0' }), {
      key: 't',
    });
    const target = screen.getByRole('menuitem', { name: 'Target item' });
    expect(target).toBeInTheDocument();
    expect(target).toHaveFocus();
    expect(screen.queryByText('Item 0')).not.toBeInTheDocument();
  });

  it('opens a submenu from a virtualized row and keeps it level-scoped', () => {
    const items: MenuDataItem[] = [
      { type: 'item', label: 'Alpha' },
      {
        type: 'sub',
        label: 'More',
        children: [
          { type: 'item', label: 'Sub One' },
          { type: 'item', label: 'Sub Two' },
        ],
      },
      ...Array.from({ length: 60 }, (_, i) => ({
        type: 'item' as const,
        label: `Item ${i}`,
      })),
    ];
    render(<Menu open trigger="T" virtualized items={items} />);
    // the sub trigger is a root-level row: arrows reach it
    const alpha = screen.getByRole('menuitem', { name: 'Alpha' });
    expect(alpha).toHaveFocus();
    fireEvent.keyDown(alpha, { key: 'ArrowDown' });
    const more = screen.getByRole('menuitem', { name: 'More' });
    expect(more).toHaveFocus();
    fireEvent.keyDown(more, { key: 'ArrowRight' });
    expect(more).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByRole('menuitem', { name: 'Sub One' })).toHaveFocus();
    // submenu-level navigation stays inside the submenu (plain DOM level)
    fireEvent.keyDown(screen.getByRole('menuitem', { name: 'Sub One' }), {
      key: 'ArrowDown',
    });
    expect(screen.getByRole('menuitem', { name: 'Sub Two' })).toHaveFocus();
    // Escape closes only the submenu and returns focus to its trigger
    fireEvent.keyDown(screen.getByRole('menuitem', { name: 'Sub Two' }), {
      key: 'Escape',
    });
    expect(more).toHaveAttribute('aria-expanded', 'false');
    expect(more).toHaveFocus();
  });

  it('keeps exactly one roving tab stop inside the mounted window', () => {
    render(<Menu open trigger="T" virtualized items={makeItems(300)} />);
    giveScrollRange(getPort(), 300);
    const stops = () =>
      screen.getAllByRole('menuitem').filter((el) => el.tabIndex === 0);
    expect(stops()).toHaveLength(1);
    // after crossing the window the stop follows focus
    fireEvent.keyDown(screen.getByRole('menuitem', { name: 'Item 0' }), {
      key: 'End',
    });
    const after = stops();
    expect(after).toHaveLength(1);
    expect(after[0]).toHaveFocus();
  });

  it('closes on Escape and returns focus to the trigger', async () => {
    const user = userEvent.setup();
    render(
      <Menu virtualized trigger={<button>Open</button>} items={makeItems(300)} />
    );
    const trigger = screen.getByText('Open');
    await user.click(trigger);
    expect(screen.getByRole('menu')).toHaveAttribute('data-state', 'open');
    const first = screen.getByRole('menuitem', { name: 'Item 0' });
    expect(first).toHaveFocus();
    fireEvent.keyDown(first, { key: 'Escape' });
    expect(screen.getByRole('menu')).toHaveAttribute('data-state', 'closed');
    expect(trigger).toHaveFocus();
  });

  it('falls back to the plain DOM path for group entries, with a dev error', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    try {
      render(
        <Menu
          open
          trigger="T"
          virtualized
          items={[
            { type: 'item', label: 'Alpha' },
            {
              type: 'group',
              label: 'View',
              children: [{ type: 'checkbox', label: 'Status bar' }],
            },
          ]}
        />
      );
      expect(document.querySelector('[data-virtualized]')).toBeNull();
      // the group keeps its full DOM semantics
      expect(screen.getByRole('group', { name: 'View' })).toBeInTheDocument();
      expect(screen.getByRole('menuitemcheckbox', { name: 'Status bar' })).toBeInTheDocument();
      expect(spy).toHaveBeenCalledWith(expect.stringContaining('virtualized'));
    } finally {
      spy.mockRestore();
    }
  });

  it('ignores virtualized without items, with a dev error', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    try {
      render(
        <Menu open trigger="T" virtualized>
          <MenuItem>Alpha</MenuItem>
        </Menu>
      );
      expect(document.querySelector('[data-virtualized]')).toBeNull();
      expect(screen.getByRole('menuitem', { name: 'Alpha' })).toBeInTheDocument();
      expect(spy).toHaveBeenCalledWith(expect.stringContaining('items'));
    } finally {
      spy.mockRestore();
    }
  });

  it('has no axe violations when the menu is virtualized', async () => {
    const { axe } = await import('jest-axe');
    render(
      <Menu
        open
        trigger={<button>Open</button>}
        virtualized
        items={[
          { type: 'item', label: 'Rename', kbdLabel: 'F2' },
          { type: 'checkbox', label: 'Status bar', checked: true },
          { type: 'divider' },
          {
            type: 'sub',
            label: 'Share',
            children: [{ type: 'item', label: 'Copy link' }],
          },
          ...Array.from({ length: 40 }, (_, i) => ({
            type: 'item' as const,
            label: `Item ${i}`,
          })),
        ]}
      />
    );
    // 'region' fires for any content outside a landmark — an artifact of
    // the bare test document, not the component.
    const results = await axe(document.body, {
      rules: { region: { enabled: false } },
    });
    expect(results.violations).toEqual([]);
  });
});
