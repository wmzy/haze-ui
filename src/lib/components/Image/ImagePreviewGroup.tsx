import type { ReactNode } from 'react';
import type { ControlOrValue } from 'react-use-control';

import type { ImagePreviewConfig } from './Image';

import { useCallback, useMemo, useRef, useState } from 'react';
import { useControl } from 'react-use-control';

import ImagePreview from './ImagePreview';
import {
  ImageGalleryProvider,
  type GalleryImage,
} from './ImageGalleryContext';

/**
 * AntD `Image.PreviewGroup` counterpart: wrap `Image` children in a
 * gallery and every child with `preview` enabled delegates its click to
 * ONE shared overlay — opened straight at the clicked image — with
 * prev/next arrows, an `n / total` counter, ArrowLeft/ArrowRight keys
 * (wrap-around) and a keyboard-focusable thumbnail strip (drop it with
 * `showThumbnails={false}`). The group's `preview` config governs the
 * shared overlay (zoom/rotate) and mirrors Image's own prop shape;
 * `preview={false}` renders every child inert.
 */

type GalleryEntry = GalleryImage & { id: number };

type ImagePreviewGroupProps = {
  children: ReactNode;
  /**
   * The gallery's active image. A plain number is the uncontrolled
   * starting position; pass a control to drive navigation from the
   * outside (thumbnail clicks, arrows and keys all commit through it).
   */
  index?: ControlOrValue<number>;
  /**
   * Shared overlay configuration, same shape as Image's `preview` prop:
   * `true` (default) turns on every control, an object opts out per
   * control (`zoom: false`, `rotate: false`), `false` disables the
   * overlay for every child.
   */
  preview?: boolean | ImagePreviewConfig;
  /** The thumbnail strip is rendered (default true). */
  showThumbnails?: boolean;
};

export default function ImagePreviewGroup({
  children,
  index: indexControl,
  preview = true,
  showThumbnails = true,
}: ImagePreviewGroupProps) {
  const previewEnabled = preview !== false;
  const previewOptions = typeof preview === 'object' ? preview : {};
  const zoomEnabled = previewEnabled && previewOptions.zoom !== false;
  const rotateEnabled = previewEnabled && previewOptions.rotate !== false;

  // Entries state drives the overlay render; entriesRef gives the
  // register/unregister/activate callbacks a synchronous view of the
  // same list (lookup by id) without stale-closure misses.
  const [entries, setEntries] = useState<GalleryEntry[]>([]);
  const entriesRef = useRef<GalleryEntry[]>([]);
  const idRef = useRef(0);

  const [, setOpen, openCtrl] = useControl(undefined, false);
  const [, setIndex, indexCtrl] = useControl(indexControl, 0);

  const register = useCallback((image: GalleryImage) => {
    // Registration happens from child mount effects (sibling order =
    // document order), never during this component's render.
    const id = ++idRef.current;
    entriesRef.current = [...entriesRef.current, { ...image, id }];
    setEntries(entriesRef.current);
    return id;
  }, []);

  const unregister = useCallback((id: number) => {
    entriesRef.current = entriesRef.current.filter(
      (entry) => entry.id !== id
    );
    setEntries(entriesRef.current);
  }, []);

  const activate = useCallback(
    (id: number) => {
      const position = entriesRef.current.findIndex(
        (entry) => entry.id === id
      );
      if (position < 0) return;
      setIndex(position);
      setOpen(true);
    },
    [setIndex, setOpen]
  );

  const contextValue = useMemo(
    () => ({ enabled: previewEnabled, register, unregister, activate }),
    [previewEnabled, register, unregister, activate]
  );

  const [first] = entries;

  return (
    <ImageGalleryProvider value={contextValue}>
      {children}
      {previewEnabled && first !== undefined && (
        <ImagePreview
          src={first.src}
          alt={first.alt}
          open={openCtrl}
          zoom={zoomEnabled}
          rotate={rotateEnabled}
          images={entries}
          index={indexCtrl}
          showThumbnails={showThumbnails}
        />
      )}
    </ImageGalleryProvider>
  );
}

export type { ImagePreviewGroupProps };
