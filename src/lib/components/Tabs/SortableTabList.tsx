import type { KeyboardEvent as ReactKeyboardEvent, PointerEventHandler, ReactNode } from 'react';

import { Children, useEffect, useRef, useState } from 'react';

import { arrayMove, horizontalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { css } from '@linaria/core';

import { SortableRegion } from '../../utils/sortable';
import { sortableItemStyle } from '../../utils/sortable-shared';

import { edgeScrollDelta } from './edge-scroll';
import TabList from './TabList';
import { useTabsContext } from './TabsContext';

/**
 * Drag-and-drop reorderable variant of the Tabs strip — built on the
 * @dnd-kit dependency (the plain TabList never touches it). It is a
 * drop-in `<TabList>` replacement inside `<Tabs>`: the strip keeps the
 * WAI-ARIA tabs model (roving tabindex, arrow-key selection, Home/End)
 * and every `<Tab>` affordance (closable ×, icon, status dot) renders
 * exactly as before.
 *
 * Keyboard sorting follows the shared sensor seam (`Space` lifts the
 * focused tab, arrows walk, `Space` drops, `Escape` cancels) — while
 * inside the sortable strip `Space`/`Enter` lift a drag instead of
 * activating the tab (selection already follows the arrows per the
 * tabs pattern, so nothing is lost). A drag never changes which tab is
 * active: the selection is captured at lift and restored at drop, so
 * reordering cannot move the selection with an index.
 *
 * While a tab is airborne, holding the pointer within
 * `AUTO_SCROLL_EDGE` of either strip end auto-scrolls the hidden
 * viewport — the Chrome-tabs gesture for reaching tabs that
 * compressed past their floor. dnd-kit's own autoScroll is
 * bypassed in favor of this explicit loop: the strip's flex
 * compression reflows item rects mid-drag, which the rect-based
 * detector tracks poorly.
 *
 * Trade-off: the overflow `⋯` menu does not appear in this variant —
 * the sortable wrappers sit between the tablist and its `<Tab>`
 * children, which the plain TabList's menu collector does not see.
 * The strip still scrolls (hidden scrollbar), so every tab stays
 * reachable; use the plain `<TabList>` when the menu matters more
 * than drag reordering.
 */
type SortableTabListProps = {
  children: ReactNode;
  className?: string;
  /**
   * Receives `nextOrder` — the new sequence of original child indices —
   * after a completed drag. Reorder the `<Tab>` children you pass
   * accordingly; without a handler a drop only animates back to the
   * source position.
   */
  onReorder?: (nextOrder: number[]) => void;
};

/** The sortable node around one tab — the element that carries
 * useSortable's ref, transform and pointer activator. */
const sortableTab = css`
  display: flex;
  position: relative;
  /* Flex items default to min-width:auto — the content's
   * own floor — which would pin every tab at its full label
   * width and defeat the strip's compression. 0 lets the
   * wrapper shrink so the Tab's own min-width (64px, 120px
   * active) becomes the real floor. */
  min-width: 0;
  /* Whole-tab drag affordance: PointerSensor's 8px distance constraint
   * keeps plain clicks (selection) from ever starting a drag. */
  cursor: grab;
  touch-action: none;

  & [role='tab'] {
    cursor: inherit;
  }
`;

/** The dragged tab stacks above its siblings while it flies. */
const sortableTabDragging = css`
  z-index: 1;
`;

type SortableTabItemProps = {
  id: string | number;
  children: ReactNode;
};

/**
 * The sortable wrapper around one `<Tab>`. The span itself carries no
 * semantics — the tab keeps its `role="tab"` and the strip's single
 * roving stop (the generic wrapper flattens out of the accessibility
 * tree, so the tablist still owns nothing but tabs).
 */
function SortableTabItem({ id, children }: SortableTabItemProps) {
  const { value, setValue } = useTabsContext();
  const { listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
  const selectionAtLift = useRef<string | null>(null);

  useEffect(() => {
    if (isDragging) {
      // Capture once at lift: the drag's walk keys are the same arrows
      // TabList's roving model listens to, so selection may trail the
      // walk while dragging — the drop always puts it back.
      if (selectionAtLift.current === null) selectionAtLift.current = value;
      return;
    }
    const saved = selectionAtLift.current;
    if (saved === null) return;
    selectionAtLift.current = null;
    if (saved !== value) setValue(saved);
  }, [isDragging, value, setValue]);

  // dnd-kit's activator onKeyDown is the keyboard lift. Running it in
  // the capture phase keeps it ahead of the tab's own keymap — the
  // closable Tab translates Space/Enter into selection and Delete into
  // a close, and the lift must win without the tab also selecting.
  // When dnd claims the key it preventDefaults the event; stopping
  // propagation right there keeps TabList's roving arrows out of the
  // same keydown (SortableTree's SortableRow precedent).
  function handleKeyDownCapture(event: ReactKeyboardEvent<HTMLSpanElement>) {
    const lift = listeners?.onKeyDown as
      | ((event: ReactKeyboardEvent<HTMLSpanElement>) => void)
      | undefined;
    lift?.(event);
    if (event.defaultPrevented) event.stopPropagation();
  }

  const onPointerDown = listeners?.onPointerDown as
    | PointerEventHandler<HTMLSpanElement>
    | undefined;

  return (
    <span
      ref={setNodeRef}
      data-slot='sortable-tab'
      style={sortableItemStyle(transform, transition)}
      onPointerDown={onPointerDown}
      onKeyDownCapture={handleKeyDownCapture}
      x-class={[sortableTab, isDragging && sortableTabDragging]}
    >
      {children}
    </span>
  );
}

export default function SortableTabList({
  className,
  onReorder,
  children,
}: SortableTabListProps) {
  // The sortable mode needs positional indices over the child list, so
  // it renders through Children.toArray; ids are the child indices.
  const items = Children.toArray(children);
  const ids = items.map((_, index) => index);

  // Edge auto-scroll wiring: the root ref locates the hidden scroll
  // viewport ([data-slot="tab-list"]) once a drag lifts, the pointer
  // position is tracked in a ref (no re-render per move), and a rAF
  // loop applies the scroll while the drag is airborne.
  const rootRef = useRef<HTMLDivElement>(null);
  const pointerX = useRef(0);
  const [dragging, setDragging] = useState(false);

  useEffect(() => {
    if (!dragging) return;
    let frame = 0;
    const tick = () => {
      const strip = rootRef.current?.querySelector<HTMLElement>(
        '[data-slot="tab-list"]'
      );
      if (strip) {
        const rect = strip.getBoundingClientRect();
        strip.scrollLeft += edgeScrollDelta(rect, pointerX.current);
      }
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    const track = (event: PointerEvent) => {
      pointerX.current = event.clientX;
    };
    window.addEventListener('pointermove', track);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('pointermove', track);
    };
  }, [dragging]);

  return (
    <div ref={rootRef}>
      <SortableRegion
        ids={ids}
        strategy={horizontalListSortingStrategy}
        onMove={(from, to) => onReorder?.(arrayMove(ids, from, to))}
        onDragStart={() => setDragging(true)}
        onDragEnd={() => setDragging(false)}
      >
        {/* The region renders no DOM of its own except dnd-kit's
         * screen-reader live regions — keeping it around (not inside)
         * the TabList keeps those role="status" nodes out of the
         * tablist, whose owned children must be nothing but tabs (axe
         * aria-required-children). */}
        <TabList className={className}>
          {items.map((child, index) => (
            <SortableTabItem key={index} id={index}>
              {child}
            </SortableTabItem>
          ))}
        </TabList>
      </SortableRegion>
    </div>
  );
}

export type { SortableTabListProps };
