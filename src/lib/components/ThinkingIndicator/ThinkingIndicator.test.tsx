import { render, screen } from '@testing-library/react';

import ThinkingIndicator from './ThinkingIndicator';

describe('ThinkingIndicator', () => {
  it('renders default text', () => {
    render(<ThinkingIndicator />);
    expect(screen.getByText('Thinking')).toBeInTheDocument();
  });

  it('renders custom text', () => {
    render(<ThinkingIndicator text="Analyzing" />);
    expect(screen.getByText('Analyzing')).toBeInTheDocument();
  });

  it('applies className', () => {
    const { container } = render(<ThinkingIndicator className="custom" />);
    expect(container.firstChild).toHaveClass('custom');
  });

  it('renders dots', () => {
    const { container } = render(<ThinkingIndicator />);
    const dots = container.querySelectorAll('span > span');
    expect(dots.length).toBe(3);
  });
});
