import type { ReactNode } from 'react';

import { css } from '@linaria/core';
import { useControl } from 'react-use-control';
import { FileCode, FileJson, FileText } from 'lucide-react';

import { Tabs, TabList, Tab, TabPanel } from '@/lib';

import PropsTable from '../PropsTable';

import A11yNote from '../A11yNote';

import { intro, section, row, codeBlock } from '../styles';

import { CssVarsSection } from './shared';

// classNames 槽位演示：一条记录从 <Tabs> 根分发到全部四个部位
// （root/list/tab/panel，键名见 TabsClassNames）。
const themedRoot = css`
  gap: var(--haze-space-2);
`;

const themedTab = css`
  font-weight: var(--haze-weight-bold);
`;

const themedPanel = css`
  background: var(--haze-color-primary-subtle);
  border-radius: var(--haze-radius-md);
  padding: var(--haze-space-4);
`;

type DocTab = {
  value: string;
  label: string;
  icon?: ReactNode;
  status?: 'dirty' | 'error' | 'syncing';
  closable?: boolean;
};

const docTabs: DocTab[] = [
  { value: 'app', label: 'App.tsx', icon: <FileCode size={14} />, closable: true },
  {
    value: 'index',
    label: 'index.tsx',
    icon: <FileCode size={14} />,
    status: 'dirty',
    closable: true,
  },
  {
    value: 'pkg',
    label: 'package.json',
    icon: <FileJson size={14} />,
    status: 'error',
    closable: true,
  },
  {
    value: 'notes',
    label: 'notes.md',
    icon: <FileText size={14} />,
    status: 'syncing',
    closable: true,
  },
];

/** The document-tabs fixture: one controlled value, an array of open
 * docs, and a close handler that re-homes the selection to a neighbor —
 * the whole "editor strip" shape on the Tabs doc layer. */
function DocumentTabs({
  tabs,
  defaultValue,
}: {
  tabs: DocTab[];
  defaultValue: string;
}) {
  const [open, setOpen] = useControl(undefined, tabs);
  const [active, setActive, activeCtrl] = useControl(undefined, defaultValue);

  const close = (value: string) => {
    const index = open.findIndex((tab) => tab.value === value);
    if (index === -1) return;
    const next = open.filter((tab) => tab.value !== value);
    if (active === value) {
      const fallback = next[Math.min(index, next.length - 1)];
      if (fallback) setActive(fallback.value);
    }
    setOpen(next);
  };

  return (
    <Tabs value={activeCtrl}>
      <TabList overflowLabel='More tabs'>
        {open.map((tab) => (
          <Tab
            key={tab.value}
            value={tab.value}
            icon={tab.icon}
            status={tab.status}
            closable={tab.closable}
            onClose={() => close(tab.value)}
          >
            {tab.label}
          </Tab>
        ))}
      </TabList>
      {open.map((tab) => (
        <TabPanel key={tab.value} value={tab.value}>
          <p style={{ margin: 0, padding: 'var(--haze-space-3)' }}>
            Editing <code>{tab.label}</code>
            {tab.status ? ` — status: ${tab.status}` : ''}.
          </p>
        </TabPanel>
      ))}
    </Tabs>
  );
}

// ─── Tabs ──────────────────────────────────────────────────────
export default function TabsDemo() {
  const [, , tabCtrl] = useControl(undefined, 'tab1');

  return (
    <>
      <h1>Tabs</h1>
      <p className={intro}>
        Organize content into switchable panels with tabbed navigation.
      </p>

      <div className={section}>
        <h2>Demo</h2>
        <Tabs value={tabCtrl}>
          <TabList>
            <Tab value='tab1'>Tab One</Tab>
            <Tab value='tab2'>Tab Two</Tab>
            <Tab value='tab3'>Tab Three</Tab>
          </TabList>
          <TabPanel value='tab1'>Content for Tab One.</TabPanel>
          <TabPanel value='tab2'>Content for Tab Two.</TabPanel>
          <TabPanel value='tab3'>Content for Tab Three.</TabPanel>
        </Tabs>
      </div>

      <div className={section}>
        <h2>classNames slots</h2>
        <p
          style={{
            fontSize: 'var(--haze-text-sm)',
            color: 'var(--haze-color-text-secondary)',
            margin: '0 0 var(--haze-space-3)',
          }}
        >
          One <code>classNames</code> record on the{' '}
          <code>&lt;Tabs&gt;</code> root reaches every part through
          context (AntD v6 shape): <code>root</code>, <code>list</code>,{' '}
          <code>tab</code> (every tab, not just the active one) and{' '}
          <code>panel</code> (every panel). Slot classes arrive after the
          component defaults — here the panels get a primary-tinted
          surface and the tabs bold labels.
        </p>
        <Tabs value='tab1' classNames={{ root: themedRoot, tab: themedTab, panel: themedPanel }}>
          <TabList>
            <Tab value='tab1'>Tab One</Tab>
            <Tab value='tab2'>Tab Two</Tab>
          </TabList>
          <TabPanel value='tab1'>Content for Tab One.</TabPanel>
          <TabPanel value='tab2'>Content for Tab Two.</TabPanel>
        </Tabs>
      </div>

      <div className={section}>
        <h2>Document tabs — icon, status, closable</h2>
        <p className={row}>
          The document layer turns the strip into an editor tab bar:{' '}
          <code>icon</code> decorates the inline-start slot,{' '}
          <code>status</code> adds a dot (<code>dirty</code> neutral,{' '}
          <code>error</code> danger, <code>syncing</code> primary) with the
          status word appended to the accessible name via{' '}
          <code>statusLabel</code>, and <code>closable</code> renders the ×.{' '}
          <code>onClose</code> only notifies — removing the tab and picking
          the next active one is the consumer&apos;s job (the fixture below
          re-homes the selection to a neighbor).
        </p>
        <DocumentTabs tabs={docTabs} defaultValue='app' />
        <p className={row}>
          Close with the × or the Delete key on a focused tab — the × click
          never selects the tab.
        </p>
        <pre className={codeBlock}>
          {`<TabList overflowLabel='More tabs'>
  <Tab value='app' icon={<FileCode size={14} />} closable
    onClose={() => close('app')}>App.tsx</Tab>
  <Tab value='index' icon={<FileCode size={14} />} status='dirty' closable
    onClose={() => close('index')}>index.tsx</Tab>
  <Tab value='pkg' status='error' statusLabel='validation failed' closable
    onClose={() => close('pkg')}>package.json</Tab>
</TabList>`}
        </pre>
      </div>

      <div className={section}>
        <h2>Overflow</h2>
        <p className={row}>
          When the strip runs out of room, tabs that no longer fit fold
          into a <code>⋯</code> overflow menu (<code>overflowLabel</code>{' '}
          is its aria-label, the i18n hook). Overflowing menu entries keep
          their icon and status dot; shrink this panel to watch them fold.
        </p>
        <DocumentTabs
          tabs={Array.from({ length: 12 }, (_, i) => ({
            value: `file-${i + 1}`,
            label: `file-${i + 1}.tsx`,
            icon: <FileCode size={14} />,
            status: i === 3 ? ('syncing' as const) : undefined,
            closable: true,
          }))}
          defaultValue='file-1'
        />
      </div>

      <div className={section}>
        <h2>Tabs Props</h2>
        <PropsTable of='TabsProps' />
      </div>

      <div className={section}>
        <h2>Tab Props</h2>
        <PropsTable of='TabProps' />
      </div>

      <div className={section}>
        <h2>TabPanel Props</h2>
        <PropsTable of='TabPanelProps' />
      </div>

      <div className={section}>
        <h2>Accessibility</h2>
        <A11yNote>
          <ul>
            <li>
              Uses <strong>role=&quot;tablist&quot;</strong>,{' '}
              <strong>role=&quot;tab&quot;</strong>,{' '}
              <strong>role=&quot;tabpanel&quot;</strong>
            </li>
            <li>
              Active tab has <strong>aria-selected=&quot;true&quot;</strong>
            </li>
            <li>
              Tabs linked to panels via <strong>aria-controls</strong>
            </li>
            <li>
              <strong>Arrow keys</strong> navigate between tabs
            </li>
            <li>
              <strong>Delete</strong> on a focused closable tab requests a
              close (APG deletable tabs); the × is a real button but not a
              tab stop, keeping one roving stop
            </li>
            <li>
              The status dot is color-only decoration — the status word
              (<code>statusLabel</code>, defaulting per status) is what
              reaches screen readers
            </li>
            <li>
              Folded overflow tabs stay reachable through the{' '}
              <code>⋯</code> menu button
            </li>
          </ul>
        </A11yNote>
      </div>

      <CssVarsSection component='tabs' />
    </>
  );
}
