import type { ComponentPropsWithoutRef, Ref } from 'react';

import {
  barBase,
  barSizes,
  barFill,
  colorMap,
  circleBase,
  circleSizes,
  circleBg,
  circleFill,
  circleColorMap,
} from './progress-styles';

type ProgressProps = {
  value?: number;
  variant?: 'bar' | 'circle';
  size?: 'sm' | 'md' | 'lg';
  /** Semantic fill color. */
  color?: 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'info';
  className?: string;
  /** Forwarded to the root element (data-slot='progress'). */
  ref?: Ref<HTMLDivElement>;
} & Omit<ComponentPropsWithoutRef<'div'>, 'children' | 'className' | 'color'>;

const strokeWidths = { sm: 3, md: 4, lg: 5 };
const circleRadius = { sm: 13, md: 20, lg: 27 };

export default function Progress({
  value = 0,
  variant = 'bar',
  size = 'md',
  color = 'primary',
  'aria-label': ariaLabel = 'Progress',
  className,
  ref,
  ...rest
}: ProgressProps) {
  const clamped = Math.max(0, Math.min(100, value));

  if (variant === 'circle') {
    const r = circleRadius[size];
    const sw = strokeWidths[size];
    const circumference = 2 * Math.PI * r;
    const offset = circumference - (clamped / 100) * circumference;

    return (
      <div
        ref={ref}
        role="progressbar"
        data-slot="progress"
        aria-label={ariaLabel}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={clamped}
        x-class={[circleBase, circleSizes[size], className]}
        {...rest}
      >
        <svg viewBox={`0 0 ${(r + sw) * 2} ${(r + sw) * 2}`}>
          <circle
            data-slot="track"
            cx={r + sw}
            cy={r + sw}
            r={r}
            strokeWidth={sw}
            x-class={[circleBg]}
          />
          <circle
            data-slot="fill"
            cx={r + sw}
            cy={r + sw}
            r={r}
            strokeWidth={sw}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            x-class={[circleFill, circleColorMap[color]]}
          />
        </svg>
      </div>
    );
  }

  return (
    <div
      ref={ref}
      role="progressbar"
      data-slot="progress"
      aria-label={ariaLabel}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={clamped}
      x-class={[barBase, barSizes[size], className]}
      {...rest}
    >
      <div
        data-slot="fill"
        x-class={[barFill, colorMap[color]]}
        style={{ width: `${clamped}%` }}
      />
    </div>
  );
}

export type { ProgressProps };
