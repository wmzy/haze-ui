import { render, screen } from '@testing-library/react';

import Progress from './Progress';

describe('Progress', () => {
  it('renders a progressbar', () => {
    render(<Progress value={50} />);
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('has correct aria-valuemin, aria-valuemax, aria-valuenow', () => {
    render(<Progress value={30} />);
    const el = screen.getByRole('progressbar');
    expect(el).toHaveAttribute('aria-valuemin', '0');
    expect(el).toHaveAttribute('aria-valuemax', '100');
    expect(el).toHaveAttribute('aria-valuenow', '30');
  });

  it('defaults value to 0', () => {
    render(<Progress />);
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '0');
  });

  it('applies className', () => {
    render(<Progress className="custom" value={50} />);
    expect(screen.getByRole('progressbar')).toHaveClass('custom');
  });

  it('renders bar variant by default', () => {
    const { container } = render(<Progress value={50} />);
    expect(container.querySelector('[role="progressbar"]')).toBeInTheDocument();
  });

  it('renders circle variant', () => {
    const { container } = render(<Progress variant="circle" value={75} />);
    expect(container.querySelector('svg')).toBeInTheDocument();
  });

  it('clamps value to 0-100', () => {
    render(<Progress value={150} />);
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '100');
  });
});
