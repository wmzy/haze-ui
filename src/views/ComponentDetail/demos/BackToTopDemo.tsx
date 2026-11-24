import { BackToTop } from '@/lib';

import {
  AccessibilitySection,
  DemoPage,
  DemoSection,
  hintStyle,
  PropsSection,
} from './shared';

// ─── BackToTop ──────────────────────────────────────────────────
export default function BackToTopDemo() {
  return (
    <DemoPage
      title='BackToTop'
      description='Fixed scroll-to-top button that appears after scrolling.'
    >
      <DemoSection title='Demo'>
        <p style={hintStyle}>
          Scroll down to see the button appear at the bottom-right corner.
        </p>
        <BackToTop threshold={100} />
      </DemoSection>

      <PropsSection of='BackToTopProps' />

      <AccessibilitySection>
        <ul>
          <li>Uses <strong>aria-label=&quot;Back to top&quot;</strong></li>
          <li>Smooth scroll animation</li>
          <li>Hidden with opacity and pointer-events when below threshold</li>
        </ul>
      </AccessibilitySection>
    </DemoPage>
  );
}
