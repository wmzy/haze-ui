import { useControl } from 'react-use-control';

import { Splitter, SplitterPane } from '@/lib';

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

// ─── Splitter ──────────────────────────────────────────────────
export default function SplitterDemo() {
  // Controlled: the demo owns the state through a Control, so the
  // read-back below stays live through every drag and keyboard step.
  const [sizes, , sizesControl] = useControl<number[]>(undefined, [
    25, 50, 25,
  ]);
  // Uncontrolled with a plain initial array — onSizesChange is the
  // only channel back out.
  const [verticalSizes, setVerticalSizes] = useControl<number[]>(undefined, [
    60, 40,
  ]);
  const [, , collapsibleSizes] = useControl<number[]>(undefined, [30, 70]);

  return (
    <>
      <h1>Splitter</h1>
      <p className={intro}>
        AntD-style multi-pane split layout: panes share{' '}
        <strong>percentages</strong> of the pane area through a single{' '}
        <code>sizes</code> control (<code>ControlOrValue</code>), dividers
        are implicit between <code>SplitterPane</code> children, and every
        pane can declare <code>min</code>/<code>max</code> percent clamps.
        For per-pane pixel sizing see{' '}
        <code>ResizableGroup</code> instead.
      </p>

      <div className={section}>
        <h2>Horizontal — three panes</h2>
        <p className={row}>
          Sizes read-back: <code>{JSON.stringify(sizes)}</code> — the{' '}
          <code>Control</code> form keeps the owner's state in sync.
        </p>
        <div className={row} style={frame}>
          <Splitter sizes={sizesControl}>
            <SplitterPane min={15}>
              <div style={pane}>Sidebar — min 15%</div>
            </SplitterPane>
            <SplitterPane min={30}>
              <div style={pane}>Content — min 30%</div>
            </SplitterPane>
            <SplitterPane min={10} max={40}>
              <div style={pane}>Inspector — 10–40%</div>
            </SplitterPane>
          </Splitter>
        </div>
        <pre className={codeBlock}>
          {`const [sizes, , sizesControl] = useControl(undefined, [25, 50, 25]);

<Splitter sizes={sizesControl}>
  <SplitterPane min={15}>{sidebar}</SplitterPane>
  <SplitterPane min={30}>{content}</SplitterPane>
  <SplitterPane min={10} max={40}>{inspector}</SplitterPane>
</Splitter>`}
        </pre>
      </div>

      <div className={section}>
        <h2>Vertical</h2>
        <p className={row}>
          <code>orientation='vertical'</code> stacks the panes
          top-to-bottom; the grip reports a horizontal separator.
          Read-back via <code>onSizesChange</code>:{' '}
          <code>{JSON.stringify(verticalSizes)}</code>.
        </p>
        <div className={row} style={frame}>
          <Splitter
            orientation='vertical'
            sizes={[60, 40]}
            onSizesChange={setVerticalSizes}
          >
            <SplitterPane min={20}>
              <div style={pane}>Editor</div>
            </SplitterPane>
            <SplitterPane min={20}>
              <div style={pane}>Terminal</div>
            </SplitterPane>
          </Splitter>
        </div>
        <pre className={codeBlock}>
          {`<Splitter orientation='vertical' sizes={[60, 40]} onSizesChange={setVerticalSizes}>
  <SplitterPane min={20}>{editor}</SplitterPane>
  <SplitterPane min={20}>{terminal}</SplitterPane>
</Splitter>`}
        </pre>
      </div>

      <div className={section}>
        <h2>Collapsible panes</h2>
        <p className={row}>
          <code>collapsible</code> opts a pane into divider triggers:
          hover a divider and the chevrons collapse the adjacent pane
          (the partner absorbs its share); the same trigger expands it
          back to its pre-collapse size. Dragging a collapsed divider
          also grows the pane straight out of the collapsed state.
        </p>
        <div className={row} style={frame}>
          <Splitter sizes={collapsibleSizes}>
            <SplitterPane collapsible min={15}>
              <div style={pane}>Sidebar — collapsible</div>
            </SplitterPane>
            <SplitterPane min={20}>
              <div style={pane}>Content</div>
            </SplitterPane>
          </Splitter>
        </div>
        <pre className={codeBlock}>
          {`<Splitter sizes={control}>
  <SplitterPane collapsible min={15}>{sidebar}</SplitterPane>
  <SplitterPane min={20}>{content}</SplitterPane>
</Splitter>`}
        </pre>
      </div>

      <div className={section}>
        <A11yNote>
          <strong>Keyboard &amp; screen readers</strong>
          <ul>
            <li>
              Each divider is a focusable <code>separator</code> reporting
              the leading pane's percent via <code>aria-valuenow</code> and
              the pair-adjusted clamps via{' '}
              <code>aria-valuemin</code>/<code>aria-valuemax</code>.
            </li>
            <li>
              Arrow keys step 5 percent points (ArrowRight/ArrowDown grow
              the leading pane, ArrowLeft/ArrowUp shrink it); Home/End park
              it at its clamps. Keys mirror under <code>dir='rtl'</code>.
            </li>
            <li>
              The divider's hit strip is 24px (44px for coarse pointers) —
              WCAG 2.5.8 / 2.5.5.
            </li>
            <li>
              Collapsible panes add real <code>button</code> triggers
              beside the separator (a focusable separator is
              children-presentational, so they must be siblings) with
              localized labels and <code>aria-expanded</code>.
            </li>
          </ul>
        </A11yNote>
      </div>

      <div className={section}>
        <h2>Splitter Props</h2>
        <PropsTable of='SplitterProps' />
      </div>

      <div className={section}>
        <h2>SplitterPane Props</h2>
        <PropsTable of='SplitterPaneProps' />
      </div>
    </>
  );
}
