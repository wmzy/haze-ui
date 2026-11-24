import { Button, Tooltip } from '@/lib';

import { row } from '../styles';

import {
  AccessibilitySection,
  CssVarsSection,
  DemoPage,
  DemoSection,
  PropsSection,
} from './shared';

// ─── Tooltip ───────────────────────────────────────────────────
export default function TooltipDemo() {
  return (
    <DemoPage
      title='Tooltip'
      description='Informational popup triggered by hover or focus, using pure CSS.'
    >
      <DemoSection title='Positions'>
        <div className={row}>
          <Tooltip content='Top tooltip' position='top'>
            <Button variant='outline'>Top</Button>
          </Tooltip>
          <Tooltip content='Bottom tooltip' position='bottom'>
            <Button variant='outline'>Bottom</Button>
          </Tooltip>
          <Tooltip content='Left tooltip' position='left'>
            <Button variant='outline'>Left</Button>
          </Tooltip>
          <Tooltip content='Right tooltip' position='right'>
            <Button variant='outline'>Right</Button>
          </Tooltip>
        </div>
      </DemoSection>

      <PropsSection of='TooltipProps' />

      <AccessibilitySection>
        <ul>
          <li>
            Uses <strong>role=&quot;tooltip&quot;</strong> with{' '}
            <strong>aria-describedby</strong>
          </li>
          <li>
            Visible on <strong>hover</strong> and{' '}
            <strong>focus-within</strong>
          </li>
          <li>Content is always in the DOM for screen readers</li>
        </ul>
      </AccessibilitySection>

      <CssVarsSection component='tooltip' />
    </DemoPage>
  );
}
