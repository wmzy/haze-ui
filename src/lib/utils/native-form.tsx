import { css } from '@linaria/core';

/**
 * Native form participation for value-holding components that render no
 * native field element of their own (Switch's `<button>`, Rating's
 * stars, Segmented's buttons, the floating Select modes, …). A hidden
 * native input carrying the component's `name` rides next to the visual
 * control, so `<form action={fn}>` server actions and plain
 * `new FormData(form)` see the value — the React 19 progressive-route
 * pattern. Components that already render a real field element
 * (Input, Checkbox, Radio, Slider's `<input type='range'>`) keep their
 * native flow and never bridge through here.
 *
 * Not exported from the library barrel — internal wiring for haze
 * components, the same visibility as `utils/floating.tsx`.
 */

/**
 * Clip recipe (VisuallyHidden precedent): the boolean bridge input is
 * removed from layout and the tab order while staying a successful
 * form control — an unchecked checkbox must NOT submit, which a
 * `type='hidden'` stand-in can only fake by unmounting, losing the
 * native semantics.
 */
const hiddenField = css`
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip-path: inset(50%);
  white-space: nowrap;
  border: 0;
`;

type NativeBooleanFieldProps = {
  /** Form field name; absent → nothing renders. */
  name?: string;
  type: 'checkbox' | 'radio';
  /** Submitted value; omitted → the native default (`'on'`). */
  value?: string;
  checked: boolean;
};

/**
 * Boolean bridge: a clipped, non-interactive checkbox/radio that
 * submits `value` (default `'on'`) exactly when `checked` — the native
 * successful-control rule, so unchecked fields stay absent from
 * FormData without conditional unmounting.
 */
export function NativeBooleanField({
  name,
  type,
  value,
  checked,
}: NativeBooleanFieldProps) {
  if (!name) return null;
  return (
    <input
      type={type}
      name={name}
      value={value}
      checked={checked}
      readOnly
      tabIndex={-1}
      aria-hidden='true'
      data-slot='native-input'
      x-class={hiddenField}
    />
  );
}

type NativeHiddenFieldsProps = {
  /** Form field name; absent → nothing renders. */
  name?: string;
  /** One entry per submitted value — a scalar is a one-entry array, an
   * array field repeats the name (native repeated-field semantics).
   * Empty entries are the caller's call: skip them at the call site
   * when emptiness means “no value”. */
  values: readonly (string | number)[];
};

/**
 * Scalar/array bridge: one `<input type='hidden'>` per value under the
 * same `name`. `getAll(name)` yields the entries in order — the
 * native repeated-field contract array-valued fields (Select multiple,
 * TagInput) are expected to speak.
 */
export function NativeHiddenFields({ name, values }: NativeHiddenFieldsProps) {
  if (!name) return null;
  return (
    <>
      {values.map((entry, index) => (
        <input
          key={`${index}:${String(entry)}`}
          type='hidden'
          name={name}
          value={String(entry)}
          data-slot='native-input'
        />
      ))}
    </>
  );
}

export type { NativeBooleanFieldProps, NativeHiddenFieldsProps };
