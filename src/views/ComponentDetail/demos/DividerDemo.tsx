import { Divider } from '@/lib';

import { row } from '../styles';

import {
  AccessibilitySection,
  CssVarsSection,
  DemoPage,
  DemoSection,
  flushStyle,
  maxWidth480,
  PropsSection,
} from './shared';

// ─── Divider ────────────────────────────────────────────────────
export default function DividerDemo() {
  return (
    <DemoPage
      title='Divider'
      description='Visual separator between content sections.'
    >
      <DemoSection title='Horizontal'>
        <div style={maxWidth480}>
          <p style={flushStyle}>Content above</p>
          <Divider />
          <p style={flushStyle}>Content below</p>
        </div>
      </DemoSection>

      <DemoSection title='Vertical'>
        <div className={row}>
          <span>Left</span>
          <Divider orientation='vertical' />
          <span>Right</span>
        </div>
      </DemoSection>

      <PropsSection of='DividerProps' />

      <AccessibilitySection>
        <ul>
          <li>
            Uses <strong>role=&quot;separator&quot;</strong>
          </li>
          <li>
            Vertical dividers have <strong>aria-orientation=&quot;vertical&quot;</strong>
          </li>
          <li>
            Horizontal renders as native <strong>&lt;hr&gt;</strong>
          </li>
        </ul>
      </AccessibilitySection>

      <CssVarsSection component='divider' />
    </DemoPage>
  );
}
