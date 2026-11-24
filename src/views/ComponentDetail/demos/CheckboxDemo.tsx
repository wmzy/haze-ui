import { Checkbox } from '@/lib';

import { row, labelStyle } from '../styles';

import {
  AccessibilitySection,
  CssVarsSection,
  DemoPage,
  DemoSection,
  PropsSection,
} from './shared';

// ─── Checkbox ──────────────────────────────────────────────────
export default function CheckboxDemo() {
  return (
    <DemoPage title='Checkbox' description='Toggle a boolean value on or off.'>
      <DemoSection title='Default'>
        <div className={row}>
          <label className={labelStyle}>
            <Checkbox /> Unchecked
          </label>
          <label className={labelStyle}>
            <Checkbox checked /> Checked
          </label>
        </div>
      </DemoSection>

      <DemoSection title='Disabled'>
        <div className={row}>
          <label className={labelStyle}>
            <Checkbox disabled /> Disabled
          </label>
          <label className={labelStyle}>
            <Checkbox checked disabled /> Checked Disabled
          </label>
        </div>
      </DemoSection>

      <PropsSection of='CheckboxProps' />

      <AccessibilitySection>
        <ul>
          <li>
            Renders as native{' '}
            <strong>&lt;input type=&quot;checkbox&quot;&gt;</strong>
          </li>
          <li>
            <strong>Space</strong> toggles the checked state
          </li>
          <li>
            Wrap with <strong>&lt;label&gt;</strong> for accessible labeling
          </li>
        </ul>
      </AccessibilitySection>

      <CssVarsSection component='checkbox' />
    </DemoPage>
  );
}
