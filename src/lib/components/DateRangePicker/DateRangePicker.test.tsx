import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import DateRangePicker from './DateRangePicker';
import DateRangePickerCore from './DateRangePickerCore';

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

describe('DateRangePickerCore', () => {
  it('renders the given start and end values', () => {
    render(
      <DateRangePickerCore
        startDate="2024-01-01"
        endDate="2024-01-31"
        onStartChange={() => undefined}
        onEndChange={() => undefined}
      />
    );
    expect(screen.getByDisplayValue('2024-01-01')).toBeInTheDocument();
    expect(screen.getByDisplayValue('2024-01-31')).toBeInTheDocument();
  });

  it('calls onStartChange with the new start value', () => {
    const onStartChange = vi.fn();
    render(
      <DateRangePickerCore
        startDate=""
        endDate=""
        onStartChange={onStartChange}
        onEndChange={() => undefined}
      />
    );
    const input = document.querySelector('input[type="date"]')!;
    fireEvent.change(input, {target: {value: '2024-01-01'}});
    expect(onStartChange).toHaveBeenCalledWith('2024-01-01');
  });

  it('calls onEndChange with the new end value', () => {
    const onEndChange = vi.fn();
    render(
      <DateRangePickerCore
        startDate=""
        endDate=""
        onStartChange={() => undefined}
        onEndChange={onEndChange}
      />
    );
    const inputs = document.querySelectorAll('input[type="date"]');
    fireEvent.change(inputs[1]!, {target: {value: '2024-01-31'}});
    expect(onEndChange).toHaveBeenCalledWith('2024-01-31');
  });

  it('has no axe violations', async () => {
    const { axe } = await import('jest-axe');
    render(
      <DateRangePicker startDate="2024-01-01" endDate="2024-01-31" separator="to" />
    );
    const results = await axe(document.body, {
      rules: { region: { enabled: false } },
    });
    expect(results.violations).toEqual([]);
  });
});
