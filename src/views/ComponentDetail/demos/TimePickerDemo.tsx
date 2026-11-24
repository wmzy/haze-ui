import { useControl } from 'react-use-control';

import { TimePicker } from '@/lib';

import { fieldRow } from '../styles';

import {
  AccessibilitySection,
  DemoPage,
  DemoSection,
  hintStyle,
  PropsSection,
} from './shared';

// ─── TimePicker ─────────────────────────────────────────────────
export default function TimePickerDemo() {
  const [, , valueCtrl] = useControl(undefined, '');
  const [value] = useControl(valueCtrl);
  const [, , twelveCtrl] = useControl(undefined, '');
  const [twelve] = useControl(twelveCtrl);

  return (
    <DemoPage
      title='TimePicker'
      description={
        <>
          Time selection with a floating column panel (AntD-style); every
          state stays controllable through <code>useControl</code>.
        </>
      }
    >
      <DemoSection title='Demo'>
        <div className={fieldRow}>
          <TimePicker value={valueCtrl} placeholder='Select time' />
        </div>
        {value && (
          <p style={hintStyle}>
            Selected: {value}
          </p>
        )}
      </DemoSection>

      <DemoSection title='Steps'>
        <p>
          <code>hourStep</code>/<code>minuteStep</code>/<code>secondStep</code>{' '}
          filter their column to multiples of the step.
        </p>
        <div className={fieldRow}>
          <TimePicker hourStep={2} minuteStep={15} placeholder='Every 2h / 15min' />
        </div>
      </DemoSection>

      <DemoSection title='Seconds'>
        <p>
          <code>format='HH:mm:ss'</code> adds a third column and serializes
          seconds into the value.
        </p>
        <div className={fieldRow}>
          <TimePicker format='HH:mm:ss' placeholder='With seconds' />
        </div>
      </DemoSection>

      <DemoSection title='12-hour clock'>
        <p>
          <code>use12Hours</code> presents a 12-hour column plus an AM/PM
          column; the value stays 24-hour <code>&apos;HH:mm[:ss]&apos;</code>{' '}
          (12:34 AM is <code>00:34</code>).
        </p>
        <div className={fieldRow}>
          <TimePicker use12Hours value={twelveCtrl} placeholder='12-hour clock' />
        </div>
        {twelve && (
          <p style={hintStyle}>
            Selected: {twelve}
          </p>
        )}
      </DemoSection>

      <DemoSection title='disabledTime'>
        <p>
          A predicate over the candidate parts disables cells on the
          columns — off-hours below.
        </p>
        <div className={fieldRow}>
          <TimePicker
            placeholder='Business hours only'
            disabledTime={(parts) => parts.hour < 9 || parts.hour >= 18}
          />
        </div>
      </DemoSection>

      <DemoSection title='Native fallback'>
        <p>
          <code>native</code> keeps the bare <code>&lt;input type=&quot;time&quot;&gt;</code>{' '}
          form (TimePickerCore).
        </p>
        <div className={fieldRow}>
          <TimePicker native placeholder='Select time' />
        </div>
      </DemoSection>

      <PropsSection of='TimePickerProps' />

      <AccessibilitySection>
        <ul>
          <li>Readonly trigger with <strong>role=combobox</strong>, <code>aria-expanded</code> and <code>aria-controls</code></li>
          <li>Each column is a labelled <strong>listbox</strong> with <code>aria-selected</code>/<code>aria-disabled</code> options</li>
          <li>Arrow keys step the focused column (the trigger steps hours); Enter/Space open, Escape closes</li>
          <li>Switch to <code>native</code> for the browser&apos;s own time input semantics</li>
        </ul>
      </AccessibilitySection>
    </DemoPage>
  );
}
