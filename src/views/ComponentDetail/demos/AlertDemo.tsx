import { useState } from 'react';

import { Button, Alert } from '@/lib';

import {
  AccessibilitySection,
  CssVarsSection,
  DemoPage,
  DemoSection,
  maxWidth480,
  PropsSection,
} from './shared';

// ─── Alert ─────────────────────────────────────────────────────
export default function AlertDemo() {
  const [key, setKey] = useState(0);

  return (
    <DemoPage
      title='Alert'
      description='Contextual feedback messages for user actions.'
    >
      <DemoSection title='Colors'>
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--haze-space-3)',
            maxWidth: 480,
          }}
        >
          <Alert color='info'>This is an informational alert.</Alert>
          <Alert color='success'>Operation completed successfully.</Alert>
          <Alert color='warning'>Please review before proceeding.</Alert>
          <Alert color='danger'>An error occurred. Please try again.</Alert>
        </div>
      </DemoSection>

      <DemoSection title='Closable'>
        <div style={maxWidth480}>
          <Alert key={key} color='info' closable>
            This alert can be dismissed. Click the × button.
          </Alert>
          <Button
            variant='ghost'
            size='sm'
            onClick={() => setKey((k) => k + 1)}
          >
            Reset
          </Button>
        </div>
      </DemoSection>

      <PropsSection of='AlertProps' />

      <AccessibilitySection>
        <ul>
          <li>
            Uses <strong>role=&quot;alert&quot;</strong> — announced by screen
            readers immediately
          </li>
          <li>
            Close button has <strong>aria-label=&quot;Close&quot;</strong>
          </li>
          <li>Focus management: close button is keyboard accessible</li>
        </ul>
      </AccessibilitySection>

      <CssVarsSection component='alert' />
    </DemoPage>
  );
}
