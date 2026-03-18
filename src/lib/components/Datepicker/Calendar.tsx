import {css} from '@linaria/core';
import {useState} from 'react';

type CalendarProps = {
  value: string;
  min?: string;
  max?: string;
  onSelect: (date: string) => void;
};

const calendarWrapper = css`
  padding: var(--pbl-space-3);
  font-family: var(--pbl-font-sans);
  font-size: var(--pbl-text-sm);
`;

const header = css`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: var(--pbl-space-2);
`;

const headerBtn = css`
  appearance: none;
  border: none;
  background: transparent;
  color: var(--pbl-color-text);
  cursor: pointer;
  padding: var(--pbl-space-1);
  border-radius: var(--pbl-radius-sm);
  font-size: var(--pbl-text-sm);
  line-height: 1;

  &:hover {
    background: var(--pbl-color-bg-subtle);
  }

  &:focus-visible {
    outline: none;
    box-shadow: 0 0 0 3px var(--pbl-color-focus-ring);
  }
`;

const headerTitle = css`
  font-weight: var(--pbl-weight-medium);
  color: var(--pbl-color-text);
`;

const grid = css`
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 1px;
  text-align: center;
`;

const weekday = css`
  padding: var(--pbl-space-1);
  font-weight: var(--pbl-weight-medium);
  color: var(--pbl-color-text-muted);
  font-size: var(--pbl-text-xs);
`;

const dayBtn = css`
  appearance: none;
  border: none;
  background: transparent;
  color: var(--pbl-color-text);
  cursor: pointer;
  padding: var(--pbl-space-1);
  border-radius: var(--pbl-radius-sm);
  font-size: var(--pbl-text-sm);
  line-height: 1.5;
  transition: background 0.1s;

  &:hover {
    background: var(--pbl-color-bg-subtle);
  }

  &:focus-visible {
    outline: none;
    box-shadow: 0 0 0 3px var(--pbl-color-focus-ring);
  }

  &:disabled {
    opacity: 0.3;
    cursor: not-allowed;
  }
`;

const daySelected = css`
  background: var(--pbl-color-primary);
  color: var(--pbl-color-text-inverse);

  &:hover {
    background: var(--pbl-color-primary-hover);
  }
`;

const dayOutside = css`
  color: var(--pbl-color-text-muted);
`;

const WEEKDAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function formatDate(year: number, month: number, day: number) {
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

export default function Calendar({value, min, max, onSelect}: CalendarProps) {
  const initial = value ? new Date(value) : new Date();
  const [viewYear, setViewYear] = useState(initial.getFullYear());
  const [viewMonth, setViewMonth] = useState(initial.getMonth());

  const daysInMonth = getDaysInMonth(viewYear, viewMonth);
  const firstDayOfWeek = new Date(viewYear, viewMonth, 1).getDay();
  const prevMonthDays = getDaysInMonth(viewYear, viewMonth - 1);

  const goPrevMonth = () => {
    setViewMonth((m) => {
      if (m === 0) { setViewYear((y) => y - 1); return 11; }
      return m - 1;
    });
  };

  const goNextMonth = () => {
    setViewMonth((m) => {
      if (m === 11) { setViewYear((y) => y + 1); return 0; }
      return m + 1;
    });
  };

  const isDisabled = (dateStr: string) => {
    if (min && dateStr < min) return true;
    if (max && dateStr > max) return true;
    return false;
  };

  const cells: {day: number; month: number; year: number; outside: boolean}[] = [];

  for (let i = firstDayOfWeek - 1; i >= 0; i--) {
    const m = viewMonth === 0 ? 11 : viewMonth - 1;
    const y = viewMonth === 0 ? viewYear - 1 : viewYear;
    cells.push({day: prevMonthDays - i, month: m, year: y, outside: true});
  }
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push({day: d, month: viewMonth, year: viewYear, outside: false});
  }
  const remaining = 7 - (cells.length % 7);
  if (remaining < 7) {
    for (let d = 1; d <= remaining; d++) {
      const m = viewMonth === 11 ? 0 : viewMonth + 1;
      const y = viewMonth === 11 ? viewYear + 1 : viewYear;
      cells.push({day: d, month: m, year: y, outside: true});
    }
  }

  const monthLabel = new Date(viewYear, viewMonth).toLocaleString('default', {month: 'long', year: 'numeric'});

  return (
    <div x-class={[calendarWrapper]} role='grid' aria-label={monthLabel}>
      <div x-class={[header]}>
        <button type='button' x-class={[headerBtn]} onClick={goPrevMonth} aria-label='Previous month'>‹</button>
        <span x-class={[headerTitle]}>{monthLabel}</span>
        <button type='button' x-class={[headerBtn]} onClick={goNextMonth} aria-label='Next month'>›</button>
      </div>
      <div x-class={[grid]}>
        {WEEKDAYS.map((w) => (
          <span key={w} x-class={[weekday]}>{w}</span>
        ))}
        {cells.map((c, i) => {
          const dateStr = formatDate(c.year, c.month, c.day);
          return (
            <button
              key={i}
              type='button'
              x-class={[dayBtn, dateStr === value && daySelected, c.outside && dayOutside]}
              disabled={isDisabled(dateStr)}
              onClick={() => onSelect(dateStr)}
            >
              {c.day}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export type {CalendarProps};
