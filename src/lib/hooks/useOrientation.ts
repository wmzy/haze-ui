import { useSyncExternalStore } from 'react';

export type OrientationSnapshot = {
  /** 屏幕朝角：0/90/180/270，纵向起点 0。 */
  angle: number;
  /** 屏幕方向分类：landscape-primary/portrait-primary/landscape-secondary/portrait-secondary。 */
  type: OrientationType;
};

const SSR_SNAPSHOT: OrientationSnapshot = { angle: 0, type: 'portrait-primary' };

type ScreenWithOrientation = Screen & { orientation?: ScreenOrientation };

const getScreenOrientation = (): ScreenOrientation | undefined => {
  if (typeof globalThis === 'undefined') return undefined;
  // lib 的 Screen.orientation 是非可选，但运行时实际环境可能不暴露
  // （老 jsdom / 部分嵌入式引擎）——必须显式判空，lint 的
  // no-unnecessary-condition 在这里不适用于可选链可省略这种收口。
  const screen = globalThis.screen as ScreenWithOrientation | undefined;
  return screen?.orientation;
};

const subscribeOrientation = (onChange: () => void) => {
  const orientation = getScreenOrientation();
  if (!orientation) return () => undefined;
  if (typeof orientation.addEventListener !== 'function') return () => undefined;
  if (typeof orientation.removeEventListener !== 'function') return () => undefined;
  orientation.addEventListener('change', onChange);
  return () => {
    orientation.removeEventListener('change', onChange);
  };
};

// useSyncExternalStore 快照必须引用稳定，否则死循环。
let cachedSnapshot: OrientationSnapshot = SSR_SNAPSHOT;

const getSnapshot = (): OrientationSnapshot => {
  const orientation = getScreenOrientation();
  if (!orientation) return SSR_SNAPSHOT;
  const angle = typeof orientation.angle === 'number' ? orientation.angle : 0;
  const type: OrientationType = orientation.type;
  if (cachedSnapshot.angle === angle && cachedSnapshot.type === type) {
    return cachedSnapshot;
  }
  cachedSnapshot = { angle, type };
  return cachedSnapshot;
};

const getServerSnapshot = () => SSR_SNAPSHOT;

/**
 * 当前屏幕方向（screen.orientation + change 事件订阅）。
 *
 * ```tsx
 * const { angle, type } = useOrientation();
 * if (type.startsWith('landscape')) return <WideLayout />;
 * ```
 *
 * - 使用 `useSyncExternalStore` 状态源：渲染与事件切换之间的撕裂由
 *   React 收敛，无需手动维护两套 useState。
 * - SSR/无 orientation API（老 jsdom）：恒返回 portrait-primary/0°。
 * - 视觉上「横/竖」的判断可用 `window.screen.orientation.type.startsWith('landscape')`
 *   或者 angle % 180 !== 0。
 *
 * @returns 当前屏幕方向快照。
 */
export function useOrientation(): OrientationSnapshot {
  return useSyncExternalStore(subscribeOrientation, getSnapshot, getServerSnapshot);
}
