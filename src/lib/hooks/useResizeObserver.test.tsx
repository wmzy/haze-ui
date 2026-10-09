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

  it('keeps a stable ref callback identity across rerenders', () => {
    // 回归钉：React 19 对身份变化的 ref 会 null-detach + re-attach。若 ref
    // 每次渲染都是新函数，则每渲染 disconnect+重建 observe，而 RO 每次
    // observe 后回调新 entry 实例 → setEntry 恒触发重渲 → 无限循环
    // （jsdom 无 RO 只在消费方浏览器暴露）。useCallback([box, enabled])
    // 保证同参渲染间 ref 引用相等。
    setupMockObserver();
    const captured: unknown[] = [];
    function Probe({ tick }: { tick: number }) {
      const [ref] = useResizeObserver<HTMLDivElement>();
      captured.push(ref);
      return <div ref={ref}>{tick}</div>;
    }
    const { rerender } = render(<Probe tick={0} />);
    rerender(<Probe tick={1} />);
    rerender(<Probe tick={2} />);
    expect(captured.length).toBeGreaterThanOrEqual(3);
    for (const ref of captured) {
      expect(ref).toBe(captured[0]);
    }
  });

  it('freezes the last entry when disabled and re-observes when re-enabled', () => {
    const { observers, callbacks } = setupMockObserver();
    function Probe({ enabled }: { enabled: boolean }) {
      const [ref, entry] = useResizeObserver<HTMLDivElement>({ enabled });
      return (
        <div ref={ref} data-testid="toggle">
          {entry ? `${entry.contentRect.width}` : 'no-entry'}
        </div>
      );
    }
    const { rerender } = render(<Probe enabled />);
    const target = screen.getByTestId('toggle');
    const first = observers[0];
    const firstCb = callbacks[0];
    if (!first || !firstCb) throw new Error('observer/callback missing');
    act(() => {
      firstCb([makeEntry(target, new DOMRect(0, 0, 300, 100))], first);
    });
    expect(target).toHaveTextContent('300');

    // 禁用：ref 身份变化 → detach(null) 断开；entry 冻结为最后值
    rerender(<Probe enabled={false} />);
    expect(first.disconnected).toBe(true);
    expect(target).toHaveTextContent('300');

    // 复启：新 ref re-attach(node) → 全新观察器重新挂上同一节点
    rerender(<Probe enabled />);
    expect(observers.length).toBeGreaterThanOrEqual(2);
    const second = observers[observers.length - 1];
    if (!second) throw new Error('second observer missing');
    expect(second).not.toBe(first);
    expect(second.observed[0]).toBe(target);
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
