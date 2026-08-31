import type { ReactNode } from 'react';
import type { Control } from 'react-use-control';

import { useControl } from 'react-use-control';

import DateRangePickerCore from './DateRangePickerCore';

type DateRangePickerProps = {
  startDate?: Control<string> | string;
  endDate?: Control<string> | string;
  onStartChange?: (value: string) => void;
  onEndChange?: (value: string) => void;
  separator?: ReactNode;
  className?: string;
};

export default function DateRangePicker({
  startDate: startDateControl,
  endDate: endDateControl,
  onStartChange,
  onEndChange,
  separator,
  className,
}: DateRangePickerProps) {
  const [startDate, setStartDate] = useControl(
    startDateControl as Control<string>,
    ''
  );
  const [endDate, setEndDate] = useControl(
    endDateControl as Control<string>,
    ''
  );

  return (
    <DateRangePickerCore
      startDate={startDate}
      endDate={endDate}
      onStartChange={(next) => {
        setStartDate(next);
        onStartChange?.(next);
      }}
      onEndChange={(next) => {
        setEndDate(next);
        onEndChange?.(next);
      }}
      separator={separator}
      className={className}
    />
  );
}

export type { DateRangePickerProps };
