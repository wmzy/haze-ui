import { css } from '@linaria/core';

import {
  Button,
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
} from '@/lib';

import PropsTable from '../PropsTable';

import {
  AccessibilitySection,
  DemoPage,
  DemoSection,
  flushStyle,
  noteStyle,
} from './shared';

// classNames 槽位演示：一条记录在 <Collapsible> 根上声明，经 context
// 分发到 trigger/content（键名见 CollapsibleClassNames）。
const framedRoot = css`
  border: 1px solid var(--haze-color-border);
  border-radius: var(--haze-radius-md);
  padding: var(--haze-space-3);
`;

const brandedTrigger = css`
  color: var(--haze-color-primary);
`;

const paddedContent = css`
  padding-top: var(--haze-space-3);
`;

// ─── Collapsible ────────────────────────────────────────────────
export default function CollapsibleDemo() {
  return (
    <DemoPage
      title='Collapsible'
      description='Controlled collapsible section with trigger and content.'
    >
      <DemoSection title='Demo'>
        <Collapsible>
          <CollapsibleTrigger>
            <Button variant='outline' size='sm'>Toggle Content</Button>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <p style={{ padding: 'var(--haze-space-3) 0', margin: 0 }}>This content is shown when expanded.</p>
          </CollapsibleContent>
        </Collapsible>
      </DemoSection>

      <DemoSection title='classNames slots'>
        <p style={noteStyle}>
          One <code>classNames</code> record on the{' '}
          <code>&lt;Collapsible&gt;</code> root reaches every
          sub-component through context (AntD v6 shape):{' '}
          <code>root</code>, <code>trigger</code> and <code>content</code>{' '}
          (the animated row). Here the trio gets a framed card look with
          a primary-toned trigger.
        </p>
        <Collapsible
          defaultOpen
          classNames={{ root: framedRoot, trigger: brandedTrigger, content: paddedContent }}
        >
          <CollapsibleTrigger>
            <Button variant='ghost' size='sm'>Toggle Content</Button>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <p style={flushStyle}>The frame, trigger color and content spacing all come from the slot classes.</p>
          </CollapsibleContent>
        </Collapsible>
      </DemoSection>

      <DemoSection title='Collapsible Props'>
        <PropsTable of='CollapsibleProps' />
      </DemoSection>

      <AccessibilitySection>
        <ul>
          <li>Trigger is a native <strong>&lt;button&gt;</strong></li>
          <li>Content toggles visibility on trigger click</li>
        </ul>
      </AccessibilitySection>
    </DemoPage>
  );
}
