import type { ComponentPropsWithoutRef, ReactNode } from 'react';

import { useButtonGroup } from './ButtonGroupContext';

import {
  separatorBase,
  separatorIcon,
  separatorIconInverse,
  separatorInverse,
  separatorRule,
  separatorRuleHorizontal,
} from './button-group-styles';

type ButtonGroupSeparatorProps = {
  /** Divider glyph — an icon or a short label ("or") rendered as the
   * split between the merged buttons. Omitted, the divider is the 1px
   * rule. */
  children?: ReactNode;
  className?: string;
} & Omit<ComponentPropsWithoutRef<'span'>, 'children' | 'className'>;

/**
 * A divider between merged buttons. Not a button — it takes no focus
 * and no clicks. Reads the owning group's skin from context: the rule
 * runs across the bar's cross axis (a vertical rule inside a
 * horizontal bar and vice versa) and inks inverse on solid bars, where
 * the border color would vanish against the primary field. Renders a
 * plain spanning rule outside a group.
 */
export default function ButtonGroupSeparator({
  children,
  className,
  ...rest
}: ButtonGroupSeparatorProps) {
  const group = useButtonGroup();
  const solid = group?.variant === 'solid';
  const verticalBar = group?.orientation === 'vertical';
  return (
    <span
      data-slot="separator"
      role="separator"
      aria-orientation={verticalBar ? 'horizontal' : 'vertical'}
      x-class={[
        separatorBase,
        children
          ? separatorIcon
          : verticalBar
            ? separatorRuleHorizontal
            : separatorRule,
        solid && (children ? separatorIconInverse : separatorInverse),
        group?.separatorClass,
        className,
      ]}
      {...rest}
    >
      {children}
    </span>
  );
}

export type { ButtonGroupSeparatorProps };
