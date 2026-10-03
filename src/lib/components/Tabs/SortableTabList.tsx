import type {
  KeyboardEvent as ReactKeyboardEvent,
  PointerEventHandler,
  ReactNode,
  RefObject,
} from 'react';

import {
  Children,
  createContext,
  isValidElement,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import { arrayMove, horizontalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { css } from '@linaria/core';

import { SortableRegion } from '../../utils/sortable';
import { sortableItemStyle } from '../../utils/sortable-shared';

import { edgeScrollDelta } from './edge-scroll';
import { collectTabMetas } from './tab-metas';
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
 * useSortable's ref, transform and pointer activator.
 *
 * min-width mirrors the Tab's own compression floor (64px,
 * 120px for the active tab — see SortableTabItem below, which
 * knows the wrapped tab's value): a wrapper that could shrink
 * below its tab's floor would let the strip squeeze the WRAPPER
 * while the tab inside keeps its floor and spills out, overlapping
 * the neighbor. Matching floors on both layers keep compression
 * synchronized — the wrapper and its tab stop at the same width. */
const sortableTab = css`
  display: flex;
  position: relative;
  flex: 0 1 auto;
  min-width: calc(var(--haze-space-8) * 2);
  max-width: calc(var(--haze-space-16) * 4);
  /* Whole-tab drag affordance: PointerSensor's 8px distance constraint
   * keeps plain clicks (selection) from ever starting a drag. */
  cursor: grab;
  touch-action: none;

  & [role='tab'] {
    cursor: inherit;
  }
`;

/* The active tab's raised floor — applied by SortableTabItem,
 * which reads the wrapped tab's value from the Tabs context. */
const sortableTabActive = css`
  min-width: calc(var(--haze-space-10) * 3);
`;

/** The dragged tab stacks above its siblings while it flies. */
const sortableTabDragging = css`
  z-index: 1;
`;

/** Handle to the strip's hidden scroll viewport, shared with the
 * sortable wrappers so a drag can be clamped to the content. */
const TabStripRefContext = createContext<
  RefObject<HTMLDivElement | null> | null
>(null);

/**
 * Clamp a drag transform to the strip: horizontal only, and the
 * tab may not leave the scrollable content — not past its left
 * edge, not past the right end (including the hidden overflow
 * the edge auto-scroll reveals).
 *
 * The clamp lives in CONTENT coordinates: the wrapper's
 * offsetLeft/offsetWidth (against the strip, which carries
 * position:relative) are immune to the live transform —
 * getBoundingClientRect would be, because at render time the
 * rect still carries the PREVIOUS frame's transform, polluting
 * the rest-position math; and strip.scrollWidth cannot bound
 * the travel either, because the drag's own transform inflates
 * it mid-flight (a feedback loop that let the tab fly). The
 * content end is therefore recovered from the wrappers'
 * offsets, which no transform can touch. Content coordinates
 * also make the constraint independent of scrollLeft: edge
 * auto-scroll may reveal the hidden end mid-drag, and the
 * tab's allowed travel simply extends to the content's end.
 * Skipped when the strip has no measurable layout (jsdom),
 * leaving the transform untouched.
 *
 * The strip must be the wrapper's offsetParent — hence
 * position:relative on the tab-list (TabList's base).
 */
function clampToStrip(
  transform: { x?: number; y?: number },
  strip: HTMLDivElement,
  node: HTMLElement
): { x: number; y: number; scaleX: number; scaleY: number } | null {
  if (node.offsetParent !== strip) return null;
  let contentEnd = 0;
  for (const child of Array.from(strip.children)) {
    const box = child as HTMLElement;
    contentEnd = Math.max(contentEnd, box.offsetLeft + box.offsetWidth);
  }
  if (contentEnd <= 0) return null;
  const restLeft = node.offsetLeft;
  const minX = -restLeft;
  const maxX = contentEnd - node.offsetWidth - restLeft;
  return {
    x: Math.max(minX, Math.min(transform.x ?? 0, maxX)),
    y: 0,
    scaleX: 1,
    scaleY: 1,
  };
}

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
  const stripRef = useContext(TabStripRefContext);
  // Own element ref, merged with dnd-kit's node ref so the
  // drag clamp can measure the wrapper against the strip.
  const selfRef = useRef<HTMLSpanElement>(null);
  const setRefs = useCallback(
    (node: HTMLSpanElement | null) => {
      selfRef.current = node;
      setNodeRef(node);
    },
    [setNodeRef]
  );
  // The wrapped tab's value decides this wrapper's compression
  // floor (the active tab's is raised — see sortableTabActive).
  const wrappedValue = isValidElement<{ value?: string }>(children)
    ? children.props.value
    : undefined;
  const isActive = wrappedValue !== undefined && value === wrappedValue;

  // Horizontal-only drag, clamped to the scrollable content:
  // the tab stops at the strip's left edge and at the right
  // end of the content (hidden overflow included — the edge
  // auto-scroll reveals it, the clamp follows it).
  const clampedTransform = useMemo(() => {
    const strip = stripRef?.current;
    const node = selfRef.current;
    if (!transform || !strip || !node) return transform;
    return clampToStrip(transform, strip, node) ?? transform;
  }, [transform, stripRef]);

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
      ref={setRefs}
      data-slot='sortable-tab'
      style={sortableItemStyle(clampedTransform, transition)}
      onPointerDown={onPointerDown}
      onKeyDownCapture={handleKeyDownCapture}
      x-class={[
        sortableTab,
        isActive && sortableTabActive,
        isDragging && sortableTabDragging,
      ]}
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

  // The sortable wrappers sit between the tablist and its <Tab>
  // children, so TabList's own menu collector cannot see through
  // them — gather the metas here (over the unwrapped items) and
  // hand them down, restoring the ⋯ overflow menu this variant
  // would otherwise lose.
  const tabMetas = useMemo(() => collectTabMetas(items), [items]);

  // Edge auto-scroll wiring: the root ref locates the hidden scroll
  // viewport ([data-slot="tab-list"]) once a drag lifts, the pointer
  // position is tracked in a ref (no re-render per move), and a rAF
  // loop applies the scroll while the drag is airborne. The same
  // ref backs the drag clamp (TabStripRefContext): the strip's
  // scroll viewport itself, not the outer wrapper — the wrappers
  // report the viewport as their offsetParent.
  const listRef = useRef<HTMLDivElement>(null);
  const pointerX = useRef(0);
  const [dragging, setDragging] = useState(false);

  useEffect(() => {
    if (!dragging) return;
    let frame = 0;
    const tick = () => {
      const strip = listRef.current;
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
    <div>
      <TabStripRefContext.Provider value={listRef}>
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
          <TabList className={className} listRef={listRef} tabMetas={tabMetas}>
            {items.map((child, index) => (
              <SortableTabItem key={index} id={index}>
                {child}
              </SortableTabItem>
            ))}
          </TabList>
        </SortableRegion>
      </TabStripRefContext.Provider>
    </div>
  );
}

export type { SortableTabListProps };
