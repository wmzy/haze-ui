import type { ReactNode } from 'react';
import type { Control } from 'react-use-control';

import { useControl } from 'react-use-control';

import RadioGroupCore from './RadioGroupCore';

type RadioGroupProps = {
  value?: Control<string> | string;
  name?: string;
  className?: string;
  children: ReactNode;
};

export default function RadioGroup({
  value: valueControl,
  name,
  className,
  children,
}: RadioGroupProps) {
  const [value, setValue] = useControl(valueControl, '');

  return (
    <RadioGroupCore
      value={value}
      onChange={setValue}
      name={name}
      className={className}
    >
      {children}
    </RadioGroupCore>
  );
}

export type { RadioGroupProps };
