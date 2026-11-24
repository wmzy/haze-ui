import { css } from '@linaria/core';
import { useControl } from 'react-use-control';

import { Signature } from '@/lib/components/Signature';

import { AccessibilitySection, DemoPage, DemoSection } from './shared';

// ─── Signature ─────────────────────────────────────────────────
const row = css`
  display: flex;
  flex-wrap: wrap;
  gap: var(--haze-space-4);
  align-items: flex-start;
`;

const readout = css`
  font-family: var(--haze-font-mono);
  font-size: var(--haze-text-xs);
  color: var(--haze-color-text-secondary);
  max-width: 22rem;
  overflow-wrap: anywhere;
`;

const previewFrame = css`
  border: 1px dashed var(--haze-color-border);
  border-radius: var(--haze-radius-md);
  padding: var(--haze-space-2);
`;

const previewImg = css`
  display: block;
  max-width: 100%;
`;

export default function SignatureDemo() {
  const [value, setValue, control] = useControl(undefined, '');

  return (
    <DemoPage
      title='Signature'
      description={
        <>
          A canvas handwriting pad. Drawing, undo and clear all commit a PNG data URL into
          the controllable <code>value</code> — wire it straight into a form field.
        </>
      }
    >
      <DemoSection title='Basic'>
        <div className={row}>
          <div>
            <Signature value={control} onChange={setValue} width={360} height={180} />
          </div>
          <div>
            <p className={readout}>{value || '(nothing signed yet)'}</p>
            {value ? (
              <div className={previewFrame}>
                <img className={previewImg} src={value} alt="Committed signature preview" width={180} />
              </div>
            ) : null}
          </div>
        </div>
      </DemoSection>

      <DemoSection title='Custom pen and labels'>
        <Signature penColor="#b91c1c" penWidth={3} undoLabel="Undo stroke" clearLabel="Erase all" />
      </DemoSection>

      <DemoSection title='Disabled'>
        <Signature disabled width={280} height={140} />
      </DemoSection>

      <AccessibilitySection>
        <ul>
          <li>
            Pointer-driven drawing (with pointer capture, so strokes survive leaving the
            canvas); <strong>Undo</strong> / <strong>Clear</strong> are real buttons and
            keyboard-operable.
          </li>
          <li>
            Label the pad through the root (e.g. <strong>aria-label</strong> on the
            component spreads to the wrapper).
          </li>
          <li>High-DPI screens render crisp strokes via devicePixelRatio scaling.</li>
        </ul>
      </AccessibilitySection>
    </DemoPage>
  );
}
