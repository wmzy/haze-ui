import { useState } from 'react';

import { Button, Spinner, TaskList, TaskListItem } from '@/lib';

import PropsTable from '../PropsTable';

import {
  AccessibilitySection,
  CssVarsSection,
  DemoPage,
  DemoSection,
  maxWidth420,
} from './shared';

function TaskListPlayground() {
  const [doneSummary, setDoneSummary] = useState(false);
  const [doneUnits, setDoneUnits] = useState(true);
  const [donePolish, setDonePolish] = useState(false);

  return (
    <div style={maxWidth420}>
      <p aria-live='polite'>
        {`Done: ${[doneSummary, doneUnits, donePolish].filter(Boolean).length}/3`}
      </p>
      <TaskList>
        <TaskListItem
          checked={doneSummary}
          onCheckedChange={setDoneSummary}
          title='Summarize the thread'
          description='Two sentences, no preamble'
        />
        <TaskListItem
          checked={doneUnits}
          onCheckedChange={setDoneUnits}
          title='Convert imperial units'
          description='1 cup = 236.6 ml'
        />
        <TaskListItem
          checked={donePolish}
          onCheckedChange={setDonePolish}
          title='Polish wording'
          description='Running — the model is rewriting the answer'
          indicator={<Spinner size='sm' aria-label='Rewriting the answer' />}
        />
        <TaskListItem
          checked={false}
          title='Attach the source table'
          description='Waiting for the summary step'
          actions={
            <Button variant='ghost' size='sm'>
              Retry
            </Button>
          }
        />
      </TaskList>
    </div>
  );
}

type Row = {
  key: string;
  title: string;
  description?: string;
};

const initialRows: Row[] = [
  { key: 'audit', title: 'Audit dependencies', description: '3 outdated' },
  { key: 'bump', title: 'Bump the patch versions' },
  { key: 'notes', title: 'Write the changelog entry' },
];

function TaskListItemsPlayground() {
  const [done, setDone] = useState<Record<string, boolean>>({
    audit: true,
  });

  return (
    <div style={maxWidth420}>
      <TaskList
        items={initialRows.map((row) => ({
          key: row.key,
          title: row.title,
          description: row.description,
          checked: done[row.key] ?? false,
          onCheckedChange: (v: boolean) =>
            setDone((prev) => ({ ...prev, [row.key]: v })),
        }))}
      />
    </div>
  );
}

// ─── TaskList ──────────────────────────────────────────────────
export default function TaskListDemo() {
  return (
    <DemoPage
      title='TaskList'
      description={
        <>
          Interactive agent task checklist: checkbox rows whose titles strike
          through and dim once done, with optional description, custom running
          indicator and trailing actions.
        </>
      }
    >
      <DemoSection title='Demo'>
        <TaskListPlayground />
      </DemoSection>

      <DemoSection title='Data-driven items'>
        <TaskListItemsPlayground />
      </DemoSection>

      <DemoSection title='TaskList Props'>
        <PropsTable of='TaskListProps' />
      </DemoSection>

      <DemoSection title='TaskListItem Props'>
        <PropsTable of='TaskListItemProps' />
      </DemoSection>

      <AccessibilitySection>
        <ul>
          <li>
            Native <strong>list</strong>/<strong>listitem</strong> semantics
            from the underlying <code>ul</code>/<code>li</code> elements
          </li>
          <li>
            The default row is a <code>label</code>: the visible title names
            the checkbox (axe-clean) and clicking anywhere on the row toggles
          </li>
          <li>
            <code>actions</code> render outside the toggle label, so
            activating them never flips the task
          </li>
          <li>
            A custom <code>indicator</code> (e.g. <code>Spinner</code>) keeps
            its own accessible name — pass <code>aria-label</code> on it
          </li>
        </ul>
      </AccessibilitySection>

      <CssVarsSection component='task-list' />
    </DemoPage>
  );
}
