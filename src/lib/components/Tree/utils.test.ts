import {
  flattenTreeData,
  findNodeByKey,
  getChildKeys,
  getParentKey,
  getAllLeafKeys,
} from './utils';

const tree = [
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

describe('Tree utils', () => {
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
});
