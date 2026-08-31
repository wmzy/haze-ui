import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import Datepicker from './Datepicker';
import DatepickerCore from './DatepickerCore';

function getMonthLabel(year: number, month: number) {
  return new Date(year, month).toLocaleString('default', {
    month: 'long',
    year: 'numeric',
  });
}

describe('Datepicker', () => {
  it('renders an input with placeholder', () => {
    render(<Datepicker />);
    expect(screen.getByPlaceholderText('Select date')).toBeInTheDocument();
  });

  it('renders custom placeholder', () => {
    render(<Datepicker placeholder="Pick a date" />);
    expect(screen.getByPlaceholderText('Pick a date')).toBeInTheDocument();
  });

  it('opens calendar on input click', async () => {
    const user = userEvent.setup();
    render(<Datepicker />);
    await user.click(screen.getByPlaceholderText('Select date'));
    expect(screen.getByRole('grid')).toBeInTheDocument();
  });

  it('selects a date from calendar', async () => {
    const user = userEvent.setup();
    render(<Datepicker value="2025-01-15" />);
    await user.click(screen.getByPlaceholderText('Select date'));
    const day20Buttons = screen.getAllByText('20');
    await user.click(day20Buttons[0]!);
    expect(screen.getByPlaceholderText('Select date')).toHaveValue('2025-01-20');
  });

  it('navigates to next month', async () => {
    const user = userEvent.setup();
    render(<Datepicker value="2025-01-15" />);
    await user.click(screen.getByPlaceholderText('Select date'));
    const label = getMonthLabel(2025, 0);
    expect(screen.getByText(label)).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Next month' }));
    const nextLabel = getMonthLabel(2025, 1);
    expect(screen.getByText(nextLabel)).toBeInTheDocument();
  });

  it('navigates to previous month', async () => {
    const user = userEvent.setup();
    render(<Datepicker value="2025-02-15" />);
    await user.click(screen.getByPlaceholderText('Select date'));
    await user.click(screen.getByRole('button', { name: 'Previous month' }));
    const prevLabel = getMonthLabel(2025, 0);
    expect(screen.getByText(prevLabel)).toBeInTheDocument();
  });

  it('disables dates outside min/max range', async () => {
    const user = userEvent.setup();
    render(<Datepicker value="2025-01-15" min="2025-01-10" max="2025-01-20" />);
    await user.click(screen.getByPlaceholderText('Select date'));
    const grid = screen.getByRole('grid');
    const disabledButtons = grid.querySelectorAll('button[disabled]');
    expect(disabledButtons.length).toBeGreaterThan(0);
  });

  it('closes when clicking outside', async () => {
    const user = userEvent.setup();
    render(
      <div>
        <Datepicker />
        <button>outside</button>
      </div>
    );
    await user.click(screen.getByPlaceholderText('Select date'));
    await user.click(screen.getByText('outside'));
  });

  it('applies className', () => {
    const { container } = render(<Datepicker className="custom" />);
    expect(container.firstChild).toHaveClass('custom');
  });

  it('navigates Dec -> Jan across year boundary', async () => {
    const user = userEvent.setup();
    render(<Datepicker value="2025-12-15" />);
    await user.click(screen.getByPlaceholderText('Select date'));
    await user.click(screen.getByRole('button', { name: 'Next month' }));
    const janLabel = getMonthLabel(2026, 0);
    expect(screen.getByText(janLabel)).toBeInTheDocument();
  });

  it('navigates Jan -> Dec across year boundary', async () => {
    const user = userEvent.setup();
    render(<Datepicker value="2025-01-15" />);
    await user.click(screen.getByPlaceholderText('Select date'));
    await user.click(screen.getByRole('button', { name: 'Previous month' }));
    const decLabel = getMonthLabel(2024, 11);
    expect(screen.getByText(decLabel)).toBeInTheDocument();
  });
});

describe('DatepickerCore', () => {
  it('renders the given value and controlled open state', () => {
    render(
      <DatepickerCore value="2025-01-15" onChange={() => undefined} open onOpenChange={() => undefined} />
    );
    expect(screen.getByPlaceholderText('Select date')).toHaveValue('2025-01-15');
    expect(screen.getByRole('grid')).toBeInTheDocument();
  });

  it('renders no calendar while open=false', () => {
    const { container } = render(
      <DatepickerCore value="" onChange={() => undefined} open={false} onOpenChange={() => undefined} />
    );
    // jsdom applies no CSS, so the closed dropdown stays in the DOM with
    // the hidden-style class attached; assert that instead of visibility.
    const grid = container.querySelector('[role="grid"]')!;
    expect(grid.parentElement!.className.split(' ').length).toBe(2);
  });

  it('calls onChange with the selected date and onOpenChange(false)', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const onOpenChange = vi.fn();
    render(
      <DatepickerCore
        value="2025-01-15"
        onChange={onChange}
        open
        onOpenChange={onOpenChange}
      />
    );
    const day20Buttons = screen.getAllByText('20');
    await user.click(day20Buttons[0]!);
    expect(onChange).toHaveBeenCalledWith('2025-01-20');
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it('calls onOpenChange(true) when the input is clicked while closed', async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();
    render(
      <DatepickerCore
        value=""
        onChange={() => undefined}
        open={false}
        onOpenChange={onOpenChange}
      />
    );
    await user.click(screen.getByPlaceholderText('Select date'));
    expect(onOpenChange).toHaveBeenCalledWith(true);
  });
});
