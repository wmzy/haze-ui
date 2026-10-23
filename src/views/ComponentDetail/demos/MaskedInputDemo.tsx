import { useControl } from 'react-use-control';

import { MaskedInput, unmask } from '@/lib';

import A11yNote from '../A11yNote';
import PropsTable from '../PropsTable';

import { intro, row, section } from '../styles';

const PHONE = '(999) 999-9999';
const CARD = '9999 9999 9999 9999';
const DATE = '99/99/9999';

// ─── MaskedInput ───────────────────────────────────────────────
export default function MaskedInputDemo() {
  const [, , phoneCtrl] = useControl('');
  const [phone] = useControl(phoneCtrl);

  return (
    <>
      <h1>MaskedInput</h1>
      <p className={intro}>
        Text input enforcing a mask pattern: <code>9</code> digit,{' '}
        <code>a</code> letter, <code>A</code> uppercase letter,{' '}
        <code>*</code> alphanumeric; any other character is a literal and{' '}
        <code>\</code> escapes a rule character.
      </p>

      <div className={section}>
        <h2>Demo</h2>
        <div className={row}>
          <MaskedInput
            mask={PHONE}
            value={phoneCtrl}
            placeholder="(555) 123-4567"
            aria-label="Phone"
          />
          <span
            style={{
              fontSize: 'var(--haze-text-sm)',
              color: 'var(--haze-color-text-secondary)',
            }}
          >
            Masked: {phone} · digits: {unmask(phone, PHONE)}
          </span>
        </div>
      </div>

      <div className={section}>
        <h2>Card number &amp; date</h2>
        <div className={row}>
          <MaskedInput
            mask={CARD}
            placeholder="4242 4242 4242 4242"
            aria-label="Card number"
          />
          <MaskedInput mask={DATE} placeholder="MM/DD/YYYY" aria-label="Date" />
        </div>
        <p
          style={{
            fontSize: 'var(--haze-text-sm)',
            color: 'var(--haze-color-text-secondary)',
          }}
        >
          Use <code>unmask(value, mask)</code> to pull the typed characters
          out of the masked string for storage or validation.
        </p>
      </div>

      <div className={section}>
        <h2>Sizes</h2>
        <div className={row}>
          <MaskedInput mask={PHONE} size="sm" aria-label="Small" />
          <MaskedInput mask={PHONE} size="md" aria-label="Medium" />
          <MaskedInput mask={PHONE} size="lg" aria-label="Large" />
        </div>
      </div>

      <div className={section}>
        <h2>Slots</h2>
        <div className={row}>
          <MaskedInput
            mask={CARD}
            leftSection={
              <span aria-hidden="true" style={{ opacity: 0.7 }}>
                ▤
              </span>
            }
            aria-label="Card"
          />
          <MaskedInput mask={DATE} disabled value="10/14/2026" aria-label="Locked date" />
        </div>
      </div>

      <div className={section}>
        <h2>Props</h2>
        <PropsTable of="MaskedInputProps" />
      </div>

      <div className={section}>
        <h2>Accessibility</h2>
        <A11yNote>
          <ul>
            <li>
              Renders a native <strong>&lt;input&gt;</strong> — labels,
              hints, and form wiring flow through <code>FormItem</code>
            </li>
            <li>
              Rejected characters (a letter into a digit slot) are no-ops;
              the caret stays put
            </li>
            <li>
              The mask pattern is visual only — pair with a{' '}
              <code>pattern</code> or <code>Validator</code> for input
              constraints
            </li>
          </ul>
        </A11yNote>
      </div>
    </>
  );
}
