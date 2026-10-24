import type { ComponentPropsWithRef, ElementType, ReactNode } from 'react';

import { css } from '@linaria/core';

type CardOwnProps = {
  variant?: 'elevated' | 'outlined' | 'filled';
  children: ReactNode;
};

/**
 * MUI-OverridableComponent-shaped polymorphism (Button's pattern): own
 * props first, then the target element's props minus the colliding keys.
 * The skin and `data-slot` always land on the rendered element — the
 * same "wiring wins" precedence as Button's `as`.
 */
type CardProps<T extends ElementType = 'div'> = CardOwnProps & {
  /**
   * Render element. `'div'` (default) keeps the plain container;
   * `'a'` renders the whole card as a link — `href`, `target`, `rel`
   * and the rest of the anchor surface flow through, and the anchor
   * shape resets the UA link styling (block layout, no underline) so
   * the card looks identical to the `div` form. Any component that
   * forwards props to a DOM element works the same way (e.g. a router
   * Link).
   *
   * A whole-card link must not contain nested interactive elements
   * (anchors and buttons don't nest — invalid HTML and an SR/keyboard
   * trap): keep secondary actions outside the card, or overlay a
   * stretched link on a non-interactive card body.
   */
  as?: T;
} & Omit<ComponentPropsWithRef<T>, keyof CardOwnProps | 'as'>;

const base = css`
  border-radius: var(--haze-radius-lg);
  padding: var(--haze-space-5);
  font-family: var(--haze-font-sans);
  color: var(--haze-color-text);
`;

/** The anchor shape (`as` set): the UA gives inline anchors a link blue
 * and an underline — reset both, and restore the div's block layout so
 * the card occupies the same box it always did. */
const anchorShape = css`
  display: block;
  text-decoration: none;
`;

// eslint-disable-next-line react-refresh/only-export-components -- Card 目录按目录原子收录在 RSC-safe 名单（scripts/rsc-safe.mjs）里，拆 sibling styles 文件会让 Card/index.ts 的传递闭包跨客户端边界（dist-esm-contract 拦截）；皮肤常量与组件同文件导出是 TagGroup / Schedule 同款 suppression。
export const variants = {
  elevated: css`
    background: var(--haze-color-bg);
    box-shadow: var(--haze-shadow-md);
  `,
  outlined: css`
    background: var(--haze-color-bg);
    border: 1px solid var(--haze-color-border);
  `,
  filled: css`
    background: var(--haze-color-bg-subtle);
  `,
} as const;

export default function Card<T extends ElementType = 'div'>({
  variant = 'elevated',
  as,
  className,
  children,
  ...rest
}: CardProps<T>) {
  const Tag = (as ?? 'div');
  return (
    <Tag
      data-slot="card"
      x-class={[base, variants[variant], as !== undefined && anchorShape, className]}
      {...rest}
    >
      {children}
    </Tag>
  );
}

export type { CardOwnProps, CardProps };
