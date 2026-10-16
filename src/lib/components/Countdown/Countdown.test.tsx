import { act, render, screen } from '@testing-library/react';

import Countdown from './Countdown';

// 固定时钟基点：所有 deadline 相对 BASE 表达，边界断言才有确定值。
const BASE = new Date('2026-10-16T12:00:00Z').getTime();

describe('Countdown', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(BASE);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('shows days past one day and aria-labels the full remaining time', () => {
    render(<Countdown value={BASE + 25 * 3600_000 + 5 * 60_000} />);
    expect(screen.getByText('1d 01:05:00')).toBeInTheDocument();
    expect(screen.getByText('1d 01:05:00')).toHaveAttribute(
      'aria-label',
      '1 day, 1 hour, 5 minutes, 0 seconds remaining',
    );
  });

  it('renders h:mm:ss under a day', () => {
    render(<Countdown value={BASE + 2 * 3600_000 + 5 * 60_000 + 30_000} />);
    expect(screen.getByText('02:05:30')).toBeInTheDocument();
    expect(screen.getByText('02:05:30')).toHaveAttribute(
      'aria-label',
      '2 hours, 5 minutes, 30 seconds remaining',
    );
  });

  it('ticks on deadline-aligned second boundaries through the last 10 seconds', () => {
    render(<Countdown value={BASE + 9500} />);
    expect(screen.getByText('00:00:10')).toBeInTheDocument();

    // 首个定时器瞄准 500ms 后的整秒边界（9.5s → 9.0s），不是自由跑的 1s。
    act(() => {
      vi.advanceTimersByTime(499);
    });
    expect(screen.getByText('00:00:10')).toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(1);
    });
    expect(screen.getByText('00:00:09')).toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(screen.getByText('00:00:08')).toBeInTheDocument();

    // 走完最后 8 秒（每链节一步）到零停表。
    for (let i = 0; i < 8; i += 1) {
      act(() => {
        vi.advanceTimersByTime(1000);
      });
    }
    expect(screen.getByText('00:00:00')).toBeInTheDocument();
  });

  it('fires onFinish exactly once at expiry and then stops', () => {
    const onFinish = vi.fn();
    render(<Countdown value={BASE + 1200} onFinish={onFinish} />);
    expect(onFinish).not.toHaveBeenCalled();

    // setTimeout 链：每个 act 只推进一个链节（定时器在 React 渲染
    // flush 后才挂上，跨链节的推进要分步）。
    act(() => {
      vi.advanceTimersByTime(200);
    });
    expect(screen.getByText('00:00:01')).toBeInTheDocument();
    expect(onFinish).not.toHaveBeenCalled();

    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(screen.getByText('00:00:00')).toBeInTheDocument();
    expect(onFinish).toHaveBeenCalledTimes(1);

    // 过期后不再排程——继续走时间也不重复触发。
    act(() => {
      vi.advanceTimersByTime(5000);
    });
    expect(onFinish).toHaveBeenCalledTimes(1);
    expect(screen.getByText('00:00:00')).toBeInTheDocument();
  });

  it('renders zero and fires onFinish once when mounted already expired', () => {
    const onFinish = vi.fn();
    render(<Countdown value={BASE - 1000} onFinish={onFinish} />);
    expect(screen.getByText('00:00:00')).toBeInTheDocument();
    expect(onFinish).toHaveBeenCalledTimes(1);
  });

  it('re-aims the clock when value changes and re-arms onFinish', () => {
    const onFinish = vi.fn();
    const { rerender } = render(<Countdown value={BASE + 500} onFinish={onFinish} />);
    act(() => {
      vi.advanceTimersByTime(200);
    });
    act(() => {
      vi.advanceTimersByTime(400);
    });
    expect(onFinish).toHaveBeenCalledTimes(1);

    // 新的未来 deadline：重新起表，onFinish 可再次触发。
    rerender(<Countdown value={BASE + 1500} onFinish={onFinish} />);
    expect(screen.getByText('00:00:01')).toBeInTheDocument();
    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(onFinish).toHaveBeenCalledTimes(2);
    expect(screen.getByText('00:00:00')).toBeInTheDocument();
  });

  it('accepts a Date deadline', () => {
    render(<Countdown value={new Date(BASE + 90_000)} />);
    expect(screen.getByText('00:01:30')).toBeInTheDocument();
  });

  it('applies a custom format (visible text and accessible name)', () => {
    render(
      <Countdown
        value={BASE + 90_000_000}
        format={(p) => `${p.days}d ${p.totalSeconds}s`}
      />,
    );
    expect(screen.getByText('1d 90000s')).toBeInTheDocument();
    expect(screen.getByText('1d 90000s')).toHaveAttribute('aria-label', '1d 90000s');
  });

  it('renders via the render escape hatch with a word-form label', () => {
    render(
      <Countdown
        value={BASE + 60_000}
        render={(p) => <strong data-testid='r'>{p.minutes}m</strong>}
      />,
    );
    expect(screen.getByTestId('r').tagName).toBe('STRONG');
    expect(screen.getByTestId('r')).toHaveTextContent('1m');
    // render 产物不是字符串——可访问名称回落到完整文字描述。
    expect(screen.getByTestId('r').parentElement).toHaveAttribute(
      'aria-label',
      '1 minute, 0 seconds remaining',
    );
  });

  it('keeps per-second updates out of live regions', () => {
    render(<Countdown value={BASE + 3600_000} />);
    const root = screen.getByText('01:00:00');
    // StreamA11y 取舍：每秒文本跳动不做 live 播报（SR 刷屏），完整
    // 剩余时间只暴露在可查询的 accessible name 上。
    expect(root).not.toHaveAttribute('aria-live');
    expect(root).not.toHaveAttribute('role');
    expect(document.querySelectorAll('[aria-live], [role="status"], [role="timer"]')).toHaveLength(0);
  });

  it('clears the pending timer on unmount', () => {
    const { unmount } = render(<Countdown value={BASE + 5000} />);
    expect(vi.getTimerCount()).toBeGreaterThan(0);
    unmount();
    expect(vi.getTimerCount()).toBe(0);
  });

  it('merges className and forwards native props', () => {
    render(<Countdown value={BASE + 1000} className='custom' data-testid='n' />);
    const el = screen.getByTestId('n');
    expect(el).toHaveClass('custom');
    expect(el.tagName).toBe('SPAN');
    expect(el).toHaveTextContent('00:00:01');
  });

  it('has no axe violations', async () => {
    // axe-core 内部依赖真实定时器——fake timers 下会挂起。
    vi.useRealTimers();
    const { axe } = await import('jest-axe');
    const { container } = render(
      <>
        <Countdown value={BASE + 25 * 3600_000} />
        <Countdown value={BASE + 5000} />
        <Countdown value={BASE - 1000} />
      </>,
    );
    const results = await axe(container);
    expect(results.violations).toEqual([]);
  });
});
