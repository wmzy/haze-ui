import { render, act } from '@testing-library/react';

import { useTitle } from './useTitle';

// 路由换树的模拟件：旧视图 unmount 与新视图 mount 发生在同一次 commit，
// 渲染期新视图先跑、旧视图 cleanup 后跑——正是「快照必须取在 effect 期」
// 坑的触发条件。
function Page({ title }: { title: string }) {
  useTitle(title);
  return <main>{title}</main>;
}

function App({ page }: { page: 'a' | 'b' }) {
  return page === 'a' ? <Page title="Page A" /> : <Page title="Page B" />;
}

beforeEach(() => {
  document.title = 'Haze App';
});

describe('useTitle', () => {
  it('sets document.title while mounted and restores the entry title on unmount', () => {
    const { unmount } = render(<Page title="Settings" />);
    expect(document.title).toBe('Settings');
    unmount();
    expect(document.title).toBe('Haze App');
  });

  it('updates the title when the prop changes without touching the entry snapshot', () => {
    const { rerender } = render(<Page title="Editor (new)" />);
    expect(document.title).toBe('Editor (new)');
    rerender(<Page title="Editor (draft)" />);
    expect(document.title).toBe('Editor (draft)');
    rerender(<Page title="Editor (published)" />);
    expect(document.title).toBe('Editor (published)');
    // 中途变化只覆写；恢复目标始终是进入前的值，不是上一轮的 title
    rerender(<Page title="Whatever" />);
    rerender(<Page title="Whatever else" />);
    expect(document.title).toBe('Whatever else');
    rerender(<></>);
    expect(document.title).toBe('Haze App');
  });

  it('takes the entry snapshot at effect time, not render time (tree swap in one commit)', () => {
    const { rerender } = render(<App page="a" />);
    expect(document.title).toBe('Page A');
    // a → b 换树：Page B 渲染时 Page A 的 cleanup 还没跑，document.title
    // 仍是 "Page A"。快照若取在渲染期，B 的基线就成了 "Page A"，卸载
    // 后会错误地恢复成上一页的标题；effect 期快照则恢复入口默认值。
    act(() => {
      rerender(<App page="b" />);
    });
    expect(document.title).toBe('Page B');
    rerender(<></>);
    expect(document.title).toBe('Haze App');
  });

  it('survives rapid successive switches', () => {
    const { rerender } = render(<App page="a" />);
    for (const page of ['b', 'a', 'b', 'b', 'a'] as const) {
      rerender(<App page={page} />);
      expect(document.title).toBe(`Page ${page.toUpperCase()}`);
    }
    rerender(<></>);
    expect(document.title).toBe('Haze App');
  });

  it('keeps a stable restore target across StrictMode double effects', async () => {
    const { StrictMode } = await import('react');
    const { unmount } = render(
      <StrictMode>
        <Page title="Strict" />
      </StrictMode>
    );
    expect(document.title).toBe('Strict');
    unmount();
    expect(document.title).toBe('Haze App');
  });
});
