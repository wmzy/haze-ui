import { createRef } from 'react';
import { render, screen } from '@testing-library/react';

import Spinner from './Spinner';

describe('Spinner', () => {
  it('renders with role="status"', () => {
    render(<Spinner />);
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('has aria-label "Loading"', () => {
    render(<Spinner />);
    expect(screen.getByRole('status')).toHaveAttribute('aria-label', 'Loading');
  });

  it('applies className', () => {
    render(<Spinner className="custom" />);
    expect(screen.getByRole('status')).toHaveClass('custom');
  });

  it('renders an SVG', () => {
    const { container } = render(<Spinner />);
    expect(container.querySelector('svg')).toBeInTheDocument();
  });

  it('attaches ref to the root span', () => {
    const ref = createRef<HTMLSpanElement>();
    render(<Spinner ref={ref} />);
    expect(ref.current).toBe(screen.getByRole('status'));
    expect(ref.current).toHaveAttribute('data-slot', 'spinner');
  });

  it('has no axe violations', async () => {
    const { axe } = await import('jest-axe');
    render(<Spinner />);
    // 'region' fires for any content outside a landmark — an artifact of
    // the bare test document, not the component.
    const results = await axe(document.body, {
      rules: { region: { enabled: false } },
    });
    expect(results.violations).toEqual([]);
  });
});
