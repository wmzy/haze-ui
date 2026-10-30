import { css } from '@linaria/core';

/**
 * Shared state-option skin — the aria-disabled placeholder option row
 * Combobox's loading/empty state rows and Command's empty row render so
 * the listbox's owned-element contract stays satisfied while nothing is
 * actually selectable (PromptInput's pattern). Extracted from two
 * byte-identical copies; consumers keep their padding density (and
 * Combobox its spinner gap) as local deltas composed behind this base —
 * the property sets are disjoint, so the pair never depends on
 * stylesheet order.
 *
 * Linaria CSS — every consumer family must be registered under
 * 'utils/state-option-skin' in scripts/split-css.mjs `sharedLayers`.
 * Pure Linaria class constant (no hooks, no DOM access; the
 * @linaria/core import is elided at build time), so the module is
 * listed in scripts/rsc-safe.mjs like utils/sr-only.ts.
 */
export const stateOptionRow = css`
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: var(--haze-font-sans);
  font-size: var(--haze-text-sm);
  color: var(--haze-color-text-muted);
  cursor: default;
`;
