import type { ControlOrValue } from 'react-use-control';

import { useControl } from 'react-use-control';

import RatingCore from './RatingCore';

type RatingProps = {
  value?: ControlOrValue<number>;
  count?: number;
  allowHalf?: boolean;
  onChange?: (value: number) => void;
  className?: string;
};

export default function Rating({
  value: valueControl,
  count,
  allowHalf,
  onChange,
  className,
}: RatingProps) {
  const [value, setValue] = useControl(valueControl, 0);

  return (
    <RatingCore
      value={value}
      onChange={(next) => {
        setValue(next);
        onChange?.(next);
      }}
      count={count}
      allowHalf={allowHalf}
      className={className}
    />
  );
}

export type { RatingProps };
