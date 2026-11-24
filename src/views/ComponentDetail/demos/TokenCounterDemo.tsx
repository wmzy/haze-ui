import { TokenCounter } from '@/lib';

import {
  AccessibilitySection,
  CssVarsSection,
  DemoPage,
  DemoSection,
  PropsSection,
} from './shared';

// ─── TokenCounter ─────────────────────────────────────────────
export default function TokenCounterDemo() {
  return (
    <DemoPage
      title='TokenCounter'
      description={
        <>
          Progress bar showing token usage with color changes at warning and
          danger thresholds.
        </>
      }
    >
      <DemoSection title='Demo'>
        <div style={{ maxWidth: 320, display: 'flex', flexDirection: 'column', gap: 'var(--haze-space-3)' }}>
          <TokenCounter used={1500} max={8000} label='Context' />
          <TokenCounter used={6000} max={8000} label='Context' />
          <TokenCounter used={7500} max={8000} label='Context' />
        </div>
      </DemoSection>

      <PropsSection of='TokenCounterProps' />

      <AccessibilitySection>
        <ul>
          <li>
            Color changes at 70% (warning) and 90% (danger) thresholds
          </li>
          <li>Uses tabular-nums for consistent number alignment</li>
        </ul>
      </AccessibilitySection>

      <CssVarsSection component='tokencounter' />
    </DemoPage>
  );
}
