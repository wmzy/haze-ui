import type { RefObject } from 'react';

import { expect } from 'vitest';
import { act, render, renderHook, screen } from '@testing-library/react';

import { useCallbackRef, useMergedRefs } from './refs';

type InputRefObject = RefObject<HTMLInputElement | null>;
type InputCallback = (node: HTMLInputElement | null) => void;

describe('useMergedRefs', () => {
  it('keeps one identity while every member ref does', () => {
    const internal: InputRefObject = { current: null };
    const consumer = vi.fn();
    const { result, rerender } = renderHook(() =>
      useMergedRefs(internal, consumer)
    );

    const first = result.current;
    rerender();

    expect(result.current).toBe(first);
  });

  it('changes identity exactly when a member ref is replaced', () => {
    const internal: InputRefObject = { current: null };
    const { result, rerender } = renderHook(
      ({ consumer }: { consumer: InputCallback }) =>
        useMergedRefs(internal, consumer),
      { initialProps: { consumer: vi.fn() } }
    );

    const first = result.current;
    rerender({ consumer: vi.fn() });

    expect(result.current).not.toBe(first);
  });

  it('forwards the node to every member, skipping undefined ones', () => {
    const internal: InputRefObject = { current: null };
    const consumer = vi.fn();
    const merged = renderHook(() =>
      useMergedRefs(internal, undefined, consumer)
    ).result.current;
    const node = document.createElement('input');

    act(() => merged(node));
    act(() => merged(null));

    expect(consumer).toHaveBeenCalledTimes(2);
    expect(consumer).toHaveBeenNthCalledWith(1, node);
    expect(consumer).toHaveBeenNthCalledWith(2, null);
    expect(internal.current).toBeNull();
  });

  it('attaches the node to both refs and detaches both on unmount', () => {
    const internal: InputRefObject = { current: null };
    const consumer = vi.fn();
    const { unmount } = render(
      <Field internal={internal} consumer={consumer} />
    );
    const input = screen.getByRole('textbox', { name: 'field' });

    expect(internal.current).toBe(input);
    expect(consumer).toHaveBeenCalledOnce();
    expect(consumer).toHaveBeenCalledWith(input);

    unmount();

    expect(internal.current).toBeNull();
    expect(consumer).toHaveBeenLastCalledWith(null);
  });

  it('does not churn the member refs on a re-render', () => {
    const internal: InputRefObject = { current: null };
    const consumer = vi.fn();
    const { rerender } = render(
      <Field internal={internal} consumer={consumer} />
    );

    rerender(<Field internal={internal} consumer={consumer} />);

    // Still exactly the one attach: no (null, node) round trip.
    expect(consumer).toHaveBeenCalledOnce();
    expect(internal.current).toBe(
      screen.getByRole('textbox', { name: 'field' })
    );
  });

  it('re-attaches when the consumer swaps its callback ref', () => {
    const internal: InputRefObject = { current: null };
    const first = vi.fn();
    const second = vi.fn();
    const { rerender } = render(<Field internal={internal} consumer={first} />);
    const input = screen.getByRole('textbox', { name: 'field' });

    rerender(<Field internal={internal} consumer={second} />);

    expect(first).toHaveBeenLastCalledWith(null);
    expect(second).toHaveBeenCalledOnce();
    expect(second).toHaveBeenCalledWith(input);
    expect(internal.current).toBe(input);
  });
});

describe('useCallbackRef', () => {
  it('is the single-ref form: stable identity, attach and detach forwarded', () => {
    const internal: InputRefObject = { current: null };
    const { result, rerender } = renderHook(() => useCallbackRef(internal));
    const node = document.createElement('input');

    const callback = result.current;
    act(() => callback(node));
    expect(internal.current).toBe(node);

    act(() => callback(null));
    expect(internal.current).toBeNull();

    rerender();
    expect(result.current).toBe(callback);
  });
});

/** A component with its own input handle that also forwards the consumer's ref. */
function Field({
  internal,
  consumer,
}: {
  internal: InputRefObject;
  consumer: InputCallback;
}) {
  const setInputRef = useMergedRefs(internal, consumer);
  return <input ref={setInputRef} type='text' aria-label='field' />;
}
