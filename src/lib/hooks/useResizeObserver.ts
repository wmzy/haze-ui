import type { RefCallback } from 'react';

import { useEffect, useRef, useState } from 'react';

type UseResizeObserverOptions = {
  /**
   * 触发时机盒子，同 ResizeObserver 的 box 选项（'content-box' |
   * 'border-box' | 'device-pixel-content-box'）。默认 'content-box'。
   */
  box?: ResizeObserverBoxOptions;
  /**
   * 是否启用。默认 `true`；`false` 时快照冻结为最后一次观测值，
   * 不建立观察器。
   */
  enabled?: boolean;
};

type UseResizeObserverResult = UseResizeObserverResultWithT;

/**
 * 底层 ResizeObserver 订阅原语：返回 ref + 最新 entry。
 *
 * ```tsx
 * const [ref, entry] = useResizeObserver<HTMLDivElement>();
 * const width = entry?.contentRect.width ?? 0;
 * return <div ref={ref} style={{minWidth: 200}} />;
 * ```
 *
 * - ref 每次指向新元素时自动解挂旧观察；卸载清空。
 * - snapshot 是 entry 实例本身（ResizeObserver 每次回调给新实例，
 *   天然适合 React 的 Object.is 变化检测）。
 * - SSR：不观察，entry 恒 `null`。
 * - 引擎无 `ResizeObserver`（jsdom ≤23）：不抛错，entry 恒 `null`、
 *   ref 是 no-op——消费端可以安全 mock/降级。
 *
 * @param options 见 {@link UseResizeObserverOptions}。
 * @returns `[ref, entry]`：ref 挂上元素即开始观察；entry 为最后一次
 *   通知的 ResizeObserverEntry，未观察/初次渲染为 `null`。
 */
// 单独带泛型的 Result 别名：T 会出现在返回值签名里（RefCallback<T>），
// 让 useResizeObserver<HTMLDivElement>() 的调用方准确捕获 ref 类型。
type UseResizeObserverResultWithT<T extends Element = Element> = [
  ref: RefCallback<T>,
  entry: ResizeObserverEntry | null,
];

export function useResizeObserver<T extends Element = Element>(
  options?: UseResizeObserverOptions
): UseResizeObserverResultWithT<T> {
  const { box = 'content-box', enabled = true } = options ?? {};
  const [entry, setEntry] = useState<ResizeObserverEntry | null>(null);
  const targetRef = useRef<T | null>(null);
  const observerRef = useRef<ResizeObserver | null>(null);

  // 解绑走 observerRef.disconnect()：换成空观察 + reobserve 也能实现，
  // 但 disconnect 释放所有监听面且无任何竞态窗口。
  const ref: RefCallback<T> = (node) => {
    observerRef.current?.disconnect();
    observerRef.current = null;
    targetRef.current = node;

    if (!node || !enabled || typeof globalThis.ResizeObserver !== 'function') {
      return;
    }

    const observer = new globalThis.ResizeObserver((entries) => {
      // ResizeObserver 回调给的是数组，但我们观察单个元素——取第一条。
      const first = entries[0];
      if (first) setEntry(first);
    });
    observer.observe(node, { box });
    observerRef.current = observer;
  };

  // enabled 中途切 false：主动断开观察（下次挂/卸载时仍会被 ref 回调清）。
  useEffect(() => {
    if (!enabled) {
      observerRef.current?.disconnect();
      observerRef.current = null;
    }
  }, [enabled]);

  return [ref, entry];
}

export type {
  UseResizeObserverOptions,
  UseResizeObserverResult,
  UseResizeObserverResultWithT,
};
