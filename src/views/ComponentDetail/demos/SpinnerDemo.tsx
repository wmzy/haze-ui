import { Spinner } from '@/lib';

import { row } from '../styles';

import {
  AccessibilitySection,
  CssVarsSection,
  DemoPage,
  DemoSection,
  hintStyle,
  PropsSection,
} from './shared';

// ─── Spinner ───────────────────────────────────────────────────
export default function SpinnerDemo() {
  return (
    <DemoPage
      title='Spinner'
      description='Animated loading indicator for async operations.'
    >
      <DemoSection title='Sizes'>
        <div className={row}>
          <Spinner size='sm' />
          <Spinner size='md' />
          <Spinner size='lg' />
        </div>
      </DemoSection>

      <DemoSection title='With Text'>
        <div className={row}>
          <Spinner size='sm' />
          <span style={hintStyle}>Loading...</span>
        </div>
      </DemoSection>

      <PropsSection of='SpinnerProps' />

      <AccessibilitySection>
        <ul>
          <li>
            Uses <strong>role=&quot;status&quot;</strong> with{' '}
            <strong>aria-label=&quot;Loading&quot;</strong>
          </li>
          <li>
            Screen readers announce the loading state
          </li>
          <li>
            Animation respects <strong>prefers-reduced-motion</strong>
          </li>
        </ul>
      </AccessibilitySection>

      <CssVarsSection component='spinner' />
    </DemoPage>
  );
}
