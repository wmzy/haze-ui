import type { CSSProperties, ReactNode, Ref } from 'react';
import type { StatusColor } from '../../utils/status-skin';

// sibling module (not `styles.ts`) — Linaria derives dev class names from
// the file basename, and a shared `styles` basename collides with
// Button/styles.ts (identical `haze-styles__*` selectors cross-wire the
// two components' rules in dev AND collide in dist css)
import { base, sizes, colors } from './badge-styles';

type BadgeProps = {
  /** Semantic status color. */
  color?: StatusColor;
  size?: 'sm' | 'md';
  className?: string;
  style?: CSSProperties;
  children: ReactNode;
  /** Forwarded to the root span (data-slot='badge'). */
  ref?: Ref<HTMLSpanElement>;
};

export default function Badge({
  color = 'default',
  size = 'md',
  className,
  style,
  children,
  ref,
}: BadgeProps) {
  return (
    <span ref={ref} data-slot="badge" x-class={[base, colors[color], sizes[size], className]} style={style}>
      {children}
    </span>
  );
}

export type { BadgeProps };
