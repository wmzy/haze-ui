import type { DataTableColumnDef } from '@/lib';

import { useControl } from 'react-use-control';

import {
  AppShell,
  Badge,
  Breadcrumb,
  BreadcrumbItem,
  Button,
  DataTable,
  Option,
  Segmented,
  Select,
  Sidebar,
  SidebarGroup,
  SidebarItem,
  Stat,
  StatGroup,
} from '@/lib';
import { dataTableToCsv } from '@/lib/components/DataTable';

/*
 * Dashboard block: AppShell + Sidebar navigation, a Breadcrumb trail, a
 * Stat card row and a DataTable with the toolbar strip (density Segmented
 * + CSV export), client-side pagination and column toggling. Fictional
 * SaaS metrics — every visual value reads a --haze-* token so the block
 * re-themes with the site.
 */

type Plan = 'free' | 'pro' | 'enterprise';
type WorkspaceStatus = 'healthy' | 'trial' | 'at risk';

type WorkspaceRow = {
  id: string;
  name: string;
  plan: Plan;
  seats: number;
  events: number;
  mrr: number;
  status: WorkspaceStatus;
};

const WORKSPACES: WorkspaceRow[] = [
  { id: 'w-101', name: 'Acme Robotics', plan: 'enterprise', seats: 42, events: 184_230, mrr: 1890, status: 'healthy' },
  { id: 'w-102', name: 'Lumen Studio', plan: 'pro', seats: 12, events: 96_410, mrr: 480, status: 'healthy' },
  { id: 'w-103', name: 'Ferrite Labs', plan: 'pro', seats: 9, events: 71_980, mrr: 360, status: 'at risk' },
  { id: 'w-104', name: 'Harbor & Co', plan: 'free', seats: 3, events: 12_004, mrr: 0, status: 'trial' },
  { id: 'w-105', name: 'Northwind Freight', plan: 'enterprise', seats: 65, events: 268_750, mrr: 2925, status: 'healthy' },
  { id: 'w-106', name: 'Quanta Health', plan: 'pro', seats: 18, events: 122_866, mrr: 720, status: 'healthy' },
  { id: 'w-107', name: 'Bright Meadow', plan: 'free', seats: 2, events: 8_312, mrr: 0, status: 'trial' },
  { id: 'w-108', name: 'Kestrel Analytics', plan: 'pro', seats: 14, events: 101_540, mrr: 560, status: 'at risk' },
  { id: 'w-109', name: 'Orbit Logistics', plan: 'enterprise', seats: 51, events: 210_390, mrr: 2295, status: 'healthy' },
  { id: 'w-110', name: 'Pinewood Press', plan: 'free', seats: 5, events: 19_748, mrr: 0, status: 'trial' },
  { id: 'w-111', name: 'Solstice Energy', plan: 'pro', seats: 21, events: 143_605, mrr: 840, status: 'healthy' },
  { id: 'w-112', name: 'Umbra Games', plan: 'pro', seats: 11, events: 88_120, mrr: 440, status: 'at risk' },
];

const planBadge = (plan: Plan) => {
  const variant = plan === 'enterprise' ? 'success' : plan === 'pro' ? 'info' : 'default';
  return <Badge variant={variant}>{plan}</Badge>;
};

const statusBadge = (status: WorkspaceStatus) => {
  const variant = status === 'healthy' ? 'success' : status === 'trial' ? 'default' : 'warning';
  return <Badge variant={variant}>{status}</Badge>;
};

const columns: DataTableColumnDef<WorkspaceRow>[] = [
  { accessorKey: 'name', header: 'Workspace' },
  { accessorKey: 'plan', header: 'Plan', cell: (info) => planBadge(info.getValue() as Plan) },
  { accessorKey: 'seats', header: 'Seats' },
  {
    accessorKey: 'events',
    header: 'Events / mo',
    cell: (info) => (info.getValue() as number).toLocaleString('en-US'),
  },
  {
    accessorKey: 'mrr',
    header: 'MRR',
    cell: (info) => `$${(info.getValue() as number).toLocaleString('en-US')}`,
  },
  { accessorKey: 'status', header: 'Status', cell: (info) => statusBadge(info.getValue() as WorkspaceStatus) },
];

/** Serialize the current rows through the table's own csv helper. */
function exportCsv(): void {
  const csv = dataTableToCsv(WORKSPACES, columns);
  const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = 'nimbus-workspaces.csv';
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

function DashboardSidebar() {
  return (
    <Sidebar>
      <SidebarGroup title='Workspace'>
        <SidebarItem active>Overview</SidebarItem>
        <SidebarItem>Events</SidebarItem>
        <SidebarItem>Funnels</SidebarItem>
        <SidebarItem>Alerts</SidebarItem>
      </SidebarGroup>
      <SidebarGroup title='Account'>
        <SidebarItem>Billing</SidebarItem>
        <SidebarItem>Members</SidebarItem>
        <SidebarItem>Settings</SidebarItem>
      </SidebarGroup>
    </Sidebar>
  );
}

export default function DashboardBlock() {
  // Density switcher: one control feeds the Segmented and the DataTable
  // `size` prop (the ControlOrValue idiom — Segmented speaks plain strings).
  const [density, setDensity, densityCtrl] = useControl(undefined, 'md');

  return (
    <div
      data-slot='dashboard-block'
      style={{ height: '100%', display: 'flex', flexDirection: 'column' }}
    >
      <AppShell
        header={
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--haze-space-3)',
              padding: '0 var(--haze-space-3)',
            }}
          >
            <strong style={{ color: 'var(--haze-color-primary)' }}>Nimbus Console</strong>
            <span style={{ flex: 1 }} />
            <Select size='sm' defaultValue='acme' aria-label='Workspace'>
              <Option value='acme'>acme-robotics</Option>
              <Option value='lumen'>lumen-studio</Option>
              <Option value='ferrite'>ferrite-labs</Option>
            </Select>
            <Badge variant='info'>ND</Badge>
          </div>
        }
        sidebar={<DashboardSidebar />}
      >
        <div
          data-slot='dashboard-content'
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--haze-space-4)',
            padding: 'var(--haze-space-4)',
          }}
        >
          <Breadcrumb>
            <BreadcrumbItem href='#dashboard'>Nimbus</BreadcrumbItem>
            <BreadcrumbItem href='#dashboard'>Analytics</BreadcrumbItem>
            <BreadcrumbItem>Overview</BreadcrumbItem>
          </Breadcrumb>

          <StatGroup data-slot='dashboard-stats'>
            <Stat title='MRR' value='$12,610' trend='up' trendValue='+12.4%' description='vs last month' />
            <Stat title='Active workspaces' value='1,284' trend='up' trendValue='+38' description='rolling 30 days' />
            <Stat title='Avg. session' value='7m 32s' trend='down' trendValue='-3.1%' description='all plans' />
            <Stat title='Churn' value='2.1%' trend='neutral' description='target under 3%' />
          </StatGroup>

          <DataTable
            columns={columns}
            data={WORKSPACES}
            getRowId={(row) => row.id}
            size={density as 'sm' | 'md' | 'lg'}
            pageSize={6}
            columnToggle
            toolbar={
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--haze-space-2)' }}>
                <Segmented
                  size='sm'
                  options={[
                    { value: 'sm', label: 'S' },
                    { value: 'md', label: 'M' },
                    { value: 'lg', label: 'L' },
                  ]}
                  value={densityCtrl}
                  onChange={setDensity}
                  aria-label='Table density'
                />
                <Button size='sm' variant='outline' onClick={exportCsv}>
                  Export CSV
                </Button>
              </div>
            }
          />
        </div>
      </AppShell>
    </div>
  );
}
