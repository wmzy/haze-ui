import { useControl } from 'react-use-control';

import { RichTextEditor } from '@/lib';

import A11yNote from '../A11yNote';
import PropsTable from '../PropsTable';

import { intro, section } from '../styles';

import { CssVarsSection } from './shared';

// ─── RichTextEditor ────────────────────────────────────────────
export default function RichTextEditorDemo() {
  const [value, , valueCtrl] = useControl<string>(
    undefined,
    '<h2>Meeting notes</h2><p>Start typing — try the toolbar: <strong>bold</strong>, <em>italic</em>, lists, quotes, code.</p>'
  );

  return (
    <>
      <h1>RichTextEditor</h1>
      <p className={intro}>
        A rich text editor built on Tiptap — controllable HTML value,
        built-in formatting toolbar, placeholder hints, and native form
        participation.
      </p>

      <div className={section}>
        <h2>Demo</h2>
        <div style={{ maxWidth: 640 }}>
          <RichTextEditor
            value={valueCtrl}
            placeholder='Write something…'
            aria-label='Meeting notes'
          />
        </div>
      </div>

      <div className={section}>
        <h2>Controlled value</h2>
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
      </div>

      <div className={section}>
        <h2>Read-only + custom toolbar</h2>
        <div style={{ maxWidth: 640 }}>
          <RichTextEditor
            toolbar={
              <span
                style={{
                  fontSize: 'var(--haze-text-xs)',
                  color: 'var(--haze-color-text-muted)',
                }}
              >
                Read-only view
              </span>
            }
            editable={false}
            value='<blockquote><p>Simplicity is a great virtue but it requires hard work to achieve it.</p></blockquote>'
          />
        </div>
      </div>

      <div className={section}>
        <h2>Props</h2>
        <PropsTable of='RichTextEditorProps' />
      </div>

      <div className={section}>
        <h2>Accessibility</h2>
        <A11yNote>
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
        </A11yNote>
      </div>

      <CssVarsSection component='richtexteditor' />
    </>
  );
}
