import { Segmented } from '@/lib';

import { row } from '../styles';

import {
  AccessibilitySection,
  DemoPage,
  DemoSection,
  PropsSection,
} from './shared';

// ─── Segmented ──────────────────────────────────────────────────
export default function SegmentedDemo() {
  return (
    <DemoPage
      title='Segmented'
      description='Segmented control for switching between options.'
    >
      <DemoSection title='Demo'>
        <div className={row}>
          <Segmented options={['Map', 'Transit', 'Satellite']} />
        </div>
      </DemoSection>

      <DemoSection title='Sizes'>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--haze-space-3)' }}>
          <Segmented options={['Small', 'Medium', 'Large']} size='sm' />
          <Segmented options={['Small', 'Medium', 'Large']} size='md' />
          <Segmented options={['Small', 'Medium', 'Large']} size='lg' />
        </div>
      </DemoSection>

      <PropsSection of='SegmentedProps' />

      <AccessibilitySection>
        <ul>
          <li>Uses <strong>role=&quot;group&quot;</strong> on the container</li>
          <li>Each segment is a native <strong>&lt;button&gt;</strong></li>
          <li>Active segment has visual highlight with shadow</li>
        </ul>
      </AccessibilitySection>
    </DemoPage>
  );
}
