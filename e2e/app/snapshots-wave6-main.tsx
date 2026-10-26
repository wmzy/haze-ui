/**
 * Fixture for the Wave 6 pixel baselines (e2e/snapshots.spec.ts): the
 * DataTable in its enterprise combination — sticky header + selection
 * column + pinned left/right columns over a horizontally scrolling
 * middle — plus the Workbench shell in its docked-sidebar desktop form
 * and the Datepicker's open calendar panel (value pinned to 2026-09-01,
 * so the frame is always September 2026; the spec opens the panel and
 * captures it directly, the same contract as the other overlay
 * baselines).
 *
 * Mounted fully determined like every snapshots page: controlled values
 * only, no timers, no network. Widths are fixed px classes —
 * shrink-to-fit sections would track the host font's glyph advances
 * (see the wave5 buttonGroupWidth rationale), and the Workbench needs
 * a container wider than its own 768px container-query breakpoint so
 * the desktop grid form (docked sidebar, side rail) engages instead of
 * the mobile one.
 */
import type { ReactNode } from 'react';

import { css } from '@linaria/core';
import {
  Bell,
  FileCode,
  FileJson,
  FileText,
  Files,
  GitBranch,
  PanelLeft,
  Search,
  Settings,
  User,
} from 'lucide-react';

import { ActivityRail, ActivityRailItem } from '../../src/lib/components/ActivityRail';
import { DataTable } from '../../src/lib/components/DataTable';
import type { DataTableColumnDef } from '../../src/lib/components/DataTable';
import { Datepicker } from '../../src/lib/components/Datepicker';
import { StatusBar, StatusItem } from '../../src/lib/components/StatusBar';
import { TabBar, TabBarItem } from '../../src/lib/components/TabBar';
import { Workbench } from '../../src/lib/components/Workbench';

import { mountPage } from './components/mount';

const section = css`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: var(--haze-space-3);
`;

/* Narrower than the declared column widths (52 + 120 + 170 + 210 + 130
   + 90 + 120 = 892px) so the fixed left/right columns pin against a
   scrolling middle; the table must size to its colgroup sum —
   shrink-to-fit would squeeze the declared widths into the container
   and leave nothing to scroll (same override as snapshots-main). */
const dataTableWidth = css`
  width: 520px;

  & table {
    width: max-content;
    min-width: 100%;
  }
`;

/* Height bound on the DataTable root (className lands there): only a
   bounded root makes the scroll area actually scroll, which is what
   makes stickyHeader stick — 12 rows overflow 240px comfortably. */
const dataTableViewport = css`
  max-height: 240px;
`;

/* Wider than the Workbench's own 768px container-query breakpoint, so
   the desktop form engages (the shell reads ITS inline size, not the
   viewport); fixed px so the baseline geometry never tracks the host. */
const workbenchWidth = css`
  width: 900px;
`;

const sidebarPad = css`
  padding: var(--haze-space-2);
`;

const sidebarFile = css`
  display: flex;
  align-items: center;
  gap: var(--haze-space-2);
  padding: var(--haze-space-1) var(--haze-space-2);
  font-size: var(--haze-text-sm);
  color: var(--haze-color-text-secondary);
  border-radius: var(--haze-radius-md);
`;

const sidebarFileActive = css`
  color: var(--haze-color-text);
  background: var(--haze-color-bg-muted);
`;

const sidebarDir = css`
  display: flex;
  align-items: center;
  gap: var(--haze-space-2);
  padding: var(--haze-space-1) var(--haze-space-2);
  font-size: var(--haze-text-sm);
  font-weight: var(--haze-weight-semibold);
  color: var(--haze-color-text);
  border-radius: var(--haze-radius-md);
`;

const editorPad = css`
  padding: var(--haze-space-4);
  display: flex;
  flex-direction: column;
  gap: var(--haze-space-3);
  overflow: auto;
`;

const editorTitle = css`
  margin: 0;
  font-size: var(--haze-text-lg);
  font-weight: var(--haze-weight-semibold);
`;

const editorBody = css`
  margin: 0;
  font-size: var(--haze-text-sm);
  line-height: var(--haze-leading-normal);
  color: var(--haze-color-text-secondary);
`;

const panelPad = css`
  padding: var(--haze-space-3);
  font-family: var(--haze-font-mono);
  font-size: var(--haze-text-xs);
  color: var(--haze-color-text-secondary);
  white-space: pre-wrap;
`;

type MemberRow = {
  id: number;
  name: string;
  role: string;
  team: string;
  status: string;
  score: number;
  joined: string;
};

const MEMBERS: MemberRow[] = [
  { id: 1, name: 'Ada Lovelace', role: 'Owner', team: 'Platform primitives', status: 'active', score: 98, joined: '2025-02-11' },
  { id: 2, name: 'Grace Hopper', role: 'Maintainer', team: 'Tokens and theming', status: 'active', score: 94, joined: '2025-03-04' },
  { id: 3, name: 'Alan Kay', role: 'Reviewer', team: 'Overlay engine', status: 'active', score: 91, joined: '2025-05-19' },
  { id: 4, name: 'Barbara Liskov', role: 'Maintainer', team: 'Forms and controls', status: 'away', score: 88, joined: '2025-06-02' },
  { id: 5, name: 'Edsger Dijkstra', role: 'Reviewer', team: 'Overlay engine', status: 'active', score: 85, joined: '2025-07-14' },
  { id: 6, name: 'Frances Allen', role: 'Member', team: 'Data table', status: 'active', score: 82, joined: '2025-08-30' },
  { id: 7, name: 'John Backus', role: 'Member', team: 'Data table', status: 'away', score: 79, joined: '2025-09-08' },
  { id: 8, name: 'Katherine Johnson', role: 'Reviewer', team: 'Tokens and theming', status: 'active', score: 96, joined: '2025-10-01' },
  { id: 9, name: 'Linus Torvalds', role: 'Member', team: 'Platform primitives', status: 'active', score: 87, joined: '2025-10-27' },
  { id: 10, name: 'Margaret Hamilton', role: 'Maintainer', team: 'Forms and controls', status: 'active', score: 93, joined: '2026-01-15' },
  { id: 11, name: 'Niklaus Wirth', role: 'Member', team: 'Layout family', status: 'away', score: 81, joined: '2026-03-22' },
  { id: 12, name: 'Radia Perlman', role: 'Reviewer', team: 'Layout family', status: 'active', score: 90, joined: '2026-04-09' },
];

const MEMBER_COLUMNS: DataTableColumnDef<MemberRow>[] = [
  {
    accessorKey: 'name',
    header: 'Name',
    cell: (info) => <strong>{info.getValue() as string}</strong>,
    meta: { width: 120, fixed: 'left' },
  },
  { accessorKey: 'role', header: 'Role', meta: { width: 170 } },
  { accessorKey: 'team', header: 'Team', meta: { width: 210 } },
  { accessorKey: 'status', header: 'Status', meta: { width: 130 } },
  { accessorKey: 'score', header: 'Score', meta: { width: 90 } },
  {
    accessorKey: 'joined',
    header: 'Joined',
    meta: { width: 120, fixed: 'right' },
  },
];

const PANEL_LINES = [
  '$ pnpm build',
  'vite v8 building for production...',
  '✓ 91 css files emitted',
  '✓ built in 4.20s',
];

/** One sidebar file row; `icon` is a fixed lucide glyph so the tree
 * paints identically on every host. */
function FileRow({
  icon,
  label,
  active = false,
}: {
  icon: ReactNode;
  label: string;
  active?: boolean;
}) {
  return (
    <div
      className={[sidebarFile, active && sidebarFileActive]
        .filter(Boolean)
        .join(' ')}
    >
      {icon}
      {label}
    </div>
  );
}

mountPage(
  <>
    <section data-snap='datatablesel' className={section}>
      <div className={dataTableWidth}>
        <DataTable
          columns={MEMBER_COLUMNS}
          data={MEMBERS}
          getRowId={(row) => String(row.id)}
          selectable
          rowSelection={{ '3': true, '7': true }}
          stickyHeader
          className={dataTableViewport}
        />
      </div>
    </section>

    <section data-snap='datepickeropen' className={section}>
      {/* Controlled constant: the panel is always September 2026. */}
      <Datepicker value='2026-09-01' placeholder='Review date' />
    </section>

    <section data-snap='workbench' className={section}>
      <div className={workbenchWidth}>
        <Workbench
          style={{ height: 520 }}
          activityBar={
            <ActivityRail aria-label='Views'>
              <ActivityRailItem icon={<Files size={20} />} label='Explorer' active />
              <ActivityRailItem icon={<Search size={20} />} label='Search' />
              <ActivityRailItem icon={<GitBranch size={20} />} label='Source Control' badge={2} />
              <ActivityRailItem slot='end' icon={<Settings size={20} />} label='Settings' />
            </ActivityRail>
          }
          sidebar={
            <div className={sidebarPad}>
              <div className={sidebarDir}>
                <Files size={14} />
                src
              </div>
              <FileRow icon={<FileCode size={14} />} label='App.tsx' active />
              <FileRow icon={<FileCode size={14} />} label='Workbench.tsx' />
              <FileRow icon={<FileJson size={14} />} label='tokens.json' />
              <FileRow icon={<FileText size={14} />} label='notes.md' />
            </div>
          }
          panel={
            <div className={panelPad}>{PANEL_LINES.join('\n')}</div>
          }
          statusBar={
            <StatusBar
              left={
                <>
                  <StatusItem>main*</StatusItem>
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
              <TabBarItem icon={<PanelLeft size={22} />} label='Sidebar' />
              <TabBarItem icon={<Files size={22} />} label='Files' active />
              <TabBarItem icon={<Search size={22} />} label='Search' />
              <TabBarItem icon={<Bell size={22} />} label='Alerts' badge={2} />
              <TabBarItem icon={<User size={22} />} label='Settings' />
            </TabBar>
          }
        >
          <div className={editorPad}>
            <h3 className={editorTitle}>Workbench.tsx</h3>
            <p className={editorBody}>
              The IDE-type work surface: a fixed activity rail, a docked
              and resizable sidebar, an editor column with a bottom
              panel, and a full-width status bar.
            </p>
            <p className={editorBody}>
              Every width and collapsed flag is a ControlOrValue prop, so
              drags can be persisted and toggles driven from outside.
            </p>
          </div>
        </Workbench>
      </div>
    </section>
  </>
);
