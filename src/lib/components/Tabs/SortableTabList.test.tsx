import { useState } from 'react';

import { expect } from 'vitest';

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import SortableTabList from './SortableTabList';
import Tab from './Tab';
import TabPanel from './TabPanel';
import Tabs from './Tabs';

type FixtureTab = { value: string; label: string };

function SortableTabsFixture({
  tabs,
  defaultValue = 'one',
  onReorder,
}: {
  tabs: FixtureTab[];
  defaultValue?: string;
  onReorder?: (nextOrder: number[]) => void;
}) {
  const [order, setOrder] = useState(tabs.map((_, index) => index));
  return (
    <Tabs value={defaultValue}>
      <SortableTabList
        onReorder={(nextOrder) => {
          setOrder(nextOrder);
          onReorder?.(nextOrder);
        }}
      >
        {order.map((index) => {
          const tab = tabs[index]!;
          return (
            <Tab key={tab.value} value={tab.value}>
              {tab.label}
            </Tab>
          );
        })}
      </SortableTabList>
      {tabs.map((tab) => (
        <TabPanel key={tab.value} value={tab.value}>
          Panel {tab.label}
        </TabPanel>
      ))}
    </Tabs>
  );
}

describe('SortableTabList', () => {
  const plainTabs = [
    { value: 'one', label: 'Tab 1' },
    { value: 'two', label: 'Tab 2' },
    { value: 'three', label: 'Tab 3' },
  ];

  /** jsdom rects are all 0×0 at (0,0) and dnd-kit's sortable keyboard
   * coordinate getter snaps onto neighbors by rect geometry — every tab
   * wrapper needs a distinct rect before a keyboard drag can walk the
   * strip. */
  const giveTabsDistinctRects = () => {
    screen.getByRole('tablist').querySelectorAll(':scope > span').forEach((tab, index) => {
      const left = index * 120;
      tab.getBoundingClientRect = () =>
        ({
          x: left,
          y: 0,
          top: 0,
          left,
          right: left + 100,
          bottom: 32,
          width: 100,
          height: 32,
          toJSON: () => ({}),
        });
    });
  };

  it('reorders tabs through the full keyboard flow (lift → move → drop)', async () => {
    const user = userEvent.setup();
    render(<SortableTabsFixture tabs={plainTabs} />);
    giveTabsDistinctRects();
    screen.getByRole('tab', { name: 'Tab 1' }).focus();
    await user.keyboard(' '); // lift 'Tab 1'
    await user.keyboard('{ArrowRight}'); // over 'Tab 2'
    await user.keyboard('{ArrowRight}'); // over 'Tab 3'
    await user.keyboard(' '); // drop
    expect(screen.getAllByRole('tab').map((tab) => tab.textContent)).toEqual([
      'Tab 2',
      'Tab 3',
      'Tab 1',
    ]);
  });

  it('reports the index permutation via onReorder', async () => {
    const user = userEvent.setup();
    const onReorder = vi.fn();
    render(
      <Tabs value="one">
        <SortableTabList onReorder={onReorder}>
          <Tab value="one">Tab 1</Tab>
          <Tab value="two">Tab 2</Tab>
          <Tab value="three">Tab 3</Tab>
        </SortableTabList>
      </Tabs>,
    );
    giveTabsDistinctRects();
    screen.getByRole('tab', { name: 'Tab 2' }).focus();
    await user.keyboard(' {ArrowLeft} ');
    expect(onReorder).toHaveBeenCalledWith([1, 0, 2]);
  });

  it('does not call onReorder when the drag is cancelled with Escape', async () => {
    const user = userEvent.setup();
    const onReorder = vi.fn();
    render(
      <Tabs value="one">
        <SortableTabList onReorder={onReorder}>
          <Tab value="one">Tab 1</Tab>
          <Tab value="two">Tab 2</Tab>
        </SortableTabList>
      </Tabs>,
    );
    giveTabsDistinctRects();
    screen.getByRole('tab', { name: 'Tab 1' }).focus();
    await user.keyboard(' {ArrowRight}{Escape}');
    expect(onReorder).not.toHaveBeenCalled();
  });

  it('keeps the selection on its tab (not its index) through a completed drag', async () => {
    const user = userEvent.setup();
    render(<SortableTabsFixture tabs={plainTabs} defaultValue="one" />);
    giveTabsDistinctRects();
    // Drag the inactive 'Tab 2' before 'Tab 1' — the walk arrows move
    // focus (selection follows focus in the strip's model), so the
    // invariant under test is the end state: 'Tab 1' stays selected
    // even though it is no longer the first tab, and the dragged tab
    // never steals the selection.
    screen.getByRole('tab', { name: 'Tab 2' }).focus();
    await user.keyboard(' {ArrowLeft} ');
    expect(screen.getAllByRole('tab').map((tab) => tab.textContent)).toEqual([
      'Tab 2',
      'Tab 1',
      'Tab 3',
    ]);
    const selected = screen.getByRole('tab', { name: 'Tab 1' });
    expect(selected).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByRole('tab', { name: 'Tab 2' })).toHaveAttribute(
      'aria-selected',
      'false',
    );
  });

  it('keeps the tablist roving model when not dragging', async () => {
    const user = userEvent.setup();
    render(<SortableTabsFixture tabs={plainTabs} />);
    screen.getByRole('tab', { name: 'Tab 1' }).focus();
    await user.keyboard('{ArrowRight}');
    const next = screen.getByRole('tab', { name: 'Tab 2' });
    expect(next).toHaveFocus();
    expect(next).toHaveAttribute('aria-selected', 'true');
    expect(next).toHaveAttribute('tabindex', '0');
  });

  it('lifts and reorders a closable tab; Delete still closes it', async () => {
    const user = userEvent.setup();
    const onReorder = vi.fn();
    const onClose = vi.fn();
    render(
      <Tabs value="two">
        <SortableTabList onReorder={onReorder}>
          <Tab value="one">Tab 1</Tab>
          <Tab value="two" closable onClose={onClose}>
            Tab 2
          </Tab>
          <Tab value="three">Tab 3</Tab>
        </SortableTabList>
      </Tabs>,
    );
    giveTabsDistinctRects();
    // Space on the closable tab lifts the drag (capture-phase activator
    // wins over the tab's own Space→select translation)…
    screen.getByRole('tab', { name: 'Tab 2' }).focus();
    await user.keyboard(' {ArrowRight} ');
    expect(onReorder).toHaveBeenCalledWith([0, 2, 1]);
    // …while Delete still reaches the tab's own keymap untouched (the
    // walk moved focus to the next tab — dnd restores it to the dragged
    // node asynchronously, so focus it back deterministically).
    screen.getByRole('tab', { name: 'Tab 2' }).focus();
    await user.keyboard('{Delete}');
    expect(onClose).toHaveBeenCalledOnce();
  });

  it('renders closable and status affordances inside the sortable wrappers', () => {
    render(
      <Tabs value="one">
        <SortableTabList>
          <Tab value="one" status="syncing">
            Tab 1
          </Tab>
          <Tab value="two" closable>
            Tab 2
          </Tab>
        </SortableTabList>
        <TabPanel value="one">Panel 1</TabPanel>
        <TabPanel value="two">Panel 2</TabPanel>
      </Tabs>,
    );
    // The × stays a real control inside its (div) tab, the status dot
    // stays a decorative slot inside the active tab — both nested in
    // the sortable wrapper spans the variant adds.
    const close = screen.getByRole('button', { name: 'Close' });
    expect(screen.getByRole('tab', { name: 'Tab 2' })).toContainElement(close);
    expect(screen.getByRole('tab', { name: /Tab 1.*Syncing/ })).toContainElement(
      document.querySelector("[data-slot='tab-status-dot']"),
    );
    for (const wrapper of screen.getByRole('tablist').children) {
      expect(wrapper).toHaveAttribute('data-slot', 'sortable-tab');
    }
  });

  it('has no axe violations', async () => {
    const { axe } = await import('jest-axe');
    render(
      <Tabs value="one">
        <SortableTabList onReorder={() => undefined}>
          <Tab value="one" status="dirty">
            Tab 1
          </Tab>
          <Tab value="two" closable onClose={() => undefined}>
            Tab 2
          </Tab>
        </SortableTabList>
        <TabPanel value="one">Panel 1</TabPanel>
        <TabPanel value="two">Panel 2</TabPanel>
      </Tabs>,
    );
    const results = await axe(document.body, {
      rules: { region: { enabled: false } },
    });
    expect(results.violations).toEqual([]);
  });
});
