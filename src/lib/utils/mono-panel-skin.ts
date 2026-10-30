import { css } from '@linaria/core';

/**
 * Shared mono-panel base — the outer-chrome recipe the read-only
 * monospace viewers (DiffViewer's wrapper, LogViewer's wrapper) wore
 * as byte-identical local copies: mono font + text-xs on relaxed
 * leading, hairline border, radius-md and overflow:hidden so the
 * header/toolbar seam clips to the rounded frame. Extracted verbatim.
 *
 * Drift discipline (field-skin precedent): a declaration only lives
 * here when every consumer ships it identically. Per-family deltas —
 * DiffViewer's line gutters/tones and LogViewer's toolbar, scroll-cap
 * body and level colors — stay local as companion classes composed
 * additively behind this base; the property sets are disjoint, so the
 * compositions never depend on stylesheet order (dev-server injection
 * and the dist css split disagree).
 *
 * Single class constant, no variant map — a second axis (e.g. a tone
 * map) would go to a sibling module per the one-css-map-per-module
 * rule Linaria's member-key display naming forces (status-skin
 * family precedent).
 *
 * Linaria CSS — every consumer family must be registered under
 * 'utils/mono-panel-skin' in scripts/split-css.mjs `sharedLayers`.
 * Pure Linaria class constant (no hooks, no DOM access), but unlike
 * utils/sr-only.ts / utils/state-option-skin.ts it is deliberately
 * NOT on the rsc-safe.mjs list: its only importers are client
 * components (useStrings/useControl closures — utils/meter-skin.ts
 * precedent), so the 'use client' banner on the dist module is
 * harmless.
 */
export const monoPanelBase = css`
  font-family: var(--haze-font-mono);
  font-size: var(--haze-text-xs);
  line-height: var(--haze-leading-relaxed);
  border: 1px solid var(--haze-color-border);
  border-radius: var(--haze-radius-md);
  overflow: hidden;
`;
