import { useState } from 'react';
import { useControl } from 'react-use-control';

import { Button, DateField, DateFieldCore, Form, FormItem, useForm } from '@/lib';

import { fieldRow } from '../styles';

import {
  AccessibilitySection,
  CssVarsSection,
  DemoPage,
  DemoSection,
  hintStyle,
  PropsSection,
} from './shared';

// ─── DateField ─────────────────────────────────────────────────
export default function DateFieldDemo() {
  const [, , valueCtrl] = useControl(undefined, '');
  const [value] = useControl(valueCtrl);

  return (
    <DemoPage
      title='DateField'
      description={
        <>
          Segmented date input — year/month/day spinbuttons typed directly,
          no calendar. Keyboard-first forms and date pickers without a
          popover.
        </>
      }
    >
      <DemoSection title='Demo'>
        <p>
          Type digits (segments auto-advance once their digits are
          gathered), or <kbd>↑</kbd>/<kbd>↓</kbd> to step, <kbd>←</kbd>/
          <kbd>→</kbd> to move, <kbd>Backspace</kbd> to clear a segment.
        </p>
        <div className={fieldRow}>
          <DateField value={valueCtrl} aria-label='Meeting date' />
        </div>
        {value && (
          <p style={hintStyle}>
            Selected: {value}
          </p>
        )}
      </DemoSection>

      <DemoSection title='Localization'>
        <p>
          <code>locale</code> feeds the month segment&apos;s{' '}
          <code>aria-valuetext</code> (localized month names for screen
          readers); <code>labels</code> and <code>placeholder</code>{' '}
          override the visible segment names and empty-state hints.
        </p>
        <div className={fieldRow}>
          <DateField
            locale='fr'
            labels={{ year: 'Année', month: 'Mois', day: 'Jour' }}
            placeholder={{ year: 'AAAA', month: 'MM', day: 'JJ' }}
            aria-label='Date de naissance'
          />
        </div>
      </DemoSection>

      <DemoSection title='In a form'>
        <p>
          <code>DateFieldCore</code> takes a plain{' '}
          <code>value</code>/<code>onChange</code>, so FormItem&apos;s{' '}
          <code>input</code> channel binds it declaratively — same wiring
          as InputCore.
        </p>
        <DateFieldForm />
      </DemoSection>

      <DemoSection title='Disabled'>
        <div className={fieldRow}>
          <DateField value='2026-10-20' disabled aria-label='Locked date' />
        </div>
      </DemoSection>

      <PropsSection of='DateFieldProps' />

      <AccessibilitySection>
        <ul>
          <li>
            Each segment is a <strong>role=&quot;spinbutton&quot;</strong>{' '}
            with <strong>aria-valuemin/max/now</strong> and a segment{' '}
            <strong>aria-label</strong> (Year/Month/Day)
          </li>
          <li>
            The month segment carries a localized{' '}
            <strong>aria-valuetext</strong> (long month names)
          </li>
          <li>
            Roving tabindex: one tab stop, <kbd>←</kbd>/<kbd>→</kbd> and{' '}
            <kbd>Tab</kbd> walk the segments
          </li>
          <li>
            Impossible dates (February 30th) never commit and flag the
            field with <strong>data-invalid</strong>
          </li>
          <li>
            <code>disabled</code> sets <strong>aria-disabled</strong> and
            removes the segments from the tab order
          </li>
        </ul>
      </AccessibilitySection>

      <CssVarsSection component='date-field' />
    </DemoPage>
  );
}

function DateFieldForm() {
  const form = useForm({ initialValues: { birthday: '' } });
  const [submitted, setSubmitted] = useState<string | null>(null);

  return (
    <Form form={form} onValidSubmit={(values) => setSubmitted(values.birthday)}>
      <div className={fieldRow}>
        <FormItem
          form={form}
          name='birthday'
          label='Birthday'
          input={DateFieldCore}
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
          <span style={hintStyle}>
            Submitted: {submitted || '(empty)'}
          </span>
        )}
      </div>
    </Form>
  );
}
