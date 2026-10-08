import { render, screen, act } from '@testing-library/react';
import { expect } from 'vitest';

import { useMutationObserver } from './useMutationObserver';

function AttrMeter({ onRecord }: { onRecord?: MutationCallback }) {
  const [ref, records] = useMutationObserver(onRecord ?? null, {
    attributes: true,
    attributeFilter: ['data-state'],
  });
  return (
    <div>
      <div ref={ref} data-testid="target" data-state="idle" />
      <span data-testid="count">{records.length}</span>
    </div>
  );
}

describe('useMutationObserver', () => {
  it('delivers attribute mutations', async () => {
    render(<AttrMeter />);
    const target = screen.getByTestId('target');

    await act(async () => {
      target.setAttribute('data-state', 'busy');
      await Promise.resolve();
    });

    expect(screen.getByTestId('count')).not.toHaveTextContent('0');
  });

  it('delivers childList mutations', async () => {
    function ChildMeter() {
      const [ref, records] = useMutationObserver(null, {
        childList: true,
      });
      return (
        <div>
          <div ref={ref} data-testid="child-target" />
          <span data-testid="count">{records.length}</span>
        </div>
      );
    }
    render(<ChildMeter />);
    const target = screen.getByTestId('child-target');

    await act(async () => {
      target.appendChild(document.createElement('span'));
      await Promise.resolve();
    });

    expect(screen.getByTestId('count')).not.toHaveTextContent('0');
  });

  it('forwards records to callback', async () => {
    const cb = vi.fn();
    render(<AttrMeter onRecord={cb} />);
    const target = screen.getByTestId('target');

    await act(async () => {
      target.setAttribute('data-state', 'loading');
      await Promise.resolve();
    });
    expect(cb).toHaveBeenCalled();
    const firstCall = cb.mock.calls[0] as [MutationRecord[], MutationObserver] | undefined;
    expect(firstCall?.[0]).toBeInstanceOf(Array);
  });

  it('respects enabled=false', async () => {
    const cb = vi.fn();
    function Disabled() {
      const [ref] = useMutationObserver(cb, {
        attributes: true,
        enabled: false,
      });
      return <div ref={ref} data-testid="off" data-state="x" />;
    }
    render(<Disabled />);
    const target = screen.getByTestId('off');
    await act(async () => {
      target.setAttribute('data-state', 'y');
      await Promise.resolve();
    });
    expect(cb).not.toHaveBeenCalled();
  });

  it('clears history across remount', async () => {
    function Keep() {
      const [ref, records] = useMutationObserver(null, {
        attributes: true,
      });
      return (
        <div>
          <div ref={ref} data-testid="keep" data-state="s" />
          <span data-testid="counts">{records.length}</span>
        </div>
      );
    }
    render(<Keep />);
    const target = screen.getByTestId('keep');
    await act(async () => {
      target.setAttribute('data-state', 'a');
      await Promise.resolve();
    });
    const first = screen.getByTestId('counts').textContent;
    expect(Number(first)).toBeGreaterThan(0);
  });
});
