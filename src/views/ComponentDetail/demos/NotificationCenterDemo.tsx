import { useState } from 'react';

import { NotificationCenter, type NotificationCenterItem } from '@/lib/components/NotificationCenter';

import PropsTable from '../PropsTable';

import A11yNote from '../A11yNote';

import { intro, section, row } from '../styles';

const initialFeed: NotificationCenterItem[] = [
  {
    key: 'deploy',
    title: 'Deploy finished',
    description: 'haze-ui-site deployed to production from commit 4f2a91c',
    timestamp: '2m ago',
    severity: 'success',
    kind: 'task',
  },
  {
    key: 'approval',
    title: 'Agent needs approval',
    description: 'Refactor agent requests write access to src/lib',
    timestamp: '10m ago',
    severity: 'warning',
    kind: 'agent',
  },
  {
    key: 'quota',
    title: 'Token quota at 80%',
    description: 'The workspace will throttle long-running agents tonight',
    timestamp: '1h ago',
    severity: 'danger',
    kind: 'agent',
  },
  {
    key: 'maintenance',
    title: 'Maintenance window',
    description: 'Sunday 02:00–03:00 UTC, expect brief API interruptions',
    timestamp: '3h ago',
    severity: 'info',
    kind: 'system',
    read: true,
  },
];

// ─── NotificationCenter ──────────────────────────────────────────
export default function NotificationCenterDemo() {
  const [items, setItems] = useState(initialFeed);

  return (
    <>
      <h1>NotificationCenter</h1>
      <p className={intro}>
        Persistent notification feed behind a bell trigger: unread-count badge,
        severity/kind rows, mark-all-read and clear-all — the durable
        counterpart to <code>Toast</code>, declarative through{' '}
        <code>items</code> instead of an imperative <code>open()</code> API.
      </p>

      <div className={section}>
        <h2>Demo</h2>
        <div className={row}>
          <NotificationCenter
            items={items}
            onMarkAllRead={() =>
              setItems((feed) => feed.map((item) => ({ ...item, read: true })))
            }
            onClearAll={() => setItems([])}
          />
        </div>
      </div>

      <div className={section}>
        <h2>Controlled open state</h2>
        <div className={row}>
          <ControlledOpen />
        </div>
      </div>

      <div className={section}>
        <h2>Badge ceiling</h2>
        <div className={row}>
          <NotificationCenter
            items={Array.from({ length: 120 }, (_, index) => ({
              key: String(index),
              title: `Event ${index + 1}`,
              timestamp: `${index + 1}m ago`,
            }))}
            maxBadgeCount={9}
          />
          <NotificationCenter items={[]} />
        </div>
      </div>

      <div className={section}>
        <h2>Props</h2>
        <PropsTable of='NotificationCenterProps' />
      </div>

      <div className={section}>
        <h2>Accessibility</h2>
        <A11yNote>
          <ul>
            <li>The bell trigger carries <strong>aria-expanded</strong>, <strong>aria-controls</strong> and an <strong>aria-label</strong> that names the unread count (&quot;Notifications (2 unread)&quot;)</li>
            <li>The panel is a labelled <strong>role=&quot;dialog&quot;</strong>; rows and the footer actions form one roving-tabindex list — arrows, Home/End and typeahead move focus, Escape/Tab close and return focus to the trigger</li>
            <li>Unread rows expose an <strong>Unread</strong> label through the dot accent; severity tints are decorative (icon + color, never color alone)</li>
            <li>Panel copy (title, actions, empty state, trigger labels) localizes through <code>LocaleProvider</code> strings — 11 built-in packs</li>
          </ul>
        </A11yNote>
      </div>
    </>
  );
}

/** Controlled-open showcase: external buttons drive the panel. */
function ControlledOpen() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <NotificationCenter items={initialFeed} open={open} />
      <button type='button' onClick={() => setOpen((prev) => !prev)}>
        {open ? 'Close' : 'Open'} externally
      </button>
    </>
  );
}
