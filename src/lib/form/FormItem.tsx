import type {ReactNode} from 'react';

import type {FieldError, FieldPath, Name} from 'react-f0rm';

import type {Control} from 'react-use-control';

import type {FormInstance, PathValueOf} from './useFormControl';

import {useId} from 'react';
import {css} from '@linaria/core';
import {useField, useFieldErrors} from 'react-f0rm';


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
  className,
  children
}: FormItemProps<TValues, P>) {
  const generatedId = useId();
  const id = `haze-field-${generatedId}`;
  const errorId = `${id}-error`;

  // Registers `validate` on the form (same channel as react-f0rm's <Field>)
  // and keeps this component subscribed to the field's state.
  useField({form, name, validate});
  const errors = useFieldErrors(form, name);
  const control = useFormControl(form, name);
  const invalid = errors.length > 0;

  return (
    <div x-class={[item, className]}>
      {label !== undefined && (
        <label x-class={labelText} htmlFor={id}>
          {label}
        </label>
      )}
      {children({id, errorId, invalid, errors, control})}
      {invalid && (
        <span id={errorId} role='alert' x-class={errorText}>
          {errors[0]!.message}
        </span>
      )}
    </div>
  );
}
