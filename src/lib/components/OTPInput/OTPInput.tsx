import type { Control } from 'react-use-control';

import { useControl } from 'react-use-control';

import OTPInputCore from './OTPInputCore';

type OTPInputProps = {
  length?: number;
  value?: Control<string> | string;
  onChange?: (value: string) => void;
  className?: string;
};

export default function OTPInput({
  length,
  value: valueControl,
  onChange,
  className,
}: OTPInputProps) {
  const [value, setValue] = useControl(valueControl as Control<string>, '');

  return (
    <OTPInputCore
      length={length}
      value={value}
      onChange={(next) => {
        setValue(next);
        onChange?.(next);
      }}
      className={className}
    />
  );
}

export type { OTPInputProps };
