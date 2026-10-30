import type {
  KeyboardEvent as ReactKeyboardEvent,
  PointerEvent as ReactPointerEvent,
} from 'react';
import type { ControlOrValue } from 'react-use-control';

import type { GalleryImage } from './ImageGalleryContext';

import { css } from '@linaria/core';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useControl } from 'react-use-control';

import { useStrings } from '../LocaleProvider/useStrings';
import { formatString } from '../LocaleProvider/locale';
import {
  ChevronLeft,
  ChevronRight,
  RotateCw,
  X,
  ZoomIn,
  ZoomOut,
} from '../../icons';
import { focusRingVisible } from '../../utils/focus-ring';
import { useNativeDialogShell } from '../../utils/native-dialog';
import { capturePointer } from '../../utils/pointer-capture';
import { quietIconButton } from '../../utils/quiet-button-skin';

/**
 * Fullscreen preview overlay for Image (`preview` prop) and for
 * ImagePreviewGroup's shared gallery. Internal part — not exported from
 * the directory barrel: it has no standalone use, every knob rides on
 * Image's `preview` config or the group's.
 *
 * Rendered as a native `<dialog>` whose lifecycle (focus scope,
 * showModal/animated close, Esc/backdrop/native-close trio) rides
 * utils/native-dialog's `useNativeDialogShell` — the same primitive as
 * Dialog.tsx — with `onShown` keeping the custom initial focus. The
 * shared `open` control comes from the parent (Image or the group) so
 * the thumbnail's click can drive it.
 */

const SCALE_MIN = 0.25;
const SCALE_MAX = 4;
const SCALE_STEP = 0.25;
const ROTATE_STEP = 90;

/** Keeps zoom inside the 25%–400% window (binary-exact at 0.25 steps). */
const clampScale = (value: number): number =>
  Math.min(SCALE_MAX, Math.max(SCALE_MIN, value));

type ImagePreviewProps = {
  src: string;
  alt: string;
  /** Shared open state — Image passes its control so both ends drive it. */
  open?: ControlOrValue<boolean>;
  /** Zoom buttons, wheel zoom and drag pan are available (default true). */
  zoom?: boolean;
  /** The rotate control is available (default true). */
  rotate?: boolean;
  /**
   * Gallery entries, handed over by ImagePreviewGroup. Two or more
   * switch the overlay into gallery mode: prev/next arrows flanking the
   * image, an `n / total` counter in the toolbar, ArrowLeft/ArrowRight
   * keys (wrap-around at both ends) and — unless `showThumbnails` is
   * false — a keyboard-focusable thumbnail strip that stays in sync
   * with the active entry.
   */
  images?: readonly GalleryImage[];
  /** Active gallery entry, shared with the group (defaults to 0). */
  index?: ControlOrValue<number>;
  /** The thumbnail strip is rendered in gallery mode (default true). */
  showThumbnails?: boolean;
};

const overlay = css`
  border: none;
  border-radius: var(--haze-radius-none);
  padding: 0;
  background: transparent;
  color: var(--haze-color-text);
  font-family: var(--haze-font-sans);
  width: 100vw;
  height: 100vh;
  max-width: 100vw;
  max-height: 100vh;
  margin: 0;
  overflow: hidden;

  /* Layout lives on the open state only: an author-level display
     declaration would beat the UA sheet's
     dialog:not([open]) { display: none } and paint the closed overlay
     in flow, shoving following content a viewport down. */
  &[open] {
    display: flex;
    align-items: center;
    justify-content: center;
  }

  &::backdrop {
    background: var(--haze-color-scrim-strong);
  }

  &[open][data-state='open'] {
    animation: haze-image-preview-in var(--haze-duration-normal)
      var(--haze-ease);
  }

  &[open][data-state='closed'] {
    animation: haze-image-preview-out var(--haze-duration-fast)
      var(--haze-ease);
  }

  &[open][data-state='open']::backdrop {
    animation: haze-image-backdrop-in var(--haze-duration-normal)
      var(--haze-ease);
  }

  &[open][data-state='closed']::backdrop {
    animation: haze-image-backdrop-out var(--haze-duration-fast)
      var(--haze-ease);
  }

  @keyframes haze-image-preview-in {
    from {
      opacity: 0;
    }
  }

  @keyframes haze-image-preview-out {
    to {
      opacity: 0;
    }
  }

  @keyframes haze-image-backdrop-in {
    from {
      opacity: 0;
    }
  }

  @keyframes haze-image-backdrop-out {
    to {
      opacity: 0;
    }
  }
`;

const previewImg = css`
  max-width: 90%;
  max-height: 90%;
  object-fit: contain;
  transform-origin: center;
  user-select: none;
  touch-action: none;
`;

const imgPannable = css`
  cursor: grab;
`;

const imgPanning = css`
  cursor: grabbing;
`;

/* Transform transitions animate toolbar/wheel zoom and rotation. Skipped
   while dragging (each pan frame would fight the 200ms transition) and
   automatically collapsed to 0ms under prefers-reduced-motion — the
   motion tokens redefine every --haze-duration-* inside that media query. */
const imgAnimated = css`
  transition: transform var(--haze-duration-normal) var(--haze-ease);
`;

/* Shared chrome of the overlay's floating strips (toolbar, thumbnail
   strip): an absolutely positioned, horizontally centered fit-content
   box carrying the raised panel skin (border/radius/bg/shadow). The
   per-strip classes below add only their edge offset and layout. */
const chromeStrip = css`
  position: absolute;
  left: 0;
  right: 0;
  margin-inline: auto;
  width: fit-content;
  border: 1px solid var(--haze-color-border);
  border-radius: var(--haze-radius-lg);
  background: var(--haze-color-bg);
  box-shadow: var(--haze-shadow-lg);
`;

const toolbar = css`
  top: var(--haze-space-4);
  display: flex;
  align-items: center;
  gap: var(--haze-space-1);
  padding: var(--haze-space-1);
`;

/* Toolbar tools + close: the quietIconButton chrome (borderless,
   muted→text ink, bg-muted hover, keyboard ring) plus the local
   geometry/typography delta. The skin's hover arm is
   :not(:disabled)-guarded, so a disabled tool keeps the resting muted
   ink with no local re-mute patch — only the not-allowed cursor stays
   local. */
const toolButton = css`
  width: var(--haze-space-8);
  height: var(--haze-space-8);
  padding: 0;
  border-radius: var(--haze-radius-md);
  font-family: var(--haze-font-sans);
  font-size: var(--haze-text-sm);
  font-weight: var(--haze-weight-medium);
  line-height: 1;

  & svg {
    width: var(--haze-space-5);
    height: var(--haze-space-5);
  }

  &:disabled {
    cursor: not-allowed;
  }
`;

/* Flanking prev/next arrows (gallery mode), vertically centered at the
   viewport edges — absolutely positioned so they never join the flex
   centering that places the image. The interaction chrome rides
   quietIconButton; only the circle geometry and the edge offsets stay
   local. */
const navButton = css`
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: var(--haze-space-10);
  height: var(--haze-space-10);
  padding: 0;
  border-radius: var(--haze-radius-full);

  & svg {
    width: var(--haze-space-5);
    height: var(--haze-space-5);
  }
`;

const navPrev = css`
  left: var(--haze-space-4);
`;

const navNext = css`
  right: var(--haze-space-4);
`;

/* The n / total readout riding in the toolbar between the tools and
   the close button. */
const counter = css`
  min-width: var(--haze-space-12);
  padding-inline: var(--haze-space-2);
  text-align: center;
  font-family: var(--haze-font-sans);
  font-size: var(--haze-text-sm);
  color: var(--haze-color-text-secondary);
`;

/* Bottom thumbnail strip (gallery mode): the chromeStrip chrome plus a
   scrollable flex row, scrolling horizontally when the entries
   overflow. */
const thumbnailStrip = css`
  bottom: var(--haze-space-4);
  max-width: 90%;
  display: flex;
  align-items: center;
  gap: var(--haze-space-2);
  padding: var(--haze-space-2);
  overflow-x: auto;
`;

/* Keyboard ring composes focusRingVisible — adds the forced-colors
   Highlight arm the local copy never had. */
const thumbnailButton = css`
  display: block;
  flex-shrink: 0;
  width: var(--haze-space-16);
  height: var(--haze-space-16);
  padding: 0;
  border: 2px solid transparent;
  border-radius: var(--haze-radius-md);
  background: var(--haze-color-bg-muted);
  overflow: hidden;
  cursor: pointer;
`;

const thumbnailActive = css`
  border-color: var(--haze-color-primary);
`;

const thumbnailImg = css`
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

type DragState = {
  pointerId: number;
  startX: number;
  startY: number;
  originX: number;
  originY: number;
};

export default function ImagePreview({
  src,
  alt,
  open: openControl,
  zoom = true,
  rotate = true,
  images,
  index: indexControl,
  showThumbnails = true,
}: ImagePreviewProps) {
  const [open, setOpen] = useControl(openControl, false);
  const [index, setIndex] = useControl(indexControl, 0);
  const strings = useStrings('image');
  const [scale, setScale] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);

  // Gallery mode kicks in at two entries: with fewer there is nothing to
  // navigate and the overlay stays in its single-image shape.
  const galleryImages = images !== undefined && images.length > 0 ? images : null;
  const total = galleryImages?.length ?? 1;
  const galleryMode = total > 1;
  // Clamped for display: a controlled index (or entries shrinking while
  // the overlay is open) can point past the end.
  const activeIndex = Math.min(Math.max(index, 0), total - 1);
  const active: GalleryImage = galleryImages?.[activeIndex] ?? { src, alt };

  const internalRef = useRef<HTMLDialogElement | null>(null);
  const closeRef = useRef<HTMLButtonElement | null>(null);
  const dragRef = useRef<DragState | null>(null);

  const resetTransform = () => {
    setScale(1);
    setRotation(0);
    setOffset({ x: 0, y: 0 });
  };

  // The native-<dialog> lifecycle (focus scope, showModal/animated
  // close, Esc/backdrop/native-close trio) rides the shared shell
  // Dialog uses. onShown keeps the custom initial-focus contract — the
  // toolbar's close button, not the first tabbable the scope's
  // autoFocus would land on; it runs after showModal so focus lands
  // inside the now-revealed dialog. The transform reset rides onClose:
  // the native close event stays the single funnel every exit path
  // runs through. viewTransition stays off (the overlay animates via
  // its own keyframes) and the always-mounted dialog needs no
  // keepMounted dormant markers.
  const {setDialogRef, dialogProps} = useNativeDialogShell({
    open,
    setOpen,
    viewTransition: false,
    onClose: resetTransform,
    keepMounted: false,
    onShown: () => closeRef.current?.focus(),
  });

  // The non-passive wheel listener below needs the node as well — merge
  // the shell's ref callback with a local copy.
  const setPreviewRef = useCallback(
    (node: HTMLDialogElement | null) => {
      internalRef.current = node;
      setDialogRef(node);
    },
    [setDialogRef]
  );

  // Wheel zoom as a native non-passive listener: React's onWheel is
  // passive at the root, so preventDefault (stop the page behind the
  // dialog from scrolling) needs addEventListener with passive: false.
  useEffect(() => {
    if (!open || !zoom) return;
    const el = internalRef.current;
    if (!el) return;
    const onWheel = (event: WheelEvent) => {
      event.preventDefault();
      setScale((prev) => clampScale(prev - Math.sign(event.deltaY) * SCALE_STEP));
    };
    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, [open, zoom]);

  const handlePointerDown = (event: ReactPointerEvent<HTMLImageElement>) => {
    if (!zoom || event.button !== 0) return;
    // Guarded capture — jsdom and capture-less engines keep delivering
    // moves bubbling through the image so drag tests run there.
    capturePointer(event.currentTarget, event.pointerId);
    dragRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      originX: offset.x,
      originY: offset.y,
    };
    setDragging(true);
  };

  const handlePointerMove = (event: ReactPointerEvent<HTMLImageElement>) => {
    const drag = dragRef.current;
    if (drag?.pointerId !== event.pointerId) return;
    setOffset({
      x: drag.originX + event.clientX - drag.startX,
      y: drag.originY + event.clientY - drag.startY,
    });
  };

  const endDrag = (event: ReactPointerEvent<HTMLImageElement>) => {
    if (dragRef.current?.pointerId !== event.pointerId) return;
    dragRef.current = null;
    setDragging(false);
  };

  /** Single funnel for every gallery navigation path. */
  const goToImage = (next: number) => {
    // Wrap-around at both ends: any offset lands inside 0..total-1.
    setIndex(((next % total) + total) % total);
    // The new image starts from the untouched transform (the same reset
    // the close funnel performs) — index and transform must commit in
    // one render, or the transition below animates the old pan/zoom
    // collapsing onto the new image.
    resetTransform();
  };

  // ArrowLeft/ArrowRight while the overlay is open. The dialog only
  // receives keys while open (the UA sheet hides it otherwise), and the
  // handler rides the dialog element so it works wherever focus sits
  // inside — toolbar, arrows or thumbnail strip.
  const handleKeyDown = (event: ReactKeyboardEvent<HTMLDialogElement>) => {
    if (!galleryMode) return;
    if (event.key === 'ArrowLeft') {
      event.preventDefault();
      goToImage(activeIndex - 1);
    } else if (event.key === 'ArrowRight') {
      event.preventDefault();
      goToImage(activeIndex + 1);
    }
  };

  return (
    <dialog
      data-slot="image-preview"
      ref={setPreviewRef}
      aria-label={active.alt}
      {...dialogProps}
      onKeyDown={handleKeyDown}
      x-class={[overlay]}
    >
      <img
        data-slot="img"
        x-class={[
          previewImg,
          zoom && (dragging ? imgPanning : imgPannable),
          !dragging && imgAnimated,
        ]}
        src={active.src}
        alt={active.alt}
        draggable={false}
        style={{
          transform: `translate(${offset.x}px, ${offset.y}px) scale(${scale}) rotate(${rotation}deg)`,
        }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
      />
      {galleryMode && (
        <button
          data-slot="prev-button"
          type="button"
          x-class={[quietIconButton, navButton, navPrev]}
          aria-label={strings.prevImage}
          onClick={() => goToImage(activeIndex - 1)}
        >
          <ChevronLeft aria-hidden="true" focusable="false" />
        </button>
      )}
      {galleryMode && (
        <button
          data-slot="next-button"
          type="button"
          x-class={[quietIconButton, navButton, navNext]}
          aria-label={strings.nextImage}
          onClick={() => goToImage(activeIndex + 1)}
        >
          <ChevronRight aria-hidden="true" focusable="false" />
        </button>
      )}
      <div data-slot="toolbar" x-class={[chromeStrip, toolbar]}>
        {zoom && (
          <>
            <button
              data-slot="zoom-in-button"
              type="button"
              x-class={[quietIconButton, toolButton]}
              aria-label={strings.zoomIn}
              disabled={scale >= SCALE_MAX}
              onClick={() => setScale(clampScale(scale + SCALE_STEP))}
            >
              <ZoomIn aria-hidden="true" focusable="false" />
            </button>
            <button
              data-slot="zoom-out-button"
              type="button"
              x-class={[quietIconButton, toolButton]}
              aria-label={strings.zoomOut}
              disabled={scale <= SCALE_MIN}
              onClick={() => setScale(clampScale(scale - SCALE_STEP))}
            >
              <ZoomOut aria-hidden="true" focusable="false" />
            </button>
            <button
              data-slot="reset-button"
              type="button"
              x-class={[quietIconButton, toolButton]}
              aria-label={strings.reset}
              onClick={resetTransform}
            >
              1:1
            </button>
          </>
        )}
        {rotate && (
          <button
            data-slot="rotate-button"
            type="button"
            x-class={[quietIconButton, toolButton]}
            aria-label={strings.rotate}
            onClick={() => setRotation((prev) => (prev + ROTATE_STEP) % 360)}
          >
            <RotateCw aria-hidden="true" focusable="false" />
          </button>
        )}
        {galleryMode && (
          <span data-slot="counter" x-class={[counter]}>
            {formatString(strings.counter, {
              current: activeIndex + 1,
              total,
            })}
          </span>
        )}
        <button
          ref={closeRef}
          data-slot="close"
          type="button"
          x-class={[quietIconButton, toolButton]}
          aria-label={strings.close}
          onClick={() => setOpen(false)}
        >
          <X aria-hidden="true" focusable="false" />
        </button>
      </div>
      {galleryImages !== null && total > 1 && showThumbnails && (
        <div data-slot="thumbnails" x-class={[chromeStrip, thumbnailStrip]}>
          {galleryImages.map((image, i) => (
            <button
              key={`${image.src}-${i}`}
              data-slot="thumbnail"
              type="button"
              x-class={[thumbnailButton, i === activeIndex && thumbnailActive, focusRingVisible]}
              aria-label={formatString(strings.thumbnail, {
                index: i + 1,
                total,
                alt: image.alt,
              })}
              aria-current={i === activeIndex ? 'true' : undefined}
              onClick={() => goToImage(i)}
            >
              <img
                src={image.src}
                alt=""
                x-class={[thumbnailImg]}
                draggable={false}
              />
            </button>
          ))}
        </div>
      )}
    </dialog>
  );
}

export type { ImagePreviewProps };
