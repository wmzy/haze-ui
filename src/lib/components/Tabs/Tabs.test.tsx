import type { ReactNode } from 'react';

import { expect, vi } from 'vitest';
import { act, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { floatingHidden } from '../../utils/floating';

import Tabs from './Tabs';
import TabList from './TabList';
import Tab from './Tab';
import TabPanel from './TabPanel';


function TabsFixture({ defaultValue = 'one' }: { defaultValue?: string }) {
  return (
    <Tabs value={defaultValue}>
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
