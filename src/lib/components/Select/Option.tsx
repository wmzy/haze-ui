import type {ComponentPropsWithoutRef, ReactNode} from 'react';

type OptionProps = {
  value: string;
  children: ReactNode;
} & Omit<ComponentPropsWithoutRef<'option'>, 'value'>;

export default function Option({value, children, ...rest}: OptionProps) {
  return (
    <option value={value} {...rest}>
      {children}
    </option>
  );
}

export type {OptionProps};
