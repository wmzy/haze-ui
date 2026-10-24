import { render, screen, fireEvent, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import PullToRefresh from './PullToRefresh';

type User = ReturnType<typeof userEvent.setup>;

/** One full pull gesture: down at `from`, drag to `to`, release there. */
const pull = async (user: User, target: Element, from: number, to: number) => {
  await user.pointer([
    { keys: '[MouseLeft>]', target, coords: { clientX: 100, clientY: from } },
    { target, coords: { clientX: 100, clientY: to } },
    { keys: '[/MouseLeft]', target, coords: { clientX: 100, clientY: to } },
  ]);
};

const headOf = () => document.querySelector("[data-slot='head']");

/**
 * Resolve/reject the pending refresh promise and flush the component's
 * async settle (the microtask continuation) inside act.
 */
const settleRefresh = async (settle: () => void) => {
  await act(async () => {
    settle();
    await Promise.resolve();
  });
};

describe('PullToRefresh', () => {
  it('renders children inside the content slot', () => {
    render(<PullToRefresh onRefresh={() => undefined}><span>List body</span></PullToRefresh>);
    expect(screen.getByText('List body')).toBeInTheDocument();
  });

  it('marks container/head/content/indicator data-slots', () => {
    const { container } = render(
      <PullToRefresh onRefresh={() => undefined}><span>List body</span></PullToRefresh>,
    );
    expect(container.querySelector("[data-slot='container']")).toBe(
      container.firstChild,
    );
    expect(container.querySelector("[data-slot='head']")).toBeInTheDocument();
    expect(
      container.querySelector("[data-slot='content']"),
    ).toBeInTheDocument();
    expect(
      container.querySelector("[data-slot='indicator']"),
    ).toBeInTheDocument();
  });

  it('applies className', () => {
    const { container } = render(
      <PullToRefresh className="custom" onRefresh={() => undefined}>
        <span>List body</span>
      </PullToRefresh>,
    );
    expect(container.firstChild).toHaveClass('custom');
  });

  it('forwards native props onto the container', () => {
    render(
      <PullToRefresh onRefresh={() => undefined} data-testid="ptr" aria-label="Feed">
        <span>List body</span>
      </PullToRefresh>,
    );
    expect(screen.getByTestId('ptr')).toHaveAttribute('aria-label', 'Feed');
  });

  it('follows the finger while pulling, damped past the threshold', async () => {
    const user = userEvent.setup();
    render(<PullToRefresh onRefresh={() => undefined}><span>List body</span></PullToRefresh>);
    const body = screen.getByText('List body');
    const content = body.parentElement!;

    await user.pointer([
      { keys: '[MouseLeft>]', target: body, coords: { clientX: 100, clientY: 100 } },
      { target: body, coords: { clientX: 100, clientY: 140 } },
    ]);
    expect(content).toHaveStyle({ transform: 'translateY(40px)' });
    expect(headOf()).toHaveAttribute('data-phase', 'pulling');
    // head hangs from the content edge: a 40px pull reveals its bottom 40px
    expect(headOf()).toHaveStyle({ transform: 'translateY(-24px)' });

    // 100px raw pull → 64 + (100 - 64) / 2 = 82px damped
    await user.pointer([{ target: body, coords: { clientX: 100, clientY: 200 } }]);
    expect(content).toHaveStyle({ transform: 'translateY(82px)' });
    expect(headOf()).toHaveAttribute('data-phase', 'ready');
    expect(screen.getByText('Release to refresh')).toBeInTheDocument();
  });

  it('does not refresh when the pull stays below the threshold', async () => {
    const user = userEvent.setup();
    const onRefresh = vi.fn();
    render(<PullToRefresh onRefresh={onRefresh}><span>List body</span></PullToRefresh>);
    const body = screen.getByText('List body');

    await pull(user, body, 100, 140); // 40px < 64px threshold
    expect(onRefresh).not.toHaveBeenCalled();
    expect(body.parentElement).toHaveStyle({ transform: 'translateY(0px)' });
    expect(headOf()).toHaveAttribute('data-phase', 'idle');
  });

  it('refreshes when released past the threshold and returns to idle once the promise settles', async () => {
    const user = userEvent.setup();
    let resolveRefresh: (() => void) | undefined;
    const onRefresh = vi.fn(
      () =>
        new Promise<void>((resolve) => {
          resolveRefresh = resolve;
        }),
    );
    render(<PullToRefresh onRefresh={onRefresh}><span>List body</span></PullToRefresh>);
    const body = screen.getByText('List body');

    await pull(user, body, 100, 200); // past the 64px threshold
    expect(onRefresh).toHaveBeenCalledTimes(1);

    // refreshing: busy container, spinner status, settled at the distance
    const container = body.closest('[data-slot=container]')!;
    expect(container).toHaveAttribute('aria-busy', 'true');
    expect(headOf()).toHaveAttribute('data-phase', 'refreshing');
    expect(headOf()).not.toHaveAttribute('aria-hidden');
    expect(body.parentElement).toHaveStyle({ transform: 'translateY(64px)' });
    expect(screen.getByRole('status')).toBeInTheDocument();
    expect(screen.getByText('Refreshing…')).toBeInTheDocument();

    await settleRefresh(() => resolveRefresh?.());
    expect(headOf()).toHaveAttribute('data-phase', 'idle');
    expect(body.parentElement).toHaveStyle({ transform: 'translateY(0px)' });
    expect(container).not.toHaveAttribute('aria-busy');
    expect(headOf()).toHaveAttribute('aria-hidden', 'true');
  });

  it('returns to idle when the refresh promise rejects', async () => {
    const user = userEvent.setup();
    let rejectRefresh: ((reason?: unknown) => void) | undefined;
    const onRefresh = vi.fn(
      () =>
        new Promise<void>((_, reject) => {
          rejectRefresh = reject;
        }),
    );
    render(<PullToRefresh onRefresh={onRefresh}><span>List body</span></PullToRefresh>);
    const body = screen.getByText('List body');

    await pull(user, body, 100, 200);
    expect(headOf()).toHaveAttribute('data-phase', 'refreshing');
    await settleRefresh(() => rejectRefresh?.(new Error('boom')));
    expect(headOf()).toHaveAttribute('data-phase', 'idle');
    expect(body.parentElement).toHaveStyle({ transform: 'translateY(0px)' });
  });

  it('settles immediately when onRefresh returns void', async () => {
    const user = userEvent.setup();
    const onRefresh = vi.fn();
    render(<PullToRefresh onRefresh={onRefresh}><span>List body</span></PullToRefresh>);
    const body = screen.getByText('List body');

    await pull(user, body, 100, 200);
    expect(onRefresh).toHaveBeenCalledTimes(1);
    // the void return settles on a microtask, flushed by the act-wrapped
    // user-event dispatch
    expect(headOf()).toHaveAttribute('data-phase', 'idle');
    expect(body.parentElement).toHaveStyle({ transform: 'translateY(0px)' });
  });

  it('honors a custom distance', async () => {
    const user = userEvent.setup();
    const onRefresh = vi.fn();
    const first = render(
      <PullToRefresh onRefresh={onRefresh} distance={40}>
        <span>List body</span>
      </PullToRefresh>,
    );
    const body = screen.getByText('List body');

    await pull(user, body, 100, 130); // 30px < 40px: no refresh
    expect(onRefresh).not.toHaveBeenCalled();
    first.unmount();

    // 45px ≥ 40px: refresh, settling at 40px while the promise pends
    let resolveRefresh: (() => void) | undefined;
    render(
      <PullToRefresh
        distance={40}
        onRefresh={() =>
          new Promise<void>((resolve) => {
            resolveRefresh = resolve;
          })
        }
      >
        <span>Pending body</span>
      </PullToRefresh>,
    );
    const pendingBody = screen.getByText('Pending body');
    await pull(user, pendingBody, 100, 145);
    expect(pendingBody.parentElement).toHaveStyle({
      transform: 'translateY(40px)',
    });
    await settleRefresh(() => resolveRefresh?.());
  });

  it('does not intercept when an ancestor scroller is not at the top', async () => {
    const user = userEvent.setup();
    const onRefresh = vi.fn();
    render(
      <div data-testid="page">
        <PullToRefresh onRefresh={onRefresh}><span>List body</span></PullToRefresh>
      </div>,
    );
    const page = screen.getByTestId('page');
    page.scrollTop = 120;
    const body = screen.getByText('List body');

    await pull(user, body, 100, 200);
    expect(onRefresh).not.toHaveBeenCalled();
    expect(body.parentElement).toHaveStyle({ transform: 'translateY(0px)' });
    expect(headOf()).toHaveAttribute('data-phase', 'idle');

    // back at the top the same gesture takes over again
    page.scrollTop = 0;
    await pull(user, body, 100, 200);
    expect(onRefresh).toHaveBeenCalledTimes(1);
  });

  it('lets a custom canRefresh override the scroll-top default', async () => {
    const user = userEvent.setup();
    const onRefresh = vi.fn();
    const { rerender } = render(
      <PullToRefresh onRefresh={onRefresh} canRefresh={() => false}>
        <span>List body</span>
      </PullToRefresh>,
    );
    const body = screen.getByText('List body');

    await pull(user, body, 100, 200);
    expect(onRefresh).not.toHaveBeenCalled();
    expect(body.parentElement).toHaveStyle({ transform: 'translateY(0px)' });

    // true even with a scrolled ancestor: the prop is the whole contract
    rerender(
      <div data-testid="page">
        <PullToRefresh onRefresh={onRefresh} canRefresh={() => true}>
          <span>List body</span>
        </PullToRefresh>
      </div>,
    );
    const scrolledBody = screen.getByText('List body');
    screen.getByTestId('page').scrollTop = 300;
    await pull(user, scrolledBody, 100, 200);
    expect(onRefresh).toHaveBeenCalledTimes(1);
  });

  it('never intercepts while disabled', async () => {
    const user = userEvent.setup();
    const onRefresh = vi.fn();
    render(
      <PullToRefresh onRefresh={onRefresh} disabled>
        <span>List body</span>
      </PullToRefresh>,
    );
    const body = screen.getByText('List body');

    await pull(user, body, 100, 200);
    expect(onRefresh).not.toHaveBeenCalled();
    expect(body.parentElement).toHaveStyle({ transform: 'translateY(0px)' });
    expect(headOf()).toHaveAttribute('data-phase', 'idle');
  });

  it('ignores horizontal and upward drags', async () => {
    const user = userEvent.setup();
    const onRefresh = vi.fn();
    render(<PullToRefresh onRefresh={onRefresh}><span>List body</span></PullToRefresh>);
    const body = screen.getByText('List body');

    // purely horizontal
    await user.pointer([
      { keys: '[MouseLeft>]', target: body, coords: { clientX: 100, clientY: 100 } },
      { target: body, coords: { clientX: 300, clientY: 100 } },
      { keys: '[/MouseLeft]', target: body, coords: { clientX: 300, clientY: 100 } },
    ]);
    // horizontally dominant diagonal
    await user.pointer([
      { keys: '[MouseLeft>]', target: body, coords: { clientX: 100, clientY: 100 } },
      { target: body, coords: { clientX: 180, clientY: 130 } },
      { keys: '[/MouseLeft]', target: body, coords: { clientX: 180, clientY: 130 } },
    ]);
    // upward
    await user.pointer([
      { keys: '[MouseLeft>]', target: body, coords: { clientX: 100, clientY: 100 } },
      { target: body, coords: { clientX: 100, clientY: 40 } },
      { keys: '[/MouseLeft]', target: body, coords: { clientX: 100, clientY: 40 } },
    ]);

    expect(onRefresh).not.toHaveBeenCalled();
    expect(body.parentElement).toHaveStyle({ transform: 'translateY(0px)' });
    expect(headOf()).toHaveAttribute('data-phase', 'idle');
  });

  it('springs back without refreshing when the gesture is cancelled', () => {
    const onRefresh = vi.fn();
    render(<PullToRefresh onRefresh={onRefresh}><span>List body</span></PullToRefresh>);
    const content = screen.getByText('List body')
      .parentElement!;

    fireEvent.pointerDown(content, { pointerId: 1, clientY: 100, button: 0 });
    fireEvent.pointerMove(content, { pointerId: 1, clientY: 300 });
    // 200px raw → 64 + 68 = 132, capped at 2 × 64 = 128
    expect(content).toHaveStyle({ transform: 'translateY(128px)' });
    expect(headOf()).toHaveAttribute('data-phase', 'ready');

    fireEvent.pointerCancel(content, { pointerId: 1 });
    expect(onRefresh).not.toHaveBeenCalled();
    expect(content).toHaveStyle({ transform: 'translateY(0px)' });
    expect(headOf()).toHaveAttribute('data-phase', 'idle');
  });

  it('ignores moves without a prior pointerdown', async () => {
    const user = userEvent.setup();
    render(<PullToRefresh onRefresh={() => undefined}><span>List body</span></PullToRefresh>);
    const body = screen.getByText('List body');

    await user.pointer([{ target: body, coords: { clientX: 100, clientY: 200 } }]);
    expect(body.parentElement).toHaveStyle({ transform: 'translateY(0px)' });
  });

  it('ignores a second pointer while a gesture is tracked', () => {
    const onRefresh = vi.fn();
    render(<PullToRefresh onRefresh={onRefresh}><span>List body</span></PullToRefresh>);
    const content = screen.getByText('List body')
      .parentElement!;

    fireEvent.pointerDown(content, { pointerId: 1, clientY: 100, button: 0 });
    // second pointer lands: neither its down nor its moves may hijack
    fireEvent.pointerDown(content, { pointerId: 2, clientY: 100, button: 0 });
    fireEvent.pointerMove(content, { pointerId: 2, clientY: 300 });
    expect(content).toHaveStyle({ transform: 'translateY(0px)' });

    // the original pointer still owns the gesture
    fireEvent.pointerMove(content, { pointerId: 1, clientY: 300 });
    expect(content).toHaveStyle({ transform: 'translateY(128px)' });
    fireEvent.pointerUp(content, { pointerId: 1, clientY: 300 });
    expect(onRefresh).toHaveBeenCalledTimes(1);
  });

  it('preventDefaults touchmoves only while a pull is active', async () => {
    const user = userEvent.setup();
    render(<PullToRefresh onRefresh={() => undefined}><span>List body</span></PullToRefresh>);
    const body = screen.getByText('List body');

    // fireEvent returns the dispatchEvent result: false once any listener
    // (the guard) calls preventDefault on the cancelable event.
    // before any gesture: native scroll untouched
    expect(
      fireEvent.touchMove(document, {
        touches: [{ clientX: 100, clientY: 140 }],
        cancelable: true,
      }),
    ).toBe(true);

    await user.pointer([
      { keys: '[MouseLeft>]', target: body, coords: { clientX: 100, clientY: 100 } },
      { target: body, coords: { clientX: 100, clientY: 140 } },
    ]);
    // mid-pull: claimed
    expect(
      fireEvent.touchMove(document, {
        touches: [{ clientX: 100, clientY: 160 }],
        cancelable: true,
      }),
    ).toBe(false);

    await user.pointer([
      { keys: '[/MouseLeft]', target: body, coords: { clientX: 100, clientY: 160 } },
    ]);
    // released: back to native
    expect(
      fireEvent.touchMove(document, {
        touches: [{ clientX: 100, clientY: 180 }],
        cancelable: true,
      }),
    ).toBe(true);
  });

  it('removes the document touchmove guard on unmount mid-gesture', async () => {
    const user = userEvent.setup();
    const { unmount } = render(
      <PullToRefresh onRefresh={() => undefined}><span>List body</span></PullToRefresh>,
    );
    const body = screen.getByText('List body');

    await user.pointer([
      { keys: '[MouseLeft>]', target: body, coords: { clientX: 100, clientY: 100 } },
      { target: body, coords: { clientX: 100, clientY: 140 } },
    ]);
    unmount();

    // the guard is gone: the touchmove flows to native untouched
    expect(
      fireEvent.touchMove(document, {
        touches: [{ clientX: 100, clientY: 200 }],
        cancelable: true,
      }),
    ).toBe(true);
  });

  it('delegates the head to the indicator render prop', async () => {
    const user = userEvent.setup();
    render(
      <PullToRefresh
        onRefresh={() => undefined}
        indicator={({ phase, progress }) => (
          <em>{`custom:${phase}:${progress.toFixed(2)}`}</em>
        )}
      >
        <span>List body</span>
      </PullToRefresh>,
    );
    expect(screen.getByText('custom:idle:0.00')).toBeInTheDocument();

    const body = screen.getByText('List body');
    await user.pointer([
      { keys: '[MouseLeft>]', target: body, coords: { clientX: 100, clientY: 100 } },
      { target: body, coords: { clientX: 100, clientY: 132 } },
    ]);
    // 32px of the 64px threshold → progress 0.5
    expect(screen.getByText('custom:pulling:0.50')).toBeInTheDocument();

    await user.pointer([{ target: body, coords: { clientX: 100, clientY: 200 } }]);
    expect(screen.getByText('custom:ready:1.00')).toBeInTheDocument();
    expect(
      document.querySelector("[data-slot='indicator']"),
    ).toHaveTextContent('custom:ready:1.00');
  });

  it('renders custom status texts', async () => {
    const user = userEvent.setup();
    let resolveRefresh: (() => void) | undefined;
    render(
      <PullToRefresh
        pullingText="下拉刷新"
        readyText="松手刷新"
        refreshingText="正在刷新"
        onRefresh={() =>
          new Promise<void>((resolve) => {
            resolveRefresh = resolve;
          })
        }
      >
        <span>List body</span>
      </PullToRefresh>,
    );
    const body = screen.getByText('List body');

    await user.pointer([
      { keys: '[MouseLeft>]', target: body, coords: { clientX: 100, clientY: 100 } },
      { target: body, coords: { clientX: 100, clientY: 140 } },
    ]);
    expect(screen.getByText('下拉刷新')).toBeInTheDocument();

    await user.pointer([
      { target: body, coords: { clientX: 100, clientY: 200 } },
      { keys: '[/MouseLeft]', target: body, coords: { clientX: 100, clientY: 200 } },
    ]);
    expect(screen.getByText('正在刷新')).toBeInTheDocument();
    await settleRefresh(() => resolveRefresh?.());
  });

  it('hides the head from AT except while refreshing', async () => {
    const user = userEvent.setup();
    let resolveRefresh: (() => void) | undefined;
    render(
      <PullToRefresh
        onRefresh={() =>
          new Promise<void>((resolve) => {
            resolveRefresh = resolve;
          })
        }
      >
        <span>List body</span>
      </PullToRefresh>,
    );
    const body = screen.getByText('List body');

    expect(headOf()).toHaveAttribute('aria-hidden', 'true');
    await user.pointer([
      { keys: '[MouseLeft>]', target: body, coords: { clientX: 100, clientY: 100 } },
      { target: body, coords: { clientX: 100, clientY: 140 } },
    ]);
    // mid-pull the head stays decorative
    expect(headOf()).toHaveAttribute('aria-hidden', 'true');

    await user.pointer([
      { target: body, coords: { clientX: 100, clientY: 200 } },
      { keys: '[/MouseLeft]', target: body, coords: { clientX: 100, clientY: 200 } },
    ]);
    expect(headOf()).not.toHaveAttribute('aria-hidden');
    await settleRefresh(() => resolveRefresh?.());
    expect(headOf()).toHaveAttribute('aria-hidden', 'true');
  });

  it('has no axe violations at rest', async () => {
    const { axe } = await import('jest-axe');
    render(
      <PullToRefresh onRefresh={() => undefined}>
        <ul>
          <li>Item one</li>
        </ul>
      </PullToRefresh>,
    );
    const results = await axe(document.body, {
      rules: { region: { enabled: false } },
    });
    expect(results.violations).toEqual([]);
  });

  it('has no axe violations while refreshing', async () => {
    const { axe } = await import('jest-axe');
    render(
      <PullToRefresh onRefresh={() => new Promise<void>(() => undefined)}>
        <ul>
          <li>Item one</li>
        </ul>
      </PullToRefresh>,
    );
    const content = screen.getByText('Item one').closest(
      "[data-slot='content']",
    )!;
    fireEvent.pointerDown(content, { pointerId: 1, clientY: 100, button: 0 });
    fireEvent.pointerMove(content, { pointerId: 1, clientY: 300 });
    fireEvent.pointerUp(content, { pointerId: 1, clientY: 300 });
    expect(headOf()).toHaveAttribute('data-phase', 'refreshing');

    const results = await axe(document.body, {
      rules: { region: { enabled: false } },
    });
    expect(results.violations).toEqual([]);
  });
});
