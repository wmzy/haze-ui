import { ThinkingIndicator } from '@/lib';

import {
  AccessibilitySection,
  CssVarsSection,
  DemoPage,
  DemoSection,
  PropsSection,
} from './shared';

// ─── ThinkingIndicator ────────────────────────────────────────
export default function ThinkingIndicatorDemo() {
  return (
    <DemoPage
      title='ThinkingIndicator'
      description='Animated bouncing dots with customizable text to indicate AI is processing.'
    >
      <DemoSection title='Demo'>
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--haze-space-3)',
          }}
        >
          <ThinkingIndicator />
          <ThinkingIndicator text='Processing' />
          <ThinkingIndicator text='Generating' />
        </div>
      </DemoSection>

      <PropsSection of='ThinkingIndicatorProps' />

      <AccessibilitySection>
        <ul>
          <li>
            Purely decorative animation; consider{' '}
            <strong>aria-live=&quot;polite&quot;</strong> on a parent for screen
            readers
          </li>
          <li>
            Dot animation respects <strong>prefers-reduced-motion</strong>
          </li>
        </ul>
      </AccessibilitySection>

      <CssVarsSection component='thinkingindicator' />
    </DemoPage>
  );
}
