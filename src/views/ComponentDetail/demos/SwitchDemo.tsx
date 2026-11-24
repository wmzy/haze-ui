import { Switch } from '@/lib';

import { row } from '../styles';

import {
  AccessibilitySection,
  CssVarsSection,
  DemoPage,
  DemoSection,
  PropsSection,
} from './shared';

// ─── Switch ────────────────────────────────────────────────────
export default function SwitchDemo() {
  return (
    <DemoPage
      title='Switch'
      description='Toggle between on/off states with a sliding control.'
    >
      <DemoSection title='Sizes'>
        <div className={row}>
          <Switch size='sm' />
          <Switch size='md' />
          <Switch size='lg' />
        </div>
      </DemoSection>

      <DemoSection title='Disabled'>
        <div className={row}>
          <Switch disabled />
          <Switch checked disabled />
        </div>
      </DemoSection>

      <PropsSection of='SwitchProps' />

      <AccessibilitySection>
        <ul>
          <li>
            Uses <strong>role=&quot;switch&quot;</strong> with{' '}
            <strong>aria-checked</strong>
          </li>
          <li>
            <strong>Space</strong> toggles the state
          </li>
          <li>
            Provide <strong>aria-label</strong> when no visible label is
            present
          </li>
        </ul>
      </AccessibilitySection>

      <CssVarsSection component='switch' />
    </DemoPage>
  );
}
