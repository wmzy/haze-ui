import { useControl } from 'react-use-control';

import { RichTextEditor } from '@/lib';


import { intro } from '../styles';

import {
  AccessibilitySection,
  captionStyle,
  CssVarsSection,
  DemoPage,
  DemoSection,
  maxWidth640,
  PropsSection,
} from './shared';

// ─── RichTextEditor ────────────────────────────────────────────
export default function RichTextEditorDemo() {
  const [value, , valueCtrl] = useControl<string>(
    undefined,
    '<h2>Meeting notes</h2><p>Start typing — try the toolbar: <strong>bold</strong>, <em>italic</em>, lists, quotes, code.</p>'
  );

  return (
    <DemoPage
      title='RichTextEditor'
      description={
        <>
          A rich text editor built on Tiptap — controllable HTML value,
          built-in formatting toolbar, placeholder hints, and native form
          participation.
        </>
      }
    >
      <DemoSection title='Demo'>
        <div style={maxWidth640}>
          <RichTextEditor
            value={valueCtrl}
            placeholder='Write something…'
            aria-label='Meeting notes'
          />
        </div>
      </DemoSection>

      <DemoSection title='Controlled value'>
        <p className={intro}>The editor publishes HTML on every edit:</p>
        <pre
          style={{
            margin: 0,
            padding: 'var(--haze-space-3)',
            background: 'var(--haze-color-bg-muted)',
            borderRadius: 'var(--haze-radius-md)',
            fontSize: 'var(--haze-text-xs)',
            overflowX: 'auto',
          }}
        >
          <code>{value}</code>
        </pre>
      </DemoSection>

      <DemoSection title='Read-only + custom toolbar'>
        <div style={maxWidth640}>
          <RichTextEditor
            toolbar={
              <span style={captionStyle}>
                Read-only view
              </span>
            }
            editable={false}
            value='<blockquote><p>Simplicity is a great virtue but it requires hard work to achieve it.</p></blockquote>'
          />
        </div>
      </DemoSection>

      <PropsSection of='RichTextEditorProps' />

      <AccessibilitySection>
        <ul>
          <li>
            The contenteditable is a real ProseMirror textbox with{' '}
            <strong>aria-label</strong> (forwarded from the prop)
          </li>
          <li>
            Toolbar follows the WAI-ARIA toolbar pattern: roving tabindex,
            arrow-key travel, <strong>aria-pressed</strong> toggle state
          </li>
          <li>
            Focus ring on the editor chrome via{' '}
            <code>:focus-within</code>, visible in forced-colors mode
          </li>
        </ul>
      </AccessibilitySection>

      <CssVarsSection component='richtexteditor' />
    </DemoPage>
  );
}
