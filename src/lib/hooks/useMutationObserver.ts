import type { RefCallback } from 'react';

import { useEffect, useMemo, useRef, useState } from 'react';

type UseMutationObserverOptions = MutationObserverInit & {
  /**
   * 是否启用。默认 `true`；`false` 时快照冻结为最后一次观测值，
   * 不建立观察器。
   */
  enabled?: boolean;
};

type UseMutationObserverResult = [
  ref: RefCallback<Element>,
  records: MutationRecord[],
];

const EMPTY: MutationRecord[] = [];

/**
 * 通用 MutationObserver 订阅：观察元素的 attributes/childList/
 * characterData 变化（由 options 决定）。
 *
 * ```tsx
 * const [ref, mutations] = useMutationObserver(
 *   (records) => { console.log(records); },
 *   { attributes: true, attributeFilter: ['data-state'], subtree: false }
 * );
 * ```
 *
 * - 必须显式传 options（MutationObserverInit）——没有监听类型的
 *   MutationObserver 是非法用法。
 * - ref 重挂时自动切换观察目标；history 不保留。
 * - SSR：不观察，records 恒 `[]`。
 *
 * @param callback 收到记录时调用（可为 null / 省略，表示只更新 state）。
 * @param options MutationObserver init 选项 + enabled。
 * @returns `[ref, records]`：records 是最新一批 MutationRecord 列表
 *  （每次回调都新建数组——适合直接 `.map`）。
 */
export function useMutationObserver(
  callback: MutationCallback | null | undefined,
  options: UseMutationObserverOptions
): UseMutationObserverResult {
  const { enabled = true, ...observerInit } = options;

  const [records, setRecords] = useState<MutationRecord[]>(EMPTY);
  const observerRef = useRef<MutationObserver | null>(null);

  const ref: RefCallback<Element> = useMemo(
    () => (node) => {
      observerRef.current?.disconnect();
      observerRef.current = null;

      if (!node || !enabled || typeof globalThis.MutationObserver !== 'function') {
        return;
      }

      const observer = new globalThis.MutationObserver((recordList, obs) => {
        setRecords(recordList);
        callback?.(recordList, obs);
      });
      observer.observe(node, observerInit);
      observerRef.current = observer;
    },
    // observerInit 每次都是新对象——用具体字段做依赖，避免每次渲染换 ref
    // eslint-disable-next-line react-hooks/exhaustive-deps -- 这些是 MutationObserverInit 的全部字段
    [
      enabled,
      callback,
      observerInit.subtree,
      observerInit.childList,
      observerInit.attributes,
      observerInit.characterData,
      observerInit.attributeFilter,
      observerInit.attributeOldValue,
      observerInit.characterDataOldValue,
    ]
  );

  useEffect(() => {
    if (!enabled) {
      observerRef.current?.disconnect();
      observerRef.current = null;
    }
  }, [enabled]);

  return [ref, records];
}

export type { UseMutationObserverOptions, UseMutationObserverResult };
