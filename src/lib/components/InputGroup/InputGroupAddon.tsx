import type { ComponentPropsWithoutRef, ReactNode } from 'react';

import { useInputGroup } from './InputGroupContext';

import { addon, addonSizes } from './input-group-styles';

type InputGroupAddonProps = {
  /** Addon content — an icon, a text prefix/suffix ("https://", a
   * currency glyph), any inline node. Text stays in the accessibility
   * tree: it is often the field's semantic prefix, so the addon is
   * never aria-hidden as a whole; wrap purely decorative icons in
   * aria-hidden yourself. */
  children?: ReactNode;
  /** Own size — defaults to the enclosing InputGroup's size. */
  size?: 'sm' | 'md' | 'lg';
  className?: string;
} & Omit<ComponentPropsWithoutRef<'span'>, 'children' | 'size' | 'className'>;

/**
 * The tinted cell attached to a field's leading or trailing edge —
 * placement is positional (render it before or after the field), and
 * the group's merging rules round the outer corner and suppress the
 * inner one on whichever side it lands. Non-interactive by design: it
 * is a label surface, not a control; a clickable tail belongs in the
 * group as a `Button` child.
 */
export default function InputGroupAddon({
  children,
  size,
  className,
  ...rest
}: InputGroupAddonProps) {
  const group = useInputGroup();
  const resolvedSize = size ?? group?.size ?? 'md';
  return (
    <span
      data-slot="addon"
      x-class={[addon, addonSizes[resolvedSize], group?.addonClass, className]}
      {...rest}
    >
      {children}
    </span>
  );
}

export type { InputGroupAddonProps };
