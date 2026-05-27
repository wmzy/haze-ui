import type { ReactNode, ComponentPropsWithoutRef } from 'react';

import { css } from '@linaria/core';

// Title
type TitleProps = {
  level?: 1 | 2 | 3 | 4 | 5;
  className?: string;
  children: ReactNode;
};

const titleBase = css`
  font-family: var(--haze-font-sans);
  font-weight: var(--haze-weight-bold);
  color: var(--haze-color-text);
  margin: 0;
`;

const titleLevels = {
  1: css`font-size: var(--haze-text-3xl); line-height: var(--haze-leading-tight);`,
  2: css`font-size: var(--haze-text-2xl); line-height: var(--haze-leading-tight);`,
  3: css`font-size: var(--haze-text-xl); line-height: var(--haze-leading-tight);`,
  4: css`font-size: var(--haze-text-lg); line-height: var(--haze-leading-normal);`,
  5: css`font-size: var(--haze-text-base); line-height: var(--haze-leading-normal);`,
} as const;

export function Title({ level = 1, className, children }: TitleProps) {
  const Tag = `h${level}` as keyof JSX.IntrinsicElements;
  return (
    <Tag x-class={[titleBase, titleLevels[level], className]}>
      {children}
    </Tag>
  );
}

// Text
type TextProps = {
  type?: 'default' | 'secondary' | 'muted';
  strong?: boolean;
  code?: boolean;
  mark?: boolean;
  className?: string;
  children: ReactNode;
};

const textBase = css`
  font-family: var(--haze-font-sans);
  font-size: var(--haze-text-sm);
  line-height: var(--haze-leading-normal);
`;

const textTypes = {
  default: css`color: var(--haze-color-text);`,
  secondary: css`color: var(--haze-color-text-secondary);`,
  muted: css`color: var(--haze-color-text-muted);`,
} as const;

const textStrong = css`
  font-weight: var(--haze-weight-bold);
`;

const textCode = css`
  font-family: var(--haze-font-mono);
  font-size: var(--haze-text-xs);
  padding: var(--haze-space-0) var(--haze-space-1);
  background: var(--haze-color-bg-muted);
  border-radius: var(--haze-radius-sm);
`;

const textMark = css`
  background: color-mix(in srgb, var(--haze-color-warning) 25%, transparent);
  padding: 0 var(--haze-space-1);
`;

export function Text({
  type = 'default',
  strong,
  code,
  mark,
  className,
  children,
}: TextProps) {
  let Tag: keyof JSX.IntrinsicElements = 'span';
  if (strong) Tag = 'strong';
  else if (code) Tag = 'code';

  return (
    <Tag
      x-class={[
        textBase,
        textTypes[type],
        strong && !code && textStrong,
        code && textCode,
        mark && textMark,
        className,
      ]}
    >
      {children}
    </Tag>
  );
}

// Paragraph
type ParagraphProps = {
  className?: string;
  children: ReactNode;
};

const paragraphBase = css`
  font-family: var(--haze-font-sans);
  font-size: var(--haze-text-sm);
  line-height: var(--haze-leading-relaxed);
  color: var(--haze-color-text);
  margin: 0 0 var(--haze-space-4);
`;

export function Paragraph({ className, children }: ParagraphProps) {
  return (
    <p x-class={[paragraphBase, className]}>
      {children}
    </p>
  );
}

export type { TitleProps, TextProps, ParagraphProps };
