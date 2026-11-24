import { InlineCitation } from '@/lib';

import PropsTable from '../PropsTable';

import {
  AccessibilitySection,
  CssVarsSection,
  DemoPage,
  DemoSection,
} from './shared';

// ─── InlineCitation ────────────────────────────────────────────
export default function InlineCitationDemo() {
  return (
    <DemoPage
      title='InlineCitation'
      description={
        <>
          Inline superscript citation marker that opens a floating source card
          with the title, an excerpt and an optional outbound link.
        </>
      }
    >
      <DemoSection title='Demo'>
        <p style={{ maxWidth: 480, lineHeight: 1.7 }}>
          Retrieval-augmented answers cite their evidence
          <InlineCitation
            index={1}
            href='https://example.com/sources/design-tokens'
            title='Design tokens in component libraries'
            snippet='Tokens decouple visual decisions from component code, letting themes swap values without touching markup…'
 />
          , and multiple sources stack as numbered markers
          <InlineCitation
            index={2}
            title='Internal wiki (no link)'
            snippet='Offline knowledge base entry quoted verbatim for grounding.'
 />
          .
        </p>
      </DemoSection>

      <DemoSection title='Controlled Open State'>
        <p style={{ maxWidth: 480, lineHeight: 1.7 }}>
          The card visibility is a control-prop state
          <InlineCitation index={3} title='Pinned source' snippet='Opened through the open control.' open />
          .
        </p>
      </DemoSection>

      <DemoSection title='InlineCitation Props'>
        <PropsTable of='InlineCitationProps' />
      </DemoSection>

      <AccessibilitySection>
        <ul>
          <li>
            The badge is a real <code>button</code> (Enter/Space activate)
            with <code>aria-haspopup</code>/<code>aria-expanded</code>/
            <code>aria-controls</code> wiring
          </li>
          <li>Escape and outside pointerdown close the card</li>
          <li>
            Outbound links open in a new tab with{' '}
            <code>rel=&quot;noopener noreferrer&quot;</code>
          </li>
        </ul>
      </AccessibilitySection>

      <CssVarsSection component='inline-citation' />
    </DemoPage>
  );
}
