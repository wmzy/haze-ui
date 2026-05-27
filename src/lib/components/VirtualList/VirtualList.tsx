import { useState, useRef, useCallback, useEffect } from 'react';
import { css } from '@linaria/core';

type VirtualListProps<T> = {
  items: T[];
  height: number;
  itemHeight: number;
  renderItem: (item: T, index: number) => React.ReactNode;
  overscan?: number;
  className?: string;
};

const container = css`
  overflow-y: auto;
  font-family: var(--haze-font-sans);
`;

const viewport = css`
  position: relative;
  width: 100%;
`;

export default function VirtualList<T>({
  items,
  height,
  itemHeight,
  renderItem,
  overscan = 5,
  className,
}: VirtualListProps<T>) {
  const [scrollTop, setScrollTop] = useState(0);
  const ref = useRef<HTMLDivElement>(null);

  const handleScroll = useCallback(() => {
    if (ref.current) {
      setScrollTop(ref.current.scrollTop);
    }
  }, []);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.addEventListener('scroll', handleScroll, { passive: true });
    return () => el.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  const totalHeight = items.length * itemHeight;
  const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
  const endIndex = Math.min(
    items.length,
    Math.ceil((scrollTop + height) / itemHeight) + overscan,
  );

  const visibleItems = items.slice(startIndex, endIndex);

  return (
    <div
      ref={ref}
      x-class={[container, className]}
      style={{ height }}
    >
      <div x-class={[viewport]} style={{ height: totalHeight }}>
        {visibleItems.map((item, i) => (
          <div
            key={startIndex + i}
            style={{
              position: 'absolute',
              top: (startIndex + i) * itemHeight,
              height: itemHeight,
              width: '100%',
            }}
          >
            {renderItem(item, startIndex + i)}
          </div>
        ))}
      </div>
    </div>
  );
}

export type { VirtualListProps };
