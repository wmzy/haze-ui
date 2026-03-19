import { render, screen, act } from '@testing-library/react';

import Dialog from './Dialog';

beforeEach(() => {
  // jsdom does not implement showModal/close for HTMLDialogElement
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

describe('Dialog', () => {
  it('renders a dialog element', () => {
    render(<Dialog>Content</Dialog>);
    expect(screen.getByRole('dialog', { hidden: true })).toBeInTheDocument();
  });

  it('renders children', () => {
    render(<Dialog open>Dialog body</Dialog>);
    expect(screen.getByText('Dialog body')).toBeInTheDocument();
  });

  it('applies className', () => {
    render(<Dialog className="custom">Content</Dialog>);
    expect(screen.getByRole('dialog', { hidden: true })).toHaveClass('custom');
  });

  it('calls onClose when dialog fires close event', () => {
    const onClose = vi.fn();
    render(<Dialog open onClose={onClose}>Content</Dialog>);
    const dialog = screen.getByRole('dialog');
    act(() => {
      dialog.dispatchEvent(new Event('close', { bubbles: false }));
    });
    expect(onClose).toHaveBeenCalled();
  });

  it('closes when clicking backdrop', () => {
    const onClose = vi.fn();
    render(<Dialog open onClose={onClose}>Content</Dialog>);
    const dialog = screen.getByRole('dialog');
    act(() => {
      dialog.dispatchEvent(
        new MouseEvent('click', { bubbles: true })
      );
    });
    expect(onClose).toHaveBeenCalled();
  });
});
