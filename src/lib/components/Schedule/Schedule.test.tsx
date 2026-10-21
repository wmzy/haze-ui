import type { ScheduleEvent, ScheduleEventChange } from './Schedule';

import { fireEvent, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';

import Schedule, { computeDropTime } from './Schedule';

// Week of Wednesday 2026-03-04: Sunday 2026-03-01 … Saturday 2026-03-07.
const BASE = new Date(2026, 2, 4);

const EVENTS: ScheduleEvent[] = [
  {
    id: 'standup',
    start: '2026-03-04T10:00:00',
    end: '2026-03-04T10:30:00',
    title: 'Standup',
  },
  {
    id: 'review',
    start: '2026-03-04T10:15:00',
    end: '2026-03-04T11:30:00',
    title: 'Design review',
    color: 'info',
  },
  {
    id: 'focus',
    start: '2026-03-05T14:00:00',
    end: '2026-03-05T15:30:00',
    title: 'Focus block',
  },
  {
    id: 'conf',
    start: '2026-03-04T00:00:00',
    end: '2026-03-05T23:59:00',
    title: 'Offsite',
    allDay: true,
  },
];

const HOUR = 56;

function expectDate(
  actual: Date,
  expected: [number, number, number, number, number]
) {
  expect([
    actual.getFullYear(),
    actual.getMonth(),
    actual.getDate(),
    actual.getHours(),
    actual.getMinutes(),
  ]).toEqual(expected);
}

function mockGridRect(container: HTMLElement, width = 700) {
  const grid = container.querySelector<HTMLElement>('[data-slot="grid-body"]');
  if (!grid) throw new Error('grid body not found');
  grid.getBoundingClientRect = () =>
    ({
      x: 0,
      y: 0,
      top: 0,
      left: 0,
      right: width,
      bottom: 24 * HOUR,
      width,
      height: 24 * HOUR,
    }) as unknown as DOMRect;
  return grid;
}

describe('Schedule — week view rendering', () => {
  it('renders the week toolbar title, weekday headers and hour gutter', () => {
    render(<Schedule events={EVENTS} date={BASE} locale='en-US' />);
    expect(screen.getByText('Mar 1 – Mar 7')).toBeInTheDocument();
    expect(screen.getByText(/^Wed$/)).toBeInTheDocument();
    expect(screen.getByText('4')).toBeInTheDocument();
    expect(screen.getByText('12 AM')).toBeInTheDocument();
    expect(screen.getByText('2 PM')).toBeInTheDocument();
  });

  it('positions events by start time and duration', () => {
    render(<Schedule events={EVENTS} date={BASE} locale='en-US' />);
    const standup = screen.getByRole('button', { name: /^Standup/ });
    expect(standup.style.top).toBe(`${10 * HOUR}px`);
    expect(standup.style.blockSize).toBe(`${0.5 * HOUR}px`);
    const focus = screen.getByRole('button', { name: /^Focus block/ });
    expect(focus.style.top).toBe(`${14 * HOUR}px`);
    expect(focus.style.blockSize).toBe(`${1.5 * HOUR}px`);
  });

  it('splits overlapping events into side-by-side columns', () => {
    render(<Schedule events={EVENTS} date={BASE} locale='en-US' />);
    const standup = screen.getByRole('button', { name: /^Standup/ });
    const review = screen.getByRole('button', { name: /^Design review/ });
    // Wednesday is column 3 of 7 → left 3/7 ≈ 42.86%; overlap split halves
    // the column width (≈7.14%), review sits in the second half.
    expect(parseFloat(standup.style.left)).toBeCloseTo(300 / 7);
    expect(parseFloat(review.style.left)).toBeCloseTo(50);
    expect(parseFloat(standup.style.inlineSize)).toBeCloseTo(50 / 7);
    expect(parseFloat(review.style.inlineSize)).toBeCloseTo(50 / 7);
    // Non-overlapping event keeps the full column width.
    const focus = screen.getByRole('button', { name: /^Focus block/ });
    expect(parseFloat(focus.style.inlineSize)).toBeCloseTo(100 / 7);
  });

  it('renders all-day events in the all-day row, spanning their days', () => {
    render(<Schedule events={EVENTS} date={BASE} locale='en-US' />);
    const allDayRow = document.querySelector('[data-slot="all-day-row"]');
    expect(allDayRow).not.toBeNull();
    const offsite = screen.getByRole('button', { name: 'Offsite' });
    expect(allDayRow?.contains(offsite)).toBe(true);
    // Mar 4–5 → columns 4–5 of the grid (1-based).
    expect(offsite.style.gridColumn).toBe('4 / span 2');
    const gridBody = document.querySelector('[data-slot="grid-body"]');
    expect(gridBody?.contains(offsite)).toBe(false);
  });

  it('mutes rows outside business hours', () => {
    render(
      <Schedule
        events={[]}
        date={BASE}
        businessHours={{ start: 9, end: 17 }}
      />
    );
    const rows = document.querySelectorAll('[data-slot="time-row"]');
    expect(rows.length).toBe(24);
    const off = document.querySelectorAll('[data-off-hours]');
    expect(off.length).toBe(16);
  });

  it('shows the now indicator only when today is on screen', () => {
    const first = render(<Schedule events={[]} />);
    expect(
      first.container.querySelector('[data-slot="now-indicator"]')
    ).not.toBeNull();

    const second = render(<Schedule events={[]} date={BASE} />);
    expect(
      second.container.querySelector('[data-slot="now-indicator"]')
    ).toBeNull();

    const third = render(<Schedule events={[]} nowIndicator={false} />);
    expect(
      third.container.querySelector('[data-slot="now-indicator"]')
    ).toBeNull();
  });
});

describe('Schedule — view and date navigation', () => {
  it('switches views through the toolbar uncontrolled', async () => {
    const user = userEvent.setup();
    const onViewChange = vi.fn();
    render(
      <Schedule
        events={EVENTS}
        date={BASE}
        onViewChange={onViewChange}
        locale='en-US'
      />
    );
    await user.click(screen.getByRole('button', { name: 'Month' }));
    expect(onViewChange).toHaveBeenCalledWith('month');
    expect(screen.getAllByRole('gridcell')).toHaveLength(42);
    await user.click(screen.getByRole('button', { name: 'Day' }));
    expect(onViewChange).toHaveBeenCalledWith('day');
    expect(screen.getByText('Wednesday, March 4, 2026')).toBeInTheDocument();
  });

  it('supports controlled view', async () => {
    const user = userEvent.setup();
    function Controlled() {
      const [view, setView] = useState<'day' | 'month'>('day');
      return (
        <Schedule
          events={[]}
          date={BASE}
          view={view}
          onViewChange={(v) => setView(v as 'day' | 'month')}
          locale='en-US'
        />
      );
    }
    render(<Controlled />);
    expect(screen.getByText('Wednesday, March 4, 2026')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Month' }));
    expect(screen.getAllByRole('gridcell')).toHaveLength(42);
  });

  it('steps by the current view span', async () => {
    const user = userEvent.setup();
    function Probe({ view }: { view: 'day' | 'week' | 'month' }) {
      const [date, setDate] = useState(BASE);
      return (
        <Schedule
          events={[]}
          view={view}
          date={date}
          onDateChange={setDate}
          locale='en-US'
        />
      );
    }
    const day = render(<Probe view='day' />);
    await user.click(screen.getByRole('button', { name: 'Previous' }));
    expect(screen.getByText('Tuesday, March 3, 2026')).toBeInTheDocument();
    day.unmount();

    const week = render(<Probe view='week' />);
    await user.click(screen.getByRole('button', { name: 'Previous' }));
    expect(screen.getByText('Feb 22 – Feb 28')).toBeInTheDocument();
    week.unmount();

    const month = render(<Probe view='month' />);
    await user.click(screen.getByRole('button', { name: 'Previous' }));
    expect(screen.getByText('February 2026')).toBeInTheDocument();
    month.unmount();
  });

  it('fires onDateChange with the shifted anchor per view', () => {
    const nextAnchor = (view: 'day' | 'week' | 'month') => {
      const onDateChange = vi.fn<(d: Date) => void>();
      const { unmount } = render(
        <Schedule
          events={[]}
          view={view}
          date={BASE}
          onDateChange={onDateChange}
        />
      );
      fireEvent.click(screen.getByRole('button', { name: 'Next' }));
      unmount();
      return onDateChange.mock.calls[0]![0];
    };
    expectDate(nextAnchor('day'), [2026, 2, 5, 0, 0]);
    expectDate(nextAnchor('week'), [2026, 2, 11, 0, 0]);
    expectDate(nextAnchor('month'), [2026, 3, 4, 0, 0]);
  });

  it('jumps to today from the toolbar', () => {
    const onDateChange = vi.fn<(d: Date) => void>();
    render(
      <Schedule
        events={[]}
        date={BASE}
        onDateChange={onDateChange}
        locale='en-US'
      />
    );
    fireEvent.click(screen.getByRole('button', { name: 'Today' }));
    const next = onDateChange.mock.calls[0]![0];
    const today = new Date();
    expect([
      next.getFullYear(),
      next.getMonth(),
      next.getDate(),
    ]).toEqual([today.getFullYear(), today.getMonth(), today.getDate()]);
  });

  it('formats weekday and month labels through the locale prop', () => {
    render(
      <Schedule events={EVENTS} date={BASE} locale='de-DE' view='month' />
    );
    expect(screen.getByText('Mi')).toBeInTheDocument();
    expect(screen.getByText('März 2026')).toBeInTheDocument();
  });
});

describe('Schedule — month view', () => {
  const OCTOBER = new Date(2026, 9, 21);
  const monthEvents = (count: number): ScheduleEvent[] =>
    Array.from({ length: count }, (_, i) => ({
      id: `ev-${i}`,
      start: '2026-10-21T09:00:00',
      end: '2026-10-21T10:00:00',
      title: `Event ${i + 1}`,
    }));

  it('renders a 42-cell grid with muted leading and trailing days', () => {
    render(
      <Schedule
        events={monthEvents(1)}
        date={OCTOBER}
        view='month'
        locale='en-US'
      />
    );
    const cells = screen.getAllByRole('gridcell');
    expect(cells).toHaveLength(42);
    expect(cells[0]).toHaveAttribute('data-date', '2026-09-27');
    expect(cells[0]).toHaveAttribute('data-outside');
    expect(cells[41]).toHaveAttribute('data-date', '2026-11-07');
    expect(cells[41]).toHaveAttribute('data-outside');
    const inMonth = cells.filter(
      (cell) => !cell.hasAttribute('data-outside')
    );
    expect(inMonth).toHaveLength(31);
    expect(screen.getByText('October 2026')).toBeInTheDocument();
  });

  it('caps visible chips per cell and exposes an overflow chip', () => {
    const onDayClick = vi.fn<(d: Date) => void>();
    render(
      <Schedule
        events={monthEvents(5)}
        date={OCTOBER}
        view='month'
        onDayClick={onDayClick}
      />
    );
    const cell = document.querySelector('[data-date="2026-10-21"]');
    expect(cell).not.toBeNull();
    const chips = within(cell as HTMLElement).getAllByRole('button');
    expect(chips).toHaveLength(4); // 3 events + overflow
    fireEvent.click(chips[3]!);
    expect(onDayClick).toHaveBeenCalledTimes(1);
    expectDate(onDayClick.mock.calls[0]![0], [2026, 9, 21, 0, 0]);
  });

  it('fires onDayClick on cell click and Enter', () => {
    const onDayClick = vi.fn<(d: Date) => void>();
    render(
      <Schedule
        events={[]}
        date={OCTOBER}
        view='month'
        onDayClick={onDayClick}
      />
    );
    const cell = document.querySelector<HTMLElement>(
      '[data-date="2026-10-21"]'
    )!;
    fireEvent.click(cell);
    expect(onDayClick).toHaveBeenCalledTimes(1);
    cell.focus();
    fireEvent.keyDown(cell, { key: 'Enter' });
    expect(onDayClick).toHaveBeenCalledTimes(2);
    fireEvent.keyDown(cell, { key: ' ' });
    expect(onDayClick).toHaveBeenCalledTimes(3);
  });

  it('keeps day cells inert without onDayClick', () => {
    render(<Schedule events={[]} date={OCTOBER} view='month' />);
    const cell = document.querySelector<HTMLElement>('[data-date="2026-10-21"]')!;
    expect(() => fireEvent.click(cell)).not.toThrow();
  });

  it('moves cell focus with arrow keys (roving tabindex)', () => {
    render(<Schedule events={[]} date={OCTOBER} view='month' />);
    const cell = document.querySelector<HTMLElement>(
      '[data-date="2026-10-21"]'
    )!;
    expect(cell).toHaveAttribute('tabindex', '0');
    cell.focus();
    fireEvent.keyDown(cell, { key: 'ArrowRight' });
    expect(document.activeElement).toHaveAttribute('data-date', '2026-10-22');
    fireEvent.keyDown(document.activeElement!, { key: 'ArrowDown' });
    expect(document.activeElement).toHaveAttribute('data-date', '2026-10-29');
    fireEvent.keyDown(document.activeElement!, { key: 'ArrowLeft' });
    expect(document.activeElement).toHaveAttribute('data-date', '2026-10-28');
    fireEvent.keyDown(document.activeElement!, { key: 'ArrowUp' });
    expect(document.activeElement).toHaveAttribute('data-date', '2026-10-21');
  });

  it('does not move focus past the grid edges', () => {
    render(<Schedule events={[]} date={OCTOBER} view='month' />);
    const first = document.querySelector<HTMLElement>(
      '[data-date="2026-09-27"]'
    )!;
    first.focus();
    fireEvent.keyDown(first, { key: 'ArrowUp' });
    expect(document.activeElement).toBe(first);
    fireEvent.keyDown(first, { key: 'ArrowLeft' });
    expect(document.activeElement).toBe(first);
  });

  it('fires onEventClick from month chips without touching the cell', async () => {
    const user = userEvent.setup();
    const onEventClick = vi.fn<(e: ScheduleEvent) => void>();
    const onDayClick = vi.fn<(d: Date) => void>();
    render(
      <Schedule
        events={monthEvents(1)}
        date={OCTOBER}
        view='month'
        onEventClick={onEventClick}
        onDayClick={onDayClick}
      />
    );
    const chip = screen.getByRole('button', { name: /^Event 1/ });
    fireEvent.click(chip);
    expect(onEventClick).toHaveBeenCalledTimes(1);
    // Chip Enter must activate the chip itself, not bubble into the
    // cell's own Enter handling.
    chip.focus();
    await user.keyboard('{Enter}');
    expect(onEventClick).toHaveBeenCalledTimes(2);
    expect(onDayClick).not.toHaveBeenCalled();
  });
});

describe('computeDropTime', () => {
  const days = Array.from(
    { length: 7 },
    (_, i) => new Date(2026, 2, 1 + i)
  );

  it('snaps the dropped start to the nearest slot boundary', () => {
    // 10:31 rounds down to the 10:30 slot boundary at slotMinutes 30.
    const { start, end } = computeDropTime(
      { dayIndex: 3, minutes: 631 },
      {
        days,
        eventStart: new Date(2026, 2, 4, 10, 7),
        eventEnd: new Date(2026, 2, 4, 11, 7),
        grabDayIndex: 3,
        grabMinutes: 607,
        slotMinutes: 30,
      }
    );
    expectDate(start, [2026, 2, 4, 10, 30]);
    expectDate(end, [2026, 2, 4, 11, 30]);
  });

  it('shifts the day when dropped on another column', () => {
    const { start, end } = computeDropTime(
      { dayIndex: 1, minutes: 600 },
      {
        days,
        eventStart: new Date(2026, 2, 4, 10, 0),
        eventEnd: new Date(2026, 2, 4, 11, 0),
        grabDayIndex: 3,
        grabMinutes: 600,
        slotMinutes: 60,
      }
    );
    expectDate(start, [2026, 2, 2, 10, 0]);
    expectDate(end, [2026, 2, 2, 11, 0]);
  });

  it('preserves the original duration', () => {
    const { start, end } = computeDropTime(
      { dayIndex: 3, minutes: 720 },
      {
        days,
        eventStart: new Date(2026, 2, 4, 9, 0),
        eventEnd: new Date(2026, 2, 4, 10, 30),
        grabDayIndex: 3,
        grabMinutes: 540,
        slotMinutes: 30,
      }
    );
    expectDate(start, [2026, 2, 4, 12, 0]);
    expectDate(end, [2026, 2, 4, 13, 30]);
  });

  it('clamps the drop column into the visible days', () => {
    const { start } = computeDropTime(
      { dayIndex: 9, minutes: 600 },
      {
        days,
        eventStart: new Date(2026, 2, 4, 10, 0),
        eventEnd: new Date(2026, 2, 4, 11, 0),
        grabDayIndex: 3,
        grabMinutes: 600,
        slotMinutes: 60,
      }
    );
    expectDate(start, [2026, 2, 7, 10, 0]);
  });

  it('rolls to midnight of the next day when snapping past 24:00', () => {
    const { start, end } = computeDropTime(
      { dayIndex: 3, minutes: 1430 },
      {
        days,
        eventStart: new Date(2026, 2, 4, 23, 0),
        eventEnd: new Date(2026, 2, 4, 23, 30),
        grabDayIndex: 3,
        grabMinutes: 1380,
        slotMinutes: 60,
      }
    );
    expectDate(start, [2026, 2, 5, 0, 0]);
    expectDate(end, [2026, 2, 5, 0, 30]);
  });
});

describe('Schedule — drag rescheduling', () => {
  it('fires onEventChange with the snapped drop position', () => {
    const onEventChange = vi.fn<(c: ScheduleEventChange) => void>();
    const { container } = render(
      <Schedule events={EVENTS} date={BASE} onEventChange={onEventChange} />
    );
    mockGridRect(container);
    const standup = screen.getByRole('button', { name: /^Standup/ });
    // Grab at the event's top-left (Wed column x 300–400, 10:00).
    fireEvent.pointerDown(standup, {
      pointerId: 1,
      pointerType: 'mouse',
      button: 0,
      clientX: 350,
      clientY: 560,
    });
    // Drop into Tuesday's column exactly one hour lower (11:00).
    fireEvent.pointerMove(standup, {
      pointerId: 1,
      pointerType: 'mouse',
      clientX: 150,
      clientY: 616,
    });
    fireEvent.pointerUp(standup, {
      pointerId: 1,
      pointerType: 'mouse',
      clientX: 150,
      clientY: 616,
    });
    expect(onEventChange).toHaveBeenCalledTimes(1);
    const change = onEventChange.mock.calls[0]![0];
    expect(change.id).toBe('standup');
    expectDate(change.start, [2026, 2, 2, 11, 0]);
    expectDate(change.end, [2026, 2, 2, 11, 30]);
  });

  it('mirrors pointer columns in RTL', () => {
    const onEventChange = vi.fn<(c: ScheduleEventChange) => void>();
    const { container } = render(
      <div dir='rtl'>
        <Schedule
          events={EVENTS}
          date={BASE}
          onEventChange={onEventChange}
        />
      </div>
    );
    mockGridRect(container);
    const standup = screen.getByRole('button', { name: /^Standup/ });
    // RTL: Wednesday's column occupies the mirrored x 300–400 range.
    fireEvent.pointerDown(standup, {
      pointerId: 1,
      pointerType: 'mouse',
      button: 0,
      clientX: 350,
      clientY: 560,
    });
    fireEvent.pointerMove(standup, {
      pointerId: 1,
      pointerType: 'mouse',
      clientX: 350,
      clientY: 672,
    });
    fireEvent.pointerUp(standup, {
      pointerId: 1,
      pointerType: 'mouse',
      clientX: 350,
      clientY: 672,
    });
    const change = onEventChange.mock.calls[0]![0];
    expect(change.id).toBe('standup');
    expectDate(change.start, [2026, 2, 4, 12, 0]);
    expectDate(change.end, [2026, 2, 4, 12, 30]);
  });

  it('suppresses onEventClick after a real drag but keeps plain clicks', () => {
    const onEventClick = vi.fn<(e: ScheduleEvent) => void>();
    const { container } = render(
      <Schedule events={EVENTS} date={BASE} onEventClick={onEventClick} />
    );
    mockGridRect(container);
    const standup = screen.getByRole('button', { name: /^Standup/ });
    fireEvent.pointerDown(standup, {
      pointerId: 1,
      pointerType: 'mouse',
      button: 0,
      clientX: 350,
      clientY: 560,
    });
    fireEvent.pointerMove(standup, {
      pointerId: 1,
      pointerType: 'mouse',
      clientX: 350,
      clientY: 620,
    });
    fireEvent.pointerUp(standup, {
      pointerId: 1,
      pointerType: 'mouse',
      clientX: 350,
      clientY: 620,
    });
    fireEvent.click(standup);
    expect(onEventClick).not.toHaveBeenCalled();

    fireEvent.click(standup);
    expect(onEventClick).toHaveBeenCalledTimes(1);
    expect(onEventClick.mock.calls[0]![0].id).toBe('standup');
  });
});

describe('Schedule — keyboard', () => {
  /** Applies onEventChange back into the events prop, the way a real
   * consumer would, so consecutive arrow moves chain. */
  function Reschedule({ slotMinutes }: { slotMinutes?: number }) {
    const [events, setEvents] = useState<ScheduleEvent[]>(EVENTS);
    return (
      <Schedule
        events={events}
        date={BASE}
        slotMinutes={slotMinutes}
        onEventChange={(change) =>
          setEvents((prev) =>
            prev.map((event) =>
              event.id === change.id
                ? { ...event, start: change.start, end: change.end }
                : event
            )
          )
        }
      />
    );
  }

  it('moves an event by slotMinutes with vertical arrows', () => {
    render(<Reschedule slotMinutes={30} />);
    const standup = screen.getByRole('button', { name: /^Standup/ });
    standup.focus();
    fireEvent.keyDown(standup, { key: 'ArrowDown' });
    // 10:00 → 10:30 (half-hour slot), announced through the new label.
    expect(
      screen.getByRole('button', { name: /^Standup/ }).style.top
    ).toBe(`${10.5 * HOUR}px`);
    fireEvent.keyDown(standup, { key: 'ArrowUp' });
    expect(screen.getByRole('button', { name: /^Standup/ }).style.top).toBe(
      `${10 * HOUR}px`
    );
  });

  it('moves an event by one day with horizontal arrows (RTL mirrored)', () => {
    // useDirection falls back to the document direction when no
    // LocaleProvider declares one.
    document.documentElement.setAttribute('dir', 'rtl');
    try {
      render(<Reschedule />);
      const standup = screen.getByRole('button', { name: /^Standup/ });
      standup.focus();
      // RTL: ArrowRight moves back a day (Wednesday → Tuesday; mirrored
      // grid puts Tuesday's left edge at 100 − 3·(100/7)), ArrowLeft
      // forward again — Wednesday shares the day with the overlapping
      // review, so the event lands in the first of two half-columns.
      fireEvent.keyDown(standup, { key: 'ArrowRight' });
      expect(parseFloat(standup.style.left)).toBeCloseTo(400 / 7);
      fireEvent.keyDown(standup, { key: 'ArrowLeft' });
      expect(parseFloat(standup.style.left)).toBeCloseTo(50);
    } finally {
      document.documentElement.removeAttribute('dir');
    }
  });

  it('fires onEventClick from Enter and Space on an event', async () => {
    const user = userEvent.setup();
    const onEventClick = vi.fn<(e: ScheduleEvent) => void>();
    render(
      <Schedule
        events={EVENTS}
        date={BASE}
        onEventClick={onEventClick}
      />
    );
    const standup = screen.getByRole('button', { name: /^Standup/ });
    standup.focus();
    await user.keyboard('{Enter}');
    await user.keyboard(' ');
    expect(onEventClick).toHaveBeenCalledTimes(2);
  });
});

describe('Schedule — conventions', () => {
  it('merges className and forwards native props to the root', () => {
    render(
      <Schedule
        events={[]}
        date={BASE}
        className='custom-schedule'
        data-testid='sched'
        id='schedule-root'
      />
    );
    const root = screen.getByTestId('sched');
    expect(root).toHaveClass('custom-schedule');
    expect(root).toHaveAttribute('id', 'schedule-root');
    expect(root).toHaveAttribute('data-slot', 'schedule');
  });

  it('accepts ReactNode titles and still exposes a text aria-label', () => {
    render(
      <Schedule
        events={[
          {
            id: 'node',
            start: '2026-03-04T10:00:00',
            end: '2026-03-04T11:00:00',
            title: <strong>Ship it</strong>,
          },
        ]}
        date={BASE}
        locale='en-US'
      />
    );
    expect(
      screen.getByRole('button', { name: 'Ship it, 10:00 AM – 11:00 AM' })
    ).toBeInTheDocument();
  });

  it('has no axe violations across views', async () => {
    const { axe } = await import('jest-axe');
    const week = render(
      <Schedule events={EVENTS} date={BASE} locale='en-US' />
    );
    let results = await axe(week.container, {
      rules: { region: { enabled: false } },
    });
    expect(results.violations).toEqual([]);
    week.unmount();
    const month = render(
      <Schedule events={EVENTS} date={BASE} view='month' locale='en-US' />
    );
    results = await axe(month.container, {
      rules: { region: { enabled: false } },
    });
    expect(results.violations).toEqual([]);
  });
});
