import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import DateRangePicker from './DateRangePicker';

describe('DateRangePicker', () => {
  it('renders two date inputs', () => {
    const { container } = render(<DateRangePicker />);
    const inputs = container.querySelectorAll('input[type="date"]');
    expect(inputs.length).toBe(2);
  });

  it('applies className', () => {
    const { container } = render(<DateRangePicker className="custom" />);
    expect(container.firstChild).toHaveClass('custom');
  });

  it('displays initial values', () => {
    render(<DateRangePicker startDate="2024-01-01" endDate="2024-01-31" />);
    expect(screen.getByDisplayValue('2024-01-01')).toBeInTheDocument();
    expect(screen.getByDisplayValue('2024-01-31')).toBeInTheDocument();
  });

  it('calls onStartChange', async () => {
    const user = userEvent.setup();
    const onStartChange = vi.fn();
    render(<DateRangePicker onStartChange={onStartChange} />);
    const input = document.querySelector('input[type="date"]')!;
    await user.type(input, '2024-01-01');
    expect(onStartChange).toHaveBeenCalled();
  });

  it('renders separator', () => {
    render(<DateRangePicker separator="to" />);
    expect(screen.getByText('to')).toBeInTheDocument();
  });
});
