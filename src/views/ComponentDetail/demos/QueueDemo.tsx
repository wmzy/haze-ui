import { useState } from 'react';

import { Queue, QueueItem } from '@/lib';

import PropsTable from '../PropsTable';

import A11yNote from '../A11yNote';

import { intro, section } from '../styles';

import { CssVarsSection } from './shared';

type Entry = {
  id: number;
  title: string;
  description?: string;
  status: 'queued' | 'sending' | 'failed';
};

const initialEntries: Entry[] = [
  { id: 1, title: 'Summarize the thread', description: 'queued while offline', status: 'queued' },
  { id: 2, title: 'Attach latest report', status: 'sending' },
  { id: 3, title: 'Ping the on-call agent', description: 'connection lost', status: 'failed' },
];

function QueuePlayground() {
  const [entries, setEntries] = useState<Entry[]>(initialEntries);
  const [nextId, setNextId] = useState(initialEntries.length + 1);

  return (
    <div style={{ maxWidth: 420 }}>
      <button
        type='button'
        onClick={() => {
          setEntries((prev) => [
            ...prev,
            { id: nextId, title: `Draft message ${nextId}`, status: 'queued' },
          ]);
          setNextId((n) => n + 1);
        }}
      >
        Enqueue draft
      </button>{' '}
      <button type='button' onClick={() => setEntries(initialEntries)}>
        Reset
      </button>
      <p aria-live='polite'>
        Pending: {entries.filter((e) => e.status !== 'failed').length}
      </p>
      <Queue>
        {entries.map((entry) => (
          <QueueItem
            key={entry.id}
            title={entry.title}
            description={entry.description}
            status={entry.status}
            removeLabel={`Remove ${entry.title}`}
            onRemove={() => setEntries((prev) => prev.filter((e) => e.id !== entry.id))}
          />
        ))}
      </Queue>
    </div>
  );
}

// ─── Queue ─────────────────────────────────────────────────────
export default function QueueDemo() {
  return (
    <>
      <h1>Queue</h1>
      <p className={intro}>
        Queue of pending agent actions or messages: each entry carries a status
        (queued, sending, failed) and an optional remove action.
      </p>

      <div className={section}>
        <h2>Demo</h2>
        <QueuePlayground />
      </div>

      <div className={section}>
        <h2>Queue Props</h2>
        <PropsTable of='QueueProps' />
      </div>

      <div className={section}>
        <h2>QueueItem Props</h2>
        <PropsTable of='QueueItemProps' />
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
              The sending state renders the library Spinner (its{' '}
              <code>role=&quot;status&quot;</code> announcement is preserved)
            </li>
            <li>
              The remove button is keyboard reachable; pass{' '}
              <code>removeLabel</code> for a descriptive accessible name (no
              builtin copy)
            </li>
          </ul>
        </A11yNote>
      </div>

      <CssVarsSection component='queue' />
    </>
  );
}
