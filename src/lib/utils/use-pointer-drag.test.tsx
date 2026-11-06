import type { PointerEvent as ReactPointerEvent } from 'react';

import type { PointerDragSlopOptions } from './use-pointer-drag';

import { render, screen, fireEvent } from '@testing-library/react';

import { usePointerDrag } from './use-pointer-drag';

type SurfaceProps = {
  extract: (event: ReactPointerEvent<HTMLDivElement>) => number | null;
  apply: (value: number) => void;
  commit: (value: number) => void;
};

/** Eager mode (no options): applies straight from pointerdown. */
function EagerSurface({ extract, apply, commit }: SurfaceProps) {
  const drag = usePointerDrag<HTMLDivElement, number>(extract, apply, commit);
  return <div data-testid="surface" {...drag} />;
}

/** Slop mode: delayed takeover through the options overload. */
function SlopSurface({
  extract,
  apply,
  commit,
  options,
}: SurfaceProps & { options: PointerDragSlopOptions<HTMLDivElement> }) {
  const drag = usePointerDrag<HTMLDivElement>(extract, apply, commit, options);
  return <div data-testid="surface" {...drag} />;
}

const surfaceOf = () => screen.getByTestId('surface');

/**
 * jsdom has no pointer capture API — stub the trio pointer-capture's
 * guards probe so arming/releasing is observable.
 */
function stubCapture(el: HTMLElement) {
  const setPointerCapture = vi.fn();
  const releasePointerCapture = vi.fn();
  const hasPointerCapture = vi.fn(() => true);
  Object.assign(el, {
    setPointerCapture,
    releasePointerCapture,
    hasPointerCapture,
  });
  return { setPointerCapture, releasePointerCapture };
}

function down(el: HTMLElement, clientX: number, button = 0, pointerId = 1) {
  const event = new PointerEvent('pointerdown', {
    bubbles: true,
    cancelable: true,
    pointerId,
    button,
    clientX,
    pointerType: 'mouse',
  });
  el.dispatchEvent(event);
  return event;
}

const move = (el: HTMLElement, clientX: number, pointerId = 1) =>
  fireEvent.pointerMove(el, { pointerId, clientX });
const up = (el: HTMLElement, clientX: number, pointerId = 1) =>
  fireEvent.pointerUp(el, { pointerId, clientX });
const cancel = (el: HTMLElement, pointerId = 1) =>
  fireEvent.pointerCancel(el, { pointerId });

describe('usePointerDrag (eager)', () => {
  it('applies from pointerdown, streams matching-pointer moves and commits on release', () => {
    const apply = vi.fn();
    const commit = vi.fn();
    render(
      <EagerSurface
        extract={(event) => event.clientX}
        apply={apply}
        commit={commit}
      />
    );
    const el = surfaceOf();
    const capture = stubCapture(el);

    const event = down(el, 100);
    expect(event.defaultPrevented).toBe(true); // eager presses own the surface
    expect(capture.setPointerCapture).toHaveBeenCalledWith(1);
    expect(apply).toHaveBeenCalledWith(100);

    move(el, 140);
    expect(apply).toHaveBeenLastCalledWith(140);

    move(el, 999, 2); // another pointer's move is not this gesture
    expect(apply).toHaveBeenCalledTimes(2);

    up(el, 160);
    expect(commit).toHaveBeenCalledWith(160);
    expect(capture.releasePointerCapture).toHaveBeenCalledWith(1);
  });

  it('ignores non-primary buttons and null extracts', () => {
    const apply = vi.fn();
    const commit = vi.fn();
    const { rerender } = render(
      <EagerSurface
        extract={(event) => event.clientX}
        apply={apply}
        commit={commit}
      />
    );
    const el = surfaceOf();
    const capture = stubCapture(el);

    const secondary = down(el, 100, 2);
    expect(secondary.defaultPrevented).toBe(false);
    expect(capture.setPointerCapture).not.toHaveBeenCalled();
    expect(apply).not.toHaveBeenCalled();

    rerender(
      <EagerSurface extract={() => null} apply={apply} commit={commit} />
    );
    down(el, 100);
    move(el, 140);
    up(el, 140);
    expect(apply).not.toHaveBeenCalled();
    expect(commit).not.toHaveBeenCalled();
  });

  it('aborts on cancel without recording a commit', () => {
    const apply = vi.fn();
    const commit = vi.fn();
    render(
      <EagerSurface
        extract={(event) => event.clientX}
        apply={apply}
        commit={commit}
      />
    );
    const el = surfaceOf();
    const capture = stubCapture(el);

    down(el, 100);
    move(el, 130);
    cancel(el);
    expect(commit).not.toHaveBeenCalled();
    expect(capture.releasePointerCapture).toHaveBeenCalledWith(1);

    // The aborted gesture is over: later events from the same pointer
    // no longer stream.
    move(el, 150);
    expect(apply).toHaveBeenCalledTimes(2);
  });
});

describe('usePointerDrag slop option', () => {
  const slop4 = { slop: 4 };

  it('keeps a sub-threshold press a plain click (zero side effects)', () => {
    const apply = vi.fn();
    const commit = vi.fn();
    const onGestureStart = vi.fn();
    render(
      <SlopSurface
        extract={(event) => event.clientX}
        apply={apply}
        commit={commit}
        options={{ ...slop4, onGestureStart }}
      />
    );
    const el = surfaceOf();
    const capture = stubCapture(el);

    const event = down(el, 100);
    expect(event.defaultPrevented).toBe(false); // a plain click so far
    move(el, 102); // within the slop
    up(el, 102);
    expect(capture.setPointerCapture).not.toHaveBeenCalled();
    expect(onGestureStart).not.toHaveBeenCalled();
    expect(apply).not.toHaveBeenCalled();
    expect(commit).not.toHaveBeenCalled(); // never taken over
  });

  it('takes over at the threshold, then applies and commits', () => {
    const apply = vi.fn();
    const commit = vi.fn();
    const onGestureStart = vi.fn();
    render(
      <SlopSurface
        extract={(event) => event.clientX}
        apply={apply}
        commit={commit}
        options={{ ...slop4, onGestureStart }}
      />
    );
    const el = surfaceOf();
    const capture = stubCapture(el);

    down(el, 100);
    move(el, 104); // |104 - 100| >= 4: takeover
    expect(capture.setPointerCapture).toHaveBeenCalledWith(1);
    expect(onGestureStart).toHaveBeenCalledTimes(1);
    expect(apply).toHaveBeenLastCalledWith(104);

    // Takeover is sticky: dipping back inside the threshold keeps
    // streaming (the press is a drag now, not a click).
    move(el, 102);
    expect(apply).toHaveBeenLastCalledWith(102);

    up(el, 102);
    expect(commit).toHaveBeenCalledWith(102);
    expect(capture.releasePointerCapture).toHaveBeenCalledWith(1);
  });

  it('aborts a taken-over gesture on cancel without committing', () => {
    const apply = vi.fn();
    const commit = vi.fn();
    render(
      <SlopSurface
        extract={(event) => event.clientX}
        apply={apply}
        commit={commit}
        options={slop4}
      />
    );
    const el = surfaceOf();
    const capture = stubCapture(el);

    down(el, 100);
    move(el, 110); // takeover
    cancel(el);
    expect(commit).not.toHaveBeenCalled();
    expect(capture.releasePointerCapture).toHaveBeenCalledWith(1);
  });
});
