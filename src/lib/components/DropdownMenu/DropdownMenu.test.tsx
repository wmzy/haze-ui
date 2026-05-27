import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import DropdownMenu from './DropdownMenu';
import DropdownMenuTrigger from './DropdownMenuTrigger';
import DropdownMenuContent from './DropdownMenuContent';
import DropdownMenuItem from './DropdownMenuItem';
import DropdownMenuSeparator from './DropdownMenuSeparator';

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

  it('renders separator', async () => {
    const user = userEvent.setup();
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

  it('applies className to content', async () => {
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
});
