/**
 * Internal visualViewport primitives shared by components that must avoid
 * the on-screen (virtual) keyboard — extracted from BottomSheet's inline
 * implementation. Not exported through the main barrel (same seam policy
 * as utils/floating).
 */
import { useEffect, useState } from 'react';

/**
 * 虚拟键盘对视口的遮挡高度（px）：以布局视口为参照度量
 * （`innerHeight - visualViewport.height - offsetTop`，向下钳 0——桌面
 * 窗口缩放时 innerHeight 与视口同步变化，inset 恒为 0）。
 *
 * - `window.visualViewport` 不存在（SSR/jsdom）时静默保持 0，调用方的
 *   `dvh` 基线继续生效；
 * - `enabled` 为 false（如 sheet 收起）时不订阅，翻回 true 时重新
 *   measure 订阅；
 * - 监听器 passive（measure 从不 preventDefault），卸载时成对清理。
 */
export function useVisualViewportInset(enabled = true): number {
  const [inset, setInset] = useState(0);
  useEffect(() => {
    if (!enabled) return;
    const viewport = window.visualViewport;
    if (!viewport) return;
    const measure = () => {
      const next = Math.max(
        0,
        Math.round(window.innerHeight - viewport.height - viewport.offsetTop)
      );
      setInset((prev) => (prev === next ? prev : next));
    };
    measure();
    viewport.addEventListener('resize', measure, { passive: true });
    viewport.addEventListener('scroll', measure, { passive: true });
    return () => {
      viewport.removeEventListener('resize', measure);
      viewport.removeEventListener('scroll', measure);
    };
  }, [enabled]);
  return inset;
}
