import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import NumberInput from './NumberInput';

describe('NumberInput', () => {
  it('renders a number input with stepper buttons', () => {
    render(<NumberInput aria-label="quantity" />);
    expect(screen.getByRole('spinbutton')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Decrease' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Increase' })).toBeInTheDocument();
  });

  it('defaults to 0', () => {
    render(<NumberInput aria-label="quantity" />);
    expect(screen.getByRole('spinbutton')).toHaveValue(0);
  });

  it('accepts initial value', () => {
    render(<NumberInput value={10} aria-label="quantity" />);
    expect(screen.getByRole('spinbutton')).toHaveValue(10);
  });

  it('increments on + click', async () => {
    const user = userEvent.setup();
    render(<NumberInput aria-label="quantity" />);
    await user.click(screen.getByRole('button', { name: 'Increase' }));
    expect(screen.getByRole('spinbutton')).toHaveValue(1);
  });

  it('decrements on - click', async () => {
    const user = userEvent.setup();
    render(<NumberInput value={5} aria-label="quantity" />);
    await user.click(screen.getByRole('button', { name: 'Decrease' }));
    expect(screen.getByRole('spinbutton')).toHaveValue(4);
  });

  it('respects min boundary', async () => {
    const user = userEvent.setup();
    render(<NumberInput value={0} min={0} aria-label="quantity" />);
    expect(screen.getByRole('button', { name: 'Decrease' })).toBeDisabled();
    await user.click(screen.getByRole('button', { name: 'Increase' }));
    expect(screen.getByRole('spinbutton')).toHaveValue(1);
  });

  it('respects max boundary', async () => {
    const user = userEvent.setup();
    render(<NumberInput value={10} max={10} aria-label="quantity" />);
    expect(screen.getByRole('button', { name: 'Increase' })).toBeDisabled();
    await user.click(screen.getByRole('button', { name: 'Decrease' }));
    expect(screen.getByRole('spinbutton')).toHaveValue(9);
  });

  it('uses custom step', async () => {
    const user = userEvent.setup();
    render(<NumberInput value={0} step={5} aria-label="quantity" />);
    await user.click(screen.getByRole('button', { name: 'Increase' }));
    expect(screen.getByRole('spinbutton')).toHaveValue(5);
  });

  it('updates value on direct input change', () => {
    const onChange = vi.fn();
    render(<NumberInput aria-label="quantity" onChange={onChange} />);
    fireEvent.change(screen.getByRole('spinbutton'), { target: { value: '42' } });
    expect(screen.getByRole('spinbutton')).toHaveValue(42);
    expect(onChange).toHaveBeenCalled();
  });

  it('ignores NaN input', () => {
    render(<NumberInput aria-label="quantity" />);
    fireEvent.change(screen.getByRole('spinbutton'), { target: { value: 'abc' } });
    expect(screen.getByRole('spinbutton')).toHaveValue(0);
  });

  it('applies className', () => {
    const { container } = render(<NumberInput className="custom" aria-label="quantity" />);
    expect(container.firstChild).toHaveClass('custom');
  });
});
