import type {
  ExpandedState,
  RowSelectionState,
  SortingState,
} from '@tanstack/react-table';

import type { DataTableColumnDef } from '@/lib';
import type { DataTableFiltersState } from '@/lib/components/DataTable';

import { useEffect, useState } from 'react';

import { useControl } from 'react-use-control';

import { Badge, DataTable } from '@/lib';
import {
  dataTableAvg,
  dataTableSum,
  dataTableToCsv,
} from '@/lib/components/DataTable';
import { Option, SelectCore } from '@/lib/components/Select';

import PropsTable from '../PropsTable';
import A11yNote from '../A11yNote';

import { intro, section, row, codeBlock } from '../styles';

import { CssVarsSection, dataTableNote } from './shared';

// ─── DataTable ─────────────────────────────────────────────────
type EmployeeStatus = 'active' | 'away' | 'offline';

type EmployeeRow = {
  id: number;
  name: string;
  role: string;
  status: EmployeeStatus;
  score: number;
  joined: string;
};

const PEOPLE: EmployeeRow[] = [
  { id: 1, name: 'Ada Lovelace', role: 'Engineer', status: 'active', score: 92, joined: '2021-04-12' },
  { id: 2, name: 'Grace Hopper', role: 'Engineering Manager', status: 'active', score: 88, joined: '2019-09-02' },
  { id: 3, name: 'Alan Turing', role: 'Researcher', status: 'away', score: 79, joined: '2020-01-20' },
  { id: 4, name: 'Katherine Johnson', role: 'Data Analyst', status: 'active', score: 95, joined: '2018-06-15' },
  { id: 5, name: 'Edsger Dijkstra', role: 'Engineer', status: 'offline', score: 84, joined: '2022-11-30' },
  { id: 6, name: 'Barbara Liskov', role: 'Architect', status: 'active', score: 91, joined: '2017-03-08' },
  { id: 7, name: 'Donald Knuth', role: 'Researcher', status: 'away', score: 87, joined: '2016-05-19' },
  { id: 8, name: 'Margaret Hamilton', role: 'Engineering Manager', status: 'active', score: 90, joined: '2020-12-01' },
];

const statusBadge = (status: EmployeeStatus) => {
  const color =
    status === 'active' ? 'success' : status === 'away' ? 'warning' : 'default';
  return <Badge color={color}>{status}</Badge>;
};

const baseColumns: DataTableColumnDef<EmployeeRow>[] = [
  {
    accessorKey: 'name',
    header: 'Name',
    cell: (info) => <strong>{info.getValue() as string}</strong>,
  },
  { accessorKey: 'role', header: 'Role' },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: (info) => statusBadge(info.getValue() as EmployeeStatus),
    meta: { sortable: false },
  },
  { accessorKey: 'score', header: 'Score' },
  { accessorKey: 'joined', header: 'Joined' },
];

// Column widths + pinned columns: meta.width (number = px, or a CSS
// length string) flows into a shared <colgroup>; meta.fixed pins the
// column to the scroll area's edge. Fixed columns should declare px
// widths — the sticky offset sums the preceding fixed widths.
const wideColumns: DataTableColumnDef<EmployeeRow>[] = [
  {
    accessorKey: 'name',
    header: 'Name',
    cell: (info) => <strong>{info.getValue() as string}</strong>,
    meta: { width: 140, fixed: 'left' },
  },
  { accessorKey: 'role', header: 'Role', meta: { width: '32%' } },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: (info) => statusBadge(info.getValue() as EmployeeStatus),
    meta: { sortable: false },
  },
  { accessorKey: 'score', header: 'Score', meta: { width: 90 } },
  { accessorKey: 'joined', header: 'Joined', meta: { width: 120, fixed: 'right' } },
];

// Enterprise combination — per-column switches on top of the table-level
// ones: Status is pinned in the visibility menu (meta.hideable), Score
// opts out of the filter row (meta.filterable).
const enterpriseColumns: DataTableColumnDef<EmployeeRow>[] = [
  {
    accessorKey: 'name',
    header: 'Name',
    cell: (info) => <strong>{info.getValue() as string}</strong>,
    meta: { width: 150 },
  },
  { accessorKey: 'role', header: 'Role' },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: (info) => statusBadge(info.getValue() as EmployeeStatus),
    meta: { hideable: false },
  },
  { accessorKey: 'score', header: 'Score', meta: { filterable: false } },
  { accessorKey: 'joined', header: 'Joined', meta: { width: 120 } },
];

// ─── Tree data ─────────────────────────────────────────────────
type TaskRow = {
  id: string;
  name: string;
  owner: string;
  hours: number;
  subRows?: TaskRow[];
};

// Parents carry no hours of their own, so the summary's sum over the
// whole tree stays double-count free.
const WORK: TaskRow[] = [
  {
    id: 'w1',
    name: 'Design system refresh',
    owner: 'Ada',
    hours: 0,
    subRows: [
      {
        id: 'w1a',
        name: 'Token audit',
        owner: 'Grace',
        hours: 6,
        subRows: [
          { id: 'w1a1', name: 'Color ramps', owner: 'Grace', hours: 3 },
          { id: 'w1a2', name: 'Spacing scale', owner: 'Alan', hours: 3 },
        ],
      },
      { id: 'w1b', name: 'Component sweep', owner: 'Katherine', hours: 8 },
    ],
  },
  {
    id: 'w2',
    name: 'Docs site',
    owner: 'Margaret',
    hours: 0,
    subRows: [
      { id: 'w2a', name: 'Props pipeline', owner: 'Barbara', hours: 5 },
      { id: 'w2b', name: 'Search', owner: 'Donald', hours: 7 },
    ],
  },
];

const treeColumns: DataTableColumnDef<TaskRow>[] = [
  { accessorKey: 'name', header: 'Task' },
  { accessorKey: 'owner', header: 'Owner' },
  { accessorKey: 'hours', header: 'Hours' },
];

// ─── Editable cells ────────────────────────────────────────────
const statusOptions: EmployeeStatus[] = ['active', 'away', 'offline'];

const editableColumns: DataTableColumnDef<EmployeeRow>[] = [
  { accessorKey: 'name', header: 'Name', meta: { width: 160 } },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: (info) => statusBadge(info.getValue() as EmployeeStatus),
    meta: {
      // Custom editor: a SelectCore picking commits immediately; the
      // built-ins stay text/number — anything richer is a function.
      editor: ({ value, onSave }) => (
        <SelectCore
          size='sm'
          autoFocus
          value={String(value)}
          onChange={(next) => onSave(next)}
          onBlur={() => onSave(String(value))}
        >
          {statusOptions.map((status) => (
            <Option key={status} value={status}>
              {status}
            </Option>
          ))}
        </SelectCore>
      ),
    },
  },
  { accessorKey: 'score', header: 'Score', meta: { editor: 'number', width: 100 } },
  { accessorKey: 'role', header: 'Role', meta: { editor: false } },
];

// ─── Server mode (manual pagination & sorting) ─────────────────
// The fake server: sort + slice of PEOPLE with a roundtrip delay, so the
// demo exercises exactly what a real backend contract looks like.
const SERVER_PAGE_SIZE = 4;

function fetchServerPage(page: number, sorting: SortingState): EmployeeRow[] {
  const first = sorting[0] ?? { id: 'id' as const, desc: false };
  const key = first.id as keyof EmployeeRow;
  const sorted = [...PEOPLE].sort((a, b) => {
    const av = a[key];
    const bv = b[key];
    const cmp =
      typeof av === 'number' && typeof bv === 'number'
        ? av - bv
        : String(av).localeCompare(String(bv));
    return first.desc ? -cmp : cmp;
  });
  return sorted.slice((page - 1) * SERVER_PAGE_SIZE, page * SERVER_PAGE_SIZE);
}

function ServerModeTable() {
  const [page, setPage] = useState(1);
  const [sorting, setSorting] = useState<SortingState>([]);
  // The last fetched snapshot: while it lags the requested page/sorting
  // the table shows the loading skeleton (derived, not stored — no
  // synchronous state writes inside the effect).
  const [snapshot, setSnapshot] = useState({
    page: 1,
    sorting: [] as SortingState,
    rows: fetchServerPage(1, []),
  });
  const loading = snapshot.page !== page || snapshot.sorting !== sorting;

  useEffect(() => {
    const timer = setTimeout(() => {
      setSnapshot({ page, sorting, rows: fetchServerPage(page, sorting) });
    }, 350);
    return () => clearTimeout(timer);
  }, [page, sorting]);

  return (
    <DataTable
      columns={baseColumns}
      data={snapshot.rows}
      manual
      sortable
      loading={loading}
      pageSize={SERVER_PAGE_SIZE}
      pageCount={Math.ceil(PEOPLE.length / SERVER_PAGE_SIZE)}
      onPageChange={setPage}
      onSortChange={setSorting}
      getRowId={(employee) => String(employee.id)}
    />
  );
}

// ─── CSV export ────────────────────────────────────────────────
type ShipmentRow = {
  id: string;
  customer: string;
  city: string;
  note: string;
};

// Values chosen to hit every CSV edge: a CJK cell (why the BOM exists),
// embedded quotes and commas, and an embedded line break.
const SHIPMENTS: ShipmentRow[] = [
  { id: 'S-101', customer: '张伟', city: '上海', note: 'Fragile — keep upright' },
  { id: 'S-102', customer: 'Ada Lovelace', city: 'London', note: 'Contains "spare cogwheels", crate 3' },
  { id: 'S-103', customer: 'Grace Hopper', city: 'New York', note: 'Hand-carried\nleave elbow room' },
];

const shipmentColumns: DataTableColumnDef<ShipmentRow>[] = [
  { accessorKey: 'id', header: 'Shipment' },
  { accessorKey: 'customer', header: 'Customer' },
  { accessorKey: 'city', header: 'City' },
  { accessorKey: 'note', header: 'Note' },
  {
    // Presentation-only: rendered in the table, excluded from the export.
    id: 'track',
    header: 'Track',
    cell: () => <button type="button">Track</button>,
    meta: { excludeFromExport: true },
  },
];

function downloadCsv(text: string) {
  const url = URL.createObjectURL(
    new Blob([text], { type: 'text/csv;charset=utf-8' })
  );
  const link = document.createElement('a');
  link.href = url;
  link.download = 'shipments.csv';
  link.click();
  URL.revokeObjectURL(url);
}

function CsvExportTable() {
  const [csv, setCsv] = useState<string | null>(null);

  return (
    <>
      <div className={row}>
        <button onClick={() => setCsv(dataTableToCsv(SHIPMENTS, shipmentColumns))}>
          Export CSV
        </button>
        {csv !== null && <button onClick={() => downloadCsv(csv)}>Download .csv</button>}
      </div>
      <DataTable
        columns={shipmentColumns}
        data={SHIPMENTS}
        getRowId={(shipment) => shipment.id}
      />
      {csv !== null && <pre className={codeBlock}>{csv}</pre>}
    </>
  );
}

// Column filter menus: Role/Status use the default membership check on
// the raw cell value; Score shows a custom meta.filterFn bucketing the
// numbers (values arrive as the option `value` list, not the rows).
const filterMenuColumns: DataTableColumnDef<EmployeeRow>[] = [
  baseColumns[0]!,
  {
    accessorKey: 'role',
    header: 'Role',
    meta: {
      filters: [
        { text: 'Engineer', value: 'Engineer' },
        { text: 'Engineering Manager', value: 'Engineering Manager' },
        { text: 'Researcher', value: 'Researcher' },
      ],
    },
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: (info) => statusBadge(info.getValue() as EmployeeStatus),
    meta: {
      filters: [
        { text: 'active', value: 'active' },
        { text: 'away', value: 'away' },
        { text: 'offline', value: 'offline' },
      ],
    },
  },
  {
    accessorKey: 'score',
    header: 'Score',
    meta: {
      filters: [
        { text: 'Top (90+)', value: 'top' },
        { text: 'Solid (80–89)', value: 'solid' },
      ],
      filterFn: (row, values) =>
        values.some((value) =>
          value === 'top' ? row.score >= 90 : row.score >= 80 && row.score < 90
        ),
    },
  },
];

// Column id for the reorder demo's order bookkeeping — accessor columns
// derive theirs from the key.
const columnId = (column: DataTableColumnDef<EmployeeRow>) =>
  'accessorKey' in column ? String(column.accessorKey) : column.id!;

const reorderColumns: DataTableColumnDef<EmployeeRow>[] = [
  baseColumns[0]!,
  baseColumns[1]!,
  baseColumns[3]!,
  baseColumns[4]!,
];

function ColumnReorderTable() {
  const [order, setOrder] = useState(() =>
    reorderColumns.map((column) => columnId(column))
  );
  // Mirror the reported order into the rendered column sequence, so the
  // note below and the table itself agree — the order lives in the
  // table's internal state either way.
  const ordered = [...reorderColumns].sort(
    (a, b) => order.indexOf(columnId(a)) - order.indexOf(columnId(b))
  );

  return (
    <>
      <DataTable
        columns={ordered}
        data={PEOPLE}
        columnReorderable
        onColumnOrderChange={setOrder}
        getRowId={(employee) => String(employee.id)}
      />
      <p className={dataTableNote}>
        Current column order: {order.join(', ')}
      </p>
    </>
  );
}

// Infinite-scroll feed: 120 employees built by cycling PEOPLE, appended
// 15 at a time with a fake 400ms roundtrip.
const BIG_ROWS: EmployeeRow[] = Array.from({ length: 120 }, (_, index) => ({
  ...PEOPLE[index % PEOPLE.length]!,
  id: index + 1,
}));

function InfiniteScrollTable() {
  const [count, setCount] = useState(15);
  const [fetching, setFetching] = useState(false);

  const loadMore = () => {
    if (fetching || count >= BIG_ROWS.length) return;
    setFetching(true);
    setTimeout(() => {
      setCount((prev) => Math.min(prev + 15, BIG_ROWS.length));
      setFetching(false);
    }, 400);
  };

  return (
    <>
      <div style={{ maxHeight: 260 }}>
        <DataTable
          columns={baseColumns.slice(0, 3)}
          data={BIG_ROWS.slice(0, count)}
          stickyHeader
          onEndReached={loadMore}
          getRowId={(employee) => String(employee.id)}
        />
      </div>
      <p className={dataTableNote}>
        Loaded {count} of {BIG_ROWS.length}
        {fetching ? ' — fetching…' : ''}
      </p>
    </>
  );
}

export default function DataTableDemo() {
  const [loading, setLoading] = useState(false);
  const [, setSelection, selectionCtrl] = useControl(
    undefined,
    {} as RowSelectionState
  );
  // Controlled expansion (ctrl form): the buttons below drive the same
  // Control the table binds to.
  const [, setExpanded, expandedCtrl] = useControl<ExpandedState>(undefined, {});
  // Controlled column filters: the Clear button and the CSV export both
  // act on the same record the filter menus commit into.
  const [filters, setFilters, filtersCtrl] =
    useControl<DataTableFiltersState>(undefined, {});
  // Editable cells keep the data consumer-owned: edits land here through
  // onCellEdit and flow back as new data.
  const [employees, setEmployees] = useState(PEOPLE);
  // Density switcher for the size section below.
  const [density, setDensity] = useState<'sm' | 'md' | 'lg'>('md');

  const handleCellEdit = (
    rowId: string,
    columnId: string,
    next: unknown
  ) => {
    setEmployees((prev) =>
      prev.map((employee) =>
        String(employee.id) === rowId
          ? { ...employee, [columnId]: next }
          : employee
      )
    );
  };

  return (
    <>
      <h1>DataTable</h1>
      <p className={intro}>
        Feature-complete table on top of TanStack Table v9 with the haze
        skin: opt-in sorting, row selection, pagination, loading skeleton,
        empty state, sticky header, column resizing, per-column filtering,
        column visibility, expandable rows, tree data, summary rows,
        inline cell editing, column reordering and infinite scroll — plus
        a toolbar slot, three density sizes and roving cell keyboard
        navigation. The plain <code>Table</code> primitives remain
        available for bespoke layouts.
      </p>

      <div className={section}>
        <h2>Sortable, selectable, paginated</h2>
        <div className={row}>
          <button onClick={() => setLoading((v) => !v)}>
            {loading ? 'Show data' : 'Show loading'}
          </button>
          <button onClick={() => setSelection({})}>Clear selection</button>
        </div>
        <DataTable
          columns={baseColumns}
          data={loading ? [] : PEOPLE}
          sortable
          selectable
          rowSelection={selectionCtrl}
          pageSize={5}
          getRowId={(employee) => String(employee.id)}
          loading={loading}
          stickyHeader
          empty={<>No employees found</>}
        />
      </div>

      <div className={section}>
        <h2>Minimal — plain columns</h2>
        <DataTable
          columns={baseColumns.slice(0, 3)}
          data={PEOPLE.slice(0, 4)}
          getRowId={(employee) => String(employee.id)}
        />
      </div>

      <div className={section}>
        <h2>Column widths &amp; fixed columns</h2>
        <p className={dataTableNote}>
          Declare sizing through <code>meta.width</code> — a number is px,
          strings pass through as CSS lengths (<code>&apos;32%&apos;</code>,{' '}
          <code>&apos;12rem&apos;</code>; the native TanStack{' '}
          <code>size</code> field works as a px fallback). Pin columns with{' '}
          <code>meta.fixed</code> so they stay visible while the rest
          scrolls horizontally — here <em>Name</em> sticks left and{' '}
          <em>Joined</em> right in a narrowed viewport. Normal mode only;
          virtualized tables ignore <code>fixed</code>.
        </p>
        <div style={{ maxWidth: 560 }}>
          <DataTable
            columns={wideColumns}
            data={PEOPLE}
            sortable
            getRowId={(employee) => String(employee.id)}
          />
        </div>
      </div>

      <div className={section}>
        <h2>Enterprise: resize, filter, column menu &amp; expansion</h2>
        <p className={dataTableNote}>
          Four independent opt-ins that compose: <code>resizable</code> adds
          header drag handles (double-click resets to the declared width;
          ArrowLeft/ArrowRight nudge ±5px, mirrored under RTL),{' '}
          <code>filterable</code> adds a filter row under the header
          (case-insensitive contains; <em>Score</em> opts out via{' '}
          <code>meta.filterable</code>), <code>columnToggle</code> adds the
          column visibility menu (<em>Status</em> is pinned through{' '}
          <code>meta.hideable</code>), and <code>getRowCanExpand</code> +{' '}
          <code>renderExpandedRow</code> add expandable detail rows — here
          only for high scorers, driven through a controlled{' '}
          <code>expanded</code> Control.
        </p>
        <div className={row}>
          <button onClick={() => setExpanded(true)}>Expand all</button>
          <button onClick={() => setExpanded({})}>Collapse all</button>
        </div>
        <DataTable
          columns={enterpriseColumns}
          data={PEOPLE}
          sortable
          resizable
          filterable
          columnToggle
          expanded={expandedCtrl}
          getRowCanExpand={(row) => row.original.score >= 85}
          renderExpandedRow={(row) => (
            <p>
              <strong>{row.original.name}</strong> — {row.original.role},
              joined {row.original.joined}. Current score{' '}
              {row.original.score}.
            </p>
          )}
          getRowId={(employee) => String(employee.id)}
        />
      </div>

      <div className={section}>
        <h2>Column filter menus</h2>
        <p className={dataTableNote}>
          Columns declaring <code>meta.filters</code> grow a funnel button
          in the header: it opens a checklist panel (edits stay a draft
          until Apply; Reset clears), and the funnel lights up while the
          column holds an active selection. Selections from several
          columns intersect and run before sorting and pagination,
          composing with the <code>filterable</code> text row. The whole
          record hangs off <code>filters</code> with the usual
          Control-or-value semantics (keyed by column id) — the Clear
          button below drives the same Control the menus commit into —{' '}
          <code>meta.filterFn</code> replaces the default membership check
          (<em>Score</em> buckets here), and{' '}
          <code>dataTableToCsv</code> accepts the live record so the
          export matches the visible rows.
        </p>
        <div className={row}>
          <button onClick={() => setFilters({})}>Clear filters</button>
        </div>
        <DataTable
          columns={filterMenuColumns}
          data={PEOPLE}
          filters={filtersCtrl}
          sortable
          pageSize={5}
          toolbar={
            <button
              onClick={() =>
                downloadCsv(
                  dataTableToCsv(PEOPLE, filterMenuColumns, { filters })
                )
              }
            >
              Export filtered CSV
            </button>
          }
          getRowId={(employee) => String(employee.id)}
        />
      </div>

      <div className={section}>
        <h2>Tree data (subRows)</h2>
        <p className={dataTableNote}>
          Rows carrying a <code>subRows</code> array turn on tree mode by
          themselves — parents grow expander buttons, expanded children
          render as indented rows (one indent unit per depth), and{' '}
          <code>expanded</code> keeps its Control semantics keyed by row id.{' '}
          <code>subRowsKey</code> renames the field. Explicit{' '}
          <code>getRowCanExpand</code> / <code>renderExpandedRow</code> win
          over tree mode and leave nested data unread. Works virtualized:
          the window simply slices the flattened display order.
        </p>
        <DataTable
          columns={treeColumns}
          data={WORK}
          getRowId={(task) => task.id}
          summary={(rows) => [
            {
              label: 'Logged hours',
              cells: ['Logged', dataTableSum(rows, 'hours')],
            },
          ]}
        />
      </div>

      <div className={section}>
        <h2>Summary rows</h2>
        <p className={dataTableNote}>
          <code>summary</code> renders rows in a <code>tfoot</code> — one
          cell per column, strings or functions of the summarized rows (the
          whole filtered dataset, all pages). The{' '}
          <code>dataTableSum</code> / <code>dataTableAvg</code> /{' '}
          <code>dataTableCount</code> helpers cover numeric columns;{' '}
          <code>stickyFooter</code> pins the tfoot to the bottom of a
          height-bounded scroll area (here paired with{' '}
          <code>stickyHeader</code>).
        </p>
        <div style={{ maxHeight: 240 }}>
          <DataTable
            columns={baseColumns}
            data={PEOPLE}
            getRowId={(employee) => String(employee.id)}
            stickyHeader
            stickyFooter
            summary={(rows) => [
              {
                label: 'Score totals',
                cells: ['Sum', dataTableSum(rows, 'score')],
              },
              {
                label: 'Score averages',
                cells: ['Average', dataTableAvg(rows, 'score')],
              },
            ]}
          />
        </div>
      </div>

      <div className={section}>
        <h2>Editable cells</h2>
        <p className={dataTableNote}>
          <code>editable</code> makes cells focusable — double-click or Enter
          opens an editor, Enter or blur commits, Escape discards, and{' '}
          <code>onCellEdit</code> reports the change (the data stays
          consumer-owned; it only changes when you update it, as below). The
          editor kind is per column: <code>meta.editor</code> picks{' '}
          <code>&apos;text&apos;</code> (the default),{' '}
          <code>&apos;number&apos;</code> (parsed, <code>null</code> when
          cleared), a custom function — like the status{' '}
          <code>SelectCore</code> here — or <code>false</code> to opt out
          (<em>Role</em> is read-only).
        </p>
        <DataTable
          columns={editableColumns}
          data={employees}
          getRowId={(employee) => String(employee.id)}
          editable
          onCellEdit={handleCellEdit}
        />
      </div>

      <div className={section}>
        <h2>Toolbar slot</h2>
        <p className={dataTableNote}>
          <code>toolbar</code> renders custom actions in the strip at the
          table&apos;s top-right corner — the same flex row as the{' '}
          <code>columnToggle</code> trigger (slot content first, trigger
          last, a <code>--haze-space-2</code> gap between). The strip only
          appears when something occupies it: no slot and no trigger means
          no strip at all. It stays usable while <code>loading</code>, and
          with <code>pageSize</code> it keeps its place above the table
          while the trigger moves into the pagination row. The export
          button below serializes the same rows and column defs the table
          renders through <code>dataTableToCsv</code>.
        </p>
        <DataTable
          columns={baseColumns}
          data={PEOPLE}
          getRowId={(employee) => String(employee.id)}
          columnToggle
          toolbar={
            <button
              onClick={() => downloadCsv(dataTableToCsv(PEOPLE, baseColumns))}
            >
              Export CSV
            </button>
          }
        />
      </div>

      <div className={section}>
        <h2>Density (size)</h2>
        <p className={dataTableNote}>
          <code>size</code> sets the cell padding density across header,
          body and summary footer — <code>&apos;sm&apos;</code> tight,{' '}
          <code>&apos;md&apos;</code> the default,{' '}
          <code>&apos;lg&apos;</code> roomy. The padding comes from spacing
          tokens, so the global <code>compact</code> density class composes
          instead of colliding (compact shrinks the tokens these rules
          read; compact + <code>sm</code> stacks). A{' '}
          <code>virtualized</code> table without an explicit{' '}
          <code>rowHeight</code> derives its default row height from the
          step: 23/34/39px.
        </p>
        <div className={row}>
          {(['sm', 'md', 'lg'] as const).map((step) => (
            <button
              key={step}
              onClick={() => setDensity(step)}
              disabled={density === step}
            >
              {step}
            </button>
          ))}
        </div>
        <DataTable
          columns={baseColumns}
          data={PEOPLE}
          size={density}
          getRowId={(employee) => String(employee.id)}
        />
      </div>

      <div className={section}>
        <h2>Keyboard navigation</h2>
        <p className={dataTableNote}>
          Body cells use a roving tabindex — exactly one cell carries the
          tab stop (the first cell until you move), the rest join the
          arrow-key grid: ArrowLeft/ArrowRight/ArrowUp/ArrowDown walk the
          cells, wrapping across row ends and stopping at the header (the
          keys mirror under RTL), Home/End jump to the row start or end
          and PageUp/PageDown to the first or last row. On editable tables
          Enter or F2 opens the editor on the active cell and Escape
          cancels back to navigation; Tab is never intercepted, and resize
          handles keep their own tab stops. An sr-only description of the
          model is wired through <code>aria-describedby</code> on the
          container. Virtualized tables scroll the target row into view
          when navigation leaves the window. Click a cell below and use
          the arrows.
        </p>
        <div style={{ maxHeight: 240 }}>
          <DataTable
            columns={editableColumns}
            data={employees}
            getRowId={(employee) => String(employee.id)}
            sortable
            stickyHeader
            editable
            onCellEdit={handleCellEdit}
          />
        </div>
      </div>

      <div className={section}>
        <h2>Server mode (manual pagination &amp; sorting)</h2>
        <p className={dataTableNote}>
          <code>manual</code> hands pagination and sorting to the server:
          the table renders <code>data</code> exactly as fetched — no local
          reordering, no page slicing — while sort-header clicks still
          toggle <code>sorting</code> and the footer still tracks{' '}
          <code>page</code>. The <code>onSortChange</code> /{' '}
          <code>onPageChange</code> callbacks carry the next TanStack{' '}
          <code>SortingState</code> and the 1-based page out to your fetch
          effect, and <code>pageCount</code> feeds the footer the
          server-side page total (below: 8 employees, 4 per page, a fake
          350&nbsp;ms roundtrip — watch the skeleton between pages).
          Selection, <code>loading</code>, the empty state and{' '}
          <code>virtualized</code> compose unchanged.
        </p>
        <ServerModeTable />
      </div>

      <div className={section}>
        <h2>CSV export</h2>
        <p className={dataTableNote}>
          <code>dataTableToCsv(rows, columns, options?)</code> serializes
          the same rows and column defs the table renders — RFC 4180
          escaping (commas, doubled quotes, embedded line breaks), CRLF
          rows, and a UTF-8 BOM by default so Excel decodes CJK text
          correctly (<code>bom: false</code> drops it). Only exporting
          columns contribute: display-only columns and{' '}
          <code>meta.excludeFromExport</code> columns are skipped (like{' '}
          <em>Track</em> below), and <code>options.columnVisibility</code>{' '}
          mirrors hidden columns. Pass <code>options</code> with{' '}
          <code>columnVisibility</code> straight from your control value.
        </p>
        <CsvExportTable />
      </div>

      <div className={section}>
        <h2>Column reorder</h2>
        <p className={dataTableNote}>
          <code>columnReorderable</code> grows a ⠿ grip on every leaf
          header. Drag one with the pointer — the drag runtime loads
          lazily the first time the prop is on, so tables that never opt
          in ship none of it — or use the keyboard: the grip is a
          focusable button (its own tab stop, like the resize handles)
          and <strong>Alt+ArrowLeft / Alt+ArrowRight</strong> move its
          column one slot (mirrored under RTL). Every completed reorder
          reports through <code>onColumnOrderChange</code> as the visible
          leaf column ids in their new sequence; the order itself is
          table-internal, so persisting one means seeding{' '}
          <code>columns</code> in that order next mount — the note below
          does exactly that. The selection column and hidden columns stay
          out of the set, sorting/resizing/fixed columns/filtering and{' '}
          <code>virtualized</code> compose, and grouped (nested) headers
          switch reordering off with a dev-mode warning.
        </p>
        <ColumnReorderTable />
      </div>

      <div className={section}>
        <h2>Infinite scroll</h2>
        <p className={dataTableNote}>
          <code>onEndReached</code> fires when the table scrolls within{' '}
          <code>endReachedThreshold</code> px (default 200) of its last
          rendered row — the &quot;load the next page&quot; signal, here
          answered by a fake 400&nbsp;ms append of 15 rows. Virtualized
          tables ride the window&apos;s own end-reached channel; plain
          tables watch a zero-footprint sentinel after the body (an{' '}
          <code>IntersectionObserver</code> rooted at the table&apos;s
          scroll container, or the viewport when the table itself
          doesn&apos;t scroll). Manual pagination composes: the footer and
          the trigger coexist — the load guard is the consumer&apos;s,
          exactly like any hand-rolled pagination.
        </p>
        <InfiniteScrollTable />
      </div>

      <div className={section}>
        <h2>Props</h2>
        <PropsTable of='DataTableProps' />
      </div>

      <div className={section}>
        <h2>Accessibility</h2>
        <A11yNote>
          <ul>
            <li>
              Sortable headers expose <code>aria-sort</code> and act as buttons
            </li>
            <li>
              The selection column is a real checkbox column with an
              indeterminate select-all
            </li>
            <li>Pagination reuses the Pagination component&apos;s semantics</li>
            <li>
              Resize handles are focusable <code>separator</code> widgets:
              ArrowLeft/ArrowRight nudge the width (mirrored under RTL),
              double-click resets it
            </li>
            <li>
              Reorder grips are labeled focusable buttons with{' '}
              <code>aria-keyshortcuts</code>: Alt+ArrowLeft/ArrowRight
              move the column one slot (mirrored under RTL); the sr-only
              keyboard description mentions the model while reordering is
              on
            </li>
            <li>
              Expander buttons expose <code>aria-expanded</code> and{' '}
              <code>aria-controls</code>; the panel is a row spanning every
              column
            </li>
            <li>
              Filter inputs are labeled textboxes; the column menu&apos;s
              checkboxes carry <code>menuitemcheckbox</code> semantics
            </li>
            <li>
              Tree expanders expose <code>aria-expanded</code>; children are
              real rows indented by depth
            </li>
            <li>
              Summary rows are real <code>tfoot</code> rows, named through{' '}
              <code>aria-label</code>
            </li>
            <li>
              Editable cells are focusable and open a labeled editor on
              Enter/double-click; Enter or blur commits, Escape discards
            </li>
            <li>
              Body cells use a roving tabindex with an sr-only keyboard
              description (<code>aria-describedby</code> on the container):
              arrows move the active cell (mirrored under RTL),
              Home/End/PageUp/PageDown jump, Enter/F2 edit
            </li>
          </ul>
        </A11yNote>
      </div>

      <CssVarsSection component='data-table' />
    </>
  );
}
