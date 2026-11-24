import { Progress } from '@/lib';

import { row } from '../styles';

import {
  AccessibilitySection,
  CssVarsSection,
  DemoPage,
  DemoSection,
  meterGroupStyle,
  PropsSection,
} from './shared';

// ─── Progress ──────────────────────────────────────────────────
export default function ProgressDemo() {
  return (
    <DemoPage
      title='Progress'
      description='Visual indicator of completion percentage.'
    >
      <DemoSection title='Bar Variants'>
        <div style={meterGroupStyle}>
          <Progress value={25} />
          <Progress value={50} color='success' />
          <Progress value={75} color='warning' />
          <Progress value={90} color='danger' />
          <Progress value={60} color='info' />
        </div>
      </DemoSection>

      <DemoSection title='Bar Sizes'>
        <div style={meterGroupStyle}>
          <Progress value={60} size='sm' />
          <Progress value={60} size='md' />
          <Progress value={60} size='lg' />
        </div>
      </DemoSection>

      <DemoSection title='Circle Variant'>
        <div className={row}>
          <Progress variant='circle' value={30} size='sm' />
          <Progress variant='circle' value={60} />
          <Progress variant='circle' value={90} size='lg' color='success' />
        </div>
      </DemoSection>

      <PropsSection of='ProgressProps' />

      <AccessibilitySection>
        <ul>
          <li>
            Uses <strong>role=&quot;progressbar&quot;</strong> with{' '}
            <strong>aria-valuemin</strong>, <strong>aria-valuemax</strong>,{' '}
            <strong>aria-valuenow</strong>
          </li>
          <li>
            Screen readers announce current progress percentage
          </li>
        </ul>
      </AccessibilitySection>

      <CssVarsSection component='progress' />
    </DemoPage>
  );
}
