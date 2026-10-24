import { useState } from 'react';

import { Button, Spinner, TaskList, TaskListItem } from '@/lib';

import PropsTable from '../PropsTable';

import A11yNote from '../A11yNote';

import { intro, section } from '../styles';

import { CssVarsSection } from './shared';

function TaskListPlayground() {
  const [doneSummary, setDoneSummary] = useState(false);
  const [doneUnits, setDoneUnits] = useState(true);
  const [donePolish, setDonePolish] = useState(false);

  return (
    <div style={{ maxWidth: 420 }}>
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
    <div style={{ maxWidth: 420 }}>
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
    <>
      <h1>TaskList</h1>
      <p className={intro}>
        Interactive agent task checklist: checkbox rows whose titles strike
        through and dim once done, with optional description, custom running
        indicator and trailing actions.
      </p>

      <div className={section}>
        <h2>Demo</h2>
        <TaskListPlayground />
      </div>

      <div className={section}>
        <h2>Data-driven items</h2>
        <TaskListItemsPlayground />
      </div>

      <div className={section}>
        <h2>TaskList Props</h2>
        <PropsTable of='TaskListProps' />
      </div>

      <div className={section}>
        <h2>TaskListItem Props</h2>
        <PropsTable of='TaskListItemProps' />
      </div>

      <div className={section}>
        <h2>Accessibility</h2>
        <A11yNote>
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
        </A11yNote>
      </div>

      <CssVarsSection component='task-list' />
    </>
  );
}
