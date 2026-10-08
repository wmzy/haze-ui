import { render, screen, act } from '@testing-library/react';
import { expect } from 'vitest';

import { useResizeObserver } from './useResizeObserver';

type EntryFactory = (target: Element, rect: DOMRect) => ResizeObserverEntry;

const makeEntry: EntryFactory = (target, contentRect) =>
  ({
    target,
    contentRect,
    borderBoxSize: [],
    contentBoxSize: [],
    devicePixelContentBoxSize: [],
  });

function setupMockObserver() {
  const callbacks: ResizeObserverCallback[] = [];
  const observers: MockObserver[] = [];
  class MockObserver {
    cb: ResizeObserverCallback;
    observed: Element[] = [];
    disconnected = false;
    constructor(cb: ResizeObserverCallback) {
      this.cb = cb;
      callbacks.push(cb);
      observers.push(this);
    }
    observe(el: Element) {
      this.observed.push(el);
    }
    unobserve(el: Element) {
      this.observed = this.observed.filter((x) => x !== el);
    }
    disconnect() {
      this.disconnected = true;
      this.observed = [];
    }
  }
  vi.stubGlobal('ResizeObserver', MockObserver);
  return { observers, callbacks };
}

function ShowSize() {
  const [ref, entry] = useResizeObserver<HTMLDivElement>();
  return (
    <div ref={ref} data-testid="target">
      {entry ? `${entry.contentRect.width}×${entry.contentRect.height}` : 'no-entry'}
    </div>
  );
}

describe('useResizeObserver', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('observes node when ResizeObserver exists', () => {
    const { observers } = setupMockObserver();
    render(<ShowSize />);

    expect(observers).toHaveLength(1);
    const observer = observers[0];
    if (!observer) throw new Error('observer missing');
    expect(observer.observed).toHaveLength(1);
    expect(observer.observed[0]).toBe(screen.getByTestId('target'));
    expect(screen.getByTestId('target')).toHaveTextContent('no-entry');
  });

  it('updates entry when observer fires', () => {
    const { observers, callbacks } = setupMockObserver();
    render(<ShowSize />);
    const target = screen.getByTestId('target');
    const observer = observers[0];
    if (!observer) throw new Error('observer missing');
    expect(observer.observed[0]).toBe(target);

    const entry = makeEntry(target, new DOMRect(0, 0, 400, 200));
    const cb = callbacks[0];
    if (!cb) throw new Error('callback missing');
    act(() => {
      cb([entry], observer);
    });
    expect(screen.getByTestId('target')).toHaveTextContent('400×200');
  });

  it('disconnects on unmount', () => {
    const { observers } = setupMockObserver();
    const { unmount } = render(<ShowSize />);
    const observer = observers[0];
    if (!observer) throw new Error('observer missing');
    expect(observer.disconnected).toBe(false);
    unmount();
    expect(observer.disconnected).toBe(true);
  });

  it('is a no-op without ResizeObserver', () => {
    // 不 stub，jsdom ≤23 里 ResizeObserver 可能也不存在——skip stub 并依赖
    // 全局判定；若全局已有实现还是跳过这个语义
    if (typeof globalThis.ResizeObserver === 'function') {
      vi.stubGlobal('ResizeObserver', undefined);
    }
    render(<ShowSize />);
    expect(screen.getByTestId('target')).toHaveTextContent('no-entry');
  });

  it('respects enabled=false (no observation)', () => {
    const { observers } = setupMockObserver();
    function Disabled() {
      const [ref] = useResizeObserver<HTMLDivElement>({ enabled: false });
      return <div ref={ref} data-testid="disabled-target" />;
    }
    render(<Disabled />);
    expect(observers).toHaveLength(0);
    expect(screen.getByTestId('disabled-target')).toBeInTheDocument();
  });
});
