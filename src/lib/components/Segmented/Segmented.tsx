import type { ControlOrValue } from 'react-use-control';

import type { SegmentedOption } from './SegmentedCore';

import { useControl } from 'react-use-control';

import SegmentedCore from './SegmentedCore';

type SegmentedProps = {
  options: SegmentedOption[];
  value?: ControlOrValue<string>;
  onChange?: (value: string) => void;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
};

export default function Segmented({
  options,
  value: valueControl,
  onChange,
  size,
  className,
}: SegmentedProps) {
  const [value, setValue] = useControl(valueControl, '');

  return (
    <SegmentedCore
      options={options}
      value={value}
      onChange={(next) => {
        setValue(next);
        onChange?.(next);
      }}
      size={size}
      className={className}
    />
  );
}

export type { SegmentedProps, SegmentedOption };
