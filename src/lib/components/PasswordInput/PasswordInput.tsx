import type { ControlOrValue } from 'react-use-control';

import { useControl } from 'react-use-control';

import PasswordInputCore from './PasswordInputCore';

type PasswordInputProps = {
  value?: ControlOrValue<string>;
  onChange?: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
};

export default function PasswordInput({
  value: valueControl,
  onChange,
  placeholder,
  disabled,
  className,
}: PasswordInputProps) {
  const [value, setValue] = useControl(valueControl, '');

  return (
    <PasswordInputCore
      value={value}
      onChange={(next) => {
        setValue(next);
        onChange?.(next);
      }}
      placeholder={placeholder}
      disabled={disabled}
      className={className}
    />
  );
}

export type { PasswordInputProps };
