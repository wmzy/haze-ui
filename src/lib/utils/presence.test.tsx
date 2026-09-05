import { expect } from 'vitest';
// Explicit vitest expect: jest-axe's @types pull in a global jest expect that
// lacks vitest extension matchers like toHaveBeenCalledOnce.
import { act, render, screen, waitFor } from '@testing-library/react';
import { createRef } from 'react';

import { Presence, whenExitSettles } from './presence';

/** Computed-style stub for one element: declared exit durations, jsdom zero. */
function stubComputedFor(target: Element, style: Record<string, string>) {
  const real = window.getComputedStyle.bind(window);
  return vi.spyOn(window, 'getComputedStyle').mockImplementation((element, pseudoElement) =>
    element === target
      ? (style as unknown as CSSStyleDeclaration)
      : real(element, pseudoElement)
  );
}

function exitStyle(overrides: Record<string, string> = {}) {
  return {
    animationName: 'haze-exit',
    animationDuration: '120ms',
    animationDelay: '0s',
    transitionProperty: 'none',
    transitionDuration: '0s',
    transitionDelay: '0s',
    ...overrides,
  };
}

/** Settled flag for asserting a settle is still pending at a point in time. */
function track(settle: Promise<void> | null) {
  const state = {settled: false};
  void settle?.then(() => {
    state.settled = true;
  });
  return state;
}

describe('whenExitSettles', () => {
  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it('resolves immediately when no duration is declared (jsdom reports none)', async () => {
    const panel = document.createElement('div');
    document.body.append(panel);
    // Real jsdom computed style: every duration is empty, so the settle must
    // complete on its own — no end event ever fires.
    await whenExitSettles(panel);
    panel.remove();
  });

  it('returns null for an element outside the document', () => {
    const detached = document.createElement('div');
    expect(whenExitSettles(detached)).toBeNull();
  });

  it('settles on animationend from the element itself, ignoring child events', async () => {
    vi.useFakeTimers();
    const panel = document.createElement('div');
    const inner = document.createElement('span');
    panel.append(inner);
    document.body.append(panel);
    stubComputedFor(panel, exitStyle());

    const settle = whenExitSettles(panel);
    expect(settle).toBeInstanceOf(Promise);
    const state = track(settle);

    await vi.advanceTimersByTimeAsync(32); // past the double frame
    expect(state.settled).toBe(false);

    inner.dispatchEvent(new Event('animationend', {bubbles: true}));
    await vi.advanceTimersByTimeAsync(16);
    expect(state.settled).toBe(false); // bubbled child event ignored

    panel.dispatchEvent(new Event('animationend'));
    await settle;
    expect(state.settled).toBe(true);
    panel.remove();
  });

  it('settles on transitionend when only a transition is declared', async () => {
    vi.useFakeTimers();
    const panel = document.createElement('div');
    document.body.append(panel);
    stubComputedFor(
      panel,
      exitStyle({
        animationName: 'none',
        animationDuration: '0s',
        transitionProperty: 'opacity',
        transitionDuration: '80ms',
      })
    );

    const settle = whenExitSettles(panel);
    await vi.advanceTimersByTimeAsync(32);
    panel.dispatchEvent(new Event('transitionend'));
    await settle;
    panel.remove();
  });

  it('falls back to the declared max duration when no end event fires', async () => {
    vi.useFakeTimers();
    const panel = document.createElement('div');
    document.body.append(panel);
    stubComputedFor(
      panel,
      exitStyle({animationDuration: '0.2s', animationDelay: '50ms'})
    );

    const state = track(whenExitSettles(panel));
    // Double frame (32) + duration + delay (250) = settles at 282.
    await vi.advanceTimersByTimeAsync(281);
    expect(state.settled).toBe(false);
    await vi.advanceTimersByTimeAsync(1);
    expect(state.settled).toBe(true);
    panel.remove();
  });

  it('is not re-entrant: concurrent calls share one settle', async () => {
    vi.useFakeTimers();
    const panel = document.createElement('div');
    document.body.append(panel);
    stubComputedFor(panel, exitStyle({animationDuration: '100ms'}));

    const first = whenExitSettles(panel);
    const second = whenExitSettles(panel);
    expect(second).toBe(first);

    await vi.advanceTimersByTimeAsync(200);
    await first;

    const third = whenExitSettles(panel);
    expect(third).not.toBe(first);
    await vi.advanceTimersByTimeAsync(200);
    await third;
    panel.remove();
  });
});

describe('Presence', () => {
  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it('renders the child with data-state=open as soon as present', () => {
    render(
      <Presence present>
        <div data-testid='child'>Content</div>
      </Presence>
    );
    expect(screen.getByTestId('child')).toHaveAttribute('data-state', 'open');
  });

  it('mounts nothing when present has been false from the start', () => {
    const onExited = vi.fn();
    const {container} = render(
      <Presence present={false} onExited={onExited}>
        <div data-testid='child'>Content</div>
      </Presence>
    );
    expect(container).toBeEmptyDOMElement();
    expect(onExited).not.toHaveBeenCalled();
  });

  it('stays mounted as closed until the exit settles, then unmounts and calls onExited', async () => {
    const onExited = vi.fn();
    const {rerender} = render(
      <Presence present onExited={onExited}>
        <div data-testid='child'>Content</div>
      </Presence>
    );
    rerender(
      <Presence present={false} onExited={onExited}>
        <div data-testid='child'>Content</div>
      </Presence>
    );
    // jsdom reports no duration, so the settle completes without events —
    // but only after the double frame: synchronously the exit is pending.
    expect(screen.getByTestId('child')).toHaveAttribute('data-state', 'closed');
    await waitFor(() =>
      expect(screen.queryByTestId('child')).not.toBeInTheDocument()
    );
    expect(onExited).toHaveBeenCalledOnce();
  });

  it('unmounts only after the child animationend when an exit animation is declared', async () => {
    vi.useFakeTimers();
    const onExited = vi.fn();
    const child = <div data-testid='child'>Content</div>;
    const {rerender} = render(
      <Presence present onExited={onExited}>
        {child}
      </Presence>
    );
    stubComputedFor(screen.getByTestId('child'), exitStyle());
    rerender(
      <Presence present={false} onExited={onExited}>
        {child}
      </Presence>
    );

    await act(async () => {
      await vi.advanceTimersByTimeAsync(32);
    });
    expect(screen.getByTestId('child')).toBeInTheDocument(); // still exiting

    act(() => {
      screen
        .getByTestId('child')
        .dispatchEvent(new Event('animationend'));
    });
    await act(async () => {
      await Promise.resolve();
    });
    expect(onExited).toHaveBeenCalledOnce();
    expect(screen.queryByTestId('child')).not.toBeInTheDocument();
  });

  it('unmounts via the timeout fallback when no end event arrives', async () => {
    vi.useFakeTimers();
    const onExited = vi.fn();
    const child = <div data-testid='child'>Content</div>;
    const {rerender} = render(
      <Presence present onExited={onExited}>
        {child}
      </Presence>
    );
    stubComputedFor(
      screen.getByTestId('child'),
      exitStyle({animationDuration: '0.2s', animationDelay: '50ms'})
    );
    rerender(
      <Presence present={false} onExited={onExited}>
        {child}
      </Presence>
    );

    // Double frame (32) + duration + delay (250) = settles at 282.
    await act(async () => {
      await vi.advanceTimersByTimeAsync(281);
    });
    expect(screen.getByTestId('child')).toBeInTheDocument();
    await act(async () => {
      await vi.advanceTimersByTimeAsync(10);
    });
    expect(onExited).toHaveBeenCalledOnce();
    expect(screen.queryByTestId('child')).not.toBeInTheDocument();
  });

  it('keeps the child when present flips back before the exit settles', async () => {
    const onExited = vi.fn();
    const child = <div data-testid='child'>Content</div>;
    const {rerender} = render(
      <Presence present onExited={onExited}>
        {child}
      </Presence>
    );
    rerender(
      <Presence present={false} onExited={onExited}>
        {child}
      </Presence>
    );
    rerender(
      <Presence present onExited={onExited}>
        {child}
      </Presence>
    );
    expect(screen.getByTestId('child')).toHaveAttribute('data-state', 'open');

    // Let the abandoned settle finish: it must not unmount or call onExited.
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 60));
    });
    expect(screen.getByTestId('child')).toBeInTheDocument();
    expect(onExited).not.toHaveBeenCalled();
  });

  it('preserves refs passed by the consumer', () => {
    const objectRef = createRef<HTMLDivElement>();
    const callbackRef = vi.fn();
    const {rerender} = render(
      <Presence present>
        <div ref={objectRef} data-testid='first' />
      </Presence>
    );
    expect(objectRef.current).toBe(screen.getByTestId('first'));

    rerender(
      <Presence present>
        <div ref={callbackRef} data-testid='second' />
      </Presence>
    );
    expect(callbackRef).toHaveBeenCalledWith(screen.getByTestId('second'));
  });

  it('leaves a consumer-provided data-state untouched', () => {
    render(
      <Presence present>
        <div data-testid='child' data-state='locked'>
          Content
        </div>
      </Presence>
    );
    expect(screen.getByTestId('child')).toHaveAttribute('data-state', 'locked');
  });

  it('has no axe violations', async () => {
    const {axe} = await import('jest-axe');
    render(
      <Presence present>
        <button>Save changes</button>
      </Presence>
    );
    const results = await axe(document.body, {
      rules: {region: {enabled: false}},
    });
    expect(results.violations).toEqual([]);
  });
});
