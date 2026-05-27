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
});
