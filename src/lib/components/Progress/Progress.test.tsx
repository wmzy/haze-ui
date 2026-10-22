import { render, screen } from '@testing-library/react';

import Progress from './Progress';
import { barSizes, circleSizes } from './index';

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

  it('defaults aria-label to Progress and accepts a custom one', () => {
    const { rerender } = render(<Progress value={10} />);
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-label', 'Progress');
    rerender(<Progress value={10} aria-label="上传进度" />);
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-label', '上传进度');
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

  it('has no axe violations', async () => {
    const { axe } = await import('jest-axe');
    // 'region' fires for any content outside a landmark — an artifact of
    // the bare test document, not the component.
    const options = { rules: { region: { enabled: false } } };
    const { unmount } = render(<Progress value={50} />);
    let results = await axe(document.body, options);
    expect(results.violations).toEqual([]);
    unmount();
    render(<Progress variant="circle" value={75} />);
    results = await axe(document.body, options);
    expect(results.violations).toEqual([]);
  });
});

describe('barSizes / circleSizes exports', () => {
  it('expose the per-size skin classes for composition', () => {
    expect(Object.keys(barSizes)).toEqual(['sm', 'md', 'lg']);
    expect(Object.keys(circleSizes)).toEqual(['sm', 'md', 'lg']);
    for (const cls of [...Object.values(barSizes), ...Object.values(circleSizes)]) {
      expect(cls).toBeTruthy();
    }
  });

  it('are the exact classes Progress wears', () => {
    const { rerender } = render(<Progress variant="bar" size="lg" value={10} />);
    expect(screen.getByRole('progressbar')).toHaveClass(barSizes.lg);
    rerender(<Progress variant="circle" size="sm" value={10} />);
    expect(screen.getByRole('progressbar')).toHaveClass(circleSizes.sm);
  });
});
