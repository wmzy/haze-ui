import { SwipeAction } from '@/lib';

import {
  AccessibilitySection,
  DemoPage,
  DemoSection,
  PropsSection,
} from './shared';

// ─── SwipeAction ────────────────────────────────────────────────
export default function SwipeActionDemo() {
  return (
    <DemoPage
      title='SwipeAction'
      description='Swipe-to-reveal actions for touch and pointer interactions.'
    >
      <DemoSection title='Demo'>
        <div style={{ maxWidth: 400, border: '1px solid var(--haze-color-border)', borderRadius: 'var(--haze-radius-md)' }}>
          <SwipeAction
            left={<div style={{ padding: 'var(--haze-space-3)', color: 'var(--haze-color-success)' }}>Archive</div>}
            right={<div style={{ padding: 'var(--haze-space-3)', color: 'var(--haze-color-danger)' }}>Delete</div>}
          >
            <div style={{ padding: 'var(--haze-space-4)', background: 'var(--haze-color-bg)' }}>Swipe left or right</div>
          </SwipeAction>
        </div>
      </DemoSection>

      <PropsSection of='SwipeActionProps' />

      <AccessibilitySection>
        <ul>
          <li>Uses pointer events for cross-device support</li>
          <li>Content slides with CSS transform</li>
          <li>Resets position on pointer release</li>
        </ul>
      </AccessibilitySection>
    </DemoPage>
  );
}
