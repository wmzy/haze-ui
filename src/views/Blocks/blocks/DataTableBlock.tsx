import type { RowSelectionState } from '@tanstack/react-table';
import type { DataTableColumnDef } from '@/lib';

import { useMemo } from 'react';
import { useControl } from 'react-use-control';

import {
  Avatar,
  Badge,
  Button,
  DataTable,
  dataTableAvg,
  dataTableSum,
  dataTableToCsv,
  Option,
  Progress,
  Segmented,
  Select,
} from '@/lib';

/*
 * Data-table block: the TanStack-backed DataTable carrying a full admin
 * page — sortable headers, per-column filter row, pagination, resizable
 * columns, a toolbar strip (density, column visibility, CSV export), and
 * checkbox batch selection driving a bulk-action bar. Region/status
 * filtering is parent-driven (the top filter strip narrows `data` before
 * the table sees it), while the text filters use the table's own
 * `filterable` row — both idioms in one screen.
 */

type InstanceStatus = 'healthy' | 'degraded' | 'rebooting' | 'stopped';
type Region = 'us-east-1' | 'us-west-2' | 'eu-central-1' | 'ap-southeast-1';

type InstanceRow = {
  id: string;
  name: string;
  region: Region;
  status: InstanceStatus;
  vcpus: number;
  memoryGb: number;
  cost: number;
  uptime: number;
  owner: string;
};

const INSTANCES: InstanceRow[] = [
  { id: 'i-0a11', name: 'gateway-edge-1', region: 'us-east-1', status: 'healthy', vcpus: 8, memoryGb: 32, cost: 214, uptime: 99.98, owner: 'Ana Petrova' },
  { id: 'i-0a12', name: 'gateway-edge-2', region: 'us-west-2', status: 'healthy', vcpus: 8, memoryGb: 32, cost: 218, uptime: 99.91, owner: 'Ana Petrova' },
  { id: 'i-0b21', name: 'ingest-primary', region: 'us-east-1', status: 'degraded', vcpus: 16, memoryGb: 64, cost: 486, uptime: 97.42, owner: 'Ben Okafor' },
  { id: 'i-0b22', name: 'ingest-replica', region: 'us-east-1', status: 'healthy', vcpus: 16, memoryGb: 64, cost: 486, uptime: 99.95, owner: 'Ben Okafor' },
  { id: 'i-0c31', name: 'vector-index-a', region: 'eu-central-1', status: 'healthy', vcpus: 32, memoryGb: 128, cost: 1042, uptime: 99.99, owner: 'Chen Wei' },
  { id: 'i-0c32', name: 'vector-index-b', region: 'eu-central-1', status: 'rebooting', vcpus: 32, memoryGb: 128, cost: 1042, uptime: 98.7, owner: 'Chen Wei' },
  { id: 'i-0d41', name: 'cache-redis-1', region: 'us-west-2', status: 'healthy', vcpus: 4, memoryGb: 16, cost: 96, uptime: 99.99, owner: 'Dana Silva' },
  { id: 'i-0d42', name: 'cache-redis-2', region: 'ap-southeast-1', status: 'healthy', vcpus: 4, memoryGb: 16, cost: 102, uptime: 99.87, owner: 'Dana Silva' },
  { id: 'i-0e51', name: 'worker-batch-1', region: 'us-east-1', status: 'healthy', vcpus: 8, memoryGb: 32, cost: 178, uptime: 99.62, owner: 'Ben Okafor' },
  { id: 'i-0e52', name: 'worker-batch-2', region: 'us-east-1', status: 'stopped', vcpus: 8, memoryGb: 32, cost: 0, uptime: 91.15, owner: 'Ben Okafor' },
  { id: 'i-0f61', name: 'worker-batch-3', region: 'eu-central-1', status: 'healthy', vcpus: 8, memoryGb: 32, cost: 181, uptime: 99.44, owner: 'Chen Wei' },
  { id: 'i-0f71', name: 'search-api-1', region: 'ap-southeast-1', status: 'healthy', vcpus: 12, memoryGb: 48, cost: 305, uptime: 99.93, owner: 'Dana Silva' },
  { id: 'i-0f72', name: 'search-api-2', region: 'ap-southeast-1', status: 'degraded', vcpus: 12, memoryGb: 48, cost: 305, uptime: 96.08, owner: 'Dana Silva' },
  { id: 'i-0g81', name: 'ci-runner-x1', region: 'us-west-2', status: 'healthy', vcpus: 64, memoryGb: 256, cost: 1688, uptime: 99.71, owner: 'Ana Petrova' },
  { id: 'i-0g82', name: 'ci-runner-x2', region: 'us-west-2', status: 'rebooting', vcpus: 64, memoryGb: 256, cost: 1688, uptime: 98.31, owner: 'Ana Petrova' },
  { id: 'i-0h91', name: 'metrics-store', region: 'eu-central-1', status: 'healthy', vcpus: 24, memoryGb: 96, cost: 742, uptime: 99.96, owner: 'Chen Wei' },
  { id: 'i-0h92', name: 'metrics-rollup', region: 'us-east-1', status: 'healthy', vcpus: 6, memoryGb: 24, cost: 133, uptime: 99.88, owner: 'Chen Wei' },
  { id: 'i-0i01', name: 'staging-db', region: 'us-east-1', status: 'stopped', vcpus: 16, memoryGb: 64, cost: 0, uptime: 88.04, owner: 'Dana Silva' },
];

const REGIONS: Region[] = ['us-east-1', 'us-west-2', 'eu-central-1', 'ap-southeast-1'];
const STATUSES: InstanceStatus[] = ['healthy', 'degraded', 'rebooting', 'stopped'];

const initials = (name: string) =>
  name
    .split(' ')
    .map((part) => part.charAt(0))
    .join('')
    .slice(0, 2);

const statusBadge = (status: InstanceStatus) => {
  const variant =
    status === 'healthy'
      ? 'success'
      : status === 'degraded'
        ? 'warning'
        : status === 'rebooting'
          ? 'info'
          : 'default';
  return <Badge variant={variant}>{status}</Badge>;
};

const uptimeCell = (value: number) => (
  <div
    style={{
      display: 'flex',
      alignItems: 'center',
      gap: 'var(--haze-space-2)',
      minWidth: '120px',
    }}
  >
    <Progress value={value} size='sm' />
    <span style={{ fontSize: 'var(--haze-text-xs)', color: 'var(--haze-color-text-secondary)' }}>
      {value.toFixed(2)}%
    </span>
  </div>
);

const columns: DataTableColumnDef<InstanceRow>[] = [
  {
    accessorKey: 'name',
    header: 'Instance',
    cell: (info) => <strong>{info.getValue() as string}</strong>,
    meta: { width: 160 },
  },
  { accessorKey: 'region', header: 'Region' },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: (info) => statusBadge(info.getValue() as InstanceStatus),
    meta: { width: 120 },
  },
  { accessorKey: 'vcpus', header: 'vCPU', meta: { width: 80 } },
  { accessorKey: 'memoryGb', header: 'Memory (GB)', meta: { width: 120 } },
  {
    accessorKey: 'cost',
    header: 'Cost / mo',
    cell: (info) => `$${(info.getValue() as number).toLocaleString('en-US')}`,
    meta: { width: 100 },
  },
  {
    accessorKey: 'uptime',
    header: 'Uptime (30d)',
    cell: (info) => uptimeCell(info.getValue() as number),
    meta: { width: 180 },
  },
  {
    accessorKey: 'owner',
    header: 'Owner',
    cell: (info) => (
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 'var(--haze-space-2)' }}>
        <Avatar size='sm' fallback={initials(info.getValue() as string)} />
        <span>{info.getValue() as string}</span>
      </span>
    ),
    meta: { excludeFromExport: true, width: 160 },
  },
];

/** Serialize rows through the table's own csv helper and download them
 * (dashboard-block pattern). */
function downloadCsv(rows: InstanceRow[], file: string): void {
  const csv = dataTableToCsv(rows, columns);
  const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = file;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

const barStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: 'var(--haze-space-2)',
  flexWrap: 'wrap',
} as const;

export default function DataTableBlock() {
  // One Control per user-facing state: the two filter strips, the density
  // switcher and the row-selection map.
  const [region, setRegion, regionCtrl] = useControl(undefined, 'all');
  const [status, setStatus, statusCtrl] = useControl(undefined, 'all');
  const [density, setDensity, densityCtrl] = useControl(undefined, 'md');
  const [rowSelection, setRowSelection] = useControl(undefined, {} as RowSelectionState);

  // Parent-driven filtering: the strip narrows `data` before the table
  // sees it; the table's own filter row handles per-column text.
  const rows = useMemo(
    () =>
      INSTANCES.filter(
        (row) =>
          (region === 'all' || row.region === region) &&
          (status === 'all' || row.status === status)
      ),
    [region, status]
  );

  const selectedCount = Object.values(rowSelection).filter(Boolean).length;
  const selectedRows = useMemo(
    () => rows.filter((row) => rowSelection[row.id] === true),
    [rows, rowSelection]
  );

  return (
    <div
      data-slot='data-table-block'
      style={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--haze-space-3)',
        padding: 'var(--haze-space-4)',
        fontFamily: 'var(--haze-font-sans)',
        color: 'var(--haze-color-text)',
        background: 'var(--haze-color-bg)',
      }}
    >
      <header
        data-slot='data-table-header'
        style={{ display: 'flex', alignItems: 'center', gap: 'var(--haze-space-3)', flexWrap: 'wrap' }}
      >
        <div>
          <h2 style={{ margin: 0, fontSize: 'var(--haze-text-lg)', fontWeight: 'var(--haze-weight-semibold)' }}>
            Compute fleet
          </h2>
          <p
            style={{
              margin: 0,
              fontSize: 'var(--haze-text-sm)',
              color: 'var(--haze-color-text-secondary)',
            }}
          >
            {rows.length} of {INSTANCES.length} instances · sort, filter, resize, select and export
          </p>
        </div>
        <span style={{ flex: 1 }} />
        <div style={barStyle}>
          <Select
            size='sm'
            value={regionCtrl}
            onValuesChange={(next) => setRegion(typeof next === 'string' ? next : 'all')}
            aria-label='Filter by region'
          >
            <Option value='all'>All regions</Option>
            {REGIONS.map((r) => (
              <Option key={r} value={r}>
                {r}
              </Option>
            ))}
          </Select>
          <Select
            size='sm'
            value={statusCtrl}
            onValuesChange={(next) => setStatus(typeof next === 'string' ? next : 'all')}
            aria-label='Filter by status'
          >
            <Option value='all'>All statuses</Option>
            {STATUSES.map((s) => (
              <Option key={s} value={s}>
                {s}
              </Option>
            ))}
          </Select>
          <Button
            size='sm'
            variant='outline'
            onClick={() => downloadCsv(rows, 'nimbus-fleet.csv')}
          >
            Export CSV
          </Button>
        </div>
      </header>

      {selectedCount > 0 && (
        <div data-slot='data-table-bulk-bar' style={barStyle}>
          <Badge variant='info'>{selectedCount} selected</Badge>
          <Button
            size='sm'
            variant='outline'
            onClick={() => downloadCsv(selectedRows, 'nimbus-fleet-selection.csv')}
          >
            Export selection
          </Button>
          <Button size='sm' variant='ghost' onClick={() => setRowSelection({})}>
            Clear selection
          </Button>
        </div>
      )}

      <DataTable
        columns={columns}
        data={rows}
        getRowId={(row) => row.id}
        sortable
        selectable
        rowSelection={rowSelection}
        filterable
        resizable
        pageSize={8}
        columnToggle
        size={density as 'sm' | 'md' | 'lg'}
        summary={(summaryRows) => [
          {
            label: 'Filtered totals',
            cells: [
              `${summaryRows.length} instances`,
              '',
              '',
              dataTableSum(summaryRows, 'vcpus'),
              `${dataTableSum(summaryRows, 'memoryGb')} GB`,
              `$${dataTableSum(summaryRows, 'cost').toLocaleString('en-US')}`,
              `${(dataTableAvg(summaryRows, 'uptime') ?? 0).toFixed(2)}% avg`,
              '',
            ],
          },
        ]}
        toolbar={
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
        }
      />
    </div>
  );
}
