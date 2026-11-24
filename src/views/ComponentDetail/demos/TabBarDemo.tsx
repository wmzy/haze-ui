import { useControl } from 'react-use-control';
import { Folder, Search, Bell, User } from 'lucide-react';

import { TabBar, TabBarItem } from '@/lib/components/TabBar';

import PropsTable from '../PropsTable';

import { row, codeBlock } from '../styles';

import { AccessibilitySection, DemoPage, DemoSection } from './shared';

type Section = 'home' | 'search' | 'alerts' | 'profile';

// ─── TabBar ────────────────────────────────────────────────────
export default function TabBarDemo() {
  // Uncontrolled with an external read-back — the bar drives the current
  // section, the paragraph mirrors it (the ControlOrValue idiom).
  const [section, setSection] = useControl<Section>(
    undefined,
    'home'
  );
  const [popped, setPopped] = useControl(undefined, 0);

  return (
    <DemoPage
      title='TabBar'
      description={
        <>
          The mobile bottom navigation bar: icon-over-label items
          distributed evenly across a 56px track (safe-area aware). Under{' '}
          <strong>768px</strong> in a Workbench it replaces the activity
          rail; activate the already-active item and{' '}
          <code>onReselect</code> fires instead of <code>onSelect</code> —
          the &quot;reselect pops back to root&quot; affordance.
        </>
      }
    >
      <DemoSection title='Demo'>
        <p className={row}>
          Current section: <strong>{section}</strong> · Home reselected{' '}
          <strong>{popped}</strong> time(s).
        </p>
        <div
          style={{
            border: '1px solid var(--haze-color-border)',
            borderRadius: 'var(--haze-radius-md)',
            overflow: 'hidden',
            maxWidth: 420,
          }}
        >
          <div
            style={{
              height: 180,
              padding: 'var(--haze-space-3)',
              fontSize: 'var(--haze-text-sm)',
              color: 'var(--haze-color-text-secondary)',
            }}
          >
            Page content — the bar docks itself to the strip below. For a
            standalone page, pin it with{' '}
            <code>position: fixed; inset-block-end: 0</code>.
          </div>
          <TabBar aria-label='Primary'>
            <TabBarItem
              icon={<Folder size={22} />}
              label='Home'
              active={section === 'home'}
              onSelect={() => setSection('home')}
              onReselect={() => setPopped((n) => n + 1)}
            />
            <TabBarItem
              icon={<Search size={22} />}
              label='Search'
              active={section === 'search'}
              onSelect={() => setSection('search')}
            />
            <TabBarItem
              icon={<Bell size={22} />}
              label='Alerts'
              badge={5}
              active={section === 'alerts'}
              onSelect={() => setSection('alerts')}
            />
            <TabBarItem
              icon={<User size={22} />}
              label='Profile'
              active={section === 'profile'}
              onSelect={() => setSection('profile')}
            />
          </TabBar>
        </div>
        <pre className={codeBlock}>
          {`<TabBar aria-label='Primary'>
  <TabBarItem icon={<Folder size={22} />} label='Home'
    active={section === 'home'}
    onSelect={() => setSection('home')}
    onReselect={() => setPopped((n) => n + 1)} />
  <TabBarItem icon={<Bell size={22} />} label='Alerts' badge={5}
    active={section === 'alerts'} onSelect={() => setSection('alerts')} />
</TabBar>`}
        </pre>
      </DemoSection>

      <DemoSection title='TabBar Props'>
        <PropsTable of='TabBarProps' />
      </DemoSection>

      <DemoSection title='TabBarItem Props'>
        <PropsTable of='TabBarItemProps' />
      </DemoSection>

      <AccessibilitySection>
        <ul>
          <li>
            The bar renders a <strong>&lt;nav&gt;</strong> landmark with{' '}
            <code>aria-label</code>; items are real buttons (Enter /
            Space) carrying the visible label as their accessible name —
            the icon slot is <code>aria-hidden</code> decoration.
          </li>
          <li>
            The current item carries{' '}
            <strong>aria-current=&quot;true&quot;</strong>.
          </li>
          <li>
            A crowded bar keeps every item at least content-wide and
            scrolls the track instead of squishing labels; 44px minimum
            targets (WCAG 2.5.8).
          </li>
        </ul>
      </AccessibilitySection>
    </DemoPage>
  );
}
