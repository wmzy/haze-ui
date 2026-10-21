import { useState } from 'react';

import { Button, StepTimeline, StepTimelineItem } from '@/lib';

import PropsTable from '../PropsTable';

import A11yNote from '../A11yNote';

import { intro, section, codeBlock } from '../styles';

import { CssVarsSection } from './shared';

function TraceIo({ label, body }: { label: string; body: string }) {
  return (
    <div style={{ marginBlockEnd: 'var(--haze-space-2)' }}>
      <div
        style={{
          fontSize: 'var(--haze-text-xs)',
          color: 'var(--haze-color-text-muted)',
          marginBlockEnd: 'var(--haze-space-1)',
        }}
      >
        {label}
      </div>
      <pre className={codeBlock}>{body}</pre>
    </div>
  );
}

function AgentTraceExample() {
  const [phase, setPhase] = useState<'running' | 'done'>('running');

  return (
    <>
      <div style={{ maxWidth: 480 }}>
        <StepTimeline>
          <StepTimelineItem
            label='Plan'
            description='Drafted a 3-step plan'
            status='done'
            time='0.8s'
          />
          <StepTimelineItem
            label='read_file'
            description='src/lib/index.ts'
            status={phase}
            time={phase === 'done' ? '0.3s' : '0.1s…'}
            collapsible
            content={
              <>
                <TraceIo
                  label='input'
                  body={'{ "path": "src/lib/index.ts" }'}
                />
                {phase === 'done' && (
                  <TraceIo
                    label='output'
                    body={'912 lines read (24.3 KB)'}
                  />
                )}
              </>
            }
          >
            <StepTimelineItem label='stat' status='done' time='12ms' />
            <StepTimelineItem
              label='read'
              status={phase === 'done' ? 'done' : 'running'}
              time={phase === 'done' ? '280ms' : 'reading…'}
            />
          </StepTimelineItem>
          <StepTimelineItem
            label='Summarize'
            description='Waiting for tool calls'
            status='pending'
          />
        </StepTimeline>
      </div>
      <p>
        <Button
          size='sm'
          variant='outline'
          onClick={() => setPhase(phase === 'done' ? 'running' : 'done')}
        >
          {phase === 'done' ? 'Re-run tool call' : 'Mark tool call done'}
        </Button>
      </p>
    </>
  );
}

// ─── StepTimeline ─────────────────────────────────────────────
export default function StepTimelineDemo() {
  return (
    <>
      <h1>StepTimeline</h1>
      <p className={intro}>
        Vertical timeline showing steps with status markers (pending, active,
        running, done, error), optional timing, expandable rows and nested
        sub-steps — the shape agentic traces need.
      </p>

      <div className={section}>
        <h2>Demo</h2>
        <div style={{ maxWidth: 360 }}>
          <StepTimeline>
            <StepTimelineItem label='Connected' description='API linked' status='done' />
            <StepTimelineItem label='Processing' description='Analyzing data...' status='active' />
            <StepTimelineItem label='Review' status='pending' />
            <StepTimelineItem label='Deploy' status='pending' />
          </StepTimeline>
        </div>
      </div>

      <div className={section}>
        <h2>Error State</h2>
        <div style={{ maxWidth: 360 }}>
          <StepTimeline>
            <StepTimelineItem label='Upload' description='File sent' status='done' />
            <StepTimelineItem label='Validate' description='Schema mismatch' status='error' />
            <StepTimelineItem label='Complete' status='pending' />
          </StepTimeline>
        </div>
      </div>

      <div className={section}>
        <h2>Agent Trace</h2>
        <p className={intro}>
          A tool call mid-flight: <code>running</code> pulses its marker,{' '}
          <code>time</code> shows the elapsed duration, and{' '}
          <code>collapsible</code> turns the row into a disclosure for the
          tool&apos;s input/output. Nested <code>StepTimelineItem</code>s
          render as an indented sub-timeline for sub-operations.
        </p>
        <AgentTraceExample />
        <pre className={codeBlock}>
          {`<StepTimelineItem label='read_file' status='done' time='0.3s'
  collapsible content={<TraceIo label='input' body={inputJson} />}>
  <StepTimelineItem label='stat' status='done' time='12ms' />
  <StepTimelineItem label='read' status='done' time='280ms' />
</StepTimelineItem>`}
        </pre>
        <p className={intro}>
          The expanded state is controllable: pass <code>open</code> (a
          plain value or a <code>ControlOrValue</code> control) and listen
          with <code>onOpenChange</code>.
        </p>
      </div>

      <div className={section}>
        <h2>StepTimeline Props</h2>
        <PropsTable of='StepTimelineProps' />
      </div>

      <div className={section}>
        <h2>StepTimelineItem Props</h2>
        <PropsTable of='StepTimelineItemProps' />
      </div>

      <div className={section}>
        <h2>Accessibility</h2>
        <A11yNote>
          <ul>
            <li>
              Status is conveyed through color and icon (checkmark,
              exclamation); the running pulse collapses under{' '}
              <strong>prefers-reduced-motion</strong>
            </li>
            <li>
              Collapsible headers are native buttons with{' '}
              <strong>aria-expanded</strong>/<strong>aria-controls</strong>{' '}
              — Enter and Space activate them
            </li>
            <li>
              Connecting lines use CSS <strong>::before</strong>{' '}
              pseudo-elements; every item exposes{' '}
              <strong>data-status</strong> for consumer styling
            </li>
          </ul>
        </A11yNote>
      </div>

      <CssVarsSection component='steptimeline' />
    </>
  );
}
