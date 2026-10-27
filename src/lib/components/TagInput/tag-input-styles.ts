import {css} from '@linaria/core';

/**
 * Sortable-mode TagInput skin — the drag handle classes only
 * `SortableTagInputCore` wears. The shared tag chrome (list wrap, tag
 * chip, remove button) lives in `utils/tag-skin.ts` and rides with both
 * the tag-input and prompt-input families via sharedLayers.
 * Component-prefixed basename (never bare `styles.ts`): Linaria derives
 * class slugs from the file basename, so two bare-named sibling style
 * files would collide into the same `haze-styles__*` classes
 * (Badge/Button e2e precedent).
 */

/* The sortable mode's drag handle: the label text span inside the li. The
   li keeps its listitem role, so the handle carries the interactive bits. */
export const tagHandle = css`
  cursor: grab;
  touch-action: none;
  user-select: none;
`;

export const tagDragging = css`
  /* Stack the translated tag above its siblings while dragging. */
  position: relative;
  z-index: var(--haze-z-local-1);
`;
