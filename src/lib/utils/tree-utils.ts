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
