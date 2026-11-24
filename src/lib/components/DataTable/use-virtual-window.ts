import type { DataTableVirtualized } from './DataTable';

import { useEffect, useRef, useState } from 'react';

/** Default `virtualized` row height per density step: 2 × the step's block
 * cell padding + one `--haze-text-sm` (14px) line box + the 1px row
 * border — sm 2×4, md 2×8, lg 2×12. */
const VIRTUAL_ROW_HEIGHTS = { sm: 23, md: 34, lg: 39 } as const;

/**
 * ── The virtualized window ────────────────────────────────────────────
 * Resolves the `virtualized` prop into what the windowed body renders
 * with — whether the mode is on, the fixed row height (the explicit one,
 * else the density step's default) and the overscan — and measures the
 * viewport the `VirtualList` scrolls in.
 */
export function useVirtualWindow({
  virtualized,
  density,
}: {
  virtualized: DataTableVirtualized | undefined;
  density: 'sm' | 'md' | 'lg';
}) {
  const virtual = virtualized === true || typeof virtualized === 'object';
  const rowHeight =
    typeof virtualized === 'object'
      ? virtualized.rowHeight
      : VIRTUAL_ROW_HEIGHTS[density];
  const overscan =
    typeof virtualized === 'object' ? virtualized.overscan : undefined;

  // Virtualized viewport height: measured from the consumer-bounded region
  // minus the pinned header. Floors keep every observation identical, so
  // the ResizeObserver settles instead of looping; unbounded roots bottom
  // out at one row instead of growing recursively.
  const virtualAreaRef = useRef<HTMLDivElement>(null);
  const [viewportHeight, setViewportHeight] = useState(0);
  useEffect(() => {
    if (!virtual) return;
    const area = virtualAreaRef.current;
    const thead = area?.querySelector('thead');
    if (!area || !thead) return;
    const measure = () => {
      const areaHeight = Math.floor(area.getBoundingClientRect().height);
      const headerHeight = Math.floor(thead.getBoundingClientRect().height);
      setViewportHeight(Math.max(rowHeight, areaHeight - headerHeight));
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(area);
    observer.observe(thead);
    return () => observer.disconnect();
  }, [virtual, rowHeight]);

  return { virtual, rowHeight, overscan, virtualAreaRef, viewportHeight };
}
