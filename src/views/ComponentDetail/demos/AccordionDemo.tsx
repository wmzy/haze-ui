import { Accordion, AccordionItem } from '@/lib';

import PropsTable from '../PropsTable';

import {
  AccessibilitySection,
  CssVarsSection,
  DemoPage,
  DemoSection,
} from './shared';

// ─── Accordion ─────────────────────────────────────────────────
export default function AccordionDemo() {
  return (
    <DemoPage
      title='Accordion'
      description={'Collapsible content sections using native <details>/<summary>.'}
    >
      <DemoSection title='Demo'>
        <Accordion>
          <AccordionItem title='Section One'>
            Content for section one. This uses the native details/summary
            elements.
          </AccordionItem>
          <AccordionItem title='Section Two'>
            Content for section two. Click the header to expand or collapse.
          </AccordionItem>
          <AccordionItem title='Section Three'>
            Content for section three. The chevron rotates and the content
            height animates on open.
          </AccordionItem>
        </Accordion>
      </DemoSection>

      <DemoSection title='Accordion Props'>
        <PropsTable of='AccordionProps' />
      </DemoSection>

      <DemoSection title='AccordionItem Props'>
        <PropsTable of='AccordionItemProps' />
      </DemoSection>

      <AccessibilitySection>
        <ul>
          <li>
            Uses native <strong>&lt;details&gt;</strong>/
            <strong>&lt;summary&gt;</strong> — built-in keyboard and screen
            reader support
          </li>
          <li>
            <strong>Enter</strong>/<strong>Space</strong> toggles open/close
          </li>
          <li>
            Exclusive mode uses the HTML <strong>name</strong> attribute for
            mutual exclusion
          </li>
          <li>
            Open/close height animates via CSS progressive enhancement
            (<code>::details-content</code> + <code>interpolate-size</code>)
            — engines without support fall back to instant toggles, and{' '}
            <strong>prefers-reduced-motion</strong> collapses the animation
            to instant
          </li>
        </ul>
      </AccessibilitySection>

      <CssVarsSection component='accordion' />
    </DemoPage>
  );
}
