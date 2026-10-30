import type { UseTreeResult } from './useTree';

import type { TreeNodeData } from './types';

import { act, render, renderHook, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useControl } from 'react-use-control';

import { stubScrollIntoView } from '../../utils/testing/stub-scroll-into-view';

import Tree from './Tree';
import { useTree } from './useTree';

const treeData: TreeNodeData[] = [
  {
    key: 'a',
    title: 'Node A',
    children: [
      {
        key: 'a-1',
        title: 'Node A1',
        children: [{ key: 'a-1-x', title: 'Leaf A1X' }],
      },
      { key: 'a-2', title: 'Node A2' },
    ],
  },
  { key: 'b', title: 'Node B' },
];

/** Renders the tree wired through the hook and exposes the live result. */
function Harness({
  api,
  data = treeData,
  virtualized = false,
}: {
  api: { current: UseTreeResult | null };
  data?: TreeNodeData[];
  virtualized?: boolean;
}) {
  const tree = useTree({ treeData: data });
  api.current = tree;
  return <Tree {...tree.treeProps} virtualized={virtualized} />;
}

describe('useTree', () => {
  it('getPath returns the root-first chain including the node', () => {
    const { result } = renderHook(() => useTree({ treeData }));
    expect(result.current.getPath('a-1-x').map((n) => n.key)).toEqual([
      'a',
      'a-1',
      'a-1-x',
    ]);
    expect(result.current.getPath('a-1-x').map((n) => n.title)).toEqual([
      'Node A',
      'Node A1',
      'Leaf A1X',
    ]);
    expect(result.current.getPath('b').map((n) => n.key)).toEqual(['b']);
    expect(result.current.getPath('unknown')).toEqual([]);
  });

  it('flattenVisible tracks expansion in depth-first order', () => {
    const { result } = renderHook(() => useTree({ treeData }));
    expect(result.current.flattenVisible().map((row) => row.key)).toEqual([
      'a',
      'b',
    ]);

    act(() => result.current.setExpandedKeys(['a']));
    expect(result.current.flattenVisible().map((row) => row.key)).toEqual([
      'a',
      'a-1',
      'a-2',
      'b',
    ]);

    act(() => result.current.setExpandedKeys(['a', 'a-1']));
    expect(result.current.flattenVisible().map((row) => row.key)).toEqual([
      'a',
      'a-1',
      'a-1-x',
      'a-2',
      'b',
    ]);
  });

  it('flattenVisible matches the rendered treeitem order', () => {
    const api = { current: null as UseTreeResult | null };
    render(<Harness api={api} />);
    act(() => api.current!.setExpandedKeys(['a', 'a-1']));

    const domOrder = Array.from(
      document.querySelectorAll('[role="treeitem"]')
    ).map((el) => el.getAttribute('data-tree-key'));
    expect(api.current!.flattenVisible().map((row) => row.key)).toEqual(
      domOrder
    );
  });

  it('accepts a plain array as the uncontrolled initial expansion', () => {
    const { result } = renderHook(() =>
      useTree({ treeData, expandedKeys: ['a'] })
    );
    expect(result.current.expandedKeys).toEqual(['a']);
    expect(result.current.flattenVisible().map((row) => row.key)).toEqual([
      'a',
      'a-1',
      'a-2',
      'b',
    ]);
  });

  it('shares a consumer-owned control both ways', async () => {
    const user = userEvent.setup();
    function Host() {
      const [expanded, , control] = useControl<string[]>([]);
      const tree = useTree({ treeData, expandedKeys: control });
      return (
        <>
          <output>{expanded.join(',') || 'none'}</output>
          <Tree {...tree.treeProps} />
        </>
      );
    }
    render(<Host />);
    expect(screen.getByText('none')).toBeInTheDocument();

    // A switcher click inside the tree lands in the parent-owned state.
    await user.click(screen.getByText('Node A'));
    expect(screen.getByText('a')).toBeInTheDocument();
  });

  it('tree switcher clicks update the hook expansion state', async () => {
    const user = userEvent.setup();
    const api = { current: null as UseTreeResult | null };
    render(<Harness api={api} />);
    expect(api.current!.expandedKeys).toEqual([]);

    await user.click(screen.getByText('Node A'));
    expect(api.current!.expandedKeys).toEqual(['a']);
    expect(screen.getByText('Node A2')).toBeInTheDocument();
  });

  it('scrollTo lands the row in the virtual window after autoExpand commits', () => {
    // 200 groups × 5 children; expanding group-120 mounts 5 more rows
    // (205 total) and pushes the target 124 rows into the content.
    const bigData: TreeNodeData[] = Array.from({ length: 200 }, (_, group) => ({
      key: `group-${group}`,
      title: `Group ${group}`,
      children: Array.from({ length: 5 }, (_, i) => ({
        key: `group-${group}-${i}`,
        title: `Item ${group}-${i}`,
      })),
    }));
    const api = { current: null as UseTreeResult | null };
    const { container } = render(
      <Harness api={api} data={bigData} virtualized />
    );
    const port = container.querySelector(
      '[data-slot="virtual-list"]'
    )!;
    // jsdom reports no layout: give the scrollport its real content extent
    // so VirtualListHandle clamping behaves like a browser.
    Object.defineProperty(port, 'scrollHeight', {
      value: 205 * 32,
      configurable: true,
    });

    act(() => api.current!.scrollTo('group-120-3', { autoExpand: true }));

    expect(api.current!.expandedKeys).toEqual(['group-120']);
    // 'auto' alignment for a row entering from below pins its start edge:
    // 124 rows above × 32px row height.
    expect(port.scrollTop).toBe(124 * 32);
  });

  it('keeps a nested-path scrollTo request pending until the row exists', () => {
    const api = { current: null as UseTreeResult | null };
    render(<Harness api={api} />);

    const scrolled: HTMLElement[] = [];
    // jsdom ships no scrollIntoView; capture the scrolled elements
    // through the shared stub (restores the prototype afterwards).
    const { restore } = stubScrollIntoView(function capture(
      this: HTMLElement
    ) {
      scrolled.push(this);
    });
    try {
      // Collapsed ancestors and no autoExpand: the request stays pending,
      // nothing expands, nothing scrolls.
      act(() => api.current!.scrollTo('a-1-x'));
      expect(scrolled).toHaveLength(0);
      expect(api.current!.expandedKeys).toEqual([]);

      // The commit the request was waiting for resolves it.
      act(() => api.current!.setExpandedKeys(['a', 'a-1']));
      expect(scrolled).toHaveLength(1);
      expect(scrolled[0]!.getAttribute('data-tree-key')).toBe('a-1-x');
    } finally {
      restore();
    }
  });

  it('scrollTo without a mounted tree is a safe no-op that still expands', () => {
    const { result } = renderHook(() => useTree({ treeData }));
    act(() => result.current.scrollTo('a-1-x', { autoExpand: true }));
    // The autoExpand half wrote the ancestors; the scroll half has no tree
    // to route to and quietly did nothing.
    expect(result.current.expandedKeys).toEqual(['a', 'a-1']);
  });

  it('has no axe violations on a tree wired through useTree', async () => {
    const { axe } = await import('jest-axe');
    const api = { current: null as UseTreeResult | null };
    render(<Harness api={api} />);
    act(() => api.current!.setExpandedKeys(['a', 'a-1']));
    const results = await axe(document.body, {
      rules: { region: { enabled: false } },
    });
    expect(results.violations).toEqual([]);
  });
});
