import type { ReactNode } from 'react';
import type { Control } from 'react-use-control';

import { css } from '@linaria/core';
import { useControl } from 'react-use-control';

type DateRangePickerProps = {
  startDate?: Control<string> | string;
  endDate?: Control<string> | string;
  onStartChange?: (value: string) => void;
  onEndChange?: (value: string) => void;
  separator?: ReactNode;
  className?: string;
};

const container = css`
  display: inline-flex;
  align-items: center;
  flex-wrap: wrap;
  gap: var(--haze-space-2);
  font-family: var(--haze-font-sans);
`;

const input = css`
  padding: var(--haze-space-2) var(--haze-space-3);
  border: 1px solid var(--haze-color-border);
  border-radius: var(--haze-radius-md);
  background: var(--haze-color-bg);
  color: var(--haze-color-text);
  font-size: var(--haze-text-sm);
  font-family: var(--haze-font-sans);
  outline: none;
  transition: border-color 0.15s, box-shadow 0.15s;

  &:focus {
    border-color: var(--haze-color-primary);
    box-shadow: 0 0 0 3px var(--haze-color-focus-ring);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const sep = css`
  color: var(--haze-color-text-muted);
  font-size: var(--haze-text-sm);
`;

export default function DateRangePicker({
  startDate: startDateControl,
  endDate: endDateControl,
  onStartChange,
  onEndChange,
  separator = '–',
  className,
}: DateRangePickerProps) {
  const [startDate, setStartDate] = useControl(startDateControl as Control<string>, '');
  const [endDate, setEndDate] = useControl(endDateControl as Control<string>, '');

  const handleStartChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value;
    setStartDate(v);
    onStartChange?.(v);
  };

  const handleEndChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value;
    setEndDate(v);
    onEndChange?.(v);
  };

  return (
    <div x-class={[container, className]}>
      <input type="date" x-class={[input]} value={startDate} onChange={handleStartChange} />
      <span x-class={[sep]}>{separator}</span>
      <input type="date" x-class={[input]} value={endDate} onChange={handleEndChange} />
    </div>
  );
}

export type { DateRangePickerProps };
