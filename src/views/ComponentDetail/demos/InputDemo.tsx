import { Input } from '@/lib';

import { fieldRow } from '../styles';

import {
  AccessibilitySection,
  CssVarsSection,
  DemoPage,
  DemoSection,
  PropsSection,
} from './shared';

// ─── Input ─────────────────────────────────────────────────────
export default function InputDemo() {
  return (
    <DemoPage
      title='Input'
      description='Single-line text input with controlled/uncontrolled support.'
    >
      <DemoSection title='Sizes'>
        <div className={fieldRow}>
          <Input size='sm' placeholder='Small' />
        </div>
        <div className={fieldRow}>
          <Input size='md' placeholder='Medium' />
        </div>
        <div className={fieldRow}>
          <Input size='lg' placeholder='Large' />
        </div>
      </DemoSection>

      <DemoSection title='Disabled'>
        <div className={fieldRow}>
          <Input disabled placeholder='Disabled' />
        </div>
      </DemoSection>

      <PropsSection of='InputProps' />

      <AccessibilitySection>
        <ul>
          <li>
            Renders as native <strong>&lt;input&gt;</strong>
          </li>
          <li>
            Use <strong>aria-label</strong> or a visible{' '}
            <strong>&lt;label&gt;</strong> for screen readers
          </li>
          <li>
            Focus ring via <strong>:focus</strong> pseudo-class
          </li>
        </ul>
      </AccessibilitySection>

      <CssVarsSection component='input' />
    </DemoPage>
  );
}
