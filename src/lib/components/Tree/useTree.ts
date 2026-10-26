import type { Dispatch, SetStateAction } from 'react';
import type { ControlOrValue } from 'react-use-control';

import type { VirtualListAlign } from '../VirtualList';
import type { TreeNodeData, TreeProps, TreeScrollHandle } from './types';
import type { VisibleTreeRow } from './utils';

import { useCallback, useRef } from 'react';
import { useControl } from 'react-use-control';

import { flattenVisibleTree, getNodePath } from './utils';

/**
 * Options for `useTree`.
 */
export type UseTreeOptions = {
  /**
   * The same `treeData` you hand to `<Tree>` — the source the path and
   * flattening queries reason about. (Lazy `loadData` children live in
   * the tree's internal cache and are invisible here; see `getPath`.)
   */
  treeData: TreeNodeData[];
  /**
   * Expansion state, `ControlOrValue<string[]>` — the exact contract of
   * `Tree.expandedKeys`. Pass a `Control` (from your own `useControl`)
   * for controlled sharing, or a plain array as the uncontrolled
   * initial value; omit for `[]`. The hook threads the resulting
   * control into `treeProps`, so switcher clicks inside the tree and
   * `setExpandedKeys` writes are the same state.
   */
  expandedKeys?: ControlOrValue<string[]>;
};

/** Options for `UseTreeResult.scrollTo`. */
export type TreeScrollToOptions = {
  /**
   * Expand the target's ancestor chain first (default `false` — scroll
   * never silently mutates expansion). The scroll request is durable:
   * it resolves on the commit that makes the row visible.
   */
  autoExpand?: boolean;
  /** Row alignment once scrolled — `VirtualListAlign`, default `'auto'`. */
  align?: VirtualListAlign;
};

/**
 * Result of `useTree`.
 */
export type UseTreeResult = {
  /**
   * Props for `<Tree>` (or `<SortableTree>`): the `treeData` you passed
   * in, the shared expansion control, and the internal scroll-handle
   * wiring. Spread as `<Tree {...tree.treeProps} />` so `scrollTo` and
   * the tree stay connected; the queries work without it too.
   */
  treeProps: Pick<TreeProps, 'treeData' | 'expandedKeys' | 'scrollHandleRef'>;
  /** Current expanded keys (the value behind the shared control). */
  expandedKeys: string[];
  /**
   * Write expansion — the same `Dispatch<SetStateAction<string[]>>` the
   * tree's switcher writes through; `onExpand` on `<Tree>` still fires
   * for user toggles.
   */
  setExpandedKeys: Dispatch<SetStateAction<string[]>>;
  /**
   * Ancestor chain of `key`, root first and the node itself last — `[]`
   * for an unknown key. Strict ancestors are `path.slice(0, -1)`.
   */
  getPath: (key: string) => TreeNodeData[];
  /**
   * The currently visible rows in depth-first order — exactly the item
   * sequence a `virtualized` tree windows over (one entry per rendered
   * treeitem, parents before children, expanded subtrees only).
   */
  flattenVisible: () => VisibleTreeRow[];
  /**
   * Scroll the row for `key` into view: virtualized trees window-shift
   * via `VirtualListHandle.scrollToIndex`, nested trees `scrollIntoView`
   * the row. With `autoExpand` the ancestors are expanded first and the
   * scroll lands on that commit. Requires `treeProps` to be spread onto
   * the tree (the hook holds no DOM otherwise); an unknown key is a
   * durable no-op — nothing expands, nothing scrolls.
   */
  scrollTo: (key: string, options?: TreeScrollToOptions) => void;
};

/**
 * Companion hook for `Tree` (the AntD v6 `useTree` slot): owns the
 * expansion state through `react-use-control`, answers path/flattening
 * queries against the tree data, and drives imperative scrolling with
 * optional ancestor auto-expansion.
 *
 * ```tsx
 * const tree = useTree({ treeData });
 * // tree.getPath('0-0-1') → [root, '0-0', the node] — breadcrumb-ready
 * <Tree {...tree.treeProps} virtualized />
 * <button onClick={() => tree.scrollTo('0-0-1', { autoExpand: true })}>
 *   Jump
 * </button>
 * ```
 *
 * - `expandedKeys` accepts a control (controlled) or a plain array
 *   (uncontrolled initial) — the same one-prop contract as the tree.
 * - `scrollTo` never mutates expansion unless `autoExpand` is set.
 */
export function useTree(options: UseTreeOptions): UseTreeResult {
  const { treeData, expandedKeys: expandedKeysInput } = options;

  const [expandedKeys, setExpandedKeys, expandedControl] = useControl(
    expandedKeysInput,
    []
  );
  const scrollHandleRef = useRef<TreeScrollHandle>(null);

  const getPath = useCallback(
    (key: string) => getNodePath(treeData, key),
    [treeData]
  );

  const flattenVisible = useCallback(
    () => flattenVisibleTree(treeData, expandedKeys, false),
    [treeData, expandedKeys]
  );

  const scrollTo = useCallback(
    (key: string, scrollOptions?: TreeScrollToOptions) => {
      const { autoExpand = false, align = 'auto' } = scrollOptions ?? {};
      if (autoExpand) {
        // Only the strict ancestors — the target itself must stay exactly
        // as the consumer left it.
        const ancestors = getNodePath(treeData, key)
          .slice(0, -1)
          .map((node) => node.key);
        if (ancestors.length > 0) {
          setExpandedKeys((prev) => {
            const missing = ancestors.filter((k) => !prev.includes(k));
            return missing.length === 0 ? prev : [...prev, ...missing];
          });
        }
      }
      scrollHandleRef.current?.scrollToKey(key, align);
    },
    [treeData, setExpandedKeys]
  );

  return {
    treeProps: { treeData, expandedKeys: expandedControl, scrollHandleRef },
    expandedKeys,
    setExpandedKeys,
    getPath,
    flattenVisible,
    scrollTo,
  };
}
