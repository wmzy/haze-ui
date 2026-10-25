import type { ComponentPropsWithRef, ElementType } from 'react';
import type { ControlOrValue } from 'react-use-control';

import type { ToggleCoreProps } from './ToggleCore';

import { useControl } from 'react-use-control';

import ToggleCore from './ToggleCore';

type ToggleOwnProps = {
  /** Whether the toggle is pressed; a control for full external ownership. */
  pressed?: ControlOrValue<boolean>;
  size?: 'sm' | 'md' | 'lg';
  /** Equal padding on all sides — for icon-only square toggles. */
  square?: boolean;
};

/**
 * Polymorphic like Button's `as` (delegated to {@link ToggleCore}):
 * `as='a'` renders the toggle skin on a real anchor — href/link
 * semantics with the same `aria-pressed` wiring.
 */
type ToggleProps<T extends ElementType = 'button'> = ToggleOwnProps & {
  /** Render element — 'button' (default), 'a', or any component that
   * forwards props and ref to a DOM element (a router Link). */
  as?: T;
} & Omit<ComponentPropsWithRef<T>, keyof ToggleOwnProps | 'as' | 'type' | 'aria-pressed'>;

/**
 * A momentary pressed-state button (aria-pressed) for one-shot modes —
 * bold, mute, grid/list view. `pressed` is one prop, two modes: a plain
 * boolean leaves state internal, a control hands ownership to the caller.
 */
export default function Toggle<T extends ElementType = 'button'>({
  pressed: pressedControl,
  size,
  square,
  as,
  className,
  onClick,
  ...rest
}: ToggleProps<T>) {
  const [pressed, setPressed] = useControl(pressedControl, false);

  // The generic Omit arms are opaque to the type checker; at runtime
  // rest is exactly the Core's remainder — Toggle owns or redeclares
  // every other key (wiring lands after the spread, so it wins).
  return (
    <ToggleCore
      {...(rest as unknown as ToggleCoreProps<T>)}
      as={as}
      pressed={pressed}
      onPressedChange={setPressed}
      onNativeClick={onClick}
      size={size}
      square={square}
      className={className}
    />
  );
}

export type { ToggleOwnProps, ToggleProps };
