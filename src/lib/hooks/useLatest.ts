import type { RefObject } from 'react';

import { useEffect, useRef } from 'react';

/**
 * 永远指向最新一次渲染所传值的稳定 ref。
 *
 * ```tsx
 * const latestOnTick = useLatest(onTick);
 * useEffect(() => {
 *   const id = setInterval(() => latestOnTick.current(), 1000);
 *   return () => clearInterval(id);
 * }, []);
 * // onTick 变更后，定时器回调读到的仍是最新一次渲染的引用
 * ```
 *
 * - 写入发生在无依赖数组的 effect：每次渲染提交后同步，长生命周期
 *   闭包（定时器、异步链、事件监听）读 `.current` 拿到的永远是
 *   本轮 props，而非闭包捕获时的旧值。
 * - 按引用覆盖、不做比较：对象/数组每次新引用都会成为最新值。
 * - 消费方若在自己的 effect 里读 `.current`，该 effect 需声明在
 *   本 hook 之后（effect 按声明顺序执行，先声明者读到上一轮值）。
 *
 * @param value 需要镜像的任意值。
 * @returns 指向最新值的稳定 ref。
 */
export function useLatest<T>(value: T): RefObject<T> {
  const ref = useRef(value);
  useEffect(() => {
    ref.current = value;
  });
  return ref;
}
