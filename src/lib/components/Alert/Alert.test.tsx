import { createRef } from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import Alert from './Alert';
import { alertVariants } from './index';

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

  it('forwards the ref onto the root div', () => {
    const ref = createRef<HTMLDivElement>();
    render(<Alert ref={ref}>Message</Alert>);
    expect(ref.current).toBe(screen.getByRole('alert'));
  });

  it('hides alert when close button is clicked', async () => {
    const user = userEvent.setup();
    render(<Alert closable>Message</Alert>);
    await user.click(screen.getByRole('button', { name: 'Close' }));
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
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

  it('is the exact class Alert wears', () => {
    render(<Alert color="warning">Skin</Alert>);
    expect(screen.getByRole('alert')).toHaveClass(alertVariants.warning);
  });
});
