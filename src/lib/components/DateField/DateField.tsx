import type { ComponentPropsWithoutRef, Ref } from 'react';
import type { ControlOrValue } from 'react-use-control';

import type { DateLabels, DatePlaceholder } from './DateFieldCore';

import { useControl } from 'react-use-control';

import DateFieldCore from './DateFieldCore';

type DateFieldProps = {
  /** `"YYYY-MM-DD"` (Datepicker's value semantics) or `''` when empty;
   * commits fire only when every segment holds a valid date. */
  value?: ControlOrValue<string>;
  onChange?: (value: string) => void;
  /** Locale feeding the month segment's aria-valuetext (localized long
   * month names, e.g. locale="fr" reads "mars"). */
  locale?: string;
  disabled?: boolean;
  placeholder?: DatePlaceholder;
  labels?: DateLabels;
  className?: string;
  /** Forwarded to the current tab-stop segment span — the element form
   * bridges and `ref.current.focus()` reach. */
  ref?: Ref<HTMLSpanElement>;
} & Omit<ComponentPropsWithoutRef<'div'>, 'onChange'>;

export default function DateField({
  value: valueControl,
  onChange,
  locale,
  disabled,
  placeholder,
  labels,
  className,
  ref,
  ...rest
}: DateFieldProps) {
  const [value, setValue] = useControl(valueControl, '');
  const commit = (next: string) => {
    setValue(next);
    onChange?.(next);
  };

  return (
    <DateFieldCore
      ref={ref}
      value={value}
      onChange={commit}
      locale={locale}
      disabled={disabled}
      placeholder={placeholder}
      labels={labels}
      className={className}
      {...rest}
    />
  );
}

export type { DateFieldProps };
