/**
 * Shared Linaria classes for the ColorPicker family (trigger swatch,
 * floating/inline panel). A sibling file because both `ColorPicker.tsx`
 * and `ColorPickerPanel.tsx` consume them — component files must keep
 * exporting only components (react-refresh/only-export-components).
 *
 * Named with the `color-picker-` prefix so the Linaria class slug
 * (`haze-color-picker-styles__*`) stays unique to this family.
 */
import { css } from '@linaria/core';

/**
 * Card deltas on the shared panel surface (utils/panel-skin.ts): the
 * AntD-aligned 240px picker width (a component dimension, like
 * Popover's `min-width` floor, not a themeable value) and the padding
 * step. The local skin this replaces had drifted out of the surface
 * recipe's forced-colors border arm — the shared surface restores it.
 */
export const panelDeltas = css`
  width: 240px;
  padding: var(--haze-space-3);
`;

/** Content column inside the card (also the inline-mode root). */
export const panelContent = css`
  display: flex;
  flex-direction: column;
  gap: var(--haze-space-3);
`;

/**
 * Saturation/value surface: a dynamic two-layer gradient painted through
 * inline style (hue base + white/black overlays); this class carries the
 * interaction chrome. Pointer-dragged (`touch-action: none` keeps
 * touch drags from scrolling the page). The keyboard focus ring
 * (utils/focus-ring) composes at the call site; the base outline reset
 * stays because programmatic focus is not :focus-visible.
 */
export const svArea = css`
  position: relative;
  height: 164px;
  border-radius: var(--haze-radius-md);
  outline: none;
  cursor: crosshair;
  touch-action: none;
`;

/**
 * Thumb ring over the SV surface. The white border + dark halo is a
 * functional exception to the token rule — the thumb must read over
 * EVERY color, bright or dark, in both themes (same class of exception
 * as the hue spectrum below).
 */
export const svThumb = css`
  position: absolute;
  width: var(--haze-space-3);
  height: var(--haze-space-3);
  border: 2px solid #fff;
  border-radius: var(--haze-radius-full);
  box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.3);
  transform: translate(-50%, -50%);
  pointer-events: none;
`;

/** Shared shape of the hue/alpha rails. The keyboard focus ring
 * (utils/focus-ring) composes at the call site; the base outline reset
 * stays because programmatic focus is not :focus-visible. */
export const track = css`
  position: relative;
  height: var(--haze-space-3);
  border-radius: var(--haze-radius-full);
  outline: none;
  cursor: pointer;
  touch-action: none;
`;

/**
 * The full hue spectrum. Functional color values by definition (the
 * component's subject matter, like a preset swatch), not theme
 * decoration — no token exists for "red through violet".
 */
export const hueTrack = css`
  background: linear-gradient(
    to right,
    hsl(0, 100%, 50%),
    hsl(60, 100%, 50%),
    hsl(120, 100%, 50%),
    hsl(180, 100%, 50%),
    hsl(240, 100%, 50%),
    hsl(300, 100%, 50%),
    hsl(360, 100%, 50%)
  );
`;

/** Transparency underlay: theme-neutral checkerboard from tokens. */
export const checkerboard = css`
  background: repeating-conic-gradient(
      var(--haze-color-border) 0% 25%,
      var(--haze-color-bg) 0% 50%
    )
    0 0 / var(--haze-space-2) var(--haze-space-2);
`;

/** The dynamic transparent→opaque color layer of the alpha rail. */
export const trackFill = css`
  position: absolute;
  inset: 0;
  border-radius: inherit;
`;

/** Thumb on the hue/alpha rails (svThumb's ring recipe, rail-sized). */
export const trackThumb = css`
  position: absolute;
  top: 50%;
  width: var(--haze-space-3);
  height: var(--haze-space-3);
  border: 2px solid #fff;
  border-radius: var(--haze-radius-full);
  box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.3);
  transform: translate(-50%, -50%);
  pointer-events: none;
`;

/** Format-aware color code input (Core's text input recipe). */
export const valueInput = css`
  width: 100%;
  height: var(--haze-space-8);
  padding: 0 var(--haze-space-2);
  border: 1px solid var(--haze-color-border);
  border-radius: var(--haze-radius-md);
  background: var(--haze-color-bg);
  color: var(--haze-color-text);
  font-family: var(--haze-font-mono);
  font-size: var(--haze-text-sm);
  outline: none;
  transition: border-color var(--haze-duration-fast), box-shadow var(--haze-duration-fast);
  box-sizing: border-box;

  &:focus {
    border-color: var(--haze-color-primary);
    box-shadow: 0 0 0 3px var(--haze-color-focus-ring);
  }
`;

/** Heading over a swatch row (presets / recent colors). */
export const groupLabel = css`
  font-size: var(--haze-text-xs);
  color: var(--haze-color-text-muted);
`;

export const swatchRow = css`
  display: flex;
  flex-wrap: wrap;
  gap: var(--haze-space-2);
`;

/**
 * One swatch: a checkerboard base (so translucent fills read) with the
 * paint on an inset child layer.
 */
export const swatchBtn = css`
  position: relative;
  width: var(--haze-space-5);
  height: var(--haze-space-5);
  padding: 0;
  border: none;
  border-radius: var(--haze-radius-sm);
  overflow: hidden;
  cursor: pointer;
  transition: transform var(--haze-duration-fast);

  &:hover {
    transform: scale(1.12);
  }
`;

export const swatchFill = css`
  position: absolute;
  inset: 0;
`;

export const swatchActive = css`
  box-shadow: 0 0 0 2px var(--haze-color-bg), 0 0 0 4px var(--haze-color-primary);
`;

// ---------------------------------------------------------------------------
// Gradient mode
// ---------------------------------------------------------------------------

/** Solid/Gradient segmented toggle riding on top of the panel. */
export const modeToggle = css`
  display: flex;
  gap: var(--haze-space-1);
  padding: var(--haze-space-1);
  border: 1px solid var(--haze-color-border);
  border-radius: var(--haze-radius-md);
  background: var(--haze-color-bg-muted);
`;

/** One segment of the mode toggle; the pressed state paints it active. */
export const modeBtn = css`
  flex: 1;
  height: var(--haze-space-6);
  padding: 0;
  border: none;
  border-radius: var(--haze-radius-sm);
  background: transparent;
  color: var(--haze-color-text-secondary);
  font-family: var(--haze-font-sans);
  font-size: var(--haze-text-xs);
  font-weight: var(--haze-weight-medium);
  cursor: pointer;
  transition: background var(--haze-duration-fast), color var(--haze-duration-fast);

  &[aria-pressed='true'] {
    background: var(--haze-color-bg);
    color: var(--haze-color-text);
    box-shadow: var(--haze-shadow-sm);
  }
`;

/** Live preview bar painted (inline style) with the current gradient. */
export const gradientPreview = css`
  height: var(--haze-space-6);
  border: 1px solid var(--haze-color-border);
  border-radius: var(--haze-radius-md);
`;

/** Angle row: a labelled compact number input (0..360 degrees). */
export const angleRow = css`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--haze-space-2);
  font-size: var(--haze-text-xs);
  color: var(--haze-color-text-secondary);
`;

/** Compact mono number input (angle, stop positions). */
export const numberInput = css`
  width: var(--haze-space-12);
  height: var(--haze-space-6);
  padding: 0 var(--haze-space-1);
  border: 1px solid var(--haze-color-border);
  border-radius: var(--haze-radius-md);
  background: var(--haze-color-bg);
  color: var(--haze-color-text);
  font-family: var(--haze-font-mono);
  font-size: var(--haze-text-xs);
  outline: none;
  box-sizing: border-box;

  &:focus {
    border-color: var(--haze-color-primary);
    box-shadow: 0 0 0 3px var(--haze-color-focus-ring);
  }
`;

/** Column of stop rows (one line per gradient stop). */
export const stopsList = css`
  display: flex;
  flex-direction: column;
  gap: var(--haze-space-1);
`;

/** One stop line: select swatch, position input, remove button. */
export const stopRow = css`
  display: flex;
  align-items: center;
  gap: var(--haze-space-1);
`;

/** The stop's select swatch — smaller than a preset, ringed when selected. */
export const stopSwatchBtn = css`
  position: relative;
  width: var(--haze-space-5);
  height: var(--haze-space-5);
  padding: 0;
  border: none;
  border-radius: var(--haze-radius-sm);
  overflow: hidden;
  cursor: pointer;
`;

/** Selected stop: the primary ring marks which stop the rails edit. */
export const stopSwatchActive = css`
  box-shadow: 0 0 0 2px var(--haze-color-bg), 0 0 0 4px var(--haze-color-primary);
`;

/** Stop remover; disabled at the two-stop floor. */
export const stopRemoveBtn = css`
  width: var(--haze-space-5);
  height: var(--haze-space-5);
  padding: 0;
  border: none;
  border-radius: var(--haze-radius-sm);
  background: transparent;
  color: var(--haze-color-text-muted);
  font-size: var(--haze-text-sm);
  line-height: 1;
  cursor: pointer;

  &:hover:not(:disabled) {
    background: var(--haze-color-bg-muted);
    color: var(--haze-color-text);
  }

  &:disabled {
    cursor: not-allowed;
    opacity: 0.4;
  }
`;

/** Full-width dashed "Add stop" affordance under the stop list. */
export const addStopBtn = css`
  height: var(--haze-space-6);
  border: 1px dashed var(--haze-color-border);
  border-radius: var(--haze-radius-md);
  background: transparent;
  color: var(--haze-color-text-secondary);
  font-family: var(--haze-font-sans);
  font-size: var(--haze-text-xs);
  cursor: pointer;

  &:hover {
    border-color: var(--haze-color-border-hover);
    color: var(--haze-color-text);
  }
`;

/**
 * A gradient preset entry: a full-width bar previewing the actual
 * gradient (painted via inline style), stacked one per row.
 */
export const gradientSwatch = css`
  display: block;
  width: 100%;
  height: var(--haze-space-6);
  padding: 0;
  border: 1px solid var(--haze-color-border);
  border-radius: var(--haze-radius-md);
  cursor: pointer;
  transition: transform var(--haze-duration-fast);

  &:hover {
    transform: scale(1.02);
  }
`;

/** The floating-mode trigger: a color swatch button. */
export const trigger = css`
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: var(--haze-space-10);
  height: var(--haze-space-8);
  padding: 0;
  border: 1px solid var(--haze-color-border);
  border-radius: var(--haze-radius-md);
  background: var(--haze-color-bg);
  cursor: pointer;
  overflow: hidden;
  transition: border-color var(--haze-duration-fast);

  &:hover {
    border-color: var(--haze-color-border-hover);
  }
`;
