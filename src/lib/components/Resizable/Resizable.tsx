import type {
  ComponentPropsWithoutRef,
  CSSProperties,
  KeyboardEvent as ReactKeyboardEvent,
  PointerEvent as ReactPointerEvent,
  ReactNode,
} from 'react';
import type { ControlOrValue } from 'react-use-control';

import { css } from '@linaria/core';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { isControl, useControl, useThru, watch } from 'react-use-control';

/**
 * px size overrides per panel id. A panel without an entry falls back to
 * its `defaultSize`; "explicitly sized" panels (those declaring
 * `defaultSize`) are the only ones that carry resizable state.
 */
type PanelSizes = Record<string, number>;

/** Live description of a panel, registered with its group by effect.
 * Handles resolve their neighbours through the DOM and read their
 * resize contract through this api — no index injection, so children
 * arrays, fragments and nested groups all resolve correctly. */
type PanelApi = {
  /** The panel declares `defaultSize` — participates in resize & commit. */
  fixed: boolean;
  defaultSize: number;
  minSize: number;
  maxSize: number | undefined;
  /** Effective (collapsible-gated) collapse flag. */
  collapsed: boolean;
  setCollapsed: (next: boolean) => void;
};

type ResizableContextValue = {
  direction: 'horizontal' | 'vertical';
  sizes: PanelSizes;
  /** Applies px overrides; returns whether any panel visibly changed. */
  applySizes: (patch: PanelSizes) => boolean;
  /** Fires `onResizeCommit` with every fixed panel's effective px. */
  commitSizes: () => void;
  /** Drops one panel's override so a fresh declaration (defaultSize /
   * min / max change) takes effect immediately — the override was
   * negotiated against the old declaration and is stale by definition. */
  clearOverride: (id: string) => void;
  getPanelApi: (id: string | undefined) => PanelApi | undefined;
  registerPanel: (id: string, api: PanelApi) => () => void;
  /** Pointer-drag ownership: the ids the in-flight gesture owns. A
   * panel under gesture keeps its override until the gesture ends. */
  markGesture: (ids: readonly string[]) => void;
  endGesture: () => void;
  isGesturePanel: (id: string) => boolean;
};

const ResizableContext = createContext<ResizableContextValue | undefined>(
  undefined
);

function useResizableContext() {
  const ctx = useContext(ResizableContext);
  if (!ctx) {
    throw new Error(
      'Resizable sub-components must be used within <ResizableGroup>'
    );
  }
  return ctx;
}

/** Arrow-key step in px (WCAG 2.5.7: the drag-styled handle must be
 * fully operable without a pointer). */
const KEYBOARD_STEP = 16;

/** Home/End park the leading panel at its clamp — a delta so large the
 * clamp math saturates, without overflowing. */
const PARK_DELTA = Number.MAX_SAFE_INTEGER;

const noop = (): void => undefined;

const EMPTY_GESTURE_IDS: ReadonlySet<string> = new Set<string>();

function clampRange(
  value: number,
  min: number,
  max: number | undefined
): number {
  const capped = Math.max(value, min);
  return max === undefined ? capped : Math.min(capped, max);
}

/* Adjacent-panel resolution happens on the DOM: panels and handles are
   siblings inside the group container, so `previousElementSibling` /
   `nextElementSibling` walks find the geometric neighbours regardless of
   the React tree shape (arrays, fragments, conditionals). The walk stops
   at nested groups — an outer handle must never reach across an inner
   group's boundary. */
function panelSibling(
  el: HTMLElement,
  dir: 'previousElementSibling' | 'nextElementSibling'
): HTMLElement | undefined {
  let node: Element | null = el[dir];
  while (node !== null) {
    if (
      node instanceof HTMLElement &&
      node.dataset.slot === 'resizable-panel'
    ) {
      return node;
    }
    if (
      node instanceof HTMLElement &&
      node.dataset.slot === 'resizable-group'
    ) {
      return undefined;
    }
    node = node[dir];
  }
  return undefined;
}

/** The panel's fixed px size as rendered — the inline flex basis we
 * control. Collapsed panels read 0; flexible panels (grow) and anything
 * that is not a panel read undefined. Reading the rendered basis keeps
 * pointer and keyboard math in sync with what is on screen without
 * layout measurement (jsdom-friendly, subpixel-exact). */
function readFixedSize(panel: HTMLElement | undefined): number | undefined {
  if (panel?.dataset.slot !== 'resizable-panel') {
    return undefined;
  }
  if (panel.dataset.collapsed !== undefined) return 0;
  if (panel.style.flexGrow === '1') return undefined;
  const px = Number.parseFloat(panel.style.flexBasis);
  return Number.isFinite(px) ? px : undefined;
}

// ResizableGroup
type ResizableGroupProps = {
  direction?: 'horizontal' | 'vertical';
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
  /** Fired when a drag or keyboard resize ends: the effective px size of
   * every explicitly sized panel, keyed by panel id — a shape ready to
   * persist. Collapsed panels report 0. */
  onResizeCommit?: (sizes: Record<string, number>) => void;
};

const groupBase = css`
  display: flex;
  overflow: hidden;
  box-sizing: border-box;
  min-width: 0;
  min-height: 0;
  /* Nested groups are flex items of their parent group and grow into the
     space the parent's fixed panels leave behind. Outside a flex parent
     the flex-* properties are inert, so top-level usage is unaffected. */
  flex: 1 1 0;
`;

const groupHorizontal = css`
  flex-direction: row;
  height: 100%;
`;

const groupVertical = css`
  flex-direction: column;
  width: 100%;
`;

export function ResizableGroup({
  direction = 'horizontal',
  children,
  className,
  style,
  onResizeCommit,
}: ResizableGroupProps) {
  const [sizes, setSizes] = useState<PanelSizes>({});
  const sizesRef = useRef<PanelSizes>({});
  const panelsRef = useRef(new Map<string, PanelApi>());
  // Panels owned by the in-flight pointer gesture. Bumping
  // `gestureVersion` re-renders the context consumers once per gesture
  // boundary, which is what lets panels digest declaration changes that
  // arrived mid-gesture after the gesture ends.
  const gestureIdsRef = useRef<ReadonlySet<string>>(EMPTY_GESTURE_IDS);
  const [gestureVersion, setGestureVersion] = useState(0);

  const applySizes = useCallback((patch: PanelSizes): boolean => {
    const prev = sizesRef.current;
    // Rebuild without delete: patched ids are dropped then re-added
    // (or omitted when they land exactly on the default — resets leave
    // no no-op entries behind and commit payloads stay honest).
    const next: PanelSizes = {};
    for (const [id, px] of Object.entries(prev)) {
      if (id in patch) continue;
      next[id] = px;
    }
    let changed = false;
    for (const [id, px] of Object.entries(patch)) {
      const api = panelsRef.current.get(id);
      const before = prev[id] ?? api?.defaultSize;
      if (before === px) continue;
      changed = true;
      if (px === api?.defaultSize) continue;
      next[id] = px;
    }
    if (changed) {
      sizesRef.current = next;
      setSizes(next);
    }
    return changed;
  }, []);

  const commitSizes = useCallback(() => {
    if (!onResizeCommit) return;
    const record: Record<string, number> = {};
    for (const [id, api] of panelsRef.current) {
      if (!api.fixed) continue;
      record[id] = api.collapsed
        ? 0
        : (sizesRef.current[id] ?? api.defaultSize);
    }
    onResizeCommit(record);
  }, [onResizeCommit]);

  const clearOverride = useCallback((id: string) => {
    if (!(id in sizesRef.current)) return;
    const next: PanelSizes = {};
    for (const [key, px] of Object.entries(sizesRef.current)) {
      if (key !== id) next[key] = px;
    }
    sizesRef.current = next;
    setSizes(next);
  }, []);

  const markGesture = useCallback((ids: readonly string[]) => {
    gestureIdsRef.current = new Set(ids);
    setGestureVersion((v) => v + 1);
  }, []);

  const endGesture = useCallback(() => {
    gestureIdsRef.current = EMPTY_GESTURE_IDS;
    setGestureVersion((v) => v + 1);
  }, []);

  const isGesturePanel = useCallback(
    (id: string) => gestureIdsRef.current.has(id),
    []
  );

  const getPanelApi = useCallback(
    (id: string | undefined) =>
      id !== undefined ? panelsRef.current.get(id) : undefined,
    []
  );

  const registerPanel = useCallback((id: string, api: PanelApi) => {
    panelsRef.current.set(id, api);
    return () => {
      panelsRef.current.delete(id);
    };
  }, []);

  const contextValue = useMemo<ResizableContextValue>(
    () => ({
      direction,
      sizes,
      applySizes,
      commitSizes,
      clearOverride,
      getPanelApi,
      registerPanel,
      markGesture,
      endGesture,
      isGesturePanel,
    }),
    [
      direction,
      sizes,
      applySizes,
      commitSizes,
      clearOverride,
      getPanelApi,
      registerPanel,
      markGesture,
      endGesture,
      isGesturePanel,
      gestureVersion,
    ]
  );

  return (
    <ResizableContext.Provider value={contextValue}>
      <div
        data-slot="resizable-group"
        x-class={[
          groupBase,
          direction === 'horizontal' ? groupHorizontal : groupVertical,
          className,
        ]}
        style={style}
      >
        {children}
      </div>
    </ResizableContext.Provider>
  );
}

// ResizablePanel
type ResizablePanelProps = {
  /** Stable identity within the group — the key `onResizeCommit` reports. */
  id: string;
  /** Initial/fallback px size. Omit to make the panel flexible (it grows
   * into the space the fixed panels leave). */
  defaultSize?: number;
  /** px pins honored by both pointer drags and keyboard steps. */
  minSize?: number;
  maxSize?: number;
  /** Opt-in to the collapse feature; without it `collapsed` is inert. */
  collapsible?: boolean;
  collapsed?: ControlOrValue<boolean>;
  onCollapsedChange?: (collapsed: boolean) => void;
  children: ReactNode;
  className?: string;
} & Omit<ComponentPropsWithoutRef<'div'>, 'id'>;

const panelBase = css`
  box-sizing: border-box;
  min-width: 0;
  min-height: 0;
  overflow: auto;
`;

/* After panelBase on purpose: same-specificity source order lets the
   collapsed overrides win while the panel keeps both classes. */
const panelCollapsed = css`
  overflow: hidden;
  visibility: hidden;
`;

export function ResizablePanel({
  id,
  defaultSize,
  minSize,
  maxSize,
  collapsible = false,
  collapsed: collapsedControl,
  onCollapsedChange,
  children,
  className,
  style,
  ...rest
}: ResizablePanelProps) {
  const { sizes, registerPanel, clearOverride, isGesturePanel } =
    useResizableContext();

  // Single source of truth for the declaration: when defaultSize/min/max
  // props change from the outside (typically onResizeCommit written back
  // into a Control), any override negotiated against the old declaration
  // is stale and gets dropped so the new value applies immediately —
  // landing on the new default is flicker-free (same rendered px).
  // Mid-gesture panels are exempt: the gesture owns its override until
  // it ends, and endGesture's context re-render hands control back here.
  const declarationRef = useRef({ defaultSize, minSize, maxSize });
  useEffect(() => {
    const declared = declarationRef.current;
    const changed =
      declared.defaultSize !== defaultSize ||
      declared.minSize !== minSize ||
      declared.maxSize !== maxSize;
    if (!changed) return;
    if (isGesturePanel(id)) return;
    declarationRef.current = { defaultSize, minSize, maxSize };
    clearOverride(id);
  });

  const controlled = isControl(collapsedControl);
  const [collapsed, setCollapsed] = useControl(
    useThru(
      controlled ? collapsedControl : undefined,
      watch((next: boolean) => onCollapsedChange?.(next))
    ),
    controlled ? false : collapsedControl ?? false
  );
  const effectiveCollapsed = collapsible && collapsed;

  useEffect(
    () =>
      registerPanel(id, {
        fixed: defaultSize !== undefined,
        defaultSize: defaultSize ?? 0,
        minSize: minSize ?? 0,
        maxSize,
        collapsed: effectiveCollapsed,
        setCollapsed: collapsible ? setCollapsed : noop,
      }),
    [
      registerPanel,
      id,
      defaultSize,
      minSize,
      maxSize,
      effectiveCollapsed,
      collapsible,
      setCollapsed,
    ]
  );

  const overridden = sizes[id];
  const flexStyle: CSSProperties = effectiveCollapsed
    ? { flexGrow: 0, flexShrink: 0, flexBasis: '0px' }
    : defaultSize === undefined
      ? { flexGrow: 1, flexShrink: 1, flexBasis: '0px' }
      : {
          flexGrow: 0,
          flexShrink: 0,
          flexBasis: `${overridden ?? defaultSize}px`,
        };

  return (
    <div
      data-slot="resizable-panel"
      data-panel-id={id}
      data-collapsed={effectiveCollapsed || undefined}
      x-class={[panelBase, effectiveCollapsed && panelCollapsed, className]}
      style={{ ...style, ...flexStyle }}
      {...rest}
    >
      {children}
    </div>
  );
}

// ResizableHandle
type ResizableHandleProps = {
  className?: string;
} & Omit<ComponentPropsWithoutRef<'div'>, 'className'>;

/* 24px hit strip (WCAG 2.5.8) carrying a 2px hairline: the
   bar paints only the content box (background-clip) while the
   padded element keeps the minimum target; hover and focus
   flood the whole strip with a subtle wash and center a
   primary hairline, so the drag affordance reads clearly
   without widening the grip. Coarse pointers get 44px
   (WCAG 2.5.5). */
const handleBase = css`
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

  /* A collapsed panel ahead turns the grip into an expander — the cursor
     swap is pure CSS so no render-time neighbour sniffing is needed. */
  &:has(+ [data-slot='resizable-panel'][data-collapsed]) {
    cursor: pointer;
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

const handleHorizontal = css`
  width: 2px;
  height: 100%;
  padding-inline: calc((var(--haze-space-6) - 2px) / 2);
  cursor: col-resize;

  @media (pointer: coarse) {
    padding-inline: calc((44px - 2px) / 2);
  }
`;

const handleVertical = css`
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

/** One side of a handle's resize contract, captured at gesture start. */
type PanelSide = {
  id: string;
  start: number;
  min: number;
  max: number | undefined;
  defaultSize: number;
};

type DragState = {
  pointerId: number;
  origin: number;
  lead: PanelSide | null;
  trail: PanelSide | null;
  /** Lead + trail at drag start when both sides are fixed — the pair
   * trades size while the sum stays constant. */
  pairSum: number | null;
};

function resizePatch(
  lead: PanelSide | null,
  trail: PanelSide | null,
  pairSum: number | null,
  delta: number
): PanelSizes {
  const patch: PanelSizes = {};
  if (lead !== null && trail !== null && pairSum !== null) {
    const lo = Math.max(
      lead.min,
      pairSum - (trail.max ?? Number.POSITIVE_INFINITY)
    );
    const hi = Math.min(
      lead.max ?? Number.POSITIVE_INFINITY,
      pairSum - trail.min
    );
    const nextLead = clampRange(lead.start + delta, lo, hi);
    patch[lead.id] = nextLead;
    patch[trail.id] = pairSum - nextLead;
    return patch;
  }
  if (lead !== null) {
    patch[lead.id] = clampRange(lead.start + delta, lead.min, lead.max);
    return patch;
  }
  if (trail !== null) {
    patch[trail.id] = clampRange(trail.start - delta, trail.min, trail.max);
    return patch;
  }
  return patch;
}

export function ResizableHandle({
  className,
  ...rest
}: ResizableHandleProps) {
  const { direction, applySizes, commitSizes, getPanelApi, markGesture, endGesture } =
    useResizableContext();
  const handleRef = useRef<HTMLDivElement | null>(null);
  const dragRef = useRef<DragState | null>(null);
  const dragChangedRef = useRef(false);

  // The separator's value mirrors the rendered basis of the leading
  // fixed panel (trailing as fallback). Sibling styles are committed
  // before effects run, so the DOM read is always in sync; the guarded
  // updater keeps re-renders from looping.
  const [aria, setAria] = useState<
    { now: number; min?: number; max?: number } | undefined
  >(undefined);
  useEffect(() => {
    const el = handleRef.current;
    if (el === null) return;
    const read = (panel: HTMLElement | undefined) => {
      const now = readFixedSize(panel);
      if (now === undefined) return undefined;
      const panelId = panel?.dataset.panelId;
      const api =
        panelId === undefined ? undefined : getPanelApi(panelId);
      return { now, min: api?.minSize, max: api?.maxSize };
    };
    const next =
      read(panelSibling(el, 'previousElementSibling')) ??
      read(panelSibling(el, 'nextElementSibling'));
    setAria((prev) =>
      prev?.now === next?.now && prev?.min === next?.min && prev?.max === next?.max
        ? prev
        : next
    );
  });

  const axisOf = (event: ReactPointerEvent<HTMLDivElement>): number =>
    direction === 'horizontal' ? event.clientX : event.clientY;

  const describeSide = (
    panel: HTMLElement | undefined
  ): PanelSide | null => {
    const panelId = panel?.dataset.panelId;
    if (panel === undefined || panelId === undefined) return null;
    const api = getPanelApi(panelId);
    if (api === undefined || api.collapsed || !api.fixed) return null;
    const start = readFixedSize(panel);
    if (start === undefined) return null;
    return {
      id: panelId,
      start,
      min: api.minSize,
      max: api.maxSize,
      defaultSize: api.defaultSize,
    };
  };

  const collapsedApi = (
    panel: HTMLElement | undefined
  ): PanelApi | undefined => {
    const api = getPanelApi(panel?.dataset.panelId);
    return api?.collapsed ? api : undefined;
  };

  const sidesOf = (el: HTMLElement) => ({
    lead: describeSide(panelSibling(el, 'previousElementSibling')),
    trail: describeSide(panelSibling(el, 'nextElementSibling')),
    expand: collapsedApi(panelSibling(el, 'previousElementSibling')) ??
      collapsedApi(panelSibling(el, 'nextElementSibling')),
  });

  const resetNeighbors = (el: HTMLElement) => {
    const { lead, trail } = sidesOf(el);
    const patch: PanelSizes = {};
    if (lead !== null) patch[lead.id] = lead.defaultSize;
    if (trail !== null) patch[trail.id] = trail.defaultSize;
    if (applySizes(patch)) commitSizes();
  };

  const handlePointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (event.button !== 0) return;
    const el = event.currentTarget;
    const { lead, trail, expand } = sidesOf(el);
    if (expand !== undefined) {
      // Degenerate expander: the adjacent collapsible panel is collapsed,
      // so there is nothing to drag — activate expands it.
      event.preventDefault();
      expand.setCollapsed(false);
      return;
    }
    if (lead === null && trail === null) return;
    event.preventDefault();
    const gestureIds: string[] = [];
    if (lead !== null) gestureIds.push(lead.id);
    if (trail !== null) gestureIds.push(trail.id);
    markGesture(gestureIds);
    dragRef.current = {
      pointerId: event.pointerId,
      origin: axisOf(event),
      lead,
      trail,
      pairSum: lead !== null && trail !== null ? lead.start + trail.start : null,
    };
    dragChangedRef.current = false;
    if (typeof el.setPointerCapture === 'function') {
      try {
        el.setPointerCapture(event.pointerId);
      } catch {
        // pointer already released — the gesture still tracks
      }
    }
  };

  const handlePointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    if (drag?.pointerId !== event.pointerId) return;
    const patch = resizePatch(
      drag.lead,
      drag.trail,
      drag.pairSum,
      axisOf(event) - drag.origin
    );
    if (applySizes(patch)) dragChangedRef.current = true;
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
    // pointercancel aborts the gesture: the sizes moved live, but the
    // consumer does not get a commit for an interrupted drag.
    if (event.type === 'pointerup' && dragChangedRef.current) {
      commitSizes();
    }
    dragChangedRef.current = false;
    // Release gesture ownership last — the context re-render it triggers
    // lets panels digest declaration changes that arrived mid-gesture.
    endGesture();
  };

  const handleKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    const growKey = direction === 'horizontal' ? 'ArrowRight' : 'ArrowDown';
    const shrinkKey = direction === 'horizontal' ? 'ArrowLeft' : 'ArrowUp';
    const { key } = event;
    const el = event.currentTarget;
    const { lead, trail, expand } = sidesOf(el);

    if (expand !== undefined) {
      if (key === 'Enter') {
        event.preventDefault();
        expand.setCollapsed(false);
      }
      return;
    }
    if (key === 'Enter') {
      event.preventDefault();
      resetNeighbors(el);
      return;
    }
    if (
      key !== growKey &&
      key !== shrinkKey &&
      key !== 'Home' &&
      key !== 'End'
    ) {
      return;
    }
    if (lead === null && trail === null) return;
    event.preventDefault();
    const pairSum =
      lead !== null && trail !== null ? lead.start + trail.start : null;
    const delta =
      key === growKey
        ? KEYBOARD_STEP
        : key === shrinkKey
          ? -KEYBOARD_STEP
          : key === 'Home'
            ? -PARK_DELTA
            : PARK_DELTA;
    if (applySizes(resizePatch(lead, trail, pairSum, delta))) {
      commitSizes();
    }
  };

  return (
    <div
      ref={handleRef}
      data-slot="resizable-handle"
      {...rest}
      role="separator"
      aria-orientation={direction === 'horizontal' ? 'vertical' : 'horizontal'}
      tabIndex={0}
      aria-valuenow={aria?.now}
      aria-valuemin={aria?.min}
      aria-valuemax={aria?.max}
      onKeyDown={handleKeyDown}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
      onDoubleClick={() => {
        const el = handleRef.current;
        if (el !== null) resetNeighbors(el);
      }}
      x-class={[
        handleBase,
        direction === 'horizontal' ? handleHorizontal : handleVertical,
        className,
      ]}
    />
  );
}

export type {
  ResizableGroupProps,
  ResizablePanelProps,
  ResizableHandleProps,
};
