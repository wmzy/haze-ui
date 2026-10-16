import type {
  ComponentPropsWithoutRef,
  KeyboardEvent as ReactKeyboardEvent,
  PointerEvent as ReactPointerEvent,
  ReactElement,
  ReactNode,
} from 'react';
import type { ControlOrValue } from 'react-use-control';

import { css } from '@linaria/core';
import {
  Children,
  cloneElement,
  createContext,
  isValidElement,
  useContext,
  useRef,
} from 'react';
import { isControl, useControl, useThru, watch } from 'react-use-control';

import { getDirection } from '../../utils/direction';

/** Membership marker only — per-pane data (size, index) is injected by the
 * group through cloneElement, so the context just guards misuse. */
const SplitterContext = createContext<boolean | null>(null);

function useSplitterMembership() {
  if (useContext(SplitterContext) === null) {
    throw new Error('SplitterPane must be used within <Splitter>');
  }
}

/** Arrow-key step in percent points of the pane area (WCAG 2.5.1: the
 * drag-styled divider is fully operable without a pointer). */
const KEYBOARD_STEP = 5;

/** Home/End park the leading pane at its clamp — a delta so large the
 * clamp math saturates, without overflowing. */
const PARK_DELTA = Number.MAX_SAFE_INTEGER;

/** Sizes are emitted rounded to 2 decimals so consumer payloads stay
 * clean; the trailing pane is derived (pairSum − lead) so the pair sum
 * is preserved exactly. */
const round2 = (value: number): number => Math.round(value * 100) / 100;

function clampRange(value: number, lo: number, hi: number): number {
  return Math.min(Math.max(value, lo), hi);
}

/** A pane's resize contract, read from its declaration props. */
type PaneDeclaration = { min: number; max: number };

/** Effective clamp for a divider: the leading pane may only take what
 * the trailing pane can give up, and vice versa. */
function dividerBounds(
  lead: PaneDeclaration,
  trail: PaneDeclaration,
  pairSum: number
): { lo: number; hi: number } {
  return {
    lo: Math.max(lead.min, pairSum - trail.max),
    hi: Math.min(lead.max, pairSum - trail.min),
  };
}

/** One in-flight pointer gesture, captured at divider pointerdown. */
type DragState = {
  pointerId: number;
  origin: number;
  /** Rendered pane-area extent in px — the denominator that converts
   * pointer deltas to percent points of the pane area. */
  extent: number;
  leadIndex: number;
  startLead: number;
  pairSum: number;
  lo: number;
  hi: number;
  /** Last lead applied during the gesture — suppresses no-op moves. */
  lastLead: number;
};

// Splitter
type SplitterProps = {
  /** Layout axis: horizontal stacks panes left-to-right, vertical
   * top-to-bottom. */
  orientation?: 'horizontal' | 'vertical';
  /** Pane sizes in percent of the pane area (the container minus the
   * dividers), one entry per pane, summing to 100. Accepts a Control for
   * controlled usage or a plain array as the uncontrolled initial
   * value (equal split when omitted). */
  sizes?: ControlOrValue<number[]>;
  /** Fired on every applied change — pointer moves and keyboard steps
   * alike — with the full next sizes array. */
  onSizesChange?: (sizes: number[]) => void;
  children?: ReactNode;
  className?: string;
} & Omit<ComponentPropsWithoutRef<'div'>, 'children'>;

const splitterBase = css`
  display: flex;
  overflow: hidden;
  box-sizing: border-box;
  min-width: 0;
  min-height: 0;
`;

const splitterHorizontal = css`
  flex-direction: row;
  height: 100%;
`;

const splitterVertical = css`
  flex-direction: column;
  width: 100%;
`;

export function Splitter({
  orientation = 'horizontal',
  sizes: sizesControl,
  onSizesChange,
  children,
  className,
  ...rest
}: SplitterProps) {
  // Inter-element text (the JSX whitespace between panes) is dropped —
  // only elements participate; anything that is not a SplitterPane is a
  // consumer error and fails loudly.
  const panes = Children.toArray(children)
    .filter(isValidElement)
    .map((child) => {
      if (child.type !== SplitterPane) {
        throw new Error('Splitter children must be <SplitterPane> elements');
      }
      return child as ReactElement<SplitterPaneProps>;
    });

  const paneCount = panes.length;
  const equalSplit = (): number[] =>
    Array.from({ length: paneCount }, () => 100 / paneCount);

  const controlled = isControl(sizesControl);
  const [sizes, setSizes] = useControl<number[]>(
    useThru(
      controlled ? sizesControl : undefined,
      watch((next: number[]) => onSizesChange?.(next))
    ),
    controlled ? equalSplit : (sizesControl ?? equalSplit)
  );

  const paneSize = (index: number): number => {
    const size = sizes[index];
    return size === undefined ? 100 / paneCount : size;
  };

  const declarationOf = (index: number): PaneDeclaration => {
    const props = panes[index]?.props;
    return {
      min: props?.min ?? 0,
      max: props?.max ?? Number.POSITIVE_INFINITY,
    };
  };

  const containerRef = useRef<HTMLDivElement | null>(null);
  const dragRef = useRef<DragState | null>(null);

  /** RTL mirror: in a horizontal splitter flex paints the DOM-lead pane
   * on the RIGHT under rtl, so rightward motion moves the divider INTO
   * it and must shrink it (read at event time — the
   * src/lib/utils/direction convention). Vertical splitters are
   * direction-invariant. */
  const mirrored = (): boolean =>
    orientation === 'horizontal' &&
    getDirection(containerRef.current) === 'rtl';

  const applyDivider = (
    leadIndex: number,
    nextLead: number,
    pairSum: number
  ) => {
    const lead = round2(nextLead);
    const trail = round2(pairSum - lead);
    setSizes((prev) => {
      if (leadIndex + 1 >= prev.length) return prev;
      if (prev[leadIndex] === lead) return prev;
      const next = prev.slice();
      next[leadIndex] = lead;
      next[leadIndex + 1] = trail;
      return next;
    });
  };

  const axisOf = (event: ReactPointerEvent<HTMLDivElement>): number =>
    orientation === 'horizontal' ? event.clientX : event.clientY;

  /** Pane-area extent along the layout axis, summed from the rendered
   * panes — exact regardless of divider hit-strip sizing (it changes
   * with the coarse-pointer media query). Zero in unmeasured
   * environments (jsdom, display:none) — the pointer path no-ops there
   * while the keyboard path keeps working. */
  const measurePaneExtent = (): number => {
    const container = containerRef.current;
    if (container === null) return 0;
    let extent = 0;
    for (const pane of container.querySelectorAll<HTMLElement>(
      "[data-slot='pane']"
    )) {
      const rect = pane.getBoundingClientRect();
      extent += orientation === 'horizontal' ? rect.width : rect.height;
    }
    return extent;
  };

  const beginDrag = (
    index: number,
    event: ReactPointerEvent<HTMLDivElement>
  ) => {
    if (event.button !== 0) return;
    const extent = measurePaneExtent();
    if (!(extent > 0)) return;
    const pairSum = paneSize(index) + paneSize(index + 1);
    const { lo, hi } = dividerBounds(
      declarationOf(index),
      declarationOf(index + 1),
      pairSum
    );
    event.preventDefault();
    const el = event.currentTarget;
    dragRef.current = {
      pointerId: event.pointerId,
      origin: axisOf(event),
      extent,
      leadIndex: index,
      startLead: paneSize(index),
      pairSum,
      lo,
      hi,
      lastLead: paneSize(index),
    };
    if (typeof el.setPointerCapture === 'function') {
      try {
        el.setPointerCapture(event.pointerId);
      } catch {
        // pointer already released — the gesture still tracks
      }
    }
  };

  const moveDrag = (event: ReactPointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    if (drag?.pointerId !== event.pointerId) return;
    const raw = axisOf(event) - drag.origin;
    const deltaPercent = ((mirrored() ? -raw : raw) / drag.extent) * 100;
    const nextLead = clampRange(drag.startLead + deltaPercent, drag.lo, drag.hi);
    if (round2(nextLead) === round2(drag.lastLead)) return;
    drag.lastLead = nextLead;
    applyDivider(drag.leadIndex, nextLead, drag.pairSum);
  };

  const endDrag = (event: ReactPointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    if (drag?.pointerId !== event.pointerId) return;
    dragRef.current = null;
    const el = event.currentTarget;
    if (typeof el.releasePointerCapture === 'function') {
      try {
        el.releasePointerCapture(event.pointerId);
      } catch {
        // capture already gone
      }
    }
  };

  const handleDividerKeyDown = (
    index: number,
    event: ReactKeyboardEvent<HTMLDivElement>
  ) => {
    const growKey = orientation === 'horizontal' ? 'ArrowRight' : 'ArrowDown';
    const shrinkKey = orientation === 'horizontal' ? 'ArrowLeft' : 'ArrowUp';
    const { key } = event;
    if (
      key !== growKey &&
      key !== shrinkKey &&
      key !== 'Home' &&
      key !== 'End'
    ) {
      return;
    }
    const pairSum = paneSize(index) + paneSize(index + 1);
    const { lo, hi } = dividerBounds(
      declarationOf(index),
      declarationOf(index + 1),
      pairSum
    );
    const current = paneSize(index);
    event.preventDefault();
    // Under RTL the horizontal grow/shrink keys swap: ArrowRight keeps
    // its screen-space meaning (move the divider right), but that
    // shrinks the lead pane painted on the divider's right.
    const rtl = mirrored();
    const delta =
      key === growKey
        ? rtl
          ? -KEYBOARD_STEP
          : KEYBOARD_STEP
        : key === shrinkKey
          ? rtl
            ? KEYBOARD_STEP
            : -KEYBOARD_STEP
          : key === 'Home'
            ? -PARK_DELTA
            : PARK_DELTA;
    const nextLead = clampRange(current + delta, lo, hi);
    if (nextLead === current) return;
    applyDivider(index, nextLead, pairSum);
  };

  const items: ReactNode[] = [];
  panes.forEach((pane, index) => {
    if (index > 0) {
      const leadIndex = index - 1;
      const pairSum = paneSize(leadIndex) + paneSize(index);
      const { lo, hi } = dividerBounds(
        declarationOf(leadIndex),
        declarationOf(index),
        pairSum
      );
      items.push(
        <div
          key={`splitter-divider-${index}`}
          data-slot="divider"
          role="separator"
          aria-orientation={
            orientation === 'horizontal' ? 'vertical' : 'horizontal'
          }
          tabIndex={0}
          aria-valuenow={Math.round(paneSize(leadIndex))}
          aria-valuemin={Math.round(lo)}
          aria-valuemax={Math.round(hi)}
          onKeyDown={(event) => handleDividerKeyDown(leadIndex, event)}
          onPointerDown={(event) => beginDrag(leadIndex, event)}
          onPointerMove={moveDrag}
          onPointerUp={endDrag}
          onPointerCancel={endDrag}
          x-class={[
            dividerBase,
            orientation === 'horizontal' ? dividerHorizontal : dividerVertical,
          ]}
        />
      );
    }
    items.push(
      cloneElement(pane, {
        style: { ...pane.props.style, flexGrow: paneSize(index) },
      })
    );
  });

  return (
    <SplitterContext.Provider value>
      <div
        ref={containerRef}
        data-slot="splitter"
        x-class={[
          splitterBase,
          orientation === 'horizontal' ? splitterHorizontal : splitterVertical,
          className,
        ]}
        {...rest}
      >
        {items}
      </div>
    </SplitterContext.Provider>
  );
}

// SplitterPane
type SplitterPaneProps = {
  /** Minimum size in percent of the pane area. */
  min?: number;
  /** Maximum size in percent of the pane area. */
  max?: number;
  children?: ReactNode;
  className?: string;
} & Omit<ComponentPropsWithoutRef<'div'>, 'min' | 'max'>;

/* Panes are flex-grow ratios over a zero basis (the antd Splitter
   technique): the panes share the container's free space — the area
   left after the divider hit strips — in proportion to their percent
   size, so `sizes` sums to 100 with no overflow regardless of how
   wide the dividers render (24px, or 44px for coarse pointers). The
   flexGrow value itself is injected inline by the group. */
const paneBase = css`
  box-sizing: border-box;
  flex-basis: 0;
  flex-shrink: 0;
  min-width: 0;
  min-height: 0;
  overflow: auto;
`;

export function SplitterPane({
  // eslint-disable-next-line @typescript-eslint/no-unused-vars -- 分栏约束由 <Splitter> 消费，这里解构只为从透传的 DOM props 中剥离 min/max
  min, max,
  children,
  className,
  ...rest
}: SplitterPaneProps) {
  useSplitterMembership();
  return (
    <div
      data-slot="pane"
      x-class={[paneBase, className]}
      {...rest}
    >
      {children}
    </div>
  );
}

// Splitter divider
/* 24px hit strip (WCAG 2.5.8) carrying a 2px hairline: the bar paints
   only the content box (background-clip) while the padded element
   keeps the minimum target; hover and focus flood the whole strip
   with a subtle wash and center a primary hairline, so the drag
   affordance reads clearly without widening the grip. Coarse
   pointers get 44px (WCAG 2.5.5). The strip relies on the default
   content-box sizing — see css-box-sizing.test.ts REMOVED_FAMILIES. */
const dividerBase = css`
  flex: 0 0 auto;
  background: var(--haze-color-border);
  background-clip: content-box;
  transition: background var(--haze-duration-fast);
  touch-action: none;

  &:hover,
  &:focus-visible {
    background:
      linear-gradient(
          to right,
          transparent 0,
          var(--haze-color-primary) 50%,
          transparent 100%
        )
        center / 2px 100% no-repeat,
      var(--haze-color-bg-subtle);
  }

  &:focus-visible {
    outline: none;
    box-shadow: inset 0 0 0 2px var(--haze-color-focus-ring);
  }

  @media (forced-colors: active) {
    background: CanvasText;
    background-clip: content-box;

    &:hover,
    &:focus-visible {
      background: Highlight;
      background-clip: content-box;
    }

    &:focus-visible {
      outline: 2px solid Highlight;
      outline-offset: -2px;
    }
  }
`;

const dividerHorizontal = css`
  width: 2px;
  height: 100%;
  padding-inline: calc((var(--haze-space-6) - 2px) / 2);
  cursor: col-resize;

  @media (pointer: coarse) {
    padding-inline: calc((44px - 2px) / 2);
  }
`;

const dividerVertical = css`
  height: 2px;
  width: 100%;
  padding-block: calc((var(--haze-space-6) - 2px) / 2);
  cursor: row-resize;

  /* Horizontal grip: the centered hairline runs along the
   * inline axis, so the gradient is vertical. */
  &:hover,
  &:focus-visible {
    background:
      linear-gradient(
          to bottom,
          transparent 0,
          var(--haze-color-primary) 50%,
          transparent 100%
        )
        center / 100% 2px no-repeat,
      var(--haze-color-bg-subtle);
  }

  @media (pointer: coarse) {
    padding-block: calc((44px - 2px) / 2);
  }
`;

export type { SplitterProps, SplitterPaneProps };
