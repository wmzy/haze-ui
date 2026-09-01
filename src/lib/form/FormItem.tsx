import type {ComponentType, ReactNode} from 'react';

import type {
  FieldError,
  FieldPath,
  FieldRules,
  Name,
  ValidationMode,
  FormInstance,
  PathValueOf
} from 'react-f0rm';


import {useId} from 'react';
import {css} from '@linaria/core';
import {useField} from 'react-f0rm';


/**
 * Field-level validator, structurally compatible with react-f0rm's
 * `Validator`: return an error (string, FieldError, or an array mixing
 * both) or `undefined` when valid; return a Promise for async validation.
 * `meta.signal` aborts as soon as the round is superseded.
 *
 * Generic like react-f0rm's own `useField` `validate`: with `form` (a
 * `FormInstance<TValues>`) and `name` (a `FieldPath<TValues>`) in scope,
 * the value argument is `PathValueOf<TValues, P>` — the field's actual
 * type — instead of `any`. The bare defaults keep untyped call sites
 * exactly as permissive as before.
 */
export type FieldValidator<
  TValues extends Record<string, any> = any,
  P extends FieldPath<TValues> | Name = Name
> = (
  value: PathValueOf<TValues, P>,
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

/**
 * Declarative `as` binding for `FormItem` — the same props shape as
 * react-f0rm `Field`'s `as` (deliberately *not* Radix's `asChild`): pass
 * any component as the field control and `FormItem` wires the id, aria
 * attributes, `onBlur` and `onChange` itself.
 */
export type FormItemAsProps = {
  /** Component rendered as the field control. When provided it takes
   * precedence over the children render-prop. */
  as?: ComponentType<any>;
  /** Extra props spread onto the `as` component. They land before the
   * value props, so `value`/`valueToProps` win conflicts — the same
   * precedence react-f0rm's `Field` uses. */
  asProps?: Record<string, any>;
  /** Converts what the `as` component passes to its `onChange` into the
   * field value. Defaults to identity — haze cores' `onChange` emits the
   * next plain value; pass `(e) => e.target.value` when `as` is a raw
   * DOM-element component. */
  eventToValue?: (e: any) => any;
  /** Derives the value props for the `as` component from the field value —
   * e.g. `(checked) => ({checked})` for `CheckboxCore`. Defaults to
   * passing `{value}`. */
  valueToProps?: (value: any) => Record<string, any>;
};

/** FormItem's own, non-polymorphic props — everything the item itself
 * consumes regardless of how the control is bound (render-prop, `as`
 * or `input`). */
export type FormItemOwnProps<
  TValues extends Record<string, any> = any,
  P extends FieldPath<TValues> | Name = Name
> = {
  form: FormInstance<TValues>;
  name: P;
  label?: ReactNode;
  /** Field-level validator, registered through react-f0rm's own
   * `useField` channel — validated per the form's `mode` and on submit.
   * With a typed form the value argument is `PathValueOf<TValues, P>`. */
  validate?: FieldValidator<TValues, P>;
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
  /** Custom error renderer: when provided and the field has errors, the
   * built-in error span renders `renderError(errors[0].message, errorId)`
   * instead of the bare message. The span itself — id, `role='alert'`,
   * styling — stays FormItem's, in every control-binding mode. */
  renderError?: (error: string, id: string) => ReactNode;
  className?: string;
};

/**
 * Props FormItem wires itself onto an `input`/`as` control — the bridge's
 * own contract. Used to keep them out of `input`'s forwarded rest props
 * (type level) and to document that they always win (runtime level):
 * passing one anyway is a compile error, never a silent override.
 */
type FormItemWiredProps = {
  id?: unknown;
  onBlur?: unknown;
  onChange?: unknown;
  /** the value channel: `value` directly, or the prop `valueToProps`
   * derives (e.g. `checked` for CheckboxCore) — either way FormItem's */
  value?: unknown;
  checked?: unknown;
  'aria-invalid'?: unknown;
  'aria-describedby'?: unknown;
};

export type FormItemProps<
  TValues extends Record<string, any> = any,
  P extends FieldPath<TValues> | Name = Name,
  TInputProps extends Record<string, any> = Record<never, never>
> = FormItemOwnProps<TValues, P> &
  FormItemAsProps & {
    /**
     * Declarative binding for haze-ui cores: pass the component
     * (`InputCore`, `TextareaCore`, `TagInputCore`, `SelectCore`,
     * `CheckboxCore`, …) and FormItem wires `id`, `aria-invalid`,
     * `aria-describedby`, `onBlur`, `onChange` and the value channel
     * itself. Every other prop — and JSX children (a `SelectCore`'s
     * `<option>`s) — is forwarded to the component, fully type-checked
     * against its own props. Cores' `onChange` emits the next plain value
     * (identity `eventToValue`); checkbox-style controls pair with
     * `valueToProps={(checked) => ({checked})}`. Props FormItem owns or
     * wires (label, className, id, aria-*, onBlur, onChange, value,
     * checked, …) are reserved and cannot be forwarded — use the
     * render-prop or `as`/`asProps` for a colliding control prop.
     */
    input?: ComponentType<TInputProps>;
  } & Omit<
      TInputProps,
      | keyof FormItemOwnProps<TValues, P>
      | keyof FormItemAsProps
      | keyof FormItemWiredProps
      | 'input'
    > &
  (
    | {as: ComponentType<any>; input?: never; children?: never}
    | {
        as?: undefined;
        input: ComponentType<TInputProps>;
        /** JSX children forward to the control (SelectCore's options);
         * the render-prop form is mutually exclusive with `input`. */
        children?: 'children' extends keyof TInputProps
          ? TInputProps['children']
          : undefined;
      }
    | {
        as?: undefined;
        input?: undefined;
        children: (binding: FormItemBinding<TValues, P>) => ReactNode;
      }
  );

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
 * Or declaratively, react-f0rm `Field`-style (`as` and children are
 * mutually exclusive — pick one):
 *
 * ```tsx
 * <FormItem form={form} name='email' label='Email' as={InputCore} />
 * ```
 *
 * With `as`, the id/aria/onBlur/onChange wiring happens here: the control
 * gets `id`, `aria-invalid`/`aria-describedby` while the field errors,
 * and `onChange={(v) => onChange(toValue(v))}` where `toValue` defaults
 * to identity (haze cores emit plain values — pass
 * `eventToValue={(e) => e.target.value}` for a raw DOM element) and the
 * value lands as `{value}` or, with `valueToProps`, whatever props the
 * control wants (e.g. `{checked}` for CheckboxCore).
 *
 * The ergonomic form for haze-ui cores is `input`: the rest of the JSX
 * props — and JSX children, e.g. a `SelectCore`'s `<option>`s — are
 * forwarded to the component, type-checked against its own props
 * (`input` and the render-prop children are mutually exclusive):
 *
 * ```tsx
 * <FormItem
 *   form={form}
 *   name='email'
 *   input={InputCore}
 *   placeholder='Email'
 *   mode='onBlur'
 * />
 * ```
 *
 * The same wiring as `as` applies (id, aria, onBlur, onChange, value);
 * wired and FormItem-owned prop names are reserved — a control prop that
 * collides (CheckboxCore's `label`) needs the render-prop or
 * `as`/`asProps` channel.
 *
 * When the field has errors, the first error's message is rendered into a
 * `<span id={errorId} role='alert'>` next to the control; with no errors
 * no extra element is rendered.
 */
export default function FormItem<
  TValues extends Record<string, any> = any,
  P extends FieldPath<TValues> | Name = Name,
  TInputProps extends Record<string, any> = Record<never, never>
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
  renderError,
  as: As,
  asProps,
  input: Input,
  eventToValue,
  valueToProps,
  children,
  ...inputProps
}: FormItemProps<TValues, P, TInputProps>) {
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

  // Identity by default: haze cores' onChange emits the next plain value.
  // A raw DOM-element `as` passes the event instead — adapt it with
  // `eventToValue={(e) => e.target.value}`.
  const toValue: (e: any) => any = eventToValue ?? ((e: unknown) => e);

  // `input` and the render-prop children are mutually exclusive (types
  // enforce it; this guards untyped callers). A render-prop next to an
  // `input` is a migration leftover — fail loudly instead of silently
  // dropping one of the two bindings.
  if (Input && typeof children === 'function') {
    throw new Error(
      'FormItem: `input` and the render-prop `children` are mutually exclusive — the input component is wired declaratively; remove the render-prop.'
    );
  }

  // JSX on a bare type parameter trips overload resolution (children of
  // `(IntrinsicAttributes & TInputProps)["children"]`); render through a
  // permissive view of the component — the call-site types live on
  // FormItemProps, not here.
  const InputComponent = Input as ComponentType<Record<string, any>> | undefined;

  return (
    <div x-class={[item, className]}>
      {label !== undefined && (
        <label x-class={labelText} htmlFor={id}>
          {label}
        </label>
      )}
      {InputComponent ? (
        <InputComponent
          // forwarded props first — the wiring below is the bridge's
          // contract and always wins (they're excluded from the
          // forwarded type, so a typed caller can never hit the clash)
          {...(inputProps as Record<string, any>)}
          id={id}
          aria-invalid={invalid || undefined}
          aria-describedby={invalid ? errorId : undefined}
          onBlur={onBlur}
          onChange={(e: any) => onChange(toValue(e))}
          {...(valueToProps ? valueToProps(value) : {value})}>
          {children as ReactNode}
        </InputComponent>
      ) : As ? (
        <As
          id={id}
          aria-invalid={invalid || undefined}
          aria-describedby={invalid ? errorId : undefined}
          onBlur={onBlur}
          onChange={(e: any) => onChange(toValue(e))}
          {...asProps}
          {...(valueToProps ? valueToProps(value) : {value})}
        />
      ) : (
        (children as (binding: FormItemBinding<TValues, P>) => ReactNode)({
          id,
          errorId,
          invalid,
          errors,
          onBlur,
          value,
          onChange
        })
      )}
      {invalid && (
        <span id={errorId} role='alert' x-class={errorText}>
          {renderError
            ? renderError(errors[0]!.message, errorId)
            : errors[0]!.message}
        </span>
      )}
    </div>
  );
}
