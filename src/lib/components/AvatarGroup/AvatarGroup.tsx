import type { ComponentPropsWithoutRef } from 'react';

import { css } from '@linaria/core';
import { Children } from 'react';

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

/* Matches Avatar's sm frame (space-8) so the chip reads as one more
   avatar in the stack rather than a foreign badge. */
const overflowChip = css`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
  width: var(--haze-space-8);
  height: var(--haze-space-8);
  border-radius: var(--haze-radius-full);
  background: var(--haze-color-bg-muted);
  color: var(--haze-color-text-secondary);
  font-family: var(--haze-font-sans);
  font-size: var(--haze-text-xs);
  font-weight: var(--haze-weight-medium);
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
        <span key={index} data-slot="item" x-class={[item, index > 0 && itemStacked]}>
          {child}
        </span>
      ))}
      {truncating && (
        <span
          data-slot="overflow-badge"
          x-class={[item, overflowChip, visible.length > 0 && itemStacked]}
        >
          {overflowLabel(overflowCount)}
        </span>
      )}
    </div>
  );
}

export type { AvatarGroupProps };
