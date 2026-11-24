import {
  Toolbar,
  ToolbarSeparator,
  ToolbarToggle,
} from '@/lib/components/Toolbar';
import { Toggle } from '@/lib/components/Toggle';

import PropsTable from '../PropsTable';

import { row, codeBlock } from '../styles';

import { AccessibilitySection, DemoPage, DemoSection } from './shared';

// ─── Toggle ────────────────────────────────────────────────────
export default function ToggleDemo() {
  return (
    <DemoPage
      title='Toggle'
      description={
        <>
          A two-state button that reports <code>aria-pressed</code> — the
          momentary &quot;pressed&quot; semantic for format bars, filters and
          mode switches. Where Switch means a setting that is on or off, Toggle
          means an action that is currently active.
        </>
      }
    >
      <DemoSection title='Uncontrolled'>
        <div className={row}>
          <Toggle>Bold</Toggle>
        </div>
        <pre className={codeBlock}>
          {`<Toggle>Bold</Toggle>`}
        </pre>
      </DemoSection>

      <DemoSection title='Controlled (ControlOrValue)'>
        <p className={row}>
          One prop covers both modes — pass a plain value to control, or a{' '}
          <code>[value, setValue]</code> pair from <code>useControl</code> for
          the fully wired channel.
        </p>
        <pre className={codeBlock}>
          {`const [pressed, setPressed] = useControl(null, false);

<Toggle pressed={pressed} onPressedChange={setPressed}>
  Muted
</Toggle>`}
        </pre>
      </DemoSection>

      <DemoSection title='Sizes and square (icon) toggles'>
        <div className={row}>
          <Toggle size='sm'>Small</Toggle>
          <Toggle>Medium</Toggle>
          <Toggle size='lg'>Large</Toggle>
          <Toggle square aria-label='Mute'>
            🔇
          </Toggle>
        </div>
        <pre className={codeBlock}>
          {`<Toggle size='lg'>Large</Toggle>
<Toggle square aria-label='Mute'>🔇</Toggle>`}
        </pre>
      </DemoSection>

      <DemoSection title='ToggleCore — the controlled primitive'>
        <p className={row}>
          The flat <code>&#123;pressed, onPressedChange&#125;</code> pair for
          form libraries (react-f0rm binds cores with zero adapters), mirroring{' '}
          <code>SwitchCore</code> / <code>InputCore</code>.
        </p>
        <pre className={codeBlock}>
          {`<ToggleCore pressed={false} onPressedChange={(v) => apply(v)} />`}
        </pre>
      </DemoSection>

      <DemoSection title='Inside a toolbar'>
        <p className={row}>
          <code>ToolbarToggle</code> keeps the roving-tabindex behavior of{' '}
          <code>ToolbarButton</code> and owns its pressed state — the toolbar
          idiom in one element.
        </p>
        <div className={row}>
          <Toolbar aria-label='View options'>
            <ToolbarToggle square aria-label='Compact'>
              ▤
            </ToolbarToggle>
            <ToolbarToggle square aria-label='Show sidebar' pressed>
              ☰
            </ToolbarToggle>
            <ToolbarSeparator />
            <ToolbarToggle>Dark mode</ToolbarToggle>
          </Toolbar>
        </div>
        <pre className={codeBlock}>
          {`<Toolbar aria-label='View options'>
  <ToolbarToggle square aria-label='Compact'>▤</ToolbarToggle>
  <ToolbarToggle square aria-label='Show sidebar' pressed>☰</ToolbarToggle>
  <ToolbarSeparator />
  <ToolbarToggle>Dark mode</ToolbarToggle>
</Toolbar>`}
        </pre>
      </DemoSection>

      <DemoSection title='Toggle Props'>
        <PropsTable of='ToggleProps' />
      </DemoSection>

      <DemoSection title='ToggleCore Props'>
        <PropsTable of='ToggleCoreProps' />
      </DemoSection>

      <DemoSection title='ToolbarToggle Props'>
        <PropsTable of='ToolbarToggleProps' />
      </DemoSection>

      <AccessibilitySection>
        <ul>
          <li>
            Native <strong>&lt;button&gt;</strong> with{' '}
            <strong>aria-pressed</strong>; label text (or aria-label for
            square/icon toggles) names the action
          </li>
          <li>
            <code>Toggle</code> accepts the full{' '}
            <code>ControlOrValue&lt;boolean&gt;</code> protocol;{' '}
            <code>ToolbarToggle</code> is roving-tabindex compatible
          </li>
        </ul>
      </AccessibilitySection>
    </DemoPage>
  );
}
