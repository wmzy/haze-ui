import type {ComponentPropsWithoutRef, ReactNode, Ref} from 'react';
import type {ControlOrValue} from 'react-use-control';
import type {NavigationMenuClassNames} from './NavigationMenuContext';

import {css} from '@linaria/core';
import {useCallback, useEffect, useId, useMemo, useRef} from 'react';
import {isControl, useControl, useThru, watch} from 'react-use-control';

import {NavigationMenuProvider} from './NavigationMenuContext';

type NavigationMenuProps = {
  /**
   * The item whose panel is open (its `value`), or `null` when every
   * panel is closed. Accepts a control (fully controlled) or a plain
   * value (the uncontrolled default). Uncontrolled menus drive the
   * value themselves from hover/focus/click; controlled ones still
   * raise every intent through `onActiveValueChange` — the parent
   * decides what lands.
   */
  activeValue?: ControlOrValue<string | null>;
  /** Notified on every active-item change, including the null close. */
  onActiveValueChange?: (value: string | null) => void;
  /**
   * Hover dwell (ms) before the FIRST panel opens — moving the pointer
   * across the bar should not flash panels open. Switching between
   * panels while one is already open skips this delay entirely.
   */
  intentDelay?: number;
  /**
   * Pointer grace (ms) after the pointer leaves a trigger or panel —
   * the diagonal travel to the panel body must not close it. Any
   * re-enter (trigger or panel) cancels the countdown.
   */
  graceDelay?: number;
  /**
   * `false` (default) sizes each panel to its content (mega-menu grids,
   * link columns). `true` stretches the panel to its trigger's inline
   * size instead (dropdown-like menus under their trigger).
   */
  stretchToTrigger?: boolean;
  /**
   * Semantic slot classes (AntD v6 `classNames` shape) — see
   * {@link NavigationMenuClassNames}. Declared once here, distributed
   * to every part through context.
   */
  classNames?: NavigationMenuClassNames;
  className?: string;
  /** Forwarded to the root `<nav>` — element access for measurement. */
  ref?: Ref<HTMLElement>;
  /** `<NavigationMenuList>` (usually exactly one). */
  children?: ReactNode;
} & Omit<ComponentPropsWithoutRef<'nav'>, 'className' | 'children' | 'ref'>;

/** Built-in hover dwell (ms) before the first panel opens. */
const DEFAULT_INTENT_DELAY = 100;
/** Built-in pointer grace (ms) after leaving a trigger or panel. */
const DEFAULT_GRACE_DELAY = 300;

const base = css`
  font-family: var(--haze-font-sans);
  font-size: var(--haze-text-sm);
`;

export default function NavigationMenu({
  activeValue: activeValueControl,
  onActiveValueChange,
  intentDelay = DEFAULT_INTENT_DELAY,
  graceDelay = DEFAULT_GRACE_DELAY,
  stretchToTrigger = false,
  classNames,
  className,
  ref,
  children,
  ...rest
}: NavigationMenuProps) {
  const controlled = isControl(activeValueControl);
  const [activeValue, setActiveValue] = useControl<string | null>(
    useThru(
      controlled ? activeValueControl : undefined,
      watch((next) => onActiveValueChange?.(next))
    ),
    controlled ? null : (activeValueControl ?? null)
  );

  // One id seed per menu: stable trigger/panel ids per item value, so
  // aria-controls never dangles across re-renders.
  const idSeed = useId().replace(/[^a-zA-Z0-9]/g, '');
  const contentId = useCallback(
    (value: string) =>
      `haze-nav-menu-${idSeed}-content-${value.replace(/[^a-zA-Z0-9_-]/g, '-')}`,
    [idSeed]
  );
  const triggerId = useCallback(
    (value: string) =>
      `haze-nav-menu-${idSeed}-trigger-${value.replace(/[^a-zA-Z0-9_-]/g, '-')}`,
    [idSeed]
  );

  // Hover choreography: the intent timer delays the first open, the
  // grace timer waits out pointer travel to the panel body. Exactly one
  // of each exists per menu; every entry point cancels both first.
  const intentTimerRef = useRef(0);
  const graceTimerRef = useRef(0);
  const cancelHoverTimers = useCallback(() => {
    window.clearTimeout(intentTimerRef.current);
    window.clearTimeout(graceTimerRef.current);
  }, []);
  useEffect(() => cancelHoverTimers, [cancelHoverTimers]);

  const hoverTrigger = useCallback(
    (value: string) => {
      cancelHoverTimers();
      if (activeValue === value) return;
      if (activeValue !== null) {
        // A panel is already open: switching is instant — the user is
        // traversing the bar, not grazing it.
        setActiveValue(value);
        return;
      }
      intentTimerRef.current = window.setTimeout(
        () => setActiveValue(value),
        intentDelay
      );
    },
    [activeValue, cancelHoverTimers, intentDelay, setActiveValue]
  );

  const scheduleClose = useCallback(() => {
    // Also drops a pending intent: leaving before the dwell never opens.
    cancelHoverTimers();
    if (activeValue === null) return;
    graceTimerRef.current = window.setTimeout(
      () => setActiveValue(null),
      graceDelay
    );
  }, [activeValue, cancelHoverTimers, graceDelay, setActiveValue]);

  const contextValue = useMemo(
    () => ({
      activeValue,
      setActiveValue,
      hoverTrigger,
      scheduleClose,
      cancelHoverTimers,
      contentId,
      triggerId,
      classNames,
      stretchToTrigger,
    }),
    [
      activeValue,
      setActiveValue,
      hoverTrigger,
      scheduleClose,
      cancelHoverTimers,
      contentId,
      triggerId,
      classNames,
      stretchToTrigger,
    ]
  );

  return (
    <NavigationMenuProvider value={contextValue}>
      <nav
        data-slot='navigation-menu'
        ref={ref}
        x-class={[base, classNames?.root, className]}
        {...rest}
      >
        {children}
      </nav>
    </NavigationMenuProvider>
  );
}

export type {NavigationMenuProps};
