import type { CSSProperties, ReactNode } from 'react';

import { css } from '@linaria/core';
import { useState } from 'react';

type ImageProps = {
  src: string;
  alt: string;
  fallback?: ReactNode;
  aspectRatio?: string;
  objectFit?: CSSProperties['objectFit'];
  className?: string;
};

const wrapper = css`
  display: block;
  overflow: hidden;
  position: relative;
`;

const imgStyle = css`
  display: block;
  width: 100%;
  height: 100%;
`;

const fallbackStyle = css`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  background: var(--haze-color-bg-muted);
  color: var(--haze-color-text-muted);
  font-family: var(--haze-font-sans);
  font-size: var(--haze-text-sm);
`;

export default function Image({
  src,
  alt,
  fallback,
  aspectRatio,
  objectFit = 'cover',
  className,
}: ImageProps) {
  const [error, setError] = useState(false);

  return (
    <span x-class={[wrapper, className]} style={{ aspectRatio }}>
      {error && fallback ? (
        <span className={fallbackStyle}>{fallback}</span>
      ) : (
        <img
          className={imgStyle}
          src={src}
          alt={alt}
          style={{ objectFit }}
          onError={() => setError(true)}
        />
      )}
    </span>
  );
}

export type { ImageProps };
