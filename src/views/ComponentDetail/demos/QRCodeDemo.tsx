// Direct component import until the barrel wiring lands with the Wave 3
// shared-file patches (DescriptionsDemo/JsonViewDemo precedent).
import { QRCode } from '@/lib/components/QRCode';


import {
  AccessibilitySection,
  CssVarsSection,
  DemoPage,
  DemoSection,
  PropsSection,
} from './shared';

// ─── QRCode ─────────────────────────────────────────────────────
export default function QRCodeDemo() {
  return (
    <DemoPage
      title='QRCode'
      description={
        <>
          QR codes rendered as a single crisp SVG path — colors follow the theme
          tokens until overridden. Requires the optional <code>qrcode</code> peer
          dependency.
        </>
      }
    >
      <DemoSection title='Basic'>
        <QRCode value='https://github.com/wmzy/haze-ui' />
      </DemoSection>

      <DemoSection title='Without Border'>
        <QRCode value='https://github.com/wmzy/haze-ui' bordered={false} />
      </DemoSection>

      <DemoSection title='Error Correction Level &amp; Size'>
        <div style={{ display: 'flex', gap: 'var(--haze-space-6)', alignItems: 'flex-start', flexWrap: 'wrap' }}>
          <QRCode value='https://github.com/wmzy/haze-ui' level='L' size={96} />
          <QRCode value='https://github.com/wmzy/haze-ui' level='M' size={96} />
          <QRCode value='https://github.com/wmzy/haze-ui' level='Q' size={96} />
          <QRCode value='https://github.com/wmzy/haze-ui' level='H' size={96} />
        </div>
      </DemoSection>

      <DemoSection title='Custom Colors'>
        <div style={{ display: 'flex', gap: 'var(--haze-space-6)', alignItems: 'flex-start', flexWrap: 'wrap' }}>
          <QRCode value='https://github.com/wmzy/haze-ui' modulesColor='#0e7490' bgColor='#ecfeff' />
          <QRCode value='https://github.com/wmzy/haze-ui' modulesColor='#7c2d12' bgColor='#fff7ed' />
        </div>
      </DemoSection>

      <PropsSection of='QRCodeProps' />

      <AccessibilitySection>
        <ul>
          <li>
            The svg is <strong>role=&quot;img&quot;</strong> with the encoded <strong>&quot;value&quot;</strong> as its accessible name — screen readers announce what the code contains
          </li>
          <li>
            Native props land on the wrapper div — <strong>aria-hidden</strong> there silences the graphic, a wrapper link makes it clickable
          </li>
        </ul>
      </AccessibilitySection>

      <CssVarsSection component='qrcode' />
    </DemoPage>
  );
}
