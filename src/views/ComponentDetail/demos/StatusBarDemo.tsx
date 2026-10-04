import { useControl } from 'react-use-control';

import { StatusBar, StatusItem } from '@/lib/components/StatusBar';

import PropsTable from '../PropsTable';

import A11yNote from '../A11yNote';

import { intro, section, row, codeBlock } from '../styles';

// ─── StatusBar ─────────────────────────────────────────────────
export default function StatusBarDemo() {
  // Uncontrolled with an external read-back — clicking the branch item
  // flips a transient "panel open" flag, the way a real host would.
  const [pickerOpen, setPickerOpen] = useControl(undefined, false);

  return (
    <>
      <h1>StatusBar</h1>
      <p className={intro}>
        The compact VSCode-style strip pinned under the work surface:
        leading items cluster at the start edge, trailing items glue to
        the end. Items are plain spans until an{' '}
        <code>onSelect</code> upgrades them to real buttons; lesser items
        fold away below the mobile breakpoint while{' '}
        <code>priority</code> items survive.
      </p>

      <div className={section}>
        <h2>Demo</h2>
        <p className={row}>
          Branch picker is {pickerOpen ? 'open' : 'closed'} — activate the{' '}
          <code>main*</code> item to toggle it.
        </p>
        <div
          style={{
            border: '1px solid var(--haze-color-border)',
            borderRadius: 'var(--haze-radius-md)',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              height: 160,
              padding: 'var(--haze-space-3)',
              fontSize: 'var(--haze-text-sm)',
              color: 'var(--haze-color-text-secondary)',
            }}
          >
            Editor surface — the bar owns the strip below, nothing else.
          </div>
          <StatusBar
            left={
              <>
                <StatusItem
                  onSelect={() => setPickerOpen((v) => !v)}
                  aria-label='Branch picker'
                >
                  main*
                </StatusItem>
                <StatusItem>2↓ 1↑</StatusItem>
                <StatusItem>⚠ 0 &nbsp; ✕ 0</StatusItem>
              </>
            }
            right={
              <>
                <StatusItem>Ln 42, Col 8</StatusItem>
                <StatusItem>Spaces: 2</StatusItem>
                <StatusItem>UTF-8</StatusItem>
                <StatusItem priority>TypeScript React</StatusItem>
              </>
            }
          />
        </div>
        <pre className={codeBlock}>
          {`<StatusBar
  left={
    <>
      <StatusItem onSelect={() => setPickerOpen((v) => !v)}>main*</StatusItem>
      <StatusItem>2↓ 1↑</StatusItem>
    </>
  }
  right={<StatusItem priority>TypeScript React</StatusItem>}
/>`}
        </pre>
      </div>

      <div className={section}>
        <h2>StatusBar Props</h2>
        <PropsTable of='StatusBarProps' />
      </div>

      <div className={section}>
        <h2>StatusItem Props</h2>
        <PropsTable of='StatusItemProps' />
      </div>

      <div className={section}>
        <h2>Accessibility</h2>
        <A11yNote>
          <ul>
            <li>
              The bar renders a <strong>&lt;footer&gt;</strong> landmark;
              inside a page that already owns a{' '}
              <code>footer</code>, scope it with an{' '}
              <code>aria-label</code>.
            </li>
            <li>
              Items with <code>onSelect</code> become real buttons
              (keyboard-operable); plain items stay non-interactive spans.
            </li>
            <li>
              Icon-glyph shorthand like <code>⚠ 0</code> is demo flavor —
              prefer words or <code>aria-label</code> when the content is
              meaningful.
            </li>
          </ul>
        </A11yNote>
      </div>
    </>
  );
}
