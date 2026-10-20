import type {ComponentPropsWithoutRef, ReactNode} from 'react';

type OptionProps = {
  /** Raw option value — `string | number`; the owning Select's value
   * type param governs what is meaningful here (the DOM stringifies
   * the rendered attribute; the floating paths compare raw values). */
  value: string | number;
  children: ReactNode;
} & Omit<ComponentPropsWithoutRef<'option'>, 'value'>;

export default function Option({value, children, ...rest}: OptionProps) {
  return (
    <option value={value} data-slot='option' {...rest}>
      {children}
    </option>
  );
}

export type {OptionProps};
