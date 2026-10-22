import { Meter } from '@/lib/components/Meter';

import PropsTable from '../PropsTable';

import A11yNote from '../A11yNote';

import { intro, section, row } from '../styles';

import { CssVarsSection } from './shared';

// ─── Meter ─────────────────────────────────────────────────────
export default function MeterDemo() {
  return (
    <>
      <h1>Meter</h1>
      <p className={intro}>
        只读语义化仪表（React Aria / HeroUI Meter 语义）：<code>role='meter'</code>{' '}
        挂在根元素上，带 <code>aria-valuenow/min/max</code>。<code>value</code>{' '}
        按 <code>min</code>/<code>max</code> 归一成条宽；<code>thresholds</code>{' '}
        阈值段决定 track/bar 颜色——值越过某个 <code>at</code> 边界，仪表就换上该段的
        tone（track 洗该色的 subtle 底、bar 实色）。
      </p>

      <div className={section}>
        <h2>Basic</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--haze-space-3)', maxWidth: 400 }}>
          <Meter value={25} label="CPU" />
          <Meter value={50} label="Memory" />
          <Meter value={75} label="Disk" />
        </div>
      </div>

      <div className={section}>
        <h2>Thresholds</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--haze-space-3)', maxWidth: 400 }}>
          <Meter value={42} label="Bandwidth" showValue thresholds={[{ at: 60, tone: 'warning' }, { at: 85, tone: 'danger' }]} />
          <Meter value={72} label="Bandwidth" showValue thresholds={[{ at: 60, tone: 'warning' }, { at: 85, tone: 'danger' }]} />
          <Meter value={93} label="Bandwidth" showValue thresholds={[{ at: 60, tone: 'warning' }, { at: 85, tone: 'danger' }]} />
        </div>
      </div>

      <div className={section}>
        <h2>Custom scale (min / max)</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--haze-space-3)', maxWidth: 400 }}>
          <Meter value={7} min={0} max={10} label="Replicas" showValue />
          <Meter value={230} min={0} max={512} label="Storage (GB)" showValue />
        </div>
      </div>

      <div className={section}>
        <h2>Sizes</h2>
        <div className={row}>
          <div style={{ flex: 1, minWidth: 120 }}>
            <Meter value={60} size="sm" label="sm" showValue />
          </div>
          <div style={{ flex: 1, minWidth: 120 }}>
            <Meter value={60} size="md" label="md" showValue />
          </div>
          <div style={{ flex: 1, minWidth: 120 }}>
            <Meter value={60} size="lg" label="lg" showValue />
          </div>
        </div>
      </div>

      <div className={section}>
        <h2>Props</h2>
        <PropsTable of="MeterProps" />
      </div>

      <div className={section}>
        <h2>Accessibility</h2>
        <A11yNote>
          <ul>
            <li>
              Root carries <strong>role=&quot;meter&quot;</strong> with{' '}
              <strong>aria-valuenow</strong>, <strong>aria-valuemin</strong>,{' '}
              <strong>aria-valuemax</strong> (ARIA 1.1 meter)
            </li>
            <li>
              <code>label</code> renders a visible label and wires it via{' '}
              <strong>aria-labelledby</strong>; without it, pass{' '}
              <code>aria-label</code> through the native props
            </li>
            <li>
              Tone changes are visual only — the numeric reading stays the
              accessible truth
            </li>
          </ul>
        </A11yNote>
      </div>

      <CssVarsSection component="meter" />
    </>
  );
}
