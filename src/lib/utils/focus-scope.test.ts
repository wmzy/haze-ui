/**
 * useFocusScope 单测。文件按验收命令约定为 .ts，因此 harness 用
 * createElement（无 JSX）。
 *
 * jsdom 事实：body.focus() 是 no-op（断言 body 焦点经由 blur 回落）；
 * user-event 的 tab 遵循 keydown 的 preventDefault。
 */
import { createElement } from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { useFocusScope } from './focus-scope';

type HarnessProps = {
  enabled: boolean;
  trapped?: boolean;
  autoFocus?: boolean;
  returnFocus?: boolean;
  onMountAutoFocus?: (event: Event) => void;
  onUnmountAutoFocus?: (event: Event) => void;
  /** 激活期间卸载 opener/outside（归还目标卸载回落 body 用） */
  hideOpener?: boolean;
  /** 变化时 scope 节点卸载重挂（换节点用） */
  scopeKey?: number;
  /** scope 内无 tabbable 子元素 */
  emptyScope?: boolean;
};

/** 最小宿主：opener/outside 在 scope 外，scope 内含 first/middle/last。 */
function ScopeHarness(props: HarnessProps) {
  const {
    enabled,
    trapped,
    autoFocus,
    returnFocus,
    onMountAutoFocus,
    onUnmountAutoFocus,
    hideOpener = false,
    scopeKey = 0,
    emptyScope = false,
  } = props;
  const setScope = useFocusScope({
    enabled,
    trapped,
    autoFocus,
    returnFocus,
    onMountAutoFocus,
    onUnmountAutoFocus,
  });
  return createElement(
    'div',
    null,
    !hideOpener && createElement('button', { type: 'button' }, 'opener'),
    !hideOpener && createElement('button', { type: 'button' }, 'outside'),
    createElement(
      'div',
      { key: scopeKey, 'data-testid': 'scope', ref: setScope },
      emptyScope
        ? 'plain text'
        : createElement(
            'div',
            null,
            createElement('button', { type: 'button' }, 'first'),
            createElement('button', { type: 'button' }, 'middle'),
            createElement('button', { type: 'button' }, 'last')
          )
    )
  );
}

function scopeButton(name: string): HTMLElement {
  return screen.getByRole('button', { name });
}

/** 索引取元素：取不到即测试失败（noUncheckedIndexedAccess 显式兜底）。 */
function at<T>(els: readonly T[], index: number): T {
  const el = els[index];
  if (!el) throw new Error(`test setup: no element at index ${index}`);
  return el;
}

describe('useFocusScope mount semantics', () => {
  it('moves focus to the first tabbable when enabled', () => {
    const { rerender } = render(createElement(ScopeHarness, { enabled: false }));
    scopeButton('opener').focus();
    rerender(createElement(ScopeHarness, { enabled: true }));
    expect(scopeButton('first')).toHaveFocus();
  });

  it('keeps focus untouched when autoFocus is false', () => {
    const { rerender } = render(
      createElement(ScopeHarness, { enabled: false, autoFocus: false })
    );
    scopeButton('opener').focus();
    rerender(createElement(ScopeHarness, { enabled: true, autoFocus: false }));
    expect(scopeButton('opener')).toHaveFocus();
  });

  it('focuses the scope container itself when there are no tabbables', () => {
    render(createElement(ScopeHarness, { enabled: true, emptyScope: true }));
    const scope = screen.getByTestId('scope');
    expect(scope).toHaveFocus();
    // 容器补设 tabIndex=-1 才可编程聚焦
    expect(scope.tabIndex).toBe(-1);
  });

  it('dispatches a cancelable hazefocusmount; preventDefault skips autofocus', () => {
    const { rerender } = render(createElement(ScopeHarness, { enabled: false }));
    const scope = screen.getByTestId('scope');
    const seen: Event[] = [];
    const listener = (event: Event) => {
      seen.push(event);
      event.preventDefault();
    };
    scope.addEventListener('hazefocusmount', listener);
    scopeButton('opener').focus();
    rerender(createElement(ScopeHarness, { enabled: true }));
    scope.removeEventListener('hazefocusmount', listener);
    expect(seen).toHaveLength(1);
    const mountEvent = at(seen, 0);
    expect(mountEvent.type).toBe('hazefocusmount');
    expect(mountEvent.bubbles).toBe(false);
    expect(mountEvent.cancelable).toBe(true);
    expect(scopeButton('first')).not.toHaveFocus();
    expect(scopeButton('opener')).toHaveFocus();
  });

  it('calls onMountAutoFocus with the event and honors preventDefault', () => {
    const events: Event[] = [];
    render(
      createElement(ScopeHarness, {
        enabled: true,
        onMountAutoFocus: (event) => {
          events.push(event);
          event.preventDefault();
        },
      })
    );
    expect(events).toHaveLength(1);
    expect(at(events, 0).type).toBe('hazefocusmount');
    expect(document.activeElement).toBe(document.body);
  });
});

describe('useFocusScope trap semantics', () => {
  it('wraps Tab navigation inside a trapped scope', async () => {
    const user = userEvent.setup();
    render(createElement(ScopeHarness, { enabled: true, trapped: true }));
    expect(scopeButton('first')).toHaveFocus();
    await user.tab();
    expect(scopeButton('middle')).toHaveFocus();
    await user.tab();
    expect(scopeButton('last')).toHaveFocus();
    // 末个再 Tab → 包裹回首
    await user.tab();
    expect(scopeButton('first')).toHaveFocus();
    // 首个 Shift+Tab → 包裹到末
    await user.tab({ shift: true });
    expect(scopeButton('last')).toHaveFocus();
    await user.tab({ shift: true });
    expect(scopeButton('middle')).toHaveFocus();
    await user.tab({ shift: true });
    expect(scopeButton('first')).toHaveFocus();
  });

  it('lets Tab leave the scope when not trapped', async () => {
    const user = userEvent.setup();
    render(createElement(ScopeHarness, { enabled: true }));
    expect(scopeButton('first')).toHaveFocus();
    await user.tab();
    await user.tab();
    expect(scopeButton('last')).toHaveFocus();
    // 末个再 Tab 离开容器（落到 body），无拦截
    await user.tab();
    expect(document.body).toHaveFocus();
  });

  it('prevents Tab from leaving an empty trapped scope', async () => {
    const user = userEvent.setup();
    render(
      createElement(ScopeHarness, {
        enabled: true,
        trapped: true,
        emptyScope: true,
      })
    );
    const scope = screen.getByTestId('scope');
    expect(scope).toHaveFocus();
    await user.tab();
    expect(scope).toHaveFocus();
    await user.tab({ shift: true });
    expect(scope).toHaveFocus();
  });

  it('recaptures focus that leaks out of a trapped scope', async () => {
    const user = userEvent.setup();
    render(createElement(ScopeHarness, { enabled: true, trapped: true }));
    expect(scopeButton('first')).toHaveFocus();
    // 点击容器外：mousedown 先把焦点移出，focusout 拉回首 tabbable
    await user.click(scopeButton('outside'));
    expect(scopeButton('outside')).not.toHaveFocus();
    expect(scopeButton('first')).toHaveFocus();
  });

  it('does not recapture focus after the scope is disabled', async () => {
    const { rerender } = render(
      createElement(ScopeHarness, { enabled: true, trapped: true })
    );
    expect(scopeButton('first')).toHaveFocus();
    // 同一同步任务内：焦点漏出（挂起 recapture microtask）后立即停用，
    // cleanup 先于 microtask 执行 —— 停用后不得再拉回
    fireEvent.focusOut(scopeButton('first'), {
      relatedTarget: scopeButton('outside'),
    });
    rerender(createElement(ScopeHarness, { enabled: false, trapped: true }));
    await Promise.resolve(); // flush 挂起的 microtask
    expect(document.activeElement).toBe(document.body);
    expect(scopeButton('first')).not.toHaveFocus();
  });

  it('keeps the trap armed against a replaced scope node', async () => {
    const user = userEvent.setup();
    const { rerender } = render(
      createElement(ScopeHarness, { enabled: true, trapped: true, scopeKey: 0 })
    );
    const before = screen.getByTestId('scope');
    expect(scopeButton('first')).toHaveFocus();
    rerender(
      createElement(ScopeHarness, { enabled: true, trapped: true, scopeKey: 1 })
    );
    const after = screen.getByTestId('scope');
    expect(after).not.toBe(before);
    // 旧节点卸载后焦点掉回 body；Tab 应拉回到新节点的首 tabbable
    await user.tab();
    expect(scopeButton('first')).toHaveFocus();
    await user.tab();
    expect(scopeButton('middle')).toHaveFocus();
    await user.tab();
    expect(scopeButton('last')).toHaveFocus();
    await user.tab();
    expect(scopeButton('first')).toHaveFocus();
  });
});

describe('useFocusScope unmount semantics', () => {
  it('returns focus to the opener when disabled', () => {
    const { rerender } = render(createElement(ScopeHarness, { enabled: false }));
    scopeButton('opener').focus();
    rerender(createElement(ScopeHarness, { enabled: true }));
    expect(scopeButton('first')).toHaveFocus();
    rerender(createElement(ScopeHarness, { enabled: false }));
    expect(scopeButton('opener')).toHaveFocus();
  });

  it('does not steal focus when the user has focused elsewhere', () => {
    const { rerender } = render(createElement(ScopeHarness, { enabled: false }));
    const outside = scopeButton('outside');
    scopeButton('opener').focus();
    rerender(createElement(ScopeHarness, { enabled: true }));
    expect(scopeButton('first')).toHaveFocus();
    // 用户主动聚焦容器外：关闭时不抢占
    outside.focus();
    rerender(createElement(ScopeHarness, { enabled: false }));
    expect(outside).toHaveFocus();
  });

  it('falls back to body when the recorded return target was unmounted', () => {
    const { rerender } = render(createElement(ScopeHarness, { enabled: false }));
    scopeButton('opener').focus();
    rerender(createElement(ScopeHarness, { enabled: true }));
    // 激活期间 opener 卸载
    rerender(createElement(ScopeHarness, { enabled: true, hideOpener: true }));
    expect(
      screen.queryByRole('button', { name: 'opener' })
    ).toBeNull();
    rerender(createElement(ScopeHarness, { enabled: false, hideOpener: true }));
    expect(document.activeElement).toBe(document.body);
    expect(scopeButton('first')).not.toHaveFocus();
  });

  it('skips returning focus when returnFocus is false', () => {
    const { rerender } = render(createElement(ScopeHarness, { enabled: true }));
    // 停用当次渲染才传入 returnFocus=false（最新选项生效路径）
    rerender(
      createElement(ScopeHarness, { enabled: false, returnFocus: false })
    );
    expect(scopeButton('first')).toHaveFocus();
  });

  it('dispatches a cancelable hazefocusunmount; preventDefault skips return', () => {
    const { rerender } = render(createElement(ScopeHarness, { enabled: false }));
    const scope = screen.getByTestId('scope');
    const seen: Event[] = [];
    const listener = (event: Event) => {
      seen.push(event);
      event.preventDefault();
    };
    scope.addEventListener('hazefocusunmount', listener);
    scopeButton('opener').focus();
    rerender(createElement(ScopeHarness, { enabled: true }));
    rerender(createElement(ScopeHarness, { enabled: false }));
    scope.removeEventListener('hazefocusunmount', listener);
    expect(seen).toHaveLength(1);
    const unmountEvent = at(seen, 0);
    expect(unmountEvent.type).toBe('hazefocusunmount');
    expect(unmountEvent.bubbles).toBe(false);
    expect(unmountEvent.cancelable).toBe(true);
    // preventDefault 后不归还：焦点留在容器内
    expect(scopeButton('first')).toHaveFocus();
  });

  it('calls onUnmountAutoFocus from the disabling render and honors preventDefault', () => {
    const events: Event[] = [];
    const { rerender } = render(createElement(ScopeHarness, { enabled: true }));
    // 停用当次渲染才挂回调（验证最新选项读取，而非激活时的旧闭包）
    rerender(
      createElement(ScopeHarness, {
        enabled: false,
        onUnmountAutoFocus: (event) => {
          events.push(event);
          event.preventDefault();
        },
      })
    );
    expect(events).toHaveLength(1);
    expect(at(events, 0).type).toBe('hazefocusunmount');
    expect(scopeButton('first')).toHaveFocus();
  });
});

describe('useFocusScope cleanup', () => {
  it('removes all document listeners across toggles and unmount', async () => {
    const addSpy = vi.spyOn(document, 'addEventListener');
    const removeSpy = vi.spyOn(document, 'removeEventListener');
    const { rerender, unmount } = render(
      createElement(ScopeHarness, { enabled: false, trapped: true })
    );
    rerender(createElement(ScopeHarness, { enabled: true, trapped: true }));
    rerender(createElement(ScopeHarness, { enabled: false, trapped: true }));
    rerender(createElement(ScopeHarness, { enabled: true, trapped: true }));
    unmount();
    const tracked = (calls: unknown[][]) =>
      calls.filter((call) => call[0] === 'keydown' || call[0] === 'focusout')
        .length;
    const added = tracked(addSpy.mock.calls);
    const removed = tracked(removeSpy.mock.calls);
    addSpy.mockRestore();
    removeSpy.mockRestore();
    expect(added).toBeGreaterThan(0);
    expect(removed).toBe(added);

    // 行为兜底：卸载后 Tab 恢复默认移动，无残留拦截
    render(
      createElement(
        'div',
        null,
        createElement('button', { type: 'button' }, 'leak-a'),
        createElement('button', { type: 'button' }, 'leak-b')
      )
    );
    const user = userEvent.setup();
    scopeButton('leak-a').focus();
    await user.tab();
    expect(scopeButton('leak-b')).toHaveFocus();
  });
});

describe('useFocusScope accessibility', () => {
  it('has no axe violations', async () => {
    // hook 模块无自有组件：以挂载 scope 的最小宿主 harness 代替渲染
    const { axe } = await import('jest-axe');
    render(createElement(ScopeHarness, { enabled: true, trapped: true }));
    const results = await axe(document.body, {
      rules: { region: { enabled: false } },
    });
    expect(results.violations).toEqual([]);
  });
});
