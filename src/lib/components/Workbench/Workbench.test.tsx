import { expect } from 'vitest';

import { fireEvent, render, screen, cleanup } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useControl } from 'react-use-control';

import { Workbench } from './index';

function FullFixture() {
  return (
    <Workbench
      activityBar={<span>Rail</span>}
      sidebar={<p>Files</p>}
      auxiliaryBar={<p>Outline</p>}
      panel={<p>Terminal</p>}
      statusBar={<p>Status</p>}
      tabBar={<nav>Tab nav</nav>}
    >
      <h1>Editor</h1>
    </Workbench>
  );
}

/** Controlled harness exposing the sidebar width/collapsed controls, the
 * way a persistence layer or a hamburger toggle would drive them. */
function SidebarControlledFixture() {
  const [collapsed, setCollapsed, collapsedCtrl] = useControl(undefined, false);
  const [width, setWidth, widthCtrl] = useControl(undefined, 300);
  return (
    <>
      <Workbench
        sidebar={<p>Files</p>}
        sidebarCollapsed={collapsedCtrl}
        sidebarWidth={widthCtrl}
      >
        <h1>Editor</h1>
      </Workbench>
      <output data-testid="collapsed">{String(collapsed)}</output>
      <output data-testid="width">{String(width)}</output>
      <button type="button" onClick={() => setCollapsed((prev) => !prev)}>
        External flip
      </button>
      <button type="button" onClick={() => setWidth(420)}>
        External widen
      </button>
    </>
  );
}

function PanelMaximizedFixture() {
  const [, setMaximized, maximizedCtrl] = useControl(undefined, false);
  return (
    <>
      <Workbench panel={<p>Terminal</p>} panelMaximized={maximizedCtrl}>
        <h1>Editor</h1>
      </Workbench>
      <button type="button" onClick={() => setMaximized(true)}>
        Maximize
      </button>
      <button type="button" onClick={() => setMaximized(false)}>
        Restore
      </button>
    </>
  );
}

function rootEl(): HTMLElement {
  const el = document.querySelector<HTMLElement>("[data-slot='workbench']");
  if (el === null) throw new Error('workbench root not found');
  return el;
}

function slot(name: string): HTMLElement {
  const el = document.querySelector<HTMLElement>(`[data-slot='${name}']`);
  if (el === null) throw new Error(`slot ${name} not found`);
  return el;
}

function querySlot(name: string): HTMLElement | null {
  return document.querySelector<HTMLElement>(`[data-slot='${name}']`);
}

function panelEl(id: string): HTMLElement {
  const el = document.querySelector<HTMLElement>(`[data-panel-id='${id}']`);
  if (el === null) throw new Error(`panel ${id} not found`);
  return el;
}

function handleAt(index = 0): HTMLElement {
  const handles = Array.from(
    document.querySelectorAll<HTMLElement>("[data-slot='resizable-handle']")
  );
  const el = handles[index];
  if (el === undefined) throw new Error(`handle ${index} not found`);
  return el;
}

function handleCount(): number {
  return document.querySelectorAll("[data-slot='resizable-handle']").length;
}

/** The rendered size of a region panel — the inline flex basis, readable
 * in jsdom without layout. */
const basisOf = (id: string) => panelEl(id).style.flexBasis;

function drag(
  handle: HTMLElement,
  from: number,
  to: number,
  axis: 'x' | 'y' = 'x'
) {
  const start = axis === 'x' ? { clientX: from } : { clientY: from };
  const move = axis === 'x' ? { clientX: to } : { clientY: to };
  fireEvent.pointerDown(handle, { pointerId: 1, button: 0, ...start });
  fireEvent.pointerMove(handle, { pointerId: 1, ...move });
  fireEvent.pointerUp(handle, { pointerId: 1, ...move });
}

describe('Workbench', () => {
  it('renders every region under its data-slot with the slot content', () => {
    render(<FullFixture />);
    for (const name of [
      'workbench',
      'workbench-activity-bar',
      'workbench-sidebar',
      'workbench-main',
      'workbench-auxiliary-bar',
      'workbench-panel',
      'workbench-status-bar',
      'workbench-tab-bar',
      'workbench-scrim',
    ]) {
      expect(querySlot(name), name).not.toBeNull();
    }
    expect(slot('workbench-activity-bar')).toHaveTextContent('Rail');
    expect(slot('workbench-sidebar')).toHaveTextContent('Files');
    expect(slot('workbench-auxiliary-bar')).toHaveTextContent('Outline');
    expect(slot('workbench-panel')).toHaveTextContent('Terminal');
    expect(slot('workbench-status-bar')).toHaveTextContent('Status');
    expect(slot('workbench-tab-bar')).toHaveTextContent('Tab nav');
    // The editor area is the main landmark carrying children.
    expect(screen.getByRole('main')).toHaveTextContent('Editor');
  });

  it('collapses absent regions away entirely', () => {
    render(<Workbench>Content</Workbench>);
    for (const name of [
      'workbench-activity-bar',
      'workbench-sidebar',
      'workbench-auxiliary-bar',
      'workbench-panel',
      'workbench-status-bar',
      'workbench-tab-bar',
      'workbench-scrim',
    ]) {
      expect(querySlot(name), name).toBeNull();
    }
    expect(screen.getByRole('main')).toHaveTextContent('Content');
    expect(handleCount()).toBe(0);
  });

  it('renders one resize handle per present resizable neighbour', () => {
    render(<FullFixture />);
    expect(handleCount()).toBe(3);
    cleanup();
    render(
      <Workbench sidebar={<p>Files</p>}>
        <h1>Editor</h1>
      </Workbench>
    );
    expect(handleCount()).toBe(1);
    cleanup();
    render(
      <Workbench auxiliaryBar={<p>Outline</p>}>
        <h1>Editor</h1>
      </Workbench>
    );
    expect(handleCount()).toBe(1);
    cleanup();
    render(
      <Workbench panel={<p>Terminal</p>}>
        <h1>Editor</h1>
      </Workbench>
    );
    expect(handleCount()).toBe(1);
  });

  it('applies the default region sizes as flex bases and width variables', () => {
    render(<FullFixture />);
    expect(basisOf('sidebar')).toBe('300px');
    expect(basisOf('auxiliary')).toBe('300px');
    expect(basisOf('panel')).toBe('240px');
    expect(panelEl('sidebar').style.getPropertyValue('--haze-workbench-sidebar-width')).toBe(
      '300px'
    );
    expect(
      panelEl('auxiliary').style.getPropertyValue('--haze-workbench-auxiliary-width')
    ).toBe('300px');
  });

  it('honours a custom initial sidebarWidth', () => {
    render(
      <Workbench sidebar={<p>Files</p>} sidebarWidth={400}>
        <h1>Editor</h1>
      </Workbench>
    );
    expect(basisOf('sidebar')).toBe('400px');
    expect(
      panelEl('sidebar').style.getPropertyValue('--haze-workbench-sidebar-width')
    ).toBe('400px');
  });

  it('supports two-way controlled sidebarWidth via handle drags', async () => {
    const user = userEvent.setup();
    render(<SidebarControlledFixture />);
    expect(basisOf('sidebar')).toBe('300px');

    // Control → component: an external driver re-pins the column.
    await user.click(screen.getByRole('button', { name: 'External widen' }));
    expect(basisOf('sidebar')).toBe('420px');

    // Component → control: the drag commits into the width control.
    drag(handleAt(), 420, 480);
    expect(screen.getByTestId('width').textContent).toBe('480');
    expect(basisOf('sidebar')).toBe('480px');
  });

  it('supports two-way controlled sidebarCollapsed including the scrim', async () => {
    const user = userEvent.setup();
    render(<SidebarControlledFixture />);
    expect(screen.getByTestId('collapsed').textContent).toBe('false');
    expect(panelEl('sidebar')).not.toHaveAttribute('data-collapsed');

    // Scrim click (the mobile dismissal path) writes the shared control.
    fireEvent.click(slot('workbench-scrim'));
    expect(screen.getByTestId('collapsed').textContent).toBe('true');
    expect(panelEl('sidebar')).toHaveAttribute('data-collapsed');

    // External driver flips it back; the panel follows the same control.
    await user.click(screen.getByRole('button', { name: 'External flip' }));
    expect(screen.getByTestId('collapsed').textContent).toBe('false');
    expect(panelEl('sidebar')).not.toHaveAttribute('data-collapsed');

    // The handle's expander (Enter on a collapsed neighbour) also lands in
    // the shared control — one state source, three drivers.
    await user.click(screen.getByRole('button', { name: 'External flip' }));
    expect(screen.getByTestId('collapsed').textContent).toBe('true');
    expect(panelEl('sidebar')).toHaveAttribute('data-collapsed');
    fireEvent.keyDown(handleAt(), { key: 'Enter' });
    expect(screen.getByTestId('collapsed').textContent).toBe('false');
    expect(panelEl('sidebar')).not.toHaveAttribute('data-collapsed');
  });

  it('dismisses the sidebar through the scrim in uncontrolled mode', () => {
    render(
      <Workbench sidebar={<p>Files</p>}>
        <h1>Editor</h1>
      </Workbench>
    );
    fireEvent.click(slot('workbench-scrim'));
    expect(panelEl('sidebar')).toHaveAttribute('data-collapsed');
    expect(querySlot('workbench-scrim')).toBeNull();
  });

  it('renders one scrim per open overlay region and dismisses the auxiliary bar', () => {
    render(<FullFixture />);
    const scrims = document.querySelectorAll("[data-slot='workbench-scrim']");
    expect(scrims.length).toBe(2);
    fireEvent.click(scrims[1]!);
    expect(panelEl('auxiliary')).toHaveAttribute('data-collapsed');
  });

  it('maximizes the panel over the main column and restores it', async () => {
    const user = userEvent.setup();
    render(<PanelMaximizedFixture />);
    expect(querySlot('workbench-main')).not.toBeNull();
    expect(basisOf('panel')).toBe('240px');

    await user.click(screen.getByRole('button', { name: 'Maximize' }));
    expect(rootEl()).toHaveAttribute('data-panel-maximized', 'true');
    expect(querySlot('workbench-main')).toBeNull();
    expect(panelEl('panel').style.flexGrow).toBe('1');
    expect(panelEl('panel').style.flexBasis).toBe('0px');

    await user.click(screen.getByRole('button', { name: 'Restore' }));
    expect(rootEl()).not.toHaveAttribute('data-panel-maximized');
    expect(querySlot('workbench-main')).not.toBeNull();
    expect(basisOf('panel')).toBe('240px');
  });

  it('treats a plain panelMaximized boolean as the uncontrolled initial value', () => {
    render(
      <Workbench panel={<p>Terminal</p>} panelMaximized>
        <h1>Editor</h1>
      </Workbench>
    );
    expect(rootEl()).toHaveAttribute('data-panel-maximized', 'true');
    expect(querySlot('workbench-main')).toBeNull();
    expect(panelEl('panel').style.flexGrow).toBe('1');
  });

  it('feeds panel height drags back into the panelHeight control', () => {
    const { rerender } = render(
      <Workbench panel={<p>Terminal</p>} panelHeight={200}>
        <h1>Editor</h1>
      </Workbench>
    );
    expect(basisOf('panel')).toBe('200px');
    // The handle sits above the panel: dragging up (320 → 200) grows it.
    drag(handleAt(), 320, 200, 'y');
    expect(basisOf('panel')).toBe('320px');
    // The committed size survives as the new default across rerenders.
    rerender(
      <Workbench panel={<p>Terminal</p>} panelHeight={200}>
        <h1>Editor</h1>
      </Workbench>
    );
    expect(basisOf('panel')).toBe('320px');
  });

  it('keeps the tabBar slot a mobile-only region distinct from the status bar', () => {
    render(<FullFixture />);
    const tabBar = slot('workbench-tab-bar');
    // jsdom cannot evaluate the breakpoint media queries, so the
    // mobile-only behaviour is asserted structurally: the slot renders
    // with its own (display-toggling) class hook, unlike the always-on
    // status bar region.
    expect(tabBar.className).not.toBe('');
    expect(tabBar.className).not.toBe(slot('workbench-status-bar').className);
    expect(slot('workbench-scrim').className).not.toBe('');
    expect(slot('workbench-tab-bar')).toContainElement(
      screen.getByRole('navigation')
    );
  });

  it('sets the shell height to 100dvh inline', () => {
    render(<FullFixture />);
    expect(rootEl().getAttribute('style')).toContain('100dvh');
  });

  it('merges className and consumer style onto the shell root', () => {
    render(
      <Workbench className="custom-workbench" style={{ background: 'red' }} data-testid="wb">
        <h1>Editor</h1>
      </Workbench>
    );
    const root = screen.getByTestId('wb');
    expect(root).toHaveClass('custom-workbench');
    expect(root.style.background).toBe('red');
    expect(root.getAttribute('style')).toContain('100dvh');
  });

  it('forwards native div props to the shell root', () => {
    render(
      <Workbench id="workbench-root" lang="en">
        <h1>Editor</h1>
      </Workbench>
    );
    expect(rootEl()).toHaveAttribute('id', 'workbench-root');
    expect(rootEl()).toHaveAttribute('lang', 'en');
  });

  it('has no axe violations with every slot present', async () => {
    const { axe } = await import('jest-axe');
    render(<FullFixture />);
    const results = await axe(document.body, {
      rules: { region: { enabled: false } },
    });
    expect(results.violations).toEqual([]);
  });

  it('has no axe violations with collapsed overlays and a maximized panel', async () => {
    const { axe } = await import('jest-axe');
    render(
      <Workbench
        sidebar={<p>Files</p>}
        auxiliaryBar={<p>Outline</p>}
        panel={<p>Terminal</p>}
        sidebarCollapsed
        auxiliaryBarCollapsed
        panelMaximized
      >
        <h1>Editor</h1>
      </Workbench>
    );
    const results = await axe(document.body, {
      rules: { region: { enabled: false } },
    });
    expect(results.violations).toEqual([]);
  });
});
