import type { CSSProperties } from 'react';

/**
 * Inline style for an N-line clamp — the `-webkit-box` recipe Typography
 * (`ellipsis={{ rows }}`, N ≥ 2) and Ellipsis (`lines`, every budget)
 * both wear; declared here once instead of as two hand-synced objects.
 * Inline style rather than a css class because the clamp count is a
 * runtime prop (an inline style also wins over any companion clamp
 * class, whatever the cascade order).
 *
 * Type-only import — zero runtime code (RSC-safe by inspection;
 * Typography is an RSC-listed consumer, so the module needs a
 * scripts/rsc-safe.mjs entry, utils/truncate.ts's precedent).
 */
export const lineClampStyle = (lines: number): CSSProperties => ({
  display: '-webkit-box',
  WebkitBoxOrient: 'vertical',
  WebkitLineClamp: lines,
  overflow: 'hidden',
});
