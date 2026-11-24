import { AspectRatio } from '@/lib';

import {
  AccessibilitySection,
  DemoPage,
  DemoSection,
  maxWidth400,
  PropsSection,
} from './shared';

// ─── AspectRatio ────────────────────────────────────────────────
export default function AspectRatioDemo() {
  return (
    <DemoPage
      title='AspectRatio'
      description='Container that maintains a fixed aspect ratio.'
    >
      <DemoSection title='Demo'>
        <div style={maxWidth400}>
          <AspectRatio ratio={16 / 9}>
            <div style={{ width: '100%', height: '100%', background: 'var(--haze-color-bg-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              16:9
            </div>
          </AspectRatio>
        </div>
      </DemoSection>

      <PropsSection of='AspectRatioProps' />

      <AccessibilitySection>
        <ul>
          <li>Uses CSS <strong>padding-bottom</strong> technique for ratio</li>
          <li>Content is absolutely positioned inside</li>
        </ul>
      </AccessibilitySection>
    </DemoPage>
  );
}
