import { render, screen, act, fireEvent } from '@testing-library/react';
import { expect } from 'vitest';

import { useIdle } from './useIdle';

function IdleMeter({ timeout = 1000 }: { timeout?: number }) {
  const { idle, lastActive } = useIdle({ timeout });
  return (
    <div>
      <span data-testid="idle">{String(idle)}</span>
      <span data-testid="last">{lastActive}</span>
    </div>
  );
}

describe('useIdle', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it('starts non-idle', () => {
    render(<IdleMeter />);
    expect(screen.getByTestId('idle')).toHaveTextContent('false');
  });

  it('becomes idle after timeout', async () => {
    render(<IdleMeter timeout={500} />);
    await act(() => Promise.resolve(vi.advanceTimersByTime(500)));
    expect(screen.getByTestId('idle')).toHaveTextContent('true');
  });

  it('resets to non-idle on activity', async () => {
    render(<IdleMeter timeout={500} />);
    await act(() => Promise.resolve(vi.advanceTimersByTime(500)));
    expect(screen.getByTestId('idle')).toHaveTextContent('true');

    fireEvent.mouseMove(document.body);
    expect(screen.getByTestId('idle')).toHaveTextContent('false');
  });

  it('goes idle again when activity stops', async () => {
    render(<IdleMeter timeout={300} />);
    fireEvent.keyDown(document.body);
    await act(() => Promise.resolve(vi.advanceTimersByTime(200)));
    fireEvent.mouseMove(document.body);
    await act(() => Promise.resolve(vi.advanceTimersByTime(200)));
    expect(screen.getByTestId('idle')).toHaveTextContent('false');
    await act(() => Promise.resolve(vi.advanceTimersByTime(300)));
    expect(screen.getByTestId('idle')).toHaveTextContent('true');
  });

  it('tracks lastActive timestamp', async () => {
    render(<IdleMeter timeout={5000} />);
    const first = screen.getByTestId('last').textContent;
    // fake timers advance Date.now too —— 间隔一点，比较才有意义。
    await act(() => Promise.resolve(vi.advanceTimersByTime(10)));
    fireEvent.mouseMove(document.body);
    const second = screen.getByTestId('last').textContent;
    expect(second).not.toBe(first);
    expect(Number(second)).toBeGreaterThanOrEqual(Number(first));
  });

  it('supports custom events list', async () => {
    function Custom() {
      const { idle } = useIdle({ timeout: 200, events: ['click'] });
      return <div data-testid="x">{String(idle)}</div>;
    }
    render(<Custom />);
    // mousemove 不在监听列表里 → 不至于复位
    fireEvent.mouseMove(document.body);
    await act(() => Promise.resolve(vi.advanceTimersByTime(250)));
    expect(screen.getByTestId('x')).toHaveTextContent('true');

    fireEvent.click(document.body);
    expect(screen.getByTestId('x')).toHaveTextContent('false');
  });

  it('default events listen for resize on window (document never gets it)', () => {
    function Probe() {
      useIdle({ timeout: 10_000 });
      return null;
    }
    const winAdd = vi.spyOn(window, 'addEventListener');
    const docAdd = vi.spyOn(document, 'addEventListener');
    render(<Probe />);
    // resize 只在 window 派发——挂在 document 上是死监听（修前形态）
    expect(winAdd.mock.calls.some(([t]) => t === 'resize')).toBe(true);
    expect(docAdd.mock.calls.some(([t]) => t === 'resize')).toBe(false);
    winAdd.mockRestore();
    docAdd.mockRestore();
  });

  it('inline events arrays with equal content do not re-subscribe', () => {
    const addSpy = vi.spyOn(document, 'addEventListener');
    const removeSpy = vi.spyOn(document, 'removeEventListener');
    function Probe({ tick }: { tick: number }) {
      useIdle({ timeout: 10_000, events: ['click'] });
      return <div data-testid="x">{tick}</div>;
    }
    const { rerender } = render(<Probe tick={1} />);
    vi.clearAllMocks();
    // 每次渲染都是新数组字面量但内容相等 → 不应触发解除/重挂
    rerender(<Probe tick={2} />);
    expect(addSpy).not.toHaveBeenCalled();
    expect(removeSpy).not.toHaveBeenCalled();
    addSpy.mockRestore();
    removeSpy.mockRestore();
  });
});
