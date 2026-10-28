import type { TreeNodeData } from '../components/Tree/types';

import {
  flattenTreeData,
  findNodeByKey,
  getChildKeys,
  getNodePath,
  getParentKey,
  getAllLeafKeys,
  mergeLoadedChildren,
} from './tree-utils';

const tree: TreeNodeData[] = [
  {
    key: 'a',
    title: 'A',
    children: [
      { key: 'a-1', title: 'A1', children: [{ key: 'a-1-x', title: 'A1X' }] },
      { key: 'a-2', title: 'A2' },
    ],
  },
  { key: 'b', title: 'B' },
];

describe('tree-utils pure walkers', () => {
  it('flattenTreeData returns depth-first node list', () => {
    expect(flattenTreeData(tree).map((n) => n.key)).toEqual([
      'a',
      'a-1',
      'a-1-x',
      'a-2',
      'b',
    ]);
  });

  it('flattenTreeData handles empty input', () => {
    expect(flattenTreeData([])).toEqual([]);
  });

  it('findNodeByKey finds nested node', () => {
    expect(findNodeByKey(tree, 'a-1-x')?.title).toBe('A1X');
  });

  it('findNodeByKey returns null for missing key', () => {
    expect(findNodeByKey(tree, 'zzz')).toBeNull();
  });

  it('findNodeByKey returns null for empty data', () => {
    expect(findNodeByKey([], 'a')).toBeNull();
  });

  it('getChildKeys returns all descendant keys recursively', () => {
    expect(getChildKeys(tree, 'a')).toEqual(['a-1', 'a-1-x', 'a-2']);
  });

  it('getChildKeys returns empty for childless parent', () => {
    expect(getChildKeys(tree, 'b')).toEqual([]);
  });

  it('getChildKeys returns empty for missing parent', () => {
    expect(getChildKeys(tree, 'zzz')).toEqual([]);
  });

  it('getParentKey returns direct parent key', () => {
    expect(getParentKey(tree, 'a-1-x')).toBe('a-1');
  });

  it('getParentKey returns null for root node', () => {
    expect(getParentKey(tree, 'a')).toBeNull();
  });

  it('getParentKey returns null for missing key', () => {
    expect(getParentKey(tree, 'zzz')).toBeNull();
  });

  it('getNodePath returns the root-first chain including the node', () => {
    expect(getNodePath(tree, 'a-1-x').map((n) => n.key)).toEqual([
      'a',
      'a-1',
      'a-1-x',
    ]);
    expect(getNodePath(tree, 'a-1-x').map((n) => n.title)).toEqual([
      'A',
      'A1',
      'A1X',
    ]);
  });

  it('getNodePath returns a single-entry path for roots', () => {
    expect(getNodePath(tree, 'b').map((n) => n.key)).toEqual(['b']);
  });

  it('getNodePath returns empty for a missing key', () => {
    expect(getNodePath(tree, 'zzz')).toEqual([]);
  });

  it('getAllLeafKeys collects deepest leaves', () => {
    expect(getAllLeafKeys(tree)).toEqual(['a-1-x', 'a-2', 'b']);
  });

  it('getAllLeafKeys treats isLeaf nodes with children as leaves', () => {
    expect(
      getAllLeafKeys([
        {
          key: 'x',
          title: 'X',
          isLeaf: true,
          children: [{ key: 'x-1', title: 'X1' }],
        },
      ])
    ).toEqual(['x']);
  });

  it('mergeLoadedChildren attaches cached children to childless nodes anywhere in the tree', () => {
    const merged = mergeLoadedChildren(tree, {
      b: [{ key: 'b-1', title: 'B1' }],
    });
    expect(merged[1]!.children).toEqual([{ key: 'b-1', title: 'B1' }]);
  });

  it('mergeLoadedChildren marks an empty load as a leaf', () => {
    const merged = mergeLoadedChildren([{ key: 'b', title: 'B' }], {
      b: [],
    });
    expect(merged[0]!.isLeaf).toBe(true);
    expect(merged[0]!.children).toBeUndefined();
  });

  it('mergeLoadedChildren never overrides children the controlled data ships itself', () => {
    const merged = mergeLoadedChildren(tree, {
      a: [{ key: 'intruder', title: 'Intruder' }],
    });
    expect(merged[0]!.children!.map((n) => n.key)).toEqual(['a-1', 'a-2']);
  });

  it('mergeLoadedChildren returns the same reference when nothing is cached', () => {
    expect(mergeLoadedChildren(tree, {})).toBe(tree);
  });
});
