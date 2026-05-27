import type { ReactNode } from 'react';

type GridItemProps = {
  span?: number;
  start?: number;
  className?: string;
  children: ReactNode;
};

export default function GridItem({
  span = 1,
  start,
  className,
  children,
}: GridItemProps) {
  return (
    <div
      className={className}
      style={{
        gridColumn: start
          ? `${start} / span ${span}`
          : `span ${span}`,
      }}
    >
      {children}
    </div>
  );
}

export type { GridItemProps };
