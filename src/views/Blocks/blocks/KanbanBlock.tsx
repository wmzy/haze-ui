import { useMemo, useState } from 'react';
import { useControl } from 'react-use-control';
import { MoreHorizontal, Plus, Search } from 'lucide-react';

import {
  Avatar,
  AvatarGroup,
  Badge,
  Button,
  Chip,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  Empty,
  Input,
  Progress,
  Select,
  Option,
  Tooltip,
  VisuallyHidden,
} from '@/lib';

/*
 * Kanban block: a sprint board — four columns of issue cards with priority
 * badges, assignee avatars, labels and progress bars.
 *
 * Drag-and-drop was deliberately left out: haze-ui ships dnd only inside
 * single-container wrappers (SortableTagGroup / SortableTabList /
 * SortableTree), none of which compose into cross-column card dragging, and
 * views never import @dnd-kit directly — a raw DndContext here would break
 * the "blocks are pure haze-ui compositions" premise the page (and its
 * StackBlitz css-family mechanism) is built on. Card movement is real state
 * instead: every card's ⋯ menu moves it between columns, and the source
 * stays honest about what the library gives you.
 */

type ColumnId = 'backlog' | 'progress' | 'review' | 'done';
type Priority = 'P0' | 'P1' | 'P2';

type Issue = {
  id: string;
  title: string;
  column: ColumnId;
  priority: Priority;
  labels: string[];
  assignees: string[];
  points: number;
  progress: number;
};

const COLUMNS: { id: ColumnId; name: string; hint: string; color: string }[] = [
  { id: 'backlog', name: 'Backlog', hint: 'groomed next sprint', color: 'var(--haze-color-text-muted)' },
  { id: 'progress', name: 'In progress', hint: 'WIP limit 4', color: 'var(--haze-color-primary)' },
  { id: 'review', name: 'Review', hint: 'needs a reviewer', color: 'var(--haze-color-warning)' },
  { id: 'done', name: 'Done', hint: 'this sprint', color: 'var(--haze-color-success)' },
];

const INITIAL_ISSUES: Issue[] = [
  { id: 'NB-412', title: 'Idempotency-Key on webhook retries', column: 'progress', priority: 'P0', labels: ['gateway', 'reliability'], assignees: ['Ana Petrova', 'Ben Okafor'], points: 5, progress: 60 },
  { id: 'NB-415', title: 'Batched payload fallback after 2 failures', column: 'progress', priority: 'P1', labels: ['gateway'], assignees: ['Ben Okafor'], points: 3, progress: 25 },
  { id: 'NB-401', title: 'Freeze clock fixture in checkout e2e', column: 'review', priority: 'P1', labels: ['flaky', 'e2e'], assignees: ['Dana Silva', 'Chen Wei', 'Ana Petrova'], points: 2, progress: 90 },
  { id: 'NB-408', title: 'Trim ingest payload snapshot to 1 MB', column: 'review', priority: 'P2', labels: ['ingest'], assignees: ['Chen Wei'], points: 1, progress: 100 },
  { id: 'NB-419', title: 'Alert on webhook error-rate cliff', column: 'backlog', priority: 'P1', labels: ['observability'], assignees: ['Dana Silva'], points: 3, progress: 0 },
  { id: 'NB-421', title: 'Runbook: collector rollbacks', column: 'backlog', priority: 'P2', labels: ['docs'], assignees: [], points: 2, progress: 0 },
  { id: 'NB-422', title: 'Rotate CI secrets quarterly', column: 'backlog', priority: 'P0', labels: ['security', 'infra'], assignees: ['Ana Petrova'], points: 1, progress: 0 },
  { id: 'NB-418', title: 'Dashboard: 30d uptime column', column: 'backlog', priority: 'P2', labels: ['console'], assignees: ['Chen Wei', 'Dana Silva'], points: 2, progress: 0 },
  { id: 'NB-396', title: 'v2.3 migration notes', column: 'done', priority: 'P1', labels: ['docs'], assignees: ['Ben Okafor'], points: 2, progress: 100 },
  { id: 'NB-399', title: 'Backoff cap 2s → 8s', column: 'done', priority: 'P0', labels: ['gateway'], assignees: ['Ana Petrova', 'Chen Wei'], points: 3, progress: 100 },
  { id: 'NB-403', title: 'Retry jitter across collectors', column: 'done', priority: 'P1', labels: ['gateway', 'reliability'], assignees: ['Ben Okafor'], points: 2, progress: 100 },
];

const NEXT_POOL: Omit<Issue, 'id' | 'column'>[] = [
  { title: 'Spike: QUIC for collector transport', priority: 'P2', labels: ['spike'], assignees: [], points: 1, progress: 0 },
  { title: 'Reduce cold-start of ingest workers', priority: 'P1', labels: ['ingest', 'perf'], assignees: ['Chen Wei'], points: 3, progress: 0 },
  { title: 'Audit PII in payload snapshots', priority: 'P0', labels: ['security'], assignees: ['Dana Silva', 'Ana Petrova'], points: 2, progress: 0 },
  { title: 'Changelog page for v2.4', priority: 'P2', labels: ['docs'], assignees: [], points: 1, progress: 0 },
];

const initials = (name: string) =>
  name
    .split(' ')
    .map((part) => part.charAt(0))
    .join('')
    .slice(0, 2);

const priorityBadge = (priority: Priority) => (
  <Badge
    variant={priority === 'P0' ? 'danger' : priority === 'P1' ? 'warning' : 'default'}
  >
    {priority}
  </Badge>
);

function IssueMenu({ issue, onMove, onDelete }: {
  issue: Issue;
  onMove: (id: string, column: ColumnId) => void;
  onDelete: (id: string) => void;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <VisuallyHidden>Actions for {issue.id}</VisuallyHidden>
        <MoreHorizontal size={14} aria-hidden='true' />
      </DropdownMenuTrigger>
      <DropdownMenuContent align='end'>
        {COLUMNS.filter((column) => column.id !== issue.column).map((column) => (
          <DropdownMenuItem key={column.id} onClick={() => onMove(issue.id, column.id)}>
            Move to {column.name}
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        <DropdownMenuItem danger onClick={() => onDelete(issue.id)}>
          Delete issue
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function IssueCard({ issue, onMove, onDelete }: {
  issue: Issue;
  onMove: (id: string, column: ColumnId) => void;
  onDelete: (id: string) => void;
}) {
  return (
    <article
      data-slot='kanban-card'
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--haze-space-2)',
        padding: 'var(--haze-space-3)',
        border: '1px solid var(--haze-color-border)',
        borderRadius: 'var(--haze-radius-md)',
        background: 'var(--haze-color-bg)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--haze-space-2)' }}>
        <div
          style={{
            flex: 1,
            minWidth: 0,
            fontSize: 'var(--haze-text-sm)',
            fontWeight: 'var(--haze-weight-medium)',
            lineHeight: 'var(--haze-leading-snug)',
          }}
        >
          <span
            style={{
              fontFamily: 'var(--haze-font-mono)',
              fontSize: 'var(--haze-text-xs)',
              color: 'var(--haze-color-text-muted)',
              display: 'block',
            }}
          >
            {issue.id}
          </span>
          {issue.title}
        </div>
        <IssueMenu issue={issue} onMove={onMove} onDelete={onDelete} />
      </div>

      {issue.labels.length > 0 && (
        <div style={{ display: 'flex', gap: 'var(--haze-space-1)', flexWrap: 'wrap' }}>
          {issue.labels.map((label) => (
            <Chip key={label} variant='outline'>
              {label}
            </Chip>
          ))}
        </div>
      )}

      {issue.progress > 0 && <Progress value={issue.progress} size='sm' color='success' />}

      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--haze-space-2)' }}>
        {issue.assignees.length > 0 ? (
          issue.assignees.length > 1 ? (
            <AvatarGroup max={2} total={issue.assignees.length}>
              {issue.assignees.map((name) => (
                <Tooltip key={name} content={name}>
                  <Avatar size='sm' fallback={initials(name)} />
                </Tooltip>
              ))}
            </AvatarGroup>
          ) : (
            <Avatar size='sm' fallback={initials(issue.assignees[0]!)} />
          )
        ) : (
          <span style={{ fontSize: 'var(--haze-text-xs)', color: 'var(--haze-color-text-muted)' }}>
            unassigned
          </span>
        )}
        <span style={{ flex: 1 }} />
        <Tooltip content='Story points'>
          <span
            style={{
              fontFamily: 'var(--haze-font-mono)',
              fontSize: 'var(--haze-text-xs)',
              color: 'var(--haze-color-text-secondary)',
            }}
          >
            {issue.points} pt
          </span>
        </Tooltip>
        {priorityBadge(issue.priority)}
      </div>
    </article>
  );
}

export default function KanbanBlock() {
  const [issues, setIssues] = useState(INITIAL_ISSUES);
  const [nextIndex, setNextIndex] = useState(0);
  // User-facing filter state as Controls: priority + title search.
  const [priority, setPriority, priorityCtrl] = useControl(undefined, 'all');
  const [search, setSearch, searchCtrl] = useControl(undefined, '');

  const visible = useMemo(
    () =>
      issues.filter(
        (issue) =>
          (priority === 'all' || issue.priority === priority) &&
          (search.trim() === '' ||
            `${issue.id} ${issue.title}`.toLowerCase().includes(search.trim().toLowerCase()))
      ),
    [issues, priority, search]
  );

  const byColumn = (column: ColumnId) => visible.filter((issue) => issue.column === column);

  const moveIssue = (id: string, column: ColumnId) => {
    setIssues((prev) => prev.map((issue) => (issue.id === id ? { ...issue, column } : issue)));
  };

  const deleteIssue = (id: string) => {
    setIssues((prev) => prev.filter((issue) => issue.id !== id));
  };

  const addIssue = () => {
    // Cycled pool keeps "New issue" infinitely demoable without a form;
    // ids stay unique per click via the counter.
    const seed = NEXT_POOL[nextIndex % NEXT_POOL.length]!;
    const id = `NB-${430 + nextIndex}`;
    setNextIndex((prev) => prev + 1);
    setIssues((prev) => [
      { ...seed, id, column: 'backlog' },
      ...prev,
    ]);
  };

  return (
    <div
      data-slot='kanban-block'
      style={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        fontFamily: 'var(--haze-font-sans)',
        color: 'var(--haze-color-text)',
        background: 'var(--haze-color-bg-subtle)',
      }}
    >
      <header
        data-slot='kanban-header'
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--haze-space-2)',
          flexWrap: 'wrap',
          padding: 'var(--haze-space-3) var(--haze-space-4)',
          borderBottom: '1px solid var(--haze-color-border)',
          background: 'var(--haze-color-bg)',
        }}
      >
        <div>
          <h2 style={{ margin: 0, fontSize: 'var(--haze-text-lg)', fontWeight: 'var(--haze-weight-semibold)' }}>
            Nimbus · sprint 42 board
          </h2>
          <p
            style={{
              margin: 0,
              fontSize: 'var(--haze-text-sm)',
              color: 'var(--haze-color-text-secondary)',
            }}
          >
            {visible.length} issues · move cards from the ⋯ menu
          </p>
        </div>
        <span style={{ flex: 1 }} />
        <Input
          size='sm'
          value={searchCtrl}
          onChange={(event) => setSearch(event.target.value)}
          placeholder='Search issues…'
          aria-label='Search issues'
          style={{ width: '180px' }}
        />
        <Select
          size='sm'
          value={priorityCtrl}
          onValuesChange={(next) => setPriority(typeof next === 'string' ? next : 'all')}
          aria-label='Filter by priority'
        >
          <Option value='all'>All priorities</Option>
          <Option value='P0'>P0</Option>
          <Option value='P1'>P1</Option>
          <Option value='P2'>P2</Option>
        </Select>
        <Button size='sm' onClick={addIssue}>
          <Plus size={14} aria-hidden='true' />
          New issue
        </Button>
      </header>

      <div
        data-slot='kanban-columns'
        style={{
          flex: 1,
          minHeight: 0,
          display: 'flex',
          gap: 'var(--haze-space-3)',
          padding: 'var(--haze-space-3) var(--haze-space-4)',
          overflowX: 'auto',
        }}
      >
        {COLUMNS.map((column) => {
          const columnIssues = byColumn(column.id);
          return (
            <section
              key={column.id}
              data-slot='kanban-column'
              aria-label={`${column.name} — ${columnIssues.length} issues`}
              style={{
                flex: '1 1 260px',
                minWidth: '240px',
                display: 'flex',
                flexDirection: 'column',
                minHeight: 0,
                border: '1px solid var(--haze-color-border)',
                borderRadius: 'var(--haze-radius-lg)',
                background: 'var(--haze-color-bg)',
              }}
            >
              <header
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--haze-space-2)',
                  padding: 'var(--haze-space-2) var(--haze-space-3)',
                  borderBottom: '1px solid var(--haze-color-border)',
                }}
              >
                <span
                  aria-hidden='true'
                  style={{
                    width: 'var(--haze-space-2)',
                    height: 'var(--haze-space-2)',
                    borderRadius: 'var(--haze-radius-full)',
                    background: column.color,
                    flexShrink: 0,
                  }}
                />
                <strong style={{ fontSize: 'var(--haze-text-sm)' }}>{column.name}</strong>
                <Badge>{columnIssues.length}</Badge>
                <span style={{ flex: 1 }} />
                <span
                  style={{
                    fontSize: 'var(--haze-text-xs)',
                    color: 'var(--haze-color-text-muted)',
                  }}
                >
                  {column.hint}
                </span>
              </header>
              <div
                data-slot='kanban-column-cards'
                style={{
                  flex: 1,
                  minHeight: 0,
                  overflowY: 'auto',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 'var(--haze-space-2)',
                  padding: 'var(--haze-space-3)',
                }}
              >
                {columnIssues.length === 0 ? (
                  <Empty description={`Nothing in ${column.name.toLowerCase()}`} />
                ) : (
                  columnIssues.map((issue) => (
                    <IssueCard
                      key={issue.id}
                      issue={issue}
                      onMove={moveIssue}
                      onDelete={deleteIssue}
                    />
                  ))
                )}
              </div>
            </section>
          );
        })}
      </div>

      <footer
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--haze-space-2)',
          padding: 'var(--haze-space-2) var(--haze-space-4)',
          borderTop: '1px solid var(--haze-color-border)',
          background: 'var(--haze-color-bg)',
          fontSize: 'var(--haze-text-xs)',
          color: 'var(--haze-color-text-muted)',
        }}
      >
        <Search size={12} aria-hidden='true' />
        Static board by design — haze-ui ships single-container sorting
        (SortableTagGroup / SortableTabList / SortableTree), not cross-column drag.
      </footer>
    </div>
  );
}
