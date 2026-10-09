import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import DateTimePicker from './DateTimePicker';

describe('DateTimePicker', () => {
  it('marks the root wrapper as data-slot=datetime-picker', () => {
    const { container } = render(<DateTimePicker value='2025-01-15 14:30' />);
    // 该属性曾经只传给不展开的 Datepicker props 而被静默丢弃；
    // rest 透传落地后必须真的落在包装 div 上
    expect(container.firstChild).toHaveAttribute('data-slot', 'datetime-picker');
  });

  it('renders the date-time trigger input with a date+time value', () => {
    render(<DateTimePicker value='2025-01-15 14:30' />);
    // the trigger is Datepicker's readonly date field; the time part
    // rides the same value string
    expect(screen.getByPlaceholderText('Select date')).toHaveValue('2025-01-15 14:30');
  });

  it('opens the calendar panel with the time row on focus', async () => {
    const user = userEvent.setup();
    render(<DateTimePicker value='2025-01-15 14:30' />);
    await user.click(screen.getByPlaceholderText('Select date'));
    expect(screen.getByRole('grid')).toBeInTheDocument();
    // the showTime row is a time input below the grid
    expect(screen.getByDisplayValue('14:30')).toBeInTheDocument();
  });

  it('honors the seconds form', () => {
    render(<DateTimePicker showSeconds value='2025-01-15 14:30:07' />);
    expect(screen.getByPlaceholderText('Select date')).toHaveValue('2025-01-15 14:30:07');
  });

  it('uncontrolled: opens empty and accepts a panel pick value', async () => {
    const user = userEvent.setup();
    render(<DateTimePicker />);
    expect(screen.getByPlaceholderText('Select date')).toHaveValue('');
    await user.click(screen.getByPlaceholderText('Select date'));
    expect(screen.getByRole('grid')).toBeInTheDocument();
  });

  it('has no axe violations while open', async () => {
    const { axe } = await import('jest-axe');
    const user = userEvent.setup();
    render(<DateTimePicker value='2025-01-15 14:30' />);
    await user.click(screen.getByPlaceholderText('Select date'));
    const results = await axe(document.body, {
      rules: { region: { enabled: false } },
    });
    expect(results.violations).toEqual([]);
  });
});
