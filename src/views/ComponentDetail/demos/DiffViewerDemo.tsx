import { DiffViewer } from '@/lib';

import {
  AccessibilitySection,
  CssVarsSection,
  DemoPage,
  DemoSection,
  PropsSection,
} from './shared';

// ─── DiffViewer ───────────────────────────────────────────────
export default function DiffViewerDemo() {
  return (
    <DemoPage
      title='DiffViewer'
      description={
        <>
          Line-by-line diff viewer with added/removed/unchanged highlighting and
          line numbers.
        </>
      }
    >
      <DemoSection title='Demo'>
        <div style={{ maxWidth: 560 }}>
          <DiffViewer
            oldValue={'const x = 1;\nconst y = 2;\nconsole.log(x + y);'}
            newValue={
              'const x = 10;\nconst y = 2;\nconst z = x + y;\nconsole.log(z);'
            }
          />
        </div>
      </DemoSection>

      <PropsSection of='DiffViewerProps' />

      <AccessibilitySection>
        <ul>
          <li>Added lines highlighted in green, removed in red</li>
          <li>
            Line numbers use <strong>user-select: none</strong> to avoid
            accidental selection
          </li>
          <li>Monospace font for consistent alignment</li>
        </ul>
      </AccessibilitySection>

      <CssVarsSection component='diffviewer' />
    </DemoPage>
  );
}
