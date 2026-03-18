import type {ReactNode} from 'react';

import {css} from '@linaria/core';
import {useState} from 'react';

type AvatarProps = {
  src?: string;
  alt?: string;
  size?: 'sm' | 'md' | 'lg';
  fallback?: ReactNode;
  className?: string;
};

const base = css`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--pbl-radius-full);
  overflow: hidden;
  background: var(--pbl-color-bg-muted);
  color: var(--pbl-color-text-secondary);
  font-family: var(--pbl-font-sans);
  font-weight: var(--pbl-weight-medium);
  user-select: none;
  flex-shrink: 0;
`;

const sizes = {
  sm: css`
    width: 32px;
    height: 32px;
    font-size: var(--pbl-text-xs);
  `,
  md: css`
    width: 40px;
    height: 40px;
    font-size: var(--pbl-text-sm);
  `,
  lg: css`
    width: 56px;
    height: 56px;
    font-size: var(--pbl-text-lg);
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
}: AvatarProps) {
  const [error, setError] = useState(false);

  return (
    <span x-class={[base, sizes[size], className]}>
      {src && !error ? (
        <img className={imgStyle} src={src} alt={alt ?? ''} onError={() => setError(true)} />
      ) : (
        fallback ?? <span>{alt?.charAt(0)?.toUpperCase() ?? '?'}</span>
      )}
    </span>
  );
}

export type {AvatarProps};
