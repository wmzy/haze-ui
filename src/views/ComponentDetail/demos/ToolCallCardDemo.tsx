import { ToolCallCard } from '@/lib';

import {
  AccessibilitySection,
  CssVarsSection,
  DemoPage,
  DemoSection,
  meterGroupStyle,
  PropsSection,
} from './shared';

// ─── ToolCallCard ─────────────────────────────────────────────
export default function ToolCallCardDemo() {
  return (
    <DemoPage
      title='ToolCallCard'
      description='Displays tool/function call details with input, output, and status indicator.'
    >
      <DemoSection title='Statuses'>
        <div style={meterGroupStyle}>
          <ToolCallCard name='search_docs' status='pending' />
          <ToolCallCard name='fetch_data' input='url: /api/users' status='running' />
          <ToolCallCard
            name='calculate'
            input='expression: 2 + 2'
            output='4'
            status='done'
          />
          <ToolCallCard name='send_email' input='to: user@example.com' status='error' />
        </div>
      </DemoSection>

      <PropsSection of='ToolCallCardProps' />

      <AccessibilitySection>
        <ul>
          <li>Status is indicated by a colored dot and text label</li>
          <li>Uses monospace font for input/output content</li>
        </ul>
      </AccessibilitySection>

      <CssVarsSection component='toolcallcard' />
    </DemoPage>
  );
}
