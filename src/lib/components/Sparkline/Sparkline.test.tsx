import { render, screen } from '@testing-library/react';

import Sparkline from './Sparkline';
import { toneFills, toneStrokes } from './sparkline-styles';

const DATA = [3, 7, 4, 9, 6];

describe('Sparkline', () => {
  it('renders an svg with data-slot and default sizing', () => {
    render(<Sparkline data={DATA} data-testid='spark' />);
    const svg = screen.getByTestId('spark');
    expect(svg.tagName.toLowerCase()).toBe('svg');
    expect(svg).toHaveAttribute('data-slot', 'sparkline');
    expect(svg).toHaveAttribute('width', '96');
    expect(svg).toHaveAttribute('height', '28');
    expect(svg).toHaveAttribute('viewBox', '0 0 100 100');
    expect(svg).toHaveAttribute('preserveAspectRatio', 'none');
  });

  it('supports custom width and height', () => {
    render(<Sparkline data={DATA} width={120} height={40} data-testid='spark' />);
    const svg = screen.getByTestId('spark');
    expect(svg).toHaveAttribute('width', '120');
    expect(svg).toHaveAttribute('height', '40');
  });

  it('draws one stroked polyline path for the line variant', () => {
    const { container } = render(<Sparkline data={DATA} />);
    const paths = container.querySelectorAll('path');
    expect(paths.length).toBe(1);
    const line = paths.item(0);
    expect(line.getAttribute('d')).toMatch(/^M\d/);
    expect(line).toHaveAttribute('fill', 'none');
    expect(line).toHaveAttribute('stroke-linecap', 'round');
    expect(line).toHaveAttribute('stroke-linejoin', 'round');
    expect(line).toHaveAttribute('vector-effect', 'non-scaling-stroke');
  });

  it('adds a filled area path under the line for the area variant', () => {
    const { container } = render(<Sparkline data={DATA} variant='area' />);
    const paths = container.querySelectorAll('path');
    expect(paths.length).toBe(2);
    const area = paths.item(0);
    // area d = the line d closed down to the viewBox bottom edge
    expect(area.getAttribute('d')).toBe(
      `${paths.item(1).getAttribute('d')} L100.00 100.00 L0.00 100.00 Z`,
    );
    expect(area).toHaveAttribute('stroke', 'none');
  });

  it('normalizes point coordinates into the viewBox', () => {
    // [0, 10] spans the padded y band [92, 8] and the full x range [0, 100]
    const { container } = render(<Sparkline data={[0, 10]} />);
    expect(container.querySelector('path')?.getAttribute('d')).toBe(
      'M0.00 92.00 L100.00 8.00',
    );
  });

  it('renders flat data as a midline', () => {
    const { container } = render(<Sparkline data={[5, 5, 5]} />);
    expect(container.querySelector('path')?.getAttribute('d')).toBe(
      'M0.00 50.00 L50.00 50.00 L100.00 50.00',
    );
  });

  it('renders zero paths for empty or single-point data', () => {
    const { container } = render(<Sparkline data={[]} data-testid='spark' />);
    expect(container.querySelectorAll('path').length).toBe(0);
    expect(screen.getByTestId('spark').tagName.toLowerCase()).toBe('svg');

    const { container: single } = render(<Sparkline data={[42]} />);
    expect(single.querySelectorAll('path').length).toBe(0);
  });

  it('maps tone to the stroke and fill variant classes', () => {
    const { container } = render(<Sparkline data={DATA} tone='danger' />);
    const line = container.querySelectorAll('path').item(0);
    expect(line).toHaveClass(toneStrokes.danger);
    expect(line).not.toHaveClass(toneStrokes.primary);

    const { container: area } = render(
      <Sparkline data={DATA} variant='area' tone='success' />,
    );
    const paths = area.querySelectorAll('path');
    expect(paths.item(0)).toHaveClass(toneFills.success);
    expect(paths.item(1)).toHaveClass(toneStrokes.success);
  });

  it('exposes the tone skin maps for composition', () => {
    expect(Object.keys(toneStrokes)).toEqual([
      'primary',
      'success',
      'danger',
      'warning',
      'info',
    ]);
    expect(Object.keys(toneFills)).toEqual([
      'primary',
      'success',
      'danger',
      'warning',
      'info',
    ]);
  });

  it('is hidden from the accessibility tree by default', () => {
    render(<Sparkline data={DATA} data-testid='spark' />);
    const svg = screen.getByTestId('spark');
    expect(svg).toHaveAttribute('aria-hidden', 'true');
    expect(svg).not.toHaveAttribute('role');
    expect(screen.queryByRole('img')).toBeNull();
  });

  it('becomes a named image when aria-label is passed', () => {
    render(<Sparkline data={DATA} aria-label='Weekly signups' />);
    const img = screen.getByRole('img', { name: 'Weekly signups' });
    expect(img).toBeInTheDocument();
    expect(img).not.toHaveAttribute('aria-hidden');
  });

  it('stays hidden for an empty aria-label', () => {
    render(<Sparkline data={DATA} aria-label='' data-testid='spark' />);
    const svg = screen.getByTestId('spark');
    expect(svg).toHaveAttribute('aria-hidden', 'true');
    expect(svg).not.toHaveAttribute('role');
  });

  it('becomes a named image when aria-labelledby is passed', () => {
    // aria-labelledby is a naming path too — an externally named
    // sparkline must not be erased by the decorative aria-hidden.
    render(
      <>
        <span id='spark-caption'>Latency trend</span>
        <Sparkline data={DATA} aria-labelledby='spark-caption' />,
      </>
    );
    const img = screen.getByRole('img', { name: 'Latency trend' });
    expect(img).not.toHaveAttribute('aria-hidden');
  });

  it('applies className', () => {
    render(<Sparkline data={DATA} className='custom' data-testid='spark' />);
    expect(screen.getByTestId('spark')).toHaveClass('custom');
  });

  it('forwards native svg props', () => {
    // `id` and `tabIndex`? — stick to attributes that exist on the SVG
    // attribute surface (`dir` is HTML-only in React's SVGAttributes).
    render(<Sparkline data={DATA} id='trend' data-testid='spark' />);
    const svg = screen.getByTestId('spark');
    expect(svg).toHaveAttribute('id', 'trend');
    expect(svg).toHaveAttribute('data-testid', 'spark');
  });

  it('has no axe violations', async () => {
    const { axe } = await import('jest-axe');
    const { rerender } = render(<Sparkline data={DATA} />);
    // 'region' fires for any content outside a landmark — an artifact of
    // the bare test document, not the component.
    let results = await axe(document.body, {
      rules: { region: { enabled: false } },
    });
    expect(results.violations).toEqual([]);

    rerender(
      <Sparkline
        data={DATA}
        variant='area'
        tone='success'
        aria-label='Weekly signups trend'
      />,
    );
    results = await axe(document.body, {
      rules: { region: { enabled: false } },
    });
    expect(results.violations).toEqual([]);
  });
});
