import type { ReactNode, Ref } from 'react';

import { css } from '@linaria/core';
import { useState } from 'react';

import { avatarBase, avatarSizes } from './avatar-styles';

type AvatarProps = {
  src?: string;
  alt?: string;
  size?: 'sm' | 'md' | 'lg';
  fallback?: ReactNode;
  className?: string;
  /** Forwarded to the root span (data-slot='avatar'). */
  ref?: Ref<HTMLSpanElement>;
};

/*
 * Avatar-only chrome over the shared frame (avatar-styles): crop the
 * img to the circle, keep the glyph unselectable and the frame from
 * squishing inside flex rows. The AvatarGroup overflow chip shares the
 * frame but wants none of these.
 */
const avatarChrome = css`
  overflow: hidden;
  user-select: none;
  flex-shrink: 0;
`;

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
    <span
      ref={ref}
      data-slot="avatar"
      x-class={[avatarBase, avatarChrome, avatarSizes[size], className]}
    >
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
