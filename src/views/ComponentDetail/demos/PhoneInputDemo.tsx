import { useControl } from 'react-use-control';

import { PhoneInput, isValidPhone } from '@/lib';

import A11yNote from '../A11yNote';
import PropsTable from '../PropsTable';

import { intro, row, section } from '../styles';

// ─── PhoneInput ────────────────────────────────────────────────
export default function PhoneInputDemo() {
  const [, , valueCtrl] = useControl('');
  const [value] = useControl(valueCtrl);
  const [, , countryCtrl] = useControl('CN' as const);
  const [country] = useControl(countryCtrl);

  return (
    <>
      <h1>PhoneInput</h1>
      <p className={intro}>
        International phone number input: a country select joined to the
        number field, backed by <code>libphonenumber-js</code>. Values are
        E.164-ish (<code>+8613800138000</code>); country names follow the
        active locale.
      </p>

      <div className={section}>
        <h2>Demo</h2>
        <div className={row}>
          <PhoneInput
            value={valueCtrl}
            country={countryCtrl}
            aria-label="Phone"
          />
          <span
            style={{
              fontSize: 'var(--haze-text-sm)',
              color: 'var(--haze-color-text-secondary)',
            }}
          >
            Value: {value || '—'} ·{' '}
            {value === '' || isValidPhone(value, country) ? 'valid' : 'invalid'}
          </span>
        </div>
      </div>

      <div className={section}>
        <h2>Sizes</h2>
        <div className={row}>
          <PhoneInput size="sm" aria-label="Small" />
          <PhoneInput size="md" aria-label="Medium" />
          <PhoneInput size="lg" aria-label="Large" />
        </div>
      </div>

      <div className={section}>
        <h2>Preselecting a country</h2>
        <div className={row}>
          <PhoneInput country="DE" aria-label="German number" />
          <PhoneInput country="BR" aria-label="Brazilian number" />
        </div>
        <p
          style={{
            fontSize: 'var(--haze-text-sm)',
            color: 'var(--haze-color-text-secondary)',
          }}
        >
          Typing national digits commits the value with the selected dial
          code; pasting an international number switches the country on its
          own.
        </p>
      </div>

      <div className={section}>
        <h2>Props</h2>
        <PropsTable of="PhoneInputProps" />
      </div>

      <div className={section}>
        <h2>Accessibility</h2>
        <A11yNote>
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
        </A11yNote>
      </div>
    </>
  );
}
