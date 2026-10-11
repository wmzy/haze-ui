import { NumberFormatter } from '@/lib';

import PropsTable from '../PropsTable';

import { intro, section } from '../styles';

// ─── NumberFormatter ──────────────────────────────────────────
export default function NumberFormatterDemo() {
  return (
    <>
      <h1>NumberFormatter</h1>
      <p className={intro}>
        Presentational number formatting on <code>Intl.NumberFormat</code>:
        locale + <code>formatOptions</code> (currency, unit, percent) with
        prefix/suffix — SSR-stable by construction.
      </p>

      <div className={section}>
        <h2>Basics</h2>
        <p>
          共 <NumberFormatter value={1234567.89} locale='en-US' /> 条结果
          ·{' '}
          <NumberFormatter
            value={1234567.89}
            locale='de-DE'
          />
        </p>
      </div>

      <div className={section}>
        <h2>Currency</h2>
        <p>
          <NumberFormatter
            value={99.5}
            locale='en-US'
            formatOptions={{ style: 'currency', currency: 'USD' }}
          />{' '}
          ·{' '}
          <NumberFormatter
            value={99.5}
            locale='zh-CN'
            formatOptions={{ style: 'currency', currency: 'CNY' }}
          />
        </p>
      </div>

      <div className={section}>
        <h2>Prefix + suffix</h2>
        <p>
          <NumberFormatter value={42} prefix='~' suffix=' items remaining' />
        </p>
      </div>

      <div className={section}>
        <h2>Props</h2>
        <PropsTable of='NumberFormatterProps' />
      </div>
    </>
  );
}
