import type { ReactNode, Ref } from 'react';

import { css } from '@linaria/core';

import { useFailedSrc } from '../../utils/use-failed-src';

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
  // Tracks the exact src whose load failed (utils/use-failed-src, shared
  // with Image): a changed src renders as an image again instead of
  // staying fallen back.
  const [error, markFailed] = useFailedSrc(src);

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
          onError={markFailed}
        />
      ) : (
        (fallback ?? <span data-slot="img">{alt?.charAt(0).toUpperCase() ?? '?'}</span>)
      )}
    </span>
  );
}

export type { AvatarProps };
