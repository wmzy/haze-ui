import type { RefCallback } from 'react';

import { useCallback, useRef, useState } from 'react';

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
 * - ref 每次指向新元素时自动解挂旧观察；卸载/禁用时只断开观察，
 *   entry 保留最后一次值（冻结语义，与 useElementSize 的清零语义
 *   相反——entry 是结构化快照，冻结便于消费方在禁用/卸载后仍读取
 *   最后时刻的布局；size 是原始数据，清零更安全）。
 * - ref 回调身份稳定（useCallback([box, enabled])）：React 19 对每个
 *   新 ref 函数会 null-detach + re-attach，不记忆化会导致每渲染
 *   disconnect + 重建观察器 + 重新 observe，而 ResizeObserver 每次
 *   observe 后回调的都是新 entry 实例——setEntry 恒触发重渲染，形成
 *   无限重渲染循环（jsdom 无 RO，测试测不出，真实浏览器直接卡死）。
 * - enabled 切换无需 effect：true→false 由 ref 身份变化触发的
 *   detach(null) 断开观察；false→true 由 re-attach(node) 重建观察。
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
  const observerRef = useRef<ResizeObserver | null>(null);

  // 解绑走 observer.disconnect()：换成空观察 + reobserve 也能实现，
  // 但 disconnect 释放所有监听面且无任何竞态窗口。
  const ref = useCallback<RefCallback<T>>(
    (node) => {
      observerRef.current?.disconnect();
      observerRef.current = null;

      if (
        !node ||
        !enabled ||
        typeof globalThis.ResizeObserver !== 'function'
      ) {
        return;
      }

      const observer = new globalThis.ResizeObserver((entries) => {
        // ResizeObserver 回调给的是数组，但我们观察单个元素——取第一条。
        const first = entries[0];
        if (first) setEntry(first);
      });
      observer.observe(node, { box });
      observerRef.current = observer;
    },
    [box, enabled]
  );

  return [ref, entry];
}

export type {
  UseResizeObserverOptions,
  UseResizeObserverResult,
  UseResizeObserverResultWithT,
};
