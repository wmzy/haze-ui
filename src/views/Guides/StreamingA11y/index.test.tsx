import {render, screen} from '@testing-library/react';

import StreamingA11yGuide from './index';

/*
 * /guides/streaming-a11y 冒烟：流式播报两节之外的三个瞬态模式小节
 * （Toast 打断分级 / 异步选项加载 aria-busy / 树懒加载）都在文档里，
 * 每节带代码指引与对应组件名。
 */

describe('StreamingA11y guide page', () => {
  it('renders the three transient-state pattern sections with code and components', () => {
    render(<StreamingA11yGuide />);

    // 三个新模式小节标题。
    expect(
      screen.getByRole('heading', {
        name: /interruption tiers: status vs alert \(toast\)/i,
      })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('heading', {
        name: /async option loading: busy, never a lie/i,
      })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('heading', {name: /lazy tree nodes: busy at the node/i})
    ).toBeInTheDocument();

    // 契约事实：danger 是唯一的 alert 档；过滤挂起不是空结果。
    expect(screen.getAllByText(/danger/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/not here yet/i)).toBeInTheDocument();
    expect(screen.getByText(/aria-required-children/i)).toBeInTheDocument();
  });

  it('keeps the streaming announcement sections from the first revision', () => {
    render(<StreamingA11yGuide />);

    expect(
      screen.getByRole('heading', {name: /why streaming output is silent/i})
    ).toBeInTheDocument();
    expect(
      screen.getByRole('heading', {name: /the haze pattern/i})
    ).toBeInTheDocument();
    expect(
      screen.getByRole('heading', {name: /rolling your own/i})
    ).toBeInTheDocument();
  });
});
