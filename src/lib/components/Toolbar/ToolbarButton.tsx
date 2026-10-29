import type { ComponentPropsWithRef, ElementType } from 'react';

import { css } from '@linaria/core';

import { focusRingVisible } from '../../utils/focus-ring';
import { base, sizes, squareSizes, variants } from '../Button/styles';

/**
 * A toolbar item wearing Button's skin — the same `variant`/`size`/
 * `square` props (see ButtonLink for the same styles.ts reuse), quieter
 * by default (ghost) than a standalone Button, with toolbar behavior
 * layered on: it registers for the owning Toolbar's roving tabindex
 * (rendered inert, the roving effect promotes exactly one item to tab
 * stop) and arrow-key travel.
 *
 * Toggle items report their state with `aria-pressed` — the pressed
 * look is keyed off that state attribute, so no extra prop can drift
 * out of sync with what assistive tech announces.
 */
type ToolbarButtonOwnProps = {
  variant?: 'solid' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  square?: boolean;
};

/**
 * Polymorphic like Button's `as`: the skin and the toolbar wiring
 * (`data-haze-toolbar-item`, the roving `tabIndex={-1}`) always land on
 * the rendered element — `as='a'` renders a link-shaped toolbar item
 * that still joins the roving model. `type='button'` is gated to the
 * native-button shape.
 */
type ToolbarButtonProps<T extends ElementType = 'button'> = ToolbarButtonOwnProps & {
  /** Render element — 'button' (default), 'a', or any component that
   * forwards props and ref to a DOM element (a router Link). */
  as?: T;
} & Omit<ComponentPropsWithRef<T>, keyof ToolbarButtonOwnProps | 'as' | 'type'>;

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

export default function ToolbarButton<T extends ElementType = 'button'>({
  variant = 'ghost',
  size = 'md',
  square = false,
  as,
  className,
  ...rest
}: ToolbarButtonProps<T>) {
  const sizeClass = square ? squareSizes[size] : sizes[size];
  const Tag = (as ?? 'button');
  // Only the native button shape carries type; anchors and custom
  // components keep their own element semantics.
  const isNativeButton = as === undefined || as === 'button';
  return (
    <Tag
      {...(isNativeButton ? { type: 'button' as const } : {})}
      data-slot="toolbar-button"
      data-haze-toolbar-item=""
      tabIndex={-1}
      x-class={[base, focusRingVisible, variants[variant], sizeClass, toolbarItem, className]}
      {...rest}
    />
  );
}

export type { ToolbarButtonOwnProps, ToolbarButtonProps };
