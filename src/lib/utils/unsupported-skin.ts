import { css } from '@linaria/core';

/**
 * Shared degradation-notice shape for "canvas 2d context unsupported"
 * fallbacks — the dashed frame both Signature's pad and ImageCrop's
 * cropper degrade to when the 2d context probe fails (jsdom, ancient
 * engines) instead of rendering a broken input.
 *
 * Drift discipline: this is the common shape only. Consumers needing
 * extra declarations keep them in a local companion class and compose
 * via `x-class` (ImageCrop's aspect-ratio stage, Signature's inline px
 * sizing) — never re-declare this recipe locally.
 *
 * Registry: pure-css shared module — must ride with the consuming
 * component groups in scripts/split-css.mjs `sharedLayers` (signature,
 * image-crop) and be listed in scripts/rsc-safe.mjs, same reasoning as
 * utils/sr-only.ts (only import is the externalized @linaria/core; no
 * hooks, no DOM access).
 */
export const unsupportedNotice = css`
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px dashed var(--haze-color-border);
  border-radius: var(--haze-radius-md);
  color: var(--haze-color-text-muted);
  font-size: var(--haze-text-sm);
`;
