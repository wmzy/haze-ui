import type { TreeNodeData } from '../components/Tree/types';

/**
 * Pure tree-data walkers shared across the tree-family components (Tree,
 * TreeSelect, Cascader's panel): they reason only about the
 * `TreeNodeData` shape — no React, no state, no rendering concerns. The
 * visibility/search-aware helpers (`flattenVisibleTree`,
 * `filterTreeByQuery`, …) stay in `components/Tree/utils.ts`.
 */

export function flattenTreeData(data: TreeNodeData[]): TreeNodeData[] {
  const result: TreeNodeData[] = [];
  const walk = (nodes: TreeNodeData[]) => {
    for (const node of nodes) {
      result.push(node);
      if (node.children?.length) walk(node.children);
    }
  };
  walk(data);
  return result;
}

export function findNodeByKey(
  data: TreeNodeData[],
  key: string
): TreeNodeData | null {
  for (const node of data) {
    if (node.key === key) return node;
    if (node.children?.length) {
      const found = findNodeByKey(node.children, key);
      if (found) return found;
    }
  }
  return null;
}

export function getChildKeys(
  data: TreeNodeData[],
  parentKey: string
): string[] {
  const parent = findNodeByKey(data, parentKey);
  if (!parent?.children?.length) return [];
  const childKeys: string[] = [];
  const walk = (nodes: TreeNodeData[]) => {
    for (const node of nodes) {
      childKeys.push(node.key);
      if (node.children?.length) walk(node.children);
    }
  };
  walk(parent.children);
  return childKeys;
}

/**
 * Cascade-check resolution: given the raw checked keys, derive the
 * checked/half-checked split — a parent is checked only when every
 * descendant is checked, half-checked when some are (and dropped from
 * checked), unchecked when none are. One post-order walk carrying each
 * subtree's totals; the previous shape called `getChildKeys` per
 * parent, which re-walks the whole tree from the root (O(n²) on wide
 * trees). `halfChecked` insertion order mirrors that post-order walk
 * (deepest parents first) and `keys` order is preserved minus the
 * removed parents. `checkStrictly` stays with the caller — no
 * cascade there, the raw keys are the answer.
 */
export function computeCheckedState(
  data: TreeNodeData[],
  keys: string[]
): { checked: string[]; halfChecked: string[] } {
  const checkedSet = new Set(keys);
  const halfCheckedSet = new Set<string>();
  const toRemove = new Set<string>();

  const walk = (nodes: TreeNodeData[]): { total: number; hit: number } => {
    let total = 0;
    let hit = 0;
    for (const node of nodes) {
      total += 1;
      if (checkedSet.has(node.key)) hit += 1;
      if (node.children?.length) {
        const stats = walk(node.children);
        total += stats.total;
        hit += stats.hit;
        if (stats.hit === 0) {
          toRemove.add(node.key);
        } else if (stats.hit < stats.total) {
          halfCheckedSet.add(node.key);
          toRemove.add(node.key);
        }
      }
    }
    return { total, hit };
  };
  walk(data);

  return {
    checked: keys.filter((key) => !toRemove.has(key)),
    halfChecked: Array.from(halfCheckedSet),
  };
}

export function getParentKey(
  data: TreeNodeData[],
  targetKey: string,
  parentKey?: string
): string | null {
  for (const node of data) {
    if (node.key === targetKey) return parentKey ?? null;
    if (node.children?.length) {
      const found = getParentKey(node.children, targetKey, node.key);
      if (found) return found;
    }
  }
  return null;
}

/**
 * Ancestor chain of `key`: root first, the node itself last — `[]` when
 * the key is unknown. One DFS pass (`getParentKey` re-walked per level
 * would be O(depth · n)); the caller drops the last entry for the strict
 * ancestors.
 */
export function getNodePath(
  data: TreeNodeData[],
  key: string
): TreeNodeData[] {
  for (const node of data) {
    if (node.key === key) return [node];
    if (node.children?.length) {
      const path = getNodePath(node.children, key);
      if (path.length > 0) return [node, ...path];
    }
  }
  return [];
}

export function getAllLeafKeys(data: TreeNodeData[]): string[] {
  const keys: string[] = [];
  const walk = (nodes: TreeNodeData[]) => {
    for (const node of nodes) {
      if (!node.children?.length || node.isLeaf) {
        keys.push(node.key);
      } else {
        walk(node.children);
      }
    }
  };
  walk(data);
  return keys;
}

/**
 * Overlays lazy-loaded children onto the controlled data: a childless
 * node with a cache entry adopts the loaded array; an empty load marks
 * the node as a leaf (the server said "no children"). Returns `data`
 * untouched (same reference) when nothing is cached, so memoized
 * downstream work stays stable.
 */
export function mergeLoadedChildren(
  data: TreeNodeData[],
  loaded: Record<string, TreeNodeData[]>
): TreeNodeData[] {
  if (Object.keys(loaded).length === 0) return data;

  const merge = (nodes: TreeNodeData[]): TreeNodeData[] =>
    nodes.map((node) => {
      if (node.children?.length) {
        return { ...node, children: merge(node.children) };
      }
      const cached = loaded[node.key];
      if (!cached) return node;
      return cached.length
        ? { ...node, children: cached }
        : { ...node, isLeaf: true };
    });

  return merge(data);
}
