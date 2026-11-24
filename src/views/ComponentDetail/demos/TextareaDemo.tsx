import { Textarea } from '@/lib';

import { fieldRow } from '../styles';

import {
  AccessibilitySection,
  CssVarsSection,
  DemoPage,
  DemoSection,
  PropsSection,
} from './shared';

// ─── Textarea ──────────────────────────────────────────────────
export default function TextareaDemo() {
  return (
    <DemoPage
      title='Textarea'
      description='Multi-line text input, styled consistently with Input.'
    >
      <DemoSection title='Sizes'>
        <div className={fieldRow}>
          <Textarea size='sm' placeholder='Small' rows={3} />
        </div>
        <div className={fieldRow}>
          <Textarea size='md' placeholder='Medium' rows={3} />
        </div>
        <div className={fieldRow}>
          <Textarea size='lg' placeholder='Large' rows={3} />
        </div>
      </DemoSection>

      <DemoSection title='Disabled'>
        <div className={fieldRow}>
          <Textarea disabled placeholder='Disabled' rows={3} />
        </div>
      </DemoSection>

      <PropsSection of='TextareaProps' />

      <AccessibilitySection>
        <ul>
          <li>
            Renders as native <strong>&lt;textarea&gt;</strong>
          </li>
          <li>
            Use <strong>aria-label</strong> or a visible{' '}
            <strong>&lt;label&gt;</strong>
          </li>
          <li>
            Supports <strong>resize: vertical</strong> by default
          </li>
        </ul>
      </AccessibilitySection>

      <CssVarsSection component='textarea' />
    </DemoPage>
  );
}
