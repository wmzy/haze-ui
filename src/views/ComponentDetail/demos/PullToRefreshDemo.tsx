import { useState } from 'react';

import { PullToRefresh } from '@/lib';

import PropsTable from '../PropsTable';

import A11yNote from '../A11yNote';

import { intro, section } from '../styles';

// ─── PullToRefresh ──────────────────────────────────────────────
export default function PullToRefreshDemo() {
  const [items, setItems] = useState(() =>
    Array.from({ length: 14 }, (_, i) => `Item ${i + 1}`),
  );
  const [pulls, setPulls] = useState(0);
  const [lastDuration, setLastDuration] = useState<number | null>(null);

  const handleRefresh = async () => {
    const started = performance.now();
    // fake network round-trip
    await new Promise((resolve) => setTimeout(resolve, 900));
    setLastDuration(Math.round(performance.now() - started));
    setPulls((n) => n + 1);
    setItems((prev) => [
      `Fresh item ${pulls + 1}`,
      `Fresh item ${pulls + 2}`,
      ...prev,
    ]);
  };

  return (
    <>
      <h1>PullToRefresh</h1>
      <p className={intro}>
        Mobile pull-to-refresh around any scrolling content — a hand-written
        pointer/touch gesture with zero extra dependencies.
      </p>

      <div className={section}>
        <h2>Demo</h2>
        <p>
          Drag the list downward with a mouse or finger (the gesture takes over
          only when the list is scrolled back to the top). {pulls} refresh
          {pulls === 1 ? '' : 'es'} so far
          {lastDuration === null ? '' : `, last one took ${lastDuration}ms`}.
        </p>
        <div
          style={{
            height: 320,
            border: '1px solid var(--haze-color-border)',
            borderRadius: 'var(--haze-radius-md)',
          }}
        >
          <PullToRefresh onRefresh={handleRefresh}>
            <div style={{ overflowY: 'auto', height: '100%' }}>
              <ul style={{ margin: 0, padding: 'var(--haze-space-4)', listStyle: 'none' }}>
                {items.map((item) => (
                  <li
                    key={item}
                    style={{
                      padding: 'var(--haze-space-2) var(--haze-space-3)',
                      borderBottom: '1px solid var(--haze-color-border)',
                    }}
                  >
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </PullToRefresh>
        </div>
      </div>

      <div className={section}>
        <h2>Custom indicator and texts</h2>
        <p>
          The head is a render prop ({'{ phase, progress }'}), and the default
          status texts are plain props — no library locale strings involved.
        </p>
        <div
          style={{
            height: 240,
            border: '1px solid var(--haze-color-border)',
            borderRadius: 'var(--haze-radius-md)',
          }}
        >
          <PullToRefresh
            onRefresh={() => new Promise((resolve) => setTimeout(resolve, 600))}
            distance={48}
            pullingText="下拉刷新"
            readyText="松手刷新"
            refreshingText="正在刷新…"
            indicator={({ phase, progress }) =>
              phase === 'refreshing' ? (
                <strong>正在刷新…</strong>
              ) : (
                <span>{Math.round(progress * 100)}%</span>
              )
            }
          >
            <div style={{ overflowY: 'auto', height: '100%' }}>
              <ul style={{ margin: 0, padding: 'var(--haze-space-4)', listStyle: 'none' }}>
                {items.slice(0, 8).map((item) => (
                  <li key={item} style={{ padding: 'var(--haze-space-2) var(--haze-space-3)' }}>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </PullToRefresh>
        </div>
      </div>

      <div className={section}>
        <h2>Props</h2>
        <PropsTable of='PullToRefreshProps' />
      </div>

      <div className={section}>
        <h2>Accessibility</h2>
        <A11yNote>
          <ul>
            <li>
              The gesture is touch/pointer only; the container carries{' '}
              <code>aria-busy</code> while refreshing and the default head
              announces through the Spinner&apos;s <code>role=&quot;status&quot;</code>.
            </li>
            <li>
              While pulling, the head is <code>aria-hidden</code> — gesture
              feedback stays visual, so screen readers are not spammed mid-drag.
            </li>
            <li>
              Keyboard users refresh through the page&apos;s own affordances;
              native scrolling (both axes) is never blocked by the gesture.
            </li>
          </ul>
        </A11yNote>
      </div>
    </>
  );
}
