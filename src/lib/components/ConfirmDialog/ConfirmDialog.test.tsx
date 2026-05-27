import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import ConfirmDialog from './ConfirmDialog';

describe('ConfirmDialog', () => {
  it('renders when open', () => {
    render(<ConfirmDialog open>Are you sure?</ConfirmDialog>);
    expect(screen.getByText('Are you sure?')).toBeInTheDocument();
  });

  it('renders title', () => {
    render(<ConfirmDialog open title="Confirm Action">Body</ConfirmDialog>);
    expect(screen.getByText('Confirm Action')).toBeInTheDocument();
  });

  it('renders default button text', () => {
    render(<ConfirmDialog open>Body</ConfirmDialog>);
    expect(screen.getByText('Confirm')).toBeInTheDocument();
    expect(screen.getByText('Cancel')).toBeInTheDocument();
  });

  it('renders custom button text', () => {
    render(<ConfirmDialog open confirmText="Yes" cancelText="No">Body</ConfirmDialog>);
    expect(screen.getByText('Yes')).toBeInTheDocument();
    expect(screen.getByText('No')).toBeInTheDocument();
  });

  it('calls onConfirm when confirm clicked', async () => {
    const user = userEvent.setup();
    const onConfirm = vi.fn();
    render(<ConfirmDialog open onConfirm={onConfirm}>Body</ConfirmDialog>);
    await user.click(screen.getByText('Confirm'));
    expect(onConfirm).toHaveBeenCalled();
  });

  it('calls onCancel when cancel clicked', async () => {
    const user = userEvent.setup();
    const onCancel = vi.fn();
    render(<ConfirmDialog open onCancel={onCancel}>Body</ConfirmDialog>);
    await user.click(screen.getByText('Cancel'));
    expect(onCancel).toHaveBeenCalled();
  });

  it('applies className', () => {
    const { container } = render(<ConfirmDialog open className="custom">Body</ConfirmDialog>);
    expect(container.firstChild).toHaveClass('custom');
  });
});
