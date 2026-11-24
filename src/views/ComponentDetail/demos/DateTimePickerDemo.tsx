import { DateTimePicker } from '@/lib';

import { DemoPage, DemoSection, PropsSection } from './shared';

// ─── DateTimePicker ───────────────────────────────────────────
export default function DateTimePickerDemo() {
  return (
    <DemoPage
      title='DateTimePicker'
      description={
        <>
          Date+time picker (the Mantine niche): a date calendar with a time
          row in the same popover. Value serializes as{' '}
          <code>"YYYY-MM-DD HH:mm"</code> (or <code>"HH:mm:ss"</code> with
          showSeconds). Thin sugar over Datepicker — picker granularity is
          fixed to day.
        </>
      }
    >
      <DemoSection title='Basic'>
        <DateTimePicker value='2025-01-15 14:30' />
      </DemoSection>

      <DemoSection title='Seconds'>
        <DateTimePicker showSeconds value='2025-01-15 14:30:07' />
      </DemoSection>

      <PropsSection of='DateTimePickerProps' />
    </DemoPage>
  );
}
