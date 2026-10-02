import { expect, vi } from 'vitest';

import { fireEvent, render, screen } from '@testing-library/react';
import { useControl } from 'react-use-control';

import {
  ResizableGroup,
  ResizablePanel,
  ResizableHandle,
} from './index';

function panelEl(id: string): HTMLElement {
  const el = document.querySelector<HTMLElement>(
    `[data-panel-id='${id}']`
  );
  if (el === null) throw new Error(`panel ${id} not found`);
  return el;
}

function handleAt(index = 0): HTMLElement {
  const handles = Array.from(
    document.querySelectorAll<HTMLElement>(
      "[data-slot='resizable-handle']"
    )
  );
  const el = handles[index];
  if (el === undefined) throw new Error(`handle ${index} not found`);
  return el;
}

/** The rendered size of a panel — the inline flex basis the component
 * controls, readable in jsdom without layout. */
const basisOf = (id: string) => panelEl(id).style.flexBasis;

function drag(handle: HTMLElement, from: number, to: number, axis: 'x' | 'y' = 'x') {
  const start = axis === 'x' ? { clientX: from } : { clientY: from };
  const move = axis === 'x' ? { clientX: to } : { clientY: to };
  fireEvent.pointerDown(handle, { pointerId: 1, button: 0, ...start });
  fireEvent.pointerMove(handle, { pointerId: 1, ...move });
  fireEvent.pointerUp(handle, { pointerId: 1, ...move });
}

describe('Resizable rendering', () => {
  it('renders group, panels and handle with data-slot semantics', () => {
    render(
      <ResizableGroup>
        <ResizablePanel id="a" defaultSize={300}>A</ResizablePanel>
        <ResizableHandle />
        <ResizablePanel id="b">B</ResizablePanel>
      </ResizableGroup>
    );
    expect(
      document.querySelectorAll("[data-slot='resizable-group']")
    ).toHaveLength(1);
    expect(
      document.querySelectorAll("[data-slot='resizable-panel']")
    ).toHaveLength(2);
    expect(
      document.querySelectorAll("[data-slot='resizable-handle']")
    ).toHaveLength(1);
  });

  it('applies className and style to all three parts', () => {
    render(
      <ResizableGroup className="group-extra" style={{ height: '400px' }}>
        <ResizablePanel id="a" defaultSize={300} className="panel-extra">
          A
        </ResizablePanel>
        <ResizableHandle className="handle-extra" />
        <ResizablePanel id="b">B</ResizablePanel>
      </ResizableGroup>
    );
    const group = document.querySelector<HTMLElement>(
      "[data-slot='resizable-group']"
    );
    expect(group).toHaveClass('group-extra');
    expect(group?.style.height).toBe('400px');
    expect(panelEl('a')).toHaveClass('panel-extra');
    expect(handleAt()).toHaveClass('handle-extra');
  });

  it('renders fixed panels at their default px size; flexible panels grow', () => {
    render(
      <ResizableGroup>
        <ResizablePanel id="a" defaultSize={300}>A</ResizablePanel>
        <ResizableHandle />
        <ResizablePanel id="b">B</ResizablePanel>
      </ResizableGroup>
    );
    expect(basisOf('a')).toBe('300px');
    expect(panelEl('a').style.flexGrow).toBe('0');
    expect(basisOf('b')).toBe('0px');
    expect(panelEl('b').style.flexGrow).toBe('1');
  });

  it('forwards rest props from the panel and handle', () => {
    render(
      <ResizableGroup>
        <ResizablePanel id="a" defaultSize={300} title="Left panel">
          A
        </ResizablePanel>
        <ResizableHandle data-testid="grip" aria-label="Resize" />
        <ResizablePanel id="b">B</ResizablePanel>
      </ResizableGroup>
    );
    expect(panelEl('a')).toHaveAttribute('title', 'Left panel');
    expect(screen.getByTestId('grip')).toHaveAttribute(
      'aria-label',
      'Resize'
    );
  });

  it('throws when sub-components are used outside a group', () => {
    expect(() => render(<ResizablePanel id="a">A</ResizablePanel>)).toThrow(
      'Resizable sub-components must be used within <ResizableGroup>'
    );
    expect(() => render(<ResizableHandle />)).toThrow(
      'Resizable sub-components must be used within <ResizableGroup>'
    );
  });
});

describe('Resizable pointer resizing', () => {
  it('trades px between the two adjacent fixed panels and commits on release', () => {
    const onResizeCommit = vi.fn();
    render(
      <ResizableGroup onResizeCommit={onResizeCommit}>
        <ResizablePanel id="a" defaultSize={300}>A</ResizablePanel>
        <ResizableHandle />
        <ResizablePanel id="b" defaultSize={300}>B</ResizablePanel>
      </ResizableGroup>
    );
    drag(handleAt(), 400, 440);
    expect(basisOf('a')).toBe('340px');
    expect(basisOf('b')).toBe('260px');
    expect(onResizeCommit).toHaveBeenCalledOnce();
    expect(onResizeCommit).toHaveBeenCalledWith({ a: 340, b: 260 });
  });

  it('resizes only the fixed side when the neighbour is flexible', () => {
    render(
      <ResizableGroup>
        <ResizablePanel id="a" defaultSize={300}>A</ResizablePanel>
        <ResizableHandle />
        <ResizablePanel id="b">B</ResizablePanel>
      </ResizableGroup>
    );
    drag(handleAt(), 400, 460);
    expect(basisOf('a')).toBe('360px');
    expect(panelEl('b').style.flexGrow).toBe('1');
  });

  it('pins pointer drags at minSize and maxSize', () => {
    render(
      <ResizableGroup>
        <ResizablePanel id="a" defaultSize={300} minSize={100} maxSize={500}>
          A
        </ResizablePanel>
        <ResizableHandle />
        <ResizablePanel id="b" defaultSize={300}>B</ResizablePanel>
      </ResizableGroup>
    );
    drag(handleAt(), 400, 0); // -400 → clamped at min
    expect(basisOf('a')).toBe('100px');
    expect(basisOf('b')).toBe('500px');
    drag(handleAt(), 400, 1000); // +600 → clamped at max
    expect(basisOf('a')).toBe('500px');
    expect(basisOf('b')).toBe('100px');
  });

  it('resizes vertically with clientY in vertical groups', () => {
    render(
      <ResizableGroup direction="vertical">
        <ResizablePanel id="a" defaultSize={200}>A</ResizablePanel>
        <ResizableHandle />
        <ResizablePanel id="b" defaultSize={200}>B</ResizablePanel>
      </ResizableGroup>
    );
    drag(handleAt(), 100, 150, 'y');
    expect(basisOf('a')).toBe('250px');
    expect(basisOf('b')).toBe('150px');
  });

  it('does not commit when the drag never moved', () => {
    const onResizeCommit = vi.fn();
    render(
      <ResizableGroup onResizeCommit={onResizeCommit}>
        <ResizablePanel id="a" defaultSize={300}>A</ResizablePanel>
        <ResizableHandle />
        <ResizablePanel id="b" defaultSize={300}>B</ResizablePanel>
      </ResizableGroup>
    );
    const handle = handleAt();
    fireEvent.pointerDown(handle, { pointerId: 1, button: 0, clientX: 400 });
    fireEvent.pointerUp(handle, { pointerId: 1, clientX: 400 });
    expect(onResizeCommit).not.toHaveBeenCalled();
  });

  it('pointercancel aborts the gesture without committing and ends the drag', () => {
    const onResizeCommit = vi.fn();
    render(
      <ResizableGroup onResizeCommit={onResizeCommit}>
        <ResizablePanel id="a" defaultSize={300}>A</ResizablePanel>
        <ResizableHandle />
        <ResizablePanel id="b" defaultSize={300}>B</ResizablePanel>
      </ResizableGroup>
    );
    const handle = handleAt();
    fireEvent.pointerDown(handle, { pointerId: 1, button: 0, clientX: 400 });
    fireEvent.pointerMove(handle, { pointerId: 1, clientX: 440 });
    expect(basisOf('a')).toBe('340px');
    // testing-library has no pointercancel helper — dispatch it natively.
    fireEvent(
      handle,
      new PointerEvent('pointercancel', { pointerId: 1, bubbles: true })
    );
    expect(onResizeCommit).not.toHaveBeenCalled();
    // The gesture is over: late moves must not resize anything.
    fireEvent.pointerMove(handle, { pointerId: 1, clientX: 600 });
    expect(basisOf('a')).toBe('340px');
  });
});

describe('Resizable keyboard resizing (WCAG 2.5.7)', () => {
  it('is a focusable separator reporting orientation and the leading panel px', () => {
    render(
      <ResizableGroup>
        <ResizablePanel id="a" defaultSize={300} minSize={120} maxSize={480}>
          A
        </ResizablePanel>
        <ResizableHandle />
        <ResizablePanel id="b">B</ResizablePanel>
      </ResizableGroup>
    );
    const handle = screen.getByRole('separator');
    expect(handle).toHaveAttribute('tabindex', '0');
    // Horizontal group = vertical grip bar (its own physical orientation).
    expect(handle).toHaveAttribute('aria-orientation', 'vertical');
    expect(handle).toHaveAttribute('aria-valuenow', '300');
    expect(handle).toHaveAttribute('aria-valuemin', '120');
    expect(handle).toHaveAttribute('aria-valuemax', '480');
  });

  it('vertical groups report a horizontal grip and resize with ArrowDown/ArrowUp', () => {
    render(
      <ResizableGroup direction="vertical">
        <ResizablePanel id="a" defaultSize={200}>A</ResizablePanel>
        <ResizableHandle />
        <ResizablePanel id="b" defaultSize={200}>B</ResizablePanel>
      </ResizableGroup>
    );
    const handle = screen.getByRole('separator');
    expect(handle).toHaveAttribute('aria-orientation', 'horizontal');
    fireEvent.keyDown(handle, { key: 'ArrowDown' });
    expect(basisOf('a')).toBe('216px');
    fireEvent.keyDown(handle, { key: 'ArrowUp' });
    expect(basisOf('a')).toBe('200px');
  });

  it('steps 16px per arrow press and accumulates across presses', () => {
    render(
      <ResizableGroup>
        <ResizablePanel id="a" defaultSize={300}>A</ResizablePanel>
        <ResizableHandle />
        <ResizablePanel id="b" defaultSize={300}>B</ResizablePanel>
      </ResizableGroup>
    );
    const handle = handleAt();
    fireEvent.keyDown(handle, { key: 'ArrowRight' });
    fireEvent.keyDown(handle, { key: 'ArrowRight' });
    expect(basisOf('a')).toBe('332px');
    fireEvent.keyDown(handle, { key: 'ArrowLeft' });
    expect(basisOf('a')).toBe('316px');
  });

  it('keeps the pair sum constant between two fixed panels', () => {
    render(
      <ResizableGroup>
        <ResizablePanel id="a" defaultSize={300}>A</ResizablePanel>
        <ResizableHandle />
        <ResizablePanel id="b" defaultSize={300}>B</ResizablePanel>
      </ResizableGroup>
    );
    fireEvent.keyDown(handleAt(), { key: 'ArrowRight' });
    expect(basisOf('a')).toBe('316px');
    expect(basisOf('b')).toBe('284px');
  });

  it('resizes only the fixed side when the neighbour is flexible', () => {
    render(
      <ResizableGroup>
        <ResizablePanel id="a">A</ResizablePanel>
        <ResizableHandle />
        <ResizablePanel id="b" defaultSize={300}>B</ResizablePanel>
      </ResizableGroup>
    );
    fireEvent.keyDown(handleAt(), { key: 'ArrowRight' });
    expect(basisOf('b')).toBe('284px');
    expect(panelEl('a').style.flexGrow).toBe('1');
  });

  it('pins keyboard steps at minSize and maxSize', () => {
    render(
      <ResizableGroup>
        <ResizablePanel id="a" defaultSize={300} minSize={280} maxSize={330}>
          A
        </ResizablePanel>
        <ResizableHandle />
        <ResizablePanel id="b" defaultSize={300} minSize={280}>
          B
        </ResizablePanel>
      </ResizableGroup>
    );
    const handle = handleAt();
    for (let i = 0; i < 10; i += 1) {
      fireEvent.keyDown(handle, { key: 'ArrowRight' });
    }
    // a would reach 460 unclamped; pair pin (b ≥ 280) binds it to 320.
    expect(basisOf('a')).toBe('320px');
    for (let i = 0; i < 10; i += 1) {
      fireEvent.keyDown(handle, { key: 'ArrowLeft' });
    }
    expect(basisOf('a')).toBe('280px');
  });

  it('Home/End park the leading panel at its pins', () => {
    render(
      <ResizableGroup>
        <ResizablePanel id="a" defaultSize={300} minSize={120}>
          A
        </ResizablePanel>
        <ResizableHandle />
        <ResizablePanel id="b" defaultSize={300} minSize={150}>
          B
        </ResizablePanel>
      </ResizableGroup>
    );
    const handle = handleAt();
    fireEvent.keyDown(handle, { key: 'Home' });
    expect(basisOf('a')).toBe('120px');
    fireEvent.keyDown(handle, { key: 'End' });
    // End is pair-bounded: b keeps its 150px minimum.
    expect(basisOf('a')).toBe('450px');
    expect(basisOf('b')).toBe('150px');
  });

  it('commits the full fixed-panel record after each keyboard change', () => {
    const onResizeCommit = vi.fn();
    render(
      <ResizableGroup onResizeCommit={onResizeCommit}>
        <ResizablePanel id="a" defaultSize={300}>A</ResizablePanel>
        <ResizableHandle />
        <ResizablePanel id="b">B</ResizablePanel>
        <ResizableHandle />
        <ResizablePanel id="c" defaultSize={200}>C</ResizablePanel>
      </ResizableGroup>
    );
    fireEvent.keyDown(handleAt(0), { key: 'ArrowRight' });
    expect(onResizeCommit).toHaveBeenCalledTimes(1);
    // Flexible b is not part of the payload — only explicitly sized panels.
    expect(onResizeCommit).toHaveBeenCalledWith({ a: 316, c: 200 });
  });

  it('leaves unhandled keys to the platform', () => {
    render(
      <ResizableGroup>
        <ResizablePanel id="a" defaultSize={300}>A</ResizablePanel>
        <ResizableHandle />
        <ResizablePanel id="b" defaultSize={300}>B</ResizablePanel>
      </ResizableGroup>
    );
    const handle = handleAt();
    const event = fireEvent.keyDown(handle, { key: 'a' });
    expect(event).toBe(true);
    expect(basisOf('a')).toBe('300px');
  });
});

describe('Resizable reset', () => {
  it('double-click resets the adjacent fixed panels to defaultSize and commits', () => {
    const onResizeCommit = vi.fn();
    render(
      <ResizableGroup onResizeCommit={onResizeCommit}>
        <ResizablePanel id="a" defaultSize={300}>A</ResizablePanel>
        <ResizableHandle />
        <ResizablePanel id="b" defaultSize={300}>B</ResizablePanel>
      </ResizableGroup>
    );
    drag(handleAt(), 400, 460);
    expect(basisOf('a')).toBe('360px');
    fireEvent.doubleClick(handleAt());
    expect(basisOf('a')).toBe('300px');
    expect(basisOf('b')).toBe('300px');
    expect(onResizeCommit).toHaveBeenLastCalledWith({ a: 300, b: 300 });
  });

  it('Enter resets like double-click', () => {
    render(
      <ResizableGroup>
        <ResizablePanel id="a" defaultSize={300}>A</ResizablePanel>
        <ResizableHandle />
        <ResizablePanel id="b" defaultSize={300}>B</ResizablePanel>
      </ResizableGroup>
    );
    drag(handleAt(), 400, 460);
    fireEvent.keyDown(handleAt(), { key: 'Enter' });
    expect(basisOf('a')).toBe('300px');
    expect(basisOf('b')).toBe('300px');
  });

  it('a reset with nothing to restore does not commit', () => {
    const onResizeCommit = vi.fn();
    render(
      <ResizableGroup onResizeCommit={onResizeCommit}>
        <ResizablePanel id="a" defaultSize={300}>A</ResizablePanel>
        <ResizableHandle />
        <ResizablePanel id="b" defaultSize={300}>B</ResizablePanel>
      </ResizableGroup>
    );
    fireEvent.doubleClick(handleAt());
    expect(onResizeCommit).not.toHaveBeenCalled();
  });
});

describe('Resizable collapse', () => {
  function CollapsedFixture({
    onCollapsedChange,
  }: {
    onCollapsedChange?: (c: boolean) => void;
  }) {
    return (
      <ResizableGroup>
        <ResizablePanel
          id="a"
          defaultSize={300}
          collapsible
          collapsed
          onCollapsedChange={onCollapsedChange}
        >
          A
        </ResizablePanel>
        <ResizableHandle />
        <ResizablePanel id="b" defaultSize={300}>B</ResizablePanel>
      </ResizableGroup>
    );
  }

  it('renders a collapsed panel at 0px with the hidden-content state', () => {
    render(<CollapsedFixture />);
    const a = panelEl('a');
    expect(a.style.flexBasis).toBe('0px');
    expect(a.style.flexGrow).toBe('0');
    expect(a).toHaveAttribute('data-collapsed', 'true');
    // The separator reports the collapsed size.
    expect(screen.getByRole('separator')).toHaveAttribute(
      'aria-valuenow',
      '0'
    );
  });

  it('degenerates the adjacent handle into an expander (pointer)', () => {
    const onCollapsedChange = vi.fn();
    render(<CollapsedFixture onCollapsedChange={onCollapsedChange} />);
    fireEvent.pointerDown(handleAt(), { pointerId: 1, button: 0, clientX: 10 });
    expect(onCollapsedChange).toHaveBeenCalledOnce();
    expect(onCollapsedChange).toHaveBeenCalledWith(false);
    expect(basisOf('a')).toBe('300px');
    expect(panelEl('a')).not.toHaveAttribute('data-collapsed');
  });

  it('expands via Enter as the keyboard equivalent', () => {
    const onCollapsedChange = vi.fn();
    render(<CollapsedFixture onCollapsedChange={onCollapsedChange} />);
    fireEvent.keyDown(handleAt(), { key: 'Enter' });
    expect(onCollapsedChange).toHaveBeenCalledWith(false);
    expect(basisOf('a')).toBe('300px');
  });

  it('arrow keys do not resize while a neighbour is collapsed', () => {
    const onResizeCommit = vi.fn();
    render(
      <ResizableGroup onResizeCommit={onResizeCommit}>
        <ResizablePanel id="a" defaultSize={300} collapsible collapsed>
          A
        </ResizablePanel>
        <ResizableHandle />
        <ResizablePanel id="b" defaultSize={300}>B</ResizablePanel>
      </ResizableGroup>
    );
    fireEvent.keyDown(handleAt(), { key: 'ArrowRight' });
    expect(basisOf('a')).toBe('0px');
    expect(basisOf('b')).toBe('300px');
    expect(onResizeCommit).not.toHaveBeenCalled();
  });

  it('supports controlled collapse through a Control', () => {
    function ControlledFixture() {
      const [collapsed, setCollapsed, ctrl] = useControl(undefined, false);
      return (
        <>
          <ResizableGroup>
            <ResizablePanel
              id="a"
              defaultSize={300}
              collapsible
              collapsed={ctrl}
            >
              A
            </ResizablePanel>
            <ResizableHandle />
            <ResizablePanel id="b" defaultSize={300}>B</ResizablePanel>
          </ResizableGroup>
          <output data-testid="state">{String(collapsed)}</output>
          <button type="button" data-testid="flip" onClick={() => setCollapsed((p) => !p)}>
            flip
          </button>
        </>
      );
    }
    render(<ControlledFixture />);
    expect(basisOf('a')).toBe('300px');
    fireEvent.click(screen.getByTestId('flip'));
    expect(screen.getByTestId('state')).toHaveTextContent('true');
    expect(basisOf('a')).toBe('0px');
    expect(panelEl('a')).toHaveAttribute('data-collapsed', 'true');
    // The expander handle drives the same control back open.
    fireEvent.keyDown(handleAt(), { key: 'Enter' });
    expect(screen.getByTestId('state')).toHaveTextContent('false');
    expect(basisOf('a')).toBe('300px');
  });

  it('reports collapsed panels as 0 in commit payloads', () => {
    const onResizeCommit = vi.fn();
    render(
      <ResizableGroup onResizeCommit={onResizeCommit}>
        <ResizablePanel id="a" defaultSize={200} collapsible collapsed>
          A
        </ResizablePanel>
        <ResizableHandle />
        <ResizablePanel id="b" defaultSize={300}>B</ResizablePanel>
        <ResizableHandle />
        <ResizablePanel id="c" defaultSize={300}>C</ResizablePanel>
      </ResizableGroup>
    );
    fireEvent.keyDown(handleAt(1), { key: 'ArrowRight' });
    expect(onResizeCommit).toHaveBeenCalledWith({
      a: 0,
      b: 316,
      c: 284,
    });
  });
});

describe('nested ResizableGroups', () => {
  function NestedFixture() {
    return (
      <ResizableGroup>
        <ResizablePanel id="a" defaultSize={200}>A</ResizablePanel>
        <ResizableHandle />
        <ResizableGroup>
          <ResizablePanel id="b" defaultSize={250}>B</ResizablePanel>
          <ResizableHandle />
          <ResizablePanel id="c" defaultSize={250}>C</ResizablePanel>
        </ResizableGroup>
        <ResizableHandle />
        <ResizablePanel id="d" defaultSize={200}>D</ResizablePanel>
      </ResizableGroup>
    );
  }

  it('the inner handle resizes only the inner panels', () => {
    render(<NestedFixture />);
    // Document order: outer grip (a|nested), inner grip (b|c), outer grip (nested|d).
    fireEvent.keyDown(handleAt(1), { key: 'ArrowRight' });
    expect(basisOf('b')).toBe('266px');
    expect(basisOf('c')).toBe('234px');
    expect(basisOf('a')).toBe('200px');
    expect(basisOf('d')).toBe('200px');
  });

  it('an outer handle never resolves across the nested group boundary', () => {
    render(<NestedFixture />);
    // Grip between the nested group and d: only d is resizable.
    fireEvent.keyDown(handleAt(2), { key: 'ArrowRight' });
    expect(basisOf('d')).toBe('184px');
    expect(basisOf('b')).toBe('250px');
    expect(basisOf('c')).toBe('250px');
    // Grip between a and the nested group: only a is resizable.
    fireEvent.keyDown(handleAt(0), { key: 'ArrowRight' });
    expect(basisOf('a')).toBe('216px');
    expect(basisOf('b')).toBe('250px');
  });

  it('commits from the group that owns the resized panels', () => {
    const outerCommit = vi.fn();
    const innerCommit = vi.fn();
    render(
      <ResizableGroup onResizeCommit={outerCommit}>
        <ResizablePanel id="a" defaultSize={200}>A</ResizablePanel>
        <ResizableHandle />
        <ResizableGroup onResizeCommit={innerCommit}>
          <ResizablePanel id="b" defaultSize={250}>B</ResizablePanel>
          <ResizableHandle />
          <ResizablePanel id="c" defaultSize={250}>C</ResizablePanel>
        </ResizableGroup>
      </ResizableGroup>
    );
    fireEvent.keyDown(handleAt(1), { key: 'ArrowRight' });
    expect(innerCommit).toHaveBeenCalledWith({ b: 266, c: 234 });
    expect(outerCommit).not.toHaveBeenCalled();
  });
});

describe('external size declaration changes (single source of truth)', () => {
  type Declaration = {
    defaultSize?: number;
    minSize?: number;
    maxSize?: number;
  };

  function renderPair(declaration: Declaration = {}) {
    const tree = (next: Declaration) => (
      <ResizableGroup>
        <ResizablePanel
          id="a"
          defaultSize={next.defaultSize ?? 300}
          minSize={next.minSize}
          maxSize={next.maxSize}
        >
          A
        </ResizablePanel>
        <ResizableHandle />
        <ResizablePanel id="b" defaultSize={300}>B</ResizablePanel>
      </ResizableGroup>
    );
    const view = render(tree(declaration));
    return (next: Declaration) => view.rerender(tree(next));
  }

  it('applies an external defaultSize change after a drag immediately', () => {
    const update = renderPair();
    drag(handleAt(), 400, 440);
    expect(basisOf('a')).toBe('340px');
    // The typical loop: onResizeCommit written back into a Control that
    // feeds defaultSize — the fresh declaration must win over the override.
    update({ defaultSize: 420 });
    expect(basisOf('a')).toBe('420px');
  });

  it('clearing on an equal value is flicker-free and unpins the override', () => {
    const update = renderPair();
    drag(handleAt(), 400, 440);
    expect(basisOf('a')).toBe('340px');
    update({ defaultSize: 340 });
    expect(basisOf('a')).toBe('340px');
    // The override is gone: the next keyboard step counts from the
    // declaration, not from a hidden stale override.
    fireEvent.keyDown(handleAt(), { key: 'ArrowRight' });
    expect(basisOf('a')).toBe('356px');
  });

  it('keeps the gesture authoritative when the declaration changes mid-drag', () => {
    const onResizeCommit = vi.fn();
    const tree = (defaultSize: number) => (
      <ResizableGroup onResizeCommit={onResizeCommit}>
        <ResizablePanel id="a" defaultSize={defaultSize}>A</ResizablePanel>
        <ResizableHandle />
        <ResizablePanel id="b" defaultSize={300}>B</ResizablePanel>
      </ResizableGroup>
    );
    const view = render(tree(300));
    const handle = handleAt();
    fireEvent.pointerDown(handle, { pointerId: 1, button: 0, clientX: 400 });
    fireEvent.pointerMove(handle, { pointerId: 1, clientX: 440 });
    expect(basisOf('a')).toBe('340px');
    // Mid-gesture external change: the drag keeps its override…
    view.rerender(tree(420));
    expect(basisOf('a')).toBe('340px');
    // …the gesture keeps driving from the override…
    fireEvent.pointerMove(handle, { pointerId: 1, clientX: 460 });
    expect(basisOf('a')).toBe('360px');
    // …commits the gesture's own final sizes…
    fireEvent.pointerUp(handle, { pointerId: 1, clientX: 460 });
    expect(onResizeCommit).toHaveBeenLastCalledWith({ a: 360, b: 240 });
    // …and only then converges on the fresh declaration.
    expect(basisOf('a')).toBe('420px');
  });

  it('applies changed min/max pins to subsequent gestures', () => {
    const update = renderPair();
    drag(handleAt(), 400, 440);
    expect(basisOf('a')).toBe('340px');
    update({ maxSize: 320 });
    // The stale override is dropped — the declaration is the truth again.
    expect(basisOf('a')).toBe('300px');
    fireEvent.keyDown(handleAt(), { key: 'ArrowRight' });
    expect(basisOf('a')).toBe('316px');
    fireEvent.keyDown(handleAt(), { key: 'ArrowRight' });
    // 332 unclamped — the new max pins it.
    expect(basisOf('a')).toBe('320px');
  });
});

describe('Resizable accessibility', () => {
  it('has no axe violations', async () => {
    const { axe } = await import('jest-axe');
    const { container } = render(
      <ResizableGroup>
        <ResizablePanel id="a" defaultSize={300} collapsible collapsed>
          A
        </ResizablePanel>
        <ResizableHandle aria-label="Resize A" />
        <ResizablePanel id="b">B</ResizablePanel>
        <ResizableHandle aria-label="Resize C" />
        <ResizablePanel id="c" defaultSize={200}>C</ResizablePanel>
      </ResizableGroup>
    );
    const results = await axe(container, {
      rules: { region: { enabled: false } },
    });
    expect(results.violations).toEqual([]);
  });

  it('has no axe violations in vertical groups', async () => {
    const { axe } = await import('jest-axe');
    const { container } = render(
      <ResizableGroup direction="vertical">
        <ResizablePanel id="a" defaultSize={200}>A</ResizablePanel>
        <ResizableHandle />
        <ResizablePanel id="b">B</ResizablePanel>
      </ResizableGroup>
    );
    const results = await axe(container, {
      rules: { region: { enabled: false } },
    });
    expect(results.violations).toEqual([]);
  });
});
