import { useState } from 'react';
import { useControl } from 'react-use-control';

import {
  Button,
  Form,
  FormItem,
  TimeField,
  TimeFieldCore,
  useForm,
} from '@/lib';

import PropsTable from '../PropsTable';

import A11yNote from '../A11yNote';

import { intro, section, fieldRow } from '../styles';

import { CssVarsSection } from './shared';

// ─── TimeField ─────────────────────────────────────────────────
export default function TimeFieldDemo() {
  const [, , valueCtrl] = useControl(undefined, '');
  const [value] = useControl(valueCtrl);
  const [, , secondsCtrl] = useControl(undefined, '');
  const [seconds] = useControl(secondsCtrl);

  return (
    <>
      <h1>TimeField</h1>
      <p className={intro}>
        Segmented time-of-day input — hour/minute spinbuttons typed
        directly, seconds and a 12-hour AM/PM presentation opt-in.
      </p>

      <div className={section}>
        <h2>Demo</h2>
        <p>
          Type digits (segments auto-advance once their digits are
          gathered), or <kbd>↑</kbd>/<kbd>↓</kbd> to step with wraparound,{' '}
          <kbd>←</kbd>/<kbd>→</kbd> to move, <kbd>Backspace</kbd> to clear
          a segment.
        </p>
        <div className={fieldRow}>
          <TimeField value={valueCtrl} aria-label='Start time' />
        </div>
        {value && (
          <p
            style={{
              fontSize: 'var(--haze-text-sm)',
              color: 'var(--haze-color-text-secondary)',
            }}
          >
            Selected: {value}
          </p>
        )}
      </div>

      <div className={section}>
        <h2>Granularity and 12-hour</h2>
        <p>
          <code>format</code> picks the segments and the value&apos;s shape
          (<code>&apos;HH:mm&apos;</code> default,{' '}
          <code>&apos;HH:mm:ss&apos;</code> with seconds) — TimePicker&apos;s
          contract. <code>use12Hours</code> swaps in a 1–12 hour plus an
          AM/PM segment (type <kbd>a</kbd>/<kbd>p</kbd> or toggle with
          arrows); the value stays 24-hour either way.
        </p>
        <div className={fieldRow}>
          <TimeField format='HH:mm:ss' value={secondsCtrl} aria-label='Precise time' />
        </div>
        {seconds && (
          <p
            style={{
              fontSize: 'var(--haze-text-sm)',
              color: 'var(--haze-color-text-secondary)',
            }}
          >
            Selected: {seconds}
          </p>
        )}
        <div className={fieldRow}>
          <TimeField use12Hours aria-label='Twelve-hour time' />
        </div>
      </div>

      <div className={section}>
        <h2>In a form</h2>
        <p>
          <code>TimeFieldCore</code> takes a plain{' '}
          <code>value</code>/<code>onChange</code>, so FormItem&apos;s{' '}
          <code>input</code> channel binds it declaratively — same wiring
          as InputCore.
        </p>
        <TimeFieldForm />
      </div>

      <div className={section}>
        <h2>Disabled</h2>
        <div className={fieldRow}>
          <TimeField value='09:30' disabled aria-label='Locked time' />
        </div>
      </div>

      <div className={section}>
        <h2>Props</h2>
        <PropsTable of='TimeFieldProps' />
      </div>

      <div className={section}>
        <h2>Accessibility</h2>
        <A11yNote>
          <ul>
            <li>
              Each segment is a <strong>role=&quot;spinbutton&quot;</strong>{' '}
              with <strong>aria-valuemin/max/now</strong> and a segment{' '}
              <strong>aria-label</strong> (Hour/Minute/Second/Day period)
            </li>
            <li>
              The AM/PM segment exposes the option as{' '}
              <strong>aria-valuetext</strong> and toggles with{' '}
              <kbd>↑</kbd>/<kbd>↓</kbd> or <kbd>a</kbd>/<kbd>p</kbd>
            </li>
            <li>
              Roving tabindex: one tab stop, <kbd>←</kbd>/<kbd>→</kbd> and{' '}
              <kbd>Tab</kbd> walk the segments
            </li>
            <li>
              <code>disabled</code> sets <strong>aria-disabled</strong> and
              removes the segments from the tab order
            </li>
          </ul>
        </A11yNote>
      </div>

      <CssVarsSection component='time-field' />
    </>
  );
}

function TimeFieldForm() {
  const form = useForm({ initialValues: { start: '' } });
  const [submitted, setSubmitted] = useState<string | null>(null);

  return (
    <Form form={form} onValidSubmit={(values) => setSubmitted(values.start)}>
      <div className={fieldRow}>
        <FormItem
          form={form}
          name='start'
          label='Starts at'
          input={TimeFieldCore}
          mode='onBlur'
        />
      </div>
      <div className={fieldRow}>
        {/* haze Button renders type="button" — drive the form's submit
            flow explicitly, as the CRUD recipe does. */}
        <Button onClick={(e) => e.currentTarget.form?.requestSubmit()}>
          Submit
        </Button>
        {submitted !== null && (
          <span
            style={{
              fontSize: 'var(--haze-text-sm)',
              color: 'var(--haze-color-text-secondary)',
            }}
          >
            Submitted: {submitted || '(empty)'}
          </span>
        )}
      </div>
    </Form>
  );
}
