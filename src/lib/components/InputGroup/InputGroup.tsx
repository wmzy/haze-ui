import type { ComponentPropsWithoutRef, ReactElement, ReactNode, Ref } from 'react';

import { Children, cloneElement, isValidElement } from 'react';

import { InputGroupProvider } from './InputGroupContext';
import InputGroupAddon from './InputGroupAddon';

import { group } from './input-group-styles';

/**
 * Semantic slot classes for InputGroup (AntD v6 `classNames` shape;
 * keys follow the data-slot names). The `addon` slot is inherited by
 * every InputGroupAddon child through context, so addons are re-skinned
 * once on the group.
 */
type InputGroupClassNames = {
  /** The wrapper (data-slot='input-group'). */
  root?: string;
  /** Every addon (data-slot='addon'). */
  addon?: string;
};

type InputGroupOwnProps = {
  /** Group-wide size: the size every child field that accepts one
   * wears unless it sets its own, and the size the addons take —
   * mirrors Input's steps so row edges align. */
  size?: 'sm' | 'md' | 'lg';
  /** Slot classes (see {@link InputGroupClassNames}); `addon` is
   * inherited by InputGroupAddon children. */
  classNames?: InputGroupClassNames;
};

type InputGroupProps = InputGroupOwnProps & {
  /** The cluster's fields and addons — `Input`/`Select` children with
   * `InputGroupAddon` (and optionally a trailing `Button`) around
   * them. The group fills in `size` where a child leaves it unset;
   * non-element nodes pass through untouched. */
  children: ReactNode;
  className?: string;
  /** Forwarded to the wrapper `<div>` (data-slot='input-group'). */
  ref?: Ref<HTMLDivElement>;
} & Omit<
  ComponentPropsWithoutRef<'div'>,
  keyof InputGroupOwnProps | 'className' | 'children'
>;

/**
 * Hands the group size down to the field children. Fields are not
 * wired to a group context (their size stays a plain prop), so the
 * group clones element children, filling in `size` only where the
 * child left it unset. Addons are skipped (they take their size from
 * context instead); cloneElement preserves consumer props, refs and
 * handlers.
 */
function applyGroupSize(
  nodes: ReactNode,
  size: 'sm' | 'md' | 'lg',
): ReactNode {
  return Children.map(nodes, (node) => {
    if (!isValidElement(node) || node.type === InputGroupAddon) return node;
    const own = node.props as Partial<{ size: 'sm' | 'md' | 'lg' }>;
    if (own.size !== undefined) return node;
    return cloneElement(node as ReactElement<Record<string, unknown>>, { size });
  });
}

/**
 * A field cluster: prefix/suffix addons (`InputGroupAddon` — icon,
 * text) hugging an `Input`, `Select` or textarea-based field, all
 * merged into one attached control via CSS on the wrapper (corner
 * radii and seam borders collapse positionally — children render
 * as-authored). A trailing `Button` child attaches the same way, which
 * is the classic search-box shape.
 *
 * The composition layer keeps zero state: the field's value stays
 * controlled/uncontrolled exactly as the field itself defines it, and
 * every part stays individually focusable with its own accessible
 * name — label the field, not the wrapper.
 */
export default function InputGroup({
  size = 'md',
  classNames,
  className,
  children,
  ref,
  ...rest
}: InputGroupProps) {
  const groupValue = { size, addonClass: classNames?.addon };
  return (
    <InputGroupProvider value={groupValue}>
      <div
        ref={ref}
        data-slot="input-group"
        x-class={[group, className, classNames?.root]}
        {...rest}
      >
        {applyGroupSize(children, size)}
      </div>
    </InputGroupProvider>
  );
}

export type { InputGroupClassNames, InputGroupProps };
