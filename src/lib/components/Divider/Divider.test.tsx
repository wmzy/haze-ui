import { render, screen } from '@testing-library/react';

import Divider from './Divider';

describe('Divider', () => {
  it('renders an hr element', () => {
    render(<Divider />);
    expect(screen.getByRole('separator')).toBeInTheDocument();
  });

  it('applies className', () => {
    render(<Divider className="custom" />);
    expect(screen.getByRole('separator')).toHaveClass('custom');
  });

  it('renders horizontal by default', () => {
    render(<Divider />);
    const el = screen.getByRole('separator');
    expect(el).toBeInTheDocument();
  });

  it('renders vertical divider', () => {
    const { container } = render(<Divider orientation="vertical" />);
    const el = container.firstChild as HTMLElement;
    expect(el.tagName).toBe('DIV');
    expect(el).toHaveAttribute('role', 'separator');
    expect(el).toHaveAttribute('aria-orientation', 'vertical');
  });
});
