import type { ReactElement, ReactNode } from 'react';

import { Children, Fragment, cloneElement, isValidElement } from 'react';

/**
 * Generic `React.Children` walker shared by the child-walking
 * components — Accordion's item-index injection, Stepper's step-index
 * injection and Tabs' tab-meta collection. One traversal covers all
 * three shapes: arrays flatten through `Children.map`, Fragments can be
 * walked through transparently, and every valid element is handed to a
 * `visit` callback that either reads it (collectors return nothing) or
 * returns a `cloneElement` replacement (injectors). Non-element nodes
 * pass through untouched, so wrappers, text and gaps keep their place.
 */

export type WalkChildrenOptions = {
  /**
   * Recurse into Fragments: their children are walked in DOM order and
   * rewrapped — a Fragment itself never reaches `visit`. Off (the
   * default), a Fragment is treated like any other wrapper element and
   * its subtree is left alone (Stepper's shipped behavior).
   */
  flattenFragments?: boolean;
};

/**
 * Walk `nodes` in DOM order. `visit` receives every valid element with
 * its `Children.map` slot index; returning a node replaces the element
 * in place, returning nothing passes it through unchanged. Returns the
 * mapped tree (plain `Children.map` semantics, keys prefixed).
 */
export function walkChildren(
  nodes: ReactNode,
  visit: (element: ReactElement, index: number) => ReactNode | undefined,
  { flattenFragments = false }: WalkChildrenOptions = {}
): ReactNode {
  const walk = (current: ReactNode): ReactNode =>
    Children.map(current, (node, index) => {
      if (!isValidElement(node)) return node;
      if (flattenFragments && node.type === Fragment) {
        return cloneElement(
          node,
          undefined,
          walk((node.props as { children?: ReactNode }).children)
        );
      }
      const replaced = visit(node, index);
      return replaced === undefined ? node : replaced;
    });
  return walk(nodes);
}
