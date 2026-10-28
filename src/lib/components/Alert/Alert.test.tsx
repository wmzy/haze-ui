import { createRef } from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import Alert from './Alert';
import { alertVariants } from './index';
import { borders } from './alert-styles';

describe('Alert', () => {
  it('renders children with a polite status role (default info)', () => {
    render(<Alert>Something happened</Alert>);
    expect(screen.getByRole('status')).toHaveTextContent('Something happened');
  });

  it('maps every severity to its live-region role', () => {
    // Only danger interrupts (role="alert", implicitly assertive);
    // every other severity announces politely via role="status" —
    // Toast's documented convention.
    const { rerender } = render(<Alert color="info">Info</Alert>);
    expect(screen.getByRole('status')).toBeInTheDocument();
    for (const color of ['default', 'primary', 'success', 'warning'] as const) {
      rerender(<Alert color={color}>Message</Alert>);
      expect(screen.getByRole('status')).toBeInTheDocument();
      expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    }
    rerender(<Alert color="danger">Danger</Alert>);
    expect(screen.getByRole('alert')).toBeInTheDocument();
  });

  it('applies className', () => {
    render(<Alert className="custom">Message</Alert>);
    expect(screen.getByRole('status')).toHaveClass('custom');
  });

  it('does not render close button by default', () => {
    render(<Alert>Message</Alert>);
    expect(screen.queryByRole('button', { name: 'Close' })).not.toBeInTheDocument();
  });

  it('renders close button when closable', () => {
    render(<Alert closable>Message</Alert>);
    expect(screen.getByRole('button', { name: 'Close' })).toBeInTheDocument();
  });

  it('forwards the ref onto the root div', () => {
    const ref = createRef<HTMLDivElement>();
    render(<Alert ref={ref}>Message</Alert>);
    expect(ref.current).toBe(screen.getByRole('status'));
  });

  it('hides alert when close button is clicked', async () => {
    const user = userEvent.setup();
    render(<Alert closable>Message</Alert>);
    await user.click(screen.getByRole('button', { name: 'Close' }));
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });

  it('has no axe violations', async () => {
    const { axe } = await import('jest-axe');
    render(<Alert>Something happened</Alert>);
    const results = await axe(document.body, {
      rules: { region: { enabled: false } },
    });
    expect(results.violations).toEqual([]);
  });

  it('has no axe violations when closable', async () => {
    const { axe } = await import('jest-axe');
    render(<Alert color="warning" closable>Session expiring soon</Alert>);
    const results = await axe(document.body, {
      rules: { region: { enabled: false } },
    });
    expect(results.violations).toEqual([]);
  });
});

describe('alertVariants exports', () => {
  it('exposes the color skin classes for composition', () => {
    expect(Object.keys(alertVariants)).toEqual(['default', 'primary', 'info', 'success', 'warning', 'danger']);
    for (const cls of Object.values(alertVariants)) {
      expect(cls).toBeTruthy();
    }
  });

  it('is the exact class Alert wears, border layer composed on top', () => {
    render(<Alert color="warning">Skin</Alert>);
    const alert = screen.getByRole('status');
    expect(alert).toHaveClass(alertVariants.warning);
    // The tinted pair comes from the shared status skin; Alert's own
    // layer is the color-mix border composed over it.
    expect(alert).toHaveClass(borders.warning);
  });
});
