import { useState } from 'react';

import { Button, Trace, TraceDetails, TraceItem } from '@/lib';

import PropsTable from '../PropsTable';

import A11yNote from '../A11yNote';

import { intro, section, codeBlock } from '../styles';

import { CssVarsSection } from './shared';

function ReasoningExample() {
  const [phase, setPhase] = useState<'running' | 'done' | 'error'>('running');

  return (
    <>
      <div style={{ maxWidth: 480 }}>
        <Trace>
          <TraceItem title='Analyze request' status='done' />
          <TraceItem
            title={phase === 'running' ? 'Searching docs…' : 'Searched docs'}
            status={phase === 'error' ? 'error' : phase}
            details={
              <TraceDetails>
                {phase === 'running'
                  ? '{"query": "trace component a11y", "status": "streaming"}'
                  : '{"query": "trace component a11y", "hits": 3}'}
              </TraceDetails>
            }
          />
          <TraceItem title='Draft answer' status='pending' />
        </Trace>
      </div>
      <p>
        <Button
          size='sm'
          variant='outline'
          onClick={() =>
            setPhase(phase === 'running' ? 'done' : phase === 'done' ? 'error' : 'running')
          }
        >
          {phase === 'running' ? 'Mark search done' : phase === 'done' ? 'Fail search' : 'Re-run search'}
        </Button>
      </p>
    </>
  );
}

// ─── Trace ─────────────────────────────────────────────────────
export default function TraceDemo() {
  return (
    <>
      <h1>Trace</h1>
      <p className={intro}>
        Line-by-line reasoning trace for agent steps: each TraceItem is one
        step with a status marker (pending, running, done, error), an
        optional custom icon and an optional disclosure that reveals{' '}
        <code>details</code> below the line — the shape agentic reasoning
        and tool-call traces need.
      </p>

      <div className={section}>
        <h2>Demo</h2>
        <div style={{ maxWidth: 360 }}>
          <Trace>
            <TraceItem title='Analyze request' status='done' />
            <TraceItem title='Search documentation' status='running' />
            <TraceItem title='Draft answer' status='pending' />
          </Trace>
        </div>
      </div>

      <div className={section}>
        <h2>Four States</h2>
        <div style={{ maxWidth: 360 }}>
          <Trace>
            <TraceItem title='Queued' status='pending' />
            <TraceItem title='Searching docs…' status='running' />
            <TraceItem title='Searched docs' status='done' />
            <TraceItem title='Validate schema' status='error' />
          </Trace>
        </div>
        <p className={intro}>
          Status colors come from the semantic tokens only — the running
          marker pulses on the <code>--haze-ease</code> motion token and
          collapses under <strong>prefers-reduced-motion</strong>; done and
          error carry a checkmark / exclamation glyph inside the marker.
        </p>
      </div>

      <div className={section}>
        <h2>Reasoning Steps</h2>
        <p className={intro}>
          A step mid-flight: flipping its <code>status</code> announces the
          transition to screen readers through a per-item sr-only live
          region (<code>&quot;Searched docs: Done&quot;</code>), and{' '}
          <code>details</code> turns the line into a disclosure — a native
          button with <strong>aria-expanded</strong>/
          <strong>aria-controls</strong>, operable with Enter and Space. The
          expanded state is controllable: pass <code>open</code> (a plain
          value or a <code>ControlOrValue</code> control) and listen with{' '}
          <code>onOpenChange</code>.
        </p>
        <ReasoningExample />
        <pre className={codeBlock}>
          {`<Trace>
  <TraceItem title='Analyze request' status='done' />
  <TraceItem
    title='Searched docs'
    status='done'
    details={<TraceDetails>{JSON.stringify(result)}</TraceDetails>}
  />
  <TraceItem title='Draft answer' status='pending' />
</Trace>`}
        </pre>
        <p className={intro}>
          <code>TraceDetails</code> is the monospace payload body for the
          revealed area (input/output JSON, logs); any other ReactNode
          renders as-is inside the panel.
        </p>
      </div>

      <div className={section}>
        <h2>Custom Icons</h2>
        <div style={{ maxWidth: 360 }}>
          <Trace>
            <TraceItem title='Thinking' status='running' icon={BrainIcon} />
            <TraceItem title='read_file' status='done' icon={WrenchIcon} />
            <TraceItem title='Cite sources' status='pending' icon={LinkIcon} />
          </Trace>
        </div>
        <p className={intro}>
          <code>icon</code> (a <code>ComponentType</code>) replaces the
          status glyph inside the marker — the marker ring keeps its status
          color, so custom icons never hide the state.
        </p>
      </div>

      <div className={section}>
        <h2>Trace Props</h2>
        <PropsTable of='TraceProps' />
      </div>

      <div className={section}>
        <h2>TraceItem Props</h2>
        <PropsTable of='TraceItemProps' />
      </div>

      <div className={section}>
        <h2>TraceDetails Props</h2>
        <PropsTable of='TraceDetailsProps' />
      </div>

      <div className={section}>
        <h2>Accessibility</h2>
        <A11yNote>
          <ul>
            <li>
              Status markers are decorative (<strong>aria-hidden</strong>);
              every line exposes <strong>data-status</strong> for consumer
              styling, and status transitions are announced through a
              per-item sr-only <strong>role=&quot;status&quot;</strong> live
              region — exactly once per change, never on mount or on
              re-renders that hold the status
            </li>
            <li>
              Word step titles with their state for visible status copy
              (&quot;Searching docs…&quot; → &quot;Searched docs&quot;) —
              the marker alone does not read as text
            </li>
            <li>
              Detail toggles are native buttons with{' '}
              <strong>aria-expanded</strong>/<strong>aria-controls</strong>{' '}
              — Enter and Space activate them; the collapsed panel leaves
              the tab order through the <code>hidden</code> attribute
            </li>
            <li>
              The running pulse collapses under{' '}
              <strong>prefers-reduced-motion</strong> into a static halo
            </li>
          </ul>
        </A11yNote>
      </div>

      <CssVarsSection component='trace' />
    </>
  );
}

function BrainIcon() {
  return (
    <svg width='12' height='12' viewBox='0 0 24 24' fill='none' aria-hidden='true' focusable='false'>
      <path
        d='M12 4a4 4 0 0 0-4 4 3 3 0 0 0 0 6 3 3 0 0 0 3 3 2 2 0 0 0 2-2V6a2 2 0 0 0-1-2Z'
        stroke='currentColor'
        strokeWidth='2'
      />
      <path
        d='M12 4a4 4 0 0 1 4 4 3 3 0 0 1 0 6 3 3 0 0 1-3 3 2 2 0 0 1-2-2'
        stroke='currentColor'
        strokeWidth='2'
      />
    </svg>
  );
}

function WrenchIcon() {
  return (
    <svg width='12' height='12' viewBox='0 0 24 24' fill='none' aria-hidden='true' focusable='false'>
      <path
        d='M14.7 6.3a4 4 0 0 0-5.4 5.4L4 17v3h3l5.3-5.3a4 4 0 0 0 5.4-5.4L15 12l-3-3 2.7-2.7Z'
        stroke='currentColor'
        strokeWidth='2'
      />
    </svg>
  );
}

function LinkIcon() {
  return (
    <svg width='12' height='12' viewBox='0 0 24 24' fill='none' aria-hidden='true' focusable='false'>
      <path
        d='M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7L11.5 7'
        stroke='currentColor'
        strokeWidth='2'
      />
      <path
        d='M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7L12.5 17'
        stroke='currentColor'
        strokeWidth='2'
      />
    </svg>
  );
}
