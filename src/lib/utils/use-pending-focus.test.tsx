import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';

import { usePendingFocus } from './use-pending-focus';

/**
 * Drives the hook through its public surface. `resolvable` stands in for
 * "the pending target is mounted" (a virtualized row that scrolled into
 * the window, a subtree whose expansion commit landed); `applied` records
 * every successful attempt so tests can assert apply-exactly-once.
 */
function Probe({
  resolvable,
  onApplied,
  onResult,
}: {
  resolvable: boolean;
  onApplied: (key: string) => void;
  onResult: (applied: boolean) => void;
}) {
  const [tick, setTick] = useState(0);
  const controller = usePendingFocus((key: string) => {
    if (!resolvable) return false;
    onApplied(key);
    return true;
  });
  return (
    <div>
      <button type='button' onClick={() => controller.request('a')}>
        request-a
      </button>
      <button type='button' onClick={() => controller.request('b')}>
        request-b
      </button>
      <button type='button' onClick={() => onResult(controller.attemptNow('a'))}>
        attempt-now
      </button>
      <button type='button' onClick={() => controller.clear()}>
        clear
      </button>
      <button type='button' onClick={() => setTick(tick + 1)}>
        rerender
      </button>
      <span data-testid='tick'>{tick}</span>
    </div>
  );
}

/** Harness flipping `resolvable` from the outside, the way a row-model
 *  change mounts the pending target one commit later. */
function Harness({
  onApplied,
  onResult,
}: {
  onApplied: (key: string) => void;
  onResult: (applied: boolean) => void;
}) {
  const [resolvable, setResolvable] = useState(false);
  return (
    <div>
      <Probe resolvable={resolvable} onApplied={onApplied} onResult={onResult} />
      <button type='button' onClick={() => setResolvable(true)}>
        mount-target
      </button>
    </div>
  );
}

const noop = () => undefined;

describe('usePendingFocus', () => {
  it('applies a request on its own commit and never re-applies it', async () => {
    const user = userEvent.setup();
    const applied: string[] = [];
    render(
      <Probe resolvable onApplied={(key) => applied.push(key)} onResult={noop} />
    );

    await user.click(screen.getByRole('button', { name: 'request-a' }));
    expect(applied).toEqual(['a']);

    // Later commits must not resurrect the cleared request.
    await user.click(screen.getByRole('button', { name: 'rerender' }));
    await user.click(screen.getByRole('button', { name: 'rerender' }));
    expect(applied).toEqual(['a']);
  });

  it('keeps the request pending while the target is missing and applies it when it appears', async () => {
    const user = userEvent.setup();
    const applied: string[] = [];
    render(<Harness onApplied={(key) => applied.push(key)} onResult={noop} />);

    await user.click(screen.getByRole('button', { name: 'request-a' }));
    expect(applied).toEqual([]);

    await user.click(screen.getByRole('button', { name: 'mount-target' }));
    expect(applied).toEqual(['a']);
  });

  it('lets a later request replace an earlier queued one', async () => {
    const user = userEvent.setup();
    const applied: string[] = [];
    render(<Harness onApplied={(key) => applied.push(key)} onResult={noop} />);

    await user.click(screen.getByRole('button', { name: 'request-a' }));
    await user.click(screen.getByRole('button', { name: 'request-b' }));
    await user.click(screen.getByRole('button', { name: 'mount-target' }));
    expect(applied).toEqual(['b']);
  });

  it('clear drops the queued request without applying it', async () => {
    const user = userEvent.setup();
    const applied: string[] = [];
    render(<Harness onApplied={(key) => applied.push(key)} onResult={noop} />);

    await user.click(screen.getByRole('button', { name: 'request-a' }));
    await user.click(screen.getByRole('button', { name: 'clear' }));
    await user.click(screen.getByRole('button', { name: 'mount-target' }));
    expect(applied).toEqual([]);
  });

  it('attemptNow reports the outcome and never queues a failed attempt', async () => {
    const user = userEvent.setup();
    const applied: string[] = [];
    const results: boolean[] = [];
    render(
      <Harness onApplied={(key) => applied.push(key)} onResult={(ok) => results.push(ok)} />
    );

    // Target missing: reports false, and nothing stays queued.
    await user.click(screen.getByRole('button', { name: 'attempt-now' }));
    expect(results).toEqual([false]);
    await user.click(screen.getByRole('button', { name: 'mount-target' }));
    expect(applied).toEqual([]);

    // Target present: reports true (already applied synchronously).
    await user.click(screen.getByRole('button', { name: 'attempt-now' }));
    expect(results).toEqual([false, true]);
    expect(applied).toEqual(['a']);
  });
});
