import type { TreeNodeData } from './types';

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
