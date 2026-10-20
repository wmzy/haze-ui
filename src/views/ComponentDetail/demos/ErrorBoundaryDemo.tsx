import { useState } from 'react';

import { Button, ErrorBoundary, Flex } from '@/lib';

import PropsTable from '../PropsTable';

import A11yNote from '../A11yNote';

import { intro, section } from '../styles';

import { CssVarsSection } from './shared';

/** Throws during render when `broken` — the minimal failure fixture. */
function Bomb({ broken }: { broken: boolean }) {
  if (broken) throw new Error('Exploded (simulated render error)');
  return <p>Content rendered safely.</p>;
}

/** Fake profile card — user #2 is the broken data source. */
function UserCard({ id }: { id: number }) {
  if (id === 2) throw new Error(`Failed to load user #${id}`);
  return <p>Loaded user #{id} — profile rendered from the fetched data.</p>;
}

// ─── Basic capture ─────────────────────────────────────────────
function BasicCapture() {
  const [broken, setBroken] = useState(false);
  return (
    <Flex gap='var(--haze-space-2)' direction='column'>
      <ErrorBoundary>
        <Bomb broken={broken} />
      </ErrorBoundary>
      <Flex gap='var(--haze-space-2)'>
        <Button
          size='sm'
          variant={broken ? 'solid' : 'outline'}
          onClick={() => setBroken((v) => !v)}
        >
          {broken ? 'Heal the data' : 'Blow up the subtree'}
        </Button>
      </Flex>
    </Flex>
  );
}

// ─── resetKeys reset ───────────────────────────────────────────
function ResetKeysDemo() {
  const [userId, setUserId] = useState(1);
  return (
    <Flex gap='var(--haze-space-2)' direction='column'>
      {/* Shallow change of resetKeys (per-item Object.is) resets the
          boundary while an error is showing — no Try again click needed. */}
      <ErrorBoundary resetKeys={[userId]}>
        <UserCard id={userId} />
      </ErrorBoundary>
      <Flex gap='var(--haze-space-2)'>
        <Button
          size='sm'
          variant='outline'
          onClick={() => setUserId((v) => (v === 1 ? 2 : 1))}
        >
          Switch to user {userId === 1 ? 2 : 1}
        </Button>
      </Flex>
    </Flex>
  );
}

// ─── Render-prop fallback ──────────────────────────────────────
function RenderPropFallback() {
  const [broken, setBroken] = useState(true);
  return (
    <Flex gap='var(--haze-space-2)' direction='column'>
      <ErrorBoundary
        fallback={({ error, info, resetErrorBoundary }) => (
          <div
            role='alert'
            style={{
              padding: 'var(--haze-space-3) var(--haze-space-4)',
              border: '1px solid var(--haze-color-border)',
              borderRadius: 'var(--haze-radius-md)',
            }}
          >
            <strong>Custom fallback</strong> — {error.message}
            <pre
              style={{
                margin: 'var(--haze-space-2) 0',
                fontSize: 'var(--haze-text-xs)',
                whiteSpace: 'pre-wrap',
              }}
            >
              {info?.componentStack?.trim()}
            </pre>
            <Button size='sm' variant='outline' onClick={resetErrorBoundary}>
              Reset from the render prop
            </Button>
          </div>
        )}
      >
        <Bomb broken={broken} />
      </ErrorBoundary>
      <Flex gap='var(--haze-space-2)'>
        <Button
          size='sm'
          variant='outline'
          onClick={() => setBroken((v) => !v)}
        >
          {broken ? 'Heal the data' : 'Blow up the subtree'}
        </Button>
      </Flex>
    </Flex>
  );
}

// ─── onError reporting ─────────────────────────────────────────
function OnErrorDemo() {
  const [log, setLog] = useState<string[]>([]);
  const [broken, setBroken] = useState(true);
  return (
    <Flex gap='var(--haze-space-2)' direction='column'>
      <ErrorBoundary
        onError={(error, info) => {
          // Real apps forward this to Sentry/telemetry instead.
          setLog((entries) => [
            `${new Date().toLocaleTimeString()} — ${error.message} (${(
              info.componentStack ?? ''
            )
              .trim()
              .split('\n')
              .length} frames)`,
            ...entries,
          ]);
        }}
      >
        <Bomb broken={broken} />
      </ErrorBoundary>
      <Flex gap='var(--haze-space-2)'>
        <Button
          size='sm'
          variant='outline'
          onClick={() => setBroken((v) => !v)}
        >
          {broken ? 'Heal the data' : 'Blow up the subtree'}
        </Button>
      </Flex>
      {log.length > 0 && (
        <ul style={{ margin: 0, paddingLeft: 'var(--haze-space-4)' }}>
          {log.map((entry) => (
            <li key={entry}>{entry}</li>
          ))}
        </ul>
      )}
    </Flex>
  );
}

// ─── Nested boundaries ─────────────────────────────────────────
function NestedBoundaries() {
  const [broken, setBroken] = useState(false);
  return (
    <Flex gap='var(--haze-space-2)' direction='column'>
      {/* The inner boundary contains the blast radius — the outer sibling
          keeps rendering even while the inner fallback shows. */}
      <ErrorBoundary fallback={<p>Outer boundary tripped (should not happen)</p>}>
        <p>Outer subtree — still alive.</p>
        <ErrorBoundary fallback={<p>Inner boundary caught the error.</p>}>
          <Bomb broken={broken} />
        </ErrorBoundary>
      </ErrorBoundary>
      <Flex gap='var(--haze-space-2)'>
        <Button
          size='sm'
          variant='outline'
          onClick={() => setBroken((v) => !v)}
        >
          {broken ? 'Heal the data' : 'Blow up the inner subtree'}
        </Button>
      </Flex>
    </Flex>
  );
}

// ─── ErrorBoundary ─────────────────────────────────────────────
export default function ErrorBoundaryDemo() {
  return (
    <>
      <h1>ErrorBoundary</h1>
      <p className={intro}>
        Catches render-time errors anywhere in its subtree and swaps the
        subtree for a fallback — reset by button, or reactively when
        <code> resetKeys</code> change. The happy path renders children with
        no wrapper DOM.
      </p>

      <div className={section}>
        <h2>Basic capture</h2>
        <p>
          Blow up the subtree, read the default fallback (danger styling +
          locale-pack copy), then heal the data and hit “Try again”.
        </p>
        <BasicCapture />
      </div>

      <div className={section}>
        <h2>resetKeys reset</h2>
        <p>
          User #2 always fails to load. Switching users changes
          <code> resetKeys</code>, which resets the boundary on the spot —
          no manual retry.
        </p>
        <ResetKeysDemo />
      </div>

      <div className={section}>
        <h2>Custom fallback (render prop)</h2>
        <p>
          The render prop receives <code>error</code>, React&apos;s{' '}
          <code>info</code> (component stack) and{' '}
          <code>resetErrorBoundary</code>.
        </p>
        <RenderPropFallback />
      </div>

      <div className={section}>
        <h2>onError reporting</h2>
        <p>
          <code>onError(error, info)</code> fires once per caught error —
          the reporting channel for Sentry-style telemetry.
        </p>
        <OnErrorDemo />
      </div>

      <div className={section}>
        <h2>Nested boundaries</h2>
        <p>
          An inner boundary contains the failure; the outer tree keeps
          rendering around it.
        </p>
        <NestedBoundaries />
      </div>

      <div className={section}>
        <h2>Props</h2>
        <PropsTable of='ErrorBoundaryProps' />
      </div>

      <div className={section}>
        <h2>Accessibility</h2>
        <A11yNote>
          <ul>
            <li>
              The default fallback is a <strong>role=alert</strong> region,
              so screen readers announce the error when it appears
            </li>
            <li>
              “Try again” is a real <code>&lt;button&gt;</code> with a
              visible focus ring (forced-colors safe)
            </li>
            <li>
              The error message wraps with <code>overflow-wrap</code> so
              long stack-like strings cannot overflow the box
            </li>
          </ul>
        </A11yNote>
      </div>

      <CssVarsSection component='error-boundary' />
    </>
  );
}
