import { useState } from 'react';

import { css } from '@linaria/core';

import { Countdown, Button, Stat, StatGroup } from '@/lib';

import PropsTable from '../PropsTable';

import { AccessibilitySection, DemoPage, DemoSection } from './shared';

// Countdown inherits size and color; give the standalone examples stat weight.
const big = css`
  font-size: var(--haze-text-2xl);
  font-weight: var(--haze-weight-bold);
  color: var(--haze-color-text);
  line-height: var(--haze-leading-tight);
`;

const row = css`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--haze-space-4);
`;

const note = css`
  font-size: var(--haze-text-sm);
  color: var(--haze-color-success);
`;

// Demo deadlines are captured once so re-renders (locale switch etc.) don't
// drift them forward.
const t0 = Date.now();

/** A deadline inside the last minutes — ticks every second until it hits zero. */
function EndingSoonExample() {
  const [endsAt] = useState(() => Date.now() + 90_000);
  const [done, setDone] = useState(false);
  return (
    <div className={row}>
      <Countdown value={endsAt} className={big} onFinish={() => setDone(true)} />
      {done && <span className={note}>Finished</span>}
    </div>
  );
}

/** `value` is a plain prop — pointing it at a fresh deadline re-aims the clock. */
function RestartExample() {
  const [endsAt, setEndsAt] = useState(() => Date.now() + 25 * 3600_000);
  return (
    <div className={row}>
      <Countdown value={endsAt} className={big} />
      <Button size='sm' variant='outline' onClick={() => setEndsAt(Date.now() + 25 * 3600_000)}>
        Reset 25h
      </Button>
    </div>
  );
}

// ─── Countdown ─────────────────────────────────────────────────
export default function CountdownDemo() {
  return (
    <DemoPage
      title='Countdown'
      description={
        <>
          Deadline countdown with setTimeout-chain ticks aligned to second
          boundaries (no interval drift); `onFinish` fires exactly once and the
          adaptive default format switches to days past 24h.
        </>
      }
    >
      <DemoSection title='Basic'>
        <Countdown value={t0 + 26 * 3600_000 + 5 * 60_000} className={big} />
      </DemoSection>

      <DemoSection title='Ending soon'>
        <EndingSoonExample />
      </DemoSection>

      <DemoSection title='Re-aiming on deadline change'>
        <RestartExample />
      </DemoSection>

      <DemoSection title='Custom format'>
        <div className={row}>
          <Countdown
            value={t0 + 26 * 3600_000}
            className={big}
            format={(p) => `${p.days}d +${p.hours}h ${p.totalSeconds}s`}
          />
          <Countdown
            value={t0 + 90_000}
            className={big}
            format={(p) => `${String(p.minutes).padStart(2, '0')}:${String(p.seconds).padStart(2, '0')}`}
          />
        </div>
      </DemoSection>

      <DemoSection title='Render escape hatch'>
        <Countdown
          value={t0 + 90_000}
          render={(p) => (
            <strong className={big}>
              {p.minutes}m {p.seconds}s left
            </strong>
          )}
        />
      </DemoSection>

      <DemoSection title='With Stat'>
        <StatGroup>
          <Stat
            title='Flash sale ends in'
            value='left'
            prefix={<Countdown value={t0 + 9 * 3600_000 + 42 * 60_000} className={big} />}
          />
          <Stat
            title='Launch window closes in'
            value='left'
            prefix={<Countdown value={t0 + 3 * 86400_000 + 2 * 3600_000} className={big} />}
            description='Adaptive format: days appear past 24h'
          />
        </StatGroup>
      </DemoSection>

      <DemoSection title='Countdown Props'>
        <PropsTable of='CountdownProps' />
      </DemoSection>

      <AccessibilitySection>
        <ul>
          <li>Per-second text updates are deliberately <strong>not</strong> in a live region — screen readers are never spammed by the ticking</li>
          <li>The root carries an <code>aria-label</code> with the full remaining time (word form), refreshed silently and exposed whenever the element is queried</li>
          <li>Pair with a labeled container (e.g. Stat&#39;s <code>title</code>) so the countdown has context; <code>font-variant-numeric: tabular-nums</code> keeps digit widths stable while ticking</li>
        </ul>
      </AccessibilitySection>
    </DemoPage>
  );
}
