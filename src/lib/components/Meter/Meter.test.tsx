import { expect } from 'vitest';
import { createRef } from 'react';
import { render, screen } from '@testing-library/react';

import { meterFill } from '../../utils/meter-skin';

import Meter from './Meter';
import { trackSizes } from './meter-styles';

// aria-query 5.3+ (DOM Testing Library's role source) knows the ARIA
// 1.1 `meter` role, so getByRole('meter') resolves — asserted here
// rather than falling back to attribute probing.
describe('Meter', () => {
  it('renders a named meter role with value/min/max', () => {
    render(<Meter value={64} label="CPU" />);
    const meter = screen.getByRole('meter', { name: 'CPU' });
    expect(meter).toHaveAttribute('aria-valuenow', '64');
    expect(meter).toHaveAttribute('aria-valuemin', '0');
    expect(meter).toHaveAttribute('aria-valuemax', '100');
  });

  it('renders the visible label and wires aria-labelledby to it', () => {
    render(<Meter value={40} label="CPU" />);
    const label = screen.getByText('CPU');
    expect(label).toBeInTheDocument();
    const meter = screen.getByRole('meter');
    expect(meter).toHaveAttribute(
      'aria-labelledby',
      label.getAttribute('id') ?? '',
    );
  });

  it('normalizes the bar width against min/max', () => {
    render(<Meter value={100} min={0} max={200} />);
    const meter = screen.getByRole('meter');
    expect(meter).toHaveAttribute('aria-valuenow', '100');
    const bar = meter.querySelector('[data-slot="bar"]');
    expect(bar).toHaveStyle({ width: '50%' });
  });

  it('clamps the value into the min–max range', () => {
    const { rerender } = render(<Meter value={150} />);
    expect(screen.getByRole('meter')).toHaveAttribute('aria-valuenow', '100');
    rerender(<Meter value={-10} />);
    expect(screen.getByRole('meter')).toHaveAttribute('aria-valuenow', '0');
  });

  it('shows the reading with showValue', () => {
    render(<Meter value={72} showValue />);
    expect(screen.getByText('72')).toBeInTheDocument();
  });

  it('renders no header without label or showValue', () => {
    render(<Meter value={10} />);
    expect(
      screen.getByRole('meter').querySelector('[data-slot="header"]'),
    ).toBeNull();
  });

  it('colors the band the value falls into (data-color)', () => {
    const { rerender } = render(
      <Meter
        value={20}
        thresholds={[
          { at: 60, color: 'warning' },
          { at: 85, color: 'danger' },
        ]}
      />,
    );
    const meter = screen.getByRole('meter');
    // below the first bound: default color
    expect(meter).toHaveAttribute('data-color', 'primary');

    rerender(
      <Meter
        value={70}
        thresholds={[
          { at: 60, color: 'warning' },
          { at: 85, color: 'danger' },
        ]}
      />,
    );
    expect(meter).toHaveAttribute('data-color', 'warning');
    expect(
      meter.querySelector('[data-slot="track"]'),
    ).toHaveAttribute('data-color', 'warning');
    expect(
      meter.querySelector('[data-slot="bar"]'),
    ).toHaveAttribute('data-color', 'warning');

    rerender(
      <Meter
        value={100}
        thresholds={[
          { at: 60, color: 'warning' },
          { at: 85, color: 'danger' },
        ]}
      />,
    );
    expect(meter).toHaveAttribute('data-color', 'danger');
  });

  it('resolves threshold bands regardless of input order', () => {
    render(
      <Meter
        value={70}
        thresholds={[
          { at: 85, color: 'danger' },
          { at: 60, color: 'warning' },
        ]}
      />,
    );
    expect(screen.getByRole('meter')).toHaveAttribute('data-color', 'warning');
  });

  it('keeps the primary color for a matched band without color', () => {
    render(<Meter value={70} thresholds={[{ at: 60 }]} />);
    expect(screen.getByRole('meter')).toHaveAttribute('data-color', 'primary');
  });

  it('wears the per-size track skin', () => {
    const { rerender } = render(<Meter value={10} size="lg" />);
    const track = () => screen.getByRole('meter').querySelector('[data-slot="track"]');
    expect(track()).toHaveClass(trackSizes.lg);
    rerender(<Meter value={10} size="sm" />);
    expect(track()).toHaveClass(trackSizes.sm);
  });

  it('wears the shared meter fill skin (geometry + motion from meter-skin)', () => {
    render(<Meter value={10} />);
    const bar = screen.getByRole('meter').querySelector('[data-slot="bar"]');
    expect(bar).toHaveClass(meterFill);
  });

  it('applies className and classNames to every slot', () => {
    render(
      <Meter
        value={10}
        label="CPU"
        showValue
        className="custom"
        classNames={{
          root: 'slot-root',
          header: 'slot-header',
          label: 'slot-label',
          value: 'slot-value',
          track: 'slot-track',
          bar: 'slot-bar',
        }}
      />,
    );
    const meter = screen.getByRole('meter');
    expect(meter).toHaveClass('custom');
    expect(meter).toHaveClass('slot-root');
    expect(meter.querySelector('[data-slot="header"]')).toHaveClass('slot-header');
    expect(meter.querySelector('[data-slot="label"]')).toHaveClass('slot-label');
    expect(meter.querySelector('[data-slot="value"]')).toHaveClass('slot-value');
    expect(meter.querySelector('[data-slot="track"]')).toHaveClass('slot-track');
    expect(meter.querySelector('[data-slot="bar"]')).toHaveClass('slot-bar');
  });

  it('forwards ref to the meter root', () => {
    const ref = createRef<HTMLDivElement>();
    render(<Meter ref={ref} value={10} />);
    expect(ref.current).toBe(screen.getByRole('meter'));
  });

  it('forwards native props onto the root', () => {
    render(<Meter value={10} data-testid="gauge" id="cpu-meter" />);
    expect(screen.getByTestId('gauge')).toBe(screen.getByRole('meter'));
    expect(screen.getByRole('meter')).toHaveAttribute('id', 'cpu-meter');
  });

  it('has no axe violations', async () => {
    const { axe } = await import('jest-axe');
    // 'region' fires for any content outside a landmark — an artifact
    // of the bare test document, not the component.
    const options = { rules: { region: { enabled: false } } };
    const { unmount } = render(
      <Meter
        value={70}
        label="CPU"
        showValue
        thresholds={[{ at: 60, color: 'warning' }, { at: 85, color: 'danger' }]}
      />,
    );
    let results = await axe(document.body, options);
    expect(results.violations).toEqual([]);
    unmount();
    // the unnamed shape (no label) only stays clean when the meter
    // is named some other way — axe requires an accessible name on
    // role=meter, so cover the aria-label passthrough shape.
    render(<Meter value={20} aria-label="Load" />);
    results = await axe(document.body, options);
    expect(results.violations).toEqual([]);
  });
});

describe('trackSizes export', () => {
  it('exposes the per-size skin classes for composition', () => {
    expect(Object.keys(trackSizes)).toEqual(['sm', 'md', 'lg']);
    for (const cls of Object.values(trackSizes)) {
      expect(cls).toBeTruthy();
    }
  });
});
