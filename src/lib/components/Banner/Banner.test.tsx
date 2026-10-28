import { createRef } from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import Banner from './Banner';
import { bannerVariants } from './index';

describe('Banner', () => {
  it('renders children', () => {
    render(<Banner>Alert message</Banner>);
    expect(screen.getByText('Alert message')).toBeInTheDocument();
  });

  it('applies className', () => {
    const { container } = render(<Banner className="custom">Message</Banner>);
    expect(container.firstChild).toHaveClass('custom');
  });

  it('has a polite status role for the default info severity', () => {
    render(<Banner>Alert</Banner>);
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('maps every severity to its live-region role', () => {
    // Only danger interrupts (role="alert", implicitly assertive);
    // every other severity announces politely via role="status" —
    // Toast's documented convention.
    const { rerender } = render(<Banner color="info">Info</Banner>);
    expect(screen.getByRole('status')).toBeInTheDocument();
    for (const color of ['default', 'primary', 'success', 'warning'] as const) {
      rerender(<Banner color={color}>Message</Banner>);
      expect(screen.getByRole('status')).toBeInTheDocument();
      expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    }
    rerender(<Banner color="danger">Danger</Banner>);
    expect(screen.getByRole('alert')).toBeInTheDocument();
  });

  it('renders close button when onClose provided', () => {
    render(<Banner onClose={vi.fn()}>Message</Banner>);
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
    render(<Banner onClose={vi.fn()}>Message</Banner>);
    await user.click(screen.getByRole('button', { name: 'Close' }));
    expect(screen.queryByText('Message')).not.toBeInTheDocument();
  });

  it('does not render close button without onClose', () => {
    render(<Banner>Message</Banner>);
    expect(screen.queryByRole('button', { name: 'Close' })).not.toBeInTheDocument();
  });

  it('forwards the ref onto the root div', () => {
    const ref = createRef<HTMLDivElement>();
    render(<Banner ref={ref}>Message</Banner>);
    expect(ref.current).toBe(screen.getByRole('status'));
  });

  it('renders with different colors', () => {
    const { container, rerender } = render(<Banner color="success">Success</Banner>);
    expect(container.firstChild).toBeInTheDocument();
    rerender(<Banner color="warning">Warning</Banner>);
    expect(container.firstChild).toBeInTheDocument();
  });

  it('has no axe violations', async () => {
    const { axe } = await import('jest-axe');
    render(<Banner>Scheduled maintenance tonight</Banner>);
    const results = await axe(document.body, {
      rules: { region: { enabled: false } },
    });
    expect(results.violations).toEqual([]);
  });

  it('has no axe violations when dismissible', async () => {
    const { axe } = await import('jest-axe');
    render(<Banner color="warning" onClose={() => undefined}>Cookies are used</Banner>);
    const results = await axe(document.body, {
      rules: { region: { enabled: false } },
    });
    expect(results.violations).toEqual([]);
  });
});

describe('bannerVariants exports', () => {
  it('exposes the color skin classes for composition', () => {
    expect(Object.keys(bannerVariants)).toEqual(['default', 'primary', 'info', 'success', 'warning', 'danger']);
    for (const cls of Object.values(bannerVariants)) {
      expect(cls).toBeTruthy();
    }
  });

  it('is the exact class Banner wears', () => {
    render(<Banner color="danger">Skin</Banner>);
    expect(screen.getByRole('alert')).toHaveClass(bannerVariants.danger);
  });
});
