import { css } from '@linaria/core';

/**
 * Shared Avatar skin — the circular identity frame and the sm/md/lg
 * size ladder, split into their own sibling module (the Tag
 * tag-styles precedent) so AvatarGroup's overflow chip can wear the
 * exact Avatar sm chassis instead of a hand-copied lookalike.
 *
 * Component-dir→component-dir css consumption needs the split-css
 * sharedLayers registration to inline this module into the consumer
 * family too (`components/Avatar/avatar-styles`: ['avatar-group'], the
 * FloatButton/float-button-styles→back-to-top precedent); the Avatar
 * family picks it up through its own directory group.
 *
 * Drift discipline: only declarations Avatar and the overflow chip
 * share verbatim live here. Avatar-only chrome (the img-cropping
 * overflow, no-select, no-shrink) stays in Avatar.tsx; chip-only
 * overflow-count semantics stay in AvatarGroup.tsx.
 */
export const avatarBase = css`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--haze-radius-full);
  background: var(--haze-color-bg-muted);
  color: var(--haze-color-text-secondary);
  font-family: var(--haze-font-sans);
  font-weight: var(--haze-weight-medium);
`;

export const avatarSizes = {
  sm: css`
    width: var(--haze-space-8);
    height: var(--haze-space-8);
    font-size: var(--haze-text-xs);
  `,
  md: css`
    width: var(--haze-space-10);
    height: var(--haze-space-10);
    font-size: var(--haze-text-sm);
  `,
  /* 56px has no single step on the space scale (jumps 12→16): the
     space-12 + space-2 composition, TabBar's 56px track precedent. */
  lg: css`
    width: calc(var(--haze-space-12) + var(--haze-space-2));
    height: calc(var(--haze-space-12) + var(--haze-space-2));
    font-size: var(--haze-text-lg);
  `,
} as const;
