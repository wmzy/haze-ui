import { useControl } from 'react-use-control';

import { DateRangePicker } from '@/lib';

import {
  AccessibilitySection,
  DemoPage,
  DemoSection,
  PropsSection,
} from './shared';

// ─── DateRangePicker ────────────────────────────────────────────
export default function DateRangePickerDemo() {
  const [, , startCtrl] = useControl(undefined, '2026-01-15');
  const [start] = useControl(startCtrl);
  const [, , endCtrl] = useControl(undefined, '');
  const [end] = useControl(endCtrl);

  return (
    <DemoPage
      title='DateRangePicker'
      description='Date range selection with start and end date inputs.'
    >
      <DemoSection title='Demo'>
        <DateRangePicker />
      </DemoSection>

      <DemoSection title='Dual-month panel'>
        <p>
          <code>months={2}</code> adds an inline two-month calendar below
          the inputs: the first pick sets the start date, the second
          completes the range (a pick before the start restarts it), and
          the highlight spans both grids.
        </p>
        <DateRangePicker
          startDate={startCtrl}
          endDate={endCtrl}
          months={2}
        />
        <p>
          Range: <strong>{start || '?'}</strong> → <strong>{end || '?'}</strong>
        </p>
      </DemoSection>

      <DemoSection title='Built-in presets'>
        <p>
          <code>presets=&apos;common&apos;</code> enables the built-in
          shortcut rows — today, yesterday, last 7 days, last 30 days,
          this month and last month (localized by the LocaleProvider). A
          custom array lists its own rows, and{' '}
          <code>&#123;&apos;common&apos;&#125;</code> inside the array
          prepends the built-ins so customs append after them.
        </p>
        <DateRangePicker months={2} presets='common' />
      </DemoSection>

      <DemoSection title='Presets'>
        <p>
          <code>presets</code> renders shortcut rows at the top of the
          panel — clicking one applies its range to the start/end pair.
        </p>
        <DateRangePicker
          months={2}
          presets={[
            { label: 'First fortnight', range: ['2026-01-01', '2026-01-14'] },
            { label: 'Rest of January', range: ['2026-01-15', '2026-01-31'] },
          ]}
        />
      </DemoSection>

      <DemoSection title='disabledDate'>
        <p>
          A predicate over each day&apos;s <code>Date</code> disables cells
          on the dual-month calendar — weekends below.
        </p>
        <DateRangePicker
          startDate='2026-01-15'
          months={2}
          disabledDate={(date) => date.getDay() === 0 || date.getDay() === 6}
        />
      </DemoSection>

      <PropsSection of='DateRangePickerProps' />

      <AccessibilitySection>
        <ul>
          <li>Uses native <strong>&lt;input type=&quot;date&quot;&gt;</strong> elements</li>
          <li>
            The dual-month panel renders two{' '}
            <strong>role=&quot;grid&quot;</strong> calendars, each labeled
            with its own month for screen readers, with per-grid keyboard
            roving and <strong>aria-selected</strong> range highlighting
          </li>
          <li>Full keyboard and screen reader support</li>
        </ul>
      </AccessibilitySection>
    </DemoPage>
  );
}
