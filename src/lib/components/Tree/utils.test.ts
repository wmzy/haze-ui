import {
  filterTreeByQuery,
  flattenVisibleTree,
  pruneLoadedChildren,
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

// The pure walkers (flattenTreeData / findNodeByKey / getChildKeys /
// getParentKey / getNodePath / getAllLeafKeys / mergeLoadedChildren)
// moved to utils/tree-utils.ts — their tests moved with them.

describe('flattenVisibleTree', () => {
  it('lists expanded-visible rows depth-first with levels and parents', () => {
    const rows = flattenVisibleTree(tree, ['a', 'a-1'], false);
    expect(rows.map((r) => r.key)).toEqual(['a', 'a-1', 'a-1-x', 'a-2', 'b']);
    expect(rows.map((r) => r.level)).toEqual([0, 1, 2, 1, 0]);
    expect(rows.map((r) => r.parentKey)).toEqual([null, 'a', 'a-1', 'a', null]);
  });

  it('omits collapsed subtrees', () => {
    expect(flattenVisibleTree(tree, [], false).map((r) => r.key)).toEqual([
      'a',
      'b',
    ]);
  });

  it('builds the showLine is-last chain per level', () => {
    const rows = flattenVisibleTree(tree, ['a'], false);
    expect(rows.map((r) => r.key)).toEqual(['a', 'a-1', 'a-2', 'b']);
    expect(rows.map((r) => r.isLast)).toEqual([
      [false], // a — not the last root
      [false, false], // a-1 — not the last child of a
      [false, true], // a-2 — last child of a
      [true], // b — last root
    ]);
  });

  it('marks tree-level and node-level disabled rows', () => {
    const data = [
      { key: 'x', title: 'X', disabled: true },
      { key: 'y', title: 'Y' },
    ];
    expect(flattenVisibleTree(data, [], false).map((r) => r.disabled)).toEqual([
      true,
      false,
    ]);
    expect(flattenVisibleTree(data, [], true).map((r) => r.disabled)).toEqual([
      true,
      true,
    ]);
  });

  it('keeps disabled parents expandable — their children stay focusable rows', () => {
    const rows = flattenVisibleTree(
      [
        {
          key: 'd',
          title: 'D',
          disabled: true,
          children: [{ key: 'd-1', title: 'D1' }],
        },
      ],
      ['d'],
      false
    );
    expect(rows.map((r) => r.key)).toEqual(['d', 'd-1']);
    expect(rows.map((r) => r.disabled)).toEqual([true, false]);
  });

  it('handles empty input', () => {
    expect(flattenVisibleTree([], [], false)).toEqual([]);
  });
});

describe('filterTreeByQuery', () => {
  it('keeps matches plus their ancestor path and reports both key sets', () => {
    const result = filterTreeByQuery(tree, 'x');
    expect(result).not.toBeNull();
    expect(result!.matchedKeys).toEqual(['a-1-x']);
    expect([...result!.ancestorKeys].sort()).toEqual(['a', 'a-1']);
    expect(result!.tree).toHaveLength(1);
    expect(result!.tree[0]!.key).toBe('a');
    expect(result!.tree[0]!.children).toHaveLength(1);
    expect(result!.tree[0]!.children![0]!.key).toBe('a-1');
    expect(result!.tree[0]!.children![0]!.children).toHaveLength(1);
  });

  it('keeps a node whose own title misses when a descendant hits', () => {
    const result = filterTreeByQuery(tree, 'A1X');
    expect(result!.tree[0]!.children).toHaveLength(1);
    expect(result!.tree[0]!.children![0]!.key).toBe('a-1');
  });

  it('returns null for an empty query so callers keep their data by reference', () => {
    expect(filterTreeByQuery(tree, '')).toBeNull();
  });

  it('returns an empty tree when nothing matches', () => {
    expect(filterTreeByQuery(tree, 'zzz')!.tree).toEqual([]);
  });
});

describe('pruneLoadedChildren', () => {
  it('drops entries whose key left the controlled data', () => {
    const loaded = { gone: [{ key: 'gone-0', title: 'G0' }] };
    expect(pruneLoadedChildren(loaded, tree)).toEqual({});
  });

  it('drops entries whose node now ships its own children', () => {
    const loaded = { a: [{ key: 'stale', title: 'Stale' }] };
    expect(pruneLoadedChildren(loaded, tree)).toEqual({});
  });

  it('keeps valid entries and the reference when nothing is pruned', () => {
    const loaded = { b: [{ key: 'b-1', title: 'B1' }] };
    expect(pruneLoadedChildren(loaded, tree)).toBe(loaded);
  });
});
