import type { ReactNode } from 'react';

import type { TreeNodeData } from '@/lib/components/Tree';

import { useControl } from 'react-use-control';
import {
  Files,
  Search,
  GitBranch,
  Settings,
  Bell,
  User,
  FileCode,
  FileJson,
  FileText,
} from 'lucide-react';

import { ActivityRail, ActivityRailItem } from '@/lib/components/ActivityRail';
import { Button } from '@/lib/components/Button';
import { StatusBar, StatusItem } from '@/lib/components/StatusBar';
import { TabBar, TabBarItem } from '@/lib/components/TabBar';
import { Tabs, TabList, Tab, TabPanel } from '@/lib/components/Tabs';
import { Tree } from '@/lib/components/Tree';
import { Workbench } from '@/lib/components/Workbench';

import PropsTable from '../PropsTable';

import A11yNote from '../A11yNote';

import { intro, section, row, codeBlock } from '../styles';

const fileTree: TreeNodeData[] = [
  {
    key: 'src',
    title: 'src',
    children: [
      {
        key: 'src/components',
        title: 'components',
        children: [
          { key: 'src/components/App.tsx', title: 'App.tsx' },
          { key: 'src/components/Rail.tsx', title: 'Rail.tsx' },
        ],
      },
      { key: 'src/index.tsx', title: 'index.tsx' },
      { key: 'src/styles.css', title: 'styles.css' },
    ],
  },
  {
    key: 'public',
    title: 'public',
    children: [{ key: 'public/favicon.svg', title: 'favicon.svg' }],
  },
  { key: 'package.json', title: 'package.json' },
];

type Doc = {
  value: string;
  label: string;
  icon: ReactNode;
  status?: 'dirty' | 'error' | 'syncing';
};

const initialDocs: Doc[] = [
  { value: 'app', label: 'App.tsx', icon: <FileCode size={14} /> },
  {
    value: 'index',
    label: 'index.tsx',
    icon: <FileCode size={14} />,
    status: 'dirty',
  },
  {
    value: 'pkg',
    label: 'package.json',
    icon: <FileJson size={14} />,
    status: 'error',
  },
  {
    value: 'notes',
    label: 'notes.md',
    icon: <FileText size={14} />,
    status: 'syncing',
  },
];

const docBody: Record<string, string> = {
  app: 'export default function App() {\n  return <Workbench>…</Workbench>;\n}',
  index: "import { createRoot } from 'react-dom/client';\n// unsaved edits",
  pkg: '{\n  "name": "haze-workbench-demo"\n}',
  notes: 'Drag the handles. Close tabs with × or Delete.',
};

const panelLines = [
  '$ pnpm build',
  'vite v8 building for production...',
  '✓ 91 css files emitted',
];

/** Explorer tree for the sidebar slot: uncontrolled expansion seeded
 * with the src path so the demo opens looking like a real file tree. */
function SidebarTree() {
  const [, , expandedCtrl] = useControl<string[]>(undefined, [
    'src',
    'src/components',
    'public',
  ]);
  return (
    <div style={{ padding: 'var(--haze-space-2)' }}>
      <Tree treeData={fileTree} expandedKeys={expandedCtrl} />
    </div>
  );
}

/** Document tabs on the Tabs doc layer: closable + icon + status, one
 * controlled value, close re-homes the selection to the next neighbor. */
function EditorTabs() {
  const [docs, setDocs] = useControl(undefined, initialDocs);
  const [active, setActive, activeCtrl] = useControl(undefined, 'app');

  const closeDoc = (value: string) => {
    const index = docs.findIndex((doc) => doc.value === value);
    if (index === -1) return;
    const next = docs.filter((doc) => doc.value !== value);
    if (active === value) {
      const fallback = next[Math.min(index, next.length - 1)];
      if (fallback) setActive(fallback.value);
    }
    setDocs(next);
  };

  return (
    <Tabs value={activeCtrl}>
      <TabList overflowLabel='More files'>
        {docs.map((doc) => (
          <Tab
            key={doc.value}
            value={doc.value}
            icon={doc.icon}
            status={doc.status}
            closable
            onClose={() => closeDoc(doc.value)}
          >
            {doc.label}
          </Tab>
        ))}
      </TabList>
      {docs.map((doc) => (
        <TabPanel key={doc.value} value={doc.value}>
          <pre
            style={{
              margin: 0,
              padding: 'var(--haze-space-3)',
              fontFamily: 'var(--haze-font-mono)',
              fontSize: 'var(--haze-text-xs)',
              color: 'var(--haze-color-text-secondary)',
              whiteSpace: 'pre-wrap',
            }}
          >
            {docBody[doc.value] ?? ''}
          </pre>
        </TabPanel>
      ))}
    </Tabs>
  );
}

// ─── Workbench ─────────────────────────────────────────────────
export default function WorkbenchDemo() {
  // Uncontrolled with an external read-back — the header button flips the
  // control, Workbench consumes the same control (the ControlOrValue
  // idiom, same shape a persistence layer or hamburger toggle would use).
  const [railView, setRailView] = useControl(undefined, 'files');
  const [sidebarCollapsed, setSidebarCollapsed, sidebarCtrl] = useControl(
    undefined,
    false
  );
  const [panelCollapsed, setPanelCollapsed, panelCtrl] = useControl(
    undefined,
    false
  );

  return (
    <>
      <h1>Workbench</h1>
      <p className={intro}>
        The VSCode-type work surface: a fixed activity rail, docked and
        resizable sidebar / auxiliary columns, an editor column with a
        bottom panel, a full-width status bar — and below 768px the rail
        gives way to a bottom TabBar while the sidebar and auxiliary bar
        become scrim-dismissed overlays. Every width and collapsed flag
        is a <code>ControlOrValue</code> prop, so drags can be persisted
        and toggles driven from outside.
      </p>

      <div className={section}>
        <h2>Complete workbench</h2>
        <p className={row}>
          <Button
            size='sm'
            variant='outline'
            onClick={() => setSidebarCollapsed((v) => !v)}
          >
            {sidebarCollapsed ? 'Show sidebar' : 'Hide sidebar'}
          </Button>
          <Button
            size='sm'
            variant='outline'
            onClick={() => setPanelCollapsed((v) => !v)}
          >
            {panelCollapsed ? 'Show panel' : 'Hide panel'}
          </Button>
        </p>
        <div
          className={row}
          style={{
            height: 520,
            border: '1px solid var(--haze-color-border)',
            borderRadius: 'var(--haze-radius-lg)',
          }}
        >
          <Workbench
            activityBar={
              <ActivityRail aria-label='Views'>
                <ActivityRailItem
                  icon={<Files size={20} />}
                  label='Explorer'
                  active={railView === 'files'}
                  onSelect={() => setRailView('files')}
                />
                <ActivityRailItem
                  icon={<Search size={20} />}
                  label='Search'
                  active={railView === 'search'}
                  onSelect={() => setRailView('search')}
                />
                <ActivityRailItem
                  icon={<GitBranch size={20} />}
                  label='Source Control'
                  badge={2}
                  active={railView === 'git'}
                  onSelect={() => setRailView('git')}
                />
                <ActivityRailItem
                  slot='end'
                  icon={<Settings size={20} />}
                  label='Settings'
                  active={railView === 'settings'}
                  onSelect={() => setRailView('settings')}
                />
              </ActivityRail>
            }
            sidebar={
              <SidebarTree />
            }
            panel={
              <div
                style={{
                  padding: 'var(--haze-space-3)',
                  fontFamily: 'var(--haze-font-mono)',
                  fontSize: 'var(--haze-text-xs)',
                  color: 'var(--haze-color-text-secondary)',
                  whiteSpace: 'pre-wrap',
                }}
              >
                {panelLines.join('\n')}
              </div>
            }
            statusBar={
              <StatusBar
                left={
                  <>
                    <StatusItem
                      onSelect={() => setSidebarCollapsed((v) => !v)}
                    >
                      main*
                    </StatusItem>
                    <StatusItem>2↓ 1↑</StatusItem>
                  </>
                }
                right={
                  <>
                    <StatusItem>Ln 42, Col 8</StatusItem>
                    <StatusItem priority>TypeScript React</StatusItem>
                  </>
                }
              />
            }
            tabBar={
              <TabBar aria-label='Primary'>
                <TabBarItem
                  icon={<Files size={22} />}
                  label='Files'
                  active={railView === 'files'}
                  onSelect={() => setRailView('files')}
                />
                <TabBarItem
                  icon={<Search size={22} />}
                  label='Search'
                  active={railView === 'search'}
                  onSelect={() => setRailView('search')}
                />
                <TabBarItem
                  icon={<Bell size={22} />}
                  label='Alerts'
                  badge={2}
                  active={railView === 'git'}
                  onSelect={() => setRailView('git')}
                />
                <TabBarItem
                  icon={<User size={22} />}
                  label='Settings'
                  active={railView === 'settings'}
                  onSelect={() => setRailView('settings')}
                />
              </TabBar>
            }
            sidebarCollapsed={sidebarCtrl}
            panelCollapsed={panelCtrl}
          >
            <EditorTabs />
          </Workbench>
        </div>
        <p className={row}>
          Drag a handle (or focus it and use the arrow keys) — the sidebar
          and panel resize in px. Below 768px the activity rail disappears
          and the bottom TabBar takes over; the sidebar becomes a
          scrim-dismissed overlay driven by the same{' '}
          <code>sidebarCollapsed</code> control. Close editor tabs with the
          × or the Delete key on a focused tab.
        </p>
        <pre className={codeBlock}>
          {`<Workbench
  activityBar={<ActivityRail>…</ActivityRail>}
  sidebar={<Tree treeData={files} />}
  panel={<Terminal />}
  statusBar={<StatusBar left={…} right={…} />}
  tabBar={<TabBar>…</TabBar>}
  sidebarCollapsed={sidebarCtrl}
>
  <Tabs value={activeCtrl}>…closable document tabs…</Tabs>
</Workbench>`}
        </pre>
      </div>

      <div className={section}>
        <h2>Workbench Props</h2>
        <PropsTable of='WorkbenchProps' />
      </div>

      <div className={section}>
        <h2>Accessibility</h2>
        <A11yNote>
          <ul>
            <li>
              Resize handles are <strong>role=&quot;separator&quot;</strong>{' '}
              widgets, fully keyboard-operable (arrow keys step, Home/End
              park at the clamps — WCAG 2.5.7).
            </li>
            <li>
              The mobile overlays close on scrim click and Escape; the
              editor column keeps its scroll and focus behavior.
            </li>
            <li>
              Compose the slots from their accessible parts — ActivityRail /
              TabBar own their <code>nav</code> landmarks, StatusBar owns
              the <code>footer</code>, and the editor Tabs carry the tabs
              pattern with deletable tabs.
            </li>
          </ul>
        </A11yNote>
      </div>
    </>
  );
}
