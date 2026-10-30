import { css } from '@linaria/core';

/**
 * Shared single-line truncation — the overflow / text-overflow /
 * white-space three-piece that a dozen component files wore as
 * byte-identical copies (picker labels, tree titles, upload names,
 * schedule chips…). Compose over the site's own class:
 * `x-class={[truncate, label]}` — companion classes keep only their
 * extra declarations (min-width floors, flex shrink allowances,
 * typography), so the clipping contract cannot drift per site.
 *
 * Pure CSS module — every consumer family must be registered under
 * 'utils/truncate' in scripts/split-css.mjs `sharedLayers`. Typography
 * and Heatmap are RSC-safe consumers, so the module also needs a
 * scripts/rsc-safe.mjs entry.
 */
export const truncate = css`
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;
