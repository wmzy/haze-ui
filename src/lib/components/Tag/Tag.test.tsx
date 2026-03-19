import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import Tag from './Tag';

describe('Tag', () => {
  it('renders children', () => {
    render(<Tag>Label</Tag>);
    expect(screen.getByText('Label')).toBeInTheDocument();
  });

  it('renders as a span', () => {
    const { container } = render(<Tag>Label</Tag>);
    expect(container.firstChild?.nodeName).toBe('SPAN');
  });

  it('applies className', () => {
    const { container } = render(<Tag className="custom">Label</Tag>);
    expect(container.firstChild).toHaveClass('custom');
  });

  it('does not render close button by default', () => {
    render(<Tag>Label</Tag>);
    expect(screen.queryByRole('button', { name: 'Remove' })).not.toBeInTheDocument();
  });

  it('renders close button when closable', () => {
    render(<Tag closable>Label</Tag>);
    expect(screen.getByRole('button', { name: 'Remove' })).toBeInTheDocument();
  });

  it('calls onClose when close button is clicked', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(<Tag closable onClose={onClose}>Label</Tag>);
    await user.click(screen.getByRole('button', { name: 'Remove' }));
    expect(onClose).toHaveBeenCalledOnce();
  });
});
