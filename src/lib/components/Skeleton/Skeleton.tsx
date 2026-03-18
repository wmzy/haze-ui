import {css} from '@linaria/core';

type SkeletonProps = {
  variant?: 'text' | 'circular' | 'rectangular';
  width?: string | number;
  height?: string | number;
  className?: string;
};

const base = css`
  display: block;
  background: var(--pbl-color-bg-muted);
  animation: shimmer 1.5s ease-in-out infinite;

  @keyframes shimmer {
    0% { opacity: 1; }
    50% { opacity: 0.4; }
    100% { opacity: 1; }
  }
`;

const variantStyles = {
  text: css`
    border-radius: var(--pbl-radius-sm);
    height: 1em;
  `,
  circular: css`
    border-radius: var(--pbl-radius-full);
  `,
  rectangular: css`
    border-radius: var(--pbl-radius-md);
  `,
} as const;

export default function Skeleton({
  variant = 'text',
  width,
  height,
  className,
}: SkeletonProps) {
  const style = {
    width: typeof width === 'number' ? `${width}px` : width,
    height: typeof height === 'number' ? `${height}px` : height,
  };

  return <span x-class={[base, variantStyles[variant], className]} style={style} />;
}

export type {SkeletonProps};
