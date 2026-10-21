import type { Ref } from 'react';
import type { ControlOrValue } from 'react-use-control';

import type { ColorFormat } from './color-math';
import type { ColorPickerPreset } from './gradient';

import { css } from '@linaria/core';
import { useCallback, useEffect, useId, useRef, useState } from 'react';
import { useControl } from 'react-use-control';

import { useStrings } from '../LocaleProvider';

import { FloatingPanel, useFloating } from '../../utils/floating';
import { NativeHiddenFields } from '../../utils/native-form';
import { mergeRefs } from '../../utils/refs';

import ColorPickerPanel from './ColorPickerPanel';
import { cssColor, formatColor, parseColor, rgbHexKey } from './color-math';
import { parseGradient, serializeGradient } from './gradient';

import {
  checkerboard,
  panelVisuals,
  swatchFill,
  trigger,
} from './color-picker-styles';

type ColorPickerProps = {
  /** Color value in any supported format (hex / rgb / hsl). */
  value?: ControlOrValue<string>;
  /**
   * Value callback: streams continuously while a drag runs (Slider
   * precedent), serialized in `format`.
   */
  onChange?: (color: string) => void;
  /** Floating panel visibility (floating mode only; controllable). */
  open?: ControlOrValue<boolean>;
  /**
   * Always-visible panel instead of the trigger + floating panel pair.
   * The Core-level primitive (`ColorPickerCore`) remains the native
   * inline form for headless composition.
   */
  inline?: boolean;
  /**
   * Serialization format of the text field and emitted values
   * (`#rrggbb`, `rgb(r, g, b)`, `hsl(h, s%, l%)`). A controlled display
   * concern — switching it does not re-emit the current value.
   */
  format?: ColorFormat;
  /**
   * Adds the alpha rail. Values below full opacity serialize with the
   * alpha channel (`#rrggbbaa`, `rgba()`, `hsla()`); full opacity keeps
   * the opaque form.
   */
  allowAlpha?: boolean;
  /**
   * Preset swatches: plain color strings (the original flat shape) or
   * structured entries — labeled solid groups `{ label?, colors }` and
   * single gradients `{ label?, gradient }` rendered as preview bars
   * of the actual gradient. Clicking any entry applies it (gradient
   * entries emit their canonical `linear-gradient()` string).
   */
  presets?: ColorPickerPreset[];
  /**
   * Tracks recently used colors (last 10, newest first) as internal
   * state: every committed pick — drag release, swatch click, arrow
   * key, text commit — moves its color to the front, deduplicated.
   * Gradient values are not colors and never enter the list.
   */
  recent?: boolean;
  /**
   * Enables gradient editing: the panel gains a Solid/Gradient toggle
   * and, while the value is a `linear-gradient()` string, an angle
   * field plus a stop list (add/remove stops, per-stop color through
   * the SV/hue rails and the text field, position 0..100). The mode is
   * value-derived, and switching modes applies the default of the
   * target mode rather than remembering the departed mode's value:
   * solid → gradient opens the current color into
   * `linear-gradient(90deg, <color> 0%, #ffffff 100%)`; gradient →
   * solid takes the first stop's color. Gradient values still paint
   * the trigger and submit through `name` when this prop is off — only
   * the editor is gated.
   */
  gradient?: boolean;
  className?: string;
  /**
   * Form field name: renders a hidden input bridge next to the control
   * so `<form action={fn}>` / `new FormData(form)` receive the value —
   * serialized in `format` exactly like the panel's text field and
   * `onChange` emissions (`formatColor(parseColor(value), format,
   * allowAlpha)`), or the canonical gradient string when the value is
   * a gradient, so what submits always matches what the picker
   * shows. react-f0rm `FormItem` usage never passes it, so both worlds
   * coexist.
   */
  name?: string;
  /**
   * Accessible name of the trigger (floating mode) and the panel;
   * defaults to the locale's "Pick color". Set it whenever more than
   * one picker is on a page.
   */
  'aria-label'?: string;
  /**
   * Floating mode: the trigger swatch button. Inline mode: the panel
   * card div — the elements `ref.current.focus()` reaches.
   */
  ref?: Ref<HTMLButtonElement | HTMLDivElement>;
};

/** Recent colors are capped (AntD-aligned); newest first. */
const RECENT_LIMIT = 10;

const container = css`
  position: relative;
  display: inline-flex;
`;

export default function ColorPicker({
  value: valueControl,
  onChange,
  open: openControl,
  inline = false,
  format = 'hex',
  allowAlpha = false,
  presets,
  recent = false,
  gradient = false,
  className,
  name,
  'aria-label': ariaLabel,
  ref,
}: ColorPickerProps) {
  const strings = useStrings('colorPicker');
  const [value, setValue] = useControl(valueControl, '#000000');
  const [open, setOpen] = useControl(openControl, false);

  const label = ariaLabel ?? strings.pickColor;
  const display = parseColor(value)?.rgb ?? {r: 0, g: 0, b: 0};

  // Gradient values paint the trigger and submit verbatim (their
  // canonical serialization — what the panel shows is what submits);
  // everything else keeps the solid path.
  const gradientValue = parseGradient(value);
  const gradientCss = gradientValue ? serializeGradient(gradientValue) : null;

  // Form-bridge serialization: the same format-aware form the panel's
  // text field shows and onChange emits — what submits is what the
  // picker displays, never the raw incoming format.
  const nativeValue = gradientCss ?? formatColor(display, format, allowAlpha);

  const handleChange = useCallback(
    (next: string) => {
      setValue(next);
      onChange?.(next);
    },
    [setValue, onChange]
  );

  // Recent colors: internal-only UI state (never a controlled prop) —
  // commits unshift, dedupe by canonical RGBA, cap at RECENT_LIMIT.
  // Gradient commits are not colors and pass through untouched.
  const [recentColors, setRecentColors] = useState<string[]>([]);
  const handleCommit = useCallback(
    (color: string) => {
      if (!recent) return;
      const parsed = parseColor(color);
      if (!parsed) return;
      const key = rgbHexKey(parsed.rgb);
      setRecentColors((prev) => [
        color,
        ...prev.filter((c) => {
          const p = parseColor(c);
          return p === null || rgbHexKey(p.rgb) !== key;
        }),
      ].slice(0, RECENT_LIMIT));
    },
    [recent]
  );

  const panel = (
    <ColorPickerPanel
      value={value}
      onChange={handleChange}
      onCommit={handleCommit}
      format={format}
      allowAlpha={allowAlpha}
      presets={presets}
      gradient={gradient}
      recentColors={recent ? recentColors : undefined}
    />
  );

  // Inline mode: the panel card is the root; no trigger, no floating
  // layer. Hooks above still run — the floating behavior idles closed.
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  // Stable identity (Datepicker precedent): the floating behavior anchors
  // on this trigger (outside-close boundary); the consumer's ref rides
  // the same node.
  const setTriggerRef = useCallback(
    (node: HTMLButtonElement | null) =>
      mergeRefs(triggerRef, ref as Ref<HTMLButtonElement> | undefined)(node),
    [ref]
  );
  const id = useId();
  const floating = useFloating({
    open,
    setOpen,
    triggerRef,
    panelRef,
    animated: true,
  });

  // Keyboard reach: opening the panel moves focus onto the SV surface
  // (the first slider), so arrows adjust color immediately. Gated on
  // `shown` — focusing before the popover is visible is silently
  // dropped (see FloatingBehavior.shown).
  useEffect(() => {
    if (!floating.shown) return;
    panelRef.current
      ?.querySelector<HTMLElement>("[role='slider']")
      ?.focus();
  }, [floating.shown]);

  if (inline) {
    return (
      <div ref={ref as Ref<HTMLDivElement> | undefined} data-slot='color-picker' x-class={[panelVisuals, className]}>
        {panel}
        <NativeHiddenFields name={name} values={[nativeValue]} />
      </div>
    );
  }

  return (
    <span data-slot='color-picker' className={container}>
      <button
        ref={setTriggerRef}
        type='button'
        data-slot='trigger'
        x-class={[trigger, checkerboard]}
        style={floating.triggerStyle}
        aria-label={label}
        aria-haspopup='dialog'
        aria-expanded={open}
        aria-controls={id}
        onPointerDown={floating.onTriggerPointerDown}
        onClick={floating.onTriggerClick}
      >
        <span data-slot='swatch' x-class={[swatchFill]} style={{background: gradientCss ?? cssColor(display)}} />
      </button>
      <FloatingPanel
        ref={panelRef}
        behavior={floating}
        placement='bottom'
        id={id}
        role='dialog'
        aria-label={label}
        visualClass={panelVisuals}
        className={className}
      >
        {panel}
      </FloatingPanel>
      <NativeHiddenFields name={name} values={[nativeValue]} />
    </span>
  );
}

export type { ColorPickerProps };
