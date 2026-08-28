import type {ReactNode} from 'react';

import type {
  FieldError,
  FieldPath,
  FieldRules,
  Name,
  ValidationMode
} from 'react-f0rm';

import type {Control} from 'react-use-control';

import type {FormInstance, PathValueOf} from './useFormControl';

import {useId} from 'react';
import {css} from '@linaria/core';
import {useField} from 'react-f0rm';


import {useFormControl} from './useFormControl';


/**
 * Field-level validator, structurally compatible with react-f0rm's
 * `Validator`: return an error (string, FieldError, or an array mixing
 * both) or `undefined` when valid; return a Promise for async validation.
 * `meta.signal` aborts as soon as the round is superseded.
 */
export type FieldValidator = (
  value: any,
  meta: {form: FormInstance; signal: AbortSignal}
) =>
  | string
  | FieldError
  | (string | FieldError)[]
  | undefined
  | Promise<string | FieldError | (string | FieldError)[] | undefined>;

/** Render binding handed to `FormItem`'s render-prop children. */
export type FormItemBinding<TValues, P extends FieldPath<TValues> | Name> = {
  /** id for the field control element (`<Input id={id}>`) */
  id: string;
  /** id of the error message element; pass as `aria-describedby` */
  errorId: string;
  /** true while the field has at least one error */
  invalid: boolean;
  /** every error registered for the field, in insertion order */
  errors: FieldError[];
  /** react-f0rm blur hook for this field — pass to the control's `onBlur`
   * (`<Input onBlur={onBlur}/>`) so blur-scheduled validation modes
   * (`mode='onBlur' | 'onTouched' | 'all'`) fire when the field loses focus. */
  onBlur: () => void;
  /** Control bound to the field value — pass to a control prop */
  control: Control<PathValueOf<TValues, P>>;
};

export type FormItemProps<
  TValues extends Record<string, any> = any,
  P extends FieldPath<TValues> | Name = Name
> = {
  form: FormInstance<TValues>;
  name: P;
  label?: ReactNode;
  /** Field-level validator, registered through react-f0rm's own
   * `useField` channel — validated per the form's `mode` and on submit. */
  validate?: FieldValidator;
  /** Per-field validation mode override (react-f0rm ≥0.6): when given,
   * this field validates on its own schedule — e.g. `'onBlur'` — instead
   * of the form's `mode`; other fields are unaffected. Omit to keep the
   * form-wide behavior. */
  mode?: ValidationMode;
  /** Milliseconds to debounce this field's validation kicks (react-f0rm
   * ≥0.6): only the last kick inside the window runs the validator — e.g.
   * `300` keeps a fast typist from firing a per-keystroke async validator.
   * While the timer is pending the field counts as validating. Omit for
   * immediate validation (react-f0rm's default). */
  validateDebounce?: number;
  /** Milliseconds to delay *showing* a newly appearing error in the render
   * layer (react-f0rm ≥0.6): the form's error state stays immediate —
   * submit/trigger still gate on it — only the rendered error span and
   * `invalid` wait out the window. An error that clears inside the window
   * never shows. Omit for immediate display. */
  delayError?: number;
  /** Declarative rules (required/min/max/minLength/maxLength/pattern;
   * react-f0rm ≥0.6), compiled into a validator that runs *before*
   * `validate` — both sources' errors merge, rules errors ahead. Omit for
   * `validate`-only validation. */
  rules?: FieldRules;
  className?: string;
  children: (binding: FormItemBinding<TValues, P>) => ReactNode;
};

const item = css`
  display: flex;
  flex-direction: column;
  align-items: stretch;
  gap: var(--haze-space-1);
`;

const labelText = css`
  font-size: var(--haze-text-sm);
  color: var(--haze-color-text);
`;

const errorText = css`
  font-size: var(--haze-text-sm);
  color: var(--haze-color-danger);
`;

/**
 * Glue a single field of a react-f0rm form to a haze-ui control:
 * generates accessible ids, subscribes to the field's errors, and hands
 * both plus a `useFormControl` handle to the render-prop children.
 *
 * ```tsx
 * <FormItem form={form} name='email' label='Email'>
 *   {({id, errorId, invalid, control}) => (
 *     <Input id={id} value={control} aria-describedby={errorId} aria-invalid={invalid} />
 *   )}
 * </FormItem>
 * ```
 *
 * When the field has errors, the first error's message is rendered into a
 * `<span id={errorId} role='alert'>` next to the children; with no errors
 * no extra element is rendered.
 */
export default function FormItem<
  TValues extends Record<string, any> = any,
  P extends FieldPath<TValues> | Name = Name
>({
  form,
  name,
  label,
  validate,
  mode,
  validateDebounce,
  delayError,
  rules,
  className,
  children
}: FormItemProps<TValues, P>) {
  const generatedId = useId();
  const id = `haze-field-${generatedId}`;
  const errorId = `${id}-error`;

  // Registers `validate`/`rules` on the form (same channel as react-f0rm's
  // <Field>) and keeps this component subscribed to the field's state.
  // `mode` overrides the field's validation schedule, `validateDebounce`
  // debounces its kicks and `delayError` defers error display (all
  // react-f0rm ≥0.6); the returned `onBlur` is handed to children so
  // blur-scheduled modes can observe DOM blur events. The returned
  // `errors` are the display-layer errors: already `delayError`-aware
  // (identical to the immediate store when `delayError` is omitted).
  const {onBlur, errors} = useField({
    form,
    name,
    validate,
    mode,
    validateDebounce,
    delayError,
    rules
  });
  const control = useFormControl(form, name);
  const invalid = errors.length > 0;

  return (
    <div x-class={[item, className]}>
      {label !== undefined && (
        <label x-class={labelText} htmlFor={id}>
          {label}
        </label>
      )}
      {children({id, errorId, invalid, errors, onBlur, control})}
      {invalid && (
        <span id={errorId} role='alert' x-class={errorText}>
          {errors[0]!.message}
        </span>
      )}
    </div>
  );
}
