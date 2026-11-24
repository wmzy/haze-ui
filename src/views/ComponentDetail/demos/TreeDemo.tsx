import { useCallback, useRef, useState } from 'react';

import { SortableTree, Tree, useTree, type TreeNodeData } from '@/lib';

import PropsTable from '../PropsTable';

import {
  AccessibilitySection,
  CssVarsSection,
  DemoPage,
  DemoSection,
  maxWidth320,
} from './shared';

// ─── SortableTree ───────────────────────────────────────────────

const sortableTreeData: TreeNodeData[] = [
  {
    key: 'folder-1',
    title: 'Folder 1',
    children: [
      { key: 'doc-1-1', title: 'Doc 1-1' },
      { key: 'doc-1-2', title: 'Doc 1-2' },
    ],
  },
  {
    key: 'folder-2',
    title: 'Folder 2',
    children: [
      { key: 'doc-2-1', title: 'Doc 2-1' },
      { key: 'doc-2-2', title: 'Doc 2-2' },
    ],
  },
  { key: 'standalone', title: 'Standalone file' },
];

function findTreeNode(
  nodes: TreeNodeData[],
  key: string
): TreeNodeData | null {
  for (const node of nodes) {
    if (node.key === key) return node;
    if (node.children) {
      const hit = findTreeNode(node.children, key);
      if (hit) return hit;
    }
  }
  return null;
}

/** The onMove contract as a treeData update: detach the node with its
 *  whole subtree, then splice it into the new parent at `index`. */
function applyMove(
  data: TreeNodeData[],
  info: { key: string; parentKey: string | null; index: number }
): TreeNodeData[] {
  const next = data.map((node) => ({
    ...node,
    children: node.children ? node.children.slice() : undefined,
  }));
  let moved: TreeNodeData | undefined;
  const detach = (nodes: TreeNodeData[]): boolean => {
    const at = nodes.findIndex((node) => node.key === info.key);
    if (at >= 0) {
      moved = nodes[at];
      nodes.splice(at, 1);
      return true;
    }
    return nodes.some((node) => {
      if (!node.children) return false;
      node.children = node.children.slice();
      return detach(node.children);
    });
  };
  if (!detach(next) || !moved) return data;
  const parent =
    info.parentKey === null ? null : findTreeNode(next, info.parentKey);
  const target = parent ? (parent.children ??= []) : next;
  target.splice(Math.min(info.index, target.length), 0, moved);
  return next;
}

function SortableTreeExample({ dragHandle }: { dragHandle?: boolean }) {
  const [data, setData] = useState(sortableTreeData);
  const [expanded, setExpanded] = useState<string[]>(['folder-1']);
  return (
    <SortableTree
      treeData={data}
      expandedKeys={expanded}
      onExpand={setExpanded}
      dragHandle={dragHandle}
      onMove={(info) => setData((prev) => applyMove(prev, info))}
    />
  );
}

// ─── Tree ───────────────────────────────────────────────────────

/** The shared sample tree (basic, checkable, and search sections). */
const treeData: TreeNodeData[] = [
  {
    key: 'root',
    title: 'Root',
    children: [
      {
        key: 'parent-1',
        title: 'Parent 1',
        children: [
          { key: 'child-1-1', title: 'Child 1-1' },
          { key: 'child-1-2', title: 'Child 1-2' },
        ],
      },
      {
        key: 'parent-2',
        title: 'Parent 2',
        children: [
          { key: 'child-2-1', title: 'Child 2-1' },
          { key: 'child-2-2', title: 'Child 2-2' },
        ],
      },
    ],
  },
];

/** Fake server for the lazy-loading demo: 600 ms latency, one
 *  deliberate failure per "flaky" node, deterministic children keyed
 *  off the node's key (titles are ReactNode — never stringify them). */
function useLazyServer() {
  const failedOnce = useRef(new Set<string>());
  return useCallback((node: TreeNodeData) => {
    const key = node.key;
    return new Promise<TreeNodeData[]>((resolve, reject) => {
      setTimeout(() => {
        if (key.startsWith('flaky') && !failedOnce.current.has(key)) {
          failedOnce.current.add(key);
          reject(new Error('simulated server error'));
          return;
        }
        resolve(
          Array.from({ length: 3 }, (_, i) => ({
            key: `${key}-${i}`,
            title: `${key} item ${i + 1}`,
          }))
        );
      }, 600);
    });
  }, []);
}

function LazyTreeDemo() {
  const loadData = useLazyServer();
  return (
    <Tree
      treeData={[
        { key: 'docs', title: 'Documents' },
        { key: 'media', title: 'Media', isLeaf: true },
        { key: 'flaky', title: 'Flaky server' },
      ]}
      loadData={loadData}
    />
  );
}

function SearchTreeDemo() {
  const [searchValue, setSearchValue] = useState('');
  return (
    <>
      <input
        value={searchValue}
        onChange={(event) => setSearchValue(event.target.value)}
        placeholder='Search the tree… (try “2-1”)'
        style={{
          width: '100%',
          boxSizing: 'border-box',
          marginBottom: 12,
          padding: '6px 10px',
        }}
      />
      <Tree treeData={treeData} searchValue={searchValue} />
    </>
  );
}

/** useTree demo: live path breadcrumb + imperative scroll with
 *  autoExpand against the virtualized 1200-node dataset. */
function UseTreeDemo({ data }: { data: TreeNodeData[] }) {
  const tree = useTree({ treeData: data });
  const [target, setTarget] = useState('group-120-3');
  const path = tree.getPath(target);
  return (
    <>
      <div
        style={{
          display: 'flex',
          gap: 8,
          flexWrap: 'wrap',
          marginBottom: 12,
        }}
      >
        <input
          value={target}
          aria-label='Target node key'
          placeholder='group-120-3'
          onChange={(event) => setTarget(event.target.value)}
          style={{ padding: '6px 10px', width: 160 }}
        />
        <button
          type='button'
          onClick={() => tree.scrollTo(target, { autoExpand: true })}
        >
          Scroll to node
        </button>
      </div>
      <p style={{ marginTop: 0 }}>
        Path:{' '}
        {path.length > 0 ? (
          path.map((node: TreeNodeData, index: number) => (
            <span key={node.key}>
              {index > 0 && ' › '}
              {node.title}
            </span>
          ))
        ) : (
          <em>unknown key</em>
        )}{' '}
        · {tree.flattenVisible().length} rows visible
      </p>
      <div style={maxWidth320}>
        <Tree {...tree.treeProps} virtualized={{ height: 288 }} />
      </div>
    </>
  );
}

export default function TreeDemo() {
  // 200 groups × 6 rows = 1200 nodes for the virtualized example.
  const virtualData: TreeNodeData[] = Array.from(
    { length: 200 },
    (_, group) => ({
      key: `group-${group}`,
      title: `Group ${group}`,
      children: Array.from({ length: 5 }, (_, i) => ({
        key: `group-${group}-${i}`,
        title: `Item ${group}-${i}`,
      })),
    })
  );

  return (
    <DemoPage
      title='Tree'
      description={
        <>
          Hierarchical data display with expandable nodes, selection, and checkbox
          support.
        </>
      }
    >
      <DemoSection title='Basic'>
        <div style={maxWidth320}>
          <Tree treeData={treeData} />
        </div>
      </DemoSection>

      <DemoSection title='Checkable'>
        <div style={maxWidth320}>
          <Tree treeData={treeData} checkable />
        </div>
      </DemoSection>

      <DemoSection title='With Icons and Lines'>
        <div style={maxWidth320}>
          <Tree treeData={treeData} showIcon showLine />
        </div>
      </DemoSection>

      <DemoSection title='Keyboard Navigation'>
        <p>
          The tree follows the WAI-ARIA tree pattern with a roving tabindex:
          Tab enters at the current node, and every node is reachable without
          a mouse. Under <code>dir=&quot;rtl&quot;</code> the horizontal
          arrows mirror.
        </p>
        <div style={{ maxWidth: 320, marginBottom: 16 }}>
          <Tree treeData={treeData} checkable />
        </div>
        <ul>
          <li>
            <kbd>↑</kbd> / <kbd>↓</kbd> — move between visible nodes
            (collapsed subtrees are skipped, no wrapping)
          </li>
          <li>
            <kbd>→</kbd> — expand a collapsed node, or move to its first
            child when open
          </li>
          <li>
            <kbd>←</kbd> — collapse an open node, or move to its parent
          </li>
          <li>
            <kbd>Home</kbd> / <kbd>End</kbd> — first / last visible node
          </li>
          <li>
            <kbd>Enter</kbd> — select the focused node
          </li>
          <li>
            <kbd>Space</kbd> — toggle the focused node&apos;s checkbox (with{' '}
            <code>checkable</code>)
          </li>
        </ul>
      </DemoSection>

      <DemoSection title='Virtualized (1200 nodes)'>
        <p>
          With <code>virtualized</code> the visible rows are flattened and
          rendered through <code>VirtualList</code> — only the window (plus
          overscan) stays mounted, and keyboard navigation scrolls the
          focused row into view. State props (
          <code>expandedKeys</code> / <code>selectedKeys</code> /{' '}
          <code>checkedKeys</code>) behave exactly as on the plain path.
        </p>
        <div style={maxWidth320}>
          <Tree
            treeData={virtualData}
            virtualized={{ height: 288 }}
            expandedKeys={['group-0']}
            checkable
          />
        </div>
      </DemoSection>

      <DemoSection title='useTree (path queries + scrollTo)'>
        <p>
          <code>useTree</code> is the companion hook: it owns{' '}
          <code>expandedKeys</code> through the same control contract as the
          tree (pass a control for controlled sharing, a plain array as the
          uncontrolled initial), answers <code>getPath(key)</code> with the
          root-first ancestor chain (breadcrumb-ready) and{' '}
          <code>flattenVisible()</code> with the exact row order the
          virtualized window pages over, and drives{' '}
          <code>scrollTo(key, {'{ autoExpand }'})</code> — expanding the
          ancestors first and landing the scroll on that commit. Spread{' '}
          <code>{'{...tree.treeProps}'}</code> onto the tree so the hook and
          the component share one state; an unknown key is a durable no-op.
        </p>
        <UseTreeDemo data={virtualData} />
      </DemoSection>

      <DemoSection title='Lazy Loading (loadData)'>
        <p>
          With <code>loadData</code>, nodes that ship no children (and are not{' '}
          <code>isLeaf</code>) fetch them from your server the first time they
          are expanded, show a spinner while in flight, and cache the result —
          collapsing and re-expanding never requests again. The cache resets
          when controlled <code>treeData</code> stops mapping onto it. A
          rejected load renders an inline <em>Load failed · Retry</em>{' '}
          affordance; expanding the failed node again retries too.{' '}
          <code>Media</code> below is <code>isLeaf</code> and never loads;{' '}
          <code>Flaky server</code> fails once on purpose.
        </p>
        <div style={maxWidth320}>
          <LazyTreeDemo />
        </div>
      </DemoSection>

      <DemoSection title='Search Filtering (searchValue)'>
        <p>
          A non-empty <code>searchValue</code> keeps only the nodes whose title
          matches (case-insensitive) plus the ancestor path to them —
          ancestors auto-expand so hits stay visible — and wraps each match in
          a highlighted <code>&lt;mark&gt;</code>. When nothing matches, the
          localized empty state is shown. Controlled{' '}
          <code>expandedKeys</code> keep working underneath the filter.
        </p>
        <div style={maxWidth320}>
          <SearchTreeDemo />
        </div>
      </DemoSection>

      <DemoSection title='Sortable (SortableTree)'>
        <p>
          <code>SortableTree</code> wraps the same tree with drag and drop
          (backed by the <code>@dnd-kit</code> dependency — the plain{' '}
          <code>Tree</code> stays free of it). Dropping a row onto another
          inserts it <strong>right after the target</strong>: a drop on a
          same-level row reorders, a drop on a child of another folder
          reparents. The dragged node travels with its <strong>whole
          subtree</strong>, and a node never drops into its own subtree.
          State stays controlled and one-way: <code>onMove</code> reports{' '}
          <code>{'{ key, parentKey, index }'}</code> and you update{' '}
          <code>treeData</code> — without a handler a drop animates back to
          the source position. The second example sets{' '}
          <code>dragHandle</code>: pointer drags start on the leading grip
          only, while the default whole-row mode keeps clicks, expands and
          checks untouched through an 8px drag threshold.
        </p>
        <div style={{ maxWidth: 320, marginBottom: 16 }}>
          <SortableTreeExample />
        </div>
        <div style={maxWidth320}>
          <SortableTreeExample dragHandle />
        </div>
        <ul>
          <li>
            Keyboard sortable on either mode: focus a row, <kbd>Space</kbd>{' '}
            lifts, <kbd>↑</kbd> / <kbd>↓</kbd> move (rows inside the dragged
            subtree read as “over itself” — walk past them),{' '}
            <kbd>Space</kbd> drops, <kbd>Escape</kbd> cancels
          </li>
        </ul>
      </DemoSection>

      <DemoSection title='Tree Props'>
        <PropsTable of='TreeProps' />
      </DemoSection>

      <DemoSection title='TreeNodeData'>
        <PropsTable of='TreeNodeData' />
      </DemoSection>

      <DemoSection title='SortableTree Props'>
        <PropsTable of='SortableTreeProps' />
      </DemoSection>

      <AccessibilitySection>
        <ul>
          <li>
            <strong>role=&quot;tree&quot;</strong> /{' '}
            <strong>role=&quot;treeitem&quot;</strong> semantics with{' '}
            <strong>aria-expanded</strong> / <strong>aria-level</strong> on
            each node
          </li>
          <li>
            Selected state via <strong>aria-selected</strong>, checked state
            via <strong>aria-checked</strong>
          </li>
          <li>
            Roving tabindex: one tab stop per tree, full keyboard operation
            (see Keyboard Navigation above)
          </li>
          <li>
            SortableTree keeps the tree semantics — keyboard drags run on
            the focused row (<kbd>Space</kbd> lift/drop), the{' '}
            <code>dragHandle</code> grip is a pointer-only affordance
            hidden from assistive tech
          </li>
        </ul>
      </AccessibilitySection>

      <CssVarsSection component='tree' />
    </DemoPage>
  );
}
