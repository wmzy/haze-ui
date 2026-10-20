import { render, screen } from '@testing-library/react';
import { createRef, useState } from 'react';
import userEvent from '@testing-library/user-event';
import { useControl } from 'react-use-control';

import TimeField from './TimeField';
import TimeFieldCore from './TimeFieldCore';

const group = () => screen.getByRole('group');
const hour = () => screen.getByRole('spinbutton', { name: 'Hour' });
const minute = () => screen.getByRole('spinbutton', { name: 'Minute' });
const second = () => screen.getByRole('spinbutton', { name: 'Second' });
const dayPeriod = () => screen.getByRole('spinbutton', { name: 'Day period' });

describe('TimeField', () => {
  it('renders hour and minute segments by default', () => {
    render(<TimeField aria-label='Start time' />);
    expect(group()).toHaveAccessibleName('Start time');
    expect(hour()).toHaveTextContent('hh');
    expect(minute()).toHaveTextContent('mm');
    expect(
      screen.queryByRole('spinbutton', { name: 'Second' })
    ).not.toBeInTheDocument();
    expect(hour()).toHaveAttribute('aria-valuemin', '0');
    expect(hour()).toHaveAttribute('aria-valuemax', '23');
    expect(minute()).toHaveAttribute('aria-valuemin', '0');
    expect(minute()).toHaveAttribute('aria-valuemax', '59');
    expect(hour()).toHaveAttribute('tabindex', '0');
    expect(minute()).toHaveAttribute('tabindex', '-1');
  });

  it('parses an initial value into padded segments', () => {
    render(<TimeField value='09:05' />);
    expect(hour()).toHaveTextContent('09');
    expect(hour()).toHaveAttribute('aria-valuenow', '9');
    expect(minute()).toHaveTextContent('05');
    expect(minute()).toHaveAttribute('aria-valuenow', '5');
  });

  it('commits a full time as the user types, auto-advancing segments', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<TimeField onChange={onChange} />);
    // 9 has no valid two-digit continuation beyond 23: complete at once.
    await user.type(hour(), '9');
    expect(minute()).toHaveFocus();
    await user.type(minute(), '30');
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith('09:30');
    expect(hour()).toHaveTextContent('09');
    expect(minute()).toHaveTextContent('30');
  });

  it('wraps hours and minutes per segment on arrow stepping', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<TimeField value='23:59' onChange={onChange} />);
    await user.click(hour());
    await user.keyboard('[ArrowUp]');
    // 23 wraps to 00 — no carry into other segments.
    expect(hour()).toHaveTextContent('00');
    expect(onChange).toHaveBeenLastCalledWith('00:59');
    await user.click(minute());
    await user.keyboard('[ArrowUp]');
    expect(minute()).toHaveTextContent('00');
    expect(onChange).toHaveBeenLastCalledWith('00:00');
  });

  it('steps an empty hour to 0 without committing', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<TimeField onChange={onChange} />);
    await user.click(hour());
    await user.keyboard('[ArrowDown]');
    expect(hour()).toHaveTextContent('00');
    expect(onChange).not.toHaveBeenCalled();
  });

  it('renders and commits a second segment with HH:mm:ss', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<TimeField format='HH:mm:ss' value='09:30:05' onChange={onChange} />);
    expect(second()).toHaveTextContent('05');
    await user.click(second());
    await user.keyboard('[ArrowUp]');
    expect(onChange).toHaveBeenLastCalledWith('09:30:06');
    expect(second()).toHaveTextContent('06');
  });

  it('serializes 12-hour entry as 24-hour values', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<TimeField use12Hours onChange={onChange} />);
    expect(dayPeriod()).toBeInTheDocument();
    await user.type(hour(), '10');
    expect(minute()).toHaveFocus();
    await user.type(minute(), '30');
    expect(dayPeriod()).toHaveFocus();
    await user.keyboard('p');
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith('22:30');
    expect(hour()).toHaveTextContent('10');
    expect(minute()).toHaveTextContent('30');
    expect(dayPeriod()).toHaveTextContent('PM');
  });

  it('parses a 24-hour value into the 12-hour presentation', () => {
    render(<TimeField use12Hours value='22:30' />);
    expect(hour()).toHaveTextContent('10');
    expect(hour()).toHaveAttribute('aria-valuenow', '10');
    expect(dayPeriod()).toHaveTextContent('PM');
    expect(dayPeriod()).toHaveAttribute('aria-valuenow', '1');
    expect(dayPeriod()).toHaveAttribute('aria-valuetext', 'PM');
  });

  it('wraps the 12-hour clock at 12', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<TimeField use12Hours value='00:30' onChange={onChange} />);
    await user.click(hour());
    await user.keyboard('[ArrowUp]');
    expect(hour()).toHaveTextContent('01');
    expect(onChange).toHaveBeenLastCalledWith('01:30');
  });

  it('toggles the day period with arrows and letters', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<TimeField use12Hours value='09:30' onChange={onChange} />);
    expect(dayPeriod()).toHaveTextContent('AM');
    await user.click(dayPeriod());
    await user.keyboard('[ArrowUp]');
    expect(dayPeriod()).toHaveTextContent('PM');
    expect(onChange).toHaveBeenLastCalledWith('21:30');
    await user.keyboard('a');
    expect(dayPeriod()).toHaveTextContent('AM');
    expect(onChange).toHaveBeenLastCalledWith('09:30');
  });

  it('moves between segments with arrows and Tab', async () => {
    const user = userEvent.setup();
    render(<TimeField value='09:30' />);
    await user.click(minute());
    await user.keyboard('[ArrowLeft]');
    expect(hour()).toHaveFocus();
    await user.tab();
    expect(minute()).toHaveFocus();
    await user.tab({ shift: true });
    expect(hour()).toHaveFocus();
  });

  it('flushes a pending entry when Tab leaves the field', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<TimeField value='09:15' onChange={onChange} />);
    await user.click(minute());
    await user.keyboard('[Backspace]2');
    // "2" can still extend to 20–29: buffered, not committed.
    expect(onChange).not.toHaveBeenCalled();
    expect(minute()).toHaveTextContent('2');
    await user.tab();
    expect(onChange).toHaveBeenCalledWith('09:02');
    expect(minute()).toHaveTextContent('02');
  });

  it('Backspace clears the current segment without committing', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<TimeField value='09:30' onChange={onChange} />);
    await user.click(minute());
    await user.keyboard('[Backspace]');
    expect(minute()).toHaveTextContent('mm');
    expect(hour()).toHaveTextContent('09');
    expect(onChange).not.toHaveBeenCalled();
  });

  it('works in controlled mode via a Control', async () => {
    const user = userEvent.setup();
    function Harness({ onChange }: { onChange: (value: string) => void }) {
      const [, , valueCtrl] = useControl(undefined, '08:45');
      return <TimeField value={valueCtrl} onChange={onChange} />;
    }
    const onChange = vi.fn();
    render(<Harness onChange={onChange} />);
    await user.click(minute());
    await user.keyboard('[ArrowUp]');
    expect(onChange).toHaveBeenCalledWith('08:46');
    expect(minute()).toHaveTextContent('46');
  });

  it('disables every segment', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<TimeField value='09:30' disabled onChange={onChange} />);
    for (const segment of [hour(), minute()]) {
      expect(segment).toHaveAttribute('aria-disabled', 'true');
      expect(segment).toHaveAttribute('tabindex', '-1');
    }
    await user.type(minute(), '45');
    await user.keyboard('[ArrowUp]');
    expect(onChange).not.toHaveBeenCalled();
    expect(minute()).toHaveTextContent('30');
  });

  it('forwards rest props to the group and className', () => {
    render(<TimeField data-testid='start' className='custom' aria-label='Start' />);
    expect(screen.getByTestId('start')).toBe(group());
    expect(group()).toHaveClass('custom');
    expect(group()).toHaveAccessibleName('Start');
  });

  it('overrides segment labels and placeholders', () => {
    render(
      <TimeField
        labels={{ hour: 'Stunde', minute: 'Minute' }}
        placeholder={{ hour: 'SS', minute: 'MM' }}
      />
    );
    expect(screen.getByRole('spinbutton', { name: 'Stunde' })).toHaveTextContent('SS');
    expect(screen.getByRole('spinbutton', { name: 'Minute' })).toHaveTextContent('MM');
  });

  it('forwards ref to the tab-stop segment', () => {
    const ref = createRef<HTMLSpanElement>();
    render(<TimeField ref={ref} aria-label='Start time' />);
    expect(ref.current).toBeInstanceOf(HTMLSpanElement);
    ref.current!.focus();
    expect(ref.current).toHaveFocus();
  });

  it('has no axe violations', async () => {
    const { axe } = await import('jest-axe');
    const user = userEvent.setup();
    render(<TimeField use12Hours format='HH:mm:ss' value='22:30:05' aria-label='Start time' />);
    await user.click(dayPeriod());
    const results = await axe(document.body, {
      rules: { region: { enabled: false } },
    });
    expect(results.violations).toEqual([]);
  });
});

describe('TimeFieldCore', () => {
  it('takes a plain value and onChange', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    function Harness() {
      const [value, setValue] = useState('07:10');
      return (
        <TimeFieldCore
          value={value}
          onChange={(next) => {
            setValue(next);
            onChange(next);
          }}
        />
      );
    }
    render(<Harness />);
    await user.click(hour());
    await user.keyboard('[ArrowDown]');
    expect(onChange).toHaveBeenCalledWith('06:10');
    expect(hour()).toHaveTextContent('06');
  });
});
