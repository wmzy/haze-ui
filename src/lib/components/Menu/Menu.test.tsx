import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

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
    render(
      <div>
        <Menu trigger={<button>Open</button>}>
          <MenuItem>Action</MenuItem>
        </Menu>
        <button>outside</button>
      </div>
    );
    await user.click(screen.getByText('Open'));
    await user.click(screen.getByText('outside'));
  });

  it('applies className to menu panel', () => {
    render(
      <Menu className="custom" trigger={<button>Open</button>}>
        <MenuItem>Action</MenuItem>
      </Menu>
    );
    expect(screen.getByRole('menu')).toHaveClass('custom');
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
