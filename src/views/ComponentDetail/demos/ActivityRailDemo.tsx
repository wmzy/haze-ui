import { useControl } from 'react-use-control';
import { Files, Search, GitBranch, Bug, Settings } from 'lucide-react';

import { ActivityRail, ActivityRailItem } from '@/lib/components/ActivityRail';

import PropsTable from '../PropsTable';

import A11yNote from '../A11yNote';

import { intro, section, row, codeBlock } from '../styles';

// ─── ActivityRail ──────────────────────────────────────────────
export default function ActivityRailDemo() {
  // Uncontrolled with an external read-back — the rail drives the active
  // view, the paragraph below mirrors it (the ControlOrValue idiom).
  const [view, setView] = useControl(undefined, 'files');

  return (
    <>
      <h1>ActivityRail</h1>
      <p className={intro}>
        The narrow icon rail VSCode pins to the window&apos;s leading edge:
        a 48px track of 44px icon buttons carrying the global view
        switches. Items sink to the bottom through{' '}
        <code>slot=&quot;end&quot;</code>; labels stay out of sight — each
        item is named accessibly and surfaces it as a hover tooltip.
      </p>

      <div className={section}>
        <h2>Demo</h2>
        <p className={row}>
          Current view: <strong>{view}</strong> — click or focus + Enter to
          switch.
        </p>
        <div
          className={row}
          style={{
            height: 360,
            border: '1px solid var(--haze-color-border)',
            borderRadius: 'var(--haze-radius-lg)',
            display: 'flex',
          }}
        >
          <ActivityRail aria-label='Views'>
            <ActivityRailItem
              icon={<Files size={20} />}
              label='Explorer'
              active={view === 'files'}
              onSelect={() => setView('files')}
            />
            <ActivityRailItem
              icon={<Search size={20} />}
              label='Search'
              badge={3}
              active={view === 'search'}
              onSelect={() => setView('search')}
            />
            <ActivityRailItem
              icon={<GitBranch size={20} />}
              label='Source Control'
              active={view === 'git'}
              onSelect={() => setView('git')}
            />
            <ActivityRailItem
              icon={<Bug size={20} />}
              label='Run and Debug'
              active={view === 'debug'}
              onSelect={() => setView('debug')}
            />
            <ActivityRailItem
              slot='end'
              icon={<Settings size={20} />}
              label='Settings'
              active={view === 'settings'}
              onSelect={() => setView('settings')}
            />
          </ActivityRail>
          <div
            style={{
              flex: 1,
              padding: 'var(--haze-space-3)',
              fontSize: 'var(--haze-text-sm)',
              color: 'var(--haze-color-text-secondary)',
            }}
          >
            The adjacent region is the consumer&apos;s business — the rail
            only owns its 48px column. The <code>Settings</code> item uses{' '}
            <code>slot=&quot;end&quot;</code> and sinks to the track bottom.
          </div>
        </div>
        <pre className={codeBlock}>
          {`<ActivityRail aria-label='Views'>
  <ActivityRailItem icon={<Files size={20} />} label='Explorer'
    active={view === 'files'} onSelect={() => setView('files')} />
  <ActivityRailItem slot='end' icon={<Settings size={20} />} label='Settings' />
</ActivityRail>`}
        </pre>
        <p className={row}>
          Passing the control instead wires it into a host layout:{' '}
          <code>active</code> is <code>ControlOrValue</code>-friendly — the
          demo above already reads it back externally.
        </p>
        <pre className={codeBlock}>
          {`const [view, , viewCtrl] = useControl(undefined, 'files');
// <ActivityRailItem active={viewCtrl === ...} /> — see Workbench for the
// full assembly.`}
        </pre>
      </div>

      <div className={section}>
        <h2>ActivityRail Props</h2>
        <PropsTable of='ActivityRailProps' />
      </div>

      <div className={section}>
        <h2>ActivityRailItem Props</h2>
        <PropsTable of='ActivityRailItemProps' />
      </div>

      <div className={section}>
        <h2>Accessibility</h2>
        <A11yNote>
          <ul>
            <li>
              The rail renders a <strong>&lt;nav&gt;</strong> landmark; give
              it an <code>aria-label</code> when more than one{' '}
              <code>nav</code> exists on the page.
            </li>
            <li>
              Items are real buttons: keyboard-operable (Enter / Space) with
              the visible label as their accessible name — the icon slot is{' '}
              <code>aria-hidden</code> decoration.
            </li>
            <li>
              The current item carries{' '}
              <strong>aria-current=&quot;true&quot;</strong>; the label also
              feeds a hover tooltip.
            </li>
            <li>
              44px square targets (WCAG 2.5.8); the badge overlay is
              decorative — repeat counts in the label when they matter.
            </li>
          </ul>
        </A11yNote>
      </div>
    </>
  );
}
