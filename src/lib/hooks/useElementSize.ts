import type { RefCallback } from 'react';

import { useCallback, useRef, useState } from 'react';

type ElementSize = {
  width: number;
  height: number;
};

type UseElementSizeOptions = {
  /** 观测盒，同 ResizeObserver（默认 'content-box'）。 */
  box?: ResizeObserverBoxOptions;
  /** 是否启用，默认 `true`。 */
  enabled?: boolean;
};

type UseElementSizeResult<T extends Element = Element> = [
  ref: RefCallback<T>,
  size: ElementSize,
];

const ZERO: ElementSize = { width: 0, height: 0 };

/**
 * 元素 size 追踪（useResizeObserver 的简化形态——只吐 width/height）。
 *
 * ```tsx
 * const [ref, size] = useElementSize<HTMLDivElement>();
 * return <div ref={ref}>{size.width}×{size.height}</div>;
 * ```
 *
 * - 底层 ResizeObserver；仅在 size 实际变化时 setState，避免子像素
 *   抖动引发反复重渲。
 * - `enabled=false` / 卸载时 size 清零（与 useResizeObserver 的冻结
 *   语义相反：size 是原始数据，禁用后无订阅的冻结值是陈旧数据；
 *   entry 是结构化快照，那边反而选择冻结——详见其文档）。
 * - ref 回调身份稳定（useCallback）：React 19 对每个新 ref 函数会
 *   null-detach + re-attach，这里的 ref 只在 box/enabled 变化时才新建。
 * - SSR：size 恒 `{0,0}`，无 hydration mismatch；无 ResizeObserver
 *   环境（jsdom ≤23 / 老引擎）静默降级。
 *
 * @param options 见 {@link UseElementSizeOptions}。
 * @returns `[ref, size]`。
 */
// T 参数专门用于调用方传入的具体元素类型（RefCallback<T> 的收束）；
// 不参与泛型推导。这是 React hook 里标准做法。
export function useElementSize<T extends Element = Element>(
  options?: UseElementSizeOptions
): UseElementSizeResult<T> {
  const { box = 'content-box', enabled = true } = options ?? {};
  const [size, setSize] = useState<ElementSize>(ZERO);
  const observerRef = useRef<ResizeObserver | null>(null);
  // 记住最后一次上报的尺寸：更新前先做引用级比较，避免相同 size 也
  // 重渲（setSize 同值 bail 会跑一遍 updater，省不掉但比分新旧对象
  // 更直）。
  const lastRef = useRef<ElementSize>(ZERO);

  const ref = useCallback<RefCallback<T>>(
    (node) => {
      observerRef.current?.disconnect();
      observerRef.current = null;

      if (!node || !enabled || typeof globalThis.ResizeObserver !== 'function') {
        // 清空到零而非「保持上次」：卸载/禁用后无订阅，冻结值是陈旧数据。
        lastRef.current = ZERO;
        setSize((prev) => (prev.width === 0 && prev.height === 0 ? prev : ZERO));
        return;
      }

      const observer = new globalThis.ResizeObserver((entries) => {
        const first = entries[0];
        if (!first) return;
        // borderBoxSize 在生产是 ResizeObserverSize 数组；polyfill 或老
        // 接口可能为空数组——直接索引 + 兜底
        const borderBox =
          box === 'border-box' && first.borderBoxSize.length > 0
            ? first.borderBoxSize[0]
            : undefined;
        const next = borderBox
          ? { width: borderBox.inlineSize, height: borderBox.blockSize }
          : { width: first.contentRect.width, height: first.contentRect.height };
        if (
          lastRef.current.width === next.width &&
          lastRef.current.height === next.height
        ) {
          return;
        }
        lastRef.current = next;
        setSize(next);
      });
      observer.observe(node, { box });
      observerRef.current = observer;
    },
    [box, enabled]
  );

  return [ref, size];
}

export type { ElementSize, UseElementSizeOptions, UseElementSizeResult };
