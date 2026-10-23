import type {
  ComponentPropsWithoutRef,
  CSSProperties,
  MouseEvent as ReactMouseEvent,
  ReactNode,
  SyntheticEvent,
} from 'react';

import { css } from '@linaria/core';
import { useEffect, useRef, useState } from 'react';
import { useControl } from 'react-use-control';

import ImagePreview from './ImagePreview';
import { useImageGallery } from './ImageGalleryContext';

/**
 * Preview overlay configuration: absent/false disables the preview; each
 * flag opts out of one control (default enabled), mirroring antd's
 * PreviewOperations config.
 */
type ImagePreviewConfig = {
  zoom?: boolean;
  rotate?: boolean;
};

type ImageProps = {
  src: string;
  alt: string;
  fallback?: ReactNode;
  aspectRatio?: string;
  objectFit?: CSSProperties['objectFit'];
  /**
   * Enable the fullscreen click-to-preview overlay (default `false` —
   * rendering and behavior are unchanged). `true` turns on every control;
   * an object opts out per control: `zoom: false` drops the zoom
   * buttons, wheel zoom and drag pan, `rotate: false` the rotate button.
   *
   * Inside an `ImagePreviewGroup` this prop only opts the image in or
   * out of the shared gallery: clicking delegates to the group's single
   * overlay, and the group's own `preview` config governs its controls.
   */
  preview?: boolean | ImagePreviewConfig;
} & Omit<ComponentPropsWithoutRef<'img'>, 'src' | 'alt'>;

const wrapper = css`
  display: block;
  overflow: hidden;
  position: relative;
`;

const imgStyle = css`
  display: block;
  width: 100%;
  height: 100%;
`;

const fallbackStyle = css`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  background: var(--haze-color-bg-muted);
  color: var(--haze-color-text-muted);
  font-family: var(--haze-font-sans);
  font-size: var(--haze-text-sm);
`;

const previewTrigger = css`
  cursor: zoom-in;
`;

export default function Image({
  src,
  alt,
  fallback,
  aspectRatio,
  objectFit = 'cover',
  preview = false,
  className,
  style,
  onClick,
  onError,
  ...rest
}: ImageProps) {
  const [error, setError] = useState(false);
  const previewEnabled = preview !== false;
  const previewOptions = typeof preview === 'object' ? preview : {};
  const zoomEnabled = previewEnabled && previewOptions.zoom !== false;
  const rotateEnabled = previewEnabled && previewOptions.rotate !== false;
  const [, setPreviewOpen, previewOpenCtrl] = useControl(undefined, false);

  // Gallery delegation (ImagePreviewGroup): inside a group the child
  // never renders an overlay of its own — it registers its src/alt and
  // hands its click to the group's shared one. A group running
  // `preview={false}` leaves its children fully inert instead of
  // letting them fall back to standalone overlays. The mount-effect
  // registration keeps entry order = document order (sibling effects
  // flush top-down); the id-keyed cleanup survives StrictMode's double
  // mount/unmount cycle.
  const gallery = useImageGallery();
  const inGallery = gallery !== null;
  const galleryDelegates = gallery?.enabled === true;
  // Clickable only when a preview can actually open: standalone with
  // preview enabled, or inside an enabled group.
  const previewActive = previewEnabled && (!inGallery || galleryDelegates);
  const galleryIdRef = useRef<number | null>(null);

  useEffect(() => {
    if (gallery?.enabled !== true || !previewEnabled) return;
    const id = gallery.register({ src, alt });
    galleryIdRef.current = id;
    return () => {
      gallery.unregister(id);
      galleryIdRef.current = null;
    };
  }, [gallery, previewEnabled, src, alt]);

  // Compose: the fallback logic owns this handler, but a consumer's
  // onError (forwarded via the native props arm) still fires.
  const handleError = (event: SyntheticEvent<HTMLImageElement>) => {
    onError?.(event);
    setError(true);
  };

  // Same composition as onError: the preview logic owns the click, a
  // consumer's forwarded onClick still fires first.
  const handleClick = (event: ReactMouseEvent<HTMLImageElement>) => {
    onClick?.(event);
    if (!previewActive) return;
    // The preview's focus scope returns focus to this image on close;
    // focus it now (imgs are not focusable by default, hence tabIndex -1
    // below) so that hand-back has a real target.
    event.currentTarget.focus();
    if (galleryDelegates) {
      const id = galleryIdRef.current;
      if (id !== null) gallery.activate(id);
      return;
    }
    setPreviewOpen(true);
  };

  return (
    <>
      <span data-slot="image" x-class={[wrapper, className]} style={{ aspectRatio }}>
        {error && fallback ? (
          <span data-slot="error" className={fallbackStyle}>{fallback}</span>
        ) : (
          <img
            data-slot="img"
            x-class={[imgStyle, previewActive && previewTrigger]}
            tabIndex={previewActive ? -1 : undefined}
            {...rest}
            src={src}
            alt={alt}
            style={{ ...style, objectFit }}
            onError={handleError}
            onClick={handleClick}
          />
        )}
      </span>
      {previewEnabled && !inGallery && (
        <ImagePreview
          src={src}
          alt={alt}
          open={previewOpenCtrl}
          zoom={zoomEnabled}
          rotate={rotateEnabled}
        />
      )}
    </>
  );
}

export type { ImageProps, ImagePreviewConfig };
