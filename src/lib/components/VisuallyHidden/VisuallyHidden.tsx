import type { ComponentPropsWithoutRef } from 'react';

import { srOnly } from '../../utils/sr-only';

type VisuallyHiddenProps = ComponentPropsWithoutRef<'span'>;

/**
 * Screen-reader-only content: clipped off every visual axis but kept in
 * the accessibility tree (`display: none` would drop it from AT — that
 * is the entire point of this primitive). Consumes the shared sr-only
 * recipe (utils/sr-only.ts): the clip-path route keeps the element in
 * the browser's find-in-page (the legacy `clip` line rides along as an
 * older-engine fallback).
 */
export default function VisuallyHidden({ className, ...rest }: VisuallyHiddenProps) {
  return <span data-slot='visually-hidden' x-class={[srOnly, className]} {...rest} />;
}

export type { VisuallyHiddenProps };
