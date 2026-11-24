import { Radio, RadioGroup } from '@/lib';

import PropsTable from '../PropsTable';

import {
  AccessibilitySection,
  CssVarsSection,
  DemoPage,
  DemoSection,
} from './shared';

// ─── Radio ─────────────────────────────────────────────────────
export default function RadioDemo() {
  return (
    <DemoPage
      title='Radio'
      description='Single selection from a group of options using RadioGroup context.'
    >
      <DemoSection title='Demo'>
        <RadioGroup>
          <Radio value='apple'>Apple</Radio>
          <Radio value='banana'>Banana</Radio>
          <Radio value='cherry'>Cherry</Radio>
        </RadioGroup>
      </DemoSection>

      <DemoSection title='RadioGroup Props'>
        <PropsTable of='RadioGroupProps' />
      </DemoSection>

      <DemoSection title='Radio Props'>
        <PropsTable of='RadioProps' />
      </DemoSection>

      <AccessibilitySection>
        <ul>
          <li>
            Uses native <strong>&lt;input type=&quot;radio&quot;&gt;</strong>{' '}
            inside <strong>&lt;fieldset&gt;</strong>
          </li>
          <li>
            <strong>Arrow keys</strong> navigate between options
          </li>
          <li>
            <strong>Space</strong> selects the focused option
          </li>
          <li>
            Add a <strong>&lt;legend&gt;</strong> inside RadioGroup for group
            labeling
          </li>
        </ul>
      </AccessibilitySection>

      <CssVarsSection component='radio' />
    </DemoPage>
  );
}
