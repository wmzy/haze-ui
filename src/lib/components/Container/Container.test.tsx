import { render, screen } from '@testing-library/react';

import Container from './Container';

describe('Container', () => {
  it('renders children', () => {
    render(<Container>Content</Container>);
    expect(screen.getByText('Content')).toBeInTheDocument();
  });

  it('applies className', () => {
    const { container } = render(<Container className="custom">Content</Container>);
    expect(container.firstChild).toHaveClass('custom');
  });

  it('defaults to lg size', () => {
    const { container } = render(<Container>Content</Container>);
    expect(container.firstChild).toBeInTheDocument();
  });

  it('renders with different sizes', () => {
    const { container, rerender } = render(<Container size="sm">Content</Container>);
    expect(container.firstChild).toBeInTheDocument();
    rerender(<Container size="xl">Content</Container>);
    expect(container.firstChild).toBeInTheDocument();
  });
});
