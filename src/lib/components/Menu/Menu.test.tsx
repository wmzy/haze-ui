import { expect } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useControl } from 'react-use-control';

import Menu from './Menu';
import MenuItem from './MenuItem';
import MenuDivider from './MenuDivider';

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
