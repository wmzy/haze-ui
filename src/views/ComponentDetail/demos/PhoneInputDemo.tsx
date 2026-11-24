import { useControl } from 'react-use-control';

import { PhoneInput, isValidPhone } from '@/lib';


import { row } from '../styles';

import {
  AccessibilitySection,
  DemoPage,
  DemoSection,
  hintStyle,
  PropsSection,
} from './shared';

// ─── PhoneInput ────────────────────────────────────────────────
export default function PhoneInputDemo() {
  const [, , valueCtrl] = useControl('');
  const [value] = useControl(valueCtrl);
  const [, , countryCtrl] = useControl('CN' as const);
  const [country] = useControl(countryCtrl);

  return (
    <DemoPage
      title='PhoneInput'
      description={
        <>
          International phone number input: a country select joined to the
          number field, backed by <code>libphonenumber-js</code>. Values are
          E.164-ish (<code>+8613800138000</code>); country names follow the
          active locale.
        </>
      }
    >
      <DemoSection title='Demo'>
        <div className={row}>
          <PhoneInput
            value={valueCtrl}
            country={countryCtrl}
            aria-label="Phone"
          />
          <span style={hintStyle}>
            Value: {value || '—'} ·{' '}
            {value === '' || isValidPhone(value, country) ? 'valid' : 'invalid'}
          </span>
        </div>
      </DemoSection>

      <DemoSection title='Sizes'>
        <div className={row}>
          <PhoneInput size="sm" aria-label="Small" />
          <PhoneInput size="md" aria-label="Medium" />
          <PhoneInput size="lg" aria-label="Large" />
        </div>
      </DemoSection>

      <DemoSection title='Preselecting a country'>
        <div className={row}>
          <PhoneInput country="DE" aria-label="German number" />
          <PhoneInput country="BR" aria-label="Brazilian number" />
        </div>
        <p style={hintStyle}>
          Typing national digits commits the value with the selected dial
          code; pasting an international number switches the country on its
          own.
        </p>
      </DemoSection>

      <PropsSection of='PhoneInputProps' />

      <AccessibilitySection>
        <ul>
          <li>
            The country select carries an <strong>aria-label</strong> from
            the locale pack; the number field is the labeled focus target
          </li>
          <li>
            Invalid numbers flip <strong>aria-invalid</strong> and announce
            a localized hint to screen readers
          </li>
          <li>
            Validate in render with <code>isValidPhone(value, country)</code>{' '}
            — validity is derived, never stored state
          </li>
        </ul>
      </AccessibilitySection>
    </DemoPage>
  );
}
