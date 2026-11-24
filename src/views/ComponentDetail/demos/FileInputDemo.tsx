import { FileInput } from '@/lib';

import { row } from '../styles';

import {
  AccessibilitySection,
  CssVarsSection,
  DemoPage,
  DemoSection,
  PropsSection,
} from './shared';

// ─── FileInput ─────────────────────────────────────────────────
export default function FileInputDemo() {
  return (
    <DemoPage
      title='FileInput'
      description='Styled file picker with hidden native input.'
    >
      <DemoSection title='Demo'>
        <div className={row}>
          <FileInput accept='image/*' />
          <FileInput accept='.pdf,.doc'>Upload Document</FileInput>
        </div>
      </DemoSection>

      <PropsSection of='FileInputProps' />

      <AccessibilitySection>
        <ul>
          <li>
            Uses a <strong>&lt;label&gt;</strong> wrapping a visually hidden{' '}
            <strong>&lt;input type=&quot;file&quot;&gt;</strong>
          </li>
          <li>
            Keyboard accessible — <strong>Tab</strong> focuses,{' '}
            <strong>Enter</strong>/<strong>Space</strong> opens file dialog
          </li>
        </ul>
      </AccessibilitySection>

      <CssVarsSection component='fileinput' />
    </DemoPage>
  );
}
