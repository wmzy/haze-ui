import { useCallback, useEffect, useRef, useState } from 'react';

type UseIdleOptions = {
  /**
   * 判定 idle 的时间窗口（毫秒），默认 `60_000`（1 分钟）。
   */
  timeout?: number;

  /**
   * 哪些 DOM 事件「重置」idle（默认覆盖鼠标/键盘/触摸/滚动/visibilitychange）。
   * 传空数组应当视为「只按 visibility 判定」，改用 `useNetwork` / 手动控制。
   */
  events?: (keyof WindowEventMap)[];

  /**
   * 首个事件目标：默认 `document`；显式传 window 时会同时监听
   * document visibilitychange（不可绕过）。
   */
  element?: HTMLElement | Window | null | undefined;

  /**
   * 初始 idle 状态，默认 `false`（没收到任何事件前不认为空闲）。
   * SSR 默认同此。
   */
  initialState?: boolean;
};

type UseIdleResult = {
  /** 当前是否 idle（距最后一个事件超过 timeout）。 */
  idle: boolean;
  /** 最近一次活动的时间戳（epoch ms）；无活动时为挂载时间。 */
  lastActive: number;
};

const DEFAULT_EVENTS: (keyof WindowEventMap)[] = [
  'mousemove',
  'mousedown',
  'resize',
  'keydown',
  'touchstart',
  'wheel',
  'pointerdown',
];

/**
 * 检测用户是否「空闲」（无鼠标/键盘/触摸/滚动活动超过 `timeout` 毫秒）。
 *
 * ```tsx
 * const { idle, lastActive } = useIdle({ timeout: 5_000 });
 * if (idle) return <AwayBadge />;
 * ```
 *
 * - 触发源走「document 捕获」：子应用嵌套（dialog 内部点击）也算活动。
 * - `visibilitychange` 强制同步：切走 tab 不重置计时；切回来先更新状态再算 idle。
 * - SSR：isServer → idle=initialState，不挂监听。
 * - 引擎无 timer（纯 SSR/单测起点）：state 以 initialState 兜底、不调度。
 *
 * @param options 见 {@link UseIdleOptions}。
 * @returns `{idle, lastActive}`。
 */
export function useIdle(options?: UseIdleOptions): UseIdleResult {
  const {
    timeout = 60_000,
    events = DEFAULT_EVENTS,
    element,
    initialState = false,
  } = options ?? {};

  const [idle, setIdle] = useState(initialState);
  const [lastActive, setLastActive] = useState(() => Date.now());
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearTimer = useCallback(() => {
    if (timerRef.current !== null) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const scheduleTimer = useCallback(() => {
    clearTimer();
    timerRef.current = setTimeout(() => {
      timerRef.current = null;
      setIdle(true);
    }, timeout);
  }, [timeout, clearTimer]);

  useEffect(() => {
    // null as never：typeof document undefined 的 SSR 路径根本到不了
    // addEventListener 检查（首次的 element ?? ... 已经筛掉），这一行
    // 只是让 TS 信任 target 非空。
    const target = (element ??
      (typeof document !== 'undefined' ? document : null));
    if (!target || typeof target.addEventListener !== 'function') return;

    const onEvent = () => {
      const now = Date.now();
      setLastActive(now);
      setIdle(false);
      scheduleTimer();
    };
    const onVisibility = () => {
      if (document.visibilityState === 'visible') onEvent();
    };

    for (const ev of events) target.addEventListener(ev, onEvent, true);
    document.addEventListener('visibilitychange', onVisibility);

    scheduleTimer();

    return () => {
      for (const ev of events) target.removeEventListener(ev, onEvent, true);
      document.removeEventListener('visibilitychange', onVisibility);
      clearTimer();
    };
  }, [events, element, scheduleTimer, clearTimer]);

  return { idle, lastActive };
}

export type { UseIdleOptions, UseIdleResult };
