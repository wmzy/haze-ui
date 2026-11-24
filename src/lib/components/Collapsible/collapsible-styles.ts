import { css } from '@linaria/core';

import { gridCollapse, gridCollapseChild } from '../../utils/grid-collapse-skin';

/**
 * Collapsible skin — the two wrappers of the content height animation.
 * A pure styles module (no react import) on purpose: the shared
 * collapse skin arrives as a function call interpolated into the
 * template, and wyw evaluates an interpolated template inside its own
 * module — from the component file that evaluation would need react at
 * eval time (wyw's runtime-require fallback). The trigger and root
 * classes stay in Collapsible.tsx: they are static templates.
 */

/* Height animates on the outer grid: 1fr↔0fr interpolates without knowing
 * the content height. The grid row + visibility gating is the shared
 * collapse skin (utils/grid-collapse-skin.ts, worn by FloatButtonGroup's
 * menu too) on Collapsible's own ease-in-out curve; the inner wrapper
 * clips and can shrink below its content. Presence keeps the subtree
 * mounted (injecting data-state) while the collapse transition runs,
 * then unmounts it. */
export const contentOuter = css`
  ${gridCollapse('var(--haze-ease-in-out)')}
`;

export const contentInner = css`
  ${gridCollapseChild}
`;
