import { css } from '@linaria/core';

/**
 * Shared linear-meter skin — the 4px pill track and the full-height
 * fill worn by Plan's progress strip and TokenCounter's usage bar.
 * Only geometry and motion live here: the track background stays with
 * each family (Plan rides bg-subtle, TokenCounter bg-muted — the
 * existing drift is kept intentional), and the fill tone stays local
 * too. The fill's width transition is unified on duration-normal +
 * the shared ease curve — TokenCounter historically animated on slow
 * + a bare `ease`; converging on the shared value is an intentional
 * unification, not an oversight. Pure Linaria class constants (no hooks,
 * no DOM); rides with the consuming families via sharedLayers
 * (split-css.mjs).
 */

/** The track: a 4px pill clipping its fill to the rounded ends. */
export const meterTrack = css`
  height: 4px;
  border-radius: var(--haze-radius-full);
  overflow: hidden;
`;

/** The fill: spans the track height, rounds with it, animates width. */
export const meterFill = css`
  height: 100%;
  border-radius: inherit;
  transition: width var(--haze-duration-normal) var(--haze-ease);
`;
