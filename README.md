# Haze UI

> The React UI Component Library with controllable states.

English | [简体中文](./README-zh_CN.md)

[![npm](https://img.shields.io/npm/v/haze-ui)](https://www.npmjs.com/package/haze-ui)
[![CI](https://github.com/wmzy/haze-ui/actions/workflows/ci.yml/badge.svg)](https://github.com/wmzy/haze-ui/actions/workflows/ci.yml)

## Features

- Integrated [react use control](https://github.com/wmzy/react-use-control) provides component internal states
- Keep strict, provide lightweight, composable, and easily extendable components
- Support themes customization
- Support Tree-shaking

## Getting Started

### Installation

```sh
npm i haze-ui
// or
pnpm add haze-ui
```

### Usage

Import the component and its CSS. Two CSS loading modes:

```jsx
// Full stylesheet (simplest, ~12kB gzipped)
import 'haze-ui/styles.css';
import { lightTheme, spacing, typography, Button } from 'haze-ui';

// …or per-component CSS (pay only for what you render).
// Always load tokens.css once, then each component you use:
import 'haze-ui/css/tokens.css';
import 'haze-ui/css/button.css';
import { Button } from 'haze-ui';

export default function MyComponent() {
  return <Button>Start</Button>;
}
```

Component CSS files are kebab-case versions of the component name
(`OTPInput` → `haze-ui/css/otp-input.css`). Per-component files only
cover that component's rules — tokens (themes, spacing, typography)
always come from `haze-ui/css/tokens.css`.

## react-f0rm Integration

The form layer (`FormItem`, `useFormControl`; peer dependency
`react-f0rm`) is exported from the main barrel and glues react-f0rm
form state to haze-ui's control-prop system, so any control-prop
component (`Input`, `Select`, `Switch`, `Textarea`, `TagInput`, ...)
binds to a form field with zero adapters.

### useFormControl(form, name): field → Control

```jsx
import { useForm, setValue } from 'react-f0rm';
import { Input, useFormControl } from 'haze-ui';

function NameField({ form }) {
  const name = useFormControl(form, 'name');
  return <Input value={name} />; // two-way bound, no onChange wiring
}
```

The handle is a real `Control`: reads subscribe to the field (sibling
fields stay isolated), and writes go through react-f0rm's user-change
channel (`changeValueByPath`, ≥ 0.7) — a control write fires exactly the
validation a user typing into the field would fire: the field's effective
`mode` (a `FormItem`/`useField` per-field override included) and the
form's `reValidateMode`. With the default `mode: 'onSubmit'` +
`reValidateMode: 'onChange'`, typing through a bridged control after a
failed submit re-validates per keystroke and clears the error as soon as
the value is valid — no blur, no resubmit. Functional updates evaluate
against the live form value. `reset(form, newValues)` re-seeds every
bridged control with no remounting.

### FormItem: label, errors and aria wiring

```jsx
import { Form, useForm } from 'react-f0rm';
import { FormItem, Input } from 'haze-ui';

function ProfileForm() {
  const form = useForm({ initialValues: { email: '' } });
  return (
    <Form form={form} onSubmit={...}>
      <FormItem
        form={form}
        name="email"
        label="Email"
        validate={(v) => (v.includes('@') ? undefined : 'must be an email')}
      >
        {({ id, errorId, invalid, control }) => (
          <Input id={id} value={control} aria-invalid={invalid} aria-describedby={errorId} />
        )}
      </FormItem>
    </Form>
  );
}
```

`FormItem` generates the field/error ids, renders `<label htmlFor>`, and
surfaces the first error in a `role="alert"` element — no manual
`FieldError` wiring.

#### `mode`: per-field validation timing (react-f0rm ≥ 0.6)

Pass `mode` to validate one field on its own schedule instead of the
form-wide validation mode — other fields are unaffected. It accepts
react-f0rm's `ValidationMode` values: `'onSubmit'` (default form
behavior), `'onBlur'`, `'onChange'`, `'onTouched'` or `'all'`. Omit it to
keep the form's mode.

```jsx
<FormItem
  form={form}
  name="email"
  label="Email"
  mode="onBlur"
  validate={(v) => (v.includes('@') ? undefined : 'must be an email')}
>
  {({ id, errorId, invalid, onBlur, control }) => (
    <Input
      id={id}
      value={control}
      aria-invalid={invalid}
      aria-describedby={errorId}
      onBlur={onBlur}
    />
  )}
</FormItem>
```

With `mode="onBlur"` (and the binding's `onBlur` passed to the control,
as above) the email field is validated the moment it loses focus — no
submit needed. `mode` accepts `'onSubmit'`, `'onBlur'`, `'onChange'`,
`'onTouched'` or `'all'`; only this field's schedule changes, the rest
of the form keeps its own `mode`.

#### `validateDebounce` / `delayError` / `rules` (react-f0rm ≥ 0.6)

`FormItem` passes these field-level options straight through to
react-f0rm's `useField`:

- `validateDebounce={300}` — debounce this field's validation kicks:
  only the last kick inside the window runs the validator (e.g. keeps a
  per-keystroke async validator from firing while the user types fast).
  While the timer is pending the field counts as validating, so
  `trigger`/submit wait it out.
- `delayError={500}` — delay *showing* a newly appearing error in the
  rendered error span (and the binding's `invalid`/`errors`). The form's
  error state stays immediate — submit and `getError` still gate on it.
  An error that clears inside the window never shows.
- `rules={{ required: 'Email is required', minLength: 4, pattern: { value: /@/, message: 'Must be an email' } }}`
  — declarative constraints (a subset of react-hook-form's `register`
  rules) compiled into a validator that runs *before* `validate`; both
  sources' errors merge into the field's error list, rules errors ahead.

```jsx
<FormItem
  form={form}
  name="email"
  label="Email"
  validateDebounce={300}
  delayError={500}
  rules={{ required: 'Email is required' }}
  validate={(v) => (v.includes('@') ? undefined : 'must be an email')}
>
  {({ id, errorId, invalid, control }) => (
    <Input id={id} value={control} aria-invalid={invalid} aria-describedby={errorId} />
  )}
</FormItem>
```

All three are optional; omit them and the field behaves exactly as
before (immediate validation per the form's `mode`, immediate error
display, `validate`-only).

## Related Projects

- [react-use-control](https://github.com/wmzy/react-use-control)

## How to Contribute

Anyone and everyone is welcome to contribute. 

## License

[MIT](https://choosealicense.com/licenses/mit/)
