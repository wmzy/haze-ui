import type { ReactNode } from 'react';

import { css } from '@linaria/core';

// Stat
type StatProps = {
  title: string;
  value: string | number;
  description?: string;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  prefix?: ReactNode;
  suffix?: ReactNode;
  className?: string;
};

const base = css`
  display: flex;
  flex-direction: column;
  font-family: var(--haze-font-sans);
`;

const titleStyle = css`
  font-size: var(--haze-text-sm);
  color: var(--haze-color-text-muted);
  margin-bottom: var(--haze-space-1);
`;

const valueRow = css`
  display: flex;
  align-items: baseline;
  gap: var(--haze-space-2);
`;

const valueStyle = css`
  font-size: var(--haze-text-2xl);
  font-weight: var(--haze-weight-bold);
  color: var(--haze-color-text);
  line-height: var(--haze-leading-tight);
`;

const trendColors = {
  up: css`color: var(--haze-color-success);`,
  down: css`color: var(--haze-color-danger);`,
  neutral: css`color: var(--haze-color-text-muted);`,
} as const;

const trendStyle = css`
  font-size: var(--haze-text-sm);
  font-weight: var(--haze-weight-medium);
`;

const descStyle = css`
  font-size: var(--haze-text-xs);
  color: var(--haze-color-text-muted);
  margin-top: var(--haze-space-1);
`;

export function Stat({
  title,
  value,
  description,
  trend,
  trendValue,
  prefix,
  suffix,
  className,
}: StatProps) {
  return (
    <div x-class={[base, className]}>
      <div x-class={[titleStyle]}>{title}</div>
      <div x-class={[valueRow]}>
        {prefix}
        <div x-class={[valueStyle]}>{value}</div>
        {suffix}
        {trend && trendValue && (
          <div x-class={[trendStyle, trendColors[trend]]}>
            {trend === 'up' ? '↑' : trend === 'down' ? '↓' : '→'} {trendValue}
          </div>
        )}
      </div>
      {description && <div x-class={[descStyle]}>{description}</div>}
    </div>
  );
}

// StatGroup
type StatGroupProps = {
  children: ReactNode;
  className?: string;
};

const groupStyle = css`
  display: flex;
  gap: var(--haze-space-6);
`;

export function StatGroup({ children, className }: StatGroupProps) {
  return (
    <div x-class={[groupStyle, className]}>
      {children}
    </div>
  );
}

export type { StatProps, StatGroupProps };
