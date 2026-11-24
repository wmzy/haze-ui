import { useState } from 'react';

import { Button, StreamingText } from '@/lib';

import { row } from '../styles';

import {
  AccessibilitySection,
  CssVarsSection,
  DemoPage,
  DemoSection,
  PropsSection,
} from './shared';

// ─── StreamingText ────────────────────────────────────────────
export default function StreamingTextDemo() {
  const [key, setKey] = useState(0);

  return (
    <DemoPage
      title='StreamingText'
      description={
        <>
          Typewriter effect that reveals text character by character with an
          optional blinking cursor.
        </>
      }
    >
      <DemoSection title='Demo'>
        <StreamingText
          key={key}
          text='Hello! This text appears one character at a time, simulating a streaming response from an AI assistant.'
          speed={25}
        />
        <div className={row} style={{ marginTop: 'var(--haze-space-3)' }}>
          <Button size='sm' variant='outline' onClick={() => setKey((k) => k + 1)}>
            Replay
          </Button>
        </div>
      </DemoSection>

      <PropsSection of='StreamingTextProps' />

      <AccessibilitySection>
        <ul>
          <li>
            Cursor animation uses <strong>animation: blink</strong> with
            step-end timing
          </li>
          <li>
            Respects <strong>prefers-reduced-motion</strong> via CSS
          </li>
        </ul>
      </AccessibilitySection>

      <CssVarsSection component='streamingtext' />
    </DemoPage>
  );
}
