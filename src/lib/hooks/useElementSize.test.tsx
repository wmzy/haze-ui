import { render, screen, act } from '@testing-library/react';
import { useEffect } from 'react';
import { expect } from 'vitest';

import { useElementSize } from './useElementSize';

function setupMockObserver() {
  const callbacks: ResizeObserverCallback[] = [];
  const observers: MockObserver[] = [];
  class MockObserver {
    cb: ResizeObserverCallback;
    observed: Element[] = [];
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
      // no-op: 测试里只为证明"被调用"，断言用 disconnected 与否要靠
      // useElementSize 自身的 cleanup 行为（.mock.calls 也可）
    }
  }
  vi.stubGlobal('ResizeObserver', MockObserver);
  return { observers, callbacks };
}

function fire(target: Element, w: number, h: number, callbacks: ResizeObserverCallback[]) {
  const entry = {
    target,
    contentRect: new DOMRect(0, 0, w, h),
    borderBoxSize: [],
    contentBoxSize: [],
    devicePixelContentBoxSize: [],
  } as unknown as ResizeObserverEntry;
  const first = callbacks[0];
  if (first) act(() => first([entry], {} as ResizeObserver));
}

function SizeMeter() {
  const [ref, size] = useElementSize<HTMLDivElement>();
  return (
    <div ref={ref} data-testid="meter">
      {size.width}×{size.height}
    </div>
  );
}

describe('useElementSize', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('returns zero size before first measure', () => {
    setupMockObserver();
    render(<SizeMeter />);
    expect(screen.getByTestId('meter')).toHaveTextContent('0×0');
  });

  it('updates when observer fires', () => {
    const { callbacks } = setupMockObserver();
    render(<SizeMeter />);
    const target = screen.getByTestId('meter');
    fire(target, 320, 240, callbacks);
    expect(screen.getByTestId('meter')).toHaveTextContent('320×240');
  });

  it('does not rerender for unchanged size', () => {
    const { callbacks } = setupMockObserver();
    const renderLog: number[] = [];
    function Meter() {
      const [ref, size] = useElementSize<HTMLDivElement>();
      // react-hooks/globals 不允许在渲染期改模块级变量——，移到 effect 里
      useEffect(() => {
        renderLog.push(size.width);
      }, [size]);
      return (
        <div ref={ref} data-testid="meter">
          {size.width}
        </div>
      );
    }
    render(<Meter />);
    const target = screen.getByTestId('meter');
    const before = renderLog.length;
    fire(target, 100, 100, callbacks);
    const afterFirst = renderLog.length;
    fire(target, 100, 100, callbacks);
    expect(renderLog.length).toBe(afterFirst);
    expect(afterFirst).toBeGreaterThan(before);
  });

  it('prefers borderBoxSize when box=border-box', () => {
    const { callbacks } = setupMockObserver();
    function Border() {
      const [ref, size] = useElementSize<HTMLDivElement>({ box: 'border-box' });
      return (
        <div ref={ref} data-testid="border-meter">
          {size.width}×{size.height}
        </div>
      );
    }
    render(<Border />);
    const target = screen.getByTestId('border-meter');
    const entry = {
      target,
      contentRect: new DOMRect(0, 0, 10, 10), // 不带 padding 的 content-box
      borderBoxSize: [{ inlineSize: 30, blockSize: 40 }],
      contentBoxSize: [],
      devicePixelContentBoxSize: [],
    } as unknown as ResizeObserverEntry;
    const cb = callbacks[0];
    if (!cb) throw new Error('callback missing');
    act(() => cb([entry], {} as ResizeObserver));
    expect(screen.getByTestId('border-meter')).toHaveTextContent('30×40');
  });
});
