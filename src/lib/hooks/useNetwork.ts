import { useSyncExternalStore } from 'react';

type NetworkSnapshot = {
  /** 当前在线状态；SSR/无 navigator 环境恒 `true`（假设在线）。 */
  online: boolean;
  /**
   * 连接元信息（effectiveType/downlink/rtt/saveData）。仅部分浏览器
   * 暴露 `navigator.connection`；单测/SSR/未支持浏览器全部为 undefined。
   */
  effectiveType?: string;
  downlink?: number;
  rtt?: number;
  saveData?: boolean;
};

const DEFAULT_SNAPSHOT: NetworkSnapshot = { online: true };

type NetworkInformationLike = {
  effectiveType?: string;
  downlink?: number;
  rtt?: number;
  saveData?: boolean;
  addEventListener?: (event: string, listener: () => void) => void;
  removeEventListener?: (event: string, listener: () => void) => void;
};

declare global {
  // eslint-disable-next-line @typescript-eslint/consistent-type-definitions -- Navigator 是全局接口，必须用 interface 才能合并
  interface Navigator {
    connection?: NetworkInformationLike;
  }
}

const subscribeOnline = (onChange: () => void) => {
  if (typeof window === 'undefined' || typeof window.addEventListener !== 'function') {
    return () => undefined;
  }
  window.addEventListener('online', onChange);
  window.addEventListener('offline', onChange);

  // navigator 在全局 lib 里是非空值；不存在的情况 SSR 路径上面已经 return
  const connection = navigator.connection;
  if (connection?.addEventListener) {
    connection.addEventListener('change', onChange);
    return () => {
      window.removeEventListener('online', onChange);
      window.removeEventListener('offline', onChange);
      connection.removeEventListener?.('change', onChange);
    };
  }
  return () => {
    window.removeEventListener('online', onChange);
    window.removeEventListener('offline', onChange);
  };
};

// useSyncExternalStore 的快照契约：两次 getSnapshot() 若语义不变，必须
// 返回同一引用，否则 React 认为 store 永远在变化，进入死循环。
let cachedSnapshot: NetworkSnapshot = DEFAULT_SNAPSHOT;

const getSnapshot = (): NetworkSnapshot => {
  if (typeof navigator === 'undefined') return DEFAULT_SNAPSHOT;
  const conn = navigator.connection;
  const next: NetworkSnapshot = {
    online: navigator.onLine,
    ...(conn?.effectiveType !== undefined && { effectiveType: conn.effectiveType }),
    ...(conn?.downlink !== undefined && { downlink: conn.downlink }),
    ...(conn?.rtt !== undefined && { rtt: conn.rtt }),
    ...(conn?.saveData !== undefined && { saveData: conn.saveData }),
  };
  if (
    cachedSnapshot.online === next.online &&
    cachedSnapshot.effectiveType === next.effectiveType &&
    cachedSnapshot.downlink === next.downlink &&
    cachedSnapshot.rtt === next.rtt &&
    cachedSnapshot.saveData === next.saveData
  ) {
    return cachedSnapshot;
  }
  cachedSnapshot = next;
  return next;
};

const getServerSnapshot = () => DEFAULT_SNAPSHOT;

/**
 * 网络在线状态 + 可选 `navigator.connection` 连接元信息。
 *
 * ```tsx
 * const { online, effectiveType, saveData } = useNetwork();
 * if (!online) return <OfflineBanner />;
 * ```
 *
 * - 底层 `useSyncExternalStore('online/offline/connection.change')`——
 *   状态切换自动触发 React 重新渲染，撕裂防护由 React 官方语义兜底。
 * - SSR：恒返回 `{online: true}`，不产生 hydration mismatch（React
 *   收不到 onChange 时保持首帧快照）。
 * - 浏览器不支持 `navigator.connection`（FF/Safari ≤15）：connection
 *   相关字段 undefined、`online` 仍正确。
 *
 * @returns 当前网络状态快照。所有字段在事件触发后原子更新（同一 tick）。
 */
export function useNetwork(): NetworkSnapshot {
  return useSyncExternalStore(subscribeOnline, getSnapshot, getServerSnapshot);
}

export type { NetworkSnapshot };
