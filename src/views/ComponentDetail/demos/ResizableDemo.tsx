import { useControl } from 'react-use-control';

import {
  ResizableGroup,
  ResizablePanel,
  ResizableHandle,
} from '@/lib';

import PropsTable from '../PropsTable';

import A11yNote from '../A11yNote';

import { intro, section, row, codeBlock } from '../styles';

const pane = {
  padding: 'var(--haze-space-3)',
  height: '100%',
  fontSize: 'var(--haze-text-sm)',
  color: 'var(--haze-color-text-secondary)',
} as const;

const frame = {
  height: 220,
  border: '1px solid var(--haze-color-border)',
  borderRadius: 'var(--haze-radius-md)',
} as const;

// ─── Resizable ─────────────────────────────────────────────────
export default function ResizableDemo() {
  // Uncontrolled with an external read-back — the group reports the last
  // committed px sizes, the shape a persistence layer would store.
  const [sizes, setSizes] = useControl<Record<string, number>>(undefined, {
    sidebar: 240,
  });
  const [collapsed, setCollapsed, collapsedCtrl] = useControl(undefined, false);

  return (
    <>
      <h1>Resizable</h1>
      <p className={intro}>
        Panel groups sized in <strong>pixels</strong>: every panel
        declares a stable <code>id</code>, an optional{' '}
        <code>defaultSize</code> in px, and px clamps. Panels without a{' '}
        <code>defaultSize</code> stay flexible and grow into whatever the
        fixed panels leave behind — no percentage bookkeeping, and{' '}
        <code>onResizeCommit</code> hands back a{' '}
        <code>Record&lt;id, px&gt;</code> ready to persist.
      </p>

      <div className={section}>
        <h2>Horizontal — fixed px + flexible</h2>
        <p className={row}>
          The leading panel is pinned at 240px (min 160); the trailing
          panel is flexible. Commit read-back:{' '}
          <code>{JSON.stringify(sizes)}</code>
        </p>
        <div className={row} style={frame}>
          <ResizableGroup onResizeCommit={setSizes}>
            <ResizablePanel id='sidebar' defaultSize={240} minSize={160}>
              <div style={pane}>Sidebar — 240px</div>
            </ResizablePanel>
            <ResizableHandle />
            <ResizablePanel id='content'>
              <div style={pane}>
                Content — flexible: no defaultSize, it grows into the
                space the fixed panel leaves.
              </div>
            </ResizablePanel>
          </ResizableGroup>
        </div>
        <pre className={codeBlock}>
          {`<ResizableGroup onResizeCommit={setSizes}>
  <ResizablePanel id='sidebar' defaultSize={240} minSize={160}>
    <Sidebar />
  </ResizablePanel>
  <ResizableHandle />
  <ResizablePanel id='content'>{content}</ResizablePanel>
</ResizableGroup>`}
        </pre>
      </div>

      <div className={section}>
        <h2>Vertical</h2>
        <div className={row} style={frame}>
          <ResizableGroup direction='vertical'>
            <ResizablePanel id='editor'>
              <div style={pane}>Editor — flexible</div>
            </ResizablePanel>
            <ResizableHandle />
            <ResizablePanel id='terminal' defaultSize={140} minSize={80}>
              <div style={pane}>Terminal — 140px</div>
            </ResizablePanel>
          </ResizableGroup>
        </div>
        <pre className={codeBlock}>
          {`<ResizableGroup direction='vertical'>
  <ResizablePanel id='editor'>{editor}</ResizablePanel>
  <ResizableHandle />
  <ResizablePanel id='terminal' defaultSize={140} minSize={80} />
</ResizableGroup>`}
        </pre>
      </div>

      <div className={section}>
        <h2>Collapsible panel</h2>
        <p className={row}>
          <code>collapsible</code> opts a panel into the collapse feature;{' '}
          <code>collapsed</code> is the usual <code>ControlOrValue</code>{' '}
          prop, so an outside button can drive it too.
        </p>
        <div className={row} style={frame}>
          <ResizableGroup>
            <ResizablePanel
              id='explorer'
              defaultSize={200}
              minSize={120}
              collapsible
              collapsed={collapsedCtrl}
            >
              <div style={pane}>Explorer</div>
            </ResizablePanel>
            <ResizableHandle />
            <ResizablePanel id='main'>
              <div style={pane}>Main</div>
            </ResizablePanel>
          </ResizableGroup>
        </div>
        <p className={row}>
          <button
            type='button'
            onClick={() => setCollapsed((v) => !v)}
            style={{ fontSize: 'var(--haze-text-sm)' }}
          >
            {collapsed ? 'Expand explorer' : 'Collapse explorer'}
          </button>
        </p>
      </div>

      <div className={section}>
        <h2>ResizableGroup Props</h2>
        <PropsTable of='ResizableGroupProps' />
      </div>

      <div className={section}>
        <h2>ResizablePanel Props</h2>
        <PropsTable of='ResizablePanelProps' />
      </div>

      <div className={section}>
        <h2>ResizableHandle Props</h2>
        <PropsTable of='ResizableHandleProps' />
      </div>

      <div className={section}>
        <h2>Accessibility</h2>
        <A11yNote>
          <ul>
            <li>
              Handle uses <strong>role=&quot;separator&quot;</strong> with{' '}
              <strong>aria-orientation</strong> and px value text.
            </li>
            <li>
              Keyboard resizing (WCAG 2.5.7): arrow keys step 16px, Home /
              End park the leading panel at its clamp.
            </li>
            <li>
              24px hit strip with a 4px visual bar (WCAG 2.5.8); coarse
              pointers get 44px.
            </li>
          </ul>
        </A11yNote>
      </div>
    </>
  );
}
