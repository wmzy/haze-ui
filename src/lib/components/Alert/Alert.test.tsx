import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import Alert from './Alert';

describe('Alert', () => {
  it('renders children with alert role', () => {
    render(<Alert>Something happened</Alert>);
    expect(screen.getByRole('alert')).toHaveTextContent('Something happened');
  });

  it('applies className', () => {
    render(<Alert className="custom">Message</Alert>);
    expect(screen.getByRole('alert')).toHaveClass('custom');
  });

  it('does not render close button by default', () => {
    render(<Alert>Message</Alert>);
    expect(screen.queryByRole('button', { name: 'Close' })).not.toBeInTheDocument();
  });

  it('renders close button when closable', () => {
    render(<Alert closable>Message</Alert>);
    expect(screen.getByRole('button', { name: 'Close' })).toBeInTheDocument();
  });

  it('hides alert when close button is clicked', async () => {
    const user = userEvent.setup();
    render(<Alert closable>Message</Alert>);
    await user.click(screen.getByRole('button', { name: 'Close' }));
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });
});
