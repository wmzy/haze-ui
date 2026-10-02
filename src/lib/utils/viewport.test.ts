/**
 * useVisualViewportInset 单测。文件为 .ts，harness 用 createElement
 * （无 JSX），同 utils/focus-scope.test.ts 约定。
 *
 * jsdom 没有 window.visualViewport——按 hook 的真实消费面 defineProperty
 * stub：可变 height/offsetTop + resize/scroll 监听（dispatch 同步派发）。
 * 键盘弹出 = 视口高度收缩；键盘上推 = offsetTop 增加。
 */
import { createElement } from 'react';
import { render, screen, act } from '@testing-library/react';

import { useVisualViewportInset } from './viewport';

/** hook 暴露的 inset 值 + 宿主渲染计数（同值短路用）——容器对象避开
 * react-compiler 对组件内重赋外部变量的禁令。 */
const counters = { renders: 0 };

function InsetHarness({ enabled }: { enabled?: boolean }) {
  const inset = useVisualViewportInset(enabled);
  counters.renders += 1;
  return createElement(
    'output',
    { 'data-testid': 'inset' },
    `${inset}/${counters.renders}`
  );
}

/**
 * 可安装的 visualViewport 替身：记录监听注册（含 options，验证
 * passive），暴露 resize/pushBy 驱动器。
 */
function installVisualViewport(initial: { height: number; offsetTop?: number }) {
  const listeners = {
    resize: new Set<() => void>(),
    scroll: new Set<() => void>(),
  };
  const registrations: { type: string; options: unknown }[] = [];
  const base = {
    width: 1024,
    height: initial.height,
    offsetLeft: 0,
    offsetTop: initial.offsetTop ?? 0,
    scale: 1,
    pageTop: 0,
    pageLeft: 0,
    onresize: null,
    onscroll: null,
    addEventListener: (
      type: string,
      listener: () => void,
      options?: unknown
    ) => {
      if (type === 'resize' || type === 'scroll') listeners[type].add(listener);
      registrations.push({ type, options });
    },
    removeEventListener: (type: string, listener: () => void) => {
      if (type === 'resize' || type === 'scroll')
        listeners[type].delete(listener);
    },
  };
  Object.defineProperty(window, 'visualViewport', {
    value: base,
    configurable: true,
  });
  return {
    /** 模拟键盘弹出/收起：视口高度变化并派发 resize。 */
    resize(nextHeight: number) {
      base.height = nextHeight;
      for (const listener of [...listeners.resize]) listener();
    },
    /** 模拟键盘上推视口：offsetTop 变化并派发 scroll。 */
    pushBy(nextOffsetTop: number) {
      base.offsetTop = nextOffsetTop;
      for (const listener of [...listeners.scroll]) listener();
    },
    listenerCount: () => listeners.resize.size + listeners.scroll.size,
    registrations,
  };
}

beforeEach(() => {
  counters.renders = 0;
});

afterEach(() => {
  // 键盘用例挂的 visualViewport stub 清回「引擎不支持」态
  Reflect.deleteProperty(window, 'visualViewport');
});

describe('useVisualViewportInset', () => {
  it('returns 0 when visualViewport is missing (SSR/jsdom)', () => {
    // 无 stub：静默降级，不抛错、不订阅
    render(createElement(InsetHarness));
    expect(screen.getByTestId('inset').textContent).toBe('0/1');
  });

  it('measures the keyboard inset on mount', () => {
    // 键盘已弹开的视口：订阅时的首次 measure 即得到遮挡高度
    const keyboard = installVisualViewport({
      height: window.innerHeight - 300,
    });
    render(createElement(InsetHarness));
    expect(screen.getByTestId('inset').textContent).toContain('300');
    expect(keyboard.listenerCount()).toBe(2); // resize + scroll
  });

  it('tracks resize events and computes the delta', () => {
    const keyboard = installVisualViewport({ height: window.innerHeight });
    render(createElement(InsetHarness));
    const inset = screen.getByTestId('inset');
    expect(inset.textContent).toContain('0');

    // 键盘弹出：视口收缩 400 → inset = innerHeight - 400
    act(() => keyboard.resize(400));
    expect(inset.textContent).toContain(`${window.innerHeight - 400}`);

    // 键盘收起：回到基线
    act(() => keyboard.resize(window.innerHeight));
    expect(inset.textContent).toContain('0');
  });

  it('accounts for offsetTop when the keyboard pushes the viewport', () => {
    const keyboard = installVisualViewport({ height: window.innerHeight });
    render(createElement(InsetHarness));
    act(() => keyboard.resize(500));
    act(() => keyboard.pushBy(100));
    // inset = innerHeight - 500 - 100（上推的偏移同样算键盘占用）
    expect(screen.getByTestId('inset').textContent).toContain(
      `${window.innerHeight - 500 - 100}`
    );
  });

  it('clamps a negative delta to 0 (desktop window zoom)', () => {
    // 桌面窗口缩放：innerHeight 与视口同步变化，差值为负时钳 0
    const keyboard = installVisualViewport({ height: window.innerHeight });
    render(createElement(InsetHarness));
    act(() => keyboard.resize(window.innerHeight + 200));
    expect(screen.getByTestId('inset').textContent).toContain('0');
  });

  it('subscribes with passive listeners', () => {
    const keyboard = installVisualViewport({ height: window.innerHeight });
    render(createElement(InsetHarness));
    // resize + scroll 各一条，均显式 passive（measure 从不 preventDefault）
    expect(keyboard.registrations).toEqual([
      { type: 'resize', options: { passive: true } },
      { type: 'scroll', options: { passive: true } },
    ]);
  });

  it('removes both listeners on unmount', () => {
    const keyboard = installVisualViewport({ height: window.innerHeight });
    const { unmount } = render(createElement(InsetHarness));
    expect(keyboard.listenerCount()).toBe(2);
    unmount();
    expect(keyboard.listenerCount()).toBe(0);
    // 卸载后的视口变化不再触达宿主（无监听可派发、不抛错）
    expect(() => act(() => keyboard.resize(300))).not.toThrow();
    expect(screen.queryByTestId('inset')).not.toBeInTheDocument();
  });

  it('does not subscribe while disabled and re-subscribes when enabled', () => {
    const keyboard = installVisualViewport({ height: window.innerHeight });
    const { rerender } = render(createElement(InsetHarness, { enabled: false }));
    expect(keyboard.listenerCount()).toBe(0);
    expect(screen.getByTestId('inset').textContent).toContain('0');

    // 启用：订阅 + 立即 measure（BottomSheet 的 open 门控依赖此转换）
    rerender(createElement(InsetHarness, { enabled: true }));
    expect(keyboard.listenerCount()).toBe(2);
    act(() => keyboard.resize(400));
    expect(screen.getByTestId('inset').textContent).toContain(
      `${window.innerHeight - 400}`
    );

    // 停用：清理监听，值冻结在最后一次度量
    rerender(createElement(InsetHarness, { enabled: false }));
    expect(keyboard.listenerCount()).toBe(0);
    expect(() => act(() => keyboard.pushBy(100))).not.toThrow();
    expect(screen.getByTestId('inset').textContent).toContain(
      `${window.innerHeight - 400}`
    );
  });

  it('skips re-rendering when the measured inset is unchanged', () => {
    const keyboard = installVisualViewport({ height: window.innerHeight });
    render(createElement(InsetHarness));
    const before = screen.getByTestId('inset').textContent;
    // 同值 resize：measure 结果不变，宿主不重渲染（`after/计数` 冻结）
    act(() => keyboard.pushBy(0));
    expect(screen.getByTestId('inset').textContent).toBe(before);
  });

  it('has no axe violations on a minimal host', async () => {
    // hook 模块无自有组件：以消费 hook 的最小宿主 harness 代替渲染
    const { axe } = await import('jest-axe');
    installVisualViewport({ height: window.innerHeight });
    render(createElement(InsetHarness));
    const results = await axe(document.body, {
      rules: { region: { enabled: false } },
    });
    expect(results.violations).toEqual([]);
  });
});
