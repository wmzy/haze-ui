import { render, screen } from '@testing-library/react';
import { createRef, useState } from 'react';
import userEvent from '@testing-library/user-event';
import { useControl } from 'react-use-control';

import DateField from './DateField';
import DateFieldCore from './DateFieldCore';

const group = () => screen.getByRole('group');
const year = () => screen.getByRole('spinbutton', { name: 'Year' });
const month = () => screen.getByRole('spinbutton', { name: 'Month' });
const day = () => screen.getByRole('spinbutton', { name: 'Day' });

describe('DateField', () => {
  it('renders a group of three spinbutton segments with placeholders', () => {
    render(<DateField aria-label='Birth date' />);
    expect(group()).toHaveAccessibleName('Birth date');
    expect(year()).toHaveTextContent('yyyy');
    expect(month()).toHaveTextContent('mm');
    expect(day()).toHaveTextContent('dd');
    expect(year()).toHaveAttribute('aria-valuemin', '1');
    expect(year()).toHaveAttribute('aria-valuemax', '9999');
    expect(month()).toHaveAttribute('aria-valuemin', '1');
    expect(month()).toHaveAttribute('aria-valuemax', '12');
    expect(day()).toHaveAttribute('aria-valuemin', '1');
    expect(day()).toHaveAttribute('aria-valuemax', '31');
    // Roving tabindex: one tab stop inside the field.
    expect(year()).toHaveAttribute('tabindex', '0');
    expect(month()).toHaveAttribute('tabindex', '-1');
    expect(day()).toHaveAttribute('tabindex', '-1');
  });

  it('parses an initial value into padded segments', () => {
    render(<DateField value='2026-03-09' locale='en-US' />);
    expect(year()).toHaveTextContent('2026');
    expect(year()).toHaveAttribute('aria-valuenow', '2026');
    expect(month()).toHaveTextContent('03');
    expect(month()).toHaveAttribute('aria-valuenow', '3');
    expect(month()).toHaveAttribute('aria-valuetext', 'March');
    expect(day()).toHaveTextContent('09');
    expect(day()).toHaveAttribute('aria-valuenow', '9');
  });

  it('commits a full ISO date as the user types, auto-advancing segments', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<DateField onChange={onChange} />);
    await user.type(year(), '2026');
    // Four digits gathered: focus jumped to the month.
    expect(month()).toHaveFocus();
    await user.type(month(), '3');
    // 3 has no valid two-digit continuation (30+ > 12): complete at once.
    expect(day()).toHaveFocus();
    await user.type(day(), '9');
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith('2026-03-09');
    expect(year()).toHaveTextContent('2026');
    expect(month()).toHaveTextContent('03');
    expect(day()).toHaveTextContent('09');
    expect(group()).not.toHaveAttribute('data-invalid');
  });

  it('buffers a single digit that can still extend', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<DateField onChange={onChange} />);
    await user.type(month(), '1');
    expect(month()).toHaveTextContent('1');
    expect(month()).toHaveFocus();
    await user.type(month(), '2');
    expect(month()).toHaveTextContent('12');
    expect(day()).toHaveFocus();
    // Nothing complete yet: no commit for partial entry.
    expect(onChange).not.toHaveBeenCalled();
  });

  it('restarts the buffer when digits exceed the segment maximum', async () => {
    const user = userEvent.setup();
    render(<DateField value='2026-01-28' />);
    await user.type(month(), '15');
    // "15" is not a month: the 5 restarts the entry.
    expect(month()).toHaveTextContent('05');
  });

  it('steps and wraps months and days with ArrowUp/ArrowDown', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<DateField value='2026-12-30' onChange={onChange} />);
    await user.click(month());
    await user.keyboard('[ArrowUp]');
    // 12 wraps up to January.
    expect(month()).toHaveTextContent('01');
    expect(onChange).toHaveBeenLastCalledWith('2026-01-30');
    await user.click(day());
    await user.keyboard('[ArrowDown]');
    // 30 steps to 29 (no wrap mid-range).
    expect(day()).toHaveTextContent('29');
    expect(onChange).toHaveBeenLastCalledWith('2026-01-29');
    await user.click(month());
    await user.keyboard('[ArrowDown]');
    // 1 wraps down to December.
    expect(month()).toHaveTextContent('12');
    expect(onChange).toHaveBeenLastCalledWith('2026-12-29');
  });

  it('steps years without wrapping', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<DateField value='2026-05-10' onChange={onChange} />);
    await user.click(year());
    await user.keyboard('[ArrowUp]');
    expect(year()).toHaveTextContent('2027');
    expect(onChange).toHaveBeenLastCalledWith('2027-05-10');
    await user.keyboard('[ArrowDown]');
    expect(onChange).toHaveBeenLastCalledWith('2026-05-10');
  });

  it('steps an empty month to January without committing', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<DateField onChange={onChange} />);
    await user.click(month());
    await user.keyboard('[ArrowUp]');
    expect(month()).toHaveTextContent('01');
    expect(onChange).not.toHaveBeenCalled();
  });

  it('moves between segments with ArrowLeft/ArrowRight', async () => {
    const user = userEvent.setup();
    render(<DateField value='2026-03-09' />);
    await user.click(day());
    await user.keyboard('[ArrowLeft]');
    expect(month()).toHaveFocus();
    await user.keyboard('[ArrowLeft]');
    expect(year()).toHaveFocus();
    await user.keyboard('[ArrowRight][ArrowRight]');
    expect(day()).toHaveFocus();
  });

  it('moves between segments with Tab and Shift+Tab', async () => {
    const user = userEvent.setup();
    render(<DateField value='2026-03-09' />);
    await user.click(year());
    await user.tab();
    expect(month()).toHaveFocus();
    await user.tab();
    expect(day()).toHaveFocus();
    await user.tab({ shift: true });
    expect(month()).toHaveFocus();
  });

  it('flushes a pending entry when Tab leaves the field', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<DateField value='2026-05-28' onChange={onChange} />);
    await user.click(day());
    await user.keyboard('[Backspace]1');
    expect(onChange).not.toHaveBeenCalled();
    await user.tab();
    expect(document.body).toHaveFocus();
    expect(onChange).toHaveBeenCalledWith('2026-05-01');
    expect(day()).toHaveTextContent('01');
  });

  it('Backspace clears the current segment without committing', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<DateField value='2026-03-09' onChange={onChange} />);
    await user.click(day());
    await user.keyboard('[Backspace]');
    expect(day()).toHaveTextContent('dd');
    // Segment-to-segment moves keep the other values.
    expect(year()).toHaveTextContent('2026');
    expect(month()).toHaveTextContent('03');
    expect(onChange).not.toHaveBeenCalled();
  });

  it('withholds an impossible date and flags data-invalid', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<DateField value='2026-02-28' onChange={onChange} />);
    await user.click(day());
    await user.keyboard('[Backspace]30');
    expect(day()).toHaveTextContent('30');
    expect(group()).toHaveAttribute('data-invalid');
    expect(onChange).not.toHaveBeenCalled();
    // Fixing the day commits and clears the invalid flag.
    await user.keyboard('[Backspace]10');
    expect(onChange).toHaveBeenCalledWith('2026-02-10');
    expect(group()).not.toHaveAttribute('data-invalid');
    expect(day()).toHaveTextContent('10');
  });

  it('flags an impossible date typed from scratch', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<DateField onChange={onChange} />);
    await user.type(year(), '2026');
    await user.type(month(), '2');
    await user.type(day(), '30');
    expect(group()).toHaveAttribute('data-invalid');
    expect(onChange).not.toHaveBeenCalled();
  });

  it('works in controlled mode via a Control', async () => {
    const user = userEvent.setup();
    function Harness({ onChange }: { onChange: (value: string) => void }) {
      const [, , valueCtrl] = useControl(undefined, '2026-01-31');
      return <DateField value={valueCtrl} onChange={onChange} />;
    }
    const onChange = vi.fn();
    render(<Harness onChange={onChange} />);
    await user.click(month());
    await user.keyboard('[ArrowDown]');
    expect(onChange).toHaveBeenCalledWith('2026-12-31');
    // The echoed control value re-parses into the segments.
    expect(month()).toHaveTextContent('12');
  });

  it('disables every segment', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<DateField value='2026-03-09' disabled onChange={onChange} />);
    for (const segment of [year(), month(), day()]) {
      expect(segment).toHaveAttribute('aria-disabled', 'true');
      expect(segment).toHaveAttribute('tabindex', '-1');
    }
    // Keyboard entry is a no-op.
    await user.type(day(), '15');
    await user.keyboard('[ArrowUp]');
    expect(onChange).not.toHaveBeenCalled();
    expect(day()).toHaveTextContent('09');
    // Tab skips the field entirely.
    await user.tab();
    expect(year()).not.toHaveFocus();
  });

  it('forwards rest props to the group and className', () => {
    render(<DateField data-testid='birth' className='custom' aria-label='Birth' />);
    expect(screen.getByTestId('birth')).toBe(group());
    expect(group()).toHaveClass('custom');
    expect(group()).toHaveAccessibleName('Birth');
  });

  it('overrides segment labels and placeholders', () => {
    render(
      <DateField
        labels={{ year: 'Année', month: 'Mois', day: 'Jour' }}
        placeholder={{ year: 'AAAA', month: 'MM', day: 'JJ' }}
      />
    );
    expect(screen.getByRole('spinbutton', { name: 'Année' })).toHaveTextContent('AAAA');
    expect(screen.getByRole('spinbutton', { name: 'Mois' })).toHaveTextContent('MM');
    expect(screen.getByRole('spinbutton', { name: 'Jour' })).toHaveTextContent('JJ');
  });

  it('forwards ref to the tab-stop segment', () => {
    const ref = createRef<HTMLSpanElement>();
    render(<DateField ref={ref} aria-label='Birth date' />);
    expect(ref.current).toBeInstanceOf(HTMLSpanElement);
    ref.current!.focus();
    expect(ref.current).toHaveFocus();
  });

  it('has no axe violations', async () => {
    const { axe } = await import('jest-axe');
    const user = userEvent.setup();
    render(<DateField value='2026-03-09' aria-label='Birth date' />);
    await user.click(month());
    const results = await axe(document.body, {
      rules: { region: { enabled: false } },
    });
    expect(results.violations).toEqual([]);
  });
});

describe('DateFieldCore', () => {
  it('takes a plain value and onChange', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    function Harness() {
      const [value, setValue] = useState('2026-01-15');
      return (
        <DateFieldCore
          value={value}
          onChange={(next) => {
            setValue(next);
            onChange(next);
          }}
        />
      );
    }
    render(<Harness />);
    await user.click(month());
    await user.keyboard('[ArrowUp]');
    expect(onChange).toHaveBeenCalledWith('2026-02-15');
    expect(month()).toHaveTextContent('02');
  });
});
