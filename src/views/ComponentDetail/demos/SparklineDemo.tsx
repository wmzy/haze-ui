import { css } from '@linaria/core';

import { Sparkline, Stat, StatGroup } from '@/lib';

import PropsTable from '../PropsTable';

import A11yNote from '../A11yNote';

import { intro, section } from '../styles';

const row = css`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--haze-space-4);
`;

const cells = css`
  display: grid;
  gap: var(--haze-space-3);
`;

const up = [12, 14, 13, 16, 18, 17, 21, 24, 23, 27];
const down = [27, 24, 25, 21, 19, 20, 16, 14, 15, 11];
const jittery = [5, 9, 4, 11, 3, 12, 6, 10, 2, 8];
const flat = [7, 7, 7, 7, 7, 7, 7, 7, 7, 7];

// ─── Sparkline ─────────────────────────────────────────────────
export default function SparklineDemo() {
  return (
    <>
      <h1>Sparkline</h1>
      <p className={intro}>
        Inline SVG mini trend chart — stateless, recharts-free and RSC-safe.
        Geometry is normalized into a square viewBox, so width/height size the
        box without recomputing points.
      </p>

      <div className={section}>
        <h2>Basic</h2>
        <div className={row}>
          <Sparkline data={up} />
          <Sparkline data={down} />
          <Sparkline data={jittery} />
        </div>
      </div>

      <div className={section}>
        <h2>Area variant</h2>
        <div className={row}>
          <Sparkline data={up} variant='area' />
          <Sparkline data={down} variant='area' />
        </div>
      </div>

      <div className={section}>
        <h2>Tones</h2>
        <div className={row}>
          <Sparkline data={up} tone='primary' variant='area' />
          <Sparkline data={up} tone='success' variant='area' />
          <Sparkline data={down} tone='danger' variant='area' />
          <Sparkline data={jittery} tone='warning' />
          <Sparkline data={jittery} tone='info' />
        </div>
      </div>

      <div className={section}>
        <h2>Sizes</h2>
        <div className={cells}>
          <Sparkline data={up} width={240} height={48} />
          <Sparkline data={up} width={160} height={20} variant='area' />
          <Sparkline data={flat} width={120} height={16} />
        </div>
      </div>

      <div className={section}>
        <h2>In metric cards</h2>
        <StatGroup>
          <Stat
            title='Weekly signups'
            value='+8%'
            prefix={<Sparkline data={up} width={96} height={28} aria-label='Signups trending up' />}
          />
          <Stat
            title='Error rate'
            value='-0.4pt'
            prefix={<Sparkline data={down} width={96} height={28} tone='danger' variant='area' />}
          />
        </StatGroup>
      </div>

      <div className={section}>
        <h2>Sparkline Props</h2>
        <PropsTable of='SparklineProps' />
      </div>

      <div className={section}>
        <h2>Accessibility</h2>
        <A11yNote>
          <ul>
            <li>Decorative by default: the chart renders <code>aria-hidden</code> and no role — pair it with a labeled container (e.g. Stat&#39;s <code>title</code>)</li>
            <li>Passing <code>aria-label</code> switches it to <code>role=&quot;img&quot;</code> with that name (see the signups card above)</li>
            <li>Zero hooks and zero runtime dependencies — safe to render from React Server Components</li>
          </ul>
        </A11yNote>
      </div>
    </>
  );
}
