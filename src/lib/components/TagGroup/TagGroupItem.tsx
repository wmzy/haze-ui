import type { ReactNode } from 'react';

import { useContext } from 'react';
import { css } from '@linaria/core';

import { useStrings } from '../LocaleProvider';
import { sortableHandle, useSortableHandle } from '../../utils/sortable-handle';
import { removeBtn, tag as tagStyle } from '../../utils/tag-skin';

import { TagGroupItemClassNamesContext } from './TagGroup';

type TagGroupItemProps = {
  children: ReactNode;
  onClose?: () => void;
  className?: string;
};

/* Local deltas over the shared chip skin (utils/tag-skin.ts): the
 * group's chips are pill-shaped and roomier than the field chips.
 * Same-name declarations (padding/border-radius/line-height) ride the
 * data-slot arm so they win over the shared class regardless of CSS
 * emission order (dev server vs dist). */
const tagDelta = css`
  font-family: var(--haze-font-sans);

  &[data-slot='tag-group-item'] {
    padding: var(--haze-space-1) var(--haze-space-3);
    border-radius: var(--haze-radius-full);
    line-height: var(--haze-leading-tight);
  }
`;

export default function TagGroupItem({ children, onClose, className }: TagGroupItemProps) {
  const strings = useStrings('tagGroup');
  // Group-level classNames inherited from the enclosing TagGroup
  // (props on the item itself win: item's own className applies after).
  const slotClasses = useContext(TagGroupItemClassNamesContext);
  // Inside a sortable TagGroup the label becomes the drag handle (Space
  // lifts, arrows move, Space drops). Keeping the handle on the label — a
  // sibling of the close button — avoids nesting interactive roles (axe
  // nested-interactive); outside sortable groups the handle is null and
  // the DOM is exactly as before.
  const handle = useSortableHandle();
  const label = handle ? (
    <span
      data-slot="drag-handle"
      x-class={[sortableHandle]}
      {...handle.attributes}
      {...handle.listeners}
    >
      {children}
    </span>
  ) : (
    children
  );

  return (
    <span data-slot="tag-group-item" x-class={[tagStyle, tagDelta, slotClasses?.item, className]}>
      {label}
      {onClose && (
        <button data-slot="remove-button" x-class={[removeBtn, slotClasses?.removeButton]} type="button" onClick={onClose} aria-label={strings.remove}>
          ×
        </button>
      )}
    </span>
  );
}

export type { TagGroupItemProps };
