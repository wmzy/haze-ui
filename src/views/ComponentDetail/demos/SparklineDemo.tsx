import { css } from '@linaria/core';

import { Sparkline, Stat, StatGroup } from '@/lib';

import PropsTable from '../PropsTable';

import { AccessibilitySection, DemoPage, DemoSection } from './shared';

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
    <DemoPage
      title='Sparkline'
      description={
        <>
          Inline SVG mini trend chart — stateless, recharts-free and RSC-safe.
          Geometry is normalized into a square viewBox, so width/height size the
          box without recomputing points.
        </>
      }
    >
      <DemoSection title='Basic'>
        <div className={row}>
          <Sparkline data={up} />
          <Sparkline data={down} />
          <Sparkline data={jittery} />
        </div>
      </DemoSection>

      <DemoSection title='Area variant'>
        <div className={row}>
          <Sparkline data={up} variant='area' />
          <Sparkline data={down} variant='area' />
        </div>
      </DemoSection>

      <DemoSection title='Colors'>
        <div className={row}>
          <Sparkline data={up} color='default' />
          <Sparkline data={up} color='primary' variant='area' />
          <Sparkline data={up} color='success' variant='area' />
          <Sparkline data={down} color='danger' variant='area' />
          <Sparkline data={jittery} color='warning' />
          <Sparkline data={jittery} color='info' />
        </div>
      </DemoSection>

      <DemoSection title='Sizes'>
        <div className={cells}>
          <Sparkline data={up} width={240} height={48} />
          <Sparkline data={up} width={160} height={20} variant='area' />
          <Sparkline data={flat} width={120} height={16} />
        </div>
      </DemoSection>

      <DemoSection title='In metric cards'>
        <StatGroup>
          <Stat
            title='Weekly signups'
            value='+8%'
            prefix={<Sparkline data={up} width={96} height={28} aria-label='Signups trending up' />}
          />
          <Stat
            title='Error rate'
            value='-0.4pt'
            prefix={<Sparkline data={down} width={96} height={28} color='danger' variant='area' />}
          />
        </StatGroup>
      </DemoSection>

      <DemoSection title='Sparkline Props'>
        <PropsTable of='SparklineProps' />
      </DemoSection>

      <AccessibilitySection>
        <ul>
          <li>Decorative by default: the chart renders <code>aria-hidden</code> and no role — pair it with a labeled container (e.g. Stat&#39;s <code>title</code>)</li>
          <li>Passing <code>aria-label</code> switches it to <code>role=&quot;img&quot;</code> with that name (see the signups card above)</li>
          <li>Zero hooks and zero runtime dependencies — safe to render from React Server Components</li>
        </ul>
      </AccessibilitySection>
    </DemoPage>
  );
}
