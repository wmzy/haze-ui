import { isValidElement, type ReactNode } from 'react';

/**
 * Flatten a ReactNode to its text content (strings/numbers joined
 * across children trees; non-text nodes contribute nothing). Single
 * source for accessible-name projections (aria-labels) — Menu and
 * Schedule used to carry two hand-rolled variants of this walk.
 */
export function reactNodeText(node: ReactNode): string {
  if (typeof node === 'string' || typeof node === 'number') {
    return String(node);
  }
  if (Array.isArray(node)) {
    return node.map(reactNodeText).join('');
  }
  if (isValidElement<{ children?: ReactNode }>(node)) {
    return reactNodeText(node.props.children);
  }
  return '';
}
