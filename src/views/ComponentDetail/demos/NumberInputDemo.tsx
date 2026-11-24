import { useControl } from 'react-use-control';

import { NumberInput } from '@/lib';

import { row } from '../styles';

import {
  AccessibilitySection,
  CssVarsSection,
  DemoPage,
  DemoSection,
  hintStyle,
  PropsSection,
} from './shared';

// ─── NumberInput ───────────────────────────────────────────────
export default function NumberInputDemo() {
  const [, , valueCtrl] = useControl(undefined, 5);
  const [value] = useControl(valueCtrl);

  return (
    <DemoPage
      title='NumberInput'
      description='Numeric input with increment/decrement buttons.'
    >
      <DemoSection title='Demo'>
        <div className={row}>
          <NumberInput value={valueCtrl} min={0} max={100} step={1} />
          <span style={hintStyle}>
            Value: {value}
          </span>
        </div>
      </DemoSection>

      <DemoSection title='Sizes'>
        <div className={row}>
          <NumberInput size='sm' min={0} max={10} />
          <NumberInput size='md' min={0} max={10} />
          <NumberInput size='lg' min={0} max={10} />
        </div>
      </DemoSection>

      <PropsSection of='NumberInputProps' />

      <AccessibilitySection>
        <ul>
          <li>
            Uses <strong>&lt;input type=&quot;number&quot;&gt;</strong>
          </li>
          <li>
            Stepper buttons have <strong>aria-label</strong>{' '}
            (&quot;Decrease&quot;/&quot;Increase&quot;)
          </li>
          <li>Buttons are disabled at min/max boundaries</li>
        </ul>
      </AccessibilitySection>

      <CssVarsSection component='numberinput' />
    </DemoPage>
  );
}
