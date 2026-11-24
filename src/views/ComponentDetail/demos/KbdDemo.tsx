import { Kbd } from '@/lib';

import { row } from '../styles';

import {
  AccessibilitySection,
  CssVarsSection,
  DemoPage,
  DemoSection,
  PropsSection,
} from './shared';

// ─── Kbd ───────────────────────────────────────────────────────
export default function KbdDemo() {
  return (
    <DemoPage
      title='Kbd'
      description='Inline keyboard key indicator for shortcuts and key combinations.'
    >
      <DemoSection title='Sizes'>
        <div className={row}>
          <Kbd size='sm'>Esc</Kbd>
          <Kbd size='md'>Esc</Kbd>
        </div>
      </DemoSection>

      <DemoSection title='Key combinations'>
        <div className={row}>
          <span>
            <Kbd size='sm'>⌘</Kbd> + <Kbd size='sm'>K</Kbd>
          </span>
          <span>
            <Kbd>Ctrl</Kbd> + <Kbd>Shift</Kbd> + <Kbd>P</Kbd>
          </span>
          <span>
            Press <Kbd>⌘</Kbd> <Kbd>Option</Kbd> <Kbd>Esc</Kbd>
          </span>
        </div>
      </DemoSection>

      <PropsSection of='KbdProps' />

      <AccessibilitySection>
        <ul>
          <li>
            Renders as a native <strong>&lt;kbd&gt;</strong> element
          </li>
          <li>
            Surrounding text should spell out the action, e.g. “Press{' '}
            <Kbd>⌘</Kbd> <Kbd>K</Kbd> to open the command palette”
          </li>
        </ul>
      </AccessibilitySection>

      <CssVarsSection component='kbd' />
    </DemoPage>
  );
}
