import { render, screen } from '@testing-library/react';

import TokenCounter from './TokenCounter';

describe('TokenCounter', () => {
  it('renders token count', () => {
    render(<TokenCounter used={500} max={4000} />);
    expect(screen.getByText('500 / 4,000')).toBeInTheDocument();
  });

  it('renders default label', () => {
    render(<TokenCounter used={100} max={1000} />);
    expect(screen.getByText('Tokens')).toBeInTheDocument();
  });

  it('renders custom label', () => {
    render(<TokenCounter used={100} max={1000} label="Context" />);
    expect(screen.getByText('Context')).toBeInTheDocument();
  });

  it('applies className', () => {
    const { container } = render(<TokenCounter used={100} max={1000} className="custom" />);
    expect(container.firstChild).toHaveClass('custom');
  });

  it('renders progress bar', () => {
    const { container } = render(<TokenCounter used={500} max={1000} />);
    const bar = container.querySelector('[style*="width"]');
    expect(bar).toBeInTheDocument();
  });
});
