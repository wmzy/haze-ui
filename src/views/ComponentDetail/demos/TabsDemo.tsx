import type { ReactNode } from 'react';

import { css } from '@linaria/core';
import { useControl } from 'react-use-control';
import { FileCode, FileJson, FileText } from 'lucide-react';

import { Tabs, TabList, Tab, TabPanel, SortableTabList, Segmented } from '@/lib';

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

/** Compressed-tab label: the strip shrinks tabs to a floor
 * (Chrome-style), so long names ellipsize inside their box. */
const ellipsis = css`
  overflow: hidden;
  text-overflow: ellipsis;
`;

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
            <span x-class={ellipsis}>{tab.label}</span>
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
/** Variant switcher: one control drives `variant` on <Tabs> — the
 * strip chrome and every tab re-skin through context. */
function VariantTabs() {
  const [variant, setVariant, variantCtrl] = useControl(undefined, 'line');
  const [, , tabCtrl] = useControl(undefined, 'tab1');

  return (
    <>
      <Segmented
        options={[
          { value: 'line', label: 'line' },
          { value: 'card', label: 'card' },
          { value: 'pill', label: 'pill' },
        ]}
        value={variantCtrl}
        onChange={setVariant}
      />
      {/* Segmented speaks plain strings; Tabs narrows to the variant union. */}
      <Tabs value={tabCtrl} variant={variant as 'line' | 'card' | 'pill'}>
        <TabList>
          <Tab value='tab1'>Tab One</Tab>
          <Tab value='tab2'>Tab Two</Tab>
          <Tab value='tab3'>Tab Three</Tab>
        </TabList>
        <TabPanel value='tab1'>Content for Tab One.</TabPanel>
        <TabPanel value='tab2'>Content for Tab Two.</TabPanel>
        <TabPanel value='tab3'>Content for Tab Three.</TabPanel>
      </Tabs>
    </>
  );
}

/** Data-driven + addable + destroy: the whole "closable editor" shape
 * without writing a single compound child — items render the strip
 * and the panels, `addable` grows the array, and inactive panels
 * unmount (the input below resets when you switch away and back). */
function DraftPanel({ name }: { name: string }) {
  return (
    <p style={{ margin: 0 }}>
      {name} — type a note, then switch tabs and back: the field comes
      back empty because{' '}
      <code>destroyInactiveTabPane</code> unmounted the panel.
      <input
        aria-label={`${name} note`}
        placeholder='type, then switch tabs'
        style={{ display: 'block', marginTop: 'var(--haze-space-2)' }}
      />
    </p>
  );
}

function AddableItemsTabs() {
  const [items, setItems] = useControl(undefined, [
    { value: 'draft-1', label: 'Draft 1', panel: <DraftPanel name='Draft 1' /> },
    { value: 'draft-2', label: 'Draft 2', panel: <DraftPanel name='Draft 2' /> },
  ]);
  const [, , activeCtrl] = useControl(undefined, 'draft-1');

  const add = () => {
    const n = items.length + 1;
    setItems([
      ...items,
      {
        value: `draft-${n}`,
        label: `Draft ${n}`,
        panel: <DraftPanel name={`Draft ${n}`} />,
      },
    ]);
  };

  return (
    <Tabs
      value={activeCtrl}
      items={items}
      addable={{ onAdd: add, addLabel: 'New draft' }}
      destroyInactiveTabPane
    />
  );
}

/** Reorders a list by the index permutation SortableTabList reports. */
function applyOrder<T>(list: T[], order: number[]): T[] {
  return order.flatMap((index) => {
    const item = list[index];
    return item === undefined ? [] : [item];
  });
}

/** Sortable docs: the tab order lives in one control; onReorder reports
 * the new index permutation and we re-render — the owner-driven reorder
 * contract, mirroring SortableTagGroup's seam. */
function SortableDocumentTabs() {
  const [order, setOrder] = useControl(
    undefined,
    docTabs.map((_, i) => i)
  );
  const [, , activeCtrl] = useControl(undefined, 'app');
  const ordered = applyOrder(docTabs, order);

  return (
    <Tabs value={activeCtrl}>
      <SortableTabList onReorder={setOrder}>
        {ordered.map((tab) => (
          <Tab
            key={tab.value}
            value={tab.value}
            icon={tab.icon}
            status={tab.status}
          >
            {tab.label}
          </Tab>
        ))}
      </SortableTabList>
    </Tabs>
  );
}

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
        <h2>Variants — line / card / pill</h2>
        <p className={row}>
          One <code>variant</code> prop on the <code>&lt;Tabs&gt;</code> root
          re-skins the whole strip through context:{' '}
          <code>line</code> (default — the underline strip with its
          full-width separator), <code>card</code> (flat antd-style cards;
          the selected tab raises onto a bordered surface, no strip
          separator) and <code>pill</code> (the Segmented-style capsule —
          a muted trough the selected pill lifts out of). The overflow
          folding, roving keyboard and compression machinery are
          identical in all three.
        </p>
        <VariantTabs />
        <pre className={codeBlock}>
          {`<Tabs value={tabCtrl} variant='card'>
  <TabList>…</TabList>
</Tabs>`}
        </pre>
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
        <h2>items — data-driven tabs</h2>
        <p className={row}>
          Pass <code>items</code> instead of compound children and{' '}
          <code>&lt;Tabs&gt;</code> renders the whole strip for you —
          one <code>&lt;Tab&gt;</code> per record plus every{' '}
          <code>&lt;TabPanel&gt;</code> from <code>panel</code>. It is
          the same <code>&lt;TabList&gt;</code> underneath, so overflow
          folding, the roving keyboard model and ResizeObserver
          compression all keep working. <code>icon</code>,{' '}
          <code>status</code>, <code>closable</code> and{' '}
          <code>disabled</code> flow straight through to the tabs.
          Giving both <code>items</code> and children is a contract
          breach — the console names it and <code>items</code> wins.
        </p>
        <Tabs
          value='overview'
          items={[
            {
              value: 'overview',
              label: 'Overview',
              panel: <p style={{ margin: 0 }}>Everything, at a glance.</p>,
            },
            {
              value: 'activity',
              label: 'Activity',
              icon: <FileText size={14} />,
              status: 'syncing',
              panel: <p style={{ margin: 0 }}>Syncing your activity…</p>,
            },
            {
              value: 'settings',
              label: 'Settings',
              icon: <FileJson size={14} />,
              disabled: true,
              panel: <p style={{ margin: 0 }}>Settings for this workspace.</p>,
            },
          ]}
        />
        <pre className={codeBlock}>
          {`<Tabs value='overview' items={[
  { value: 'overview', label: 'Overview', panel: <p>…</p> },
  { value: 'activity', label: 'Activity', status: 'syncing', panel: <p>…</p> },
  { value: 'settings', label: 'Settings', disabled: true, panel: <p>…</p> },
]} />`}
        </pre>
      </div>

      <div className={section}>
        <h2>destroyInactiveTabPane + addable</h2>
        <p className={row}>
          By default inactive panels stay mounted and hidden — panel
          state survives tab switches.{' '}
          <code>destroyInactiveTabPane</code> unmounts them instead
          (type into a draft below, switch away and back — the field
          resets). <code>addable</code> renders the <code>+</code> at
          the tail of the bar: a real button outside the tablist (its
          own tab stop, Enter/Space activate) that only notifies —
          growing the array is your job, which is exactly what the
          fixture does.
        </p>
        <AddableItemsTabs />
        <pre className={codeBlock}>
          {`const [items, setItems] = useControl(undefined, initialDrafts);

<Tabs value={activeCtrl} items={items} destroyInactiveTabPane
  addable={{ onAdd: () => setItems([...items, newDraft]),
             addLabel: 'New draft' }} />`}
        </pre>
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
        <h2>Sortable tabs</h2>
        <p className={row}>
          <code>SortableTabList</code> is the dnd-kit variant of{' '}
          <code>TabList</code>: drag a tab to reorder (8px distance
          threshold keeps plain clicks selecting), or lift it with{' '}
          <kbd>Space</kbd>, move with the arrows, drop with{' '}
          <kbd>Enter</kbd>, cancel with <kbd>Esc</kbd>. Reordering is
          owner-driven — <code>onReorder</code> reports the new index
          order and you re-render the <code>&lt;Tab&gt;</code>s. The ⋯
          overflow menu is not rendered in this variant; the strip
          scrolls instead.
        </p>
        <SortableDocumentTabs />
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
        <h2>TabList Props</h2>
        <PropsTable of='TabListProps' />
      </div>

      <div className={section}>
        <h2>SortableTabList Props</h2>
        <PropsTable of='SortableTabListProps' />
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
            <li>
              Disabled tabs are inert but visible — no click selection,
              skipped by the roving arrows and by the overflow menu
            </li>
            <li>
              The <code>addable</code> <code>+</code> sits outside the
              tablist (the strip owns nothing but tabs) as a real
              button — its own tab stop, Enter/Space activate
            </li>
          </ul>
        </A11yNote>
      </div>

      <CssVarsSection component='tabs' />
    </>
  );
}
