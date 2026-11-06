import type { ComponentPropsWithoutRef } from 'react';

import { css } from '@linaria/core';
import { Children, isValidElement } from 'react';

import { avatarBase, avatarSizes } from '../Avatar/avatar-styles';

type AvatarGroupProps = {
  /** Maximum number of avatars rendered before the overflow chip. */
  max?: number;
  /** Overflow count to display instead of children count - max when truncating. */
  total?: number;
  /**
   * Formats the "+N" overflow chip text from the overflow count. Inline
   * default keeps AvatarGroup hook-free (RSC-safe: no useStrings);
   * locale-aware callers pass their own formatter.
   */
  overflowLabel?: (count: number) => string;
} & ComponentPropsWithoutRef<'div'>;

const base = css`
  display: inline-flex;
  align-items: center;
`;

/* Each avatar sits in a circular frame whose bg-colored ring occludes the
   avatar underneath; DOM order paints later children above earlier ones. */
const item = css`
  display: inline-flex;
  border-radius: var(--haze-radius-full);
  border: 2px solid var(--haze-color-bg);
`;

const itemStacked = css`
  margin-inline-start: calc(-1 * var(--haze-space-3));
`;

/* Overflow-count semantics layered over the shared Avatar sm frame
   (Avatar/avatar-styles): the "+N" glyph sits tight in the space-8
   circle and never wraps, so the chip reads as one more avatar in the
   stack rather than a foreign badge. Everything else is the shared
   chassis; these three declarations are the chip's own. */
const overflowDelta = css`
  box-sizing: border-box;
  line-height: var(--haze-leading-tight);
  white-space: nowrap;
`;

export default function AvatarGroup({
  max,
  total,
  overflowLabel = (count) => `+${count}`,
  className,
  children,
  ...rest
}: AvatarGroupProps) {
  const items = Children.toArray(children);
  const limit = max === undefined ? items.length : Math.max(max, 0);
  const truncating = items.length > limit;
  const visible = truncating ? items.slice(0, limit) : items;
  const overflowCount = total ?? items.length - limit;

  return (
    <div data-slot="avatar-group" x-class={[base, className]} {...rest}>
      {visible.map((child, index) => (
        // Element key first — Children.toArray's ".$"-prefixed keys are
        // stable across re-slices (max changes); positional fallback only
        // covers keyless string/number children.
        <span
          key={isValidElement(child) && child.key ? child.key : index}
          data-slot="item"
          x-class={[item, index > 0 && itemStacked]}
        >
          {child}
        </span>
      ))}
      {truncating && (
        <span
          data-slot="overflow-badge"
          x-class={[item, avatarBase, avatarSizes.sm, overflowDelta, visible.length > 0 && itemStacked]}
        >
          {overflowLabel(overflowCount)}
        </span>
      )}
    </div>
  );
}

export type { AvatarGroupProps };
