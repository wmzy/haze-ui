import { Banner } from '@/lib';

import {
  AccessibilitySection,
  DemoPage,
  DemoSection,
  noop,
  PropsSection,
} from './shared';

// ─── Banner ─────────────────────────────────────────────────────
export default function BannerDemo() {
  return (
    <DemoPage
      title='Banner'
      description='Dismissible alert banner with semantic colors.'
    >
      <DemoSection title='Colors'>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--haze-space-2)' }}>
          <Banner color='info'>This is an informational banner.</Banner>
          <Banner color='success'>Operation completed successfully.</Banner>
          <Banner color='warning'>Please review your settings.</Banner>
          <Banner color='danger' onClose={noop}>Something went wrong.</Banner>
        </div>
      </DemoSection>

      <PropsSection of='BannerProps' />

      <AccessibilitySection>
        <ul>
          <li>Uses <strong>role=&quot;alert&quot;</strong></li>
          <li>Close button has <strong>aria-label=&quot;Close&quot;</strong></li>
        </ul>
      </AccessibilitySection>
    </DemoPage>
  );
}
