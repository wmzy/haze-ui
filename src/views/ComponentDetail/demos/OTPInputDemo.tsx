import { OTPInput } from '@/lib';

import {
  AccessibilitySection,
  DemoPage,
  DemoSection,
  PropsSection,
} from './shared';

// ─── OTPInput ───────────────────────────────────────────────────
export default function OTPInputDemo() {
  return (
    <DemoPage
      title='OTPInput'
      description='One-time password input with individual character cells.'
    >
      <DemoSection title='Demo'>
        <OTPInput length={6} />
      </DemoSection>

      <PropsSection of='OTPInputProps' />

      <AccessibilitySection>
        <ul>
          <li>Each cell is an <strong>&lt;input&gt;</strong> with <strong>inputMode=&quot;numeric&quot;</strong></li>
          <li>Auto-advances focus on input</li>
          <li>Backspace moves focus to previous cell</li>
          <li>Paste support fills all cells</li>
        </ul>
      </AccessibilitySection>
    </DemoPage>
  );
}
