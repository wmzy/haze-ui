import type {
  KeyboardEvent as ReactKeyboardEvent,
  PointerEvent as ReactPointerEvent,
} from 'react';

import type { ColorFormat, Hsv, Rgb } from './color-math';
import type { ColorPickerPreset, Gradient } from './gradient';

import { Fragment, useId, useState } from 'react';

import { useStrings } from '../LocaleProvider';

import { usePointerDrag } from '../../utils/use-pointer-drag';

import { clamp01, cssColor, formatColor, hsvToRgb, parseColor, rgbHexKey, rgbToHsv } from './color-math';
import { fmtNum, gradientFromColor, parseGradient, serializeGradient } from './gradient';

import {
  addStopBtn,
  angleRow,
  checkerboard,
  gradientPreview,
  gradientSwatch,
  groupLabel,
  hueTrack,
  modeBtn,
  modeToggle,
  numberInput,
  panelContent,
  stopRemoveBtn,
  stopRow,
  stopsList,
  stopSwatchActive,
  stopSwatchBtn,
  svArea,
  svThumb,
  swatchActive,
  swatchBtn,
  swatchFill,
  swatchRow,
  track,
  trackFill,
  trackThumb,
  valueInput,
} from './color-picker-styles';

type ColorPickerPanelProps = {
  /** Current color in any supported format; unparsable values fall back to black. */
  value: string;
  /**
   * Continuous value callback — fires for every drag move (Slider
   * precedent: values stream while the gesture runs), always serialized
   * in `format` (solid) or as a canonical gradient (gradient mode).
   */
  onChange: (value: string) => void;
  /**
   * "The user settled on this value": gesture release, discrete pick
   * (preset/recent swatch, arrow keys, mode switch, stop edit) or
   * committed text. The recent-colors bookkeeping in the sugar layer
   * rides on this.
   */
  onCommit?: (value: string) => void;
  /** Serialization format of the text field and every emitted solid value. */
  format?: ColorFormat;
  /** Adds the alpha rail; alpha serializes into the value when below 1. */
  allowAlpha?: boolean;
  /**
   * Preset entries: plain color strings (the original flat-list shape,
   * rendered under one "Presets" heading), labeled solid groups
   * (`{ label, colors }`) and single gradients (`{ label, gradient }`,
   * rendered as a preview bar of the actual gradient). Clicking a solid
   * entry always emits a solid color; clicking a gradient entry emits
   * its canonical gradient — either one flips the editing mode.
   */
  presets?: ColorPickerPreset[];
  /** Recent-color swatches to render (owned by the sugar layer). */
  recentColors?: string[];
  /**
   * Adds the Solid/Gradient mode toggle and, while the value is a
   * gradient, the gradient editor (angle, stop list). The mode is
   * derived from the value — a parsable `linear-gradient()` string IS
   * gradient mode — so switching modes is a plain value emission:
   * entering gradient mode opens the current color into a two-stop
   * `90deg` run to white, returning to solid takes the first stop's
   * color. No per-mode value memory.
   */
  gradient?: boolean;
  className?: string;
};

const BLACK: Rgb = {r: 0, g: 0, b: 0};

/** A laid-out rect, or null for the zero-size rects jsdom reports. */
function rectOf(el: Element): DOMRect | null {
  const rect = el.getBoundingClientRect();
  return rect.width > 0 && rect.height > 0 ? rect : null;
}

/** Horizontal position of the pointer along the element, as 0..1. */
function horizontalFraction(event: ReactPointerEvent<HTMLDivElement>): number | null {
  const rect = rectOf(event.currentTarget);
  if (!rect) return null;
  return clamp01((event.clientX - rect.left) / rect.width);
}

/** Channel-wise midpoint of two stop colors (the inserted stop's paint). */
function mixColors(from: string, to: string): string {
  const a = parseColor(from)?.rgb ?? BLACK;
  const b = parseColor(to)?.rgb ?? BLACK;
  return formatColor(
    {
      r: Math.round((a.r + b.r) / 2),
      g: Math.round((a.g + b.g) / 2),
      b: Math.round((a.b + b.b) / 2),
      a: ((a.a ?? 1) + (b.a ?? 1)) / 2,
    },
    'hex',
    true
  );
}

export default function ColorPickerPanel({
  value,
  onChange,
  onCommit,
  format = 'hex',
  allowAlpha = false,
  presets,
  recentColors,
  gradient = false,
  className,
}: ColorPickerPanelProps) {
  const strings = useStrings('colorPicker');
  const angleInputId = useId();

  // The mode derives from the value — never shadow state: a parsable
  // linear-gradient() string is gradient mode, everything else (any
  // solid color, or an unparsable/unsupported gradient) is solid mode.
  const gradientValue = gradient ? parseGradient(value) : null;
  const isGradient = gradientValue !== null;

  // Which gradient stop the SV/hue/alpha rails and the text field edit.
  // Purely internal UI state, never a controlled prop; the derived
  // index clamps when stops shrink.
  const [selectedStop, setSelectedStop] = useState(0);
  const stopIndex = isGradient
    ? Math.min(selectedStop, gradientValue.stops.length - 1)
    : 0;
  const stops = gradientValue?.stops ?? [];

  // The color under the rails: the value itself (solid mode) or the
  // selected stop (gradient mode). Derived every render from the
  // controlled value — the single source of truth, no drift.
  const base = isGradient
    ? parseColor(stops[stopIndex]?.color ?? '')?.rgb ?? BLACK
    : parseColor(value)?.rgb ?? BLACK;
  const alpha = allowAlpha ? (base.a ?? 1) : 1;
  const hsv = rgbToHsv(base);
  const currentKey = rgbHexKey({...base, a: alpha});
  const gradientCss = gradientValue ? serializeGradient(gradientValue) : null;

  const emitGradient = (next: Gradient, commit: boolean) => {
    const serialized = serializeGradient(next);
    onChange(serialized);
    if (commit) onCommit?.(serialized);
  };

  // A solid value emission — what preset/recent swatch clicks and the
  // solid→solid path always speak, regardless of the current mode (a
  // solid preset pick leaves gradient mode by definition).
  const emitSolid = (rgb: Rgb, commit: boolean) => {
    const next = formatColor(
      {...rgb, a: allowAlpha ? rgb.a : undefined},
      format,
      allowAlpha
    );
    onChange(next);
    if (commit) onCommit?.(next);
  };

  const emit = (rgb: Rgb, commit: boolean) => {
    if (gradientValue) {
      // Gradient mode: the rails edit the selected stop only; its color
      // canonicalizes to hex, alpha riding along when the alpha rail is
      // on (mirroring solid mode's allowAlpha serialization rule).
      emitGradient(
        {
          angle: gradientValue.angle,
          stops: gradientValue.stops.map((stop, index) =>
            index === stopIndex
              ? {...stop, color: formatColor({...rgb, a: allowAlpha ? rgb.a : undefined}, 'hex', true)}
              : stop
          ),
        },
        commit
      );
      return;
    }
    emitSolid(rgb, commit);
  };

  // Mode switching is a value emission (no shadow mode state): the
  // default of the TARGET mode is applied — entering gradient mode
  // opens the current color into a two-stop 90deg run to white;
  // returning to solid takes the first stop's color. The last value of
  // the departed mode is deliberately not kept (see props JSDoc).
  const switchMode = (mode: 'solid' | 'gradient') => {
    if (mode === 'gradient' && !isGradient) {
      emitGradient(gradientFromColor({...base, a: alpha}), true);
      setSelectedStop(0);
    } else if (mode === 'solid' && isGradient) {
      emitSolid(parseColor(stops[0]?.color ?? '')?.rgb ?? BLACK, true);
    }
  };

  const applyHsv = (next: Hsv, commit: boolean) => {
    emit({...hsvToRgb(next), a: alpha}, commit);
  };
  const applyAlpha = (next: number, commit: boolean) => {
    emit({...base, a: next}, commit);
  };

  const svHandlers = usePointerDrag<HTMLDivElement, Hsv>(
    (event) => {
      const rect = rectOf(event.currentTarget);
      if (!rect) return null;
      return {
        h: hsv.h,
        s: clamp01((event.clientX - rect.left) / rect.width),
        v: 1 - clamp01((event.clientY - rect.top) / rect.height),
      };
    },
    (next) => applyHsv(next, false),
    (next) => applyHsv(next, true)
  );

  const hueHandlers = usePointerDrag<HTMLDivElement, number>(
    (event) => {
      const fraction = horizontalFraction(event);
      return fraction === null ? null : fraction * 360;
    },
    (next) => applyHsv({...hsv, h: next}, false),
    (next) => applyHsv({...hsv, h: next}, true)
  );

  const alphaHandlers = usePointerDrag<HTMLDivElement, number>(
    (event) => horizontalFraction(event),
    (next) => applyAlpha(next, false),
    (next) => applyAlpha(next, true)
  );

  // Arrow keys adjust by 1% (SV/alpha) or 1° (hue); Shift ×10.
  const svKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    const step = (event.shiftKey ? 10 : 1) / 100;
    switch (event.key) {
      case 'ArrowLeft':
        applyHsv({...hsv, s: clamp01(hsv.s - step)}, true);
        break;
      case 'ArrowRight':
        applyHsv({...hsv, s: clamp01(hsv.s + step)}, true);
        break;
      case 'ArrowDown':
        applyHsv({...hsv, v: clamp01(hsv.v - step)}, true);
        break;
      case 'ArrowUp':
        applyHsv({...hsv, v: clamp01(hsv.v + step)}, true);
        break;
      default:
        return;
    }
    event.preventDefault();
  };

  const hueKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    const step = event.shiftKey ? 10 : 1;
    switch (event.key) {
      case 'ArrowLeft':
      case 'ArrowDown':
        applyHsv({...hsv, h: (((hsv.h - step) % 360) + 360) % 360}, true);
        break;
      case 'ArrowRight':
      case 'ArrowUp':
        applyHsv({...hsv, h: (hsv.h + step) % 360}, true);
        break;
      default:
        return;
    }
    event.preventDefault();
  };

  const alphaKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    const step = (event.shiftKey ? 10 : 1) / 100;
    switch (event.key) {
      case 'ArrowLeft':
      case 'ArrowDown':
        applyAlpha(clamp01(alpha - step), true);
        break;
      case 'ArrowRight':
      case 'ArrowUp':
        applyAlpha(clamp01(alpha + step), true);
        break;
      default:
        return;
    }
    event.preventDefault();
  };

  // Text field: a local draft while focused; Enter/blur commits a
  // parsable draft — in solid mode any color format (normalized to
  // `format`), with `gradient` on also a full linear-gradient() string
  // (which flips/replaces the gradient wholesale). Invalid input
  // reverts (no-op). Escape drops the draft without closing the panel
  // (stopPropagation keeps the floating layer's Esc close away).
  // In gradient mode the field shows the SELECTED STOP's color.
  const [draft, setDraft] = useState<string | null>(null);
  const shownValue =
    draft ?? formatColor({...base, a: alpha}, format, allowAlpha);
  const commitDraft = () => {
    if (draft === null) return;
    const next = parseColor(draft);
    setDraft(null);
    if (next) {
      emit(next.rgb, true);
      return;
    }
    const parsed = gradient ? parseGradient(draft) : null;
    if (parsed) emitGradient(parsed, true);
  };

  // Angle field: a local draft while focused; a parseable keystroke
  // emits immediately (rounded, wrapped to 0..360), blur restores the
  // canonical derived value.
  const [angleDraft, setAngleDraft] = useState<string | null>(null);
  const shownAngle = angleDraft ?? (gradientValue ? fmtNum(gradientValue.angle) : '0');
  const changeAngle = (raw: string) => {
    setAngleDraft(raw);
    const n = Number(raw);
    if (raw.trim() === '' || !Number.isFinite(n) || !gradientValue) return;
    emitGradient(
      {angle: ((Math.round(n) % 360) + 360) % 360, stops: gradientValue.stops},
      true
    );
  };

  // Stop position fields: one shared draft (only one input is focused
  // at a time); parseable keystrokes emit, blur restores the derived
  // position.
  const [stopDraft, setStopDraft] = useState<{index: number; value: string} | null>(null);
  const changeStopPosition = (index: number, raw: string) => {
    setStopDraft({index, value: raw});
    const n = Number(raw);
    if (raw.trim() === '' || !Number.isFinite(n) || !gradientValue) return;
    emitGradient(
      {
        angle: gradientValue.angle,
        stops: gradientValue.stops.map((stop, i) =>
          i === index ? {...stop, position: Math.min(Math.max(n, 0), 100)} : stop
        ),
      },
      true
    );
  };

  // Stops: removable down to the CSS floor of two; inserting takes the
  // midpoint of the widest gap with the channel-wise mixed color and
  // selects the new stop so the rails continue on it.
  const removeStop = (index: number) => {
    if (!gradientValue || gradientValue.stops.length <= 2) return;
    emitGradient(
      {
        angle: gradientValue.angle,
        stops: gradientValue.stops.filter((_, i) => i !== index),
      },
      true
    );
    if (selectedStop > index) setSelectedStop(selectedStop - 1);
  };

  const addStop = () => {
    if (!gradientValue) return;
    const list = gradientValue.stops;
    let gapStart = 0;
    let gapSize = -1;
    for (let i = 0; i < list.length - 1; i++) {
      const size = (list[i + 1]?.position ?? 0) - (list[i]?.position ?? 0);
      if (size > gapSize) {
        gapSize = size;
        gapStart = i;
      }
    }
    const from = list[gapStart] ?? list[0]!;
    const to = list[gapStart + 1] ?? list[list.length - 1]!;
    const inserted = {
      color: mixColors(from.color, to.color),
      position: (from.position + to.position) / 2,
    };
    const next = [...list, inserted];
    emitGradient({angle: gradientValue.angle, stops: next}, true);
    const sorted = [...next].sort((a, b) => a.position - b.position);
    setSelectedStop(sorted.indexOf(inserted));
  };

  // Presets: the original flat string list (one "Presets" heading)
  // plus structured entries in their given order. Solid swatches never
  // ring active while the value is a gradient (they would emit a solid
  // color and leave gradient mode).
  const solidActiveKey = isGradient ? null : currentKey;
  const flatPresets = (presets ?? []).filter(
    (entry): entry is string => typeof entry === 'string'
  );
  const structuredPresets = (presets ?? []).filter(
    (entry) => typeof entry !== 'string'
  );

  const renderSwatches = (colors: string[], keyPrefix: string) => (
    <div data-slot="swatch-row" x-class={[swatchRow]}>
      {colors.map((color) => {
        const rgb = parseColor(color)?.rgb;
        if (!rgb) return null;
        return (
          <button
            key={`${keyPrefix}:${color}`}
            type='button'
            data-slot="swatch-item"
            x-class={[swatchBtn, checkerboard, rgbHexKey(rgb) === solidActiveKey && swatchActive]}
            aria-label={color}
            onClick={() => emitSolid(rgb, true)}
          >
            <span data-slot="swatch" x-class={[swatchFill]} style={{background: cssColor(rgb)}} />
          </button>
        );
      })}
    </div>
  );

  const renderPresetEntry = (entry: Extract<ColorPickerPreset, {label?: string}>, key: string) => {
    if ('colors' in entry) {
      return (
        <Fragment key={key}>
          {entry.label !== undefined && (
            <div data-slot="group-label" x-class={[groupLabel]}>{entry.label}</div>
          )}
          {renderSwatches(entry.colors, key)}
        </Fragment>
      );
    }
    const parsed = parseGradient(entry.gradient);
    if (!parsed) return null;
    const canonical = serializeGradient(parsed);
    return (
      <button
        key={key}
        type='button'
        data-slot="gradient-swatch"
        aria-label={entry.label ?? entry.gradient}
        x-class={[gradientSwatch, checkerboard, canonical === gradientCss && swatchActive]}
        style={{background: canonical}}
        onClick={() => emitGradient(parsed, true)}
      />
    );
  };

  return (
    <div data-slot="panel" x-class={[panelContent, className]}>
      {gradient && (
        <div data-slot="mode-toggle" x-class={[modeToggle]} role='group'>
          <button
            type='button'
            data-slot="mode-button"
            x-class={[modeBtn]}
            aria-pressed={!isGradient}
            onClick={() => switchMode('solid')}
          >
            {strings.solid}
          </button>
          <button
            type='button'
            data-slot="mode-button"
            x-class={[modeBtn]}
            aria-pressed={isGradient}
            onClick={() => switchMode('gradient')}
          >
            {strings.gradient}
          </button>
        </div>
      )}

      {isGradient && (
        <>
          <div
            data-slot="gradient-preview"
            x-class={[gradientPreview, checkerboard]}
            aria-hidden="true"
            style={{background: gradientCss ?? undefined}}
          />
          <div data-slot="angle-row" x-class={[angleRow]}>
            <label htmlFor={angleInputId}>{strings.angle}</label>
            <input
              id={angleInputId}
              type='number'
              min={0}
              max={360}
              step={1}
              data-slot="angle-input"
              x-class={[numberInput]}
              value={shownAngle}
              onChange={(e) => changeAngle(e.target.value)}
              onBlur={() => setAngleDraft(null)}
            />
          </div>
        </>
      )}

      {/*
        The SV surface: hue base painted by inline style under white
        (left→right = saturation) and black (bottom→top = value)
        gradients — functional color stops, like the hue spectrum rail.
        In gradient mode it edits the selected stop.
      */}
      <div
        data-slot="saturation"
        x-class={[svArea]}
        role='slider'
        tabIndex={0}
        aria-label={strings.saturationBrightness}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(hsv.s * 100)}
        aria-valuetext={formatColor(base, 'hex', false)}
        style={{
          background: `linear-gradient(to top, #000, rgba(0, 0, 0, 0)), linear-gradient(to right, #fff, rgba(255, 255, 255, 0)), hsl(${hsv.h}, 100%, 50%)`,
        }}
        onKeyDown={svKeyDown}
        {...svHandlers}
      >
        <span
          data-slot="thumb"
          x-class={[svThumb]}
          style={{left: `${hsv.s * 100}%`, top: `${(1 - hsv.v) * 100}%`}}
        />
      </div>

      <div
        data-slot="hue-track"
        x-class={[track, hueTrack]}
        role='slider'
        tabIndex={0}
        aria-label={strings.hue}
        aria-valuemin={0}
        aria-valuemax={360}
        aria-valuenow={Math.round(hsv.h)}
        aria-valuetext={`${Math.round(hsv.h)}deg`}
        onKeyDown={hueKeyDown}
        {...hueHandlers}
      >
        <span data-slot="thumb" x-class={[trackThumb]} style={{left: `${(hsv.h / 360) * 100}%`}} />
      </div>

      {allowAlpha && (
        <div
          data-slot="alpha-track"
          x-class={[track, checkerboard]}
          role='slider'
          tabIndex={0}
          aria-label={strings.alpha}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(alpha * 100)}
          aria-valuetext={`${Math.round(alpha * 100)}%`}
          onKeyDown={alphaKeyDown}
          {...alphaHandlers}
        >
          <span
            data-slot="fill"
            x-class={[trackFill]}
            style={{
              background: `linear-gradient(to right, rgba(${base.r}, ${base.g}, ${base.b}, 0), rgba(${base.r}, ${base.g}, ${base.b}, 1))`,
            }}
          />
          <span data-slot="thumb" x-class={[trackThumb]} style={{left: `${alpha * 100}%`}} />
        </div>
      )}

      <input
        type='text'
        data-slot="input"
        x-class={[valueInput]}
        aria-label={strings.hexColor}
        spellCheck={false}
        value={shownValue}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={commitDraft}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            e.preventDefault();
            commitDraft();
          } else if (e.key === 'Escape') {
            e.stopPropagation();
            setDraft(null);
          }
        }}
      />

      {isGradient && (
        <>
          <div data-slot="stops-list" x-class={[stopsList]}>
            {stops.map((stop, index) => (
              <div key={`${index}:${stop.color}`} data-slot="stop-item" x-class={[stopRow]}>
                <button
                  type='button'
                  data-slot="stop-swatch"
                  x-class={[stopSwatchBtn, checkerboard, index === stopIndex && stopSwatchActive]}
                  aria-label={`${strings.stopColor} ${index + 1}: ${stop.color}`}
                  onClick={() => setSelectedStop(index)}
                >
                  <span data-slot="swatch" x-class={[swatchFill]} style={{background: stop.color}} />
                </button>
                <input
                  type='number'
                  min={0}
                  max={100}
                  step={1}
                  data-slot="stop-position-input"
                  x-class={[numberInput]}
                  aria-label={`${strings.stopPosition} ${index + 1}`}
                  value={
                    stopDraft?.index === index
                      ? stopDraft.value
                      : fmtNum(stop.position)
                  }
                  onChange={(e) => changeStopPosition(index, e.target.value)}
                  onBlur={() => setStopDraft(null)}
                />
                <button
                  type='button'
                  data-slot="stop-remove-button"
                  x-class={[stopRemoveBtn]}
                  aria-label={`${strings.removeStop} ${index + 1}`}
                  disabled={stops.length <= 2}
                  onClick={() => removeStop(index)}
                >
                  ×
                </button>
              </div>
            ))}
          </div>
          <button type='button' data-slot="add-stop-button" x-class={[addStopBtn]} onClick={addStop}>
            {strings.addStop}
          </button>
        </>
      )}

      {flatPresets.length > 0 && (
        <>
          <div data-slot="group-label" x-class={[groupLabel]}>{strings.presetsLabel}</div>
          {renderSwatches(flatPresets, 'preset')}
        </>
      )}

      {structuredPresets.map((entry, index) => renderPresetEntry(entry, `preset-${index}`))}

      {recentColors !== undefined && recentColors.length > 0 && (
        <>
          <div data-slot="group-label" x-class={[groupLabel]}>{strings.recentColors}</div>
          {renderSwatches(recentColors, 'recent')}
        </>
      )}
    </div>
  );
}

export type { ColorPickerPanelProps };
