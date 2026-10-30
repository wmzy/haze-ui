import type { ReactNode, Ref } from 'react';

import { css } from '@linaria/core';
import { useState } from 'react';

type AvatarProps = {
  src?: string;
  alt?: string;
  size?: 'sm' | 'md' | 'lg';
  fallback?: ReactNode;
  className?: string;
  /** Forwarded to the root span (data-slot='avatar'). */
  ref?: Ref<HTMLSpanElement>;
};

const base = css`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--haze-radius-full);
  overflow: hidden;
  background: var(--haze-color-bg-muted);
  color: var(--haze-color-text-secondary);
  font-family: var(--haze-font-sans);
  font-weight: var(--haze-weight-medium);
  user-select: none;
  flex-shrink: 0;
`;

const sizes = {
  sm: css`
    width: var(--haze-space-8);
    height: var(--haze-space-8);
    font-size: var(--haze-text-xs);
  `,
  md: css`
    width: var(--haze-space-10);
    height: var(--haze-space-10);
    font-size: var(--haze-text-sm);
  `,
  /* 56px has no single step on the space scale (jumps 12→16): the
     space-12 + space-2 composition, TabBar's 56px track precedent. */
  lg: css`
    width: calc(var(--haze-space-12) + var(--haze-space-2));
    height: calc(var(--haze-space-12) + var(--haze-space-2));
    font-size: var(--haze-text-lg);
  `,
} as const;

const imgStyle = css`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

export default function Avatar({
  src,
  alt,
  size = 'md',
  fallback,
  className,
  ref,
}: AvatarProps) {
  // Track the src that failed, not a sticky boolean: when src changes
  // (upload finished, user switched) the new image must render again.
  // Only that exact src stays failed — prop-change resync precedent:
  // DataTable/column-filter.tsx.
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  const error = failedSrc !== null && failedSrc === src;

  return (
    <span ref={ref} data-slot="avatar" x-class={[base, sizes[size], className]}>
      {src && !error ? (
        <img
          data-slot="img"
          x-class={[imgStyle]}
          src={src}
          alt={alt ?? ''}
          onError={() => setFailedSrc(src)}
        />
      ) : (
        (fallback ?? <span data-slot="img">{alt?.charAt(0).toUpperCase() ?? '?'}</span>)
      )}
    </span>
  );
}

export type { AvatarProps };
