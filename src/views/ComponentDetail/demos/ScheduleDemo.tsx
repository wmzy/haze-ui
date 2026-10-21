import type { ScheduleEvent } from '@/lib';

import { useState } from 'react';

import { Schedule } from '@/lib';

import PropsTable from '../PropsTable';

import A11yNote from '../A11yNote';

import { intro, section } from '../styles';

import { CssVarsSection } from './shared';

function at(dayOffset: number, hour: number, minute = 0): Date {
  const date = new Date();
  date.setDate(date.getDate() + dayOffset);
  date.setHours(hour, minute, 0, 0);
  return date;
}

const initialEvents = (): ScheduleEvent[] => [
  {
    id: 'standup',
    start: at(0, 9, 30),
    end: at(0, 10, 0),
    title: 'Daily standup',
  },
  {
    id: 'review',
    start: at(0, 10, 15),
    end: at(0, 11, 30),
    title: 'Design review',
    color: 'info',
  },
  {
    id: 'focus',
    start: at(1, 13, 0),
    end: at(1, 15, 0),
    title: 'Focus block',
    color: 'success',
  },
  {
    id: 'ship',
    start: at(2, 16, 0),
    end: at(2, 17, 0),
    title: 'Ship freeze',
    color: 'danger',
  },
  {
    id: 'offsite',
    start: at(1, 0, 0),
    end: at(2, 23, 59),
    title: 'Team offsite',
    allDay: true,
    color: 'warning',
  },
];

function SchedulePlayground() {
  const [events, setEvents] = useState<ScheduleEvent[]>(initialEvents);
  const [view, setView] = useState<'day' | 'week' | 'month'>('week');
  const [date, setDate] = useState(() => new Date());
  const [lastAction, setLastAction] = useState('nothing yet');

  return (
    <div>
      <Schedule
        events={events}
        view={view}
        onViewChange={setView}
        date={date}
        onDateChange={setDate}
        slotMinutes={30}
        businessHours={{ start: 9, end: 18 }}
        onEventChange={(change) => {
          setEvents((prev) =>
            prev.map((event) =>
              event.id === change.id
                ? { ...event, start: change.start, end: change.end }
                : event
            )
          );
          setLastAction(
            `rescheduled "${change.id}" to ${change.start.toLocaleString()}`
          );
        }}
        onEventClick={(event) => setLastAction(`opened "${event.id}"`)}
        onDayClick={(day) => {
          setDate(day);
          setView('day');
          setLastAction(`drilled into ${day.toDateString()}`);
        }}
      />
      <p aria-live='polite' style={{ marginTop: 'var(--haze-space-2)' }}>
        Last action: {lastAction}. Drag an event (snaps to 30-minute
        slots), or focus one and use the arrow keys.
      </p>
    </div>
  );
}

// ─── Schedule ──────────────────────────────────────────────────
export default function ScheduleDemo() {
  return (
    <>
      <h1>Schedule</h1>
      <p className={intro}>
        Calendar surface with day, week and month views: a time grid with
        all-day row, current-time indicator and pointer/keyboard
        rescheduling, plus a month grid with overflow chips. View and
        anchor date follow the controllable-state pattern, and events stay
        consumer-owned — drag and arrow moves surface through
        <code>onEventChange</code>.
      </p>

      <div className={section}>
        <h2>Demo</h2>
        <SchedulePlayground />
      </div>

      <div className={section}>
        <h2>Schedule Props</h2>
        <PropsTable of='ScheduleProps' />
      </div>

      <div className={section}>
        <h2>Accessibility</h2>
        <A11yNote>
          <ul>
            <li>
              Events render as focusable buttons whose accessible name
              combines the title and the time range
            </li>
            <li>
              ArrowUp/ArrowDown reschedule by <code>slotMinutes</code>,
              ArrowLeft/ArrowRight by one day (mirrored in RTL);
              Enter/Space fire <code>onEventClick</code>
            </li>
            <li>
              The month view is an ARIA <strong>grid</strong> with roving
              tabindex: arrows move between day cells, Enter/Space
              activate <code>onDayClick</code>
            </li>
            <li>
              No builtin copy beyond the toolbar glyphs — override
              <code>todayLabel</code>, <code>prevLabel</code>,
              <code>nextLabel</code> and <code>viewLabels</code> as needed
            </li>
          </ul>
        </A11yNote>
      </div>

      <CssVarsSection component='schedule' />
    </>
  );
}
