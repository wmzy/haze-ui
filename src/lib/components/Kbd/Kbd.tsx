import type { ComponentPropsWithoutRef, Ref } from 'react';

import { css } from '@linaria/core';

type KbdProps = {
  size?: 'sm' | 'md';
  /** Forwarded to the root kbd element (data-slot='kbd'). */
  ref?: Ref<HTMLElement>;
} & Omit<ComponentPropsWithoutRef<'kbd'>, 'size'>;

const base = css`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding-inline: var(--haze-space-2);
  border: 1px solid var(--haze-color-border);
  /* Thicker bottom edge reads as a raised key cap. */
  border-bottom-width: 2px;
  border-radius: var(--haze-radius-sm);
  background: var(--haze-color-bg-muted);
  color: var(--haze-color-text);
  font-family: var(--haze-font-mono);
  font-weight: var(--haze-weight-medium);
  line-height: var(--haze-leading-tight);
  white-space: nowrap;
  box-shadow: var(--haze-shadow-sm);
`;

const sizes = {
  sm: css`
    font-size: var(--haze-text-xs);
  `,
  md: css`
    font-size: var(--haze-text-sm);
  `,
} as const;

export default function Kbd({ size = 'md', className, ref, ...rest }: KbdProps) {
  return <kbd ref={ref} data-slot="kbd" x-class={[base, sizes[size], className]} {...rest} />;
}

export type { KbdProps };
