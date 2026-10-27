import type {
  ComponentPropsWithoutRef,
  CSSProperties,
  KeyboardEvent as ReactKeyboardEvent,
  PointerEvent as ReactPointerEvent,
  Ref,
} from 'react';
import type { ControlOrValue } from 'react-use-control';
import type { CropCorner, CropRect, NaturalSize } from './image-crop-geometry';

import { useCallback, useEffect, useId, useImperativeHandle, useRef, useState } from 'react';
import { css } from '@linaria/core';
import { useControl } from 'react-use-control';

import {
  defaultRect,
  KEYBOARD_STEP,
  moveRect,
  normalizeRect,
  pointerToNormalized,
  resizeFromAnchor,
  resizeRect,
} from './image-crop-geometry';

/**
 * Interactive image cropper — the avatar/photo companion to Upload.
 *
 * The source image is painted onto a `<canvas>` sized to its natural
 * pixels (max detail; CSS scales it down), and the crop box is a DOM
 * overlay positioned in percentages of the same box, so `value` needs no
 * pixel measurement to render. `value` is the crop rectangle normalized
 * to the image (every field 0..1) and fully controllable; every commit
 * path (drag, handle resize, keyboard) runs through the same clamp
 * pipeline, so an illegal rect can never display.
 *
 * Keyboard (the part competitors skip): the crop box is focusable and
 * labeled. Arrow keys move it (1% of the image per press), Shift + arrow
 * keys resize it — the Resizable handle's pointer-free contract in
 * normalized space. A `visually-hidden` description announces the live
 * geometry so screen readers track drags too.
 *
 * `ref.getCroppedCanvas()` rasterizes the current crop into a fresh
 * `HTMLCanvasElement` (`null` when the image has not loaded or the 2d
 * context is unavailable — jsdom without a mock). When the 2d context is
 * unavailable the whole cropper degrades to a notice (Signature
 * precedent): without paint there is no image to crop.
 */
type ImageCropProps = {
  /** Image source URL. */
  src: string;
  /** Accessible name of the rendered image (carried by the canvas). */
  alt: string;
  /** Crop rectangle normalized to the image (every field 0..1); a
   * Control receives every commit live, a plain object seeds it. */
  value?: ControlOrValue<CropRect>;
  /** Fires with the new normalized rect on every pointer frame and
   * keyboard step. */
  onChange?: (rect: CropRect) => void;
  /** Locks the crop's pixel-space aspect ratio (width / height, e.g. `1`
   * for avatars). Height derives from width; a rect that cannot fit
   * refits from its height budget. */
  aspect?: number;
  /** Overlay mask of the crop box: rectangular frame or a full-radius
   * circle for avatars (pair with `aspect={1}` for a true circle). */
  shape?: 'rect' | 'circle';
  /** Accessible label of the focusable crop region. */
  cropLabel?: string;
  /** Notice rendered when the canvas 2d context is unavailable. */
  unsupportedLabel?: string;
  /** Notice rendered when `src` fails to load. */
  errorLabel?: string;
  /** Locks dragging, handle resizing and keyboard operation. */
  disabled?: boolean;
  /** Passed to the loader `<img>`; `anonymous` is required for
   * CORS-clean hosts or `getCroppedCanvas` output stays tainted. */
  crossOrigin?: 'anonymous' | 'use-credentials';
  className?: string;
  ref?: Ref<ImageCropHandle>;
} & Omit<ComponentPropsWithoutRef<'div'>, 'onChange'>;

/** Imperative surface exposed through the component `ref`. */
type ImageCropHandle = {
  /** Fresh canvas holding the current crop at native pixel resolution,
   * or `null` when the image has not loaded / 2d context is missing. */
  getCroppedCanvas: () => HTMLCanvasElement | null;
};

/** In-flight pointer gesture: box move or one corner handle resizing. */
type DragState = {
  pointerId: number;
  mode: 'move' | CropCorner;
  start: CropRect;
  origin: { x: number; y: number };
};

const CORNERS: readonly CropCorner[] = ['nw', 'ne', 'sw', 'se'];

const root = css`
  display: block;
  max-width: 100%;
  font-family: var(--haze-font-sans);
`;

/* The loader stays in the layout (display: none would still load, but
   keeping it in-tree gives the paint effect a stable element handle). */
const sourceClass = css`
  display: none;
`;

const frame = css`
  position: relative;
  overflow: hidden;
  border-radius: var(--haze-radius-md);
  background: var(--haze-color-bg-muted);
  user-select: none;
`;

const canvasClass = css`
  display: block;
  width: 100%;
  height: auto;
`;

const loading = css`
  box-sizing: border-box;
  width: 100%;
  aspect-ratio: 4 / 3;
  border-radius: var(--haze-radius-md);
  background: var(--haze-color-bg-subtle);
`;

/* The 9999px box-shadow dims everything outside the crop without extra
   DOM (the Tour spotlight technique); overflow: hidden on the frame
   keeps the flood inside the image. */
const cropBox = css`
  position: absolute;
  box-sizing: border-box;
  border: 1px solid var(--haze-color-primary);
  border-radius: var(--haze-radius-sm);
  box-shadow: 0 0 0 9999px var(--haze-color-scrim);
  cursor: move;
  touch-action: none;

  &:focus-visible {
    outline: none;
    box-shadow:
      0 0 0 9999px var(--haze-color-scrim),
      inset 0 0 0 var(--haze-space-1) var(--haze-color-focus-ring);
  }

  &[aria-disabled='true'] {
    cursor: not-allowed;
  }

  @media (forced-colors: active) {
    border-color: Highlight;
    box-shadow: none;

    &:focus-visible {
      box-shadow: inset 0 0 0 var(--haze-space-1) Highlight;
    }
  }
`;

const cropCircle = css`
  border-radius: var(--haze-radius-full);
`;

/* 24px hit targets (WCAG 2.5.8) carrying an 8px painted knob — the
   Resizable handle's strip technique in two axes. */
const handleBase = css`
  position: absolute;
  width: var(--haze-space-6);
  height: var(--haze-space-6);
  touch-action: none;

  &::before {
    content: '';
    position: absolute;
    inset: calc((var(--haze-space-6) - var(--haze-space-2)) / 2);
    box-sizing: border-box;
    border: 1px solid var(--haze-color-primary);
    border-radius: var(--haze-radius-sm);
    background: var(--haze-color-bg);
  }

  @media (forced-colors: active) {
    &::before {
      border-color: CanvasText;
      background: CanvasText;
    }
  }
`;

const handlePositions: Record<CropCorner, string> = {
  nw: css`
    top: calc(var(--haze-space-6) / -2);
    left: calc(var(--haze-space-6) / -2);
    cursor: nw-resize;
  `,
  ne: css`
    top: calc(var(--haze-space-6) / -2);
    right: calc(var(--haze-space-6) / -2);
    cursor: ne-resize;
  `,
  sw: css`
    bottom: calc(var(--haze-space-6) / -2);
    left: calc(var(--haze-space-6) / -2);
    cursor: sw-resize;
  `,
  se: css`
    bottom: calc(var(--haze-space-6) / -2);
    right: calc(var(--haze-space-6) / -2);
    cursor: se-resize;
  `,
};

const notice = css`
  display: flex;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
  width: 100%;
  aspect-ratio: 4 / 3;
  border: 1px dashed var(--haze-color-border);
  border-radius: var(--haze-radius-md);
  color: var(--haze-color-text-muted);
  font-size: var(--haze-text-sm);
`;

const srOnly = css`
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip-path: inset(50%);
  white-space: nowrap;
`;

/** Inline percentage free of binary-float noise (0.1 · 100 must render
 * as `10%`, not `10.000000000000002%`). */
const percent = (value: number): string => `${Math.round(value * 10000) / 100}%`;

export default function ImageCrop({
  src,
  alt,
  value: valueControl,
  onChange,
  aspect,
  shape = 'rect',
  cropLabel = 'Crop region',
  unsupportedLabel = 'Image cropping is not supported in this browser.',
  errorLabel = 'Failed to load the image.',
  disabled = false,
  crossOrigin,
  className,
  ref,
  ...rest
}: ImageCropProps) {
  const [stored, setStored] = useControl<CropRect | undefined>(
    valueControl,
    undefined
  );
  const [natural, setNatural] = useState<NaturalSize | null>(null);
  const [failed, setFailed] = useState(false);
  // false until the 2d context probe says otherwise — the cropper renders
  // meanwhile (skeleton), so no degraded-message flash pre-effect.
  const [unsupported, setUnsupported] = useState(false);

  const imgRef = useRef<HTMLImageElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const frameRef = useRef<HTMLDivElement | null>(null);
  const dragRef = useRef<DragState | null>(null);

  const descriptionId = useId();

  // A new src restarts the lifecycle: skeleton until the new image loads.
  useEffect(() => {
    setNatural(null);
    setFailed(false);
  }, [src]);

  const rect: CropRect | undefined =
    natural === null
      ? undefined
      : normalizeRect(stored ?? defaultRect(aspect, natural), aspect, natural);

  // getCroppedCanvas reads the latest committed rect through this ref —
  // a callback captured mid-render would see a stale closure instead.
  const rectRef = useRef<CropRect | undefined>(undefined);
  useEffect(() => {
    rectRef.current = rect;
  }, [rect]);

  /** Publish a rect: control state + change callback, one path. A
   * gesture step that clamps back onto the current rect (saturated
   * growth, edge-pinned drags) is a no-op, not a redundant commit. */
  const commit = useCallback(
    (next: CropRect) => {
      // the first comparison proves rect non-null (next.x is a number,
      // undefined never equals it) — the rest narrow to plain access
      if (
        rect?.x === next.x &&
        rect.y === next.y &&
        rect.width === next.width &&
        rect.height === next.height
      ) {
        return;
      }
      setStored(next);
      onChange?.(next);
    },
    [rect, setStored, onChange]
  );

  // Canvas paint: backing store at natural size (the image's own pixels
  // are the ceiling of crop detail), 2d probe, then the single draw.
  useEffect(() => {
    if (natural === null) return;
    const canvas = canvasRef.current;
    const img = imgRef.current;
    if (canvas === null || img === null) return;
    canvas.width = natural.width;
    canvas.height = natural.height;
    const ctx = canvas.getContext('2d');
    setUnsupported(ctx === null);
    if (ctx === null) return;
    ctx.drawImage(img, 0, 0, natural.width, natural.height);
  }, [natural]);

  const handleLoad = () => {
    const img = imgRef.current;
    if (img === null) return;
    const size = { width: img.naturalWidth, height: img.naturalHeight };
    // naturalWidth 0 means the browser could not decode intrinsic size
    // (broken data URL, sizeless SVG) — same story as a network error.
    if (size.width === 0 || size.height === 0) {
      setFailed(true);
      return;
    }
    setNatural(size);
    setFailed(false);
  };

  const handleError = () => setFailed(true);

  // ── keyboard: move with arrows, resize with Shift+arrows ──────────
  const handleKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    if (disabled || rect === undefined || natural === null) return;
    const { key, shiftKey } = event;
    const dx =
      key === 'ArrowRight' ? KEYBOARD_STEP : key === 'ArrowLeft' ? -KEYBOARD_STEP : 0;
    const dy =
      key === 'ArrowDown' ? KEYBOARD_STEP : key === 'ArrowUp' ? -KEYBOARD_STEP : 0;
    if (dx === 0 && dy === 0) return;
    event.preventDefault();
    commit(
      shiftKey
        ? resizeRect(rect, dx, dy, aspect, natural)
        : moveRect(rect, dx, dy)
    );
  };

  // ── pointer: box drags translate, corner handles resize ───────────
  const beginDrag = (
    event: ReactPointerEvent<HTMLElement>,
    mode: DragState['mode']
  ) => {
    if (disabled || rect === undefined) return;
    if (event.button !== 0) return;
    const frameBox = frameRef.current?.getBoundingClientRect();
    if (frameBox === undefined) return;
    event.preventDefault();
    // a handle pointerdown must not also start a box move when it
    // bubbles to the crop box.
    event.stopPropagation();
    dragRef.current = {
      pointerId: event.pointerId,
      mode,
      start: rect,
      origin: pointerToNormalized(event.clientX, event.clientY, frameBox),
    };
    const el = event.currentTarget;
    if (typeof el.setPointerCapture === 'function') {
      try {
        el.setPointerCapture(event.pointerId);
      } catch {
        // pointer already released — the gesture still tracks
      }
    }
  };

  const moveDrag = (event: ReactPointerEvent<HTMLElement>) => {
    const drag = dragRef.current;
    if (drag?.pointerId !== event.pointerId) return;
    if (natural === null) return;
    const frameBox = frameRef.current?.getBoundingClientRect();
    if (frameBox === undefined) return;
    const pointer = pointerToNormalized(
      event.clientX,
      event.clientY,
      frameBox
    );
    commit(
      drag.mode === 'move'
        ? moveRect(drag.start, pointer.x - drag.origin.x, pointer.y - drag.origin.y)
        : resizeFromAnchor(drag.start, drag.mode, pointer, aspect, natural)
    );
  };

  const endDrag = (event: ReactPointerEvent<HTMLElement>) => {
    const drag = dragRef.current;
    if (drag?.pointerId !== event.pointerId) return;
    dragRef.current = null;
    const el = event.currentTarget;
    if (typeof el.releasePointerCapture === 'function') {
      try {
        el.releasePointerCapture(event.pointerId);
      } catch {
        // capture already gone
      }
    }
  };

  /** A handle's captured move/up events bubble to the crop box; the box
   * handlers only own gestures that started (and target) the box. */
  const ownEvent = (
    event: ReactPointerEvent<HTMLDivElement>
  ): boolean => event.target === event.currentTarget;

  // ── imperative crop output ─────────────────────────────────────────
  const getCroppedCanvas = useCallback((): HTMLCanvasElement | null => {
    const img = imgRef.current;
    if (img === null || natural === null) return null;
    const crop =
      rectRef.current ?? normalizeRect(defaultRect(aspect, natural), aspect, natural);
    const sx = crop.x * natural.width;
    const sy = crop.y * natural.height;
    const sw = crop.width * natural.width;
    const sh = crop.height * natural.height;
    const width = Math.max(1, Math.round(sw));
    const height = Math.max(1, Math.round(sh));
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (ctx === null) return null;
    ctx.drawImage(img, sx, sy, sw, sh, 0, 0, width, height);
    return canvas;
  }, [aspect, natural]);

  useImperativeHandle(ref, () => ({ getCroppedCanvas }), [getCroppedCanvas]);

  const boxStyle: CSSProperties | undefined =
    rect === undefined
      ? undefined
      : {
          left: percent(rect.x),
          top: percent(rect.y),
          width: percent(rect.width),
          height: percent(rect.height),
        };

  return (
    <div data-slot="image-crop" x-class={[root, className]} {...rest}>
      <img
        ref={imgRef}
        data-slot="source"
        x-class={[sourceClass]}
        src={src}
        alt=""
        aria-hidden="true"
        draggable={false}
        crossOrigin={crossOrigin}
        onLoad={handleLoad}
        onError={handleError}
      />
      {failed ? (
        <div data-slot="error-notice" role="status" x-class={[notice]}>
          {errorLabel}
        </div>
      ) : unsupported ? (
        <div data-slot="unsupported-notice" role="status" x-class={[notice]}>
          {unsupportedLabel}
        </div>
      ) : natural === null ? (
        <div data-slot="loading" aria-hidden="true" x-class={[loading]} />
      ) : (
        <div ref={frameRef} data-slot="crop-frame" x-class={[frame]}>
          <canvas
            ref={canvasRef}
            data-slot="canvas"
            x-class={[canvasClass]}
            role="img"
            aria-label={alt}
          />
          <div
            data-slot="crop-box"
            data-shape={shape}
            x-class={[cropBox, shape === 'circle' && cropCircle]}
            role="group"
            aria-label={cropLabel}
            aria-describedby={descriptionId}
            aria-disabled={disabled || undefined}
            tabIndex={disabled ? -1 : 0}
            style={boxStyle}
            onKeyDown={handleKeyDown}
            onPointerDown={(event) => beginDrag(event, 'move')}
            onPointerMove={(event) => {
              if (ownEvent(event)) moveDrag(event);
            }}
            onPointerUp={(event) => {
              if (ownEvent(event)) endDrag(event);
            }}
            onPointerCancel={(event) => {
              if (ownEvent(event)) endDrag(event);
            }}
          >
            {CORNERS.map((corner) => (
              <span
                key={corner}
                data-slot="crop-handle"
                data-corner={corner}
                aria-hidden="true"
                x-class={[handleBase, handlePositions[corner]]}
                onPointerDown={(event) => beginDrag(event, corner)}
                onPointerMove={moveDrag}
                onPointerUp={endDrag}
                onPointerCancel={endDrag}
              />
            ))}
          </div>
          <span data-slot="crop-description" id={descriptionId} x-class={[srOnly]}>
            {rect === undefined
              ? ''
              : `Crop starts ${Math.round(rect.x * 100)}% from the left and ${Math.round(
                  rect.y * 100
                )}% from the top, covering ${Math.round(
                  rect.width * 100
                )}% of the width and ${Math.round(
                  rect.height * 100
                )}% of the height. Arrow keys move the crop. Shift and arrow keys resize it.`}
          </span>
        </div>
      )}
    </div>
  );
}

export type { ImageCropProps, ImageCropHandle };
export type { CropRect } from './image-crop-geometry';
