import type { ControlOrValue } from 'react-use-control';

import { useControl } from 'react-use-control';

import DatepickerCore from './DatepickerCore';

type DatepickerProps = {
  value?: ControlOrValue<string>;
  open?: ControlOrValue<boolean>;
  min?: string;
  max?: string;
  placeholder?: string;
  className?: string;
};

export default function Datepicker({
  value: valueControl,
  open: openControl,
  min,
  max,
  placeholder,
  className,
}: DatepickerProps) {
  const [value, setValue] = useControl(valueControl, '');
  const [open, setOpen] = useControl(openControl, false);

  return (
    <DatepickerCore
      value={value}
      onChange={setValue}
      open={open}
      onOpenChange={setOpen}
      min={min}
      max={max}
      placeholder={placeholder}
      className={className}
    />
  );
}

export type { DatepickerProps };
