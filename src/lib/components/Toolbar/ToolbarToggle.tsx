import type { ComponentPropsWithRef, ElementType, MouseEvent } from 'react';
import type { ControlOrValue } from 'react-use-control';

import { css } from '@linaria/core';
import { useControl } from 'react-use-control';

import { base, sizes, squareSizes, variants } from '../Button/styles';

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

const toolbarItem = css`
  /* Most meaningful on the default ghost: a pressed item reads as
   * engaged with a tinted well instead of a transparent surface. */
  &[aria-pressed='true'] {
    background: var(--haze-color-primary-subtle);
    color: var(--haze-color-primary);

    &:hover {
      background: var(--haze-color-bg-muted);
    }

    &:active {
      background: var(--haze-color-bg-muted);
    }
  }
`;

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
  const sizeClass = square ? squareSizes[size] : sizes[size];
  const Tag = (as ?? 'button');
  // Only the native button shape carries type; anchors and custom
  // components keep their own element semantics.
  const isNativeButton = as === undefined || as === 'button';
  return (
    <Tag
      {...(isNativeButton ? { type: 'button' as const } : {})}
      data-slot="toolbar-toggle"
      data-haze-toolbar-item=""
      tabIndex={-1}
      aria-pressed={pressed}
      x-class={[base, variants[variant], sizeClass, toolbarItem, className]}
      onClick={(event: MouseEvent<HTMLElement>) => {
        setPressed(!pressed);
        // Element-agnostic event: whatever element `as` rendered, the
        // consumer's handler sees it, typed element-agnostic above.
        onClick?.(event);
      }}
      {...rest}
    />
  );
}

export type { ToolbarToggleOwnProps, ToolbarToggleProps };
