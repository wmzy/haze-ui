import { DateTimePicker } from '@/lib';

import PropsTable from '../PropsTable';

import { intro, section } from '../styles';

// ─── DateTimePicker ───────────────────────────────────────────
export default function DateTimePickerDemo() {
  return (
    <>
      <h1>DateTimePicker</h1>
      <p className={intro}>
        Date+time picker (the Mantine niche): a date calendar with a time
        row in the same popover. Value serializes as{' '}
        <code>"YYYY-MM-DD HH:mm"</code> (or <code>"HH:mm:ss"</code> with
        showSeconds). Thin sugar over Datepicker — picker granularity is
        fixed to day.
      </p>

      <div className={section}>
        <h2>Basic</h2>
        <DateTimePicker value='2025-01-15 14:30' />
      </div>

      <div className={section}>
        <h2>Seconds</h2>
        <DateTimePicker showSeconds value='2025-01-15 14:30:07' />
      </div>

      <div className={section}>
        <h2>Props</h2>
        <PropsTable of='DateTimePickerProps' />
      </div>
    </>
  );
}
