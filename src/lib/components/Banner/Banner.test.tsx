import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import Banner from './Banner';

describe('Banner', () => {
  it('renders children', () => {
    render(<Banner>Alert message</Banner>);
    expect(screen.getByText('Alert message')).toBeInTheDocument();
  });

  it('applies className', () => {
    const { container } = render(<Banner className="custom">Message</Banner>);
    expect(container.firstChild).toHaveClass('custom');
  });

  it('has alert role', () => {
    render(<Banner>Alert</Banner>);
    expect(screen.getByRole('alert')).toBeInTheDocument();
  });

  it('renders close button when onClose provided', () => {
    render(<Banner onClose={() => {}}>Message</Banner>);
    expect(screen.getByRole('button', { name: 'Close' })).toBeInTheDocument();
  });

  it('calls onClose when close button clicked', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(<Banner onClose={onClose}>Message</Banner>);
    await user.click(screen.getByRole('button', { name: 'Close' }));
    expect(onClose).toHaveBeenCalled();
  });

  it('hides after close', async () => {
    const user = userEvent.setup();
    render(<Banner onClose={() => {}}>Message</Banner>);
    await user.click(screen.getByRole('button', { name: 'Close' }));
    expect(screen.queryByText('Message')).not.toBeInTheDocument();
  });

  it('does not render close button without onClose', () => {
    render(<Banner>Message</Banner>);
    expect(screen.queryByRole('button', { name: 'Close' })).not.toBeInTheDocument();
  });

  it('renders with different variants', () => {
    const { container, rerender } = render(<Banner variant="success">Success</Banner>);
    expect(container.firstChild).toBeInTheDocument();
    rerender(<Banner variant="warning">Warning</Banner>);
    expect(container.firstChild).toBeInTheDocument();
  });
});
