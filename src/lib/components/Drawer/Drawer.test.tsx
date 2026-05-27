import { render, screen, act } from '@testing-library/react';

import Drawer from './Drawer';

beforeEach(() => {
  HTMLDialogElement.prototype.showModal = vi.fn(function (
    this: HTMLDialogElement
  ) {
    this.setAttribute('open', '');
  });
  HTMLDialogElement.prototype.close = vi.fn(function (
    this: HTMLDialogElement
  ) {
    this.removeAttribute('open');
    this.dispatchEvent(new Event('close'));
  });
});

describe('Drawer', () => {
  it('renders a dialog element', () => {
    render(<Drawer>Content</Drawer>);
    expect(screen.getByRole('dialog', { hidden: true })).toBeInTheDocument();
  });

  it('renders children', () => {
    render(<Drawer open>Drawer body</Drawer>);
    expect(screen.getByText('Drawer body')).toBeInTheDocument();
  });

  it('applies className', () => {
    render(<Drawer className="custom">Content</Drawer>);
    expect(screen.getByRole('dialog', { hidden: true })).toHaveClass('custom');
  });

  it('calls onClose when dialog fires close event', () => {
    const onClose = vi.fn();
    render(<Drawer open onClose={onClose}>Content</Drawer>);
    const dialog = screen.getByRole('dialog');
    act(() => {
      dialog.dispatchEvent(new Event('close', { bubbles: false }));
    });
    expect(onClose).toHaveBeenCalled();
  });

  it('closes when clicking backdrop', () => {
    const onClose = vi.fn();
    render(<Drawer open onClose={onClose}>Content</Drawer>);
    const dialog = screen.getByRole('dialog');
    act(() => {
      dialog.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    });
    expect(onClose).toHaveBeenCalled();
  });
});
