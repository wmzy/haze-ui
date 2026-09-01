import { render, screen, fireEvent } from '@testing-library/react';

import BackToTop from './BackToTop';

describe('BackToTop', () => {
  it('renders a button', () => {
    render(<BackToTop />);
    expect(screen.getByRole('button', { name: 'Back to top' })).toBeInTheDocument();
  });

  it('applies className', () => {
    render(<BackToTop className="custom" />);
    expect(screen.getByRole('button')).toHaveClass('custom');
  });

  it('renders custom children', () => {
    render(<BackToTop>Top</BackToTop>);
    expect(screen.getByText('Top')).toBeInTheDocument();
  });

  it('scrolls to top on click', () => {
    const scrollTo = vi.fn();
    Object.defineProperty(window, 'scrollTo', { value: scrollTo, writable: true });
    render(<BackToTop />);
    fireEvent.click(screen.getByRole('button'));
    expect(scrollTo).toHaveBeenCalledWith({ top: 0, behavior: 'smooth' });
  });

  it('has no axe violations', async () => {
    const { axe } = await import('jest-axe');
    render(<BackToTop />);
    const results = await axe(document.body, {
      rules: { region: { enabled: false } },
    });
    expect(results.violations).toEqual([]);
  });
});
