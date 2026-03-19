import { render, screen, fireEvent } from '@testing-library/react';

import Slider from './Slider';

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
});
