import { useState } from 'react';
import { useControl } from 'react-use-control';

import { ColorPicker, ColorPickerCore } from '@/lib';

import PropsTable from '../PropsTable';

import A11yNote from '../A11yNote';

import { intro, section, fieldRow } from '../styles';

const PRESETS = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6', '#8b5cf6'];

const GRADIENT_PRESETS = [
  {label: 'Sunset', gradient: 'linear-gradient(90deg, #ff9a9e 0%, #fad0c4 100%)'},
  {label: 'Ocean', gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'},
  {label: 'Mint', gradient: 'linear-gradient(45deg, #00c9ff 0%, #92fe9d 100%)'},
];

const readout = {
  fontSize: 'var(--haze-text-sm)',
  color: 'var(--haze-color-text-secondary)',
} as const;

// ─── ColorPicker ────────────────────────────────────────────────
export default function ColorPickerDemo() {
  const [value, , valueCtrl] = useControl(undefined, '#3b82f6');
  const [alphaValue, , alphaCtrl] = useControl(undefined, '#3b82f6');
  const [gradientValue, , gradientCtrl] = useControl(
    undefined,
    'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
  );
  const [format, setFormat] = useState<'hex' | 'rgb' | 'hsl'>('hex');
  const [withAlpha, setWithAlpha] = useState(true);
  // ColorPickerCore is the plain controlled primitive — value + onChange.
  const [coreValue, setCoreValue] = useState('#22c55e');

  return (
    <>
      <h1>ColorPicker</h1>
      <p className={intro}>
        Color picking with a saturation/value panel, hue rail, presets and
        recent colors — as a trigger + floating panel, or inline. With{' '}
        <code>gradient</code>, values can be CSS{' '}
        <code>linear-gradient()</code> strings with a full angle + stops
        editor.
      </p>

      <div className={section}>
        <h2>Demo</h2>
        <p>
          A swatch trigger opens the panel: drag (or click) the
          saturation/value surface and the hue rail, type a color code, or
          pick a preset. Values stream continuously while a drag runs;
          committed picks feed the <code>recent</code> list (last 10,
          newest first).
        </p>
        <div className={fieldRow}>
          <ColorPicker
            value={valueCtrl}
            presets={PRESETS}
            recent
            aria-label="Theme color"
          />
        </div>
        <p style={readout}>Selected: {value}</p>
      </div>

      <div className={section}>
        <h2>Formats &amp; alpha</h2>
        <p>
          <code>format</code> drives both the text field and every emitted
          value (<code>#rrggbb</code>, <code>rgb()</code>,{' '}
          <code>hsl()</code>); the field accepts any of the three and
          normalizes to it. With <code>allowAlpha</code>, the alpha rail
          adds an opacity channel that serializes as{' '}
          <code>#rrggbbaa</code> / <code>rgba()</code> / <code>hsla()</code>{' '}
          below full opacity.
        </p>
        <div className={fieldRow}>
          <button type="button" aria-pressed={format === 'hex'} onClick={() => setFormat('hex')}>
            hex
          </button>{' '}
          <button type="button" aria-pressed={format === 'rgb'} onClick={() => setFormat('rgb')}>
            rgb
          </button>{' '}
          <button type="button" aria-pressed={format === 'hsl'} onClick={() => setFormat('hsl')}>
            hsl
          </button>{' '}
          <button
            type="button"
            aria-pressed={withAlpha}
            onClick={() => setWithAlpha(!withAlpha)}
          >
            alpha
          </button>
        </div>
        <div className={fieldRow}>
          <ColorPicker
            value={alphaCtrl}
            format={format}
            allowAlpha={withAlpha}
            presets={PRESETS}
            aria-label="Accent color"
          />
        </div>
        <p style={readout}>Selected: {alphaValue}</p>
      </div>

      <div className={section}>
        <h2>Gradients</h2>
        <p>
          With <code>gradient</code>, the panel gains a Solid/Gradient
          toggle. A gradient value is just a CSS{' '}
          <code>linear-gradient()</code> string: the angle field and the
          stop list edit it, while the saturation/hue rails and the text
          field edit the <em>selected</em> stop (click a stop&apos;s
          swatch to select it). Switching modes applies the default of
          the target mode — solid opens into{' '}
          <code>linear-gradient(90deg, …color… 0%, #ffffff 100%)</code>,
          gradient returns to the first stop&apos;s color — the departed
          mode&apos;s value is not remembered. Gradient presets render
          as preview bars of the actual gradient.
        </p>
        <div className={fieldRow}>
          <ColorPicker
            value={gradientCtrl}
            gradient
            allowAlpha
            presets={[...GRADIENT_PRESETS, ...PRESETS.slice(0, 3)]}
            aria-label="Background gradient"
          />
        </div>
        <p style={readout}>Selected: {gradientValue}</p>
      </div>

      <div className={section}>
        <h2>Inline</h2>
        <p>
          <code>inline</code> swaps the trigger + floating panel for an
          always-visible panel card — for settings pages and sidebars.
        </p>
        <div className={fieldRow}>
          <ColorPicker inline presets={PRESETS} recent />
        </div>
      </div>

      <div className={section}>
        <h2>Core — native primitive</h2>
        <p>
          <code>ColorPickerCore</code> keeps the headless form: the native{' '}
          <code>&lt;input type=&quot;color&quot;&gt;</code> plus a hex text
          field, no floating layer. Compose it when the panel shape does
          not fit.
        </p>
        <div className={fieldRow}>
          <ColorPickerCore value={coreValue} onChange={setCoreValue} presets={PRESETS.slice(0, 3)} />
        </div>
      </div>

      <div className={section}>
        <h2>Props</h2>
        <PropsTable of='ColorPickerProps' />
        <h3>ColorPickerCoreProps</h3>
        <PropsTable of='ColorPickerCoreProps' />
      </div>

      <div className={section}>
        <h2>Accessibility</h2>
        <A11yNote>
          <ul>
            <li>Trigger is a <strong>button</strong> with <strong>aria-haspopup</strong> and <strong>aria-expanded</strong>; the panel is a labelled <strong>dialog</strong></li>
            <li>SV surface, hue and alpha rails are <strong>sliders</strong> — arrow keys adjust (Shift ×10), <strong>aria-valuetext</strong> carries the color/hue/opacity</li>
            <li>Opening the panel focuses the SV surface, so the keyboard reaches the rails immediately</li>
            <li>Preset and recent swatches are labelled with their color value</li>
            <li>Gradient mode: the Solid/Gradient toggle carries <strong>aria-pressed</strong>; the angle and stop-position fields are labelled number inputs; each stop&apos;s swatch and remover names its index and value</li>
          </ul>
        </A11yNote>
      </div>
    </>
  );
}
