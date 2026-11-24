import { InlineEdit } from '@/lib';

import {
  AccessibilitySection,
  DemoPage,
  DemoSection,
  PropsSection,
} from './shared';

// ─── InlineEdit ─────────────────────────────────────────────────
export default function InlineEditDemo() {
  return (
    <DemoPage
      title='InlineEdit'
      description='Click-to-edit text with inline input.'
    >
      <DemoSection title='Demo'>
        <InlineEdit placeholder='Click to edit this text' />
      </DemoSection>

      <PropsSection of='InlineEditProps' />

      <AccessibilitySection>
        <ul>
          <li>Display mode uses <strong>role=&quot;button&quot;</strong> with <strong>tabIndex</strong></li>
          <li>Enter starts editing, Enter commits, Escape cancels</li>
          <li>Blur commits the value</li>
        </ul>
      </AccessibilitySection>
    </DemoPage>
  );
}
