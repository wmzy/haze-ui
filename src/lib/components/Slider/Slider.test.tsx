import { render, screen, fireEvent } from '@testing-library/react';

import Slider from './Slider';
import SliderCore from './SliderCore';

describe('Slider', () => {
  it('renders a range input', () => {
    render(<Slider aria-label="volume" />);
    expect(screen.getByRole('slider', { name: 'volume' })).toBeInTheDocument();
  });

  it('applies className', () => {
    render(<Slider className="custom" aria-label="volume" />);
    expect(screen.getByRole('slider')).toHaveClass('custom');
  });

  it('defaults to value 50', () => {
    render(<Slider aria-label="volume" />);
    expect(screen.getByRole('slider')).toHaveValue('50');
  });

  it('accepts initial numeric value', () => {
    render(<Slider value={75} aria-label="volume" />);
    expect(screen.getByRole('slider')).toHaveValue('75');
  });

  it('updates value on change', () => {
    const onChange = vi.fn();
    render(<Slider aria-label="volume" onChange={onChange} />);
    fireEvent.change(screen.getByRole('slider'), { target: { value: '30' } });
    expect(screen.getByRole('slider')).toHaveValue('30');
    expect(onChange).toHaveBeenCalled();
  });

  it('forwards native props like min, max, step', () => {
    render(<Slider min={0} max={100} step={5} aria-label="volume" />);
    const slider = screen.getByRole('slider');
    expect(slider).toHaveAttribute('min', '0');
    expect(slider).toHaveAttribute('max', '100');
    expect(slider).toHaveAttribute('step', '5');
  });

  it('forwards disabled prop', () => {
    render(<Slider disabled aria-label="volume" />);
    expect(screen.getByRole('slider')).toBeDisabled();
  });

  it('has no axe violations', async () => {
    const { axe } = await import('jest-axe');
    render(<Slider value={75} aria-label="volume" />);
    // 'region' fires for any content outside a landmark — an artifact of
    // the bare test document, not the component.
    const results = await axe(document.body, {
      rules: { region: { enabled: false } },
    });
    expect(results.violations).toEqual([]);
  });
});

describe('SliderCore', () => {
  it('renders the given value', () => {
    render(<SliderCore value={75} onChange={() => undefined} aria-label="core" />);
    expect(screen.getByRole('slider')).toHaveValue('75');
  });

  it('calls onChange with the numeric value on change', () => {
    const onChange = vi.fn();
    render(<SliderCore value={50} onChange={onChange} aria-label="core" />);
    fireEvent.change(screen.getByRole('slider'), {target: {value: '30'}});
    expect(onChange).toHaveBeenCalledWith(30);
  });
});
