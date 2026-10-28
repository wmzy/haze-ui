import type { ReactNode, Ref } from 'react';
import type { ControlOrValue } from 'react-use-control';
import type { CollisionPadding } from '../../utils/collision';

import { css } from '@linaria/core';
import { useId, useImperativeHandle, useMemo, useRef } from 'react';
import { useControl } from 'react-use-control';

import { classnames } from '../../utils/classnames';
import { FloatingPanel, FloatingTriggerSpan, useFloating } from '../../utils/floating';
import { panelSurface } from '../../utils/panel-skin';
// Manual merge (not x-class): FloatingPanel appends its `className` prop
// last in its own x-class array, so both consumer classes arrive there
// in order — plain `className` first, the `content` slot after it.

/**
 * Imperative handle exposed through the React 19 `ref` prop (same API
 * choice as VirtualList). `open`/`close` are state writes going through
 * the same `useFloating` path as the trigger's own clicks — the popover
 * visibility, animated exit and the toggle-echo reconciliation in the
 * floating engine stay in charge; the handle never calls
 * `showPopover`/`hidePopover` directly.
 */
type PopoverHandle = {
  /** Show the popover, as if the trigger toggled it open. */
  open: () => void;
  /** Close the popover through the animated exit path. */
  close: () => void;
  /** Focus the trigger element. */
  focusTrigger: () => void;
};

/**
 * Semantic slot classes (AntD v6 `classNames` shape): consumer classes
 * appended at the end of each part's class list (able to override
 * component defaults). Popover has exactly two structural parts:
 *
 * - `trigger` — the clickable wrapper around `children`
 * - `content` — the floating panel
 */
type PopoverClassNames = {
  /** The trigger wrapper (the `role="button"` span around `children`). */
  trigger?: string;
  /** The floating panel. */
  content?: string;
};

type PopoverProps = {
  content: ReactNode;
  open?: ControlOrValue<boolean>;
  /**
   * Viewport inset the panel treats as collision space: a number applies
   * to all four edges, an object per edge.
   */
  collisionPadding?: CollisionPadding;
  /**
   * Semantic slot classes (AntD v6 `classNames` shape) — see
   * {@link PopoverClassNames}. `classNames.content` lands after the
   * panel's `className` prop; `classNames.trigger` has no default class
   * to fight with. Omitting it changes nothing.
   */
  classNames?: PopoverClassNames;
  className?: string;
  children: ReactNode;
  ref?: Ref<PopoverHandle>;
};

const container = css`
  position: relative;
  display: inline-flex;
`;

/* Call-site deltas on the shared panel surface (utils/panel-skin): the
 * padding step and the min-width floor size this panel — min-width
 * pairs with padding + the surface's border, whose border-box sizing
 * keeps the floor covering the padding too. */
const panelDeltas = css`
  padding: var(--haze-space-3);
  min-width: var(--haze-popover-min-width, 200px);
`;

export default function Popover({
  content,
  open: openControl,
  collisionPadding,
  classNames,
  className,
  children,
  ref,
}: PopoverProps) {
  const [open, setOpen] = useControl(openControl, false);
  const id = useId();

  const triggerRef = useRef<HTMLSpanElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  // Stable identity: useFloatingPosition re-runs its effect on every
  // change of this object.
  const collision = useMemo(
    () => (collisionPadding === undefined ? undefined : {collisionPadding}),
    [collisionPadding]
  );
  const floating = useFloating({
    open,
    setOpen,
    triggerRef,
    panelRef,
    animated: true,
    collision,
  });

  // Imperative surface: `ref.current?.open()/close()/focusTrigger()`.
  // open/close only write the state the floating engine reacts to (the
  // same path as the trigger's clicks), leaving showPopover/hidePopover
  // and the toggle-echo reconciliation to the engine's effect.
  useImperativeHandle(
    ref,
    () => ({
      open: () => {
        setOpen(true);
      },
      close: () => {
        setOpen(false);
      },
      focusTrigger: () => {
        triggerRef.current?.focus();
      },
    }),
    [setOpen]
  );

  return (
    <span data-slot='popover' className={container}>
      <FloatingTriggerSpan
        ref={triggerRef}
        behavior={floating}
        open={open}
        controlsId={id}
        // Plain className (not x-class): an omitted slot must leave the
        // attribute absent — see FloatingTriggerSpan's own doc.
        className={classNames?.trigger}
      >
        {children}
      </FloatingTriggerSpan>
      <FloatingPanel
        ref={panelRef}
        behavior={floating}
        placement="bottom-span"
        id={id}
        visualClass={panelSurface}
        className={classnames(panelDeltas, className, classNames?.content)}
      >
        {content}
      </FloatingPanel>
    </span>
  );
}

export type { PopoverProps, PopoverHandle, PopoverClassNames };
