import { Disclosure } from '@/lib';

import {
  AccessibilitySection,
  CssVarsSection,
  DemoPage,
  DemoSection,
  maxWidth480,
  PropsSection,
} from './shared';

// ─── Disclosure ────────────────────────────────────────────────
export default function DisclosureDemo() {
  return (
    <DemoPage
      title='Disclosure'
      description='Single collapsible section using native details/summary.'
    >
      <DemoSection title='Demo'>
        <div style={maxWidth480}>
          <Disclosure summary='Click to expand'>
            This is the hidden content that appears when the disclosure is
            opened. It uses the native details/summary elements for built-in
            accessibility.
          </Disclosure>
        </div>
      </DemoSection>

      <PropsSection of='DisclosureProps' />

      <AccessibilitySection>
        <ul>
          <li>
            Uses native <strong>&lt;details&gt;</strong>/
            <strong>&lt;summary&gt;</strong>
          </li>
          <li>
            <strong>Enter</strong>/<strong>Space</strong> toggles open/close
          </li>
          <li>Screen readers announce expanded/collapsed state</li>
        </ul>
      </AccessibilitySection>

      <CssVarsSection component='disclosure' />
    </DemoPage>
  );
}
