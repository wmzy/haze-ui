import { useControl } from 'react-use-control';

import { Button, Stepper, Step } from '@/lib';

import PropsTable from '../PropsTable';

import { row } from '../styles';

import {
  AccessibilitySection,
  CssVarsSection,
  DemoPage,
  DemoSection,
} from './shared';

// ─── Stepper ───────────────────────────────────────────────────
export default function StepperDemo() {
  const [active, setActive, activeCtrl] = useControl(undefined, 1);

  return (
    <DemoPage
      title='Stepper'
      description='Step-by-step progress indicator for multi-step flows.'
    >
      <DemoSection title='Demo'>
        <Stepper activeStep={activeCtrl}>
          <Step title='Account' description='Create account' />
          <Step title='Profile' description='Add details' />
          <Step title='Confirm' description='Review & submit' />
        </Stepper>
        <div className={row} style={{ marginTop: 'var(--haze-space-4)' }}>
          <Button size='sm' variant='outline' onClick={() => { setActive(Math.max(0, active - 1)); }} disabled={active <= 0}>
            Back
          </Button>
          <Button size='sm' onClick={() => { setActive(Math.min(2, active + 1)); }} disabled={active >= 2}>
            Next
          </Button>
        </div>
      </DemoSection>

      <DemoSection title='Stepper Props'>
        <PropsTable of='StepperProps' />
      </DemoSection>

      <DemoSection title='Step Props'>
        <PropsTable of='StepProps' />
      </DemoSection>

      <AccessibilitySection>
        <ul>
          <li>
            Container uses <strong>role=&quot;list&quot;</strong>
          </li>
          <li>
            Each step uses <strong>role=&quot;listitem&quot;</strong>
          </li>
          <li>
            Visual state (active/completed/pending) is conveyed through color and icon
          </li>
        </ul>
      </AccessibilitySection>

      <CssVarsSection component='stepper' />
    </DemoPage>
  );
}
