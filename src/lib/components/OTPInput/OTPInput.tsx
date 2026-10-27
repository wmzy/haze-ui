import type { Ref } from 'react';
import type { ControlOrValue } from 'react-use-control';

import { useControl } from 'react-use-control';

import { NativeHiddenFields } from '../../utils/native-form';

import OTPInputCore from './OTPInputCore';

type OTPInputProps = {
  length?: number;
  value?: ControlOrValue<string>;
  onChange?: (value: string) => void;
  className?: string;
  /**
   * Form field name: renders a hidden input bridge next to the cells so
   * `<form action={fn}>` / `new FormData(form)` receive the joined code
   * as one value (the per-cell inputs never carry it — partial codes
   * would leak cell shards). An empty code submits nothing. react-f0rm
   * `FormItem` usage never passes it, so both worlds coexist.
   */
  name?: string;
  /** Forwarded to the first cell's `<input>` — the element form bridges
   * and `ref.current.focus()` reach. */
  ref?: Ref<HTMLInputElement>;
};

export default function OTPInput({
  length,
  value: valueControl,
  onChange,
  className,
  name,
  ref,
}: OTPInputProps) {
  const [value, setValue] = useControl(valueControl, '');

  return (
    <>
      <OTPInputCore
        ref={ref}
        length={length}
        value={value}
        onChange={(next) => {
          setValue(next);
          onChange?.(next);
        }}
        className={className}
      />
      <NativeHiddenFields name={name} values={[value]} skipEmpty />
    </>
  );
}

export type { OTPInputProps };
