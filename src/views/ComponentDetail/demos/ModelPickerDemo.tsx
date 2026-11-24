import { useControl } from 'react-use-control';

import { ModelPicker } from '@/lib';

import {
  AccessibilitySection,
  CssVarsSection,
  DemoPage,
  DemoSection,
  maxWidth320,
  offsetNoteStyle,
  PropsSection,
} from './shared';

// ─── ModelPicker ──────────────────────────────────────────────
export default function ModelPickerDemo() {
  const [, , modelCtrl] = useControl(undefined, 'gpt-4');
  const [model] = useControl(modelCtrl);

  const models = [
    { value: 'gpt-4', label: 'GPT-4', contextLength: '128k' },
    { value: 'gpt-3.5', label: 'GPT-3.5 Turbo', contextLength: '16k' },
    { value: 'claude-3', label: 'Claude 3', contextLength: '200k' },
    { value: 'gemini', label: 'Gemini Pro', contextLength: '32k' },
  ];

  return (
    <DemoPage
      title='ModelPicker'
      description='Dropdown for selecting an AI model with optional context length info.'
    >
      <DemoSection title='Demo'>
        <div style={maxWidth320}>
          <ModelPicker value={modelCtrl} options={models} />
          <p style={offsetNoteStyle}>
            Selected: {model}
          </p>
        </div>
      </DemoSection>

      <PropsSection of='ModelPickerProps' />

      <AccessibilitySection>
        <ul>
          <li>
            Renders as a native <strong>&lt;select&gt;</strong> element
          </li>
          <li>
            Full keyboard support via <strong>Arrow keys</strong> and{' '}
            <strong>Enter</strong>
          </li>
        </ul>
      </AccessibilitySection>

      <CssVarsSection component='modelpicker' />
    </DemoPage>
  );
}
