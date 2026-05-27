import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import TimePicker from './TimePicker';

describe('TimePicker', () => {
  it('renders a time input', () => {
    const { container } = render(<TimePicker />);
    expect(container.querySelector('input[type="time"]')).toBeInTheDocument();
  });

  it('displays initial value', () => {
    render(<TimePicker value="14:30" />);
    expect(screen.getByDisplayValue('14:30')).toBeInTheDocument();
  });

  it('applies className', () => {
    const { container } = render(<TimePicker className="custom" />);
    expect(container.querySelector('input[type="time"]')).toHaveClass('custom');
  });

  it('calls onChange on input change', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<TimePicker onChange={onChange} />);
    const input = document.querySelector('input[type="time"]')!;
    await user.type(input, '10:00');
    expect(onChange).toHaveBeenCalled();
  });

  it('renders with placeholder', () => {
    const { container } = render(<TimePicker placeholder="Select time" />);
    expect(container.querySelector('input[placeholder="Select time"]')).toBeInTheDocument();
  });
});
