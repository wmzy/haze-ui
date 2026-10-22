import type { ComponentPropsWithoutRef, ReactElement, ReactNode, Ref } from 'react';

import { Children, cloneElement, isValidElement } from 'react';

import { ButtonGroupProvider } from './ButtonGroupContext';
import ButtonGroupSeparator from './ButtonGroupSeparator';

import { group } from './button-group-styles';

/**
 * Semantic slot classes for ButtonGroup (AntD v6 `classNames` shape;
 * keys follow the data-slot names). The `separator` slot is inherited
 * by every ButtonGroupSeparator child through context, so dividers are
 * re-skinned once on the group.
 */
type ButtonGroupClassNames = {
  /** The bar wrapper (data-slot='button-group'). */
  root?: string;
  /** Every divider (data-slot='separator'). */
  separator?: string;
};

type ButtonGroupOwnProps = {
  /** Group-wide size: the size every child Button wears unless the
   * child sets its own. Same three steps as Button. */
  size?: 'sm' | 'md' | 'lg';
  /** Group-wide variant: the variant every child Button wears unless
   * the child sets its own (a bar reads best in one variant). */
  variant?: 'solid' | 'outline' | 'ghost';
  /** Stack the bar vertically; the seam merge switches to the block
   * axis and buttons cross-stretch to the widest. */
  orientation?: 'horizontal' | 'vertical';
  /** Disables every child button that does not disable itself — a
   * child's explicit `disabled={false}` still wins. */
  disabled?: boolean;
  /** Slot classes (see {@link ButtonGroupClassNames}); `separator` is
   * inherited by ButtonGroupSeparator children. */
  classNames?: ButtonGroupClassNames;
};

type ButtonGroupProps = ButtonGroupOwnProps & {
  /** The bar's buttons — real `Button` (or ButtonLink) elements. The
   * group fills in `size`/`variant`/`disabled` where a child leaves
   * them unset; non-element nodes pass through untouched. */
  children: ReactNode;
  className?: string;
  /** Forwarded to the wrapper `<div>` (data-slot='button-group'). */
  ref?: Ref<HTMLDivElement>;
} & Omit<
  ComponentPropsWithoutRef<'div'>,
  keyof ButtonGroupOwnProps | 'className' | 'children'
>;

/**
 * Group-wide skin down to the children. Button is not wired to a group
 * context (its skin stays a plain prop), so the group clones element
 * children, filling in `size`/`variant` only where the child left them
 * unset and forcing `disabled` while the group is off. Separators are
 * skipped (they take their skin from context instead);
 * cloneElement preserves consumer props, refs and handlers.
 */
function applyGroupSkin(
  nodes: ReactNode,
  skin: {
    size: 'sm' | 'md' | 'lg';
    variant: 'solid' | 'outline' | 'ghost';
    disabled: boolean;
  },
): ReactNode {
  return Children.map(nodes, (node) => {
    if (!isValidElement(node) || node.type === ButtonGroupSeparator) {
      return node;
    }
    const own = node.props as Partial<{
      size: 'sm' | 'md' | 'lg';
      variant: 'solid' | 'outline' | 'ghost';
      disabled: boolean;
    }>;
    if (
      own.size !== undefined &&
      own.variant !== undefined &&
      !(skin.disabled && own.disabled === undefined)
    ) {
      return node;
    }
    const injected: Record<string, unknown> = {};
    if (own.size === undefined) injected.size = skin.size;
    if (own.variant === undefined) injected.variant = skin.variant;
    if (skin.disabled && own.disabled === undefined) injected.disabled = true;
    return cloneElement(node as ReactElement<Record<string, unknown>>, injected);
  });
}

/**
 * A row (or column) of buttons visually merged into one bar: leading
 * corners, seam borders and divider rules collapse via CSS on the
 * wrapper, while the children stay real, individually focusable
 * buttons. The group is named — pass `aria-label` so screen readers
 * announce the collection (`role='group'` is built in).
 *
 * The composition layer keeps no state: clicks, loading and busy UI
 * stay on each Button. `size`/`variant`/`disabled` are group-wide
 * defaults every child inherits unless it sets its own.
 */
export default function ButtonGroup({
  size = 'md',
  variant = 'solid',
  orientation = 'horizontal',
  disabled = false,
  classNames,
  className,
  children,
  ref,
  ...rest
}: ButtonGroupProps) {
  const groupValue = {
    size,
    variant,
    disabled,
    orientation,
    separatorClass: classNames?.separator,
  };
  return (
    <ButtonGroupProvider value={groupValue}>
      <div
        ref={ref}
        data-slot="button-group"
        data-orientation={orientation}
        role="group"
        x-class={[group, className, classNames?.root]}
        {...rest}
      >
        {applyGroupSkin(children, { size, variant, disabled })}
      </div>
    </ButtonGroupProvider>
  );
}

export type { ButtonGroupClassNames, ButtonGroupProps };
