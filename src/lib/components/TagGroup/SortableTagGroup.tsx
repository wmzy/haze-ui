import type { ReactNode } from 'react';

import { Children } from 'react';

import { arrayMove, rectSortingStrategy } from '@dnd-kit/sortable';

import { SortableItem, SortableRegion } from '../../utils/sortable';
import { useConfigDefaults } from '../ConfigProvider/useConfigDefaults';

import { TagGroupItemClassNamesContext, type TagGroupClassNames } from './TagGroup';
import { group } from './tag-group-styles';

/**
 * Drag-and-drop reorderable variant of TagGroup — built on @dnd-kit
 * (a haze-ui dependency), so this module statically imports the dnd
 * runtime; the plain TagGroup stays free of it. Each chip becomes
 * draggable;
 * keyboard: focus a chip, Space lifts, arrows move, Space drops, Escape
 * cancels.
 */
type SortableTagGroupProps = {
  children: ReactNode;
  className?: string;
  /** Slot classes — same contract as TagGroup's `classNames`; item-level
   * keys are inherited by the TagGroupItem children. */
  classNames?: TagGroupClassNames;
  /**
   * Receives `nextOrder` — the new sequence of original child indices —
   * after a completed drag. Reorder the children you pass accordingly;
   * without a handler a drop only animates back to the source position.
   */
  onReorder?: (nextOrder: number[]) => void;
};

export default function SortableTagGroup({
  children,
  className,
  classNames,
  onReorder,
}: SortableTagGroupProps) {
  // Same 'TagGroup' ConfigProvider section as the plain variant — it is
  // the same component family.
  const config = useConfigDefaults('TagGroup');
  const resolvedClassNames = config.classNames
    ? { ...config.classNames, ...classNames }
    : classNames;

  // The sortable mode needs positional indices over the child list, so it
  // renders through Children.toArray; ids are the child indices.
  const items = Children.toArray(children);
  const ids = items.map((_, index) => index);

  return (
    <TagGroupItemClassNamesContext.Provider value={resolvedClassNames}>
      <div data-slot="tag-group" x-class={[group, className, resolvedClassNames?.root]} role="group">
        <SortableRegion
          ids={ids}
          strategy={rectSortingStrategy}
          onMove={(from, to) => onReorder?.(arrayMove(ids, from, to))}
        >
          {items.map((child, index) => (
            <SortableItem key={index} id={index}>
              {child}
            </SortableItem>
          ))}
        </SortableRegion>
      </div>
    </TagGroupItemClassNamesContext.Provider>
  );
}

export type { SortableTagGroupProps };
