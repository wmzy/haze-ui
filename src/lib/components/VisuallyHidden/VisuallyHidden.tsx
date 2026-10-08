import type { ComponentPropsWithoutRef } from 'react';

import { css } from '@linaria/core';

type VisuallyHiddenProps = ComponentPropsWithoutRef<'span'>;

/**
 * Screen-reader-only content: clipped off every visual axis but kept in
 * the accessibility tree (`display: none` would drop it from AT — that
 * is the entire point of this primitive). The clip-path route (not the
 * legacy negative-margins + clip rect combo) also keeps the element in
 * the browser's find-in-page.
 */
const hidden = css`
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip-path: inset(50%);
  white-space: nowrap;
  border: 0;
`;

export default function VisuallyHidden({ className, ...rest }: VisuallyHiddenProps) {
  return <span data-slot='visually-hidden' x-class={[hidden, className]} {...rest} />;
}

export type { VisuallyHiddenProps };
