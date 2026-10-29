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

import {
  axisKeyDelta,
  endPointerDrag,
  gripMirrored,
  PARK_DELTA,
} from '../../utils/grip-gesture';
import { gripBase, gripHorizontal, gripVertical } from '../../utils/grip-skin';
import { clamp, quantize } from '../../utils/math';
import { capturePointer } from '../../utils/pointer-capture';
import { useStrings } from '../LocaleProvider';

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

  const strings = useStrings('splitter');

  /** Pre-collapse size per pane, so the expand trigger restores what the
   * collapse trigger took (antd semantics). Sizes dragged to zero have
   * no memory — the fallback is half the pair, clamped. */
  const restoreRef = useRef<Map<number, number>>(new Map());

  const collapsibleOf = (index: number): boolean =>
    panes[index]?.props.collapsible === true;

  /** Collapsedness is derived, not stored: a collapsible pane sitting at
   * size 0 IS collapsed. Consumers forcing a 0 entry without the flag
   * get the same divider behavior (min suspended) but no triggers. */
  const collapsed = (index: number): boolean => paneSize(index) === 0;

  /** A collapsed pane suspends its min: the divider can drag it straight
   * back out (and aria-valuemin reports the reachable range). */
  const declarationWith = (index: number): PaneDeclaration => {
    const decl = declarationOf(index);
    return collapsed(index) ? { ...decl, min: 0 } : decl;
  };

  /** Collapse/expand trigger on a divider: zeroes one pane of the pair
   * (the partner absorbs its share) or restores it, always through the
   * pair-preserving applyDivider. */
  const togglePane = (paneIndex: number, partnerIndex: number) => {
    const leadIndex = Math.min(paneIndex, partnerIndex);
    const pairSum = paneSize(leadIndex) + paneSize(leadIndex + 1);
    if (collapsed(paneIndex)) {
      const { lo, hi } = dividerBounds(
        declarationOf(paneIndex),
        declarationOf(partnerIndex),
        pairSum
      );
      const target = clamp(
        restoreRef.current.get(paneIndex) ?? pairSum / 2,
        lo,
        hi
      );
      restoreRef.current.delete(paneIndex);
      const leadTarget =
        paneIndex === leadIndex ? target : pairSum - target;
      applyDivider(leadIndex, leadTarget, pairSum);
    } else {
      restoreRef.current.set(paneIndex, paneSize(paneIndex));
      applyDivider(
        leadIndex,
        paneIndex === leadIndex ? 0 : pairSum,
        pairSum
      );
    }
  };

  /** RTL mirror: in a horizontal splitter flex paints the DOM-lead pane
   * on the RIGHT under rtl, so rightward motion moves the divider INTO
   * it and must shrink it (read at event time — the
   * src/lib/utils/direction convention). Vertical splitters are
   * direction-invariant. */
  const mirrored = (): boolean =>
    gripMirrored(orientation, containerRef.current);

  /** Sizes are emitted rounded to 2 decimals (quantize's 100 tier) so
   * consumer payloads stay clean; the trailing pane is derived
   * (pairSum − lead) so the pair sum is preserved exactly. */
  const applyDivider = (
    leadIndex: number,
    nextLead: number,
    pairSum: number
  ) => {
    const lead = quantize(nextLead, 100);
    const trail = quantize(pairSum - lead, 100);
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
      declarationWith(index),
      declarationWith(index + 1),
      pairSum
    );
    event.preventDefault();
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
    capturePointer(event.currentTarget, event.pointerId);
  };

  const moveDrag = (event: ReactPointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    if (drag?.pointerId !== event.pointerId) return;
    // A drag re-sizes a collapsed pane directly — its stored pre-collapse
    // size is stale, the drag IS the chosen size.
    if (collapsed(drag.leadIndex)) restoreRef.current.delete(drag.leadIndex);
    if (collapsed(drag.leadIndex + 1)) {
      restoreRef.current.delete(drag.leadIndex + 1);
    }
    const raw = axisOf(event) - drag.origin;
    const deltaPercent = ((mirrored() ? -raw : raw) / drag.extent) * 100;
    const nextLead = clamp(drag.startLead + deltaPercent, drag.lo, drag.hi);
    if (quantize(nextLead, 100) === quantize(drag.lastLead, 100)) return;
    drag.lastLead = nextLead;
    applyDivider(drag.leadIndex, nextLead, drag.pairSum);
  };

  const endDrag = (event: ReactPointerEvent<HTMLDivElement>) => {
    endPointerDrag(dragRef, event);
  };

  const handleDividerKeyDown = (
    index: number,
    event: ReactKeyboardEvent<HTMLDivElement>
  ) => {
    const delta = axisKeyDelta(event.key, {
      orientation,
      rtl: mirrored(),
      step: KEYBOARD_STEP,
    });
    if (delta === null) return;
    const pairSum = paneSize(index) + paneSize(index + 1);
    const { lo, hi } = dividerBounds(
      declarationWith(index),
      declarationWith(index + 1),
      pairSum
    );
    const current = paneSize(index);
    event.preventDefault();
    const nextLead = clamp(current + delta, lo, hi);
    if (nextLead === current) return;
    applyDivider(index, nextLead, pairSum);
  };

  const items: ReactNode[] = [];
  panes.forEach((pane, index) => {
    if (index > 0) {
      const leadIndex = index - 1;
      const pairSum = paneSize(leadIndex) + paneSize(index);
      const { lo, hi } = dividerBounds(
        declarationWith(leadIndex),
        declarationWith(index),
        pairSum
      );
      /* The bar is a wrapper so the separator role and the collapse
       * triggers stay SIBLINGS — a focusable separator is
       * children-presentational (ARIA 1.2), buttons inside it would be
       * swallowed by assistive tech. */
      items.push(
        <div
          key={`splitter-divider-${index}`}
          data-slot="divider"
          x-class={[
            gripBase,
            dividerShell,
            orientation === 'horizontal' ? gripHorizontal : gripVertical,
          ]}
        >
          <div
            data-slot="divider-handle"
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
            x-class={[dividerHandle]}
          />
          {collapsibleOf(leadIndex) && (
            <button
              key={`splitter-collapse-lead-${index}`}
              type="button"
              data-slot="divider-collapse"
              data-side="lead"
              aria-expanded={!collapsed(leadIndex)}
              aria-label={
                collapsed(leadIndex)
                  ? strings.expandLead
                  : strings.collapseLead
              }
              onClick={() => togglePane(leadIndex, index)}
              x-class={[
                collapseButtonBase,
                orientation === 'horizontal'
                  ? collapseLeadHorizontal
                  : collapseLeadVertical,
              ]}
            >
              {collapseChevron}
            </button>
          )}
          {collapsibleOf(index) && (
            <button
              key={`splitter-collapse-trail-${index}`}
              type="button"
              data-slot="divider-collapse"
              data-side="trail"
              aria-expanded={!collapsed(index)}
              aria-label={
                collapsed(index)
                  ? strings.expandTrail
                  : strings.collapseTrail
              }
              onClick={() => togglePane(index, leadIndex)}
              x-class={[
                collapseButtonBase,
                orientation === 'horizontal'
                  ? collapseTrailHorizontal
                  : collapseTrailVertical,
              ]}
            >
              {collapseChevron}
            </button>
          )}
        </div>
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
  /** Opt the pane into divider collapse triggers: every divider
   * touching it grows a button that zeroes the pane (the partner
   * absorbs its share) and, once collapsed, expands it back to its
   * pre-collapse size. */
  collapsible?: boolean;
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
  // eslint-disable-next-line @typescript-eslint/no-unused-vars -- 分栏约束由 <Splitter> 消费，这里解构只为从透传的 DOM props 中剥离 min/max/collapsible
  min, max, collapsible,
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
/* Splitter-local chrome layered on the shared grip skin
   (utils/grip-skin): the bar is a positioning context for the drag
   handle (which owns role=separator) and the collapse triggers — focus
   styling keys off the focused descendant via :has since the bar
   itself is inert. */
const dividerShell = css`
  position: relative;

  /* Collapse triggers stay keyboard-reachable while hidden (opacity,
   * not display) and surface on bar hover, on any focused descendant
   * (the separator grip or a trigger itself), and — for pointing —
   * whenever the pointer can actually reach them. */
  &:hover > [data-slot='divider-collapse'],
  &:focus-within > [data-slot='divider-collapse'],
  > [data-slot='divider-collapse']:focus-visible {
    opacity: 1;
    pointer-events: auto;
  }
`;

/* The drag/keyboard surface fills the bar's padding box (inset: 0 on
   an absolutely positioned child spans padding edges), so pointer
   events and the separator role cover the full 24/44px strip while
   the bar keeps painting only its 2px content box. */
const dividerHandle = css`
  position: absolute;
  inset: 0;
  touch-action: none;

  &:focus-visible {
    outline: none;
  }
`;

/* One chevron points INTO the pane its trigger collapses; the
   per-position classes rotate it (left base). */
const collapseChevron = (
  <svg
    width="12"
    height="12"
    viewBox="0 0 16 16"
    fill="none"
    aria-hidden="true"
    focusable="false"
  >
    <path
      d="M10.5 3 5.5 8l5 5"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

/* 24x24 (WCAG 2.5.8) trigger centered on the bar ends. Hidden by
   opacity — never display — so keyboard focus (which reveals it via
   the bar's focus-within rule) keeps it in the tab order. */
const collapseButtonBase = css`
  position: absolute;
  box-sizing: border-box;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: var(--haze-space-6);
  height: var(--haze-space-6);
  padding: 0;
  border: none;
  border-radius: var(--haze-radius-sm);
  background: var(--haze-color-bg-muted);
  color: var(--haze-color-text-secondary);
  cursor: pointer;
  opacity: 0;
  pointer-events: none;
  transition: opacity var(--haze-duration-fast);

  &:hover {
    color: var(--haze-color-text);
  }

  &:focus-visible {
    outline: 2px solid var(--haze-color-focus-ring);
    outline-offset: 1px;
  }

  @media (forced-colors: active) {
    border: 1px solid ButtonBorder;
    background: Canvas;
  }
`;

/* Horizontal bar (vertical grip): triggers park at the block ends,
   centered on the 24/44px strip width. DOM-lead paints on the RIGHT
   under rtl, so both horizontal chevrons flip. */
const collapseLeadHorizontal = css`
  top: var(--haze-space-1);
  left: 50%;
  transform: translateX(-50%);

  & svg {
    transform: rotate(0deg);
  }

  html[dir='rtl'] & svg {
    transform: rotate(180deg);
  }
`;

const collapseTrailHorizontal = css`
  bottom: var(--haze-space-1);
  left: 50%;
  transform: translateX(-50%);

  & svg {
    transform: rotate(180deg);
  }

  html[dir='rtl'] & svg {
    transform: rotate(0deg);
  }
`;

/* Vertical bar (horizontal grip): logical inline ends, so rtl mirrors
   placement automatically; up/down chevrons are direction-invariant. */
const collapseLeadVertical = css`
  inset-inline-start: var(--haze-space-1);
  top: 50%;
  transform: translateY(-50%);

  & svg {
    transform: rotate(90deg);
  }
`;

const collapseTrailVertical = css`
  inset-inline-end: var(--haze-space-1);
  top: 50%;
  transform: translateY(-50%);

  & svg {
    transform: rotate(-90deg);
  }
`;

export type { SplitterProps, SplitterPaneProps };
