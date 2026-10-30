import { isValidElement, type ReactNode } from 'react';

/**
 * Flatten a ReactNode to its text content (strings/numbers joined
 * across children trees; every other node — booleans included —
 * contributes nothing, matching what React actually renders: boolean
 * children collapse to empty, so `{cond && <Icon/>}` must not project
 * a literal "false"). Single source for text projections: accessible
 * names (aria-labels — Menu and Schedule used to carry hand-rolled
 * variants of this walk) and the label walkers `selectOptionText` /
 * `commandItemText`, which delegate here.
 */
export function reactNodeText(node: ReactNode): string {
  if (typeof node === 'boolean') {
    return '';
  }
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
