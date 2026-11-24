import { Skeleton } from '@/lib';

import { row } from '../styles';

import {
  AccessibilitySection,
  CssVarsSection,
  DemoPage,
  DemoSection,
  PropsSection,
} from './shared';

// ─── Skeleton ──────────────────────────────────────────────────
export default function SkeletonDemo() {
  return (
    <DemoPage
      title='Skeleton'
      description='Animated placeholder for loading states.'
    >
      <DemoSection title='Variants'>
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--haze-space-3)',
            maxWidth: 320,
          }}
        >
          <Skeleton variant='text' width='80%' />
          <Skeleton variant='text' width='60%' />
          <Skeleton variant='rectangular' width={320} height={120} />
          <div className={row}>
            <Skeleton variant='circular' width={40} height={40} />
            <div
              style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                gap: 'var(--haze-space-1)',
              }}
            >
              <Skeleton variant='text' width='50%' />
              <Skeleton variant='text' width='80%' />
            </div>
          </div>
        </div>
      </DemoSection>

      <PropsSection of='SkeletonProps' />

      <AccessibilitySection>
        <ul>
          <li>
            Purely decorative — use{' '}
            <strong>aria-busy=&quot;true&quot;</strong> on the parent
            container during loading
          </li>
          <li>
            Shimmer animation is CSS-only, respects{' '}
            <strong>prefers-reduced-motion</strong>
          </li>
        </ul>
      </AccessibilitySection>

      <CssVarsSection component='skeleton' />
    </DemoPage>
  );
}
