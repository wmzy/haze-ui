/**
 * Pure geometry for ImageCrop — every exported helper works in normalized
 * space (0..1 relative to the image's own pixel box) so pointer, keyboard
 * and aspect math share one clamp story. Unit tests exercise these
 * directly (the signature-points precedent).
 */

// clamp comes from utils/math; its inverted-range rule (max < min → the
// max wins) is the semantics the anchor paths rely on — an anchor with
// no room floors to its own space.
import { clamp } from '../../utils/math';

/** Normalized crop rectangle: top-left corner (x, y) and size, every
 * field 0..1 relative to the image's own pixel box. */
export type CropRect = {
  x: number;
  y: number;
  width: number;
  height: number;
};

/** Natural pixel size of the loaded source image. */
export type NaturalSize = { width: number; height: number };

/** Corner handles of the crop box. */
export type CropCorner = 'nw' | 'ne' | 'sw' | 'se';

/** Size floor for the crop box on both axes — a box smaller than this is
 * no longer grabbable and crops to a degenerate image. */
export const MIN_CROP = 0.05;

/** Keyboard step for arrow keys: 1% of the image per press (the Resizable
 * handle's fully-pointer-free contract, scaled to normalized space). */
export const KEYBOARD_STEP = 0.01;

/** Round to 6 decimals so committed rects stay JSON-clean (binary float
 * noise like 0.30000000000000004 never escapes the component). */
const quantize = (value: number): number => Math.round(value * 1e6) / 1e6;

const isLocked = (aspect: number | undefined): aspect is number =>
  aspect !== undefined && aspect > 0;

/** Normalized height per unit normalized width for a pixel-space aspect
 * ratio on a natural image: pixel aspect A = (w·W) / (h·H), so
 * h = w · W / (A·H). A square crop (A = 1) of a 640×360 image therefore
 * spans 640/360 ≈ 1.78× more of the image's height than its width. */
const aspectFactor = (aspect: number, natural: NaturalSize): number =>
  natural.width / (aspect * natural.height);

/** Fit a rect to a locked pixel-space aspect ratio. Width drives; when
 * the derived height overflows the unit square the height clamps to 1
 * and the width re-derives from it. Position keeps x/y, clamped so the
 * box stays inside the image. */
export function fitAspect(
  rect: CropRect,
  aspect: number,
  natural: NaturalSize
): CropRect {
  const factor = aspectFactor(aspect, natural);
  const width = clamp(rect.width, MIN_CROP, 1);
  let height = width * factor;
  let fittedWidth = width;
  if (height > 1) {
    height = 1;
    fittedWidth = clamp(1 / factor, MIN_CROP, 1);
  }
  return {
    x: quantize(clamp(rect.x, 0, 1 - fittedWidth)),
    y: quantize(clamp(rect.y, 0, 1 - height)),
    width: quantize(fittedWidth),
    height: quantize(height),
  };
}

/** Clamp any rect into a legal crop: sizes into [MIN_CROP, 1] — with an
 * aspect refit when the ratio is locked — and the position so the box
 * stays inside the unit square. Display and every commit path run
 * through this, so a stale or consumer-supplied value can never paint an
 * illegal box. */
export function normalizeRect(
  rect: CropRect,
  aspect: number | undefined,
  natural: NaturalSize
): CropRect {
  if (isLocked(aspect)) return fitAspect(rect, aspect, natural);
  const width = clamp(rect.width, MIN_CROP, 1);
  const height = clamp(rect.height, MIN_CROP, 1);
  return {
    x: quantize(clamp(rect.x, 0, 1 - width)),
    y: quantize(clamp(rect.y, 0, 1 - height)),
    width: quantize(width),
    height: quantize(height),
  };
}

/** Centered default crop covering 80% of the image (aspect-refit first —
 * a square crop of a wide image saturates height before width, then the
 * smaller box recenters). */
export function defaultRect(
  aspect: number | undefined,
  natural: NaturalSize
): CropRect {
  const fitted = normalizeRect(
    { x: 0.1, y: 0.1, width: 0.8, height: 0.8 },
    aspect,
    natural
  );
  return {
    x: quantize((1 - fitted.width) / 2),
    y: quantize((1 - fitted.height) / 2),
    width: fitted.width,
    height: fitted.height,
  };
}

/** Translate by (dx, dy) — position clamps inside the image, size is
 * frozen (the keyboard move contract). */
export function moveRect(rect: CropRect, dx: number, dy: number): CropRect {
  return {
    x: quantize(clamp(rect.x + dx, 0, 1 - rect.width)),
    y: quantize(clamp(rect.y + dy, 0, 1 - rect.height)),
    width: rect.width,
    height: rect.height,
  };
}

/** Keyboard resize anchored at the top-left corner: dw/dh grow the box
 * towards the right/bottom. With a locked aspect both axes drive the
 * shared width (dh is translated through the aspect factor), so all four
 * Shift+arrow keys stay functional. */
export function resizeRect(
  rect: CropRect,
  dw: number,
  dh: number,
  aspect: number | undefined,
  natural: NaturalSize
): CropRect {
  if (isLocked(aspect)) {
    const factor = aspectFactor(aspect, natural);
    const width = clamp(rect.width + dw + dh / factor, MIN_CROP, 1);
    return fitAspect({ ...rect, width }, aspect, natural);
  }
  const width = clamp(rect.width + dw, MIN_CROP, 1);
  const height = clamp(rect.height + dh, MIN_CROP, 1);
  return {
    x: quantize(clamp(rect.x, 0, 1 - width)),
    y: quantize(clamp(rect.y, 0, 1 - height)),
    width: quantize(width),
    height: quantize(height),
  };
}

/** Corner-handle resize: the opposite corner stays anchored and the
 * dragged corner follows the normalized pointer. Dragging across the
 * anchor floors at MIN_CROP instead of inverting; a locked aspect fits
 * width-first, clamped to the space the anchor leaves. */
export function resizeFromAnchor(
  start: CropRect,
  corner: CropCorner,
  pointer: { x: number; y: number },
  aspect: number | undefined,
  natural: NaturalSize
): CropRect {
  const anchorLeft =
    corner === 'nw' || corner === 'sw' ? start.x + start.width : start.x;
  const anchorTop =
    corner === 'nw' || corner === 'ne' ? start.y + start.height : start.y;
  const maxWidth =
    corner === 'nw' || corner === 'sw' ? anchorLeft : 1 - anchorLeft;
  const maxHeight =
    corner === 'nw' || corner === 'ne' ? anchorTop : 1 - anchorTop;

  let width = clamp(
    Math.abs(pointer.x - anchorLeft),
    Math.min(MIN_CROP, maxWidth),
    maxWidth
  );
  let height = clamp(
    Math.abs(pointer.y - anchorTop),
    Math.min(MIN_CROP, maxHeight),
    maxHeight
  );

  if (isLocked(aspect)) {
    const factor = aspectFactor(aspect, natural);
    height = width * factor;
    if (height > maxHeight) {
      height = maxHeight;
      width = clamp(
        height / factor,
        Math.min(MIN_CROP, maxWidth),
        maxWidth
      );
    }
  }
  return {
    x: quantize(corner === 'nw' || corner === 'sw' ? anchorLeft - width : anchorLeft),
    y: quantize(corner === 'nw' || corner === 'ne' ? anchorTop - height : anchorTop),
    width: quantize(width),
    height: quantize(height),
  };
}

/** Frame-relative normalized pointer position from client coordinates.
 * The width/height guards keep a zero-sized rect (jsdom, not-yet-laid-out
 * frames) from producing NaN instead of merely useless numbers. */
export function pointerToNormalized(
  clientX: number,
  clientY: number,
  frame: DOMRect
): { x: number; y: number } {
  return {
    x: (clientX - frame.left) / Math.max(frame.width, 1),
    y: (clientY - frame.top) / Math.max(frame.height, 1),
  };
}
