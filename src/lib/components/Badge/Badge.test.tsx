import { render, screen } from '@testing-library/react';

import Badge from './Badge';

describe('Badge', () => {
  it('renders children', () => {
    render(<Badge>New</Badge>);
    expect(screen.getByText('New')).toBeInTheDocument();
  });

  it('renders as a span', () => {
    const { container } = render(<Badge>Tag</Badge>);
    expect(container.firstChild?.nodeName).toBe('SPAN');
  });

  it('applies className', () => {
    render(<Badge className="custom">New</Badge>);
    expect(screen.getByText('New')).toHaveClass('custom');
  });
});
