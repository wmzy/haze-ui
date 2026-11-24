import { css } from '@linaria/core';

import { Button, Popover } from '@/lib';

import { row } from '../styles';

import {
  AccessibilitySection,
  CssVarsSection,
  DemoPage,
  DemoSection,
  noteStyle,
  PropsSection,
} from './shared';

// classNames 槽位演示：trigger 落在触发器包裹元素上、content 落在浮层
// 面板上（键名见 PopoverClassNames）。
const haloTrigger = css`
  outline: 2px dashed var(--haze-color-primary);
  outline-offset: var(--haze-space-2);
`;

const brandedPanel = css`
  border-color: var(--haze-color-primary);
`;

// ─── Popover ───────────────────────────────────────────────────
export default function PopoverDemo() {
  return (
    <DemoPage
      title='Popover'
      description='Click-triggered floating panel for additional content.'
    >
      <DemoSection title='Demo'>
        <div className={row}>
          <Popover content={<div>Popover content goes here.</div>}>
            <Button variant='outline'>Toggle Popover</Button>
          </Popover>
        </div>
      </DemoSection>

      <DemoSection title='classNames slots'>
        <p style={noteStyle}>
          The <code>classNames</code> record targets the two structural
          parts (AntD v6 shape): <code>trigger</code> lands on the
          clickable wrapper around the children, <code>content</code> on
          the floating panel. Here the trigger gets a primary halo and
          the panel a primary border.
        </p>
        <div className={row}>
          <Popover
            content={<div>The panel border comes from the content slot.</div>}
            classNames={{ trigger: haloTrigger, content: brandedPanel }}
          >
            <Button variant='outline'>Toggle Popover</Button>
          </Popover>
        </div>
      </DemoSection>

      <PropsSection of='PopoverProps' />

      <AccessibilitySection>
        <ul>
          <li>
            Trigger has <strong>aria-expanded</strong> and{' '}
            <strong>aria-controls</strong>
          </li>
          <li>
            Panel is hidden with <strong>display: none</strong> when closed
          </li>
          <li>Click trigger to toggle open/close</li>
        </ul>
      </AccessibilitySection>

      <CssVarsSection component='popover' />
    </DemoPage>
  );
}
