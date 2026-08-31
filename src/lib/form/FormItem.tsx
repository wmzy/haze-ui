import type {ReactNode} from 'react';

import type {
  FieldError,
  FieldPath,
  FieldRules,
  Name,
  ValidationMode,FormInstance, PathValueOf
} from 'react-f0rm';


import {useId} from 'react';
import {css} from '@linaria/core';
import {useField} from 'react-f0rm';


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
  /** id for the field control element (`<InputCore id={id}>`) */
  id: string;
  /** id of the error message element; pass as `aria-describedby` */
  errorId: string;
  /** true while the field has at least one error */
  invalid: boolean;
  /** every error registered for the field, in insertion order */
  errors: FieldError[];
  /** react-f0rm blur hook for this field — pass to the control's `onBlur`
   * (`<InputCore onBlur={onBlur}/>`) so blur-scheduled validation modes
   * (`mode='onBlur' | 'onTouched' | 'all'`) fire when the field loses focus. */
  onBlur: () => void;
  /** Field value subscribed per-field — pass to a controlled core
   * (`<InputCore value={value} onChange={onChange} />`). */
  value: PathValueOf<TValues, P>;
  /** react-f0rm's own field-change writer — pass to the core's `onChange`.
   * It routes through the same mode-gated, re-validating pipeline as
   * react-f0rm's built-in Field/Checkbox/Select. */
  onChange: (next: PathValueOf<TValues, P>) => void;
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
 * Glue a single field of a react-f0rm form to a haze-ui controlled core.
 * The binding layer is react-f0rm's own headless `useField` hook — the
 * same channel its built-in Field/Checkbox/Select use — so no adapter or
 * state-bridge lives here. FormItem contributes only the view: label,
 * error span and the id/aria convention.
 *
 * ```tsx
 * <FormItem form={form} name='email' label='Email'>
 *   {({id, errorId, invalid, value, onChange}) => (
 *     <InputCore
 *       id={id}
 *       value={value}
 *       onChange={onChange}
 *       aria-describedby={errorId}
 *       aria-invalid={invalid}
 *     />
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

  // react-f0rm's useField is the single binding layer: per-field value
  // subscription, user-change writes with mode gating, blur-scheduled
  // validation, delayError-gated display errors.
  const {value, onChange, onBlur, errors} = useField({
    form,
    name,
    validate,
    mode,
    validateDebounce,
    delayError,
    rules
  });
  const invalid = errors.length > 0;

  return (
    <div x-class={[item, className]}>
      {label !== undefined && (
        <label x-class={labelText} htmlFor={id}>
          {label}
        </label>
      )}
      {children({id, errorId, invalid, errors, onBlur, value, onChange})}
      {invalid && (
        <span id={errorId} role='alert' x-class={errorText}>
          {errors[0]!.message}
        </span>
      )}
    </div>
  );
}
