import { PasswordInput } from '@/lib';

import { fieldRow } from '../styles';

import {
  AccessibilitySection,
  DemoPage,
  DemoSection,
  PropsSection,
} from './shared';

// ─── PasswordInput ──────────────────────────────────────────────
export default function PasswordInputDemo() {
  return (
    <DemoPage
      title='PasswordInput'
      description='Password field with show/hide toggle.'
    >
      <DemoSection title='Demo'>
        <div className={fieldRow}>
          <PasswordInput placeholder='Enter password' />
        </div>
      </DemoSection>

      <PropsSection of='PasswordInputProps' />

      <AccessibilitySection>
        <ul>
          <li>Toggle button has <strong>aria-label</strong> (&quot;Show password&quot; / &quot;Hide password&quot;)</li>
          <li>Toggle button uses <strong>tabIndex={'{'}-1{'}'}</strong> to skip tab order</li>
          <li>Type switches between &quot;password&quot; and &quot;text&quot;</li>
        </ul>
      </AccessibilitySection>
    </DemoPage>
  );
}
