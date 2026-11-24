import { NumberFormatter } from '@/lib';

import { DemoPage, DemoSection, PropsSection } from './shared';

// ─── NumberFormatter ──────────────────────────────────────────
export default function NumberFormatterDemo() {
  return (
    <DemoPage
      title='NumberFormatter'
      description={
        <>
          Presentational number formatting on <code>Intl.NumberFormat</code>:
          locale + <code>formatOptions</code> (currency, unit, percent) with
          prefix/suffix — SSR-stable by construction.
        </>
      }
    >
      <DemoSection title='Basics'>
        <p>
          共 <NumberFormatter value={1234567.89} locale='en-US' /> 条结果
          ·{' '}
          <NumberFormatter
            value={1234567.89}
            locale='de-DE'
          />
        </p>
      </DemoSection>

      <DemoSection title='Currency'>
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
      </DemoSection>

      <DemoSection title='Prefix + suffix'>
        <p>
          <NumberFormatter value={42} prefix='~' suffix=' items remaining' />
        </p>
      </DemoSection>

      <PropsSection of='NumberFormatterProps' />
    </DemoPage>
  );
}
