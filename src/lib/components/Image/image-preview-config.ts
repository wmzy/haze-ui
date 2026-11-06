/**
 * Preview overlay configuration: absent/false disables the preview; each
 * flag opts out of one control (default enabled), mirroring antd's
 * PreviewOperations config.
 */
export type ImagePreviewConfig = {
  zoom?: boolean;
  rotate?: boolean;
};

/** The capability triple every `preview` prop resolves down to. */
type ResolvedImagePreview = {
  /** Any overlay can open at all (`preview !== false`). */
  enabled: boolean;
  /** Zoom buttons / wheel zoom / drag pan are offered. */
  zoom: boolean;
  /** The rotate button is offered. */
  rotate: boolean;
};

/**
 * Resolves the shared `preview` prop shape (Image's and the group's)
 * into the { enabled, zoom, rotate } triple both consumers gate on:
 * absent/true enables everything, false disables everything, and an
 * object opts out per control (`zoom: false`, `rotate: false`).
 */
export function resolveImagePreviewConfig(
  preview: boolean | ImagePreviewConfig
): ResolvedImagePreview {
  const enabled = preview !== false;
  const options = typeof preview === 'object' ? preview : {};
  return {
    enabled,
    zoom: enabled && options.zoom !== false,
    rotate: enabled && options.rotate !== false,
  };
}
