import { expect, vi } from 'vitest';

import { fireEvent, render, screen } from '@testing-library/react';
import { useControl } from 'react-use-control';

import { Splitter, SplitterPane } from './index';

function splitterEl(): HTMLElement {
  const el = document.querySelector<HTMLElement>(
    "[data-slot='splitter']"
  );
  if (el === null) throw new Error('splitter not found');
  return el;
}

function paneAt(index = 0): HTMLElement {
  const panes = Array.from(
    document.querySelectorAll<HTMLElement>("[data-slot='pane']")
  );
  const el = panes[index];
  if (el === undefined) throw new Error(`pane ${index} not found`);
  return el;
}

function dividerAt(index = 0): HTMLElement {
  const dividers = Array.from(
    document.querySelectorAll<HTMLElement>("[data-slot='divider']")
  );
  const el = dividers[index];
  if (el === undefined) throw new Error(`divider ${index} not found`);
  return el;
}

/** The rendered size of a pane — the inline flex-grow ratio the group
 * controls (flex-basis is 0, so grow IS the percent share), readable in
 * jsdom without layout. */
const growOf = (index: number) => paneAt(index).style.flexGrow;

/** Give every element a fixed rect so percent drags have a denominator:
 * panes sum their main-axis extent (N panes × extent). */
function mockRects(width: number, height: number) {
  return vi
    .spyOn(HTMLElement.prototype, 'getBoundingClientRect')
    .mockReturnValue({
      width,
      height,
      top: 0,
      left: 0,
      bottom: height,
      right: width,
      x: 0,
      y: 0,
      toJSON: () => ({}),
    });
}

function drag(
  divider: HTMLElement,
  from: number,
  to: number,
  axis: 'x' | 'y' = 'x'
) {
  const start = axis === 'x' ? { clientX: from } : { clientY: from };
  const move = axis === 'x' ? { clientX: to } : { clientY: to };
  fireEvent.pointerDown(divider, { pointerId: 1, button: 0, ...start });
  fireEvent.pointerMove(divider, { pointerId: 1, ...move });
  fireEvent.pointerUp(divider, { pointerId: 1, ...move });
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe('Splitter rendering', () => {
  it('renders the container, panes and implicit dividers with data-slot semantics', () => {
    render(
      <Splitter>
        <SplitterPane>A</SplitterPane>
        <SplitterPane>B</SplitterPane>
        <SplitterPane>C</SplitterPane>
      </Splitter>
    );
    expect(
      document.querySelectorAll("[data-slot='splitter']")
    ).toHaveLength(1);
    expect(document.querySelectorAll("[data-slot='pane']")).toHaveLength(3);
    // N panes → N−1 implicit dividers between them.
    expect(document.querySelectorAll("[data-slot='divider']")).toHaveLength(
      2
    );
  });

  it('splits the pane area equally by default', () => {
    render(
      <Splitter>
        <SplitterPane>A</SplitterPane>
        <SplitterPane>B</SplitterPane>
      </Splitter>
    );
    expect(growOf(0)).toBe('50');
    expect(growOf(1)).toBe('50');
  });

  it('honours an uncontrolled plain sizes array as the initial value', () => {
    render(
      <Splitter sizes={[70, 30]}>
        <SplitterPane>A</SplitterPane>
        <SplitterPane>B</SplitterPane>
      </Splitter>
    );
    expect(growOf(0)).toBe('70');
    expect(growOf(1)).toBe('30');
  });

  it('applies className and forwards rest props to container and panes', () => {
    render(
      <Splitter className="splitter-extra" data-testid="frame">
        <SplitterPane className="pane-extra" title="Left">
          A
        </SplitterPane>
        <SplitterPane>B</SplitterPane>
      </Splitter>
    );
    expect(splitterEl()).toHaveClass('splitter-extra');
    expect(screen.getByTestId('frame')).toBeInTheDocument();
    expect(paneAt(0)).toHaveClass('pane-extra');
    expect(paneAt(0)).toHaveAttribute('title', 'Left');
    expect(paneAt(0)).toHaveTextContent('A');
  });

  it('merges a consumer pane style with the injected flex ratio', () => {
    render(
      <Splitter>
        <SplitterPane style={{ overflow: 'hidden' }}>A</SplitterPane>
        <SplitterPane>B</SplitterPane>
      </Splitter>
    );
    expect(paneAt(0).style.overflow).toBe('hidden');
    expect(growOf(0)).toBe('50');
  });

  it('throws on non-pane children and on panes outside a splitter', () => {
    expect(() =>
      render(
        <Splitter>
          <SplitterPane>A</SplitterPane>
          <div>rogue child</div>
        </Splitter>
      )
    ).toThrow('Splitter children must be <SplitterPane> elements');
    expect(() => render(<SplitterPane>A</SplitterPane>)).toThrow(
      'SplitterPane must be used within <Splitter>'
    );
  });

  it('renders a single pane without dividers', () => {
    render(
      <Splitter>
        <SplitterPane>A</SplitterPane>
      </Splitter>
    );
    expect(growOf(0)).toBe('100');
    expect(document.querySelectorAll("[data-slot='divider']")).toHaveLength(
      0
    );
  });
});

describe('Splitter aria contract', () => {
  it('exposes a focusable separator reporting the grip orientation and lead pane percent', () => {
    render(
      <Splitter sizes={[50, 50]}>
        <SplitterPane min={20} max={80}>
          A
        </SplitterPane>
        <SplitterPane min={30} max={60}>
          B
        </SplitterPane>
      </Splitter>
    );
    const divider = screen.getByRole('separator');
    expect(divider).toHaveAttribute('tabindex', '0');
    // Horizontal splitter = vertical grip bar (its own physical orientation).
    expect(divider).toHaveAttribute('aria-orientation', 'vertical');
    expect(divider).toHaveAttribute('aria-valuenow', '50');
    // Effective clamps: lead min 20 / max 80, but the trail max (60) keeps
    // the lead ≥ 40 and the trail min (30) keeps it ≤ 70.
    expect(divider).toHaveAttribute('aria-valuemin', '40');
    expect(divider).toHaveAttribute('aria-valuemax', '70');
  });

  it('vertical splitters report a horizontal grip and unclamped defaults', () => {
    render(
      <Splitter orientation="vertical">
        <SplitterPane>A</SplitterPane>
        <SplitterPane>B</SplitterPane>
      </Splitter>
    );
    const divider = screen.getByRole('separator');
    expect(divider).toHaveAttribute('aria-orientation', 'horizontal');
    expect(divider).toHaveAttribute('aria-valuenow', '50');
    expect(divider).toHaveAttribute('aria-valuemin', '0');
    expect(divider).toHaveAttribute('aria-valuemax', '100');
  });
});

describe('Splitter keyboard resizing (WCAG 2.5.1)', () => {
  it('steps 5 percent points per arrow press and keeps the pair sum constant', () => {
    render(
      <Splitter>
        <SplitterPane>A</SplitterPane>
        <SplitterPane>B</SplitterPane>
      </Splitter>
    );
    const divider = dividerAt();
    fireEvent.keyDown(divider, { key: 'ArrowRight' });
    fireEvent.keyDown(divider, { key: 'ArrowRight' });
    expect(growOf(0)).toBe('60');
    expect(growOf(1)).toBe('40');
    fireEvent.keyDown(divider, { key: 'ArrowLeft' });
    expect(growOf(0)).toBe('55');
    expect(growOf(1)).toBe('45');
  });

  it('vertical splitters resize with ArrowDown/ArrowUp', () => {
    render(
      <Splitter orientation="vertical">
        <SplitterPane>A</SplitterPane>
        <SplitterPane>B</SplitterPane>
      </Splitter>
    );
    const divider = dividerAt();
    fireEvent.keyDown(divider, { key: 'ArrowDown' });
    expect(growOf(0)).toBe('55');
    fireEvent.keyDown(divider, { key: 'ArrowUp' });
    expect(growOf(0)).toBe('50');
  });

  it('pins keyboard steps at the pane min/max clamps', () => {
    render(
      <Splitter sizes={[50, 50]}>
        <SplitterPane min={40} max={65}>
          A
        </SplitterPane>
        <SplitterPane min={25}>B</SplitterPane>
      </Splitter>
    );
    const divider = dividerAt();
    for (let i = 0; i < 10; i += 1) {
      fireEvent.keyDown(divider, { key: 'ArrowRight' });
    }
    // a would reach 100 unclamped; trail min (25) binds it to 75, lead max
    // caps at 65 → the tighter clamp wins.
    expect(growOf(0)).toBe('65');
    for (let i = 0; i < 10; i += 1) {
      fireEvent.keyDown(divider, { key: 'ArrowLeft' });
    }
    expect(growOf(0)).toBe('40');
  });

  it('Home/End park the lead pane at its effective clamps', () => {
    render(
      <Splitter sizes={[50, 50]}>
        <SplitterPane min={20} max={80}>
          A
        </SplitterPane>
        <SplitterPane min={30}>B</SplitterPane>
      </Splitter>
    );
    const divider = dividerAt();
    fireEvent.keyDown(divider, { key: 'Home' });
    expect(growOf(0)).toBe('20');
    fireEvent.keyDown(divider, { key: 'End' });
    // End is pair-bounded: B keeps its 30 percent minimum.
    expect(growOf(0)).toBe('70');
    expect(growOf(1)).toBe('30');
  });

  it('leaves unhandled keys to the platform', () => {
    render(
      <Splitter>
        <SplitterPane>A</SplitterPane>
        <SplitterPane>B</SplitterPane>
      </Splitter>
    );
    const divider = dividerAt();
    const event = fireEvent.keyDown(divider, { key: 'a' });
    expect(event).toBe(true);
    expect(growOf(0)).toBe('50');
  });

  it('fires onSizesChange with the full next array', () => {
    const onSizesChange = vi.fn();
    render(
      <Splitter onSizesChange={onSizesChange}>
        <SplitterPane>A</SplitterPane>
        <SplitterPane>B</SplitterPane>
      </Splitter>
    );
    fireEvent.keyDown(dividerAt(), { key: 'ArrowRight' });
    expect(onSizesChange).toHaveBeenCalledOnce();
    expect(onSizesChange).toHaveBeenCalledWith([55, 45]);
  });

  it('resizes only the pair flanking the focused divider', () => {
    render(
      <Splitter sizes={[30, 40, 30]}>
        <SplitterPane>A</SplitterPane>
        <SplitterPane>B</SplitterPane>
        <SplitterPane>C</SplitterPane>
      </Splitter>
    );
    fireEvent.keyDown(dividerAt(1), { key: 'ArrowRight' });
    expect(growOf(0)).toBe('30');
    expect(growOf(1)).toBe('45');
    expect(growOf(2)).toBe('25');
  });
});

describe('Splitter pointer resizing', () => {
  it('trades percent between the flanking panes', () => {
    render(
      <Splitter>
        <SplitterPane>A</SplitterPane>
        <SplitterPane>B</SplitterPane>
      </Splitter>
    );
    mockRects(500, 400); // 2 panes × 500px = 1000px pane area
    drag(dividerAt(), 400, 440);
    expect(growOf(0)).toBe('54');
    expect(growOf(1)).toBe('46');
  });

  it('resizes vertically with clientY in vertical splitters', () => {
    render(
      <Splitter orientation="vertical">
        <SplitterPane>A</SplitterPane>
        <SplitterPane>B</SplitterPane>
      </Splitter>
    );
    mockRects(500, 400); // 2 panes × 400px = 800px pane area
    drag(dividerAt(), 100, 160, 'y');
    expect(growOf(0)).toBe('57.5');
    expect(growOf(1)).toBe('42.5');
  });

  it('pins pointer drags at the effective clamps', () => {
    render(
      <Splitter>
        <SplitterPane min={30} max={70}>
          A
        </SplitterPane>
        <SplitterPane min={20}>B</SplitterPane>
      </Splitter>
    );
    mockRects(500, 400);
    drag(dividerAt(), 400, 0); // −400px → clamped at the lead min
    expect(growOf(0)).toBe('30');
    drag(dividerAt(), 400, 2000); // +1600px → clamped at 70 (trail min 20)
    expect(growOf(0)).toBe('70');
    expect(growOf(1)).toBe('30');
  });

  it('ignores secondary-button and unmeasured gestures', () => {
    render(
      <Splitter>
        <SplitterPane>A</SplitterPane>
        <SplitterPane>B</SplitterPane>
      </Splitter>
    );
    const divider = dividerAt();
    // No rect mock: jsdom measures zero — the gesture must no-op safely.
    drag(divider, 400, 440);
    expect(growOf(0)).toBe('50');
    fireEvent.pointerDown(divider, { pointerId: 1, button: 2, clientX: 400 });
    expect(growOf(0)).toBe('50');
  });

  it('pointercancel ends the gesture: late moves resize nothing', () => {
    render(
      <Splitter>
        <SplitterPane>A</SplitterPane>
        <SplitterPane>B</SplitterPane>
      </Splitter>
    );
    mockRects(500, 400);
    const divider = dividerAt();
    fireEvent.pointerDown(divider, { pointerId: 1, button: 0, clientX: 400 });
    fireEvent.pointerMove(divider, { pointerId: 1, clientX: 440 });
    expect(growOf(0)).toBe('54');
    // testing-library has no pointercancel helper — dispatch it natively.
    fireEvent(
      divider,
      new PointerEvent('pointercancel', { pointerId: 1, bubbles: true })
    );
    fireEvent.pointerMove(divider, { pointerId: 1, clientX: 600 });
    expect(growOf(0)).toBe('54');
  });

  it('rounds emitted sizes to two decimals', () => {
    const onSizesChange = vi.fn();
    render(
      <Splitter onSizesChange={onSizesChange}>
        <SplitterPane>A</SplitterPane>
        <SplitterPane>B</SplitterPane>
      </Splitter>
    );
    mockRects(500, 400);
    drag(dividerAt(), 400, 441); // 41px / 1000px = 4.1%
    expect(growOf(0)).toBe('54.1');
    expect(onSizesChange).toHaveBeenLastCalledWith([54.1, 45.9]);
  });
});

describe('Splitter controlled sizes (ControlOrValue)', () => {
  it('treats an external Control as the single source of truth', () => {
    function Harness() {
      const [sizes, setSizes, control] = useControl<number[]>([40, 60]);
      return (
        <>
          <Splitter sizes={control}>
            <SplitterPane>A</SplitterPane>
            <SplitterPane>B</SplitterPane>
          </Splitter>
          <button type="button" onClick={() => setSizes([40, 60])}>
            reset
          </button>
          <output data-testid="mirror">{JSON.stringify(sizes)}</output>
        </>
      );
    }
    render(<Harness />);
    expect(growOf(0)).toBe('40');
    // Keyboard through the divider writes through to the parent state…
    fireEvent.keyDown(dividerAt(), { key: 'ArrowRight' });
    expect(growOf(0)).toBe('45');
    expect(screen.getByTestId('mirror')).toHaveTextContent('[45,55]');
    // …and an external correction wins — the render snaps back.
    fireEvent.click(screen.getByRole('button', { name: 'reset' }));
    expect(growOf(0)).toBe('40');
    expect(screen.getByTestId('mirror')).toHaveTextContent('[40,60]');
  });

  it('keeps the uncontrolled split stable when panes are added later', () => {
    const view = render(
      <Splitter>
        <SplitterPane>A</SplitterPane>
        <SplitterPane>B</SplitterPane>
      </Splitter>
    );
    expect(growOf(0)).toBe('50');
    view.rerender(
      <Splitter>
        <SplitterPane>A</SplitterPane>
        <SplitterPane>B</SplitterPane>
        <SplitterPane>C</SplitterPane>
      </Splitter>
    );
    // The initial equal split is not recomputed — existing panes keep
    // their sizes; a pane without an entry falls back to an equal share.
    expect(growOf(0)).toBe('50');
    expect(growOf(1)).toBe('50');
    expect(growOf(2)).toBe(String(100 / 3));
  });
});

describe('Splitter RTL mirroring', () => {
  it('mirrors arrow keys: ArrowRight shrinks the lead pane', () => {
    render(
      <div dir="rtl">
        <Splitter>
          <SplitterPane>A</SplitterPane>
          <SplitterPane>B</SplitterPane>
        </Splitter>
      </div>
    );
    const divider = dividerAt();
    fireEvent.keyDown(divider, { key: 'ArrowRight' });
    expect(growOf(0)).toBe('45');
    fireEvent.keyDown(divider, { key: 'ArrowLeft' });
    expect(growOf(0)).toBe('50');
  });

  it('mirrors pointer drags: rightward motion shrinks the lead pane', () => {
    render(
      <div dir="rtl">
        <Splitter>
          <SplitterPane>A</SplitterPane>
          <SplitterPane>B</SplitterPane>
        </Splitter>
      </div>
    );
    mockRects(500, 400);
    drag(dividerAt(), 400, 440);
    expect(growOf(0)).toBe('46');
    expect(growOf(1)).toBe('54');
  });

  it('leaves vertical splitters direction-invariant', () => {
    render(
      <div dir="rtl">
        <Splitter orientation="vertical">
          <SplitterPane>A</SplitterPane>
          <SplitterPane>B</SplitterPane>
        </Splitter>
      </div>
    );
    fireEvent.keyDown(dividerAt(), { key: 'ArrowDown' });
    expect(growOf(0)).toBe('55');
  });
});

describe('Splitter accessibility', () => {
  it('has no axe violations', async () => {
    const { axe } = await import('jest-axe');
    const { container } = render(
      <Splitter sizes={[30, 40, 30]}>
        <SplitterPane>Left pane</SplitterPane>
        <SplitterPane>Middle pane</SplitterPane>
        <SplitterPane>Right pane</SplitterPane>
      </Splitter>
    );
    const results = await axe(container, {
      rules: { region: { enabled: false } },
    });
    expect(results.violations).toEqual([]);
  });

  it('has no axe violations in vertical splitters', async () => {
    const { axe } = await import('jest-axe');
    const { container } = render(
      <Splitter orientation="vertical">
        <SplitterPane>Top pane</SplitterPane>
        <SplitterPane>Bottom pane</SplitterPane>
      </Splitter>
    );
    const results = await axe(container, {
      rules: { region: { enabled: false } },
    });
    expect(results.violations).toEqual([]);
  });
});
