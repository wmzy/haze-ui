import type { ReactNode } from 'react';

import { expect, vi } from 'vitest';
import { act, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createRef } from 'react';

import { floatingHidden } from '../../utils/floating';
import { defaultStrings } from '../LocaleProvider/locale';

import TabList from './TabList';
import Tab from './Tab';
import TabPanel from './TabPanel';
import Tabs, { type TabData } from './Tabs';
import { tabVariants, listVariants } from './index';


function TabsFixture({
  defaultValue = 'one',
  variant,
  destroyInactiveTabPane,
  lazy,
  addable,
}: {
  defaultValue?: string;
  variant?: 'line' | 'card' | 'pill';
  destroyInactiveTabPane?: boolean;
  lazy?: boolean;
  addable?: { onAdd?: () => void; addLabel?: string };
}) {
  return (
    <Tabs
      value={defaultValue}
      variant={variant}
      destroyInactiveTabPane={destroyInactiveTabPane}
      lazy={lazy}
      addable={addable}
    >
      <TabList>
        <Tab value="one">Tab 1</Tab>
        <Tab value="two">Tab 2</Tab>
      </TabList>
      <TabPanel value="one">Panel 1</TabPanel>
      <TabPanel value="two">Panel 2</TabPanel>
    </Tabs>
  );
}

describe('Tabs', () => {
  it('renders tabs and panels', () => {
    render(<TabsFixture />);
    expect(screen.getByRole('tablist')).toBeInTheDocument();
    expect(screen.getAllByRole('tab')).toHaveLength(2);
    expect(screen.getAllByRole('tabpanel')).toHaveLength(2);
  });

  it('shows the active panel based on initial value', () => {
    render(<TabsFixture defaultValue="one" />);
    const [tab1, tab2] = screen.getAllByRole('tab');
    expect(tab1).toHaveAttribute('aria-selected', 'true');
    expect(tab2).toHaveAttribute('aria-selected', 'false');
  });

  it('switches panel on tab click', async () => {
    const user = userEvent.setup();
    render(<TabsFixture defaultValue="one" />);
    await user.click(screen.getByRole('tab', { name: 'Tab 2' }));
    expect(screen.getByRole('tab', { name: 'Tab 2' })).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByRole('tab', { name: 'Tab 1' })).toHaveAttribute('aria-selected', 'false');
  });

  it('moves between tabs with ArrowRight/ArrowLeft, activating as focus lands', async () => {
    const user = userEvent.setup();
    render(<TabsFixture />);
    const [tab1, tab2] = screen.getAllByRole('tab');
    tab1!.focus();
    await user.keyboard('{ArrowRight}');
    expect(tab2).toHaveFocus();
    expect(tab2).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByText('Panel 2')).toBeVisible();
    await user.keyboard('{ArrowLeft}');
    expect(tab1!).toHaveFocus();
    expect(screen.getByText('Panel 1')).toBeVisible();
  });

  it('jumps to the ends with Home/End', async () => {
    const user = userEvent.setup();
    render(<TabsFixture />);
    const [tab1, tab2] = screen.getAllByRole('tab');
    tab1!.focus();
    await user.keyboard('{End}');
    expect(tab2).toHaveFocus();
    expect(screen.getByText('Panel 2')).toBeVisible();
    await user.keyboard('{Home}');
    expect(tab1!).toHaveFocus();
    expect(screen.getByText('Panel 1')).toBeVisible();
  });

  it('keeps exactly one tab stop: only the active tab is tabbable', () => {
    render(<TabsFixture />);
    const [tab1, tab2] = screen.getAllByRole('tab');
    expect(tab1).toHaveAttribute('tabindex', '0');
    expect(tab2).toHaveAttribute('tabindex', '-1');
  });

  it('applies className to Tabs root', () => {
    const { container } = render(
      <Tabs className="custom">
        <TabList><Tab value="a">A</Tab></TabList>
        <TabPanel value="a">Content</TabPanel>
      </Tabs>
    );
    expect(container.firstChild).toHaveClass('custom');
  });

  it('applies className to TabList', () => {
    render(
      <Tabs>
        <TabList className="list-custom"><Tab value="a">A</Tab></TabList>
        <TabPanel value="a">Content</TabPanel>
      </Tabs>
    );
    expect(screen.getByRole('tablist')).toHaveClass('list-custom');
  });

  it('throws when Tab is used outside Tabs', () => {
    expect(() => render(<Tab value="a">A</Tab>)).toThrow(
      'Tabs compound components must be used within <Tabs>'
    );
  });

  it('throws when TabPanel is used outside Tabs', () => {
    expect(() => render(<TabPanel value="a">Content</TabPanel>)).toThrow(
      'Tabs compound components must be used within <Tabs>'
    );
  });

  it('has no axe violations', async () => {
    const { axe } = await import('jest-axe');
    render(<TabsFixture />);
    const results = await axe(document.body, {
      rules: { region: { enabled: false } },
    });
    expect(results.violations).toEqual([]);
  });

  it('has no axe violations after switching to the second tab', async () => {
    const { axe } = await import('jest-axe');
    const user = userEvent.setup();
    render(<TabsFixture defaultValue="one" />);
    await user.click(screen.getByRole('tab', { name: 'Tab 2' }));
    expect(screen.getByRole('tab', { name: 'Tab 2' })).toHaveAttribute(
      'aria-selected',
      'true'
    );
    const results = await axe(document.body, {
      rules: { region: { enabled: false } },
    });
    expect(results.violations).toEqual([]);
  });
});

describe('Tabs classNames slots', () => {
  it('distributes root, list, tab and panel to every structural part', () => {
    const { container } = render(
      <Tabs
        value="one"
        classNames={{
          root: 't-root',
          list: 't-list',
          tab: 't-tab',
          panel: 't-panel',
        }}
      >
        <TabList>
          <Tab value="one">Tab 1</Tab>
          <Tab value="two">Tab 2</Tab>
        </TabList>
        <TabPanel value="one">Panel 1</TabPanel>
        <TabPanel value="two">Panel 2</TabPanel>
      </Tabs>
    );
    expect(container.firstChild).toHaveClass('t-root');
    expect(screen.getByRole('tablist')).toHaveClass('t-list');
    // one record themes every tab / every panel, not just the active one
    for (const tab of screen.getAllByRole('tab')) {
      expect(tab).toHaveClass('t-tab');
    }
    for (const panel of screen.getAllByRole('tabpanel')) {
      expect(panel).toHaveClass('t-panel');
    }
  });

  it('keeps the class lists untouched when classNames is omitted', () => {
    const { container } = render(<TabsFixture />);
    const parts = [
      container.firstChild as HTMLElement,
      screen.getByRole('tablist'),
      ...screen.getAllByRole('tab'),
      ...screen.getAllByRole('tabpanel'),
    ];
    for (const el of parts) {
      expect(el.className).toBe(el.className.trim());
      expect(el.className).not.toContain('  ');
    }
  });
});

// ---------------------------------------------------------------------------
// Document tabs: closable / icon / status on <Tab>
// ---------------------------------------------------------------------------

type DocTab = {
  value: string;
  label: string;
  icon?: ReactNode;
  status?: 'dirty' | 'error' | 'syncing';
  closable?: boolean;
};

function DocTabsFixture({
  tabs,
  defaultValue = 'one',
  onClose,
}: {
  tabs: DocTab[];
  defaultValue?: string;
  onClose?: (value: string) => void;
}) {
  return (
    <Tabs value={defaultValue}>
      <TabList>
        {tabs.map((tab) => (
          <Tab
            key={tab.value}
            value={tab.value}
            icon={tab.icon}
            status={tab.status}
            closable={tab.closable}
            onClose={onClose ? () => onClose(tab.value) : undefined}
          >
            {tab.label}
          </Tab>
        ))}
      </TabList>
      {tabs.map((tab) => (
        <TabPanel key={tab.value} value={tab.value}>
          Panel {tab.label}
        </TabPanel>
      ))}
    </Tabs>
  );
}

const docTabs: DocTab[] = [
  { value: 'one', label: 'Tab 1' },
  { value: 'two', label: 'Tab 2', closable: true },
  { value: 'three', label: 'Tab 3' },
];

describe('Tab document affordances', () => {
  it('renders the × only on closable tabs, inside the tab element', () => {
    render(<DocTabsFixture tabs={docTabs} />);
    expect(screen.getAllByRole('button', { name: 'Close' })).toHaveLength(1);
    const close = screen.getByRole('button', { name: 'Close' });
    // The × lives inside its tab (a div[role="tab"], since a button
    // cannot nest in the tab <button>), so the tablist owns nothing
    // but tabs — axe's aria-required-children contract.
    const tab = screen.getByRole('tab', { name: 'Tab 2' });
    expect(tab).toContainElement(close);
    const strip = screen.getByRole('tablist');
    for (const child of strip.children) {
      expect(child).toHaveAttribute('role', 'tab');
    }
  });

  it('clicking × calls onClose without selecting the tab', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(<DocTabsFixture tabs={docTabs} defaultValue="one" onClose={onClose} />);
    await user.click(screen.getByRole('button', { name: 'Close' }));
    expect(onClose).toHaveBeenCalledOnce();
    expect(onClose).toHaveBeenCalledWith('two');
    // purely notifying: the selection never follows a close click
    expect(screen.getByRole('tab', { name: 'Tab 2' })).toHaveAttribute(
      'aria-selected',
      'false'
    );
    expect(screen.getByText('Panel Tab 1')).toBeVisible();
  });

  it('keeps selection when the active tab is closed and the consumer does not remove it', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(<DocTabsFixture tabs={docTabs} defaultValue="two" onClose={onClose} />);
    await user.click(screen.getByRole('button', { name: 'Close' }));
    expect(onClose).toHaveBeenCalledWith('two');
    expect(screen.getByRole('tab', { name: 'Tab 2' })).toHaveAttribute(
      'aria-selected',
      'true'
    );
    expect(screen.getByText('Panel Tab 2')).toBeVisible();
  });

  it('supports a custom close label', () => {
    render(
      <Tabs value="one">
        <TabList>
          <Tab value="one" closable closeLabel="Close tab">One</Tab>
        </TabList>
        <TabPanel value="one">Content</TabPanel>
      </Tabs>
    );
    expect(screen.getByRole('button', { name: 'Close tab' })).toBeInTheDocument();
  });

  it('renders the icon slot as decorative', () => {
    render(
      <Tabs value="one">
        <TabList>
          <Tab value="one" icon={<svg data-testid="tab-icon" />}>One</Tab>
        </TabList>
        <TabPanel value="one">Content</TabPanel>
      </Tabs>
    );
    const slot = screen.getByTestId('tab-icon').closest('[data-slot="icon"]');
    expect(slot).toHaveAttribute('aria-hidden', 'true');
  });

  it('renders the status dot and appends the status word to the accessible name', () => {
    render(
      <Tabs value="one">
        <TabList>
          <Tab value="one" status="error">App.tsx</Tab>
        </TabList>
        <TabPanel value="one">Content</TabPanel>
      </Tabs>
    );
    const tab = screen.getByRole('tab', { name: /App\.tsx/i });
    expect(screen.getByRole('tab', { name: /App\.tsx.*Error/ })).toBe(tab);
    const dot = tab.querySelector('[data-slot="tab-status-dot"]');
    expect(dot).toHaveAttribute('aria-hidden', 'true');
  });

  it('lets statusLabel override the SR status word', () => {
    render(
      <Tabs value="one">
        <TabList>
          <Tab value="one" status="dirty" statusLabel="unsaved changes">Notes.md</Tab>
        </TabList>
        <TabPanel value="one">Content</TabPanel>
      </Tabs>
    );
    expect(
      screen.getByRole('tab', { name: /Notes\.md.*unsaved changes/ })
    ).toBeInTheDocument();
  });

  it('closes via Delete on the focused tab — the keyboard × equivalent', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(<DocTabsFixture tabs={docTabs} defaultValue="two" onClose={onClose} />);
    screen.getByRole('tab', { name: 'Tab 2' }).focus();
    await user.keyboard('{Delete}');
    expect(onClose).toHaveBeenCalledOnce();
    expect(onClose).toHaveBeenCalledWith('two');
    // notifying only: selection untouched
    expect(screen.getByRole('tab', { name: 'Tab 2' })).toHaveAttribute(
      'aria-selected',
      'true'
    );
  });

  it('activates a focused closable tab with Enter and Space', async () => {
    const user = userEvent.setup();
    render(<DocTabsFixture tabs={docTabs} defaultValue="one" />);
    const tab2 = screen.getByRole('tab', { name: 'Tab 2' });
    tab2.focus();
    await user.keyboard('{Enter}');
    expect(tab2).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByText('Panel Tab 2')).toBeVisible();
    await user.keyboard('{Space}');
    expect(tab2).toHaveAttribute('aria-selected', 'true');
  });

  it('has no axe violations with document affordances', async () => {
    const { axe } = await import('jest-axe');
    render(
      <DocTabsFixture
        tabs={[
          { value: 'one', label: 'Tab 1', icon: <svg data-testid="tab-icon" />, status: 'syncing', closable: true },
          { value: 'two', label: 'Tab 2', status: 'dirty' },
          { value: 'three', label: 'Tab 3' },
        ]}
      />
    );
    const results = await axe(document.body, {
      rules: { region: { enabled: false } },
    });
    expect(results.violations).toEqual([]);
  });
});

// ---------------------------------------------------------------------------
// TabList overflow: ⋯ menu when the strip runs out of room
// ---------------------------------------------------------------------------

describe('TabList overflow menu', () => {
  // jsdom 30 has neither layout nor a ResizeObserver: the width
  // getters are prototype-spied (scrollWidth/clientWidth fabricate the
  // overflow) and the observer records instances with a manual
  // `report` so tests can drive a resize — the DataTable/VirtualList
  // mock pattern.
  type ObserveCallback = (entries: ResizeObserverEntry[]) => void;

  const observers: MockResizeObserver[] = [];

  class MockResizeObserver {
    observed = new Set<Element>();

    constructor(private callback: ObserveCallback) {
      observers.push(this);
    }

    report(target: Element) {
      this.callback([{ target } as ResizeObserverEntry]);
    }

    observe(target: Element) {
      this.observed.add(target);
    }

    unobserve(target: Element) {
      this.observed.delete(target);
    }

    disconnect() {
      this.observed.clear();
    }
  }

  let scrollWidth = 0;
  let clientWidth = 0;

  beforeEach(() => {
    observers.length = 0;
    scrollWidth = 0;
    clientWidth = 0;
    vi.stubGlobal('ResizeObserver', MockResizeObserver);
    vi.spyOn(HTMLElement.prototype, 'scrollWidth', 'get').mockImplementation(
      () => scrollWidth
    );
    vi.spyOn(HTMLElement.prototype, 'clientWidth', 'get').mockImplementation(
      () => clientWidth
    );
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  const manyTabs: DocTab[] = [
    { value: 'one', label: 'Tab 1' },
    { value: 'two', label: 'Tab 2', status: 'error' },
    { value: 'three', label: 'Tab 3' },
  ];

  it('stays menu-less when the strip fits', () => {
    render(<DocTabsFixture tabs={manyTabs} />);
    expect(screen.queryByRole('button', { name: 'More tabs' })).toBeNull();
  });

  it('reveals the ⋯ button once the tabs overflow the strip', () => {
    scrollWidth = 600;
    clientWidth = 200;
    render(<DocTabsFixture tabs={manyTabs} />);
    expect(
      screen.getByRole('button', { name: 'More tabs' })
    ).toBeInTheDocument();
  });

  it('re-hides the ⋯ button when a resize makes the strip fit again', () => {
    scrollWidth = 600;
    clientWidth = 200;
    render(<DocTabsFixture tabs={manyTabs} />);
    expect(
      screen.getByRole('button', { name: 'More tabs' })
    ).toBeInTheDocument();
    scrollWidth = 200;
    act(() => {
      observers[0]!.report(screen.getByRole('tablist'));
    });
    expect(screen.queryByRole('button', { name: 'More tabs' })).toBeNull();
  });

  it('lists every tab in the menu and activates a pick, closing it', async () => {
    const user = userEvent.setup();
    scrollWidth = 600;
    clientWidth = 200;
    render(<DocTabsFixture tabs={manyTabs} defaultValue="one" />);
    await user.click(screen.getByRole('button', { name: 'More tabs' }));

    const items = screen.getAllByRole('menuitemradio');
    expect(items).toHaveLength(3);
    expect(screen.getByRole('menuitemradio', { name: 'Tab 1' })).toHaveAttribute(
      'aria-checked',
      'true'
    );
    expect(screen.getByRole('menuitemradio', { name: 'Tab 2' })).toHaveAttribute(
      'aria-checked',
      'false'
    );

    // A tab scrolled out of view stays selectable through the menu.
    await user.click(screen.getByRole('menuitemradio', { name: 'Tab 2' }));
    expect(screen.getByRole('tab', { name: /Tab 2/ })).toHaveAttribute(
      'aria-selected',
      'true'
    );
    expect(screen.getByText('Panel Tab 2')).toBeVisible();
    // jsdom applies no stylesheets, so the closed panel is asserted by
    // the hidden class handover (the floating.test idiom) — the exit
    // animation settles through two animation frames.
    const menu = screen.getByRole('menu');
    await waitFor(() => expect(menu).toHaveClass(floatingHidden));

    // Reopening reflects the new active tab on its radio.
    await user.click(screen.getByRole('button', { name: 'More tabs' }));
    expect(
      screen.getByRole('menuitemradio', { name: 'Tab 2' })
    ).toHaveAttribute('aria-checked', 'true');
    expect(
      screen.getByRole('menuitemradio', { name: 'Tab 1' })
    ).toHaveAttribute('aria-checked', 'false');
  });

  it('has no axe violations with the overflow menu open', async () => {
    const { axe } = await import('jest-axe');
    const user = userEvent.setup();
    scrollWidth = 600;
    clientWidth = 200;
    render(<DocTabsFixture tabs={manyTabs} defaultValue="one" />);
    await user.click(screen.getByRole('button', { name: 'More tabs' }));
    const results = await axe(document.body, {
      rules: { region: { enabled: false } },
    });
    expect(results.violations).toEqual([]);
  });
});

// ---------------------------------------------------------------------------
// Variants: line / card / pill strip skins (data-variant is the DOM handle;
// jsdom applies no stylesheets, so the skin swap is asserted by the class
// handover on the strip and the tabs)
// ---------------------------------------------------------------------------

describe('Tabs variants', () => {
  it('defaults to the line variant on the strip and every tab', () => {
    render(<TabsFixture />);
    expect(screen.getByRole('tablist')).toHaveAttribute('data-variant', 'line');
    for (const tab of screen.getAllByRole('tab')) {
      expect(tab).toHaveAttribute('data-variant', 'line');
    }
  });

  const assertVariantSwapsSkin = (variant: 'line' | 'card' | 'pill') => {
    const line = render(<TabsFixture />);
    const lineStrip = screen.getByRole('tablist').className;
    const lineTab = screen.getAllByRole('tab')[0]!.className;
    line.rerender(<TabsFixture variant={variant} />);
    expect(screen.getByRole('tablist')).toHaveAttribute('data-variant', variant);
    expect(screen.getByRole('tablist').className).not.toBe(lineStrip);
    const skinnedTab = screen.getAllByRole('tab')[0]!;
    expect(skinnedTab).toHaveAttribute('data-variant', variant);
    expect(skinnedTab.className).not.toBe(lineTab);
    line.unmount();
  };

  it('marks the card variant and swaps the strip/tab skin classes', () => {
    assertVariantSwapsSkin('card');
  });

  it('marks the pill variant and swaps the strip/tab skin classes', () => {
    assertVariantSwapsSkin('pill');
  });

  it('keeps roving selection working in every variant', async () => {
    for (const variant of ['line', 'card', 'pill'] as const) {
      const user = userEvent.setup();
      const { unmount } = render(<TabsFixture variant={variant} />);
      screen.getAllByRole('tab')[0]!.focus();
      await user.keyboard('{ArrowRight}');
      expect(screen.getAllByRole('tab')[1]).toHaveAttribute(
        'aria-selected',
        'true'
      );
      unmount();
    }
  });
});

// ---------------------------------------------------------------------------
// items: the data-driven rendering path (same TabList underneath)
// ---------------------------------------------------------------------------

const sampleItems: TabData[] = [
  { value: 'one', label: 'Item One', panel: 'Panel One' },
  { value: 'two', label: 'Item Two', panel: 'Panel Two' },
  { value: 'three', label: 'Item Three', disabled: true, panel: 'Panel Three' },
];

describe('Tabs items (data-driven)', () => {
  it('renders the tablist, tabs and panels from items', () => {
    render(<Tabs value="one" items={sampleItems} />);
    expect(screen.getByRole('tablist')).toBeInTheDocument();
    expect(screen.getAllByRole('tab')).toHaveLength(3);
    expect(screen.getAllByRole('tabpanel')).toHaveLength(3);
    expect(screen.getByRole('tab', { name: 'Item One' })).toHaveAttribute(
      'aria-selected',
      'true'
    );
    expect(screen.getByText('Panel One')).toBeVisible();
    // every panel renders — the tabs' aria-controls targets never dangle
    expect(screen.getByText('Panel Two')).toBeInTheDocument();
  });

  it('switches panels on tab click', async () => {
    const user = userEvent.setup();
    render(<Tabs value="one" items={sampleItems} />);
    await user.click(screen.getByRole('tab', { name: 'Item Two' }));
    expect(screen.getByRole('tab', { name: 'Item Two' })).toHaveAttribute(
      'aria-selected',
      'true'
    );
    expect(screen.getByText('Panel Two')).toBeVisible();
  });

  it('renders disabled items inert — no click selection, skipped by roving', async () => {
    const user = userEvent.setup();
    render(<Tabs value="one" items={sampleItems} />);
    const disabled = screen.getByRole('tab', { name: 'Item Three' });
    expect(disabled).toBeDisabled();
    await user.click(disabled);
    expect(disabled).toHaveAttribute('aria-selected', 'false');
    // the roving arrows skip the disabled tab: from tab two the wrap
    // lands back on tab one, never on three
    screen.getByRole('tab', { name: 'Item Two' }).focus();
    await user.keyboard('{ArrowRight}');
    expect(screen.getByRole('tab', { name: 'Item One' })).toHaveFocus();
  });

  it('forwards icon, status and closable affordances from item data', () => {
    render(
      <Tabs
        value="one"
        items={[
          {
            value: 'one',
            label: 'Item One',
            icon: <svg data-testid="item-icon" />,
            status: 'error',
            closable: true,
            panel: 'P1',
          },
        ]}
      />
    );
    const tab = screen.getByRole('tab', { name: /Item One.*Error/ });
    expect(tab).toContainElement(screen.getByTestId('item-icon'));
    expect(screen.getByRole('button', { name: 'Close' })).toBeInTheDocument();
  });

  it('errors in dev when items and children are both given — items win', () => {
    const error = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    try {
      render(
        <Tabs value="one" items={sampleItems}>
          <TabList>
            <Tab value="x">Compound</Tab>
          </TabList>
        </Tabs>
      );
      expect(error).toHaveBeenCalledTimes(1);
      expect(error.mock.calls[0]![0]).toContain('mutually exclusive');
      // the items path renders, the compound child does not
      expect(screen.getAllByRole('tab')).toHaveLength(3);
      expect(screen.queryByRole('tab', { name: 'Compound' })).toBeNull();
    } finally {
      error.mockRestore();
    }
  });

  it('has no axe violations with items, the pill variant and the add button', async () => {
    const { axe } = await import('jest-axe');
    render(
      <Tabs
        value="one"
        variant="pill"
        items={sampleItems}
        addable={{ onAdd: () => undefined }}
      />
    );
    const results = await axe(document.body, {
      rules: { region: { enabled: false } },
    });
    expect(results.violations).toEqual([]);
  });
});

// ---------------------------------------------------------------------------
// destroyInactiveTabPane: unmount vs keep-alive
// ---------------------------------------------------------------------------

describe('Tabs destroyInactiveTabPane', () => {
  it('keeps inactive panels mounted (hidden) by default', () => {
    render(<TabsFixture />);
    expect(screen.getByText('Panel 2')).toBeInTheDocument();
  });

  it('unmounts inactive panels and remounts them on return', async () => {
    const user = userEvent.setup();
    render(<TabsFixture destroyInactiveTabPane />);
    expect(screen.getByText('Panel 1')).toBeInTheDocument();
    expect(screen.queryByText('Panel 2')).toBeNull();
    expect(screen.getAllByRole('tabpanel')).toHaveLength(1);
    await user.click(screen.getByRole('tab', { name: 'Tab 2' }));
    expect(screen.getByText('Panel 2')).toBeInTheDocument();
    expect(screen.queryByText('Panel 1')).toBeNull();
    await user.click(screen.getByRole('tab', { name: 'Tab 1' }));
    expect(screen.getByText('Panel 1')).toBeInTheDocument();
    expect(screen.queryByText('Panel 2')).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// lazy: panels mount on first activation (then keep-alive or destroy
// per destroyInactiveTabPane) — items and compound paths alike
// ---------------------------------------------------------------------------

describe('Tabs lazy panels', () => {
  it('mounts only the initially active panel', () => {
    render(<TabsFixture lazy />);
    expect(screen.getByText('Panel 1')).toBeInTheDocument();
    expect(screen.queryByText('Panel 2')).toBeNull();
    expect(screen.getAllByRole('tabpanel')).toHaveLength(1);
  });

  it('mounts a panel on first activation and keeps it alive afterwards', async () => {
    const user = userEvent.setup();
    render(<TabsFixture lazy />);
    await user.click(screen.getByRole('tab', { name: 'Tab 2' }));
    expect(screen.getByText('Panel 2')).toBeInTheDocument();
    // panel 1 stays mounted (hidden) after its activation — the lazy
    // counterpart of the default keep-alive
    expect(screen.getByText('Panel 1')).toBeInTheDocument();
    expect(screen.getAllByRole('tabpanel')).toHaveLength(2);
    await user.click(screen.getByRole('tab', { name: 'Tab 1' }));
    expect(screen.getAllByRole('tabpanel')).toHaveLength(2);
  });

  it('preserves panel state across switches once a lazy panel has mounted', async () => {
    const user = userEvent.setup();
    render(
      <Tabs value="one" lazy>
        <TabList>
          <Tab value="one">Tab 1</Tab>
          <Tab value="two">Tab 2</Tab>
        </TabList>
        <TabPanel value="one">Panel 1</TabPanel>
        <TabPanel value="two">
          <input aria-label="second panel input" />
        </TabPanel>
      </Tabs>
    );
    // never activated: the input does not exist yet
    expect(screen.queryByLabelText('second panel input')).toBeNull();
    await user.click(screen.getByRole('tab', { name: 'Tab 2' }));
    await user.type(screen.getByLabelText('second panel input'), 'kept');
    await user.click(screen.getByRole('tab', { name: 'Tab 1' }));
    // activated once: the panel stays mounted (hidden) with its state
    expect(screen.getByLabelText('second panel input')).toBeInTheDocument();
    await user.click(screen.getByRole('tab', { name: 'Tab 2' }));
    expect(screen.getByLabelText('second panel input')).toHaveValue('kept');
  });

  it('combines with destroyInactiveTabPane: inactive panels unmount even after activation', async () => {
    const user = userEvent.setup();
    render(<TabsFixture lazy destroyInactiveTabPane />);
    expect(screen.queryByText('Panel 2')).toBeNull();
    await user.click(screen.getByRole('tab', { name: 'Tab 2' }));
    expect(screen.getByText('Panel 2')).toBeInTheDocument();
    expect(screen.queryByText('Panel 1')).toBeNull();
    await user.click(screen.getByRole('tab', { name: 'Tab 1' }));
    expect(screen.getByText('Panel 1')).toBeInTheDocument();
    expect(screen.queryByText('Panel 2')).toBeNull();
  });

  it('applies lazy to the items path', async () => {
    const user = userEvent.setup();
    render(<Tabs value="one" lazy items={sampleItems} />);
    expect(screen.getAllByRole('tabpanel')).toHaveLength(1);
    expect(screen.getByText('Panel One')).toBeInTheDocument();
    expect(screen.queryByText('Panel Two')).toBeNull();
    await user.click(screen.getByRole('tab', { name: 'Item Two' }));
    expect(screen.getByText('Panel Two')).toBeInTheDocument();
    // panel one stays mounted after its activation; the disabled tab
    // three was never activatable, so its panel never mounts
    expect(screen.getAllByRole('tabpanel')).toHaveLength(2);
    expect(screen.queryByText('Panel Three')).toBeNull();
  });

  it('has no axe violations with lazy panels', async () => {
    const { axe } = await import('jest-axe');
    render(<TabsFixture lazy />);
    const results = await axe(document.body, {
      rules: { region: { enabled: false } },
    });
    expect(results.violations).toEqual([]);
  });
});

// ---------------------------------------------------------------------------
// addable: the strip-tail + button
// ---------------------------------------------------------------------------

describe('Tabs addable', () => {
  it('renders the + button outside the tablist with the default name', () => {
    render(<TabsFixture addable={{ onAdd: () => undefined }} />);
    const add = screen.getByRole('button', { name: defaultStrings.tabs.addTab });
    expect(screen.getByRole('tablist')).not.toContainElement(add);
  });

  it('renders no + button when addable is omitted', () => {
    render(<TabsFixture />);
    expect(
      screen.queryByRole('button', { name: defaultStrings.tabs.addTab })
    ).toBeNull();
  });

  it('calls onAdd on click and Enter', async () => {
    const user = userEvent.setup();
    const onAdd = vi.fn();
    render(<TabsFixture addable={{ onAdd }} />);
    const add = screen.getByRole('button', { name: defaultStrings.tabs.addTab });
    await user.click(add);
    expect(onAdd).toHaveBeenCalledTimes(1);
    add.focus();
    await user.keyboard('{Enter}');
    expect(onAdd).toHaveBeenCalledTimes(2);
  });

  it('honors a custom addLabel', () => {
    render(
      <TabsFixture addable={{ onAdd: () => undefined, addLabel: 'New tab' }} />
    );
    expect(screen.getByRole('button', { name: 'New tab' })).toBeInTheDocument();
  });
});

describe('Tabs ref forwarding', () => {
  it('forwards the ref to the root container div', () => {
    const ref = createRef<HTMLDivElement>();
    render(
      <Tabs ref={ref} value="one">
        <TabList>
          <Tab value="one">Tab 1</Tab>
        </TabList>
        <TabPanel value="one">Panel 1</TabPanel>
      </Tabs>
    );
    expect(ref.current).toBeInstanceOf(HTMLDivElement);
    expect(ref.current).toHaveAttribute('data-slot', 'tabs');
  });

  it('forwards the ref on the items path too', () => {
    const ref = createRef<HTMLDivElement>();
    render(
      <Tabs
        ref={ref}
        value="one"
        items={[{ value: 'one', label: 'Tab 1', panel: 'Panel 1' }]}
      />
    );
    expect(ref.current).toBeInstanceOf(HTMLDivElement);
    expect(ref.current).toHaveAttribute('data-slot', 'tabs');
  });
});

describe('tabVariants / listVariants exports', () => {
  it('expose the per-variant tab and strip skin classes for composition', () => {
    expect(Object.keys(tabVariants)).toEqual(['line', 'card', 'pill']);
    expect(Object.keys(listVariants)).toEqual(['line', 'card', 'pill']);
    for (const skin of Object.values(tabVariants)) {
      for (const cls of [skin.idle, skin.active]) {
        expect(cls).toBeTruthy();
      }
    }
    for (const cls of Object.values(listVariants)) {
      expect(cls).toBeTruthy();
    }
  });

  it('are the exact classes the strip and its tabs wear', () => {
    render(<TabsFixture variant="card" />);
    expect(screen.getByRole('tablist')).toHaveClass(listVariants.card);
    const active = screen.getByRole('tab', { name: 'Tab 1' });
    expect(active).toHaveClass(tabVariants.card.idle);
    expect(active).toHaveClass(tabVariants.card.active);
    expect(screen.getByRole('tab', { name: 'Tab 2' })).toHaveClass(
      tabVariants.card.idle
    );
    expect(screen.getByRole('tab', { name: 'Tab 2' })).not.toHaveClass(
      tabVariants.card.active
    );
  });
});

describe('Tab as polymorphism', () => {
  it("as='a' renders a link-shaped tab: href/rest land on <a>, tablist wiring kept", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(
      <Tabs value="one">
        <TabList>
          <Tab as="a" href="/one" value="one" data-track="tab" onClick={onClick}>
            Tab 1
          </Tab>
          <Tab as="a" href="/two" value="two">
            Tab 2
          </Tab>
        </TabList>
        <TabPanel value="one">Panel 1</TabPanel>
        <TabPanel value="two">Panel 2</TabPanel>
      </Tabs>
    );
    const tab1 = screen.getByRole('tab', { name: 'Tab 1' });
    const tab2 = screen.getByRole('tab', { name: 'Tab 2' });
    // role="tab" wins over the link role — the tablist contract first
    expect(tab1.tagName).toBe('A');
    expect(tab1).toHaveAttribute('href', '/one');
    expect(tab1).toHaveAttribute('data-track', 'tab');
    // the button-only default is gated — anchors don't carry it
    expect(tab1).not.toHaveAttribute('type');
    // roving tabindex wiring follows the rendered element
    expect(tab1).toHaveAttribute('aria-selected', 'true');
    expect(tab1).toHaveAttribute('tabindex', '0');
    expect(tab2).toHaveAttribute('tabindex', '-1');

    // selection wiring + consumer click both fire on the anchor shape
    await user.click(tab2);
    expect(tab2).toHaveAttribute('aria-selected', 'true');
    await user.click(screen.getByRole('tab', { name: 'Tab 1' }));
    expect(onClick).toHaveBeenCalledOnce();
  });

  it("as='a' forwards ref to the anchor element", () => {
    const ref = createRef<HTMLAnchorElement>();
    render(
      <Tabs value="one">
        <TabList>
          <Tab as="a" href="/one" value="one" ref={ref}>
            Tab 1
          </Tab>
        </TabList>
      </Tabs>
    );
    expect(ref.current).toBeInstanceOf(HTMLAnchorElement);
  });

  it('default shape unchanged: native buttons with type="button"; closable tabs keep the div promotion', () => {
    render(
      <Tabs value="one">
        <TabList>
          <Tab value="one">Tab 1</Tab>
          <Tab value="two" closable>
            Tab 2
          </Tab>
        </TabList>
      </Tabs>
    );
    const tab1 = screen.getByRole('tab', { name: 'Tab 1' });
    const tab2 = screen.getByRole('tab', { name: 'Tab 2' });
    expect(tab1.tagName).toBe('BUTTON');
    expect(tab1).toHaveAttribute('type', 'button');
    // closable tabs keep the div[role="tab"] shape regardless of `as`
    expect(tab2.tagName).toBe('DIV');
  });
});
