import type { Ref } from 'react';
import type { ControlOrValue } from 'react-use-control';

import { useControl } from 'react-use-control';

import { NativeHiddenFields } from '../../utils/native-form';

import RatingCore from './RatingCore';

type RatingProps = {
  value?: ControlOrValue<number>;
  count?: number;
  allowHalf?: boolean;
  onChange?: (value: number) => void;
  className?: string;
  /**
   * Form field name: renders a hidden input bridge next to the stars so
   * `<form action={fn}>` / `new FormData(form)` receive `String(value)`.
   * The `0` no-rating sentinel submits nothing. react-f0rm `FormItem`
   * usage never passes it, so both worlds coexist.
   */
  name?: string;
  /**
   * Forwarded to the group's focus target — the star that is the roving
   * tab stop (the current rating, or the first star) — so form bridges
   * and `ref.current.focus()` reach the group.
   */
  ref?: Ref<HTMLSpanElement>;
};

export default function Rating({
  value: valueControl,
  count,
  allowHalf,
  onChange,
  className,
  name,
  ref,
}: RatingProps) {
  const [value, setValue] = useControl(valueControl, 0);

  return (
    <>
      <RatingCore
        ref={ref}
        value={value}
        onChange={(next) => {
          setValue(next);
          onChange?.(next);
        }}
        count={count}
        allowHalf={allowHalf}
        className={className}
      />
      <NativeHiddenFields
        name={name}
        values={value === 0 ? [] : [value]}
      />
    </>
  );
}

export type { RatingProps };
