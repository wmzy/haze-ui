import { render } from '@testing-library/react';

import { SpinnerGlyph, spinAnimation } from './spinner-glyph';

describe('SpinnerGlyph', () => {
  it('renders the ring + arc geometry at 24 units', () => {
    const { container } = render(<SpinnerGlyph />);
    const svg = container.querySelector('svg')!;
    expect(svg).toHaveAttribute('viewBox', '0 0 24 24');
    expect(svg).toHaveAttribute('fill', 'none');
    const circle = svg.querySelector('circle')!;
    expect(circle).toHaveAttribute('cx', '12');
    expect(circle).toHaveAttribute('cy', '12');
    expect(circle).toHaveAttribute('r', '10');
    expect(circle).toHaveAttribute('stroke', 'var(--haze-color-border)');
    const path = svg.querySelector('path')!;
    expect(path).toHaveAttribute('d', 'M12 2a10 10 0 0 1 10 10');
    expect(path).toHaveAttribute('stroke', 'var(--haze-color-primary)');
  });

  it('is aria-hidden art by default and forwards props onto the svg', () => {
    const { container } = render(<SpinnerGlyph data-slot='icon' className='sizing' />);
    const svg = container.querySelector('svg')!;
    expect(svg).toHaveAttribute('aria-hidden', 'true');
    expect(svg).toHaveAttribute('data-slot', 'icon');
    expect(svg).toHaveClass('sizing');
  });

  it('exposes the shared spin animation class', () => {
    expect(typeof spinAnimation).toBe('string');
    expect(spinAnimation).toBeTruthy();
  });
});
