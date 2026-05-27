import { render, screen } from '@testing-library/react';

import AspectRatio from './AspectRatio';

describe('AspectRatio', () => {
  it('renders children', () => {
    render(<AspectRatio>Content</AspectRatio>);
    expect(screen.getByText('Content')).toBeInTheDocument();
  });

  it('applies className', () => {
    const { container } = render(<AspectRatio className="custom">Content</AspectRatio>);
    expect(container.firstChild).toHaveClass('custom');
  });

  it('applies default 16:9 ratio', () => {
    const { container } = render(<AspectRatio>Content</AspectRatio>);
    const el = container.firstChild as HTMLElement;
    expect(el.style.paddingBottom).toBe('56.25%');
  });

  it('applies custom ratio', () => {
    const { container } = render(<AspectRatio ratio={4 / 3}>Content</AspectRatio>);
    const el = container.firstChild as HTMLElement;
    expect(el.style.paddingBottom).toBe('75%');
  });

  it('applies 1:1 ratio', () => {
    const { container } = render(<AspectRatio ratio={1}>Content</AspectRatio>);
    const el = container.firstChild as HTMLElement;
    expect(el.style.paddingBottom).toBe('100%');
  });
});
