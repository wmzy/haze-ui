import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import ContextMenu from './ContextMenu';
import ContextMenuTrigger from './ContextMenuTrigger';
import ContextMenuContent from './ContextMenuContent';
import ContextMenuItem from './ContextMenuItem';
import ContextMenuSeparator from './ContextMenuSeparator';

describe('ContextMenu', () => {
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
    expect(screen.queryByText('Copy')).not.toBeInTheDocument();
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
});
