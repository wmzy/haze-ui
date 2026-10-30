import type { ComponentPropsWithRef, ElementType, MouseEvent } from 'react';
import type { ControlOrValue } from 'react-use-control';

import { useControl } from 'react-use-control';

import ToolbarButton from './ToolbarButton';

/**
 * A toolbar item that toggles: ToolbarButton's skin and roving behavior
 * with a pressed state of its own. `pressed` is self-contained by
 * default (no external wiring needed) and switches to external ownership
 * when passed a control. The pressed look is keyed off `aria-pressed`,
 * so the visual state can never drift from what assistive tech announces.
 */
type ToolbarToggleOwnProps = {
  /** Whether the item is pressed; a control for full external ownership. */
  pressed?: ControlOrValue<boolean>;
  variant?: 'solid' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  /** Equal padding on all sides — for icon-only square items. */
  square?: boolean;
  /**
   * Element-agnostic click: whatever element `as` rendered, the
   * consumer's handler fires first — the pressed-state toggle rides
   * after it.
   */
  onClick?: (event: MouseEvent<HTMLElement>) => void;
};

/**
 * Polymorphic like Button's `as`: the skin, the toolbar wiring
 * (`data-haze-toolbar-item`, the roving `tabIndex={-1}`) and the
 * `aria-pressed` state always land on the rendered element.
 * `type='button'` is gated to the native-button shape.
 */
type ToolbarToggleProps<T extends ElementType = 'button'> = ToolbarToggleOwnProps & {
  /** Render element — 'button' (default), 'a', or any component that
   * forwards props and ref to a DOM element (a router Link). */
  as?: T;
} & Omit<ComponentPropsWithRef<T>, keyof ToolbarToggleOwnProps | 'as' | 'type' | 'aria-pressed'>;

/**
 * Delegates rendering to ToolbarButton (ButtonLink's delegation tier —
 * same skin, same roving wiring, one code path per family, so the
 * pressed-well arm lives in ToolbarButton only). The toggle contributes
 * exactly its own delta: the `pressed` control wired to `aria-pressed`,
 * the click that flips it, and its data-slot.
 */
export default function ToolbarToggle<T extends ElementType = 'button'>({
  pressed: pressedControl,
  variant = 'ghost',
  size = 'md',
  square = false,
  as,
  className,
  onClick,
  ...rest
}: ToolbarToggleProps<T>) {
  const [pressed, setPressed] = useControl(pressedControl, false);
  // The element-agnostic delta rides as one typed props object: every
  // key is valid on whatever element `as` renders (ButtonLink's
  // delegation passes concrete props the same way), and ToolbarButton
  // still type-checks everything else it owns.
  const toggleProps = {
    'data-slot': 'toolbar-toggle',
    'aria-pressed': pressed,
    onClick: (event: MouseEvent<HTMLElement>) => {
      setPressed(!pressed);
      // Element-agnostic event: whatever element `as` rendered, the
      // consumer's handler sees it, typed element-agnostic above.
      onClick?.(event);
    },
  } as ComponentPropsWithRef<T>;
  return (
    <ToolbarButton<T>
      as={as}
      variant={variant}
      size={size}
      square={square}
      className={className}
      {...toggleProps}
      {...rest}
    />
  );
}

export type { ToolbarToggleOwnProps, ToolbarToggleProps };
